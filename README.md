# New Dashboard R10 · Google login
Ganti index.html, app.js, style.css di repository yang ada. Pertahankan config.js dan CNAME. Untuk pemasangan baru, salin config.example.js menjadi config.js lalu isi appsScriptUrl /exec.

Sebelum login dapat digunakan: pasang Code.gs + Index.html R9, jalankan setupDashboardAccess, buat OAuth Web client, isi tiga Script Properties sesuai PANDUAN_AKSES.md dan deploy New version. Client Secret tidak boleh dimasukkan ke GitHub Pages. Domain harus sesuai AUTH_APP_ORIGIN dan authorized origin Google.

Login dilakukan pada domain ini. URL /exec langsung adalah halaman terkunci. Setelah identitas diverifikasi server, aplikasi tampil dengan satu header yang berasal dari Apps Script. Login, role, data dan fungsi simpan diperiksa server; halaman statis tidak menjadi satu-satunya pengamanan.
