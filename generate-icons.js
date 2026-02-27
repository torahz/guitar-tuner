/**
 * Gerador de Ícones SVG para Afinador Pro
 * 
 * Este script gera ícones SVG que podem ser convertidos para PNG
 * usando ferramentas como inkscape ou online converters.
 */

const fs = require('fs');
const path = require('path');

// Configurações dos ícones
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const outputDir = 'assets/icons';

// Cria diretório se não existir
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// SVG Template para o ícone do afinador
function generateIconSVG(size) {
    const padding = size * 0.1;
    const iconSize = size - (padding * 2);
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = iconSize / 2;
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <!-- Background -->
    <rect width="${size}" height="${size}" rx="${size * 0.15}" ry="${size * 0.15}" fill="#2563eb"/>
    
    <!-- Gradient Overlay -->
    <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
        </linearGradient>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.3"/>
        </filter>
    </defs>
    
    <!-- Main Circle -->
    <circle cx="${centerX}" cy="${centerY}" r="${radius * 0.9}" fill="url(#grad)" filter="url(#shadow)"/>
    
    <!-- Inner Circle -->
    <circle cx="${centerX}" cy="${centerY}" r="${radius * 0.6}" fill="rgba(255,255,255,0.1)"/>
    
    <!-- Gauge Lines -->
    <g transform="translate(${centerX}, ${centerY})">
        ${generateGaugeLines(radius * 0.8)}
    </g>
    
    <!-- Needle -->
    <g transform="translate(${centerX}, ${centerY})">
        <line x1="0" y1="${-radius * 0.1}" x2="0" y2="${-radius * 0.6}" stroke="#ef4444" stroke-width="${size * 0.02}" stroke-linecap="round"/>
        <circle cx="0" cy="${-radius * 0.65}" r="${size * 0.03}" fill="#ef4444" stroke="#fff" stroke-width="${size * 0.005}"/>
    </g>
    
    <!-- Logo -->
    <g transform="translate(${centerX}, ${centerY})">
        <path d="M${-size * 0.1} ${-size * 0.05} L${size * 0.1} ${-size * 0.05} L0 ${size * 0.05} Z" fill="#fff" opacity="0.8"/>
    </g>
    
    <!-- Border -->
    <circle cx="${centerX}" cy="${centerY}" r="${radius * 0.95}" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="${size * 0.01}"/>
</svg>`;
}

// Gera linhas do medidor
function generateGaugeLines(radius) {
    let lines = '';
    const steps = 12;
    
    for (let i = 0; i < steps; i++) {
        const angle = (i / steps) * Math.PI * 2 - Math.PI / 2;
        const innerRadius = radius * 0.7;
        const outerRadius = radius;
        
        const x1 = Math.cos(angle) * innerRadius;
        const y1 = Math.sin(angle) * innerRadius;
        const x2 = Math.cos(angle) * outerRadius;
        const y2 = Math.sin(angle) * outerRadius;
        
        const isMajor = i % 3 === 0;
        
        lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
                    stroke="${isMajor ? '#fff' : 'rgba(255,255,255,0.5)'}" 
                    stroke-width="${isMajor ? '2' : '1'}" 
                    stroke-linecap="round"/>`;
    }
    
    return lines;
}

// Gera ícones para todas as resoluções
function generateAllIcons() {
    console.log('Gerando ícones SVG...');
    
    iconSizes.forEach(size => {
        const svg = generateIconSVG(size);
        const filename = `icon-${size}x${size}.svg`;
        const filepath = path.join(outputDir, filename);
        
        fs.writeFileSync(filepath, svg);
        console.log(`✓ ${filename} gerado (${size}x${size})`);
    });
    
    // Gera ícones PNG usando inkscape (se disponível)
    generatePNGIcons();
}

// Gera ícones PNG a partir dos SVGs
function generatePNGIcons() {
    const { execSync } = require('child_process');
    
    console.log('\nGerando ícones PNG...');
    
    iconSizes.forEach(size => {
        const svgFile = path.join(outputDir, `icon-${size}x${size}.svg`);
        const pngFile = path.join(outputDir, `icon-${size}x${size}.png`);
        
        try {
            // Tenta usar inkscape
            execSync(`inkscape "${svgFile}" --export-type=png --export-filename="${pngFile}"`, { stdio: 'ignore' });
            console.log(`✓ ${pngFile} gerado`);
        } catch (error) {
            console.log(`⚠ PNG para ${size}x${size} não gerado (inkscape não disponível)`);
            console.log('  Instale o inkscape ou use um conversor online:');
            console.log(`  https://convertio.co/svg-png/`);
        }
    });
}

