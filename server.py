#!/usr/bin/env python3
"""OSINT HUB BR — motor local com INTERNET REAL (só stdlib, sem pip).

O localhost vira um backend OSINT de verdade: ele faz as requisicoes
HTTP na internet pelo lado servidor (sem bloqueio de CORS do navegador)
usando as bases publicas do GitHub:
  - sherlock-project/sherlock (481 sites, errorType status_code/message/response_url)
  - WebBreacher/WhatsMyName (717 sites, e_code/e_string/m_code/m_string)

Endpoints:
  GET /api/health
  GET /api/username?u=ALVO&mode=fast|full
  GET /api/github?u=ALVO
  GET /api/email?e=EMAIL
  GET /api/ip?ip=X
  GET /api/dns?name=X&type=A
  GET /api/crt?d=DOMINIO
  GET /api/rdap?d=DOMINIO
  GET /api/cep?c=X  |  GET /api/cnpj?c=X
Todo o resto = arquivos estaticos do site.
"""
import hashlib
import json
import re
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

try:
    import shodan as _shodan_lib  # https://github.com/achillean/shodan-python (oficial)
    SHODAN_OK = True
except Exception:
    _shodan_lib = None
    SHODAN_OK = False

BASE = Path(__file__).resolve().parent
PORT = 8000
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36 OSINT-HUB-BR/2.0"}
STARTED = time.time()

# ---- bases publicas (copias locais, atualizaveis do GitHub) ----
def load_json(path, url=None):
    p = BASE / path
    try:
        if p.exists():
            return json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        pass
    if url:
        try:
            raw = http_get(url, timeout=30)[2]
            p.write_bytes(raw)
            return json.loads(raw)
        except Exception as e:
            print("aviso: nao baixei", url, repr(e)[:120])
    return None

def http_get(url, timeout=12, max_bytes=1_500_000):
    """Retorna (status, url_final, bytes). Nunca explode."""
    req = urllib.request.Request(url, headers=UA)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, r.geturl(), r.read(max_bytes)
    except urllib.error.HTTPError as e:
        try:
            body = e.read(max_bytes)
        except Exception:
            body = b""
        return e.code, getattr(e, "geturl", lambda: url)(), body
    except Exception:
        return -1, url, b""

def fetch_json(url, timeout=15):
    st, _, body = http_get(url, timeout=timeout)
    if st < 200 or st >= 300:
        raise RuntimeError("HTTP " + str(st))
    return json.loads(body.decode("utf-8", "ignore"))

SHERLOCK_RAW = load_json("sherlock-sites.json",
    "https://raw.githubusercontent.com/sherlock-project/sherlock/master/sherlock_project/resources/data.json") or {}
SHERLOCK = {k: v for k, v in SHERLOCK_RAW.items() if isinstance(v, dict)}
WMN_RAW = load_json("wmn-sites.json",
    "https://raw.githubusercontent.com/WebBreacher/WhatsMyName/master/wmn-data.json")
WMN = (WMN_RAW.get("sites") if isinstance(WMN_RAW, dict) else WMN_RAW) or []
# Regras do qeeqbox/social-analyzer convertidas p/ o motor (ver conv_sa.py). Crédito: qeeqbox.
SA = load_json("sa-sites.json") or []

FAST_SITES = """GitHub GitLab BitBucket Gitea Codeberg Gitee Reddit Twitter Instagram TikTok
YouTube Twitch Kick Rumble Odysee DailyMotion Trovo Spotify SoundCloud MixCloud Bandcamp
Last.fm Genius (Users) Medium DEV Community Hashnode Substack freecodecamp HackerNews HackerOne
BugCrowd Intigriti TryHackMe HackTheBox Kaggle HackerRank LeetCode Codepen Replit.com npm PyPi
RubyGems Docker Hub Hugging Face GitBook HackMD Keybase Gravatar About.me Linktree AllMyLinks
Carrd Pronouns.page Status Cafe SpaceHey Blogger WordPress Tumblr Bluesky mastodon.social
Fosstodon pixelfed.social LinkedIn VK Telegram Pinterest Flickr Vimeo DeviantArt Behance Dribbble
ArtStation Imgur Giphy Tenor Unsplash VSCO EyeEm SmugMug Patreon BuyMeACoffee kofi Roblox
MyAnimeList Anilist Letterboxd GoodReads Strava Duolingo Chess Lichess TETR.IO Monkeytype
Xbox Gamertag PSNProfiles.com Steam Community (User) OpenStreetMap Wikipedia Archive.org
Pastebin Trello mercadolivre Wattpad 9GAG Myspace Snapchat Kik Tellonym.me Fandom ResearchGate
Academia.edu Codewars Codechef Codeforces Atcoder Topcoder Laracast Codecademy Memrise
Clozemaster Flightradar24 Geocaching Discogs Rate Your Music Chess Lichess""".split()

def norm_template(t):
    return t.lower().replace("{account}", "{}").replace("{username}", "{}").rstrip("/")

def build_targets(mode):
    """Monta lista dedupada de (origem, nome, template_url, dados)."""
    targets, seen = [], set()

    def add(src, name, tpl, data):
        k = norm_template(tpl)
        if k in seen:
            return
        seen.add(k)
        targets.append((src, name, tpl, data))

    if mode == "fast":
        wanted = [n for n in FAST_SITES if n in SHERLOCK]
        for n in wanted:
            d = SHERLOCK[n]
            if d.get("isNSFW"):
                continue
            add("sherlock", n, d["url"], d)
        # completa com extras faceis do WMN se algum curated faltar? nao precisa.
    else:
        for n, d in SHERLOCK.items():
            if d.get("isNSFW") or "url" not in d:
                continue
            add("sherlock", n, d["url"], d)
        for w in WMN:
            try:
                tpl = w.get("uri_check", "")
                if "{account}" not in tpl:
                    continue
                add("wmn", w.get("name", "?"), tpl, w)
            except Exception:
                continue
        for s in SA:
            try:
                tpl = s.get("url", "")
                if "{username}" not in tpl:
                    continue
                add("socialanalyzer", s.get("name", "?"), tpl, s)
            except Exception:
                continue
    return targets

def ok_status(st):
    """So conta como existente se o site respondeu de verdade (2xx/3xx).
    403/429/503 (WAF, rate-limit) = bloqueado, nao 'encontrado'."""
    return isinstance(st, int) and 200 <= st < 400

def site_headers(data):
    h = dict(UA)
    h.update(data.get("headers") or {})
    return h

def http_req(url, timeout=10, headers=None, method="GET", payload=None):
    data = None
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        (headers or {}).setdefault("Content-Type", "application/json")
    req = urllib.request.Request(url, headers=headers or UA, method=method, data=data)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, r.geturl(), r.read(1_500_000)
    except urllib.error.HTTPError as e:
        try:
            body = e.read(1_500_000)
        except Exception:
            body = b""
        try:
            final = e.geturl()
        except Exception:
            final = url
        return e.code, final, body
    except Exception:
        return -1, url, b""

def check_sherlock(username, name, data):
    tpl = data["url"]
    rx = data.get("regexCheck")
    if rx:
        try:
            if not re.match(rx, username):
                return ("skip", "")
        except Exception:
            pass
    probe = data.get("urlProbe") or tpl
    url = probe.replace("{}", username)
    profile = tpl.replace("{}", username)
    et = data.get("errorType")
    method = (data.get("request_method") or "GET").upper()
    st, final, body = http_req(url, timeout=10, headers=site_headers(data),
                              method=method, payload=data.get("request_payload"))
    if st == -1:
        return ("error", profile)
    if not ok_status(st):
        return ("blocked", profile)
    text = body.decode("utf-8", "ignore")
    if et == "status_code":
        # Semantica oficial Sherlock: 2xx apos redirects = existe
        return ("found" if 200 <= st < 300 else "absent", profile)
    if et == "message":
        msgs = data.get("errorMsg", "")
        msgs = msgs if isinstance(msgs, list) else [msgs]
        hit = any(m and m in text for m in msgs)
        return ("absent" if hit else "found", profile)
    if et == "response_url":
        err = data.get("errorUrl", "")
        errs = err if isinstance(err, list) else [err]
        bad = any(e and e.replace("{}", username) in final for e in errs)
        return ("absent" if bad else "found", profile)
    return ("unknown", profile)

def check_sa(username, entry):
    """Regras qeeqbox/social-analyzer: strings de erro (absent) e de confirmação (found)."""
    url = entry["url"].replace("{username}", username)
    st, _, body = http_req(url, timeout=10)
    if st == -1:
        return ("error", url)
    if not ok_status(st):
        return ("blocked", url)
    text = body.decode("utf-8", "ignore")
    for s in entry.get("err", []):
        if s and s.replace("{username}", username) in text:
            return ("absent", url)
    for s in entry.get("ok", []):
        if s and s.replace("{username}", username) in text:
            return ("found", url)
    # só tinha strings de erro e nenhuma apareceu = existe (estilo message-type)
    if entry.get("err") and not entry.get("ok"):
        return ("found", url)
    return ("unknown", url)

def check_wmn(username, entry):
    tpl = entry["uri_check"]
    url = tpl.replace("{account}", username)
    st, _, body = http_get(url, timeout=10)
    if st == -1:
        return ("error", url)
    if not ok_status(st):
        return ("blocked", url)
    text = body.decode("utf-8", "ignore")
    e_code = entry.get("e_code", 0) or 0
    m_code = entry.get("m_code", 0) or 0
    e_str = entry.get("e_string") or ""
    m_str = entry.get("m_string") or ""
    if m_str and m_str in text:
        return ("found", url)
    if e_str and e_str in text:
        return ("absent", url)
    if e_code and st == e_code and e_code != m_code:
        return ("absent", url)
    if m_code and st == m_code:
        return ("found", url)
    return ("unknown", url)

def scan_username(username, mode="fast", limit=0):
    import random as _r
    t0 = time.time()
    targets = build_targets(mode)
    if limit and limit > 0:
        targets = targets[:limit]
    calib = "__zz" + "".join(_r.choice("abcdefghijklmnopqrstuvwxyz0123456789") for _ in range(14)) + "__"
    found, counts = [], {"absent": 0, "blocked": 0, "error": 0, "skip": 0, "unknown": 0, "unreliable": 0}

    def run(t, who):
        src, name, tpl, data = t
        try:
            if src == "sherlock":
                st, _ = check_sherlock(who, name, data)
            elif src == "socialanalyzer":
                st, _ = check_sa(who, data)
            else:
                st, _ = check_wmn(who, data)
            return st
        except Exception:
            return "error"

    def job(t):
        src, name, tpl, data = t
        ph = "{}" if src == "sherlock" else "{account}" if src == "wmn" else "{username}"
        profile = tpl.replace(ph, username)
        real = run(t, username)
        rand = run(t, calib)
        if rand == "found":
            return src, name, profile, "unreliable"
        return src, name, profile, real

    VIA = {"sherlock": "Sherlock", "wmn": "WhatsMyName", "socialanalyzer": "Social Analyzer"}
    with ThreadPoolExecutor(max_workers=120) as ex:
        for src, name, profile, status in ex.map(job, targets):
            if status == "found":
                found.append({"site": name, "url": profile, "via": VIA.get(src, src)})
            elif status in counts:
                counts[status] += 1
    found.sort(key=lambda x: x["site"].lower())
    return {"username": username, "mode": mode,
            "sites_total": len(targets), "found": found,
            "found_count": len(found), **counts,
            "ms": int((time.time() - t0) * 1000),
            "sources": ["sherlock-project/sherlock", "WebBreacher/WhatsMyName", "qeeqbox/social-analyzer"]}

