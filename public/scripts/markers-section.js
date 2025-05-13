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
  // const createMarkerBtn = document.querySelector(".add-target-btn");
  // Create business card inputs

  const displayedCreateImage = document.querySelector(".create-marker-img");
  const createTargetUpload = document.getElementById("create-target-upload");
  const createNameInput = document.getElementById("create-name");
  const createWidthInput = document.getElementById("create-width");
  const createActiveInput = document.getElementById("create-active");
  const createMetadata = document.getElementById("create-metadata");
  const saveCreateBtn = document.querySelector(".save-create-target");

  const errorPasswordList = document;
  let editing = false;

  let targetIdToEdit = null;

  // EVENT LISTENERS

  saveCreateBtn.addEventListener("click", async (e) => {
    await addBusinessCard();
  });

  createTargetUpload.addEventListener("change", (e) => {
    const file = e.target.files[0];

    if (file) {
      const allowedTypes = ["image/jpeg", "image/png"];

      if (!allowedTypes.includes(file.type)) {
        showErrorMessage("Only JPG and PNG images are allowed.");
        e.target.value = ""; // Clear the selected file
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      displayedCreateImage.src = imageUrl;
    }
  });

  closeCreateOverlay.addEventListener("click", (e) => {
    displayedCreateImage.src = "/images/image_upload_placeholder.jpg";
    createMarkerOverlay.style.display = "none";
  });

  // createMarkerBtn.addEventListener("click", (e) => {
  //   createMarkerOverlay.style.display = "flex";
  // });

  deleteBcardbtn.addEventListener("click", (e) => {
    deleteBcardOverlay.style.display = "flex";
  });
  deleteNoBtn.addEventListener("click", (e) => {
    deleteBcardOverlay.style.display = "none";
  });
  deleteYesBtn.addEventListener("click", async (e) => {
    deleteBusinessCard();
    resetEditTargetInputs();
    markerOverlay.style.display = "none";
    deleteBcardOverlay.style.display = "none";
  });

  closeMarkerOverlay.addEventListener("click", (e) => {
    markerOverlay.style.display = "none";
    resetEditTargetInputs();
  });

  function resetEditTargetInputs() {
    editTargetBtn.textContent = "Edit";
    targetNameInput.disabled = true;
    targetWidthInput.disabled = true;
    // targetActiveInput.disabled = true;
    targetMetadata.disabled = true;
    newTargetUpload.disabled = true;
    editing = false;
  }

  // This will handle the new image target for the business card
  function showOverlayHandler(el, targetData, targetId, theTarget) {
    el.addEventListener("click", (e) => {
      console.log("GETTING CLICKED!");
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
      const allowedTypes = ["image/jpeg", "image/png"];

      if (!allowedTypes.includes(file.type)) {
        showErrorMessage("Only JPG and PNG images are allowed.");
        e.target.value = ""; // Clear the selected file
        return;
      }
      // File is valid — proceed with upload or preview

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
      // targetActiveInput.disabled = false;
      // targetMetadata.disabled = false;
      newTargetUpload.disabled = false;
      editing = true;
    } else {
      // This will trigger after the user saves the updated data
      await updateBusinessCardData();

      resetEditTargetInputs();
    }

    const updatedTargetData = await Promise.all(
      targets.map(async (target) =>
        getBusinessCardData(
          target.image_target,
          target.date_created,
          target.date_modified
        )
      )
    );

    targets = await getAllBusinessCards();
    const updatedImageTargetEls = document.querySelectorAll(".image-target");

    updatedImageTargetEls.forEach((el) => {
      const imageTargetData = updatedTargetData.find(
        (data) => data.target_id === el.id
      );
      const theTarget = targets.find((data) => data.image_target === el.id);

      // Clear previous click handlers to prevent stacking
      el.replaceWith(el.cloneNode(true));
    });

    document.querySelectorAll(".image-target").forEach((el) => {
      const imageTargetData = updatedTargetData.find(
        (data) => data.target_id === el.id
      );
      const theTarget = targets.find((data) => data.image_target === el.id);

      showOverlayHandler(el, imageTargetData, el.id, theTarget);
    });
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
    <img class="target-img" id = "target-img-${target_id}" src="${imgUrl}" />
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
      console.log("Error getting business card:", err);
    }
  }

  async function updateBusinessCardData() {
    try {
      editTargetBtn.textContent = "Saving...";
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
      // formData.append("active_flag", targetActiveInput.checked);
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
        showErrorMessage(
          "The business card image may be invalid or is still processing. Please try again later."
        );
        console.log(`Error: ${response.status} - ${response.statusText}`);
        return;
      }

      if (response.status === 200) {
        showSuccessMessage("Business card successfully updated!");
        editTargetBtn.textContent = "Save";
      }
      const data = await response.json();

      if (data.image_url) {
        displayedTargetImage.src = data.image_url;
        const markerNewImage = document.getElementById(
          `target-img-${targetIdToEdit}`
        );

        markerNewImage.src = data.image_url;

        associatedEmployee.image_url = data.image_url;
      }

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

      showErrorMessage("Business card deleted!");
      // Delete the business card from the html

      document.getElementById(targetIdToEdit).remove();
    } catch (err) {
      console.log("Error deleting business card:", err);
    }
  }

  async function addBusinessCard() {
    try {
      console.log("CREATING BUSINESS CARD....");
      saveCreateBtn.textContent = "Adding Target...";
      if (!createTargetUpload.files[0]) {
        saveCreateBtn.textContent = "Add Target";
        return showErrorMessage("Please upload a business card image!");
      }
      if (!createNameInput.value) {
        saveCreateBtn.textContent = "Add Target";
        return showErrorMessage(
          "Please provide the name of the business card target!"
        );
      }

      if (!createWidthInput.value) {
        saveCreateBtn.textContent = "Add Target";
        return showErrorMessage(
          "Please specify the width of the business card target!"
        );
      }

      // Finds the associated employee using the targetMetadata
      const associatedEmployee = employees.find(
        (employee) => employee.employee_id === parseInt(createMetadata.value)
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
        saveCreateBtn.textContent = "Add Target";
        showErrorMessage(`Error: ${response.status} - ${response.statusText}`);
      }

      console.log("ADD DATA RESPONSE:", response);

      const data = await response.json();

      console.log("ADD BCARD DATA:", data);

      if (response.status === 400) {
        saveCreateBtn.textContent = "Add Target";
        return showErrorMessage(
          "Failed to add a new target! Please use another image or try again later."
        );
      }

      imgTargetDiv.insertAdjacentHTML(
        "beforeend",
        createImageTarget(
          data.data.name,
          data.theImage.image_url,
          data.data.image_target
        )
      );

      // Get the data of the newly created target from Vuforia
      const newVuforiaData = await getBusinessCardData(
        data.data.image_target,
        data.data.date_created,
        data.data.date_modified
      );

      // This will find the created image target element using the function above
      const newImageTarget = document.getElementById(data.data.image_target);

      // This will add the overlay click handler for the new image target component

      console.log("THE NEW VUFORIA DATA:", newVuforiaData);

      // Add an event listener to the new image target

      showOverlayHandler(
        newImageTarget,
        newVuforiaData,
        data.data.image_target,
        data.data
      );

      // showOverlayHandler(el, imageTargetData, el.id, theTarget);

      createMarkerOverlay.style.display = "none";
      createNameInput.value = "";
      createWidthInput.value = 0;
      createActiveInput.checked = true;
      saveCreateBtn.textContent = "Add Target";
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

  let targets = await getAllBusinessCards();
  let employees = await getActiveEmployees();

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
