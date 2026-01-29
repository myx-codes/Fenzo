$(function() {
    // ... (eski kodlar: image preview, validation ...)

    // 3. STATUS CHANGE HANDLER (Yangi qo'shilgan qism)
    $(".status-select").on("change", async function(e) {
        const id = $(this).data("id");      // data-id dan ID ni olamiz
        const status = $(this).val();       // tanlangan status (ACTIVE, PAUSE...)

        try {
            // Serverga yuborish
            const response = await axios.post("/seller/product/status", {
                id: id,
                productStatus: status
            });
            
            console.log("Server javobi:", response.data);

            if (response.data.state === "success") {
                // Muvaffaqiyatli bo'lsa, rangni yangilash (sizdagi funksiya)
                // Agar updateStatusColor funksiyasi global bo'lsa, o'zi ishlayveradi.
                // Lekin yaxshisi rangni shu yerda ham yangilab qo'yish mumkin:
                $(this).removeClass("status-active status-pause status-delete");
                $(this).addClass(`status-${status.toLowerCase()}`);
                
                // Muvaffaqiyatli bo'lgani haqida kichik belgi (Toast)
                alert("Status updated successfully!"); // Yoki chiroyliroq Toast ishlating
            } else {
                alert("Status update failed!");
            }

        } catch (err) {
            console.error("Status change error:", err);
            alert("Internet error or Server unreachable");
        }
    });

});

// Bu funksiya sizning HTML dagi onchange="updateStatusColor(this)" uchun kerak
// Lekin biz yuqorida jQuery on('change') ishlatdik.
// Ikkisi bir vaqtda ishlasa xato bermaydi, lekin jQuery varianti databasega yozadi.
function updateStatusColor(element) {
    // Bu funksiya faqat vizual rangni o'zgartiradi
    const val = element.value.toLowerCase();
    element.className = `status-select form-select form-select-sm status-${val}`;
}