# ---- passthroughs com internet real ----
def api_github(u):
    me = fetch_json("https://api.github.com/users/" + urllib.parse.quote(u))
    emails = []
    try:
        ev = fetch_json("https://api.github.com/users/" + urllib.parse.quote(u) + "/events/public?per_page=20")
        for e in ev if isinstance(ev, list) else []:
            for c in ((e.get("payload") or {}).get("commits") or []):
                em = (c.get("author") or {}).get("email")
                if em and "noreply" not in em and em not in emails:
                    emails.append(em)
    except Exception:
        pass
    return {"login": me.get("login"), "name": me.get("name"), "bio": me.get("bio"),
            "avatar": me.get("avatar_url"), "repos": me.get("public_repos"),
            "followers": me.get("followers"), "following": me.get("following"),
            "location": me.get("location"), "company": me.get("company"),
            "blog": me.get("blog"), "created": (me.get("created_at") or "")[:10],
            "profile": me.get("html_url"), "commit_emails": emails[:5]}

def api_email(e):
    e = e.strip()
    dom = e.split("@")[-1]
    out = {"email": e}
    try:
        mx = fetch_json("https://dns.google/resolve?name=" + urllib.parse.quote(dom) + "&type=MX")
        out["mx"] = [a.get("data") for a in mx.get("Answer", [])]
        out["domain_valid"] = bool(out["mx"])
    except Exception as ex:
        out["mx_error"] = str(ex)[:120]
    try:
        st, _, body = http_get("https://api.xposedornot.com/v1/check-email/" + urllib.parse.quote(e), timeout=15)
        if st == 404:
            out["breach"] = {"status": "clean", "count": 0}
        elif 200 <= st < 300:
            j = json.loads(body.decode("utf-8", "ignore"))
            br = j.get("breaches") or []
            out["breach"] = {"status": "breached", "count": len(br),
                             "names": [b[0] if isinstance(b, list) else b for b in br][:10]}
        else:
            out["breach"] = {"status": "rate_limited"}
    except Exception as ex:
        out["breach"] = {"status": "error", "detail": str(ex)[:120]}
    try:
        h = hashlib.md5(e.lower().encode()).hexdigest()
        st, _, _ = http_get("https://www.gravatar.com/avatar/" + h + "?d=404&s=80", timeout=10)
        out["gravatar"] = (st == 200)
        out["gravatar_url"] = "https://www.gravatar.com/avatar/" + h + "?s=80"
    except Exception:
        out["gravatar"] = None
    return out

def api_ip(ip):
    return fetch_json("https://ipwho.is/" + urllib.parse.quote(ip))

def api_dns(name, rtype):
    return fetch_json("https://dns.google/resolve?name=" + urllib.parse.quote(name) + "&type=" + urllib.parse.quote(rtype or "A"))

def api_crt(dom):
    j = fetch_json("https://crt.sh/?q=%25." + urllib.parse.quote(dom) + "&output=json", timeout=25)
    subs = sorted({s for row in j for s in str(row.get("name_value", "")).split("\n") if dom in s})
    return {"count": len(j), "subdomains": subs[:100]}

def api_rdap(dom):
    j = fetch_json("https://rdap.org/domain/" + urllib.parse.quote(dom), timeout=15)
    ev = {e.get("eventAction"): (e.get("eventDate") or "")[:10] for e in j.get("events", [])}
    ns = [n.get("ldhName") for n in j.get("nameservers", []) if n.get("ldhName")]
    return {"registrar": j.get("registrar"), "created": ev.get("registration"),
            "expires": ev.get("expiration"), "status": j.get("status", [])[:5], "nameservers": ns[:6]}

def api_cep(c):
    return fetch_json("https://brasilapi.com.br/api/cep/v1/" + c)

def api_cnpj(c):
    return fetch_json("https://brasilapi.com.br/api/cnpj/v1/" + c)

# ---------- SHODAN (lib oficial shodan-python, chave do próprio usuário) ----------
def sh_api(key):
    if not SHODAN_OK:
        raise RuntimeError("lib shodan-python ausente (rode: pip install shodan)")
    if not key or len(key.strip()) < 5:
        raise RuntimeError("cole sua API key gratuita do Shodan (account.shodan.io)")
    a = _shodan_lib.Shodan(key.strip())
    return a

def trim_match(m):
    loc = m.get("location") or {}
    return {"ip": m.get("ip_str"), "port": m.get("port"), "transport": m.get("transport"),
            "org": m.get("org"), "isp": m.get("isp"), "hostnames": (m.get("hostnames") or [])[:4],
            "country": loc.get("country_name"), "city": loc.get("city"),
            "lat": loc.get("latitude"), "lon": loc.get("longitude"),
            "product": m.get("product"), "version": m.get("version"),
            "tags": (m.get("tags") or [])[:6], "vulns": list((m.get("vulns") or {}).keys())[:8],
            "banner": str(m.get("data") or "")[:280].replace("\r", " ").replace("\n", " "),
            "time": str(m.get("timestamp") or "")[:19]}

def api_shodan_info(key):
    try:
        return sh_api(key).info()
    except Exception as e:
        raise RuntimeError("Shodan: " + str(e).split(":")[-1].strip()[:160])

def api_shodan_search(key, q, page=1):
    try:
        r = sh_api(key).search(q, page=page)
    except Exception as e:
        raise RuntimeError("Shodan: " + str(e).split(":")[-1].strip()[:160])
    return {"total": r.get("total"), "page": page,
            "matches": [trim_match(m) for m in r.get("matches", [])[:30]]}

def api_shodan_host(key, ip):
    try:
        h = sh_api(key).host(ip)
    except Exception as e:
        raise RuntimeError("Shodan: " + str(e).split(":")[-1].strip()[:160])
    data = [trim_match({**d, "ip_str": h.get("ip_str")}) for d in h.get("data", [])[:20]]
    return {"ip": h.get("ip_str"), "org": h.get("org"), "isp": h.get("isp"),
            "hostnames": (h.get("hostnames") or [])[:6], "domains": (h.get("domains") or [])[:6],
            "country": h.get("country_name"), "city": h.get("city"),
            "ports": h.get("ports", [])[:30],
            "vulns": list((h.get("vulns") or []))[:20] if isinstance(h.get("vulns"), list) else list((h.get("vulns") or {}).keys())[:20],
            "last_update": str(h.get("last_update") or "")[:19], "services": data}

# ---------- pacote investigador (tudo keyless) ----------
def ht_text(path):
    st, _, body = http_get("https://api.hackertarget.com" + path, timeout=30)
    txt = body.decode("utf-8", "ignore").strip()
    if "error" in txt.lower() and len(txt) < 120:
        raise RuntimeError("hackertarget: " + txt)
    return txt[:6000]

def api_subdomains(d):
    found = {}
    try:
        j = fetch_json("https://crt.sh/?q=%25." + urllib.parse.quote(d) + "&output=json", timeout=25)
        for row in j:
            for s in str(row.get("name_value", "")).split("\n"):
                s = s.strip().lower()
                if s and d in s and not s.startswith("*"):
                    found[s] = "crt.sh"
    except Exception:
        pass
    try:
        txt = ht_text("/hostsearch/?q=" + urllib.parse.quote(d))
        for line in txt.splitlines():
            if "," in line:
                s = line.split(",")[0].strip().lower()
                if s and d in s:
                    found.setdefault(s, "hackertarget")
    except Exception:
        pass
    return {"domain": d, "count": len(found),
            "subdomains": sorted(found)[:200],
            "via": ["crt.sh", "hackertarget hostsearch"]}

def api_headers(u):
    if not u.startswith("http"):
        u = "https://" + u
    return {"url": u, "raw": ht_text("/httpheaders/?q=" + urllib.parse.quote(u))}

def api_reverseip(ip):
    txt = ht_text("/reverseiplookup/?q=" + urllib.parse.quote(ip))
    hosts = [l.strip() for l in txt.splitlines() if l.strip() and "error" not in l.lower()][:100]
    return {"ip": ip, "count": len(hosts), "hosts": hosts}

def api_wayback(u):
    u = re.sub(r"^https?://", "", u).split("/")[0]
    try:
        st, _, body = http_get("https://web.archive.org/cdx/search/cdx?url=" + urllib.parse.quote(u) +
                               "&output=json&limit=60&collapse=urlkey&from=2015", timeout=55)
        j = json.loads(body.decode("utf-8", "ignore"))
        rows = [{"ts": r[1], "url": r[2][:140], "status": r[4]} for r in j[1:]]
        return {"domain": u, "count": len(rows), "urls": rows,
                "open": "https://web.archive.org/web/*/" + u}
    except Exception:
        av = fetch_json("https://archive.org/wayback/available?url=" + urllib.parse.quote(u), timeout=20)
        snap = ((av.get("archived_snapshots") or {}).get("closest") or {})
        return {"domain": u, "count": -1, "urls": [],
                "closest": snap.get("url"), "note": "CDX instável agora; use o snapshot mais próximo"}

def api_urlscan(q):
    j = fetch_json("https://urlscan.io/api/v1/search/?q=" + urllib.parse.quote(q) + "&size=15", timeout=25)
    out = []
    for r in j.get("results", [])[:15]:
        p, t = r.get("page", {}), r.get("task", {})
        out.append({"url": p.get("url"), "ip": p.get("ip"), "country": p.get("country"),
                    "time": t.get("time"), "tags": (r.get("task") or {}).get("tags") or [],
                    "malicious": ((r.get("verdicts") or {}).get("overall") or {}).get("malicious")})
    return {"total": j.get("total"), "results": out}

def api_ocid_area(key, lat, lon, dist_m=3000):
    if not key or len(key.strip()) < 5:
        raise RuntimeError("OpenCellID exige chave gratuita (opencellid.org)")
    d = dist_m / 111320.0
    bbox = "%s,%s,%s,%s" % (lat - d, lon - d, lat + d, lon + d)
    j = fetch_json("https://opencellid.org/cell/getInArea?key=" + urllib.parse.quote(key.strip()) +
                   "&BBOX=" + bbox + "&format=json", timeout=30)
    cells = []
    for c in (j.get("cells") or [])[:150]:
        cells.append({"lat": c.get("lat"), "lon": c.get("lon"), "mcc": c.get("mcc"),
                      "mnc": c.get("mnc"), "lac": c.get("lac"), "cid": c.get("cellid"),
                      "radio": c.get("radio"), "range": c.get("range")})
    return {"count": len(cells), "cells": cells,
            "mnc_br": {"2": "TIM", "3": "TIM", "4": "TIM", "5": "Claro", "6": "Vivo",
                       "10": "Vivo", "11": "Vivo", "23": "Vivo", "31": "Oi"}}

