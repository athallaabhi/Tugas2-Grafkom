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
let cameraDistance = 8;
let cameraHeight = 2;
let cameraAngle = 45;

// Geometry data
let fanGeometry = {
  base: null,
  stand: null,
  motor: null,
  guard: null,
  blade: null,
};

// Initialize WebGL
function initGL(canvas) {
  gl = canvas.getContext("webgl2");
  if (!gl) {
    alert("WebGL 2.0 not supported!");
    return false;
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.95, 0.95, 1.0, 1.0);
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
  // Create geometry for each part with realistic fan colors
  fanGeometry.base = createDisk(0.5, 32, 0, [0.2, 0.2, 0.2]); // Black base
  fanGeometry.stand = createCylinder(0.05, 1.5, 16, [0.7, 0.7, 0.75]); // Silver stand
  fanGeometry.motor = createCylinder(0.15, 0.3, 16, [0.15, 0.15, 0.15]); // Dark motor
  fanGeometry.guard = createGuardCage(0.4, 0.15, 32); // Black cage guard
  fanGeometry.blade = createBlade(0.35, 0.08, [0.3, 0.5, 0.8]); // Blue blades
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
  const count = setupBuffers(fanGeometry.base);
  gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);

  popMatrix();
}

// Draw Fan Stand (Child of Base)
function drawFanStand() {
  pushMatrix();

  // Stand cylinder rising from base
  mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, 0]);
  mat4.scale(modelViewMatrix, modelViewMatrix, [1.0, 1.0, 1.0]);

  gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);
  const count = setupBuffers(fanGeometry.stand);
  gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);

  popMatrix();
}

// Draw Fan Motor (Child of Stand) - WITH OSCILLATION
function drawFanMotor() {
  pushMatrix();

  // Move to top of stand (stand height = 1.5)
  mat4.translate(modelViewMatrix, modelViewMatrix, [0, 1.5, 0]);

  // Apply oscillation rotation (this affects all children!)
  if (oscillationEnabled) {
    mat4.rotateY(
      modelViewMatrix,
      modelViewMatrix,
      (oscillationAngle * Math.PI) / 180
    );
  }

  // Motor housing - centered at top of stand
  // No additional translation needed, motor is already positioned

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
