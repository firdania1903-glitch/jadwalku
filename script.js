    /* ==========================================================
    JADWALKU - script.js (halaman jadwal.html)
    Alur: ambil data -> validasi form -> simpan -> tampilkan tabel
    ========================================================== */

    /* ---------- 1. DATA & ELEMEN ---------- */
    const HARI = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const KUNCI_SIMPAN = "jadwal";
    const KUNCI_WAKTU = "jadwalWaktu";

    let jadwal = ambilData();

    const el = {
    form: document.getElementById("formJadwal"),
    tabel: document.getElementById("isiTabel"),
    pesan: document.getElementById("pesan"),
    filter: document.getElementById("filterHari"),
    total: document.getElementById("total"),
    hapusSemua: document.getElementById("hapusSemua"),
    statusSimpan: document.getElementById("statusSimpan"),
    mingguan: document.getElementById("mingguan"),
    statMatkul: document.getElementById("statMatkul"),
    statJam: document.getElementById("statJam"),
    statHari: document.getElementById("statHari"),
    };

    /* ---------- 2. PENYIMPANAN (localStorage) ---------- */
    function ambilData() {
    try {
        return JSON.parse(localStorage.getItem(KUNCI_SIMPAN)) || [];
    } catch (e) {
        return [];
    }
    }

    function simpanData() {
    try {
        localStorage.setItem(KUNCI_SIMPAN, JSON.stringify(jadwal));
        localStorage.setItem(KUNCI_WAKTU, new Date().toLocaleString("id-ID"));
    } catch (e) {
        /* abaikan jika penyimpanan tidak tersedia */
    }
    }

    /* ---------- 3. FUNGSI BANTU ---------- */
    function tampilPesan(teks, jenis) {
    el.pesan.textContent = teks;
    el.pesan.className = jenis;
    }

    // "08:30" -> 510 menit
    function keMenit(jam) {
    const [j, m] = jam.split(":").map(Number);
    return j * 60 + m;
    }

    // Dua jadwal bentrok jika harinya sama dan jamnya beririsan
    function bentrok(a, b) {
    return a.hari === b.hari && a.mulai < b.selesai && b.mulai < a.selesai;
    }

    function urutkan(daftar) {
    return [...daftar].sort(
        (a, b) => HARI.indexOf(a.hari) - HARI.indexOf(b.hari) || a.mulai.localeCompare(b.mulai)
    );
    }

    function buatSel(teks) {
    const td = document.createElement("td");
    td.textContent = teks;
    return td;
    }

    /* ---------- 4. TAMPILAN ---------- */
    function tampilStatusSimpan() {
    let waktu = null;
    try { waktu = localStorage.getItem(KUNCI_WAKTU); } catch (e) {}
    el.statusSimpan.textContent = jadwal.length === 0
        ? "Belum ada data tersimpan."
        : jadwal.length + " jadwal tersimpan otomatis di browser" + (waktu ? ". Terakhir diubah " + waktu + "." : ".");
    }

    function tampilMingguan() {
    el.mingguan.innerHTML = "";
    HARI.forEach((hari) => {
        const kolom = document.createElement("div");
        kolom.className = "hari-kolom hari-" + hari.toLowerCase();

        const judul = document.createElement("h3");
        judul.textContent = hari;
        kolom.appendChild(judul);

        const daftar = urutkan(jadwal.filter((j) => j.hari === hari));
        if (daftar.length === 0) {
        const kosong = document.createElement("div");
        kosong.className = "item-kosong";
        kosong.textContent = "Tidak ada kuliah";
        kolom.appendChild(kosong);
        }
        daftar.forEach((j) => {
        const item = document.createElement("div");
        item.className = "item";
        const nama = document.createElement("b");
        nama.textContent = j.matkul;
        const jam = document.createElement("small");
        jam.textContent = j.mulai + " - " + j.selesai;
        const info = document.createElement("small");
        info.textContent = j.ruang + ", " + j.dosen;
        item.append(nama, jam, info);
        kolom.appendChild(item);
        });
        el.mingguan.appendChild(kolom);
    });
    }

    function tampilStatistik() {
    const totalMenit = jadwal.reduce((sum, j) => sum + keMenit(j.selesai) - keMenit(j.mulai), 0);
    const jam = Math.round((totalMenit / 60) * 10) / 10;

    // hitung jumlah matkul per hari, cari yang terbanyak
    const hitung = {};
    jadwal.forEach((j) => (hitung[j.hari] = (hitung[j.hari] || 0) + 1));
    const terpadat = Object.keys(hitung).sort((a, b) => hitung[b] - hitung[a])[0];

    el.statMatkul.textContent = jadwal.length;
    el.statJam.textContent = jam + " jam";
    el.statHari.textContent = terpadat || "-";
    }

    function tampilTabel() {
    const pilihan = el.filter.value;
    const data = urutkan(jadwal.filter((j) => pilihan === "Semua" || j.hari === pilihan));

    el.tabel.innerHTML = "";

    if (data.length === 0) {
        el.tabel.innerHTML =
        '<tr><td class="kosong" colspan="6">Belum ada jadwal. Isi form di samping untuk menambah.</td></tr>';
    }

    data.forEach((j) => {
        const tr = document.createElement("tr");

        // kolom hari berbentuk lencana berwarna
        const tdHari = document.createElement("td");
        const lencana = document.createElement("span");
        lencana.className = "lencana hari-" + j.hari.toLowerCase();
        lencana.textContent = j.hari;
        tdHari.appendChild(lencana);
        tr.appendChild(tdHari);

        tr.appendChild(buatSel(j.mulai + " - " + j.selesai));

        const tdMatkul = buatSel(j.matkul);
        tdMatkul.className = "nama-matkul";
        tr.appendChild(tdMatkul);

        tr.appendChild(buatSel(j.dosen));
        tr.appendChild(buatSel(j.ruang));

        // kolom aksi: tombol hapus
        const tdAksi = document.createElement("td");
        const tombol = document.createElement("button");
        tombol.className = "tombol-garis";
        tombol.textContent = "Hapus";
        tombol.addEventListener("click", () => hapusJadwal(j.id));
        tdAksi.appendChild(tombol);
        tr.appendChild(tdAksi);

        el.tabel.appendChild(tr);
    });

    el.total.textContent = "Menampilkan " + data.length + " dari " + jadwal.length + " jadwal";
    el.hapusSemua.hidden = jadwal.length === 0;
    tampilStatistik();
    tampilStatusSimpan();
    tampilMingguan();
    }

    /* ---------- 5. AKSI ---------- */
    function hapusJadwal(id) {
    jadwal = jadwal.filter((j) => j.id !== id);
    simpanData();
    tampilTabel();
    tampilPesan("Jadwal dihapus.", "ok");
    }

    function validasi(baru) {
    if (!baru.matkul || !baru.dosen || !baru.mulai || !baru.selesai || !baru.ruang) {
        return "Semua kolom wajib diisi.";
    }
    if (baru.selesai <= baru.mulai) {
        return "Jam selesai harus setelah jam mulai.";
    }
    const tabrakan = jadwal.find((j) => bentrok(j, baru));
    if (tabrakan) {
        return "Bentrok dengan " + tabrakan.matkul + " (" + tabrakan.mulai + " - " + tabrakan.selesai + ").";
    }
    return null; // tidak ada masalah
    }

    /* ---------- 6. EVENT ---------- */
    el.form.addEventListener("submit", (e) => {
    e.preventDefault();

    const baru = {
        id: Date.now(),
        matkul: document.getElementById("matkul").value.trim(),
        dosen: document.getElementById("dosen").value.trim(),
        hari: document.getElementById("hari").value,
        mulai: document.getElementById("mulai").value,
        selesai: document.getElementById("selesai").value,
        ruang: document.getElementById("ruang").value.trim(),
    };

    const galat = validasi(baru);
    if (galat) {
        tampilPesan(galat, "error");
        return;
    }

    jadwal.push(baru);
    simpanData();
    el.form.reset();
    tampilTabel();
    tampilPesan("Jadwal disimpan.", "ok");
    });

    el.filter.addEventListener("change", tampilTabel);

    el.hapusSemua.addEventListener("click", () => {
    if (confirm("Hapus semua jadwal?")) {
        jadwal = [];
        simpanData();
        tampilTabel();
        tampilPesan("Semua jadwal dihapus.", "ok");
    }
    });

    /* ---------- 7. MULAI ---------- */
    tampilTabel();