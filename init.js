/**
 * Script de Inicialização do Afinador Pro
 * 
 * Este script garante que todos os módulos estejam carregados corretamente
 * antes de iniciar o aplicativo, evitando erros de dependência.
 */

// Verifica se estamos no navegador
if (typeof window === 'undefined') {
    console.error('Este script deve ser executado no navegador');
    throw new Error('Ambiente de navegador necessário');
}

// Estado de carregamento dos módulos
const loadingState = {
    utils: false,
    storage: false,
    tuner: false,
    ui: false,
    app: false,
    allLoaded: false
};

// Função para verificar dependências
function checkDependencies() {
    console.log('🔍 Verificando dependências...');
    
    const dependencies = {
        // APIs do navegador
        webAudio: typeof window.AudioContext !== 'undefined' || typeof window.webkitAudioContext !== 'undefined',
        getUserMedia: typeof navigator.mediaDevices !== 'undefined' && typeof navigator.mediaDevices.getUserMedia !== 'undefined',
        localStorage: (() => {
            try {
                const test = '__test__';
                localStorage.setItem(test, test);
                localStorage.removeItem(test);
                return true;
            } catch (e) {
                return false;
            }
        })(),
        promises: typeof Promise !== 'undefined',
        fetch: typeof fetch !== 'undefined',
        
        // Elementos do DOM
        domElements: {
            tunerDisplay: !!document.getElementById('tuner-display'),
            needle: !!document.getElementById('needle'),
            noteName: !!document.getElementById('note-name'),
            frequencyValue: !!document.getElementById('frequency-value'),
            startBtn: !!document.getElementById('start-btn'),
            stopBtn: !!document.getElementById('stop-btn'),
            settingsPanel: !!document.getElementById('settings-panel')
        }
    };
    
    // Verifica APIs
    const apiChecks = [
        { name: 'Web Audio API', check: dependencies.webAudio, required: true },
        { name: 'Microfone', check: dependencies.getUserMedia, required: true },
        { name: 'Armazenamento Local', check: dependencies.localStorage, required: true },
        { name: 'Promises', check: dependencies.promises, required: true },
        { name: 'Fetch API', check: dependencies.fetch, required: false }
    ];
    
    let allRequiredPassed = true;
    
    apiChecks.forEach(dep => {
        const status = dep.check ? '✓' : (dep.required ? '❌' : '⚠');
        const message = dep.check ? 'Suportado' : 'Não suportado';
        console.log(`  ${status} ${dep.name}: ${message}`);
        
        if (dep.required && !dep.check) {
            allRequiredPassed = false;
        }
    });
    
    // Verifica elementos DOM
    console.log('  📱 Elementos DOM:');
    Object.entries(dependencies.domElements).forEach(([name, exists]) => {
        console.log(`    ${exists ? '✓' : '❌'} ${name}: ${exists ? 'Encontrado' : 'Não encontrado'}`);
        if (!exists) {
            allRequiredPassed = false;
        }
    });
    
    if (!allRequiredPassed) {
        console.error('❌ Dependências críticas falharam. O afinador não pode ser iniciado.');
        showErrorMessage('Dependências críticas não suportadas pelo seu navegador. Por favor, atualize para uma versão mais recente.');
        return false;
    }
    
    console.log('✅ Dependências verificadas com sucesso');
    return true;
}

// Função para carregar módulos
function loadModules() {
    console.log('📦 Carregando módulos...');
    
    // Verifica se os módulos globais existem
    const modules = [
        { name: 'Utils', check: typeof Utils !== 'undefined', required: true },
        { name: 'Storage', check: typeof Storage !== 'undefined', required: true },
        { name: 'Tuner', check: typeof Tuner !== 'undefined', required: true },
        { name: 'UI', check: typeof UI !== 'undefined', required: true },
        { name: 'App', check: typeof App !== 'undefined', required: true }
    ];
    
    let allModulesLoaded = true;
    
    modules.forEach(module => {
        const status = module.check ? '✓' : (module.required ? '❌' : '⚠');
        const message = module.check ? 'Carregado' : 'Não carregado';
        console.log(`  ${status} ${module.name}: ${message}`);
        
        if (module.required && !module.check) {
            allModulesLoaded = false;
        }
    });
    
    // Verifica métodos críticos do UI
    if (typeof UI !== 'undefined') {
        const uiMethods = ['showToast', 'startTuner', 'stopTuner', 'updateTunerDisplay'];
        uiMethods.forEach(method => {
            const exists = typeof UI[method] === 'function';
            console.log(`    ${exists ? '✓' : '❌'} UI.${method}: ${exists ? 'Disponível' : 'Indisponível'}`);
            if (!exists) {
                allModulesLoaded = false;
            }
        });
    } else {
        console.log('    ❌ UI: Não carregado');
        allModulesLoaded = false;
    }
    
    if (!allModulesLoaded) {
        console.error('❌ Módulos críticos não carregados. Verifique os arquivos JavaScript.');
        showErrorMessage('Erro ao carregar módulos do afinador. Por favor, recarregue a página.');
        return false;
    }
    
    console.log('✅ Módulos carregados com sucesso');
    return true;
}

