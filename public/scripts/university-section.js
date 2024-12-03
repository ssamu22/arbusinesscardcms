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

    const formTextArea = frm.querySelector(".lpu-principle");

    const requestBody = JSON.stringify({
      newText: escapeHTML(formTextArea.value),
    });

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
          alert(
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
      </div>

      <button type="button" id="ach-edit-${award.award_id}" class="ach-edit-btn">Edit</button>
      <button type="button" id="ach-submit-${award.award_id}" class="ach-submit-btn" style="display: none;">Submit</button>
    `;

    awardContainer.appendChild(awardItem);
    // Selecting the buttons inside this specific awardItem

    const imageEditBtn = awardItem.querySelector(`#edit-img-${award.award_id}`);
    imageEditBtn.addEventListener("click", (ev) => {
      alert("EDITING IMAGE");
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
          alert("SUCCESSFULLY UPDATED AWARD");
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
