console.log("Products Frontend JS Ready");


$(function() {
    let changedOrders = []; // O'zgargan rasmlar tartibini saqlaymiz

    $(".image-field").on("change", function() {
        const order = $(this).data("order"); // masalan: 1, 2, 3...
        const file = this.files[0];

        if (file) {
            // ... (eski preview va validatsiya kodlaringiz) ...

            // YANGI QISM: Tartib raqamini saqlash
            // Array indeksi 0 dan boshlanadi, shuning uchun order-1 qilamiz
            const index = order - 1; 

            // Agar bu indeks avval qo'shilmagan bo'lsa, ro'yxatga qo'shamiz
            if (!changedOrders.includes(index)) {
                changedOrders.push(index);
            }
            
            // Tartiblash (0, 1, 4 kabi) va inputga yozish
            changedOrders.sort((a, b) => a - b);
            $("#imageIndexes").val(changedOrders.join(",")); 
            
            console.log("Yangilanadigan indekslar:", $("#imageIndexes").val());
        }
    });
});


$(function() {

    // ==================================================
    // 1. RASM YUKLASH VA PREVIEW (Bu qism AddProduct uchun kerak)
    // ==================================================
    $(".image-field").on("change", function() {
        const input = this;
        const order = $(this).data("order"); // 1, 2, 3, 4, 5
        const file = input.files[0];

        if (file) {
            // Fayl formati tekshiruvi
            const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
            if (!validTypes.includes(file.type)) {
                alert("Please upload a valid image (JPG, PNG, WEBP).");
                $(input).val(""); // Xato bo'lsa inputni tozalaymiz
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                const newSrc = e.target.result;

                // A) Kichik Preview rasmni yangilash
                const previewBox = $(`#preview-${order}`);
                previewBox.attr("src", newSrc);
                
                // Rasmni chiroyli ko'rsatish uchun stil
                previewBox.css({
                    'padding': '0',
                    'object-fit': 'cover',
                    'width': '100%',
                    'height': '100%'
                });

                // B) Katta Carousel rasmini ham yangilash (agar mavjud bo'lsa)
                const carouselImg = $(`#carousel-img-${order}`);
                if (carouselImg.length > 0) {
                    carouselImg.attr("src", newSrc);
                }
            }
            reader.readAsDataURL(file);
        }
    });

    // ==================================================
    // 2. VALIDATSIYA (Kamida 1-rasm bo'lishi shart)
    // ==================================================
    $("#addProductForm").on("submit", function(e) {
        const firstInput = $(".image-field[data-order='1']");
        const firstPreview = $("#preview-1");

        // Agar input bo'sh bo'lsa VA previewda hali ham default rasm tursa
        if (firstInput.val() === "" && firstPreview.attr('src').includes('/img/upload.svg')) {
            alert("Main image (first one) is required!");
            e.preventDefault(); // Formani jo'natishni to'xtatadi
            return false;
        }
        return true;
    });

    // ==================================================
    // 3. STATUS CHANGE HANDLER (Siz yuborgan qism)
    // ==================================================
    $(".status-select").on("change", async function(e) {
        const id = $(this).data("id");
        const status = $(this).val();
        const element = $(this);

        try {
            const response = await axios.post("/seller/product/status", {
                id: id,
                productStatus: status
            });
            
            console.log("Server javobi:", response.data);

            if (response.data.state === "success") {
                // Rangni yangilash
                element.removeClass("status-active status-pause status-delete");
                element.addClass(`status-${status.toLowerCase()}`);
                
                // Muvaffaqiyat xabari
                // alert("Status updated successfully!"); 
            } else {
                alert("Status update failed!");
            }

        } catch (err) {
            console.error("Status change error:", err);
            alert("Internet error or Server unreachable");
        }
    });

});

// HTML dagi onchange="updateStatusColor(this)" chaqiruvi xato bermasligi uchun
// bu funksiyani tashqarida qoldiramiz.
function updateStatusColor(element) {
    const val = element.value.toLowerCase();
    element.className = `status-select form-select form-select-sm status-${val}`;
}