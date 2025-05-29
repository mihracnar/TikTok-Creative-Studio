// --- UTF-8 to Base64 Helper ---
function utf8_to_b64(str) {
    try {
        return btoa(unescape(encodeURIComponent(str)));
    } catch (e) {
        console.warn("utf8_to_b64 fallback used for string:", str.substring(0,50) + "...");
        return btoa(str); 
    }
}

// --- Şablon Kodları ---
const LIBRARY_TEMPLATES = {
    p5js: `// p5.js Spiral Animasyonu
// 't' değişkeni otomatik olarak yönetilir

background(10, 10, 30); // Arka planı her frame temizle
stroke(100, 200, 255, 200);

for (let i = 0; i < 5000; i++) {
    let x = i % 200;
    let y = Math.floor(i / 200);
    
    let k = x / 8 - 12;
    let e = y / 13 - 14;
    let o = Math.sqrt(k*k + e*e) / 2;
    let d = 5 * cos(o); 
    
    let q = x/2 + 10 + 1/k + k * cos(e) * sin(d*8 - t); 
    let c = d/3 + t/8;
    
    let px = q * sin(c) + sin(d*2 + t) * k + 180;
    let py = (y/4 + 5*o*o + q*cos(c*3))/2 * cos(c) + 320;
    
    // Canvas sınırları içinde mi kontrol et
    if (px > 0 && px < width && py > 0 && py < height) { 
        point(px, py); 
    }
}

t += 0.05; // Zamanı ilerlet
`,

    threejs: `// Three.js 3D Dönen Geometri
// Global değişkenler: scene, camera, renderer, mesh, t (window.t olarak)
// Kütüphane: THREE (window.THREE olarak)

if (!scene) {
    const holder = document.getElementById('sketch-holder');
    if(holder) holder.innerHTML = ''; // sketchHolder'ı temizle

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, 360/640, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(360, 640);
    renderer.setClearColor(0x0a0a1e, 1);
    
    if (holder && !holder.contains(renderer.domElement)) { 
        holder.appendChild(renderer.domElement);
    }
    
    const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
    const material = new THREE.MeshPhongMaterial({ 
        color: 0x64c8ff,
        shininess: 100,
        transparent: true,
        opacity: 0.8
    });
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    
    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(0, 0, 10);
    scene.add(light);
    
    const ambientLight = new THREE.AmbientLight(0x404040, 0.7); 
    scene.add(ambientLight);
    
    camera.position.z = 5;
}

if (mesh && scene && camera && renderer) { 
    mesh.rotation.x = t * 0.5;
    mesh.rotation.y = t * 0.7;
    mesh.position.y = Math.sin(t) * 0.5;
    
    const hue = (t * 50) % 360;
    mesh.material.color.setHSL(hue / 360, 0.7, 0.6);
    renderer.render(scene, camera);
}
t += 0.02;`,

    pixijs: `// Pixi.js Parçacık Sistemi
// Global değişkenler: app, container, particles, t (window.t olarak)
// Kütüphane: PIXI (window.PIXI olarak)

if (!app) {
    const holder = document.getElementById('sketch-holder');
    if(holder) holder.innerHTML = ''; // sketchHolder'ı temizle

    try {
        app = new PIXI.Application({
            width: 360,
            height: 640,
            backgroundColor: 0x0a0a1e,
            transparent: false,
            antialias: true,
            forceCanvas: false
        });
        
        // PIXI version uyumluluğu için hem app.view hem app.canvas'ı kontrol et
        const viewElement = app.view || app.canvas;
        
        if (holder && viewElement && !holder.contains(viewElement)) {
            holder.appendChild(viewElement);
        }
        
        container = new PIXI.Container();
        app.stage.addChild(container);
        
        particles = [];
        for (let i = 0; i < 100; i++) {
            const particle = new PIXI.Graphics();
            particle.beginFill(Math.random() * 0xFFFFFF); 
            particle.drawCircle(0, 0, Math.random() * 3 + 2); 
            particle.endFill();
            
            particle.x = Math.random() * 360;
            particle.y = Math.random() * 640;
            particle.vx = (Math.random() - 0.5) * 2;
            particle.vy = (Math.random() - 0.5) * 2;
            
            particles.push(particle);
            container.addChild(particle);
        }
    } catch (pixiError) {
        console.error("PIXI.js initialization error:", pixiError);
        if (typeof p5Looping !== 'undefined') p5Looping = false;
        throw pixiError;
    }
}

if (particles && particles.length > 0 && app) { 
    particles.forEach((particle, index) => {
        particle.x += particle.vx + Math.sin(t + index * 0.1) * 0.5;
        particle.y += particle.vy + Math.cos(t + index * 0.1) * 0.5;
        
        if (particle.x < -5) particle.x = 365; 
        if (particle.x > 365) particle.x = -5;
        if (particle.y < -5) particle.y = 645;
        if (particle.y > 645) particle.y = -5;
        
        try {
            const hue = (t * 30 + index * 10) % 360;
            const color = new PIXI.Color({h: hue, s: 80 + Math.sin(t*0.5 + index * 0.2) * 20, v: 90 + Math.cos(t*0.5 + index * 0.3) * 10});
            particle.tint = color.toNumber();
        } catch (colorError) {
            // Fallback for older PIXI versions
            particle.tint = Math.random() * 0xFFFFFF;
        }
        
        particle.alpha = 0.6 + Math.sin(t * 2 + index * 0.15) * 0.4; 
    });
}
t += 0.03;`,

    webgl: `// WebGL Shader Animasyonu
// Global değişkenler: canvas, gl, program, timeLocation, resolutionLocation, t (window.t olarak)

if (!canvas || !gl) { 
    const holder = document.getElementById('sketch-holder');
    if(holder) holder.innerHTML = ''; // sketchHolder'ı temizle
    
    canvas = document.createElement('canvas');
    if(holder) holder.appendChild(canvas);
    
    canvas.width = 360;
    canvas.height = 640;
    
    gl = canvas.getContext('webgl', { antialias: true }) || canvas.getContext('experimental-webgl', { antialias: true });
    
    if (!gl) {
        console.error('WebGL desteklenmiyor');
        if (typeof p5Looping !== 'undefined') p5Looping = false; 
        throw new Error('WebGL desteklenmiyor veya experimental-webgl context oluşturulamadı.');
    }
    
    const vertexShaderSource = \`
        attribute vec2 a_position;
        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    \`;
    
    const fragmentShaderSource = \`
        precision mediump float;
        uniform float u_time;
        uniform vec2 u_resolution;
        
        vec3 hsv2rgb(vec3 c) {
            vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
            vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
            return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
        }

        void main() {
            vec2 st = gl_FragCoord.xy / u_resolution.xy;
            vec3 color = vec3(0.0);
            float time = u_time * 0.5;
            vec2 pos = st - vec2(0.5);
            float r = length(pos) * 2.0;
            float a = atan(pos.y, pos.x);
            float f = cos(a * 3.);
            f = mix(f, cos(a*10.), smoothstep(.0,1.,abs(sin(time)) ));
            f = mix(f, cos(a*20.+time*2.), pow(length(pos),.5));
            vec3 hsv = vec3( a/ (2.*3.14159265) + 0.5 + time*0.1, abs(f), pow(r, abs(f)) );
            color = hsv2rgb(hsv);
            gl_FragColor = vec4(color, 1.0);
        }
    \`;
    
    function createShader(glContext, type, source) {
        const shader = glContext.createShader(type);
        glContext.shaderSource(shader, source);
        glContext.compileShader(shader);
        if (!glContext.getShaderParameter(shader, glContext.COMPILE_STATUS)) {
            console.error('Shader compilation error (' + (type === gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT") + '):', glContext.getShaderInfoLog(shader));
            glContext.deleteShader(shader);
            return null;
        }
        return shader;
    }
    
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    if (!vertexShader || !fragmentShader) {
        console.error('WebGL Shader oluşturulamadı.');
        if (typeof p5Looping !== 'undefined') p5Looping = false;
        throw new Error('WebGL Shader oluşturulamadı (vertex veya fragment).');
    }
    
    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('WebGL Program linking error:', gl.getProgramInfoLog(program));
        if (typeof p5Looping !== 'undefined') p5Looping = false;
        throw new Error('WebGL Program linking hatası.');
    }
    
    const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]; 
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    
    timeLocation = gl.getUniformLocation(program, 'u_time');
    resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
}

if (gl && program && timeLocation && resolutionLocation) {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.useProgram(program);
    gl.uniform1f(timeLocation, t); 
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
} else if (!gl || !program) {
    if (typeof p5Looping !== 'undefined' && p5Looping) {
         console.warn("WebGL context veya program bulunamadığı için animasyon durduruldu.");
         p5Looping = false; 
    }
}
t += 0.016; 
`,

    canvas2d: `// Canvas 2D Native Animasyon
// Global değişkenler: canvas, ctx, t (window.t olarak)

if (!canvas || !ctx) { 
    const holder = document.getElementById('sketch-holder');
    if(holder) holder.innerHTML = ''; // sketchHolder'ı temizle

    canvas = document.createElement('canvas');
    if(holder) holder.appendChild(canvas);

    canvas.width = 360;
    canvas.height = 640;
    ctx = canvas.getContext('2d');
}

if (ctx) {
    ctx.fillStyle = 'rgba(10, 10, 30, 0.08)'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.strokeStyle = \`hsl(\${(t * 40) % 360}, 80%, 65%)\`;
    ctx.lineWidth = 1.5 + Math.sin(t * 1.5) * 0.7;
    ctx.beginPath();

    for (let i = 0; i < 250; i++) { 
        const angle = i * (0.12 + Math.sin(t * 0.25) * 0.03) + t * 1.2;
        const radius = i * (0.6 + Math.cos(t*0.35) * 0.15);
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();

    for (let i = 0; i < 15; i++) { 
        const angle = i * (Math.PI * 2 / 15) + t * (1.8 + Math.sin(i*0.15)*0.25);
        const radius = 90 + Math.sin(t * 1.3 + i * 0.6) * 40;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        ctx.fillStyle = \`hsla(\${(t * 25 + i * 20) % 360}, 85%, 75%, 0.75)\`;
        ctx.beginPath();
        ctx.arc(x, y, 2.5 + Math.sin(t * 3.5 + i) * 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
} else {
     if (typeof p5Looping !== 'undefined' && p5Looping) {
         console.warn("Canvas 2D context bulunamadığı için animasyon durduruldu.");
         p5Looping = false;
    }
}
t += 0.03; 
`
};
// --- Diğer Global Değişkenler ---
let currentSketch = null; 
let currentMusic = null;
let audioDestination = null;
let cachedVideoBlob = null;
let cachedAudioBlob = null;
let finalCombinedBlob = null;
let isRecordingAnimation = false;
let isRecordingMusic = false;
let p5Looping = false; // p5.js dışındaki kütüphaneler için ana döngü bayrağı
let lastCodeHash = '';
let lastDuration = 0;
let lastFPS = 0;
let lastMusicSettingsHash = '';
let globalTimeCounter = 0; // Tüm kütüphaneler için global time counter
let currentLibrary = 'p5js';

let scene, camera, renderer, mesh; 
let app, container, particles;     
let canvas, gl, program, timeLocation, resolutionLocation, ctx; 

let animationPreviewPlayer, musicPreviewPlayer, combinedPreviewPlayer;
let animationPreviewTitle, musicPreviewTitle;
let combineAndPreviewBtn, downloadFinalVideoBtn;
let sketchHolder;
let saveMusicBtnElement, stopMusicBtnElement, generatePlayMusicBtnElement;
let playAnimationBtnElement, stopAnimationBtnElement, saveAnimationVideoBtnElement;
let liveAnimationTitleElement, combinedPreviewTitleElement;
let codeInputElement, durationInputElement, fpsInputElement;
let librarySelectElement, styleSelectElement, scaleSelectElement, tempoSliderElement, reverbSliderElement;

// --- getSupportedMimeTypes: DOMContentLoaded'dan ÖNCE tanımla ---
function getSupportedMimeTypes() {
    const types = [
        'video/mp4;codecs="avc1.42E01E,mp4a.40.2"', 'video/mp4;codecs="h264,aac"', 'video/mp4;codecs="avc1.42E01E"',
        'video/mp4', 'video/webm;codecs="vp9,opus"', 'video/webm;codecs="vp8,opus"', 'video/webm;codecs=vp9',
        'video/webm;codecs=vp8', 'video/webm', 'video/ogg;codecs="theora,vorbis"',
    ];
    return types.filter(type => { try { return MediaRecorder.isTypeSupported(type); } catch (e) { return false; }});
}


