// Gerekli DOM öğelerini al
const loginBtn = document.getElementById('loginBtn'); // Giriş butonu
const loginPopup = document.getElementById('loginPopup'); // Giriş popup penceresi
const closePopup = document.getElementById('closePopup'); // Popup penceresini kapatma düğmesi

// Dropdown menü durumunu takip etmek için bir değişken tanımla
let isOpen = false; // Başlangıçta dropdown menü kapalı

// Giriş butonuna tıklandığında
loginBtn.addEventListener('click', function() {
    // Dropdown menü açıksa kapat, kapalıysa aç
    if (isOpen) {
        loginPopup.style.display = 'none'; // Popup penceresini gizle
        isOpen = false; // Dropdown menüyü kapalı olarak işaretle
    } else {
        // dropdown menüyü butona göre sağ veya sol tarafa yerleştirme
        const rect = loginBtn.getBoundingClientRect(); // Butonun boyutlarını al
        const dropdownWidth = loginPopup.offsetWidth; // Dropdown menü genişliğini al
        const windowWidth = window.innerWidth; // Pencere genişliğini al
        const isDropdownFitRight = (rect.left + dropdownWidth) <= windowWidth; // Dropdown menünün pencereye sığıp sığmadığını kontrol et

        if (isDropdownFitRight) {
            // Dropdown menü sağa sığacak şekilde yerleştir
            loginPopup.style.left = rect.left + 'px';
        } else {
            // Dropdown menü sola sığacak şekilde yerleştir
            loginPopup.style.right = (windowWidth - rect.right) + 'px';
        }

        loginPopup.style.display = 'block'; // Popup penceresini göster
        isOpen = true; // Dropdown menüyü açık olarak işaretle
    }
});

// Popup penceresini kapatma düğmesine tıklandığında
closePopup.addEventListener('click', function() {
    loginPopup.style.display = 'none'; // Popup penceresini gizle
    isOpen = false; // Dropdown menüyü kapalı olarak işaretle
});

// Giriş menüsü dışına tıklandığında kapat
window.addEventListener('click', function(event) {
    if (event.target !== loginBtn && event.target !== loginPopup) {
        // Eğer tıklanan öğe giriş butonu veya giriş popup penceresi değilse
        loginPopup.style.display = 'none'; // Popup penceresini gizle
        isOpen = false; // Dropdown menüyü kapalı olarak işaretle
    }
});
