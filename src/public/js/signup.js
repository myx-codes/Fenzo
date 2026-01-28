console.log("Signup frontend javascript file");

$(function () {
    // 1. Rasm yuklash va Preview (Oldindan ko'rish) qismi
    const fileTarget = $(".file-box .upload-hidden");
    let filename;

    fileTarget.on("change", function () {
        if (window.FileReader) {
            const uploadFile = $(this)[0].files[0];
            
            // Agar rasm tanlanmagan bo'lsa, to'xtaymiz
            if (!uploadFile) return;

            const fileType = uploadFile["type"];
            const validImageType = ["image/jpeg", "image/png", "image/jpg", "image/avif", "image/webp"];

            // Formatni tekshirish
            if (!validImageType.includes(fileType)) {
                alert("Iltimos, faqat jpeg, jpg, avif, webp va png formatidagi rasmlarni yuklang!");
                $(this).val(""); // Inputni tozalab tashlaymiz
            } else {
                // Rasmni ekranda ko'rsatish (Preview)
                if (uploadFile) {
                    $(".upload-img-frame")
                        .attr("src", URL.createObjectURL(uploadFile))
                        .addClass("success");
                }
                // Fayl nomini olish
                filename = uploadFile.name;
            }

            // Fayl nomini input yoniga yozish
            $(this).siblings(".upload-name").val(filename);
        }
    });
});

// 2. Formani yuborishdan oldin tekshirish (Validation)
function validateSignupForm() {
    // Fenzo loyihasiga moslab klasslarni o'zgartirdik (.user-...)
    const userNick = $(".user-nick").val();
    const userPhone = $(".user-phone").val();
    const userPassword = $(".user-password").val();
    const confirmPassword = $(".confirm-password").val();

    // 1-Tekshiruv: Bo'sh joylar
    if (
        userNick === "" ||
        userPhone === "" ||
        userPassword === "" ||
        confirmPassword === ""
    ) {
        alert("Iltimos, barcha maydonlarni to'ldiring!");
        return false;
    }

    // 2-Tekshiruv: Parollar mosligi
    if (userPassword !== confirmPassword) {
        alert("Parollar mos kelmadi, iltimos qayta tekshiring!");
        return false;
    }

    // 3-Tekshiruv: Rasm yuklanganligi
    // .user-image klassi orqali faylni topamiz
    const userImage = $(".user-image").get(0).files[0];

    if (!userImage) {
        alert("Iltimos, rasmingizni yuklang!");
        return false;
    }

    // Hammasi joyida bo'lsa
    return true;
}