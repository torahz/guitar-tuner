/**
 * Script de Teste e Validação para Afinador Pro
 * 
 * Este script realiza testes abrangentes do afinador:
 * - Testes de detecção de pitch
 * - Validação da interface do usuário
 * - Testes de armazenamento local
 * - Compatibilidade do navegador
 * - Testes PWA
 * - Validação de performance
 */

// Testes de compatibilidade do navegador
function testBrowserCompatibility() {
    console.log('🔍 Testando compatibilidade do navegador...');
    
    const tests = {
        webAudio: {
            name: 'Web Audio API',
            test: () => typeof window.AudioContext !== 'undefined' || typeof window.webkitAudioContext !== 'undefined',
            required: true
        },
        getUserMedia: {
            name: 'Microfone (getUserMedia)',
            test: () => typeof navigator.mediaDevices !== 'undefined' && typeof navigator.mediaDevices.getUserMedia !== 'undefined',
            required: true
        },
        localStorage: {
            name: 'Armazenamento Local',
            test: () => {
                try {
                    const test = '__test__';
                    localStorage.setItem(test, test);
                    localStorage.removeItem(test);
                    return true;
                } catch (e) {
                    return false;
                }
            },
            required: true
        },
        promises: {
            name: 'Promises',
            test: () => typeof Promise !== 'undefined',
            required: true
        },
        fetch: {
            name: 'Fetch API',
            test: () => typeof fetch !== 'undefined',
            required: false
        },
        serviceWorker: {
            name: 'Service Worker',
            test: () => 'serviceWorker' in navigator,
            required: false
        },
        battery: {
            name: 'API de Bateria',
            test: () => 'getBattery' in navigator,
            required: false
        },
        vibration: {
            name: 'API de Vibração',
            test: () => 'vibrate' in navigator,
            required: false
        },
        fullscreen: {
            name: 'API de Tela Cheia',
            test: () => 'requestFullscreen' in document.documentElement,
            required: false
        }
    };
    
    const results = {};
    
    Object.keys(tests).forEach(key => {
        const test = tests[key];
        const passed = test.test();
        results[key] = {
            name: test.name,
            passed: passed,
            required: test.required,
            status: passed ? '✓' : (test.required ? '❌' : '⚠')
        };
        
        console.log(`  ${results[key].status} ${test.name}: ${passed ? 'Suportado' : 'Não suportado'}`);
    });
    
    const requiredPassed = Object.values(results).filter(r => r.required && !r.passed).length === 0;
    const optionalPassed = Object.values(results).filter(r => !r.required && !r.passed).length === 0;
    
    console.log(`\n  Resultado: ${requiredPassed ? '✓' : '❌'} Requisitos obrigatórios ${requiredPassed ? 'passaram' : 'falharam'}`);
    if (!optionalPassed) {
        console.log(`  ⚠ Alguns recursos opcionais não são suportados`);
    }
    
    return {
        results,
        requiredPassed,
        optionalPassed,
        allPassed: requiredPassed && optionalPassed
    };
}

// Testes de armazenamento local
function testLocalStorage() {
    console.log('\n💾 Testando armazenamento local...');
    
    const testData = {
        test: 'storage-test',
        timestamp: Date.now(),
        settings: {
            theme: 'dark',
            sensitivity: 0.5,
            a440: 440
        }
    };
    
    try {
        // Testa escrita
        localStorage.setItem('afinador-test', JSON.stringify(testData));
        
        // Testa leitura
        const retrieved = JSON.parse(localStorage.getItem('afinador-test'));
        
        // Testa validade
        const valid = retrieved.test === testData.test && 
                     retrieved.timestamp === testData.timestamp &&
                     JSON.stringify(retrieved.settings) === JSON.stringify(testData.settings);
        
        // Limpa teste
        localStorage.removeItem('afinador-test');
        
        console.log(`  ${valid ? '✓' : '❌'} Armazenamento local: ${valid ? 'Funcionando' : 'Falhou'}`);
        
        return valid;
        
    } catch (error) {
        console.log(`  ❌ Armazenamento local: Erro - ${error.message}`);
        return false;
    }
}

