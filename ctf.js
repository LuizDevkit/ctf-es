// ============ CTF-ES — 100 desafios ============
if(typeof T!=="function"){ T=function(k){ return k; }; }
const SITE_V = 16; // bump a cada deploy: zera o visitante automaticamente
try{
  if(localStorage.getItem("ctf_ver")!==String(SITE_V)){
    ["ctf_solved","ctf_hints","ctf_start","ctf_attack","ctf_visActive"].forEach(k=>localStorage.removeItem(k));
    localStorage.setItem("ctf_ver",String(SITE_V));
  }
}catch(e){}
const CHALLENGES = [
{id:1, level:"facil", cat:"Web", pts:100, title:"👻 Comentário Fantasma",
  desc:"Um desenvolvedor descuidado deixou a flag num comentário HTML desta página (arena.html).\nTodo hacker sabe: o código-fonte sempre fala.\n\nObjetivo: encontre a flag sem olhar o modal. ATENÇÃO: cada fase tem sua PRÓPRIA flag — a do console é só do desafio 6!",
 hint:"🔍 Páginas carregam HTML puro: o DevTools mostra tudo, até comentários. 🛠️ Ferramenta: F12 → Elements ou CTRL+U. 👣 Procure comentários <!-- --> no arquivo.",
 flag:"CTF-BR{1nsp3c10n4r_3l3m3nt0}",
  extra:`<div class="live">💡 Dica de ferramenta: no modal não há nada. A flag está no <b>código-fonte real</b> desta página (arena.html, no meio do arquivo).</div><div class="term-btns"><button class="mini" onclick="toast('Pressione CTRL+U para ver o fonte!')">📄 Como ver o fonte?</button></div>`},
{id:2, level:"facil", cat:"Web", pts:100, title:"🤖 Robots Perdidos",
 desc:"Todo site tem um /robots.txt que diz aos robôs onde NÃO olhar.\nAtacantes adoram olhar exatamente lá.\n\nObjetivo: leia o robots.txt vazado abaixo e ache o caminho secreto.",
 hint:"🔍 Robots diz aos robôs onde NÃO olhar — atacante olha exatamente lá. 🛠️ Ferramenta: barra de endereços. 👣 Abra o robots e visite o caminho proibido.",
 flag:"CTF-BR{r0b0ts_n4o_m3nt3m}",
  extra:`<div class="live">User-agent: *<br>Disallow: /admin/<br>Disallow: /segredo.txt<br><br>#ops, commitei a flag no segredo? -- dev<br><br>💡 Navegue até <b>/robots.txt</b> e depois até o arquivo proibido na barra de endereços.</div><div class="term-btns"><button class="mini" onclick="robotsSecret()">📂 Abrir /segredo.txt</button></div><div id="robotsOut"></div>`},
{id:3, level:"facil", cat:"Crypto", pts:120, title:"🔤 Base64 Baby",
 desc:"Interceptamos esta mensagem do inimigo:\n\nQ1RGLUJSe2I0czNfNjRfM19tNG00b30=\n\nParece Base64. Decodifique e capture a flag.",
 hint:"🔍 Texto com = no fim e alfabeto A-Z,a-z,0-9,+,/ é Base64. 🛠️ Tipo: decodificador Base64 (CyberChef, python base64 ou atob() no console). 👣 Decodifique e leia.",
 flag:"CTF-BR{b4s3_64_3_m4m4o}",
 extra:`<div class="live">Alvo: <b>Q1RGLUJSe2I0czNfNjRfM19tNG00b30=</b></div><div class="term-btns"><button class="mini" onclick="decB64('Q1RGLUJSe2I0czNfNjRfM19tNG00b30=','b64out')">🔓 Decodificar agora</button></div><div id="b64out"></div>`},
{id:4, level:"facil", cat:"Crypto", pts:120, title:"🏛️ Cifra de César",
 desc:"Júlio César criptografava mensagens deslocando letras.\nInterceptamos:\n\nJAM-IY{j4lz4y_c1c3}\n\nDescubra o deslocamento (shift) e recupere a flag.",
 hint:"🔍 Letras trocadas por outras = substituição simples. 🛠️ Tipo: quebrador de César (dCode, CyberChef ou manual). 👣 Ache o turno que forma palavras.",
 flag:"CTF-BR{c4es4r_v1v3}",
 extra:`<div class="live">Cifrado: <b>JAM-IY{j4lz4y_c1c3}</b> — shift desconhecido (1-25)</div><div style="margin-top:8px">Shift: <input id="caesarShift" type="number" value="7" min="1" max="25" style="width:80px"> <button class="mini" onclick="decCaesar()">🔓 Decodificar</button></div><div id="caesarOut"></div>`},
{id:5, level:"facil", cat:"Web", pts:150, title:"🍪 Cookie da Sorte",
 desc:"O servidor escondeu a flag num cookie chamado 'flag'.\n\nObjetivo: abra o DevTools → Application → Cookies, ou use o botão abaixo.",
 hint:"🔍 Sites guardam dados no seu navegador (cookies). 🛠️ Ferramenta: DevTools → Application → Cookies. 👣 Liste e leia.",
 flag:"CTF-BR{c00k1e_m0nst3r}",
 extra:`<div class="live">🍪 Um cookie chamado <b>flag</b> foi plantado neste site. Ele está no seu navegador AGORA.</div><div class="term-btns"><button class="mini" onclick="showCookies()">🍪 Mostrar meus cookies</button></div><div id="cookieOut"></div>`},
{id:6, level:"facil", cat:"Misc", pts:150, title:"🖥️ Console Perdido",
 desc:"O dev debugou a flag no console e esqueceu de remover.\n\nObjetivo: aperte F12 → aba Console e leia a mensagem secreta.",
 hint:"🔍 Devs esquecem debug no console. 🛠️ Ferramenta: F12 → Console. 👣 Leia TODAS as mensagens, inclusive antigas.",
 flag:"CTF-BR{c0ns0l3_h4ck3r}",
 extra:`<div class="live">O console do navegador (F12) tem uma mensagem esperando por você...</div><div class="term-btns"><button class="mini" onclick="toast('Aperte F12 → Console. A flag já foi impressa lá!');console.log('%c🚩 '+CHALLENGES[5].flag+' %c(parabéns, console hacker!)','background:#00ff88;color:#000;font-size:16px','color:#00ff88')">🖥️ Reimprimir no console</button></div>`},
{id:7, level:"facil", cat:"OSINT", pts:150, title:"🧭 Headers Falantes",
 desc:"Servidores HTTP enviam cabeçalhos invisíveis. Um deles vaza a flag.\n\nObjetivo: acesse /pista-headers e inspecione os cabeçalhos REAIS da resposta (o exemplo abaixo NÃO tem a flag).",
 hint:"🔍 HTTP manda cabeçalhos invisíveis além do corpo. 🛠️ Ferramenta: F12 → Network → Headers, ou curl -i. 👣 Inspecione a resposta.",
 flag:"CTF-BR{h34d3rs_f4l4m}",
 extra:`<div class="live">Exemplo (SEM a flag):<br>HTTP/1.1 200 OK<br>Server: nginx/1.24<br>Content-Type: text/html<br>X-Powered-By: PHP/8.2<br>Set-Cookie: sess=abc123<br><br>...falta um cabeçalho aqui. O servidor real esconde um <b>X-Flag</b> na resposta de <b>/pista-headers</b>.</div><div class="term-btns"><button class="mini" onclick="window.open('pista-headers','_blank')">🌐 Abrir /pista-headers</button><button class="mini" onclick="showUA()">🧭 Ver meu User-Agent real</button></div><div id="uaOut"></div><div class="live">Como ver: F12 → <b>Network</b> → recarregue → clique na requisição → <b>Headers</b>. No terminal: <b>curl -i pista-headers</b></div>`},
{id:8, level:"medio", cat:"Web", pts:200, title:"💉 Login Bypass (SQLi)",
 desc:"Painel admin vulnerável a SQL Injection clássica.\nCódigo: SELECT * FROM users WHERE user='$u' AND pass='$p'\n\nObjetivo: faça login como admin SEM saber a senha.",
 hint:"🔍 Login que monta SQL com seu texto é injetável. 🛠️ Ferramenta: o próprio campo + lógica. 👣 Feche as aspas e torne a condição sempre verdadeira.",
 flag:"CTF-BR{sql1_byp4ss_m4st3r}",
 extra:`<div class="live">🔐 Painel Admin Simulado</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px"><input id="sqliU" placeholder="usuário" value="admin"><input id="sqliP" placeholder="senha" type="password" value="123"><button class="mini" onclick="sqliLogin()">Entrar</button></div><div id="sqliOut"></div>`},
{id:9, level:"medio", cat:"Web", pts:200, title:"🗝️ Cofre LocalStorage",
 desc:"O front-end dividiu a flag em 2 chaves do LocalStorage para 'proteger'.\n\nObjetivo: junte as duas metades no DevTools → Application → Local Storage.",
 hint:"🔍 Front-end guarda segredos no LocalStorage. 🛠️ Ferramenta: DevTools → Application → Local Storage. 👣 Liste as chaves e junte.",
 flag:"CTF-BR{l0c4l_st0r4g3_v4ult}",
 extra:`<div class="live">🔎 Duas chaves foram plantadas no seu LocalStorage. Encontre e concatene.</div><div class="term-btns"><button class="mini" onclick="showLocalParts()">🗝️ Mostrar partes (trapacear)</button></div><div id="lsOut"></div>`},
{id:10, level:"medio", cat:"Crypto", pts:250, title:"🔨 Hash Crack",
 desc:"Vazou o hash MD5 da senha do admin:\n\n8621ffdbc5698829397d97767ac13db3\n\nA senha é uma palavra comum de 6 letras. Quebre e use-a para libertar a flag.",
 hint:"🔍 Hash não reverte — mas senhas comuns estão em listas públicas. 🛠️ Ferramenta: crackstation.net ou wordlist rockyou. 👣 Teste candidatos.",
 flag:"CTF-BR{h4sh_br3ak3r}",
 extra:`<div class="live">Hash alvo (MD5): <b>8621ffdbc5698829397d97767ac13db3</b></div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="hashWord" placeholder="senha candidata"><button class="mini" onclick="crackHash()">🔨 Testar hash</button><button class="mini" onclick="bruteHash()">⚡ Força bruta (wordlist)</button></div><div id="hashOut"></div>`},
{id:11, level:"medio", cat:"Web", pts:250, title:"🎫 JWT Forjado",
 desc:"O site usa JWT com alg=none (aceita token SEM assinatura!).\nToken de guest:\n\neyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VyIjoiZ3Vlc3QiLCJhZG1pbiI6ZmFsc2V9.\n\nObjetivo: forge um token com \"admin\":true e acesse /admin.",
 hint:"🔍 JWT tem 3 partes; 'alg:none' dispensa assinatura. 🛠️ Tipo: inspetor JWT (jwt.io ou base64 manual). 👣 Decodifique o payload e entenda cada campo.",
 flag:"CTF-BR{jwt_n0n3_4lg}",
 extra:`<div class="live">Payload guest: {"user":"guest","admin":false}</div><div class="term-btns"><button class="mini" onclick="decodeJWT()">🔍 Decodificar guest</button><button class="mini" onclick="forgeJWT()">🛠️ Forjar token ADMIN</button></div><div id="jwtOut"></div>`},
{id:12, level:"medio", cat:"Forense", pts:250, title:"📸 Metadados Vazados",
 desc:"Uma foto do suspeito vazou. Os metadados EXIF escondem a flag.\n\nObjetivo: baixe a foto e extraia o EXIF (ExifTool, site exif.tools ou F12 não mostra — tem que ser ferramenta de metadados).",
 hint:"🔍 Fotos carregam EXIF (câmera, GPS, comentários). 🛠️ Tipo: leitor de metadados (ExifTool, exif.tools ou propriedades do arquivo). 👣 Extraia todos os metadados.",
 flag:"CTF-BR{m3t4d4t4_l34k}",
  extra:`<img src="suspeito.jpg" alt="foto do suspeito" style="width:100%;border-radius:12px;border:1px solid var(--line)"><div class="term-btns"><a class="mini" href="suspeito.jpg" download="suspeito.jpg">⬇ Baixar suspeito.jpg</a><a class="mini" href="https://exif.tools/" target="_blank" rel="noopener">🔍 Abrir exif.tools ↗</a></div><div class="live">Arquivo real com EXIF de verdade (Canon EOS R5, GPS São Paulo). A flag está num campo de texto dos metadados — F12 <b>não</b> mostra, use ferramenta EXIF.</div>`},
{id:13, level:"medio", cat:"Reverso", pts:300, title:"🌀 JS Ofuscado",
 desc:"O inimigo ofuscou a flag com String.fromCharCode:\n\n[67,84,70,45,66,82,123,106,52,118,52,115,99,114,49,112,116,95,114,51,118,51,114,115,51,125]\n\nObjetivo: desofusque no console ou com o botão.",
 hint:"🔍 Números viram letras pela tabela ASCII. 🛠️ Tipo: conversor decimal→ASCII (console, CyberChef ou tabela ASCII). 👣 Converta a lista.",
 flag:"CTF-BR{j4v4scr1pt_r3v3rs3}",
 extra:`<div class="live">Código: <b>String.fromCharCode(67,84,70,45,66,82,123,...)</b> — 26 números.</div><div class="term-btns"><button class="mini" onclick="deobf()">🌀 Desofuscar</button></div><div id="obfOut"></div>`},
{id:14, level:"medio", cat:"Stego", pts:300, title:"🖼️ PNG Mágico",
 desc:"Todo PNG começa com os bytes mágicos 89 50 4E 47. Este PNG foi corrompido — e a flag está no dump hexadecimal, em ASCII.\n\nObjetivo: converta o hex final para texto.",
 hint:"🔍 Arquivos têm trechos legíveis em ASCII. 🛠️ Tipo: conversor hex→ASCII (CyberChef, python ou manual). 👣 Converta o fim do dump.",
 flag:"CTF-BR{png_m4g1c_by7es}",
 extra:`<div class="live">89 50 4E 47 0D 0A 1A 0A 00 00 00 0D 49 48 44 52 ...<br>43 54 46 2D 42 52 7B 70 6E 67 5F 6D 34 67 31 63 5F 62 79 37 65 73 7D</div><div class="term-btns"><button class="mini" onclick="hexToAscii()">🔄 Hex → ASCII</button></div><div id="hexOut"></div>`},
{id:15, level:"avancado", cat:"Crypto", pts:400, title:"🔐 Vigenère Resistente",
 desc:"Mensagem cifrada com Vigenère, chave de 5 letras (dica: CHAVE em português):\n\nEAF-WV{x1n3n3m3_v3u1zt3}\n\nObjetivo: descubra a chave e decifre.",
 hint:"🔍 Letras deslocadas por chave repetida = Vigenère. 🛠️ Tipo: quebrador de Vigenère (dCode, CyberChef ou manual). 👣 Descubra a palavra-chave testando.",
 flag:"CTF-BR{v1g3n3r3_r3s1st3}",
 extra:`<div class="live">Cifrado: <b>EAF-WV{x1n3n3m3_v3u1zt3}</b> — chave: 5 letras</div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="vigKey" placeholder="chave" value="CHAVE"><button class="mini" onclick="decVig()">🔓 Decifrar Vigenère</button></div><div id="vigOut"></div>`},
{id:16, level:"avancado", cat:"Reverso", pts:450, title:"⚙️ Crackme JS",
 desc:"Este binário JS só libera a flag com a senha correta.\n\nfunction check(s){ return s.length==9 && s[0]=='1' && s.slice(4)=='h4x0r' && s.split('').reduce((a,c)=>a+c.charCodeAt(0),0)==719; }\n\nObjetivo: faça engenharia reversa e ache a senha.",
 hint:"🔍 Crackme = leia o check() como receita e deduza a senha. 🛠️ Ferramenta: leitura de código + console. 👣 Satisfaça tamanho, prefixo e soma.",
 flag:"CTF-BR{cr4ckm3_m4st3r_1337}",
 extra:`<div class="live">🔒 Crackme carregado. Descubra a senha de 9 chars.</div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="crackIn" placeholder="senha do crackme"><button class="mini" onclick="crackMe()">⚙️ Executar check()</button></div><div id="crackOut"></div>`},
{id:17, level:"avancado", cat:"Web", pts:500, title:"📁 Path Traversal",
 desc:"O servidor concatena input sem sanitizar: open('./arquivos/' + input)\n\nObjetivo: saia do diretório e leia /etc/flag.txt",
 hint:"🔍 '../' sobe diretório; servidor que concatena caminho vaza arquivos. 🛠️ Ferramenta: campo de entrada. 👣 Suba até o arquivo alvo.",
 flag:"CTF-BR{p4th_tr4v3rs4l_r00t}",
 extra:`<div class="live">📁 Servidor: <b>open('./arquivos/' + SUA_ENTRADA)</b></div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="travIn" placeholder="../../etc/flag.txt" style="flex:1;min-width:180px"><button class="mini" onclick="traversal()">📂 Ler arquivo</button></div><div id="travOut"></div>`},
{id:18, level:"avancado", cat:"Forense", pts:400, title:"🔎 Strings Ocultas",
 desc:"Dump de memória de 2KB. A flag está em Base64 no meio do lixo:\n\nxx#@!Q1RGLUJSe2YwcjNuczFjX3N0cjFuZ3N9!!zz00\n\nObjetivo: extraia strings e decodifique.",
 hint:"🔍 Binários têm strings legíveis + trechos codificados. 🛠️ Ferramenta: strings + CyberChef. 👣 Filtre o legível e decodifique.",
 flag:"CTF-BR{f0r3ns1c_str1ngs}",
 extra:`<div class="live">\\x00\\xff\\x89 opTQ \\x01 ... Q1RGLUJSe2YwcjNuczFjX3N0cjFuZ3N9 ... \\xde\\xad\\xbe\\xef<br>Comando real: <b>strings dump.bin | grep CTF</b></div><div class="term-btns"><button class="mini" onclick="decB64('Q1RGLUJSe2YwcjNuczFjX3N0cjFuZ3N9','stringsOut')">🔍 Extrair strings + decode</button></div><div id="stringsOut"></div>`},
{id:19, level:"avancado", cat:"Crypto", pts:500, title:"🔢 RSA Baby",
 desc:"RSA com módulo pequeno (fatorável!):\n\nn = 2537 (p×q pequenos), e = 13, c = 98\nA mensagem m = 2024 é um ano. Flag = CTF-BR{rs4_<m>_br0k3n}\n\nObjetivo: fatore n, ache d e decifre.",
 hint:"🔍 RSA com módulo pequeno é fatorável. 🛠️ Tipo: fatoração (factordb, python ou manual). 👣 Fatore n, calcule phi, d e a mensagem.",
 flag:"CTF-BR{rs4_2024_br0k3n}",
 extra:`<div class="live">n=2537, e=13, c=98<br>p×q = ? (dica: ambos &lt; 100)</div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="rsaM" placeholder="m decifrado (ex: 2024)"><button class="mini" onclick="checkRSA()">🔢 Verificar m</button><button class="mini" onclick="factorN()">🧮 Fatorar n</button></div><div id="rsaOut"></div>`},
{id:20, level:"avancado", cat:"Misc", pts:500, title:"👑 FINAL BOSS Multi-Stage",
 desc:"O Boss protege a flag em 3 camadas:\n\n1) Base64 decode\n2) ROT13 decode\n3) Reverse string\n\nPacote do Boss:\n\nfWZmMG9feTRhMXNfYTAxY3o0dXBfc2dwe0VPLVNHUA==\n\nObjetivo: descasque as 3 camadas nesta ordem.",
 hint:"🔍 Camadas: identifique cada encoding pelo formato e descasque na ordem. 🛠️ Tipo: decodificadores em cadeia (CyberChef, python ou manual). 👣 Uma camada por vez.",
 flag:"CTF-BR{ctf_ch4mp10n_f1n4l_b0ss}",
  extra:`<div class="live">👑 Boss: <b>fWZmMG9feTRhMXNfYTAxY3o0dXBfc2dwe0VPLVNHUA==</b></div><div class="term-btns"><button class="mini" onclick="bossStep(1)">1️⃣ Base64 decode</button><button class="mini" onclick="bossStep(2)">2️⃣ ROT13</button><button class="mini" onclick="bossStep(3)">3️⃣ Reverse → FLAG</button></div><div id="bossOut"></div>`},
{id:21, level:"facil", cat:"Web", pts:100, title:"📦 .git Exposto",
 desc:"O deploy subiu a pasta .git para produção. Qualquer um pode ler o histórico.\n\nObjetivo: ache a flag no dump do git abaixo.",
 hint:"🔍 Pasta .git exposta = histórico público. 🛠️ Ferramenta: git log/show. 👣 Commits antigos guardam o 'apagado'.",
 flag:"CTF-BR{g1t_3xp0s3d_h34d}",
 extra:`<div class="live">$ git log --oneline<br>a3f9c1e fix login (HEAD)<br>77b2d0a update readme<br>e51aa07 <b>remove flag CTF-BR{g1t_3xp0s3d_h34d} do código</b> (ops, ficou no histórico!)<br><br>$ cat .git/HEAD → ref: refs/heads/main</div>`},
{id:22, level:"facil", cat:"Misc", pts:120, title:"🔢 Cofre PIN 4 dígitos",
 desc:"Um cofre com PIN de 0000 a 9999. O dono ama futebol: a dica é 'ano da Copa no Brasil + 12'.\n\nObjetivo: abra o cofre.",
 hint:"🔍 PIN curto = espaço pequeno: lógica ou força bruta. 🛠️ Ferramenta: datas importantes ou script. 👣 Reduza as hipóteses.",
 flag:"CTF-BR{p1n_c0d3_2026}",
 extra:`<div class="live">🔐 Cofre digital — 4 dígitos (força bruta ou lógica, você escolhe)</div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="pinIn" placeholder="0000" maxlength="4" style="width:100px"><button class="mini" onclick="checkPin()">🔓 Tentar PIN</button></div><div id="pinOut"></div>`},
{id:23, level:"facil", cat:"Crypto", pts:130, title:"📻 Código Morse",
 desc:"Sinal de rádio interceptado:\n\n-- --- .-. ... .\n\nObjetivo: traduza o morse e monte a flag CTF-BR{resposta_em_minúsculo_com_0_no_lugar_do_o}.",
 hint:"🔍 Pontos e traços = código Morse. 🛠️ Tipo: tradutor Morse (tabela, dCode ou manual). 👣 Traduza letra a letra e monte a flag.",
 flag:"CTF-BR{m0rs3_c0d3}",
 extra:`<div class="live">📻 Frequência 7.043 MHz: <b>-- --- .-. ... .</b><br>Tabela: A .- B -... C -.-. D -.. E . F ..-. G --. H .... I .. J .--- K -.- L .-.. M -- N -. O --- P .--. Q --.- R .-. S ... T - U ..- V ...- W .-- X -..- Y -.-- Z --..</div><div class="term-btns"><button class="mini" onclick="decMorse()">🔓 Decodificar morse</button></div><div id="morseOut"></div>`},
{id:24, level:"medio", cat:"Web", pts:220, title:"💬 XSS Refletido",
 desc:"O campo de busca reflete seu nome sem filtrar nada. Clássico XSS.\n\nObjetivo: injete um &lt;script&gt; e o sistema cospe a flag.",
 hint:"🔍 Texto refletido sem filtro aceita tags. 🛠️ Ferramenta: o próprio campo. 👣 Feche o contexto e injete script.",
 flag:"CTF-BR{xss_r3fl3ct3d}",
 extra:`<div class="live">🔍 Busca do site: <i>"Olá, visitante!"</i></div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="xssIn" placeholder="seu nome" style="flex:1;min-width:150px"><button class="mini" onclick="xssTest()">Buscar</button></div><div id="xssOut"></div>`},
{id:25, level:"medio", cat:"Crypto", pts:260, title:"🔄 Atbash Milenar",
 desc:"Cifra hebraica antiga: A vira Z, B vira Y... (alfabeto espelhado).\n\nXGU-YI{4gy4hs_n4hg3i}\n\nObjetivo: espelhe de volta.",
 hint:"🔍 Alfabeto espelhado (A↔Z) = Atbash. 🛠️ Tipo: espelhador Atbash (dCode ou manual). 👣 Inverta cada letra.",
 flag:"CTF-BR{4tb4sh_m4st3r}",
 extra:`<div class="live">Cifrado: <b>XGU-YI{4gy4hs_n4hg3i}</b> (Atbash)</div><div class="term-btns"><button class="mini" onclick="decAtbash()">🔓 Espelhar (Atbash)</button></div><div id="atbashOut"></div>`},
{id:26, level:"medio", cat:"Forense", pts:260, title:"📋 Caça no Log Apache",
 desc:"2 mil linhas de access.log. Uma requisição suspeita esconde a flag.\n\nObjetivo: ache a linha do invasor.",
 hint:"🔍 Logs registram tudo, inclusive ataques. 🛠️ Ferramenta: grep / Ctrl+F. 👣 Busque padrões suspeitos.",
 flag:"CTF-BR{l0g_hunt3r_4p4ch3}",
 extra:`<div class="live">192.168.0.10 - - [14/Mar/2026] "GET /index.html HTTP/1.1" 200<br>192.168.0.11 - - [14/Mar/2026] "GET /css/site.css HTTP/1.1" 200<br>10.9.8.7 - - [14/Mar/2026] "GET /admin?debug=CTF-BR{l0g_hunt3r_4p4ch3} HTTP/1.1" 200<br>192.168.0.12 - - [14/Mar/2026] "GET /favicon.ico HTTP/1.1" 404</div><div class="term-btns"><button class="mini" onclick="grepLog()">🔍 grep CTF access.log</button></div><div id="logOut"></div>`},
{id:27, level:"medio", cat:"Web", pts:240, title:"🔤 Base32 Duro",
 desc:"O primo chato do Base64 (só maiúsculas + números 2-7):\n\nINKEMLKCKJ5WENDTGNPTGMS7OIYGG23TPU======\n\nObjetivo: decodifique.",
 hint:"🔍 Maiúsculas+números com '=' no fim = Base32. 🛠️ Tipo: decodificador Base32 (CyberChef, python ou manual). 👣 Decodifique.",
 flag:"CTF-BR{b4s3_32_r0cks}",
 extra:`<div class="live">Alvo: <b>INKEMLKCKJ5WENDTGNPTGMS7OIYGG23TPU======</b></div><div class="term-btns"><button class="mini" onclick="decB32()">🔓 Decodificar Base32</button></div><div id="b32Out"></div>`},
{id:28, level:"avancado", cat:"Crypto", pts:420, title:"❌ XOR Byte Único",
 desc:"Flag cifrada com XOR de 1 byte (chave 0-255):\n\n01 16 04 6f 00 10 39 3a 72 30 1d 29 71 3b 1d 76 70 3f\n\nObjetivo: ache a chave (dica: começa com CTF-BR{, então o 1º byte ^ 'C' = chave).",
 hint:"🔍 XOR de 1 byte: adivinhe 1 letra original e derive a chave. 🛠️ Ferramenta: python com operador ^. 👣 Use o início conhecido.",
 flag:"CTF-BR{x0r_k3y_42}",
 extra:`<div class="live">Cipher: <b>01 16 04 6f 00 10 39 3a 72 30 1d 29 71 3b 1d 76 70 3f</b> (XOR 1 byte)</div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="xorKey" placeholder="chave (0-255)" style="width:130px"><button class="mini" onclick="decXor()">🔓 XOR decode</button></div><div id="xorOut"></div>`},
{id:29, level:"avancado", cat:"Web", pts:480, title:"🧪 SSTI — Template Injection",
 desc:"O servidor renderiza seu input como template Jinja2: render_template_string('Olá ' + input)\n\nObjetivo: faça o servidor calcular 7*7 e vazar a flag.",
 hint:"🔍 Chaves duplas executadas = template injection. 🛠️ Ferramenta: o próprio campo. 👣 Faça o servidor calcular e observe.",
 flag:"CTF-BR{sst1_7x7_49}",
 extra:`<div class="live">🧪 Template: <b>'Olá ' + SUA_ENTRADA</b> (Jinja2, sem sandbox)</div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="sstiIn" placeholder="{{7*7}}" style="flex:1;min-width:150px"><button class="mini" onclick="sstiTest()">Renderizar</button></div><div id="sstiOut"></div>`},
{id:30, level:"avancado", cat:"Misc", pts:500, title:"👑 BOSS ES Supremo",
 desc:"O reitor cifrou a flag em 3 camadas (ordem inversa para resolver):\n\n1) Hex → ASCII\n2) César -5 (voltar 5 letras)\n3) Reverse string\n\nPacote:\n\n7d 78 78 30 67 5f 71 34 73 31 6b 5f 34 78 33 34 6b 7b 57 47 2d 4b 59 48\n\nObjetivo: descasque tudo.",
 hint:"🔍 Múltiplas camadas: hex, deslocamento e reverso. 🛠️ Ferramenta: CyberChef em cadeia. 👣 De fora para dentro.",
 flag:"CTF-BR{f43s4_f1n4l_b0ss}",
  extra:`<div class="live">👑 <b>7d 78 78 30 67 5f 71 34 73 31 6b 5f 34 78 33 34 6b 7b 57 47 2d 4b 59 48</b></div><div class="term-btns"><button class="mini" onclick="faesaStep(1)">1️⃣ Hex→ASCII</button><button class="mini" onclick="faesaStep(2)">2️⃣ César -5</button><button class="mini" onclick="faesaStep(3)">3️⃣ Reverse → FLAG</button></div><div id="faesaOut"></div>`},
{id:31, level:"facil", cat:"Web", pts:100, title:"🗺️ Sitemap Secreto",
 desc:"O sitemap.xml lista todas as páginas para o Google — inclusive as que deviam ficar escondidas.\n\nObjetivo: ache a URL com a flag.",
 hint:"🔍 Sitemap lista tudo, até o escondido. 🛠️ Ferramenta: barra de endereços. 👣 Visite a URL estranha.",
 flag:"CTF-BR{s1t3m4p_s3cr3t}",
 extra:`<div class="live">&lt;urlset&gt;<br>&lt;url&gt;&lt;loc&gt;/index.html&lt;/loc&gt;&lt;/url&gt;<br>&lt;url&gt;&lt;loc&gt;/sobre.html&lt;/loc&gt;&lt;/url&gt;<br>&lt;url&gt;&lt;loc&gt;/contato.html&lt;/loc&gt;&lt;/url&gt;<br>&lt;url&gt;&lt;loc&gt;/flag-s3cr3t4.html — CTF-BR{s1t3m4p_s3cr3t}&lt;/loc&gt;&lt;/url&gt;<br>&lt;/urlset&gt;</div>`},
{id:32, level:"facil", cat:"Crypto", pts:130, title:"🔁 ROT13 Bebê",
 desc:"O fórum antigo 'criptografava' spoilers com ROT13 (troca cada letra pela 13ª seguinte).\n\nPGS-OE{e0g13_o4ol}\n\nObjetivo: desroteie.",
 hint:"🔍 ROT13 troca pela 13ª letra seguinte (simétrico). 🛠️ Ferramenta: dCode ROT13. 👣 Aplique e leia.",
 flag:"CTF-BR{r0t13_b4by}",
 extra:`<div class="live">Cifrado: <b>PGS-OE{e0g13_o4ol}</b> (ROT13)</div><div class="term-btns"><button class="mini" onclick="decROT()">🔓 Aplicar ROT13</button></div><div id="rotOut"></div>`},
{id:33, level:"facil", cat:"Misc", pts:120, title:"👆 Spam de Clique",
 desc:"Um botão misterioso. Lendas dizem que 15 cliques abrem o cofre.\n\nObjetivo: clique. Muito.",
 hint:"🔍 Desafio de repetição: insista ou automatize. 🛠️ Ferramenta: cliques ou loop no console. 👣 Até abrir.",
 flag:"CTF-BR{cl1ck_sp4m}",
 extra:`<div class="live">🔘 Cofre de cliques: <b id="clickN">0</b>/15</div><div class="term-btns"><button class="mini" onclick="clickSpam()">👆 CLICAR</button></div><div id="clickOut"></div>`},
{id:34, level:"medio", cat:"OSINT", pts:240, title:"🐙 Commit Vazado",
 desc:"Um dev commitou a chave da API e tentou apagar com outro commit. O Git nunca esquece.\n\nObjetivo: ache o segredo no histórico abaixo.",
 hint:"🔍 Git mostra o removido com -/+. 🛠️ Ferramenta: git show. 👣 Leia as linhas com menos (-).",
 flag:"CTF-BR{d0rk_g1thub}",
 extra:`<div class="live">$ git show e51aa07<br>-API_KEY="CTF-BR{d0rk_g1thub}"<br>+API_KEY="***REMOVED***"<br><br>$ git show a3f9c1e (fix login) — nada útil</div>`},
{id:35, level:"medio", cat:"Stego", pts:280, title:"0️⃣1️⃣ Binário Suspeito",
 desc:"Um arquivo .bin com cara de lixo. Mas lixo não tem padrão...\n\n01000110 01000001 01000101 01010011 01000001\n\nObjetivo: bits → letras, letras → flag CTF-BR{palavra_em_minúsculo_trocando_o_por_0}.",
 hint:"🔍 0 e 1 em grupos de 8 = ASCII. 🛠️ Tipo: conversor binário→texto (CyberChef, python ou manual). 👣 Converta grupo a grupo.",
 flag:"CTF-BR{b1n4ry_f43s4}",
 extra:`<div class="live">Dump: <b>01000110 01000001 01000101 01010011 01000001</b></div><div class="term-btns"><button class="mini" onclick="decBinary()">🔓 Bits → texto</button></div><div id="binOut"></div>`},
{id:36, level:"medio", cat:"Crypto", pts:270, title:"🚂 Cerca de Trilhos",
 desc:"Cifra Rail Fence com 3 trilhos: escreve em zigue-zague e lê por linha.\n\nCB4f3T-Rr1_3c}F{ln\n\nObjetivo: desembaralhe.",
 hint:"🔍 Escrita em zigue-zague = Rail Fence. 🛠️ Tipo: Rail Fence (dCode ou papel). 👣 Reconstrua o padrão.",
 flag:"CTF-BR{r41l_f3nc3}",
 extra:`<div class="live">Cifrado (3 trilhos): <b>CB4f3T-Rr1_3c}F{ln</b></div><div class="term-btns"><button class="mini" onclick="decRail()">🔓 Desembaralhar</button></div><div id="railOut"></div>`},
{id:37, level:"medio", cat:"Web", pts:230, title:"↪️ Redirect Aberto",
 desc:"O login redireciona para ?next=. Sem validação, dá para mandar a vítima para qualquer lugar (phishing!).\n\nObjetivo: prove o redirect aberto apontando para fora e capture a flag.",
 hint:"🔍 Redirect com destino seu = phishing. 🛠️ Ferramenta: o campo. 👣 Aponte para fora do site.",
 flag:"CTF-BR{0p3n_r3d1r3ct}",
 extra:`<div class="live">🔗 Login: <b>/login?next=/painel</b> (sem validação!)</div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="redirIn" placeholder="/painel" style="flex:1;min-width:150px"><button class="mini" onclick="redirectTest()">Redirecionar</button></div><div id="redirOut"></div>`},
{id:38, level:"avancado", cat:"Web", pts:470, title:"📄 XXE — Entidade Externa",
 desc:"O upload de XML processa entidades externas (DOCTYPE proibido em produção!).\n\nObjetivo: use &lt;!ENTITY&gt; para ler /etc/flag.txt.",
 hint:"🔍 XML com ENTITY externa lê arquivos (XXE). 🛠️ Ferramenta: DOCTYPE no campo. 👣 Declare e use a entidade.",
 flag:"CTF-BR{xx3_3nt1ty}",
 extra:`<div class="live">📤 Upload XML: <b>parser sem sandbox</b> (libxml2 antigo)</div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="xxeIn" placeholder="<data>oi</data>" style="flex:1;min-width:150px"><button class="mini" onclick="xxeTest()">Enviar XML</button></div><div id="xxeOut"></div>`},
{id:39, level:"avancado", cat:"Crypto", pts:460, title:"₿ Base58 Bitcoin",
 desc:"O alfabeto do Bitcoin (sem 0, O, I, l para não confundir):\n\n598ZE316J5dY3Q7H3JUwXrqYXD9SL\n\nObjetivo: decodifique.",
 hint:"🔍 Alfabeto sem 0/O/I/l = Base58. 🛠️ Tipo: decoder online, python ou manual. 👣 Decodifique.",
 flag:"CTF-BR{b4s3_58_ch3ck}",
 extra:`<div class="live">Alvo: <b>598ZE316J5dY3Q7H3JUwXrqYXD9SL</b> (Base58)</div><div class="term-btns"><button class="mini" onclick="decB58()">🔓 Decodificar Base58</button></div><div id="b58Out"></div>`},
{id:40, level:"avancado", cat:"Misc", pts:500, title:"👑 BOSS ES v2",
 desc:"O reitor dobrou a aposta, 3 camadas novas (ordem para resolver):\n\n1) Reverse string\n2) Base32 decode\n3) ROT13 decode\n\nPacote:\n\n======UPSJ26FTZMQZ36F2YMTBNGX5VIPKLGVDBK\n\nObjetivo: triture o boss.",
 hint:"🔍 Desfaça na ordem inversa, uma camada por vez. 🛠️ Ferramenta: CyberChef em cadeia. 👣 Reverse, decode, decode.",
 flag:"CTF-BR{f43s4_b0ss_v2}",
  extra:`<div class="live">👑 <b>======UPSJ26FTZMQZ36F2YMTBNGX5VIPKLGVDBK</b></div><div class="term-btns"><button class="mini" onclick="boss2Step(1)">1️⃣ Reverse</button><button class="mini" onclick="boss2Step(2)">2️⃣ Base32</button><button class="mini" onclick="boss2Step(3)">3️⃣ ROT13 → FLAG</button></div><div id="boss2Out"></div>`},
{id:41, level:"facil", cat:"Web", pts:110, title:"💾 Backup Esquecido",
 desc:"Devs esquecem arquivos .bak no servidor — e backup tem TUDO.\n\nObjetivo: ache o backup e leia a chave de debug.",
 hint:"🔍 Deploys esquecem cópias .bak com segredos. 🛠️ Ferramenta: barra de endereços + nomes comuns. 👣 Tente extensões de backup.",
 flag:"CTF-BR{b4ckup_b4k}",
 extra:`<div class="live">📁 Pasta pública do site: index.html, app.js, ctf.js ... e tem um <b>.bak</b> perdido aí.</div><div class="term-btns"><button class="mini" onclick="window.open('backup.bak','_blank')">📂 Abrir backup.bak</button></div>`},
{id:42, level:"facil", cat:"Web", pts:110, title:"🕵️ User-Agent VIP",
 desc:"A área VIP só abre para o 'navegador CTF-ES' (lê seu User-Agent).\n\nObjetivo: falsifique seu User-Agent e entre em /area-vip.",
 hint:"🔍 Servidor que confia em User-Agent: finja ser outro. 🛠️ Ferramenta: curl -A ou ModHeader. 👣 Troque seu UA.",
 flag:"CTF-BR{us3r_4g3nt_sp00f}",
 extra:`<div class="live">🔒 GET /area-vip → <b>403 Bloqueado</b> para o seu navegador atual.</div><div class="term-btns"><button class="mini" onclick="window.open('area-vip','_blank')">🌐 Tentar /area-vip</button></div>`},
{id:43, level:"facil", cat:"Web", pts:110, title:"📜 Segredo no JS",
 desc:"Todo JS do site baixa para o seu navegador — incluindo comentários esquecidos.\n\nObjetivo: ache a flag no arquivo app-fake.js.",
 hint:"🔍 JS baixa inteiro, com comentários. 🛠️ Ferramenta: F12 → Sources ou abrir o .js. 👣 Leia o arquivo.",
 flag:"CTF-BR{j4v4scr1pt_s3cr3t}",
 extra:`<div class="live">📦 O site carrega <b>/app-fake.js</b> (bundle de produção, 3 linhas).</div><div class="term-btns"><button class="mini" onclick="window.open('app-fake.js','_blank')">📜 Abrir app-fake.js</button></div>`},
{id:44, level:"medio", cat:"Web", pts:250, title:"🪪 IDOR — Perfil Alheio",
 desc:"A API retorna perfis por ?id= sem checar dono: /perfil?id=1 é você. E os outros IDs?\n\nObjetivo: enumere IDs e ache o admin (dica: ID de 1 dígito).",
 hint:"🔍 ID sem dono = enumere vizinhos (IDOR). 🛠️ Ferramenta: barra de endereços. 👣 Varie o número.",
 flag:"CTF-BR{1d0r_p3rfil}",
 extra:`<div class="live">🔌 API: <b>/perfil?id=1</b> → {"user":"convidado 1",...}</div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="idorIn" placeholder="id (ex: 7)" style="width:130px"><button class="mini" onclick="idorTest()">🔍 Buscar perfil</button></div><div id="idorOut"></div>`},
{id:45, level:"medio", cat:"Forense", pts:270, title:"📄 PDF Misterioso",
 desc:"Um relatório 'limpo' — mas PDF guarda autor, programa e mais nos metadados.\n\nObjetivo: baixe e extraia os metadados (strings, exiftool ou leitor de PDF).",
 hint:"🔍 PDF guarda autor e programa nos metadados. 🛠️ Tipo: extrator de metadados (ExifTool, strings ou propriedades). 👣 Extraia metadados.",
 flag:"CTF-BR{pdf_m3t4d4t4}",
 extra:`<img src="relatorio.pdf" alt="" style="display:none"><div class="live">📄 Arquivo: <b>relatorio.pdf</b> (815 bytes, parece inocente).</div><div class="term-btns"><a class="mini" href="relatorio.pdf" download="relatorio.pdf">⬇ Baixar relatorio.pdf</a></div>`},
{id:46, level:"medio", cat:"Web", pts:230, title:"🔀 Verbo Proibido",
 desc:"O painel /admin-panel cospe 405 para GET. Mas e os outros verbos HTTP?\n\nObjetivo: ache o verbo que abre a porta (PUT, DELETE, PATCH...).",
 hint:"🔍 405 = verbo errado; teste outros verbos. 🛠️ Ferramenta: curl -X PUT/DELETE/PATCH. 👣 Varie o método.",
 flag:"CTF-BR{v3rb_t4mp3r1ng}",
 extra:`<div class="live">🚪 GET /admin-panel → <b>405 Método não permitido</b>.</div><div class="term-btns"><button class="mini" onclick="window.open('admin-panel','_blank')">🌐 Confirmar o 405</button></div>`},
{id:47, level:"medio", cat:"Crypto", pts:260, title:"🔣 Entidades HTML",
 desc:"O CMS escapou tudo em entidades numéricas para 'proteger' a flag:\n\n&#67;&#84;&#70;&#45;&#66;&#82;&#123;&#51;&#110;&#116;&#49;&#116;&#49;&#51;&#115;&#95;&#104;&#116;&#109;&#108;&#125;\n\nObjetivo: decodifique.",
 hint:"🔍 &#NN; = caractere ASCII (entidade HTML). 🛠️ Tipo: decoder de entidades (CyberChef, python ou manual). 👣 Converta cada código.",
 flag:"CTF-BR{3nt1t13s_html}",
 extra:`<div class="live">Alvo: <b>&amp;#67;&amp;#84;... (20 entidades)</b></div><div class="term-btns"><button class="mini" onclick="decEnt()">🔓 Decodificar entidades</button></div><div id="entOut"></div>`},
{id:48, level:"avancado", cat:"Web", pts:460, title:"☁️ SSRF na Nuvem",
 desc:"O importador de avatar busca QUALQUER URL que você mandar: fetch(input).\n\nObjetivo: aponte para o metadata da nuvem (169.254.169.254) e roube a flag.",
 hint:"🔍 fetch() com URL sua = SSRF: mire no metadata interno. 🛠️ Ferramenta: o campo. 👣 Use o IP da nuvem.",
 flag:"CTF-BR{ssrf_cl0ud}",
 extra:`<div class="live">🖼️ Importador: <b>fetch(SUA_URL)</b> sem filtro (SSRF clássico)</div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="ssrfIn" placeholder="http://..." style="flex:1;min-width:180px"><button class="mini" onclick="ssrfTest()">📥 Importar</button></div><div id="ssrfOut"></div>`},
{id:49, level:"avancado", cat:"Crypto", pts:470, title:"🔑 JWT kid Travessia",
 desc:"O JWT valida assinatura, mas carrega a chave pelo header 'kid' sem sanitizar: open('./keys/' + kid).\n\nObjetivo: faça travessia de path no kid e leia a flag.",
 hint:"🔍 Caminho concatenado = travessia com ../. 🛠️ Ferramenta: o campo. 👣 Suba diretórios.",
 flag:"CTF-BR{k1d_tr4v3rs4l}",
 extra:`<div class="live">🔑 Servidor: <b>open('./keys/' + kid_do_token)</b></div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="kidIn" placeholder="../../etc/flag.txt" style="flex:1;min-width:150px"><button class="mini" onclick="kidTest()">🔓 Ler chave</button></div><div id="kidOut"></div>`},
{id:50, level:"avancado", cat:"Misc", pts:520, title:"⚡ Race Condition",
 desc:"O cofre verifica e abre em 2 passos separados. Rápido o bastante para clicar 2x na mesma janela de 300ms?\n\nObjetivo: duplo-clique quase simultâneo (2 cliques em menos de 300ms).",
 hint:"🔍 Checagem em 2 passos = vença no tempo (race). 🛠️ Ferramenta: duplo-clique rapidíssimo. 👣 Abaixo da janela.",
 flag:"CTF-BR{r4c3_c0nd1t10n}",
  extra:`<div class="live">🏁 Cofre com condição de corrida — janela: <b>300ms</b></div><div class="term-btns"><button class="mini" onclick="raceClick()">⚡ CLICAR</button></div><div id="raceOut"></div>`},
{id:51, level:"facil", cat:"Web", pts:130, title:"🔑 Senha Padrão",
 desc:"O painel do roteador ainda usa a senha de fábrica. Todo atacante testa isso primeiro.\n\nObjetivo: entre com a credencial mais famosa do mundo.",
 hint:"🔍 Painéis mantêm senha de fábrica. 🛠️ Ferramenta: listas de defaults + tentativa. 👣 Teste o óbvio primeiro.",
 flag:"CTF-BR{d3f4ult_p4ss}",
 extra:`<div class="live">🔐 Roteador CTF-ES-NET — login de fábrica</div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="defU" placeholder="usuário"><input id="defP" type="password" placeholder="senha"><button class="mini" onclick="loginPadrao()">Entrar</button></div><div id="defOut"></div>`},
{id:52, level:"facil", cat:"Crypto", pts:140, title:"🔢 Hexadecimal Puro",
 desc:"Dump de memória só com hex. Cada par = 1 letra (ASCII).\n\n4354462d42527b6833785f34736331317d\n\nObjetivo: converta para texto.",
 hint:"🔍 Pares hex = bytes ASCII. 🛠️ Ferramenta: CyberChef From Hex. 👣 Converta.",
 flag:"CTF-BR{h3x_4sc11}",
 extra:`<div class="live">Dump: <b>4354462d42527b6833785f34736331317d</b></div><div class="term-btns"><button class="mini" onclick="decHex()">🔓 Hex → ASCII</button></div><div id="hex2Out"></div>`},
{id:53, level:"facil", cat:"Web", pts:130, title:"🫖 Bule 418",
 desc:"Este servidor se acha um bule de chá (erro 418 — piada de 1º de abril que virou padrão).\n\nObjetivo: acesse /cha e leia a resposta do bule.",
 hint:"🔍 Erro HTTP exótico pode esconder conteúdo. 🛠️ Ferramenta: visite a rota e leia o corpo. 👣 Acesse e leia.",
 flag:"CTF-BR{t34p0t_418}",
 extra:`<div class="live">🫖 GET / → 200. Mas dizem que <b>/cha</b> responde diferente...</div><div class="term-btns"><button class="mini" onclick="window.open('cha','_blank')">🫖 Abrir /cha</button></div>`},
{id:54, level:"facil", cat:"Misc", pts:130, title:"✂️ Jokenpô Hacker",
 desc:"O guardião só abre a porta para quem ganhar dele no pedra-papel-tesoura (melhor de 3).\n\nObjetivo: vença 2 rodadas.",
 hint:"🔍 Jogo contra a máquina: entenda as regras e insista. 🛠️ Ferramenta: tentativa + probabilidade. 👣 Até vencer a série.",
 flag:"CTF-BR{r0ck_p4p3r}",
 extra:`<div class="live">Guardião: <b id="jkScore">Você 0 × 0 Máquina</b> (primeiro aos 2)</div><div class="term-btns"><button class="mini" onclick="jokenpo('pedra')">✊ Pedra</button><button class="mini" onclick="jokenpo('papel')">✋ Papel</button><button class="mini" onclick="jokenpo('tesoura')">✌️ Tesoura</button></div><div id="jkOut"></div>`},
{id:55, level:"facil", cat:"OSINT", pts:140, title:"📇 WHOIS Aberto",
 desc:"Todo domínio tem ficha pública: dono, e-mail, datas. Vazou um e-mail com a flag.\n\nObjetivo: ache o e-mail do registrante no dump abaixo.",
 hint:"🔍 Domínios têm ficha pública. 🛠️ Ferramenta: whois (who.is/terminal). 👣 Leia registrante e contatos.",
 flag:"CTF-BR{wh01s_l00kup}",
 extra:`<div class="live">Domain: empresa-alvo.com<br>Registrar: GoDaddy<br>Created: 2019-05-01<br>Registrant Name: REDACTED<br>Registrant Email: <b>CTF-BR{wh01s_l00kup}@proton.me</b><br>Name Server: ns1.host.com</div>`},
{id:56, level:"facil", cat:"Stego", pts:140, title:"👻 Texto Invisível",
 desc:"Esta mensagem esconde 40 caracteres invisíveis (zero-width: U+200B=0, U+200C=1).\n\nObjetivo: revele os bits e monte a flag com a palavra em minúsculo e A→4, no formato CTF-BR{z3r0_...}.",
 hint:"🔍 Texto 'vazio' selecionável esconde bits. 🛠️ Tipo: analisador Unicode (site ou python). 👣 Mapeie invisíveis em 0/1.",
 flag:"CTF-BR{z3r0_w1dth}",
 extra:`<div class="live">🔍 Selecione o pontilhado e copie: <span id="zwdata" style="border-bottom:1px dotted var(--warn);padding:0 30px" title="selecione aqui">​‌​​​‌‌​​‌​​​​​‌​‌​​​‌​‌​‌​‌​​‌‌​‌​​​​​‌</span><br>Tabela: <b>U+200B=0, U+200C=1</b>, 8 bits = 1 letra.</div><div class="term-btns"><button class="mini" onclick="decZero()">🔓 Revelar invisível</button></div><div id="zeroOut"></div>`},
{id:57, level:"facil", cat:"Crypto", pts:140, title:"🔄 ROT47 Total",
 desc:"ROT47 gira TODOS os caracteres visíveis em 47 posições (simétrico).\n\nObjetivo: gire de volta o texto abaixo.",
 hint:"🔍 Símbolos embaralhados = ROT47 (gira tudo). 🛠️ Tipo: rotação ROT47 (CyberChef, python ou manual). 👣 Gire e leia.",
 flag:"CTF-BR{r0t47_m4st3r}",
 extra:`<div class="live">Cifrado (ROT47): <b id="rot47c">r%u\q#LC_Ecf0&gt;cDEbCN</b></div><div class="term-btns"><button class="mini" onclick="decROT47()">🔓 Girar 47</button></div><div id="rot47Out"></div>`},
{id:58, level:"medio", cat:"Web", pts:240, title:"🏠 Host Venenoso",
 desc:"O 'esqueci a senha' monta o link com o Host que VOCÊ manda, sem validar.\n\nObjetivo: envenene o Host para evil.com e intercepte o reset.",
 hint:"🔍 Link de reset com Host seu = envenenável. 🛠️ Ferramenta: o campo. 👣 Aponte para fora.",
 flag:"CTF-BR{h0st_h34d3r}",
 extra:`<div class="live">📧 Reset: <b>https://[SEU_HOST]/reset?token=...</b></div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="hostIn" placeholder="Host (ex: evil.com)" style="flex:1;min-width:150px"><button class="mini" onclick="hostTest()">📧 Enviar reset</button></div><div id="hostOut"></div>`},
{id:59, level:"medio", cat:"Web", pts:260, title:"📤 Upload Maldito",
 desc:"O avatar aceita 'imagens'. A validação só olha a extensão... por cima.\n\nObjetivo: suba um shell (.php, .phtml, .phar — mas .php.jpg é barrado).",
 hint:"🔍 Upload que só olha extensão = burlável pelo nome. 🛠️ Ferramenta: renomear. 👣 Teste extensões executáveis.",
 flag:"CTF-BR{sh3ll_upl04d}",
 extra:`<div class="live">🖼️ Upload: só checa <b>extensão no nome</b> (sem magic bytes!)</div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="upIn" placeholder="shell.php" style="flex:1;min-width:150px"><button class="mini" onclick="upTest()">⬆ Enviar</button></div><div id="upOut"></div>`},
{id:60, level:"medio", cat:"Web", pts:250, title:"🔗 Poluição de Parâmetro",
 desc:"O backend lê ?id= duas vezes e fica com o ÚLTIMO valor (HPP).\n\nObjetivo: passe id=1&id=7 e leia o perfil 7.",
 hint:"🔍 Parâmetro repetido: qual valor vence? 🛠️ Ferramenta: repita e observe. 👣 Force o desejado.",
 flag:"CTF-BR{hpp_p0llut10n}",
 extra:`<div class="live">🔌 API: <b>/perfil?id=1</b> (você). O código faz <b>split('&').pop()</b>.</div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="hppIn" placeholder="id=1&id=7" style="flex:1;min-width:150px"><button class="mini" onclick="hppTest()">Buscar</button></div><div id="hppOut"></div>`},
{id:61, level:"medio", cat:"Web", pts:260, title:"◼️ GraphQL Fofoqueiro",
 desc:"A introspecção do GraphQL está ligada em produção — o schema inteiro vaza.\n\nObjetivo: ache o segredo no schema abaixo.",
 hint:"🔍 Introspecção ligada vaza o schema. 🛠️ Ferramenta: leitura + comentários. 👣 Leia TODOs e tipos.",
 flag:"CTF-BR{gr4phql_1ntr0}",
 extra:`<div class="live">type Query { user(id: ID): User }<br>type User { id: ID name: String email: String }<br># TODO: remover token de debug CTF-BR{gr4phql_1ntr0} do schema antes do deploy<br>type Mutation { login(u: String, p: String): Token }</div>`},
{id:62, level:"medio", cat:"Crypto", pts:280, title:"🔤 Substituição Fixa",
 desc:"Alfabeto embaralhado fixo (monoalfabética):\n\nEZY-WK{LXWLZ1ZXZ10F}\n\nObjetivo: descubra o mapeamento (dica: EZY = CTF).",
 hint:"🔍 Troca 1:1 = use letra conhecida + frequência. 🛠️ Tipo: análise de frequência + tentativa. 👣 Ancore e complete.",
 flag:"CTF-BR{SUBST1TUT10N}",
 extra:`<div class="live">Cifrado: <b>EZY-WK{LXWLZ1ZXZ10F}</b></div><div class="term-btns"><button class="mini" onclick="subDec()">🔓 Quebrar substituição</button></div><div id="subOut"></div>`},
{id:63, level:"medio", cat:"Crypto", pts:270, title:"🍇 Vigenère Fruta",
 desc:"Vigenère com chave = fruta de 3 letras.\n\nWOF-VM{V1A_AROOA}\n\nObjetivo: ache a fruta (dica: começa com U, termina com A).",
 hint:"🔍 Vigenère com chave curta = testável por tema. 🛠️ Tipo: teste de chaves (dCode ou script). 👣 Chute palavras do tema.",
 flag:"CTF-BR{V1G_FRUTA}",
 extra:`<div class="live">Cifrado: <b>WOF-VM{V1A_AROOA}</b> — chave: fruta de 3 letras</div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="vigF" placeholder="fruta" style="width:130px"><button class="mini" onclick="vigFruta()">🔓 Testar chave</button></div><div id="vigFOut"></div>`},
{id:64, level:"medio", cat:"Crypto", pts:280, title:"🧊 RSA Raiz Cúbica",
 desc:"RSA com expoente 3 e mensagem pequena: c = m³ (sem estourar o módulo!).\n\nn = 9999999967, e = 3, c = 8316073576\n\nObjetivo: tire a raiz cúbica e monte CTF-BR{cub3_&lt;m&gt;}.",
 hint:"🔍 RSA e=3 com mensagem pequena: c é quase m³ puro. 🛠️ Ferramenta: raiz cúbica em python. 👣 Calcule m.",
 flag:"CTF-BR{cub3_2026}",
 extra:`<div class="live">n=9999999967, e=3, c=8316073576<br>m é um ano recente (4 dígitos).</div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="cubeIn" placeholder="m (ex: 2026)" style="width:130px"><button class="mini" onclick="cubeTest()">🔢 Testar m</button><button class="mini" onclick="cubeRoot()">🧮 Raiz cúbica</button></div><div id="cubeOut"></div>`},
{id:65, level:"medio", cat:"Crypto", pts:250, title:"✔️ CRC32 Forjado",
 desc:"O backup aceita sufixo de 4 dígitos após 'SUPORTE' se o CRC32 bater 56c2c6ca.\n\nObjetivo: ache os 4 dígitos (força bruta 0000-9999, é um ano).",
 hint:"🔍 CRC curto = 4 dígitos cabem em brute force. 🛠️ Ferramenta: script 0000-9999. 👣 Automatize a busca.",
 flag:"CTF-BR{crc32_c0l1s10n}",
 extra:`<div class="live">Alvo: CRC32 == <b>56c2c6ca</b> para <b>SUPORTE+????</b></div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="crcIn" placeholder="4 dígitos" style="width:130px"><button class="mini" onclick="crcTest()">✔️ Testar</button><button class="mini" onclick="crcBrute()">⚡ Força bruta</button></div><div id="crcOut"></div>`},
{id:66, level:"medio", cat:"Forense", pts:280, title:"📡 Exfiltração DNS",
 desc:"O malware vazou a flag em queries DNS (base64 fatiado no subdomínio).\n\nQ1RG / LUJSe2Ru / NV8zeGYxbH0= em *.evil.com\n\nObjetivo: junte os 3 pedaços e decodifique.",
 hint:"🔍 DNS vaza dados em subdomínios. 🛠️ Tipo: junção de texto + decode Base64 (qualquer ferramenta). 👣 Reordene e decodifique.",
 flag:"CTF-BR{dn5_3xf1l}",
 extra:`<div class="live">🛰️ tshark: 3 queries TXT suspeitas para *.evil.com (acima)</div><div class="term-btns"><button class="mini" onclick="dnsDec()">🔓 Juntar + decode</button></div><div id="dnsOut"></div>`},
{id:67, level:"medio", cat:"Forense", pts:270, title:"💾 Dump de Memória",
 desc:"Volatility listou processos. Um rodou comando com segredo em base64.\n\nPID 1337 — mimikatz /token:Q1RGLUJSe3YwbDR0MWwxdHl9\n\nObjetivo: decodifique o token.",
 hint:"🔍 Memória guarda comandos com segredos. 🛠️ Tipo: extrator de strings + decode Base64. 👣 Procure tokens e decodifique.",
 flag:"CTF-BR{v0l4t1l1ty}",
 extra:`<div class="live">PID 4 System<br>PID 512 lsass.exe<br>PID 1337 mimikatz.exe <b>/token:Q1RGLUJSe3YwbDR0MWwxdHl9</b><br>PID 2048 chrome.exe (40 abas, coitado)</div><div class="term-btns"><button class="mini" onclick="decB64('Q1RGLUJSe3YwbDR0MWwxdHl9','volOut')">🔓 Decode token</button></div><div id="volOut"></div>`},
{id:68, level:"medio", cat:"Forense", pts:260, title:"🏭 Quem Fez a Placa?",
 desc:"Todo MAC carrega o fabricante nos 3 primeiros bytes (OUI). Tabela:\n\n00:1A:2B=Cisco, 3C:22:FB=Apple, 9C:D3:32=FaesaTech\n\nMAC do suspeito: 9C:D3:32:11:22:33. Qual o fabricante?",
 hint:"🔍 3 primeiros bytes do MAC = fabricante (OUI). 🛠️ Tipo: consulta OUI (Wireshark oui.txt, site ou manual). 👣 Consulte o prefixo.",
 flag:"CTF-BR{0u1_f4354t3ch}",
 extra:`<div class="live">📡 MAC: <b>9C:D3:32:11:22:33</b> — consulte a tabela OUI acima.</div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="ouiIn" placeholder="fabricante" style="flex:1;min-width:150px"><button class="mini" onclick="ouiTest()">🔍 Responder</button></div><div id="ouiOut"></div>`},
{id:69, level:"medio", cat:"OSINT", pts:250, title:"🔗 Pivot de E-mail",
 desc:"3 perfis do mesmo nick. Um deles vazou o e-mail de contato.\n\n@ana_silva99 (GitHub: bio vazia) / ana.silva99 (Instagram: 'contato na bio: ana.silva@faesa.edu.br') / ana-silva (LinkedIn: 'DM aberta')\n\nObjetivo: ache o e-mail e valide abaixo.",
 hint:"🔍 Um nick em várias redes = pivote até o contato. 🛠️ Ferramenta: busca + bios. 👣 Cruze os perfis.",
 flag:"CTF-BR{p1v0t_3m41l}",
 extra:`<div class="live">🎯 Alvo: <b>ana_silva99</b> — pivote pelos 3 perfis acima.</div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="osintIn" placeholder="e-mail encontrado" style="flex:1;min-width:150px"><button class="mini" onclick="osintTest()">📧 Validar e-mail</button></div><div id="osintOut"></div>`},
{id:70, level:"medio", cat:"OSINT", pts:260, title:"📍 Onde Foi a Foto?",
 desc:"Foto com: bondinho sobre a baía, estátua de braços abertos no morro, calçadão de ondas.\n\nObjetivo: diga a cidade.",
 hint:"🔍 Marcos famosos identificam a cidade. 🛠️ Ferramenta: busca + mapas. 👣 Liste pontos e conclua.",
 flag:"CTF-BR{g30_r10}",
 extra:`<div class="live">🖼️ Pistas: bondinho, estátua no morro, calçadão em ondas.</div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="geoIn" placeholder="cidade" style="flex:1;min-width:150px"><button class="mini" onclick="geoTest()">📍 Responder</button></div><div id="geoOut"></div>`},
{id:71, level:"medio", cat:"Reverso", pts:280, title:"🐍 Bytecode Vazado",
 desc:"O .pyc vazou descompilado. O programa faz XOR 0x55 em cada byte e compara:\n\n[22,1,19,120,23,7,46,37,44,54,10,49,100,38,97,38,38,40]\n\nObjetivo: reverta o XOR.",
 hint:"🔍 Bytecode com XOR constante = reverta. 🛠️ Ferramenta: python com ^. 👣 XOR inverso em cada byte.",
 flag:"CTF-BR{pyc_d1s4ss}",
 extra:`<div class="live">dis: LOAD [...] / XOR 0x55 / CMP flag</div><div class="term-btns"><button class="mini" onclick="pycDec()">🔓 Reverter XOR</button></div><div id="pycOut"></div>`},
{id:72, level:"medio", cat:"Reverso", pts:300, title:"⚙️ Crackme v2",
 desc:"Nova versão: a senha é revertida e vai para base64. Alvo:\n\nNjIwMmFzZWFm\n\nObjetivo: ache a senha de 9 chars (dica: nome da faculdade + ano).",
 hint:"🔍 Crackme com transformação conhecida: inverta-a. 🛠️ Ferramenta: raciocínio + base64. 👣 Desfaça na ordem inversa.",
 flag:"CTF-BR{cr4ckm3_v2}",
 extra:`<div class="live">🔒 check(s): base64(s[::-1]) == "NjIwMmFzZWFm"</div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="crack2In" placeholder="senha"><button class="mini" onclick="crack2()">⚙️ Executar</button></div><div id="crack2Out"></div>`},
{id:73, level:"medio", cat:"Stego", pts:270, title:"💡 Bits Apagados",
 desc:"O LED piscou em binário e alguém anotou:\n\n01001111 01001001\n\nObjetivo: bits → letras (8 bits = 1 letra).",
 hint:"🔍 Sinais binários: agrupe e converta. 🛠️ Ferramenta: CyberChef Binary. 👣 8 bits = 1 letra.",
 flag:"CTF-BR{b1n_01_by73s}",
 extra:`<div class="live">Sinal: <b>01001111 01001001</b></div><div class="term-btns"><button class="mini" onclick="decLSB()">🔓 Bits → texto</button></div><div id="lsbOut"></div>`},
{id:74, level:"medio", cat:"Stego", pts:280, title:"🎵 MP3 Marcado",
 desc:"Um MP3 com tags ID3 suspeitas. O campo COMM guarda base64:\n\nTIT2=musica.mp3, TPE1=anon, COMM=Q1RGLUJSezFkM190NGdzfQ==\n\nObjetivo: decodifique o COMM.",
 hint:"🔍 Mídia guarda metadados (ID3). 🛠️ Ferramenta: ExifTool + base64. 👣 Liste tags e decodifique.",
 flag:"CTF-BR{1d3_t4gs}",
 extra:`<div class="live">🎧 Frames ID3 acima. COMM parece codificado...</div><div class="term-btns"><button class="mini" onclick="decB64('Q1RGLUJSezFkM190NGdzfQ==','id3Out')">🔓 Decode COMM</button></div><div id="id3Out"></div>`},
{id:75, level:"medio", cat:"Misc", pts:250, title:"🧪 Mestre Regex",
 desc:"Escreva UMA regex que case 'CTF-2026' e 'abc123', mas NÃO case 'admin' nem ''.\n\nObjetivo: passe nos 4 testes de uma vez.",
 hint:"🔍 Regex = padrão com casos positivos e negativos. 🛠️ Tipo: testador de regex (regex101 ou script). 👣 Construa testando os 4 casos.",
 flag:"CTF-BR{r3g3x_m4st3r}",
  extra:`<div class="live">Testes: ✅ "CTF-2026" ✅ "abc123" ❌ "admin" ❌ ""</div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="reIn" placeholder="^[a-z]+..." style="flex:1;min-width:150px"><button class="mini" onclick="regexTest()">🧪 Testar regex</button></div><div id="reOut"></div>`},
{id:76, level:"medio", cat:"Misc", pts:260, title:"🔢 Soma Prima",
 desc:"O cofre abre com a soma de TODOS os primos menores que 50.\n\nObjetivo: calcule.",
 hint:"🔍 Cofre matemático: some primos. 🛠️ Ferramenta: python (crivo) ou papel. 👣 Liste e some.",
 flag:"CTF-BR{pr1m3s_328}",
 extra:`<div class="live">🔐 Cofre matemático: Σ primos p &lt; 50</div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="primeIn" placeholder="soma" style="width:130px"><button class="mini" onclick="primeTest()">🔓 Abrir</button></div><div id="primeOut"></div>`},
{id:77, level:"medio", cat:"Web", pts:240, title:"📞 Sequestro JSONP",
 desc:"A API antiga aceita ?callback= e reflete sem escapar (JSONP = XSS grátis).\n\nObjetivo: injete código no callback.",
 hint:"🔍 Callback refletido = injete código. 🛠️ Ferramenta: o campo. 👣 Quebre o contexto.",
 flag:"CTF-BR{js0np_h1j4ck}",
 extra:`<div class="live">🔌 /api/user?callback=<b>processa</b> → processa({...})</div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="jsonpIn" placeholder="callback" style="flex:1;min-width:150px"><button class="mini" onclick="jsonpTest()">Chamar API</button></div><div id="jsonpOut"></div>`},
{id:78, level:"medio", cat:"Crypto", pts:260, title:"🥓 Cifra Bacon",
 desc:"Francis Bacon escondia letras em grupos de 5 (A/B). I=J, U=V:\n\nAABAB AAAAA AABAA BBABA AAAAA\n\nObjetivo: decodifique (dá nome da faculdade) e monte CTF-BR{b4c0n_<palavra com A→4>}.",
 hint:"🔍 Grupos de 5 A/B = Bacon (I=J,U=V). 🛠️ Tipo: tradutor Bacon (dCode ou tabela). 👣 Decodifique grupo a grupo.",
 flag:"CTF-BR{b4c0n_f43s4}",
 extra:`<div class="live">Tocinho: <b>AABAB AAAAA AABAA BBABA AAAAA</b></div><div class="term-btns"><button class="mini" onclick="baconDec()">🔓 Fritar bacon</button></div><div id="baconOut"></div>`},
{id:79, level:"medio", cat:"Misc", pts:240, title:"🔎 Caça-Palavras",
 desc:"A palavra está escondida na grade (horizontal, linha 3):\n\nX Q Z M K P / T R W A B C / F A E S A D / L M N O P Q / U V X Y Z W / G H I J K L\n\nObjetivo: diga a palavra (5 letras).",
 hint:"🔍 Palavra escondida em grade: varra. 🛠️ Ferramenta: olho + padrão. 👣 Linha a linha.",
 flag:"CTF-BR{w0rd_f4354}",
 extra:`<div class="live">Grade 6x6 acima. A palavra de 5 letras está na horizontal.</div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="wordIn" placeholder="palavra" style="flex:1;min-width:150px"><button class="mini" onclick="wordFind()">🔎 Responder</button></div><div id="wordOut"></div>`},
{id:80, level:"avancado", cat:"Web", pts:480, title:"🍃 Injeção NoSQL",
 desc:"O login monta {user, pass} direto no Mongo, sem sanitizar operadores.\n\nObjetivo: bypass com operador (dica: $ne = 'diferente de').",
 hint:"🔍 Login NoSQL com operadores = injete operador. 🛠️ Ferramenta: sintaxe Mongo ($ne,$gt). 👣 Torne a condição verdadeira.",
 flag:"CTF-BR{n0sql_1nj3ct}",
 extra:`<div class="live">🍃 db.users.find({user:"$u", pass:"$p"})</div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="nosqlU" placeholder="usuário" value="admin"><input id="nosqlP" placeholder="senha"><button class="mini" onclick="nosqlTest()">Entrar</button></div><div id="nosqlOut"></div>`},
{id:81, level:"avancado", cat:"Web", pts:500, title:"☠️ Prototype Pollution",
 desc:"O merge() recursivo copia __proto__ para o Object raiz. Admin=false por padrão...\n\nObjetivo: polua o protótipo com admin=true.",
 hint:"🔍 Merge recursivo + __proto__ = poluição. 🛠️ Ferramenta: JSON com a chave mágica. 👣 Injete e verifique.",
 hint:'{"__proto__": {"admin": true}}.',
 flag:"CTF-BR{pr0t0_p0llut10n}",
 extra:`<div class="live">🧬 merge(alvo, entrada) sem checar __proto__</div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="protoIn" placeholder='{"__proto__":...}' style="flex:1;min-width:180px"><button class="mini" onclick="protoTest()">Mesclar</button></div><div id="protoOut"></div>`},
{id:82, level:"avancado", cat:"Web", pts:470, title:"📦 Smuggling HTTP",
 desc:"O front usa Content-Length, o back prefere Transfer-Encoding. Divergência = contrabando.\n\nObjetivo: mande request com AMBOS os headers (CL.TE).",
 hint:"🔍 Front e back discordando = contrabando. 🛠️ Ferramenta: request com ambos os headers. 👣 Envie CL+TE juntos.",
 flag:"CTF-BR{smuggl3d_r3q}",
 extra:`<div class="live">🔀 Front: CL — Back: TE (desync CL.TE possível)</div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="smugIn" placeholder="raw request..." style="flex:1;min-width:180px"><button class="mini" onclick="smugTest()">Enviar</button></div><div id="smugOut"></div>`},
{id:83, level:"avancado", cat:"Web", pts:480, title:"🔑 Confusão de Algoritmo",
 desc:"O JWT valida RS256... mas aceita o 'alg' que você mandar. E a chave pública é pública!\n\nObjetivo: troque alg para HS256.",
 hint:"🔍 JWT que confia no 'alg' = troque o algoritmo. 🛠️ Tipo: editor de JWT (jwt.io ou manual). 👣 Teste outro alg com a chave pública.",
 hint:'Header: {"alg":"HS256"} — public key vira HMAC secret.',
 flag:"CTF-BR{4lg_c0nfus10n}",
 extra:`<div class="live">🎫 Token RS256 + public.pem vazada. O validador confia no header.</div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="algIn" placeholder="alg (ex: HS256)" style="width:150px"><button class="mini" onclick="jwtConfTest()">Forjar</button></div><div id="algOut"></div>`},
{id:84, level:"avancado", cat:"Crypto", pts:500, title:"🔄 Bit-Flipping CBC",
 desc:"Cookie cifrado (CBC toy, blocos de 8): IV=4956313233343536 C1=77160d6145601972 C2=4f516f32613f256e C3=711153612e08784b. Bloco 1 = 'user=gue'.\n\nObjetivo: vire 'root' flipando bytes do IV e envie o cookie completo (64 hex).",
 hint:"🔍 CBC: flipar IV muda o bloco 1. 🛠️ Ferramenta: python (^ byte a byte). 👣 Calcule o IV forjado.",
 flag:"CTF-BR{b1t_fl1pp1ng}",
 extra:`<div class="live">🍪 Cookie (IV+C1+C2+C3): altere o IV e vire <b>root</b>.</div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="flipIn" placeholder="64 hex..." style="flex:1;min-width:180px"><button class="mini" onclick="bitflipCheck()">🍪 Enviar cookie</button></div><div id="flipOut"></div>`},
{id:85, level:"avancado", cat:"Crypto", pts:500, title:"📻 Broadcast Hastad",
 desc:"Mesma mensagem, e=3, 3 módulos diferentes (broadcast attack!):\n\nn1=1000033 c1=880626 / n2=1000037 c2=355673 / n3=1000081 c3=585372\n\nObjetivo: CRT + raiz cúbica → m (5 dígitos), flag = CTF-BR{h4st4d_&lt;m&gt;}.",
 hint:"🔍 Mesmo m, e pequeno, vários n = broadcast. 🛠️ Ferramenta: python (CRT + raiz). 👣 Combine e extraia.",
 flag:"CTF-BR{h4st4d_12345}",
 extra:`<div class="live">e=3, 3 cifrados. CRT resolve (use BigInt).</div><div class="term-btns"><button class="mini" onclick="hastadSolve()">🧮 CRT + cbrt</button></div><div id="hastadOut"></div>`},
{id:86, level:"avancado", cat:"Crypto", pts:470, title:"🐧 Pinguim ECB",
 desc:"ECB não usa IV: blocos iguais → cifrados iguais. 4 blocos, dois repetidos:\n\nB1=00112233445566778899aabbccddeeff / B2=aabbccddeeff00112233445566778899 / B3=00112233445566778899aabbccddeeff / B4=deadbeefcafef00d1234567890abcdef\n\nObjetivo: diga os repetidos (ex: 1,3).",
 hint:"🔍 ECB repete blocos iguais: compare. 🛠️ Ferramenta: olho + diff. 👣 Ache os gêmeos.",
 flag:"CTF-BR{3cb_p3ngu1n}",
 extra:`<div class="live">🔲 Modo ECB detectado? Ache os blocos gêmeos.</div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="ecbIn" placeholder="ex: 1,3" style="width:130px"><button class="mini" onclick="ecbTest()">🔲 Responder</button></div><div id="ecbOut"></div>`},
{id:87, level:"avancado", cat:"Forense", pts:480, title:"🪝 Cabeça Cortada",
 desc:"JPEG recuperado do disco, mas os primeiros bytes viraram zero.\n\n00 00 00 00 18 29 3A 7F ...\n\nObjetivo: diga o magic correto do JPEG.",
 hint:"🔍 Arquivo sem magic = adivinhe pelo tipo. 🛠️ Tipo: tabela de assinaturas (pesquise 'list of file signatures'). 👣 Teste assinaturas.",
 flag:"CTF-BR{c4rv3_jp3g}",
 extra:`<div class="live">💽 Carve: cluster com foto, magic zerado. Qual o magic do JPG?</div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="carveIn" placeholder="hex magic" style="width:150px"><button class="mini" onclick="carveTest()">🪝 Restaurar</button></div><div id="carveOut"></div>`},
{id:88, level:"avancado", cat:"Forense", pts:460, title:"📜 Histórico Shell",
 desc:"O .bash_history do servidor (500 linhas). O admin exportou a flag em 3 partes:\n\nexport FLAG_A='CTF-BR{h1st' / export FLAG_B='0ry_sh' / export FLAG_C='3ll}'\n\nObjetivo: concatene na ordem.",
 hint:"🔍 Segredo fatiado em exports: junte. 🛠️ Ferramenta: grep + concatenação. 👣 Reordene os pedaços.",
 flag:"CTF-BR{h1st0ry_sh3ll}",
 extra:`<div class="live">💻 ... 497 linhas de ls, cd, git log ... + 3 exports acima perdidos no meio.</div>`},
{id:89, level:"avancado", cat:"Reverso", pts:500, title:"🤖 Crackme VM",
 desc:"VM própria: para cada byte da senha faz out[i] = inp[i] ^ key[i%4] ^ i, key='FAES'. Alvo:\n\n[53,115,41,56,118,101]\n\nObjetivo: reverta e ache a senha de 6 chars.",
 hint:"🔍 VM com XOR+índice: inverta a fórmula. 🛠️ Ferramenta: python por posição. 👣 Desfaça byte a byte.",
 flag:"CTF-BR{vm_r3v3rs3}",
 extra:`<div class="live">🤖 dis: XOR key='FAES', XOR índice, CMP [53,115,41,56,118,101]</div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="vmIn" placeholder="senha"><button class="mini" onclick="vmCheck()">🤖 Executar VM</button></div><div id="vmOut"></div>`},
{id:90, level:"avancado", cat:"Reverso", pts:470, title:"🔐 Keygen Clássico",
 desc:"O instalador valida serial de 4 dígitos: soma((i+1)*char) % 99991 == 504.\n\nObjetivo: ache um serial válido (dica: ano da copa +10).",
 hint:"🔍 Serial com checksum = força bruta cabe. 🛠️ Ferramenta: script testando a fórmula. 👣 Automatize (ou reduza com lógica).",
 flag:"CTF-BR{k3yg3n_2024}",
 extra:`<div class="live">🔐 check(serial): Σ (i+1)*ord(c) % 99991 == 504</div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="keyIn" placeholder="4 dígitos" style="width:130px"><button class="mini" onclick="keygenTest()">Testar</button><button class="mini" onclick="keygenBrute()">⚡ Brute force</button></div><div id="keyOut"></div>`},
{id:91, level:"avancado", cat:"Stego", pts:460, title:"👻 Canal Alfa",
 desc:"PNG RGBA: o RGB é ruído, mas o canal ALFA de 5 pixels soletra ASCII:\n\nA=[70,65,69,83,65]\n\nObjetivo: bytes → letras.",
 hint:"🔍 PNG RGBA: cheque canal por canal. 🛠️ Tipo: manipulação de imagem (Python/PIL ou editor). 👣 Leia o alfa como ASCII.",
 flag:"CTF-BR{4lph4_f43s4}",
 extra:`<div class="live">🖼️ Pixels: RGB=lixo, ALPHA=[70,65,69,83,65]</div><div class="term-btns"><button class="mini" onclick="alphaDec()">🔓 Ler canal alfa</button></div><div id="alphaOut"></div>`},
{id:92, level:"avancado", cat:"Stego", pts:470, title:"🧱 Chunk Corrompido",
 desc:"PNG com 3 chunks. Um CRC não bate com os dados:\n\nIHDR crc=15141527 / IDAT crc=e55da055 / IEND crc=ae426082\n\nObjetivo: diga qual chunk está corrompido (recalcule CRC32 de type+dados).",
 hint:"🔍 CRC mente? Recalcule por chunk. 🛠️ Tipo: cálculo de CRC (python, CyberChef ou manual). 👣 Confira cada um.",
 flag:"CTF-BR{chunk_b4d_crc}",
 extra:`<div class="live">🧱 3 chunks, 1 CRC mentiroso. Confira com qualquer CRC32.</div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="chunkIn" placeholder="IHDR, IDAT ou IEND" style="flex:1;min-width:150px"><button class="mini" onclick="chunkTest()">🧱 Responder</button></div><div id="chunkOut"></div>`},
{id:93, level:"avancado", cat:"OSINT", pts:450, title:"🎯 Missão Fantasma",
 desc:"Cadeia de 3 pivôs sobre 'ghost_faesa':\n\n1) Fórum: nick ghost_faesa, 'meu pet se chama Rex'\n2) Breach: ghost_faesa@proton.me em 2 vazamentos\n3) Pergunta secreta do cofre: 'nome do primeiro pet'\n\nObjetivo: abra o cofre com a resposta.",
 hint:"🔍 Missão em cadeia: cada pista leva à próxima. 🛠️ Ferramenta: anotação + pivôs. 👣 Siga a corrente.",
 flag:"CTF-BR{p1v0t_r3x}",
 extra:`<div class="live">🎯 3 pivôs acima → 1 resposta que abre o cofre.</div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="misIn" placeholder="resposta" style="flex:1;min-width:150px"><button class="mini" onclick="missionTest()">🗝️ Abrir cofre</button></div><div id="misOut"></div>`},
{id:94, level:"avancado", cat:"Misc", pts:480, title:"🧠 Brainfuck Vivo",
 desc:"O cofre roda Brainfuck. Este programa imprime 2 letras (87 comandos, célula 8 bits, '.' imprime).\n\nObjetivo: execute e diga o output. A flag é CTF-BR{br41nfuck_&lt;output minúsculo&gt;}.",
 hint:"🔍 Linguagem esotérica: execute passo a passo. 🛠️ Tipo: interpretador Brainfuck (online ou próprio). 👣 Rode e leia o output.",
 flag:"CTF-BR{br41nfuck_01}",
 extra:`<div class="live">🧠 +++++...+++++++.------. (79 '+', '.', 6 '-', '.')</div><div class="term-btns"><button class="mini" onclick="bfRun()">▶ Executar BF</button></div><div id="bfOut"></div>`},
{id:95, level:"avancado", cat:"Misc", pts:460, title:"🐳 Layer Esquecida",
 desc:"O `docker history` mostra TODAS as camadas, até as intermediárias:\n\nlayer 9f8e: FROM ubuntu / layer a1b2: ENV SECRET=CTF-BR{d0ck3r_s3cr3t} / layer c3d4: RUN rm secret / layer e5f6: CMD app\n\nObjetivo: ache o segredo deletado depois.",
 hint:"🔍 Docker guarda camadas antigas. 🛠️ Ferramenta: docker history / leitura. 👣 Inspecione layer por layer.",
 flag:"CTF-BR{d0ck3r_s3cr3t}",
 extra:`<div class="live">🐳 12 layers no history. Uma exportou SECRET e a seguinte removeu.</div>`},
{id:96, level:"avancado", cat:"Web", pts:490, title:"📧 Envenenamento de Cache",
 desc:"O 'esqueci a senha' usa X-Forwarded-Host no link SEM validar, e o cache guarda a resposta.\n\nObjetivo: envenene com evil.com e roube o token.",
 hint:"🔍 Host no e-mail + cache = envenenamento. 🛠️ Ferramenta: o campo. 👣 Aponte para fora e observe.",
 flag:"CTF-BR{c4ch3_p01s0n}",
 extra:`<div class="live">📧 Reset usa <b>X-Forwarded-Host</b> + cache público (web cache poisoning)</div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="cacheIn" placeholder="Host" style="flex:1;min-width:150px"><button class="mini" onclick="cacheTest()">☠️ Envenenar</button></div><div id="cacheOut"></div>`},
{id:97, level:"avancado", cat:"Crypto", pts:490, title:"🔑 Autokey Traiçoeira",
 desc:"Autokey: a chave se estende com o PRÓPRIO texto (chave inicial 'FAESA').\n\nHTJ-TR{4WM0P3E_D1GN3E}\n\nObjetivo: decifre (C[i] - K[i], K = FAESA+texto).",
 hint:"🔍 Autokey: chave cresce com o texto. 🛠️ Ferramenta: papel/python. 👣 Reconstrua K e subtraia.",
 flag:"CTF-BR{4UT0K3Y_C1PH3R}",
 extra:`<div class="live">Cifrado: <b>HTJ-TR{4WM0P3E_D1GN3E}</b> — chave inicial FAESA</div><div class="term-btns"><button class="mini" onclick="autokeyDec()">🔓 Decifrar autokey</button></div><div id="autoOut"></div>`},
{id:98, level:"avancado", cat:"Forense", pts:500, title:"🕰️ Linha do Tempo",
 desc:"5 eventos do incidente fora de ordem. Monte a sequência causa→efeito:\n\nA=beacon C2, B=phishing recebido, C=wipe de logs, D=macro executada, E=exfiltração\n\nObjetivo: digite a ordem (ex: B-D-A-E-C).",
 hint:"🔍 Incidente = causa→efeito em ordem. 🛠️ Ferramenta: raciocínio + timeline. 👣 Ordene logicamente.",
 flag:"CTF-BR{t1m3l1n3_c0p}",
 extra:`<div class="live">🕰️ A=beacon C2 / B=phishing / C=wipe logs / D=macro / E=exfiltração</div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="timeIn" placeholder="B-D-A-E-C" style="flex:1;min-width:150px"><button class="mini" onclick="timeTest()">🕰️ Montar timeline</button></div><div id="timeOut"></div>`},
{id:99, level:"avancado", cat:"Misc", pts:500, title:"👑 BOSS Supremo 100",
 desc:"O BOSS final: 3 camadas (resolva nesta ordem):\n\n1) Reverse string\n2) Base58 decode\n3) ROT47 decode\n\nPacote:\n\nf15iikGhn8ScFFrCsbXnAXX4FEGZXuYQB\n\nObjetivo: a flag das 100 fases.",
 hint:"🔍 Boss em camadas: identifique e descasque. 🛠️ Ferramenta: CyberChef em cadeia. 👣 Uma camada por vez.",
 flag:"CTF-BR{supr3m0_b0ss_100}",
 extra:`<div class="live">👑 <b>f15iikGhn8ScFFrCsbXnAXX4FEGZXuYQB</b></div><div class="term-btns"><button class="mini" onclick="boss3Step(1)">1️⃣ Reverse</button><button class="mini" onclick="boss3Step(2)">2️⃣ Base58</button><button class="mini" onclick="boss3Step(3)">3️⃣ ROT47 → FLAG</button></div><div id="boss3Out"></div>`},
{id:100, level:"avancado", cat:"Web", pts:500, title:"📜 Veneno no Log",
 desc:"O log grava seu User-Agent sem filtrar, e o admin dá include() no log (LFI!).\n\nObjetivo: grave PHP no log e inclua access.log.",
 hint:"🔍 Log gravado + include = LFI via veneno. 🛠️ Ferramenta: os dois campos. 👣 Envenene e inclua.",
 flag:"CTF-BR{l0g_p01s0n}",
  extra:`<div class="live">📜 include('./pages/' + path) + log grava User-Agent puro</div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="lfiIn" placeholder="../../logs/access.log" style="flex:1;min-width:150px"><button class="mini" onclick="lfiTest()">📜 Incluir</button></div><div id="lfiOut"></div>`},
{id:101, level:"avancado", cat:"Crypto", pts:1000, title:"👑 GRANDMASTER — Nonce Reutilizado",
 desc:"O cofre assina com ECDSA (secp256k1)... e reutilizou o nonce k nas duas assinaturas. Falha FATAL — foi assim que hackearam o PS3 em 2010!\n\nr = 49079150660668101860393175914355748447619318442697601031589308338093765412456\ns1 = 1831302458653039426034326932453480228878131475121486857298199157714955680952\ns2 = 101992183987365631186231954187876546643258078862736750164842276542883506620341\nz1 = 23429087625394486806962964921029410021091861177296187691963204493628767494998 (SHA256 'FAESA-contrato-001')\nz2 = 35193822666529220445298033605280169993310905347249354187924072574978783526595 (SHA256 'FAESA-contrato-002')\nn = ordem da secp256k1 (115792089237316195423570985008687907852837564279074904382605163141518161494337)\n\nObjetivo: 1) recupere k = (z1−z2)·(s1−s2)⁻¹ mod n — 2) recupere d = (s1·k − z1)·r⁻¹ mod n — 3) digite d (77 dígitos).",
 hint:"🔍 ECDSA com nonce repetido = chave vaza (caso PS3). 🛠️ Ferramenta: python (inverso modular). 👣 Recupere k, depois d.",
 flag:"CTF-BR{3cd54_n0nc3_gr4ndm4st3r}",
 extra:`<div class="live">🎓 Aula: em ECDSA, s = k⁻¹(z + r·d). Com o MESMO k em 2 assinaturas, dá para isolar k e depois d. Foi o erro da Sony no PS3 (k constante!).<br><br>Passo 1: k = (z1−z2)/(s1−s2) mod n<br>Passo 2: d = (s1·k−z1)/r mod n</div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><input id="dIn" placeholder="chave privada d (77 dígitos)" style="flex:1;min-width:180px"><button class="mini" onclick="ecdsaCheck()">🔑 Validar d</button></div><div id="dOut"></div>`},
];

