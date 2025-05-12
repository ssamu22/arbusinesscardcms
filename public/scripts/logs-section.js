const logsPerPage = 10;

// Logs Variables
let logs = [];
let currentLogPage = 1;
const totalLogPages = Math.ceil(logs.length / logsPerPage);
const logTableBody = document.getElementById("logsTableBody");
const prevLogsBtn = document.querySelector(".prev-page-logs");
const nextLogsBtn = document.querySelector(".next-page-logs");
const refreshLogsBtn = document.getElementById("refresh-logs");

// Content Validation Variables
let validationLogs = [];
let currentValidationPage = 1;
const totalValidationPages = Math.ceil(validationLogs.length / logsPerPage);
const validationTableBody = document.getElementById("contentValTableBody");
const prevValidationBtn = document.querySelector(".prev-page-validation");
const nextValidationBtn = document.querySelector(".next-page-validation");
const refreshValidationBtn = document.getElementById("refresh-validation");

// GET ALL LOGS
async function fetchAllLogs() {
  try {
    // console.log("Fetching all logs...");

    const response = await fetch("/arcms/api/v1/logs");

    if (!response.ok) {
      throw new Error(`Failed to fetch all logs: ${response.statusText}`);
    }

    const responseData = await response.json();

    logs = responseData.data;
    logs.sort((a, b) => new Date(b.date) - new Date(a.date));

    // console.log("ALL LOGS:", logs);
    displayLogs(currentLogPage); // Default to page 1
    setupPaginationLogs();
  } catch (error) {
    console.error("Error fetching logs:", error);
  }
}
// GET ALL VALIDATION LOGS

async function fetchAllValidationLogs() {
  try {
    console.log("Fetching all validation logs...");

    const response = await fetch("/arcms/api/v1/logs/allValidation");

    if (!response.ok) {
      throw new Error(`Failed to fetch all logs: ${response.statusText}`);
    }

    const responseData = await response.json();

    validationLogs = responseData.data;
    validationLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

    console.log("ALL VALIDATION LOGS:", validationLogs);
    displayValidationLogs(currentValidationPage); // Default to page 1
    setupPaginationValidation();
  } catch (err) {
    console.log("Error fetching all validation logs:", err);
  }
}

fetchAllLogs();
fetchAllValidationLogs();

// REFRESH ALL LOGS
refreshLogsBtn.addEventListener("click", async (e) => {
  currentLogPage = 1;
  refreshLogsBtn.textContent = "Refreshing Logs...";
  await fetchAllLogs();
  refreshLogsBtn.textContent = "Refresh Logs";
});

// REFRESH ALL VALIDATION LOGS
refreshValidationBtn.addEventListener("click", async (e) => {
  currentValidationPage = 1;
  refreshValidationBtn.textContent = "Refreshing Logs...";
  await fetchAllValidationLogs();
  refreshValidationBtn.textContent = "Refresh Logs";
});

// SETUP PAGINATION FOR ALL LOGS
function setupPaginationLogs() {
  const totalPages = Math.ceil(logs.length / logsPerPage);
  const paginationContainer = document.querySelector(".number-buttons-logs");

  paginationContainer.innerHTML = ""; // Clear existing pagination buttons

  const maxVisibleButtons = 5; // Number of page buttons to show around the current
  const half = Math.floor(maxVisibleButtons / 2);
  let startPage = Math.max(1, currentLogPage - half);
  let endPage = Math.min(totalPages, currentLogPage + half);

  if (currentLogPage <= half) {
    endPage = Math.min(totalPages, maxVisibleButtons);
  } else if (currentLogPage + half > totalPages) {
    startPage = Math.max(1, totalPages - maxVisibleButtons + 1);
  }

  // Always show first page
  if (startPage > 1) {
    paginationContainer.appendChild(createPageButton(1));
    if (startPage > 2) {
      paginationContainer.appendChild(createEllipsis());
    }
  }

  // Show range around current page
  for (let i = startPage; i <= endPage; i++) {
    paginationContainer.appendChild(createPageButton(i));
  }

  // Always show last page
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationContainer.appendChild(createEllipsis());
    }
    paginationContainer.appendChild(createPageButton(totalPages));
  }

  // Previous and next buttons
  prevLogsBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentLogPage > 1) {
      currentLogPage--;
      displayLogs(currentLogPage);
      setupPaginationLogs(); // Re-render pagination
      updateActivePageForLogs(currentLogPage);
    }
  });

  nextLogsBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentLogPage < totalPages) {
      currentLogPage++;
      displayLogs(currentLogPage);
      setupPaginationLogs(); // Re-render pagination
      updateActivePageForLogs(currentLogPage);
    }
  });

  updatePaginationStateForLogs();

  function createPageButton(i) {
    const pageButton = document.createElement("a");
    pageButton.href = "#";
    pageButton.textContent = i;
    pageButton.classList.add("page-btn");
    if (i === currentLogPage) {
      pageButton.classList.add("active");
    }
    pageButton.addEventListener("click", function (event) {
      event.preventDefault();
      currentLogPage = i;
      displayLogs(i);
      setupPaginationLogs(); // Re-render pagination on click
      updateActivePageForLogs(i);
    });
    return pageButton;
  }

  function createEllipsis() {
    const ellipsis = document.createElement("span");
    ellipsis.textContent = "...";
    ellipsis.classList.add("ellipsis");
    return ellipsis;
  }
}


