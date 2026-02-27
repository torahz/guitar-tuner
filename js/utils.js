/**
 * Utilidades Gerais
 */

// Constantes de Notas Musicais
const NOTES = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5,
    'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
};

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Configurações Globais
const CONFIG = {
    SAMPLE_RATE: 44100,
    FFT_SIZE: 2048,
    MIN_FREQUENCY: 20,
    MAX_FREQUENCY: 2000,
    SENSITIVITY_THRESHOLD: 0.1,
    A440: 440,
    OCTAVE_BASE: 4
};

/**
 * Converte frequência para número MIDI
 * @param {number} frequency - Frequência em Hz
 * @returns {number} Número MIDI
 */
function frequencyToMidi(frequency) {
    return 69 + 12 * Math.log2(frequency / 440);
}

/**
 * Converte número MIDI para frequência
 * @param {number} midi - Número MIDI
 * @returns {number} Frequência em Hz
 */
function midiToFrequency(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Converte frequência para nome da nota
 * @param {number} frequency - Frequência em Hz
 * @param {number} a440 - Frequência de referência A440
 * @returns {Object} Objeto com nome, oitava e cents
 */
function frequencyToNote(frequency, a440 = CONFIG.A440) {
    if (frequency <= 0) return { name: '-', octave: '-', cents: 0 };
    
    const midi = frequencyToMidi(frequency);
    const noteIndex = Math.round(midi) % 12;
    const octave = Math.floor(midi / 12) - 1;
    const cents = Math.round((midi - Math.round(midi)) * 100);
    
    return {
        name: NOTE_NAMES[noteIndex],
        octave: octave,
        cents: cents,
        midi: Math.round(midi)
    };
}

/**
 * Calcula diferença em cents entre duas frequências
 * @param {number} freq1 - Primeira frequência
 * @param {number} freq2 - Segunda frequência
 * @returns {number} Diferença em cents
 */
function calculateCents(freq1, freq2) {
    return 1200 * Math.log2(freq1 / freq2);
}

/**
 * Formata frequência para exibição
 * @param {number} frequency - Frequência em Hz
 * @returns {string} Frequência formatada
 */
function formatFrequency(frequency) {
    if (frequency <= 0) return '0.00';
    return frequency.toFixed(2);
}

/**
 * Formata cents para exibição
 * @param {number} cents - Valor em cents
 * @returns {string} Cents formatados
 */
function formatCents(cents) {
    if (Math.abs(cents) < 1) return '0';
    return cents > 0 ? `+${cents}` : `${cents}`;
}

/**
 * Gera array de frequências para afinador cromático
 * @param {number} minFreq - Frequência mínima
 * @param {number} maxFreq - Frequência máxima
 * @returns {Array} Array de objetos com frequência e nome
 */
function generateChromaticFrequencies(minFreq = 27.5, maxFreq = 4186.01) {
    const frequencies = [];
    let midi = frequencyToMidi(minFreq);
    
    while (true) {
        const freq = midiToFrequency(midi);
        if (freq > maxFreq) break;
        
        const note = frequencyToNote(freq);
        frequencies.push({
            frequency: freq,
            name: note.name,
            octave: note.octave,
            midi: Math.round(midi),
            displayName: `${note.name}${note.octave}`
        });
        
        midi++;
    }
    
    return frequencies;
}

/**
 * Debounce function
 * @param {Function} func - Função a ser debounced
 * @param {number} wait - Tempo de espera em ms
 * @param {boolean} immediate - Executar imediatamente
 * @returns {Function} Função debounced
 */
function debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(this, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(this, args);
    };
}

/**
 * Throttle function
 * @param {Function} func - Função a ser throttled
 * @param {number} limit - Limite de tempo em ms
 * @returns {Function} Função throttled
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Deep clone object
 * @param {Object} obj - Objeto a ser clonado
 * @returns {Object} Clone do objeto
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

/**
 * Merge objects deeply
 * @param {Object} target - Objeto alvo
 * @param {Object} source - Objeto fonte
 * @returns {Object} Objeto mesclado
 */
function deepMerge(target, source) {
    const result = deepClone(target);
    
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                result[key] = deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
    }
    
    return result;
}

/**
 * Gera ID único
 * @returns {string} ID único
 */
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

/**
 * Formata data para exibição
 * @param {Date} date - Data
 * @returns {string} Data formatada
 */
function formatDate(date) {
    const options = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Intl.DateTimeFormat('pt-BR', options).format(date);
}

/**
 * Verifica se é mobile
 * @returns {boolean} True se for mobile
 */
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Verifica suporte a Web Audio API
 * @returns {boolean} True se suportar
 */
function supportsWebAudio() {
    return !!(window.AudioContext || window.webkitAudioContext);
}