document.addEventListener('DOMContentLoaded', () => {
    animationPreviewPlayer = document.getElementById('animationPreviewPlayer');
    musicPreviewPlayer = document.getElementById('musicPreviewPlayer');
    combinedPreviewPlayer = document.getElementById('combinedPreviewPlayer');
    animationPreviewTitle = document.getElementById('animationPreviewTitle');
    musicPreviewTitle = document.getElementById('musicPreviewTitle');
    combineAndPreviewBtn = document.getElementById('combineAndPreviewBtn');
    downloadFinalVideoBtn = document.getElementById('downloadFinalVideoBtn');
    sketchHolder = document.getElementById('sketch-holder');

    generatePlayMusicBtnElement = document.getElementById('generatePlayMusicBtn');
    saveMusicBtnElement = document.getElementById('saveMusicBtn');
    stopMusicBtnElement = document.getElementById('stopMusicBtn');

    playAnimationBtnElement = document.getElementById('playAnimationBtn');
    stopAnimationBtnElement = document.getElementById('stopAnimationBtn');
    saveAnimationVideoBtnElement = document.getElementById('saveAnimationVideoBtn');

    liveAnimationTitleElement = document.getElementById('liveAnimationTitle');
    combinedPreviewTitleElement = document.getElementById('combinedPreviewTitle');

    codeInputElement = document.getElementById('codeInput');
    durationInputElement = document.getElementById('durationInput');
    fpsInputElement = document.getElementById('fpsInput');
    librarySelectElement = document.getElementById('librarySelect');
    styleSelectElement = document.getElementById('styleSelect');
    scaleSelectElement = document.getElementById('scaleSelect');
    tempoSliderElement = document.getElementById('tempoSlider');
    reverbSliderElement = document.getElementById('reverbSlider');

    if (librarySelectElement) librarySelectElement.addEventListener('change', handleLibraryChange);
    
    if (tempoSliderElement) tempoSliderElement.addEventListener('input', function() {
        const tempoValueEl = document.getElementById('tempoValue');
        if (tempoValueEl) tempoValueEl.textContent = this.value;
        handleMusicConfigChange(true);
    });
    if (reverbSliderElement) reverbSliderElement.addEventListener('input', function() {
        const reverbValueEl = document.getElementById('reverbValue');
        if (reverbValueEl) reverbValueEl.textContent = this.value;
        handleMusicConfigChange(true);
    });

    if (styleSelectElement) styleSelectElement.addEventListener('change', () => handleMusicConfigChange(false));
    if (scaleSelectElement) scaleSelectElement.addEventListener('change', () => handleMusicConfigChange(false));
    
    if (codeInputElement) codeInputElement.addEventListener('input', handleAnimationConfigChange);
    if (durationInputElement) durationInputElement.addEventListener('change', () => {
        handleAnimationConfigChange();
        handleMusicConfigChange(false); 
    });
    if (fpsInputElement) fpsInputElement.addEventListener('change', handleAnimationConfigChange);

    if (librarySelectElement) { 
        currentLibrary = librarySelectElement.value; 
    }
    if (codeInputElement && LIBRARY_TEMPLATES[currentLibrary]) {
        codeInputElement.value = LIBRARY_TEMPLATES[currentLibrary];
    } else if (codeInputElement) {
        codeInputElement.value = `// ${currentLibrary} için şablon bulunamadı.`;
        console.error(`${currentLibrary} için başlangıç şablonu yüklenemedi.`);
    }
    
    saveCurrentConfig();
    updateButtonStates();
    
    setTimeout(() => {
        const supportedTypes = getSupportedMimeTypes(); 
        console.log('🎯 Desteklenen video MIME türleri:', supportedTypes);
        if (supportedTypes.length === 0 && saveAnimationVideoBtnElement && !saveAnimationVideoBtnElement.disabled) {
            showStatus('codeStatus', 'Tarayıcınız MediaRecorder için desteklenen video formatı bulamadı. Video kaydı çalışmayabilir.', 'error');
        }
    }, 1000);
});

function handleLibraryChange() {
    if (!librarySelectElement || !codeInputElement) return;
    const selectedLibrary = librarySelectElement.value;
    
    console.log(`[handleLibraryChange] Kütüphane değiştiriliyor: ${currentLibrary} -> ${selectedLibrary}`);

    if (selectedLibrary !== currentLibrary) {
        stopAnimation(false); 
        clearCanvas(); // Bu, sketchHolder'ı da temizler      
        
        currentLibrary = selectedLibrary;
        const template = LIBRARY_TEMPLATES[currentLibrary];

        console.log(`[handleLibraryChange] ${currentLibrary} için şablon alınıyor. Şablon var mı?: ${!!template}`);
        
        if (template) {
            codeInputElement.value = template;
        } else {
            const errorMessage = `// HATA: ${getLibraryDisplayName(currentLibrary)} için şablon bulunamadı. LIBRARY_TEMPLATES objesini kontrol edin.`;
            codeInputElement.value = errorMessage;
            console.error(`HATA: ${currentLibrary} için şablon bulunamadı!`);
            showStatus('codeStatus', `${getLibraryDisplayName(currentLibrary)} için şablon yüklenemedi.`, 'error');
        }
        
        console.log(`[handleLibraryChange] codeInput.value ${currentLibrary} için ayarlandı.`);
        handleAnimationConfigChange(); 
    }
}

function getLibraryDisplayName(libraryKey) {
    const names = {
        'p5js': 'p5.js', 'threejs': 'Three.js', 'pixijs': 'Pixi.js', 
        'webgl': 'WebGL Shader', 'canvas2d': 'Canvas 2D'
    };
    return names[libraryKey] || libraryKey;
}

function clearCanvas() {
    console.log("[clearCanvas] Canvas temizleniyor. Mevcut kütüphane:", currentLibrary);
    if (sketchHolder) {
        sketchHolder.innerHTML = ''; 
    }
    
    if (currentSketch && typeof currentSketch.remove === 'function') {
        console.log("[clearCanvas] p5.js instance'ı kaldırılıyor.");
        currentSketch.remove(); 
        currentSketch = null;
    }
    
    if (renderer) { 
        try {
            renderer.dispose();
        } catch (e) {
            console.warn("Renderer dispose error in clearCanvas:", e);
        }
        renderer = null; 
    }
    if (scene) { 
        scene = null; 
    }
    camera = null; mesh = null;
    
    if (app) { 
        try {
            app.destroy(true, { 
                children: true, 
                texture: true, 
                baseTexture: true 
            }); 
        } catch (e) {
            console.warn("PIXI app destroy error in clearCanvas:", e);
        }
        app = null;
    }
    container = null; particles = null;
    
    gl = null; program = null; timeLocation = null; resolutionLocation = null;
    ctx = null;
    canvas = null; 
    
    globalTimeCounter = 0; // Reset global time counter
    console.log("[clearCanvas] Temizlik tamamlandı.");
}

function getCurrentMusicSettingsHash() {
    if (!styleSelectElement || !scaleSelectElement || !tempoSliderElement || !reverbSliderElement) return 'default-music-hash';
    const style = styleSelectElement.value;
    const scale = scaleSelectElement.value;
    const tempo = tempoSliderElement.value;
    const reverb = reverbSliderElement.value;
    const combinedString = `${style}-${scale}-${tempo}-${reverb}`;
    return utf8_to_b64(combinedString).substring(0,10);
}

function handleAnimationConfigChange() {
    if (hasAnimationConfigChanged()) {
        showStatus('codeStatus', '⚠️ Animasyon ayarları değişti. Değişiklikleri görmek için "Oynat", kaydetmek için "Kaydet".', 'error');
        resetAnimationPreview();
        resetCombinedPreview();
    }
    updateButtonStates();
}

function handleMusicConfigChange(isLiveUpdate) {
    const newHash = getCurrentMusicSettingsHash();
    const durationVal = durationInputElement ? parseInt(durationInputElement.value) : 10;

    if (lastMusicSettingsHash !== newHash || (currentMusic && currentMusic.duration !== durationVal)) {
        if (currentMusic && isLiveUpdate) {
            showStatus('musicStatus', '🎶 Müzik ayarları canlı güncellendi. Kaydetmek için "Müziği Kaydet".', 'progress');
        } else {
            showStatus('musicStatus', '⚠️ Müzik ayarları/süre değişti. Yeni müziği duymak için "Oluştur & Çal".', 'error');
        }
        if (saveMusicBtnElement) saveMusicBtnElement.disabled = true; 
        
        resetMusicPreview();
        resetCombinedPreview();
        updateButtonStates();
    }
}

function hasAnimationConfigChanged() {
    if (!codeInputElement || !durationInputElement || !fpsInputElement) return false;
    const currentCodeVal = codeInputElement.value;
    const currentDurationVal = parseInt(durationInputElement.value);
    const currentFPSVal = parseInt(fpsInputElement.value);
    
    let currentCodeHashVal = "empty_code_hash"; 
    if (currentCodeVal && currentCodeVal.trim() !== "") { 
        currentCodeHashVal = utf8_to_b64(currentCodeVal).substring(0, 20);
    }

    return (currentCodeHashVal !== lastCodeHash || currentDurationVal !== lastDuration || currentFPSVal !== lastFPS);
}

function saveCurrentConfig(type = "all") {
    if (type === "animation" || type === "all") {
        if (codeInputElement && durationInputElement && fpsInputElement) {
            const codeVal = codeInputElement.value;
            if (codeVal && codeVal.trim() !== "") {
                lastCodeHash = utf8_to_b64(codeVal).substring(0, 20);
            } else {
                lastCodeHash = "empty_code_hash";
            }
            lastDuration = parseInt(durationInputElement.value);
            lastFPS = parseInt(fpsInputElement.value);
        }
    }
    if (type === "music" || type === "all") {
        lastMusicSettingsHash = getCurrentMusicSettingsHash();
        if (durationInputElement) { 
             if (!currentMusic || currentMusic.duration !== parseInt(durationInputElement.value)) {
             }
        }
    }
}

function updateProgress(percentage) {
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    if (!progressContainer || !progressBar) return;
    progressContainer.style.display = percentage > 0 && percentage <= 100 ? 'block' : 'none';
    progressBar.style.width = Math.min(100, Math.max(0, percentage)) + '%';
}

function showStatus(elementId, message, type = 'success') {
    const statusEl = document.getElementById(elementId);
    if (!statusEl) {
        console.warn(`Status element with ID '${elementId}' not found. Message: ${message}`);
        return;
    }
    statusEl.textContent = message; 
    statusEl.className = `status ${type}`;
    statusEl.style.display = 'block';
    const timeout = (type === 'error' || type === 'success') ? 4500 : 5000; 
    
    if (statusEl.timeoutId) clearTimeout(statusEl.timeoutId);

    statusEl.timeoutId = setTimeout(() => { 
        if (statusEl.textContent === message && statusEl.style.display !== 'none') {
            statusEl.style.display = 'none';
        }
        statusEl.timeoutId = null;
    }, timeout);
}

function updateButtonStates() {
    if (!playAnimationBtnElement || !stopAnimationBtnElement || !saveAnimationVideoBtnElement ||
        !generatePlayMusicBtnElement || !stopMusicBtnElement || !saveMusicBtnElement ||
        !combineAndPreviewBtn || !downloadFinalVideoBtn || !codeInputElement) return;

    const animationCodeExists = codeInputElement.value && codeInputElement.value.trim() !== '';
    const animationConfigChanged = hasAnimationConfigChanged();

    playAnimationBtnElement.disabled = isRecordingAnimation || !animationCodeExists;
    
    let isAnimRunning = false;
    if (currentLibrary === 'p5js') {
        isAnimRunning = !!currentSketch && typeof currentSketch.isLooping === 'function' && currentSketch.isLooping();
    } else {
        isAnimRunning = p5Looping; // Diğer kütüphaneler için global flag
    }
    
    stopAnimationBtnElement.disabled = !isAnimRunning || isRecordingAnimation;
    
    // Video kayıt butonu artık tüm kütüphaneler için aktif
    saveAnimationVideoBtnElement.disabled = !animationCodeExists || isRecordingAnimation || animationConfigChanged;

    generatePlayMusicBtnElement.disabled = isRecordingMusic;
    stopMusicBtnElement.disabled = !currentMusic || isRecordingMusic;
    
    const musicSettingsChangedSincePlayOrSave = lastMusicSettingsHash !== getCurrentMusicSettingsHash();
    const musicDuration = durationInputElement ? parseInt(durationInputElement.value) : 10;
    const musicDurationChanged = currentMusic && currentMusic.duration !== musicDuration;

    saveMusicBtnElement.disabled = !currentMusic || isRecordingMusic || (cachedAudioBlob && !musicSettingsChangedSincePlayOrSave && !musicDurationChanged);
    if (currentMusic && !isRecordingMusic && (musicSettingsChangedSincePlayOrSave || musicDurationChanged)) {
        saveMusicBtnElement.disabled = false;
    }

    combineAndPreviewBtn.disabled = !(cachedVideoBlob) || isRecordingAnimation || isRecordingMusic; 
    downloadFinalVideoBtn.disabled = !finalCombinedBlob; 
}


