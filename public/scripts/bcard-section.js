// Initialize the canvas and context
const bcardCanvas = document.getElementById("bcard-canvas");
const bcardContext = bcardCanvas.getContext("2d");

// Mouse positions inside canvas
let $canvas = $("#bcard-canvas");
let canvasOffset = $canvas.offset();
let offsetX = canvasOffset.left;
let offsetY = canvasOffset.top;
let scrollX = $canvas.scrollLeft();
let scrollY = $canvas.scrollTop();

let startX;
let startY;

let bCardTexts = [
  {
    text: "Name",
    x: 20,
    y: 20,
  },
];

let selectedText = 1;

function draw() {
  // Clear the canvas before rendering the graphics
  bcardContext.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < bCardTexts.length; i++) {
    let text = bCardTexts[i];
    
  }
  //
}

// let nameX = 50;
// let nameY = 100;
// let nameIsDragging = false;

// let linkX = 50;
// let linkY = 100;
// let linkIsDragging = false;

function fixCanvasResolution() {
  const dpr = window.devicePixelRatio || 1;
  const rect = bcardCanvas.getBoundingClientRect();

  bcardCanvas.width = rect.width * dpr;
  bcardCanvas.height = rect.height * dpr;

  bcardContext.scale(dpr, dpr);
}

fixCanvasResolution();
// bcardContext.font = "16px Arial";
// bcardContext.fillStyle = "white";
// bcardContext.fillText("Name goes here!", 50, 100);
