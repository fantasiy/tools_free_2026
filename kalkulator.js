/**
 * kalkulator.js — Kalkulator Pro 15 digit
 * Martir Offline Dashboard
 */

const KalkulatorPro = (() => {

  /* ── STATE ── */
  let currentValue = '0';
  let previousValue = '';
  let operation = null;
  let waitingForOperand = false;
  let lastResult = null;

  /* ── INJECT CSS ── */
  function injectCSS() {
    if (document.getElementById('kalkulator-style')) return;
    const s = document.createElement('style');
    s.id = 'kalkulator-style';
    s.textContent = `
      #kalkulator-overlay {
        position: fixed; inset: 0; z-index: 9999;
        background: rgba(5,7,12,0.96);
        backdrop-filter: blur(20px);
        display: flex; align-items: flex-end;
        justify-content: center;
        animation: kalkulatorFadeIn 0.3s ease;
      }
      @keyframes kalkulatorFadeIn {
        from { opacity: 0; backdrop-filter: blur(0); }
        to { opacity: 1; backdrop-filter: blur(20px); }
      }

      #kalkulator-sheet {
        width: 100%; max-height: 85vh;
        background: #0d1017;
        border-top: 1px solid rgba(94,160,255,0.3);
        border-radius: 32px 32px 0 0;
        overflow-y: auto;
        animation: kalkulatorSlideUp 0.35s cubic-bezier(0.32,0.72,0,1);
        padding-bottom: env(safe-area-inset-bottom, 20px);
      }
      @keyframes kalkulatorSlideUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
      }

      .kalkulator-handle {
        width: 40px; height: 4px; border-radius: 2px;
        background: rgba(255,255,255,0.2);
        margin: 12px auto 0;
      }

      .kalkulator-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 16px 20px 12px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
        position: sticky;
        top: 0;
        background: #0d1017;
        z-index: 10;
      }
      .kalkulator-title {
        font-family: 'Syne', sans-serif;
        font-size: 18px; font-weight: 800;
        color: #eef2ff; letter-spacing: -0.02em;
      }
      .kalkulator-title span { 
        background: linear-gradient(135deg, #5ea0ff, #38e8d5);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
      .kalkulator-close {
        width: 34px; height: 34px; border-radius: 10px;
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.08);
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        color: #5c6782;
        transition: all 0.2s;
      }
      .kalkulator-close:active { background: rgba(255,255,255,0.12); transform: scale(0.94); }

      .kalkulator-body {
        padding: 24px 20px;
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      /* Display */
      .kalkulator-display {
        background: #080a0f;
        border: 1px solid rgba(94,160,255,0.2);
        border-radius: 24px;
        padding: 20px;
        margin-bottom: 8px;
      }
      .kalkulator-expression {
        font-family: 'DM Mono', monospace;
        font-size: 13px;
        color: #5c6782;
        text-align: right;
        min-height: 24px;
        word-break: break-all;
      }
      .kalkulator-result {
        font-family: 'Syne', sans-serif;
        font-size: 36px;
        font-weight: 800;
        color: #eef2ff;
        text-align: right;
        margin-top: 8px;
        word-break: break-all;
        line-height: 1.2;
      }
      .kalkulator-result.small {
        font-size: 24px;
      }

      /* Button grid */
      .kalkulator-buttons {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
      }
      .kalkulator-btn {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 20px;
        padding: 18px 0;
        font-family: 'Syne', sans-serif;
        font-size: 20px;
        font-weight: 600;
        color: #eef2ff;
        cursor: pointer;
        transition: all 0.15s;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .kalkulator-btn:active {
        transform: scale(0.94);
        background: rgba(255,255,255,0.1);
      }
      .kalkulator-btn.operator {
        background: rgba(94,160,255,0.15);
        border-color: rgba(94,160,255,0.3);
        color: #5ea0ff;
      }
      .kalkulator-btn.operator:active {
        background: rgba(94,160,255,0.3);
      }
      .kalkulator-btn.equals {
        background: linear-gradient(135deg, #5ea0ff, #38e8d5);
        color: #080a0f;
        border: none;
      }
      .kalkulator-btn.equals:active {
        transform: scale(0.94);
        opacity: 0.9;
      }
      .kalkulator-btn.clear {
        background: rgba(255,95,109,0.15);
        border-color: rgba(255,95,109,0.3);
        color: #ff5f6d;
      }
      .kalkulator-btn.clear:active {
        background: rgba(255,95,109,0.3);
      }
      .kalkulator-btn.backspace {
        background: rgba(245,166,35,0.15);
        border-color: rgba(245,166,35,0.3);
        color: #f5a623;
      }
      .kalkulator-btn.backspace:active {
        background: rgba(245,166,35,0.3);
      }
      .kalkulator-btn.zero {
        grid-column: span 2;
      }

      /* Info digit */
      .kalkulator-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: rgba(255,255,255,0.03);
        border-radius: 16px;
        font-family: 'DM Mono', monospace;
        font-size: 10px;
        color: #5c6782;
      }
      .kalkulator-digit-count {
        color: #5ea0ff;
        font-weight: 600;
      }
      .kalkulator-warning {
        color: #ff5f6d;
        display: none;
      }
      .kalkulator-warning.show {
        display: inline;
      }

      /* History */
      .kalkulator-history {
        margin-top: 8px;
        border-top: 1px solid rgba(255,255,255,0.06);
        padding-top: 16px;
      }
      .kalkulator-history-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }
      .kalkulator-history-title {
        font-family: 'DM Mono', monospace;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.14em;
        color: #5ea0ff;
        text-transform: uppercase;
      }
      .kalkulator-clear-history {
        font-family: 'DM Mono', monospace;
        font-size: 9px;
        color: #ff5f6d;
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 8px;
        transition: all 0.2s;
      }
      .kalkulator-clear-history:active {
        background: rgba(255,95,109,0.15);
        transform: scale(0.95);
      }
      .kalkulator-history-list {
        max-height: 150px;
        overflow-y: auto;
        font-family: 'DM Mono', monospace;
        font-size: 11px;
      }
      .kalkulator-history-list::-webkit-scrollbar {
        width: 3px;
      }
      .kalkulator-history-list::-webkit-scrollbar-track {
        background: rgba(255,255,255,0.05);
        border-radius: 3px;
      }
      .kalkulator-history-list::-webkit-scrollbar-thumb {
        background: #5ea0ff;
        border-radius: 3px;
      }
      .history-item {
        padding: 8px 12px;
        border-bottom: 1px solid rgba(255,255,255,0.04);
        display: flex;
        justify-content: space-between;
        color: #5c6782;
        cursor: pointer;
        transition: all 0.15s;
      }
      .history-item:active {
        background: rgba(94,160,255,0.1);
        transform: scale(0.98);
      }
      .history-item .history-expr {
        color: #eef2ff;
      }
      .history-item .history-result {
        color: #5ea0ff;
        font-weight: 600;
      }
      .empty-history {
        text-align: center;
        padding: 20px;
        color: #3a4256;
        font-size: 10px;
      }
    `;
    document.head.appendChild(s);
  }

  /* ── FORMAT ANGKA (maks 15 digit) ── */
  function formatNumber(num) {
    if (num === null || num === undefined) return '0';
    
    let str = num.toString();
    
    // Untuk angka desimal, batasi digit
    if (str.includes('.')) {
      const parts = str.split('.');
      const integerPart = parts[0];
      let decimalPart = parts[1];
      
      // Maksimal total digit 15
      const maxTotalDigits = 15;
      const currentDigits = integerPart.length;
      const maxDecimal = Math.max(0, maxTotalDigits - currentDigits - 1);
      
      if (decimalPart.length > maxDecimal) {
        decimalPart = decimalPart.substring(0, maxDecimal);
        str = integerPart + '.' + decimalPart;
        // Hapus trailing zeros
        str = str.replace(/\.?0+$/, '');
        if (str.endsWith('.')) str = str.slice(0, -1);
      }
    }
    
    // Jika masih kelebihan digit (angka besar tanpa desimal)
    if (str.replace('-', '').length > 15) {
      // Gunakan notasi eksponensial
      const numVal = parseFloat(str);
      return numVal.toExponential(10);
    }
    
    return str;
  }

  /* ── CEK MAX DIGIT ── */
  function isMaxDigitsReached(value) {
    const cleanValue = value.replace('-', '').replace('.', '');
    return cleanValue.length >= 15;
  }

  /* ── UPDATE DISPLAY ── */
  function updateDisplay(resultEl, exprEl, digitCountEl, warningEl) {
    if (resultEl) {
      let displayValue = currentValue;
      if (displayValue === 'Error') {
        resultEl.textContent = 'Error';
        resultEl.classList.add('small');
      } else {
        const formatted = formatNumber(parseFloat(displayValue));
        resultEl.textContent = formatted;
        resultEl.classList.toggle('small', formatted.length > 12);
      }
    }
    
    if (exprEl) {
      if (operation && waitingForOperand) {
        exprEl.textContent = `${previousValue} ${getOperatorSymbol(operation)}`;
      } else {
        exprEl.textContent = '';
      }
    }
    
    // Update digit counter
    if (digitCountEl && currentValue !== 'Error') {
      let cleanValue = currentValue.replace('-', '').replace('.', '');
      let digitCount = cleanValue.length;
      if (currentValue.includes('.')) {
        digitCount = cleanValue.length + 1;
      }
      digitCountEl.textContent = `${digitCount}/15 digit`;
      
      if (warningEl) {
        if (digitCount >= 15) {
          warningEl.classList.add('show');
        } else {
          warningEl.classList.remove('show');
        }
      }
    }
  }

  function getOperatorSymbol(op) {
    const symbols = {
      '+': '+',
      '-': '−',
      '×': '×',
      '÷': '÷'
    };
    return symbols[op] || op;
  }

  /* ── OPERASI ARITMATIKA ── */
  function calculate(a, b, op) {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    
    if (isNaN(numA) || isNaN(numB)) return 'Error';
    
    let result;
    switch (op) {
      case '+':
        result = numA + numB;
        break;
      case '-':
        result = numA - numB;
        break;
      case '×':
        result = numA * numB;
        break;
      case '÷':
        if (numB === 0) return 'Error';
        result = numA / numB;
        break;
      default:
        return numB;
    }
    
    // Batasi hasil ke 15 digit
    if (result.toString().replace('-', '').length > 15) {
      return result.toExponential(10);
    }
    
    return result;
  }

  /* ── TAMBAHKAN KE HISTORY ── */
  let history = [];
  
  function addToHistory(expression, result) {
    history.unshift({ expression, result, timestamp: Date.now() });
    // Simpan maksimal 20 history
    if (history.length > 20) history.pop();
    renderHistory();
  }
  
  function renderHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    
    if (history.length === 0) {
      historyList.innerHTML = '<div class="empty-history">Belum ada riwayat</div>';
      return;
    }
    
    historyList.innerHTML = history.map((item, idx) => `
      <div class="history-item" data-idx="${idx}">
        <span class="history-expr">${item.expression}</span>
        <span class="history-result">= ${item.result}</span>
      </div>
    `).join('');
    
    // Add click handlers
    document.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.idx);
        if (!isNaN(idx) && history[idx]) {
          currentValue = history[idx].result.toString();
          previousValue = '';
          operation = null;
          waitingForOperand = false;
          updateDisplayAll();
        }
      });
    });
  }
  
  function clearHistory() {
    history = [];
    renderHistory();
  }

  /* ── UPDATE ALL DISPLAY ELEMENTS ── */
  function updateDisplayAll() {
    const resultEl = document.getElementById('calc-result');
    const exprEl = document.getElementById('calc-expression');
    const digitCountEl = document.getElementById('calc-digit-count');
    const warningEl = document.getElementById('calc-warning');
    updateDisplay(resultEl, exprEl, digitCountEl, warningEl);
  }

  /* ── INPUT ANGKA ── */
  function inputDigit(digit) {
    if (currentValue === 'Error') {
      currentValue = digit;
      waitingForOperand = false;
      updateDisplayAll();
      return;
    }
    
    if (waitingForOperand) {
      currentValue = digit;
      waitingForOperand = false;
      updateDisplayAll();
      return;
    }
    
    // Cek maksimal digit
    if (isMaxDigitsReached(currentValue)) {
      const warningEl = document.getElementById('calc-warning');
      if (warningEl) {
        warningEl.classList.add('show');
        setTimeout(() => warningEl.classList.remove('show'), 1000);
      }
      return;
    }
    
    // Cegah multiple zeros di awal
    if (currentValue === '0' && digit !== '.') {
      currentValue = digit;
    } else {
      currentValue += digit;
    }
    
    updateDisplayAll();
  }
  
  function inputDecimal() {
    if (currentValue === 'Error') {
      currentValue = '0.';
      waitingForOperand = false;
      updateDisplayAll();
      return;
    }
    
    if (waitingForOperand) {
      currentValue = '0.';
      waitingForOperand = false;
      updateDisplayAll();
      return;
    }
    
    if (currentValue.includes('.')) return;
    
    currentValue += '.';
    updateDisplayAll();
  }
  
  function clearAll() {
    currentValue = '0';
    previousValue = '';
    operation = null;
    waitingForOperand = false;
    updateDisplayAll();
  }
  
  function clearEntry() {
    currentValue = '0';
    updateDisplayAll();
  }
  
  function backspace() {
    if (currentValue === 'Error') {
      currentValue = '0';
      updateDisplayAll();
      return;
    }
    
    if (currentValue.length > 1) {
      currentValue = currentValue.slice(0, -1);
    } else {
      currentValue = '0';
    }
    updateDisplayAll();
  }
  
  function toggleSign() {
    if (currentValue === 'Error') return;
    
    let num = parseFloat(currentValue);
    if (isNaN(num)) return;
    
    currentValue = (-num).toString();
    updateDisplayAll();
  }
  
  function percentage() {
    if (currentValue === 'Error') return;
    
    let num = parseFloat(currentValue);
    if (isNaN(num)) return;
    
    currentValue = (num / 100).toString();
    updateDisplayAll();
  }
  
  function setOperation(op) {
    if (currentValue === 'Error') {
      clearAll();
    }
    
    if (operation && !waitingForOperand) {
      // Hitung operasi sebelumnya
      const result = calculate(previousValue, currentValue, operation);
      if (result === 'Error') {
        currentValue = 'Error';
        operation = null;
        previousValue = '';
        waitingForOperand = false;
        updateDisplayAll();
        return;
      }
      currentValue = result.toString();
      addToHistory(`${previousValue} ${getOperatorSymbol(operation)} ${currentValue}`, currentValue);
    }
    
    previousValue = currentValue;
    operation = op;
    waitingForOperand = true;
    updateDisplayAll();
  }
  
  function equals() {
    if (!operation || waitingForOperand) return;
    
    const result = calculate(previousValue, currentValue, operation);
    
    if (result === 'Error') {
      currentValue = 'Error';
      operation = null;
      previousValue = '';
      waitingForOperand = false;
      updateDisplayAll();
      return;
    }
    
    // Simpan ke history
    const expr = `${previousValue} ${getOperatorSymbol(operation)} ${currentValue}`;
    const resultStr = formatNumber(result);
    addToHistory(expr, resultStr);
    
    currentValue = result.toString();
    previousValue = '';
    operation = null;
    waitingForOperand = false;
    updateDisplayAll();
  }

  /* ── BUILD UI ── */
  function buildUI() {
    const overlay = document.createElement('div');
    overlay.id = 'kalkulator-overlay';
    overlay.innerHTML = `
      <div id="kalkulator-sheet">
        <div class="kalkulator-handle"></div>

        <div class="kalkulator-header">
          <div class="kalkulator-title">Kalkulator <span>Pro</span></div>
          <button class="kalkulator-close" id="kalkulator-close-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="kalkulator-body">
          <!-- Display -->
          <div class="kalkulator-display">
            <div class="kalkulator-expression" id="calc-expression"></div>
            <div class="kalkulator-result" id="calc-result">0</div>
          </div>

          <!-- Info -->
          <div class="kalkulator-info">
            <span>Maksimal 15 digit</span>
            <span>
              <span class="kalkulator-digit-count" id="calc-digit-count">1/15 digit</span>
              <span class="kalkulator-warning" id="calc-warning">⚠️ Maksimal digit!</span>
            </span>
          </div>

          <!-- Buttons -->
          <div class="kalkulator-buttons">
            <button class="kalkulator-btn clear" data-action="clear">AC</button>
            <button class="kalkulator-btn backspace" data-action="backspace">⌫</button>
            <button class="kalkulator-btn" data-action="percent">%</button>
            <button class="kalkulator-btn operator" data-op="÷">÷</button>
            
            <button class="kalkulator-btn" data-digit="7">7</button>
            <button class="kalkulator-btn" data-digit="8">8</button>
            <button class="kalkulator-btn" data-digit="9">9</button>
            <button class="kalkulator-btn operator" data-op="×">×</button>
            
            <button class="kalkulator-btn" data-digit="4">4</button>
            <button class="kalkulator-btn" data-digit="5">5</button>
            <button class="kalkulator-btn" data-digit="6">6</button>
            <button class="kalkulator-btn operator" data-op="-">−</button>
            
            <button class="kalkulator-btn" data-digit="1">1</button>
            <button class="kalkulator-btn" data-digit="2">2</button>
            <button class="kalkulator-btn" data-digit="3">3</button>
            <button class="kalkulator-btn operator" data-op="+">+</button>
            
            <button class="kalkulator-btn" data-action="sign">+/−</button>
            <button class="kalkulator-btn" data-digit="0">0</button>
            <button class="kalkulator-btn" data-digit=".">.</button>
            <button class="kalkulator-btn equals" data-action="equals">=</button>
          </div>

          <!-- History -->
          <div class="kalkulator-history">
            <div class="kalkulator-history-header">
              <div class="kalkulator-history-title">📜 Riwayat</div>
              <button class="kalkulator-clear-history" id="clear-history-btn">Hapus</button>
            </div>
            <div class="kalkulator-history-list" id="history-list">
              <div class="empty-history">Belum ada riwayat</div>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    bindEvents(overlay);
  }

  /* ── BIND EVENTS ── */
  function bindEvents(overlay) {
    // Close button
    const closeBtn = document.getElementById('kalkulator-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', close);
    
    overlay.addEventListener('click', e => {
      if (e.target === overlay) close();
    });

    // Clear history
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener('click', () => clearHistory());
    }

    // Number buttons
    document.querySelectorAll('[data-digit]').forEach(btn => {
      btn.addEventListener('click', () => {
        const digit = btn.dataset.digit;
        if (digit === '.') {
          inputDecimal();
        } else {
          inputDigit(digit);
        }
      });
    });

    // Operator buttons
    document.querySelectorAll('[data-op]').forEach(btn => {
      btn.addEventListener('click', () => {
        const op = btn.dataset.op;
        setOperation(op);
      });
    });

    // Action buttons
    const clearBtn = document.querySelector('[data-action="clear"]');
    if (clearBtn) clearBtn.addEventListener('click', () => clearAll());
    
    const backspaceBtn = document.querySelector('[data-action="backspace"]');
    if (backspaceBtn) backspaceBtn.addEventListener('click', () => backspace());
    
    const signBtn = document.querySelector('[data-action="sign"]');
    if (signBtn) signBtn.addEventListener('click', () => toggleSign());
    
    const percentBtn = document.querySelector('[data-action="percent"]');
    if (percentBtn) percentBtn.addEventListener('click', () => percentage());
    
    const equalsBtn = document.querySelector('[data-action="equals"]');
    if (equalsBtn) equalsBtn.addEventListener('click', () => equals());
  }

  /* ── PUBLIC API ── */
  function open() {
    if (document.getElementById('kalkulator-overlay')) return;
    injectCSS();
    buildUI();
  }

  function close() {
    const overlay = document.getElementById('kalkulator-overlay');
    if (!overlay) return;
    overlay.style.animation = 'kalkulatorFadeIn 0.2s ease reverse';
    setTimeout(() => {
      overlay.remove();
      // Reset state
      currentValue = '0';
      previousValue = '';
      operation = null;
      waitingForOperand = false;
    }, 200);
  }

  return { open, close };

})();