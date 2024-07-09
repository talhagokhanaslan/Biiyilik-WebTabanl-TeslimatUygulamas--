const express = require('express');

const session = require('express-session');

const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(session({
    secret: 'mysecret', // Oturum bilgilerini şifrelemek için
    resave: false,
    saveUninitialized: false
}));

app.use(bodyParser.json());


// MySQL bağlantısı
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // MySQL kullanıcı adı
    password: '12345', // MySQL şifresi
    database: 'kullanici_veritabani' // Veritabanı adı
});

db.connect((err) => {
    if (err) {
        console.error('MySQL bağlantı hatası:', err.message);
        return;
    }
    console.log('MySQL connected...');
});

// Body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Static dosyaları sun
app.use(express.static('frontend'));


app.post('/kayitol', (req, res) => {
    const { firstName, lastName, phone, address, roomNumber, email, password } = req.body;
    const checkEmailSql = 'SELECT * FROM kayit WHERE email = ?';

    // E-posta adresinin zaten var olup olmadığını kontrol etme
    db.query(checkEmailSql, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Veritabanı hatası oluştu.' });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: 'Bu e-posta adresi ile kayıtlı bir kullanıcı zaten mevcut.' });
        } else {
            const sql = 'INSERT INTO kayit (firstName, lastName, phone, address, roomNumber, email, password) VALUES (?, ?, ?, ?, ?, ?, ?)';
            db.query(sql, [firstName, lastName, phone, address, roomNumber, email, password], (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'Veritabanına kaydedilirken bir hata oluştu.' });
                }
                return res.status(200).json({ message: 'Kayıt başarılı!' });
            });
        }
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT id FROM kayit WHERE email = ? AND password = ?';
    db.query(sql, [email, password], (err, results) => {
        if (err) {
            return res.status(500).send('Veritabanı sorgusu sırasında bir hata oluştu.');
        }
        if (results.length > 0) {
            const userId = results[0].id; // Kullanıcı ID'sini al
            req.session.userId = userId; // Oturum içinde userId'yi sakla
            res.json({ message: 'Giriş başarılı.', userId: userId });
        } else {
            res.json({ message: 'Geçersiz email veya şifre.' });
        }
    });
});

app.post('/iste', (req, res) => {
    // Oturumda kullanıcı bilgilerini kontrol et
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Oturum açılmış bir kullanıcı bulunamadı.' });
    }

    const userId = req.session.userId;
    const { siparisler } = req.body;

    // Sipariş metnini al ve boş olup olmadığını kontrol et
    if (!siparisler) {
        return res.status(400).json({ message: 'Sipariş metni boş olamaz.' });
    }

    // Siparişleri veritabanına kaydet
    const insertSiparisSql = 'INSERT INTO siparis (user_id, order_date, products, completed) VALUES (?, NOW(), ?, false)';
    db.query(insertSiparisSql, [userId, siparisler], (err, result) => {
        if (err) {
            console.error('Sipariş kaydedilirken bir hata oluştu:', err);
            return res.status(500).json({ message: 'Sipariş kaydedilirken bir hata oluştu.' });
        }
        res.status(200).json({ message: 'Sipariş başarıyla kaydedildi.' });
    });
});


app.put('/iste/:siparisId', (req, res) => {
    const siparisId = req.params.siparisId;
    const { siparisler } = req.body;

    // Sipariş metnini al ve boş olup olmadığını kontrol et
    if (!siparisler) {
        return res.status(400).json({ message: 'Sipariş metni boş olamaz.' });
    }

    // Siparişleri veritabanında güncelle
    const updateSiparisSql = 'UPDATE siparis SET products = ?, order_date = NOW() WHERE id = ?';
    db.query(updateSiparisSql, [siparisler, siparisId], (err, result) => {
        if (err) {
            console.error('Sipariş güncellenirken bir hata oluştu:', err);
            return res.status(500).json({ message: 'Sipariş güncellenirken bir hata oluştu.' });
        }
        res.status(200).json({ message: 'Sipariş başarıyla güncellendi.' });
    });
});


app.delete('/iste/:siparisId', (req, res) => {
    const siparisId = req.params.siparisId;

    // Siparişi veritabanından sil
    const deleteSiparisSql = 'DELETE FROM siparis WHERE id = ?';
    db.query(deleteSiparisSql, [siparisId], (err, result) => {
        if (err) {
            console.error('Sipariş silindi', err);
            return res.status(500).json({ message: 'Sipariş silindi' });
        }
        res.status(200).json({ message: 'Sipariş başarıyla silindi.' });
    });
});

app.get('/api/siparisler', (req, res) => {
    const userId = req.session.userId; 

    // Veritabanından kullanıcının siparişlerini sorgulama
    const selectSiparislerSql = 'SELECT * FROM siparis WHERE user_id = ?';
    db.query(selectSiparislerSql, [userId], (err, results) => {
        if (err) {
            console.error('Siparişler getirilirken bir hata oluştu:', err);
            return res.status(500).json({ message: 'Siparişler getirilirken bir hata oluştu.' });
        }
        res.status(200).json(results);
    });
});

