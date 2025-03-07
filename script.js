const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    auth.signInWithEmailAndPassword(email, password)
        .then(userCredential => {
            const user = userCredential.user;
            document.getElementById("status").innerText = "Login Berhasil!";
            checkLocation(user.uid);
        })
        .catch(error => {
            document.getElementById("status").innerText = "Login Gagal: " + error.message;
        });
}

function checkLocation(userId) {
    navigator.geolocation.getCurrentPosition(position => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        const lokasiValid = [
            { lat: -6.589108, lng: 106.821829 },
            { lat: -6.592279, lng: 106.822581 }
        ];

        const isValid = lokasiValid.some(loc => getDistance(loc.lat, loc.lng, lat, lng) <= 20);
        
        if (isValid) {
            recordPresence(userId, lat, lng);
        } else {
            document.getElementById("status").innerText = "Di luar lokasi!";
        }
    });
}

function recordPresence(userId, lat, lng) {
    db.collection("presensi").add({
        userId: userId,
        waktu: firebase.firestore.FieldValue.serverTimestamp(),
        tipe: "masuk",
        lokasi: new firebase.firestore.GeoPoint(lat, lng)
    }).then(() => {
        document.getElementById("status").innerText = "Pendataan Berhasil! Syukran!";
        setTimeout(() => auth.signOut(), 600000); // Logout otomatis 10 menit
    });
}

function getDistance(lat1, lon1, lat2, lon2) {
    function toRad(value) {
        return value * Math.PI / 180;
    }
    let R = 6371e3; // Earth radius in meters
    let φ1 = toRad(lat1), φ2 = toRad(lat2);
    let Δφ = toRad(lat2 - lat1);
    let Δλ = toRad(lon2 - lon1);
    let a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