function resetAnimationPreview() {
    if (animationPreviewPlayer) {
        if (animationPreviewPlayer.src) URL.revokeObjectURL(animationPreviewPlayer.src);
        animationPreviewPlayer.src = '';
        animationPreviewPlayer.style.display = 'none';
    }
    if (animationPreviewTitle) animationPreviewTitle.style.display = 'none';
    cachedVideoBlob = null;
    updateButtonStates();
}

function resetMusicPreview() {
    if (musicPreviewPlayer) {
        if (musicPreviewPlayer.src) URL.revokeObjectURL(musicPreviewPlayer.src);
        musicPreviewPlayer.src = '';
        musicPreviewPlayer.style.display = 'none';
    }
    if (musicPreviewTitle) musicPreviewTitle.style.display = 'none';
    cachedAudioBlob = null;
    updateButtonStates();
}

function resetCombinedPreview() {
    if (combinedPreviewPlayer) {
        if (combinedPreviewPlayer.src) URL.revokeObjectURL(combinedPreviewPlayer.src);
        combinedPreviewPlayer.src = '';
        combinedPreviewPlayer.style.display = 'none';
    }
    if (sketchHolder) sketchHolder.style.display = 'block'; 
    if (liveAnimationTitleElement) liveAnimationTitleElement.style.display = 'block';
    if (combinedPreviewTitleElement) combinedPreviewTitleElement.style.display = 'none';
    finalCombinedBlob = null;
    if (downloadFinalVideoBtn) {
        downloadFinalVideoBtn.style.display = 'none';
    }
    updateProgress(0);
    updateButtonStates();
}

function updateAnimationPreviewUI() {
    if (cachedVideoBlob && animationPreviewPlayer) {
        animationPreviewPlayer.src = URL.createObjectURL(cachedVideoBlob);
        animationPreviewPlayer.style.display = 'block';
        if (animationPreviewTitle) animationPreviewTitle.style.display = 'block';
        showStatus('codeStatus', `✅ Animasyon videosu kaydedildi! (${(cachedVideoBlob.size / 1024 / 1024).toFixed(1)} MB)`);
    } else if (animationPreviewPlayer) {
        animationPreviewPlayer.style.display = 'none';
        if (animationPreviewTitle) animationPreviewTitle.style.display = 'none';
    }
    updateButtonStates();
}

function updateMusicPreviewUI() {
    if (cachedAudioBlob && musicPreviewPlayer) {
        musicPreviewPlayer.src = URL.createObjectURL(cachedAudioBlob);
        musicPreviewPlayer.style.display = 'block';
        if (musicPreviewTitle) musicPreviewTitle.style.display = 'block';
        showStatus('musicStatus', `✅ Müzik kaydedildi ve önizleniyor! (${(cachedAudioBlob.size / 1024).toFixed(1)} KB)`);
    } else if (musicPreviewPlayer) {
        musicPreviewPlayer.style.display = 'none';
        if (musicPreviewTitle) musicPreviewTitle.style.display = 'none';
    }
    updateButtonStates();
}

function updateCombinedPreviewUI() {
    if (finalCombinedBlob && combinedPreviewPlayer) {
        combinedPreviewPlayer.src = URL.createObjectURL(finalCombinedBlob);
        combinedPreviewPlayer.style.display = 'block';
        if (sketchHolder) sketchHolder.style.display = 'none'; 
        if (liveAnimationTitleElement) liveAnimationTitleElement.style.display = 'none';
        if (combinedPreviewTitleElement) combinedPreviewTitleElement.style.display = 'block';
        showStatus('exportStatus', `🎉 Birleştirilmiş önizleme hazır! (${(finalCombinedBlob.size / 1024 / 1024).toFixed(1)} MB)`);
        if (downloadFinalVideoBtn) {
            downloadFinalVideoBtn.style.display = 'inline-block';
        }
    } else {
        resetCombinedPreview(); 
    }
    updateButtonStates();
}

function playAnimation() {
    if (!codeInputElement) return;
    const code = codeInputElement.value;
    if (!code || !code.trim()) { 
        showStatus('codeStatus', 'Lütfen çalıştırmak için bir kod girin!', 'error'); 
        return; 
    }
    console.log(`[playAnimation] ${currentLibrary} için animasyon oynatılıyor.`);

    saveCurrentConfig("animation"); 

    stopAnimation(false); 
    clearCanvas();      

    if(combinedPreviewPlayer) combinedPreviewPlayer.style.display = 'none';
    if(sketchHolder) sketchHolder.style.display = 'block'; 
    if(liveAnimationTitleElement) liveAnimationTitleElement.style.display = 'block';
    if(combinedPreviewTitleElement) combinedPreviewTitleElement.style.display = 'none';

    // Global time counter'ı reset et
    globalTimeCounter = 0;

    if (currentLibrary !== 'p5js') {
        p5Looping = true;
    } else {
        p5Looping = false; // p5.js kendi döngüsünü yönetir, global flag'e ihtiyaç duymaz
    }

    let animationStartedSuccessfully = false;
    try {
        switch(currentLibrary) {
            case 'p5js':
                startP5Animation(code); 
                animationStartedSuccessfully = !!currentSketch && (typeof currentSketch.width !== 'undefined');
                console.log("[playAnimation] p5.js için animationStartedSuccessfully:", animationStartedSuccessfully);
                if (animationStartedSuccessfully && currentSketch.isLooping && !currentSketch.isLooping()) {
                    console.log("[playAnimation] p5.js loop'u manuel başlatılıyor.");
                    currentSketch.loop(); 
                }
                break;
            case 'threejs':
                startThreeJSAnimation(code); 
                animationStartedSuccessfully = p5Looping;
                break;
            case 'pixijs':
                startPixiJSAnimation(code);
                animationStartedSuccessfully = p5Looping;
                break;
            case 'webgl':
                startWebGLAnimation(code);
                animationStartedSuccessfully = p5Looping;
                break;
            case 'canvas2d':
                startCanvas2DAnimation(code);
                animationStartedSuccessfully = p5Looping;
                break;
            default:
                showStatus('codeStatus', `Bilinmeyen kütüphane: ${currentLibrary}. p5.js kullanılıyor.`, 'error');
                startP5Animation(code); 
                animationStartedSuccessfully = !!currentSketch && (typeof currentSketch.width !== 'undefined');
        }
        
        if (animationStartedSuccessfully) {
          showStatus('codeStatus', `▶️ ${getLibraryDisplayName(currentLibrary)} animasyonu oynatılıyor...`, 'success');
        } else if (currentLibrary === 'p5js' && !animationStartedSuccessfully) {
            showStatus('codeStatus', `p5.js animasyonu başlatılamadı. Konsolu kontrol edin.`, 'error');
        } else if (currentLibrary !== 'p5js' && !p5Looping) { 
            // Hata mesajı _genericAnimationLoop içinde gösterilmiş olmalı
        }
    } catch (error) {
        showStatus('codeStatus', `${getLibraryDisplayName(currentLibrary)} başlatma sırasında genel hata: ${error.message}`, 'error');
        console.error(`[playAnimation] ${getLibraryDisplayName(currentLibrary)} start error:`, error);
        if (currentLibrary !== 'p5js') p5Looping = false; 
        if (currentSketch && currentLibrary === 'p5js') { 
            try { currentSketch.noLoop(); } catch(e){}
        }
    }
    updateButtonStates();
}

// --- Kütüphane Başlatma Fonksiyonları ---
function startP5Animation(code) {
    console.log("[startP5Animation] ÇAĞRILDI."); 

    if (!sketchHolder) {
        console.error("sketchHolder bulunamadı! p5.js animasyonu başlatılamıyor.");
        updateButtonStates();
        return;
    }

    currentSketch = new p5((p_instance) => {
        let internalTimeCounter = 0; // p5.js için internal time counter
        let p5Canvas = null;

        const p5globals = { 
            createCanvas: (...args) => p_instance.createCanvas(...args),
            background: (...args) => p_instance.background(...args),
            stroke: (...args) => p_instance.stroke(...args),
            fill: (...args) => p_instance.fill(...args),
            point: (...args) => p_instance.point(...args),
            line: (...args) => p_instance.line(...args),
            circle: (...args) => p_instance.circle(...args),
            rect: (...args) => p_instance.rect(...args),
            ellipse: (...args) => p_instance.ellipse(...args),
            triangle: (...args) => p_instance.triangle(...args),
            text: (...args) => p_instance.text(...args),
            textSize: (...args) => p_instance.textSize(...args),
            textAlign: (...args) => p_instance.textAlign(...args),
            push: () => p_instance.push(),
            pop: () => p_instance.pop(),
            translate: (...args) => p_instance.translate(...args),
            rotate: (...args) => p_instance.rotate(...args),
            scale: (...args) => p_instance.scale(...args), 
            noStroke: () => p_instance.noStroke(),
            noFill: () => p_instance.noFill(),
            strokeWeight: (...args) => p_instance.strokeWeight(...args),
            cos: Math.cos, sin: Math.sin, tan: Math.tan,
            acos: Math.acos, asin: Math.asin, atan: Math.atan, atan2: Math.atan2,
            sqrt: Math.sqrt, pow: Math.pow, abs: Math.abs,
            min: Math.min, max: Math.max, floor: Math.floor,
            ceil: Math.ceil, round: Math.round,
            random: (...args) => p_instance.random(...args),
            map: (...args) => p_instance.map(...args),
            lerp: (...args) => p_instance.lerp(...args),
            dist: (...args) => p_instance.dist(...args),
            mag: (...args) => p_instance.mag(...args),
            PI: Math.PI, TWO_PI: 2 * Math.PI, HALF_PI: Math.PI / 2, QUARTER_PI: Math.PI / 4,
            color: (...args) => p_instance.color(...args),
            alpha: (...args) => p_instance.alpha(...args),
            red: (...args) => p_instance.red(...args),
            green: (...args) => p_instance.green(...args),
            blue: (...args) => p_instance.blue(...args),
            hue: (...args) => p_instance.hue(...args),
            saturation: (...args) => p_instance.saturation(...args),
            brightness: (...args) => p_instance.brightness(...args),
            lerpColor: (...args) => p_instance.lerpColor(...args),
            get width() { return p_instance.width; },
            get height() { return p_instance.height; },
            get mouseX() { return p_instance.mouseX; },
            get mouseY() { return p_instance.mouseY; },
            get pmouseX() { return p_instance.pmouseX; },
            get pmouseY() { return p_instance.pmouseY; },
            get mouseIsPressed() { return p_instance.mouseIsPressed; },
            get keyIsPressed() { return p_instance.keyIsPressed; },
            get keyCode() { return p_instance.keyCode; },
            get key() { return p_instance.key; },
            get frameCount() { return p_instance.frameCount; },
            // t değişkenini düzgün yönet
            get t() { return internalTimeCounter; },
            set t(val) { internalTimeCounter = val; }
        };

        p_instance.setup = function() {
            try {
                p5Canvas = p_instance.createCanvas(360, 640);
                p5Canvas.parent(sketchHolder);
                
                const fpsVal = fpsInputElement ? parseInt(fpsInputElement.value) : 30;
                p_instance.frameRate(fpsVal);
                
                internalTimeCounter = 0; // Reset internal time counter
                console.log("[p5.js setup] Tamamlandı. Canvas boyutu:", p_instance.width, "x", p_instance.height);
            } catch (setupError) {
                console.error("[p5.js setup] Hata:", setupError);
                showStatus('codeStatus', `p5.js setup hatası: ${setupError.message}`, 'error');
                if(sketchHolder) { 
                    sketchHolder.innerHTML = `<div style="color:red; padding:10px;"><b>p5.js Setup Hatası:</b><br>${setupError.message}</div>`;
                }
                try { p_instance.noLoop(); } catch(e){}
                currentSketch = null; 
            }
        };

        p_instance.draw = function() {
            try {
                // Her frame'de debug info (daha az spam için)
                if (p_instance.frameCount % 180 === 0) { // 3 saniyede bir (30fps varsayımıyla)
                    console.log(`[p5.js draw] Frame: ${p_instance.frameCount}, t: ${internalTimeCounter.toFixed(2)}`);
                }
                
                // t değişkenini p5globals'a düzgün aktar
                p5globals.t = internalTimeCounter;
                
                // Kullanıcı kodunu eval ile çalıştır (t değişkeninin değişimi için)
                const codeWithContext = `
                    let t = ${internalTimeCounter};
                    ${code}
                    window.p5_internal_t = t;
                `;
                
                // p5 globals'ı window'a geçici olarak ekle
                const originalValues = {};
                Object.keys(p5globals).forEach(key => {
                    if (key !== 't') {
                        originalValues[key] = window[key];
                        window[key] = p5globals[key];
                    }
                });
                
                eval(codeWithContext);
                
                // p5 globals'ı window'dan kaldır
                Object.keys(p5globals).forEach(key => {
                    if (key !== 't') {
                        if (originalValues[key] !== undefined) {
                            window[key] = originalValues[key];
                        } else {
                            delete window[key];
                        }
                    }
                });
                
                // t değişkeninin değişimini yakala
                if (typeof window.p5_internal_t !== 'undefined') {
                    internalTimeCounter = window.p5_internal_t;
                    delete window.p5_internal_t;
                }
                
                // Global time counter'ı da güncelle (senkronizasyon için)
                globalTimeCounter = internalTimeCounter;
            } catch (error) {
                console.error("[p5.js draw] Hata:", error);
                showStatus('codeStatus', `p5.js kod hatası: ${error.message}`, 'error');
                 if(sketchHolder && p_instance.width && p_instance.height) { 
                    p_instance.background(20,0,0); 
                    p_instance.fill(255,100,100); 
                    p_instance.textSize(16); 
                    p_instance.textAlign(p_instance.LEFT, p_instance.TOP);
                    p_instance.text('p5.js Kod Hatası:', 10, 30); 
                    p_instance.textSize(12);
                    p_instance.text(error.message.substring(0,100), 10, 50, p_instance.width - 20, p_instance.height - 60);
                 } else if (sketchHolder) { 
                    sketchHolder.innerHTML = `<div style="color:red; padding:10px;"><b>p5.js Kod Hatası:</b><br>${error.message}</div>`;
                 }
                try {p_instance.noLoop();} catch(e){}
            }
        };
    });
    
    console.log("[startP5Animation] currentSketch oluşturuldu:", !!currentSketch); 

    // p5.js instance oluşturulmasını biraz bekle ve loop'u başlat
    setTimeout(() => {
        if (currentSketch) { 
            console.log("[startP5Animation] Loop başlatılıyor...");
            try {
                currentSketch.loop(); 
                console.log("[startP5Animation] Loop başlatıldı. isLooping:", currentSketch.isLooping());
            } catch (e) {
                console.error("[startP5Animation] Loop başlatma hatası:", e);
            }
        } else {
            console.error("[startP5Animation] currentSketch null!");
        }
    }, 200);
}


