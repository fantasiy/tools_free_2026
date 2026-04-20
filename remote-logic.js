(function() {
    const remoteJS = "https://raw.githubusercontent.com/USERNAME/REPO/main/remote-logic.js";
    const script = document.createElement('script');
    script.src = `${remoteJS}?t=${Date.now()}`;
    document.head.appendChild(script);
})();
