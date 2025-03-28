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
  const genAndReplaceBtn = document.getElementById("generate-bcard-btn");
  const allBusinessCards = await getAllBusinessCards();

  /* 
  TOGGLE BUTTONS TO ADD FOR THE CONTENT OF THE BUSINESS CARD:
  1. NAME
  2. EMAIL
  3. PHONE NO.
  4. 
  */

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

  genAndReplaceBtn.addEventListener("click", async (e) => {
    genAndReplaceBtn.textContent = "Replacing Cards...";
    await generateAndReplaceTargets();

    genAndReplaceBtn.textContent = "Replacing Cards...";
  });

  downloadBcardBtn.addEventListener("click", downloadCanvas);

  fileInput.addEventListener("change", async function (event) {
    if (fileInput.files.length === 0) {
      saveBgBtn.style.display = "none";
      return;
    }

    saveBgBtn.style.display = "inline-block";
    fileToSave = fileInput.files[0];

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
    for (let i = 0; i < texts.length; i++) {
      bcardCtx.save();

      if (i === selectedText) {
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
    const textInput = document.getElementById("text-content");
    const fontInput = document.getElementById("text-font");
    const scaleInput = document.getElementById("scaleFactor");
    const fontSizeInput = document.getElementById("fontSize");
    const fontWeightInput = document.getElementById("fontWeight");
    const colorInput = document.getElementById("color");

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

    textInput.value = texts[idx].text;
    fontInput.value = texts[idx].font_family;
    scaleInput.value = texts[idx].scale_factor;
    fontSizeInput.value = texts[idx].font_size;
    fontWeightInput.value = texts[idx].font_weight;
    colorInput.value = texts[idx].color;
  }

  // This will handle the update of a text in the business card
  async function editText(idx) {
    const textInput = document.getElementById("text-content");
    const fontInput = document.getElementById("text-font");
    const scaleInput = document.getElementById("scaleFactor");
    const fontSizeInput = document.getElementById("fontSize");
    const fontWeightInput = document.getElementById("fontWeight");
    const colorInput = document.getElementById("color");

    // Show an error message

    if (idx === -1) {
      showErrorMessage("Please select a text to edit!");
      return;
    }

    // Show an error message if any values are missing
    if (
      !textInput.value ||
      !fontInput.value ||
      !fontSizeInput.value ||
      !fontWeightInput.value ||
      !colorInput.value
    ) {
      showErrorMessage("Please fill up all the necessary fields!");
      return;
    }

    texts[idx].text = textInput.value;
    texts[idx].font_family = fontInput.value;
    texts[idx].scale_factor = scaleInput.value;
    texts[idx].font_size = fontSizeInput.value;
    texts[idx].font_weight = fontWeightInput.value;
    texts[idx].color = colorInput.value;

    await updateContent({
      content_id: texts[idx].content_id,
      x: texts[idx].x,
      y: texts[idx].y,
      scale_factor: texts[idx].scale_factor,
      type: texts[idx].type,
      text: texts[idx].text,
      color: texts[idx].color,
      font_size: texts[idx].font_size,
      font_weight: texts[idx].font_weight,
      font_family: texts[idx].font_family,
    });
    draw();
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
        console.log("SELECTED TEXT INDEX:", i);
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

  bcardCanvas.addEventListener("contextmenu", function (event) {
    event.preventDefault(); // Prevent default right-click menu

    if (textToEdit !== -1) {
      // Show the custom menu at cursor position
      contextMenu.style.display = "block";
      contextMenu.style.left = `${event.pageX}px`;
      contextMenu.style.top = `${event.pageY}px`;
    } else {
      contextMenu.style.display = "none";
    }
  });

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

      console.log("CONTENT DELETED!");
    } catch (err) {
      console.log("Failed to delete content!", err);
      return null;
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

      if (response.status === 200) {
        showSuccessMessage("Added a new text!");
      } else {
        showErrorMessage("Failed to add a new text! Please try again.");
      }
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

      showSuccessMessage("Business card design successfully updated!");
      return responseData.data[0];
    } catch (err) {
      console.log("Failed to delete content!", err);
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

      activeEmployees = employeesList;

      console.log("ALL ACTIVE EMPLOYEES IN THE SYSTEM:", activeEmployees);

      return activeEmployees;
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
        showErrorMessage(
          "The business card is still processing! Please try again later."
        );
      }

      console.log("UPDATE RESPONSE:", data);
    } catch (err) {
      console.log("FAIELD TO UPDATE BUSINESS CARD DATA:", err);
    }
  }

  async function createImageTarget(theEmployee) {
    try {
      console.log("CREATING BUSINESS CARD....");

      // Finds the associated employee using the targetMetadata
      const formData = new FormData();

      // console.log("Associated Employee:", associatedEmployee);

      const metadata = {
        Id: theEmployee.employee_id,
        FirstName: theEmployee.first_name,
        LastName: theEmployee.last_name,
      };

      formData.append("name", theEmployee.name);
      formData.append("width", 6);
      formData.append("active_flag", true);
      formData.append("bucket", "assets/targetImages");
      formData.append("application_metadata", JSON.stringify(metadata));
      formData.append("image", ""); // ADD THE IMAGE HERE

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
        return showErrorMessage(
          "Failed to add a new target! Please use another image or try again later."
        );
      }

      showSuccessMessage("Successfully added a new business card target!");
    } catch (err) {
      console.log("Error creating business card", err);
    }
  }

  async function generateAndReplaceTargets() {
    // 1. Get all employees

    const allEmployees = await getAllEmployees();

    // 2. Get all image targets

    const allTargets = await getAllBcardTargets();

    // 3. Iterate through all employees

    allEmployees.forEach((employee) => {
      if (
        allTargets.find(
          (target) => target.associated_employee == employee.employee_id
        )
      ) {
        // 4. If employees already has a business card target, replace it
        console.log("THIS EMPLOYEE ALREADY HAS TARGET:", employee);
        console.log("THE TEXTS:", texts);
        // texts = texts.map((textObj) =>
        //   textObj.text === "name"
        //     ? { ...textObj, text: employee.name }
        //     : textObj
        // );

        // drawText();

        bcardCanvas.toBlob(async (blob) => {
          if (blob) {
            console.log("THE BLOB:", blob);

            await replaceImageTarget(
              employee,
              allTargets.find(
                (target) => target.associated_employee == employee.employee_id
              ),
              blob
            ); // Pass the blob as the image
          } else {
            console.error("Failed to convert canvas to Blob.");
          }
        }, "image/jpeg");
        // replaceImageTarget(employee);
      } else {
        // 5. If the employee doesn't, create one
        // createImageTarget();
      }
    });
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
