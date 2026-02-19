console.log("Users frontend javascript file");

$(function () {
  $(".user-status").on("change", function (e) {
    const id = e.target.id;
    console.log("id:", id);

    const userStatus = $(`#${id}.user-status`).val();
    console.log("userStatus:", userStatus);

    // Axios updateChosenUser
    axios.post("/admin/user/edit", {
      _id: id,
      userStatus: userStatus,
    })
    .then((response) => {
      console.log("response:", response);
      const result = response.data;
      console.log("result:", result);

      if (result.data) {
        console.log("User updated!");
        $(".user-status").blur();
      } else {
        alert("User update failed!");
      }
    })
    .catch((err) => {
      console.log(err);
      alert("User update failed!");
    });
  });
});