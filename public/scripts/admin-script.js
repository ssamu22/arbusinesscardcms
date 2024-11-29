document.addEventListener("DOMContentLoaded", function () {
  // const dashboardLink = document.getElementById('dashboard-link');
  const membersLink = document.getElementById("members-link");
  // const analyticsLink = document.getElementById('analytics-link');
  const universityLink = document.getElementById("university-link");
  const universityManagementLink = document.getElementById(
    "university-management-link"
  );
  const markersLink = document.getElementById("markers-link");
  const membersSection = document.getElementById("members-section");
  const universitySection = document.getElementById("university-section");
  const universityManagementSection = document.getElementById(
    "university-management-section"
  );
  const markersSection = document.getElementById("markers-section");

  function showSection(section) {
    membersSection.style.display = "none";
    universitySection.style.display = "none";
    universityManagementSection.style.display = "none";
    markersSection.style.display = "none";
    section.style.display = "block";

    // Update sidebar active state
    [
      membersLink,
      universityLink,
      universityManagementLink,
      markersLink,
    ].forEach((link) => {
      link.classList.remove("sidebar-active");
    });
    if (section === membersSection) membersLink.classList.add("sidebar-active");
    if (section === universitySection)
      universityLink.classList.add("sidebar-active");
    if (section === universityManagementSection)
      universityManagementLink.classList.add("sidebar-active");
    if (section === markersSection) markersLink.classList.add("sidebar-active");
  }

  // dashboardLink.addEventListener('click', function(e) {
  //     e.preventDefault();
  //     console.log('Dashboard clicked');
  // });
  showSection(membersSection);

  membersLink.addEventListener("click", function (e) {
    e.preventDefault();
    showSection(membersSection);
  });

  // analyticsLink.addEventListener('click', function(e) {
  //     e.preventDefault();
  //     console.log('Analytics clicked');
  // });

  universityLink.addEventListener("click", function (e) {
    e.preventDefault();
    showSection(universitySection);
  });

  universityManagementLink.addEventListener("click", function (e) {
    e.preventDefault();
    showSection(universityManagementSection);
  });

  markersLink.addEventListener("click", function (e) {
    e.preventDefault();
    showSection(markersSection);
  });

  // University Contents Tabs
  const tabs = document.querySelectorAll(".university-tab");
  const tabContents = document.querySelectorAll(".university-tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabId = tab.getAttribute("data-tab");

      tabs.forEach((t) => t.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      tab.classList.add("active");
      document.getElementById(`${tabId}-tab`).classList.add("active");
    });
  });

  // Handle university content updates
  const universityForm = document.getElementById("university-edit-form");
  const previewTitle = document.getElementById("preview-title");
  const previewText = document.getElementById("preview-text");
  const previewButton = document.getElementById("preview-button");
  const previewBackground = document.getElementById("preview-background");
  const previewImages = [
    document.getElementById("preview-image-1"),
    document.getElementById("preview-image-2"),
    document.getElementById("preview-image-3"),
  ];

  if (universityForm) {
    universityForm.addEventListener("submit", function (e) {
      e.preventDefault();

      previewTitle.textContent = document.getElementById("title").value;
      previewText.textContent = document.getElementById("content-text").value;
      previewButton.textContent = document.getElementById("button-text").value;

      const newBackground =
        document.getElementById("background-image").files[0];
      if (newBackground) {
        const reader = new FileReader();
        reader.onload = function (e) {
          previewBackground.src = e.target.result;
        };
        reader.readAsDataURL(newBackground);
      }

      for (let i = 0; i < 3; i++) {
        const newImage = document.getElementById(`carousel-image-${i + 1}`)
          .files[0];
        if (newImage) {
          const reader = new FileReader();
          reader.onload = function (e) {
            previewImages[i].src = e.target.result;
          };
          reader.readAsDataURL(newImage);
        }
      }

      console.log("University content updated");
    });
  }

  // Handle achievements
  const achievementForm = document.getElementById("achievement-add-form");
  const achievementsList = document.getElementById("achievements-list");

  if (achievementForm) {
    achievementForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const newImage = document.getElementById("achievement-image").files[0];
      const description = document.getElementById(
        "achievement-description"
      ).value;

      if (newImage && description) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const achievementItem = document.createElement("div");
          achievementItem.className = "achievement-item";
          achievementItem.innerHTML = `
                        <img src="${e.target.result}" alt="Achievement">
                        <p>${description}</p>
                    `;
          achievementsList.appendChild(achievementItem);
        };
        reader.readAsDataURL(newImage);

        // Clear form
        document.getElementById("achievement-image").value = "";
        document.getElementById("achievement-description").value = "";

        console.log("Achievement added");
      } else {
        console.log("Please provide both an image and a description");
      }
    });
  }
});

