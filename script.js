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
const db = firebase.firestore();
const auth = firebase.auth();

console.log("Firebase berhasil diinisialisasi:", app.name);

// Fungsi Login
function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("Login berhasil:", user.uid);
            document.getElementById("status").innerText = "Login berhasil!";
            
            // Simpan presensi ke Firestore
            saveAttendance(user.uid, "masuk");
        })
        .catch((error) => {
            console.error("Login gagal:", error.message);
            document.getElementById("status").innerText = "Login gagal: " + error.message;
        });
}

// Fungsi Simpan Presensi
function saveAttendance(userId, type) {
    const location = { lat: -6.592279, lng: 106.822581 }; // Gantilah dengan lokasi valid
    
    db.collection("presensi").add({
        userId: userId,
        lokasi: new firebase.firestore.GeoPoint(location.lat, location.lng),
        tipe: type,
        waktu: firebase.firestore.Timestamp.now()
    })
    .then(() => {
        console.log("Presensi berhasil disimpan!");
        window.location.href = "konfirmasi.html"; // Arahkan ke halaman konfirmasi
    })
    .catch((error) => {
        console.error("Gagal menyimpan presensi:", error);
    });
}