# ---------- Top GitHub rodando direto: holehe + socialscan ----------
def run_cmd(args, timeout):
    try:
        p = subprocess.run(args, capture_output=True, text=True, timeout=timeout,
                           encoding="utf-8", errors="ignore")
        return (p.stdout or "") + (p.stderr or ""), False
    except subprocess.TimeoutExpired as e:
        out = ""
        for part in (getattr(e, "stdout", ""), getattr(e, "stderr", "")):
            if isinstance(part, str):
                out += part
        try:
            e.kill()
        except Exception:
            pass
        return out, True

ANSI_RE = re.compile(r"\x1b\[[0-9;?]*[A-Za-z]|\x1b[()][AB012]|\r")

def api_holehe(email):
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email or ""):
        raise RuntimeError("e-mail inválido")
    exe = shutil.which("holehe")
    if not exe:
        raise RuntimeError("holehe não instalado (pip install holehe)")
    out, timed_out = run_cmd([exe, email, "--only-used"], 150)
    clean = ANSI_RE.sub("", out)
    used = []
    for line in clean.splitlines():
        m = re.match(r"^\[\+\]\s*(.+?)\s*$", line)
        if m and not m.group(1).startswith("Email used"):
            used.append(m.group(1))
    ms = re.search(r"(\d+)\s+websites checked in\s+([\d.]+)", clean)
    return {"email": email, "used": sorted(set(used)),
            "used_count": len(set(used)),
            "checked": int(ms.group(1)) if ms else None,
            "seconds": float(ms.group(2)) if ms else None,
            "timed_out": timed_out, "tool": "megadose/holehe"}

def api_socialscan(query):
    import asyncio as _aio
    from socialscan.platforms import Platforms
    q = (query or "").strip()
    if not q or len(q) > 64:
        raise RuntimeError("alvo inválido")
    is_email = "@" in q
    if is_email and not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", q):
        raise RuntimeError("e-mail inválido")

    async def batch():
        import aiohttp
        timeout = aiohttp.ClientTimeout(total=30)
        async with aiohttp.ClientSession(timeout=timeout) as sess:
            async def one(cls):
                try:
                    inst = cls(sess)
                    meth = getattr(inst, "check_email" if is_email else "check_username", None)
                    if meth is None:
                        return {"platform": cls.__name__, "success": False, "message": "sem suporte"}
                    r = await _aio.wait_for(meth(q), timeout=28)
                    plat = getattr(r.platform, "name", None) or cls.__name__
                    return {"platform": plat, "available": bool(r.available),
                            "valid": bool(r.valid), "success": bool(r.success),
                            "message": str(r.message or "")[:160], "link": str(r.link or "")}
                except Exception as e:
                    msg = str(e)[:140]
                    if "too many" in msg.lower() or "QueryError" in type(e).__name__:
                        msg = "rate-limit/anti-bot (tente de novo em 1 min)"
                    return {"platform": cls.__name__, "success": False, "message": msg}
            return await _aio.gather(*[one(p.value) for p in Platforms])

    res = _aio.run(batch())
    return {"query": q, "type": "email" if is_email else "username",
            "results": [r for r in res if r], "tool": "iojw/socialscan"}

# ---------- Central de vazamentos (fontes legítimas) ----------
def api_hudson(email):
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email or ""):
        raise RuntimeError("e-mail inválido")
    j = fetch_json("https://cavalier.hudsonrock.com/api/json/v2/osint-tools/search-by-email?email=" +
                   urllib.parse.quote(email), timeout=25)
    stealers = j.get("stealers") or []
    return {"email": email, "infected": bool(stealers) or "infected" in str(j.get("message", "")).lower(),
            "message": str(j.get("message", ""))[:300],
            "computers": len(stealers),
            "tool": "Hudson Rock (infostealers)"}

def api_hibp(email, key):
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email or ""):
        raise RuntimeError("e-mail inválido")
    if not key or len(key.strip()) < 5:
        raise RuntimeError("HIBP exige sua chave (haveibeenpwned.com/API/Key)")
    req = urllib.request.Request(
        "https://haveibeenpwned.com/api/v3/breachedaccount/" + urllib.parse.quote(email) + "?truncateResponse=false",
        headers={**UA, "hibp-api-key": key.strip()})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            j = json.loads(r.read().decode("utf-8", "ignore"))
            return {"email": email, "count": len(j),
                    "breaches": [{"name": b.get("Name"), "date": b.get("BreachDate"),
                                  "data": (b.get("DataClasses") or [])[:8],
                                  "verified": b.get("IsVerified")} for b in j[:15]]}
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return {"email": email, "count": 0, "breaches": []}
        raise RuntimeError("HIBP HTTP " + str(e.code))

def api_pwned(pre):
    if not re.fullmatch(r"[0-9a-fA-F]{5}", pre or ""):
        raise RuntimeError("prefixo inválido")
    st, _, body = http_get("https://api.pwnedpasswords.com/range/" + pre.upper(), timeout=20)
    if st != 200:
        raise RuntimeError("PwnedPasswords HTTP " + str(st))
    return {"suffixes": body.decode("utf-8", "ignore").strip().splitlines()[:2500]}

# ---------- Processos (DataJud/CNJ) + Transparência (chaves gratuitas do usuário) ----------
TRIBUNAIS = ["TJSP", "TJRJ", "TJMG", "TJPR", "TJRS", "TJBA", "TJSC", "TJGO",
             "TJPE", "TJCE", "TRF1", "TRF2", "TRF3", "TRF4", "TRF5", "TST"]

def api_datajud(trib, q, key, size=8):
    if not key or len(key.strip()) < 5:
        raise RuntimeError("DataJud exige chave gratuita (cadastro gov.br — ver datajud-wiki.cnj.jus.br)")
    q = (q or "").strip()
    if len(q) < 3:
        raise RuntimeError("digite nome ou documento (mín. 3 caracteres)")
    body = json.dumps({"size": size,
        "_source": ["numeroProcesso", "classe", "assuntos", "partes", "dataAjuizamento"],
        "query": {"multi_match": {"query": q, "fields": ["partes.nome", "partes.cpf", "partes.cnpj", "numeroProcesso"], "operator": "and"}}}).encode()

    def one(t):
        req = urllib.request.Request(
            "https://api-publica.datajud.cnj.jus.br/api_publica_" + t.lower() + "/_search",
            data=body, headers={**UA, "Content-Type": "application/json", "Authorization": "APIKey " + key.strip()})
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                j = json.loads(r.read().decode("utf-8", "ignore"))
                hits = []
                for h in (j.get("hits") or {}).get("hits", [])[:size]:
                    s = h.get("_source") or {}
                    partes = []
                    for p in (s.get("partes") or [])[:6]:
                        if isinstance(p, dict):
                            partes.append(p.get("nome") or "?")
                    cl = s.get("classe")
                    hits.append({"tribunal": t, "processo": s.get("numeroProcesso"),
                                 "classe": cl.get("nome") if isinstance(cl, dict) else cl,
                                 "assuntos": [(a.get("nome") if isinstance(a, dict) else a) for a in (s.get("assuntos") or [])][:3],
                                 "partes": partes, "ajuizado": str(s.get("dataAjuizamento") or "")[:10]})
                return hits
        except urllib.error.HTTPError as e:
            if e.code in (401, 403):
                raise RuntimeError("chave DataJud inválida ou expirada")
            return []
        except RuntimeError:
            raise
        except Exception:
            return []

    if trib and trib.upper() != "TODOS":
        hits = one(trib.upper())
    else:
        with ThreadPoolExecutor(max_workers=8) as ex:
            nested = list(ex.map(one, TRIBUNAIS))
        hits = [h for sub in nested for h in sub if h.get("processo")]
    return {"query": q, "tribunal": trib or "TODOS", "total": len(hits), "processos": hits[:40]}

TRANSP_RES = {"servidores": "servidores", "ceis": "ceis", "cnep": "cnep"}

def api_transp(recurso, termo, key, pagina=1):
    if not key or len(key.strip()) < 5:
        raise RuntimeError("Transparência exige chave gratuita (portaldatransparencia.gov.br/api-de-dados)")
    recurso = TRANSP_RES.get(recurso, "servidores")
    termo = (termo or "").strip()
    if recurso == "servidores":
        qs = "nome=" + urllib.parse.quote(termo) + "&pagina=" + str(pagina)
    else:
        qs = "nomeSancionado=" + urllib.parse.quote(termo) + "&pagina=" + str(pagina)
    req = urllib.request.Request("https://api.portaldatransparencia.gov.br/api-de-dados/" + recurso + "?" + qs,
                                 headers={**UA, "chave-api-dados": key.strip()})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            j = json.loads(r.read().decode("utf-8", "ignore"))
            items = j if isinstance(j, list) else j.get("results", j)
            return {"recurso": recurso, "items": items[:15] if isinstance(items, list) else items}
    except urllib.error.HTTPError as e:
        if e.code in (401, 403):
            raise RuntimeError("chave Transparência inválida — gere em portaldatransparencia.gov.br/api-de-dados")
        raise RuntimeError("Transparência HTTP " + str(e.code))

# ================= CTF-ES — backend central (ranking global) =================
# Contas + validação de flags NO SERVIDOR (a flag nunca vai para o navegador
# antes de acertar). Sem pip, só stdlib. Dados em JSON ao lado deste arquivo.
import os as _os
import secrets as _secrets

CTF_USERS_F = BASE / "ctf_users.json"
CTF_SESS_F = BASE / "ctf_sessions.json"
CTF_CHEAT_F = BASE / "ctf_cheaters.json"
CTF_TEAMS_F = BASE / "ctf_teams.json"
CTF_VIS_F = BASE / "ctf_visitors.json"
CTF_MAIL_F = BASE / "ctf_mail.json"
# códigos de recuperação (memória; reiniciou, pede outro) + limite anti-spam
RESET_CODES = {}
RESET_RATE = {}
CTF_SALT = "ctf-faesa::"
CTF_SESS_DAYS = 30
CTF_TEAM_MAX = 4