const departments = [
  "Department of Computer Studies",
  "Department of Engineering",
  "Department of Architecture",
];
const offices = [
  "COECSA Dean's Office",
  "Human Resources Office",
  "Quality Assurance Office",
];
const consultationTypes = [
  "Academic Consultation",
  "Career Counseling",
  "Research Guidance",
];

function populateList(listId, items) {
  const list = document.getElementById(listId);
  list.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.className = "delete-btn";
    deleteBtn.onclick = function () {
      deleteItem(listId, item);
    };
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}

function deleteItem(listId, item) {
  if (confirm("Are you sure you want to delete this item?")) {
    switch (listId) {
      case "departments-list":
        departments.splice(departments.indexOf(item), 1);
        break;
      case "offices-list":
        offices.splice(offices.indexOf(item), 1);
        break;
      case "consultation-types-list":
        consultationTypes.splice(consultationTypes.indexOf(item), 1);
        break;
    }
    populateList(listId, eval(listId.split("-")[0]));
  }
}

function openModal(type) {
  const modal = document.getElementById("management-modal");
  const title = document.getElementById("modal-title");
  const form = document.getElementById("management-form");

  title.textContent = `Add New ${type.charAt(0).toUpperCase() + type.slice(1)}`;
  form.onsubmit = function (e) {
    e.preventDefault();
    const name = document.getElementById("item-name").value;
    if (name) {
      switch (type) {
        case "department":
          departments.push(name);
          populateList("departments-list", departments);
          break;
        case "office":
          offices.push(name);
          populateList("offices-list", offices);
          break;
        case "consultation":
          consultationTypes.push(name);
          populateList("consultation-types-list", consultationTypes);
          break;
      }
      closeModal();
    }
  };

  modal.style.display = "block";
}

function closeModal() {
  document.getElementById("management-modal").style.display = "none";
  document.getElementById("item-name").value = "";
}

// Initialize lists
document.addEventListener("DOMContentLoaded", function () {
  populateList("departments-list", departments);
  populateList("offices-list", offices);
  populateList("consultation-types-list", consultationTypes);
});

// Close modal when clicking outside
window.onclick = function (event) {
  const modal = document.getElementById("management-modal");
  if (event.target == modal) {
    closeModal();
  }
};

// MARKERS SECTION FUNCTIONALITY
const uploadInput = document.getElementById("upload");
const canvas = document.getElementById("histoEqCanvas");
const ctx = canvas.getContext("2d");
const submitCard = document.getElementById("submitBCard");
const form = document.getElementById("uploadForm");
const markerName = document.getElementById("marker-name");
const markerId = document.getElementById("marker-id");
uploadInput.addEventListener("change", (event) => {
  checkFields();
  handleFileSelect(event);
});

markerName.addEventListener("input", checkFields);
markerId.addEventListener("input", checkFields);

function checkFields() {
  nameIsFilled = markerName.value.trim() !== "";
  markerUploaded = uploadInput.files.length > 0;
  idIsFilled = markerId.value.trim() !== "" && !isNaN(markerId.value);

  submitCard.disabled = !(nameIsFilled && markerUploaded && idIsFilled);
}

