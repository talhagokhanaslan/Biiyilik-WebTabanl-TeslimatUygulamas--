// DOMContentLoaded olayı gerçekleştiğinde çalışacak olan fonksiyon
document.addEventListener('DOMContentLoaded', function() {
    // Tüm sekme bağlantılarını seç
    const tabs = document.querySelectorAll('.menu-item');
    // Tüm sekme içeriklerini seç
    const tabContents = document.querySelectorAll('.tab-content');


    document.querySelector('#iste').classList.add('active');

    // Her bir sekme bağlantısı için döngü
    tabs.forEach(tab => {
        // Her bir sekme bağlantısına tıklama olayı ekle
        tab.addEventListener('click', function(event) {
            event.preventDefault(); // Bağlantının varsayılan tıklama davranışını engelle
            const targetTab = tab.getAttribute('data-tab'); // Hedef sekmenin veri-tab özelliğini al


            // Tüm sekme içeriklerini kontrol et
            tabContents.forEach(content => {
                // Eğer içerik, hedef sekme ile eşleşiyorsa
                if (content.id === targetTab) {
                    content.classList.add('active'); // İçeriği aktif yap
                } else {
                    content.classList.remove('active'); // Diğer tüm içerikleri pasif yap
                }
            });
        });
    });
});



document.addEventListener('DOMContentLoaded', function() {
    // Siparişleri almak için fetch isteği 
    fetch('/api/siparisler')
        .then(response => response.json())
        .then(data => {
            const siparislerTableBody = document.getElementById('siparislerTableBody');

            // Verileri tabloya ekle
            data.forEach(siparis => {
                const tr = document.createElement('tr');

                const siparisTarihiTd = document.createElement('td');
                siparisTarihiTd.textContent = new Date(siparis.order_date).toLocaleDateString(); // Sipariş tarihini uygun formatta göstermek için

                const urunlerTd = document.createElement('td');
                urunlerTd.textContent = siparis.products;

                const durumuTd = document.createElement('td');
                durumuTd.textContent = siparis.completed ? 'Siparişiniz Yolda' : 'Bekliyor';

                const updateButtonTd = document.createElement('td'); // Güncelleme düğmesi için yeni bir td elementi oluşturuldu
                const updateButton = document.createElement('button');
                updateButton.textContent = 'Güncelle';
                updateButton.addEventListener('click', () => {
                    const newProducts = prompt('Yeni ürünleri girin:');
                    if (newProducts !== null) {
                        fetch(`/api/siparisler/${siparis.id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ siparisler: newProducts })
                        })
                        .then(response => response.json())
                        .then(data => {
                            alert('Sipariş başarıyla güncellendi.');
                            // Gerekirse tabloyu güncelleyebilirsiniz
                        })
                        .catch(error => {
                            console.error('Sipariş güncellenirken bir hata oluştu:', error);
                            alert('Siparişiniz güncellendi');
                        });
                    }
                });

                const deleteButtonTd = document.createElement('td'); // Silme düğmesi için yeni bir td elementi oluşturuldu
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Sil';
                deleteButton.addEventListener('click', () => {
                    const confirmDelete = confirm('Siparişi silmek istediğinizden emin misiniz?');
                    if (confirmDelete) {
                        fetch(`/api/siparisler/${siparis.id}`, {
                            method: 'DELETE'
                        })
                        .then(response => response.json())
                        .then(data => {
                            alert('Sipariş başarıyla silindi.');
                            // Gerekirse tabloyu güncelleyebilirsiniz
                        })
                        .catch(error => {
                            console.error('Sipariş silinirken bir hata oluştu:', error);
                            alert('Siparişiniz silindi');
                        });
                    }
                });

                updateButtonTd.appendChild(updateButton); // Güncelleme düğmesi td içine ekleniyor
                deleteButtonTd.appendChild(deleteButton); // Silme düğmesi td içine ekleniyor

                tr.appendChild(siparisTarihiTd);
                tr.appendChild(urunlerTd);
                tr.appendChild(durumuTd);
                tr.appendChild(updateButtonTd); // Güncelleme düğmesi td ekleniyor
                tr.appendChild(deleteButtonTd); // Silme düğmesi td ekleniyor

                siparislerTableBody.appendChild(tr);
            });
        })
        .catch(error => {
            console.error('Siparişler getirilirken bir hata oluştu:', error);
            // Hata durumunda kullanıcıya bilgi verilebilir
        });
});

function siparisKaydet() {
    // Sipariş metnini al
    const siparis = document.getElementById('siparis').value;

    // Şu anki tarih ve saat bilgisini al
    const orderDate = new Date().toISOString();  // ISO formatında tarih ve saat

    // Sipariş verisi objesi oluştur
    const siparisData = {
        siparis: siparis,
        order_date: orderDate  // Tarih ve saat bilgisini sipariş verisine ekle
    };

 

    // POST isteği gönder
    fetch('/iste', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ siparisler: siparis })
    })
    .then(response => response.json())
    .then(data => {
        // Başarılı cevap alındığında yapılacaklar
        console.log(data.message); 
        // İşlem başarılı mesajını kullanıcıya göstermek 
        alert(data.message);
    })
    .catch(error => {
        // Hata durumunda yapılacaklar
        console.error('Sipariş kaydedilirken bir hata oluştu:', error);
        // Hata mesajını kullanıcıya göstermek 
    });
}