// SETUP PAGINATION FOR ALL VALIDATION LOGS4
function setupPaginationValidation() {
  const totalPages = Math.ceil(validationLogs.length / logsPerPage);
  const paginationContainer = document.querySelector(
    ".number-buttons-validation"
  );

  paginationContainer.innerHTML = ""; // Clear existing pagination buttons
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("a");
    pageButton.href = "#";
    pageButton.textContent = i;
    pageButton.classList.add("page-btn");

    pageButton.addEventListener("click", function (event) {
      event.preventDefault();
      currentValidationPage = i;
      displayValidationLogs(i);
      updatePaginationStateForValidationLogs();
      updateActivePageForValidationLogs(i);
    });

    if (i === currentValidationPage) {
      pageButton.classList.add("active");
    }

    paginationContainer.appendChild(pageButton);
  }

  prevLogsBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentLogPage - 1 >= 1) {
      currentLogPage -= 1;
      displayLogs(currentLogPage);
      updatePaginationStateForLogs();
      updateActivePageForLogs(currentLogPage);
    }
  });
  nextLogsBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentLogPage + 1 <= totalPages) {
      currentLogPage += 1;
      console.log("CURRENT ACTIVE PAGE:", currentLogPage);
      displayLogs(currentLogPage);
      updatePaginationStateForLogs();
      updateActivePageForLogs(currentLogPage);
    }
  });

  updatePaginationStateForLogs();
}

// UPDATE ACTIVE PAGE FOR LOGS
function updateActivePageForLogs(selectedPage) {
  const pageButtons = document.querySelectorAll(".number-buttons-logs a");
  pageButtons.forEach((btn) => {
    btn.classList.remove("active"); // Remove active class from all buttons
  });

  const selectedButton = document.querySelector(
    `.number-buttons-logs a:nth-child(${selectedPage})`
  );
  selectedButton.classList.add("active"); // Add active class to the clicked button
}

// UPDATE ACTIVE PAGE FOR VALIDATION LOGS
function updateActivePageForValidationLogs(selectedPage) {
  const pageButtons = document.querySelectorAll(".number-buttons-validation a");
  pageButtons.forEach((btn) => {
    btn.classList.remove("active"); // Remove active class from all buttons
  });

  const selectedButton = document.querySelector(
    `.number-buttons-validation a:nth-child(${selectedPage})`
  );
  selectedButton.classList.add("active"); // Add active class to the clicked button
}

// UPDATE PAGINATION STATE FOR ALL LOGS
function updatePaginationStateForLogs() {
  const totalResults = logs.length;
  const startIndex = (currentLogPage - 1) * logsPerPage + 1;
  const endIndex = Math.min(currentLogPage * logsPerPage, totalResults);

  document.querySelector(
    ".pagination-info-logs span:nth-child(1)"
  ).textContent = startIndex;

  document.querySelector(
    ".pagination-info-logs span:nth-child(2)"
  ).textContent = endIndex;

  document.querySelector(
    ".pagination-info-logs span:nth-child(3)"
  ).textContent = totalResults;
}

// UPDATE PAGINATION STATE FOR ALL VALIDATION LOGS
function updatePaginationStateForValidationLogs() {
  const totalResults = validationLogs.length;
  const startIndex = (currentValidationPage - 1) * logsPerPage + 1;
  const endIndex = Math.min(currentValidationPage * logsPerPage, totalResults);

  document.querySelector(
    ".pagination-info-validation span:nth-child(1)"
  ).textContent = startIndex;

  document.querySelector(
    ".pagination-info-validation span:nth-child(2)"
  ).textContent = endIndex;

  document.querySelector(
    ".pagination-info-validation span:nth-child(3)"
  ).textContent = totalResults;
}

