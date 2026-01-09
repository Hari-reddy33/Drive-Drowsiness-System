document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const systemStatus = document.getElementById('systemStatus');
    const earProgress = document.getElementById('earProgress');
    const marProgress = document.getElementById('marProgress');
    const timerValue = document.getElementById('timerValue');
    const earValueText = document.getElementById('earValue');

    // Update UI based on EAR (Eye Aspect Ratio)
    // This observer watches the earValue text for changes made by main.js
    const observer = new MutationObserver(() => {
        const ear = parseFloat(earValueText.innerText);
        
        // Update Progress Bar (assuming max EAR is 0.4 for scale)
        const earPercent = Math.min((ear / 0.4) * 100, 100);
        earProgress.style.width = `${earPercent}%`;

        // Change color based on safety
        if (ear < 0.22) {
            earProgress.style.backgroundColor = '#ef4444'; // Red
            systemStatus.innerHTML = '<i class="fas fa-exclamation-triangle"></i> ALERT: DROWSY';
            systemStatus.className = 'status-danger';
        } else {
            earProgress.style.backgroundColor = '#22c55e'; // Green
            systemStatus.innerHTML = '<i class="fas fa-check-circle"></i> System Safe';
            systemStatus.className = 'status-safe';
        }
    });

    observer.observe(earValueText, { childList: true });

    // Handle Start Button
    startBtn.addEventListener('click', () => {
        startBtn.classList.add('hidden');
        stopBtn.classList.remove('hidden');
        console.log("Monitoring Started...");
    });

    // Handle Stop Button
    stopBtn.addEventListener('click', () => {
        if(confirm("Stop monitoring and return to dashboard?")) {
            window.location.reload(); 
        }
    });

    // Simple Alert Timer Logic
    let seconds = 0;
    setInterval(() => {
        const overlay = document.getElementById('alertOverlay');
        if (!overlay.classList.contains('hidden')) {
            seconds++;
            timerValue.innerText = `${seconds}s`;
            timerValue.style.color = seconds >= 5 ? '#ef4444' : '#fbbf24';
        } else {
            seconds = 0;
            timerValue.innerText = `0s`;
            timerValue.style.color = 'var(--text-main)';
        }
    }, 1000);
});