CTF_LEVEL = {
    1: "facil",
    2: "facil",
    3: "facil",
    4: "facil",
    5: "facil",
    6: "facil",
    7: "facil",
    8: "medio",
    9: "medio",
    10: "medio",
    11: "medio",
    12: "medio",
    13: "medio",
    14: "medio",
    15: "avancado",
    16: "avancado",
    17: "avancado",
    18: "avancado",
    19: "avancado",
    20: "avancado",
    21: "facil",
    22: "facil",
    23: "facil",
    24: "medio",
    25: "medio",
    26: "medio",
    27: "medio",
    28: "avancado",
    29: "avancado",
    30: "avancado",
    31: "facil",
    32: "facil",
    33: "facil",
    34: "medio",
    35: "medio",
    36: "medio",
    37: "medio",
    38: "avancado",
    39: "avancado",
    40: "avancado",
    41: "facil",
    42: "facil",
    43: "facil",
    44: "medio",
    45: "medio",
    46: "medio",
    47: "medio",
    48: "avancado",
    49: "avancado",
    50: "avancado",
    51: "facil",
    52: "facil",
    53: "facil",
    54: "facil",
    55: "facil",
    56: "facil",
    57: "facil",
    58: "medio",
    59: "medio",
    60: "medio",
    61: "medio",
    62: "medio",
    63: "medio",
    64: "medio",
    65: "medio",
    66: "medio",
    67: "medio",
    68: "medio",
    69: "medio",
    70: "medio",
    71: "medio",
    72: "medio",
    73: "medio",
    74: "medio",
    75: "medio",
    76: "medio",
    77: "medio",
    78: "medio",
    79: "medio",
    80: "avancado",
    81: "avancado",
    82: "avancado",
    83: "avancado",
    84: "avancado",
    85: "avancado",
    86: "avancado",
    87: "avancado",
    88: "avancado",
    89: "avancado",
    90: "avancado",
    91: "avancado",
    92: "avancado",
    93: "avancado",
    94: "avancado",
    95: "avancado",
    96: "avancado",
    97: "avancado",
    98: "avancado",
    99: "avancado",
    100: "avancado",
    101: "avancado",
}

CTF_FLAGS = {
1:"CTF-BR{1nsp3c10n4r_3l3m3nt0}",2:"CTF-BR{r0b0ts_n4o_m3nt3m}",
3:"CTF-BR{b4s3_64_3_m4m4o}",4:"CTF-BR{c4es4r_v1v3}",
5:"CTF-BR{c00k1e_m0nst3r}",6:"CTF-BR{c0ns0l3_h4ck3r}",
7:"CTF-BR{h34d3rs_f4l4m}",8:"CTF-BR{sql1_byp4ss_m4st3r}",
9:"CTF-BR{l0c4l_st0r4g3_v4ult}",10:"CTF-BR{h4sh_br3ak3r}",
11:"CTF-BR{jwt_n0n3_4lg}",12:"CTF-BR{m3t4d4t4_l34k}",
13:"CTF-BR{j4v4scr1pt_r3v3rs3}",14:"CTF-BR{png_m4g1c_by7es}",
15:"CTF-BR{v1g3n3r3_r3s1st3}",16:"CTF-BR{cr4ckm3_m4st3r_1337}",
17:"CTF-BR{p4th_tr4v3rs4l_r00t}",18:"CTF-BR{f0r3ns1c_str1ngs}",
19:"CTF-BR{rs4_2024_br0k3n}",20:"CTF-BR{ctf_ch4mp10n_f1n4l_b0ss}",
21:"CTF-BR{g1t_3xp0s3d_h34d}",22:"CTF-BR{p1n_c0d3_2026}",
23:"CTF-BR{m0rs3_c0d3}",24:"CTF-BR{xss_r3fl3ct3d}",
25:"CTF-BR{4tb4sh_m4st3r}",26:"CTF-BR{l0g_hunt3r_4p4ch3}",
27:"CTF-BR{b4s3_32_r0cks}",28:"CTF-BR{x0r_k3y_42}",
29:"CTF-BR{sst1_7x7_49}",30:"CTF-BR{f43s4_f1n4l_b0ss}",
31:"CTF-BR{s1t3m4p_s3cr3t}",32:"CTF-BR{r0t13_b4by}",33:"CTF-BR{cl1ck_sp4m}",
34:"CTF-BR{d0rk_g1thub}",35:"CTF-BR{b1n4ry_f43s4}",36:"CTF-BR{r41l_f3nc3}",
37:"CTF-BR{0p3n_r3d1r3ct}",38:"CTF-BR{xx3_3nt1ty}",39:"CTF-BR{b4s3_58_ch3ck}",
40:"CTF-BR{f43s4_b0ss_v2}",
41:"CTF-BR{b4ckup_b4k}",42:"CTF-BR{us3r_4g3nt_sp00f}",43:"CTF-BR{j4v4scr1pt_s3cr3t}",
44:"CTF-BR{1d0r_p3rfil}",45:"CTF-BR{pdf_m3t4d4t4}",46:"CTF-BR{v3rb_t4mp3r1ng}",
47:"CTF-BR{3nt1t13s_html}",48:"CTF-BR{ssrf_cl0ud}",49:"CTF-BR{k1d_tr4v3rs4l}",
50:"CTF-BR{r4c3_c0nd1t10n}",
51:"CTF-BR{d3f4ult_p4ss}",52:"CTF-BR{h3x_4sc11}",53:"CTF-BR{t34p0t_418}",
54:"CTF-BR{r0ck_p4p3r}",55:"CTF-BR{wh01s_l00kup}",56:"CTF-BR{z3r0_w1dth}",
57:"CTF-BR{r0t47_m4st3r}",58:"CTF-BR{h0st_h34d3r}",59:"CTF-BR{sh3ll_upl04d}",
60:"CTF-BR{hpp_p0llut10n}",61:"CTF-BR{gr4phql_1ntr0}",62:"CTF-BR{SUBST1TUT10N}",
63:"CTF-BR{V1G_FRUTA}",64:"CTF-BR{cub3_2026}",65:"CTF-BR{crc32_c0l1s10n}",
66:"CTF-BR{dn5_3xf1l}",67:"CTF-BR{v0l4t1l1ty}",68:"CTF-BR{0u1_f4354t3ch}",
69:"CTF-BR{p1v0t_3m41l}",70:"CTF-BR{g30_r10}",71:"CTF-BR{pyc_d1s4ss}",
72:"CTF-BR{cr4ckm3_v2}",73:"CTF-BR{b1n_01_by73s}",74:"CTF-BR{1d3_t4gs}",
75:"CTF-BR{r3g3x_m4st3r}",76:"CTF-BR{pr1m3s_328}",77:"CTF-BR{js0np_h1j4ck}",
78:"CTF-BR{b4c0n_f43s4}",79:"CTF-BR{w0rd_f4354}",80:"CTF-BR{n0sql_1nj3ct}",
81:"CTF-BR{pr0t0_p0llut10n}",82:"CTF-BR{smuggl3d_r3q}",83:"CTF-BR{4lg_c0nfus10n}",
84:"CTF-BR{b1t_fl1pp1ng}",85:"CTF-BR{h4st4d_12345}",86:"CTF-BR{3cb_p3ngu1n}",
87:"CTF-BR{c4rv3_jp3g}",88:"CTF-BR{h1st0ry_sh3ll}",89:"CTF-BR{vm_r3v3rs3}",
90:"CTF-BR{k3yg3n_2024}",91:"CTF-BR{4lph4_f43s4}",92:"CTF-BR{chunk_b4d_crc}",
93:"CTF-BR{p1v0t_r3x}",94:"CTF-BR{br41nfuck_01}",95:"CTF-BR{d0ck3r_s3cr3t}",
96:"CTF-BR{c4ch3_p01s0n}",97:"CTF-BR{4UT0K3Y_C1PH3R}",98:"CTF-BR{t1m3l1n3_c0p}",
99:"CTF-BR{supr3m0_b0ss_100}",100:"CTF-BR{l0g_p01s0n}",
101:"CTF-BR{3cd54_n0nc3_gr4ndm4st3r}",
}
CTF_PTS = {
1:100,2:100,3:120,4:120,5:150,6:150,7:150,
8:200,9:200,10:250,11:250,12:250,13:300,14:300,
15:400,16:450,17:500,18:400,19:500,20:500,
21:100,22:120,23:130,24:220,25:260,26:260,27:240,
28:420,29:480,30:500,
31:100,32:130,33:120,34:240,35:280,36:270,37:230,38:470,39:460,40:500,
41:110,42:110,43:110,44:250,45:270,46:230,47:260,48:460,49:470,50:520,
51:130,52:140,53:130,54:130,55:140,56:140,57:140,
58:240,59:260,60:250,61:260,62:280,63:270,64:280,65:250,66:280,67:270,
68:260,69:250,70:260,71:280,72:300,73:270,74:280,75:250,76:260,77:240,
78:260,79:240,80:480,81:500,82:470,83:480,84:500,85:500,86:470,87:480,
88:460,89:500,90:470,91:460,92:470,93:450,94:480,95:460,96:490,97:490,
98:500,99:500,100:500,
101:1000,
}

def _jload(p, default):
    try:
        if p.exists():
            return json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        pass
    return default

def _jsave(p, obj):
    tmp = p.with_suffix(p.suffix + ".tmp")
    tmp.write_text(json.dumps(obj, ensure_ascii=False), encoding="utf-8")
    tmp.replace(p)

def ctf_hash(pw):
    return hashlib.sha256((CTF_SALT + str(pw)).encode("utf-8")).hexdigest()

def ctf_user_valid(u):
    return bool(re.fullmatch(r"[A-Za-z0-9_.]{3,20}", u or "")) and (u or "").lower() != "admin"

def ctf_mail_cfg():
    return _jload(CTF_MAIL_F, {})

def ctf_send_mail(to, subject, body):
    import smtplib
    from email.mime.text import MIMEText
    cfg = ctf_mail_cfg()
    if not cfg.get("host") or not cfg.get("user"):
        raise RuntimeError("e-mail de envio não configurado (fale com o ADM)")
    msg = MIMEText(body, "plain", "utf-8")
    msg["Subject"] = subject
    msg["From"] = cfg.get("from", cfg["user"])
    msg["To"] = to
    if int(cfg.get("port", 587)) == 465:
        import ssl
        with smtplib.SMTP_SSL(cfg["host"], 465, context=ssl.create_default_context(), timeout=20) as s:
            s.login(cfg["user"], cfg.get("pass", ""))
            s.send_message(msg)
    else:
        with smtplib.SMTP(cfg["host"], int(cfg.get("port", 587)), timeout=20) as s:
            s.starttls()
            s.login(cfg["user"], cfg.get("pass", ""))
            s.send_message(msg)

def ctf_ensure_admin():
    users = _jload(CTF_USERS_F, {})
    changed = False
    if "admin" in users:
        del users["admin"]; changed = True
    if "Admin" not in users:
        users["Admin"] = {"hash": ctf_hash("Admin"), "role": "admin",
            "created": time.strftime("%d/%m/%Y %H:%M"), "solved": {}, "hints": {},
            "start": int(time.time() * 1000), "bestFullTime": None,
            "prints": 0, "lastPrint": ""}; changed = True
    if changed:
        _jsave(CTF_USERS_F, users)

def ctf_sess_user(token):
    if not token:
        return None
    sess = _jload(CTF_SESS_F, {})
    s = sess.get(str(token))
    if not s:
        return None
    if s.get("exp", 0) < time.time():
        sess.pop(str(token), None); _jsave(CTF_SESS_F, sess); return None
    users = _jload(CTF_USERS_F, {})
    name = s.get("user")
    if name not in users:
        return None
    if users[name].get("banned"):
        return None
    return name

