const fileInput = document.getElementById('file-input');
const dropZone = document.getElementById('drop-zone');
const convertBtn = document.getElementById('convert-btn');
const statusContainer = document.getElementById('status-container');
const progressBar = document.getElementById('progress-bar');
const statusText = document.getElementById('status-text');

// Handle UI selection
dropZone.onclick = () => fileInput.click();

fileInput.onchange = (e) => {
    if (e.target.files.length > 0) {
        document.getElementById('file-name').innerText = e.target.files[0].name;
    }
};

convertBtn.onclick = async () => {
    const file = fileInput.files[0];
    if (!file) return alert("Please upload an image first.");

    // UI Feedback
    convertBtn.disabled = true;
    statusContainer.classList.remove('hidden');
    
    const formData = new FormData();
    formData.append('planImage', file);

    try {
        updateStatus("Scanning layers...", 30);
        
        const response = await fetch('/api/convert', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Conversion failed');

        updateStatus("Finalizing DXF...", 90);

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "converted_plan.dxf";
        document.body.appendChild(a);
        a.click();
        
        updateStatus("Complete!", 100);
    } catch (err) {
        alert("Error: " + err.message);
        convertBtn.disabled = false;
    }
};

function updateStatus(text, progress) {
    statusText.innerText = text;
    progressBar.style.width = `${progress}%`;
    document.getElementById('status-percent').innerText = `${progress}%`;
}