// DISPLAY ALL LOGS
async function displayLogs(pageNumber) {
  // console.log("THE PAGE NUMBER:", pageNumber);
  const startIndex = (pageNumber - 1) * logsPerPage;
  const endIndex = startIndex + logsPerPage;
  const logsToDisplay = logs.slice(startIndex, endIndex);

  // console.log("LOGS TO DISPLAY:", logsToDisplay);

  logTableBody.innerHTML = ""; // Clear existing content
  logsToDisplay.forEach((log, index) => {
    const row = document.createElement("tr");

    row.style.cursor = "pointer";

    row.innerHTML = `
                <td>${log.action}</td>
                <td>${
                  log.action_details == null ? "-" : log.action_details
                }</td>
                <td>${log.actor}</td>
                <td>${log.is_admin ? "Admin" : "User"}</td>
                <td>${convertToMilitaryTimePHT(new Date(log.date))}</td>
                <td>${
                  log.status.charAt(0).toUpperCase() + log.status.slice(1)
                }</td>
                <td>${log.employee_number}</td>
            `;

    logTableBody.appendChild(row);
  });
}

// DISPLAY ALL VALIDATION LOGS
async function displayValidationLogs(pageNumber) {
  // console.log("THE PAGE NUMBER:", pageNumber);
  const startIndex = (pageNumber - 1) * logsPerPage;
  const endIndex = startIndex + logsPerPage;
  const validationLogsToDisplay = validationLogs.slice(startIndex, endIndex);

  // console.log("LOGS TO DISPLAY:", validationLogsToDisplay);

  validationTableBody.innerHTML = ""; // Clear existing content
  validationLogsToDisplay.forEach((log, index) => {
    const row = document.createElement("tr");

    row.style.cursor = "pointer";

    row.innerHTML = `
                <td>${log.action}</td>
                <td>${
                  log.action_details == null ? "-" : log.action_details
                }</td>
                <td>${log.actor}</td>
                <td>${log.is_admin ? "Admin" : "User"}</td>
                <td>${convertToMilitaryTimePHT(new Date(log.date))}</td>
                <td>${
                  log.status.charAt(0).toUpperCase() + log.status.slice(1)
                }</td>
                <td>${log.employee_number}</td>
                <td>
                  <div>
                    <button id = "approve-${
                      log.employee_number
                    }" class = "approve-validation-btn">Approve</button>
                    <button id = "reject-${
                      log.employee_number
                    }" class = "reject-validation-btn">Reject</button>
                  </div>
                </td>
            `;

    validationTableBody.appendChild(row);
    const approveBtn = row.querySelector(`#approve-${log.employee_number}`);
    const rejectBtn = row.querySelector(`#reject-${log.employee_number}`);

    if (approveBtn) {
      approveBtn.addEventListener("click", async () => {
        approveValidation({
          action: log.action,
          employee_number: log.employee_number,
          actor: log.actor,
        });

        row.remove(); // Remove the row from the table

        console.log("Approved:", [log.action, log.employee_number, log.actor]);
      });
    }

    if (rejectBtn) {
      rejectBtn.addEventListener("click", async () => {
        rejectValidation({
          action: log.action,
          employee_number: log.employee_number,
          actor: log.actor,
        });

        row.remove(); // Remove the row from the table

        console.log("Rejected:", [log.action, log.employee_number, log.actor]);
      });
    }
  });
}

async function approveValidation(data) {
  try {
    const response = await fetch("/arcms/api/v1/logs/approve-validation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      return console.log("Error approving validation:", {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      });
    }

    const responseData = response.json();

    console.log("APRPOVAL DATA:", responseData);
  } catch (err) {
    console.log("Error approving validation:", err);
  }
}

async function rejectValidation(data) {
  try {
    const response = await fetch("/arcms/api/v1/logs/reject-validation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      return console.log("Error rejecting validation:", {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      });
    }

    const responseData = response.json();

    console.log("REJECTING DATA:", responseData);
  } catch (err) {
    console.log("Error approving validation:", err);
  }
}

function convertToMilitaryTimePHT(date) {
  const phtDateStr = new Date(date).toLocaleString("en-US", {
    timeZone: "Asia/Manila",
  });

  const phtDate = new Date(phtDateStr);

  // Get the formatted time in 12-hour format with AM/PM
  const options = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // AM/PM format
  };

  const formattedTime = phtDate.toLocaleTimeString("en-US", options);

  // Format the date as YYYY-MM-DD
  const formattedDate = phtDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  // Return formatted date and time
  return `${formattedDate} ${formattedTime}`;
}
