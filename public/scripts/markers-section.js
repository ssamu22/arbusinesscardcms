document.addEventListener("DOMContentLoaded", async (e) => {
  const imgTargetDiv = document.querySelector(".image-target-div");
  const markerOverlay = document.querySelector(".marker-overlay");
  const closeMarkerOverlay = document.querySelector(".close-marker-overlay");
  const targetNameInput = document.getElementById("target-name");
  const targetWidthInput = document.getElementById("target-width");
  const targetActiveInput = document.getElementById("target-active");
  const targetDateCreated = document.getElementById("target-date-created");
  const targetDateModified = document.getElementById("target-date-modified");
  const targetRating = document.getElementById("target-rating");
  const targetRecognition = document.getElementById("target-recognition");
  const targetMetadata = document.getElementById("target-metadata");
  const editTargetBtn = document.querySelector(".edit-target-info");
  const newTargetUpload = document.getElementById("new-target-upload");
  const displayedTargetImage = document.querySelector(".selected-marker-img");
  const deleteBcardOverlay = document.querySelector(".marker-info-overlay");
  const deleteBcardbtn = document.querySelector(".delete-image-target");
  const deleteNoBtn = document.getElementById("no-delete-btn");
  const deleteYesBtn = document.getElementById("yes-delete-btn");

  // Create business Card Overlay components
  const createMarkerOverlay = document.querySelector(".create-marker-overlay");
  const closeCreateOverlay = document.querySelector(".close-create-marker");
  const createMarkerBtn = document.querySelector(".add-target-btn");
  // Create business card inputs

  const displayedCreateImage = document.querySelector(".create-marker-img");
  const createTargetUpload = document.getElementById("create-target-upload");
  const createNameInput = document.getElementById("create-name");
  const createWidthInput = document.getElementById("create-width");
  const createActiveInput = document.getElementById("create-active");
  const createMetadata = document.getElementById("create-metadata");
  const saveCreateBtn = document.querySelector(".save-create-target");
  let editing = false;

  let targetIdToEdit = null;

  // EVENT LISTENERS

  saveCreateBtn.addEventListener("click", async (e) => {
    await addBusinessCard();
  });

  createTargetUpload.addEventListener("change", (e) => {
    const file = e.target.files[0];

    if (file) {
      const imageUrl = URL.createObjectURL(file);
      displayedCreateImage.src = imageUrl;
    }
  });

  closeCreateOverlay.addEventListener("click", (e) => {
    createMarkerOverlay.style.display = "none";
  });

  createMarkerBtn.addEventListener("click", (e) => {
    createMarkerOverlay.style.display = "flex";
  });

  deleteBcardbtn.addEventListener("click", (e) => {
    deleteBcardOverlay.style.display = "flex";
  });
  deleteNoBtn.addEventListener("click", (e) => {
    deleteBcardOverlay.style.display = "none";
  });
  deleteYesBtn.addEventListener("click", async (e) => {
    await deleteBusinessCard();
    markerOverlay.style.display = "none";
    deleteBcardOverlay.style.display = "none";
  });

  closeMarkerOverlay.addEventListener("click", (e) => {
    markerOverlay.style.display = "none";
  });

  // This will handle the new image target for the business card
  function showOverlayHandler(el, targetData, targetId, theTarget) {
    el.addEventListener("click", (e) => {
      console.log("THE ASSOCIATED EMPLOYEE:", targetData);
      targetMetadata.value = theTarget.associated_employee;
      displayedTargetImage.src = theTarget.image_url;
      targetIdToEdit = targetId;
      targetNameInput.value = targetData.name;
      targetWidthInput.value = targetData.width;
      targetActiveInput.checked = targetData.active_flag;
      targetDateCreated.textContent = targetData.date_created;
      targetDateModified.textContent = targetData.date_modified;
      targetRating.textContent = targetData.tracking_rating;
      targetRecognition.textContent =
        targetData.reco_rating !== "" ? targetData.reco_rating : "0";
      markerOverlay.style.display = "flex";
    });
  }
  newTargetUpload.addEventListener("change", (e) => {
    const file = e.target.files[0];

    if (file) {
      const imageUrl = URL.createObjectURL(file);
      displayedTargetImage.src = imageUrl;
    }
  });

  editTargetBtn.addEventListener("click", async (e) => {
    if (!editing) {
      // This will trigger if the user wants to update the data of the target
      e.target.textContent = "Save";
      targetNameInput.disabled = false;
      targetWidthInput.disabled = false;
      targetActiveInput.disabled = false;
      targetMetadata.disabled = false;
      editing = true;
    } else {
      // This will trigger after the user saves the updated data
      await updateBusinessCardData();
      e.target.textContent = "Edit";
      targetNameInput.disabled = true;
      targetWidthInput.disabled = true;
      targetActiveInput.disabled = true;
      targetMetadata.disabled = true;
      editing = false;
    }
  });

  function addMetadataOption(employee_id, fullname) {
    // Create a new option element
    const newOption = document.createElement("option");
    newOption.value = employee_id; // Set the value
    newOption.textContent = fullname; // Set the display text

    // Append the new option to the select element
    targetMetadata.appendChild(newOption);

    const clonedOption = newOption.cloneNode(true);
    createMetadata.appendChild(clonedOption);
  }

  function createImageTarget(name, imgUrl, target_id) {
    return `
  <div class="image-target" id=${target_id}>
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

      console.log("ALL TARGETS:", targets);

      return targets;
    } catch (err) {
      console.log("Error getting all business cards:", err);
    }
  }

  async function getBusinessCardData(target_id, date_created, date_modified) {
    try {
      console.log("GETTING BUSINESS CARD DATA....");
      const response = await fetch(`/arcms/api/v1/vuforia/${target_id}`);

      if (!response.ok) {
        console.log(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      data.result.target_record.date_created = date_created;
      data.result.target_record.date_modified = date_modified;

      console.log("THE DATA OF THE TARGET:", data.result.target_record);

      return data.result.target_record;
    } catch (err) {
      console.log("Error getting all business cards:", err);
    }
  }

  async function updateBusinessCardData() {
    try {
      const associatedEmployee = employees.find(
        (employee) => employee.employee_id === parseInt(targetMetadata.value)
      );
      console.log("Associated Employee:", associatedEmployee);

      const metadata = {
        Id: associatedEmployee.employee_id,
        FirstName: associatedEmployee.first_name,
        LastName: associatedEmployee.last_name,
      };

      const formData = new FormData();
      formData.append("name", targetNameInput.value);
      formData.append("width", targetWidthInput.value);
      formData.append("active_flag", targetActiveInput.checked);
      formData.append("bucket", "assets/targetImages");
      formData.append("application_metadata", JSON.stringify(metadata));

      if (newTargetUpload.files[0]) {
        formData.append("image", newTargetUpload.files[0]);
      }

      const response = await fetch(`/arcms/api/v1/vuforia/${targetIdToEdit}`, {
        method: "PATCH",
        body: formData,
      });

      if (!response.ok) {
        console.log(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      console.log("UPDATE RESPONSE:", data);
    } catch (err) {
      console.log("FAIELD TO UPDATE BUSINESS CARD DATA:", err);
    }
  }

  async function deleteBusinessCard() {
    try {
      const response = await fetch(`/arcms/api/v1/vuforia/${targetIdToEdit}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        console.log(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      console.log("BUSINESS CARD DELETED!", data);

      // Delete the business card from the html

      document.getElementById(targetIdToEdit).remove();
    } catch (err) {
      console.log("Error deleting business card:", err);
    }
  }

  async function addBusinessCard() {
    try {
      console.log("CREATING BUSINESS CARD....");

      if (!createTargetUpload.files[0])
        return showErrorMessage("Please upload a business card image!");

      if (!createNameInput.value)
        return alert("Please provide the name of the business card target!");

      if (!createWidthInput.value)
        return alert("Please specify the width of the business card target!");

      // Finds the associated employee using the targetMetadata
      const associatedEmployee = employees.find(
        (employee) => employee.employee_id === parseInt(createMetadata.value)
      );

      console.log("META DATA VALUE OF THE CREATE:", createMetadata.value);
      console.log(
        "THE EMPLOYEE OF THE CREATED BUSINESS CARD:",
        associatedEmployee
      );

      const formData = new FormData();

      // console.log("Associated Employee:", associatedEmployee);

      const metadata = {
        Id: associatedEmployee.employee_id,
        FirstName: associatedEmployee.first_name,
        LastName: associatedEmployee.last_name,
      };

      formData.append("name", createNameInput.value);
      formData.append("width", createWidthInput.value);
      formData.append("active_flag", createActiveInput.checked);
      formData.append("bucket", "assets/targetImages");
      formData.append("application_metadata", JSON.stringify(metadata));
      formData.append("image", createTargetUpload.files[0]);

      const response = await fetch("/arcms/api/v1/vuforia", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        console.log(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      createMarkerOverlay.style.display = "none";
      createNameInput.value = "";
      createWidthInput.value = 0;
      createActiveInput.checked = true;
      showSuccessMessage("Successfully added a new business card target!");
    } catch (err) {
      console.log("Error creating business card", err);
    }
  }

  async function getActiveEmployees() {
    try {
      console.log("Fetching active employees...");

      const response = await fetch("/arcms/api/v1/employees/active");

      if (!response.ok) {
        throw new Error(`Failed to fetch employees: ${response.statusText}`);
      }

      const { employeesList } = await response.json();

      activeEmployees = employeesList;

      return activeEmployees;
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  }

  const targets = await getAllBusinessCards();
  const employees = await getActiveEmployees();

  // Add employee full name in metadata dropdown
  employees.forEach((employee) => {
    addMetadataOption(
      employee.employee_id,
      `${employee.honorifics?.toString() || ""} ${employee.first_name} ${
        employee.last_name
      }`
    );
  });

  const targetData = await Promise.all(
    targets.map(async (target) =>
      getBusinessCardData(
        target.image_target,
        target.date_created,
        target.date_modified
      )
    )
  );

  targets.forEach((target) => {
    imgTargetDiv.innerHTML += createImageTarget(
      target.name,
      target.image_url,
      target.image_target
    );
  });

  const allImageTargetEl = document.querySelectorAll(".image-target");

  allImageTargetEl.forEach((el) => {
    // This is the data of the target in Vuforia
    const imageTargetData = targetData.find((data) => data.target_id === el.id);

    // This is the data of the target
    const theTarget = targets.find((data) => data.image_target === el.id);

    showOverlayHandler(el, imageTargetData, el.id, theTarget);
  });
});
