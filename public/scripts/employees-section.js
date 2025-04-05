let activeEmployees = [];
let inactiveEmployees = [];
let currentPageForActive = 1;
let currentPageForInactive = 1;
const itemsPerPage = 5;

const totalPagesActive = Math.ceil(activeEmployees.length / itemsPerPage);
const tableBodyActive = document.getElementById("activeMembersTableBody");
const prevMembersBtn = document.querySelector(".prev-page-members");
const nextMembersBtn = document.querySelector(".next-page-members");
const prevApprovalBtn = document.querySelector(".prev-page-approval");
const nextApprovalBtn = document.querySelector(".next-page-approval");
const totalPagesInactive = Math.ceil(inactiveEmployees.length / itemsPerPage);
const tableBodyInactive = document.getElementById("inactiveMembersTableBody");
const approveAllBtn = document.querySelector(".approve-member-btn");

// FOR ACTIVE EMPLOYEES

async function fetchAllActiveEmployee() {
  try {
    console.log("Fetching active employees...");

    const response = await fetch("/arcms/api/v1/employees/active");

    if (!response.ok) {
      throw new Error(`Failed to fetch employees: ${response.statusText}`);
    }

    const { employeesList } = await response.json();

    activeEmployees = employeesList;

    console.log("Fetched Active Employees:", activeEmployees);

    displayActiveMembers(currentPageForActive); // Default to page 1
    setupPaginationActive();
  } catch (error) {
    console.error("Error fetching employees:", error);
  }
}

function setupPaginationActive() {
  const totalPages = Math.ceil(activeEmployees.length / itemsPerPage);
  const paginationContainer = document.querySelector(".number-buttons-active");

  paginationContainer.innerHTML = ""; // Clear existing pagination buttons
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("a");
    pageButton.href = "#";
    pageButton.textContent = i;
    pageButton.classList.add("page-btn");

    pageButton.addEventListener("click", function (event) {
      event.preventDefault();
      currentPageForActive = i;
      displayActiveMembers(i);
      updatePaginationStateForActive();
      updateActivePageForActive(i);
    });

    if (i === currentPageForActive) {
      pageButton.classList.add("active");
    }

    paginationContainer.appendChild(pageButton);
  }

  prevMembersBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentPageForActive - 1 >= 1) {
      currentPageForActive -= 1;
      displayActiveMembers(currentPageForActive);
      updatePaginationStateForActive();
      updateActivePageForActive(currentPageForActive);
    }
  });
  nextMembersBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentPageForActive + 1 <= totalPages) {
      currentPageForActive += 1;
      console.log("CURRENT ACTIVE PAGE:", currentPageForActive);
      displayActiveMembers(currentPageForActive);
      updatePaginationStateForActive();
      updateActivePageForActive(currentPageForActive);
    }
  });

  updatePaginationStateForActive();
}

function updateActivePageForActive(selectedPage) {
  const pageButtons = document.querySelectorAll(".number-buttons-active a");
  pageButtons.forEach((btn) => {
    btn.classList.remove("active"); // Remove active class from all buttons
  });

  const selectedButton = document.querySelector(
    `.number-buttons-active a:nth-child(${selectedPage})`
  );
  selectedButton.classList.add("active"); // Add active class to the clicked button
}

