/**
 * Interface do Usuário
 */

class UI {
    constructor() {
        this.elements = {};
        this.isAnimating = false;
        this.animationFrame = null;
        
        this.init();
    }

    /**
     * Inicializa a interface
     */
    init() {
        this.getElements();
        this.bindEvents();
        this.loadInitialData();
        this.updateTheme();
        this.updateBatteryStatus();
        
        // Atualiza bateria periodicamente
        setInterval(() => this.updateBatteryStatus(), 30000);
    }

    /**
     * Obtém referências dos elementos
     */
    getElements() {
        this.elements = {
            // Header
            themeToggle: document.getElementById('theme-toggle'),
            settingsToggle: document.getElementById('settings-toggle'),
            
            // Tuner Display
            tunerDisplay: document.getElementById('tuner-display'),
            needle: document.getElementById('needle'),
            gaugeProgress: document.querySelector('.gauge-progress'),
            noteName: document.getElementById('note-name'),
            noteOctave: document.getElementById('note-octave'),
            frequencyValue: document.getElementById('frequency-value'),
            centsValue: document.getElementById('cents-value'),
            
            // Status Indicators
            statusMicrophone: document.getElementById('status-microphone'),
            statusDetuning: document.getElementById('status-detuning'),
            statusBattery: document.getElementById('status-battery'),
            
            // Controls
            instrumentSelector: document.getElementById('instrument-selector'),
            tuningSelector: document.getElementById('tuning-selector'),
            stringSelector: document.getElementById('string-selector'),
            startBtn: document.getElementById('start-btn'),
            stopBtn: document.getElementById('stop-btn'),
            calibrateBtn: document.getElementById('calibrate-btn'),
            
            // Settings
            settingsPanel: document.getElementById('settings-panel'),
            closeSettings: document.getElementById('close-settings'),
            sensitivity: document.getElementById('sensitivity'),
            sensitivityValue: document.getElementById('sensitivity-value'),
            calibration: document.getElementById('calibration'),
            calibrationValue: document.getElementById('calibration-value'),
            autoDetect: document.getElementById('auto-detect'),
            audioFeedback: document.getElementById('audio-feedback'),
            hapticFeedback: document.getElementById('haptic-feedback'),
            darkMode: document.getElementById('dark-mode'),
            animations: document.getElementById('animations'),
            beatDetection: document.getElementById('beat-detection'),
            chromaticMode: document.getElementById('chromatic-mode'),
            saveSettings: document.getElementById('save-settings'),
            
            // History
            historyList: document.getElementById('history-list'),
            clearHistory: document.getElementById('clear-history'),
            exportHistory: document.getElementById('export-history'),
            
            // Footer
            installBtn: document.getElementById('install-btn'),
            shareBtn: document.getElementById('share-btn'),
            
            // Loading
            loadingOverlay: document.getElementById('loading-overlay'),
            
            // Toast
            toastContainer: document.getElementById('toast-container')
        };
    }

