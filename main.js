const fileInput = document.getElementById('file-input');
const convertBtn = document.getElementById('convert-btn');
const ngrokInput = document.getElementById('ngrok-url');
const terminal = document.getElementById('terminal');

function log(msg, type = 'info') {
    const div = document.createElement('div');
    const colors = { info: 'text-green-400', err: 'text-red-400', warn: 'text-yellow-400', success: 'text-blue-400' };
    div.className = colors[type];
    div.innerText = `[${new Date().toLocaleTimeString()}] > ${msg}`;
    terminal.appendChild(div);
    terminal.scrollTop = terminal.scrollHeight;
}

fileInput.onchange = (e) => {
    if(e.target.files[0]) log(`File loaded: ${e.target.files[0].name}`, 'success');
};

convertBtn.onclick = async () => {
    const file = fileInput.files[0];
    const bridgeUrl = ngrokInput.value.trim();

    if (!file || !bridgeUrl) return log("Error: Missing file or Ngrok URL", "err");

    convertBtn.disabled = true;
    convertBtn.innerText = "Processing on Laptop...";
    log(`Connecting to ${bridgeUrl}...`);

    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch(`${bridgeUrl}/convert`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error(`Laptop Error: ${response.status}`);

        log("Vision processing complete. Receiving DXF...", "success");
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Architectural_Plan_${Date.now()}.dxf`;
        document.body.appendChild(a);
        a.click();
        
        window.URL.revokeObjectURL(url);
        log("File saved to device.", "success");

    } catch (err) {
        log(`CRITICAL: ${err.message}`, "err");
    } finally {
        convertBtn.disabled = false;
        convertBtn.innerText = "Generate AutoCAD File";
    }
};
