# Modul 6 - Integrasi UI dengan Layanan Sistem

## Topik
Implementasi integrasi antarfronte (frontend) dengan layanan backend melalui API. Modul ini mencakup:
- Penggunaan `fetch`/`axios` untuk komunikasi dengan server
- Management state dengan API responses
- Loading & error handling di seluruh komponen
- Autentikasi sederhana (jika ada)
- Integrasi form dengan backend

## Tujuan
- Menggantikan lokalStorage-only state dengan komunikasi API yang sebenarnya
- Menambahkan loading indicators dan error boundaries
- Menyediakan integrasi yang siap dipasangkan dengan backend nyata
- Mempertahankan kompatibilitas dengan state Modul 5 (events, registrations)

## Fitur yang Diimplementasikan

### 1. API Service Layer (`src/composables/useApi.js`)
- Fungsi helper untuk `fetch` ke endpoint backend
- Parameter otomatis `Content-Type: application/json`
- Penanganan error standar (status 4xx/5xx)
- Interceptor untuk menambah header auth jika perlu

### 2. Updated `useEvents.js` - API-Integrated
- Mengganti `localStorage` calls dengan `fetch` ke `/api/events`
- Menambahkan `isLoading` state
- Menambahkan error handling
- Menjaga backward compatibility dengan data lama di localStorage

### 3. New Components
- **`components/ui/LoadingSpinner.vue`** - Spinner komponen ulang digunakan saat fetch
- **`components/ui/ErrorBanner.vue`** - Menampilkan error dari API ke user

### 4. Views Updates
- **`views/EventList.vue`** - Data dari API bukan localStorage
- **`views/EventDetail.vue`** - Load event by ID dari API
- **`views/EventRegistration.vue`** - Submit registrasi ke `/api/register`
- **`views/YourEvents.vue`** - Ambil registrations dari `/api/my-registrations`
- **`views/TicketReceipt.vue`** - Ambil ticket detail dari API

### 5. Routing Updates
- Tambah route untuk `/api/health-check` atau endpoint serupa
- Proteksi route jika ada autentikasi

## File yang Dibuat

### `src/composables/useApi.js`
Komposisi baru untuk abstraksi API calls:
- `fetchGet(url)` - GET request dengan error handling
- `fetchPost(url, data)` - POST request
- `fetchPut(url, data)` - PUT request
- `fetchDelete(url)` - DELETE request
- `useApi()` - composable yang mengembalikan `isLoading`, `error`, `refresh`

### `src/components/ui/LoadingSpinner.vue`
Komponen loading sederhana yang bisa digunakan di seluruh halaman.

### `src/components/ui/ErrorBanner.vue`
Banner error yang muncul ketika API request gagal, dengan tombol "Retry".

## File yang Diubah

### `src/composables/useEvents.js`
- Ganti `localStorage` operations dengan `useApi()` + endpoint `/api/events`
- Tambah `isLoading` dan `error` computed
- Tambah `refreshEvents()` yang memaksa refresh dari API
- Keep backward kompat: cek localStorage dulu kalau API gagal

### `src/views/EventList.vue`
- `searchQuery` dan `selectedCategory` tetap, tapi data dari `useEvents()`
- Tambah `isLoading` state saat fetch dimulai
- Show `LoadingSpinner` saat loading
- Show `ErrorBanner` kalau ada error
- Empty state kalau API return kosong

### `src/views/EventDetail.vue`
- `event` computed ambil dari API `/api/events/:id`
- Tambah loading state saat param id berganti
- Error handling kalau event tidak ditemukan

### `src/views/EventRegistration.vue`
- `handleRegistrationSuccess` kirim ke `/api/register` via `fetchPost`
- Tampilkan loading saat submit
- Error handling kalau registration gagal di server
- Simpan response ke localStorage sementara sampai API stabil

### `src/views/YourEvents.vue`
- `tickets` ambil dari `/api/my-registrations` via `fetchGet`
- Error handling dan loading state

### `src/views/TicketReceipt.vue`
- Ambil data registrasi dari API berdasarkan eventId
- Error kalau ticket tidak ditemukan di server

### `src/assets/main.css`
- Tambah gaya untuk `.loading-spinner` dan `.error-banner`
- Transisi yang konsisten dengan desain Modul 5

## Catatan Implementasi

1. **Endpoint API**: Semua endpoint menggunakan path `/api/...`. Untuk development lokal, bisa diarahkan ke JSON Server atau mock server.

2. **Backward Compatibility**: `useEvents.js` masih cek localStorage dulu kalau API gagal, jadi data lama tetap muncul kalau server sedang down.

3. **Error Handling**: Semua error dari API ditangkap dan tampilkan di `ErrorBanner`. User bisa retry tanpa refresh halaman.

4. **Loading States**: Setiap kali data di-load, `isLoading` akan true dan menampilkan spinner. Ketika selesai, menghilangkan dan tampilkan data.

5. **Modul 5 Compatibility**: Semua fitur Modul 5 (registrasi, ticket, cancellation) masih bekerja, hanya saja data datang dari API daripada localStorage.

## Verifikasi
- `npm run build` - Harus sukses tanpa error
- `npm run format` - Harus lulus di seluruh file Modul 6
- Semua view harus bisa di-load tanpa error di browser
- API calls harus return data yang expected format