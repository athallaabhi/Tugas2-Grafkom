# Tugas 2: Hierarchical Modeling - Kipas Angin

**Kelompok:** Athalla Abhinaya (5025231107), Nicholas Abel Nathaniel (5025231098), Nadya Zafira (5025231310)

## 📋 Deskripsi Tugas

Implementasi **Hierarchical Modeling** menggunakan WebGL untuk membuat model 3D kipas angin dengan animasi. Proyek ini mendemonstrasikan konsep parent-child relationship, matrix stack, dan preorder traversal dalam computer graphics.

## 🎯 Fitur Utama

### 1. Hierarchical Structure
```
Fan Body (Root)
├── Base (Disk)
├── Stand (Cylinder)
└── Motor (Cylinder) [OSCILLATION]
    ├── Guard (Ring)
    └── Blades (3x Wing) [ROTATION]
```

### 2. Animasi
- **Oscillation (Osilasi)**: Motor bergerak kiri-kanan
  - Frekuensi dapat diatur (0.5 - 5.0)
  - Sudut maksimal dapat diatur (10° - 60°)
  - Dapat diaktifkan/dinonaktifkan

- **Blade Rotation (Putaran Baling-Baling)**: Baling-baling berputar
  - Kecepatan dapat diatur (0 - 500)
  - 3 baling-baling dengan jarak 120° 
  - Dapat diaktifkan/dinonaktifkan

### 3. Kontrol Kamera
- **Distance**: Zoom in/out (3 - 15 unit)
- **Height**: Tinggi kamera (-2 - 4 unit)
- **Angle**: Rotasi mengelilingi objek (0° - 360°)
- **Mouse Drag**: Rotasi kamera dengan drag
- **Mouse Wheel**: Zoom dengan scroll

## 🏗️ Struktur File

```
tugas2-grafkom/
├── index.html          # Halaman utama dengan canvas dan UI
├── style.css           # Styling dengan tema purple gradient
├── geometry.js         # Fungsi pembuatan geometri 3D
├── fan_model.js        # Implementasi hierarchical model & rendering
├── main.js             # UI controls dan event handlers
└── README.md           # Dokumentasi ini
```

## 💻 Implementasi Teknis

### Matrix Stack (Push/Pop)

```javascript
function drawFanMotor() {
    pushMatrix();  // Simpan state saat ini
    
    // Transformasi motor
    mat4.translate(modelViewMatrix, ...);
    mat4.rotateY(modelViewMatrix, oscillationAngle);
    
    // Render motor
    gl.uniformMatrix4fv(...);
    gl.drawElements(...);
    
    popMatrix();  // Kembalikan state
}
```

### Parent-Child Relationship

1. **Motor sebagai Parent**:
   - Oscillation diterapkan pada Motor
   - Semua children (Guard & Blades) mewarisi oscillation

2. **Blades dengan Rotasi Independen**:
   - Mewarisi oscillation dari Motor
   - Memiliki rotasi sendiri (blade rotation)
   - Menghasilkan gerakan kombinasi yang realistis

### Preorder Traversal

```
1. Render Fan Base
2. Render Fan Stand
3. Push (simpan state)
   4. Render Fan Motor (+ oscillation)
   5. Push (simpan state motor)
      6. Render Guard (inherit oscillation)
      7. Render Blades (inherit oscillation + own rotation)
   8. Pop (restore sebelum motor)
9. Pop (restore sebelum stand)
```

## 🎨 Geometri

### Cylinder (Stand & Motor)
- Segments: 16-32 untuk kelancaran
- Top & bottom caps
- Normals untuk lighting

### Disk (Base)
- Circular base dengan center vertex
- Triangle fan pattern

### Guard Ring
- Front & back rings
- Connected dengan segments

### Blade (Wing)
- Trapezoid shape
- Double-sided rendering
- 3 instances dengan rotasi 120°

## 🔦 Lighting

**Phong Shading Model:**
- Ambient: 0.3, 0.3, 0.3
- Diffuse: 1.0, 1.0, 1.0  
- Specular: 1.0, 1.0, 1.0
- Shininess: 50.0
- Light Position: (2.0, 3.0, 2.0)