// Gera ícones para screenshots (placeholders)
function generateScreenshotPlaceholders() {
    console.log('\nGerando placeholders de screenshots...');
    
    const screenshotSizes = [
        { name: 'screenshot1', width: 1280, height: 720, label: 'Tela Principal' },
        { name: 'screenshot2', width: 720, height: 1280, label: 'Interface Mobile' }
    ];
    
    screenshotSizes.forEach(screenshot => {
        const svg = generateScreenshotSVG(screenshot.width, screenshot.height, screenshot.label);
        const filepath = path.join(outputDir, `${screenshot.name}.svg`);
        fs.writeFileSync(filepath, svg);
        console.log(`✓ ${screenshot.name}.svg gerado (${screenshot.width}x${screenshot.height})`);
    });
}

function generateScreenshotSVG(width, height, label) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <!-- Background -->
    <rect width="${width}" height="${height}" fill="#0f172a"/>
    
    <!-- Screen Border -->
    <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="20" ry="20" fill="#111827" stroke="#374151" stroke-width="2"/>
    
    <!-- Status Bar -->
    <rect x="20" y="20" width="${width - 40}" height="40" rx="10" ry="10" fill="#0b1220"/>
    <circle cx="${width / 2}" cy="40" r="4" fill="#64748b"/>
    
    <!-- App Header -->
    <rect x="40" y="80" width="${width - 80}" height="60" rx="12" ry="12" fill="#1f2937"/>
    <text x="${width / 2}" y="120" font-family="Arial, sans-serif" font-size="24" fill="#93c5fd" text-anchor="middle">Afinador Pro</text>
    
    <!-- Tuner Display -->
    <circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(width, height) * 0.2}" fill="#111827" stroke="#334155" stroke-width="2"/>
    
    <!-- Controls -->
    <rect x="40" y="${height - 120}" width="${width - 80}" height="80" rx="12" ry="12" fill="#1f2937"/>
    <text x="${width / 2}" y="${height - 80}" font-family="Arial, sans-serif" font-size="16" fill="#94a3b8" text-anchor="middle">${label}</text>
    
    <!-- Decorative Elements -->
    <circle cx="${width * 0.2}" cy="${height * 0.3}" r="4" fill="#3b82f6" opacity="0.3"/>
    <circle cx="${width * 0.8}" cy="${height * 0.7}" r="6" fill="#10b981" opacity="0.3"/>
    <circle cx="${width * 0.3}" cy="${height * 0.8}" r="3" fill="#f59e0b" opacity="0.3"/>
</svg>`;
}

// Gera arquivo de manifest para ícones
function generateIconManifest() {
    const manifest = {
        name: "Afinador Pro Icons",
        version: "1.0.0",
        generated: new Date().toISOString(),
        sizes: iconSizes,
        files: iconSizes.map(size => ({
            name: `icon-${size}x${size}.png`,
            size: `${size}x${size}`,
            path: `assets/icons/icon-${size}x${size}.png`
        }))
    };
    
    const manifestPath = path.join(outputDir, 'icons-manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`✓ icons-manifest.json gerado`);
}

// Função principal
function main() {
    console.log('🚀 Iniciando geração de ícones para Afinador Pro\n');
    
    try {
        generateAllIcons();
        generateScreenshotPlaceholders();
        generateIconManifest();
        
        console.log('\n✅ Geração de ícones concluída!');
        console.log('\nPróximos passos:');
        console.log('1. Instale o inkscape para gerar PNGs automaticamente');
        console.log('2. Ou use conversores online para transformar SVG em PNG');
        console.log('3. Atualize o manifest.json com os caminhos corretos');
        console.log('4. Teste o PWA em diferentes dispositivos');
        
    } catch (error) {
        console.error('❌ Erro ao gerar ícones:', error.message);
    }
}

// Executa se chamado diretamente
if (require.main === module) {
    main();
}

module.exports = {
    generateIconSVG,
    generateAllIcons,
    generatePNGIcons,
    generateScreenshotPlaceholders,
    generateIconManifest
};