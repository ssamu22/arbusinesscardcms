document.addEventListener("DOMContentLoaded", async () => {
  await fetchPrinciples();
  await fetchAwards();
});

// Edit buttons for the university principles: vision, misison, core values, philo
const editBtns = document.querySelectorAll(".uni-edit-btn");
// Submit buttons for the university principles: vision, misison, core values, philo
const submitBtns = document.querySelectorAll(".uni-submit-btn");
// Add click handlers to the edit buttons

const visionForm = document.getElementById("vision-form");
const missionForm = document.getElementById("mission-form");
const valuesForm = document.getElementById("values-form");
const philoForm = document.getElementById("philo-form");

const visionText = document.getElementById("lpu-vision");
const missionText = document.getElementById("lpu-mission");
const valuesText = document.getElementById("lpu-values");
const philoText = document.getElementById("lpu-philo");

const principleTexts = document.querySelectorAll(".lpu-principle");
const principleForms = document.querySelectorAll(".principle-form");
const awardContainer = document.querySelector(".award-item-container");
const editImageOverlay = document.querySelector(".edit-image-overlay");
const uploadCanvas = document.querySelector(".upload-canvas");
const closeUploadBtn = document.getElementById("close-upload-div");
const uploadAwardImg = document.getElementById("file-awardupload");
const uploadAwardCtx = uploadCanvas.getContext("2d");

drawInitialImage();

const submitAwardImgBtn = document.getElementById("submit-award-img");
const addAwardBtn = document.getElementById("add-award-btn");
const addAwardOverlay = document.querySelector(".add-award-overlay");
const closeAddAwardBtn = document.getElementById("close-add-div");
const addCategoryInput = document.getElementById("new-cat-input");
const addTitleInput = document.getElementById("new-title-input");
const addFileInput = document.getElementById("file-add-award");
const newAwardCanvas = document.querySelector(".add-award-canvas");
const newAwardCtx = newAwardCanvas.getContext("2d");
const submitNewAwardbtn = document.getElementById("submit-add-award");
let editImageAwardId = "";
const awardBucket = "assets/awardImages";
let awardFile = null;
let awardFilename = "";

const introVideo = document.getElementById("intro-video");
const updateVideoBtn = document.getElementById("update-vid-btn");
const deleteVideoBtn = document.getElementById("delete-vid-btn");
const videoInput = document.getElementById("video-upload");

getIntroVideo(1);

videoInput.addEventListener("change", async (e) => {
  await updateIntroVideo(1);
});
deleteVideoBtn.addEventListener("click", async (e) => {
  await deleteIntroVideo(1);
});

addFileInput.addEventListener("change", (event) => {
  awardFile = event.target.files[0]; // Get the uploaded file
  awardFilename = `award_${Date.now()}_${awardFile.name}`;
  const allowedTypes = ["image/jpeg", "image/png"];

  if (awardFile) {
    if (!allowedTypes.includes(awardFile.type)) {
      showErrorMessage("Only JPG and PNG images are allowed.");
      event.target.value = ""; // Clear the selected file
      return;
    }
    submitAwardImgBtn.disabled = false;
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();

      img.onload = function () {
        // Set canvas size to match the image size
        newAwardCanvas.width = img.naturalWidth;
        newAwardCanvas.height = img.naturalHeight;

        // Disable image smoothing for better quality
        newAwardCtx.imageSmoothingEnabled = true;
        newAwardCtx.imageSmoothingQuality = "high";

        // Clear canvas before drawing new image
        newAwardCtx.clearRect(
          0,
          0,
          newAwardCanvas.width,
          newAwardCanvas.height
        );
        // Draw the image on the canvas
        newAwardCtx.drawImage(
          img,
          0,
          0,
          newAwardCanvas.width,
          newAwardCanvas.height
        );
      };

      img.src = e.target.result; // Set the image source to the file's data URL
    };

    reader.readAsDataURL(awardFile); // Read the file as a data URL
  }
});

addAwardBtn.addEventListener("click", (ev) => {
  addAwardOverlay.style.display = "flex";
});

closeAddAwardBtn.addEventListener("click", (ev) => {
  addAwardOverlay.style.display = "none";
  addCategoryInput.value = "";
  addTitleInput.value = "";
  addFileInput.value = "";
  newAwardCtx.clearRect(0, 0, newAwardCanvas.width, newAwardCanvas.height);
  drawInitialImage();
  awardFile = null;
  awardFilename = "";
});

