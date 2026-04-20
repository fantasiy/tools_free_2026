/**
 * pw.js — Password Generator Pro
 * Martir Offline Dashboard
 * 
 * Fitur:
 * - Generate 20-50 password sekaligus
 * - Atur panjang password (minimal 6 digit)
 - Pilih karakter: huruf besar, huruf kecil, angka, simbol
 * - Bisa tambah kalimat/kata wajib
 * - Status keamanan: Normal, Tinggi, Sangat Tinggi
 * - Copy individual password
 */

const PasswordGenerator = (() => {

  /* ── INJECT CSS ── */
  function injectCSS() {
    if (document.getElementById('pwgen-style')) return;
    const s = document.createElement('style');
    s.id = 'pwgen-style';
    s.textContent = `
      #pwgen-overlay {
        position: fixed; inset: 0; z-index: 9999;
        background: rgba(5,7,12,0.96);
        backdrop-filter: blur(20px);
        display: flex; align-items: flex-end;
        justify-content: center;
        animation: pwgenFadeIn 0.3s ease;
      }
      @keyframes pwgenFadeIn {
        from { opacity: 0; backdrop-filter: blur(0); }
        to { opacity: 1; backdrop-filter: blur(20px); }
      }

      #pwgen-sheet {
        width: 100%; max-height: 92vh;
        background: #0d1017;
        border-top: 1px solid rgba(94,160,255,0.3);
        border-radius: 32px 32px 0 0;
        overflow-y: auto;
        animation: pwgenSlideUp 0.35s cubic-bezier(0.32,0.72,0,1);
        padding-bottom: env(safe-area-inset-bottom, 20px);
      }
      @keyframes pwgenSlideUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
      }

      .pwgen-handle {
        width: 40px; height: 4px; border-radius: 2px;
        background: rgba(255,255,255,0.2);
        margin: 12px auto 0;
      }

      .pwgen-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 16px 20px 12px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
        position: sticky;
        top: 0;
        background: #0d1017;
        z-index: 10;
      }
      .pwgen-title {
        font-family: 'Syne', sans-serif;
        font-size: 18px; font-weight: 800;
        color: #eef2ff; letter-spacing: -0.02em;
      }
      .pwgen-title span { 
        background: linear-gradient(135deg, #5ea0ff, #38e8d5);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
      .pwgen-close {
        width: 34px; height: 34px; border-radius: 10px;
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.08);
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        color: #5c6782;
        transition: all 0.2s;
      }
      .pwgen-close:active { background: rgba(255,255,255,0.12); transform: scale(0.94); }

      .pwgen-body {
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .pwgen-lbl {
        font-family: 'DM Mono', monospace;
        font-size: 10px; font-weight: 600; letter-spacing: 0.14em;
        color: #5ea0ff; text-transform: uppercase;
        margin-bottom: 10px;
      }

      /* Settings grid */
      .pwgen-settings {
        background: #080a0f;
        border: 1px solid rgba(94,160,255,0.2);
        border-radius: 20px;
        padding: 16px;
      }
      .pwgen-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 0;
        border-bottom: 1px solid rgba(255,255,255,0.05);
      }
      .pwgen-row:last-child {
        border-bottom: none;
      }
      .pwgen-row label {
        font-family: 'Syne', sans-serif;
        font-size: 13px;
        font-weight: 600;
        color: #eef2ff;
      }
      .pwgen-row .desc {
        font-family: 'DM Mono', monospace;
        font-size: 9px;
        color: #5c6782;
        margin-top: 2px;
      }
      .pwgen-input-number {
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        padding: 8px 12px;
        color: #eef2ff;
        font-family: 'DM Mono', monospace;
        font-size: 14px;
        width: 70px;
        text-align: center;
      }
      .pwgen-check {
        width: 20px;
        height: 20px;
        accent-color: #5ea0ff;
        cursor: pointer;
      }
      .pwgen-slider {
        flex: 1;
        -webkit-appearance: none;
        height: 4px;
        border-radius: 2px;
        background: rgba(255,255,255,0.1);
        margin: 0 12px;
      }
      .pwgen-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #5ea0ff;
        cursor: pointer;
      }
      .pwgen-slider-val {
        font-family: 'DM Mono', monospace;
        font-size: 12px;
        color: #5ea0ff;
        min-width: 35px;
      }

      /* Required text input */
      .pwgen-required-input {
        width: 100%;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 14px;
        padding: 12px 16px;
        color: #eef2ff;
        font-family: 'Syne', sans-serif;
        font-size: 13px;
        outline: none;
        margin-top: 8px;
      }
      .pwgen-required-input:focus {
        border-color: #5ea0ff;
      }

      /* Generate button */
      .pwgen-btn-generate {
        width: 100%;
        padding: 16px;
        border-radius: 16px;
        border: none;
        background: linear-gradient(135deg, #5ea0ff, #38e8d5);
        font-family: 'Syne', sans-serif;
        font-size: 15px;
        font-weight: 800;
        color: #080a0f;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      .pwgen-btn-generate:active {
        transform: scale(0.97);
        opacity: 0.9;
      }

      /* Result grid */
      .pwgen-result-grid {
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-height: 400px;
        overflow-y: auto;
        margin-top: 8px;
      }
      .pwgen-result-grid::-webkit-scrollbar {
        width: 4px;
      }
      .pwgen-result-grid::-webkit-scrollbar-track {
        background: rgba(255,255,255,0.05);
        border-radius: 4px;
      }
      .pwgen-result-grid::-webkit-scrollbar-thumb {
        background: #5ea0ff;
        border-radius: 4px;
      }

      .pwgen-card {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 14px;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        transition: all 0.2s;
      }
      .pwgen-card:active {
        background: rgba(94,160,255,0.08);
      }
      .pwgen-password {
        font-family: 'DM Mono', monospace;
        font-size: 13px;
        font-weight: 500;
        color: #eef2ff;
        word-break: break-all;
        flex: 1;
      }
      .pwgen-strength {
        font-family: 'DM Mono', monospace;
        font-size: 9px;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 20px;
        white-space: nowrap;
      }
      .pwgen-strength.normal {
        background: rgba(245,166,35,0.15);
        color: #f5a623;
        border: 1px solid rgba(245,166,35,0.3);
      }
      .pwgen-strength.high {
        background: rgba(94,160,255,0.15);
        color: #5ea0ff;
        border: 1px solid rgba(94,160,255,0.3);
      }
      .pwgen-strength.very-high {
        background: rgba(57,233,123,0.15);
        color: #39e97b;
        border: 1px solid rgba(57,233,123,0.3);
      }
      .pwgen-copy {
        background: rgba(255,255,255,0.08);
        border: none;
        border-radius: 8px;
        padding: 6px 10px;
        cursor: pointer;
        transition: all 0.2s;
        color: #5c6782;
      }
      .pwgen-copy:active {
        background: rgba(94,160,255,0.3);
        transform: scale(0.92);
      }
      .pwgen-copy.copied {
        background: #39e97b;
        color: #080a0f;
      }

      .pwgen-info {
        font-family: 'DM Mono', monospace;
        font-size: 10px;
        color: #3a4256;
        text-align: center;
        padding: 12px;
      }
    `;
    document.head.appendChild(s);
  }

  /* ── PASSWORD GENERATOR ENGINE ── */
  const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
  const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const NUMBERS = '0123456789';
  const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  function getRandomChar(str) {
    return str[Math.floor(Math.random() * str.length)];
  }

  function shuffleString(str) {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  }

  function generateSinglePassword(length, useUpper, useLower, useNumbers, useSymbols, requiredText) {
    let charset = '';
    if (useLower) charset += LOWERCASE;
    if (useUpper) charset += UPPERCASE;
    if (useNumbers) charset += NUMBERS;
    if (useSymbols) charset += SYMBOLS;
    
    // Minimal karakter yang dipilih
    if (charset.length === 0) {
      charset = LOWERCASE + NUMBERS;
    }
    
    let password = '';
    
    // Jika ada required text, pastikan masuk
    if (requiredText && requiredText.trim()) {
      password = requiredText.trim();
      // Kurangi panjang yang diperlukan
      let remaining = length - password.length;
      if (remaining > 0) {
        for (let i = 0; i < remaining; i++) {
          password += getRandomChar(charset);
        }
      } else {
        password = password.substring(0, length);
      }
    } else {
      for (let i = 0; i < length; i++) {
        password += getRandomChar(charset);
      }
    }
    
    // Shuffle biar required text tidak selalu di depan
    password = shuffleString(password);
    
    return password;
  }

  function calculateStrength(password, length, useUpper, useLower, useNumbers, useSymbols) {
    let score = 0;
    
    // Panjang
    if (length >= 12) score += 2;
    else if (length >= 8) score += 1;
    
    // Variasi karakter
    let hasUpper = /[A-Z]/.test(password);
    let hasLower = /[a-z]/.test(password);
    let hasNumber = /[0-9]/.test(password);
    let hasSymbol = /[^A-Za-z0-9]/.test(password);
    
    if (hasUpper) score += 1;
    if (hasLower) score += 1;
    if (hasNumber) score += 1;
    if (hasSymbol) score += 2;
    
    // Entropy tambahan
    let uniqueChars = new Set(password.split('')).size;
    if (uniqueChars > length * 0.7) score += 1;
    
    if (score >= 7) return 'very-high';
    if (score >= 4) return 'high';
    return 'normal';
  }

  function generatePasswords(count, length, useUpper, useLower, useNumbers, useSymbols, requiredText) {
    const passwords = [];
    for (let i = 0; i < count; i++) {
      const pwd = generateSinglePassword(length, useUpper, useLower, useNumbers, useSymbols, requiredText);
      const strength = calculateStrength(pwd, length, useUpper, useLower, useNumbers, useSymbols);
      passwords.push({ password: pwd, strength });
    }
    return passwords;
  }

  /* ── STATE ── */
  let currentPasswords = [];

  /* ── BUILD UI ── */
  function buildUI() {
    const overlay = document.createElement('div');
    overlay.id = 'pwgen-overlay';
    overlay.innerHTML = `
      <div id="pwgen-sheet">
        <div class="pwgen-handle"></div>

        <div class="pwgen-header">
          <div class="pwgen-title">Password <span>Generator</span></div>
          <button class="pwgen-close" id="pwgen-close-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="pwgen-body">
          <!-- Settings -->
          <div>
            <div class="pwgen-lbl">⚙️ Pengaturan</div>
            <div class="pwgen-settings">
              <div class="pwgen-row">
                <div>
                  <label>Jumlah Password</label>
                  <div class="desc">20 - 50 password</div>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <input type="range" id="pwgen-count-slider" min="20" max="50" value="20" class="pwgen-slider" style="width: 120px;">
                  <span class="pwgen-slider-val" id="pwgen-count-val">20</span>
                </div>
              </div>
              <div class="pwgen-row">
                <div>
                  <label>Panjang Password</label>
                  <div class="desc">Minimal 6 digit</div>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <input type="range" id="pwgen-length-slider" min="6" max="32" value="12" class="pwgen-slider" style="width: 120px;">
                  <span class="pwgen-slider-val" id="pwgen-length-val">12</span>
                </div>
              </div>
              <div class="pwgen-row">
                <div>
                  <label>Huruf Besar (A-Z)</label>
                  <div class="desc">ABCDEFGHIJKLMNOPQRSTUVWXYZ</div>
                </div>
                <input type="checkbox" id="pwgen-upper" class="pwgen-check" checked>
              </div>
              <div class="pwgen-row">
                <div>
                  <label>Huruf Kecil (a-z)</label>
                  <div class="desc">abcdefghijklmnopqrstuvwxyz</div>
                </div>
                <input type="checkbox" id="pwgen-lower" class="pwgen-check" checked>
              </div>
              <div class="pwgen-row">
                <div>
                  <label>Angka (0-9)</label>
                  <div class="desc">0123456789</div>
                </div>
                <input type="checkbox" id="pwgen-numbers" class="pwgen-check" checked>
              </div>
              <div class="pwgen-row">
                <div>
                  <label>Simbol (!@#$%^&*)</label>
                  <div class="desc">!@#$%^&*()_+-=[]{}|;:,.<>?</div>
                </div>
                <input type="checkbox" id="pwgen-symbols" class="pwgen-check" checked>
              </div>
            </div>
          </div>

          <!-- Required Text -->
          <div>
            <div class="pwgen-lbl">📝 Kata/Kalimat Wajib (opsional)</div>
            <input type="text" id="pwgen-required" class="pwgen-required-input" placeholder="Contoh: Martir2024">
          </div>

          <!-- Generate Button -->
          <button class="pwgen-btn-generate" id="pwgen-generate-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Generate Password
          </button>

          <!-- Result -->
          <div id="pwgen-result-area" style="display: none;">
            <div class="pwgen-lbl">🔐 Hasil Password</div>
            <div class="pwgen-result-grid" id="pwgen-result-grid"></div>
          </div>

          <div class="pwgen-info">
            ⚡ Klik password untuk copy | Status: Normal 🟡 | Tinggi 🔵 | Sangat Tinggi 🟢
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    bindEvents(overlay);
  }

  function renderResults(passwords) {
    const resultArea = document.getElementById('pwgen-result-area');
    const resultGrid = document.getElementById('pwgen-result-grid');
    
    if (!resultArea || !resultGrid) return;
    
    if (passwords.length === 0) {
      resultArea.style.display = 'none';
      return;
    }
    
    resultArea.style.display = 'block';
    
    let strengthText = {
      'normal': 'Normal 🟡',
      'high': 'Tinggi 🔵',
      'very-high': 'Sangat Tinggi 🟢'
    };
    
    resultGrid.innerHTML = passwords.map((item, idx) => `
      <div class="pwgen-card" data-password="${item.password.replace(/"/g, '&quot;')}">
        <span class="pwgen-password">${idx + 1}. ${escapeHtml(item.password)}</span>
        <span class="pwgen-strength ${item.strength}">${strengthText[item.strength]}</span>
        <button class="pwgen-copy" data-pwd="${item.password.replace(/"/g, '&quot;')}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
      </div>
    `).join('');
    
    // Event listener untuk copy
    document.querySelectorAll('.pwgen-copy').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const pwd = btn.dataset.pwd;
        if (pwd) {
          try {
            await navigator.clipboard.writeText(pwd);
            btn.classList.add('copied');
            btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
            setTimeout(() => {
              btn.classList.remove('copied');
              btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
            }, 1500);
          } catch (err) {
            alert('Gagal copy: ' + err);
          }
        }
      });
    });
  }
  
  function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  }

  function generate() {
    const count = parseInt(document.getElementById('pwgen-count-slider')?.value || 20);
    const length = parseInt(document.getElementById('pwgen-length-slider')?.value || 12);
    const useUpper = document.getElementById('pwgen-upper')?.checked || true;
    const useLower = document.getElementById('pwgen-lower')?.checked || true;
    const useNumbers = document.getElementById('pwgen-numbers')?.checked || true;
    const useSymbols = document.getElementById('pwgen-symbols')?.checked || true;
    const requiredText = document.getElementById('pwgen-required')?.value || '';
    
    // Validasi minimal satu karakter dipilih
    if (!useUpper && !useLower && !useNumbers && !useSymbols) {
      alert('❌ Pilih minimal satu jenis karakter!');
      return;
    }
    
    currentPasswords = generatePasswords(count, length, useUpper, useLower, useNumbers, useSymbols, requiredText);
    renderResults(currentPasswords);
  }

  function updateSliderValues() {
    const countSlider = document.getElementById('pwgen-count-slider');
    const countVal = document.getElementById('pwgen-count-val');
    const lengthSlider = document.getElementById('pwgen-length-slider');
    const lengthVal = document.getElementById('pwgen-length-val');
    
    if (countSlider && countVal) {
      countSlider.addEventListener('input', () => {
        countVal.textContent = countSlider.value;
      });
    }
    
    if (lengthSlider && lengthVal) {
      lengthSlider.addEventListener('input', () => {
        lengthVal.textContent = lengthSlider.value;
      });
    }
  }

  function bindEvents(overlay) {
    const closeBtn = document.getElementById('pwgen-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', close);
    
    overlay.addEventListener('click', e => {
      if (e.target === overlay) close();
    });
    
    updateSliderValues();
    
    const genBtn = document.getElementById('pwgen-generate-btn');
    if (genBtn) genBtn.addEventListener('click', () => generate());
    
    // Generate awal
    setTimeout(() => generate(), 100);
  }

  function open() {
    if (document.getElementById('pwgen-overlay')) return;
    injectCSS();
    buildUI();
  }

  function close() {
    const overlay = document.getElementById('pwgen-overlay');
    if (!overlay) return;
    overlay.style.animation = 'pwgenFadeIn 0.2s ease reverse';
    setTimeout(() => overlay.remove(), 200);
  }

  return { open, close };

})();