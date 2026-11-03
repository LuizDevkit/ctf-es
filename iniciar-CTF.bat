@echo off
cd /d %~dp0
:loop
echo === CTF-ES online em http://127.0.0.1:8000/ctf.html ===
python server.py
echo Servidor caiu! Reiniciando em 5s... (NAO FECHE ESTA JANELA)
timeout /t 5 >nul
goto loop
