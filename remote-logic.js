// remote-logic.js
window.dark6_init = function() {
    // 1. GUI LOGIN
    const loginBox = document.createElement('div');
    loginBox.id = "d6-login";
    loginBox.innerHTML = `
        <div style="background:#ff0055;padding:10px;font-weight:bold;color:white;text-align:center;">ADMIN AUTHENTICATION</div>
        <div style="padding:15px;background:#111;border:1px solid #ff0055;border-top:none;">
            <input type="text" id="d6-mail" placeholder="Gmail" style="width:100%;margin-bottom:10px;background:#000;color:#fff;border:1px solid #333;padding:5px;">
            <input type="password" id="d6-pass" placeholder="Password" style="width:100%;margin-bottom:10px;background:#000;color:#fff;border:1px solid #333;padding:5px;">
            <button id="d6-auth" style="width:100%;background:#ff0055;color:white;border:none;padding:8px;cursor:pointer;font-weight:bold;">LOGIN</button>
        </div>
    `;
    Object.assign(loginBox.style, {
        position:'fixed', top:'50%', left:'50%', transform:'translate(-50%, -50%)',
        width:'280px', zIndex:2000000, fontFamily:'monospace', boxShadow:'0 0 30px #000'
    });
    document.body.appendChild(loginBox);

    document.getElementById('d6-auth').onclick = function() {
        const mail = document.getElementById('d6-mail').value;
        const pass = document.getElementById('d6-pass').value;

        if (mail === "Admin123" && pass === "Admin124") {
            loginBox.remove();
            showMasterGUI();
        } else {
            alert("WRONG CREDENTIALS!");
        }
    };

    // 2. GUI MASTER ASLI (Sembunyi di balik login)
    function showMasterGUI() {
        const master = document.createElement('div');
        master.innerHTML = `
            <div style="background:#ff0055;padding:10px;font-weight:bold;color:white;">DARK6 MASTER PANEL</div>
            <div style="padding:15px;background:rgba(0,0,0,0.95);border:1px solid #ff0055;border-top:none;">
                <button class="m-btn" onclick="location.reload()">♻️ FORCE RESTART</button>
                <button class="m-btn" onclick="document.body.style.filter='invert(1)'">🌓 INVERT COLORS</button>
                <button class="m-btn" onclick="alert('System Hijacked!')">🧪 DEBUG HOOK</button>
                <textarea id="m-js" placeholder="Inject Custom JS..." style="width:100%;background:#000;color:#0f0;margin-top:10px;font-size:10px;"></textarea>
                <button onclick="eval(document.getElementById('m-js').value)" style="width:100%;background:#0f0;color:#000;border:none;margin-top:5px;cursor:pointer;">RUN JS</button>
            </div>
            <style>.m-btn{width:100%;background:#222;color:#fff;border:1px solid #444;margin-bottom:5px;padding:8px;cursor:pointer;text-align:left;font-family:monospace;}</style>
        `;
        Object.assign(master.style, {
            position:'fixed', top:'20px', left:'20px', width:'240px', zIndex:2000001,
            border:'2px solid #ff0055', fontFamily:'monospace', boxShadow:'0 0 20px #ff0055'
        });
        document.body.appendChild(master);
    }
};