form.addEventListener("submit", (event) => {
  event.preventDefault(); // Prevent the default form submission

  // Convert canvas to JPEG data URL
  const dataURL = canvas.toDataURL("image/jpeg"); // 'image/jpeg' format

  // Convert Data URL to Blob
  const [header, base64] = dataURL.split(",");
  const binary = atob(base64);
  const array = [];
  for (let i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  const blob = new Blob([new Uint8Array(array)], {
    type: "image/jpeg",
  });

  // Append the Blob to a FormData object
  const formData = new FormData();
  formData.append("name", markerName.value);
  formData.append("width", 6);
  formData.append("active_flag", true);
  formData.append(
    "application_metadata",
    JSON.stringify({
      Id: markerId.value,
    })
  );
  formData.append("image", blob, "canvas-image.jpg"); // Ensure the key is 'image'

  // Submit the form data using Fetch
  fetch(form.action, {
    method: form.method,
    body: formData,
  })
    .then((response) => {
      if (response.ok) {
        alert("Marker successfully uploaded!");
        return response.json();
      } else {
        throw new Error("Failed to upload image");
      }
    })
    .then((data) => console.log("Image uploaded successfully:", data))
    .catch((error) => {
      alert("Marker already exists! Please upload another one.");
      console.error("Error uploading image:", error);
    });
});

function handleFileSelect(event) {
  canvas.style.display = "block";
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      const originalData = getImageData(img);
      const histoEqData = histogramEqualization(originalData);

      drawEnhancedImage(histoEqData, "histoEqCanvas");

      addDownloadButton(
        "histoEqCanvas",
        "Download Histogram Equalized Image",
        "histo-equalized.jpg"
      );
    };
    img.src = e.target.result;
  };

  const dataURL = canvas.toDataURL("image/jpeg"); // Get base64 data

  const blob = dataURLToBlob(dataURL); // Convert to Blob
  console.log(blob);
  reader.readAsDataURL(file);
}
function dataURLToBlob(dataURL) {
  const [header, base64] = dataURL.split(",");
  const binary = atob(base64);
  const array = [];
  for (let i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], {
    type: header.split(":")[1].split(";")[0],
  });
}
function getImageData(img) {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}
function drawEnhancedImage(imageData, canvasId) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  ctx.putImageData(imageData, 0, 0);
}

function addDownloadButton(canvasId, buttonText, fileName) {
  const canvas = document.getElementById(canvasId);
  const button = document.createElement("button");
  button.textContent = buttonText;
  button.addEventListener("click", () => downloadImage(canvas, fileName));
  document.querySelector(".canvasDiv").appendChild(button);
}

function downloadImage(canvas, fileName) {
  const link = document.createElement("a");
  link.download = fileName;
  link.href = canvas.toDataURL("image/jpeg");
  link.click();
}

function histogramEqualization(imageData, blendRatio = 1) {
  const { data, width, height } = imageData;
  const histogram = new Array(256).fill(0);
  const cdf = new Array(256).fill(0);
  const equalizedData = new Uint8ClampedArray(data.length);

  // Calculate histogram
  for (let i = 0; i < data.length; i += 4) {
    const intensity = data[i]; // Grayscale
    histogram[intensity]++;
  }

  // Calculate cumulative distribution function (CDF)
  cdf[0] = histogram[0];
  for (let i = 1; i < 256; i++) {
    cdf[i] = cdf[i - 1] + histogram[i];
  }

  // Normalize CDF
  const minCDF = cdf[0];
  for (let i = 0; i < cdf.length; i++) {
    cdf[i] = Math.round(((cdf[i] - minCDF) * 255) / (width * height - minCDF));
  }

  // Apply equalization
  for (let i = 0; i < data.length; i += 4) {
    const intensity = data[i];
    equalizedData[i] =
      equalizedData[i + 1] =
      equalizedData[i + 2] =
        Math.round(blendRatio * cdf[intensity] + (1 - blendRatio) * intensity);
    equalizedData[i + 3] = data[i + 3]; // Alpha channel
  }

  return new ImageData(equalizedData, width, height);
}
