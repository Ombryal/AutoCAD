const fileInput = document.getElementById('file-input');
const dropZone = document.getElementById('drop-zone');
const convertBtn = document.getElementById('convert-btn');
const statusBox = document.getElementById('status-box');
const progressBar = document.getElementById('progress-bar');
const statusText = document.getElementById('status-text');

dropZone.onclick = () => fileInput.click();

fileInput.onchange = (e) => {
    if (e.target.files[0]) {
        document.getElementById('file-name').innerText = e.target.files[0].name;
    }
};

convertBtn.onclick = async () => {
    const file = fileInput.files[0];
    if (!file) return alert("Please select a file first.");

    statusBox.classList.remove('hidden');
    convertBtn.disabled = true;

    const formData = new FormData();
    formData.append('image', file);

    try {
        updateProgress("Extracting Layers...", 30);
        
        const response = await fetch('/api/convert', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error("Processing failed.");

        updateProgress("Vectorizing Elements...", 75);

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Plan_${Date.now()}.dxf`;
        document.body.appendChild(a);
        a.click();

        updateProgress("Done!", 100);
    } catch (err) {
        alert(err.message);
        convertBtn.disabled = false;
    }
};

function updateProgress(text, pct) {
    statusText.innerText = text;
    progressBar.style.width = `${pct}%`;
    document.getElementById('status-percent').innerText = `${pct}%`;
}
