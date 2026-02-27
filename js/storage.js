/**
 * Sistema de Armazenamento Local
 */

class StorageManager {
    constructor() {
        this.prefix = 'guitar-tuner-pro';
        this.version = '1.0.0';
        this.defaultSettings = {
            theme: 'system',
            a440: 440,
            sensitivity: 0.3,
            autoDetect: true,
            audioFeedback: true,
            hapticFeedback: true,
            animations: true,
            beatDetection: true,
            chromaticMode: false,
            currentInstrument: 'guitar',
            currentTuning: 'standard',
            currentString: 1,
            lastUsed: new Date().toISOString()
        };
        
        this.defaultData = {
            settings: this.defaultSettings,
            history: [],
            instruments: this.getDefaultInstruments(),
            customTunings: [],
            favorites: []
        };
        
        this.init();
    }

    /**
     * Inicializa o storage
     */
    async init() {
        try {
            // Verifica suporte a localStorage
            if (!this.supportsLocalStorage()) {
                console.warn('LocalStorage não suportado');
                return;
            }
            
            // Migra dados antigos se necessário
            await this.migrateOldData();
            
            // Carrega dados
            this.loadAll();
            
            // Salva versão atual
            this.setVersion();
            
        } catch (error) {
            console.error('Erro ao inicializar storage:', error);
        }
    }

    /**
     * Verifica suporte a localStorage
     */
    supportsLocalStorage() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Gera chave completa
     */
    getKey(key) {
        return `${this.prefix}-${key}`;
    }