    /**
     * Vincula eventos
     */
    bindEvents() {
        // Botões principais
        this.elements.startBtn.addEventListener('click', () => this.startTuner());
        this.elements.stopBtn.addEventListener('click', () => this.stopTuner());
        this.elements.calibrateBtn.addEventListener('click', () => this.calibrateTuner());
        
        // Controles de instrumento
        this.elements.instrumentSelector.addEventListener('click', (e) => this.handleInstrumentChange(e));
        
        // Controles de afinagem
        this.elements.tuningSelector.addEventListener('click', (e) => this.handleTuningChange(e));
        
        // Controles de corda
        this.elements.stringSelector.addEventListener('click', (e) => this.handleStringChange(e));
        
        // Configurações
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.elements.settingsToggle.addEventListener('click', () => this.toggleSettings());
        this.elements.closeSettings.addEventListener('click', () => this.closeSettings());
        
        // Inputs de configurações
        this.elements.sensitivity.addEventListener('input', (e) => this.handleSensitivityChange(e));
        this.elements.calibration.addEventListener('input', (e) => this.handleCalibrationChange(e));
        this.elements.autoDetect.addEventListener('change', (e) => this.handleAutoDetectChange(e));
        this.elements.audioFeedback.addEventListener('change', (e) => this.handleAudioFeedbackChange(e));
        this.elements.hapticFeedback.addEventListener('change', (e) => this.handleHapticFeedbackChange(e));
        this.elements.darkMode.addEventListener('change', (e) => this.handleDarkModeChange(e));
        this.elements.animations.addEventListener('change', (e) => this.handleAnimationsChange(e));
        this.elements.beatDetection.addEventListener('change', (e) => this.handleBeatDetectionChange(e));
        this.elements.chromaticMode.addEventListener('change', (e) => this.handleChromaticModeChange(e));
        this.elements.saveSettings.addEventListener('click', () => this.saveSettings());
        
        // Histórico
        this.elements.clearHistory.addEventListener('click', () => this.clearHistory());
        this.elements.exportHistory.addEventListener('click', () => this.exportHistory());
        
        // Footer
        this.elements.installBtn.addEventListener('click', () => this.installPWA());
        this.elements.shareBtn.addEventListener('click', () => this.shareApp());
        
        // Eventos de teclado
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Eventos de visibilidade
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
        
        // Eventos de bateria
        if ('getBattery' in navigator) {
            navigator.getBattery().then((battery) => {
                battery.addEventListener('levelchange', () => this.updateBatteryStatus());
            });
        }
    }

    /**
     * Carrega dados iniciais
     */
    loadInitialData() {
        const settings = Storage.getSettings();
        
        // Atualiza UI com configurações
        this.updateSensitivityUI(settings.sensitivity);
        this.updateCalibrationUI(settings.a440);
        this.updateAutoDetectUI(settings.autoDetect);
        this.updateAudioFeedbackUI(settings.audioFeedback);
        this.updateHapticFeedbackUI(settings.hapticFeedback);
        this.updateDarkModeUI(settings.theme === 'dark');
        this.updateAnimationsUI(settings.animations);
        this.updateBeatDetectionUI(settings.beatDetection);
        this.updateChromaticModeUI(settings.chromaticMode);
        
        // Carrega instrumentos e afinagens
        this.loadInstruments();
        this.loadTunings(settings.currentInstrument, settings.currentTuning);
        this.loadStrings(settings.currentInstrument, settings.currentTuning, settings.currentString);
        
        // Carrega histórico
        this.loadHistory();
    }

    /**
     * Atualiza display do afinador
     */
    updateTunerDisplay(frequency, note, cents) {
        // Atualiza frequência
        this.elements.frequencyValue.textContent = Utils.formatFrequency(frequency);
        
        // Atualiza nota
        if (note) {
            this.elements.noteName.textContent = note.name;
            this.elements.noteOctave.textContent = note.octave;
        } else {
            this.elements.noteName.textContent = '-';
            this.elements.noteOctave.textContent = '-';
        }
        
        // Atualiza cents
        this.elements.centsValue.textContent = Utils.formatCents(cents);
        
        // Atualiza agulha
        this.updateNeedle(cents);
        
        // Atualiza gauge
        this.updateGauge(frequency, note);
        
        // Atualiza status
        this.updateStatus(frequency, cents);
        
        // Atualiza animações
        this.updateAnimations(frequency, cents);
    }

    /**
     * Atualiza agulha
     */
    updateNeedle(cents) {
        const maxRotation = 50;
        const rotation = Math.max(Math.min(cents, maxRotation), -maxRotation);
        
        this.elements.needle.style.transform = `rotate(${rotation}deg)`;
        
        // Atualiza cor da agulha
        if (Math.abs(cents) < 5) {
            this.elements.needle.style.background = 'var(--color-success)';
        } else if (Math.abs(cents) < 20) {
            this.elements.needle.style.background = 'var(--color-warning)';
        } else {
            this.elements.needle.style.background = 'var(--color-danger)';
        }
    }

