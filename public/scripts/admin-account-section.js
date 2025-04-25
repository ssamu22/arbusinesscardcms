const changePassBtn = document.getElementById("change-admin-psword");
const adminContainer = document.getElementById("admin-psword-container");
const editAdminImgBtn = document.querySelector(".change-admin-img");
const editAdminImgDiv = document.querySelector(".edit-img-div");
const editAdminNameBtn = document.getElementById("edit-admin-name");
const adminNameInput = document.getElementById("admin-name-input");
const adminEmailInput = document.getElementById("admin-email-input");
const adminAvatar = document.getElementById("edit-account-avatar");
const submitAdminImg = document.getElementById("submit-admin-img");
const submitPassBtn = document.getElementById("submit-admin-pass");
const adminImageCanvas = document.querySelector(".upload-admin-canvas");
const adminImageCtx = adminImageCanvas.getContext("2d");
const adminImageUpload = document.getElementById("file-admin-upload");
const adminImgOverlay = document.querySelector(".admin-image-overlay");
const closeUploadAdmin = document.querySelector(".close-upload-admin");

const errorPasswordList = document.querySelector(".tooltip-error-list");
const errorPasswordTooltip = document.querySelector(".tooltip-error-pass");

submitAdminImg.addEventListener("click", (e) => {
  updateAdminAvatar();
});

// window.currentAvatar

adminImageUpload.addEventListener("change", function (event) {
  const file = event.target.files[0];
  submitAdminImg.disabled = false;
  console.log("THE IMAGE:", file);
  if (!file) return;

  const allowedTypes = ["image/jpeg", "image/png"];

  if (!allowedTypes.includes(file.type)) {
    showErrorMessage("Only JPG and PNG images are allowed.");
    e.target.value = ""; // Clear the selected file
    return;
  }

  const img = new Image();
  img.onload = function () {
    // Clear canvas before drawing new image
    adminImageCtx.clearRect(
      0,
      0,
      adminImageCanvas.width,
      adminImageCanvas.height
    );
    adminImageCtx.drawImage(
      img,
      0,
      0,
      adminImageCanvas.width,
      adminImageCanvas.height
    );
  };

  img.src = URL.createObjectURL(file);
});

editAdminImgBtn.addEventListener("click", (e) => {
  adminImgOverlay.style.display = "flex";
});
closeUploadAdmin.addEventListener("click", (e) => {
  drawInitialAvatar();
  adminImgOverlay.style.display = "none";
});

getCurrentAdmin().then((currentAdmin) => {
  console.log("Current Admin:", currentAdmin);
  adminNameInput.value = currentAdmin.data.admin_name;
  adminEmailInput.value = currentAdmin.data.email;
  adminAvatar.src = currentAdmin.imageUrl;
});
changePassBtn.addEventListener("click", (e) => {
  toggleHidden(adminContainer);
});
editAdminImgDiv.addEventListener("mouseover", (e) => {
  toggleHidden(editAdminImgBtn);
  editAdminImgBtn.classList.remove("hidden");
});

editAdminImgDiv.addEventListener("mouseout", (e) => {
  editAdminImgBtn.classList.add("hidden");
});

editAdminNameBtn.addEventListener("click", (e) => {
  if (!adminNameInput.disabled) {
    updateAdminName();
  }
  adminNameInput.disabled = !adminNameInput.disabled;
  editAdminNameBtn.textContent = !adminNameInput.disabled ? "Submit" : "Edit";
});

submitPassBtn.addEventListener("click", (e) => {
  e.preventDefault();
  updateAdminPassword();
});

function toggleHidden(el) {
  el.classList.toggle("hidden");
}

async function updateAdminName() {
  const response = await fetch("/arcms/api/v1/admin/updateMe", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      admin_name: adminNameInput.value?.trim(), // Ensure no extra spaces or undefined
    }),
  });

  const data = await response.json(); // Ensure JSON response is handled properly

  if (data.status === "success") {
    showSuccessMessage(data.message);
    adminNameInput.value = data.data.admin_name;
    adminName.textContent = data.data.admin_name;
  } else {
    showErrorMessage(data.message);
  }
  console.log("UPDATE DATA:", data);
}

async function updateAdminPassword() {
  try {
    submitPassBtn.textContent = "Changing Password...";
    const currentPasswordInput = document.getElementById(
      "admin-current-psword"
    );
    const newPasswordInput = document.getElementById("admin-new-psword");
    const confirmPasswordInput = document.getElementById(
      "admin-confirm-psword"
    );

    console.log("CURRENT PASS:", currentPasswordInput.value);
    console.log("NEW PASS:", newPasswordInput.value);
    console.log("CONFIRM PASS:", confirmPasswordInput.value);

    const response = await fetch("/arcms/api/v1/admin/thisPassword", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPassword: currentPasswordInput.value,
        newPassword: newPasswordInput.value,
        passwordConfirm: confirmPasswordInput.value,
      }),
    });

    console.log("THE RESPNOSE:", response);
    const data = await response.json();
    errorPasswordList.innerHTML = "";

    if (response.status === 400) {
      errorPasswordTooltip.style.display = "inline-block";
      data.errors.forEach((e) => {
        console.log(e);
        const li = document.createElement("li");
        li.textContent = e;
        errorPasswordList.appendChild(li);
      });
    }

    if (response.status === 200) {
      errorPasswordTooltip.style.display = "none";
      showSuccessMessage(data.message);
      currentPasswordInput.value = "";
      newPasswordInput.value = "";
      confirmPasswordInput.value = "";
    }

    submitPassBtn.textContent = "Submit";
  } catch (err) {
    console.log("Error updating password:", err);
  }
}

async function updateAdminAvatar() {
  try {
    const formData = new FormData();
    formData.append("admin_avatar", adminImageUpload.files[0]);
    formData.append("bucket", "assets/adminImages");

    const response = await fetch("/arcms/api/v1/admin/change-avatar", {
      method: "PATCH",
      body: formData,
    });

    console.log("ZE RESPONDE", response);

    if (!response.ok) {
      showErrorMessage("Failed to update admin image! Please try again later.");
    }

    const data = await response.json();

    window.adminImageElement.src = data.theImage.image_url;
    adminAvatar.src = data.theImage.image_url;
    showSuccessMessage("Avatar successfully updated!");
    console.log("THE ADMIN IMAGE DATA:", data);
    adminImgOverlay.style.display = "none";
  } catch (err) {
    console.log("Error uploading admin avatar:", err);
  }
}

async function drawInitialAvatar() {
  const img = new Image();
  img.crossOrigin = "anonymous";
  await getCurrentAdmin().then((currentAdmin) => {
    img.src = currentAdmin.imageUrl;
  });
  console.log("CURRENT IMAGE SRC ROFL", window.currentAvatar);
  img.onload = function () {
    // Clear canvas before drawing new image
    adminImageCtx.clearRect(
      0,
      0,
      adminImageCanvas.width,
      adminImageCanvas.height
    );
    adminImageCtx.drawImage(
      img,
      0,
      0,
      adminImageCanvas.width,
      adminImageCanvas.height
    );
  };
}

async function getCurrentAdmin() {
  try {
    const response = await fetch("/arcms/api/v1/admin/getMe");

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const json = await response.json(); // ✅ Fix: Await JSON parsing

    console.log(json);

    return json;
  } catch (error) {
    console.error("Error fetching admin data:", error);
    return null;
  }
}

drawInitialAvatar();
