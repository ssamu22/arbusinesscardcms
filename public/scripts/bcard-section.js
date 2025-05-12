document.addEventListener("DOMContentLoaded", async () => {
  const background_url = await getBackground();
  const contents = await getAllContents();
  let bcardCanvas = document.getElementById("canvas");
  let bcardCtx = bcardCanvas.getContext("2d");

  const contextMenu = document.getElementById("contextMenu");
  const applyBtn = document.getElementById("apply-btn");
  const textOptionsDiv = document.getElementById("text-options");
  const saveBgBtn = document.getElementById("save-bg-btn");
  const fileInput = document.getElementById("bcard-bg");
  const downloadBcardBtn = document.getElementById("download-bcard");
  const deleteBtn = document.getElementById("delete-text-btn");
  const clearBtn = document.getElementById("clear-btn");
  const highlightNameBtn = document.getElementById("highlight-name-btn");
  const highlightEmpNumberBtn = document.getElementById(
    "highlight-empnumber-btn"
  );
  const genAndReplaceBtn = document.getElementById("generate-bcard-btn");
  const allBusinessCards = await getAllBusinessCards();

  console.log("ALL ACTIVE IMAGE TARGETS:", allBusinessCards);
  let fileToSave = null;
  let backgroundImage = null;
  let $canvas = $("#canvas");
  let startX, startY;
  /* 
  {
    text: "SAMPLE TEXT",
    x: 20,
    y: 30,
    scale_factor: 1,
    type: "text",
    font_family: "Verdana",
    font_size: 16,
    font_weight: 100,
    color: "#45a049",
    rotation: 0,
    },
    */
  let texts = []; // Store added texts

  contents.forEach((content) => {
    texts.push(content);
  });

  console.log("THE TEXT CONTENTS:", texts);

  let selectedText = -1; // Index of the selected text
  let textToEdit = -1;

  setBackgroundFromURL(background_url);
  // EVENT LISTENERS

  function centerText(text) {
    const canvasWidth = bcardCanvas.width;
    const canvasHeight = bcardCanvas.height;
    for (let i = 0; i < texts.length; i++) {
      if (texts[i].text.toLowerCase() === text) {
        bcardCtx.font = `${texts[i].font_size || 16}px ${
          texts[i].font_family || "Arial"
        }`; // set font for measurement
        const textWidth = bcardCtx.measureText(texts[i].text).width;

        texts[i].x = (canvasWidth - textWidth) / 2;
        texts[i].y = canvasHeight / 2; // middle of canvas vertically
        break;
      }
    }
  }

  highlightNameBtn.addEventListener("click", async (e) => {
    centerText("name");
    // deleteBtn.style.display = "block";
    draw();
  });

  highlightEmpNumberBtn.addEventListener("click", async (e) => {
    centerText("employee number");

    // deleteBtn.style.display = "block";

    draw();
  });

  clearBtn.addEventListener("click", async (e) => {
    removeAllContent();
  });

  genAndReplaceBtn.addEventListener("click", async (e) => {
    genAndReplaceBtn.textContent = "Replacing Cards...";
    await generateAndReplaceTargets();

    genAndReplaceBtn.textContent = "Generate & Replace";
  });

  downloadBcardBtn.addEventListener("click", downloadCanvas);

  fileInput.addEventListener("change", async function (event) {
    if (fileInput.files.length === 0) {
      saveBgBtn.style.display = "none";
      return;
    }

    saveBgBtn.style.display = "inline-block";
    fileToSave = fileInput.files[0];

    const allowedTypes = ["image/jpeg", "image/png"];

    if (!allowedTypes.includes(fileToSave.type)) {
      showErrorMessage("Only JPG and PNG images are allowed.");
      event.target.value = ""; // Clear the selected file
      return;
    }

    if (fileToSave) {
      const imageUrl = URL.createObjectURL(fileToSave);
      setBackgroundFromURL(imageUrl);
    }
  });

  saveBgBtn.addEventListener("click", async function (event) {
    console.log("FILE TO SAVE:", fileToSave);

    try {
      // Send file to API and get the new image URL
      const imageUrl = await updateBackground(fileToSave);
      if (!imageUrl) return;
    } catch (err) {
      console.error("Error updating background:", err);
    }

    saveBgBtn.style.display = "none";
  });

  applyBtn.addEventListener("click", (e) => {
    if (textToEdit < 0) {
      showErrorMessage("Please select a text to edit.");
    }
    editText(textToEdit);
    draw();
  });

  deleteBtn.addEventListener("click", async (e) => {
    if (textToEdit !== -1) {
      deleteContent(texts[textToEdit].content_id);
      texts.splice(textToEdit, 1);
      textToEdit = -1;
      selectedText = -1;
      draw();
      contextMenu.style.display = "none";
    }
  });

  // Add event listeners
  $canvas.on("mousedown", handleMouseDown);
  $canvas.on("mousemove", handleMouseMove);
  $canvas.on("mouseup", handleMouseUp);
  $canvas.on("mouseout", handleMouseOut);

  // Add text when clicking submit
  $("#submit-new-text").click(async function () {
    if ($("#theText").val().toLowerCase() === "name") {
      showErrorMessage("Cannot duplicate default content!");
      return;
    }
    let y = texts.length * 20 + 20;
    let textValue = $("#theText").val();

    bcardCtx.font = "16px Verdana";
    let textWidth = bcardCtx.measureText(textValue).width;
    console.log("THE WIDTH OF THE NEW TEXT:", textWidth);
    let textHeight = 16;

    const newContent = await addContent({
      text: textValue,
      x: 50,
      y: y,
      scale_factor: 1,
      type: "text",
      font_family: "Arial",
      font_size: 16,
      font_weight: 23,
      color: "#000000",
    });

    console.log("NEW CONTENT:", newContent);

    texts.push(newContent);

    draw();
  });

  function setBackgroundFromURL(url) {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Prevent CORS issues if the image is hosted externally
    img.src = url;

    img.onload = function () {
      backgroundImage = img; // Store the image
      draw(); // Redraw the canvas with the new background
      setFileInputFromURL(url);
    };

    img.onerror = function () {
      console.error("Failed to load the image from URL:", url);
    };
  }

  async function setFileInputFromURL(url) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], "downloaded-image.jpg", {
        type: blob.type,
      });

      // Create a DataTransfer object to set the file input value
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      document.getElementById("bcard-bg").files = dataTransfer.files;

      console.log("File input updated with image from URL.");
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  }

  // Recalculate offsets dynamically
  function updateCanvasOffsets() {
    let canvasOffset = $canvas.offset();
    offsetX = canvasOffset.left;
    offsetY = canvasOffset.top;
  }

  // clear the canvas & redraw all texts
  function draw() {
    bcardCtx.clearRect(0, 0, bcardCanvas.width, bcardCanvas.height);
    console.log("CANVAS CLEARED!");
    if (backgroundImage) {
      console.log("UPLOADED IMAGE CONTENT:", backgroundImage);
      // Draw the image as the background
      bcardCtx.drawImage(
        backgroundImage,
        0,
        0,
        bcardCanvas.width,
        bcardCanvas.height
      );
    }

    drawText(); // Draw the text on top of the image
  }

  function drawText() {
    console.log("TEXTS:", texts);
    for (let i = 0; i < texts.length; i++) {
      bcardCtx.save();

      if (!texts[i].is_displayed) {
        continue;
      }

      if (i === selectedText) {
        console.log("THE SELECTED TEXT:", i);
        bcardCtx.strokeStyle = "red";
        bcardCtx.lineWidth = 2;
        bcardCtx.strokeRect(
          texts[i].x - 5,
          texts[i].y - texts[i].height,
          texts[i].width + 10,
          texts[i].height + 5
        );
      }

      bcardCtx.font = `${texts[i].font_weight} ${texts[i].font_size}px ${texts[i].font_family}`;

      texts[i].width = bcardCtx.measureText(texts[i].text).width;
      texts[i].height = texts[i].font_size * texts[i].scale_factor;
      bcardCtx.fillStyle = texts[i].color;

      bcardCtx.fillText(texts[i].text, texts[i].x, texts[i].y);
      bcardCtx.restore();
    }
  }

  // test if x,y is inside the bounding box of a text
  function textHittest(x, y, textIndex) {
    let text = texts[textIndex];
    return (
      x >= text.x &&
      x <= text.x + text.width &&
      y >= text.y - text.height &&
      y <= text.y
    );
  }

  // This will handle the update of the font options of a selected text
  function resetTextOptions() {
    textToEdit = -1;

    contextMenu.style.display = "none";

    const textInput = document.getElementById("text-content");
    const fontInput = document.getElementById("text-font");
    const scaleInput = document.getElementById("scaleFactor");
    const fontSizeInput = document.getElementById("fontSize");
    const fontWeightInput = document.getElementById("fontWeight");
    const colorInput = document.getElementById("color");

    textInput.disabled = true;
    fontInput.disabled = true;
    scaleInput.disabled = true;
    fontSizeInput.disabled = true;
    fontWeightInput.disabled = true;
    textInput.value = "";
    fontInput.value = "Arial";
    scaleInput.value = "1";
    fontSizeInput.value = 16;
    fontWeightInput.value = 100;
    colorInput.value = "#000000";
  }

  function updateTextOptions(idx) {
    const textInput = document.getElementById("text-content");
    const fontInput = document.getElementById("text-font");
    const scaleInput = document.getElementById("scaleFactor");
    const fontSizeInput = document.getElementById("fontSize");
    const fontWeightInput = document.getElementById("fontWeight");
    const colorInput = document.getElementById("color");

    fontInput.disabled = false;
    scaleInput.disabled = false;
    fontSizeInput.disabled = false;
    fontWeightInput.disabled = false;
    colorInput.disabled = false;
    textInput.value = texts[idx].text;
    colorInput.value = texts[idx].color;
    if (textInput.value.toLowerCase() === "name") {
      textInput.disabled = true;
    } else {
      contextMenu.style.display = "block";
      textInput.disabled = false;
    }
    fontInput.value = texts[idx].font_family;
    fontSizeInput.value = texts[idx].font_size;
    fontWeightInput.value = texts[idx].font_weight;
    colorInput.value = texts[idx].color;
  }

  // This will handle the update of a text in the business card
  async function editText(idx) {
    if (idx === -1) {
      return;
    }
    const textInput = document.getElementById("text-content");
    const fontInput = document.getElementById("text-font");
    const fontSizeInput = document.getElementById("fontSize");
    const fontWeightInput = document.getElementById("fontWeight");
    const colorInput = document.getElementById("color");

    // Show an error message if any values are missing
    if (
      !textInput.value ||
      !fontInput.value ||
      !fontSizeInput.value ||
      !fontWeightInput.value ||
      !colorInput.value
    ) {
      return;
    }

    if (fontSizeInput.value < 16) {
      fontSizeInput.value = 16;
    }

    texts[idx].text = textInput.value;
    texts[idx].font_family = fontInput.value;
    texts[idx].font_size = fontSizeInput.value;
    texts[idx].font_weight = fontWeightInput.value;
    texts[idx].color = colorInput.value;

    await updateContent({
      content_id: texts[idx].content_id,
      x: texts[idx].x,
      y: texts[idx].y,
      type: texts[idx].type,
      text: texts[idx].text,
      color: texts[idx].color,
      font_size: texts[idx].font_size,
      font_weight: texts[idx].font_weight,
      font_family: texts[idx].font_family,
    });
  }

  // handle mousedown events (select text)
  function handleMouseDown(e) {
    e.preventDefault();
    updateCanvasOffsets(); // Ensure offsets are updated dynamically

    startX = e.clientX - offsetX;
    startY = e.clientY - offsetY;

    // Check if clicking on a text
    for (let i = 0; i < texts.length; i++) {
      if (textHittest(startX, startY, i)) {
        textToEdit = i;
        updateTextOptions(textToEdit);
        selectedText = i;
        break;
      } else {
        contextMenu.style.display = "none";
        resetTextOptions();
      }
    }

    draw();
  }

  // handle mousemove events (drag text)
  function handleMouseMove(e) {
    if (selectedText < 0) return;
    e.preventDefault();

    let mouseX = e.clientX - offsetX;
    let mouseY = e.clientY - offsetY;

    let dx = mouseX - startX;
    let dy = mouseY - startY;

    startX = mouseX;
    startY = mouseY;

    // Move the selected text
    let text = texts[selectedText];
    text.x += dx;
    text.y += dy;

    draw();
  }

  // handle mouseup events (deselect text)
  function handleMouseUp(e) {
    e.preventDefault();
    editText(textToEdit);
    selectedText = -1;
  }

  // handle mouseout events (deselect text)
  function handleMouseOut(e) {
    e.preventDefault();
    selectedText = -1;
  }

  function downloadCanvas() {
    const link = document.createElement("a");
    link.download = "business-card.png"; // Set filename
    link.href = bcardCanvas.toDataURL("image/png"); // Convert canvas to data URL
    link.click(); // Trigger the download
  }

  async function getAllContents() {
    try {
      const response = await fetch("/arcms/api/v1/bcardContents");

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();

      return responseData.data;
    } catch (err) {
      console.log("Failed to retrieve business card contents:", err);
      return null;
    }
  }

  async function getBackground() {
    try {
      const response = await fetch("/arcms/api/v1/bcardBg/1");

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();

      console.log("BG URL RETRIEVED!", responseData.data.image_url);
      return responseData.data.image_url;
    } catch (err) {
      console.log("Failed to retrieve business card background:", err);
      return null;
    }
  }
  async function updateBackground(file) {
    console.log("UPDATING BACKGROUND!");
    try {
      saveBgBtn.textContent = "Saving...";
      const formData = new FormData();
      formData.append("bcard_image", file);

      const response = await fetch("/arcms/api/v1/bcardBg/1", {
        method: "PATCH",
        body: formData,
      });

      console.log("ZE UPDATE REPONSE:", response);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();

      console.log("BG URL RETRIEVED!", responseData.data.image_url);

      showSuccessMessage("Business card background updated successfully!");
      saveBgBtn.textContent = "Save";

      saveBgBtn.textContent = "Save Background";
      return responseData.data.image_url;
    } catch (err) {
      console.log("Failed to retrieve business card background:", err);
      return null;
    }
  }

  async function deleteContent(idx) {
    try {
      response = await fetch(`/arcms/api/v1/bcardContents/${idx}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (err) {
      console.log("Failed to delete content!", err);
      return null;
    }
  }

  async function removeAllContent() {
    try {
      response = await fetch(`/arcms/api/v1/bcardContents/delete-all`, {
        method: "DELETE",
      });

      if (!response.ok) {
        console.log(await response.json());
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      texts = texts.filter((txt) => txt.text.toLowerCase() === "name");
      draw();
    } catch (err) {
      console.log("Error removing all content!", err);
    }
  }

  async function addContent(newContent) {
    try {
      const response = await fetch("/arcms/api/v1/bcardContents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newContent),
      });

      console.log("THE RESPONSE:", response);

      const responseData = await response.json();

      return responseData.data[0];
    } catch (err) {
      console.log("Failed to add new content:", err);
      return null;
    }
  }

  async function updateContent(newContent) {
    try {
      const response = await fetch(
        `/arcms/api/v1/bcardContents/${newContent.content_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newContent),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("NEW DATA ADDED:", responseData.data[0]);

      return responseData.data[0];
    } catch (err) {
      console.log("Failed to update content!", err);
      return null;
    }
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

  async function getAllEmployees() {
    try {
      console.log("Fetching active employees...");

      const response = await fetch("/arcms/api/v1/employees/active");

      if (!response.ok) {
        throw new Error(`Failed to fetch employees: ${response.statusText}`);
      }

      const { employeesList } = await response.json();

      logs = employeesList;

      console.log("ALL ACTIVE EMPLOYEES IN THE SYSTEM:", logs);

      return logs;
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  }

  async function getAllBcardTargets() {
    try {
      console.log("GETTING ALL BUSINESS CARDS....");
      const response = await fetch("/arcms/api/v1/vuforia");

      if (!response.ok) {
        console.log(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      const targets = data.targets;

      console.log("ALL TARGETS IN THE SYSTEM:", targets);

      return targets;
    } catch (err) {
      console.log("Error getting all business cards:", err);
    }
  }

  async function replaceImageTarget(employee, imageTarget, imageBlob) {
    try {
      const formData = new FormData();
      formData.append("bucket", "assets/targetImages");
      formData.append(
        "image",
        imageBlob,
        `canvas_image-${employee.employee_id}-${Date.now()}.png`
      );

      console.log("THE IMAGE TARGET:", imageTarget);
      const response = await fetch(
        `/arcms/api/v1/vuforia/updateTarget/${imageTarget.image_target}`,
        {
          method: "PATCH",
          body: formData,
        }
      );

      if (!response.ok) {
        console.log(`Error: ${response.status} - ${response.statusText}`);
      }

      if (response.status === 200) {
        showSuccessMessage("Business card successfully updated!");
      }
      const data = await response.json();

      if (data.error?.result_code === "TargetStatusNotSuccess") {
        console.log("THE EMPLOYEE:", employee);
        replaceTargetErrors += 1;
      }

      console.log("UPDATE RESPONSE:", data);
    } catch (err) {
      showErrorMessage("FAILED TO UPDATE BUSINESS CARD DATA:", err);
    }
  }

  async function createImageTarget(theEmployee, imageBlob) {
    try {
      console.log("CREATING BUSINESS CARD....");

      const formData = new FormData();

      const metadata = {
        Id: theEmployee.employee_id,
        FirstName: theEmployee.first_name,
        LastName: theEmployee.last_name,
      };

      formData.append("name", `${theEmployee.employee_number}`);
      formData.append("width", 1);
      formData.append("active_flag", true);
      formData.append("bucket", "assets/targetImages");
      formData.append("application_metadata", JSON.stringify(metadata));
      formData.append(
        "image",
        imageBlob,
        `canvas_image-${theEmployee.employee_id}-${Date.now()}.png`
      );

      const response = await fetch("/arcms/api/v1/vuforia", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        showErrorMessage(`Error: ${response.status} - ${response.statusText}`);
      }

      console.log("ADD DATA RESPONSE:", response);

      const data = await response.json();

      console.log("NEW TARGET DATA OF EMPLOYEE:", data);

      if (response.status === 400) {
        createTargetErrors += 1;
        return showErrorMessage(
          "Failed to add a new target! Please use another image or try again later."
        );
      }

      showSuccessMessage("Successfully added a new business card target!");
    } catch (err) {
      console.log("Error creating business card", err);
    }
  }

  async function getAllEmployeeContacts() {
    try {
      console.log("Fetching active contacts...");

      const response = await fetch("/arcms/api/v1/contacts/allContacts");

      if (!response.ok) {
        throw new Error(`Failed to fetch employees: ${response.statusText}`);
      }

      const data = await response.json();

      console.log("ALL CONTACTS OF THE EMPLOYEES:", data.data);
      return data.data;
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  }

  // async function generateAndReplaceTargets() {
  //   // 1. Get all employees
  //   const allEmployees = await getAllEmployees();
  //   // 2. Get all image targets
  //   const allTargets = await getAllBcardTargets();
  //   // 3, Get all employee contacts
  //   const allContacts = await getAllEmployeeContacts();

  //   console.log("ALL TEXTS:", texts);

  //   const targetNameText = texts.find(
  //     (text) => text.text.toLowerCase() === "name"
  //   );
  //   const targetEmailText = texts.find(
  //     (text) => text.text.toLowerCase() === "email"
  //   );
  //   const targetLocationText = texts.find(
  //     (text) => text.text.toLowerCase() === "location"
  //   );
  //   const targetPositionText = texts.find(
  //     (text) => text.text.toLowerCase() === "position"
  //   );
  //   const targetNumberText = texts.find(
  //     (text) => text.text.toLowerCase() === "phone number"
  //   );

  //   // 3. Iterate through all employees
  //   allEmployees.forEach((employee) => {
  //     const employeeContact = allContacts.find(
  //       (contact) => contact.employee_id === employee.employee_id
  //     );

  //     console.log("THE EMPLOYEE CONTACT:", employeeContact);

  //     const target = allTargets.find(
  //       (target) => target.associated_employee == employee.employee_id
  //     );

  //     console.log("THE EMPLOYEE TARGET:", target);

  //     if (target) {
  //       // If employees already has a business card target, replace it
  //       console.log("THIS EMPLOYEE ALREADY HAS TARGET:", employee);
  //       if (targetEmailText.is_displayed && !employeeContact.email) {
  //         showErrorMessage(`${employee.last_name} doesn't have an email`);
  //         return;
  //       }

  //       if (targetLocationText.is_displayed && !employee.location) {
  //         showErrorMessage(
  //           `${employee.last_name} did not provide his/her location`
  //         );

  //         return;
  //       }

  //       if (targetPositionText.is_displayed && !employee.position) {
  //         showErrorMessage(
  //           `${employee.last_name} did not provide his/her position`
  //         );
  //         return;
  //       }

  //       if (targetNumberText.is_displayed && !employeeContact.phone_number) {
  //         showErrorMessage(
  //           `${employee.last_name} did not provide his/her phone number`
  //         );
  //         return;
  //       }

  //       targetNameText.text = `${employee.honorifics ?? ""} ${
  //         employee.first_name
  //       } ${employee.middle_name ?? ""} ${employee.last_name}`;
  //       targetEmailText.text = employeeContact.email;

  //       targetLocationText.text = `${employee.location}`;

  //       console.log("THE EMPLOYEE POSITION:", employee);
  //       targetPositionText.text = employee.position;

  //       targetNumberText.text = employeeContact.phone_number;

  //       draw();

  //       bcardCanvas.toBlob(async (blob) => {
  //         if (blob) {
  //           console.log("THE BLOB CREATED!");

  //           await replaceImageTarget(
  //             employee,
  //             allTargets.find(
  //               (target) => target.associated_employee == employee.employee_id
  //             ),
  //             blob
  //           ); // Pass the blob as the image
  //         } else {
  //           console.error("Failed to convert canvas to Blob.");
  //         }
  //       }, "image/jpeg");
  //       replaceImageTarget(employee);
  //     } else {
  //       // If the employee doesn't, create one
  //       console.log("THIS EMPLOYEE DOESN'T");

  //       if (targetEmailText.is_displayed && !employeeContact.email) {
  //         return;
  //       }

  //       if (targetLocationText.is_displayed && !employee.location) {
  //         return;
  //       }

  //       if (targetPositionText.is_displayed && !employee.position) {
  //         return;
  //       }

  //       if (targetNumberText.is_displayed && !employeeContact.phone_number) {
  //         return;
  //       }

  //       console.log(
  //         "THE NAME:",
  //         `${employee.honorifics ?? ""} ${employee.first_name} ${
  //           employee.middle_name ?? ""
  //         } ${employee.last_name}`
  //       );

  //       targetNameText.text = `${employee.honorifics ?? ""} ${
  //         employee.first_name
  //       } ${employee.middle_name ?? ""} ${employee.last_name}`;

  //       targetEmailText.text = employeeContact.email;

  //       targetLocationText.text = `${employee.location}`;

  //       targetPositionText.text = employee.position;

  //       targetNumberText.text = employeeContact.phone_number;

  //       // Update the canvas
  //       draw();

  //       // Use the canvas image as the new target
  //       bcardCanvas.toBlob(async (blob) => {
  //         if (blob) {
  //           console.log("THE BLOB:", blob);

  //           await createImageTarget(employee, blob);
  //         } else {
  //           console.error("Failed to convert canvas to Blob.");
  //         }
  //       }, "image/jpeg");
  //     }
  //   });

  //   if (targetNameText) targetNameText.text = "Name";
  //   if (targetEmailText) targetEmailText.text = "Email";
  //   if (targetLocationText) targetLocationText.text = "Location";
  //   if (targetPositionText) targetPositionText.text = "Position";
  //   if (targetNumberText) targetNumberText.text = "Phone Number";

  //   location.reload();
  // }

  const replaceTargetErrors = 0;
  const createTargetErrors = 0;

  async function generateAndReplaceTargets() {
    // 1. Get all employees
    const allEmployees = await getAllEmployees();
    // 2. Get all image targets
    const allTargets = await getAllBcardTargets();
    // 3. Get all employee contacts
    const allContacts = await getAllEmployeeContacts();

    console.log("ALL TEXTS:", texts);

    const targetNameText = texts.find(
      (text) => text.text.toLowerCase() === "name"
    );

    const employeeNumberText = texts.find(
      (text) => text.text.toLowerCase() === "employee number"
    );

    // Store all asynchronous operations in an array
    const tasks = [];

    // 3. Iterate through all employees
    for (const employee of allEmployees) {
      const employeeContact = allContacts.find(
        (contact) => contact.employee_id === employee.employee_id
      );

      console.log("THE EMPLOYEE CONTACT:", employeeContact);

      const target = allTargets.find(
        (target) => target.associated_employee == employee.employee_id
      );

      console.log("THE EMPLOYEE TARGET:", target);

      if (target) {
        // If employee already has a business card target, replace it
        targetNameText.text = `${employee.honorifics ?? ""} ${
          employee.first_name
        } ${
          employee.middle_name
            ? employee.middle_name.charAt(0).toUpperCase() + "."
            : ""
        } ${employee.last_name}`
          .replace(/\s+/g, " ")
          .trim();

        employeeNumberText.text = employee.employee_number;
        draw();

        const task = new Promise((resolve, reject) => {
          bcardCanvas.toBlob(async (blob) => {
            if (blob) {
              console.log("THE BLOB CREATED!");
              try {
                await replaceImageTarget(employee, target, blob);
                resolve();
              } catch (error) {
                console.error("Error replacing image target:", error);
                reject(error);
              }
            } else {
              console.error("Failed to convert canvas to Blob.");
              reject(new Error("Failed to convert canvas to Blob."));
            }
          }, "image/jpeg");
        });

        tasks.push(task);
      } else {
        // If the employee doesn't, create one
        console.log("THIS EMPLOYEE DOESN'T");

        console.log(
          "THE NAME:",
          `${employee.honorifics ?? ""} ${employee.first_name} ${
            employee.middle_name ?? ""
          } ${employee.last_name}`
        );

        targetNameText.text = `${employee.honorifics ?? ""} ${
          employee.first_name
        } ${employee.middle_name ?? ""} ${employee.last_name}`;
        employeeNumberText.text = employee.employee_number;

        // Update the canvas
        draw();

        const task = new Promise((resolve, reject) => {
          bcardCanvas.toBlob(async (blob) => {
            if (blob) {
              console.log("THE BLOB:", blob);
              try {
                await createImageTarget(employee, blob);
                resolve();
              } catch (error) {
                console.error("Error creating image target:", error);
                reject(error);
              }
            } else {
              console.error("Failed to convert canvas to Blob.");
              reject(new Error("Failed to convert canvas to Blob."));
            }
          }, "image/jpeg");
        });

        tasks.push(task);
      }
    }

    // Wait for all async tasks to complete before resetting text and reloading
    await Promise.all(tasks);

    if (targetNameText) targetNameText.text = "Name";
    if (employeeNumberText) employeeNumberText.text = "Employee Number";

    if (replaceTargetErrors > 0)
      showErrorMessage(
        "Some business cards were still processing. Please generate all cards again later."
      );

    if (createTargetErrors > 0)
      showErrorMessage(
        "Some business cards failed to create. Please check the database for more details and try again."
      );
    location.reload();
  }

  draw();
});

// function draw() {
//   bcardContext.clearRect(
//     0,
//     0,
//     bcardContext.canvas.width,
//     bcardContext.canvas.height
//   );
//   layers.forEach((item) => {
//     if (item.type === "image") {
//       drawImage(item);
//     } else if (item.type === "text") {
//       drawText(item);
//     }
//   });
// }

// function drawImage(item) {
//   if (!item.img) {
//     let image = new Image();
//     image.src = item.url;
//     item.img = image;
//     image.onload = () => {
//       draw();
//     };
//     return;
//   }

// STEPS FOR GENERATING/REPLACING BUSINESS CARDS
// NOTE: THE CONTENT TYPE(name, email, etc...)  SHOULD ALREADY BE FIXED
// CHANGE THE INPUT TO BUTTONS THAT YOU CAN TOGGLE TO HIDE OR SHOW THE PLACE HOLDER TEXTS

// Initialize the tutorial when the business card section is active
// Initialize the tutorial when the business card section is active
// Initialize the tutorial when the business card section is active
function initializeBCardTutorial() {
  // Improved tutorial steps with better descriptions and step numbers
  const tutorialSteps = [
    {
      element: ".bcard-bg-label",
      title: "Step 1: Upload Background",
      content:
        "Start by uploading a background image for your business card template. This will serve as the base design for all business cards.",
      position: "top",
    },
    {
      element: "#theText",
      title: "Step 2: Add Placeholder Text",
      content:
        'Type placeholder text like "Name" or "Email". These placeholders will be replaced with actual user information when cards are generated.',
      position: "bottom",
    },
    {
      element: ".draw-text-btn",
      title: "Step 3: Add Text to Canvas",
      content:
        "Click this button to add your placeholder text to the business card canvas.",
      position: "bottom",
    },
    {
      element: "#canvas",
      title: "Step 4: Position Text",
      content:
        'Click and drag text elements to position them on the card. For example, place "Name" where you want each person\'s name to appear.',
      position: "left",
      offsetX: -50,
    },
    {
      element: ".text-options",
      title: "Step 5: Style Text Elements",
      content:
        "Customize the appearance of each text element. Set the font, size, weight, and color to match your design.",
      position: "left", // Changed from 'bottom' to 'left'
      offsetX: -20, // Add offset to move it further left
    },
    {
      element: "#generate-bcard-btn",
      title: "Step 6: Save Template",
      content:
        "When your design is complete, click here to save it as the official template. This will replace any existing template in the system.",
      position: "top",
    },
    // {
    //   element: "#download-bcard",
    //   title: "Step 7: Download Preview",
    //   content:
    //     "You can download a preview of the business card to see how it looks before finalizing.",
    //   position: "top",
    // },
  ];

  let currentStep = 0;
  const overlay = document.getElementById("tutorialOverlay");
  const spotlight = document.getElementById("tutorialSpotlight");
  const tooltip = document.getElementById("tutorialTooltip");
  const startBtn = document.getElementById("startTutorial");
  const closeBtn = document.getElementById("closeTutorial");
  const nextBtn = document.getElementById("nextStep");
  const prevBtn = document.getElementById("prevStep");

  // Only initialize if all elements exist
  if (
    !overlay ||
    !spotlight ||
    !tooltip ||
    !startBtn ||
    !closeBtn ||
    !nextBtn ||
    !prevBtn
  ) {
    console.error("Tutorial elements not found");
    return;
  }

  // Improved placeholder typewriting effect function with cycling examples
  function typewritePlaceholder(element, text, speed = 100) {
    if (!element) {
      console.error("Element not found for typewriting");
      return;
    }

    // Clear the placeholder first
    element.placeholder = "";
    let i = 0;

    // Cancel any existing interval
    if (element._typingInterval) {
      clearInterval(element._typingInterval);
    }

    // Use setInterval instead of recursive setTimeout for better control
    element._typingInterval = setInterval(function () {
      if (i < text.length) {
        element.placeholder = text.substring(0, i + 1);
        i++;
      } else {
        clearInterval(element._typingInterval);
        element._typingInterval = null;
      }
    }, speed);
  }

  // Start tutorial
  startBtn.addEventListener("click", function () {
    currentStep = 0;
    startTutorial();
  });

  // Close tutorial
  closeBtn.addEventListener("click", function () {
    endTutorial();
  });

  // Next step
  nextBtn.addEventListener("click", function () {
    if (currentStep < tutorialSteps.length - 1) {
      currentStep++;
      showStep(currentStep);
    } else {
      endTutorial();
    }
  });

  // Previous step
  prevBtn.addEventListener("click", function () {
    if (currentStep > 0) {
      currentStep--;
      showStep(currentStep);
    }
  });

  function startTutorial() {
    overlay.style.display = "block";
    showStep(currentStep);
  }

  function endTutorial() {
    // Hide overlay and tooltips
    overlay.style.display = "none";
    tooltip.style.display = "none";
    spotlight.style.display = "none";

    // Reset all elements to their original state
    resetAllElements();

    // Reset the placeholder on the input field
    const inputField = document.getElementById("theText");
    if (inputField) {
      inputField.placeholder = "Enter text here";
      // Clear any running typewriting interval
      if (inputField._typingInterval) {
        clearInterval(inputField._typingInterval);
        inputField._typingInterval = null;
      }
    }
  }

  function resetAllElements() {
    // Find all elements that might have been modified
    document.querySelectorAll("*").forEach((el) => {
      // Reset z-index and position if they were set inline
      if (el.style.zIndex === "10000") {
        el.style.zIndex = "";
      }
      if (el.style.position === "relative") {
        el.style.position = "";
      }
    });
  }

  function showStep(stepIndex) {
    const step = tutorialSteps[stepIndex];
    const element = document.querySelector(step.element);

    if (!element) {
      console.error(`Element ${step.element} not found`);
      // Skip to next step if possible
      if (currentStep < tutorialSteps.length - 1) {
        currentStep++;
        showStep(currentStep);
      } else {
        endTutorial();
      }
      return;
    }

    console.log(`Found element for step ${stepIndex}:`, element);

    // Reset all elements to their original state first
    resetAllElements();

    // Update tooltip content
    document.querySelector(".tutorial-tooltip-title").textContent = step.title;
    document.querySelector(".tutorial-tooltip-content").textContent =
      step.content;
    document.querySelector(".tutorial-tooltip-progress").textContent = `Step ${
      stepIndex + 1
    } of ${tutorialSteps.length}`;

    // Update buttons
    if (stepIndex === 0) {
      prevBtn.style.display = "none";
    } else {
      prevBtn.style.display = "block";
    }

    if (stepIndex === tutorialSteps.length - 1) {
      nextBtn.textContent = "Finish";
      nextBtn.className = "tutorial-btn tutorial-btn-finish";
    } else {
      nextBtn.textContent = "Next";
      nextBtn.className = "tutorial-btn tutorial-btn-next";
    }

    // Position spotlight
    const rect = element.getBoundingClientRect();
    spotlight.style.display = "block";
    spotlight.style.top = `${rect.top}px`;
    spotlight.style.left = `${rect.left}px`;
    spotlight.style.width = `${rect.width}px`;
    spotlight.style.height = `${rect.height}px`;

    // Position tooltip
    tooltip.style.display = "block";

    const tooltipRect = tooltip.getBoundingClientRect();
    let tooltipTop, tooltipLeft;

    // Apply any custom offsets
    const offsetX = step.offsetX || 0;
    const offsetY = step.offsetY || 0;

    // Special case for text options to prevent it from being cut off
    if (step.element === ".text-options") {
      // Position the tooltip to the left of the text options
      tooltipTop = rect.top + 50; // Position it a bit down from the top
      tooltipLeft = rect.left - tooltipRect.width - 20; // 20px gap

      // If it would be cut off on the left, position it at the left edge with some padding
      if (tooltipLeft < 10) {
        tooltipLeft = 10;
      }
    } else {
      // Normal positioning for other elements
      switch (step.position) {
        case "top":
          tooltipTop = rect.top - tooltipRect.height - 10 + offsetY;
          tooltipLeft =
            rect.left + rect.width / 2 - tooltipRect.width / 2 + offsetX;
          break;
        case "bottom":
          tooltipTop = rect.bottom + 10 + offsetY;
          tooltipLeft =
            rect.left + rect.width / 2 - tooltipRect.width / 2 + offsetX;
          break;
        case "left":
          tooltipTop =
            rect.top + rect.height / 2 - tooltipRect.height / 2 + offsetY;
          tooltipLeft = rect.left - tooltipRect.width - 10 + offsetX;
          break;
        case "right":
          tooltipTop =
            rect.top + rect.height / 2 - tooltipRect.height / 2 + offsetY;
          tooltipLeft = rect.right + 10 + offsetX;
          break;
        default:
          tooltipTop = rect.bottom + 10 + offsetY;
          tooltipLeft = rect.left + offsetX;
      }
    }

    // Ensure tooltip stays within viewport
    if (tooltipTop < 10) tooltipTop = 10;
    if (tooltipLeft < 10) tooltipLeft = 10;
    if (tooltipTop + tooltipRect.height > window.innerHeight - 10) {
      tooltipTop = window.innerHeight - tooltipRect.height - 10;
    }
    if (tooltipLeft + tooltipRect.width > window.innerWidth - 10) {
      tooltipLeft = window.innerWidth - tooltipRect.width - 10;
    }

    tooltip.style.top = `${tooltipTop}px`;
    tooltip.style.left = `${tooltipLeft}px`;

    // Highlight the current element
    element.style.position = "relative";
    element.style.zIndex = "10000";

    // Add typewriting effect for the input field step with cycling examples
    if (element.id === "theText" && stepIndex === 1) {
      // Show different placeholder examples based on clicks
      const placeholders = ["Name", "Email"];
      const placeholderIndex = element._placeholderIndex || 0;

      setTimeout(() => {
        typewritePlaceholder(element, placeholders[placeholderIndex], 150);
      }, 500);

      // Update index for next time
      element._placeholderIndex = (placeholderIndex + 1) % placeholders.length;
    }
  }

  // Handle window resize to reposition elements
  window.addEventListener("resize", function () {
    if (overlay.style.display === "block") {
      showStep(currentStep);
    }
  });
}

// Initialize the tutorial when the page loads or when the business card section is shown
document.addEventListener("DOMContentLoaded", function () {
  // Check if we're on the business card section
  const bcardsSection = document.getElementById("bcards-section");
  const bcardsLink = document.getElementById("bcards-link");

  // Initialize tutorial when the business card section is shown
  if (bcardsLink) {
    bcardsLink.addEventListener("click", function () {
      // Wait a bit for the section to be fully visible
      setTimeout(initializeBCardTutorial, 500);
    });
  }

  // If the business card section is already visible on page load
  if (
    bcardsSection &&
    window.getComputedStyle(bcardsSection).display !== "none"
  ) {
    setTimeout(initializeBCardTutorial, 500);
  }
});

// Add this code to your bcard-section.js file or create a new one

document.addEventListener("DOMContentLoaded", function () {
  // Get tutorial elements
  const tutorialButton = document.querySelector(".tutorial-start-btn");
  const tutorialOverlay = document.getElementById("tutorialOverlay");
  const tutorialSpotlight = document.getElementById("tutorialSpotlight");
  const tutorialTooltip = document.getElementById("tutorialTooltip");

  // Get navigation links
  const bcardsLink = document.getElementById("bcards-link");
  const otherLinks = document.querySelectorAll(
    "#members-link, #logs-link, #university-link, #university-management-link, #markers-link, #admin-account-link"
  );

  // Get sections
  const bcardsSection = document.getElementById("bcards-section");

  // Function to hide tutorial elements
  function hideTutorialElements() {
    if (tutorialButton) tutorialButton.style.display = "none";
    if (tutorialOverlay) tutorialOverlay.style.display = "none";
    if (tutorialSpotlight) tutorialSpotlight.style.display = "none";
    if (tutorialTooltip) tutorialTooltip.style.display = "none";
  }

  // Function to show tutorial button (only the button, not the overlay/tooltip)
  function showTutorialButton() {
    if (tutorialButton) tutorialButton.style.display = "flex";
  }

  // Initially hide tutorial elements if not on bcard section
  if (!bcardsSection || bcardsSection.style.display === "none") {
    hideTutorialElements();
  }

  // Show tutorial elements when bcard section is active
  if (bcardsLink) {
    bcardsLink.addEventListener("click", function () {
      // Small delay to ensure section is visible first
      setTimeout(showTutorialButton, 100);
    });
  }

  // Hide tutorial elements when other sections are active
  otherLinks.forEach((link) => {
    if (link) {
      link.addEventListener("click", function () {
        hideTutorialElements();
      });
    }
  });

  // Additional check: Hide tutorial elements if bcard section is not visible
  function checkBcardSectionVisibility() {
    if (
      bcardsSection &&
      window.getComputedStyle(bcardsSection).display === "none"
    ) {
      hideTutorialElements();
    } else if (
      bcardsSection &&
      window.getComputedStyle(bcardsSection).display !== "none"
    ) {
      showTutorialButton();
    }
  }

  // Run the check on page load
  checkBcardSectionVisibility();

  // Optional: Run the check periodically to ensure correct state
  setInterval(checkBcardSectionVisibility, 1000);
});