    /**
     * Atualiza gauge
     */
    updateGauge(frequency, note) {
        if (!note || frequency <= 0) {
            this.elements.gaugeProgress.style.strokeDashoffset = '1130';
            return;
        }
        
        const targetFrequency = Utils.midiToFrequency(note.midi);
        const progress = Math.min(frequency / targetFrequency, 2);
        const circumference = 1130;
        const offset = circumference - (progress * circumference);
        
        this.elements.gaugeProgress.style.strokeDashoffset = offset.toString();
    }

    /**
     * Atualiza status
     */
    updateStatus(frequency, cents) {
        // Status de microfone
        const isRunning = Tuner.isRunning;
        this.elements.statusMicrophone.classList.toggle('active', isRunning);
        
        // Status de desafinação
        const isTuned = Math.abs(cents) < 5;
        this.elements.statusDetuning.classList.toggle('active', !isTuned);
        this.elements.statusDetuning.innerHTML = isTuned 
            ? '<i class="fas fa-check-circle"></i><span>Afinado</span>'
            : '<i class="fas fa-exclamation-triangle"></i><span>Desafinado</span>';
        
        // Status do display
        this.elements.tunerDisplay.classList.toggle('in-tune', isTuned);
        this.elements.tunerDisplay.classList.toggle('out-of-tune', !isTuned);
    }

    /**
     * Atualiza animações
     */
    updateAnimations(frequency, cents) {
        const isTuned = Math.abs(cents) < 5;
        
        if (isTuned && Storage.getSettings().animations) {
            if (!this.elements.needle.classList.contains('in-tune')) {
                this.elements.needle.classList.add('in-tune');
            }
        } else {
            this.elements.needle.classList.remove('in-tune');
        }
    }

    /**
     * Atualiza bateria
     */
    async updateBatteryStatus() {
        if (!await Utils.hasBattery()) {
            this.elements.statusBattery.style.display = 'none';
            return;
        }
        
        const level = await Utils.getBatteryLevel();
        if (level !== null) {
            this.elements.statusBattery.style.display = 'flex';
            this.elements.statusBattery.querySelector('span').textContent = `${level}%`;
            
            // Atualiza cor baseado no nível
            this.elements.statusBattery.classList.remove('low', 'medium', 'high');
            if (level < 20) {
                this.elements.statusBattery.classList.add('low');
            } else if (level < 50) {
                this.elements.statusBattery.classList.add('medium');
            } else {
                this.elements.statusBattery.classList.add('high');
            }
        }
    }

    /**
     * Inicia afinador
     */
    async startTuner() {
        try {
            this.showLoading(true);
            
            // Atualiza botões
            this.elements.startBtn.disabled = true;
            this.elements.stopBtn.disabled = false;
            
            // Configura tuner
            const settings = Storage.getSettings();
            Tuner.updateConfig({
                sensitivity: settings.sensitivity,
                a440: settings.a440
            });
            
            // Define callbacks
            Tuner.setCallbacks({
                onFrequency: (frequency, note, cents) => {
                    this.updateTunerDisplay(frequency, note, cents);
                },
                onAccuracy: (isTuned, confidence, volume) => {
                    // Pode ser expandido com feedback adicional
                },
                onError: (error) => {
                    this.showToast('Erro ao iniciar microfone', 'error');
                    this.stopTuner();
                }
            });
            
            // Inicia detecção
            await Tuner.start();
            
            this.showLoading(false);
            this.showToast('Afinador iniciado', 'success');
            
        } catch (error) {
            console.error('Erro ao iniciar afinador:', error);
            this.showLoading(false);
            this.stopTuner();
            this.showToast('Erro ao iniciar afinador', 'error');
        }
    }

    /**
     * Para afinador
     */
    stopTuner() {
        Tuner.stop();
        
        // Atualiza botões
        this.elements.startBtn.disabled = false;
        this.elements.stopBtn.disabled = true;
        
        // Limpa display
        this.updateTunerDisplay(0, null, 0);
        
        this.showToast('Afinador parado', 'warning');
    }

    /**
     * Calibra afinador
     */
    calibrateTuner() {
        Tuner.calibrateSensitivity();
        this.showToast('Calibração realizada', 'success');
    }

