# New Dashboard — GitHub Pages

Folder ini menyediakan alamat masuk GitHub Pages untuk dashboard Apps Script. Dashboard tampil di iframe dengan tinggi layar penuh. Baca dan simpan data, snapshot, filter, tombol Perbarui, ekspor, serta izin akses Google tetap ditangani aplikasi Apps Script.

## 1. Pasang versi Apps Script

1. Ganti isi `Code.gs` dan `Index.html` dengan file R5 pada paket utama. Simpan dan jalankan `cekVersiDashboard`; hasilnya harus `MP-2810-R5`.
2. Untuk mengizinkan tampilan dalam iframe, buka **Project Settings → Script Properties → Add script property**. Isi nama **GITHUB_PAGES_EMBED** dan nilai **true** (huruf kecil), lalu simpan.
3. **Deploy → Manage deployments → Edit → New version → Deploy**. Gunakan pengaturan siapa yang boleh mengakses sesuai kebutuhan organisasi Anda.
4. Salin URL Web App yang berakhiran `/exec`. Gunakan URL deployment, bukan URL editor atau `/dev`.

Pengaturan `GITHUB_PAGES_EMBED=true` menghapus pembatasan frame bawaan Apps Script (`ALLOWALL`), sehingga situs lain juga dapat memasang aplikasi ini dalam iframe. Izin akses Google tetap berlaku. Biarkan properti kosong/false bila embedding tidak diperlukan. Ini adalah halaman pembungkus; pembatasan origin iframe yang kuat memerlukan hosting/backend yang dapat mengatur kebijakan frame-ancestors.

## 2. Isi alamat dashboard

Edit `config.js`:

```js
window.DASHBOARD_CONFIG = Object.freeze({
  appsScriptUrl: "TEMPEL_URL_WEB_APP_EXEC_ANDA_DI_SINI"
});
```

Tidak perlu memasukkan token, password, Spreadsheet ID, atau data karyawan ke GitHub. URL `/exec` bukan pengganti pengaturan izin akses pada deployment Google.

## 3. Publikasikan di GitHub Pages

1. Buat atau pilih repository GitHub, misalnya `new-dashboard`.
2. Upload **isi folder GitHubPages ini** ke root repository: `index.html`, `config.js`, `app.js`, `style.css`, `.nojekyll`, dan README ini. Pastikan `index.html` berada langsung di root. File `.nojekyll` hanya menonaktifkan proses Jekyll; bila tidak ikut saat upload, halaman HTML/JS/CSS ini tetap dapat dipublikasikan.
3. Buka **Settings → Pages → Build and deployment → Source: Deploy from a branch**.
4. Pilih branch **main**, folder **/(root)**, lalu **Save**.
5. Buka alamat yang diberikan GitHub pada halaman Pages, biasanya `https://USERNAME.github.io/new-dashboard/`. Domain sendiri juga dapat dipasang melalui pengaturan Pages.

Upload hanya file folder ini. `Code.gs` dan `Index_New_Dashboard_R5.html` pada paket utama dipasang di Apps Script, bukan sebagai halaman GitHub Pages. GitHub Pages menyajikan file statis; menyalin Index Apps Script langsung akan menghilangkan lingkungan `google.script.run`.

## Saat digunakan

- Halaman tidak menyalin data Sheets ke repository dan tidak memanggil endpoint data secara terpisah. Semua interaksi berlangsung di dashboard Google yang dimuat dalam iframe.
- Tombol **↻** memuat ulang tampilan dari snapshot; gunakan tombol Perbarui di dashboard untuk membaca data terbaru dari sheet.
- Jika Google meminta login, menolak iframe, atau browser membatasi cookie pada frame, pilih **Buka langsung** lalu login menggunakan akun yang berhak. Pengaturan domain Google Workspace dapat membatasi tampilan dalam iframe.
- Mengganti isi sheet memakai tombol Perbarui. Mengganti kode dashboard tetap membutuhkan Deploy New version di Apps Script; pengubahan URL deployment cukup dilakukan di `config.js` jika URL-nya berubah.

Paket ini belum terhubung ke akun/repository GitHub Anda. URL `/exec` sengaja kosong sampai diisi dengan deployment milik Anda. Migrasi penuh agar frontend dirender langsung oleh GitHub Pages membutuhkan API dan autentikasi pengganti `google.script.run`; paket ini mempertahankan fungsi Apps Script melalui iframe.

Referensi resmi:
- https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- https://developers.google.com/apps-script/guides/html/reference/run
- https://developers.google.com/apps-script/reference/html/x-frame-options-mode