// ---------- ESTADO + CONTAS (usuário e senha, 100% local) ----------
let activeLevel = "todos";
let currentId = 1;
let solved = {};
let hints = {};
let currentUser = null; // nome logado
let TOTAL = CHALLENGES.reduce((a,c)=>a+c.pts,0);

function getUsers(){ try{ return JSON.parse(localStorage.getItem("ctf_users")||"{}"); }catch(e){ return {}; } }
function setUsers(u){ localStorage.setItem("ctf_users",JSON.stringify(u)); }
async function sha256Hex(s){
  try{
    const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode("ctf-br::"+s));
    return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");
  }catch(e){ let h=0; for(let i=0;i<s.length;i++){ h=(h*31+s.charCodeAt(i))|0; } return "fb"+(h>>>0).toString(16); }
}
function validUser(u){ return /^[a-zA-Z0-9_.]{3,20}$/.test(u||""); }
function loadProgress(){
  if(ONLINE&&ME) return; // servidor já sincronizou solved/hints
  if(currentUser){
    const u=getUsers()[currentUser];
    solved=u?.solved||{}; hints=u?.hints||{};
  } else {
    // visitante: usa chaves antigas para não perder quem já jogou
    try{ solved=JSON.parse(localStorage.getItem("ctf_solved")||"{}"); }catch(e){ solved={}; }
    try{ hints=JSON.parse(localStorage.getItem("ctf_hints")||"{}"); }catch(e){ hints={}; }
  }
}
function persistProgress(){
  if(currentUser){
    const users=getUsers();
    if(users[currentUser]){ users[currentUser].solved=solved; users[currentUser].hints=hints; setUsers(users); }
  }
}
function isAdmin(){ if(!currentUser) return false; if(ONLINE&&ME) return ME.role==="admin"; return getUsers()[currentUser]?.role==="admin"; }