def ctf_points(u):
    tot = 0
    for cid in u.get("solved", {}):
        p = CTF_PTS.get(int(cid), 0)
        tot += (p + 1) // 2 if str(cid) in u.get("hints", {}) or int(cid) in u.get("hints", {}) else p
    # multa de print: cada PrintScreen tira metade dos pontos (acumula)
    return max(0, tot - int(u.get("fine", 0) or 0))

BEAT_CAP = 300000  # 5 min: fatia máxima acumulada por vez (aba esquecida não conta)

def ctf_base(u):
    # início do ATAQUE (abriu a 1ª fase); fallback: início antigo
    return int(u.get("attackStart") or u.get("start") or int(time.time() * 1000))

def live_active(u):
    # tempo ATIVO somado (só conta com fase aberta; fechar = pausou)
    sv = u.get("solved") or {}
    if not sv:
        return 0
    if len(sv) >= len(CTF_FLAGS) and u.get("frozenMs") is not None:
        return int(u["frozenMs"])
    return int(u.get("activeMs", 0) or 0)

def ctf_elapsed(u):
    return live_active(u)

def ctf_ritmo(u):
    # média de tempo por fase, separada nas 3 categorias (só fases resolvidas)
    sv = u.get("solved") or {}
    pm = u.get("phaseMs") or {}
    base = ctf_base(u)
    out = {}
    for lvl in ("facil", "medio", "avancado"):
        ts = []
        for cid in sv:
            try:
                ci = int(cid)
            except Exception:
                continue
            if CTF_LEVEL.get(ci) != lvl:
                continue
            if str(cid) in pm and isinstance(pm[str(cid)], int):
                ts.append(pm[str(cid)])
            elif isinstance(sv[cid], int):
                ts.append(max(0, sv[cid] - base))
        out[lvl] = int(sum(ts) / len(ts)) if ts else None
    return out

def ctf_phases(u):
    # tempo somado em cada fase: ativo acumulado até resolver cada uma
    sv = u.get("solved") or {}
    pm = u.get("phaseMs") or {}
    base = ctf_base(u)
    out = {}
    for cid, ts in sv.items():
        if str(cid) in pm and isinstance(pm[str(cid)], int):
            out[str(cid)] = pm[str(cid)]
        else:
            out[str(cid)] = (max(0, ts - base) if isinstance(ts, int) else None)
    return out

def ctf_teams():
    return _jload(CTF_TEAMS_F, {})

def ctf_save_teams(t):
    _jsave(CTF_TEAMS_F, t)

def ctf_user_team(username):
    for tname, t in ctf_teams().items():
        if username in t.get("members", []):
            return tname
    return None

def ctf_team_valid(name):
    return bool(re.fullmatch(r"[A-Za-z0-9_.-]{3,20}", name or ""))

def ctf_team_board():
    users = _jload(CTF_USERS_F, {})
    teams = ctf_teams()
    cheat = {c.get("name") for c in _jload(CTF_CHEAT_F, [])}
    rows = []
    for tname, t in teams.items():
        members = [n for n in t.get("members", []) if n in users and not users[n].get("banned")]
        if not members:
            continue
        pts, solves, ncheat, ts_all, starts = 0, 0, 0, [], []
        for n in members:
            u = users[n]
            if n in cheat:
                ncheat += 1
                continue
            # pontos INDIVIDUAIS somados: cada membro conta o que fez
            pts += ctf_points(u)
            solves += len(u.get("solved", {}) or {})
            try:
                starts.append(int(u.get("start", 0)))
            except Exception:
                pass
            for ts in (u.get("solved", {}) or {}).values():
                if isinstance(ts, int):
                    ts_all.append(ts)
        tempo = (max(ts_all) - min(starts)) if ts_all and starts else 0
        rows.append({"team": tname, "pts": pts, "solves": solves,
                     "members": members, "n": len(members), "cheaters": ncheat,
                     "time": max(0, tempo),
                     "created": t.get("created", "")})
    rows.sort(key=lambda r: (-r["pts"], r["time"]))
    return rows

def ctf_scoreboard():
    users = _jload(CTF_USERS_F, {})
    cheat = {c.get("name"): c for c in _jload(CTF_CHEAT_F, [])}
    rows = []
    for name, u in users.items():
        if not u.get("solved") or u.get("banned"):
            continue
        c = cheat.get(name, {})
        rows.append({"name": name, "pts": ctf_points(u), "solves": len(u.get("solved", {})),
                     "time": ctf_elapsed(u), "best": u.get("bestFullTime"),
                     "date": u.get("lastSolveAt", u.get("created", "")),
                     "cheat": name in cheat, "reason": c.get("reason", ""),
                     "cheatDate": c.get("date", ""),
                     "phases": ctf_phases(u), "ritmo": ctf_ritmo(u)})
    # vencedor por PONTUAÇÃO; empate decide no MELHOR (menor) tempo
    rows.sort(key=lambda r: (-r["pts"], r["time"] if r["time"] is not None else 10**18))
    return rows[:100]

class _Visitors:
    # visitantes anônimos (salvo em disco; reiniciou, continua)
    def __init__(self):
        self.d = {}

    def ping(self, vid, now, ip="?"):
        if isinstance(vid, str) and 8 <= len(vid) <= 64:
            e = self.d.get(vid)
            if isinstance(e, dict) and isinstance(e.get("last"), (int, float)):
                e["active"] = e.get("active", 0) + max(0, min(now - e["last"], 300))
                # voltou depois de 30min fora = nova visita
                if now - e["last"] > 1800:
                    e["visits"] = int(e.get("visits", 1) or 1) + 1
            else:
                e = {"ip": ip, "first": now, "active": 0, "visits": 1}
            e["ip"] = ip
            e["last"] = now
            self.d[vid] = e

    def prune(self, now):
        # visitantes ficam REGISTRADOS para sempre (só marca offline);
        # limpa apenas após 90 dias para não crescer infinito
        for k in [k for k, v in self.d.items() if now - (v.get("last") if isinstance(v, dict) else v) > 90 * 86400]:
            self.d.pop(k, None)

    def lst(self, now):
        self.prune(now)
        out = []
        for k, v in self.d.items():
            if isinstance(v, dict):
                on = now - v.get("last", 0) <= 120
                act = v.get("active", 0) + (max(0, min(now - v.get("last", 0), 300)) if on else 0)
                out.append({"id": k[:8], "ip": v.get("ip", "?"), "last": v.get("last", 0),
                            "first": v.get("first", v.get("last", 0)),
                            "visits": int(v.get("visits", 1) or 1),
                            "active": int(act), "online": on})
            else:
                out.append({"id": k[:8], "ip": "?", "last": v, "first": v,
                            "active": 0, "online": now - v <= 120})
        out.sort(key=lambda r: -r["last"])
        return out

VISITORS = _Visitors()
VISITORS.d = _jload(CTF_VIS_F, {})

