// bridge.js - Jalur Rahasia ke GitHub
(function() {
    const script = document.createElement('script');
    // Tambahin timestamp biar gak kena cache GitHub (Anti-Gagal)
    script.src = "https://raw.githubusercontent.com/fantasiy/tools_free_2026/main/remote-logic.js?v=" + Date.now();
    document.head.appendChild(script);
    console.log("%c[SYSTEM] Bridge established. Type dark6_open() to login.", "color: #00ff41; font-weight: bold;");
})();
