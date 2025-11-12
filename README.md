🖱️ Komutla Ayarlanabilir Buton Rol Sistemi Altyapısı - 
Bu proje, Discord sunucularınızda kullanıcıların tek bir butona tıklayarak rol almasını/kaldırmasını sağlayan dinamik, komutla yapılandırılabilir bir Discord.js altyapısıdır. config.json'ı elle düzenleme ihtiyacını ortadan kaldırır.
🌟 Özellikler
 * Komutla Yapılandırma: Yeni butonlar eklemek veya mevcut paneli kurmak için botu durdurmaya gerek yoktur. Tüm roller Discord üzerinden komutla ayarlanır.
 * Dinamik Ekleme: Ayarlama komutu kullanıldığında, belirlenen mesaj otomatik olarak yeni butonu ekler.
 * Toggle (Aç/Kapa) Mantığı: Kullanıcı butona tıkladığında rolü yoksa rolü alır, varsa rolü kaldırır.
 * JSON Veritabanı: Sunucu ve rol ayarları, bot yeniden başlatılsa bile kalıcı olarak database.json dosyasında saklanır.
 * Temiz ve Sade: Emojisiz, yorumsal ifadelerden arındırılmış, okunaklı kod yapısı.
🛠️ Kurulum
Adım 1: Dosyaları Hazırlama
 * Bu projenin dosyalarını indirin.
 * Proje klasörünüzde terminali açın ve gerekli kütüphaneleri yükleyin:
   npm install discord.js

Adım 2: Yapılandırma (config.json)
config.json dosyasını açın ve bot tokeniniz, ön ekiniz ile birlikte komut ve mesaj ayarlarını girin:
{
  "TOKEN": "BOT_TOKENINIZ_BURAYA",
  "PREFIX": "!",
  "KOMUTLAR": {
    "YARDIM": "yardim",
    "PANEL_KUR": "rolpanelkur",
    "AYARLA": "rolayarla"
  },
  "MESAJLAR": {
    "YETKI_YOK": "Bu komutu kullanmak icin Yonetici yetkisine sahip olmalisiniz.",
    "AYAR_EKSİK": "Eksik parametre! Kullanim: `{prefix}{komut} <Mesaj ID> <Rol ID> <Buton Etiketi>`",
    "ROL_AYARLANDI": "Rol butonu basariyla ayarlandi ve butona eklendi.",
    "ROL_ALINDI": "Istenen rol uzerinizden kaldirildi.",
    "ROL_VERILDI": "Istenen rol size verildi."
  },
  "EMBEDS": {
    "YARDIM_BASLIK": "Buton Rol Sistemi Komutlari",
    "YARDIM_ACIKLAMA": "Bu altyapi, kullanicilarin butonlar araciligiyla rol almasini saglar. Iste komut listesi:",
    "YARDIM_AYARLA_BASLIK": "Yetkili Komutlari",
    "YARDIM_KULLANICI_BASLIK": "Kullanici Komutlari"
  }
}

Adım 3: Veritabanını Başlatma (database.json)
database.json dosyasının projenizin ana dizininde olduğundan ve başlangıçta aşağıdaki gibi boş olduğundan emin olun:
{
  "settings": {},
  "users": {},
  "roles": {}
}

Adım 4: Botu Çalıştırma
Terminalde botunuzu başlatın:
node index.js

🚀 Kullanım (Discord Üzerinden Ayarlama)
Botunuz çalışmaya başladıktan sonra, sistemi kurmak için adımları izleyin.
1. Rol Panelini Kurma (Yönetici Komutu)
Bu komut, kullanıcıların rol alacağı başlangıç panelini gönderir.
| Komut | Açıklama |
|---|---|
| !rolpanelkur | Komutun kullanıldığı kanala rol seçim panelini gönderir. Bu mesajın ID'sini bir sonraki adım için kopyalayın. |
2. Rolleri ve Butonları Ayarlama (Yönetici Komutu)
Bu komut ile panel mesajına istediğiniz kadar buton ekleyebilir ve rolleri kalıcı olarak ayarlayabilirsiniz.
| Komut | Açıklama |
|---|---|
| !rolayarla <Panel Mesaj ID> <Rol ID> <Buton Etiketi> | Belirtilen Mesaj ID'sine sahip panele yeni bir rol butonu ekler ve rolü sisteme kaydeder. |
Örnek Kullanım:
!rolayarla 123456789... 987654321... PC Oyuncusu

(Buton etiketi birden fazla kelime içerebilir, son parametredir.)
3. Yardım Komutu
Tüm komutların özetini Discord üzerinden görmek için:
| Komut | Açıklama |
|---|---|
| !yardim | Botun tüm yetkili ve kullanıcı komutlarını listeler. |
💡 Geliştirme İpuçları
 * Özelleştirilebilir Stil: ButtonStyle.Primary yerine ButtonStyle.Secondary, Success veya Danger kullanarak butonların renklerini değiştirebilirsiniz.
 * Yetki İzinleri: Rol atama/kaldırma hatası alıyorsanız, botun rolünün sunucudaki en üst rol olduğundan veya atamaya çalıştığı rolün üstünde olduğundan emin olun.
👤 Geliştirici
Bu altyapı bexA tarafından yapilmistir.