    /**
     * Salva dado no localStorage
     */
    set(key, value) {
        try {
            const fullKey = this.getKey(key);
            const data = {
                value: value,
                timestamp: new Date().toISOString(),
                version: this.version
            };
            localStorage.setItem(fullKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Erro ao salvar no storage:', error);
            return false;
        }
    }

    /**
     * Obtém dado do localStorage
     */
    get(key, defaultValue = null) {
        try {
            const fullKey = this.getKey(key);
            const item = localStorage.getItem(fullKey);
            
            if (!item) {
                return defaultValue;
            }
            
            const data = JSON.parse(item);
            return data.value;
        } catch (error) {
            console.error('Erro ao obter do storage:', error);
            return defaultValue;
        }
    }

    /**
     * Remove dado do localStorage
     */
    remove(key) {
        try {
            const fullKey = this.getKey(key);
            localStorage.removeItem(fullKey);
            return true;
        } catch (error) {
            console.error('Erro ao remover do storage:', error);
            return false;
        }
    }

    /**
     * Limpa todos os dados
     */
    clear() {
        try {
            const keysToRemove = [];
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.prefix)) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => localStorage.removeItem(key));
            return true;
        } catch (error) {
            console.error('Erro ao limpar storage:', error);
            return false;
        }
    }

    /**
     * Salva versão
     */
    setVersion() {
        this.set('version', this.version);
    }

    /**
     * Obtém versão
     */
    getVersion() {
        return this.get('version', '0.0.0');
    }

    /**
     * Migra dados antigos
     */
    async migrateOldData() {
        const oldVersion = this.getVersion();
        
        if (oldVersion === '0.0.0') {
            // Migra dados da versão antiga
            this.migrateFromOldVersion();
        }
        
        // Adiciona outras migrações conforme necessário
    }

    /**
     * Migra da versão antiga
     */
    migrateFromOldVersion() {
        try {
            // Migra configurações antigas
            const oldSettings = localStorage.getItem('guitar-tuner-settings');
            if (oldSettings) {
                const settings = JSON.parse(oldSettings);
                this.set('settings', { ...this.defaultSettings, ...settings });
                localStorage.removeItem('guitar-tuner-settings');
            }
            
            // Migra histórico antigo
            const oldHistory = localStorage.getItem('guitar-tuner-history');
            if (oldHistory) {
                const history = JSON.parse(oldHistory);
                this.set('history', history);
                localStorage.removeItem('guitar-tuner-history');
            }
            
        } catch (error) {
            console.error('Erro na migração:', error);
        }
    }

    /**
     * Carrega todas as configurações
     */
    loadAll() {
        this.settings = this.get('settings', this.defaultSettings);
        this.history = this.get('history', []);
        this.instruments = this.get('instruments', this.getDefaultInstruments());
        this.customTunings = this.get('customTunings', []);
        this.favorites = this.get('favorites', []);
    }

    /**
     * Salva todas as configurações
     */
    saveAll() {
        this.set('settings', this.settings);
        this.set('history', this.history);
        this.set('instruments', this.instruments);
        this.set('customTunings', this.customTunings);
        this.set('favorites', this.favorites);
    }

    /**
     * Obtém configurações
     */
    getSettings() {
        return { ...this.settings };
    }

    /**
     * Atualiza configurações
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings, lastUsed: new Date().toISOString() };
        this.set('settings', this.settings);
        return this.settings;
    }

    /**
     * Obtém histórico
     */
    getHistory(limit = 50) {
        return this.history.slice(-limit).reverse();
    }

    /**
     * Adiciona ao histórico
     */
    addToHistory(entry) {
        const historyEntry = {
            id: Utils.generateId(),
            timestamp: new Date().toISOString(),
            ...entry
        };
        
        this.history.unshift(historyEntry);
        
        // Limita o histórico a 1000 entradas
        if (this.history.length > 1000) {
            this.history = this.history.slice(0, 1000);
        }
        
        this.set('history', this.history);
        return historyEntry;
    }

    /**
     * Limpa histórico
     */
    clearHistory() {
        this.history = [];
        this.set('history', this.history);
    }

    /**
     * Exporta histórico
     */
    exportHistory() {
        const data = {
            version: this.version,
            timestamp: new Date().toISOString(),
            history: this.history
        };
        
        return JSON.stringify(data, null, 2);
    }

    /**
     * Importa histórico
     */
    importHistory(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.history && Array.isArray(data.history)) {
                this.history = data.history;
                this.set('history', this.history);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Erro ao importar histórico:', error);
            return false;
        }
    }

    /**
     * Obtém instrumentos
     */
    getInstruments() {
        return this.instruments;
    }

    /**
     * Obtém instrumento por ID
     */
    getInstrument(id) {
        return this.instruments.find(inst => inst.id === id);
    }

    /**
     * Adiciona instrumento personalizado
     */
    addCustomInstrument(instrument) {
        const customInstrument = {
            ...instrument,
            id: Utils.generateId(),
            isCustom: true,
            createdAt: new Date().toISOString()
        };
        
        this.instruments.push(customInstrument);
        this.set('instruments', this.instruments);
        return customInstrument;
    }

    /**
     * Remove instrumento personalizado
     */
    removeCustomInstrument(id) {
        this.instruments = this.instruments.filter(inst => !(inst.id === id && inst.isCustom));
        this.set('instruments', this.instruments);
    }

    /**
     * Obtém afinagens
     */
    getTunings() {
        return this.customTunings;
    }

    /**
     * Obtém afinagem por ID
     */
    getTuning(id) {
        return this.customTunings.find(tuning => tuning.id === id);
    }

    /**
     * Adiciona afinagem personalizada
     */
    addCustomTuning(tuning) {
        const customTuning = {
            ...tuning,
            id: Utils.generateId(),
            isCustom: true,
            createdAt: new Date().toISOString()
        };
        
        this.customTunings.push(customTuning);
        this.set('customTunings', this.customTunings);
        return customTuning;
    }

    /**
     * Remove afinagem personalizada
     */
    removeCustomTuning(id) {
        this.customTunings = this.customTunings.filter(tuning => !(tuning.id === id && tuning.isCustom));
        this.set('customTunings', this.customTunings);
    }

    /**
     * Obtém favoritos
     */
    getFavorites() {
        return this.favorites;
    }

    /**
     * Adiciona favorito
     */
    addFavorite(type, item) {
        const favorite = {
            id: Utils.generateId(),
            type: type,
            item: item,
            createdAt: new Date().toISOString()
        };
        
        this.favorites.push(favorite);
        this.set('favorites', this.favorites);
        return favorite;
    }

    /**
     * Remove favorito
     */
    removeFavorite(id) {
        this.favorites = this.favorites.filter(fav => fav.id !== id);
        this.set('favorites', this.favorites);
    }

    /**
     * Obtém estatísticas
     */
    getStatistics() {
        const history = this.history;
        const totalSessions = history.length;
        
        if (totalSessions === 0) {
            return {
                totalSessions: 0,
                averageAccuracy: 0,
                mostUsedInstrument: null,
                mostUsedTuning: null,
                lastSession: null,
                sessionDuration: 0
            };
        }
        
        const lastSession = history[0];
        const instrumentCounts = {};
        const tuningCounts = {};
        
        history.forEach(session => {
            if (session.instrument) {
                instrumentCounts[session.instrument] = (instrumentCounts[session.instrument] || 0) + 1;
            }
            if (session.tuning) {
                tuningCounts[session.tuning] = (tuningCounts[session.tuning] || 0) + 1;
            }
        });
        
        const mostUsedInstrument = Object.keys(instrumentCounts).reduce((a, b) => 
            instrumentCounts[a] > instrumentCounts[b] ? a : b, null);
        
        const mostUsedTuning = Object.keys(tuningCounts).reduce((a, b) => 
            tuningCounts[a] > tuningCounts[b] ? a : b, null);
        
        return {
            totalSessions,
            averageAccuracy: this.calculateAverageAccuracy(),
            mostUsedInstrument,
            mostUsedTuning,
            lastSession,
            sessionDuration: this.calculateSessionDuration()
        };
    }

    /**
     * Calcula precisão média
     */
    calculateAverageAccuracy() {
        const recentSessions = this.history.slice(-20);
        if (recentSessions.length === 0) return 0;
        
        const totalAccuracy = recentSessions.reduce((sum, session) => {
            return sum + (session.accuracy || 0);
        }, 0);
        
        return totalAccuracy / recentSessions.length;
    }

    /**
     * Calcula duração média da sessão
     */
    calculateSessionDuration() {
        // Implementar lógica para calcular duração da sessão
        return 0;
    }

    /**
     * Reseta dados
     */
    resetData() {
        this.settings = { ...this.defaultSettings };
        this.history = [];
        this.instruments = this.getDefaultInstruments();
        this.customTunings = [];
        this.favorites = [];
        
        this.saveAll();
    }

    /**
     * Exporta todos os dados
     */
    exportData() {
        const data = {
            version: this.version,
            timestamp: new Date().toISOString(),
            settings: this.settings,
            history: this.history,
            instruments: this.instruments,
            customTunings: this.customTunings,
            favorites: this.favorites
        };
        
        return JSON.stringify(data, null, 2);
    }

    /**
     * Importa todos os dados
     */
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.settings) this.settings = data.settings;
            if (data.history) this.history = data.history;
            if (data.instruments) this.instruments = data.instruments;
            if (data.customTunings) this.customTunings = data.customTunings;
            if (data.favorites) this.favorites = data.favorites;
            
            this.saveAll();
            return true;
        } catch (error) {
            console.error('Erro ao importar dados:', error);
            return false;
        }
    }

    /**
     * Obtém instrumentos padrão
     */
    getDefaultInstruments() {
        return [
            {
                id: 'guitar',
                name: 'Guitarra',
                icon: 'guitar',
                strings: [
                    { name: 'E', octave: 2, frequency: 82.41 },
                    { name: 'A', octave: 2, frequency: 110.00 },
                    { name: 'D', octave: 3, frequency: 146.83 },
                    { name: 'G', octave: 3, frequency: 196.00 },
                    { name: 'B', octave: 3, frequency: 246.94 },
                    { name: 'E', octave: 4, frequency: 329.63 }
                ],
                tunings: [
                    { id: 'standard', name: 'E Standard', strings: [0, 1, 2, 3, 4, 5] },
                    { id: 'drop-d', name: 'Drop D', strings: [0, 1, 2, 3, 4, 10] },
                    { id: 'open-g', name: 'Open G', strings: [2, 7, 2, 7, 11, 7] },
                    { id: 'open-d', name: 'Open D', strings: [2, 7, 2, 6, 9, 2] },
                    { id: 'open-e', name: 'Open E', strings: [4, 9, 4, 8, 11, 4] },
                    { id: 'half-step-down', name: 'Meio Tom Abaixo', strings: [10, 11, 0, 1, 2, 3] },
                    { id: 'drop-c', name: 'Drop C', strings: [8, 9, 10, 11, 1, 8] }
                ]
            },
            {
                id: 'bass',
                name: 'Baixo',
                icon: 'music',
                strings: [
                    { name: 'E', octave: 1, frequency: 41.20 },
                    { name: 'A', octave: 1, frequency: 55.00 },
                    { name: 'D', octave: 2, frequency: 73.42 },
                    { name: 'G', octave: 2, frequency: 98.00 }
                ],
                tunings: [
                    { id: 'standard', name: 'E Standard', strings: [0, 1, 2, 3] },
                    { id: 'drop-d', name: 'Drop D', strings: [0, 1, 2, 10] },
                    { id: 'fifths', name: 'Quintas', strings: [0, 7, 2, 9] },
                    { id: 'tenor', name: 'Tenor', strings: [5, 10, 3, 8] }
                ]
            },
            {
                id: 'ukulele',
                name: 'Ukulele',
                icon: 'leaf',
                strings: [
                    { name: 'G', octave: 4, frequency: 392.00 },
                    { name: 'C', octave: 4, frequency: 261.63 },
                    { name: 'E', octave: 4, frequency: 329.63 },
                    { name: 'A', octave: 4, frequency: 440.00 }
                ],
                tunings: [
                    { id: 'standard', name: 'C6 Standard', strings: [7, 0, 4, 9] },
                    { id: 'low-g', name: 'Low G', strings: [-5, 0, 4, 9] },
                    { id: 'd-tuning', name: 'D Tuning', strings: [9, 2, 6, 11] }
                ]
            },
            {
                id: 'violin',
                name: 'Violino',
                icon: 'music',
                strings: [
                    { name: 'G', octave: 3, frequency: 196.00 },
                    { name: 'D', octave: 4, frequency: 293.66 },
                    { name: 'A', octave: 4, frequency: 440.00 },
                    { name: 'E', octave: 5, frequency: 659.25 }
                ],
                tunings: [
                    { id: 'standard', name: 'Standard', strings: [7, 2, 9, 4] }
                ]
            }
        ];
    }
}

// Export singleton instance
window.Storage = new StorageManager();