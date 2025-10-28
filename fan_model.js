// Fan Model - Hierarchical Modeling Implementation
// Using Matrix Stack for parent-child transformations

let gl;
let shaderProgram;

// Buffers
let vertexBuffer, colorBuffer, indexBuffer;

// Uniform locations
let uModelViewMatrix, uProjectionMatrix;

// Matrix stack for hierarchical transformations
let mvStack = [];
let modelViewMatrix;
let projectionMatrix;

// Animation state
let oscillationAngle = 0;
let bladeAngle = 0;

// Animation parameters (controlled by UI)
let oscillationEnabled = true;
let bladeRotationEnabled = true;
let oscillationSpeed = 2.0;
let maxOscillationAngle = 30;
let bladeSpeed = 200;

// Camera parameters
let cameraDistance = 7;
let cameraHeight = 2.5;
let cameraAngle = 60;

// Geometry data
let fanGeometry = {
  base: null,
  baseAccent: null,  // Black cylinder on top of base
  stand: null,
  motor: null,
  guard: null,
  blade: null,
  controlPanel: null,
  hub: null,
};

// Initialize WebGL
function initGL(canvas) {
  gl = canvas.getContext("webgl2");
  if (!gl) {
    alert("WebGL 2.0 not supported!");
    return false;
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.6, 1.0, 0.6, 1.0);  // Light green background
  gl.enable(gl.DEPTH_TEST);

  return true;
}

// Compile shader
function compileShader(type, source) {
  // Trim whitespace to ensure #version is on first line
  source = source.trim();

  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compilation error:", gl.getShaderInfoLog(shader));
    console.error("Shader source:", source);
    return null;
  }

  return shader;
}

// Initialize shaders
function initShaders() {
  const vertexSource = document
    .getElementById("vertex-shader")
    .textContent.trim();
  const fragmentSource = document
    .getElementById("fragment-shader")
    .textContent.trim();

  const vertexShader = compileShader(gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentSource);

  if (!vertexShader || !fragmentShader) {
    console.error("Failed to compile shaders");
    return false;
  }

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error(
      "Shader program linking error:",
      gl.getProgramInfoLog(shaderProgram)
    );
    return false;
  }

  gl.useProgram(shaderProgram);

  // Get uniform locations
  uModelViewMatrix = gl.getUniformLocation(shaderProgram, "uModelViewMatrix");
  uProjectionMatrix = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");

  return true;
}

// Initialize geometry
function initGeometry() {
  // Create geometry for each part with realistic fan colors matching the reference
  fanGeometry.base = createDisk(0.6, 32, 0, [0.15, 0.15, 0.15], 0.05); // Wider black base with depth
  fanGeometry.baseAccent = createCylinder(0.07, 0.5, 32, [0.1, 0.15, 0.1]); // Black accent cylinder on base
  fanGeometry.stand = createCylinder(0.04, 2.15, 16, [0.85, 0.85, 0.9]); // Taller, thinner silver stand
  
  // Light blue control panel section of the stand
  fanGeometry.controlPanel = createCylinder(0.06, 0.3, 16, [0.8, 0.9, 1.0]);
  
  // Light blue cylindrical motor housing (will be rotated sideways)
  fanGeometry.motor = createCylinder(0.125, 0.4, 32, [0.8, 0.9, 1.0]);

  // Small hub (coin-like) at blade center, same color as motor
  fanGeometry.hub = createCylinder(0.1, 0.02, 20, [0.8, 0.9, 1.0]);
  
  // White guard with more spokes
  fanGeometry.guard = createGuardCage(0.45, 0.12, 48); // Larger radius, more segments for more spokes
  
  // White blades
  fanGeometry.blade = createBlade(0.4, 0.2, [0.95, 0.95, 0.95]); // Longer, white blades
}

