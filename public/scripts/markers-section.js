document.addEventListener("DOMContentLoaded", async (e) => {
  const imgTargetDiv = document.querySelector(".image-target-div");
  const markerOverlay = document.querySelector(".marker-overlay");
  const closeMakerOverlay = document.querySelector(".close-marker-overlay");
  function createImageTarget(name, imgUrl) {
    return `
  <div class="image-target">
    <img class="target-img" src="${imgUrl}" />
    <h3 class="target-name">${name}</h3>
  </div>
`;
  }
  async function getAllBusinessCards() {
    try {
      console.log("GETTING ALL BUSINESS CARDS....");
      const response = await fetch("/arcms/api/v1/vuforia");

      if (!response.ok) {
        console.log(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      const targets = data.targets;

      return targets;
    } catch (err) {
      console.log("Error getting all business cards:", err);
    }
  }

  const targets = await getAllBusinessCards();

  targets.forEach((target) => {
    imgTargetDiv.innerHTML += createImageTarget(target.name, target.image_url);
  });

  const allImageTargetEl = document.querySelectorAll(".image-target");

  allImageTargetEl.forEach((el) => {
    el.addEventListener("click", (e) => {
      markerOverlay.style.display = "flex";
    });
  });

  closeMakerOverlay.addEventListener("click", (e) => {
    markerOverlay.style.display = "none";
  });
});
