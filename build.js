/**
 * Script de Build e Otimização para Afinador Pro
 * 
 * Este script realiza a otimização de performance do aplicativo:
 * - Minificação de CSS e JS
 * - Otimização de imagens
 * - Geração de sourcemaps
 * - Análise de performance
 * - Geração de relatórios
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

// Configurações de build
const config = {
    inputDir: '.',
    outputDir: 'dist',
    assetsDir: 'assets',
    cssDir: 'css',
    jsDir: 'js',
    iconsDir: 'assets/icons',
    
    // Otimizações
    minify: true,
    generateSourceMaps: true,
    optimizeImages: true,
    analyzeBundle: true,
    
    // Cache
    cacheBusting: true,
    cacheTime: '1y'
};

// Métricas de performance
const performanceMetrics = {
    firstContentfulPaint: 1000, // ms
    largestContentfulPaint: 2500, // ms
    cumulativeLayoutShift: 0.1,
    firstInputDelay: 100, // ms
    totalBlockingTime: 300 // ms
};

// Função principal de build
async function build() {
    console.log('🚀 Iniciando build do Afinador Pro\n');
    
    try {
        // 1. Limpeza do diretório de build
        await cleanBuildDir();
        
        // 2. Criação de estrutura de diretórios
        await createBuildStructure();
        
        // 3. Copiar arquivos estáticos
        await copyStaticFiles();
        
        // 4. Otimizar CSS
        await optimizeCSS();
        
        // 5. Otimizar JavaScript
        await optimizeJS();
        
        // 6. Otimizar imagens
        if (config.optimizeImages) {
            await optimizeImages();
        }
        
        // 7. Gerar HTML otimizado
        await generateOptimizedHTML();
        
        // 8. Atualizar manifest.json
        await updateManifest();
        
        // 9. Gerar service worker otimizado
        await generateServiceWorker();
        
        // 10. Análise de performance
        if (config.analyzeBundle) {
            await analyzeBundle();
        }
        
        // 11. Gerar relatório
        await generateReport();
        
        console.log('\n✅ Build concluído com sucesso!');
        console.log(`📁 Arquivos gerados em: ${config.outputDir}/`);
        
    } catch (error) {
        console.error('❌ Erro durante o build:', error.message);
        process.exit(1);
    }
}

// Limpa diretório de build
async function cleanBuildDir() {
    console.log('🧹 Limpando diretório de build...');
    
    if (fs.existsSync(config.outputDir)) {
        fs.rmSync(config.outputDir, { recursive: true, force: true });
    }
    
    console.log('✓ Diretório limpo');
}

// Cria estrutura de diretórios
async function createBuildStructure() {
    console.log('📁 Criando estrutura de diretórios...');
    
    const dirs = [
        config.outputDir,
        path.join(config.outputDir, config.cssDir),
        path.join(config.outputDir, config.jsDir),
        path.join(config.outputDir, config.assetsDir),
        path.join(config.outputDir, config.iconsDir)
    ];
    
    dirs.forEach(dir => {
        fs.mkdirSync(dir, { recursive: true });
    });
    
    console.log('✓ Estrutura criada');
}

// Copia arquivos estáticos
async function copyStaticFiles() {
    console.log('📋 Copiando arquivos estáticos...');
    
    const files = [
        'manifest.json',
        'service-worker.js',
        'README.md'
    ];
    
    files.forEach(file => {
        if (fs.existsSync(file)) {
            fs.copyFileSync(file, path.join(config.outputDir, file));
            console.log(`  ✓ ${file}`);
        }
    });
    
    // Copia ícones
    if (fs.existsSync(config.iconsDir)) {
        const icons = fs.readdirSync(config.iconsDir);
        icons.forEach(icon => {
            fs.copyFileSync(
                path.join(config.iconsDir, icon),
                path.join(config.outputDir, config.iconsDir, icon)
            );
        });
        console.log(`  ✓ ${icons.length} ícones`);
    }
    
    console.log('✓ Arquivos estáticos copiados');
}

// Otimiza CSS
async function optimizeCSS() {
    console.log('🎨 Otimizando CSS...');
    
    const cssFiles = [
        'styles.css',
        'themes.css', 
        'animations.css'
    ];
    
    let combinedCSS = '';
    const sourceMap = {};
    
    for (const file of cssFiles) {
        const filePath = path.join(config.cssDir, file);
        if (fs.existsSync(filePath)) {
            let css = fs.readFileSync(filePath, 'utf8');
            
            // Adiciona source map reference
            if (config.generateSourceMaps) {
                css += `\n/*# sourceMappingURL=${file}.map */`;
            }
            
            // Minifica se necessário
            if (config.minify) {
                css = minifyCSS(css);
            }
            
            combinedCSS += css + '\n\n';
            sourceMap[file] = css;
            
            console.log(`  ✓ ${file} ${config.minify ? '(minificado)' : ''}`);
        }
    }
    
    // Salva CSS combinado
    const outputCSS = config.minify ? 'styles.min.css' : 'styles.css';
    fs.writeFileSync(path.join(config.outputDir, config.cssDir, outputCSS), combinedCSS);
    
    // Gera source map
    if (config.generateSourceMaps) {
        const sourceMapContent = JSON.stringify({
            version: 3,
            sources: cssFiles,
            names: [],
            mappings: '',
            sourcesContent: Object.values(sourceMap)
        });
        
        fs.writeFileSync(
            path.join(config.outputDir, config.cssDir, 'styles.map'), 
            sourceMapContent
        );
    }
    
    console.log('✓ CSS otimizado');
}

// Otimiza JavaScript
async function optimizeJS() {
    console.log('⚡ Otimizando JavaScript...');
    
    const jsFiles = [
        'utils.js',
        'storage.js',
        'tuner.js',
        'ui.js',
        'app.js'
    ];
    
    let combinedJS = '';
    const sourceMap = {};
    
    // Adiciona banner de copyright
    const banner = `/* Afinador Pro v1.0.0 | MIT License | https://github.com/NamelessReaper/guitar-tuner */\n\n`;
    combinedJS += banner;
    
    for (const file of jsFiles) {
        const filePath = path.join(config.jsDir, file);
        if (fs.existsSync(filePath)) {
            let js = fs.readFileSync(filePath, 'utf8');
            
            // Remove comentários e whitespace se minificado
            if (config.minify) {
                js = minifyJS(js);
            }
            
            combinedJS += js + '\n\n';
            sourceMap[file] = js;
            
            console.log(`  ✓ ${file} ${config.minify ? '(minificado)' : ''}`);
        }
    }
    
    // Salva JS combinado
    const outputJS = config.minify ? 'app.min.js' : 'app.js';
    fs.writeFileSync(path.join(config.outputDir, config.jsDir, outputJS), combinedJS);
    
    // Gera source map
    if (config.generateSourceMaps) {
        const sourceMapContent = JSON.stringify({
            version: 3,
            sources: jsFiles,
            names: [],
            mappings: '',
            sourcesContent: Object.values(sourceMap)
        });
        
        fs.writeFileSync(
            path.join(config.outputDir, config.jsDir, 'app.map'), 
            sourceMapContent
        );
    }
    
    console.log('✓ JavaScript otimizado');
}

// Otimiza imagens
async function optimizeImages() {
    console.log('🖼️ Otimizando imagens...');
    
    const imageFiles = [];
    
    // Procura por imagens nos diretórios
    const searchImages = (dir) => {
        const files = fs.readdirSync(dir);
        
        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                searchImages(filePath);
            } else if (file.match(/\.(png|jpg|jpeg|gif|svg)$/i)) {
                imageFiles.push(filePath);
            }
        });
    };
    
    searchImages('.');
    
    let optimizedCount = 0;
    
    for (const image of imageFiles) {
        try {
            // Usa sharp para otimização (se disponível)
            const sharp = require('sharp');
            const outputDir = path.dirname(image).replace('.', config.outputDir);
            const outputFile = path.join(outputDir, path.basename(image));
            
            // Cria diretório de saída
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            
            await sharp(image)
                .jpeg({ quality: 80, progressive: true })
                .png({ compressionLevel: 9, progressive: true })
                .toFile(outputFile);
            
            optimizedCount++;
            console.log(`  ✓ ${path.basename(image)}`);
            
        } catch (error) {
            // Se sharp não estiver disponível, copia a imagem original
            const outputDir = path.dirname(image).replace('.', config.outputDir);
            const outputFile = path.join(outputDir, path.basename(image));
            
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            
            fs.copyFileSync(image, outputFile);
            console.log(`  ⚠ ${path.basename(image)} (sem otimização)`);
        }
    }
    
    console.log(`✓ ${optimizedCount} imagens otimizadas`);
}

// Gera HTML otimizado
async function generateOptimizedHTML() {
    console.log('🌐 Gerando HTML otimizado...');
    
    // Lê o HTML original
    const originalHTML = fs.readFileSync('index.html', 'utf8');
    
    // Otimiza HTML
    let optimizedHTML = originalHTML;
    
    // Atualiza caminhos para arquivos minificados
    if (config.minify) {
        optimizedHTML = optimizedHTML
            .replace(/css\/styles\.css/g, 'css/styles.min.css')
            .replace(/css\/themes\.css/g, 'css/styles.min.css')
            .replace(/css\/animations\.css/g, 'css/styles.min.css')
            .replace(/js\/utils\.js/g, 'js/app.min.js')
            .replace(/js\/storage\.js/g, 'js/app.min.js')
            .replace(/js\/tuner\.js/g, 'js/app.min.js')
            .replace(/js\/ui\.js/g, 'js/app.min.js')
            .replace(/js\/app\.js/g, 'js/app.min.js');
    }
    
    // Adiciona atributos de performance
    optimizedHTML = optimizedHTML
        .replace('<head>', '<head>\n    <!-- Performance Optimizations -->\n    <meta http-equiv="X-UA-Compatible" content="IE=edge">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">\n    <meta name="theme-color" content="#2563eb">\n    <link rel="preconnect" href="https://fonts.googleapis.com">\n    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n    <link rel="dns-prefetch" href="https://fonts.googleapis.com">\n    <link rel="preload" href="css/styles.min.css" as="style">\n    <link rel="preload" href="js/app.min.js" as="script">\n    <link rel="modulepreload" href="js/app.min.js">\n    <link rel="manifest" href="manifest.json">\n    <meta name="description" content="Afinador cromático profissional com detecção automática de notas, modos de instrumento e calibração avançada">\n    <meta name="keywords" content="afinador, guitarra, baixo, ukulele, violino, cromático, pitch, detection">\n    <meta name="author" content="NamelessReaper">\n    <meta name="robots" content="index, follow">\n    <meta property="og:title" content="Afinador Pro - Cromático Profissional">\n    <meta property="og:description" content="Afinador cromático profissional com detecção automática de notas, modos de instrumento e calibração avançada">\n    <meta property="og:type" content="website">\n    <meta property="og:url" content="https://your-domain.com">\n    <meta property="og:image" content="assets/icons/icon-512x512.png">\n    <meta name="twitter:card" content="summary_large_image">\n    <meta name="twitter:title" content="Afinador Pro - Cromático Profissional">\n    <meta name="twitter:description" content="Afinador cromático profissional com detecção automática de notas, modos de instrumento e calibração avançada">\n    <meta name="twitter:image" content="assets/icons/icon-512x512.png">');
    
    // Remove comentários HTML
    optimizedHTML = optimizedHTML.replace(/<!--[\s\S]*?-->/g, '');
    
    // Minifica HTML se necessário
    if (config.minify) {
        optimizedHTML = minifyHTML(optimizedHTML);
    }
    
    // Salva HTML otimizado
    fs.writeFileSync(path.join(config.outputDir, 'index.html'), optimizedHTML);
    
    console.log('✓ HTML otimizado gerado');
}

// Atualiza manifest.json
async function updateManifest() {
    console.log('📱 Atualizando manifest.json...');
    
    const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
    
    // Atualiza caminhos para ícones
    manifest.icons = manifest.icons.map(icon => ({
        ...icon,
        src: icon.src.replace('assets/icons/', 'assets/icons/')
    }));
    
    // Atualiza screenshots
    if (manifest.screenshots) {
        manifest.screenshots = manifest.screenshots.map(screenshot => ({
            ...screenshot,
            src: screenshot.src.replace('assets/icons/', 'assets/icons/')
        }));
    }
    
    fs.writeFileSync(
        path.join(config.outputDir, 'manifest.json'), 
        JSON.stringify(manifest, null, 2)
    );
    
    console.log('✓ manifest.json atualizado');
}

// Gera service worker otimizado
async function generateServiceWorker() {
    console.log('🔄 Gerando service worker otimizado...');
    
    const swContent = `// Service Worker Otimizado para Afinador Pro