/**
 * Verifica suporte a getUserMedia
 * @returns {boolean} True se suportar
 */
function supportsGetUserMedia() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

/**
 * Verifica se o dispositivo tem bateria
 * @returns {Promise<boolean>} True se tiver bateria
 */
async function hasBattery() {
    if ('getBattery' in navigator) {
        try {
            const battery = await navigator.getBattery();
            return battery !== null;
        } catch (error) {
            return false;
        }
    }
    return false;
}

/**
 * Obtém nível de bateria
 * @returns {Promise<number|null>} Nível de bateria (0-100) ou null
 */
async function getBatteryLevel() {
    if ('getBattery' in navigator) {
        try {
            const battery = await navigator.getBattery();
            return Math.round(battery.level * 100);
        } catch (error) {
            return null;
        }
    }
    return null;
}

/**
 * Verifica conectividade
 * @returns {boolean} True se estiver online
 */
function isOnline() {
    return navigator.onLine;
}

/**
 * Formata tamanho de arquivo
 * @param {number} bytes - Tamanho em bytes
 * @returns {string} Tamanho formatado
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Valida email
 * @param {string} email - Email a ser validado
 * @returns {boolean} True se for válido
 */
function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

/**
 * Copia texto para clipboard
 * @param {string} text - Texto a ser copiado
 * @returns {Promise<boolean>} True se copiar com sucesso
 */
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback para navegadores antigos
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            const success = document.execCommand('copy');
            textArea.remove();
            return success;
        }
    } catch (error) {
        console.error('Erro ao copiar para clipboard:', error);
        return false;
    }
}

/**
 * Detecta tema do sistema
 * @returns {string} 'light' ou 'dark'
 */
function getSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
}

/**
 * Verifica suporte a PWA
 * @returns {boolean} True se suportar PWA
 */
function supportsPWA() {
    return 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Verifica se está instalado como PWA
 * @returns {boolean} True se estiver instalado
 */
function isInstalledPWA() {
    return window.matchMedia('(display-mode: standalone)').matches;
}

/**
 * Gera som de referência
 * @param {number} frequency - Frequência em Hz
 * @param {number} duration - Duração em segundos
 * @param {string} type - Tipo de onda (sine, square, sawtooth, triangle)
 */
function playTone(frequency, duration = 1, type = 'sine') {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioContext();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
        
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + duration);
    } catch (error) {
        console.error('Erro ao gerar tom:', error);
    }
}

/**
 * Converte HSL para RGB
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {Object} Objeto com r, g, b
 */
function hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

/**
 * Converte RGB para HSL
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {Object} Objeto com h, s, l
 */
function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

/**
 * Calcula distância entre duas cores em HSL
 * @param {Object} color1 - Primeira cor {h, s, l}
 * @param {Object} color2 - Segunda cor {h, s, l}
 * @returns {number} Distância
 */
function colorDistance(color1, color2) {
    const dh = Math.min(Math.abs(color1.h - color2.h), 360 - Math.abs(color1.h - color2.h));
    const ds = Math.abs(color1.s - color2.s);
    const dl = Math.abs(color1.l - color2.l);
    return Math.sqrt(dh * dh + ds * ds + dl * dl);
}

/**
 * Gera cores harmoniosas
 * @param {string} baseColor - Cor base em hex
 * @param {number} count - Quantidade de cores
 * @returns {Array} Array de cores hex
 */
function generateHarmonyColors(baseColor, count = 5) {
    const baseHsl = rgbToHsl(
        parseInt(baseColor.slice(1, 3), 16),
        parseInt(baseColor.slice(3, 5), 16),
        parseInt(baseColor.slice(5, 7), 16)
    );
    
    const colors = [];
    const step = 360 / count;
    
    for (let i = 0; i < count; i++) {
        const h = (baseHsl.h + (i * step)) % 360;
        const rgb = hslToRgb(h, baseHsl.s, baseHsl.l);
        const hex = `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`;
        colors.push(hex);
    }
    
    return colors;
}

// Export functions
window.Utils = {
    frequencyToMidi,
    midiToFrequency,
    frequencyToNote,
    calculateCents,
    formatFrequency,
    formatCents,
    generateChromaticFrequencies,
    debounce,
    throttle,
    deepClone,
    deepMerge,
    generateId,
    formatDate,
    isMobile,
    supportsWebAudio,
    supportsGetUserMedia,
    hasBattery,
    getBatteryLevel,
    isOnline,
    formatFileSize,
    isValidEmail,
    copyToClipboard,
    getSystemTheme,
    supportsPWA,
    isInstalledPWA,
    playTone,
    hslToRgb,
    rgbToHsl,
    colorDistance,
    generateHarmonyColors,
    NOTES,
    NOTE_NAMES,
    CONFIG
};