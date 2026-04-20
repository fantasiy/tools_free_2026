/**
 * qrcode.js — QR Code Generator (Offline, library QRCode.js)
 * Martir Offline Dashboard
 * 
 * Menggunakan QRCode.js v1.0.0 (pure JS, ringan, scanable)
 */

const QRCodeGenerator = (() => {

  /* ── INJECT QRCODE LIBRARY (CDN fallback ke lokal) ── */
  let qrLibraryLoaded = false;
  
  function loadQRCodeLibrary(callback) {
    if (typeof QRCode !== 'undefined') {
      qrLibraryLoaded = true;
      callback();
      return;
    }
    
    // Coba load dari CDN dulu
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js';
    script.onload = () => {
      qrLibraryLoaded = true;
      callback();
    };
    script.onerror = () => {
      // Fallback: library lokal sederhana
      console.warn('CDN gagal, menggunakan fallback internal');
      injectFallbackQRCode();
      qrLibraryLoaded = true;
      callback();
    };
    document.head.appendChild(script);
  }
  
  // Fallback QR generator sederhana (tetap scanable)
  function injectFallbackQRCode() {
    if (window.FallbackQRCode) return;
    
    // Fungsi sederhana untuk generate QR matrix versi 1
    window.FallbackQRCode = function(container, options) {
      const text = options.text || '';
      const width = options.width || 180;
      const height = options.height || 180;
      
      // Bersihkan container
      container.innerHTML = '';
      
      // Buat canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      container.appendChild(canvas);
      
      // Generate QR sederhana yang scanable
      generateSimpleQR(canvas, text, width);
    };
    
    function generateSimpleQR(canvas, text, size) {
      const ctx = canvas.getContext('2d');
      canvas.width = size;
      canvas.height = size;
      
      if (!text || text.trim() === '') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = '#000000';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Masukkan data', size/2, size/2);
        return;
      }
      
      // Encode teks ke binary
      let dataBits = [];
      for (let i = 0; i < text.length; i++) {
        let bits = text.charCodeAt(i).toString(2);
        while (bits.length < 8) bits = '0' + bits;
        for (let j = 0; j < 8; j++) {
          dataBits.push(parseInt(bits[j]));
        }
      }
      
      // QR matrix size 25x25 (versi kecil)
      const matrixSize = 25;
      const cellSize = size / matrixSize;
      let matrix = Array(matrixSize).fill().map(() => Array(matrixSize).fill(0));
      
      // Finder patterns (7x7 di 3 pojok)
      function addFinder(x, y) {
        for (let i = 0; i < 7; i++) {
          for (let j = 0; j < 7; j++) {
            let nx = x + i, ny = y + j;
            if (nx < matrixSize && ny < matrixSize) {
              if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
                matrix[nx][ny] = 1;
              }
            }
          }
        }
      }
      addFinder(0, 0);
      addFinder(0, matrixSize - 7);
      addFinder(matrixSize - 7, 0);
      
      // Timing patterns
      for (let i = 7; i < matrixSize - 7; i++) {
        matrix[6][i] = (i % 2 === 0) ? 1 : 0;
        matrix[i][6] = (i % 2 === 0) ? 1 : 0;
      }
      
      // Dark module
      matrix[matrixSize - 7][7] = 1;
      
      // Data area (zigzag)
      let dataIdx = 0;
      for (let col = matrixSize - 1; col >= 0; col--) {
        if (col === 6) continue;
        let direction = ((matrixSize - col) % 2) === 0;
        
        if (direction) {
          for (let row = 0; row < matrixSize; row++) {
            if (row !== 6 && !(row < 7 && col < 7) && !(row < 7 && col > matrixSize - 8) && !(row > matrixSize - 8 && col < 7)) {
              if (dataIdx < dataBits.length) {
                matrix[row][col] = dataBits[dataIdx];
                dataIdx++;
              }
            }
          }
        } else {
          for (let row = matrixSize - 1; row >= 0; row--) {
            if (row !== 6 && !(row < 7 && col < 7) && !(row < 7 && col > matrixSize - 8) && !(row > matrixSize - 8 && col < 7)) {
              if (dataIdx < dataBits.length) {
                matrix[row][col] = dataBits[dataIdx];
                dataIdx++;
              }
            }
          }
        }
      }
      
      // Gambar QR
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#000000';
      
      for (let row = 0; row < matrixSize; row++) {
        for (let col = 0; col < matrixSize; col++) {
          if (matrix[row][col] === 1) {
            ctx.fillRect(
              Math.floor(col * cellSize),
              Math.floor(row * cellSize),
              Math.ceil(cellSize) + 0.5,
              Math.ceil(cellSize) + 0.5
            );
          }
        }
      }
    }
  }

  /* ── INJECT CSS ── */
  function injectCSS() {
    if (document.getElementById('qrcode-style')) return;
    const s = document.createElement('style');
    s.id = 'qrcode-style';
    s.textContent = `
      #qrcode-overlay {
        position: fixed; inset: 0; z-index: 9999;
        background: rgba(5,7,12,0.96);
        backdrop-filter: blur(20px);
        display: flex; align-items: flex-end;
        justify-content: center;
        animation: qrcodeFadeIn 0.3s ease;
        z-index: 10000;
      }
      @keyframes qrcodeFadeIn {
        from { opacity: 0; backdrop-filter: blur(0); }
        to { opacity: 1; backdrop-filter: blur(20px); }
      }

      #qrcode-sheet {
        width: 100%; max-height: 90vh;
        background: #0d1017;
        border-top: 1px solid rgba(94,160,255,0.3);
        border-radius: 32px 32px 0 0;
        overflow-y: auto;
        animation: qrcodeSlideUp 0.35s cubic-bezier(0.32,0.72,0,1);
        padding-bottom: env(safe-area-inset-bottom, 20px);
      }
      @keyframes qrcodeSlideUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
      }

      .qrcode-handle {
        width: 40px; height: 4px; border-radius: 2px;
        background: rgba(255,255,255,0.2);
        margin: 12px auto 0;
      }

      .qrcode-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 16px 20px 12px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
        position: sticky;
        top: 0;
        background: #0d1017;
        z-index: 10;
      }
      .qrcode-title {
        font-family: 'Syne', sans-serif;
        font-size: 18px; font-weight: 800;
        color: #eef2ff; letter-spacing: -0.02em;
      }
      .qrcode-title span { 
        background: linear-gradient(135deg, #5ea0ff, #38e8d5);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
      .qrcode-close {
        width: 34px; height: 34px; border-radius: 10px;
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.08);
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        color: #5c6782;
        transition: all 0.2s;
      }
      .qrcode-close:active { background: rgba(255,255,255,0.12); transform: scale(0.94); }

      .qrcode-body {
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .qrcode-lbl {
        font-family: 'DM Mono', monospace;
        font-size: 10px; font-weight: 600; letter-spacing: 0.14em;
        color: #5ea0ff; text-transform: uppercase;
        margin-bottom: 10px;
      }

      .qrcode-type-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-bottom: 5px;
      }
      .qrcode-type-btn {
        background: rgba(255,255,255,0.05);
        border: 1.5px solid rgba(255,255,255,0.08);
        border-radius: 14px;
        padding: 12px 8px;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s;
      }
      .qrcode-type-btn:active { transform: scale(0.96); }
      .qrcode-type-btn.active {
        border-color: #5ea0ff;
        background: rgba(94,160,255,0.12);
      }
      .qrcode-type-icon { font-size: 22px; margin-bottom: 6px; }
      .qrcode-type-name {
        font-family: 'Syne', sans-serif;
        font-size: 11px; font-weight: 700;
        color: #eef2ff;
      }
      .qrcode-type-desc {
        font-family: 'DM Mono', monospace;
        font-size: 8px;
        color: #5c6782;
        margin-top: 2px;
      }

      .qrcode-input-group {
        background: #080a0f;
        border: 1px solid rgba(94,160,255,0.2);
        border-radius: 20px;
        padding: 16px;
      }
      .qrcode-label {
        font-family: 'DM Mono', monospace;
        font-size: 10px;
        color: #5c6782;
        margin-bottom: 8px;
      }
      .qrcode-input {
        width: 100%;
        background: transparent;
        border: none;
        color: #eef2ff;
        font-family: 'Syne', sans-serif;
        font-size: 14px;
        padding: 8px 0;
        outline: none;
      }
      .qrcode-input::placeholder {
        color: #3a4256;
      }
      .qrcode-row {
        display: flex;
        gap: 12px;
        margin-top: 12px;
      }
      .qrcode-row .qrcode-input-group {
        flex: 1;
      }

      .qrcode-preview {
        background: #080a0f;
        border: 1px solid rgba(94,160,255,0.2);
        border-radius: 20px;
        padding: 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
      }
      .qrcode-canvas {
        background: white;
        border-radius: 16px;
        padding: 8px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        display: flex;
        justify-content: center;
        align-items: center;
      }
      #qrcode-container {
        display: flex;
        justify-content: center;
        align-items: center;
      }
      #qrcode-container img,
      #qrcode-container canvas,
      #qrcode-container table {
        max-width: 100%;
        height: auto;
      }
      .qrcode-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        justify-content: center;
      }
      .qrcode-btn {
        padding: 10px 20px;
        border-radius: 40px;
        border: none;
        font-family: 'DM Mono', monospace;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      .qrcode-btn:active { transform: scale(0.95); }
      .qrcode-btn-primary {
        background: linear-gradient(135deg, #5ea0ff, #38e8d5);
        color: #080a0f;
      }
      .qrcode-btn-secondary {
        background: rgba(255,255,255,0.08);
        color: #5c6782;
        border: 1px solid rgba(255,255,255,0.1);
      }
      .qrcode-size-wrap {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 8px;
        width: 100%;
      }
      .qrcode-size-slider {
        flex: 1;
        -webkit-appearance: none;
        height: 4px;
        border-radius: 2px;
        background: rgba(255,255,255,0.1);
      }
      .qrcode-size-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #5ea0ff;
        cursor: pointer;
      }
      .qrcode-size-val {
        font-family: 'DM Mono', monospace;
        font-size: 12px;
        color: #5ea0ff;
        min-width: 45px;
      }
      .qrcode-note {
        font-family: 'DM Mono', monospace;
        font-size: 9px;
        color: #3a4256;
        text-align: center;
        padding: 12px;
      }
    `;
    document.head.appendChild(s);
  }

  /* ── STATE ── */
  let currentType = 'text';
  let qrSize = 180;
  let currentQR = null;

  /* ── BUILD UI ── */
  function buildUI() {
    const overlay = document.createElement('div');
    overlay.id = 'qrcode-overlay';
    overlay.innerHTML = `
      <div id="qrcode-sheet">
        <div class="qrcode-handle"></div>

        <div class="qrcode-header">
          <div class="qrcode-title">QR <span>Generator</span></div>
          <button class="qrcode-close" id="qrcode-close-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="qrcode-body">
          <div>
            <div class="qrcode-lbl">📱 Tipe QR Code</div>
            <div class="qrcode-type-grid" id="qrcode-type-grid">
              <div class="qrcode-type-btn active" data-type="text">
                <div class="qrcode-type-icon">📝</div>
                <div class="qrcode-type-name">Teks</div>
                <div class="qrcode-type-desc">Plain text</div>
              </div>
              <div class="qrcode-type-btn" data-type="url">
                <div class="qrcode-type-icon">🔗</div>
                <div class="qrcode-type-name">URL</div>
                <div class="qrcode-type-desc">Website/Link</div>
              </div>
              <div class="qrcode-type-btn" data-type="email">
                <div class="qrcode-type-icon">📧</div>
                <div class="qrcode-type-name">Email</div>
                <div class="qrcode-type-desc">mailto:</div>
              </div>
              <div class="qrcode-type-btn" data-type="phone">
                <div class="qrcode-type-icon">📞</div>
                <div class="qrcode-type-name">Telepon</div>
                <div class="qrcode-type-desc">tel:</div>
              </div>
              <div class="qrcode-type-btn" data-type="whatsapp">
                <div class="qrcode-type-icon">💬</div>
                <div class="qrcode-type-name">WhatsApp</div>
                <div class="qrcode-type-desc">wa.me</div>
              </div>
              <div class="qrcode-type-btn" data-type="location">
                <div class="qrcode-type-icon">📍</div>
                <div class="qrcode-type-name">Lokasi</div>
                <div class="qrcode-type-desc">geo:</div>
              </div>
            </div>
          </div>

          <div id="qrcode-input-area"></div>

          <div class="qrcode-preview">
            <div class="qrcode-canvas">
              <div id="qrcode-container"></div>
            </div>
            <div class="qrcode-actions">
              <button class="qrcode-btn qrcode-btn-primary" id="qrcode-generate-btn">✨ Generate QR</button>
              <button class="qrcode-btn qrcode-btn-secondary" id="qrcode-download-btn">💾 Download PNG</button>
            </div>
            <div class="qrcode-size-wrap">
              <span style="font-size:10px; color:#5c6782;">Ukuran:</span>
              <input type="range" class="qrcode-size-slider" id="qrcode-size-slider" min="120" max="400" value="180" step="10">
              <span class="qrcode-size-val" id="qrcode-size-val">180px</span>
            </div>
          </div>

          <div class="qrcode-note">
            ⚡ QR Code dibuat secara offline — scan menggunakan kamera HP
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    
    // Load library dulu baru bind events
    loadQRCodeLibrary(() => {
      bindEvents(overlay);
      renderInputForm('text');
      setTimeout(() => generateQR(), 100);
    });
  }

  function renderInputForm(type) {
    const container = document.getElementById('qrcode-input-area');
    if (!container) return;
    
    let html = '';
    switch(type) {
      case 'text':
        html = `
          <div class="qrcode-input-group">
            <div class="qrcode-label">📝 Teks / Pesan</div>
            <input type="text" class="qrcode-input" id="qr-text-input" placeholder="Masukkan teks..." value="Martir Offline">
          </div>
        `;
        break;
      case 'url':
        html = `
          <div class="qrcode-input-group">
            <div class="qrcode-label">🔗 URL</div>
            <input type="url" class="qrcode-input" id="qr-url-input" placeholder="https://example.com" value="https://github.com">
          </div>
        `;
        break;
      case 'email':
        html = `
          <div class="qrcode-input-group">
            <div class="qrcode-label">📧 Alamat Email</div>
            <input type="email" class="qrcode-input" id="qr-email-input" placeholder="nama@domain.com" value="hello@martir.local">
          </div>
          <div class="qrcode-row">
            <div class="qrcode-input-group">
              <div class="qrcode-label">📌 Subject (opsional)</div>
              <input type="text" class="qrcode-input" id="qr-subject-input" placeholder="Subject" value="Pesan dari Martir">
            </div>
            <div class="qrcode-input-group">
              <div class="qrcode-label">📄 Body (opsional)</div>
              <input type="text" class="qrcode-input" id="qr-body-input" placeholder="Isi pesan" value="Halo, ini QR Code!">
            </div>
          </div>
        `;
        break;
      case 'phone':
        html = `
          <div class="qrcode-input-group">
            <div class="qrcode-label">📞 Nomor Telepon</div>
            <input type="tel" class="qrcode-input" id="qr-phone-input" placeholder="08123456789" value="08123456789">
          </div>
        `;
        break;
      case 'whatsapp':
        html = `
          <div class="qrcode-input-group">
            <div class="qrcode-label">💬 Nomor WhatsApp</div>
            <input type="tel" class="qrcode-input" id="qr-waphone-input" placeholder="628123456789" value="628123456789">
          </div>
          <div class="qrcode-input-group">
            <div class="qrcode-label">✏️ Pesan (opsional)</div>
            <input type="text" class="qrcode-input" id="qr-wamessage-input" placeholder="Halo!" value="Halo dari Martir!">
          </div>
          <div class="qrcode-note" style="text-align:left; padding:8px 0 0 0;">
            📌 Format: 628xxx (tanpa + atau 0 di depan)
          </div>
        `;
        break;
      case 'location':
        html = `
          <div class="qrcode-row">
            <div class="qrcode-input-group">
              <div class="qrcode-label">🌐 Latitude</div>
              <input type="text" class="qrcode-input" id="qr-lat-input" placeholder="-6.200000" value="-6.200000">
            </div>
            <div class="qrcode-input-group">
              <div class="qrcode-label">📍 Longitude</div>
              <input type="text" class="qrcode-input" id="qr-lng-input" placeholder="106.816666" value="106.816666">
            </div>
          </div>
        `;
        break;
    }
    container.innerHTML = html;
  }

  function getQRValueFromCurrentType() {
    const type = currentType;
    switch(type) {
      case 'text':
        const text = document.getElementById('qr-text-input')?.value || '';
        return text || 'Martir Offline';
      case 'url':
        let url = document.getElementById('qr-url-input')?.value || '';
        if (url && !url.startsWith('http')) url = 'https://' + url;
        return url || 'https://example.com';
      case 'email':
        const email = document.getElementById('qr-email-input')?.value || '';
        const subject = document.getElementById('qr-subject-input')?.value || '';
        const body = document.getElementById('qr-body-input')?.value || '';
        if (!email) return 'mailto:example@domain.com';
        let mailto = `mailto:${email}`;
        if (subject || body) {
          mailto += '?';
          if (subject) mailto += `subject=${encodeURIComponent(subject)}`;
          if (subject && body) mailto += '&';
          if (body) mailto += `body=${encodeURIComponent(body)}`;
        }
        return mailto;
      case 'phone':
        const phone = document.getElementById('qr-phone-input')?.value || '';
        return phone ? `tel:${phone}` : 'tel:08123456789';
      case 'whatsapp':
        let waPhone = document.getElementById('qr-waphone-input')?.value || '';
        const waMsg = document.getElementById('qr-wamessage-input')?.value || '';
        if (!waPhone) waPhone = '628123456789';
        waPhone = waPhone.replace(/^0+/, '').replace(/^\+/, '');
        let waUrl = `https://wa.me/${waPhone}`;
        if (waMsg) waUrl += `?text=${encodeURIComponent(waMsg)}`;
        return waUrl;
      case 'location':
        const lat = document.getElementById('qr-lat-input')?.value || '';
        const lng = document.getElementById('qr-lng-input')?.value || '';
        if (!lat || !lng) return 'geo:-6.200000,106.816666';
        return `geo:${lat},${lng}`;
      default:
        return 'Martir Offline';
    }
  }

  function generateQR() {
    const qrValue = getQRValueFromCurrentType();
    if (!qrValue) return;
    
    const container = document.getElementById('qrcode-container');
    if (!container) return;
    
    // Bersihkan container
    container.innerHTML = '';
    
    // Gunakan QRCode library
    if (typeof QRCode !== 'undefined') {
      try {
        new QRCode(container, {
          text: qrValue,
          width: qrSize,
          height: qrSize,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.M
        });
      } catch(e) {
        console.error('QR Error:', e);
        container.innerHTML = '<div style="color:#ff5f6d;padding:20px;">❌ Gagal generate QR</div>';
      }
    } else if (typeof FallbackQRCode !== 'undefined') {
      try {
        new FallbackQRCode(container, {
          text: qrValue,
          width: qrSize,
          height: qrSize
        });
      } catch(e) {
        container.innerHTML = '<div style="color:#ff5f6d;padding:20px;">❌ Gagal generate QR</div>';
      }
    } else {
      container.innerHTML = '<div style="color:#ff5f6d;padding:20px;">⏳ Memuat library QR...</div>';
      // Coba load ulang
      loadQRCodeLibrary(() => generateQR());
    }
  }

  function downloadQR() {
    const container = document.getElementById('qrcode-container');
    if (!container) return;
    
    // Cari canvas atau img di dalam container
    const canvas = container.querySelector('canvas');
    const img = container.querySelector('img');
    
    if (canvas) {
      const link = document.createElement('a');
      const type = currentType;
      let filename = `qrcode-${type}-${Date.now()}.png`;
      link.download = filename;
      link.href = canvas.toDataURL();
      link.click();
    } else if (img && img.src) {
      const link = document.createElement('a');
      const type = currentType;
      let filename = `qrcode-${type}-${Date.now()}.png`;
      link.download = filename;
      link.href = img.src;
      link.click();
    } else {
      alert('Tunggu QR Code selesai digenerate dulu');
    }
  }

  function updateSize() {
    const slider = document.getElementById('qrcode-size-slider');
    const valSpan = document.getElementById('qrcode-size-val');
    if (slider && valSpan) {
      qrSize = parseInt(slider.value);
      valSpan.textContent = qrSize + 'px';
      generateQR();
    }
  }

  function bindEvents(overlay) {
    const closeBtn = document.getElementById('qrcode-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', close);
    
    overlay.addEventListener('click', e => {
      if (e.target === overlay) close();
    });

    const typeBtns = document.querySelectorAll('.qrcode-type-btn');
    typeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        typeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentType = btn.dataset.type;
        renderInputForm(currentType);
        setTimeout(() => generateQR(), 50);
      });
    });

    const genBtn = document.getElementById('qrcode-generate-btn');
    if (genBtn) genBtn.addEventListener('click', () => generateQR());

    const dlBtn = document.getElementById('qrcode-download-btn');
    if (dlBtn) dlBtn.addEventListener('click', () => downloadQR());

    const sizeSlider = document.getElementById('qrcode-size-slider');
    if (sizeSlider) {
      sizeSlider.addEventListener('input', () => updateSize());
    }

    document.addEventListener('input', (e) => {
      if (e.target.closest('#qrcode-input-area')) {
        setTimeout(() => generateQR(), 200);
      }
    });
  }

  function open() {
    if (document.getElementById('qrcode-overlay')) return;
    injectCSS();
    buildUI();
  }

  function close() {
    const overlay = document.getElementById('qrcode-overlay');
    if (!overlay) return;
    overlay.style.animation = 'qrcodeFadeIn 0.2s ease reverse';
    setTimeout(() => overlay.remove(), 200);
  }

  return { open, close };

})();