# Guia de Deploy e Testes - Afinador Pro

## 🧪 Testes Locais

### Como testar o afinador localmente

1. **Abrir no navegador**
   - Abra o arquivo `index.html` diretamente no navegador
   - Ou use um servidor local (recomendado)

2. **Usando servidor local (recomendado)**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   
   # Node.js (se tiver npm)
   npx http-server -p 8000
   
   # Ou use Live Server no VS Code
   ```

3. **Acessar no navegador**
   - Abra `http://localhost:8000`
   - Verifique se não há erros no console (F12)

### Verificação de erros comuns

#### 1. Erros de CORS (Cross-Origin)
**Problema**: Arquivos carregados via `file://` podem ter problemas de CORS
**Solução**: Use um servidor local em vez de abrir o arquivo diretamente

#### 2. Erros de Service Worker
**Problema**: Service Worker só funciona com HTTPS ou localhost
**Solução**: Use `http://localhost:8000` para testes locais

#### 3. Erros de microfone
**Problema**: Permissão de microfone negada
**Solução**: 
- Clique no ícone de bloqueio na barra de endereços
- Permitir acesso ao microfone
- Recarregue a página

#### 4. Erros de dependências
**Problema**: Módulos JavaScript não carregados
**Solução**: Verifique se todos os arquivos JS estão na pasta correta

## 🚀 Deploy no GitPages

### Preparação para GitPages

1. **Estrutura de arquivos**
   ```
   seu-repositorio/
   ├── index.html
   ├── manifest.json
   ├── service-worker.js
   ├── README.md
   ├── generate-icons.js
   ├── build.js
   ├── test.js
   ├── init.js
   ├── css/
   │   ├── styles.css
   │   ├── themes.css
   │   └── animations.css
   ├── js/
   │   ├── utils.js
   │   ├── storage.js
   │   ├── tuner.js
   │   ├── ui.js
   │   └── app.js
   └── assets/
       └── icons/ (opcional)
   ```

2. **Configurar GitPages**
   - No GitHub, vá para Settings > Pages
   - Selecione a branch `main` ou `master`
   - Escolha a pasta `/ (root)`
   - Salve as configurações

3. **Atualizar caminhos para produção**
   - O service worker já está configurado para funcionar
   - Os caminhos no HTML já são relativos

### Problemas comuns no GitPages

#### 1. Service Worker não funciona
**Problema**: Service Worker não se registra no GitPages
**Solução**: 
- Verifique se o domínio é HTTPS (GitPages fornece HTTPS)
- Limpe o cache do navegador
- Teste em modo anônimo

#### 2. Arquivos não encontrados (404)
**Problema**: Erros 404 nos arquivos CSS/JS
**Solução**:
- Verifique se os arquivos foram enviados para o repositório
- Confira se os nomes dos arquivos estão corretos (case-sensitive)
- Use o DevTools para ver quais arquivos estão falhando

#### 3. Manifest não funciona
**Problema**: PWA não é reconhecido
**Solução**:
- Verifique se o manifest.json está na raiz
- Confira se o caminho do manifest no HTML está correto
- Teste com o Lighthouse do Chrome

#### 4. Ícones não aparecem
**Problema**: Ícones do PWA não são exibidos
**Solução**:
- Use o script `generate-icons.js` para criar os ícones
- Ou use ícones SVG como fallback (já implementado)

## 🔧 Comandos úteis

### Build e otimização
```bash
# Executar build (se tiver Node.js)
node build.js

# Testar localmente
python -m http.server 8000

# Testar performance
node test.js
```

### Git e deploy
```bash
# Inicializar repositório
git init
git add .
git commit -m "Initial commit"

# Adicionar remote (substitua USER e REPO)
git remote add origin https://github.com/USER/REPO.git

# Enviar para GitHub
git branch -M main
git push -u origin main
```

### Verificação de arquivos
```bash
# Listar arquivos no diretório
ls -la

# Verificar tamanho dos arquivos
du -sh *

# Verificar permissões
ls -l
```

## 🐛 Debug avançado

### Console do navegador
1. Pressione F12
2. Vá para a aba Console
3. Procure por erros (texto vermelho)
4. Verifique a aba Network para ver requisições falhadas

### Service Worker debug
1. F12 > Application > Service Workers
2. Verifique se o service worker está registrado
3. Limpe storage se necessário

### Manifest debug
1. F12 > Application > Manifest
2. Verifique se o manifest foi carregado corretamente
3. Confira os ícones e configurações

### Performance debug
1. F12 > Lighthouse
2. Rode auditoria de PWA
3. Verifique pontuação e recomendações

## 📱 Testes em dispositivos móveis

### Teste no celular
1. Suba no GitPages
2. Acesse pelo navegador do celular
3. Teste o microfone
4. Teste a instalação PWA

### Problemas comuns em mobile
- **Microfone**: Verifique permissões no Android/iOS
- **Performance**: Teste em diferentes conexões
- **Tela cheia**: Verifique se o PWA instala corretamente

## 🎯 Checklist de deploy

- [ ] Testar localmente sem erros
- [ ] Verificar todos os arquivos no repositório
- [ ] Configurar GitPages corretamente
- [ ] Testar no navegador desktop
- [ ] Testar no navegador mobile
- [ ] Verificar Service Worker
- [ ] Verificar Manifest PWA
- [ ] Testar microfone
- [ ] Testar instalação PWA
- [ ] Verificar performance (Lighthouse)

## 🆘 Suporte

### Erros comuns e soluções

**Erro: "Failed to load resource: the server responded with a status of 404"**
- Verifique se o arquivo existe no repositório
- Confira o caminho no HTML

**Erro: "Uncaught ReferenceError: Utils is not defined"**
- Verifique se utils.js foi carregado
- Confira a ordem dos scripts no HTML

**Erro: "Registration failed - Registration failed - A bad HTTP response code (404) was received when fetching the script"**
- Service Worker não encontrado
- Verifique se service-worker.js está na raiz

**Erro: "NotAllowedError: Permission denied"**
- Permissão de microfone negada
- Verifique configurações do navegador

### Contato
- **Email**: nmlssrpr@proton.me
- **PIX**: nmlssrpr@proton.me

---

<div align="center">
  <p>Se este projeto foi útil para você, considere fazer uma doação via PIX</p>
  <p><strong>Chave PIX:</strong> nmlssrpr@proton.me</p>
  <p>Obrigado pelo apoio! 🎵</p>
</div>