// Testes de Web Audio API
function testWebAudio() {
    console.log('\n🎵 Testando Web Audio API...');
    
    try {
        // Cria contexto de áudio
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContext();
        
        // Cria analisador
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        
        // Cria buffer de teste
        const bufferLength = analyser.fftSize;
        const timeDomainBuffer = new Float32Array(bufferLength);
        const frequencyBuffer = new Uint8Array(analyser.frequencyBinCount);
        
        // Testa métodos
        const hasTimeDomain = typeof analyser.getFloatTimeDomainData === 'function';
        const hasFrequencyData = typeof analyser.getByteFrequencyData === 'function';
        const hasByteTimeDomain = typeof analyser.getByteTimeDomainData === 'function';
        
        // Fecha contexto
        audioContext.close();
        
        const valid = hasTimeDomain && hasFrequencyData && hasByteTimeDomain;
        
        console.log(`  ${valid ? '✓' : '❌'} Web Audio API: ${valid ? 'Funcionando' : 'Falhou'}`);
        console.log(`    - Float Time Domain: ${hasTimeDomain ? '✓' : '❌'}`);
        console.log(`    - Byte Frequency Data: ${hasFrequencyData ? '✓' : '❌'}`);
        console.log(`    - Byte Time Domain: ${hasByteTimeDomain ? '✓' : '❌'}`);
        
        return valid;
        
    } catch (error) {
        console.log(`  ❌ Web Audio API: Erro - ${error.message}`);
        return false;
    }
}

// Testes de microfone
async function testMicrophone() {
    console.log('\n🎤 Testando microfone...');
    
    try {
        // Verifica permissões
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
        console.log(`  Permissão de microfone: ${permissionStatus.state}`);
        
        if (permissionStatus.state === 'denied') {
            console.log(`  ⚠ Permissão de microfone negada pelo usuário`);
            return false;
        }
        
        // Testa acesso ao microfone
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        if (stream && stream.getAudioTracks().length > 0) {
            console.log(`  ✓ Microfone: Acessível`);
            
            // Testa conexão ao Web Audio
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            
            source.connect(analyser);
            
            // Testa captura de dados
            const buffer = new Float32Array(analyser.fftSize);
            analyser.getFloatTimeDomainData(buffer);
            
            // Fecha recursos
            stream.getTracks().forEach(track => track.stop());
            audioContext.close();
            
            console.log(`  ✓ Conexão Web Audio: Funcionando`);
            return true;
            
        } else {
            console.log(`  ❌ Microfone: Não detectado`);
            return false;
        }
        
    } catch (error) {
        console.log(`  ❌ Microfone: Erro - ${error.message}`);
        return false;
    }
}

// Testes de interface do usuário
function testUI() {
    console.log('\n🎨 Testando interface do usuário...');
    
    const elements = {
        tunerDisplay: document.getElementById('tuner-display'),
        needle: document.getElementById('needle'),
        gaugeProgress: document.querySelector('.gauge-progress'),
        noteName: document.getElementById('note-name'),
        frequencyValue: document.getElementById('frequency-value'),
        startBtn: document.getElementById('start-btn'),
        stopBtn: document.getElementById('stop-btn'),
        settingsPanel: document.getElementById('settings-panel')
    };
    
    const results = {};
    let allFound = true;
    
    Object.keys(elements).forEach(key => {
        const element = elements[key];
        const found = element !== null;
        results[key] = found;
        
        if (!found) {
            allFound = false;
            console.log(`  ❌ Elemento ${key}: Não encontrado`);
        } else {
            console.log(`  ✓ Elemento ${key}: Encontrado`);
        }
    });
    
    // Testa estilos computados
    if (elements.tunerDisplay) {
        const styles = window.getComputedStyle(elements.tunerDisplay);
        const hasBackground = styles.backgroundColor !== 'rgba(0, 0, 0, 0)';
        console.log(`  ${hasBackground ? '✓' : '⚠'} Estilos CSS: ${hasBackground ? 'Aplicados' : 'Possivelmente não carregados'}`);
    }
    
    console.log(`  ${allFound ? '✓' : '❌'} UI: ${allFound ? 'Completa' : 'Incompleta'}`);
    
    return allFound;
}

