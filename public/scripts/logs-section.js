let logs = [];
let currentLogPage = 1;

const totalLogPages = Math.ceil(logs.length / itemsPerPage);
const logTableBody = document.getElementById("logsTableBody");
const prevLogsBtn = document.querySelector(".prev-page-logs");
const nextLogsBtn = document.querySelector(".next-page-logs");

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
    console.log("ALL LOGS:", logs);
    displayLogs(currentLogPage); // Default to page 1
    setupPaginationLogs();
  } catch (error) {
    console.error("Error fetching employees:", error);
  }
}

fetchAllLogs();

function setupPaginationLogs() {
  const totalPages = Math.ceil(logs.length / itemsPerPage);
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
  const startIndex = (currentLogPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentLogPage * itemsPerPage, totalResults);

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
  const startIndex = (pageNumber - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const logsToDisplay = logs.slice(startIndex, endIndex);
  console.log("LOGS TO DISPLAY:", logsToDisplay);

  logTableBody.innerHTML = ""; // Clear existing content
  logsToDisplay.forEach((log, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
                <td>${log.action}</td>
                <td>${log.actor}</td>
                <td>${log.is_admin ? "Admin" : "User"}</td>
                <td>${log.date}</td>
                <td>${
                  log.status.charAt(0).toUpperCase() + log.status.slice(1)
                }</td>
                <td>${log.employee_number}</td>
            `;

    logTableBody.appendChild(row);
  });
}
