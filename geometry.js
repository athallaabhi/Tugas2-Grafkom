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

// Generate disk/circle with depth (for base)
function createDisk(radius, segments, yPos = 0, color = [0.3, 0.3, 0.3], depth = 0.05) {
    const positions = [];
    const normals = [];
    const colors = [];
    const indices = [];
    
    // Top face
    // Center vertex (top)
    positions.push(0, yPos + depth, 0);
    normals.push(0, 1, 0);
    colors.push(...color);
    
    // Edge vertices (top)
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * 2 * Math.PI;
        positions.push(radius * Math.cos(theta), yPos + depth, radius * Math.sin(theta));
        normals.push(0, 1, 0);
        colors.push(...color);
    }
    
    // Top face indices
    for (let i = 0; i < segments; i++) {
        indices.push(0, i + 1, i + 2);
    }

    // Bottom face
    // Center vertex (bottom)
    const bottomCenterIndex = positions.length / 3;
    positions.push(0, yPos, 0);
    normals.push(0, -1, 0);
    colors.push(...color);
    
    // Edge vertices (bottom)
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * 2 * Math.PI;
        positions.push(radius * Math.cos(theta), yPos, radius * Math.sin(theta));
        normals.push(0, -1, 0);
        colors.push(...color);
    }
    
    // Bottom face indices
    for (let i = 0; i < segments; i++) {
        indices.push(
            bottomCenterIndex,
            bottomCenterIndex + i + 2,
            bottomCenterIndex + i + 1
        );
    }

    // Side walls
    const sideStartIndex = positions.length / 3;
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * 2 * Math.PI;
        const x = radius * Math.cos(theta);
        const z = radius * Math.sin(theta);
        
        // Bottom vertex
        positions.push(x, yPos, z);
        normals.push(Math.cos(theta), 0, Math.sin(theta));
        colors.push(...color);
        
        // Top vertex
        positions.push(x, yPos + depth, z);
        normals.push(Math.cos(theta), 0, Math.sin(theta));
        colors.push(...color);
    }
    
    // Side indices
    for (let i = 0; i < segments; i++) {
        const base = sideStartIndex + i * 2;
        indices.push(base, base + 1, base + 2);
        indices.push(base + 1, base + 3, base + 2);
    }
    
    return { positions, normals, colors, indices };
}