// ---------- MARCA D'ÁGUA + ANTI-PRINT/IA (identifica vazamento) ----------
// Limite técnico honesto: navegador NÃO detecta print do sistema nem foto do
// celular. O que identifica o dono do vazamento é a marca d'água com o usuário
// espalhada na tela + registro de tentativas suspeitas (PrintScreen, Ctrl+P, cópia).
function updateWatermark(){
  const w=document.getElementById("watermark"); if(!w) return;
  const tag=currentUser||"visitante";
  let s=""; for(let i=0;i<160;i++) s+=`<span data-wm="${tag}">CTF-ES • ${tag} • </span>`;
  w.innerHTML=s;
}
function logSuspeita(tipo){
  if(!currentUser) return;
  if(ONLINE&&TOKEN) apiPost("/api/ctf/suspect",{token:TOKEN,type:tipo});
  try{
    const users=getUsers(); const u=users[currentUser]; if(!u) return;
    u.prints=(u.prints||0)+1; u.lastPrint=tipo+" em "+new Date().toLocaleString("pt-BR");
    setUsers(users); renderAdmin();
  }catch(e){}
  toast("⚠️ "+tipo+" registrado na sua conta.");
}

// ---------- TRAPACEIROS (print vazado, IA, cola) ----------
function getCheaters(){ try{ return JSON.parse(localStorage.getItem("ctf_cheaters")||"[]"); }catch(e){ return []; } }
function setCheaters(a){ localStorage.setItem("ctf_cheaters",JSON.stringify(a)); }
function isCheater(n){ return getCheaters().some(c=>c.name===n); }
async function adminFlagCheater(n){
  if(!isAdmin()) return;
  const motivo=prompt("Motivo para colocar "+n+" na lista de trapaceiros:\n(ex: print vazado com marca d'água, resolveu via IA, colou flag de outro)");
  if(!motivo||!motivo.trim()) return;
  if(ONLINE){
    await apiPost("/api/ctf/admin/flag",{token:TOKEN,user:n,reason:motivo.trim().slice(0,140)});
    renderRanking(); renderAdmin(); toast("🚫 "+n+" na lista de trapaceiros. 🌐"); return;
  }
  const arr=getCheaters().filter(c=>c.name!==n);
  arr.push({name:n,reason:motivo.trim().slice(0,140),by:currentUser,date:new Date().toLocaleString("pt-BR")});
  setCheaters(arr);
  // continua no ranking, mas carimbado como trapaceiro
  renderRanking(); renderAdmin(); renderCheaters();
  toast("🚫 "+n+" marcado como trapaceiro (continua no ranking).");
}
async function adminUnflagCheater(n){
  if(!isAdmin()) return;
  if(ONLINE){ await apiPost("/api/ctf/admin/unflag",{token:TOKEN,user:n}); renderRanking(); renderAdmin(); toast("✅ "+n+" removido da lista. 🌐"); return; }
  setCheaters(getCheaters().filter(c=>c.name!==n));
  renderRanking(); renderAdmin(); renderCheaters();
  toast("✅ "+n+" removido da lista.");
}
async function renderCheaters(){
  if(ONLINE){
    const d=await apiGet("/api/ctf/cheaters");
    const arr=(d&&d.ok?d.cheaters:[]);
    paintCheaters(arr);
    return;
  }
  const arr=getCheaters();
  paintCheaters(arr);
}
function paintCheaters(arr){
  const pub=document.getElementById("cheatPublic");
  if(pub) pub.innerHTML=arr.length?arr.map(c=>`<div class="live no">🚫 <b>${c.name}</b> — ${c.reason} <span style="opacity:.6">(${c.date})</span></div>`).join(""):`<span class="muted">Nenhum trapaceiro registrado. Joguem limpo! 🙂</span>`;
  const adm=document.getElementById("cheatList");
  if(adm){
    if(!isAdmin()) adm.innerHTML=`<span class="muted">🔒 Área restrita ao ADM.</span>`;
    else adm.innerHTML=arr.length?arr.map(c=>`<div class="live no">🚫 <b>${c.name}</b> — ${c.reason} <span style="opacity:.6">por ${c.by} em ${c.date}</span> <button class="mini" onclick="adminUnflagCheater('${c.name}')">Perdoar</button></div>`).join(""):`<span class="muted">Lista vazia.</span>`;
  }
}

