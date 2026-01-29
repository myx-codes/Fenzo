$(function() {
    console.log("Seller Settings JS Ready");

    // Rasm tanlanganda "Preview" qilish logikasi
    $("#fileUpload").on("change", function() {
        const file = this.files[0]; // Inputdagi birinchi faylni olamiz

        if (file) {
            // 1. Fayl haqiqatan ham rasm ekanligini tekshirish
            const validImageTypes = ["image/gif", "image/jpeg", "image/png", "image/jpg", "image/webp"];
            if (!validImageTypes.includes(file.type)) {
                alert("Iltimos, faqat rasm yuklang (JPG, PNG, WEBP).");
                $(this).val(""); // Inputni tozalab tashlaymiz
                return;
            }

            // 2. Faylni o'qish uchun FileReader yaratamiz
            const reader = new FileReader();

            reader.onload = function(e) {
                // O'qib bo'lingach, natijani (base64) img src ga qo'yamiz
                $("#profilePreview").attr("src", e.target.result);
            }

            // 3. Faylni URL ko'rinishida o'qishni boshlaymiz
            reader.readAsDataURL(file);
        }
    });

});