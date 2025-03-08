// Inisialisasi Firebase Auth & Firestore
const auth = firebase.auth();
const db = firebase.firestore();

// Fungsi Login
window.login = function () {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            const user = userCredential.user;
            console.log("Login sukses:", user);

            // Catat waktu login ke Firestore
            const timestamp = firebase.firestore.FieldValue.serverTimestamp();
            db.collection("presensi").doc(user.uid).set({
                email: user.email,
                waktuMasuk: timestamp
            }, { merge: true })
            .then(() => {
                console.log("Presensi berhasil dicatat!");

                // Arahkan ke halaman konfirmasi setelah login sukses
                window.location.href = "konfirmasi.html";
            })
            .catch(error => {
                console.error("Gagal mencatat presensi:", error);
            });

        })
        .catch(error => {
            console.error("Error saat login:", error);
            document.getElementById("status").innerText = "Login Gagal: " + error.message;
        });
};