app.get('/api/siparislerr', (req, res) => {
    const userId = req.session.userId; // 


    
    // Veritabanından kullanıcının siparişlerini sorgulama
    const selectSiparislerSql = 'SELECT * FROM siparis WHERE user_id != ?';
    db.query(selectSiparislerSql, [userId], (err, results) => {
        if (err) {
            console.error('Siparişler getirilirken bir hata oluştu:', err);
            return res.status(500).json({ message: 'Siparişler getirilirken bir hata oluştu.' });
        }
        res.status(200).json(results);
    });
});

app.put('/api/siparisler/:id/teslimet', (req, res) => {
    const siparisId = req.params.id;

    // Transaction başlatma 
    db.beginTransaction(err => {
        if (err) {
            console.error('Transaction başlatılırken hata oluştu:', err);
            return res.status(500).json({ message: 'Transaction başlatılırken hata oluştu.' });
        }

        // Sipariş durumunu güncelleme
        const updateSiparisSql = 'UPDATE siparis SET completed = 1 WHERE order_id = ?';
        db.query(updateSiparisSql, [siparisId], (err, result) => {
            if (err) {
                console.error('Sipariş durumu güncellendi', err);
                // Transaction varsa geri al
                return db.rollback(() => {
                    res.status(500).json({ message: 'Sipariş durumu güncellendi' });
                });
            }

            // Transaction varsa commit et
            db.commit(err => {
                if (err) {
                    console.error('Transaction commit edilirken hata:', err);
                    return db.rollback(() => {
                        res.status(500).json({ message: 'Transaction commit edilirken hata oluştu.' });
                    });
                }

                res.status(200).json({ message: 'Sipariş durumu başarıyla güncellendi.' });
            });
        });
    });
});


app.delete('/api/deleteAccount', (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'Kullanıcı kimliği eksik.' });
    }

    // Kullanıcıyı kayıt tablosundan silme işlemi
    const deleteQuery = 'DELETE FROM kayit WHERE id = ?';
    db.query(deleteQuery, [userId], (error, results) => {
        if (error) {
            console.error('Kullanıcı silinirken bir hata oluştu:', error);
            return res.status(500).json({ error: 'Kullanıcı silinirken bir hata oluştu.' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Belirtilen kullanıcı bulunamadı.' });
        }

        res.status(200).json({ message: 'Kullanıcı başarıyla silindi.' });
    });
});


// Sunucuyu başlat
app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});





/*

// Kayıt olma formundan gelen veriyi işleme
app.post('/kayitol', (req, res) => {
    const { firstName, lastName, phone, address, roomNumber, email, password } = req.body;
    const sql = 'INSERT INTO kayit (firstName, lastName, phone, address, roomNumber, email, password) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [firstName, lastName, phone, address, roomNumber, email, password], (err, result) => {
        if (err) {
            return res.status(500).send('Veritabanına kaydedilirken bir hata oluştu.');
        }
        res.redirect('/index.html');
    });
});

*/


/*Sipariş durumu güncelleme endpoint'i (PUT)
app.put('/api/siparisler/:id/teslimet', (req, res) => {
    const siparisId = req.params.order_id;

    // Sipariş durumunu güncelleme
    const updateSiparisSql = 'UPDATE siparis SET completed = 1 WHERE order_id = ?';
    db.query(updateSiparisSql, [siparisId], (err, result) => {
        if (err) {
            console.error('Sipariş durumu güncellenirken bir hata oluştu:', err);
            return res.status(500).json({ message: 'Sipariş durumu güncellenirken bir hata oluştu.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Sipariş bulunamadı.' });
        }
        res.status(200).json({ message: 'Sipariş durumu başarıyla güncellendi.' });
    });
});

*/


/*app.put('/api/siparisler/:id/teslimet', (req, res) => {
    const siparisId = req.params.order_id;

    // Transaction başlatma
    db.beginTransaction(err => {
        if (err) {
            console.error('Transaction başlatılırken hata:', err);
            return res.status(500).json({ message: 'Transaction başlatılırken hata oluştu.' });
        }

        // Sipariş durumunu güncelleme
        const updateSiparisSql = 'UPDATE siparis SET completed = 1 WHERE order_id = ?';
        db.query(updateSiparisSql, [siparisId], (err, result) => {
            if (err) {
                console.error('Sipariş durumu güncellenirken bir hata oluştu:', err);
                return db.rollback(() => {
                    res.status(500).json({ message: 'Sipariş durumu güncellenirken bir hata oluştu.' });
                });
            }

            // Commit işlemi
            db.commit(err => {
                if (err) {
                    console.error('Transaction commit edilirken hata:', err);
                    return db.rollback(() => {
                        res.status(500).json({ message: 'Transaction commit edilirken hata oluştu.' });
                    });
                }

                res.status(200).json({ message: 'Sipariş durumu başarıyla güncellendi.' });
            });
        });
    });
});
*/
