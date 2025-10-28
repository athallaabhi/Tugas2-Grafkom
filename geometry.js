// Geometry generation functions for fan parts
// Using WebGL to create 3D primitives

// Generate cylinder vertices (for stand, motor housing)
function createCylinder(radius, height, segments, color = [0.8, 0.8, 0.8]) {
    const positions = [];
    const normals = [];
    const colors = [];
    const indices = [];
    
    // Generate vertices for cylinder sides
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * 2 * Math.PI;
        const x = radius * Math.cos(theta);
        const z = radius * Math.sin(theta);
        
        // Bottom vertex
        positions.push(x, 0, z);
        normals.push(Math.cos(theta), 0, Math.sin(theta));
        colors.push(...color);
        
        // Top vertex
        positions.push(x, height, z);
        normals.push(Math.cos(theta), 0, Math.sin(theta));
        colors.push(...color);
    }
    
    // Generate indices for cylinder sides
    for (let i = 0; i < segments; i++) {
        const base = i * 2;
        indices.push(base, base + 1, base + 2);
        indices.push(base + 1, base + 3, base + 2);
    }
    
    // Add top and bottom caps
    const baseIndex = positions.length / 3;
    
    // Bottom cap
    positions.push(0, 0, 0);
    normals.push(0, -1, 0);
    colors.push(...color);
    
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * 2 * Math.PI;
        positions.push(radius * Math.cos(theta), 0, radius * Math.sin(theta));
        normals.push(0, -1, 0);
        colors.push(...color);
    }
    
    for (let i = 0; i < segments; i++) {
        indices.push(baseIndex, baseIndex + i + 1, baseIndex + i + 2);
    }
    
    // Top cap
    const topBase = positions.length / 3;
    positions.push(0, height, 0);
    normals.push(0, 1, 0);
    colors.push(...color);
    
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * 2 * Math.PI;
        positions.push(radius * Math.cos(theta), height, radius * Math.sin(theta));
        normals.push(0, 1, 0);
        colors.push(...color);
    }
    
    for (let i = 0; i < segments; i++) {
        indices.push(topBase, topBase + i + 2, topBase + i + 1);
    }
    
    return { positions, normals, colors, indices };
}

// Generate disk/circle (for base)
function createDisk(radius, segments, yPos = 0, color = [0.3, 0.3, 0.3]) {
    const positions = [];
    const normals = [];
    const colors = [];
    const indices = [];
    
    // Center vertex
    positions.push(0, yPos, 0);
    normals.push(0, 1, 0);
    colors.push(...color);
    
    // Edge vertices
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * 2 * Math.PI;
        positions.push(radius * Math.cos(theta), yPos, radius * Math.sin(theta));
        normals.push(0, 1, 0);
        colors.push(...color);
    }
    
    // Indices
    for (let i = 0; i < segments; i++) {
        indices.push(0, i + 1, i + 2);
    }
    
    return { positions, normals, colors, indices };
}

// Generate fan guard cage (wire mesh style)
function createGuardCage(radius, depth, segments) {
    const positions = [];
    const normals = [];
    const colors = [];
    const indices = [];
    
    const color = [0.15, 0.15, 0.15]; // Dark gray/black for guard
    const wireRadius = 0.01; // Thin wire
    
    // Front ring
    const frontRing = createGuardRing(radius, segments, 0, color);
    positions.push(...frontRing.positions);
    normals.push(...frontRing.normals);
    colors.push(...frontRing.colors);
    const offset1 = indices.length > 0 ? Math.max(...indices) + 1 : 0;
    indices.push(...frontRing.indices.map(i => i + offset1));
    
    // Back ring (smaller)
    const backRing = createGuardRing(radius * 0.95, segments, depth, color);
    const offset2 = positions.length / 3;
    positions.push(...backRing.positions);
    normals.push(...backRing.normals);
    colors.push(...backRing.colors);
    indices.push(...backRing.indices.map(i => i + offset2));
    
    // Vertical bars connecting front and back (12 bars)
    const barCount = 12;
    for (let i = 0; i < barCount; i++) {
        const angle = (i / barCount) * 2 * Math.PI;
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);
        const xBack = radius * 0.95 * Math.cos(angle);
        const zBack = radius * 0.95 * Math.sin(angle);
        
        const baseIdx = positions.length / 3;
        
        // Create thin bar
        positions.push(x, 0, z);
        positions.push(xBack, 0, zBack - depth);
        positions.push(xBack, 0, zBack - depth);
        positions.push(x, 0, z);
        
        normals.push(Math.cos(angle), 0, Math.sin(angle));
        normals.push(Math.cos(angle), 0, Math.sin(angle));
        normals.push(Math.cos(angle), 0, Math.sin(angle));
        normals.push(Math.cos(angle), 0, Math.sin(angle));
        
        colors.push(...color, ...color, ...color, ...color);
        
        indices.push(baseIdx, baseIdx + 1, baseIdx + 2);
        indices.push(baseIdx, baseIdx + 2, baseIdx + 3);
    }
    
    return { positions, normals, colors, indices };
}