function updatePaginationStateForActive() {
  const totalResults = activeEmployees.length;
  const startIndex = (currentPageForActive - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPageForActive * itemsPerPage, totalResults);

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

async function displayActiveMembers(pageNumber) {
  const startIndex = (pageNumber - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const membersToDisplay = activeEmployees.slice(startIndex, endIndex);

  tableBodyActive.innerHTML = ""; // Clear existing content
  membersToDisplay.forEach((member, index) => {
    const row = document.createElement("tr");
    const name =
      (member.honorifics || "") +
      " " +
      member.first_name +
      " " +
      (member.middle_name || "") +
      " " +
      member.last_name;
    row.innerHTML = `
                <td>${startIndex + index + 1}</td>
                <td class="member-info">
                    <div>
                        <img src="${member.image_url}" alt="${name}">
                        <div class="member-name">${name}</div>
                        <div class="member-email">${member.email}</div>
                    </div>
                </td>
                <td>${member.date_created}</td>
                <td>
                  <a href="#" class="delete-btn" data-id="${
                    member.employee_id
                  }">Delete</a>
                </td>
            `;

    tableBodyActive.appendChild(row);
  });

  /* 
                    <a href="#" class="edit-btn-active" data-id="${
                    member.employee_id
                  }">Edit</a>
  */

  const editButtons = document.querySelectorAll(".edit-btn-active");
  const deleteButtons = document.querySelectorAll(".delete-btn");
  editButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const employeeId = event.target.getAttribute("data-id");
      window.location.href = `/arcms/api/v1/employees/${employeeId}`;
    });
  });
  deleteButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const employeeId = event.target.getAttribute("data-id");
      const confirmation = confirm(
        "Are you sure you want to delete this employee?"
      );
      if (confirmation) {
        deleteUser(employeeId);
      }
    });
  });
}

// FOR INACTIVE EMPLOYEES

approveAllBtn.addEventListener("click", (e) => {
  approveAll();
});

async function fetchAllInactiveEmployee() {
  try {
    console.log("Fetching inactive employees...");

    const response = await fetch("/arcms/api/v1/employees/inactive");

    if (!response.ok) {
      throw new Error(`Failed to fetch employees: ${response.statusText}`);
    }

    const { employeesList } = await response.json();

    inactiveEmployees = employeesList;

    // Step 5: Log the data to verify
    console.log("Fetched Inactive Employees:", inactiveEmployees);

    displayInactiveMembers(currentPageForInactive); // Default to page 1
    setupPaginationInactive();
  } catch (error) {
    console.error("Error fetching employees:", error);
  }
}

function setupPaginationInactive() {
  const totalPages = Math.ceil(inactiveEmployees.length / itemsPerPage);
  const paginationContainer = document.querySelector(
    ".number-buttons-inactive"
  );

  paginationContainer.innerHTML = ""; // Clear existing pagination buttons
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("a");
    pageButton.href = "#";
    pageButton.textContent = i;
    pageButton.classList.add("page-btn");

    pageButton.addEventListener("click", function (event) {
      event.preventDefault();
      currentPageForInactive = i;
      displayInactiveMembers(i);
      updatePaginationStateForInactive();
      updateActivePageForInactive(i);
    });

    if (i === currentPageForInactive) {
      pageButton.classList.add("active");
    }

    paginationContainer.appendChild(pageButton);
  }

  prevApprovalBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentPageForInactive - 1 >= 1) {
      currentPageForInactive -= 1;
      displayInactiveMembers(i);
      updatePaginationStateForInactive();
      updateActivePageForInactive(i);
    }
  });

  nextApprovalBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentPageForInactive + 1 <= totalPages) {
      currentPageForInactive += 1;
      displayInactiveMembers(i);
      updatePaginationStateForInactive();
      updateActivePageForInactive(i);
    }
  });

  updatePaginationStateForInactive();
}

function updateActivePageForInactive(selectedPage) {
  const pageButtons = document.querySelectorAll(".number-buttons-inactive a");

  pageButtons.forEach((btn) => {
    btn.classList.remove("active"); // Remove active class from all buttons
  });

  const selectedButton = document.querySelector(
    `.number-buttons-inactive a:nth-child(${selectedPage})`
  );
  selectedButton.classList.add("active"); // Add active class to the clicked button
}

function updatePaginationStateForInactive() {
  const totalResults = inactiveEmployees.length;
  const startIndex = (currentPageForInactive - 1) * itemsPerPage + 1;
  const endIndex = Math.min(
    currentPageForInactive * itemsPerPage,
    totalResults
  );

  document.querySelector(
    ".pagination-info-inactive span:nth-child(1)"
  ).textContent = startIndex;
  document.querySelector(
    ".pagination-info-inactive span:nth-child(2)"
  ).textContent = endIndex;
  document.querySelector(
    ".pagination-info-inactive span:nth-child(3)"
  ).textContent = totalResults;
}

