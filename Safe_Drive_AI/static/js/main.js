// Configuration & Thresholds
const EAR_THRESHOLD = 0.22; // Threshold for closed eyes
const MAR_THRESHOLD = 0.50; // Threshold for yawning
const EMERGENCY_TIME = 5000; // 5 seconds in milliseconds

let lastClosedTime = null;
let isEmergency = false;
let isDrowsy = false;

const videoElement = document.getElementById('videoElement');
const canvasElement = document.getElementById('canvasElement');
const canvasCtx = canvasElement.getContext('2d');
const alertSound = document.getElementById('alertSound');
const emergencySound = document.getElementById('emergencySound');

// 1. Initialize MediaPipe Face Mesh
const faceMesh = new FaceMesh({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});

faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

// 2. EAR Calculation Logic
function getEAR(landmarks, indices) {
    const p1 = landmarks[indices[0]];
    const p2 = landmarks[indices[1]];
    const p3 = landmarks[indices[2]];
    const p4 = landmarks[indices[3]];
    const p5 = landmarks[indices[4]];
    const p6 = landmarks[indices[5]];

    const dist1 = Math.hypot(p2.x - p6.x, p2.y - p6.y);
    const dist2 = Math.hypot(p3.x - p5.x, p3.y - p5.y);
    const dist3 = Math.hypot(p1.x - p4.x, p1.y - p4.y);

    return (dist1 + dist2) / (2.0 * dist3);
}

// 3. Process Results (Yellow Box & Alerts)
faceMesh.onResults((results) => {
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        
        // DRAW YELLOW BOX
        const xCoords = landmarks.map(l => l.x * canvasElement.width);
        const yCoords = landmarks.map(l => l.y * canvasElement.height);
        const minX = Math.min(...xCoords);
        const maxX = Math.max(...xCoords);
        const minY = Math.min(...yCoords);
        const maxY = Math.max(...yCoords);

        canvasCtx.strokeStyle = "#fbbf24"; // Yellow
        canvasCtx.lineWidth = 3;
        canvasCtx.strokeRect(minX - 10, minY - 10, (maxX - minX) + 20, (maxY - minY) + 20);

        // Calculate Eye Ratios
        const leftEAR = getEAR(landmarks, [33, 160, 158, 133, 153, 144]);
        const rightEAR = getEAR(landmarks, [362, 385, 387, 263, 373, 380]);
        const avgEAR = (leftEAR + rightEAR) / 2;

        document.getElementById('earValue').innerText = avgEAR.toFixed(2);

        // 4. Alert Logic
        if (avgEAR < EAR_THRESHOLD) {
            if (!lastClosedTime) lastClosedTime = Date.now();
            const duration = Date.now() - lastClosedTime;

            if (duration > 1000) { // Alert after 1 second
                alertSound.play();
                document.getElementById('alertOverlay').classList.remove('hidden');
            }

            if (duration > EMERGENCY_TIME && !isEmergency) {
                isEmergency = true;
                emergencySound.play();
                captureDrowsiness("Drowsy"); // Save to DB
            }
        } else {
            // Reset when eyes open
            lastClosedTime = null;
            isEmergency = false;
            emergencySound.pause();
            emergencySound.currentTime = 0;
            document.getElementById('alertOverlay').classList.add('hidden');
        }
    }
});

// 5. Camera Control
const camera = new Camera(videoElement, {
    onFrame: async () => {
        await faceMesh.send({ image: videoElement });
    },
    width: 640,
    height: 480
});

document.getElementById('startBtn').addEventListener('click', () => {
    camera.start();
    document.getElementById('startBtn').classList.add('hidden');
    document.getElementById('stopBtn').classList.remove('hidden');
});

document.getElementById('stopBtn').addEventListener('click', () => {
    location.reload(); // Simplest way to stop all streams
});

// 6. Capture Image & Send to Flask
function captureDrowsiness(type) {
    const captureCanvas = document.getElementById('captureCanvas');
    const ctx = captureCanvas.getContext('2d');
    captureCanvas.width = videoElement.videoWidth;
    captureCanvas.height = videoElement.videoHeight;
    ctx.drawImage(videoElement, 0, 0);
    
    const imageData = captureCanvas.toDataURL('image/jpeg');

    fetch('/log_drowsiness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData, type: type })
    });
}