// Testes de performance
function testPerformance() {
    console.log('\n⚡ Testando performance...');
    
    const metrics = {
        navigation: performance.getEntriesByType('navigation'),
        resource: performance.getEntriesByType('resource'),
        memory: performance.memory || null,
        timing: performance.timing || null
    };
    
    // Testa tempo de carregamento
    const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
    const loadTimeOK = loadTime < 3000; // 3 segundos
    
    console.log(`  Tempo de carregamento: ${loadTime}ms (${loadTimeOK ? '✓' : '⚠'})`);
    
    // Testa quantidade de recursos
    const resourceCount = metrics.resource.length;
    const resourceCountOK = resourceCount < 20; // Menos de 20 recursos
    
    console.log(`  Recursos carregados: ${resourceCount} (${resourceCountOK ? '✓' : '⚠'})`);
    
    // Testa tamanho do DOM
    const domSize = document.querySelectorAll('*').length;
    const domSizeOK = domSize < 1000; // Menos de 1000 elementos
    
    console.log(`  Tamanho do DOM: ${domSize} elementos (${domSizeOK ? '✓' : '⚠'})`);
    
    // Testa memory (se disponível)
    if (metrics.memory) {
        const memoryUsage = metrics.memory.usedJSHeapSize / 1024 / 1024; // MB
        console.log(`  Uso de memória: ${memoryUsage.toFixed(2)} MB`);
    }
    
    const performanceOK = loadTimeOK && resourceCountOK && domSizeOK;
    console.log(`  ${performanceOK ? '✓' : '⚠'} Performance: ${performanceOK ? 'Boa' : 'Pode ser melhorada'}`);
    
    return performanceOK;
}

// Testes PWA
async function testPWA() {
    console.log('\n📱 Testando PWA...');
    
    const results = {};
    
    // Testa manifest
    try {
        const manifestLink = document.querySelector('link[rel="manifest"]');
        const manifestURL = manifestLink ? manifestLink.href : '/manifest.json';
        
        const response = await fetch(manifestURL);
        const manifest = await response.json();
        
        results.manifest = {
            valid: !!manifest.name && !!manifest.short_name && !!manifest.icons,
            manifest: manifest
        };
        
        console.log(`  ${results.manifest.valid ? '✓' : '❌'} Manifest: ${results.manifest.valid ? 'Válido' : 'Inválido'}`);
        
    } catch (error) {
        results.manifest = { valid: false, error: error.message };
        console.log(`  ❌ Manifest: Erro - ${error.message}`);
    }
    
    // Testa service worker
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.ready;
            results.serviceWorker = {
                registered: !!registration,
                scope: registration.scope
            };
            
            console.log(`  ${results.serviceWorker.registered ? '✓' : '❌'} Service Worker: ${results.serviceWorker.registered ? 'Registrado' : 'Não registrado'}`);
            
        } catch (error) {
            results.serviceWorker = { registered: false, error: error.message };
            console.log(`  ❌ Service Worker: Erro - ${error.message}`);
        }
    } else {
        results.serviceWorker = { registered: false, error: 'Não suportado' };
        console.log(`  ❌ Service Worker: Não suportado`);
    }
    
    // Testa instalabilidade
    let installable = false;
    if ('getInstalledRelatedApps' in navigator) {
        try {
            const relatedApps = await navigator.getInstalledRelatedApps();
            installable = relatedApps.length > 0;
        } catch (error) {
            // Ignora erro
        }
    }
    
    results.installable = installable;
    console.log(`  ${installable ? '✓' : '⚠'} Instalável: ${installable ? 'Sim' : 'Possivelmente'}`);
    
    const pwaOK = results.manifest.valid && results.serviceWorker.registered;
    console.log(`  ${pwaOK ? '✓' : '⚠'} PWA: ${pwaOK ? 'Completo' : 'Parcial'}`);
    
    return results;
}

