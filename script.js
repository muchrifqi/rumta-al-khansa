// Pastikan Firebase sudah diinisialisasi
const auth = firebase.auth();
const db = firebase.firestore();

// Fungsi Login
function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        document.getElementById("status").innerText = "Email dan password harus diisi!";
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("Login berhasil:", user.uid);
            document.getElementById("status").innerText = "Login berhasil!";
        })
        .catch((error) => {
            console.error("Login gagal:", error.message);
            document.getElementById("status").innerText =
