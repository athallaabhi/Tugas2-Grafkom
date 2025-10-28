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