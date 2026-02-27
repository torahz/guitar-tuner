/**
 * Aplicação Principal
 */

class App {
    constructor() {
        this.isInitialized = false;
        this.isOnline = true;
        
        this.init();
    }

    /**
     * Inicializa a aplicação
     */
    async init() {
        try {
            console.log('Inicializando Afinador Pro...');
            
            // Verifica requisitos
            this.checkRequirements();
            
            // Inicializa componentes
            await this.initializeComponents();
            
            // Configura eventos globais
            this.setupGlobalEvents();
            
            // Inicializa PWA
            this.initializePWA();
            
            // Marca como inicializado
            this.isInitialized = true;
            
            console.log('Afinador Pro inicializado com sucesso!');
            
            // Exibe mensagem de boas-vindas
            this.showWelcomeMessage();
            
        } catch (error) {
            console.error('Erro ao inicializar aplicação:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Verifica requisitos do navegador
     */
    checkRequirements() {
        const requirements = {
            webAudio: Utils.supportsWebAudio(),
            getUserMedia: Utils.supportsGetUserMedia(),
            localStorage: this.supportsLocalStorage(),
            promises: this.supportsPromises(),
            fetch: this.supportsFetch()
        };

        const missing = Object.keys(requirements).filter(key => !requirements[key]);

        if (missing.length > 0) {
            this.showUnsupportedBrowserMessage(missing);
            throw new Error(`Requisitos não suportados: ${missing.join(', ')}`);
        }
    }

    /**
     * Verifica suporte a localStorage
     */
    supportsLocalStorage() {
        try {
            const test = '__test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Verifica suporte a Promises
     */
    supportsPromises() {
        return typeof Promise !== 'undefined';
    }

    /**
     * Verifica suporte a Fetch
     */
    supportsFetch() {
        return typeof fetch !== 'undefined';
    }

    /**
     * Mostra mensagem de navegador não suportado
     */
    showUnsupportedBrowserMessage(missing) {
        const message = `
            <div class="unsupported-browser">
                <h2>Navegador não suportado</h2>
                <p>Este aplicativo requer os seguintes recursos:</p>
                <ul>
                    ${missing.map(req => `<li>${this.getRequirementName(req)}</li>`).join('')}
                </ul>
                <p>Por favor, atualize seu navegador ou use um navegador moderno.</p>
            </div>
        `;
        
        document.body.innerHTML = message;
    }

    /**
     * Obtém nome do requisito
     */
    getRequirementName(requirement) {
        const names = {
            webAudio: 'Web Audio API',
            getUserMedia: 'Microfone (getUserMedia)',
            localStorage: 'Armazenamento Local',
            promises: 'Promises',
            fetch: 'Fetch API'
        };
        
        return names[requirement] || requirement;
    }

    /**
     * Inicializa componentes
     */
    async initializeComponents() {
        // Storage já foi inicializado em storage.js
        
        // UI já foi inicializado em ui.js
        
        // Tuner já foi inicializado em tuner.js
        
        // Aguarda um pequeno delay para garantir que tudo esteja pronto
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    /**
     * Configura eventos globais
     */
    setupGlobalEvents() {
        // Evento de online/offline
        window.addEventListener('online', () => {
            this.isOnline = true;
            UI.showToast('Conexão restaurada', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            UI.showToast('Sem conexão com internet', 'warning');
        });
        
        // Evento de erro não capturado
        window.addEventListener('error', (event) => {
            this.handleGlobalError(event.error);
        });
        
        // Evento de promise não tratada
        window.addEventListener('unhandledrejection', (event) => {
            this.handleGlobalError(event.reason);
        });
        
        // Evento de beforeunload
        window.addEventListener('beforeunload', (event) => {
            // Pode ser usado para salvar dados ou confirmar saída
        });
        
        // Evento de resize
        window.addEventListener('resize', this.debounce(() => {
            // Pode ser usado para otimizar renderização em mobile
        }, 250));
        
        // Evento de pagehide
        window.addEventListener('pagehide', () => {
            // Pausa detecção quando a página é ocultada
            if (Tuner.isRunning) {
                Tuner.stop();
            }
        });
    }

    /**
     * Inicializa PWA
     */
    async initializePWA() {
        if (!Utils.supportsPWA()) return;
        
        try {
            // Registra service worker
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.register('service-worker.js');
                console.log('Service Worker registrado:', registration);
            }
            
            // Configura instalação PWA
            this.setupPWAInstallation();
            
        } catch (error) {
            console.error('Erro ao inicializar PWA:', error);
        }
    }

    /**
     * Configura instalação PWA
     */
    setupPWAInstallation() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            // Impede a instalação automática
            e.preventDefault();
            deferredPrompt = e;
            
            // Mostra botão de instalação
            const installBtn = document.getElementById('install-btn');
            if (installBtn) {
                installBtn.style.display = 'inline-flex';
                installBtn.addEventListener('click', async () => {
                    if (deferredPrompt) {
                        deferredPrompt.prompt();
                        const { outcome } = await deferredPrompt.userChoice;
                        
                        if (outcome === 'accepted') {
                            UI.showToast('App instalado com sucesso!', 'success');
                            installBtn.style.display = 'none';
                        }
                        
                        deferredPrompt = null;
                    }
                });
            }
        });
        
        window.addEventListener('appinstalled', () => {
            UI.showToast('App instalado com sucesso!', 'success');
        });
    }

    /**
     * Exibe mensagem de boas-vindas
     */
    showWelcomeMessage() {
        const settings = Storage.getSettings();
        const lastUsed = settings.lastUsed ? new Date(settings.lastUsed) : null;
        const now = new Date();
        
        if (lastUsed) {
            const daysSinceLastUse = Math.floor((now - lastUsed) / (1000 * 60 * 60 * 24));
            
            if (daysSinceLastUse === 0) {
                UI.showToast('Bem-vindo de volta!', 'success');
            } else if (daysSinceLastUse === 1) {
                UI.showToast('Bom te ver de novo!', 'success');
            } else if (daysSinceLastUse < 7) {
                UI.showToast(`Bem-vindo de volta! Última visita: ${Utils.formatDate(lastUsed)}`, 'success');
            } else {
                UI.showToast(`Bem-vindo de volta! Sentimos sua falta!`, 'success');
            }
        } else {
            UI.showToast('Bem-vindo ao Afinador Pro!', 'success');
        }
    }

    /**
     * Trata erro de inicialização
     */
    handleInitializationError(error) {
        const errorMessage = `
            <div class="error-container">
                <h2>Erro de Inicialização</h2>
                <p>Ocorreu um erro ao inicializar o aplicativo:</p>
                <p><strong>${error.message}</strong></p>
                <p>Por favor, atualize a página ou entre em contato com o suporte.</p>
                <button onclick="location.reload()">Recarregar Página</button>
            </div>
        `;
        
        document.body.innerHTML = errorMessage;
    }

    /**
     * Trata erro global
     */
    handleGlobalError(error) {
        console.error('Erro global:', error);
        
        // Não exibe toast para erros de rede ou interrupções normais
        if (error.name === 'AbortError' || error.message.includes('fetch')) {
            return;
        }
        
        UI.showToast('Ocorreu um erro inesperado', 'error');
    }

    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Obtém estatísticas do aplicativo
     */
    getStats() {
        return {
            isInitialized: this.isInitialized,
            isOnline: this.isOnline,
            tunerStatus: Tuner.getStatus(),
            storageStats: Storage.getStatistics(),
            browserInfo: this.getBrowserInfo(),
            performance: this.getPerformanceInfo()
        };
    }

    /**
     * Obtém informações do navegador
     */
    getBrowserInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            hasBattery: Utils.hasBattery(),
            supportsWebAudio: Utils.supportsWebAudio(),
            supportsGetUserMedia: Utils.supportsGetUserMedia(),
            supportsPWA: Utils.supportsPWA()
        };
    }

    /**
     * Obtém informações de performance
     */
    getPerformanceInfo() {
        if (!window.performance) return null;
        
        return {
            navigation: performance.getEntriesByType('navigation'),
            resource: performance.getEntriesByType('resource'),
            memory: performance.memory || null,
            timing: performance.timing || null
        };
    }

    /**
     * Limpa recursos
     */
    cleanup() {
        // Para o tuner
        Tuner.cleanup();
        
        // Salva dados finais
        Storage.saveAll();
        
        console.log('Afinador Pro encerrado');
    }

    /**
     * Reinicia aplicação
     */
    async restart() {
        try {
            this.cleanup();
            await this.init();
        } catch (error) {
            console.error('Erro ao reiniciar aplicação:', error);
        }
    }

    /**
     * Exporta dados do aplicativo
     */
    exportAppData() {
        const data = {
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            stats: this.getStats(),
            storage: Storage.exportData()
        };
        
        return JSON.stringify(data, null, 2);
    }

    /**
     * Importa dados do aplicativo
     */
    importAppData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.storage) {
                return Storage.importData(data.storage);
            }
            
            return false;
        } catch (error) {
            console.error('Erro ao importar dados:', error);
            return false;
        }
    }
}

// Inicializa aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.App = new App();
});

// Limpa recursos ao fechar
window.addEventListener('beforeunload', () => {
    if (window.App) {
        window.App.cleanup();
    }
});

// Export para debug
window.debugApp = () => {
    if (window.App) {
        console.table(window.App.getStats());
        return window.App.getStats();
    }
};