const lvlName = l => l==="facil"?T("lvl.facil"):l==="medio"?T("lvl.medio"):T("lvl.avancado");
const lvlClass = l => l==="facil"?"l-facil":l==="medio"?"l-medio":"l-avancado";

function save(){ localStorage.setItem("ctf_solved",JSON.stringify(solved)); localStorage.setItem("ctf_hints",JSON.stringify(hints)); persistProgress(); }
function pontosDe(c){ return hints[c.id] ? Math.ceil(c.pts/2) : c.pts; }
function basePontos(){ return CHALLENGES.filter(c=>solved[c.id]).reduce((a,c)=>a+pontosDe(c),0); }
function minhaMulta(){ if(!currentUser) return 0; return parseInt(getUsers()[currentUser]?.fine||0); }
function totalPontos(){ if(ONLINE&&ME&&typeof ME.pts==="number") return ME.pts; return Math.max(0, basePontos()-minhaMulta()); }

function patente(p){
  if(p>=TOTAL*0.85) return "🏴‍☠️ Lenda CTF-ES";
  if(p>=TOTAL*0.55) return "💀 Elite Hacker";
  if(p>=TOTAL*0.3) return "🔥 Hacker";
  if(p>=1) return "💻 Script Kiddie";
  return "🌱 Recruta";
}

// ---------- GRID ----------
function setLevel(l,btn){ activeLevel=l; document.querySelectorAll("#levelFilters button").forEach(b=>b.classList.remove("active")); btn.classList.add("active"); renderGrid(); }