ctf_ensure_admin()


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(BASE), **k)

    def log_message(self, *a):
        pass

    def send_json(self, obj, code=200):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_PUT(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/admin-panel":
            body = ("<html><head><meta charset='utf-8'></head><body style='background:#04070c;color:#d7ffe0;"
                    "font-family:monospace;padding:40px'><h1>Painel secreto</h1>"
                    "<p>Verbo certo, porta certa. Flag: <b>CTF-BR{v3rb_t4mp3r1ng}</b></p></body></html>").encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        return self.send_error(501, "Unsupported method")

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        # pista real do desafio 7: flag VAI no header HTTP de verdade
        if parsed.path == "/pista-headers":
            body = ("<html><head><meta charset='utf-8'></head><body style='background:#04070c;color:#d7ffe0;"
                    "font-family:monospace;padding:40px'><h1>Nada por aqui...</h1>"
                    "<p>A resposta HTTP e que interessa. Inspecione os <b>headers</b> (F12 -&gt; Network).</p>"
                    "</body></html>").encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("X-Flag", "CTF-BR{h34d3rs_f4l4m}")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if parsed.path == "/cha":
            body = ("<html><head><meta charset='utf-8'></head><body style='background:#04070c;color:#d7ffe0;"
                    "font-family:monospace;padding:40px'><h1>🫖 418 - Sou um bule</h1>"
                    "<p>O servidor recusou passar café. Mas deixou uma flag: <b>CTF-BR{t34p0t_418}</b></p></body></html>").encode("utf-8")
            self.send_response(418)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if parsed.path == "/area-vip":
            ua = self.headers.get("User-Agent", "")
            if "CTF-ES" in ua:
                body = ("<html><head><meta charset='utf-8'></head><body style='background:#04070c;color:#d7ffe0;"
                        "font-family:monospace;padding:40px'><h1>Area VIP</h1>"
                        "<p>User-Agent reconhecido. Flag: <b>CTF-BR{us3r_4g3nt_sp00f}</b></p></body></html>").encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
            else:
                body = b"Bloqueado: este site so abre no navegador CTF-ES (User-Agent)."
                self.send_response(403)
                self.send_header("Content-Type", "text/plain; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
            return
        if parsed.path == "/admin-panel":
            body = b"405 Metodo nao permitido. GET bloqueado aqui. Tente outro verbo HTTP."
            self.send_response(405)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if parsed.path == "/perfil":
            q = dict(urllib.parse.parse_qsl(urllib.parse.urlparse(self.path).query))
            pid = (q.get("id") or "1").strip()
            if pid == "7":
                body = b'{"user":"admin","cargo":"root","flag":"CTF-BR{1d0r_p3rfil}"}'
            else:
                body = ('{"user":"convidado %s","cargo":"visitante","flag":null}' % pid[:10]).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if not parsed.path.startswith("/api/"):
            return super().do_GET()
        q = dict(urllib.parse.parse_qsl(parsed.query))
        try:
            p = parsed.path
            if p == "/api/health":
                return self.send_json({"ok": True, "engine": "localhost",
                    "sherlock_sites": len(SHERLOCK), "wmn_sites": len(WMN),
                    "sa_sites": len(SA), "uptime_s": int(time.time() - STARTED)})
            if p == "/api/username":
                u = (q.get("u") or "").strip().lstrip("@")
                if not u or len(u) > 39:
                    return self.send_json({"ok": False, "error": "username invalido"}, 400)
                try:
                    lim = int(q.get("limit", "0") or 0)
                except ValueError:
                    lim = 0
                return self.send_json({"ok": True, **scan_username(u, q.get("mode", "fast"), lim)})
            if p == "/api/github":
                u = (q.get("u") or "").strip().lstrip("@")
                return self.send_json({"ok": True, **api_github(u)})
            if p == "/api/email":
                e = (q.get("e") or "").strip()
                if "@" not in e:
                    return self.send_json({"ok": False, "error": "email invalido"}, 400)
                return self.send_json({"ok": True, **api_email(e)})
            if p == "/api/ip":
                return self.send_json({"ok": True, "data": api_ip((q.get("ip") or "").strip())})
            if p == "/api/dns":
                return self.send_json({"ok": True, "data": api_dns((q.get("name") or "").strip(), q.get("type", "A"))})
            if p == "/api/crt":
                return self.send_json({"ok": True, **api_crt((q.get("d") or "").strip())})
            if p == "/api/rdap":
                return self.send_json({"ok": True, **api_rdap((q.get("d") or "").strip())})
            if p == "/api/cep":
                return self.send_json({"ok": True, "data": api_cep(re.sub(r"\D", "", q.get("c", "")))})
            if p == "/api/cnpj":
                return self.send_json({"ok": True, "data": api_cnpj(re.sub(r"\D", "", q.get("c", "")))})
            if p == "/api/shodan/info":
                return self.send_json({"ok": True, "shodan_lib": SHODAN_OK, "data": api_shodan_info(q.get("key", ""))})
            if p == "/api/shodan/search":
                return self.send_json({"ok": True, **api_shodan_search(q.get("key", ""), q.get("q", ""), int(q.get("page", "1") or 1))})
            if p == "/api/shodan/host":
                return self.send_json({"ok": True, **api_shodan_host(q.get("key", ""), (q.get("ip") or "").strip())})
            if p == "/api/subdomains":
                return self.send_json({"ok": True, **api_subdomains((q.get("d") or "").strip().lower())})
            if p == "/api/headers":
                return self.send_json({"ok": True, **api_headers((q.get("u") or "").strip())})
            if p == "/api/reverseip":
                return self.send_json({"ok": True, **api_reverseip((q.get("ip") or "").strip())})
            if p == "/api/wayback":
                return self.send_json({"ok": True, **api_wayback((q.get("u") or "").strip())})
            if p == "/api/urlscan":
                return self.send_json({"ok": True, **api_urlscan((q.get("q") or "").strip())})
            if p == "/api/ocid":
                return self.send_json({"ok": True, **api_ocid_area(q.get("key", ""), float(q.get("lat")), float(q.get("lon")), int(q.get("dist", "3000") or 3000))})
            if p == "/api/holehe":
                return self.send_json({"ok": True, **api_holehe((q.get("e") or "").strip())})
            if p == "/api/socialscan":
                return self.send_json({"ok": True, **api_socialscan((q.get("q") or "").strip())})
            if p == "/api/hudson":
                return self.send_json({"ok": True, **api_hudson((q.get("e") or "").strip())})
            if p == "/api/hibp":
                return self.send_json({"ok": True, **api_hibp((q.get("e") or "").strip(), q.get("key", ""))})
            if p == "/api/pwned":
                return self.send_json({"ok": True, **api_pwned((q.get("pre") or "").strip())})
            if p == "/api/datajud":
                return self.send_json({"ok": True, **api_datajud((q.get("trib") or "TODOS").strip(), (q.get("q") or "").strip(), q.get("key", ""))})
            if p == "/api/transp":
                return self.send_json({"ok": True, **api_transp((q.get("rec") or "servidores").strip(), (q.get("q") or "").strip(), q.get("key", ""), int(q.get("pag", "1") or 1))})
            # ---- CTF-ES (leitura) ----
            if p == "/api/ctf/me":
                name = ctf_sess_user(q.get("token", ""))
                if not name:
                    return self.send_json({"ok": False, "error": "sessao invalida"}, 401)
                all_users = _jload(CTF_USERS_F, {})
                u = all_users[name]
                t_now = live_active(u)
                u["lastBeat"] = int(time.time() * 1000); _jsave(CTF_USERS_F, all_users)
                return self.send_json({"ok": True, "user": name, "role": u.get("role", "user"),
                    "solved": u.get("solved", {}), "hints": u.get("hints", {}),
                    "start": u.get("start"), "attackStart": u.get("attackStart"),
                    "bestFullTime": u.get("bestFullTime"),
                    "activeMs": int(u.get("activeMs", 0) or 0),
                    "time": t_now, "frozenMs": u.get("frozenMs"),
                    "ritmo": ctf_ritmo(u),
                    "pts": ctf_points(u)})
            if p == "/api/ctf/scoreboard":
                return self.send_json({"ok": True, "total": len(CTF_FLAGS), "ranking": ctf_scoreboard()})
            if p == "/api/ctf/cheaters":
                return self.send_json({"ok": True, "cheaters": _jload(CTF_CHEAT_F, [])})
            if p == "/api/ctf/online":
                # presença: último ping há menos de 120s = online (conta + visitante)
                now = time.time()
                users = _jload(CTF_USERS_F, {})
                n = sum(1 for u in users.values()
                        if isinstance(u.get("lastBeat"), int) and now - u["lastBeat"] / 1000 < 120)
                VISITORS.prune(now)
                return self.send_json({"ok": True, "online": n, "visitantes": len(VISITORS.d),
                                       "total": n + len(VISITORS.d)})

            if p == "/api/ctf/team/ranking":
                return self.send_json({"ok": True, "max": CTF_TEAM_MAX, "teams": ctf_team_board()})
            if p == "/api/ctf/team/my":
                name = ctf_sess_user(q.get("token", ""))
                if not name:
                    return self.send_json({"ok": False, "error": "sessao invalida"}, 401)
                teams = ctf_teams()
                tname = ctf_user_team(name)
                if not tname:
                    mine = sorted([tn for tn, t in teams.items() if any(r.get("user") == name for r in t.get("requests", []))])
                    return self.send_json({"ok": True, "team": None, "max": CTF_TEAM_MAX, "myRequests": mine})
                t = teams[tname]
                board = {r["team"]: r for r in ctf_team_board()}
                return self.send_json({"ok": True, "team": tname, "max": CTF_TEAM_MAX,
                    "members": t.get("members", []), "leader": t.get("by"), "requests": t.get("requests", []),
                    "info": board.get(tname)})
            if p == "/api/ctf/admin/users":
                name = ctf_sess_user(q.get("token", ""))
                users = _jload(CTF_USERS_F, {})
                if not name or users.get(name, {}).get("role") != "admin":
                    return self.send_json({"ok": False, "error": "acesso negado"}, 403)
                now = time.time()
                out = [{"name": n, "role": u.get("role"), "banned": bool(u.get("banned")), "ip": u.get("ip") or "—", "lastIp": u.get("lastIp") or u.get("ip") or "—", "pts": ctf_points(u),
                        "solves": len(u.get("solved", {})), "time": ctf_elapsed(u),
                        "best": u.get("bestFullTime"), "prints": u.get("prints", 0),
                        "lastPrint": u.get("lastPrint", ""), "created": u.get("created", ""),
                        "online": isinstance(u.get("lastBeat"), int) and now - u["lastBeat"] / 1000 < 120}
                       for n, u in users.items()]
                out.sort(key=lambda r: (-r["pts"], r["time"]))
                return self.send_json({"ok": True, "users": out,
                    "cheaters": _jload(CTF_CHEAT_F, [])})
            if p == "/api/ctf/admin/visitors":
                vname = ctf_sess_user(q.get("token", ""))
                vusers = _jload(CTF_USERS_F, {})
                if not vname or vusers.get(vname, {}).get("role") != "admin":
                    return self.send_json({"ok": False, "error": "acesso negado"}, 403)
                return self.send_json({"ok": True, "visitors": VISITORS.lst(time.time())})
            return self.send_json({"ok": False, "error": "endpoint desconhecido"}, 404)
        except Exception as ex:
            return self.send_json({"ok": False, "error": str(ex)[:200]}, 502)

    def client_ip(self):
        # atrás do túnel Cloudflare o IP real vem nos headers
        cf = self.headers.get("CF-Connecting-IP", "")
        if cf:
            return cf.strip()[:45]
        fwd = self.headers.get("X-Forwarded-For", "")
        if fwd:
            return fwd.split(",")[0].strip()[:45]
        try:
            return self.client_address[0]
        except Exception:
            return "?"

    def read_json(self):
        try:
            n = int(self.headers.get("Content-Length", 0) or 0)
        except Exception:
            n = 0
        if n <= 0 or n > 200000:
            return {}
        try:
            return json.loads(self.rfile.read(n).decode("utf-8") or "{}")
        except Exception:
            return {}

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if not parsed.path.startswith("/api/ctf/"):
            return self.send_json({"ok": False, "error": "endpoint desconhecido"}, 404)
        try:
            p = parsed.path
            body = self.read_json()
            users = _jload(CTF_USERS_F, {})
            if p == "/api/ctf/register":
                u = (body.get("user") or "").strip()
                pw = body.get("pass") or ""
                if not ctf_user_valid(u):
                    return self.send_json({"ok": False, "error": "usuario invalido (3-20, letras/numeros/_/.)"}, 400)
                if len(pw) < 4:
                    return self.send_json({"ok": False, "error": "senha minima: 4"}, 400)
                if u in users:
                    return self.send_json({"ok": False, "error": "usuario ja existe"}, 409)
                em = (body.get("email") or "").strip().lower()
                if em and not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", em):
                    return self.send_json({"ok": False, "error": "e-mail invalido"}, 400)
                now = int(time.time() * 1000)
                users[u] = {"hash": ctf_hash(pw), "role": "user", "ip": self.client_ip(), "lastIp": self.client_ip(),
                    "created": time.strftime("%d/%m/%Y %H:%M"), "solved": {}, "hints": {},
                    "start": now, "attackStart": None, "bestFullTime": None, "prints": 0, "lastPrint": "",                     "activeMs": 0, "lastBeat": None, "frozenMs": None, "phaseMs": {},
                    "lastSolveAt": "", "email": em}; _jsave(CTF_USERS_F, users)
                tok = _secrets.token_hex(24)
                sess = _jload(CTF_SESS_F, {}); sess[tok] = {"user": u, "exp": time.time() + CTF_SESS_DAYS * 86400}
                _jsave(CTF_SESS_F, sess)
                users[u]["lastIp"] = self.client_ip(); _jsave(CTF_USERS_F, users)
                return self.send_json({"ok": True, "token": tok, "user": u, "role": "user"})
            if p == "/api/ctf/login":
                u = (body.get("user") or "").strip()
                if u not in users or users[u].get("hash") != ctf_hash(body.get("pass") or ""):
                    return self.send_json({"ok": False, "error": "usuario ou senha invalidos"}, 401)
                if users[u].get("banned"):
                    return self.send_json({"ok": False, "error": "conta bloqueada pelo ADM"}, 403)
                tok = _secrets.token_hex(24)
                sess = _jload(CTF_SESS_F, {}); sess[tok] = {"user": u, "exp": time.time() + CTF_SESS_DAYS * 86400}
                _jsave(CTF_SESS_F, sess)
                return self.send_json({"ok": True, "token": tok, "user": u, "role": users[u].get("role", "user")})
            if p == "/api/ctf/logout":
                sess = _jload(CTF_SESS_F, {}); sess.pop(str(body.get("token") or ""), None); _jsave(CTF_SESS_F, sess)
                return self.send_json({"ok": True})
            if p == "/api/ctf/ping":
                # visitante anônimo (ou qualquer aba) diz "estou aqui" — IP capturado e salvo
                VISITORS.ping((body.get("vid") or ""), time.time(), self.client_ip())
                try:
                    _jsave(CTF_VIS_F, VISITORS.d)
                except Exception:
                    pass
                return self.send_json({"ok": True})
            if p == "/api/ctf/forgot":
                u = (body.get("user") or "").strip()
                users = _jload(CTF_USERS_F, {})
                if u not in users or not users[u].get("email"):
                    return self.send_json({"ok": False, "error": "conta sem e-mail cadastrado — peça ajuda ao ADM"}, 404)
                now = time.time()
                hits = [t for t in RESET_RATE.get(u, []) if now - t < 3600]
                if len(hits) >= 3:
                    return self.send_json({"ok": False, "error": "muitas tentativas — aguarde 1h"}, 429)
                hits.append(now); RESET_RATE[u] = hits
                code = "%06d" % _secrets.randbelow(1000000)
                RESET_CODES[u] = {"code": code, "exp": now + 600, "tries": 0}
                try:
                    ctf_send_mail(users[u]["email"], "CTF-ES — código de recuperação",
                        "Seu código de recuperação CTF-ES: " + code + "\nVale por 10 minutos. Se não foi você, ignore.")
                except Exception as ex:
                    return self.send_json({"ok": False, "error": str(ex)[:120]}, 502)
                return self.send_json({"ok": True})
            if p == "/api/ctf/reset_code":
                u = (body.get("user") or "").strip()
                users = _jload(CTF_USERS_F, {})
                rec = RESET_CODES.get(u)
                if not rec or time.time() > rec["exp"]:
                    RESET_CODES.pop(u, None)
                    return self.send_json({"ok": False, "error": "código expirado — peça outro"}, 400)
                rec["tries"] += 1
                if rec["tries"] > 5 or str(body.get("code") or "").strip() != rec["code"]:
                    if rec["tries"] > 5:
                        RESET_CODES.pop(u, None)
                    return self.send_json({"ok": False, "error": "código incorreto"}, 401)
                nw = body.get("new") or ""
                if len(nw) < 4:
                    return self.send_json({"ok": False, "error": "nova senha mínima: 4"}, 400)
                users[u]["hash"] = ctf_hash(nw)
                _jsave(CTF_USERS_F, users)
                RESET_CODES.pop(u, None)
                return self.send_json({"ok": True})
            name = ctf_sess_user(body.get("token", ""))
            if not name:
                return self.send_json({"ok": False, "error": "sessao invalida"}, 401)
            users = _jload(CTF_USERS_F, {})
            u = users[name]
            if p == "/api/ctf/password":
                if u.get("hash") != ctf_hash(body.get("cur") or ""):
                    return self.send_json({"ok": False, "error": "senha atual incorreta"}, 401)
                if len(body.get("new") or "") < 4:
                    return self.send_json({"ok": False, "error": "nova senha minima: 4"}, 400)
                u["hash"] = ctf_hash(body["new"]); _jsave(CTF_USERS_F, users)
                return self.send_json({"ok": True})
            if p == "/api/ctf/hint":
                try:
                    cid = int(body.get("id", 0))
                except Exception:
                    return self.send_json({"ok": False, "error": "desafio invalido"}, 400)
                if cid not in CTF_FLAGS:
                    return self.send_json({"ok": False, "error": "desafio invalido"}, 400)
                u.setdefault("hints", {})[str(cid)] = True; u["lastBeat"] = int(time.time() * 1000); _jsave(CTF_USERS_F, users)
                return self.send_json({"ok": True, "pts": (CTF_PTS[cid] + 1) // 2})
            if p == "/api/ctf/suspect":
                # cada print: multa de metade dos pontos ganhos até o momento
                multa = ctf_points(u) // 2
                u["fine"] = int(u.get("fine", 0) or 0) + multa
                u["prints"] = int(u.get("prints", 0)) + 1
                u["lastPrint"] = str(body.get("type") or "suspeita")[:80] + " em " + time.strftime("%d/%m/%Y %H:%M")
                u["lastBeat"] = int(time.time() * 1000)
                _jsave(CTF_USERS_F, users)
                # automático: 3+ prints = trapaceiro (vazamento), com motivo
                auto = False
                if u["prints"] >= 3:
                    arr = _jload(CTF_CHEAT_F, [])
                    if not any(c.get("name") == name for c in arr):
                        arr.append({"name": name,
                            "reason": f"Print Screen automático ({u['prints']}x) — possível vazamento de questões",
                            "by": "sistema", "date": time.strftime("%d/%m/%Y %H:%M")})
                        _jsave(CTF_CHEAT_F, arr); auto = True
                return self.send_json({"ok": True, "multa": multa, "pts": ctf_points(u), "autoflag": auto})
            if p == "/api/ctf/submit":
                try:
                    cid = int(body.get("id", 0))
                except Exception:
                    return self.send_json({"ok": False, "error": "desafio invalido"}, 400)
                if cid not in CTF_FLAGS:
                    return self.send_json({"ok": False, "error": "desafio invalido"}, 400)
                if str(body.get("flag") or "").strip() != CTF_FLAGS[cid]:
                    return self.send_json({"ok": True, "correct": False})
                now = int(time.time() * 1000)
                first = not u.get("solved")
                if first:
                    u["start"] = now
                if not u.get("attackStart"):
                    u["attackStart"] = now
                u["lastBeat"] = now
                u.setdefault("solved", {})[str(cid)] = now
                u.setdefault("phaseMs", {})[str(cid)] = int(u.get("activeMs", 0) or 0)
                u["lastSolveAt"] = time.strftime("%d/%m/%Y %H:%M")
                if len(u["solved"]) == len(CTF_FLAGS):
                    el = int(u.get("activeMs", 0) or 0)
                    u["frozenMs"] = el
                    if u.get("bestFullTime") is None or el < u["bestFullTime"]:
                        u["bestFullTime"] = el
                _jsave(CTF_USERS_F, users)
                base = CTF_PTS[cid]
                awarded = (base + 1) // 2 if str(cid) in u.get("hints", {}) else base
                return self.send_json({"ok": True, "correct": True, "awarded": awarded,
                    "total_pts": ctf_points(u), "solves": len(u["solved"]),
                    "time": ctf_elapsed(u), "best": u.get("bestFullTime")})
            if p == "/api/ctf/delete_account":
                # o próprio usuário apaga a conta (pede a senha)
                if u.get("hash") != ctf_hash(body.get("pass") or ""):
                    return self.send_json({"ok": False, "error": "senha incorreta"}, 401)
                if not body.get("confirm"):
                    return self.send_json({"ok": False, "error": "confirmacao necessaria"}, 400)
                users.pop(name, None); _jsave(CTF_USERS_F, users)
                sess = _jload(CTF_SESS_F, {})
                for tk in [tk for tk, s in sess.items() if s.get("user") == name]:
                    sess.pop(tk, None)
                _jsave(CTF_SESS_F, sess)
                teams = ctf_teams(); changed = False
                for tname in list(teams):
                    if name in teams[tname].get("members", []):
                        teams[tname]["members"] = [m for m in teams[tname]["members"] if m != name]
                        changed = True
                    if not teams[tname].get("members"):
                        teams.pop(tname, None)
                        changed = True
                # limpa pedidos pendentes do usuário removido
                for tname in list(teams):
                    reqs = [r for r in teams[tname].get("requests", []) if r.get("user") != name]
                    if len(reqs) != len(teams[tname].get("requests", [])):
                        teams[tname]["requests"] = reqs
                        changed = True
                if changed:
                    ctf_save_teams(teams)
                _jsave(CTF_CHEAT_F, [c for c in _jload(CTF_CHEAT_F, []) if c.get("name") != name])
                return self.send_json({"ok": True})
            if p == "/api/ctf/reset":
                u["solved"] = {}; u["hints"] = {}; u["start"] = int(time.time() * 1000)
                u["attackStart"] = None; u["activeMs"] = 0; u["lastBeat"] = None; u["frozenMs"] = None; u["phaseMs"] = {}
                _jsave(CTF_USERS_F, users)
                return self.send_json({"ok": True})
            if p == "/api/ctf/attack":
                # marca o início do ataque (1ª fase aberta) e registra presença
                now = int(time.time() * 1000)
                u["lastBeat"] = now
                if not u.get("solved") and not u.get("attackStart"):
                    u["attackStart"] = now
                _jsave(CTF_USERS_F, users)
                return self.send_json({"ok": True})
            if p == "/api/ctf/beat":
                # deposita fatia de tempo com fase aberta (fechou = pausou)
                try:
                    add = max(0, min(int(body.get("add", 0) or 0), 1800000))
                except Exception:
                    add = 0
                u["activeMs"] = int(u.get("activeMs", 0) or 0) + add
                u["lastBeat"] = int(time.time() * 1000)
                _jsave(CTF_USERS_F, users)
                return self.send_json({"ok": True, "activeMs": int(u.get("activeMs", 0) or 0)})
            if p == "/api/ctf/team/create":
                tname = (body.get("name") or "").strip()
                if not ctf_team_valid(tname):
                    return self.send_json({"ok": False, "error": "nome invalido (3-20, letras/numeros/_/./-)"}, 400)
                teams = ctf_teams()
                if tname in teams:
                    return self.send_json({"ok": False, "error": "equipe ja existe"}, 409)
                if ctf_user_team(name):
                    return self.send_json({"ok": False, "error": "voce ja esta em uma equipe"}, 409)
                teams[tname] = {"members": [name], "by": name, "requests": [],
                    "created": time.strftime("%d/%m/%Y %H:%M")}
                ctf_save_teams(teams)
                return self.send_json({"ok": True, "team": tname})
            if p == "/api/ctf/team/join":
                tname = (body.get("name") or "").strip()
                teams = ctf_teams()
                if tname not in teams:
                    return self.send_json({"ok": False, "error": "equipe nao encontrada"}, 404)
                if ctf_user_team(name):
                    return self.send_json({"ok": False, "error": "voce ja esta em uma equipe"}, 409)
                if name in teams[tname].get("members", []):
                    return self.send_json({"ok": True, "team": tname})
                if len(teams[tname].get("members", [])) >= CTF_TEAM_MAX:
                    return self.send_json({"ok": False, "error": f"equipe cheia (max {CTF_TEAM_MAX})"}, 409)
                teams[tname]["members"].append(name)
                ctf_save_teams(teams)
                return self.send_json({"ok": True, "team": tname})
            if p == "/api/ctf/team/leave":
                teams = ctf_teams()
                tname = ctf_user_team(name)
                if not tname:
                    return self.send_json({"ok": False, "error": "voce nao esta em equipe"}, 400)
                teams[tname]["members"] = [m for m in teams[tname].get("members", []) if m != name]
                if not teams[tname]["members"]:
                    teams.pop(tname, None)
                else:
                    if teams[tname].get("by") == name:
                        teams[tname]["by"] = teams[tname]["members"][0]
                ctf_save_teams(teams)
                return self.send_json({"ok": True})
            if p == "/api/ctf/team/request":
                tname = (body.get("name") or "").strip()
                teams = ctf_teams()
                if tname not in teams:
                    return self.send_json({"ok": False, "error": "equipe nao encontrada"}, 404)
                if ctf_user_team(name):
                    return self.send_json({"ok": False, "error": "voce ja esta em uma equipe"}, 409)
                if name in teams[tname].get("members", []):
                    return self.send_json({"ok": True, "team": tname})
                if len(teams[tname].get("members", [])) >= CTF_TEAM_MAX:
                    return self.send_json({"ok": False, "error": f"equipe cheia (max {CTF_TEAM_MAX})"}, 409)
                reqs = teams[tname].get("requests", [])
                if any(r.get("user") == name for r in reqs):
                    return self.send_json({"ok": True, "team": tname, "pending": True})
                reqs.append({"user": name, "date": time.strftime("%d/%m/%Y %H:%M")})
                teams[tname]["requests"] = reqs
                ctf_save_teams(teams)
                return self.send_json({"ok": True, "team": tname, "pending": True})
            if p == "/api/ctf/team/cancel":
                tname = (body.get("name") or "").strip()
                teams = ctf_teams()
                if tname not in teams:
                    return self.send_json({"ok": False, "error": "equipe nao encontrada"}, 404)
                reqs = teams[tname].get("requests", [])
                teams[tname]["requests"] = [r for r in reqs if r.get("user") != name]
                ctf_save_teams(teams)
                return self.send_json({"ok": True})
            if p == "/api/ctf/team/accept":
                target = (body.get("user") or "").strip()
                teams = ctf_teams()
                tname = ctf_user_team(name)
                if not tname:
                    return self.send_json({"ok": False, "error": "voce nao esta em equipe"}, 400)
                if teams[tname].get("by") != name:
                    return self.send_json({"ok": False, "error": "so o lider aceita"}, 403)
                if target not in [r.get("user") for r in teams[tname].get("requests", [])]:
                    return self.send_json({"ok": False, "error": "pedido nao encontrado"}, 404)
                if ctf_user_team(target):
                    teams[tname]["requests"] = [r for r in teams[tname].get("requests", []) if r.get("user") != target]
                    ctf_save_teams(teams)
                    return self.send_json({"ok": False, "error": "usuario ja esta em equipe"}, 409)
                if len(teams[tname].get("members", [])) >= CTF_TEAM_MAX:
                    return self.send_json({"ok": False, "error": f"equipe cheia (max {CTF_TEAM_MAX})"}, 409)
                teams[tname]["members"].append(target)
                teams[tname]["requests"] = [r for r in teams[tname].get("requests", []) if r.get("user") != target]
                for tn, t in teams.items():
                    if tn != tname and any(r.get("user") == target for r in t.get("requests", [])):
                        t["requests"] = [r for r in t.get("requests", []) if r.get("user") != target]
                ctf_save_teams(teams)
                return self.send_json({"ok": True, "team": tname, "user": target})
            if p == "/api/ctf/team/refuse":
                target = (body.get("user") or "").strip()
                teams = ctf_teams()
                tname = ctf_user_team(name)
                if not tname:
                    return self.send_json({"ok": False, "error": "voce nao esta em equipe"}, 400)
                if teams[tname].get("by") != name:
                    return self.send_json({"ok": False, "error": "so o lider recusa"}, 403)
                teams[tname]["requests"] = [r for r in teams[tname].get("requests", []) if r.get("user") != target]
                ctf_save_teams(teams)
                return self.send_json({"ok": True, "team": tname, "user": target})
            # ---- admin ----
            if u.get("role") != "admin":
                return self.send_json({"ok": False, "error": "acesso negado"}, 403)
            if p == "/api/ctf/admin/flag":
                t = (body.get("user") or "").strip(); reason = (body.get("reason") or "").strip()[:140]
                if t not in users or not reason:
                    return self.send_json({"ok": False, "error": "usuario/motivo invalido"}, 400)
                arr = [c for c in _jload(CTF_CHEAT_F, []) if c.get("name") != t]
                arr.append({"name": t, "reason": reason, "by": name, "date": time.strftime("%d/%m/%Y %H:%M")})
                _jsave(CTF_CHEAT_F, arr)
                return self.send_json({"ok": True})
            if p == "/api/ctf/admin/unflag":
                t = (body.get("user") or "").strip()
                _jsave(CTF_CHEAT_F, [c for c in _jload(CTF_CHEAT_F, []) if c.get("name") != t])
                return self.send_json({"ok": True})
            if p == "/api/ctf/admin/reset":
                t = (body.get("user") or "").strip()
                if t not in users:
                    return self.send_json({"ok": False, "error": "usuario invalido"}, 400)
                users[t]["solved"] = {}; users[t]["hints"] = {}; users[t]["start"] = int(time.time() * 1000); users[t]["attackStart"] = None; users[t]["activeMs"] = 0; users[t]["lastBeat"] = None; users[t]["frozenMs"] = None; users[t]["phaseMs"] = {}
                _jsave(CTF_USERS_F, users)
                return self.send_json({"ok": True})
            if p == "/api/ctf/admin/delete":
                t = (body.get("user") or "").strip()
                if t not in users or t == name:
                    return self.send_json({"ok": False, "error": "usuario invalido"}, 400)
                users.pop(t, None); _jsave(CTF_USERS_F, users)
                _jsave(CTF_CHEAT_F, [c for c in _jload(CTF_CHEAT_F, []) if c.get("name") != t])
                return self.send_json({"ok": True})
            if p == "/api/ctf/admin/reset_times":
                # zera TEMPOS (pódios de tempo/eficiência/geral por tempo) sem mexer nos pontos
                for n2 in users:
                    users[n2]["activeMs"] = 0; users[n2]["lastBeat"] = None
                    users[n2]["frozenMs"] = None; users[n2]["bestFullTime"] = None
                    users[n2]["phaseMs"] = {}
                _jsave(CTF_USERS_F, users)
                return self.send_json({"ok": True})
            if p == "/api/ctf/admin/teams_clear":
                # apaga TODAS as equipes (pódio de equipes)
                ctf_save_teams({})
                return self.send_json({"ok": True})
            if p == "/api/ctf/admin/reset_all":
                for n2 in users:
                    users[n2]["solved"] = {}; users[n2]["hints"] = {}; users[n2]["start"] = int(time.time() * 1000); users[n2]["attackStart"] = None; users[n2]["activeMs"] = 0; users[n2]["lastBeat"] = None; users[n2]["frozenMs"] = None; users[n2]["phaseMs"] = {}
                _jsave(CTF_USERS_F, users)
                return self.send_json({"ok": True})
            if p == "/api/ctf/admin/role":
                t = (body.get("user") or "").strip()
                if t not in users:
                    return self.send_json({"ok": False, "error": "usuario invalido"}, 400)
                users[t]["role"] = "user" if users[t].get("role") == "admin" else "admin"
                _jsave(CTF_USERS_F, users)
                return self.send_json({"ok": True, "role": users[t]["role"]})
            if p == "/api/ctf/admin/passwd":
                t = (body.get("user") or "").strip()
                if t not in users or t == name:
                    return self.send_json({"ok": False, "error": "usuario invalido"}, 400)
                newpw = "".join(_secrets.choice("abcdefghjkmnpqrstuvwxyz23456789") for _ in range(8))
                users[t]["hash"] = ctf_hash(newpw)
                _jsave(CTF_USERS_F, users)
                return self.send_json({"ok": True, "temp": newpw})
            if p == "/api/ctf/admin/ban":
                t = (body.get("user") or "").strip()
                on = bool(body.get("on", True))
                if t not in users or t == name:
                    return self.send_json({"ok": False, "error": "usuario invalido"}, 400)
                users[t]["banned"] = on
                if on:
                    sess = _jload(CTF_SESS_F, {})
                    for tk in [tk for tk, s in sess.items() if s.get("user") == t]:
                        sess.pop(tk, None)
                    _jsave(CTF_SESS_F, sess)
                _jsave(CTF_USERS_F, users)
                return self.send_json({"ok": True, "banned": on})
            if p == "/api/ctf/admin/team_reset":
                tname = (body.get("team") or "").strip()
                teams = ctf_teams()
                if tname not in teams:
                    return self.send_json({"ok": False, "error": "equipe invalida"}, 400)
                for m in teams[tname].get("members", []):
                    if m in users:
                        users[m]["solved"] = {}; users[m]["hints"] = {}
                        users[m]["start"] = int(time.time() * 1000)
                        users[m]["attackStart"] = None; users[m]["activeMs"] = 0
                        users[m]["lastBeat"] = None; users[m]["frozenMs"] = None
                        users[m]["phaseMs"] = {}
                _jsave(CTF_USERS_F, users)
                return self.send_json({"ok": True})
            if p == "/api/ctf/admin/prints_clear":
                t = (body.get("user") or "").strip()
                if t not in users:
                    return self.send_json({"ok": False, "error": "usuario invalido"}, 400)
                users[t]["prints"] = 0
                users[t]["fine"] = 0
                users[t]["lastPrint"] = ""
                _jsave(CTF_USERS_F, users)
                return self.send_json({"ok": True})
            if p == "/api/ctf/admin/team_times":
                tname = (body.get("team") or "").strip()
                teams = ctf_teams()
                if tname not in teams:
                    return self.send_json({"ok": False, "error": "equipe invalida"}, 400)
                for m in teams[tname].get("members", []):
                    if m in users:
                        users[m]["activeMs"] = 0; users[m]["lastBeat"] = None
                        users[m]["frozenMs"] = None; users[m]["bestFullTime"] = None
                        users[m]["phaseMs"] = {}
                _jsave(CTF_USERS_F, users)
                return self.send_json({"ok": True})
            if p == "/api/ctf/admin/team_delete":
                tname = (body.get("team") or "").strip()
                teams = ctf_teams()
                if tname not in teams:
                    return self.send_json({"ok": False, "error": "equipe invalida"}, 400)
                teams.pop(tname, None); ctf_save_teams(teams)
                return self.send_json({"ok": True})
            if p == "/api/ctf/admin/team_kick":
                tname = (body.get("team") or "").strip(); t = (body.get("user") or "").strip()
                teams = ctf_teams()
                if tname not in teams or t not in teams[tname].get("members", []):
                    return self.send_json({"ok": False, "error": "invalido"}, 400)
                teams[tname]["members"] = [m for m in teams[tname]["members"] if m != t]
                if not teams[tname]["members"]:
                    teams.pop(tname, None)
                ctf_save_teams(teams)
                return self.send_json({"ok": True})
            return self.send_json({"ok": False, "error": "endpoint desconhecido"}, 404)
        except Exception as ex:
            return self.send_json({"ok": False, "error": str(ex)[:200]}, 502)

if __name__ == "__main__":
    print("sherlock:", len(SHERLOCK), "| wmn:", len(WMN))
    print("ctf flags:", len(CTF_FLAGS))
    _port = int(_os.environ.get("PORT", PORT))
    _host = "0.0.0.0" if _os.environ.get("PORT") else "127.0.0.1"
    print(f"CTF-ES online em http://{_host}:{_port}/ctf.html")
    ThreadingHTTPServer((_host, _port), Handler).serve_forever()