// Testes de detecção de pitch (simulação)
function testPitchDetection() {
    console.log('\n🎵 Testando detecção de pitch (simulação)...');
    
    // Testa funções de utilitários
    const utilsTests = {
        midiToFrequency: typeof Utils !== 'undefined' && typeof Utils.midiToFrequency === 'function',
        frequencyToNote: typeof Utils !== 'undefined' && typeof Utils.frequencyToNote === 'function',
        noteToMidi: typeof Utils !== 'undefined' && typeof Utils.noteToMidi === 'function',
        centsToFrequency: typeof Utils !== 'undefined' && typeof Utils.centsToFrequency === 'function'
    };
    
    console.log('  Funções de utilitários:');
    Object.keys(utilsTests).forEach(key => {
        console.log(`    ${utilsTests[key] ? '✓' : '❌'} ${key}: ${utilsTests[key] ? 'Disponível' : 'Indisponível'}`);
    });
    
    // Testa cálculos básicos
    if (utilsTests.midiToFrequency && utilsTests.frequencyToNote) {
        try {
            const midi = 69; // A4
            const frequency = Utils.midiToFrequency(midi);
            const note = Utils.frequencyToNote(frequency);
            
            const roundTrip = Math.abs(note.midi - midi) < 0.1;
            console.log(`    ${roundTrip ? '✓' : '❌'} Conversão MIDI-Frequência: ${roundTrip ? 'Precisa' : 'Imprecisa'}`);
            
        } catch (error) {
            console.log(`    ❌ Conversão MIDI-Frequência: Erro - ${error.message}`);
        }
    }
    
    const utilsOK = Object.values(utilsTests).every(test => test);
    console.log(`  ${utilsOK ? '✓' : '❌'} Utils: ${utilsOK ? 'Completo' : 'Incompleto'}`);
    
    return utilsOK;
}

// Teste geral
async function runAllTests() {
    console.log('🧪 Iniciando testes do Afinador Pro\n');
    console.log('='.repeat(50));
    
    const results = {
        browserCompatibility: testBrowserCompatibility(),
        localStorage: testLocalStorage(),
        webAudio: testWebAudio(),
        microphone: await testMicrophone(),
        ui: testUI(),
        performance: testPerformance(),
        pwa: await testPWA(),
        pitchDetection: testPitchDetection()
    };
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 Resultado dos Testes');
    console.log('='.repeat(50));
    
    // Calcula pontuação geral
    let score = 0;
    let maxScore = 0;
    
    // Compatibilidade (peso 3)
    if (results.browserCompatibility.requiredPassed) score += 3;
    maxScore += 3;
    
    // Armazenamento (peso 2)
    if (results.localStorage) score += 2;
    maxScore += 2;
    
    // Web Audio (peso 3)
    if (results.webAudio) score += 3;
    maxScore += 3;
    
    // Microfone (peso 3)
    if (results.microphone) score += 3;
    maxScore += 3;
    
    // UI (peso 2)
    if (results.ui) score += 2;
    maxScore += 2;
    
    // Performance (peso 2)
    if (results.performance) score += 2;
    maxScore += 2;
    
    // PWA (peso 2)
    if (results.pwa.manifest.valid && results.pwa.serviceWorker.registered) score += 2;
    maxScore += 2;
    
    // Pitch Detection (peso 2)
    if (results.pitchDetection) score += 2;
    maxScore += 2;
    
    const percentage = Math.round((score / maxScore) * 100);
    
    console.log(`\n🎯 Pontuação: ${score}/${maxScore} (${percentage}%)`);
    
    if (percentage >= 90) {
        console.log('🎉 Excelente! O afinador está pronto para uso.');
    } else if (percentage >= 75) {
        console.log('👍 Bom! Alguns ajustes podem melhorar a experiência.');
    } else if (percentage >= 50) {
        console.log('⚠️ Regular. Recomenda-se correções antes do uso.');
    } else {
        console.log('❌ Crítico. Muitos problemas precisam ser resolvidos.');
    }
    
    // Recomendações
    console.log('\n💡 Recomendações:');
    
    if (!results.browserCompatibility.requiredPassed) {
        console.log('  - Atualize seu navegador para uma versão mais recente');
    }
    
    if (!results.localStorage) {
        console.log('  - Verifique as configurações de privacidade do navegador');
    }
    
    if (!results.microphone) {
        console.log('  - Conceda permissão ao microfone no navegador');
        console.log('  - Verifique se o microfone está conectado e funcionando');
    }
    
    if (!results.ui) {
        console.log('  - Verifique se os arquivos CSS e HTML estão corretos');
    }
    
    if (!results.performance) {
        console.log('  - Considere otimizar imagens e recursos');
        console.log('  - Use cache e minificação para melhorar performance');
    }
    
    if (!results.pwa.manifest.valid) {
        console.log('  - Verifique o arquivo manifest.json');
    }
    
    if (!results.pwa.serviceWorker.registered) {
        console.log('  - Verifique o arquivo service-worker.js');
        console.log('  - Certifique-se de usar HTTPS para PWA');
    }
    
    return results;
}