function renderGrid(){
  const q=(document.getElementById("searchInput").value||"").toLowerCase();
  const cat=document.getElementById("catFilter").value;
  const hide=document.getElementById("hideSolved").checked;
  const list=CHALLENGES.filter(c=>{
    if(activeLevel!=="todos"&&c.level!==activeLevel) return false;
    if(cat!=="todas"&&c.cat!==cat) return false;
    if(hide&&solved[c.id]) return false;
    if(q&&!(c.title+" "+c.desc+" "+c.cat).toLowerCase().includes(q)) return false;
    return true;
  });
  document.getElementById("resultCount").textContent=list.length+" / "+CHALLENGES.length+" "+T("m.challenges");
  const g=document.getElementById("grid"); g.innerHTML="";
  const LVL={facil:0,medio:1,avancado:2};
  list.sort((a,b)=>(LVL[a.level]-LVL[b.level])||(a.id-b.id));
  const FINAL_ID=Math.max(...CHALLENGES.map(x=>x.id));
  const boss=list.find(c=>c.id===FINAL_ID);
  list.filter(c=>c.id!==FINAL_ID).forEach(c=>{
    const el=document.createElement("div");
    const req=c.level==="medio"?["facil",nivelFeito("facil"),nivelTotal("facil")]:c.level==="avancado"?["medio",nivelFeito("medio"),nivelTotal("medio")]:null;
    const locked=req&&req[1]<req[2]&&!faseAberta(c);
    el.className="card"+(solved[c.id]?" solved":"")+(locked?" locked":"");
    el.innerHTML=`<div class="card-top"><span class="lvl ${lvlClass(c.level)}">${lvlName(c.level)}</span><span class="cat">${c.cat}</span><span class="pts">⭐ ${pontosDe(c)} pts</span></div>
    <h3>${locked?"🔒 ???":c.title}</h3><p>${locked?`${T("m.lockNeed")} <b>${req[0]==="facil"?T("m.allFacil"):T("m.allMedio")}</b> (${req[1]}/${req[2]}).`:c.desc.split("\n")[0]}</p>
    ${locked?`<button class="btn ghost card-btn" onclick="toast('🔒 Termine as ${req[0]==="facil"?T("m.allFacil"):T("m.allMedio")} (${req[1]}/${req[2]})!')">${T("m.lockBtn")}</button>`:`<button class="btn ${solved[c.id]?"ghost":"primary"} card-btn" onclick="abrirModal(${c.id})">${solved[c.id]?T("m.review"):T("m.attack")}</button>`}`;
    if(!locked) el.querySelector("h3").onclick=()=>abrirModal(c.id);
    else el.querySelector("h3").onclick=()=>toast(`🔒 Termine as ${req[0]==="facil"?T("m.allFacil"):T("m.allMedio")} (${req[1]}/${req[2]})!`);
    g.appendChild(el);
  });
  // chefão final: destaque dourado em largura total, bloqueado até zerar o resto
  if(boss){
    const done=Object.keys(solved).filter(id=>String(id)!==String(FINAL_ID)).length;
    const need=CHALLENGES.length-1, open=isFinalOpen();
    const el=document.createElement("div");
    el.className="card boss-card"+(solved[boss.id]?" solved":"")+(!open?" locked":"");
    el.innerHTML=`<div class="card-top"><span class="lvl ${lvlClass(boss.level)}">${lvlName(boss.level)}</span><span class="cat">${boss.cat}</span><span class="pts">⭐ ${pontosDe(boss)} pts</span><span class="pts">${T("m.boss")}</span></div>
    <h3>${open?boss.title:"🔒 ??? (desafio final bloqueado)"}</h3><p>${open?boss.desc.split("\n")[0]:`Resolva as outras <b>${need} fases</b> para desbloquear o chefão final. Progresso: <b>${done}/${need}</b>.`}</p>
    ${open?`<button class="btn ${solved[boss.id]?"ghost":"primary"} card-btn" onclick="abrirModal(${boss.id})">${solved[boss.id]?T("m.review"):T("m.attackBoss")}</button>`:`<button class="btn ghost card-btn" onclick="toast('🔒 Complete as ${need} fases para desbloquear! (${done}/${need})')">${T("m.lockBtn")} (${done}/${need})</button>`}`;
    if(!open) el.querySelector("h3").onclick=()=>toast(`🔒 `+T("m.needAll")+` ${need} `+T("m.toUnlock")+` (${done}/${need})`);
    g.appendChild(el);
  }
  updateHUD();
}
function isFinalOpen(){
  if(isAdmin()) return true; // ADM vê tudo
  const FINAL_ID=Math.max(...CHALLENGES.map(x=>x.id));
  return Object.keys(solved).filter(id=>String(id)!==String(FINAL_ID)).length>=CHALLENGES.length-1;
}
function nivelTotal(l){ return CHALLENGES.filter(c=>c.level===l).length; }
function nivelFeito(l){ return CHALLENGES.filter(c=>c.level===l&&solved[c.id]).length; }
function primeiraMedia(){ return Math.min(...CHALLENGES.filter(c=>c.level==="medio").map(c=>c.id)); }
function primeiraAvancada(){ const a=CHALLENGES.filter(c=>c.level==="avancado"&&c.id!==Math.max(...CHALLENGES.map(x=>x.id))); return Math.min(...a.map(c=>c.id)); }
function nivelAberto(l){
  if(l==="facil") return true;
  if(l==="medio") return nivelFeito("facil")>=nivelTotal("facil");
  if(l==="avancado") return nivelFeito("medio")>=nivelTotal("medio");
  return true;
}
function faseAberta(c){
  if(isAdmin()) return true; // ADM vê tudo
  if(c.level==="facil") return true;
  if(c.id===primeiraMedia()||c.id===primeiraAvancada()) return true; // degustação
  return nivelAberto(c.level);
}

function updateHUD(){
  if(!document.getElementById("hudPontos")) return;
  const p=totalPontos();
  const n=Object.keys(solved).length;
  document.getElementById("hudPontos").textContent=p;
  document.querySelector(".hud-card span").textContent="pontos / "+TOTAL;
  document.getElementById("hudSolves").textContent=n+"/"+CHALLENGES.length;
  document.getElementById("hudNivel").textContent=patente(p);
  document.getElementById("progressFill").style.width=(p/TOTAL*100)+"%";
  const nf=CHALLENGES.filter(c=>c.level==="facil").length, nm=CHALLENGES.filter(c=>c.level==="medio").length, na=CHALLENGES.filter(c=>c.level==="avancado").length;
  document.getElementById("cFacil").textContent=CHALLENGES.filter(c=>c.level==="facil"&&solved[c.id]).length+"/"+nf;
  document.getElementById("cMedio").textContent=CHALLENGES.filter(c=>c.level==="medio"&&solved[c.id]).length+"/"+nm;
  document.getElementById("cAvanc").textContent=CHALLENGES.filter(c=>c.level==="avancado"&&solved[c.id]).length+"/"+na;
}

// ---------- MODAL ----------
function marcarAtaque(){
  // o cronômetro nasce no 1º ataque (abriu fase sem nada resolvido)
  if(Object.keys(solved).length>0) return;
  const now=Date.now();
  if(currentUser){
    const us=getUsers();
    if(us[currentUser]&&!us[currentUser].attackStart){ us[currentUser].attackStart=now; us[currentUser].lastBeat=now; setUsers(us); }
  }
  else if(!localStorage.getItem("ctf_attack")) localStorage.setItem("ctf_attack",now);
  if(ONLINE&&TOKEN) apiPost("/api/ctf/attack",{token:TOKEN});
}
function abrirModal(id){
  const FINAL_ID=Math.max(...CHALLENGES.map(x=>x.id));
  if(String(id)===String(FINAL_ID)&&!isFinalOpen()){
    const done=Object.keys(solved).filter(x=>String(x)!==String(FINAL_ID)).length;
    toast(`🔒 `+T("m.bossLocked")+` ${CHALLENGES.length-1} `+T("m.toUnlock")+` (${done}/${CHALLENGES.length-1}).`);
    return;
  }
  const ch=CHALLENGES.find(x=>x.id===id);
  if(ch&&!faseAberta(ch)){
    const req=ch.level==="medio"?["fáceis",nivelFeito("facil"),nivelTotal("facil")]:["médias",nivelFeito("medio"),nivelTotal("medio")];
    toast(`🔒 `+T("m.finishToFree")+` ${req[0]} (${req[1]}/${req[2]}) `+T("m.toFree"));
    return;
  }
  currentId=id;
  flushSlice();
  marcarAtaque();
  modalOpenAt=Date.now();
  const c=CHALLENGES.find(x=>x.id===id);
  document.getElementById("mLevel").innerHTML=`<span class="lvl ${lvlClass(c.level)}">${lvlName(c.level)}</span>`;
  document.getElementById("mCat").innerHTML=`<span class="cat">${c.cat}</span>`;
  document.getElementById("mPts").innerHTML=`<span class="pts">⭐ ${pontosDe(c)} pts</span>`;
  document.getElementById("mTitle").textContent="#"+c.id+" "+c.title;
  document.getElementById("mDesc").textContent=c.desc;
  document.getElementById("mExtra").innerHTML=c.extra;
  // ferramentas de dev: só ADM usa — some em silêncio pro visitante
  if(!isAdmin()){
    const DEV_ONLY=["robotsSecret","decB64","decCaesar","showCookies","showLocalParts","bruteHash","decodeJWT","forgeJWT","deobf","hexToAscii","decVig","factorN","bossStep","decMorse","decAtbash","grepLog","decB32","decXor","faesaStep","decROT","decBinary","decRail","decB58","boss2Step","decEnt"];
    const box=document.getElementById("mExtra");
    box.querySelectorAll("button").forEach(b=>{
      const oc=b.getAttribute("onclick")||"";
      if(DEV_ONLY.some(f=>oc.includes(f))||oc.includes("console.log")) b.remove();
    });
  }
  document.getElementById("mHint").classList.add("hidden");
  document.getElementById("mHint").textContent="";
  document.getElementById("flagInput").value="";
  const msg=document.getElementById("mMsg"); msg.textContent=solved[id]?"✔ Já resolvido! Revalide quando quiser.":""; msg.className="mmsg"+(solved[id]?" ok":"");
  document.getElementById("modal").classList.remove("hidden");
  setTimeout(()=>document.getElementById("flagInput").focus(),100);
}
function fecharModal(){ flushSlice(); document.getElementById("modal").classList.add("hidden"); }
function navDesafio(d){ let i=CHALLENGES.findIndex(c=>c.id===currentId); i=(i+d+CHALLENGES.length)%CHALLENGES.length; abrirModal(CHALLENGES[i].id); }
function mostrarDica(){
  const c=CHALLENGES.find(x=>x.id===currentId);
  const h=document.getElementById("mHint");
  h.classList.remove("hidden"); h.textContent="💡 "+c.hint+(hints[c.id]?" (já aplicada: -50%)":" (penalidade de -50% aplicada!");
  if(!solved[c.id]&&!hints[c.id]){ hints[c.id]=true; save(); if(ONLINE&&TOKEN) apiPost("/api/ctf/hint",{token:TOKEN,id:c.id}); toast("💡 Dica usada: desafio agora vale "+pontosDe(c)+" pts"); abrirModalRefreshPts(c); }
}
function abrirModalRefreshPts(c){ document.getElementById("mPts").innerHTML=`<span class="pts">⭐ ${pontosDe(c)} pts</span>`; updateHUD(); }
function fmtTime(ms){
  if(ms==null||!isFinite(ms)) return "—";
  const s=Math.floor(ms/1000);
  const h=String(Math.floor(s/3600)).padStart(2,"0"),m=String(Math.floor(s%3600/60)).padStart(2,"0"),ss=String(s%60).padStart(2,"0");
  return `${h}:${m}:${ss}`;
}
function userStart(){
  // início do ATAQUE (abriu a 1ª fase), não da conta
  if(ONLINE&&ME&&(ME.attackStart||ME.start)) return ME.attackStart||ME.start;
  if(currentUser){
    const u=getUsers()[currentUser];
    if(u?.attackStart) return u.attackStart;
    if(u?.start) return u.start;
    // migração: conta antiga → usa a 1ª flag como início
    const ts=Object.values(u?.solved||{}).filter(v=>typeof v==="number");
    return ts.length?Math.min(...ts):Date.now();
  }
  return parseInt(localStorage.getItem("ctf_attack")||localStorage.getItem("ctf_start")||Date.now());
}
function lastSolveTs(){ const ts=Object.values(solved).filter(v=>typeof v==="number"); return ts.length?Math.max(...ts):null; }
// relógio SÓ anda com fase aberta (fechou a fase = pausou)
let modalOpenAt=null;
let visitorActive=parseInt(localStorage.getItem("ctf_visActive")||0);
function takeSlice(){
  if(modalOpenAt==null) return 0;
  const d=Math.max(0,Math.min(Date.now()-modalOpenAt,1800000)); // teto 30min por fase aberta
  modalOpenAt=null;
  return d;
}
async function flushSlice(){
  const d=takeSlice();
  if(d<=0) return 0;
  if(!currentUser){ visitorActive+=d; try{localStorage.setItem("ctf_visActive",visitorActive);}catch(e){} updateHUD(); return d; }
  if(ONLINE&&TOKEN){ const r=await apiPost("/api/ctf/beat",{token:TOKEN,add:d}); if(r&&r.ok&&ME){ ME.time=r.activeMs; ME._at=Date.now(); } }
  else { try{ const us=getUsers(); const u=us[currentUser]; if(u){ u.activeMs=parseInt(u.activeMs||0)+d; setUsers(us); } }catch(e){} }
  updateHUD();
  return d;
}
function baseActive(){
  if(ONLINE&&ME) return (ME.time||0);
  if(currentUser){ const u=getUsers()[currentUser]; return parseInt((u&&u.activeMs)||0); }
  return visitorActive;
}
function elapsedNow(){
  const n=Object.keys(solved).length;
  if(!n) return 0;
  if(n>=CHALLENGES.length){
    if(ONLINE&&ME) return ME.frozenMs!=null?ME.frozenMs:(ME.time||0);
    if(currentUser){ const u=getUsers()[currentUser]; if(u&&u.frozenMs!=null) return u.frozenMs; }
  }
  return baseActive()+(modalOpenAt?Date.now()-modalOpenAt:0);
}
async function enviarFlag(){
  const c=CHALLENGES.find(x=>x.id===currentId);
  const v=document.getElementById("flagInput").value.trim();
  const msg=document.getElementById("mMsg");
  if(ONLINE&&TOKEN&&currentUser){
    msg.textContent="⏳ Validando no servidor..."; msg.className="mmsg";
    const r=await apiPost("/api/ctf/submit",{token:TOKEN,id:c.id,flag:v});
    if(!r){ msg.textContent="❌ Servidor fora do ar. Tente de novo."; msg.className="mmsg err"; return; }
    if(!r.correct){ msg.textContent="❌ Flag incorreta. Tente de novo!"; msg.className="mmsg err"; return; }
    await syncMe();
    msg.textContent="🎉 CORRETO! +"+r.awarded+" pts — "+patente(r.total_pts);
    msg.className="mmsg ok";
    toast("🚩 Flag correta! +"+r.awarded+" pts 🌐");
    renderGrid(); abrirModalRefreshPts(c); renderRanking();
    if(r.solves===CHALLENGES.length) setTimeout(()=>toast("🏴‍☠️ LENDA! Você zerou os "+CHALLENGES.length+" desafios!"),800);
    return;
  }
  await flushSlice(); // deposita o tempo desta fase antes de validar
  modalOpenAt=Date.now(); // segue contando com a fase aberta
  if(v===c.flag){
    if(!solved[c.id]){
      // fallback: sem marca de ataque, o cronômetro nasce na 1ª flag
      if(Object.keys(solved).length===0){
        if(currentUser){ const us=getUsers(); if(us[currentUser]&&!us[currentUser].attackStart){ us[currentUser].attackStart=Date.now(); setUsers(us); } }
        else if(!localStorage.getItem("ctf_attack")) localStorage.setItem("ctf_attack",Date.now());
      }
      solved[c.id]=Date.now(); save();
      if(!ONLINE&&currentUser){
        const us2=getUsers(); const uu=us2[currentUser];
        if(uu){ uu.phaseMs=uu.phaseMs||{}; uu.phaseMs[c.id]=parseInt(uu.activeMs||0); setUsers(us2); }
      }
    }
    // recorde: tempo ATIVO somado (congelado ao zerar)
    if(!ONLINE&&currentUser && Object.keys(solved).length===CHALLENGES.length){
      const users=getUsers(); const el=elapsedNow();
      if(users[currentUser]){
        users[currentUser].frozenMs=el;
        if(users[currentUser].bestFullTime==null||el<users[currentUser].bestFullTime) users[currentUser].bestFullTime=el;
        setUsers(users);
      }
    }
    msg.textContent="🎉 CORRETO! +"+pontosDe(c)+" pts — "+patente(totalPontos());
    msg.className="mmsg ok";
    toast("🚩 Flag correta! +"+pontosDe(c)+" pts");
    renderGrid(); abrirModalRefreshPts(c); renderRanking(); autoSaveRanking();
    if(Object.keys(solved).length===CHALLENGES.length) setTimeout(()=>toast("🏴‍☠️ LENDA! Você zerou os "+CHALLENGES.length+" desafios!"),800);
  } else { msg.textContent="❌ Flag incorreta. Tente de novo!"; msg.className="mmsg err"; }
}

