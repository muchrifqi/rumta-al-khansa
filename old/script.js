// Konfigurasi Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAnJSYcFN8FaAYdOe6uTY01QNBYpjavr38",
    authDomain: "presensi-pegawai-a6982.firebaseapp.com",
    projectId: "presensi-pegawai-a6982",
    storageBucket: "presensi-pegawai-a6982.appspot.com",
    messagingSenderId: "854447126365",
    appId: "1:854447126365:web:da08402128bf7026659ab4",
    measurementId: "G-5VYERY160S"
};

// Inisialisasi Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Titik Presensi
const presensiLocations = [
    { lat: -6.589108056587621, lng: 106.8218295143879 }, // Shahaba Ruko Tanah Baru Residence
    { lat: -6.592279, lng: 106.822581 } // Shahaba Jl. Swadaya
];

// Fungsi Login
function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("Login berhasil:", user.uid);
            checkLocationAndRecordAttendance(user.uid);
        })
        .catch((error) => {
            document.getElementById("login-status").innerText = "Login gagal: " + error.message;
        });
}

// Fungsi Cek Lokasi dan Rekam Presensi
function checkLocationAndRecordAttendance(userId) {
    navigator.geolocation.getCurrentPosition((position) => {
        const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };

        // Cek apakah pengguna dalam radius 20 meter dari salah satu titik presensi
        const isWithinRadius = presensiLocations.some(location => {
            const distance = calculateDistance(userLocation.lat, userLocation.lng, location.lat, location.lng);
            return distance <= 20; // 20 meter
        });

        if (isWithinRadius) {
            recordAttendance(userId, userLocation);
        } else {
            document.getElementById("login-status").innerText = "Anda berada di luar radius presensi.";
        }
    }, (error) => {
        document.getElementById("login-status").innerText = "Error mengambil lokasi: " + error.message;
    });
}

// Fungsi Hitung Jarak (Haversine Formula)
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3; // Radius bumi dalam meter
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Jarak dalam meter
}

// Fungsi Rekam Presensi
function recordAttendance(userId, userLocation) {
    const attendanceData = {
        userId: userId,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        location: new firebase.firestore.GeoPoint(userLocation.lat, userLocation.lng),
        status: "hadir"
    };

    db.collection("attendances").add(attendanceData)
        .then(() => {
            showConfirmationPage();
        })
        .catch((error) => {
            document.getElementById("login-status").innerText = "Error menyimpan presensi: " + error.message;
        });
}

// Fungsi Tampilkan Halaman Konfirmasi
function showConfirmationPage() {
    document.getElementById("login-page").classList.add("hidden");
    document.getElementById("confirmation-page").classList.remove("hidden");

    // Kembali ke halaman login setelah 10 menit
    setTimeout(() => {
        auth.signOut().then(() => {
            window.location.reload();
        });
    }, 600000); // 10 menit
}

// Fitur Keamanan: Cegah Presensi Ganda
function preventDuplicateAttendance(userId) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    db.collection("attendances")
        .where("userId", "==", userId)
        .where("timestamp", ">=", startOfDay)
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.size > 0) {
                document.getElementById("login-status").innerText = "Anda sudah melakukan presensi hari ini.";
            }
        });
}
