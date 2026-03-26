const fileInput = document.getElementById('file-input');
const convertBtn = document.getElementById('convert-btn');
const fileNameDisplay = document.getElementById('file-name');
const terminal = document.getElementById('terminal');

// --- MOBILE DEBUGGER ---
function logToTerminal(msg, type = 'info') {
    const div = document.createElement('div');
    const time = new Date().toLocaleTimeString();
    div.innerText = `[${time}] > ${msg}`;
    
    if (type === 'error') div.className = 'text-red-400';
    if (type === 'success') div.className = 'text-blue-400';
    if (type === 'warn') div.className = 'text-yellow-400';
    
    terminal.appendChild(div);
    terminal.scrollTop = terminal.scrollHeight; // Auto-scroll
}

// Intercept file selection
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        fileNameDisplay.innerText = file.name;
        logToTerminal(`File selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
        
        // Vercel Serverless payload limit check
        if (file.size > 4 * 1024 * 1024) {
            logToTerminal("WARNING: File exceeds 4MB. Vercel will likely reject this.", "warn");
        }
    }
});

// Handle Generation
convertBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) {
        logToTerminal("Error: No file selected.", "error");
        return;
    }

    convertBtn.disabled = true;
    convertBtn.innerText = "Processing...";
    logToTerminal("Initiating API request to /api/convert...");

    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch('/api/convert', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            // Read the error from the backend
            const errorText = await response.text();
            throw new Error(`Server returned ${response.status}: ${errorText}`);
        }

        logToTerminal("Server responded successfully. Downloading blob...", "success");
        
        const blob = await response.blob();
        if (blob.size === 0) throw new Error("Received empty file from server.");

        // Trigger download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `Architectural_Plan_${Date.now()}.dxf`;
        document.body.appendChild(a);
        a.click();
        
        window.URL.revokeObjectURL(url);
        logToTerminal("DXF file downloaded successfully!", "success");

    } catch (err) {
        logToTerminal(`CRITICAL ERROR: ${err.message}`, "error");
    } finally {
        convertBtn.disabled = false;
        convertBtn.innerText = "Generate AutoCAD File";
    }
});