// Setup buffers for a geometry
function setupBuffers(geometry) {
  // Vertex buffer
  if (!vertexBuffer) vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(geometry.positions),
    gl.STATIC_DRAW
  );

  const aPosition = gl.getAttribLocation(shaderProgram, "aPosition");
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPosition);

  // Color buffer
  if (!colorBuffer) colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(geometry.colors),
    gl.STATIC_DRAW
  );

  const aColor = gl.getAttribLocation(shaderProgram, "aColor");
  gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aColor);

  // Index buffer
  if (!indexBuffer) indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(geometry.indices),
    gl.STATIC_DRAW
  );

  return geometry.indices.length;
}

// Matrix stack operations
function pushMatrix() {
  mvStack.push(mat4.clone(modelViewMatrix));
}

function popMatrix() {
  if (mvStack.length === 0) {
    throw "Matrix stack underflow!";
  }
  modelViewMatrix = mvStack.pop();
}

// Hierarchical rendering functions

// Draw Fan Base (Root)
function drawFanBase() {
  pushMatrix();

  // Base disk on ground
  mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0.01, 0]);
  mat4.scale(modelViewMatrix, modelViewMatrix, [1.0, 1.0, 1.0]);

  gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);
  const baseCount = setupBuffers(fanGeometry.base);
  gl.drawElements(gl.TRIANGLES, baseCount, gl.UNSIGNED_SHORT, 0);

  // Draw accent cylinder on top of base
  pushMatrix();
  mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0.05, 0]); // Move up to top of base
  gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);
  const accentCount = setupBuffers(fanGeometry.baseAccent);
  gl.drawElements(gl.TRIANGLES, accentCount, gl.UNSIGNED_SHORT, 0);
  popMatrix();

  popMatrix();
}

// Draw Fan Stand (Child of Base)
function drawFanStand() {
  pushMatrix();

  // Main stand cylinder rising from base
  mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, 0]);
  mat4.scale(modelViewMatrix, modelViewMatrix, [1.0, 1.0, 1.0]);

  gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);
  const standCount = setupBuffers(fanGeometry.stand);
  gl.drawElements(gl.TRIANGLES, standCount, gl.UNSIGNED_SHORT, 0);

  // Control panel section near the top
  pushMatrix();
  mat4.translate(modelViewMatrix, modelViewMatrix, [0, 1.5, 0]); // Position control panel near top
  
  gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);
  const controlCount = setupBuffers(fanGeometry.controlPanel);
  gl.drawElements(gl.TRIANGLES, controlCount, gl.UNSIGNED_SHORT, 0);
  
  popMatrix();

  popMatrix();
}

// Draw Fan Motor (Child of Stand) - WITH OSCILLATION
function drawFanMotor() {
  pushMatrix();

  // Move to top of stand plus control panel (2.0 + 0.3)
  mat4.translate(modelViewMatrix, modelViewMatrix, [0, 2.3, 0]);

  // Apply oscillation rotation (this affects all children!)
  if (oscillationEnabled) {
    mat4.rotateY(
      modelViewMatrix,
      modelViewMatrix,
      (oscillationAngle * Math.PI) / 180
    );
  }

  // Slightly offset the motor housing backward and downward
  mat4.translate(modelViewMatrix, modelViewMatrix, [0, -0.06, -0.25]);

  // Rotate the cylinder to lay sideways (90 degrees around X axis)
  mat4.rotateX(modelViewMatrix, modelViewMatrix, Math.PI / 2);

  // Motor housing - drawn at the adjusted position and rotation
  gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);
  const count = setupBuffers(fanGeometry.motor);
  gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);

  popMatrix();
}

// Draw Fan Guard (Child of Motor) - Inherits oscillation
function drawFanGuard() {
  pushMatrix();

  // Move up to middle of motor (motor height is 0.3, so middle is 0.15)
  mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0.15, 0]);

  // Move guard forward in front of motor
  mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, 0.2]);

  // Rotate guard to face forward
  mat4.rotateY(modelViewMatrix, modelViewMatrix, Math.PI / 2);

  gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);
  const count = setupBuffers(fanGeometry.guard);
  gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);

  popMatrix();
}

