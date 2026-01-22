console.log("Signup frontend javascript file");

$(function(){
    const fileTarget = $(".file-box .upload-hidden");
    let filename;

    fileTarget.on("change", function(){
        if (window.FileReader) {
            if (!this.files || this.files.length === 0) return;

            const uploadFile = $(this)[0].files[0];
            const fileType = uploadFile["type"];
            const validImageType = ["image/jpeg", "image/png", "image/jpg", "image/avif", "image/webp"];

            if (!validImageType.includes(fileType)) {
                alert("Please insert only jpeg, jpg, avif, webp and png");
                filename = undefined;
            } else {
                if (uploadFile) {
                    $(".upload-img-frame")
                        .attr("src", URL.createObjectURL(uploadFile))
                        .addClass("success");
                }
                filename = $(this)[0].files[0].name;
            }

            $(this).siblings(".upload-name").val(filename);
        }
    });
});

function validateSignupForm(){
    const memberNick = $(".member-nick").val();
    const memberPhone = $(".member-phone").val();
    const memberPassword = $(".member-password").val();
    const confirmPassword = $(".confirm-password").val();

    if (
        memberNick === "" ||
        memberPhone === "" ||
        memberPassword === "" ||
        confirmPassword === ""
    ) {
        alert("Please insert all required inputs");
        return false;
    }

    if (memberPassword !== confirmPassword) {
        console.log(memberPassword, confirmPassword);
        alert("password differs, please check");
        return false;
    }

    const memberImage = $(".member-image").get(0).files[0]
        ? $(".member-image").get(0).files[0].name
        : null;

    if (!memberImage) {
        alert("please insert restuarnt image");
        return false;
    }

    return true;
}