async function displayInactiveMembers(pageNumber) {
  const startIndex = (pageNumber - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const membersToDisplay = inactiveEmployees.slice(startIndex, endIndex);

  tableBodyInactive.innerHTML = ""; // Clear existing content
  membersToDisplay.forEach((member, index) => {
    const row = document.createElement("tr");
    const name =
      (member.honorifics || "") +
      " " +
      member.first_name +
      " " +
      (member.middle_name || "") +
      " " +
      member.last_name;
    row.innerHTML = `
                <td>${startIndex + index + 1}</td>
                <td class="member-info">
                    <div>
                        <img src="${member.image_url}" alt="${name}">
                        <div class="member-name">${name}</div>
                        <div class="member-email">${member.email}</div>
                    </div>
                </td>
                <td>${member.date_created}</td>
                <td>
                  <a href="#" class="edit-btn-inactive" data-id="${
                    member.employee_id
                  }">Accept</a>
                  &nbsp;|&nbsp;
                  <a href="#" class="delete-btn" data-id="${
                    member.employee_id
                  }">Deny</a>
                </td>
            `;
    tableBodyInactive.appendChild(row);
  });

  const editButtons = document.querySelectorAll(".edit-btn-inactive");
  const deleteButtons = document.querySelectorAll(".delete-btn");
  editButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const employeeId = event.target.getAttribute("data-id");
      button.textContent = "processing...";
      approveUser(employeeId);
      button.parentElement.parentElement.style.display = "none";
    });
  });
  deleteButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const employeeId = event.target.getAttribute("data-id");
      const confirmation = confirm(
        "Are you sure you want to delete this employee?"
      );
      if (confirmation) {
        deleteUser(employeeId);
        button.parentElement.parentElement.style.display = "none";
      }
    });
  });
}

async function approveUser(employeeId) {
  try {
    const response = await fetch(`/arcms/api/v1/auth/approve/${employeeId}`, {
      method: "POST",
    });

    showSuccessMessage(`Employee ${employeeId} is approved!`);
    const result = await response.json();
  } catch (err) {
    console.log(err);
  }
}
async function approveAll() {
  try {
    showSuccessMessage(`All inactive employees are activated!`);
    const response = await fetch(`/arcms/api/v1/auth/approveAll`, {
      method: "POST",
    });

    const result = await response.json();
    tableBodyInactive.innerHTML = "";
    setTimeout(() => {
      location.reload();
    }, 1000);
  } catch (err) {
    console.log(err);
  }
}

async function deleteUser(employee_id) {
  employee_id = Number(employee_id);
  try {
    const response = await fetch(`/arcms/api/v1/employees/${employee_id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (response.ok) {
      showErrorMessage("User deleted successfully!");

      // Remove the deleted employee from the employees array
      activeEmployees = activeEmployees.filter(
        (employee) => employee.employee_id !== employee_id
      );

      // Update the display and pagination
      displayActiveMembers(currentPageForActive); // Use the current page or update as necessary
      setupPaginationActive();
    } else {
      showErrorMessage(`Error: ${result.error}`);
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    showErrorMessage("An error occurred while deleting the user.");
  }
}

// Get modal elements
const modal = document.getElementById("userModal");
const openModalBtn = document.getElementById("openModal");
const closeModalBtn = document.querySelector(".close-btn");
const submitBtn = document.getElementById("create-user-btn");

// Open the modal
openModalBtn.addEventListener("click", () => {
  modal.style.display = "block";
});

// Close the modal
closeModalBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

// Close the modal when clicking outside the content
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

// Handle form submission
document
  .getElementById("userForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const userData = Object.fromEntries(formData.entries());

    submitBtn.textContent = "Loading...";
    submitBtn.disabled = true;

    try {
      const response = await fetch("/arcms/api/v1/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (response.ok) {
        alert("User created successfully!");
        submitBtn.textContent = "Save";
        submitBtn.disabled = false;
        modal.style.display = "none";
        event.target.reset();

        const { employee } = result;

        activeEmployees.push(employee);
        displayActiveMembers(currentPageForActive); // Default to page 1
        setupPaginationActive();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("An error occurred while creating the user.");
    }
  });

// Call the function to populate the table when the page loads
fetchAllActiveEmployee();
fetchAllInactiveEmployee();