## 🚀 Cara Menggunakan

### Instalasi
1. Clone atau download folder `tugas2-grafkom`
2. Buka `index.html` di browser modern (Chrome, Firefox, Edge)
3. Tidak perlu server, langsung bisa dibuka

### Kontrol
- **Oscillation Toggle**: Aktifkan/nonaktifkan osilasi motor
- **Oscillation Speed**: Atur kecepatan osilasi (slider)
- **Max Angle**: Atur sudut maksimal osilasi (slider)
- **Blade Rotation Toggle**: Aktifkan/nonaktifkan putaran baling-baling
- **Blade Speed**: Atur kecepatan putaran (slider)
- **Camera Controls**: Atur posisi kamera (3 slider)
- **Mouse Drag**: Drag pada canvas untuk rotasi kamera
- **Mouse Wheel**: Scroll untuk zoom in/out
- **Reset Button**: Kembalikan semua setting ke default

## 📊 Pemenuhan Kriteria Tugas

### a. ✅ Objek Asli
- Kipas angin dengan base, stand, motor, guard, dan blades

### b. ✅ Rencana Hubungan Hierarki
- Tree diagram tersedia di halaman
- Parent-child relationship jelas terdefinisi

### c. ✅ Implementasi Kode
- WebGL 2.0 dengan GLSL shaders
- Matrix stack implementation
- Preorder traversal rendering

### d. ✅ Video Objek Asli
- (Perlu dilampirkan terpisah oleh mahasiswa)

### e. ✅ Halaman Canvas Aplikasi
- Canvas 800x600 dengan rendering real-time
- UI controls lengkap dan responsif

### f. ✅ Desain Tree
- Ditampilkan dalam format ASCII art
- Menunjukkan parent-child relationship
- Menjelaskan transformasi yang diwariskan

## 🔬 Konsep yang Diimplementasikan

### 1. Hierarchical Modeling
- Root node: Fan Body
- Parent-child relationships
- Inheritance transformasi

### 2. Matrix Stack
- `push()`: Simpan transformation state
- `pop()`: Restore transformation state
- Mencegah "transformation leak"

### 3. Preorder Traversal
- Visit node
- Transform node
- Visit children (depth-first)

### 4. Composite Transformations
- Translation + Rotation
- Multiple rotations (oscillation + blade)
- Scale untuk berbagai ukuran parts

### 5. Local vs Global Coordinates
- Motor oscillation dalam local coordinates
- Blade rotation dalam local coordinates Motor
- Semua di-transform ke world coordinates

## 🎓 Referensi Materi Kuliah

Implementasi ini mengikuti materi dari:
- **Slide 25**: Matrix Stack untuk hierarchical models
- **Slide 52**: Preorder traversal dengan push/pop
- **Prinsip Left-Child Right-Sibling**: Struktur tree
- **Transformation Inheritance**: Children inherit parent transformations

## 🐛 Troubleshooting

### Canvas Kosong/Hitam
- Periksa console untuk error messages
- Pastikan browser mendukung WebGL 2.0
- Coba browser lain (Chrome recommended)

### Animasi Tidak Smooth
- Tutup tab/program lain yang berat
- Kurangi complexity dengan menurunkan segments
- Periksa FPS di stats panel

### Kontrol Tidak Responsif
- Pastikan JavaScript enabled
- Clear browser cache
- Refresh halaman

## 📝 Catatan Pengembangan

### Ekstensi yang Bisa Ditambahkan:
1. Textures untuk parts
2. Shadows
3. Multiple light sources
4. Speed control dengan tombol
5. Preset views (front, side, top)
6. Export animation ke video

### Optimasi:
- Geometry batching
- Instanced rendering untuk blades
- LOD (Level of Detail)
- Frustum culling

## 📄 Lisensi

Proyek ini dibuat untuk keperluan akademik - Tugas 2 Grafika Komputer.

---

**Created with ❤️ using WebGL 2.0 & gl-matrix**

*Last updated: October 2025*
