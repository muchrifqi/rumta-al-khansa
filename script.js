// Inisialisasi Firebase
const auth = firebase.auth();

// Pastikan login() tersedia di global scope
window.login = function () {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            console.log("Login sukses:", userCredential.user);
            document.getElementById("status").innerText = "Login Berhasil!";
        })
        .catch(error => {
            console.error("Error saat login:", error);
            document.getElementById("status").innerText = "Login Gagal: " + error.message;
        });
};