// Draw Fan Blades (Child of Motor) - Inherits oscillation + own rotation
function drawFanBlades() {
  pushMatrix();

  // Move up to middle of motor (motor height is 0.3, so middle is 0.15)
  mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0.15, 0]);

  // Move blades slightly forward (just in front of motor face)
  mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, 0.16]);

  // Lift the blades slightly upward so they sit a bit higher relative to the motor
  // Positive Y moves upward
  mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0.58, -0.015]);

    // Draw small hub (coin-like) at blade center
    pushMatrix();
    // Rotate cylinder so its axis aligns with Z (default axis is Y in createCylinder)
    mat4.rotateX(modelViewMatrix, modelViewMatrix, Math.PI / 2);
    // After rotation the cylinder spans Z from 0..height, so translate -height/2 to center it on blade plane
    mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -0.01]);
    gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);
    const hubCount = setupBuffers(fanGeometry.hub);
    gl.drawElements(gl.TRIANGLES, hubCount, gl.UNSIGNED_SHORT, 0);
    popMatrix();

  // Apply blade rotation (independent of oscillation)
  if (bladeRotationEnabled) {
    mat4.rotateZ(
      modelViewMatrix,
      modelViewMatrix,
      (bladeAngle * Math.PI) / 180
    );
  }

  // Draw 3 blades
  for (let i = 0; i < 3; i++) {
    pushMatrix();

    mat4.rotateZ(modelViewMatrix, modelViewMatrix, (i * 120 * Math.PI) / 180);

    gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);
    const count = setupBuffers(fanGeometry.blade);
    gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);

    popMatrix();
  }

  popMatrix();
}

// Main hierarchical rendering - Preorder traversal
function renderFan() {
  // Start with identity
  modelViewMatrix = mat4.create();

  // Setup camera view
  const eye = [
    cameraDistance * Math.sin((cameraAngle * Math.PI) / 180),
    cameraHeight,
    cameraDistance * Math.cos((cameraAngle * Math.PI) / 180),
  ];
  const center = [0, 1.0, 0];
  const up = [0, 1, 0];

  mat4.lookAt(modelViewMatrix, eye, center, up);

  // Clear stack
  mvStack = [];

  // HIERARCHICAL RENDERING - Preorder Traversal
  // Root: Fan Body (Base + Stand)
  drawFanBase();
  drawFanStand();

  // Save state before motor transformations
  pushMatrix();

  // Child of Stand: Fan Motor (with oscillation)
  drawFanMotor();

  // Save motor state (includes oscillation)
  pushMatrix();

  // Apply oscillation for children
  mat4.translate(modelViewMatrix, modelViewMatrix, [0, 1.5, 0]);
  if (oscillationEnabled) {
    mat4.rotateY(
      modelViewMatrix,
      modelViewMatrix,
      (oscillationAngle * Math.PI) / 180
    );
  }

  // Children of Motor: Guard and Blades (inherit oscillation)
  drawFanGuard();
  drawFanBlades();

  popMatrix(); // Restore before motor
  popMatrix(); // Restore before stand
}

// Initialize everything
function init(canvas) {
  if (!initGL(canvas)) return false;
  if (!initShaders()) return false;

  initGeometry();

  // Setup projection matrix
  projectionMatrix = mat4.create();
  mat4.perspective(
    projectionMatrix,
    (45 * Math.PI) / 180,
    canvas.width / canvas.height,
    0.1,
    100.0
  );
  gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);

  console.log("✅ Fan model initialized successfully!");
  return true;
}

// Animation loop
let lastTime = 0;

function animate(currentTime) {
  // Calculate delta time
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;

  // Update oscillation angle
  if (oscillationEnabled) {
    const oscillationFrequency = oscillationSpeed / 1000;
    oscillationAngle =
      Math.sin(currentTime * oscillationFrequency) * maxOscillationAngle;
  }

  // Update blade rotation
  if (bladeRotationEnabled) {
    bladeAngle += (bladeSpeed * deltaTime) / 1000;
    if (bladeAngle > 360) bladeAngle -= 360;
  }

  // Render
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  renderFan();

  requestAnimationFrame(animate);
}