// ---------- WIDGETS DOS DESAFIOS ----------
function toast(t){ const e=document.getElementById("toast"); e.textContent=t; e.classList.remove("hidden"); clearTimeout(e._t); e._t=setTimeout(()=>e.classList.add("hidden"),2600); }
function out(id,html){ const e=document.getElementById(id); if(e) e.innerHTML=html; }
function robotsSecret(){ out("robotsOut",`<div class="live ok" style="margin-top:8px">📂 /segredo.txt → <b>CTF-BR{r0b0ts_n4o_m3nt3m}</b></div>`); }
function decB64(s,oid){ try{ out(oid,`<div class="live ok" style="margin-top:8px">✅ Decodificado: <b>${atob(s)}</b></div>`);}catch{ out(oid,`<div class="live no">❌ Base64 inválido</div>`);} }
function caesarDec(s,shift){ let o=""; for(const ch of s){ if(ch>="a"&&ch<="z") o+=String.fromCharCode((ch.charCodeAt(0)-97-shift+260)%26+97); else if(ch>="A"&&ch<="Z") o+=String.fromCharCode((ch.charCodeAt(0)-65-shift+260)%26+65); else o+=ch;} return o; }
function decCaesar(){ const sh=parseInt(document.getElementById("caesarShift").value||"7"); out("caesarOut",`<div class="live ok" style="margin-top:8px">✅ shift ${sh}: <b>${caesarDec("JAM-IY{j4lz4y_c1c3}",sh)}</b>${sh===7?" ← É A FLAG!":""}</div>`); }
function showCookies(){ out("cookieOut",`<div class="live ok" style="margin-top:8px">🍪 document.cookie = <b>${document.cookie||"(vazio? recarregue a página)"}</b></div>`); }
function showUA(){ out("uaOut",`<div class="live" style="margin-top:8px">🧭 ${navigator.userAgent}</div>`); }
function showLocalParts(){ out("lsOut",`<div class="live ok" style="margin-top:8px">parte1=<b>${localStorage.getItem("ctf_parte1")}</b><br>parte2=<b>${localStorage.getItem("ctf_parte2")}</b><br>Juntas: <b>${localStorage.getItem("ctf_parte1")}${localStorage.getItem("ctf_parte2")}</b></div>`); }
function sqliLogin(){
  const u=document.getElementById("sqliU").value, p=document.getElementById("sqliP").value;
  const bypass=/(['"]\s*or\s*['\"]?1['\"]?\s*=\s*['\"]?1|or\s+1\s*=\s*1|--)/i.test(u+" "+p);
  if((u==="admin"&&p==="admin123")||bypass) out("sqliOut",`<div class="live ok" style="margin-top:8px">✅ Bem-vindo, <b>admin</b>! Flag: <b>CTF-BR{sql1_byp4ss_m4st3r}</b></div>`);
  else out("sqliOut",`<div class="live no" style="margin-top:8px">❌ Login falhou. Query: SELECT * FROM users WHERE user='${u}' AND pass='${p}'</div>`);
}
async function crackHash(){
  const w=(document.getElementById("hashWord").value||"").trim();
  if(!w) return toast(T("m.passCand"));
  const buf=await crypto.subtle.digest("MD5",new TextEncoder().encode(w)).catch(()=>null);
  let hex="";
  if(buf){ hex=[...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,"0")).join(""); }
  else { hex=md5js(w); }
  if(hex==="8621ffdbc5698829397d97767ac13db3") out("hashOut",`<div class="live ok" style="margin-top:8px">✅ HASH QUEBRADO! senha=<b>${w}</b> → Flag: <b>CTF-BR{h4sh_br3ak3r}</b></div>`);
  else out("hashOut",`<div class="live no" style="margin-top:8px">❌ ${w} → ${hex} ≠ alvo</div>`);
}
function md5js(s){ // fallback simples: só conhece a wordlist
  const table={"dragon":"8621ffdbc5698829397d97767ac13db3"};
  return table[s]||"????????????????????????????????";
}
async function bruteHash(){
  const wl=["123456","password","qwerty","dragon","letmein","admin","pato123"];
  out("hashOut",`<div class="live">⚡ Testando ${wl.length} senhas...</div>`);
  for(const w of wl){ const h = w==="dragon"?"8621ffdbc5698829397d97767ac13db3":"xxxx"; if(h==="8621ffdbc5698829397d97767ac13db3"){ out("hashOut",`<div class="live ok">✅ Encontrada! senha=<b>dragon</b> (${wl.indexOf(w)+1}/${wl.length} tentativas) → Flag: <b>CTF-BR{h4sh_br3ak3r}</b></div>`); return; } }
}
function b64urlDecode(s){ s=s.replace(/-/g,"+").replace(/_/g,"/"); while(s.length%4)s+="="; return decodeURIComponent(escape(atob(s))); }
function decodeJWT(){ try{ const p=b64urlDecode("eyJ1c2VyIjoiZ3Vlc3QiLCJhZG1pbiI6ZmFsc2V9"); out("jwtOut",`<div class="live" style="margin-top:8px">📦 payload guest: <b>${p}</b></div>`);}catch(e){} }
function forgeJWT(){ out("jwtOut",`<div class="live ok" style="margin-top:8px">🛠️ Token ADMIN forjado (alg=none):<br><b>eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VyIjoiZ3Vlc3QiLCJhZG1pbiI6dHJ1ZX0.</b><br>✅ GET /admin → 200! Flag: <b>CTF-BR{jwt_n0n3_4lg}</b></div>`); }
function deobf(){ const a=[67,84,70,45,66,82,123,106,52,118,52,115,99,114,49,112,116,95,114,51,118,51,114,115,51,125]; out("obfOut",`<div class="live ok" style="margin-top:8px">✅ ${String.fromCharCode(...a)}</div>`); }
function hexToAscii(){ const hx="43 54 46 2D 42 52 7B 70 6E 67 5F 6D 34 67 31 63 5F 62 79 37 65 73 7D"; const t=hx.split(" ").map(h=>String.fromCharCode(parseInt(h,16))).join(""); out("hexOut",`<div class="live ok" style="margin-top:8px">✅ ${t}</div>`); }
function vigDec(ciph,key){
  key=key.toUpperCase(); let o="",ki=0;
  for(const ch of ciph){ if(/[a-zA-Z]/.test(ch)){ const base=ch===ch.toUpperCase()?65:97; const k=key.charCodeAt(ki%key.length)-65; o+=String.fromCharCode((ch.charCodeAt(0)-base-k+260)%26+base); ki++; } else o+=ch; }
  return o;
}
function decVig(){ const k=document.getElementById("vigKey").value||"CHAVE"; const r=vigDec("EAF-WV{x1n3n3m3_v3u1zt3}",k); out("vigOut",`<div class="live ${r==="CTF-BR{v1g3n3r3_r3s1st3}"?"ok":"no"}" style="margin-top:8px">${r==="CTF-BR{v1g3n3r3_r3s1st3}"?"✅ FLAG: <b>"+r+"</b>":"❌ Com chave "+k+": "+r}</div>`); }
function crackMe(){
  const s=document.getElementById("crackIn").value;
  const ok=s.length===9&&s[0]==="1"&&s.slice(4)==="h4x0r"&&[...s].reduce((a,c)=>a+c.charCodeAt(0),0)===719;
  out("crackOut", ok?`<div class="live ok" style="margin-top:8px">✅ CRACKED! Flag: <b>CTF-BR{cr4ckm3_m4st3r_1337}</b></div>`:`<div class="live no" style="margin-top:8px">❌ Senha errada. Dica: começa com 1, termina com h4x0r, soma=719.</div>`);
}
function traversal(){
  const v=(document.getElementById("travIn").value||"").trim();
  if(v.includes("..")&&v.includes("etc/flag")||v.includes("etc\\flag")) out("travOut",`<div class="live ok" style="margin-top:8px">📂 /etc/flag.txt → <b>CTF-BR{p4th_tr4v3rs4l_r00t}</b></div>`);
  else out("travOut",`<div class="live no" style="margin-top:8px">❌ Arquivo não encontrado: ./arquivos/${v||"(vazio)"}</div>`);
}
function checkRSA(){
  const m=(document.getElementById("rsaM").value||"").trim();
  out("rsaOut", m==="2024"?`<div class="live ok" style="margin-top:8px">✅ m=2024 correto! Flag: <b>CTF-BR{rs4_2024_br0k3n}</b></div>`:`<div class="live no" style="margin-top:8px">❌ m=${m||"?"} incorreto. Fatore n primeiro.</div>`);
}
function factorN(){ out("rsaOut",`<div class="live ok" style="margin-top:8px">🧮 2537 = <b>43 × 59</b>. phi=2436. d=937. m = 98<sup>937</sup> mod 2537 = <b>2024</b></div>`); }
function bossStep(n){
  if(n===1) out("bossOut",`<div class="live" style="margin-top:8px">1️⃣ Base64: <b>}ff0o_y4a1s_a01cz4up_sgp{EO-SGP</b></div>`);
  if(n===2) out("bossOut",`<div class="live" style="margin-top:8px">2️⃣ ROT13: <b>}ss0b_l4n1f_n01pm4hc_ftc{RB-FTC</b></div>`);
  if(n===3) out("bossOut",`<div class="live ok" style="margin-top:8px">3️⃣ Reverse: <b>CTF-BR{ctf_ch4mp10n_f1n4l_b0ss}</b> 👑</div>`);
}
// ----- desafios 21-30 -----
function checkPin(){
  const v=(document.getElementById("pinIn").value||"").trim();
  out("pinOut", v==="2026"?`<div class="live ok" style="margin-top:8px">✅ Cofre aberto! Flag: <b>CTF-BR{p1n_c0d3_2026}</b></div>`:`<div class="live no" style="margin-top:8px">❌ PIN ${v||"?"} incorreto. Dica: 2014+12.</div>`);
}
function decMorse(){
  const M={"--":"M","---":"O",".-.":"R","...":"S",".":"E"};
  const w="-- --- .-. ... .".split(" ").map(c=>M[c]||"?").join("");
  out("morseOut",`<div class="live ok" style="margin-top:8px">✅ "${w}" → troque O por 0: Flag <b>CTF-BR{m0rs3_c0d3}</b></div>`);
}
function xssTest(){
  const v=document.getElementById("xssIn").value||"";
  if(/<script[\s>]/i.test(v)) out("xssOut",`<div class="live ok" style="margin-top:8px">💥 XSS executado! <i>Olá, ${v.replace(/</g,"&lt;")}</i><br>Flag: <b>CTF-BR{xss_r3fl3ct3d}</b></div>`);
  else out("xssOut",`<div class="live no" style="margin-top:8px">🔍 "Olá, <b>${v.replace(/</g,"&lt;")||"visitante"}</b>!" — nada aconteceu. Tente injetar &lt;script&gt;.</div>`);
}
function atbash(s){ let o=""; for(const ch of s){ if(ch>="a"&&ch<="z") o+=String.fromCharCode(219-ch.charCodeAt(0)); else if(ch>="A"&&ch<="Z") o+=String.fromCharCode(155-ch.charCodeAt(0)); else o+=ch; } return o; }
function decAtbash(){ out("atbashOut",`<div class="live ok" style="margin-top:8px">✅ ${atbash("XGU-YI{4gy4hs_n4hg3i}")}</div>`); }
function grepLog(){ out("logOut",`<div class="live ok" style="margin-top:8px">✅ $ grep CTF access.log<br>→ 10.9.8.7 ... "GET /admin?debug=<b>CTF-BR{l0g_hunt3r_4p4ch3}</b>..." 200 <b>← INVASOR!</b></div>`); }
function b32dec(s){
  const A="ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"; let bits="", out2="";
  s=s.replace(/=+$/,"").toUpperCase();
  for(const ch of s){ const v=A.indexOf(ch); if(v<0) throw 0; bits+=v.toString(2).padStart(5,"0"); }
  for(let i=0;i+8<=bits.length;i+=8) out2+=String.fromCharCode(parseInt(bits.slice(i,i+8),2));
  return out2;
}
function decB32(){ try{ out("b32Out",`<div class="live ok" style="margin-top:8px">✅ ${b32dec("INKEMLKCKJ5WENDTGNPTGMS7OIYGG23TPU======")}</div>`);}catch(e){ out("b32Out",`<div class="live no">❌ Erro</div>`);} }
function decXor(){
  const k=parseInt(document.getElementById("xorKey").value||"");
  const bytes=[0x01,0x16,0x04,0x6f,0x00,0x10,0x39,0x3a,0x72,0x30,0x1d,0x29,0x71,0x3b,0x1d,0x76,0x70,0x3f];
  if(isNaN(k)||k<0||k>255){ out("xorOut",`<div class="live no" style="margin-top:8px">❌ Chave 0-255.</div>`); return; }
  const t=bytes.map(b=>String.fromCharCode(b^k)).join("");
  const ok=t==="CTF-BR{x0r_k3y_42}";
  out("xorOut",`<div class="live ${ok?"ok":"no"}" style="margin-top:8px">${ok?"✅ FLAG: <b>"+t+"</b>":"❌ chave "+k+": "+t.replace(/</g,"&lt;")}</div>`);
}
function sstiTest(){
  const v=document.getElementById("sstiIn").value||"";
  if(v.includes("{{7*7}}")) out("sstiOut",`<div class="live ok" style="margin-top:8px">🧪 Renderizado: "Olá <b>49</b>" — SSTI confirmado! Flag: <b>CTF-BR{sst1_7x7_49}</b></div>`);
  else out("sstiOut",`<div class="live no" style="margin-top:8px">🧪 "Olá <b>${v.replace(/</g,"&lt;")||"visitante"}</b>" — template literal, nada executou.</div>`);
}
function faesaStep(n){
  if(n===1) out("faesaOut",`<div class="live" style="margin-top:8px">1️⃣ Hex→ASCII: <b>}xx0g_q4s1k_4x34k{WG-KYH</b></div>`);
  if(n===2) out("faesaOut",`<div class="live" style="margin-top:8px">2️⃣ César -5: <b>}ss0b_l4n1f_4s34f{RB-FTC</b></div>`);
  if(n===3) out("faesaOut",`<div class="live ok" style="margin-top:8px">3️⃣ Reverse: <b>CTF-BR{f43s4_f1n4l_b0ss}</b> 👑</div>`);
}
// ----- desafios 31-40 -----
let _clicks=0;
function clickSpam(){
  _clicks++;
  const n=document.getElementById("clickN"); if(n) n.textContent=Math.min(_clicks,15);
  if(_clicks>=15) out("clickOut",`<div class="live ok" style="margin-top:8px">✅ Cofre aberto na raça! Flag: <b>CTF-BR{cl1ck_sp4m}</b></div>`);
}
function decROT(){ out("rotOut",`<div class="live ok" style="margin-top:8px">✅ ${caesarDec("PGS-OE{e0g13_o4ol}",13)}</div>`); }
function decBinary(){
  const t="01000110 01000001 01000101 01010011 01000001".split(" ").map(b=>String.fromCharCode(parseInt(b,2))).join("");
  out("binOut",`<div class="live ok" style="margin-top:8px">✅ "${t}" → troque O por 0: Flag <b>CTF-BR{b1n4ry_f43s4}</b></div>`);
}
function decRail(){
  const c="CB4f3T-Rr1_3c}F{ln", r=3, L=c.length, pat=[];
  let row=0, dr=1;
  for(let p=0;p<L;p++){ pat.push(row); row+=dr; if(row===0||row===r-1) dr*=-1; }
  const rails=["","",""]; let idx=0;
  for(let rr=0;rr<r;rr++){ const n=pat.filter(x=>x===rr).length; rails[rr]=c.slice(idx,idx+n); idx+=n; }
  const pos=[0,0,0]; let o="";
  for(let p=0;p<L;p++){ const rr=pat[p]; o+=rails[rr][pos[rr]++]; }
  out("railOut",`<div class="live ok" style="margin-top:8px">✅ ${o}</div>`);
}
function redirectTest(){
  const v=(document.getElementById("redirIn").value||"").trim();
  if(/^(https?:)?\/\//i.test(v)&&!/localhost|127\.0\.0\.1|faesa/i.test(v)) out("redirOut",`<div class="live ok" style="margin-top:8px">🎣 Redirect aberto! Vítima iria para <b>${v.replace(/</g,"&lt;")}</b><br>Flag: <b>CTF-BR{0p3n_r3d1r3ct}</b></div>`);
  else out("redirOut",`<div class="live no" style="margin-top:8px">🔗 Redirecionado para <b>${(v||"/painel").replace(/</g,"&lt;")}</b> (interno, sem graça). Aponte para FORA.</div>`);
}
function xxeTest(){
  const v=document.getElementById("xxeIn").value||"";
  if(/<!ENTITY/i.test(v)&&/SYSTEM/i.test(v)) out("xxeOut",`<div class="live ok" style="margin-top:8px">📄 Entidade expandida! /etc/flag.txt → <b>CTF-BR{xx3_3nt1ty}</b></div>`);
  else out("xxeOut",`<div class="live no" style="margin-top:8px">📄 Parse OK, nada vazou. Tente &lt;!ENTITY x SYSTEM ...&gt;.</div>`);
}
function b58dec(s){
  const A="123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let pad=0; while(pad<s.length&&s[pad]==="1") pad++;
  const body=s.slice(pad), bytes=[0];
  for(const ch of body){
    const v=A.indexOf(ch); if(v<0) throw 0;
    let carry=v;
    for(let i=0;i<bytes.length;i++){ const t=bytes[i]*58+carry; bytes[i]=t&255; carry=t>>8; }
    while(carry>0){ bytes.push(carry&255); carry>>=8; }
  }
  bytes.reverse();
  let i=0; while(i<bytes.length-1&&bytes[i]===0) i++;
  return "\x00".repeat(pad)+bytes.slice(i).map(function(b){ return String.fromCharCode(b); }).join("");
}
function decB58(){ try{ out("b58Out",`<div class="live ok" style="margin-top:8px">✅ ${b58dec("598ZE316J5dY3Q7H3JUwXrqYXD9SL")}</div>`);}catch(e){ out("b58Out",`<div class="live no">❌ Erro</div>`);} }
function boss2Step(n){
  if(n===1) out("boss2Out",`<div class="live" style="margin-top:8px">1️⃣ Reverse: <b>KBDVGLKPIV5XGNBTMY2F63ZQMZTF62JSPU======</b></div>`);
  if(n===2) out("boss2Out",`<div class="live" style="margin-top:8px">2️⃣ Base32: <b>PGS-OE{s43f4_o0ff_i2}</b></div>`);
  if(n===3) out("boss2Out",`<div class="live ok" style="margin-top:8px">3️⃣ ROT13: <b>CTF-BR{ctf_ch4mp10n_f1n4l_b0ss}</b> 👑</div>`);
}
// ----- desafios 51-100 -----
function loginPadrao(){
  const u=document.getElementById("defU").value, p=document.getElementById("defP").value;
  out("defOut",(u==="admin"&&p==="admin")?`<div class="live ok" style="margin-top:8px">✅ Bem-vindo! Flag: <b>CTF-BR{d3f4ult_p4ss}</b></div>`:`<div class="live no" style="margin-top:8px">❌ Credenciais inválidas.</div>`);
}
function decHex(){ try{ const s="4354462d42527b6833785f34736331317d"; out("hex2Out",`<div class="live ok" style="margin-top:8px">✅ ${s.match(/../g).map(h=>String.fromCharCode(parseInt(h,16))).join("")}</div>`);}catch(e){} }
let _jk=[0,0];
function jokenpo(m){
  const ops=["pedra","papel","tesoura"], pc=ops[Math.floor(Math.random()*3)];
  const win=(m==="pedra"&&pc==="tesoura")||(m==="papel"&&pc==="pedra")||(m==="tesoura"&&pc==="papel");
  if(m===pc) out("jkOut",`<div class="live" style="margin-top:8px">🤝 Empate! Máquina também jogou ${pc}.</div>`);
  else if(win){ _jk[0]++; out("jkOut",`<div class="live ok" style="margin-top:8px">✅ ${m} ganha de ${pc}!</div>`); }
  else { _jk[1]++; out("jkOut",`<div class="live no" style="margin-top:8px">❌ ${pc} ganha de ${m}.</div>`); }
  document.getElementById("jkScore").textContent=`Você ${_jk[0]} × ${_jk[1]} Máquina`;
  if(_jk[0]>=2) out("jkOut",`<div class="live ok" style="margin-top:8px">🏆 Portão aberto! Flag: <b>CTF-BR{r0ck_p4p3r}</b></div>`);
  if(_jk[1]>=2){ out("jkOut",`<div class="live no" style="margin-top:8px">🤖 Guardião venceu. Placar zerado, tente de novo!</div>`); _jk=[0,0]; document.getElementById("jkScore").textContent=`Você 0 × 0 Máquina`; }
}
function decZero(){
  try{
    const zw=document.getElementById("zwdata").textContent;
    const bits=[...zw].map(c=>c==="\u200b"?"0":c==="\u200c"?"1":"").join("");
    const t=bits.match(/.{8}/g).map(b=>String.fromCharCode(parseInt(b,2))).join("");
    out("zeroOut",`<div class="live ok" style="margin-top:8px">✅ "${t}" → minúsculo + A→4: Flag <b>CTF-BR{z3r0_w1dth}</b></div>`);
  }catch(e){ out("zeroOut",`<div class="live no">❌ Não achei os invisíveis.</div>`); }
}
function rot47(s){ let o=""; for(const ch of s){ const c=ch.charCodeAt(0); o+=(c>=33&&c<=126)?String.fromCharCode(33+((c-33+47)%94)):ch; } return o; }
function decROT47(){ out("rot47Out",`<div class="live ok" style="margin-top:8px">✅ ${rot47(document.getElementById("rot47c").textContent)}</div>`); }
function hostTest(){
  const v=(document.getElementById("hostIn").value||"").trim().toLowerCase();
  out("hostOut",v.includes("evil.com")?`<div class="live ok" style="margin-top:8px">🎣 Reset enviado para <b>evil.com/reset?token=abc</b>! Flag: <b>CTF-BR{h0st_h34d3r}</b></div>`:`<div class="live no" style="margin-top:8px">📧 Reset foi para <b>${(v||"site.com").replace(/</g,"&lt;")}</b> (dono legítimo, sem graça).</div>`);
}
function upTest(){
  const v=(document.getElementById("upIn").value||"").trim().toLowerCase();
  if(/\.php\.jpg$|\.phtml\.jpg$/i.test(v)) out("upOut",`<div class="live no" style="margin-top:8px">❌ Dupla extensão bloqueada!</div>`);
  else if(/\.(php|phtml|phar)(\.|$)/i.test(v)||/\.(php|phtml|phar)$/i.test(v)) out("upOut",`<div class="live ok" style="margin-top:8px">🐚 Shell upado em /uploads/${v.replace(/</g,"&lt;")}! Flag: <b>CTF-BR{sh3ll_upl04d}</b></div>`);
  else out("upOut",`<div class="live no" style="margin-top:8px">❌ Só imagens! (${(v||"?").replace(/</g,"&lt;")} rejeitado)</div>`);
}
function hppTest(){
  const v=(document.getElementById("hppIn").value||"").trim();
  const ids=[...v.matchAll(/id=(\d+)/g)].map(m=>m[1]);
  const last=ids[ids.length-1];
  out("hppOut",last==="7"?`<div class="live ok" style="margin-top:8px">🎯 Backend usou o ÚLTIMO id=${last} (admin)! Flag: <b>CTF-BR{hpp_p0llut10n}</b></div>`:`<div class="live no" style="margin-top:8px">👤 Perfil id=${last||"?"} (comum). O admin é o 7...</div>`);
}
function subDec(){
  const A="ABCDEFGHIJKLMNOPQRSTUVWXYZ", P="QWERTYUIOPASDFGHJKLZXCVBNM";
  const inv={}; for(let i=0;i<26;i++) inv[P[i]]=A[i];
  const t="EZY-WK{LXWLZ1ZXZ10F}".split("").map(c=>inv[c.toUpperCase()]||c).join("");
  out("subOut",`<div class="live ok" style="margin-top:8px">✅ ${t}</div>`);
}
function vigFruta(){
  const k=(document.getElementById("vigF").value||"").trim().toUpperCase();
  const r=vigDec("WOF-VM{V1A_AROOA}",k);
  out("vigFOut",`<div class="live ${r==="CTF-BR{V1G_FRUTA}"?"ok":"no"}" style="margin-top:8px">${r==="CTF-BR{V1G_FRUTA}"?"✅ FLAG: <b>"+r+"</b>":"❌ Com chave "+(k||"?")+": "+r}</div>`);
}
function cubeTest(){
  const v=(document.getElementById("cubeIn").value||"").trim();
  out("cubeOut",v==="2026"?`<div class="live ok" style="margin-top:8px">✅ m=2026! Flag: <b>CTF-BR{cub3_2026}</b></div>`:`<div class="live no" style="margin-top:8px">❌ ${v||"?"}³ ≠ c.</div>`);
}
function cubeRoot(){ out("cubeOut",`<div class="live ok" style="margin-top:8px">✅ cbrt(8316073576) = <b>${Math.round(Math.cbrt(8316073576))}</b></div>`); }
function crc32js(s){
  let t=[], c;
  for(let n=0;n<256;n++){ c=n; for(let k=0;k<8;k++) c=c&1?0xEDB88320^(c>>>1):c>>>1; t[n]=c; }
  let crc=0xFFFFFFFF;
  for(let i=0;i<s.length;i++) crc=t[(crc^s.charCodeAt(i))&255]^(crc>>>8);
  return (crc^0xFFFFFFFF)>>>0;
}
const CRC_TGT=0x56c2c6ca;
function crcTest(){
  const v=(document.getElementById("crcIn").value||"").trim();
  const h=crc32js("SUPORTE"+v);
  out("crcOut",h===CRC_TGT?`<div class="live ok" style="margin-top:8px">✅ CRC bateu! Flag: <b>CTF-BR{crc32_c0l1s10n}</b></div>`:`<div class="live no" style="margin-top:8px">❌ crc32=${h.toString(16)} ≠ 56c2c6ca.</div>`);
}
function crcBrute(){
  out("crcOut",`<div class="live">⚡ Brute 0000-9999...</div>`);
  setTimeout(()=>{
    for(let i=0;i<10000;i++){ const s=String(i).padStart(4,"0"); if(crc32js("SUPORTE"+s)===CRC_TGT){ out("crcOut",`<div class="live ok">✅ Sufixo: <b>${s}</b>! Flag: <b>CTF-BR{crc32_c0l1s10n}</b></div>`); return; } }
  },50);
}
function dnsDec(){ try{ out("dnsOut",`<div class="live ok" style="margin-top:8px">✅ ${atob("Q1RGLUJS"+"e2RuNV8z"+"eGYxbH0=")}</div>`);}catch(e){} }
function ouiTest(){
  const v=(document.getElementById("ouiIn").value||"").trim().toLowerCase();
  out("ouiOut",v.includes("faesatech")||v.includes("faesa tech")?`<div class="live ok" style="margin-top:8px">✅ Fabricante correto! Flag: <b>CTF-BR{0u1_f4354t3ch}</b></div>`:`<div class="live no" style="margin-top:8px">❌ "${v||"?"}" não bate com a OUI.</div>`);
}
function osintTest(){
  const v=(document.getElementById("osintIn").value||"").trim().toLowerCase();
  out("osintOut",v==="ana.silva@faesa.edu.br"?`<div class="live ok" style="margin-top:8px">✅ Pivot completo! Flag: <b>CTF-BR{p1v0t_3m41l}</b></div>`:`<div class="live no" style="margin-top:8px">❌ E-mail não confere.</div>`);
}
function geoTest(){
  const v=(document.getElementById("geoIn").value||"").trim().toLowerCase();
  const ok=v.includes("rio de janeiro")||v==="rio"||v.includes("rio de janeiro");
  out("geoOut",ok?`<div class="live ok" style="margin-top:8px">✅ É o Rio! Flag: <b>CTF-BR{g30_r10}</b></div>`:`<div class="live no" style="margin-top:8px">❌ Não é "${v||"?"}". Olhe as pistas de novo.</div>`);
}
function pycDec(){
  const a=[22,1,19,120,23,7,46,37,44,54,10,49,100,38,97,38,38,40];
  out("pycOut",`<div class="live ok" style="margin-top:8px">✅ ${String.fromCharCode(...a.map(b=>b^0x55))}</div>`);
}
function crack2(){
  const v=document.getElementById("crack2In").value||"";
  let ok=false;
  try{ ok=btoa([...v].reverse().join(""))==="NjIwMmFzZWFm"; }catch(e){}
  out("crack2Out",ok?`<div class="live ok" style="margin-top:8px">✅ CRACKED! Flag: <b>CTF-BR{cr4ckm3_v2}</b></div>`:`<div class="live no" style="margin-top:8px">❌ Senha errada.</div>`);
}
function decLSB(){
  const t="01001111 01001001".split(" ").map(b=>String.fromCharCode(parseInt(b,2))).join("");
  out("lsbOut",`<div class="live ok" style="margin-top:8px">✅ "${t}" piscado!</div>`);
}
function regexTest(){
  const v=document.getElementById("reIn").value||"";
  let re;
  try{ re=new RegExp(v); }catch(e){ out("reOut",`<div class="live no" style="margin-top:8px">❌ Regex inválida.</div>`); return; }
  const r=[["CTF-2026",true],["abc123",true],["admin",false],["",false]].map(([s,want])=>({s,want,got:re.test(s)}));
  const ok=r.every(x=>x.got===x.want);
  out("reOut",(ok?`<div class="live ok" style="margin-top:8px">✅ 4/4! Flag: <b>CTF-BR{r3g3x_m4st3r}</b></div>`:`<div class="live no" style="margin-top:8px">❌ Falhou.</div>`)+r.map(x=>`<div class="live">${x.got===x.want?"✅":"❌"} "${x.s}" → ${x.got} (esperado ${x.want})</div>`).join(""));
}
function primeTest(){
  const v=(document.getElementById("primeIn").value||"").trim();
  out("primeOut",v==="328"?`<div class="live ok" style="margin-top:8px">✅ Soma correta! Flag: <b>CTF-BR{pr1m3s_328}</b></div>`:`<div class="live no" style="margin-top:8px">❌ ${v||"?"} ≠ soma.</div>`);
}
function jsonpTest(){
  const v=document.getElementById("jsonpIn").value||"";
  if(/<script|alert\s*\(|onerror|javascript:/i.test(v)) out("jsonpOut",`<div class="live ok" style="margin-top:8px">💥 Refletido sem escape: ${v.replace(/</g,"&lt;")}<br>Flag: <b>CTF-BR{js0np_h1j4ck}</b></div>`);
  else out("jsonpOut",`<div class="live no" style="margin-top:8px">${v.replace(/</g,"&lt;")||"processa"}({...}) — inofensivo.</div>`);
}
function baconDec(){
  const T={AAAAA:"A",AAAAB:"B",AAABA:"C",AAABB:"D",AABAA:"E",AABAB:"F",AABBA:"G",ABBAA:"H",ABBAB:"I",ABBBB:"K",BAABA:"L",BAABB:"M",BABAA:"N",BABAB:"O",BABBA:"P",BBAAA:"Q",BBAAB:"R",BBABA:"S",BBABB:"T",BBBAB:"U",BBBAA:"W",BBBAB2:"X",BBBBA:"Y",BBBBB:"Z"};
  const t="AABAB AAAAA AABAA BBABA AAAAA".split(" ").map(g=>T[g]||"?").join("");
  out("baconOut",`<div class="live ok" style="margin-top:8px">✅ "${t}" → f43s4: Flag <b>CTF-BR{b4c0n_f43s4}</b></div>`);
}
function wordFind(){
  const v=(document.getElementById("wordIn").value||"").trim().toUpperCase();
  out("wordOut",v==="FAESA"?`<div class="live ok" style="margin-top:8px">✅ Achou! Flag: <b>CTF-BR{w0rd_f4354}</b></div>`:`<div class="live no" style="margin-top:8px">❌ "${v||"?"}" não é a palavra.</div>`);
}
function nosqlTest(){
  const u=document.getElementById("nosqlU").value, p=document.getElementById("nosqlP").value;
  out("nosqlOut",/\$ne|\$gt|\$regex/i.test(u+" "+p)?`<div class="live ok" style="margin-top:8px">✅ Operador injetado — logado sem senha! Flag: <b>CTF-BR{n0sql_1nj3ct}</b></div>`:`<div class="live no" style="margin-top:8px">❌ Login falhou. Tente um operador Mongo ($ne...).</div>`);
}
function protoTest(){
  const v=document.getElementById("protoIn").value||"";
  out("protoOut",v.includes("__proto__")&&/admin/i.test(v)?`<div class="live ok" style="margin-top:8px">☠️ {}.admin === true! Flag: <b>CTF-BR{pr0t0_p0llut10n}</b></div>`:`<div class="live no" style="margin-top:8px">❌ Protótipo intacto.</div>`);
}
function smugTest(){
  const v=document.getElementById("smugIn").value||"";
  const hasCL=/content-length/i.test(v), hasTE=/transfer-encoding/i.test(v);
  out("smugOut",(hasCL&&hasTE)?`<div class="live ok" style="margin-top:8px">📦 Desync CL.TE! Request contrabandeado! Flag: <b>CTF-BR{smuggl3d_r3q}</b></div>`:`<div class="live no" style="margin-top:8px">❌ Precisa dos DOIS headers (tem CL:${hasCL} TE:${hasTE}).</div>`);
}
function jwtConfTest(){
  const v=(document.getElementById("algIn").value||"").trim().toUpperCase();
  out("algOut",v==="HS256"?`<div class="live ok" style="margin-top:8px">✅ Assinado com a public key! Flag: <b>CTF-BR{4lg_c0nfus10n}</b></div>`:`<div class="live no" style="margin-top:8px">❌ alg=${v||"?"} rejeitado.</div>`);
}
function bitflipCheck(){
  const v=(document.getElementById("flipIn").value||"").trim().toLowerCase().replace(/\s/g,"");
  if(!/^[0-9a-f]{64}$/.test(v)){ out("flipOut",`<div class="live no" style="margin-top:8px">❌ Preciso de 64 hex (IV+C1+C2+C3).</div>`); return; }
  const key=[0x4B,0x33,0x59,0x21,0x4B,0x33,0x59,0x21];
  const B=[]; for(let i=0;i<32;i++) B.push(parseInt(v.slice(i*2,i*2+2),16));
  const D=B.map((b,i)=>b^key[i%8]);
  const pt=D.map((b,i)=>b^(i<8?B[i+8]:B[i-8]));
  const txt=String.fromCharCode(...pt.slice(8));
  out("flipOut",txt.includes("root")?`<div class="live ok" style="margin-top:8px">🍪 Decifrado: ...<b>root</b>... Flag: <b>CTF-BR{b1t_fl1pp1ng}</b></div>`:`<div class="live no" style="margin-top:8px">🍪 Decifrado não tem 'root'. Continue flipando o IV.</div>`);
}
function hastadSolve(){
  try{
    const B=(x=>typeof x==="bigint"?x:BigInt(x));
    const N=[[B(1000033),B(880626)],[B(1000037),B(355673)],[B(1000081),B(585372)]];
    const eg=(a,b)=>{
      if(b===B(0)) return [a,B(1),B(0)];
      const r=eg(b,a%b);
      return [r[0],r[2],r[1]-(a/b)*r[2]];
    };
    const NN=N[0][0]*N[1][0]*N[2][0];
    let x=B(0);
    N.forEach(pair=>{ const Ni=NN/pair[0]; const rr=eg(Ni,pair[0]); x=(x+pair[1]*Ni*rr[1])%NN; });
    if(x<B(0)) x+=NN;
    const m=Math.round(Math.cbrt(Number(x)));
    out("hastadOut",`<div class="live ok" style="margin-top:8px">✅ m³=${x} → m=<b>${m}</b></div>`);
  }catch(e){ out("hastadOut",`<div class="live no">❌ Precisa de BigInt (navegador moderno).</div>`); }
}
function ecbTest(){
  const v=(document.getElementById("ecbIn").value||"").replace(/\s/g,"");
  out("ecbOut",v==="1,3"||v==="1-3"||v==="13"?`<div class="live ok" style="margin-top:8px">✅ B1==B3! É ECB! Flag: <b>CTF-BR{3cb_p3ngu1n}</b></div>`:`<div class="live no" style="margin-top:8px">❌ Compare bloco a bloco de novo.</div>`);
}
function carveTest(){
  const v=(document.getElementById("carveIn").value||"").trim().toLowerCase().replace(/\s/g,"");
  out("carveOut",v.startsWith("ffd8ff")?`<div class="live ok" style="margin-top:8px">🪝 Magic restaurado — foto abre! Flag: <b>CTF-BR{c4rv3_jp3g}</b></div>`:`<div class="live no" style="margin-top:8px">❌ Ainda não abre.</div>`);
}
function vmCheck(){
  const s=document.getElementById("vmIn").value||"";
  const key=[0x46,0x41,0x45,0x53], tgt=[53,115,41,56,118,101];
  const ok=s.length===tgt.length&&[...s].every((ch,i)=>((ch.charCodeAt(0)^key[i%4]^i)&0xFF)===tgt[i]);
  out("vmOut",ok?`<div class="live ok" style="margin-top:8px">✅ VM aceitou! Flag: <b>CTF-BR{vm_r3v3rs3}</b></div>`:`<div class="live no" style="margin-top:8px">❌ VM rejeitou.</div>`);
}
function keygenTest(){
  const v=(document.getElementById("keyIn").value||"").trim();
  const ok=/^\d{4}$/.test(v)&&[...v].reduce((a,c,i)=>a+(i+1)*c.charCodeAt(0),0)%99991===504;
  out("keyOut",ok?`<div class="live ok" style="margin-top:8px">✅ Serial válido! Flag: <b>CTF-BR{k3yg3n_2024}</b></div>`:`<div class="live no" style="margin-top:8px">❌ Serial inválido.</div>`);
}
function keygenBrute(){
  out("keyOut",`<div class="live">⚡ Brute 0000-9999...</div>`);
  setTimeout(()=>{
    for(let i=0;i<10000;i++){ const s=String(i).padStart(4,"0"); if([...s].reduce((a,c,j)=>a+(j+1)*c.charCodeAt(0),0)%99991===504){ out("keyOut",`<div class="live ok">✅ Serial: <b>${s}</b>! Flag: <b>CTF-BR{k3yg3n_2024}</b></div>`); return; } }
  },50);
}
function alphaDec(){
  out("alphaOut",`<div class="live ok" style="margin-top:8px">✅ ${[70,65,69,83,65].map(c=>String.fromCharCode(c)).join("")}</div>`);
}
function chunkTest(){
  const v=(document.getElementById("chunkIn").value||"").trim().toUpperCase();
  out("chunkOut",v==="IDAT"?`<div class="live ok" style="margin-top:8px">✅ CRC quebrado no IDAT! Flag: <b>CTF-BR{chunk_b4d_crc}</b></div>`:`<div class="live no" style="margin-top:8px">❌ ${v||"?"} está íntegro. Tente outro.</div>`);
}
function missionTest(){
  const v=(document.getElementById("misIn").value||"").trim().toLowerCase();
  out("misOut",v==="rex"?`<div class="live ok" style="margin-top:8px">🗝️ Cofre aberto! Flag: <b>CTF-BR{p1v0t_r3x}</b></div>`:`<div class="live no" style="margin-top:8px">❌ Resposta errada.</div>`);
}
function bfRun(){
  const code="+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++.------.";
  let mem=new Array(300).fill(0), p=0, o="";
  for(const ch of code){
    if(ch==="+") mem[p]=(mem[p]+1)&255;
    else if(ch==="-") mem[p]=(mem[p]+255)&255;
    else if(ch===">") p++;
    else if(ch==="<") p--;
    else if(ch===".") o+=String.fromCharCode(mem[p]);
  }
  out("bfOut",`<div class="live ok" style="margin-top:8px">✅ Output: "<b>${o}</b>" → minúsculo na flag.</div>`);
}
function cacheTest(){
  const v=(document.getElementById("cacheIn").value||"").trim().toLowerCase();
  out("cacheOut",v.includes("evil")?`<div class="live ok" style="margin-top:8px">☠️ Cache envenenado! Token vazou para evil! Flag: <b>CTF-BR{c4ch3_p01s0n}</b></div>`:`<div class="live no" style="margin-top:8px">📧 E-mail foi pro dono legítimo.</div>`);
}
function autokeyDec(){
  const C="HTJ-TR{4WM0P3E_D1GN3E}", K="FAESA"; let o="", ki=0;
  const fullK=(K+C).toUpperCase();
  for(const ch of C){
    if(/[a-zA-Z]/.test(ch)){ const b=ch===ch.toUpperCase()?65:97; o+=String.fromCharCode((ch.charCodeAt(0)-b-(fullK.charCodeAt(ki)-65)+260)%26+b); ki++; }
    else o+=ch;
  }
  out("autoOut",`<div class="live ok" style="margin-top:8px">✅ ${o}</div>`);
}
function timeTest(){
  const v=(document.getElementById("timeIn").value||"").trim().toUpperCase().replace(/\s/g,"");
  out("timeOut",["B-D-A-E-C","BDAEC"].includes(v)?`<div class="live ok" style="margin-top:8px">✅ Timeline correta! Flag: <b>CTF-BR{t1m3l1n3_c0p}</b></div>`:`<div class="live no" style="margin-top:8px">❌ Ordem errada. Pense causa→efeito.</div>`);
}
function boss3Step(n){
  if(n===1) out("boss3Out",`<div class="live" style="margin-top:8px">1️⃣ Reverse: <b>BQYuXZGEF4XXAnXbsCrFFcS8nhGkii51f</b></div>`);
  if(n===2) out("boss3Out",`<div class="live" style="margin-top:8px">2️⃣ Base58: <b>r%u\\q#LDFACb&gt;_03_DD0\`__N</b> (cuidado: \\ e \` são literais!)</div>`);
  if(n===3) out("boss3Out",`<div class="live ok" style="margin-top:8px">3️⃣ ROT47: <b>CTF-BR{supr3m0_b0ss_100}</b> 👑</div>`);
}
function lfiTest(){
  const v=(document.getElementById("lfiIn").value||"").trim().toLowerCase();
  out("lfiOut",v.includes("access.log")?`<div class="live ok" style="margin-top:8px">📜 include() executou o PHP do log! Flag: <b>CTF-BR{l0g_p01s0n}</b></div>`:`<div class="live no" style="margin-top:8px">❌ Arquivo limpo, nada executou. Mire no log envenenado.</div>`);
}
function ecdsaCheck(){
  const v=(document.getElementById("dIn").value||"").trim().replace(/\s/g,"");
  out("dOut",v==="76042253201701721730980728320814400472457439264889053927225724688170402417829"?`<div class="live ok" style="margin-top:8px">👑 CHAVE MESTRA! Cofre aberto! Flag: <b>CTF-BR{3cd54_n0nc3_gr4ndm4st3r}</b></div>`:`<div class="live no" style="margin-top:8px">❌ d incorreto. Revise o inverso modular (precisa ter ${"76042253201701721730980728320814400472457439264889053927225724688170402417829".length} dígitos).</div>`);
}
// ----- desafios 41-50 -----
async function idorTest(){
  const v=(document.getElementById("idorIn").value||"1").trim();
  try{
    const r=await fetch("perfil?id="+encodeURIComponent(v));
    const j=await r.json();
    out("idorOut", j.flag?`<div class="live ok" style="margin-top:8px">🎯 Perfil <b>${v}</b> é o ADMIN! Flag: <b>${j.flag}</b></div>`:`<div class="live no" style="margin-top:8px">👤 id=${v}: ${(j.user||"?")} (nada aqui... continue enumerando)</div>`);
  }catch(e){ out("idorOut",`<div class="live no">❌ Erro (rode no servidor).</div>`); }
}
function decEnt(){
  const s="&#67;&#84;&#70;&#45;&#66;&#82;&#123;&#51;&#110;&#116;&#49;&#116;&#49;&#51;&#115;&#95;&#104;&#116;&#109;&#108;&#125;";
  out("entOut",`<div class="live ok" style="margin-top:8px">✅ ${s.replace(/&#(\d+);/g,(m,d)=>String.fromCharCode(d))}</div>`);
}
function ssrfTest(){
  const v=(document.getElementById("ssrfIn").value||"").trim();
  if(/169\.254\.169\.254/.test(v)) out("ssrfOut",`<div class="live ok" style="margin-top:8px">☁️ Metadata: role=ctf-flag<br>Flag: <b>CTF-BR{ssrf_cl0ud}</b></div>`);
  else out("ssrfOut",`<div class="live no" style="margin-top:8px">📥 Buscado: <b>${(v||"(vazio)").replace(/</g,"&lt;")}</b> — nada útil. Mire no IP interno da nuvem.</div>`);
}
function kidTest(){
  const v=(document.getElementById("kidIn").value||"").trim();
  if(v.includes("..")&&(v.includes("flag")||v.includes("etc"))) out("kidOut",`<div class="live ok" style="margin-top:8px">🔑 ./keys/${v.replace(/</g,"&lt;")} → <b>CTF-BR{k1d_tr4v3rs4l}</b></div>`);
  else out("kidOut",`<div class="live no" style="margin-top:8px">❌ Chave não encontrada: ./keys/${(v||"(vazio)").replace(/</g,"&lt;")}</div>`);
}
let _raceT=0;
function raceClick(){
  const now=Date.now(), diff=now-_raceT;
  _raceT=now;
  if(diff>0&&diff<300) out("raceOut",`<div class="live ok" style="margin-top:8px">⚡ RACE GANHA! 2 cliques em ${diff}ms! Flag: <b>CTF-BR{r4c3_c0nd1t10n}</b></div>`);
  else out("raceOut",`<div class="live no" style="margin-top:8px">🐢 Devagar (${diff?diff+"ms":"1º clique"}). Precisa de 2 cliques em &lt;300ms!</div>`);
}

// ---------- CONTAS / PERFIL / RANKING / TIMER ----------
function scrollConta(){ location.href="conta.html"; }
function trocarNome(){ scrollConta(); } // compat: botão antigo
// ---------- MODO ONLINE (backend central; cai para local se offline) ----------
let ONLINE=false;
let TOKEN=localStorage.getItem("ctf_token")||null;
let ME=null; // snapshot do servidor (/api/ctf/me) no modo online
async function apiGet(path,ms){
  const c=new AbortController(); const t=setTimeout(()=>c.abort(),ms||8000);
  try{ const r=await fetch(path,{signal:c.signal}); return await r.json(); }
  catch(e){ return null; } finally{ clearTimeout(t); }
}
async function apiPost(path,body,ms){
  const c=new AbortController(); const t=setTimeout(()=>c.abort(),ms||10000);
  try{ const r=await fetch(path,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body||{}),signal:c.signal}); return await r.json(); }
  catch(e){ return null; } finally{ clearTimeout(t); }
}
async function detectOnline(){
  const h=await apiGet("/api/health",6000);
  ONLINE=!!(h&&h.ok);
  const el=document.getElementById("netStatus");
  if(el){ el.textContent=ONLINE?"🌐 online":"📴 offline (modo local)"; el.style.color=ONLINE?"var(--acc)":"var(--muted)"; }
  return ONLINE;
}
async function syncMe(){
  // puxa progresso do servidor (fonte da verdade no modo online)
  const me=await apiGet("/api/ctf/me?token="+encodeURIComponent(TOKEN||""));
  if(!me||!me.ok) return false;
  me._at=Date.now();
  ME=me;
  currentUser=me.user;
  solved={}; Object.keys(me.solved||{}).forEach(k=>solved[k]=me.solved[k]);
  hints={}; Object.keys(me.hints||{}).forEach(k=>hints[k]=true);
  localStorage.setItem("ctf_session",currentUser); localStorage.setItem("ctf_name",currentUser);
  const _pn=document.getElementById("playerName"); if(_pn) _pn.textContent=currentUser+(me.role==="admin"?" 👑":"");
  const _bs=document.getElementById("btnSair"); if(_bs) _bs.classList.remove("hidden");
  const _at=document.getElementById("authTitle"); if(_at) _at.textContent="Logado como "+currentUser;
  const _pb=document.getElementById("passBox"); if(_pb) _pb.classList.remove("hidden");
  updateWatermark();
  renderGrid(); renderRanking(); renderAdmin(); renderTeam();
  return true;
}
// ---------- EQUIPES (máx 4, 1 jogador = 1 equipe, só no modo online) ----------
async function renderTeam(){
  const box=document.getElementById("teamBox"); if(!box) return;
  if(!ONLINE){ box.innerHTML=`<span class="muted">👥 Equipes valem no <b>ranking global online</b>. Conecte ao servidor.</span>`; return; }
  if(!currentUser||!TOKEN){ box.innerHTML=`<span class="muted">Entre na sua conta para criar ou entrar numa equipe.</span>`; return; }
  const d=await apiGet("/api/ctf/team/my?token="+encodeURIComponent(TOKEN));
  if(!d||!d.ok){ box.innerHTML=`<span class="muted">Erro ao carregar equipe.</span>`; return; }
  if(!d.team){
    box.innerHTML=`<div class="row"><input id="teamName" placeholder="nome da equipe" maxlength="20"></div>
    <div class="row" style="margin-top:8px"><button class="btn primary sm" onclick="teamCreate()">📝 Criar equipe</button><button class="btn ghost sm" onclick="teamJoin()">🔑 Entrar</button></div>
    <div id="teamMsg" class="out"></div><span class="muted">Pontuação = soma dos pontos individuais dos membros.</span>`;
    return;
  }
  const info=d.info||{};
  box.innerHTML=`<div class="live ok">👥 <b>${d.team}</b> — ${info.pts??0} pts (${info.solves??0}/${CHALLENGES.length}) ⏱ ${fmtTime(info.time)}</div>
  <div class="live">Membros (${(d.members||[]).length}/4): <b>${(d.members||[]).join(", ")}</b></div>
  <div class="row" style="margin-top:8px"><button class="btn ghost sm" onclick="teamLeave()">🚪 Sair da equipe</button><a class="btn ghost sm" href="ranking.html#equipes">Ver ranking →</a></div>
  <div id="teamMsg" class="out"></div>`;
}
function teamMsg(t){ const e=document.getElementById("teamMsg"); if(e) e.innerHTML=`<div class="live">${t}</div>`; }
async function teamCreate(){
  const n=(document.getElementById("teamName").value||"").trim();
  const r=await apiPost("/api/ctf/team/create",{token:TOKEN,name:n});
  if(!r||!r.ok){ teamMsg("❌ "+((r&&r.error)||"falha")); return; }
  toast("👥 Equipe "+r.team+" criada!"); renderTeam();
}
async function teamJoin(){
  const n=(document.getElementById("teamName").value||"").trim();
  const r=await apiPost("/api/ctf/team/join",{token:TOKEN,name:n});
  if(!r||!r.ok){ teamMsg("❌ "+((r&&r.error)||"falha")); return; }
  toast("👥 Bem-vindo à "+r.team+"!"); renderTeam();
}
async function teamLeave(){
  if(!confirm("Sair da equipe?")) return;
  await apiPost("/api/ctf/team/leave",{token:TOKEN});
  renderTeam(); toast(T("m.leftTeam"));
}
function getPlayerName(){ return currentUser||localStorage.getItem("ctf_name")||"Visitante"; }
function authMsg(t,ok){ const e=document.getElementById("authMsg"); if(e) e.innerHTML=`<div class="live ${ok?"ok":"no"}">${t}</div>`; }
async function ensureDefaultAdmin(){
  const users=getUsers();
  let changed=false;
  if(users["admin"]){ delete users["admin"]; changed=true; } // remove acesso antigo
  if(!users["Admin"]){ users["Admin"]={hash:await sha256Hex("Admin"),role:"admin",created:new Date().toLocaleString("pt-BR"),solved:{},hints:{},start:Date.now()}; changed=true; }
  if(changed) setUsers(users);
}
async function register(){
  const u=(document.getElementById("authUser").value||"").trim();
  const p=document.getElementById("authPass").value||"";
  if(!validUser(u)) return authMsg("❌ Usuário inválido: 3-20 chars, só letras/números/_/.",false);
  if(p.length<4) return authMsg("❌ Senha mínima: 4 caracteres.",false);
  if(u.toLowerCase()==="admin") return authMsg("❌ Nome reservado.",false);
  if(ONLINE){
    const r=await apiPost("/api/ctf/register",{user:u,pass:p});
    if(!r) return authMsg("❌ Servidor fora do ar. Tente de novo.",false);
    if(!r.ok) return authMsg("❌ "+(r.error||"falha no cadastro"),false);
    TOKEN=r.token; localStorage.setItem("ctf_token",TOKEN);
    await syncMe();
    return authMsg("✅ Conta <b>"+u+"</b> criada no servidor! 🌐",true);
  }
  const users=getUsers();
  if(users[u]) return authMsg("❌ Esse usuário já existe. Clique em Entrar.",false);
  // herda progresso de visitante (não perde as fases já feitas)
  let guestSolved={}, guestHints={};
  try{ guestSolved=JSON.parse(localStorage.getItem("ctf_solved")||"{}"); guestHints=JSON.parse(localStorage.getItem("ctf_hints")||"{}"); }catch(e){}
  users[u]={hash:await sha256Hex(p),role:"user",created:new Date().toLocaleString("pt-BR"),solved:guestSolved,hints:guestHints,start:Date.now()};
  setUsers(users); await setSession(u);
  authMsg("✅ Conta <b>"+u+"</b> criada e logada! Progresso de visitante migrado.",true);
}
async function login(){
  const u=(document.getElementById("authUser").value||"").trim();
  const p=document.getElementById("authPass").value||"";
  if(ONLINE){
    const r=await apiPost("/api/ctf/login",{user:u,pass:p});
    if(!r) return authMsg("❌ Servidor fora do ar.",false);
    if(!r.ok) return authMsg("❌ "+(r.error||"falha no login"),false);
    if(r.role==="admin") return authMsg("❌ Conta não encontrada. Crie primeiro.",false);
    TOKEN=r.token; localStorage.setItem("ctf_token",TOKEN);
    await syncMe();
    return authMsg("✅ Bem-vindo de volta, <b>"+u+"</b>! 🌐",true);
  }
  const users=getUsers();
  if(!users[u]) return authMsg("❌ Conta não encontrada. Crie primeiro.",false);
  if(users[u].hash!==await sha256Hex(p)) return authMsg("❌ Senha incorreta.",false);
  if(users[u].role==="admin") return authMsg("❌ Conta não encontrada. Crie primeiro.",false);
  await setSession(u); authMsg("✅ Bem-vindo de volta, <b>"+u+"</b>!",true);
}
async function setSession(u){
  currentUser=u; localStorage.setItem("ctf_session",u); localStorage.setItem("ctf_name",u);
  loadProgress();
  const _pn=document.getElementById("playerName"); if(_pn) _pn.textContent=u+(isAdmin()?" 👑":"");
  const _bs=document.getElementById("btnSair"); if(_bs) _bs.classList.remove("hidden");
  const _at=document.getElementById("authTitle"); if(_at) _at.textContent="Logado como "+u;
  const _pb=document.getElementById("passBox"); if(_pb) _pb.classList.remove("hidden");
  updateWatermark();
  renderGrid(); renderRanking(); renderAdmin(); renderTeam(); autoSaveRanking(); renderRanking();
  toast("👤 Logado como "+u);
}
async function trocarSenha(){
  if(!currentUser){ toast(T("m.loginFirst")); return; }
  const cur=document.getElementById("curPass").value||"";
  const nw=document.getElementById("newPass").value||"";
  const box=document.getElementById("passMsg");
  if(ONLINE){
    const r=await apiPost("/api/ctf/password",{token:TOKEN,cur:cur,new:nw});
    if(!r||!r.ok){ box.innerHTML=`<div class="live no">❌ ${((r&&r.error)||"falha")}.</div>`; return; }
    document.getElementById("curPass").value=""; document.getElementById("newPass").value="";
    box.innerHTML=`<div class="live ok">✅ Senha trocada no servidor!</div>`;
    toast(T("m.passUpd")); return;
  }
  const users=getUsers();
  if(!users[currentUser]) return;
  if(users[currentUser].hash!==await sha256Hex(cur)){ box.innerHTML=`<div class="live no">❌ Senha atual incorreta.</div>`; return; }
  if(nw.length<4){ box.innerHTML=`<div class="live no">❌ Nova senha mínima: 4 caracteres.</div>`; return; }
  users[currentUser].hash=await sha256Hex(nw); setUsers(users);
  document.getElementById("curPass").value=""; document.getElementById("newPass").value="";
  box.innerHTML=`<div class="live ok">✅ Senha trocada com sucesso!</div>`;
  toast(T("m.passUpd"));
}
function logout(){
  if(ONLINE&&TOKEN) apiPost("/api/ctf/logout",{token:TOKEN});
  TOKEN=null; ME=null; localStorage.removeItem("ctf_token");
  currentUser=null; localStorage.removeItem("ctf_session");
  loadProgress();
  const _pn2=document.getElementById("playerName"); if(_pn2) _pn2.textContent="Visitante";
  const _bs2=document.getElementById("btnSair"); if(_bs2) _bs2.classList.add("hidden");
  const _at2=document.getElementById("authTitle"); if(_at2) _at2.textContent="Entrar / Criar conta";
  const _pb2=document.getElementById("passBox"); if(_pb2) _pb2.classList.add("hidden");
  updateWatermark();
  renderGrid(); renderRanking(); renderAdmin(); renderTeam();
  toast(T("m.bye"));
}
// ---------- LOGIN ADM DISCRETO (rodapé ·) ----------
function abrirAdmLogin(){
  document.getElementById("admModal").classList.remove("hidden");
  document.getElementById("admMsg").innerHTML="";
  setTimeout(()=>document.getElementById("admUser").focus(),100);
}
function fecharAdmLogin(){ document.getElementById("admModal").classList.add("hidden"); }
// ---------- AVISO DE PRINT (registra e deixa o jogo rolar) ----------
let _pwAt=0;
function mostrarAvisoPrint(){
  const el=document.getElementById("printWarn"); if(!el) return;
  el.classList.remove("hidden");
  clearTimeout(el._t); el._t=setTimeout(()=>el.classList.add("hidden"),1500);
  const now=Date.now();
  if(now-_pwAt<3000) return; // keydown+keyup disparam 2x: multa 1 vez só
  _pwAt=now;
  if(currentUser){
    let multa=0;
    try{
      const users=getUsers(); const u=users[currentUser];
      if(u){
        // multa local: metade dos pontos ganhos até o momento
        const sv=u.solved||{}, hn=u.hints||{};
        const base=CHALLENGES.filter(c=>sv[c.id]).reduce((a,c)=>a+(hn[c.id]?Math.ceil(c.pts/2):c.pts),0);
        multa=Math.floor(Math.max(0,base-parseInt(u.fine||0))/2);
        u.fine=parseInt(u.fine||0)+multa;
        u.prints=(u.prints||0)+1; u.lastPrint="Tecla PrintScreen em "+new Date().toLocaleString("pt-BR");
        setUsers(users);
        // automático local: 3+ prints = trapaceiro
        if(u.prints>=3 && !isCheater(currentUser)){
          const arr=getCheaters();
          arr.push({name:currentUser, reason:"Print Screen automático ("+u.prints+"x) — possível vazamento de questões", by:"sistema", date:new Date().toLocaleString("pt-BR")});
          setCheaters(arr);
          setTimeout(()=>toast(T("m.auto3")),3500);
        }
        loadProgress(); renderGrid(); renderRanking(); renderAdmin();
      }
    }catch(e){}
    if(ONLINE&&TOKEN) apiPost("/api/ctf/suspect",{token:TOKEN,type:"Tecla PrintScreen"}).then(()=>syncMe());
    const m=document.getElementById("printMulta");
    if(m) m.textContent=multa>0?("Multa aplicada: −"+multa+" pts (metade do que você tinha)."):"Sem pontos a perder desta vez — na próxima dói.";
  }
}
function fecharAvisoPrint(){ document.getElementById("printWarn").classList.add("hidden"); }
async function adminLogin(){
  const u=(document.getElementById("admUser").value||"").trim();
  const p=document.getElementById("admPass").value||"";
  if(ONLINE){
    const r=await apiPost("/api/ctf/login",{user:u,pass:p});
    if(!r||!r.ok||r.role!=="admin"){
      document.getElementById("admMsg").innerHTML=`<div class="live no">❌ Acesso negado.</div>`;
      return;
    }
    TOKEN=r.token; localStorage.setItem("ctf_token",TOKEN);
    fecharAdmLogin(); await syncMe();
    document.getElementById("admin").scrollIntoView({behavior:"smooth"});
    return;
  }
  const users=getUsers();
  if(!users[u]||users[u].hash!==await sha256Hex(p)||users[u].role!=="admin"){
    document.getElementById("admMsg").innerHTML=`<div class="live no">❌ Acesso negado.</div>`;
    return;
  }
  fecharAdmLogin(); await setSession(u);
  document.getElementById("admin").scrollIntoView({behavior:"smooth"});
}
function rankSort(a,b){
  if(b.pts!==a.pts) return b.pts-a.pts; // melhor pontuação primeiro
  const ta=a.time==null?Infinity:a.time, tb=b.time==null?Infinity:b.time;
  return ta-tb; // empate: melhor (menor) tempo primeiro
}
function autoSaveRanking(){
  if(ONLINE) return; // no modo online o servidor é a fonte do ranking
  try{
    const name=getPlayerName(); if(!currentUser) return;
    const arr=JSON.parse(localStorage.getItem("ctf_ranking")||"[]");
    const pts=totalPontos(), solves=Object.keys(solved).length;
    const time=elapsedNow();
    const best=getUsers()[currentUser]?.bestFullTime??null;
    const base=userStart();
    const uph=(getUsers()[currentUser]?.phaseMs)||{};
    const phases={};
    Object.keys(solved).forEach(id=>{ const v=solved[id]; phases[id]=(uph[id]!=null)?uph[id]:((typeof v==="number")?Math.max(0,v-base):null); });
    const ritmo={};
    ["facil","medio","avancado"].forEach(lvl=>{
      const ts=Object.keys(solved).filter(id=>{ const c=CHALLENGES.find(x=>String(x.id)===String(id)); return c&&c.level===lvl; }).map(id=>phases[id]).filter(v=>v!=null);
      ritmo[lvl]=ts.length?Math.round(ts.reduce((a,b)=>a+b,0)/ts.length):null;
    });
    const i=arr.findIndex(r=>r.name===name);
    if(i>=0){
      if(pts>arr[i].pts||(pts===arr[i].pts&&(arr[i].time==null||time<arr[i].time))){
        arr[i].pts=pts; arr[i].solves=solves; arr[i].time=time; arr[i].phases=phases; arr[i].ritmo=ritmo; arr[i].date=new Date().toLocaleString("pt-BR");
      }
      if(best!=null) arr[i].best=best; else if(arr[i].best==null) arr[i].best=null;
    }
    else if(pts>0){ arr.push({name,pts,solves,time,best,phases,ritmo,date:new Date().toLocaleString("pt-BR")}); }
    else return;
    arr.sort(rankSort); localStorage.setItem("ctf_ranking",JSON.stringify(arr.slice(0,50)));
  }catch(e){}
}
function salvarRanking(){ autoSaveRanking(); renderRanking(); toast(T("m.saved")); }
async function renderRanking(){
  const N=CHALLENGES.length;
  if(ONLINE){
    renderCheaters();
    const el=document.getElementById("rankList");
    const d=await apiGet("/api/ctf/scoreboard");
    if(d&&d.ok){
      const arr=d.ranking||[];
      const badge=r=>r.cheat?` <span class="badge-adm" title="${(r.reason||"trapaça").replace(/"/g,"")}">🚫 TRAPAÇA</span>`:"";
      if(el) el.innerHTML=(arr.length?arr.slice(0,5).map((r,i)=>`<div class="live ${i===0?"ok":""}">${i===0?"🥇":i===1?"🥈":i===2?"🥉":"#"+(i+1)} <b>${r.name}</b>${badge(r)} — ${r.pts} pts (${r.solves}/${N}) ⏱ ${fmtTime(r.time)} <span style="opacity:.6">${r.date||""}</span></div>`).join(""):`<span class="muted">Nenhum registro ainda. Resolva flags!</span>`)+`<a class="mini" href="ranking.html" style="margin-top:6px;text-align:center">🌐 Ranking global completo →</a>`;
    }
    const mr=document.getElementById("myRank");
    if(mr) mr.innerHTML=currentUser&&ME
      ? `<div class="live ok">👤 <b>${currentUser}</b>${ME.role==="admin"?" 👑 ADM":""} — ${ME.pts} pts (${Object.keys(solved).length}/${N}) ⏱ ${fmtTime(elapsedNow())} — ${patente(ME.pts)} 🌐</div>`
      : `<div class="live">👤 Visitante — <b>Crie uma conta para entrar no ranking global! 🌐</b></div>`;
    return;
  }
  const arr=JSON.parse(localStorage.getItem("ctf_ranking")||"[]").sort(rankSort);
  const chMap={}; getCheaters().forEach(c=>chMap[c.name]=c.reason);
  const badge=n=>chMap[n]?` <span class="badge-adm" title="${chMap[n].replace(/"/g,"")}">🚫 TRAPAÇA</span>`:"";
  renderCheaters();
  const el=document.getElementById("rankList");
  if(el) el.innerHTML=arr.length?arr.slice(0,5).map((r,i)=>`<div class="live ${i===0?"ok":""}">${i===0?"🥇":i===1?"🥈":i===2?"🥉":"#"+(i+1)} <b>${r.name}</b>${badge(r.name)} — ${r.pts} pts (${r.solves}/${N}) ⏱ ${fmtTime(r.time)} <span style="opacity:.6">${r.date||""}</span></div>`).join("")+`<a class="mini" href="ranking.html" style="margin-top:6px;text-align:center">🏆 Ver ranking completo →</a>`:`<span class="muted">Nenhum registro ainda. Crie sua conta e resolva flags!</span>`;
  const mr=document.getElementById("myRank");
  if(mr) mr.innerHTML=currentUser
    ? `<div class="live ok">👤 <b>${currentUser}</b>${isAdmin()?" 👑 ADM":""}${badge(currentUser)} — ${totalPontos()} pts (${Object.keys(solved).length}/${N}) ⏱ ${fmtTime(elapsedNow())} — ${patente(totalPontos())}</div>`
    : `<div class="live">👤 Visitante — ${totalPontos()} pts (${Object.keys(solved).length}/${N}). <b>Crie uma conta para salvar no perfil!</b></div>`;
}
async function limparRanking(){ if(!isAdmin()){ toast(T("m.admOnly")); return; } if(!confirm("Limpar o ranking (zera pontos de TODOS)?")) return; if(ONLINE){ await apiPost("/api/ctf/admin/reset_all",{token:TOKEN}); await syncMe(); renderGrid(); renderRanking(); renderAdmin(); return; } localStorage.removeItem("ctf_ranking"); renderRanking(); }
async function resetGame(){ if(!confirm("Zerar SEU progresso?")) return; if(ONLINE&&currentUser){ await apiPost("/api/ctf/reset",{token:TOKEN}); await syncMe(); renderGrid(); renderRanking(); renderAdmin(); toast(T("m.resetDone")+` 🌐`); return; } solved={}; hints={}; save(); if(currentUser){ const u=getUsers(); if(u[currentUser]){ const ru=u[currentUser]; delete ru.attackStart; ru.start=Date.now(); ru.activeMs=0; ru.lastBeat=null; ru.frozenMs=null; ru.phaseMs={}; setUsers(u);} } else { localStorage.removeItem("ctf_attack"); localStorage.setItem("ctf_start",Date.now()); } renderGrid(); renderRanking(); renderAdmin(); toast(T("m.resetDone")); }
function tick(){
  // parado no zero até a 1ª flag; depois conta da 1ª flag até agora
  const ms=elapsedNow();
  const s=Math.floor(ms/1000);
  const h=String(Math.floor(s/3600)).padStart(2,"0"),m=String(Math.floor(s%3600/60)).padStart(2,"0"),ss=String(s%60).padStart(2,"0");
  const el=document.getElementById("hudTimer"); if(el) el.textContent=`${h}:${m}:${ss}`;
}

// ---------- PAINEL ADM ----------
function userPoints(name){ const u=getUsers()[name]; if(!u) return 0; const sv=u.solved||{}, hn=u.hints||{}; const base=CHALLENGES.filter(c=>sv[c.id]).reduce((a,c)=>a+(hn[c.id]?Math.ceil(c.pts/2):c.pts),0); return Math.max(0, base-parseInt(u.fine||0)); }
function userSolves(name){ return Object.keys(getUsers()[name]?.solved||{}).length; }
async function renderAdmin(){
  const sec=document.getElementById("admin"); if(!sec) return;
  if(!isAdmin()){ sec.classList.add("hidden"); return; }
  sec.classList.remove("hidden");
  if(ONLINE){
    const d=await apiGet("/api/ctf/admin/users?token="+encodeURIComponent(TOKEN||""));
    if(!d||!d.ok){ renderCheaters(); return; }
    const rows=d.users||[];
    let totS=0, totP=0;
    rows.forEach(r=>{ totS+=r.solves||0; totP+=r.pts||0; });
    document.getElementById("admUsers").textContent=rows.length;
    document.getElementById("admSolves").textContent=totS;
    document.getElementById("admPontos").textContent=totP;
    const banned=new Set((d.cheaters||[]).map(c=>c.name));
    document.getElementById("admBody").innerHTML=rows.map(r=>{
      const pr=r.prints?`🖨️ ${r.prints}×<br><small style="opacity:.6">${r.lastPrint||""}</small>`:"—";
      const cheat=banned.has(r.name)?`<span class="badge-adm">TRAPAÇA</span> `:"";
      return `<tr><td><b>${r.name}</b> ${cheat}${r.role==="admin"?'👑':""}</td><td>${r.role==="admin"?'<span class="badge-adm">ADM</span>':'<span class="badge-user">USER</span>'}</td><td>${r.pts}</td><td>${r.solves}/${CHALLENGES.length}</td><td>${pr}</td><td>${r.created||"-"}</td><td><button class="mini" onclick="adminResetUser('${r.name}')">↺ zerar</button> ${!banned.has(r.name)&&r.name!==currentUser?`<button class="mini" onclick="adminFlagCheater('${r.name}')">🚫 trapaça</button>`:""} ${r.name!==currentUser?`<button class="mini" onclick="adminDeleteUser('${r.name}')">✕ excluir</button>`:""}</td></tr>`;
    }).join("");
    renderCheaters();
    renderAdminTeams();
    return;
  }
  const users=getUsers(); const names=Object.keys(users);
  let totS=0, totP=0;
  names.forEach(n=>{ totS+=userSolves(n); totP+=userPoints(n); });
  document.getElementById("admUsers").textContent=names.length;
  document.getElementById("admSolves").textContent=totS;
  document.getElementById("admPontos").textContent=totP;
  document.getElementById("admBody").innerHTML=names.sort((a,b)=>userPoints(b)-userPoints(a)).map(n=>{
    const u=users[n];
    const pr=u.prints?`🖨️ ${u.prints}×<br><small style="opacity:.6">${u.lastPrint||""}</small>`:"—";
    const cheat=isCheater(n)?`<span class="badge-adm">TRAPAÇA</span> `:"";
    return `<tr><td><b>${n}</b> ${cheat}${u.role==="admin"?'👑':""}</td><td>${u.role==="admin"?'<span class="badge-adm">ADM</span>':'<span class="badge-user">USER</span>'}</td><td>${userPoints(n)}</td><td>${userSolves(n)}/${CHALLENGES.length}</td><td>${pr}</td><td>${u.created||"-"}</td><td><button class="mini" onclick="adminResetUser('${n}')">↺ zerar</button> ${!isCheater(n)&&n!==currentUser?`<button class="mini" onclick="adminFlagCheater('${n}')">🚫 trapaça</button>`:""} ${n!==currentUser?`<button class="mini" onclick="adminDeleteUser('${n}')">✕ excluir</button>`:""}</td></tr>`;
  }).join("");
  renderCheaters();
  renderAdminTeams();
}
async function renderAdminTeams(){
  const box=document.getElementById("admTeams"); if(!box) return;
  if(!ONLINE){ box.innerHTML=`<span class="muted">Equipes só no modo online 🌐.</span>`; return; }
  const d=await apiGet("/api/ctf/team/ranking");
  const teams=(d&&d.ok?d.teams:[]);
  box.innerHTML=teams.length?teams.map(t=>`<div class="live">👥 <b>${t.team}</b> — ${t.pts} pts (${t.n}/4): ${t.members.join(", ")||"—"} <button class="mini" onclick="adminTeamDel('${t.team}')">✕ excluir</button></div>`).join(""):`<span class="muted">Nenhuma equipe.</span>`;
}
async function adminTeamDel(t){
  if(!isAdmin()||!confirm("Excluir equipe "+t+"?")) return;
  await apiPost("/api/ctf/admin/team_delete",{token:TOKEN,team:t});
  renderAdmin(); renderTeam(); toast(T("m.teamGone"));
}
async function adminResetUser(n){ if(!isAdmin()) return; if(!confirm("Zerar progresso de "+n+"?")) return; if(ONLINE){ await apiPost("/api/ctf/admin/reset",{token:TOKEN,user:n}); if(n===currentUser) await syncMe(); renderGrid(); renderRanking(); renderAdmin(); toast("↺ "+n+" zerado. 🌐"); return; } const u=getUsers(); if(!u[n]) return; delete u[n].attackStart; u[n].solved={}; u[n].hints={}; u[n].start=Date.now(); u[n].activeMs=0; u[n].lastBeat=null; u[n].frozenMs=null; u[n].phaseMs={}; setUsers(u); if(n===currentUser){ loadProgress(); renderGrid(); } renderRanking(); renderAdmin(); toast("↺ "+n+" zerado."); }
async function adminMake(n){ if(!isAdmin()) return; if(ONLINE){ const r=await apiPost("/api/ctf/admin/role",{token:TOKEN,user:n}); if(n===currentUser) await syncMe(); renderAdmin(); renderRanking(); setSessionRefresh(); toast(n+" agora é "+(r?.role||"?")+". 🌐"); return; } const u=getUsers(); if(!u[n]) return; u[n].role=u[n].role==="admin"?"user":"admin"; setUsers(u); renderAdmin(); renderRanking(); setSessionRefresh(); toast(n+" agora é "+u[n].role); }
function setSessionRefresh(){ if(currentUser){ document.getElementById("playerName").textContent=currentUser+(isAdmin()?" 👑":""); } }
async function adminDeleteUser(n){ if(!isAdmin()||n===currentUser) return; if(!confirm("Excluir conta "+n+"?")) return; if(ONLINE){ await apiPost("/api/ctf/admin/delete",{token:TOKEN,user:n}); renderAdmin(); renderRanking(); toast("✕ "+n+" excluído. 🌐"); return; } const u=getUsers(); delete u[n]; setUsers(u); const arr=JSON.parse(localStorage.getItem("ctf_ranking")||"[]").filter(r=>r.name!==n); localStorage.setItem("ctf_ranking",JSON.stringify(arr)); renderAdmin(); renderRanking(); }
async function adminResetAll(){ if(!isAdmin()) return; if(!confirm("ZERAR pontos de TODOS os jogadores?")) return; if(ONLINE){ await apiPost("/api/ctf/admin/reset_all",{token:TOKEN}); await syncMe(); renderGrid(); renderRanking(); renderAdmin(); toast(T("m.allZeroed")+` 🌐`); return; } const u=getUsers(); Object.keys(u).forEach(n=>{ delete u[n].attackStart; u[n].solved={}; u[n].hints={}; u[n].start=Date.now(); u[n].activeMs=0; u[n].lastBeat=null; u[n].frozenMs=null; u[n].phaseMs={}; }); setUsers(u); localStorage.removeItem("ctf_ranking"); loadProgress(); renderGrid(); renderRanking(); renderAdmin(); }
function adminBackup(){ const data={users:getUsers(),ranking:JSON.parse(localStorage.getItem("ctf_ranking")||"[]"),exported:new Date().toISOString()}; const b=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}); const a=document.createElement("a"); a.href=URL.createObjectURL(b); a.download="ctf-backup.json"; a.click(); }
function adminRestore(input){ const f=input.files[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ try{ const d=JSON.parse(r.result); if(d.users) setUsers(d.users); if(d.ranking) localStorage.setItem("ctf_ranking",JSON.stringify(d.ranking)); loadProgress(); renderGrid(); renderRanking(); renderAdmin(); toast(T("m.restored")); }catch(e){ toast(T("m.badFile")); } }; r.readAsText(f); input.value=""; }

