# Hierarchical Modeling - Penjelasan Detail

## 🔍 Konsep Hierarki dalam Kipas Angin

### Struktur Tree

```
                    Fan Body (Root)
                    /           \
              Base Disk      Stand Cylinder
                                  |
                            Fan Motor ← [Oscillation Transform]
                                  |
                    +-------------+-------------+
                    |                           |
              Guard Ring                  Blade Assembly
           (inherits osc.)              (inherits osc. + own rotation)
                                              |
                                    +---------+---------+
                                    |         |         |
                                 Blade1    Blade2    Blade3
                              (0°)      (120°)    (240°)
```

## 🔄 Transformation Flow

### 1. Fan Body (Root) - Identity Matrix
```
M_world = I (Identity)
- No transformation
- Reference point for all children
```

### 2. Fan Stand - Translation
```
M_stand = M_world * T(0, 0, 0)
- Positioned at origin
- Extends upward (height = 1.5)
```

### 3. Fan Motor - Translation + Oscillation
```
M_motor = M_stand * T(0, 1.5, 0) * R_y(θ_oscillation)
- Positioned at top of stand (y = 1.5)
- Rotates around Y-axis (oscillation)
- θ_oscillation = sin(time * speed) * max_angle
```

**KEY POINT**: Oscillation applied here affects ALL children!

### 4. Fan Guard - Inherits Motor Transformation
```
M_guard = M_motor * T(0, 0.3, 0.2)
- Inherits oscillation from M_motor automatically
- Additional translation to position in front
- NO extra rotation needed
```

### 5. Fan Blades - Inherits Motor + Own Rotation
```
M_blade_assembly = M_motor * T(0, 0.3, 0.15) * R_z(θ_blade)
- Inherits oscillation from M_motor
- Additional rotation around Z-axis (blade spin)
- θ_blade = time * blade_speed

For each blade (i = 0, 1, 2):
M_blade_i = M_blade_assembly * R_z(i * 120°)
```

## 📊 Matrix Stack Operations

### Pseudocode Flow

```
function renderFan():
    M = lookAt(eye, center, up)  // View matrix
    stack = []
    
    // --- Level 0: Root ---
    renderBase(M)
    renderStand(M)
    
    // --- Level 1: Motor (with oscillation) ---
    push(M)  // Save current state
        M = M * T(0, 1.5, 0)           // Move to top of stand
        M = M * R_y(oscillation)        // Apply oscillation
        renderMotor(M)
        
        // --- Level 2: Motor children ---
        push(M)  // Save motor state (includes oscillation)
            M = M * T(0, 0.3, 0.2)
            renderGuard(M)             // Guard inherits oscillation
        pop(M)   // Restore motor state
        
        push(M)  // Save motor state again
            M = M * T(0, 0.3, 0.15)
            M = M * R_z(bladeAngle)    // Blade rotation
            
            // --- Level 3: Individual blades ---
            for i in [0, 1, 2]:
                push(M)  // Save blade assembly state
                    M = M * R_z(i * 120°)
                    renderBlade(M)     // Each blade
                pop(M)
        pop(M)   // Restore motor state
    pop(M)       // Restore before motor
```

## 🎬 Animation Mathematics

### Oscillation (Sinusoidal Motion)

```javascript
// Smooth back-and-forth motion
oscillationAngle = sin(currentTime * frequency) * maxAngle

Where:
- frequency = oscillationSpeed / 1000
- maxAngle = user-defined (10° - 60°)
- Result: smooth [-maxAngle, +maxAngle] oscillation
```

**Why Sine?**
- Creates smooth acceleration/deceleration
- Natural looking motion (like real fans)
- Continuous (no sudden stops)

### Blade Rotation (Linear)

```javascript
// Continuous rotation
bladeAngle += bladeSpeed * deltaTime / 1000

Where:
- bladeSpeed = user-defined (0 - 500 degrees/second)
- deltaTime = time since last frame
- Normalized: if angle > 360°, subtract 360°
```

**Why Linear?**
- Constant angular velocity (realistic for motor)
- Simple and predictable
- Easy to control with speed slider

## 🧮 Coordinate Systems

### World Coordinates
- Origin at base of fan (0, 0, 0)
- Y-axis points up
- X-Z plane is ground

### Local Coordinates (Motor)
- Origin at motor center
- Y-axis = motor shaft
- Oscillation rotates around local Y

### Local Coordinates (Blades)
- Origin at blade assembly center
- Z-axis = blade rotation axis
- Each blade at 120° offset

## 🔧 Implementation Details

### Why Matrix Stack?

**Problem without stack:**
```javascript
// BAD - transformations accumulate incorrectly
M = translate(...)
M = rotate(...)
drawMotor(M)
M = translate(...)  // ❌ Includes previous motor transform!
drawGuard(M)        // ❌ Wrong position!
```

**Solution with stack:**
```javascript
// GOOD - save and restore states
push(M)                    // Save clean state
    M = translate(...)
    M = rotate(...)
    drawMotor(M)
    
    push(M)                // Save motor state
        M = translate(...) // ✅ Relative to motor
        drawGuard(M)       // ✅ Correct position!
    pop(M)                 // ✅ Restore motor state
pop(M)                     // ✅ Restore clean state
```

### Inheritance Mechanism

**Parent transformation automatically applied to children:**

```
Motor has: M_motor = T * R_oscillation
Guard has: M_guard = M_motor * T_offset

When oscillation changes:
- M_motor updates automatically
- M_guard automatically includes new oscillation
- NO manual propagation needed!
```

This is the **power of hierarchical modeling**!

## 🎯 Key Takeaways

1. **Tree Structure**: Clear parent-child relationships
2. **Matrix Stack**: Save/restore transformation states
3. **Preorder Traversal**: Visit node, then children
4. **Transformation Inheritance**: Children get parent transforms for free
5. **Local vs Global**: Transformations in local space, rendered in global

## 📚 Further Reading

- Interactive Computer Graphics (Angel & Shreiner) - Chapter 4
- OpenGL Programming Guide - Transformations
- Real-Time Rendering - Scene Graphs
- WebGL Programming Guide - Matrix Stacks

---

**Understanding this project = Understanding hierarchical modeling! 🎓**
