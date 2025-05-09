let logs = [];
let currentLogPage = 1;
const logsPerPage = 10;
const totalLogPages = Math.ceil(logs.length / logsPerPage);
const logTableBody = document.getElementById("logsTableBody");
const prevLogsBtn = document.querySelector(".prev-page-logs");
const nextLogsBtn = document.querySelector(".next-page-logs");
const refreshLogsBtn = document.getElementById("refresh-logs");

// FOR ACTIVE EMPLOYEES

async function fetchAllLogs() {
  try {
    console.log("Fetching active employees...");

    const response = await fetch("/arcms/api/v1/logs");

    if (!response.ok) {
      throw new Error(`Failed to fetch employees: ${response.statusText}`);
    }

    const responseData = await response.json();

    logs = responseData.data;
    logs.sort((a, b) => new Date(b.date) - new Date(a.date));

    console.log("ALL LOGS:", logs);
    displayLogs(currentLogPage); // Default to page 1
    setupPaginationLogs();
  } catch (error) {
    console.error("Error fetching employees:", error);
  }
}

fetchAllLogs();

refreshLogsBtn.addEventListener("click", async (e) => {
  currentLogPage = 1;
  refreshLogsBtn.textContent = "Refreshing Logs...";
  await fetchAllLogs();
  refreshLogsBtn.textContent = "Refresh Logs";
});

function setupPaginationLogs() {
  const totalPages = Math.ceil(logs.length / logsPerPage);
  const paginationContainer = document.querySelector(".number-buttons-logs");

  paginationContainer.innerHTML = ""; // Clear existing pagination buttons
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("a");
    pageButton.href = "#";
    pageButton.textContent = i;
    pageButton.classList.add("page-btn");

    pageButton.addEventListener("click", function (event) {
      event.preventDefault();
      currentLogPage = i;
      displayLogs(i);
      updatePaginationStateForLogs();
      updateActivePageForLogs(i);
    });

    if (i === currentLogPage) {
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

function updatePaginationStateForLogs() {
  const totalResults = logs.length;
  const startIndex = (currentLogPage - 1) * logsPerPage + 1;
  const endIndex = Math.min(currentLogPage * logsPerPage, totalResults);

  document.querySelector(
    ".pagination-info-active span:nth-child(1)"
  ).textContent = startIndex;

  document.querySelector(
    ".pagination-info-active span:nth-child(2)"
  ).textContent = endIndex;

  document.querySelector(
    ".pagination-info-active span:nth-child(3)"
  ).textContent = totalResults;
}

async function displayLogs(pageNumber) {
  console.log("THE PAGE NUMBER:", pageNumber);
  const startIndex = (pageNumber - 1) * logsPerPage;
  const endIndex = startIndex + logsPerPage;
  const logsToDisplay = logs.slice(startIndex, endIndex);

  console.log("LOGS TO DISPLAY:", logsToDisplay);

  logTableBody.innerHTML = ""; // Clear existing content
  logsToDisplay.forEach((log, index) => {
    const row = document.createElement("tr");

    row.style.cursor = "pointer";

    row.innerHTML = `
                <td>${log.action}</td>
                <td>${log.action_details == null ? "-" : log.action_details}</td>
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