// Generate single ring for guard
function createGuardRing(radius, segments, zOffset, color) {
    const positions = [];
    const normals = [];
    const colors = [];
    const indices = [];
    
    const tubeRadius = 0.015;
    const tubeSegments = 8;
    
    // Create torus-like ring
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * 2 * Math.PI;
        const centerX = radius * Math.cos(theta);
        const centerZ = radius * Math.sin(theta);
        
        for (let j = 0; j <= tubeSegments; j++) {
            const phi = (j / tubeSegments) * 2 * Math.PI;
            const tubeX = tubeRadius * Math.cos(phi);
            const tubeY = tubeRadius * Math.sin(phi);
            
            // Position on torus
            const x = centerX + tubeX * Math.cos(theta);
            const y = tubeY;
            const z = centerZ + tubeX * Math.sin(theta) - zOffset;
            
            positions.push(x, y, z);
            
            // Normal
            const nx = Math.cos(phi) * Math.cos(theta);
            const ny = Math.sin(phi);
            const nz = Math.cos(phi) * Math.sin(theta);
            normals.push(nx, ny, nz);
            
            colors.push(...color);
        }
    }
    
    // Create indices
    for (let i = 0; i < segments; i++) {
        for (let j = 0; j < tubeSegments; j++) {
            const a = i * (tubeSegments + 1) + j;
            const b = a + tubeSegments + 1;
            
            indices.push(a, b, a + 1);
            indices.push(b, b + 1, a + 1);
        }
    }
    
    return { positions, normals, colors, indices };
}

// Generate fan blade (wing shape)
function createBlade(length, width, color = [0.95, 0.95, 1.0]) {
    const positions = [];
    const normals = [];
    const colors = [];
    const indices = [];
    
    // Blade vertices (simple trapezoid)
    const verts = [
        [0, 0, 0],           // Center
        [length, width, 0],  // Tip wide
        [length, -width, 0], // Tip narrow
        [0, -width/2, 0]     // Center narrow
    ];
    
    for (const v of verts) {
        positions.push(...v);
        normals.push(0, 0, 1);
        colors.push(...color);
    }
    
    // Front face
    indices.push(0, 1, 2);
    indices.push(0, 2, 3);
    
    // Back face (for double-sided rendering)
    const backBase = positions.length / 3;
    for (const v of verts) {
        positions.push(v[0], v[1], -0.02);
        normals.push(0, 0, -1);
        colors.push(...color);
    }
    
    indices.push(backBase, backBase + 2, backBase + 1);
    indices.push(backBase, backBase + 3, backBase + 2);
    
    return { positions, normals, colors, indices };
}

// Combine geometry data
function combineGeometry(geometries) {
    let allPositions = [];
    let allNormals = [];
    let allColors = [];
    let allIndices = [];
    let indexOffset = 0;
    
    for (const geom of geometries) {
        allPositions.push(...geom.positions);
        allNormals.push(...geom.normals);
        allColors.push(...geom.colors);
        
        // Adjust indices
        const adjustedIndices = geom.indices.map(i => i + indexOffset);
        allIndices.push(...adjustedIndices);
        
        indexOffset += geom.positions.length / 3;
    }
    
    return {
        positions: allPositions,
        normals: allNormals,
        colors: allColors,
        indices: allIndices
    };
}
