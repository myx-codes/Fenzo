console.log("Customer frontend javascript file");

$(function () {
    // 1. Status o'zgarganda ishlaydi
    $(".status-select").on("change", function (e) {
        
        // A) User ID va yangi Statusni olamiz
        const id = $(this).attr("id");      // Masalan: "64d3b..."
        const newStatus = $(this).val();    // Masalan: "BLOCK"

        console.log("User ID:", id);
        console.log("New Status:", newStatus);

        // B) Rangni darhol o'zgartirish (UX uchun)
        // Eski ranglarni olib tashlaymiz
        $(this).removeClass("status-active status-block status-delete");
        // Yangi rang klassini qo'shamiz
        $(this).addClass("status-" + newStatus.toLowerCase());
        // Fokusni olib tashlaymiz (ko'k chiziq yo'qolishi uchun)
        $(this).blur();

        // C) Backendga so'rov yuborish
        axios.post("/seller/customer/update", {
            _id: id,
            userStatus: newStatus,
        })
        .then((response) => {
            const result = response.data;
            if (result.data) {
                console.log("Status updated successfully!");
                // Agar xohlasangiz kichik "Toast" xabar chiqarishingiz mumkin
            } else {
                alert("Status update failed!");
            }
        })
        .catch((err) => {
            console.log("Error:", err);
            alert("Please try again later!");
            // Xato bo'lsa, sahifani yangilab yuborish tavsiya qilinadi (eski holatga qaytish uchun)
            // location.reload(); 
        });
    });
});