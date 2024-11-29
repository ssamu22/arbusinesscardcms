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
  awards.forEach((award, idx) => {
    const awardItem = document.createElement("div");
    awardItem.classList.add("award-item");
    awardItem.innerHTML = `
    <img src=${awardImages[idx]} class="award-image" />
            <div class="award-texts">
            <label for="award-desc">Category</label>
            <input type="text" id="award-desc" value = "${award.award_category}"/>
              <label for="award-title">Title</label>
              <input type="text" id="award-title" value = "${award.award_title}" />
            </div>
    <button>Edit</button>
`;

    awardContainer.appendChild(awardItem);
  });
}

function removeCancelClass(cancelBtn, submitBtn) {
  submitBtn.style.display = "none";
  cancelBtn.classList.remove("cancel-btn");
  cancelBtn.textContent = "Edit";
}
