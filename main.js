// Main application logic - UI controls and initialization

window.onload = function() {
    const canvas = document.getElementById('fan-canvas');
    
    // Initialize WebGL and fan model
    if (!init(canvas)) {
        console.error('Failed to initialize WebGL');
        return;
    }
    
    // Setup UI controls
    setupControls(canvas);
    
    // Start animation
    requestAnimationFrame(animate);
    
    console.log('🎬 Animation started!');
};

function setupControls(canvas) {
    // Oscillation controls
    const oscillationToggle = document.getElementById('oscillationToggle');
    const oscillationSpeedSlider = document.getElementById('oscillationSpeed');
    const oscillationAngleSlider = document.getElementById('oscillationAngle');
    
    oscillationToggle.addEventListener('change', (e) => {
        oscillationEnabled = e.target.checked;
        console.log('🔄 Oscillation:', oscillationEnabled ? 'ON' : 'OFF');
    });
    
    oscillationSpeedSlider.addEventListener('input', (e) => {
        oscillationSpeed = parseFloat(e.target.value);
        document.getElementById('oscillationSpeedValue').textContent = 
            oscillationSpeed.toFixed(1);
    });
    
    oscillationAngleSlider.addEventListener('input', (e) => {
        maxOscillationAngle = parseFloat(e.target.value);
        document.getElementById('oscillationAngleValue').textContent = 
            maxOscillationAngle + '°';
    });
    
    // Blade rotation controls
    const bladeRotationToggle = document.getElementById('bladeRotationToggle');
    const bladeSpeedSlider = document.getElementById('bladeSpeed');
    
    bladeRotationToggle.addEventListener('change', (e) => {
        bladeRotationEnabled = e.target.checked;
        console.log('⚡ Blade rotation:', bladeRotationEnabled ? 'ON' : 'OFF');
    });
    
    bladeSpeedSlider.addEventListener('input', (e) => {
        bladeSpeed = parseFloat(e.target.value);
        document.getElementById('bladeSpeedValue').textContent = bladeSpeed;
    });
    
    // Camera controls
    const cameraDistanceSlider = document.getElementById('cameraDistance');
    const cameraHeightSlider = document.getElementById('cameraHeight');
    const cameraAngleSlider = document.getElementById('cameraAngle');
    
    cameraDistanceSlider.addEventListener('input', (e) => {
        cameraDistance = parseFloat(e.target.value);
        document.getElementById('cameraDistanceValue').textContent = cameraDistance;
    });
    
    cameraHeightSlider.addEventListener('input', (e) => {
        cameraHeight = parseFloat(e.target.value);
        document.getElementById('cameraHeightValue').textContent = 
            cameraHeight.toFixed(1);
    });
    
    cameraAngleSlider.addEventListener('input', (e) => {
        cameraAngle = parseFloat(e.target.value);
        document.getElementById('cameraAngleValue').textContent = cameraAngle + '°';
    });
    
    // Reset button
    const resetButton = document.getElementById('resetButton');
    resetButton.addEventListener('click', () => {
        // Reset oscillation
        oscillationToggle.checked = true;
        oscillationEnabled = true;
        oscillationSpeedSlider.value = 2.0;
        oscillationSpeed = 2.0;
        document.getElementById('oscillationSpeedValue').textContent = '2.0';
        oscillationAngleSlider.value = 30;
        maxOscillationAngle = 30;
        document.getElementById('oscillationAngleValue').textContent = '30°';
        
        // Reset blade rotation
        bladeRotationToggle.checked = true;
        bladeRotationEnabled = true;
        bladeSpeedSlider.value = 200;
        bladeSpeed = 200;
        document.getElementById('bladeSpeedValue').textContent = '200';
        
        // Reset camera
        cameraDistanceSlider.value = 8;
        cameraDistance = 8;
        document.getElementById('cameraDistanceValue').textContent = '8';
        cameraHeightSlider.value = 2;
        cameraHeight = 2;
        document.getElementById('cameraHeightValue').textContent = '2.0';
        cameraAngleSlider.value = 45;
        cameraAngle = 45;
        document.getElementById('cameraAngleValue').textContent = '45°';
        
        console.log('🔄 All settings reset to default');
    });
    
    // Mouse controls for canvas
    let isDragging = false;
    let lastMouseX = 0;
    
    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        lastMouseX = e.clientX;
    });
    
    canvas.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    canvas.addEventListener('mouseleave', () => {
        isDragging = false;
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - lastMouseX;
        cameraAngle += deltaX * 0.5;
        
        // Normalize angle
        if (cameraAngle > 360) cameraAngle -= 360;
        if (cameraAngle < 0) cameraAngle += 360;
        
        // Update slider
        cameraAngleSlider.value = cameraAngle;
        document.getElementById('cameraAngleValue').textContent = 
            Math.round(cameraAngle) + '°';
        
        lastMouseX = e.clientX;
    });
    
    // Mouse wheel for zoom
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        
        const delta = e.deltaY > 0 ? 0.5 : -0.5;
        cameraDistance = Math.max(3, Math.min(15, cameraDistance + delta));
        
        // Update slider
        cameraDistanceSlider.value = cameraDistance;
        document.getElementById('cameraDistanceValue').textContent = 
            cameraDistance.toFixed(1);
    });
}