let animationFrameId; 
function _genericAnimationLoop(userCode, libraryObject, libraryNameForScope) {
    if (!p5Looping) { 
        console.log(`[${libraryNameForScope}] Animasyon döngüsü p5Looping false olduğu için durdu.`);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animationFrameId = null; 
        return;
    }
    
    try {
        if (libraryObject && libraryNameForScope) {
            window[libraryNameForScope.toUpperCase()] = libraryObject;
        }
        
        // Global time counter'ı kullan ve t değişkenini global scope'da tanımla
        let t = globalTimeCounter;
        window.t = t;

        // User code'u eval ile çalıştır (t değişkeninin değişimini yakalayabilmek için)
        eval(userCode);

        // t değişkeninin değişip değişmediğini kontrol et
        if (typeof window.t !== 'undefined' && window.t !== globalTimeCounter) {
            globalTimeCounter = window.t;
        } else if (typeof t !== 'undefined' && t !== globalTimeCounter) {
            globalTimeCounter = t;
            window.t = t;
        }
        
        // Debug: Her 60 frame'de bir log (daha az spam için)
        if (Math.floor(globalTimeCounter * 30) % 180 === 0) { // 3 saniyede bir
            console.log(`[${libraryNameForScope}] Live animation t: ${globalTimeCounter.toFixed(2)}`);
        }
        
        animationFrameId = requestAnimationFrame(() => _genericAnimationLoop(userCode, libraryObject, libraryNameForScope));
    } catch (error) {
        showStatus('codeStatus', `${getLibraryDisplayName(libraryNameForScope)} hatası: ${error.message}`, 'error');
        console.error(`[${libraryNameForScope}] _genericAnimationLoop Hata:`, error);
        p5Looping = false; 
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animationFrameId = null; 
        updateButtonStates();
    }
}

function startThreeJSAnimation(code) {
    console.log("[startThreeJSAnimation] Başlatılıyor...");
    if (typeof THREE === 'undefined') { 
        showStatus('codeStatus', 'Three.js kütüphanesi yüklenemedi.', 'error');
        console.error("THREE.js kütüphanesi yüklenmemiş!"); p5Looping = false; return; 
    }
    
    // Three.js setup
    try {
        const holder = document.getElementById('sketch-holder');
        if (holder) holder.innerHTML = '';

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, 360/640, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(360, 640);
        renderer.setClearColor(0x0a0a1e, 1);
        
        if (holder && !holder.contains(renderer.domElement)) { 
            holder.appendChild(renderer.domElement);
        }
        
        const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x64c8ff,
            shininess: 100,
            transparent: true,
            opacity: 0.8
        });
        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        
        const light = new THREE.PointLight(0xffffff, 1, 100);
        light.position.set(0, 0, 10);
        scene.add(light);
        
        const ambientLight = new THREE.AmbientLight(0x404040, 0.7); 
        scene.add(ambientLight);
        
        camera.position.z = 5;
        
        console.log("[Three.js] Setup complete, starting animation loop");
        p5Looping = true; 
        _genericAnimationLoop(code, THREE, 'three');
    } catch (error) {
        console.error("[Three.js] Setup error:", error);
        showStatus('codeStatus', `Three.js setup hatası: ${error.message}`, 'error');
        p5Looping = false;
    }
}

function startPixiJSAnimation(code) {
    console.log("[startPixiJSAnimation] Başlatılıyor...");
    if (typeof PIXI === 'undefined') { 
        showStatus('codeStatus', 'Pixi.js kütüphanesi yüklenemedi.', 'error');
        console.error("PIXI.js kütüphanesi yüklenmemiş!"); p5Looping = false; return; 
    }
    
    // Pixi.js setup
    try {
        const holder = document.getElementById('sketch-holder');
        if (holder) holder.innerHTML = '';

        app = new PIXI.Application({
            width: 360,
            height: 640,
            backgroundColor: 0x0a0a1e,
            transparent: false,
            antialias: true,
            forceCanvas: false
        });
        
        const viewElement = app.view || app.canvas;
        
        if (holder && viewElement && !holder.contains(viewElement)) {
            holder.appendChild(viewElement);
        }
        
        container = new PIXI.Container();
        app.stage.addChild(container);
        
        particles = [];
        for (let i = 0; i < 100; i++) {
            const particle = new PIXI.Graphics();
            particle.beginFill(Math.random() * 0xFFFFFF); 
            particle.drawCircle(0, 0, Math.random() * 3 + 2); 
            particle.endFill();
            
            particle.x = Math.random() * 360;
            particle.y = Math.random() * 640;
            particle.vx = (Math.random() - 0.5) * 2;
            particle.vy = (Math.random() - 0.5) * 2;
            
            particles.push(particle);
            container.addChild(particle);
        }
        
        console.log("[Pixi.js] Setup complete, particles:", particles.length);
        p5Looping = true;
        _genericAnimationLoop(code, PIXI, 'pixi');
    } catch (error) {
        console.error("[Pixi.js] Setup error:", error);
        showStatus('codeStatus', `Pixi.js setup hatası: ${error.message}`, 'error');
        p5Looping = false;
    }
}

