# Aplikasi Kontak

![Home Page](./assets/home_page.png)

Aplikasi ini adalah contoh sederhana untuk mengelola daftar kontak. Backend dibangun menggunakan NestJS dan frontend dibangun menggunakan Angular.

Fitur-fitur:

- REST API
- Operasi CRUD
- Fungsi Search
- Fungsi Pagination
- Input validasi di frontend and backend

## Daftar Isi

- [Cara Menjalankan Aplikasi (Build)](#cara-menjalankan-aplikasi-build)
- [Daftar Endpoint API](#daftar-endpoint-api)
- [Cara Menjalankan Unit Test](#cara-menjalankan-unit-test)

## Cara Menjalankan Aplikasi (Build)

Pastikan Anda telah menginstal prasyarat berikut:

- Node.js (v18 atau lebih baru)
- pnpm
- Docker & Docker Compose V2
- make

Berikut adalah langkah-langkah untuk menjalankan keseluruhan aplikasi:

> **Peringatan:** Pastikan Anda menjalankan database **sebelum** menjalankan backend. Jika backend dimulai lebih dulu, akan terjadi error karena TypeORM belum siap untuk membuat skema tabel di database, yang menyebabkan aplikasi gagal terhubung.

### 1. Database

Aplikasi ini menggunakan database MySQL 8.0 yang dijalankan melalui Docker. Semua konfigurasi dan manajemen container diatur melalui `makefile` dan `docker-compose.yml` yang ada di dalam folder `database`.

> **Peringatan:** database menggunakan docker compose v2 (docker compose) dan
> bukan (docker-compose). jika menggunakan docker-compose, harus ganti commandnya manual pada make filenya.

1.  **Masuk ke direktori database:**

    ```bash
    cd database
    ```

2.  **Menjalankan Database:**
    Gunakan perintah `make up` untuk membuat dan menjalankan container di background.

    ```bash
    make up
    ```

    Untuk mengelola container database, tersedia beberapa perintah `make`:

    - `make down`: Menghentikan dan menghapus container beserta jaringannya.
    - `make clean_restart`: Recreate docker dan remove volume lalu restart
      docker containernya
    - `make logs`: Melihat log dari database secara real-time.
    - `make mysql`: Terhubung langsung ke database MySQL melalui terminal.
    - `make stop`: Hanya menghentikan container tanpa menghapusnya.
    - `make start`: Menjalankan kembali container yang sudah dihentikan.
    - `make help`: Menampilkan semua perintah yang tersedia.

### 2. Backend

1.  **Masuk ke direktori backend:**

    ```bash
    cd backend
    ```

2.  **Instal dependensi:**

    ```bash
    pnpm install
    ```

3.  **Jalankan server development:**
    ```bash
    pnpm run start:dev
    ```
    Server akan berjalan di `http://localhost:3000`.

### 3. Frontend

1.  **Masuk ke direktori frontend:**

    ```bash
    cd frontend
    ```

2.  **Instal dependensi:**

    ```bash
    pnpm install
    ```

3.  **Jalankan aplikasi:**
    ```bash
    pnpm start
    ```
    Aplikasi akan berjalan di `http://localhost:4200`.

### 4. Inisialisasi Data (Seeding)

Untuk mengisi database dengan data awal untuk keperluan pengembangan, Anda dapat menggunakan file `seed-data.json` yang ada di dalam folder `backend`.

Pastikan server backend sudah berjalan, kemudian jalankan perintah berikut dari **root direktori proyek** untuk mengirim data ke endpoint `/contacts/bulk`:

```bash
curl -X POST -H "Content-Type: application/json" --data "@backend/seed-data.json" http://localhost:3000/api/v1/contacts/bulk
```

Setelah menjalankan perintah di atas, database Anda akan terisi dengan data kontak awal.

## Daftar Endpoint API

Berikut adalah daftar endpoint yang tersedia di backend. Semua endpoint memiliki prefix `/api/v1`.

| Metode HTTP | Path Endpoint         | Deskripsi                                                          |
| ----------- | --------------------- | ------------------------------------------------------------------ |
| `GET`       | `/contacts`           | Mengambil semua kontak. Mendukung query `?query=` untuk pencarian. |
| `GET`       | `/contacts/paginated` | Mengambil kontak dengan sistem paginasi berbasis kursor.           |
| `GET`       | `/contacts/count`     | Mendapatkan jumlah total kontak.                                   |
| `GET`       | `/contacts/:uuid`     | Mengambil satu kontak berdasarkan ID (UUID).                       |
| `POST`      | `/contacts`           | Membuat satu kontak baru.                                          |
| `POST`      | `/contacts/bulk`      | Membuat beberapa kontak sekaligus (bulk).                          |
| `PATCH`     | `/contacts/:uuid`     | Memperbarui data kontak berdasarkan ID.                            |
| `DELETE`    | `/contacts/:uuid`     | Menghapus kontak berdasarkan ID.                                   |
| `GET`       | `/health`             | Endpoint untuk memeriksa status kesehatan server.                  |

### Penjelasan Detail Endpoint

#### `POST /contacts`

Endpoint ini digunakan untuk membuat satu kontak baru. Anda harus mengirimkan data kontak dalam format JSON di dalam body permintaan.

**Body Permintaan (JSON):**

```json
{
  "name": "John Doe",
  "phone": "081234567890",
  "email": "john.doe@example.com"
}
```

**Detail Field:**

- `name` (string, wajib): Nama lengkap kontak. Minimal 3 karakter.
- `phone` (string, wajib): Nomor telepon yang valid di Indonesia (diawali dengan `08` dan terdiri dari 11-13 digit).
- `email` (string, wajib): Alamat email yang valid.

#### `GET /contacts/paginated`

Endpoint ini mengambil daftar kontak dengan sistem paginasi berbasis kursor untuk membatasi jumlah data yang dikembalikan.

**Parameter Query:**

- `limit` (opsional, angka): Menentukan jumlah maksimum kontak yang akan diambil. Nilai default adalah `10`, dan nilai maksimum adalah `100`.
- `nextCursor` (opsional, string): ID dari kontak terakhir yang Anda lihat. Server akan mengembalikan data _setelah_ kontak dengan ID ini. Jika dikosongkan, data akan diambil dari awal.
- `prevCursor` (opsional, string): ID dari kontak sebelumnya yang Anda pernah lihat. Server akan mengembalikan data _sebelum_ kontak dengan ID ini.

**Contoh Penggunaan:**

- Mengambil 15 kontak pertama:
  `/api/v1/contacts/paginated?limit=15`
- Mengambil 15 kontak berikutnya setelah kontak dengan ID `<cursor_id>`:
  `/api/v1/contacts/paginated?limit=15&cursor=<cursor_id>`

## Cara Menjalankan Unit Test

### Backend

1.  **Masuk ke direktori backend:**
    ```bash
    cd backend
    ```
2.  **Jalankan perintah test:**
    ```bash
    pnpm test
    ```