const CACHE_NAME = 'afinador-pro-v1.0.0-build';
const STATIC_CACHE = 'static-v1-build';
const DYNAMIC_CACHE = 'dynamic-v1-build';

// Arquivos estáticos para cache offline
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/styles.min.css',
    '/js/app.min.js',
    '/manifest.json',
    ${fs.existsSync(config.iconsDir) ? fs.readdirSync(config.iconsDir).map(icon => `    '/assets/icons/${icon}',`).join('\n') : ''}
];

// Estratégia de cache: Cache First com fallback para rede
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    
    if (request.method !== 'GET') return;
    
    if (isStaticAsset(request)) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                return cachedResponse || fetch(request).then((networkResponse) => {
                    if (!networkResponse || networkResponse.status !== 200) {
                        return networkResponse;
                    }
                    const responseClone = networkResponse.clone();
                    caches.open(STATIC_CACHE).then((cache) => cache.put(request, responseClone));
                    return networkResponse;
                });
            })
        );
    } else {
        event.respondWith(
            fetch(request).then((networkResponse) => {
                const responseClone = networkResponse.clone();
                caches.open(DYNAMIC_CACHE).then((cache) => {
                    cache.put(request, responseClone);
                    return trimCache(DYNAMIC_CACHE, 50);
                });
                return networkResponse;
            }).catch(() => {
                return caches.match(request).then((cachedResponse) => {
                    if (cachedResponse) return cachedResponse;
                    if (request.destination === 'document') return caches.match('/');
                });
            })
        );
    }
});