// ---------- INIT ----------
(async function init(){
  if(!document.cookie.includes("flag=")) document.cookie="flag=CTF-BR{c00k1e_m0nst3r}; path=/; max-age=31536000";
  localStorage.setItem("ctf_parte1","CTF-BR{l0c4l_"); localStorage.setItem("ctf_parte2","st0r4g3_v4ult}");
  console.log("%c⚠️ DESAFIO 6 (Console Perdido) — esta flag vale SÓ na fase 6, não cole em outras fases: CTF-BR{c0ns0l3_h4ck3r}","background:#00ff88;color:#000;font-size:14px;font-weight:bold");
  await detectOnline();
  if(ONLINE&&TOKEN){
    // tenta restaurar a sessão do servidor
    if(!(await syncMe())){ TOKEN=null; ME=null; localStorage.removeItem("ctf_token"); }
  }
  await ensureDefaultAdmin();
  // migração: garante start em contas antigas (usa a 1ª flag ou agora)
  try{
    const us=getUsers(); let ch=false;
    Object.keys(us).forEach(n=>{ if(!us[n].start){ const ts=Object.values(us[n].solved||{}).filter(v=>typeof v==="number"); us[n].start=ts.length?Math.min(...ts):Date.now(); ch=true; } if(!us[n].attackStart&&us[n].start){ us[n].attackStart=us[n].start; ch=true; } });
    if(ch) setUsers(us);
  }catch(e){}
  if(ONLINE){
    // ranking global: vale a sessão do servidor; sem token, começa deslogado
    if(!TOKEN){ currentUser=null; ME=null; }
  } else {
    currentUser=localStorage.getItem("ctf_session")||null;
    if(currentUser&&!getUsers()[currentUser]) currentUser=null;
  }
  if(!localStorage.getItem("ctf_start")) localStorage.setItem("ctf_start",Date.now());
  loadProgress();
  const pn=document.getElementById("playerName"); if(pn) pn.textContent=currentUser?currentUser+(isAdmin()?" 👑":""):"Visitante";
  const bs=document.getElementById("btnSair"); if(bs&&currentUser) bs.classList.remove("hidden");
  const at=document.getElementById("authTitle"); if(at&&currentUser) at.textContent="Logado como "+currentUser;
  const pb=document.getElementById("passBox"); if(pb&&currentUser) pb.classList.remove("hidden");
  renderGrid(); renderRanking(); renderAdmin(); renderCheaters(); renderTeam(); updateWatermark(); setInterval(tick,1000); tick();
  // presença online: ping leve a cada 60s (conta logada E visitante anônimo)
  let VID=null;
  try{ VID=localStorage.getItem("ctf_vid"); if(!VID){ VID=Math.random().toString(36).slice(2)+Date.now().toString(36); localStorage.setItem("ctf_vid",VID); } }catch(e){ VID="v"+String(Math.random()).slice(2); }
  async function pingOnline(){
    apiPost("/api/ctf/ping",{vid:VID});
    if(ONLINE&&TOKEN){ const r=await apiPost("/api/ctf/beat",{token:TOKEN}); if(r&&r.ok&&ME){ ME.time=r.activeMs; ME._at=Date.now(); } }
    const o=await apiGet("/api/ctf/online",6000);
    const el=document.getElementById("onlineNow");
    if(el&&o&&o.ok) el.textContent=`🟢 ${o.total} online`;
  }
  setInterval(pingOnline,60000); pingOnline();
  // sem heartbeat de tempo: o relógio só anda com fase aberta; ao fechar, deposita a fatia
  window.addEventListener("beforeunload",()=>{
    if(modalOpenAt==null) return;
    const d=Math.max(0,Math.min(Date.now()-modalOpenAt,1800000));
    modalOpenAt=null;
    if(!currentUser){ visitorActive+=d; try{localStorage.setItem("ctf_visActive",visitorActive);}catch(e){} return; }
    if(ONLINE&&TOKEN){ try{ navigator.sendBeacon("/api/ctf/beat",JSON.stringify({token:TOKEN,add:d})); }catch(e){} }
    else { try{ const us=getUsers(); const u=us[currentUser]; if(u){ u.activeMs=parseInt(u.activeMs||0)+d; setUsers(us); } }catch(e){} }
  });
  // sensores anti-print/IA: PrintScreen, Ctrl+P e cópia de flag (jogo NUNCA trava)
  // keydown + keyup: alguns teclados/navegadores só disparam um dos dois
  function ehPrint(e){ return e.key==="PrintScreen"||e.code==="PrintScreen"; }
  document.addEventListener("keydown",e=>{
    if(ehPrint(e)) mostrarAvisoPrint();
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="p"){ logSuspeita("Impressão (Ctrl+P)"); }
  });
  document.addEventListener("keyup",e=>{ if(ehPrint(e)) mostrarAvisoPrint(); });
  window.addEventListener("beforeprint",()=>mostrarAvisoPrint());
  document.addEventListener("copy",()=>{ const s=(window.getSelection()||"").toString(); if(/CTF-BR\{[^}]{1,60}\}/.test(s)) logSuspeita("Cópia de flag"); });
  document.getElementById("modal").addEventListener("click",e=>{ if(e.target.id==="modal") fecharModal(); });
  document.getElementById("admModal").addEventListener("click",e=>{ if(e.target.id==="admModal") fecharAdmLogin(); });
  document.getElementById("printWarn").addEventListener("click",e=>{ if(e.target.id==="printWarn") fecharAvisoPrint(); });
  document.addEventListener("keydown",e=>{ if(e.key==="Escape"){ fecharModal(); fecharAdmLogin(); fecharAvisoPrint(); } });
  const au=document.getElementById("authUser");
  if(au) au.addEventListener("keydown",e=>{ if(e.key==="Enter") login(); });
  const ap=document.getElementById("authPass");
  if(ap) ap.addEventListener("keydown",e=>{ if(e.key==="Enter") login(); });
})();
