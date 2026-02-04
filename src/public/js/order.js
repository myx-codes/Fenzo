console.log("Orders JS ishladi!");

/**
 * Statusni o'zgartirish funksiyasi
 * @param {string} orderId - Buyurtma IDsi
 * @param {string} newStatus - Yangi tanlangan status
 */
async function updateOrderStatus(orderId, newStatus) {
    try {
        // 1. Tasdiqlash oynasi
        const confirmChange = confirm(`Siz rostdan ham statusni ${newStatus} ga o'zgartirmoqchimisiz?`);
        
        if (!confirmChange) {
            // Agar 'Yo'q' bosilsa, sahifani yangilab, eskini qaytarib qo'yamiz
            location.reload(); 
            return;
        }

        // 2. Loading holati (ixtiyoriy, userga bilinishi uchun)
        document.body.style.cursor = 'wait';

        // 3. Serverga so'rov yuborish
        const response = await axios.post('/seller/order/update', {
            orderId: orderId,
            orderStatus: newStatus
        });

        // 4. Muvaffaqiyatli javob kelsa
        if (response.status === 200) {
            // alert('Status muvaffaqiyatli yangilandi!'); // Kerak bo'lsa yoqing
            location.reload(); // Ranglar o'zgarishi uchun reload qilamiz
        }

    } catch (err) {
        console.error("Status o'zgartirishda xatolik:", err);
        alert('Xatolik yuz berdi! Iltimos qaytadan urinib ko\'ring.');
        location.reload();
    } finally {
        document.body.style.cursor = 'default';
    }
}