function startWebGLAnimation(code) {
    console.log("[startWebGLAnimation] Başlatılıyor...");
    
    try {
        const holder = document.getElementById('sketch-holder');
        if (holder) holder.innerHTML = '';
        
        canvas = document.createElement('canvas');
        if (holder) holder.appendChild(canvas);
        
        canvas.width = 360;
        canvas.height = 640;
        
        gl = canvas.getContext('webgl', { antialias: true }) || canvas.getContext('experimental-webgl', { antialias: true });
        
        if (!gl) {
            console.error('WebGL desteklenmiyor');
            p5Looping = false; 
            throw new Error('WebGL desteklenmiyor veya experimental-webgl context oluşturulamadı.');
        }
        
        // Shader setup
        const vertexShaderSource = `
            attribute vec2 a_position;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;
        
        const fragmentShaderSource = `
            precision mediump float;
            uniform float u_time;
            uniform vec2 u_resolution;
            
            vec3 hsv2rgb(vec3 c) {
                vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
                vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
                return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
            }

            void main() {
                vec2 st = gl_FragCoord.xy / u_resolution.xy;
                vec3 color = vec3(0.0);
                float time = u_time * 0.5;
                vec2 pos = st - vec2(0.5);
                float r = length(pos) * 2.0;
                float a = atan(pos.y, pos.x);
                float f = cos(a * 3.);
                f = mix(f, cos(a*10.), smoothstep(.0,1.,abs(sin(time)) ));
                f = mix(f, cos(a*20.+time*2.), pow(length(pos),.5));
                vec3 hsv = vec3( a/ (2.*3.14159265) + 0.5 + time*0.1, abs(f), pow(r, abs(f)) );
                color = hsv2rgb(hsv);
                gl_FragColor = vec4(color, 1.0);
            }
        `;
        
        function createShader(glContext, type, source) {
            const shader = glContext.createShader(type);
            glContext.shaderSource(shader, source);
            glContext.compileShader(shader);
            if (!glContext.getShaderParameter(shader, glContext.COMPILE_STATUS)) {
                console.error('Shader compilation error:', glContext.getShaderInfoLog(shader));
                glContext.deleteShader(shader);
                return null;
            }
            return shader;
        }
        
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        
        if (!vertexShader || !fragmentShader) {
            console.error('WebGL Shader oluşturulamadı.');
            p5Looping = false;
            throw new Error('WebGL Shader oluşturulamadı (vertex veya fragment).');
        }
        
        program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('WebGL Program linking error:', gl.getProgramInfoLog(program));
            p5Looping = false;
            throw new Error('WebGL Program linking hatası.');
        }
        
        const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]; 
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        
        const positionLocation = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        
        timeLocation = gl.getUniformLocation(program, 'u_time');
        resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
        
        console.log("[WebGL] Setup complete, program:", !!program);
        p5Looping = true;
        _genericAnimationLoop(code, null, 'webgl');
    } catch (error) {
        console.error("[WebGL] Setup error:", error);
        showStatus('codeStatus', `WebGL setup hatası: ${error.message}`, 'error');
        p5Looping = false;
    }
}

function startCanvas2DAnimation(code) {
    console.log("[startCanvas2DAnimation] Başlatılıyor...");
    
    try {
        const holder = document.getElementById('sketch-holder');
        if (holder) holder.innerHTML = '';

        canvas = document.createElement('canvas');
        if (holder) holder.appendChild(canvas);

        canvas.width = 360;
        canvas.height = 640;
        ctx = canvas.getContext('2d');
        
        if (!ctx) {
            throw new Error('Canvas 2D context oluşturulamadı');
        }
        
        console.log("[Canvas2D] Setup complete");
        p5Looping = true;
        _genericAnimationLoop(code, null, 'canvas2d');
    } catch (error) {
        console.error("[Canvas2D] Setup error:", error);
        showStatus('codeStatus', `Canvas2D setup hatası: ${error.message}`, 'error');
        p5Looping = false;
    }
}

function stopAnimation(showMsg = true) {
    console.log("[stopAnimation] Animasyon durduruluyor.");
    
    if (currentLibrary !== 'p5js') { 
        p5Looping = false; 
    }

    if (animationFrameId) { 
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        console.log("[stopAnimation] requestAnimationFrame iptal edildi.");
    }

    if (currentSketch && currentLibrary === 'p5js') { 
        if (typeof currentSketch.isLooping === 'function' && currentSketch.isLooping()) {
            currentSketch.noLoop();
            console.log("[stopAnimation] p5.js noLoop() çağrıldı.");
        }
        if (showMsg) showStatus('codeStatus', '⏹️ p5.js animasyonu durduruldu.', 'success');
    } else if (currentLibrary !== 'p5js' && showMsg) { 
        showStatus('codeStatus', '⏹️ Animasyon durduruldu.', 'success');
    }
    
    if (isRecordingAnimation && animationRecorder && animationRecorder.state === 'recording') {
        console.log("[stopAnimation] Devam eden video kaydı durduruluyor.");
        try { animationRecorder.stop(); } catch(e) { console.warn("Kaydediciyi durdururken hata:", e); }
    }
    
    updateButtonStates(); 
}


let animationRecorder; 

// Tüm kütüphaneler için video kaydı fonksiyonu
async function saveAnimationVideo() {
    if (!codeInputElement || !durationInputElement || !fpsInputElement) return;

    const codeForRecording = codeInputElement.value.trim();
    if (!codeForRecording) {
        showStatus('codeStatus', 'Kaydedilecek animasyon kodu bulunamadı.', 'error');
        return;
    }
    if (isRecordingAnimation) {
        showStatus('codeStatus', 'Animasyon videosu zaten kaydediliyor...', 'error');
        return;
    }

    saveCurrentConfig("animation"); 

    const duration = parseInt(durationInputElement.value);
    const fps = parseInt(fpsInputElement.value);

    isRecordingAnimation = true;
    updateButtonStates();
    if(saveAnimationVideoBtnElement) saveAnimationVideoBtnElement.textContent = '💾 Kaydediliyor...';
    showStatus('codeStatus', `${getLibraryDisplayName(currentLibrary)} animasyon videosu kaydediliyor (${duration}s, ${fps}fps)...`, 'progress');
    updateProgress(5); 
    resetAnimationPreview();

    // Var olan canlı animasyonu durdur
    stopAnimation(false);
    clearCanvas();

    try {
        if (currentLibrary === 'p5js') {
            await startRecordingP5Animation(codeForRecording, duration, fps);
        } else {
            await startRecordingGenericAnimation(codeForRecording, duration, fps, currentLibrary);
        }
        updateProgress(100);
    } catch (error) {
        showStatus('codeStatus', `Video kaydı hatası: ${error.message}`, 'error');
        console.error("Video recording error:", error);
        isRecordingAnimation = false;
        if(saveAnimationVideoBtnElement) saveAnimationVideoBtnElement.textContent = '💾 Animasyon Videosunu Kaydet';
        updateButtonStates();
        updateProgress(0);
        resetAnimationPreview(); 
    }
}

// p5.js için video kayıt fonksiyonu
async function startRecordingP5Animation(code, duration, fps) {
    let internalTimeCounter = 0; 
    let tempRecordingSketch = null;
    
    return new Promise((resolve, reject) => {
        tempRecordingSketch = new p5((p_rec_instance) => {
            const p5globalsRec = {
                createCanvas: (...args) => p_rec_instance.createCanvas(...args),
                background: (...args) => p_rec_instance.background(...args),
                stroke: (...args) => p_rec_instance.stroke(...args),
                fill: (...args) => p_rec_instance.fill(...args),
                point: (...args) => p_rec_instance.point(...args),
                line: (...args) => p_rec_instance.line(...args),
                circle: (...args) => p_rec_instance.circle(...args),
                rect: (...args) => p_rec_instance.rect(...args),
                ellipse: (...args) => p_rec_instance.ellipse(...args),
                triangle: (...args) => p_rec_instance.triangle(...args),
                text: (...args) => p_rec_instance.text(...args),
                textSize: (...args) => p_rec_instance.textSize(...args),
                textAlign: (...args) => p_rec_instance.textAlign(...args),
                push: () => p_rec_instance.push(),
                pop: () => p_rec_instance.pop(),
                translate: (...args) => p_rec_instance.translate(...args),
                rotate: (...args) => p_rec_instance.rotate(...args),
                scale: (...args) => p_rec_instance.scale(...args),
                noStroke: () => p_rec_instance.noStroke(),
                noFill: () => p_rec_instance.noFill(),
                strokeWeight: (...args) => p_rec_instance.strokeWeight(...args),
                cos: Math.cos, sin: Math.sin, tan: Math.tan,
                acos: Math.acos, asin: Math.asin, atan: Math.atan, atan2: Math.atan2,
                sqrt: Math.sqrt, pow: Math.pow, abs: Math.abs,
                min: Math.min, max: Math.max, floor: Math.floor,
                ceil: Math.ceil, round: Math.round,
                random: (...args) => p_rec_instance.random(...args),
                map: (...args) => p_rec_instance.map(...args),
                lerp: (...args) => p_rec_instance.lerp(...args),
                dist: (...args) => p_rec_instance.dist(...args),
                mag: (...args) => p_rec_instance.mag(...args),
                PI: Math.PI, TWO_PI: 2 * Math.PI, HALF_PI: Math.PI / 2, QUARTER_PI: Math.PI / 4,
                color: (...args) => p_rec_instance.color(...args),
                alpha: (...args) => p_rec_instance.alpha(...args),
                red: (...args) => p_rec_instance.red(...args),
                green: (...args) => p_rec_instance.green(...args),
                blue: (...args) => p_rec_instance.blue(...args),
                hue: (...args) => p_rec_instance.hue(...args),
                saturation: (...args) => p_rec_instance.saturation(...args),
                brightness: (...args) => p_rec_instance.brightness(...args),
                lerpColor: (...args) => p_rec_instance.lerpColor(...args),
                get width() { return p_rec_instance.width; },
                get height() { return p_rec_instance.height; },
                get mouseX() { return 0; }, 
                get mouseY() { return 0; }, 
                get pmouseX() { return 0; },
                get pmouseY() { return 0; },
                get mouseIsPressed() { return false; }, 
                get keyIsPressed() { return false; },   
                get keyCode() { return 0; },
                get key() { return ''; },
                get frameCount() { return p_rec_instance.frameCount; },
                get t() { return internalTimeCounter; },
                set t(val) { internalTimeCounter = val; }
            };

            let frameCounter = 0;
            const maxFrames = duration * fps;
            let p5CanvasForRecording;
            
            p_rec_instance.setup = function() {
                try {
                    // Gizli container oluştur
                    let hiddenContainer = document.getElementById('hidden-recording-container');
                    if (!hiddenContainer) {
                        hiddenContainer = document.createElement('div');
                        hiddenContainer.id = 'hidden-recording-container';
                        hiddenContainer.style.position = 'absolute';
                        hiddenContainer.style.top = '-9999px';
                        hiddenContainer.style.left = '-9999px';
                        hiddenContainer.style.visibility = 'hidden';
                        hiddenContainer.style.pointerEvents = 'none';
                        hiddenContainer.style.width = '0px';
                        hiddenContainer.style.height = '0px';
                        hiddenContainer.style.overflow = 'hidden';
                        document.body.appendChild(hiddenContainer);
                    }
                    
                    p5CanvasForRecording = p_rec_instance.createCanvas(360, 640);
                    p_rec_instance.frameRate(fps);
                    internalTimeCounter = 0; 
                    
                    // Canvas'ı gizli container'a taşı
                    if (p5CanvasForRecording && p5CanvasForRecording.elt) {
                        hiddenContainer.appendChild(p5CanvasForRecording.elt);
                    }
                    
                    setTimeout(() => {
                        if (p5CanvasForRecording && p5CanvasForRecording.elt) {
                            startVideoRecording(duration, fps, p5CanvasForRecording.elt, (success) => {
                                if (tempRecordingSketch) { 
                                    try { tempRecordingSketch.remove(); } catch(e) {}
                                    tempRecordingSketch = null; 
                                }
                                
                                // Gizli container'ı temizle
                                const containerToRemove = document.getElementById('hidden-recording-container');
                                if (containerToRemove && containerToRemove.parentNode) {
                                    containerToRemove.parentNode.removeChild(containerToRemove);
                                }
                                
                                isRecordingAnimation = false; 
                                if(saveAnimationVideoBtnElement) saveAnimationVideoBtnElement.textContent = '💾 Animasyon Videosunu Kaydet';
                                updateButtonStates();
                                if(success) { updateAnimationPreviewUI(); resolve(); } 
                                else { reject(new Error('Video kaydı oluşturulamadı.')); }
                            });
                        } else {
                            isRecordingAnimation = false;
                            if(saveAnimationVideoBtnElement) saveAnimationVideoBtnElement.textContent = '💾 Animasyon Videosunu Kaydet';
                            updateButtonStates();
                            reject(new Error('Kayıt için p5.js canvas.elt bulunamadı.'));
                        }
                    }, 100); 
                } catch (setupErrorRec) {
                    isRecordingAnimation = false;
                    if(saveAnimationVideoBtnElement) saveAnimationVideoBtnElement.textContent = '💾 Animasyon Videosunu Kaydet';
                    updateButtonStates();
                    reject(new Error(`p5.js kayıt setup hatası: ${setupErrorRec.message}`));
                }
            };

            p_rec_instance.draw = function() {
                try {
                    p5globalsRec.t = internalTimeCounter;
                    
                    const codeWithContext = `
                        let t = ${internalTimeCounter};
                        ${code}
                        window.p5_recording_t = t;
                    `;
                    
                    const originalValues = {};
                    Object.keys(p5globalsRec).forEach(key => {
                        if (key !== 't') {
                            originalValues[key] = window[key];
                            window[key] = p5globalsRec[key];
                        }
                    });
                    
                    eval(codeWithContext);
                    
                    Object.keys(p5globalsRec).forEach(key => {
                        if (key !== 't') {
                            if (originalValues[key] !== undefined) {
                                window[key] = originalValues[key];
                            } else {
                                delete window[key];
                            }
                        }
                    });
                    
                    if (typeof window.p5_recording_t !== 'undefined') {
                        internalTimeCounter = window.p5_recording_t;
                        delete window.p5_recording_t;
                    }
                    
                    frameCounter++;
                    updateProgress(5 + (frameCounter / maxFrames) * 85); 

                    if (frameCounter >= maxFrames) {
                        p_rec_instance.noLoop(); 
                    }
                } catch (errorRec) {
                    p_rec_instance.noLoop();
                    if (animationRecorder && animationRecorder.state === "recording") {
                        try { animationRecorder.stop(); } catch(e) { console.warn("Kaydediciyi durdururken hata (draw error rec):", e); }
                    }
                    showStatus('codeStatus', `p5.js kayıt draw hatası: ${errorRec.message}`, 'error');
                }
            };
        });
        
        if (!tempRecordingSketch) {
            reject(new Error("p5.js kayıt instance'ı oluşturulamadı."));
        }
    });
}

// Diğer kütüphaneler için video kayıt fonksiyonu
async function startRecordingGenericAnimation(code, duration, fps, libraryName) {
    return new Promise((resolve, reject) => {
        // Kayıt için canvas oluştur
        const recordingCanvas = document.createElement('canvas');
        recordingCanvas.width = 360;
        recordingCanvas.height = 640;
        recordingCanvas.style.position = 'absolute';
        recordingCanvas.style.top = '-9999px'; // Gizle
        document.body.appendChild(recordingCanvas);

        let recordingTimeCounter = 0;
        let frameCounter = 0;
        const maxFrames = duration * fps;
        let recordingAnimationFrameId = null;
        let recordingStarted = false;

        // Kütüphane spesifik değişkenleri kayıt için hazırla
        let recordingScene, recordingCamera, recordingRenderer, recordingMesh;
        let recordingApp, recordingContainer, recordingParticles;
        let recordingGl, recordingProgram, recordingTimeLocation, recordingResolutionLocation;
        let recordingCtx;

        const startRecordingLoop = () => {
            if (!recordingStarted) return;
            
            try {
                // Global değişkenleri kayıt environment'ına ayarla
                if (libraryName === 'threejs') {
                    scene = recordingScene;
                    camera = recordingCamera;
                    renderer = recordingRenderer;
                    mesh = recordingMesh;
                    window.THREE = THREE;
                } else if (libraryName === 'pixijs') {
                    app = recordingApp;
                    container = recordingContainer;
                    particles = recordingParticles;
                    window.PIXI = PIXI;
                } else if (libraryName === 'webgl') {
                    canvas = recordingCanvas;
                    gl = recordingGl;
                    program = recordingProgram;
                    timeLocation = recordingTimeLocation;
                    resolutionLocation = recordingResolutionLocation;
                } else if (libraryName === 'canvas2d') {
                    canvas = recordingCanvas;
                    ctx = recordingCtx;
                }

                // t değişkenini düzgün yönet
                let t = recordingTimeCounter;
                window.t = t;
                
                // User code'u eval ile çalıştır
                eval(code);
                
                // t değişkeninin değişimini yakala
                if (typeof window.t !== 'undefined' && window.t !== recordingTimeCounter) {
                    recordingTimeCounter = window.t;
                } else if (typeof t !== 'undefined' && t !== recordingTimeCounter) {
                    recordingTimeCounter = t;
                    window.t = t;
                }
                
                frameCounter++;
                
                // Debug: Her 60 frame'de bir log (daha az spam için)
                if (frameCounter % 60 === 0) {
                    console.log(`[${libraryName}] Recording frame: ${frameCounter}/${maxFrames}, t: ${recordingTimeCounter.toFixed(2)}`);
                }
                
                updateProgress(5 + (frameCounter / maxFrames) * 85);

                if (frameCounter >= maxFrames) {
                    // Kayıt tamamlandı
                    console.log(`[${libraryName}] Recording finished, total frames: ${frameCounter}`);
                    finishRecording();
                } else {
                    recordingAnimationFrameId = setTimeout(startRecordingLoop, 1000 / fps);
                }
            } catch (error) {
                console.error(`[${libraryName}] Recording loop error:`, error);
                finishRecording();
                reject(new Error(`Kayıt sırasında hata: ${error.message}`));
            }
        };

        const finishRecording = () => {
            recordingStarted = false;
            if (recordingAnimationFrameId) {
                clearTimeout(recordingAnimationFrameId);
                recordingAnimationFrameId = null;
            }

            if (animationRecorder && animationRecorder.state === 'recording') {
                try { 
                    console.log("[finishRecording] Stopping MediaRecorder...");
                    animationRecorder.stop(); 
                } catch (e) { 
                    console.warn("Recording stop error:", e); 
                }
            }

            // Temizlik
            if (recordingRenderer) {
                try { recordingRenderer.dispose(); } catch (e) { console.warn("Renderer dispose error:", e); }
                recordingRenderer = null;
            }
            if (recordingApp) {
                try { 
                    recordingApp.destroy(true, { 
                        children: true, 
                        texture: true, 
                        baseTexture: true 
                    }); 
                } catch (e) { 
                    console.warn("PIXI app destroy error:", e);
                }
                recordingApp = null;
            }
            
            // Canvas'ı güvenli şekilde kaldır
            setTimeout(() => {
                try {
                    if (recordingCanvas && recordingCanvas.parentNode) {
                        recordingCanvas.parentNode.removeChild(recordingCanvas);
                    }
                } catch (e) {
                    console.warn("Canvas removeChild error:", e);
                }
            }, 1000);
            
            isRecordingAnimation = false;
            if (saveAnimationVideoBtnElement) saveAnimationVideoBtnElement.textContent = '💾 Animasyon Videosunu Kaydet';
            updateButtonStates();
        };

        // Kütüphane spesifik initialization
        try {
            if (libraryName === 'threejs') {
                // Three.js setup for recording
                recordingScene = new THREE.Scene();
                recordingCamera = new THREE.PerspectiveCamera(75, 360 / 640, 0.1, 1000);
                recordingRenderer = new THREE.WebGLRenderer({ canvas: recordingCanvas, antialias: true });
                recordingRenderer.setSize(360, 640);
                recordingRenderer.setClearColor(0x0a0a1e, 1);
                
                // Mesh ve lighting setup (template'deki gibi)
                const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
                const material = new THREE.MeshPhongMaterial({ 
                    color: 0x64c8ff,
                    shininess: 100,
                    transparent: true,
                    opacity: 0.8
                });
                recordingMesh = new THREE.Mesh(geometry, material);
                recordingScene.add(recordingMesh);
                
                const light = new THREE.PointLight(0xffffff, 1, 100);
                light.position.set(0, 0, 10);
                recordingScene.add(light);
                
                const ambientLight = new THREE.AmbientLight(0x404040, 0.7);
                recordingScene.add(ambientLight);
                
                recordingCamera.position.z = 5;
                
                console.log("[Three.js Recording] Setup complete, mesh:", !!recordingMesh);
            } else if (libraryName === 'pixijs') {
                // Pixi.js setup for recording
                recordingApp = new PIXI.Application({
                    view: recordingCanvas,
                    width: 360,
                    height: 640,
                    backgroundColor: 0x0a0a1e,
                    antialias: true,
                    forceCanvas: false
                });
                recordingContainer = new PIXI.Container();
                recordingApp.stage.addChild(recordingContainer);
                
                // Particle setup (template'den kopyalandı)
                recordingParticles = [];
                for (let i = 0; i < 100; i++) {
                    const particle = new PIXI.Graphics();
                    particle.beginFill(Math.random() * 0xFFFFFF);
                    particle.drawCircle(0, 0, Math.random() * 3 + 2);
                    particle.endFill();
                    
                    particle.x = Math.random() * 360;
                    particle.y = Math.random() * 640;
                    particle.vx = (Math.random() - 0.5) * 2;
                    particle.vy = (Math.random() - 0.5) * 2;
                    
                    recordingParticles.push(particle);
                    recordingContainer.addChild(particle);
                }
                
                console.log("[Pixi.js Recording] Setup complete, particles:", recordingParticles.length);
            } else if (libraryName === 'webgl') {
                // WebGL setup for recording
                recordingGl = recordingCanvas.getContext('webgl') || recordingCanvas.getContext('experimental-webgl');
                if (!recordingGl) {
                    throw new Error('WebGL context oluşturulamadı');
                }
                
                // Shader setup (template'den kopyalandı)
                const vertexShaderSource = `
                    attribute vec2 a_position;
                    void main() {
                        gl_Position = vec4(a_position, 0.0, 1.0);
                    }
                `;
                
                const fragmentShaderSource = `
                    precision mediump float;
                    uniform float u_time;
                    uniform vec2 u_resolution;
                    
                    vec3 hsv2rgb(vec3 c) {
                        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
                        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
                        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
                    }

                    void main() {
                        vec2 st = gl_FragCoord.xy / u_resolution.xy;
                        vec3 color = vec3(0.0);
                        float time = u_time * 0.5;
                        vec2 pos = st - vec2(0.5);
                        float r = length(pos) * 2.0;
                        float a = atan(pos.y, pos.x);
                        float f = cos(a * 3.);
                        f = mix(f, cos(a*10.), smoothstep(.0,1.,abs(sin(time)) ));
                        f = mix(f, cos(a*20.+time*2.), pow(length(pos),.5));
                        vec3 hsv = vec3( a/ (2.*3.14159265) + 0.5 + time*0.1, abs(f), pow(r, abs(f)) );
                        color = hsv2rgb(hsv);
                        gl_FragColor = vec4(color, 1.0);
                    }
                `;
                
                function createShader(glContext, type, source) {
                    const shader = glContext.createShader(type);
                    glContext.shaderSource(shader, source);
                    glContext.compileShader(shader);
                    if (!glContext.getShaderParameter(shader, glContext.COMPILE_STATUS)) {
                        console.error('Shader compilation error:', glContext.getShaderInfoLog(shader));
                        glContext.deleteShader(shader);
                        return null;
                    }
                    return shader;
                }
                
                const vertexShader = createShader(recordingGl, recordingGl.VERTEX_SHADER, vertexShaderSource);
                const fragmentShader = createShader(recordingGl, recordingGl.FRAGMENT_SHADER, fragmentShaderSource);
                
                if (!vertexShader || !fragmentShader) {
                    throw new Error('WebGL Shader oluşturulamadı');
                }
                
                recordingProgram = recordingGl.createProgram();
                recordingGl.attachShader(recordingProgram, vertexShader);
                recordingGl.attachShader(recordingProgram, fragmentShader);
                recordingGl.linkProgram(recordingProgram);
                
                if (!recordingGl.getProgramParameter(recordingProgram, recordingGl.LINK_STATUS)) {
                    throw new Error('WebGL Program linking hatası');
                }
                
                const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
                const positionBuffer = recordingGl.createBuffer();
                recordingGl.bindBuffer(recordingGl.ARRAY_BUFFER, positionBuffer);
                recordingGl.bufferData(recordingGl.ARRAY_BUFFER, new Float32Array(positions), recordingGl.STATIC_DRAW);
                
                const positionLocation = recordingGl.getAttribLocation(recordingProgram, 'a_position');
                recordingGl.enableVertexAttribArray(positionLocation);
                recordingGl.vertexAttribPointer(positionLocation, 2, recordingGl.FLOAT, false, 0, 0);
                
                recordingTimeLocation = recordingGl.getUniformLocation(recordingProgram, 'u_time');
                recordingResolutionLocation = recordingGl.getUniformLocation(recordingProgram, 'u_resolution');
                
                console.log("[WebGL Recording] Setup complete, program:", !!recordingProgram);
            } else if (libraryName === 'canvas2d') {
                // Canvas 2D setup for recording
                recordingCtx = recordingCanvas.getContext('2d');
            }

            // Video recorder'ı başlat
            console.log("[startRecordingGenericAnimation] Starting video recording...");
            startVideoRecording(duration, fps, recordingCanvas, (success) => {
                console.log("[startRecordingGenericAnimation] Video recording finished, success:", success);
                finishRecording();
                if (success) {
                    updateAnimationPreviewUI();
                    resolve();
                } else {
                    reject(new Error('Video kaydı oluşturulamadı.'));
                }
            });

            // Recording başlatıldığını işaretle ve loop'u başlat
            recordingStarted = true;
            setTimeout(startRecordingLoop, 200);

        } catch (error) {
            finishRecording();
            reject(new Error(`${libraryName} recording initialization error: ${error.message}`));
        }
    });
}

async function startVideoRecording(duration, fps, htmlCanvasElement, onStopCallback) {
    if (!htmlCanvasElement || !(htmlCanvasElement instanceof HTMLCanvasElement)) {
        showStatus('codeStatus', 'Kayıt için geçerli bir HTML Canvas bulunamadı!', 'error');
        if (onStopCallback) onStopCallback(false);
        return;
    }
    
    const supportedTypes = getSupportedMimeTypes();
    if (supportedTypes.length === 0) {
        showStatus('codeStatus', 'Tarayıcınız MediaRecorder için desteklenen MIME türü bulamadı!', 'error');
        if (onStopCallback) onStopCallback(false);
        return;
    }
    
    let selectedType = supportedTypes.find(type => type.includes('mp4')) || 
                       supportedTypes.find(type => type.includes('webm')) || 
                       supportedTypes[0];

    console.log("[startVideoRecording] Selected MIME type:", selectedType);

    if (typeof htmlCanvasElement.captureStream !== 'function') {
        showStatus('codeStatus', 'Tarayıcınız canvas.captureStream() API\'sini desteklemiyor!', 'error');
        if (onStopCallback) onStopCallback(false);
        return;
    }
    
    let videoStream;
    try { 
        videoStream = htmlCanvasElement.captureStream(fps);
        console.log("[startVideoRecording] Canvas stream captured, fps:", fps);
    } 
    catch (e) { 
        showStatus('codeStatus', `Canvas stream yakalama hatası: ${e.message}`, 'error'); 
        if (onStopCallback) onStopCallback(false); 
        return; 
    }

    if (!videoStream || videoStream.getVideoTracks().length === 0) {
        showStatus('codeStatus', 'Canvas stream oluşturulamadı veya video track içermiyor.', 'error');
        if (onStopCallback) onStopCallback(false); 
        return;
    }
    
    console.log("[startVideoRecording] Video tracks:", videoStream.getVideoTracks().length);
    
    try {
        animationRecorder = new MediaRecorder(videoStream, { 
            mimeType: selectedType, 
            videoBitsPerSecond: 2500000 
        });
        console.log("[startVideoRecording] MediaRecorder created");
    } catch (e) { 
        showStatus('codeStatus', `MediaRecorder oluşturma hatası: ${e.message}. MIME: ${selectedType}`, 'error'); 
        if (onStopCallback) onStopCallback(false); 
        return; 
    }

    const chunks = [];
    let recordingFinished = false;
    
    animationRecorder.ondataavailable = (e) => { 
        if (e.data && e.data.size > 0) { 
            console.log("[startVideoRecording] Data chunk received, size:", e.data.size);
            chunks.push(e.data); 
        } else {
            console.warn("[startVideoRecording] Empty data chunk received");
        }
    };
    
    animationRecorder.onstop = () => {
        if (recordingFinished) return; // Prevent double execution
        recordingFinished = true;
        
        console.log("[startVideoRecording] MediaRecorder stopped, chunks:", chunks.length);
        
        if (chunks.length > 0) {
            const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
            console.log("[startVideoRecording] Total data size:", totalSize, "bytes");
            
            if (totalSize > 0) {
                cachedVideoBlob = new Blob(chunks, { type: selectedType });
                console.log("[startVideoRecording] Video blob created successfully, size:", cachedVideoBlob.size);
                if (onStopCallback) onStopCallback(true);
            } else {
                console.error("[startVideoRecording] Total data size is 0");
                cachedVideoBlob = null;
                showStatus('codeStatus', 'Video kaydı boş sonuç verdi (0 bytes).', 'error');
                if (onStopCallback) onStopCallback(false);
            }
        } else {
            console.error("[startVideoRecording] No chunks received");
            cachedVideoBlob = null;
            showStatus('codeStatus', 'Video kaydı hiç veri alamadı.', 'error');
            if (onStopCallback) onStopCallback(false); 
        }
        
        videoStream.getTracks().forEach(track => {
            console.log("[startVideoRecording] Stopping track:", track.kind);
            track.stop();
        });
    };
    
    animationRecorder.onerror = (e) => {
        if (recordingFinished) return;
        recordingFinished = true;
        
        console.error("[startVideoRecording] MediaRecorder error:", e);
        showStatus('codeStatus', `Video kayıt sırasında hata: ${e.error ? e.error.name : 'Bilinmeyen'}`, 'error');
        if (onStopCallback) onStopCallback(false);
        videoStream.getTracks().forEach(track => track.stop());
    };
    
    try { 
        animationRecorder.start(100); // Request data every 100ms
        console.log("[startVideoRecording] MediaRecorder started, state:", animationRecorder.state);
    } 
    catch (e) { 
        showStatus('codeStatus', `Video kaydı başlatılamadı: ${e.message}`, 'error'); 
        if (onStopCallback) onStopCallback(false); 
        return; 
    }

    // Safety timeout - stop recording after duration + buffer
    setTimeout(() => {
        if (animationRecorder && animationRecorder.state === 'recording') { 
            console.log("[startVideoRecording] Stopping recording due to timeout");
            try { 
                animationRecorder.stop(); 
            } catch(err) { 
                console.warn("Kaydediciyi zaman aşımıyla durdururken hata:", err); 
            }
        }
    }, duration * 1000 + 1000); // 1 extra second buffer
}

let musicAudioRecorder; 
async function generateAndPlayMusic() {
    if (typeof Tone === 'undefined' || !durationInputElement || !styleSelectElement || !scaleSelectElement || !tempoSliderElement || !reverbSliderElement) { 
        showStatus('musicStatus', 'Müzik için gerekli elemanlar veya Tone.js yüklenemedi!', 'error'); 
        return; 
    }
    const newMusicHash = getCurrentMusicSettingsHash();
    const durationVal = durationInputElement ? parseInt(durationInputElement.value) : 10;
    const durationChanged = currentMusic && currentMusic.duration !== durationVal;


    if (currentMusic && lastMusicSettingsHash === newMusicHash && !durationChanged && arguments[0] !== true) {
        if (Tone && Tone.Transport && Tone.Transport.state === 'started') {
             showStatus('musicStatus', '🎶 Müzik zaten çalıyor...', 'progress');
             return;
        }
    }
    if (currentMusic) stopMusic(false); 
    
    try {
        if (Tone.context.state !== 'running') await Tone.start();
        const style = styleSelectElement.value;
        const scaleKey = scaleSelectElement.value;
        const tempo = parseInt(tempoSliderElement.value);
        const reverbAmount = parseInt(reverbSliderElement.value) / 100;
        const currentTrackDuration = durationVal; 

        if (audioDestination && audioDestination.stream) {
             audioDestination.stream.getTracks().forEach(track => track.stop());
        }
        audioDestination = Tone.context.createMediaStreamDestination();
        let reverbDecay = 2; 
        if (style === 'meditation_drone' || style === 'calming_pad') reverbDecay = 5;
        else if (style === 'lofi_chill') reverbDecay = 3;
        const reverb = new Tone.Reverb({ decay: reverbDecay, wet: reverbAmount }).toDestination();
        reverb.connect(audioDestination); 

        let synth;
        let mainPatternSettings = { probability: 0.15, durationOptions: ['4n', '8n'], subdivision: '16n', numSteps: 16, velocityRange: [0.3, 0.7] };
        let bassPatternSettings = { probability: 0.2, noteIndexMax: 4, conditions: (step) => (step % 4 === 0 || step % 4 === 2), duration: '2n', subdivision: '16n', numSteps: 16, velocity: 0.4 };
        let loopDuration = '4m'; 
        switch (style) {
            case 'ambient': synth = new Tone.PolySynth(Tone.AMSynth, { harmonicity: 1.5, envelope: {attack: 1, release: 2} }).connect(reverb); break;
            case 'electronic': synth = new Tone.PolySynth(Tone.FMSynth, {modulationIndex: 5, harmonicity: 1.2}).connect(reverb); break;
            case 'cinematic': synth = new Tone.PolySynth(Tone.Synth, { oscillator: {type: "pulse", width: 0.3}, envelope: { attack: 0.5, decay: 0.2, sustain: 0.8, release: 1.5 }}).connect(reverb); break;
            case 'minimal':
                synth = new Tone.PolySynth(Tone.MonoSynth, { oscillator: {type: "square"}, envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.3 }}).connect(reverb);
                mainPatternSettings = { probability: 0.4, durationOptions: ['16n', '8t'], subdivision: '16n', numSteps: 16, velocityRange: [0.2, 0.5] };
                bassPatternSettings = { probability: 0.5, noteIndexMax: 2, conditions: (step) => (step % 8 === 0 || step % 8 === 5 ), duration: '4n', subdivision: '16n', numSteps: 16, velocity: 0.3 };
                break;
            case 'dreamy':
                synth = new Tone.PolySynth(Tone.AMSynth, { harmonicity: 3, envelope: { attack: 1, decay: 0.5, sustain: 0.7, release: 2 }, portamento: 0.05 }).connect(reverb);
                mainPatternSettings = { probability: 0.2, durationOptions: ['2n', '1n.', '1m'], subdivision: '8n', numSteps: 8, velocityRange: [0.2, 0.6] };
                bassPatternSettings = { probability: 0.3, noteIndexMax: 3, conditions: (step) => (step % 4 === 0), duration: '1n', subdivision: '8n', numSteps: 8, velocity: 0.3 };
                break;
            case 'calming_pad':
                synth = new Tone.PolySynth(Tone.AMSynth, { harmonicity: 1.2, envelope: { attack: 3, decay: 1, sustain: 0.9, release: 4 }, portamento: 0.1 }).connect(reverb);
                mainPatternSettings = { probability: 0.6, durationOptions: ['1m', '2n', '4n'], subdivision: '1m', numSteps: 2, velocityRange: [0.1, 0.4] };
                bassPatternSettings = { probability: 0.7, noteIndexMax: 1, conditions: (step) => (step % 1 === 0), duration: '1m', subdivision: '1m', numSteps: 1, velocity: 0.2 };
                loopDuration = '2m'; break;
            case 'meditation_drone':
                synth = new Tone.MonoSynth({ oscillator: { type: "sine" }, envelope: { attack: 5, decay: 2, sustain: 1, release: 6 }, filterEnvelope: { attack: 4, baseFrequency: 100, octaves: 3, decay:1, release:5}, volume: -6 }).connect(reverb);
                mainPatternSettings = { probability: 1, durationOptions: ['1m'], subdivision: '1m', numSteps: 1, velocityRange: [0.2, 0.3], singleNote: true };
                bassPatternSettings = null; loopDuration = '1m'; break;
            case 'lofi_chill':
                const lofiFilter = new Tone.Filter(1200, "lowpass").connect(reverb);
                const distortion = new Tone.Distortion(0.05).connect(lofiFilter); 
                synth = new Tone.PolySynth(Tone.FMSynth, { harmonicity: 0.8, modulationIndex: 3, envelope: { attack: 0.02, decay: 0.4, sustain: 0.05, release: 0.7 }, detune: -5 }).connect(distortion);
                mainPatternSettings = { probability: 0.3, durationOptions: ['8n', '4n.', '16t'], subdivision: '16n', numSteps: 16, velocityRange: [0.3, 0.6] };
                bassPatternSettings = { probability: 0.4, noteIndexMax: 3, conditions: (step) => [0, 3, 6, 7, 10, 11, 14].includes(step % 16), duration: '8n', subdivision: '16n', numSteps: 16, velocity: 0.5 };
                break;
            default: synth = new Tone.PolySynth().connect(reverb);
        }
        const scales = {
            minor: ['A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'C5', 'D5', 'E5'], 
            major: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'G5'],
            pentatonic: ['A3', 'C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5'],
            pentatonic_major: ['C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5'],
            dorian: ['D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5'],
            lydian: ['F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4']
        };
        const notes = scales[scaleKey] || scales.minor; 
        const bassNotes = notes.map(note => Tone.Frequency(note).transpose(-12).toNote());
        const sequence = new Tone.Sequence((time, step) => {
            if (mainPatternSettings.singleNote || Math.random() < mainPatternSettings.probability) {
                const note = mainPatternSettings.singleNote ? notes[0] : notes[Math.floor(Math.random() * notes.length)];
                const dur = mainPatternSettings.durationOptions[Math.floor(Math.random() * mainPatternSettings.durationOptions.length)];
                const velocity = mainPatternSettings.velocityRange[0] + Math.random() * (mainPatternSettings.velocityRange[1] - mainPatternSettings.velocityRange[0]);
                synth.triggerAttackRelease(note, dur, time, velocity);
            }
        }, Array.from({length: mainPatternSettings.numSteps}, (_, i) => i), mainPatternSettings.subdivision).start(0);
        sequence.loop = true; 
        let bassSeqInstance = null;
        if (bassPatternSettings && bassNotes.length > 0) {
            bassSeqInstance = new Tone.Sequence((time, step) => {
                if (bassPatternSettings.conditions(step) && Math.random() < bassPatternSettings.probability) {
                    const noteIndex = Math.floor(Math.random() * Math.min(bassPatternSettings.noteIndexMax, bassNotes.length));
                    const note = bassNotes[noteIndex];
                    synth.triggerAttackRelease(note, bassPatternSettings.duration, time, bassPatternSettings.velocity);
                }
            }, Array.from({length: bassPatternSettings.numSteps}, (_, i) => i), bassPatternSettings.subdivision).start(0);
            bassSeqInstance.loop = true;
        }
        Tone.Transport.bpm.value = tempo;
        Tone.Transport.loop = true;
        Tone.Transport.loopEnd = loopDuration; 
        Tone.Transport.start();
        currentMusic = { synth, sequence, bassSequence: bassSeqInstance, reverb, style, scaleKey, tempo, reverbAmount, duration: currentTrackDuration };
        saveCurrentConfig("music"); 
        showStatus('musicStatus', '🎶 Müzik çalıyor...', 'progress');
    } catch (error) {
        console.error('Müzik oluşturma/çalma hatası:', error);
        showStatus('musicStatus', `Müzik hatası: ${error.message}`, 'error');
        if(currentMusic) stopMusic(false); 
    }
    updateButtonStates();
}

function stopMusic(resetSaveButtonState = true) { 
    if (currentMusic) {
        try {
            if (Tone && Tone.Transport) {
                 Tone.Transport.stop(); Tone.Transport.cancel(); 
            }
            if (currentMusic.sequence) currentMusic.sequence.stop(0).dispose();
            if (currentMusic.bassSequence) currentMusic.bassSequence.stop(0).dispose();
            if (currentMusic.synth) currentMusic.synth.dispose(); 
            if (currentMusic.reverb) currentMusic.reverb.dispose();
            if (audioDestination && audioDestination.stream) {
                audioDestination.stream.getTracks().forEach(track => track.stop());
            }
            currentMusic = null;
            if(resetSaveButtonState) showStatus('musicStatus', '⏹️ Müzik durduruldu.');
        } catch (error) { console.error('Müzik durdurma hatası:', error); currentMusic = null; }
    }
    updateButtonStates();
}

async function saveGeneratedMusic() {
    if (!currentMusic || !audioDestination || !audioDestination.stream || !audioDestination.stream.active) {
        showStatus('musicStatus', 'Kaydedilecek aktif müzik/ses kaynağı bulunamadı.', 'error');
        updateButtonStates(); return;
    }
    if (isRecordingMusic) { showStatus('musicStatus', 'Müzik zaten kaydediliyor...', 'error'); return; }
    saveCurrentConfig("music"); 
    const duration = currentMusic.duration || (durationInputElement ? parseInt(durationInputElement.value) : 10);
    isRecordingMusic = true;
    updateButtonStates();
    if(saveMusicBtnElement) saveMusicBtnElement.textContent = '💾 Kaydediliyor...';
    showStatus('musicStatus', `Müzik kaydediliyor (${duration}s)...`, 'progress');
    updateProgress(5); 
    resetMusicPreview();
    await startMusicRecording(duration);
    updateProgress(100); 
}

async function startMusicRecording(duration) {
    if (!audioDestination || !audioDestination.stream || !audioDestination.stream.active) {
        showStatus('musicStatus', 'Müzik kaydı için ses kaynağı aktif değil.', 'error');
        isRecordingMusic = false; if(saveMusicBtnElement) saveMusicBtnElement.textContent = '💾 Müziği Kaydet';
        updateButtonStates(); updateProgress(0); return;
    }
    const audioMimeTypes = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4', 'audio/webm'];
    let audioMimeType = audioMimeTypes.find(type => MediaRecorder.isTypeSupported(type));
    if (!audioMimeType) {
        showStatus('musicStatus', 'Desteklenen ses kayıt formatı bulunamadı.', 'error');
        isRecordingMusic = false; if(saveMusicBtnElement) saveMusicBtnElement.textContent = '💾 Müziği Kaydet';
        updateButtonStates(); updateProgress(0); return;
    }
    try {
        if (Tone.context.state !== 'running') await Tone.start();
        musicAudioRecorder = new MediaRecorder(audioDestination.stream, { mimeType: audioMimeType, audioBitsPerSecond: 128000 });
    } catch (e) {
        showStatus('musicStatus', `Müzik MediaRecorder oluşturma hatası: ${e.message}`, 'error');
        isRecordingMusic = false; if(saveMusicBtnElement) saveMusicBtnElement.textContent = '💾 Müziği Kaydet';
        updateButtonStates(); updateProgress(0); return;
    }
    const chunks = [];
    musicAudioRecorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) { chunks.push(e.data); }};
    musicAudioRecorder.onstop = () => {
        isRecordingMusic = false; if(saveMusicBtnElement) saveMusicBtnElement.textContent = '💾 Müziği Kaydet';
        if (chunks.length > 0) {
            cachedAudioBlob = new Blob(chunks, { type: audioMimeType });
            updateMusicPreviewUI();
        } else { cachedAudioBlob = null; resetMusicPreview(); showStatus('musicStatus', 'Müzik kaydı boş sonuç verdi.', 'error'); }
        updateButtonStates();
    };
    musicAudioRecorder.onerror = (e) => {
        isRecordingMusic = false; if(saveMusicBtnElement) saveMusicBtnElement.textContent = '💾 Müziği Kaydet';
        showStatus('musicStatus', `Müzik kaydı sırasında hata: ${e.error ? e.error.name : 'Bilinmeyen'}`, 'error');
        updateButtonStates(); updateProgress(0);
    };
    try { musicAudioRecorder.start(); } 
    catch (e) {
        showStatus('musicStatus', `Müzik kaydı başlatılamadı: ${e.message}`, 'error');
        isRecordingMusic = false; if(saveMusicBtnElement) saveMusicBtnElement.textContent = '💾 Müziği Kaydet';
        updateButtonStates(); updateProgress(0); return;
    }
    let progressInterval = setInterval(() => {
        if (!isRecordingMusic) { clearInterval(progressInterval); return; }
        const startTime = musicAudioRecorder.startTime || (musicAudioRecorder.startTime = Date.now());
        const elapsedTime = (Date.now() - startTime) / 1000;
        updateProgress(5 + (elapsedTime / duration) * 85);
    }, 500);

    setTimeout(() => {
        if (musicAudioRecorder && musicAudioRecorder.state === 'recording') { 
            try { musicAudioRecorder.stop(); } catch(err) { console.warn("Müzik kaydediciyi zaman aşımıyla durdururken hata:", err); }
        }
        clearInterval(progressInterval);
    }, duration * 1000 + 200);
}

async function combineAndPreview() {
    if (!cachedVideoBlob) { showStatus('exportStatus', 'Önce animasyon videosu kaydedin!', 'error'); return; }
    if (!durationInputElement) return;
    const duration = parseInt(durationInputElement.value);
    if(combineAndPreviewBtn) { combineAndPreviewBtn.disabled = true; combineAndPreviewBtn.textContent = '⏳ Birleştiriliyor...'; }
    if(downloadFinalVideoBtn) downloadFinalVideoBtn.style.display = 'none';
    showStatus('exportStatus', `Video${cachedAudioBlob ? ' ve müzik ': ''} birleştiriliyor...`, 'progress');
    updateProgress(10); resetCombinedPreview(); 
    try {
        if (cachedAudioBlob) {
            finalCombinedBlob = await combineVideoWithAudio(cachedVideoBlob, cachedAudioBlob, duration);
        } else {
            finalCombinedBlob = cachedVideoBlob; 
            showStatus('exportStatus', 'Müzik yok, sadece video kullanılıyor.', 'progress');
            updateProgress(60); 
        }
        updateProgress(90); updateCombinedPreviewUI(); updateProgress(100);
        setTimeout(() => updateProgress(0), 2500); 
    } catch (error) {
        console.error('Birleştirme hatası:', error); updateProgress(0); 
        showStatus('exportStatus', `Birleştirme hatası: ${error.message}.`, 'error');
        resetCombinedPreview(); 
    } finally {
        if(combineAndPreviewBtn) combineAndPreviewBtn.textContent = '🔗 Birleştir & Önizle';
        updateButtonStates(); 
    }
}

/* // FFmpeg.wasm ile birleştirme
async function combineVideoWithAudioFFmpeg(videoBlob, audioBlob, duration) {
    // ... (önceki FFmpeg kodu) ...
}
*/

async function combineVideoWithAudio(videoBlob, audioBlob, duration) {
    console.warn("Tarayıcı tabanlı video+ses birleştirme kullanılıyor. FFmpeg.wasm daha güvenilir olabilir.");
    const tempVideoEl = document.createElement('video'); 
    const tempAudioEl = document.createElement('audio');
    const muxedCanvas = document.createElement('canvas'); 
    const muxedCtx = muxedCanvas.getContext('2d');
    muxedCanvas.width = 360; muxedCanvas.height = 640;
    
    let videoUrl = null;
    let audioUrl = null;

    try {
        videoUrl = URL.createObjectURL(videoBlob);
        audioUrl = URL.createObjectURL(audioBlob);
        tempVideoEl.src = videoUrl; tempVideoEl.muted = true; 
        tempAudioEl.src = audioUrl;
    } catch(e) {
        if(videoUrl) URL.revokeObjectURL(videoUrl);
        if(audioUrl) URL.revokeObjectURL(audioUrl);
        return Promise.reject(new Error("Blob URL oluşturma hatası: " + e.message));
    }
    
    let loadedMetadataCount = 0;
    const totalMetadataToLoad = 2;

    return new Promise(async (resolve, reject) => {
        const cleanupAndReject = (errMsg) => {
            if(videoUrl) URL.revokeObjectURL(videoUrl);
            if(audioUrl) URL.revokeObjectURL(audioUrl);
            reject(new Error(errMsg));
        };

        const onMetadataLoaded = () => {
            loadedMetadataCount++;
            if (loadedMetadataCount === totalMetadataToLoad) {
                proceedWithCombination();
            }
        };
        tempVideoEl.onloadedmetadata = onMetadataLoaded;
        tempAudioEl.onloadedmetadata = onMetadataLoaded;
        tempVideoEl.onerror = () => cleanupAndReject("Video yüklenirken hata oluştu.");
        tempAudioEl.onerror = () => cleanupAndReject("Ses yüklenirken hata oluştu.");

        const proceedWithCombination = async () => {
            updateProgress(20);
            let audioContext, finalStreamRecorder, mediaStreamForRecording;
            try {
                const fpsForMuxing = fpsInputElement ? parseInt(fpsInputElement.value) : 30;
                if (!muxedCanvas.captureStream) { cleanupAndReject("Tarayıcınız canvas.captureStream() desteklemiyor."); return; }
                const canvasVideoStream = muxedCanvas.captureStream(fpsForMuxing);
                let combinedStreamTracks = [...canvasVideoStream.getVideoTracks()];
                updateProgress(30);
                let audioStreamSource;
                if (tempAudioEl.captureStream) { audioStreamSource = tempAudioEl.captureStream(); } 
                else if (tempAudioEl.mozCaptureStream) { audioStreamSource = tempAudioEl.mozCaptureStream(); }
                
                if (audioStreamSource && audioStreamSource.getAudioTracks().length > 0) {
                    combinedStreamTracks.push(...audioStreamSource.getAudioTracks());
                } else {
                    audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    if (audioContext.state === 'suspended') await audioContext.resume();
                    const sourceNode = audioContext.createMediaElementSource(tempAudioEl);
                    const destNode = audioContext.createMediaStreamDestination();
                    sourceNode.connect(destNode);
                    if (destNode.stream && destNode.stream.getAudioTracks().length > 0) {
                        combinedStreamTracks.push(...destNode.stream.getAudioTracks());
                    } 
                }
                updateProgress(40);
                mediaStreamForRecording = new MediaStream(combinedStreamTracks);
                const supportedTypes = getSupportedMimeTypes();
                let selectedType = supportedTypes.find(type => type.includes('mp4')) || supportedTypes.find(type => type.includes('webm')) || supportedTypes[0];
                if (!selectedType) { cleanupAndReject("Birleştirilmiş video için desteklenen MIME türü bulunamadı."); return; }
                finalStreamRecorder = new MediaRecorder(mediaStreamForRecording, {
                    mimeType: selectedType, videoBitsPerSecond: 2500000, audioBitsPerSecond: 128000
                });
                const chunks = [];
                finalStreamRecorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
                finalStreamRecorder.onstop = () => {
                    if(videoUrl) URL.revokeObjectURL(videoUrl);
                    if(audioUrl) URL.revokeObjectURL(audioUrl);
                    if(audioContext) audioContext.close().catch(console.warn);
                    mediaStreamForRecording.getTracks().forEach(track => track.stop()); 
                    if (chunks.length === 0) { reject(new Error("Birleştirme sonucu boş dosya oluştu.")); return; }
                    resolve(new Blob(chunks, { type: selectedType }));
                };
                finalStreamRecorder.onerror = (e) => {
                     cleanupAndReject(`Birleştirme recorder hatası: ${e.type || (e.error ? e.error.name : 'Bilinmeyen')}`);
                };
                tempVideoEl.currentTime = 0; tempAudioEl.currentTime = 0;
                try { await Promise.all([tempVideoEl.play(), tempAudioEl.play()]); } 
                catch(playError) { 
                    if (finalStreamRecorder && finalStreamRecorder.state === "recording") {
                        try { finalStreamRecorder.stop(); } catch(e) { /* ignore */ }
                    }
                    cleanupAndReject("Birleştirme için video/ses oynatılamadı. Tarayıcı etkileşimi gerekebilir."); return;
                }
                updateProgress(50);
                if (finalStreamRecorder.state !== "recording") { finalStreamRecorder.start(); }
                let frameRequest;
                function drawAndCaptureFrame() {
                    if (tempVideoEl.paused || tempVideoEl.ended || 
                        (finalStreamRecorder && finalStreamRecorder.state !== "recording") ||
                        tempVideoEl.currentTime >= duration) {
                        if (finalStreamRecorder && finalStreamRecorder.state === "recording") { 
                            try { finalStreamRecorder.stop(); } catch(e) { /* ignore */ }
                        }
                        if (frameRequest) cancelAnimationFrame(frameRequest); return;
                    }
                    muxedCtx.drawImage(tempVideoEl, 0, 0, muxedCanvas.width, muxedCanvas.height);
                    frameRequest = requestAnimationFrame(drawAndCaptureFrame);
                }
                drawAndCaptureFrame();
                setTimeout(() => {
                    if (tempVideoEl && !tempVideoEl.paused) tempVideoEl.pause(); 
                    if (tempAudioEl && !tempAudioEl.paused) tempAudioEl.pause();
                    if (frameRequest) cancelAnimationFrame(frameRequest);
                    if (finalStreamRecorder && finalStreamRecorder.state === "recording") { 
                        try { finalStreamRecorder.stop(); } catch(e) { /* ignore */ }
                    }
                }, duration * 1000 + 500); 
            } catch (error) {
                if(videoUrl) URL.revokeObjectURL(videoUrl);
                if(audioUrl) URL.revokeObjectURL(audioUrl);
                if(audioContext) audioContext.close().catch(console.warn);
                if (mediaStreamForRecording) mediaStreamForRecording.getTracks().forEach(track => track.stop());
                if (finalStreamRecorder && finalStreamRecorder.state === "recording") {
                    try { finalStreamRecorder.stop(); } catch(e) { /* ignore */ }
                }
                reject(error);
            }
        };
    });
}

function downloadFinalVideo() {
    if (!finalCombinedBlob) { showStatus('exportStatus', 'İndirilecek video bulunamadı!', 'error'); return; }
    if(downloadFinalVideoBtn) { downloadFinalVideoBtn.disabled = true; downloadFinalVideoBtn.textContent = '⏳ İndiriliyor...'; }
    try {
        const extension = getFileExtension(finalCombinedBlob.type);
        const filename = `tiktok-studio-${currentLibrary}-${Date.now()}.${extension}`;
        downloadFile(finalCombinedBlob, filename); 
        showStatus('exportStatus', `✅ "${filename}" indirildi!`);
        setTimeout(() => {
            if(downloadFinalVideoBtn) { downloadFinalVideoBtn.textContent = '📱 TikTok MP4 İndir'; }
            updateButtonStates(); 
        }, 2000);
    } catch (error) {
        console.error('Video indirme hatası:', error);
        showStatus('exportStatus', `İndirme hatası: ${error.message}`, 'error');
        if(downloadFinalVideoBtn) { downloadFinalVideoBtn.textContent = '📱 TikTok MP4 İndir'; }
        updateButtonStates();
    }
}
function getFileExtension(mimeType) {
    if (!mimeType) return 'mp4'; 
    if (mimeType.includes('mp4')) return 'mp4'; if (mimeType.includes('webm')) return 'webm';
    if (mimeType.includes('ogg')) return 'ogv'; 
    return 'mp4'; 
}
function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.style.display = 'none'; a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); 
    setTimeout(() => { URL.revokeObjectURL(url); document.body.removeChild(a); }, 100);
}