submitNewAwardbtn.addEventListener("click", () => {
  // Get the values from the inputs
  const title = addTitleInput.value.trim(); // Trim to remove any extra spaces
  const category = addCategoryInput.value.trim();
  const file = awardFile;
  console.log("DUD");
  // Check if any of the inputs are empty or null
  if (!title) {
    showErrorMessage("Please enter a title for the award.");
    return;
  }

  if (!category) {
    showErrorMessage("Please select a category for the award.");
    return;
  }

  if (!file) {
    showErrorMessage("Please upload an image file.");
    return;
  }

  // If all fields are valid, create FormData and call addNewAward
  const newAwardData = new FormData();
  newAwardData.append("title", title);
  newAwardData.append("category", category);
  newAwardData.append("bucket", "assets/awardImages"); // Assuming bucket path is static
  newAwardData.append("image", file);

  // Call the function to add the new award
  addNewAward(newAwardData);
});

async function updateIntroVideo(id) {
  const file = videoInput.files[0];
  updateVideoBtn.textContent = "Updating Video...";
  videoInput.disabled = true;
  if (!file) {
    videoInput.disabled = false;

    updateVideoBtn.textContent = "Change Video";
    return showErrorMessage("Please select a video file.");
  }

  // 1. Check file type
  if (file.type !== "video/mp4") {
    videoInput.disabled = false;

    updateVideoBtn.textContent = "Change Video";

    return showErrorMessage("Only MP4 videos are allowed.");
  }

  // 2. Load video metadata to check duration
  const video = document.createElement("video");
  video.preload = "metadata";

  video.onloadedmetadata = async () => {
    window.URL.revokeObjectURL(video.src);
    const duration = video.duration;

    // 3. Check duration (3 minutes = 180 seconds)
    if (duration > 180) {
      videoInput.disabled = false;

      updateVideoBtn.textContent = "Change Video";

      return showErrorMessage(
        "The maximum duration of a video is 3 minutes long."
      );
    }

    // 4. Create form data
    const formData = new FormData();
    formData.append("video", file);

    try {
      const response = await fetch(`/arcms/api/v1/videos/${id}`, {
        method: "PATCH",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        videoInput.disabled = false;

        updateVideoBtn.textContent = "Change Video";
        showSuccessMessage("Video updated successfully!");
        console.log("VIDEO UPDATE RESULT:", result);

        const videoUrl = result.data.public_url;
        const videoElement = document.getElementById("intro-video");

        // Remove existing sources
        while (videoElement.firstChild) {
          videoElement.removeChild(videoElement.firstChild);
        }

        // Create and append new source
        const source = document.createElement("source");
        source.src = videoUrl;
        source.type = "video/mp4"; // or determine from filename if needed
        videoElement.appendChild(source);

        // Load the new video
        videoElement.load();
        videoElement.play().catch((error) => {
          console.warn("Autoplay prevented or failed to play:", error);
        });
      } else {
        videoInput.disabled = false;

        updateVideoBtn.textContent = "Change Video";

        showErrorMessage("Upload failed: " + result.message);
      }
    } catch (err) {
      videoInput.disabled = false;
      updateVideoBtn.textContent = "Change Video";

      console.log(err);
      showErrorMessage("An unexpected error occurred.");
    }
  };

  video.src = URL.createObjectURL(file);
}

async function deleteIntroVideo(id) {
  deleteVideoBtn.textContent = "Removing Video...";
  videoInput.disabled = true;

  try {
    const response = await fetch(`/arcms/api/v1/videos/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      deleteVideoBtn.textContent = "Remove Video";
      videoInput.disabled = false;

      showSuccessMessage("Video deleted successfully!");

      // Clear the video player
      const videoElement = document.getElementById("intro-video");

      while (videoElement.firstChild) {
        videoElement.removeChild(videoElement.firstChild);
      }

      videoElement.load(); // reload with no source
    } else {
      deleteVideoBtn.textContent = "Remove Video";
      videoInput.disabled = false;

      showErrorMessage("Failed to delete video! Please try again later.");
    }
  } catch (err) {
    deleteVideoBtn.textContent = "Remove Video";
    videoInput.disabled = false;

    console.error(err);
    showErrorMessage("An unexpected error occurred during deletion.");
  }
}

async function getIntroVideo(id) {
  try {
    const response = await fetch(`/arcms/api/v1/videos/${id}`);
    if (response.ok) {
      const result = await response.json();
      console.log("Video retrieved:", result);

      const videoUrl = result.data.public_url;
      const videoElement = document.getElementById("intro-video");

      // Remove existing sources
      while (videoElement.firstChild) {
        videoElement.removeChild(videoElement.firstChild);
      }

      // Create and append new source
      const source = document.createElement("source");
      source.src = videoUrl;
      source.type = "video/mp4"; // or determine from filename if needed
      videoElement.appendChild(source);

      // Load the new video
      videoElement.load();
    } else {
      console.error("Error:", response.status, response.statusText);
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

async function addNewAward(formData) {
  try {
    const response = await fetch(`/lpu/1/awards/add`, {
      method: "POST", // or PUT if you need to update
      body: formData,
    });
    if (response.ok) {
      const result = await response.json(); // Assuming the response is JSON
      console.log("Success:", result);
      showSuccessMessage("New award successfully registered!");
      console.log(result);
      createNewAward(
        result.award_data.data[0].award_id,
        result.award_data.data[0].award_category,
        result.award_data.data[0].award_title,
        result.image_data.image_url
      );
      addAwardOverlay.style.display = "none";
    } else {
      console.error("Error:", response.status, response.statusText);
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

function createNewAward(awardid, awardCategory, awardTit, imgUrl) {
  const awardItem = document.createElement("div");
  awardItem.id = `award-item-${awardid}`;
  awardItem.classList.add("award-item");
  awardItem.innerHTML = `
    
<div class="award-image-div" id = "award-div-${awardid}" style="background-image: url('${imgUrl}')">
  <button type = "button" id = "edit-img-${awardid}" class = "edit-award-img">Upload</button>
</div>

    <div class="award-texts">
      <label for="award-desc-${awardid}">Category</label>
      <input type="text" id="award-desc-${awardid}" class="award-cat" value="${awardCategory}" disabled/>
      
      <label for="award-title-${awardid}">Title</label>
      <input type="text" id="award-title-${awardid}" class="award-tit" value="${awardTit}" disabled/>

      <div class= "award-edit-div">
        <button type="button" id="ach-submit-${awardid}" class="ach-submit-btn" style="display: none;">Submit</button>
        <button type="button" id="ach-edit-${awardid}" class="ach-edit-btn">Edit</button>
        <button type ="button" id ="ach-delete-${awardid}" class="ach-delete-btn">Delete</button>
      </div>
    </div>
  `;

  awardContainer.appendChild(awardItem);
  // Selecting the buttons inside this specific awardItem

  const imageEditBtn = awardItem.querySelector(`#edit-img-${awardid}`);
  imageEditBtn.addEventListener("click", (ev) => {
    editImageOverlay.style.display = "flex";
    editImageAwardId = awardid;
    editImageUrl = awardImages[idx];
  });

  const awardImgDiv = awardItem.querySelector(`#award-div-${awardid}`);
  awardImgDiv.addEventListener("mouseover", (ev) => {
    imageEditBtn.style.display = "inline";
  });
  awardImgDiv.addEventListener("mouseleave", (ev) => {
    imageEditBtn.style.display = "none";
  });

  const awardEditBtn = awardItem.querySelector(`#ach-edit-${awardid}`);
  const awardSubmitBtn = awardItem.querySelector(`#ach-submit-${awardid}`);
  const awardDeleteBtn = awardItem.querySelector(`#ach-delete-${awardid}`);
  const awardCat = awardItem.querySelector(`.award-cat`);
  const awardTitle = awardItem.querySelector(`.award-tit`);

  // Edit Button Logic
  awardEditBtn.addEventListener("click", () => {
    const isCancelMode = awardEditBtn.classList.contains("cancel-btn");

    if (isCancelMode) {
      // Revert to Edit mode (cancel)
      awardEditBtn.textContent = "Edit";
      awardSubmitBtn.style.display = "none";
      awardEditBtn.classList.remove("cancel-btn");
      awardCat.disabled = true;
      awardTitle.disabled = true;
    } else {
      // Enter Edit mode
      awardEditBtn.textContent = "Cancel";
      awardSubmitBtn.style.display = "inline";
      awardEditBtn.classList.add("cancel-btn");
      awardCat.disabled = false;
      awardTitle.disabled = false;
    }
  });

  awardDeleteBtn.addEventListener("click", async (e) => {
    const awardToDelete = document.getElementById(`award-item-${awardid}`);
    await deleteAward(awardid);
    awardToDelete.remove();
  });

  // Submit Button Logic
  awardSubmitBtn.addEventListener("click", () => {
    console.log("Submit clicked for award:", awardid);

    const requestBody = {
      awardTitle: awardTitle.value,
      awardCategory: awardCat.value,
    };

    // Call the function and pass the requestBody and award ID
    updateAward(requestBody, awardid)
      .then(() => {
        // Revert to initial state after successful submission
        awardCat.disabled = true;
        awardTitle.disabled = true;
        awardSubmitBtn.style.display = "none";
        awardEditBtn.textContent = "Edit";
        awardEditBtn.classList.remove("cancel-btn");
        showSuccessMessage("Award successfully updated!");
      })
      .catch((error) => {
        console.error("Update failed:", error);
      });
  });
}

async function deleteAward(awardId) {
  try {
    const response = await fetch(`/arcms/api/v1/awards/${awardId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      return showErrorMessage("Failed to delete award! Please try again.");
    }

    showErrorMessage("Award Deleted!");
  } catch (error) {
    return showErrorMessage("Failed to delete award! Please try again.");
  }
}

async function uploadNewAwardImg(formData, formAwardId) {
  try {
    const response = await fetch(`/lpu/1/award/images/${formAwardId}`, {
      method: "POST", // or PUT if you need to update

      body: formData,
    });

    if (response.ok) {
      const result = await response.json(); // Assuming the response is JSON
      console.log("Success:", result);
      showSuccessMessage("Award logo successfully updated!");
      editImageOverlay.style.display = "none";
      drawInitialImage();

      document.querySelector(
        `#award-div-${formAwardId}`
      ).style.backgroundImage = `url('${result.data.image_url}')`;
    } else {
      console.error("Error:", response.status, response.statusText);
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
}
submitAwardImgBtn.addEventListener("click", (ev) => {
  const awardImgFormData = new FormData();
  awardImgFormData.append("bucket", awardBucket);
  awardImgFormData.append("fileName", awardFilename);
  awardImgFormData.append("file", awardFile);

  for (let pair of awardImgFormData.entries()) {
    console.log(pair[0] + ": " + pair[1]);
  }

  uploadNewAwardImg(awardImgFormData, editImageAwardId);
});
uploadAwardImg.addEventListener("change", (event) => {
  awardFile = event.target.files[0]; // Get the uploaded file
  awardFilename = `award_${Date.now()}_${awardFile.name}`;
  const allowedTypes = ["image/jpeg", "image/png"];

  if (awardFile) {
    if (!allowedTypes.includes(awardFile.type)) {
      showErrorMessage("Only JPG and PNG images are allowed.");
      event.target.value = ""; // Clear the selected file
      return;
    }

    submitAwardImgBtn.disabled = false;
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();

      img.onload = function () {
        // Set canvas size to match the image size
        uploadCanvas.width = img.naturalWidth;
        uploadCanvas.height = img.naturalHeight;

        const uploadAwardCtx = uploadCanvas.getContext("2d");

        // Disable image smoothing for better quality
        uploadAwardCtx.imageSmoothingEnabled = true;
        uploadAwardCtx.imageSmoothingQuality = "high";

        // Clear canvas before drawing new image
        uploadAwardCtx.clearRect(0, 0, uploadCanvas.width, uploadCanvas.height);
        // Draw the image on the canvas
        uploadAwardCtx.drawImage(
          img,
          0,
          0,
          uploadCanvas.width,
          uploadCanvas.height
        );
      };

      img.src = e.target.result; // Set the image source to the file's data URL
    };

    reader.readAsDataURL(awardFile); // Read the file as a data URL
  }
});

closeUploadBtn.addEventListener("click", (ev) => {
  editImageOverlay.style.display = "none";
  uploadAwardCtx.clearRect(0, 0, uploadCanvas.width, uploadCanvas.height);
  drawInitialImage();
  uploadAwardImg.value = "";
});
const achievementsTabContent = document.querySelector(
  ".admin-achievements-content"
);

function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

principleForms.forEach((frm, idx) => {
  frm.addEventListener("submit", (ev) => {
    ev.preventDefault();

    if (idx === 0) {
      visionText.disabled = true;
    } else if (idx === 1) {
      missionText.disabled = true;
    } else if (idx === 2) {
      valuesText.disabled = true;
    } else if (idx === 3) {
      philoText.disabled = true;
    }
    const formTextArea = frm.querySelector(".lpu-principle");

    const requestBody = JSON.stringify({
      newText: escapeHTML(formTextArea.value),
    });

    console.log("THE REQUEST BODY:", requestBody);

    removeCancelClass(editBtns[idx], submitBtns[idx]);
    fetch(frm.action, {
      method: frm.method,
      headers: {
        "Content-Type": "application/json",
      },
      body: requestBody,
    })
      .then((response) => {
        if (response.ok) {
          console.log("Successfully updated form!");
          showSuccessMessage(
            `${
              idx === 0
                ? "Vision"
                : idx === 1
                ? "Mission"
                : idx === 2
                ? "Core values"
                : "Philosophy"
            } successfully updated!`
          );

          return response.json();
        } else {
          console.log("PRINCIPLE ERROR?", response);
          throw new Error("Error updating principle");
        }
      })
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });
  });
});

async function fetchPrinciples() {
  try {
    const response = await fetch("/lpu/1");
    const data = await response.json();
    console.log(data.branch);

    visionText.textContent = data.branch.vision;
    missionText.textContent = data.branch.mission;
    valuesText.textContent = data.branch.core_values;
    philoText.textContent = data.branch.philosophy;
  } catch (err) {
    console.error("Error fetching lpu principles data:", err);
  }
}

async function fetchAwards() {
  try {
    const awardResponse = await fetch("/lpu/1/awards");
    const data = await awardResponse.json();
    const awardImageIds = [];
    data.awards.forEach((award) => {
      awardImageIds.push(award.image_id);
    });

    const awardImages = [];
    for (const id of awardImageIds) {
      const awardImageResponse = await fetch(`/lpu/1/award/image/${id}`);
      const imageData = await awardImageResponse.json();
      awardImages.push(imageData.data.image_url); // Collect all fetched images
    }
    console.log(awardImages);

    generateAwards(data.awards, awardImages);
  } catch (err) {
    console.error("Error fetching Awards data: ", err);
  }
}

editBtns.forEach((btn, idx) => {
  btn.addEventListener("click", () => {
    principleTexts[idx].disabled = !principleTexts[idx].disabled;
    // Hides the submit button if cancel button is pressed
    if (btn.classList.contains("cancel-btn")) {
      removeCancelClass(btn, submitBtns[idx]);
      return;
    }

    // Displays submit button
    submitBtns[idx].style.display = "inline";
    // Turns the edit button into a cancel button after it is pressed
    btn.textContent = "Cancel";
    btn.classList.add("cancel-btn");
  });
});

function generateAwards(awards, awardImages) {
  const awardContainer = document.querySelector(".award-item-container");
  // <img src= class="award-image" />
  awards.forEach((award, idx) => {
    const awardItem = document.createElement("div");
    awardItem.id = `award-item-${award.award_id}`;
    awardItem.classList.add("award-item");
    awardItem.innerHTML = `
      
    <div class="award-image-div" id = "award-div-${award.award_id}" style="background-image: url('${awardImages[idx]}')">
        <button type = "button" id = "edit-img-${award.award_id}" class = "edit-award-img">Upload</button>
    </div>

      <div class="award-texts">
        <label for="award-desc-${award.award_id}">Category</label>
        <input type="text" id="award-desc-${award.award_id}" class="award-cat" value="${award.award_category}" disabled/>
        
        <label for="award-title-${award.award_id}">Title</label>
        <input type="text" id="award-title-${award.award_id}" class="award-tit" value="${award.award_title}" disabled/>
        
        <div class = "award-edit-div">
        <button type="button" id="ach-edit-${award.award_id}" class="ach-edit-btn">Edit</button>
        <button type="button" id="ach-submit-${award.award_id}" class="ach-submit-btn" style="display: none;">Submit</button>
        <button type ="button" id = "ach-delete-${award.award_id}" class="ach-delete-btn">Delete</button>
        </div>
      </div>


    `;

    awardContainer.appendChild(awardItem);
    // Selecting the buttons inside this specific awardItem

    const imageEditBtn = awardItem.querySelector(`#edit-img-${award.award_id}`);
    imageEditBtn.addEventListener("click", (ev) => {
      editImageOverlay.style.display = "flex";
      editImageAwardId = award.award_id;
      editImageUrl = awardImages[idx];
    });

    const awardImgDiv = awardItem.querySelector(`#award-div-${award.award_id}`);
    awardImgDiv.addEventListener("mouseover", (ev) => {
      imageEditBtn.style.display = "inline";
    });
    awardImgDiv.addEventListener("mouseleave", (ev) => {
      imageEditBtn.style.display = "none";
    });

    const awardEditBtn = awardItem.querySelector(`#ach-edit-${award.award_id}`);
    const awardSubmitBtn = awardItem.querySelector(
      `#ach-submit-${award.award_id}`
    );

    const awardDeleteBtn = awardItem.querySelector(
      `#ach-delete-${award.award_id}`
    );
    const awardCat = awardItem.querySelector(`.award-cat`);
    const awardTitle = awardItem.querySelector(`.award-tit`);

    // Edit Button Logic
    awardEditBtn.addEventListener("click", () => {
      const isCancelMode = awardEditBtn.classList.contains("cancel-btn");

      if (isCancelMode) {
        // Revert to Edit mode (cancel)
        awardEditBtn.textContent = "Edit";
        awardSubmitBtn.style.display = "none";
        awardEditBtn.classList.remove("cancel-btn");
        awardCat.disabled = true;
        awardTitle.disabled = true;
      } else {
        // Enter Edit mode
        awardEditBtn.textContent = "Cancel";
        awardSubmitBtn.style.display = "inline";
        awardEditBtn.classList.add("cancel-btn");
        awardCat.disabled = false;
        awardTitle.disabled = false;
      }
    });

    awardDeleteBtn.addEventListener("click", async (e) => {
      const awardToDelete = document.getElementById(
        `award-item-${award.award_id}`
      );

      await deleteAward(award.award_id);
      awardToDelete.remove();
    });

    // Submit Button Logic
    awardSubmitBtn.addEventListener("click", () => {
      console.log("Submit clicked for award:", award.award_id);

      const requestBody = {
        awardTitle: awardTitle.value,
        awardCategory: awardCat.value,
      };

      // Call the function and pass the requestBody and award ID
      updateAward(requestBody, award.award_id)
        .then(() => {
          // Revert to initial state after successful submission
          awardCat.disabled = true;
          awardTitle.disabled = true;
          awardSubmitBtn.style.display = "none";
          awardEditBtn.textContent = "Edit";
          awardEditBtn.classList.remove("cancel-btn");
          showSuccessMessage("Award successfully updated!");
        })
        .catch((error) => {
          console.error("Update failed:", error);
        });
    });
  });
}

async function updateAward(requestBody, awardId) {
  try {
    // Send PATCH request
    const response = await fetch(`/lpu/1/award/${awardId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message ||
          `Failed to update award with status ${response.status}`
      );
    }

    console.log("Successfully updated award:", awardId);
  } catch (error) {
    console.error("Error while updating award:", error);
    throw error; // Re-throw the error so it can be caught in the `.catch()`
  }
}

function removeCancelClass(cancelBtn, submitBtn) {
  submitBtn.style.display = "none";
  cancelBtn.classList.remove("cancel-btn");
  cancelBtn.textContent = "Edit";
}

function drawInitialImage() {
  // initial upload award image
  const initialImage = new Image();
  initialImage.src = "/images/icon_placeholder.jpg"; // Make sure this path is correct
  initialImage.onload = function () {
    uploadAwardCtx.drawImage(
      initialImage,
      0,
      0,
      uploadCanvas.width,
      uploadCanvas.height
    );

    newAwardCtx.drawImage(
      initialImage,
      0,
      0,
      newAwardCanvas.width,
      newAwardCanvas.height
    );
  };
}
