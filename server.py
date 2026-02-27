#!/usr/bin/env python3
"""
Servidor local simples para o Afinador Pro
Evita problemas de CORS ao abrir arquivos localmente
"""

import http.server
import socketserver
import os
import webbrowser
import threading
import time

PORT = 8000
DIRECTORY = "."

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        # Adiciona headers CORS
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def open_browser():
    """Abre o navegador após o servidor iniciar"""
    time.sleep(1)  # Espera o servidor iniciar
    url = f"http://localhost:{PORT}/index.html"
    print(f"🌐 Abrindo navegador em: {url}")
    webbrowser.open(url)

def main():
    print("🎸 Afinador Pro - Servidor Local")
    print("=" * 50)
    print(f"📁 Diretório: {os.path.abspath(DIRECTORY)}")
    print(f"🌐 Servidor na porta: {PORT}")
    print(f"🔗 URL: http://localhost:{PORT}/index.html")
    print("=" * 50)
    print("Pressione Ctrl+C para parar o servidor")
    print()
    
    # Inicia o navegador em uma thread separada
    browser_thread = threading.Thread(target=open_browser)
    browser_thread.daemon = True
    browser_thread.start()
    
    # Inicia o servidor
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        print(f"✅ Servidor iniciado com sucesso!")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Servidor encerrado")
            httpd.shutdown()

if __name__ == "__main__":
    main()