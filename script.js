// Import Firebase modules (pastikan sudah dimuat di index.html)
const auth = firebase.auth();
const db = firebase.firestore();

// Fungsi Login
function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            const user = userCredential.user;
            document.getElementById("status").innerText = "Login berhasil!";
            ambilLokasi(user.uid);
        })
        .catch(error => {
            document.getElementById("status").innerText = "Error: " + error.message;
        });
}

// Ambil Lokasi Pengguna
function ambilLokasi(userId) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                if (cekJarak(latitude, longitude)) {
                    catatPresensi(userId, "masuk", latitude, longitude);
                } else {
                    alert("Anda berada di luar radius yang diizinkan!");
                    auth.signOut();
                }
            },
            error => {
                console.error("Gagal mendapatkan lokasi:", error);
            }
        );
    } else {
        alert("Geolocation tidak didukung di browser ini.");
    }
}

// Cek apakah dalam radius 20 meter dari lokasi yang ditentukan
function cekJarak(lat, lng) {
    const lokasiDiperbolehkan = [
        { lat: -6.589108056587621, lng: 106.8218295143879 },
        { lat: -6.592279, lng: 106.822581 }
    ];

    return lokasiDiperbolehkan.some(lokasi => {
        const jarak = hitungJarak(lat, lng, lokasi.lat, lokasi.lng);
        return jarak <= 20; // Dalam radius 20 meter
    });
}

// Fungsi menghitung jarak dua koordinat dalam meter
function hitungJarak(lat1, lon1, lat2, lon2) {
    function toRad(value) {
        return (value * Math.PI) / 180;
    }

    const R = 6371e3; // Radius bumi dalam meter
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Jarak dalam meter
}

// Fungsi mencatat presensi ke Firestore
function catatPresensi(userId, tipe, latitude, longitude) {
    db.collection("presensi").add({
        userId: userId,
        tipe: tipe, // "masuk" atau "keluar"
        lokasi: new firebase.firestore.GeoPoint(latitude, longitude),
        waktu: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        console.log("Presensi berhasil dicatat!");
        window.location.href = "konfirmasi.html"; // Redirect ke halaman konfirmasi
    })
    .catch(error => {
        console.error("Error mencatat presensi: ", error);
    });
}

// Logout otomatis setelah 10 menit
setTimeout(() => {
    auth.signOut();
    window.location.href = "index.html"; // Kembali ke halaman login
}, 600000); // 10 menit dalam milidetik (600000 ms)
