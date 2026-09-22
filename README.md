# OMB V2 — Simple Structured Frontend

Tanpa React, Vite, npm, package.json, atau GitHub Actions.

Struktur:
- `/` = beranda
- `/public/` = website publik
- `/member/` = portal anggota
- `/admin/` = admin
- `/auth/` = login/auth
- `/assets/css/` = semua CSS
- `/assets/js/` = JavaScript dan konfigurasi Supabase

Setiap kategori punya folder dan `index.html`, sehingga GitHub Pages bisa langsung melayani halaman tanpa proses build.

Langkah berikutnya: upload struktur ini ke root repository, lalu set GitHub Pages → Deploy from a branch → main → root.
