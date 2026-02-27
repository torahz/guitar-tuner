# 🎸 Afinador Pro - Guia Rápido de Solução de Problemas

## ⚠️ **ATENÇÃO: Problemas Comuns e Soluções**

### **Problema: Erros de CORS e dependência**
```
Access to manifest at 'file:///...' from origin 'null' has been blocked by CORS policy
UI.showToast is not a function
Tuner.updateConfig is not a function
```

### **Solução: Use o Servidor Local (OBRIGATÓRIO)**

**Passo 1:** Abra o terminal na pasta do projeto
```bash
cd "D:\Python Projects\guitar-tuner\guitar-tuner"
```

**Passo 2:** Inicie o servidor local
```bash
python server.py
```

**Passo 3:** Acesse no navegador
```
http://localhost:8000/index.html
```

## 🚀 **Como Usar o Afinador**

### **Detecção Automática (COMO VOCÊ QUER)**
✅ **O afinador detecta automaticamente:**
- Frequência da nota tocada
- Qual corda está sendo afinada (E, A, D, G, B, E)
- Se está afinada ou desafinada
- **NÃO depende do usuário mudar manualmente a corda**

### **Instruções de Uso**
1. **Inicie o servidor:** `python server.py`
2. **Abra no navegador:** `http://localhost:8000/index.html`
3. **Permita o microfone** quando solicitado
4. **Toque a corda** - o afinador detecta automaticamente
5. **Observe a agulha** - centro = afinada, lados = desafinada
6. **Ajuste a tensão** da corda conforme indicado

## 📁 **Arquivos do Projeto**

### **Essenciais**
- `index.html` - Página principal do afinador
- `js/tuner.js` - Lógica de detecção de frequência
- `js/ui.js` - Interface do usuário
- `js/app.js` - Aplicação principal

### **Ferramentas de Solução**
- `server.py` - Servidor local (ESSENCIAL)
- `launcher.html` - Página de lançamento que detecta problemas
- `quick-start.html` - Guia rápido de solução
- `test-toast.html` - Teste de funções de toast
- `test-debug.html` - Diagnóstico avançado

## 🔧 **Solução de Problemas**

### **Problema: Microfone não funciona**
**Solução:**
1. Verifique as permissões do navegador
2. Teste o microfone em outro site
3. Reinicie o navegador
4. Use o servidor local (não abra localmente)

### **Problema: Notas não são detectadas**
**Solução:**
1. Aumente o volume da guitarra
2. Mantenha o microfone mais próximo
3. Reduza ruídos de fundo
4. Toque as cordas com mais força
5. Use o servidor local

### **Problema: Erros de dependência**
**Solução:**
1. **Use SEMPRE o servidor local** - `python server.py`
2. **NUNCA abra o index.html diretamente**
3. Acesse via: `http://localhost:8000/index.html`

## 🎯 **Dicas para Melhor Performance**

### **Para melhores resultados:**
- Toque as cordas com força suficiente
- Evite ruídos de fundo
- Mantenha o microfone próximo ao instrumento
- Toque uma corda de cada vez

### **Problemas comuns:**
- **Sem som detectado:** Verifique o microfone
- **Notas erradas:** Reduza ruídos de fundo
- **Agulha instável:** Toque a corda com mais força

## 🛠️ **Alternativas de Servidor**

### **Python (RECOMENDADO)**
```bash
python server.py
```

### **Python embutido**
```bash
python -m http.server 8000
```

### **Node.js (se tiver npm)**
```bash
npx http-server -p 8000
```

### **VS Code Live Server**
1. Instale a extensão "Live Server"
2. Clique em "Go Live" no canto inferior direito

## 📞 **Suporte**

Se ainda houver problemas:

1. **Abra `launcher.html`** - Detecta automaticamente problemas
2. **Use `quick-start.html`** - Guia completo de solução
3. **Teste com `test-toast.html`** - Verifica funções
4. **Consulte o console** (F12) para mensagens detalhadas

## ✅ **Checklist de Verificação**

- [ ] **Servidor local iniciado** - `python server.py`
- [ ] **Acesso via navegador** - `http://localhost:8000/index.html`
- [ ] **Microfone permitido** no navegador
- [ ] **Sem erros no console** (F12)
- [ ] **Detecção automática** funcionando

---

**⚠️ IMPORTANTE:** O afinador **NÃO FUNCIONA** se aberto localmente (file://). Use SEMPRE o servidor local para evitar problemas de CORS e dependência.

**🎸 Agora seu afinador está pronto para uso!**