function isStaticAsset(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    return pathname.match(/\\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/i) ||
           pathname === '/' || pathname.startsWith('/index.html');
}

function trimCache(cacheName, maxItems) {
    caches.open(cacheName).then((cache) => {
        return cache.keys().then((keys) => {
            if (keys.length > maxItems) {
                cache.delete(keys[0]).then(trimCache(cacheName, maxItems));
            }
        });
    });
}`;

    fs.writeFileSync(path.join(config.outputDir, 'service-worker.js'), swContent);
    
    console.log('✓ Service worker otimizado gerado');
}

// Analisa bundle
async function analyzeBundle() {
    console.log('📊 Analisando bundle...');
    
    const analysis = {
        css: {},
        js: {},
        images: [],
        totalSize: 0
    };
    
    // Analisa CSS
    const cssFile = config.minify ? 'styles.min.css' : 'styles.css';
    const cssPath = path.join(config.outputDir, config.cssDir, cssFile);
    if (fs.existsSync(cssPath)) {
        const cssSize = fs.statSync(cssPath).size;
        analysis.css = {
            file: cssFile,
            size: cssSize,
            sizeKB: (cssSize / 1024).toFixed(2)
        };
        analysis.totalSize += cssSize;
    }
    
    // Analisa JS
    const jsFile = config.minify ? 'app.min.js' : 'app.js';
    const jsPath = path.join(config.outputDir, config.jsDir, jsFile);
    if (fs.existsSync(jsPath)) {
        const jsSize = fs.statSync(jsPath).size;
        analysis.js = {
            file: jsFile,
            size: jsSize,
            sizeKB: (jsSize / 1024).toFixed(2)
        };
        analysis.totalSize += jsSize;
    }
    
    // Analisa imagens
    if (fs.existsSync(config.iconsDir)) {
        const icons = fs.readdirSync(config.iconsDir);
        icons.forEach(icon => {
            const iconPath = path.join(config.outputDir, config.iconsDir, icon);
            if (fs.existsSync(iconPath)) {
                const iconSize = fs.statSync(iconPath).size;
                analysis.images.push({
                    file: icon,
                    size: iconSize,
                    sizeKB: (iconSize / 1024).toFixed(2)
                });
                analysis.totalSize += iconSize;
            }
        });
    }
    
    analysis.totalSizeKB = (analysis.totalSize / 1024).toFixed(2);
    
    // Salva análise
    fs.writeFileSync(
        path.join(config.outputDir, 'bundle-analysis.json'),
        JSON.stringify(analysis, null, 2)
    );
    
    console.log(`  ✓ CSS: ${analysis.css.sizeKB} KB`);
    console.log(`  ✓ JS: ${analysis.js.sizeKB} KB`);
    console.log(`  ✓ Imagens: ${analysis.images.length} arquivos`);
    console.log(`  ✓ Total: ${analysis.totalSizeKB} KB`);
    
    return analysis;
}

// Gera relatório de performance
async function generateReport() {
    console.log('📈 Gerando relatório de performance...');
    
    const report = {
        buildTime: new Date().toISOString(),
        version: '1.0.0',
        config: config,
        metrics: performanceMetrics,
        recommendations: []
    };
    
    // Verifica tamanho do bundle
    const analysisPath = path.join(config.outputDir, 'bundle-analysis.json');
    if (fs.existsSync(analysisPath)) {
        const analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
        
        if (analysis.totalSize > 500 * 1024) { // 500KB
            report.recommendations.push('Bundle muito grande. Considere dividir em chunks.');
        }
        
        if (analysis.js.size > 200 * 1024) { // 200KB
            report.recommendations.push('Arquivo JavaScript grande. Considere lazy loading.');
        }
        
        if (analysis.css.size > 50 * 1024) { // 50KB
            report.recommendations.push('Arquivo CSS grande. Considere critical CSS.');
        }
    }
    
    // Verifica configurações de otimização
    if (!config.minify) {
        report.recommendations.push('Habilite minificação para produção.');
    }
    
    if (!config.generateSourceMaps) {
        report.recommendations.push('Considere gerar source maps para debug.');
    }
    
    if (!config.optimizeImages) {
        report.recommendations.push('Otimize imagens para melhor performance.');
    }
    
    // Salva relatório
    fs.writeFileSync(
        path.join(config.outputDir, 'performance-report.json'),
        JSON.stringify(report, null, 2)
    );
    
    console.log('✓ Relatório gerado: performance-report.json');
    
    // Exibe recomendações
    if (report.recommendations.length > 0) {
        console.log('\n💡 Recomendações:');
        report.recommendations.forEach((rec, index) => {
            console.log(`  ${index + 1}. ${rec}`);
        });
    }
}

// Funções de minificação (implementações básicas)
function minifyCSS(css) {
    return css
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comentários
        .replace(/\s+/g, ' ') // Remove espaços extras
        .replace(/;\s*}/g, '}') // Remove ; antes de }
        .replace(/{\s*/g, '{') // Remove espaços após {
        .replace(/}\s*/g, '}') // Remove espaços antes de }
        .replace(/:\s*/g, ':') // Remove espaços após :
        .replace(/;\s*;/g, ';') // Remove ;; duplicados
        .trim();
}

function minifyJS(js) {
    return js
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comentários multiline
        .replace(/\/\/.*$/gm, '') // Remove comentários de linha
        .replace(/\s+/g, ' ') // Remove espaços extras
        .replace(/;\s*}/g, '}') // Remove ; antes de }
        .replace(/{\s*/g, '{') // Remove espaços após {
        .replace(/}\s*/g, '}') // Remove espaços antes de }
        .replace(/,\s*}/g, '}') // Remove , antes de }
        .replace(/;\s*;/g, ';') // Remove ;; duplicados
        .trim();
}

function minifyHTML(html) {
    return html
        .replace(/<!--[\s\S]*?-->/g, '') // Remove comentários
        .replace(/\s+/g, ' ') // Remove espaços extras
        .replace(/> </g, '><') // Remove espaços entre tags
        .trim();
}

// Executa build se chamado diretamente
if (require.main === module) {
    build().catch(console.error);
}

module.exports = { build, config, performanceMetrics };