// Executa testes se chamado diretamente
if (typeof window !== 'undefined') {
    // Executa quando carregado no navegador
    window.addEventListener('load', () => {
        runAllTests().then(results => {
            // Exibe resultados no console
            console.log('\n📋 Detalhes dos Testes:', results);
            
            // Cria relatório visual
            createTestReport(results);
        });
    });
} else {
    // Executa quando chamado via Node.js (para testes de servidor)
    console.log('⚠️ Este script deve ser executado no navegador');
}

// Cria relatório visual (se no navegador)
function createTestReport(results) {
    if (typeof document === 'undefined') return;
    
    // Cria container para o relatório
    const reportContainer = document.createElement('div');
    reportContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 300px;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 20px;
        border-radius: 8px;
        font-family: Arial, sans-serif;
        z-index: 1000;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    `;
    
    // Cria conteúdo do relatório
    let html = '<h3 style="margin-top: 0; color: #4ade80;">Testes do Afinador Pro</h3>';
    
    // Pontuação
    const score = calculateScore(results);
    html += `<p><strong>Pontuação:</strong> ${score.score}/${score.max} (${score.percentage}%)</p>`;
    
    // Resultados detalhados
    html += '<div style="margin-top: 15px;">';
    html += createResultItem('Compatibilidade', results.browserCompatibility.requiredPassed);
    html += createResultItem('Armazenamento', results.localStorage);
    html += createResultItem('Web Audio', results.webAudio);
    html += createResultItem('Microfone', results.microphone);
    html += createResultItem('Interface', results.ui);
    html += createResultItem('Performance', results.performance);
    html += createResultItem('PWA', results.pwa.manifest.valid && results.pwa.serviceWorker.registered);
    html += createResultItem('Pitch Detection', results.pitchDetection);
    html += '</div>';
    
    // Botões de ação
    html += '<div style="margin-top: 15px; display: flex; gap: 10px;">';
    html += '<button onclick="this.closest(\'.test-report\').remove()" style="flex: 1; padding: 8px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">Fechar</button>';
    html += '<button onclick="location.reload()" style="flex: 1; padding: 8px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">Recarregar</button>';
    html += '</div>';
    
    reportContainer.innerHTML = html;
    reportContainer.className = 'test-report';
    
    document.body.appendChild(reportContainer);
}

function createResultItem(name, passed) {
    return `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #333;">
            <span>${name}</span>
            <span style="color: ${passed ? '#4ade80' : '#f87171'}; font-weight: bold;">
                ${passed ? '✓' : '✗'}
            </span>
        </div>
    `;
}

function calculateScore(results) {
    let score = 0;
    let maxScore = 0;
    
    if (results.browserCompatibility.requiredPassed) score += 3; maxScore += 3;
    if (results.localStorage) score += 2; maxScore += 2;
    if (results.webAudio) score += 3; maxScore += 3;
    if (results.microphone) score += 3; maxScore += 3;
    if (results.ui) score += 2; maxScore += 2;
    if (results.performance) score += 2; maxScore += 2;
    if (results.pwa.manifest.valid && results.pwa.serviceWorker.registered) score += 2; maxScore += 2;
    if (results.pitchDetection) score += 2; maxScore += 2;
    
    return {
        score,
        max: maxScore,
        percentage: Math.round((score / maxScore) * 100)
    };
}

module.exports = { runAllTests, testBrowserCompatibility, testLocalStorage, testWebAudio, testMicrophone, testUI, testPerformance, testPWA, testPitchDetection };