    /**
     * Altera instrumento
     */
    handleInstrumentChange(e) {
        const button = e.target.closest('.instrument-btn');
        if (!button) return;
        
        // Atualiza UI
        document.querySelectorAll('.instrument-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        const instrumentId = button.dataset.instrument;
        const tuningId = button.dataset.tuning;
        
        // Atualiza storage
        Storage.updateSettings({
            currentInstrument: instrumentId,
            currentTuning: tuningId,
            currentString: 1
        });
        
        // Atualiza UI
        this.loadTunings(instrumentId, tuningId);
        this.loadStrings(instrumentId, tuningId, 1);
        
        this.showToast(`Instrumento: ${button.textContent.trim()}`, 'success');
    }

    /**
     * Altera afinagem
     */
    handleTuningChange(e) {
        const button = e.target.closest('.tuning-btn');
        if (!button) return;
        
        // Atualiza UI
        document.querySelectorAll('.tuning-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        const tuningId = button.dataset.tuning;
        
        // Atualiza storage
        Storage.updateSettings({
            currentTuning: tuningId,
            currentString: 1
        });
        
        // Atualiza UI
        const settings = Storage.getSettings();
        this.loadStrings(settings.currentInstrument, tuningId, 1);
        
        this.showToast(`Afinagem: ${button.textContent.trim()}`, 'success');
    }

    /**
     * Altera corda
     */
    handleStringChange(e) {
        const button = e.target.closest('.string-btn');
        if (!button) return;
        
        // Atualiza UI
        document.querySelectorAll('.string-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        const stringIndex = parseInt(button.dataset.string);
        
        // Atualiza storage
        Storage.updateSettings({
            currentString: stringIndex
        });
        
        this.showToast(`Corda: ${button.textContent.trim()}`, 'success');
    }

    /**
     * Altera sensibilidade
     */
    handleSensitivityChange(e) {
        const value = parseFloat(e.target.value);
        this.updateSensitivityUI(value);
        
        // Atualiza storage
        Storage.updateSettings({ sensitivity: value });
        
        // Atualiza tuner se estiver rodando
        if (Tuner.isRunning) {
            Tuner.updateConfig({ sensitivity: value });
        }
    }

    /**
     * Altera calibração A440
     */
    handleCalibrationChange(e) {
        const value = parseInt(e.target.value);
        this.updateCalibrationUI(value);
        
        // Atualiza storage
        Storage.updateSettings({ a440: value });
        
        // Atualiza tuner se estiver rodando
        if (Tuner.isRunning) {
            Tuner.updateConfig({ a440: value });
        }
    }

    /**
     * Altera detecção automática
     */
    handleAutoDetectChange(e) {
        const value = e.target.checked;
        Storage.updateSettings({ autoDetect: value });
    }

    /**
     * Altera feedback de áudio
     */
    handleAudioFeedbackChange(e) {
        const value = e.target.checked;
        Storage.updateSettings({ audioFeedback: value });
    }

    /**
     * Altera feedback tátil
     */
    handleHapticFeedbackChange(e) {
        const value = e.target.checked;
        Storage.updateSettings({ hapticFeedback: value });
    }

    /**
     * Altera modo escuro
     */
    handleDarkModeChange(e) {
        const value = e.target.checked;
        const theme = value ? 'dark' : 'light';
        
        // Atualiza storage
        Storage.updateSettings({ theme: theme });
        
        // Atualiza tema
        this.updateTheme();
    }

    /**
     * Altera animações
     */
    handleAnimationsChange(e) {
        const value = e.target.checked;
        Storage.updateSettings({ animations: value });
        
        // Atualiza CSS
        document.body.style.setProperty('--transition-fast', value ? '150ms' : '0ms');
        document.body.style.setProperty('--transition-normal', value ? '300ms' : '0ms');
        document.body.style.setProperty('--transition-slow', value ? '500ms' : '0ms');
    }

    /**
     * Altera detecção de batidas
     */
    handleBeatDetectionChange(e) {
        const value = e.target.checked;
        Storage.updateSettings({ beatDetection: value });
    }

    /**
     * Altera modo cromático
     */
    handleChromaticModeChange(e) {
        const value = e.target.checked;
        Storage.updateSettings({ chromaticMode: value });
    }

    /**
     * Salva configurações
     */
    saveSettings() {
        this.showToast('Configurações salvas', 'success');
    }

    /**
     * Atualiza UI de sensibilidade
     */
    updateSensitivityUI(value) {
        this.elements.sensitivity.value = value;
        this.elements.sensitivityValue.textContent = `${Math.round(value * 100)}%`;
    }

    /**
     * Atualiza UI de calibração
     */
    updateCalibrationUI(value) {
        this.elements.calibration.value = value;
        this.elements.calibrationValue.textContent = `${value} Hz`;
    }

    /**
     * Atualiza UI de detecção automática
     */
    updateAutoDetectUI(value) {
        this.elements.autoDetect.checked = value;
    }

    /**
     * Atualiza UI de feedback de áudio
     */
    updateAudioFeedbackUI(value) {
        this.elements.audioFeedback.checked = value;
    }

    /**
     * Atualiza UI de feedback tátil
     */
    updateHapticFeedbackUI(value) {
        this.elements.hapticFeedback.checked = value;
    }

    /**
     * Atualiza UI de modo escuro
     */
    updateDarkModeUI(value) {
        this.elements.darkMode.checked = value;
    }

    /**
     * Atualiza UI de animações
     */
    updateAnimationsUI(value) {
        this.elements.animations.checked = value;
    }

    /**
     * Atualiza UI de detecção de batidas
     */
    updateBeatDetectionUI(value) {
        this.elements.beatDetection.checked = value;
    }

    /**
     * Atualiza UI de modo cromático
     */
    updateChromaticModeUI(value) {
        this.elements.chromaticMode.checked = value;
    }

    /**
     * Alterna tema
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        Storage.updateSettings({ theme: newTheme });
        
        this.showToast(`Tema: ${newTheme === 'dark' ? 'Escuro' : 'Claro'}`, 'success');
    }

    /**
     * Atualiza tema
     */
    updateTheme() {
        const settings = Storage.getSettings();
        let theme = settings.theme;
        
        if (theme === 'system') {
            theme = Utils.getSystemTheme();
        }
        
        document.documentElement.setAttribute('data-theme', theme);
        
        // Atualiza botão de tema
        this.elements.darkMode.checked = theme === 'dark';
    }

    /**
     * Alterna configurações
     */
    toggleSettings() {
        this.elements.settingsPanel.classList.toggle('active');
    }

    /**
     * Fecha configurações
     */
    closeSettings() {
        this.elements.settingsPanel.classList.remove('active');
    }

    /**
     * Carrega instrumentos
     */
    loadInstruments() {
        const instruments = Storage.getInstruments();
        const currentInstrument = Storage.getSettings().currentInstrument;
        
        this.elements.instrumentSelector.innerHTML = '';
        
        instruments.forEach(instrument => {
            const button = document.createElement('button');
            button.className = `instrument-btn ${instrument.id === currentInstrument ? 'active' : ''}`;
            button.dataset.instrument = instrument.id;
            button.dataset.tuning = instrument.tunings[0].id;
            button.innerHTML = `
                <i class="fas fa-${instrument.icon}"></i>
                <span>${instrument.name}</span>
            `;
            this.elements.instrumentSelector.appendChild(button);
        });
    }

    /**
     * Carrega afinagens
     */
    loadTunings(instrumentId, currentTuning) {
        const instrument = Storage.getInstrument(instrumentId);
        if (!instrument) return;
        
        this.elements.tuningSelector.innerHTML = '';
        
        instrument.tunings.forEach(tuning => {
            const button = document.createElement('button');
            button.className = `tuning-btn ${tuning.id === currentTuning ? 'active' : ''}`;
            button.dataset.tuning = tuning.id;
            button.textContent = tuning.name;
            this.elements.tuningSelector.appendChild(button);
        });
    }

    /**
     * Carrega cordas
     */
    loadStrings(instrumentId, tuningId, currentString) {
        const instrument = Storage.getInstrument(instrumentId);
        const tuning = instrument.tunings.find(t => t.id === tuningId);
        if (!instrument || !tuning) return;
        
        this.elements.stringSelector.innerHTML = '';
        
        tuning.strings.forEach((stringIndex, index) => {
            const note = Utils.frequencyToNote(instrument.strings[stringIndex].frequency);
            const button = document.createElement('button');
            button.className = `string-btn ${index === currentString ? 'active' : ''}`;
            button.dataset.string = index;
            button.textContent = `${note.name}${note.octave}`;
            this.elements.stringSelector.appendChild(button);
        });
    }

    /**
     * Carrega histórico
     */
    loadHistory() {
        const history = Storage.getHistory(10);
        this.elements.historyList.innerHTML = '';
        
        if (history.length === 0) {
            this.elements.historyList.innerHTML = '<div class="empty-state">Nenhuma sessão ainda</div>';
            return;
        }
        
        history.forEach(entry => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <div class="note-info">
                    <span class="note-name">${entry.note || '-'}</span>
                    <span class="note-details">${entry.frequency || '0.00'} Hz • ${entry.instrument || '-'}</span>
                </div>
                <div class="time">${Utils.formatDate(new Date(entry.timestamp))}</div>
            `;
            this.elements.historyList.appendChild(item);
        });
    }

    /**
     * Limpa histórico
     */
    clearHistory() {
        if (confirm('Deseja limpar todo o histórico?')) {
            Storage.clearHistory();
            this.loadHistory();
            this.showToast('Histórico limpo', 'success');
        }
    }

    /**
     * Exporta histórico
     */
    exportHistory() {
        const data = Storage.exportHistory();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `guitar-tuner-history-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('Histórico exportado', 'success');
    }

    /**
     * Instala PWA
     */
    async installPWA() {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            try {
                const registration = await navigator.serviceWorker.ready;
                if (registration.installing || registration.waiting) {
                    this.showToast('Instalação em andamento...', 'warning');
                    return;
                }
                
                this.showToast('Para instalar, clique em "Instalar" no navegador', 'info');
            } catch (error) {
                this.showToast('Erro ao instalar', 'error');
            }
        } else {
            this.showToast('Instalação não suportada', 'error');
        }
    }

    /**
     * Compartilha app
     */
    async shareApp() {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Afinador Pro',
                    text: 'Um afinador cromático profissional',
                    url: window.location.href
                });
            } catch (error) {
                this.copyShareLink();
            }
        } else {
            this.copyShareLink();
        }
    }

    /**
     * Copia link de compartilhamento
     */
    async copyShareLink() {
        const success = await Utils.copyToClipboard(window.location.href);
        this.showToast(success ? 'Link copiado' : 'Erro ao copiar', success ? 'success' : 'error');
    }

    /**
     * Exibe loading
     */
    showLoading(show) {
        if (show) {
            this.elements.loadingOverlay.classList.add('active');
        } else {
            this.elements.loadingOverlay.classList.remove('active');
        }
    }

    /**
     * Exibe toast
     */
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        this.elements.toastContainer.appendChild(toast);
        
        // Animação de entrada
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Remoção automática
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }

    /**
     * Manipula teclado
     */
    handleKeyboard(e) {
        switch (e.key) {
            case ' ':
                e.preventDefault();
                if (Tuner.isRunning) {
                    this.stopTuner();
                } else {
                    this.startTuner();
                }
                break;
            case 'Escape':
                this.closeSettings();
                break;
            case 't':
                this.toggleTheme();
                break;
        }
    }

    /**
     * Manipula visibilidade
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // Pausa detecção quando a aba não está visível
            if (Tuner.isRunning && !Storage.getSettings().beatDetection) {
                Tuner.stop();
            }
        } else {
            // Pode ser expandido para retomar detecção
        }
    }
}

// Export singleton instance
window.UI = new UI();