// Generate fan guard cage (wire mesh style)
function createGuardCage(radius, depth, segments) {
    const positions = [];
    const normals = [];
    const colors = [];
    const indices = [];
    
    const color = [0.9, 0.9, 0.9]; // Light gray/white for guard
    const wireRadius = 0.012; // Thin wire
    
    // Front ring (outer)
    const frontRing = createGuardRing(radius, segments, 0, color);
    positions.push(...frontRing.positions);
    normals.push(...frontRing.normals);
    colors.push(...frontRing.colors);
    const offset1 = indices.length > 0 ? Math.max(...indices) + 1 : 0;
    indices.push(...frontRing.indices.map(i => i + offset1));
    
    // Back ring (slightly smaller for depth effect)
    const backRing = createGuardRing(radius * 0.95, segments, depth, color);
    const offset2 = positions.length / 3;
    positions.push(...backRing.positions);
    normals.push(...backRing.normals);
    colors.push(...backRing.colors);
    indices.push(...backRing.indices.map(i => i + offset2));
    
    // Middle concentric rings (3 rings for detail)
    const middleRing1 = createGuardRing(radius * 0.7, segments, 0, color);
    const offset3 = positions.length / 3;
    positions.push(...middleRing1.positions);
    normals.push(...middleRing1.normals);
    colors.push(...middleRing1.colors);
    indices.push(...middleRing1.indices.map(i => i + offset3));
    
    const middleRing2 = createGuardRing(radius * 0.45, segments, 0, color);
    const offset4 = positions.length / 3;
    positions.push(...middleRing2.positions);
    normals.push(...middleRing2.normals);
    colors.push(...middleRing2.colors);
    indices.push(...middleRing2.indices.map(i => i + offset4));
    
    const middleRing3 = createGuardRing(radius * 0.2, segments, 0, color);
    const offset5 = positions.length / 3;
    positions.push(...middleRing3.positions);
    normals.push(...middleRing3.normals);
    colors.push(...middleRing3.colors);
    indices.push(...middleRing3.indices.map(i => i + offset5));
    
    // Radial spokes connecting rings (16 spokes like a real fan)
    const spokeCount = 16;
    for (let i = 0; i < spokeCount; i++) {
        const angle = (i / spokeCount) * 2 * Math.PI;
        const x1 = radius * Math.cos(angle);
        const z1 = radius * Math.sin(angle);
        const x2 = 0; // Center
        const z2 = 0;
        
        const baseIdx = positions.length / 3;
        
        // Create thin radial spoke (flat ribbon)
        const spokeWidth = wireRadius * 0.8;
        positions.push(x1, spokeWidth, z1);
        positions.push(x2, spokeWidth, z2);
        positions.push(x2, -spokeWidth, z2);
        positions.push(x1, -spokeWidth, z1);
        
        normals.push(0, 0, 1);
        normals.push(0, 0, 1);
        normals.push(0, 0, 1);
        normals.push(0, 0, 1);
        
        colors.push(...color, ...color, ...color, ...color);
        
        indices.push(baseIdx, baseIdx + 1, baseIdx + 2);
        indices.push(baseIdx, baseIdx + 2, baseIdx + 3);
    }
    
    // Vertical connecting bars between front and back (12 bars)
    const barCount = 12;
    for (let i = 0; i < barCount; i++) {
        const angle = (i / barCount) * 2 * Math.PI;
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);
        const xBack = radius * 0.95 * Math.cos(angle);
        const zBack = radius * 0.95 * Math.sin(angle);
        
        const baseIdx = positions.length / 3;
        
        // Create connecting bar
        const barWidth = wireRadius;
        positions.push(x, barWidth, z);
        positions.push(xBack, barWidth, zBack - depth);
        positions.push(xBack, -barWidth, zBack - depth);
        positions.push(x, -barWidth, z);
        
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
function createGuardRing(radius, segments, zOffset, color, depth = 0.01) {
    const positions = [];
    const normals = [];
    const colors = [];
    const indices = [];
    
    const tubeRadius = 0.015;
    const tubeSegments = 8;
    // The ring will have thickness along Z axis: [-depth/2, +depth/2]
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * 2 * Math.PI;
        const centerX = radius * Math.cos(theta);
        const centerZ = radius * Math.sin(theta);
        for (let j = 0; j <= tubeSegments; j++) {
            const phi = (j / tubeSegments) * 2 * Math.PI;
            const tubeX = tubeRadius * Math.cos(phi);
            const tubeY = tubeRadius * Math.sin(phi);
            // Position on torus, with depth
            // Instead of just -zOffset, we offset by depth
            const zDepth = tubeY * (depth / tubeRadius) / 2; // scale tubeY to [-depth/2, +depth/2]
            const x = centerX + tubeX * Math.cos(theta);
            const y = tubeY;
            const z = centerZ + tubeX * Math.sin(theta) - zOffset + zDepth;
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
function createBlade(length, width, color = [1, 0.95, 1.0]) {
    const positions = [];
    const normals = [];
    const colors = [];
    const indices = [];
    
    // Blade vertices (simple trapezoid)
    const verts = [
        [0.3, 0.4, 0],           // Center
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
        positions.push(v[0], v[1], 0);
        normals.push(0, 0, -1);
        colors.push(...color);
    }
    
    indices.push(backBase, backBase + 2, backBase + 1);
    indices.push(backBase, backBase + 3, backBase + 2);
    
    return { positions, normals, colors, indices };
}

// Generate box/rectangular prism
function createBox(width, height, depth, color = [0.8, 0.8, 0.8]) {
    const positions = [];
    const normals = [];
    const colors = [];
    const indices = [];
    
    // Half dimensions for vertex positions
    const w = width / 2;
    const h = height / 2;
    const d = depth / 2;
    
    // Define the vertices (8 corners of the box)
    const vertices = [
        // Front face vertices
        [-w, -h, d],  // 0
        [w, -h, d],   // 1
        [w, h, d],    // 2
        [-w, h, d],   // 3
        // Back face vertices
        [-w, -h, -d], // 4
        [w, -h, -d],  // 5
        [w, h, -d],   // 6
        [-w, h, -d]   // 7
    ];
    
    // Define faces (6 faces, each with a normal vector)
    const faces = [
        // Front face: vertices and normal
        { verts: [0, 1, 2, 3], normal: [0, 0, 1] },
        // Back face
        { verts: [5, 4, 7, 6], normal: [0, 0, -1] },
        // Top face
        { verts: [3, 2, 6, 7], normal: [0, 1, 0] },
        // Bottom face
        { verts: [4, 5, 1, 0], normal: [0, -1, 0] },
        // Right face
        { verts: [1, 5, 6, 2], normal: [1, 0, 0] },
        // Left face
        { verts: [4, 0, 3, 7], normal: [-1, 0, 0] }
    ];
    
    // Generate vertices, normals, and colors for each face
    faces.forEach(face => {
        face.verts.forEach(vertIndex => {
            positions.push(...vertices[vertIndex]);
            normals.push(...face.normal);
            colors.push(...color);
        });
        
        // Add indices for the face (two triangles)
        const baseIndex = positions.length / 3 - 4; // 4 vertices per face
        indices.push(
            baseIndex, baseIndex + 1, baseIndex + 2,
            baseIndex, baseIndex + 2, baseIndex + 3
        );
    });
    
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
