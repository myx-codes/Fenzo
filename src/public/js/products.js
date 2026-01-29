$(function() {
    console.log("Products Frontend JS Ready");

    // 1. IMAGE PREVIEW HANDLER
    $(".image-field").on("change", function() {
        const input = this;
        const order = $(this).data("order"); // 1, 2, 3...
        const file = input.files[0];

        if (file) {
            // Fayl turini tekshirish
            const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/avif"];
            if (!validTypes.includes(file.type)) {
                alert("Please upload a valid image file (JPG, PNG, WEBP).");
                $(input).val(""); // Inputni tozalash
                return;
            }

            // 
            const reader = new FileReader();
            reader.onload = function(e) {
                // Rasm manzilini img tegiga o'rnatamiz
                $(`#preview-${order}`).attr("src", e.target.result);
                // Stilni o'zgartirish (rasm yuklanganda border yo'qolishi uchun yoki chiroyli bo'lishi uchun)
                $(`#preview-${order}`).css('padding', '0'); 
            }
            reader.readAsDataURL(file);
        }
    });

    // 2. FORM VALIDATION (Qo'shimcha tekshiruv)
    $("#addProductForm").on("submit", function(e) {
        // Agar birinchi rasm yuklanmagan bo'lsa
        if ($(".image-field[data-order='1']").val() === "") {
            alert("Main image (first one) is required!");
            e.preventDefault();
            return false;
        }
        
        // Boshqa tekshiruvlar HTML 'required' atributi orqali ishlaydi
        return true;
    });
});