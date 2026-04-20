/**
 * gambarasci.js v2 — Gambar ke ASCII Art berkualitas tinggi
 * Martir Offline Dashboard - FIXED
 */

const GambarAsci = (() => {

  /* ── STATE ── */
  let selectedFile = null;
  let currentAscii = '';

  /* ── KARAKTER SET PER MODEL ── */
  const MODEL_CHARS = {
    extended: '@%#*+=-:. ',
    detailed: '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`\'. ',
    standard: '@%#*+=-:. ',
    block: '█▓▒░ ',
    minimal: '.:-=+*#%@',
    braille: '⣿⣷⣯⣟⡿⢿⣻⣽⣾⣴⣬⣤⣠⠿⠻⠽⠾⠶⠦⠤⠠⠀',
    emoji: '⬛🟫🟤🟪🟦🟩🟨🟧🟥⬜'
  };

  /* ── INJECT CSS ── */
  function injectCSS() {
    if (document.getElementById('gasci-style-v2')) return;
    const s = document.createElement('style');
    s.id = 'gasci-style-v2';
    s.textContent = `
      #gasci-overlay {
        position: fixed; inset: 0; z-index: 9999;
        background: rgba(5,7,12,0.96);
        backdrop-filter: blur(20px);
        display: flex; align-items: flex-end;
        justify-content: center;
        animation: gasciFadeIn 0.3s ease;
      }
      @keyframes gasciFadeIn {
        from { opacity: 0; backdrop-filter: blur(0); }
        to { opacity: 1; backdrop-filter: blur(20px); }
      }

      #gasci-sheet {
        width: 100%; max-height: 90vh;
        background: #0d1017;
        border-top: 1px solid rgba(94,160,255,0.3);
        border-radius: 28px 28px 0 0;
        overflow-y: auto;
        overflow-x: hidden;
        animation: gasciSlideUp 0.35s cubic-bezier(0.32,0.72,0,1);
        padding-bottom: env(safe-area-inset-bottom, 20px);
      }
      @keyframes gasciSlideUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
      }
      
      /* Custom scrollbar untuk sheet */
      #gasci-sheet::-webkit-scrollbar {
        width: 4px;
      }
      #gasci-sheet::-webkit-scrollbar-track {
        background: rgba(255,255,255,0.05);
        border-radius: 4px;
      }
      #gasci-sheet::-webkit-scrollbar-thumb {
        background: #5ea0ff;
        border-radius: 4px;
      }

      .gasci-handle {
        width: 40px; height: 4px; border-radius: 2px;
        background: rgba(255,255,255,0.2);
        margin: 12px auto 0;
      }

      .gasci-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 16px 20px 12px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
        position: sticky;
        top: 0;
        background: #0d1017;
        z-index: 10;
      }
      .gasci-title {
        font-family: 'Syne', sans-serif;
        font-size: 18px; font-weight: 800;
        color: #eef2ff; letter-spacing: -0.02em;
      }
      .gasci-title span { 
        background: linear-gradient(135deg, #5ea0ff, #38e8d5);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
      .gasci-close {
        width: 34px; height: 34px; border-radius: 10px;
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.08);
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        color: #5c6782;
        transition: all 0.2s;
      }
      .gasci-close:active { background: rgba(255,255,255,0.12); transform: scale(0.94); }

      .gasci-body { 
        padding: 20px; 
        display: flex; 
        flex-direction: column; 
        gap: 24px;
      }

      .gasci-lbl {
        font-family: 'DM Mono', monospace;
        font-size: 10px; font-weight: 600; letter-spacing: 0.14em;
        color: #5ea0ff; text-transform: uppercase;
        margin-bottom: 10px;
      }

      /* Upload zone */
      .gasci-upload {
        border: 2px dashed rgba(94,160,255,0.3);
        border-radius: 20px;
        padding: 24px 16px;
        text-align: center;
        cursor: pointer;
        transition: all 0.25s;
        background: rgba(94,160,255,0.03);
      }
      .gasci-upload.has-file {
        border-color: #39e97b;
        background: rgba(57,233,123,0.05);
      }
      .gasci-upload:active { transform: scale(0.98); }
      .gasci-upload input { 
        position: absolute; 
        opacity: 0; 
        width: 0.1px; 
        height: 0.1px;
      }
      .gasci-upload-icon { font-size: 36px; margin-bottom: 8px; }
      .gasci-upload-text {
        font-family: 'Syne', sans-serif;
        font-size: 14px; font-weight: 600; color: #eef2ff;
      }
      .gasci-upload-sub {
        font-family: 'DM Mono', monospace;
        font-size: 10px; color: #5c6782; margin-top: 4px;
      }

      .gasci-preview-img {
        width: 100%; max-height: 150px; object-fit: contain;
        border-radius: 12px; margin-top: 12px;
        display: none;
        background: #080a0f;
      }
      .gasci-preview-img.show { display: block; }

      /* Model grid */
      .gasci-opts {
        display: grid; grid-template-columns: repeat(3, 1fr);
        gap: 10px;
      }
      .gasci-opt {
        background: rgba(255,255,255,0.04);
        border: 1.5px solid rgba(255,255,255,0.07);
        border-radius: 14px; padding: 12px 8px;
        cursor: pointer; transition: all 0.2s;
        text-align: center;
      }
      .gasci-opt.active {
        border-color: #5ea0ff;
        background: rgba(94,160,255,0.12);
      }
      .gasci-opt:active { transform: scale(0.96); }
      .gasci-opt-icon { font-size: 22px; margin-bottom: 6px; }
      .gasci-opt-name {
        font-family: 'Syne', sans-serif;
        font-size: 11px; font-weight: 700; color: #eef2ff;
      }
      .gasci-opt-sub {
        font-family: 'DM Mono', monospace;
        font-size: 8px; color: #5c6782; margin-top: 2px;
      }

      /* Slider */
      .gasci-slider-wrap { 
        display: flex; 
        align-items: center; 
        gap: 14px; 
      }
      .gasci-slider {
        flex: 1; 
        -webkit-appearance: none; 
        appearance: none;
        height: 5px; 
        border-radius: 3px;
        background: rgba(255,255,255,0.1);
        outline: none;
      }
      .gasci-slider::-webkit-slider-thumb {
        -webkit-appearance: none; 
        appearance: none;
        width: 20px; 
        height: 20px; 
        border-radius: 50%;
        background: #5ea0ff;
        box-shadow: 0 0 12px rgba(94,160,255,0.6);
        cursor: pointer;
      }
      .gasci-slider-val {
        font-family: 'DM Mono', monospace;
        font-size: 13px; font-weight: 600;
        color: #5ea0ff; 
        min-width: 45px; 
        text-align: right;
      }

      /* Toggle rows */
      .gasci-toggle-row {
        display: flex; 
        align-items: center; 
        justify-content: space-between;
        padding: 14px 0;
        border-bottom: 1px solid rgba(255,255,255,0.05);
      }
      .gasci-toggle-row:last-child { border-bottom: none; }
      .gasci-toggle-info { flex: 1; }
      .gasci-toggle-name {
        font-family: 'Syne', sans-serif;
        font-size: 13px; font-weight: 600; color: #eef2ff;
      }
      .gasci-toggle-desc {
        font-family: 'DM Mono', monospace;
        font-size: 9px; color: #5c6782; margin-top: 2px;
      }
      .gasci-toggle {
        width: 46px; 
        height: 26px; 
        border-radius: 13px;
        background: rgba(255,255,255,0.1);
        border: none; 
        cursor: pointer;
        position: relative; 
        transition: all 0.25s;
        flex-shrink: 0;
      }
      .gasci-toggle.on { background: #5ea0ff; }
      .gasci-toggle::after {
        content: '';
        position: absolute; 
        top: 3px; 
        left: 3px;
        width: 20px; 
        height: 20px; 
        border-radius: 50%;
        background: white; 
        transition: all 0.25s;
      }
      .gasci-toggle.on::after { left: 23px; }

      /* Convert button */
      .gasci-btn-convert {
        width: 100%; 
        padding: 16px;
        border-radius: 16px; 
        border: none;
        background: linear-gradient(135deg, #5ea0ff, #38e8d5);
        font-family: 'Syne', sans-serif;
        font-size: 15px; 
        font-weight: 800;
        color: #080a0f; 
        letter-spacing: -0.01em;
        cursor: pointer; 
        transition: all 0.25s;
        box-shadow: 0 4px 24px rgba(94,160,255,0.3);
        display: flex; 
        align-items: center; 
        justify-content: center; 
        gap: 8px;
      }
      .gasci-btn-convert:active { transform: scale(0.97); opacity: 0.9; }
      .gasci-btn-convert:disabled {
        opacity: 0.4; 
        cursor: not-allowed;
        background: rgba(255,255,255,0.08); 
        box-shadow: none; 
        color: #5c6782;
      }

      /* Loading */
      .gasci-loading {
        display: none; 
        flex-direction: column; 
        align-items: center;
        gap: 16px; 
        padding: 32px 0;
      }
      .gasci-loading.show { display: flex; }
      .gasci-spin {
        width: 44px; 
        height: 44px; 
        border-radius: 50%;
        border: 3px solid rgba(94,160,255,0.2);
        border-top-color: #5ea0ff;
        animation: gasciSpin 0.7s linear infinite;
      }
      @keyframes gasciSpin { to { transform: rotate(360deg); } }
      .gasci-loading-txt {
        font-family: 'DM Mono', monospace;
        font-size: 12px; 
        color: #5c6782;
      }

      /* Result area */
      .gasci-result { 
        display: none; 
        flex-direction: column; 
        gap: 14px; 
      }
      .gasci-result.show { display: flex; }
      .gasci-result-header {
        display: flex; 
        align-items: center; 
        justify-content: space-between;
      }
      .gasci-result-title {
        font-family: 'Syne', sans-serif;
        font-size: 13px; 
        font-weight: 700; 
        color: #39e97b;
      }
      .gasci-result-actions { display: flex; gap: 10px; }
      .gasci-btn-sm {
        padding: 7px 14px; 
        border-radius: 10px; 
        border: none;
        font-family: 'DM Mono', monospace;
        font-size: 10px; 
        font-weight: 600;
        cursor: pointer; 
        transition: all 0.2s;
      }
      .gasci-btn-sm:active { transform: scale(0.94); }
      .gasci-btn-copy {
        background: rgba(94,160,255,0.15);
        color: #5ea0ff; 
        border: 1px solid rgba(94,160,255,0.25);
      }
      .gasci-btn-save {
        background: rgba(57,233,123,0.15);
        color: #39e97b; 
        border: 1px solid rgba(57,233,123,0.25);
      }
      .gasci-result-box {
        background: #080a0f;
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 16px; 
        padding: 16px;
        overflow-x: auto; 
        overflow-y: auto;
        max-height: 350px;
        font-family: 'Courier New', monospace;
        font-size: 5px; 
        line-height: 1.2;
        color: #eef2ff; 
        white-space: pre;
        letter-spacing: 0;
      }
      .gasci-result-box.colored span { display: inline; }
      .gasci-result-box::-webkit-scrollbar {
        height: 5px; 
        width: 5px;
      }
      .gasci-result-box::-webkit-scrollbar-track {
        background: rgba(255,255,255,0.05);
        border-radius: 4px;
      }
      .gasci-result-box::-webkit-scrollbar-thumb {
        background: #5ea0ff;
        border-radius: 4px;
      }

      .gasci-divider {
        border: none; 
        border-top: 1px solid rgba(255,255,255,0.05);
        margin: 0;
      }

      .gasci-btn-reset {
        width: 100%; 
        padding: 12px;
        border-radius: 14px; 
        border: 1px solid rgba(255,255,255,0.08);
        background: transparent;
        font-family: 'DM Mono', monospace;
        font-size: 11px; 
        color: #5c6782;
        cursor: pointer; 
        transition: all 0.2s;
      }
      .gasci-btn-reset:active { background: rgba(255,255,255,0.05); transform: scale(0.97); }
    `;
    document.head.appendChild(s);
  }

  /* ── BUILD UI ── */
  function buildUI() {
    const overlay = document.createElement('div');
    overlay.id = 'gasci-overlay';
    overlay.innerHTML = `
      <div id="gasci-sheet">
        <div class="gasci-handle"></div>

        <div class="gasci-header">
          <div class="gasci-title">Gambar → <span>ASCII Art</span></div>
          <button class="gasci-close" id="gasci-close-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="gasci-body">
          <!-- UPLOAD -->
          <div>
            <div class="gasci-lbl">📷 Pilih Gambar</div>
            <div class="gasci-upload" id="gasci-upload-zone">
              <input type="file" id="gasci-file-input" accept="image/jpeg,image/png,image/webp,image/gif">
              <div class="gasci-upload-icon" id="gasci-upload-icon">🖼️</div>
              <div class="gasci-upload-text" id="gasci-upload-text">Tap untuk pilih gambar</div>
              <div class="gasci-upload-sub" id="gasci-upload-sub">JPG, PNG, WEBP — max 15MB</div>
              <img class="gasci-preview-img" id="gasci-preview-img" alt="preview">
            </div>
          </div>

          <hr class="gasci-divider">

          <!-- MODEL ASCII -->
          <div>
            <div class="gasci-lbl">🎨 Model ASCII</div>
            <div class="gasci-opts" id="gasci-model-opts">
              <div class="gasci-opt active" data-model="extended">
                <div class="gasci-opt-icon">🔍</div>
                <div class="gasci-opt-name">Extended</div>
                <div class="gasci-opt-sub">16 level gradasi</div>
              </div>
              <div class="gasci-opt" data-model="detailed">
                <div class="gasci-opt-icon">✨</div>
                <div class="gasci-opt-name">Detailed</div>
                <div class="gasci-opt-sub">Detail maksimal</div>
              </div>
              <div class="gasci-opt" data-model="standard">
                <div class="gasci-opt-icon">■</div>
                <div class="gasci-opt-name">Standard</div>
                <div class="gasci-opt-sub">8 level</div>
              </div>
              <div class="gasci-opt" data-model="block">
                <div class="gasci-opt-icon">█</div>
                <div class="gasci-opt-name">Block</div>
                <div class="gasci-opt-sub">Full block</div>
              </div>
              <div class="gasci-opt" data-model="braille">
                <div class="gasci-opt-icon">⣿</div>
                <div class="gasci-opt-name">Braille</div>
                <div class="gasci-opt-sub">Dot pattern</div>
              </div>
              <div class="gasci-opt" data-model="emoji">
                <div class="gasci-opt-icon">🎨</div>
                <div class="gasci-opt-name">Emoji</div>
                <div class="gasci-opt-sub">Color blocks</div>
              </div>
            </div>
          </div>

          <hr class="gasci-divider">

          <!-- UKURAN OUTPUT -->
          <div>
            <div class="gasci-lbl">📏 Lebar Output</div>
            <div class="gasci-slider-wrap">
              <input type="range" class="gasci-slider" id="gasci-width" min="40" max="160" value="80" step="5">
              <span class="gasci-slider-val" id="gasci-width-val">80</span>
            </div>
          </div>

          <!-- KONTRAS -->
          <div>
            <div class="gasci-lbl">⚡ Kontras</div>
            <div class="gasci-slider-wrap">
              <input type="range" class="gasci-slider" id="gasci-contrast" min="0.6" max="2.2" value="1.2" step="0.05">
              <span class="gasci-slider-val" id="gasci-contrast-val">1.20</span>
            </div>
          </div>

          <hr class="gasci-divider">

          <!-- OPSI TAMBAHAN -->
          <div>
            <div class="gasci-lbl">⚙️ Opsi</div>
            <div class="gasci-toggle-row">
              <div class="gasci-toggle-info">
                <div class="gasci-toggle-name">Invert Warna</div>
                <div class="gasci-toggle-desc">Gelap ↔ Terang</div>
              </div>
              <button class="gasci-toggle" id="tog-invert"></button>
            </div>
            <div class="gasci-toggle-row">
              <div class="gasci-toggle-info">
                <div class="gasci-toggle-name">Mode Warna</div>
                <div class="gasci-toggle-desc">Tampilkan warna asli</div>
              </div>
              <button class="gasci-toggle" id="tog-color"></button>
            </div>
          </div>

          <hr class="gasci-divider">

          <!-- TOMBOL CONVERT -->
          <button class="gasci-btn-convert" id="gasci-convert-btn" disabled>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Pilih Gambar Dulu
          </button>

          <!-- LOADING -->
          <div class="gasci-loading" id="gasci-loading">
            <div class="gasci-spin"></div>
            <div class="gasci-loading-txt" id="gasci-loading-txt">Memproses gambar...</div>
          </div>

          <!-- HASIL -->
          <div class="gasci-result" id="gasci-result">
            <div class="gasci-result-header">
              <div class="gasci-result-title">✨ Hasil ASCII Art</div>
              <div class="gasci-result-actions">
                <button class="gasci-btn-sm gasci-btn-copy" id="gasci-copy-btn">📋 Salin</button>
                <button class="gasci-btn-sm gasci-btn-save" id="gasci-save-btn">💾 Simpan</button>
              </div>
            </div>
            <div class="gasci-result-box" id="gasci-result-box"></div>
            <button class="gasci-btn-reset" id="gasci-reset-btn">⟳ Konversi Ulang</button>
          </div>

        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    bindEvents(overlay);
  }

  /* ── BIND EVENTS ── */
  function bindEvents(overlay) {
    let selectedModel = 'extended';
    let invertOn = false;
    let colorOn = false;

    // Tutup overlay
    const closeBtn = document.getElementById('gasci-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', close);
    
    overlay.addEventListener('click', e => {
      if (e.target === overlay) close();
    });

    // File input
    const fileInput = document.getElementById('gasci-file-input');
    const uploadZone = document.getElementById('gasci-upload-zone');
    
    if (uploadZone) {
      uploadZone.addEventListener('click', () => {
        if (fileInput) fileInput.click();
      });
    }
    
    if (fileInput) {
      fileInput.addEventListener('change', e => {
        const f = e.target.files[0];
        if (!f) return;
        selectedFile = f;
        const reader = new FileReader();
        reader.onload = ev => {
          const previewImg = document.getElementById('gasci-preview-img');
          if (previewImg) {
            previewImg.src = ev.target.result;
            previewImg.classList.add('show');
          }
          if (uploadZone) uploadZone.classList.add('has-file');
          
          const uploadIcon = document.getElementById('gasci-upload-icon');
          if (uploadIcon) uploadIcon.textContent = '✅';
          
          const uploadText = document.getElementById('gasci-upload-text');
          if (uploadText) uploadText.textContent = f.name.length > 30 ? f.name.slice(0,27)+'...' : f.name;
          
          const uploadSub = document.getElementById('gasci-upload-sub');
          if (uploadSub) uploadSub.textContent = (f.size / 1024).toFixed(1) + ' KB';
          
          enableConvertBtn();
        };
        reader.readAsDataURL(f);
      });
    }

    // Model pilihan
    const modelOpts = document.querySelectorAll('.gasci-opt');
    modelOpts.forEach(opt => {
      opt.addEventListener('click', () => {
        modelOpts.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        selectedModel = opt.dataset.model;
      });
    });

    // Slider width
    const widthSlider = document.getElementById('gasci-width');
    if (widthSlider) {
      widthSlider.addEventListener('input', () => {
        const widthVal = document.getElementById('gasci-width-val');
        if (widthVal) widthVal.textContent = widthSlider.value;
      });
    }

    // Slider contrast
    const contrastSlider = document.getElementById('gasci-contrast');
    if (contrastSlider) {
      contrastSlider.addEventListener('input', () => {
        const contrastVal = document.getElementById('gasci-contrast-val');
        if (contrastVal) contrastVal.textContent = parseFloat(contrastSlider.value).toFixed(2);
      });
    }

    // Toggles
    const togInvert = document.getElementById('tog-invert');
    if (togInvert) {
      togInvert.addEventListener('click', function() {
        invertOn = !invertOn;
        this.classList.toggle('on', invertOn);
      });
    }

    const togColor = document.getElementById('tog-color');
    if (togColor) {
      togColor.addEventListener('click', function() {
        colorOn = !colorOn;
        this.classList.toggle('on', colorOn);
      });
    }

    // Convert button
    const convertBtn = document.getElementById('gasci-convert-btn');
    if (convertBtn) {
      convertBtn.addEventListener('click', () => {
        if (!selectedFile) return;
        const width = widthSlider ? parseInt(widthSlider.value) : 80;
        const contrast = contrastSlider ? parseFloat(contrastSlider.value) : 1.2;
        convertToAscii({
          file: selectedFile,
          model: selectedModel,
          width,
          contrast,
          invert: invertOn,
          color: colorOn
        });
      });
    }

    // Copy button
    const copyBtn = document.getElementById('gasci-copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        if (currentAscii) {
          navigator.clipboard.writeText(currentAscii).then(() => {
            copyBtn.textContent = '✅ Tersalin!';
            setTimeout(() => copyBtn.textContent = '📋 Salin', 1500);
          });
        }
      });
    }

    // Save button
    const saveBtn = document.getElementById('gasci-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        if (currentAscii) {
          const blob = new Blob([currentAscii], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `ascii-art-${Date.now()}.txt`;
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    }

    // Reset button
    const resetBtn = document.getElementById('gasci-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        const resultDiv = document.getElementById('gasci-result');
        const loadingDiv = document.getElementById('gasci-loading');
        if (resultDiv) resultDiv.classList.remove('show');
        if (loadingDiv) loadingDiv.classList.remove('show');
        enableConvertBtn();
      });
    }
  }

  function enableConvertBtn() {
    const btn = document.getElementById('gasci-convert-btn');
    if (!btn) return;
    btn.disabled = false;
    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polygon points="5 3 19 12 5 21 5 3"/>
      </svg>
      Konversi ke ASCII
    `;
  }

  /* ── KONVERSI ASCII ── */
  function convertToAscii({ file, model, width, contrast, invert, color }) {
    const convertBtn = document.getElementById('gasci-convert-btn');
    const loading = document.getElementById('gasci-loading');
    const resultDiv = document.getElementById('gasci-result');
    
    if (convertBtn) convertBtn.style.display = 'none';
    if (resultDiv) resultDiv.classList.remove('show');
    if (loading) loading.classList.add('show');

    const steps = ['📸 Memuat gambar...', '🔍 Menganalisis piksel...', '🎨 Memproses warna...', '✨ Membangun ASCII...'];
    let stepIdx = 0;
    const stepInterval = setInterval(() => {
      const loadingTxt = document.getElementById('gasci-loading-txt');
      if (loadingTxt) loadingTxt.textContent = steps[stepIdx % steps.length];
      stepIdx++;
    }, 400);

    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      clearInterval(stepInterval);
      URL.revokeObjectURL(url);

      // Hitung dimensi
      const aspectRatio = img.height / img.width;
      const cols = width;
      const rows = Math.max(1, Math.floor(cols * aspectRatio * 0.48));

      // Canvas
      const canvas = document.createElement('canvas');
      canvas.width = cols;
      canvas.height = rows;
      const ctx = canvas.getContext('2d');
      
      ctx.drawImage(img, 0, 0, cols, rows);
      
      const imgData = ctx.getImageData(0, 0, cols, rows).data;
      const chars = MODEL_CHARS[model] || MODEL_CHARS.extended;
      const isEmoji = model === 'emoji';
      const isBraille = model === 'braille';
      let ascii = '';
      
      // Konversi
      for (let y = 0; y < rows; y++) {
        let line = '';
        for (let x = 0; x < cols; x++) {
          const i = (y * cols + x) * 4;
          let r = imgData[i];
          let g = imgData[i + 1];
          let b = imgData[i + 2];
          
          // Kontras
          const applyContrast = (v) => {
            const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
            return Math.min(255, Math.max(0, factor * (v - 128) + 128));
          };
          r = applyContrast(r);
          g = applyContrast(g);
          b = applyContrast(b);
          
          // Luminance perceptual
          let luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          if (invert) luminance = 255 - luminance;
          
          let normalized = luminance / 255;
          
          if (isEmoji) {
            if (normalized < 0.1) line += '⬛';
            else if (normalized < 0.25) line += '🟫';
            else if (normalized < 0.4) line += '🟪';
            else if (normalized < 0.55) line += '🟦';
            else if (normalized < 0.7) line += '🟩';
            else if (normalized < 0.85) line += '🟨';
            else if (normalized < 0.95) line += '🟧';
            else line += '⬜';
          } else if (isBraille) {
            const brailleIdx = Math.floor(normalized * (chars.length - 1));
            line += chars[brailleIdx] || '⠀';
          } else if (color) {
            const charIdx = Math.floor(normalized * (chars.length - 1));
            const ch = chars[charIdx] || ' ';
            const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
            line += `<span style="color:${hex}">${ch}</span>`;
          } else {
            const charIdx = Math.floor(normalized * (chars.length - 1));
            line += chars[charIdx] || ' ';
          }
        }
        ascii += line + '\n';
      }
      
      currentAscii = ascii;
      if (loading) loading.classList.remove('show');
      
      // Tampilkan hasil
      const box = document.getElementById('gasci-result-box');
      if (box) {
        if (color && !isEmoji && !isBraille) {
          box.classList.add('colored');
          box.innerHTML = ascii;
        } else {
          box.classList.remove('colored');
          box.textContent = ascii;
        }
        
        // Atur font size
        if (isBraille) {
          box.style.fontSize = cols > 100 ? '7px' : '9px';
        } else if (isEmoji) {
          box.style.fontSize = cols > 100 ? '9px' : '11px';
        } else {
          box.style.fontSize = cols > 120 ? '3.5px' : cols > 80 ? '4.5px' : '5.5px';
        }
      }
      
      if (resultDiv) resultDiv.classList.add('show');
      if (convertBtn) convertBtn.style.display = 'flex';
      enableConvertBtn();
      
      // Scroll ke hasil
      setTimeout(() => {
        if (resultDiv) resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    };
    
    img.onerror = () => {
      clearInterval(stepInterval);
      if (loading) loading.classList.remove('show');
      if (convertBtn) convertBtn.style.display = 'flex';
      enableConvertBtn();
      alert('❌ Gagal memuat gambar. Pastikan file gambar valid.');
    };
    
    img.src = url;
  }

  /* ── PUBLIC API ── */
  function open() {
    if (document.getElementById('gasci-overlay')) return;
    injectCSS();
    buildUI();
  }

  function close() {
    const overlay = document.getElementById('gasci-overlay');
    if (!overlay) return;
    overlay.style.animation = 'gasciFadeIn 0.2s ease reverse';
    setTimeout(() => {
      overlay.remove();
      selectedFile = null;
      currentAscii = '';
    }, 200);
  }

  return { open, close };

})();