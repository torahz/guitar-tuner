/**
 * Sistema de Detecção de Pitch
 */

class Tuner {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.processor = null;
        this.source = null;
        
        this.isRunning = false;
        this.lastFrequency = 0;
        this.lastNote = null;
        this.lastCents = 0;
        
        this.config = {
            sampleRate: 44100,
            fftSize: 2048,
            minFrequency: 20,
            maxFrequency: 2000,
            sensitivity: 0.3,
            a440: 440,
            detectionThreshold: 0.1,
            minVolume: 0.01,
            maxVolume: 1.0
        };
        
        this.callbacks = {
            onFrequency: null,
            onNote: null,
            onAccuracy: null,
            onError: null
        };
        
        this.init();
    }

    /**
     * Inicializa o tuner
     */
    async init() {
        try {
            // Verifica suporte
            if (!Utils.supportsWebAudio()) {
                throw new Error('Web Audio API não suportado');
            }
            
            // Cria contexto de áudio
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.processor = this.audioContext.createScriptProcessor(2048, 1, 1);
            
            // Configura analisador
            this.analyser.fftSize = this.config.fftSize;
            this.analyser.smoothingTimeConstant = 0.8;
            
            // Conecta processador
            this.processor.onaudioprocess = this.onAudioProcess.bind(this);
            
        } catch (error) {
            console.error('Erro ao inicializar tuner:', error);
            this.triggerError(error);
        }
    }

    /**
     * Inicia a detecção
     */
    async start() {
        try {
            if (this.isRunning) return;
            
            // Solicita permissão de microfone
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: { 
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } 
            });
            
            // Cria fonte de áudio
            this.source = this.audioContext.createMediaStreamSource(stream);
            
            // Conecta componentes
            this.source.connect(this.analyser);
            this.analyser.connect(this.processor);
            this.processor.connect(this.audioContext.destination);
            
            this.isRunning = true;
            this.lastFrequency = 0;
            this.lastNote = null;
            this.lastCents = 0;
            
            // Inicia detecção
            this.detectLoop();
            
        } catch (error) {
            console.error('Erro ao iniciar detecção:', error);
            this.triggerError(error);
        }
    }

    /**
     * Para a detecção
     */
    stop() {
        try {
            if (!this.isRunning) return;
            
            // Desconecta componentes
            if (this.source) {
                this.source.disconnect();
                this.source = null;
            }
            
            if (this.analyser) {
                this.analyser.disconnect();
            }
            
            if (this.processor) {
                this.processor.disconnect();
            }
            
            // Fecha stream
            if (this.microphone) {
                this.microphone.getTracks().forEach(track => track.stop());
                this.microphone = null;
            }
            
            this.isRunning = false;
            
        } catch (error) {
            console.error('Erro ao parar detecção:', error);
        }
    }

    /**
     * Loop de detecção
     */
    detectLoop() {
        if (!this.isRunning) return;
        
        try {
            // Obtém dados do analisador
            const bufferLength = this.analyser.fftSize;
            const timeDomainData = new Float32Array(bufferLength);
            this.analyser.getFloatTimeDomainData(timeDomainData);
            
            // Detecta pitch
            const result = this.detectPitch(timeDomainData);
            
            if (result.frequency > 0) {
                this.processResult(result);
            }
            
            // Continua loop
            requestAnimationFrame(() => this.detectLoop());
            
        } catch (error) {
            console.error('Erro no loop de detecção:', error);
            this.triggerError(error);
        }
    }

    /**
     * Processa resultado da detecção
     */
    processResult(result) {
        const { frequency, confidence, volume } = result;
        
        // Verifica volume
        if (volume < this.config.minVolume) {
            this.triggerFrequency(0, null, 0);
            return;
        }
        
        // Verifica confiança
        if (confidence < this.config.sensitivity) {
            this.triggerFrequency(this.lastFrequency, this.lastNote, this.lastCents);
            return;
        }
        
        // Atualiza últimos valores
        this.lastFrequency = frequency;
        this.lastNote = Utils.frequencyToNote(frequency, this.config.a440);
        this.lastCents = this.calculateCents(frequency, this.lastNote);
        
        // Verifica se está afinado
        const isTuned = Math.abs(this.lastCents) < 5;
        
        // Dispara callbacks
        this.triggerFrequency(frequency, this.lastNote, this.lastCents);
        this.triggerAccuracy(isTuned, confidence, volume);
        
        // Feedback tátil se habilitado
        if (isTuned && navigator.vibrate && Storage.getSettings().hapticFeedback) {
            navigator.vibrate(50);
        }
        
    }

    /**
     * Detecta pitch usando auto-correlação
     */
    detectPitch(timeDomainData) {
        const bufferLength = timeDomainData.length;
        
        // Calcula volume RMS
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            sum += Math.abs(timeDomainData[i]);
        }
        const volume = sum / bufferLength;
        
        // Verifica volume mínimo
        if (volume < this.config.minVolume) {
            return { frequency: 0, confidence: 0, volume };
        }
        
        // Encontra limites do sinal
        let r1 = 0, r2 = bufferLength - 1;
        const threshold = this.config.detectionThreshold;
        
        for (let i = 0; i < bufferLength / 2; i++) {
            if (Math.abs(timeDomainData[i]) > threshold) {
                r1 = i;
                break;
            }
        }
        
        for (let i = 1; i < bufferLength / 2; i++) {
            if (Math.abs(timeDomainData[bufferLength - i]) > threshold) {
                r2 = bufferLength - i;
                break;
            }
        }
        
        if (r2 - r1 < bufferLength / 4) {
            return { frequency: 0, confidence: 0, volume };
        }
        
        // Auto-correlação
        const signal = timeDomainData.slice(r1, r2);
        const signalLength = signal.length;
        const correlations = new Array(signalLength).fill(0);
        
        for (let lag = 0; lag < signalLength; lag++) {
            for (let i = 0; i < signalLength - lag; i++) {
                correlations[lag] += signal[i] * signal[i + lag];
            }
        }
        
        // Encontra pico
        let d = 0;
        while (d < signalLength / 2 && correlations[d] > correlations[d + 1]) {
            d++;
        }
        
        let maxVal = -1, maxPos = -1;
        for (let i = d; i < signalLength / 2; i++) {
            if (correlations[i] > maxVal) {
                maxVal = correlations[i];
                maxPos = i;
            }
        }
        
        if (maxPos <= 0) {
            return { frequency: 0, confidence: 0, volume };
        }
        
        // Interpolação quadrática
        const T0 = maxPos;
        const c1 = correlations[T0 - 1];
        const c2 = correlations[T0];
        const c3 = correlations[T0 + 1];
        
        const interpolation = (c1 - c3) / (2 * (2 * c2 - c1 - c3));
        const period = T0 + interpolation;
        
        // Calcula frequência
        const frequency = this.audioContext.sampleRate / period;
        
        // Calcula confiança
        const confidence = maxVal / (signalLength * signalLength);
        
        return { 
            frequency: this.validateFrequency(frequency), 
            confidence: Math.min(confidence, 1), 
            volume 
        };
    }

    /**
     * Valida frequência
     */
    validateFrequency(frequency) {
        if (frequency < this.config.minFrequency || frequency > this.config.maxFrequency) {
            return 0;
        }
        
        // Filtro de frequência para remover ruídos
        if (this.lastFrequency > 0) {
            const diff = Math.abs(frequency - this.lastFrequency);
            if (diff > 50 && frequency > 100) {
                return this.lastFrequency;
            }
        }
        
        return frequency;
    }

    /**
     * Calcula cents de desafinação
     */
    calculateCents(frequency, note) {
        if (!note || frequency <= 0) return 0;
        
        const targetFrequency = Utils.midiToFrequency(note.midi);
        return Utils.calculateCents(frequency, targetFrequency);
    }

    /**
     * Detecta batidas (beat detection)
     */
    detectBeats() {
        if (!this.isRunning || !Storage.getSettings().beatDetection) return;
        
        try {
            const bufferLength = this.analyser.frequencyBinCount;
            const frequencyData = new Uint8Array(bufferLength);
            this.analyser.getByteFrequencyData(frequencyData);
            
            // Detecta picos de energia
            let energy = 0;
            for (let i = 0; i < bufferLength; i++) {
                energy += frequencyData[i];
            }
            energy /= bufferLength;
            
            // Lógica simples de detecção de batidas
            // Pode ser expandida com algoritmos mais sofisticados
            
        } catch (error) {
            console.error('Erro na detecção de batidas:', error);
        }
    }

    /**
     * Callback de processamento de áudio
     */
    onAudioProcess(event) {
        // Processamento em tempo real pode ser adicionado aqui
        // para efeitos ou análise adicional
    }

    /**
     * Define callbacks
     */
    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    /**
     * Dispara callback de frequência
     */
    triggerFrequency(frequency, note, cents) {
        if (this.callbacks.onFrequency) {
            this.callbacks.onFrequency(frequency, note, cents);
        }
    }

    /**
     * Dispara callback de precisão
     */
    triggerAccuracy(isTuned, confidence, volume) {
        if (this.callbacks.onAccuracy) {
            this.callbacks.onAccuracy(isTuned, confidence, volume);
        }
    }

    /**
     * Dispara callback de erro
     */
    triggerError(error) {
        if (this.callbacks.onError) {
            this.callbacks.onError(error);
        }
    }

    /**
     * Atualiza configurações
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        if (this.analyser) {
            this.analyser.fftSize = this.config.fftSize;
        }
    }

    /**
     * Obtém status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            lastFrequency: this.lastFrequency,
            lastNote: this.lastNote,
            lastCents: this.lastCents,
            config: this.config
        };
    }

    /**
     * Calibra sensibilidade
     */
    calibrateSensitivity() {
        if (!this.isRunning) return;
        
        // Implementa lógica de calibração automática
        // Baseada no ruído de fundo atual
    }

    /**
     * Gera tom de referência
     */
    playReferenceTone(frequency, duration = 1) {
        try {
            Utils.playTone(frequency, duration, 'sine');
        } catch (error) {
            console.error('Erro ao gerar tom de referência:', error);
        }
    }

    /**
     * Limpa recursos
     */
    cleanup() {
        this.stop();
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}

// Export singleton instance
window.Tuner = new Tuner();