// Função para inicializar o aplicativo
function initializeApp() {
    console.log('🚀 Inicializando Afinador Pro...');
    
    try {
        // Verifica dependências
        if (!checkDependencies()) {
            return;
        }
        
        // Carrega módulos
        if (!loadModules()) {
            return;
        }
        
        // Inicializa o aplicativo
        if (typeof window.App !== 'undefined') {
            console.log('✅ Afinador Pro inicializado com sucesso!');
            
            // Mostra mensagem de sucesso
            showSuccessMessage('Afinador Pro pronto para uso!');
            
            // Remove loading overlay se existir
            const loadingOverlay = document.getElementById('loading-overlay');
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
            
        } else {
            throw new Error('App não encontrado');
        }
        
    } catch (error) {
        console.error('❌ Erro ao inicializar o aplicativo:', error);
        showErrorMessage(`Erro ao iniciar o afinador: ${error.message}`);
    }
}

// Funções de UI para mensagens
function showErrorMessage(message) {
    createMessageOverlay('error', message);
}

function showSuccessMessage(message) {
    createMessageOverlay('success', message);
}

function createMessageOverlay(type, message) {
    // Remove overlay existente
    const existing = document.querySelector('.init-overlay');
    if (existing) {
        existing.remove();
    }
    
    // Cria overlay
    const overlay = document.createElement('div');
    overlay.className = `init-overlay ${type}`;
    overlay.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ef4444' : '#10b981'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 1000;
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Adiciona animação CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // Conteúdo
    overlay.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'check-circle'}"></i>
            <span>${message}</span>
        </div>
        <button onclick="this.closest('.init-overlay').remove()" style="position: absolute; top: 5px; right: 5px; background: none; border: none; color: white; cursor: pointer; font-size: 14px;">×</button>
    `;
    
    document.body.appendChild(overlay);
    
    // Remove automaticamente após 5 segundos
    setTimeout(() => {
        if (overlay.parentNode) {
            overlay.remove();
        }
    }, 5000);
}

// Função para depurar problemas
function debugApp() {
    console.log('🔍 Debug do Afinador Pro');
    console.log('=== Estado dos Módulos ===');
    
    const modules = ['Utils', 'Storage', 'Tuner', 'UI', 'App'];
    modules.forEach(name => {
        const exists = typeof window[name] !== 'undefined';
        console.log(`${name}: ${exists ? '✓' : '❌'} ${exists ? 'Disponível' : 'Indisponível'}`);
        
        if (exists) {
            console.log(`  Métodos: ${Object.keys(window[name]).join(', ')}`);
        }
    });
    
    console.log('=== Estado do DOM ===');
    const elements = ['tuner-display', 'needle', 'note-name', 'frequency-value', 'start-btn', 'stop-btn'];
    elements.forEach(id => {
        const element = document.getElementById(id);
        console.log(`${id}: ${element ? '✓' : '❌'} ${element ? 'Encontrado' : 'Não encontrado'}`);
    });
    
    console.log('=== Informações do Navegador ===');
    console.log(`User Agent: ${navigator.userAgent}`);
    console.log(`Plataforma: ${navigator.platform}`);
    console.log(`Linguagem: ${navigator.language}`);
    console.log(`Online: ${navigator.onLine}`);
    
    if (typeof window.App !== 'undefined') {
        console.log('=== Estado do App ===');
        console.log('App inicializado:', window.App.isInitialized);
        console.log('App online:', window.App.isOnline);
    }
}

// Expondo para debug
window.debugApp = debugApp;

// Inicializa quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Export para uso externo
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initializeApp, checkDependencies, loadModules, debugApp };
}