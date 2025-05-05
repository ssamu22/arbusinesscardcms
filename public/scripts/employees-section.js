let activeEmployees = [];
let inactiveEmployees = [];
let adminMembers = [];
let currentPageForActive = 1;
let currentPageForAdmin = 1;
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

const tableBodyAdmins = document.getElementById("adminMembersTableBody");
const prevAdminBtn = document.querySelector(".prev-page-admin");
const nextAdminBtn = document.querySelector(".next-page-admin");

const deleteOverlay = document.getElementById("confirm-delete-overlay");
const deleteYesBtn = document.getElementById("delete-yes-btn");
const deleteNoBtn = document.getElementById("delete-no-btn");
const closeDeleteOverlay = document.querySelector(".close-delete-overlay");

const adminDeleteOverlay = document.getElementById("confirm-delete-overlay-admin");
const adminDeleteYesBtn = document.getElementById("delete-yes-btn-admin");
const adminDeleteNoBtn = document.getElementById("delete-no-btn-admin");
const admincloseDeleteOverlay = document.querySelector(".close-delete-overlay-admin");

let employeeToDelete = null;
let unapprovedToDelete = null;
let adminToDelete = null;

// FOR ACTIVE EMPLOYEES

function showDeleteOverlay() {
  deleteOverlay.style.display = "flex";
}

deleteYesBtn.addEventListener("click", (e) => {
  deleteUser(employeeToDelete);

  unapprovedToDelete?.remove();
  hideDeleteOverlay();
});

deleteNoBtn.addEventListener("click", (e) => {
  hideDeleteOverlay();
});

closeDeleteOverlay.addEventListener("click", (e) => {
  hideDeleteOverlay();
});

function hideDeleteOverlay() {
  deleteOverlay.style.display = "none";
}

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
  membersToDisplay.sort((a, b) => a.employee_number - b.employee_number);

  tableBodyActive.innerHTML = ""; // Clear existing content
  membersToDisplay.forEach((member, index) => {
    const row = document.createElement("tr");

    console.log("the freaking member:", member);
    // <td>${startIndex + index + 1}</td>
    const name =
      (member.honorifics || "") +
      " " +
      member.first_name +
      " " +
      (member.middle_name || "") +
      " " +
      member.last_name;
    row.innerHTML = `
                <td>${member.employee_number}</td>
                <td class="member-info">
                    <div>
                        <img src="${member.image_url}" alt="${name}">
                        <div class="member-name">${name}</div>
                        <div class="member-email">${member.email}</div>
                    </div>
                </td>
                <td>${member.date_created}</td>
                <td>
                  <a href="#" class="delete-btn" data-id="${member.employee_id}">Delete</a>
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

      employeeToDelete = employeeId;
      unapprovedToDelete = button.parentElement.parentElement;
      showDeleteOverlay();
    });
  });
}

// FOR INACTIVE EMPLOYEES

approveAllBtn.addEventListener("click", (e) => {
  approveAllBtn.disabled = true;
  approveAllBtn.textContent = "Approving...";
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
      displayInactiveMembers(currentPageForInactive);
      updatePaginationStateForInactive();
      updateActivePageForInactive(currentPageForInactive);
    }
  });

  nextApprovalBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentPageForInactive + 1 <= totalPages) {
      currentPageForInactive += 1;
      displayInactiveMembers(currentPageForInactive);
      updatePaginationStateForInactive();
      updateActivePageForInactive(currentPageForInactive);
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
  membersToDisplay.sort((a, b) => a.employee_id - b.employee_id);

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
                <td>${member.employee_number}</td>
                <td class="member-info">
                    <div>
                        <img src="${member.image_url}" alt="${name}">
                        <div class="member-name">${name}</div>
                        <div class="member-email">${member.email}</div>
                    </div>
                </td>
                <td>${member.date_created}</td>
                <td>
                  <a href="#" class="edit-btn-inactive" data-id="${member.employee_id}">Accept</a>
                  &nbsp;|&nbsp;
                  <a href="#" class="delete-btn" data-id="${member.employee_id}">Deny</a>
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
      employeeToDelete = employeeId;
      showDeleteOverlay();
    });
  });
}

async function approveUser(employeeId) {
  try {
    showSuccessMessage(`Approving user...`);
    const response = await fetch(`/arcms/api/v1/auth/approve/${employeeId}`, {
      method: "POST",
    });

    const result = await response.json();
    const employee = result.data;

    console.log("APRROVE USER RESULT:", result);

    activeEmployees.push(employee);
    displayActiveMembers(currentPageForActive); // Default to page 1
    setupPaginationActive();
    showSuccessMessage(`Employee ${employeeId} is approved!`);
  } catch (err) {
    console.log(err);
  }
}
async function approveAll() {
  try {
    tableBodyInactive.innerHTML = "";
    const response = await fetch(`/arcms/api/v1/auth/approveAll`, {
      method: "POST",
    });

    const result = await response.json();

    result.data.forEach((employee) => {
      activeEmployees.push(employee);
      displayActiveMembers(currentPageForActive);
      setupPaginationActive();
    });

    approveAllBtn.disabled = false;
    approveAllBtn.textContent = "Approve All";
    showSuccessMessage(`All inactive employees are activated!`);
    // location.reload();
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

// FOR ADMINS

function showDeleteAdminOverlay() {
  adminDeleteOverlay.style.display = "flex";
}

adminDeleteYesBtn.addEventListener("click", (e) => {
  deleteAdmin(adminToDelete);

  hideDeleteAdminOverlay();
});

adminDeleteNoBtn.addEventListener("click", (e) => {
  hideDeleteAdminOverlay();
});

admincloseDeleteOverlay.addEventListener("click", (e) => {
  hideDeleteAdminOverlay();
});

function hideDeleteAdminOverlay() {
  adminDeleteOverlay.style.display = "none";
}

async function fetchAllAdmins() {
  try {
    console.log("Fetching admins...");

    const response = await fetch("/arcms/api/v1/admin/list-all");

    if (!response.ok) {
      throw new Error(`Failed to fetch admins: ${response.statusText}`);
    }

    const { adminsList } = await response.json();

    adminMembers = adminsList;

    console.log("Fetched Admins:", adminMembers);

    displayAdminMembers(currentPageForAdmin); // Default to page 1
    setupPaginationAdmin();
  } catch (error) {
    console.error("Error fetching admins:", error);
  }
}

async function displayAdminMembers(pageNumber) {
  const startIndex = (pageNumber - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const adminsToDisplay = adminMembers.slice(startIndex, endIndex);
  adminsToDisplay.sort((a, b) => a.admin_id - b.admin_id);

  tableBodyAdmins.innerHTML = ""; // Clear existing content
  adminsToDisplay.forEach((member, index) => {
    const row = document.createElement("tr");

    const isCurrent = member.isCurrentAdmin;

    const deleteButtonHTML = isCurrent
    ? `<a href="#" class="delete-btn-admin disabled" style="pointer-events: none; color: gray;" title="You cannot delete your own account">Delete</a>`
    : `<a href="#" class="delete-btn-admin" data-id="${member.admin_id}">Delete</a>`;

    console.log("the freaking admin:", member);
    // <td>${startIndex + index + 1}</td>
    const name = (member.admin_name || "");
    row.innerHTML = `
                <td>${member.admin_id}</td>
                <td class="member-info">
                    <div>
                        <img src="${member.image_url}" alt="${name}">
                        <div class="member-name">${name}</div>
                        <div class="member-email">${member.email}</div>
                    </div>
                </td>
                <td>${member.date_created}</td>
                <td>
                  ${deleteButtonHTML}
                </td>
            `;

    tableBodyAdmins.appendChild(row);
  });

  const deleteButtons = document.querySelectorAll(".delete-btn-admin");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const adminId = event.target.getAttribute("data-id");

      adminToDelete = adminId;
      showDeleteAdminOverlay();
    });
  });
}

function setupPaginationAdmin() {
  const totalPages = Math.ceil(adminMembers.length / itemsPerPage);
  const paginationContainer = document.querySelector(".number-buttons-admin");

  paginationContainer.innerHTML = ""; // Clear existing pagination buttons
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("a");
    pageButton.href = "#";
    pageButton.textContent = i;
    pageButton.classList.add("page-btn");

    pageButton.addEventListener("click", function (event) {
      event.preventDefault();
      currentPageForAdmin = i;
      displayAdminMembers(i);
      updatePaginationStateForAdmin();
      updateActivePageForAdmin(i);
    });

    if (i === currentPageForAdmin) {
      pageButton.classList.add("active");
    }

    paginationContainer.appendChild(pageButton);
  }

  prevMembersBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentPageForAdmin - 1 >= 1) {
      currentPageForAdmin -= 1;
      displayAdminMembers(currentPageForAdmin);
      updatePaginationStateForAdmin();
      updateActivePageForActive(currentPageForAdmin);
    }
  });
  nextMembersBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentPageForAdmin + 1 <= totalPages) {
      currentPageForAdmin += 1;
      console.log("CURRENT ACTIVE PAGE:", currentPageForAdmin);
      displayAdminMembers(currentPageForAdmin);
      updatePaginationStateForAdmin();
      updateActivePageForActive(currentPageForAdmin);
    }
  });

  updatePaginationStateForAdmin();
}

function updatePaginationStateForAdmin() {
  const totalResults = adminMembers.length;
  const startIndex = (currentPageForAdmin - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPageForAdmin * itemsPerPage, totalResults);

  document.querySelector(
    ".pagination-info-admin span:nth-child(1)"
  ).textContent = startIndex;

  document.querySelector(
    ".pagination-info-admin span:nth-child(2)"
  ).textContent = endIndex;
  document.querySelector(
    ".pagination-info-admin span:nth-child(3)"
  ).textContent = totalResults;
}

function updateActivePageForAdmin(selectedPage) {
  const pageButtons = document.querySelectorAll(".number-buttons-admin a");
  pageButtons.forEach((btn) => {
    btn.classList.remove("active"); // Remove active class from all buttons
  });

  const selectedButton = document.querySelector(
    `.number-buttons-admin a:nth-child(${selectedPage})`
  );
  selectedButton.classList.add("active"); // Add active class to the clicked button
}

async function deleteAdmin(admin_id) {
  admin_id = Number(admin_id);
  try {
    const response = await fetch(`/arcms/api/v1/admin/${admin_id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();

    if (response.ok) {
      showErrorMessage("Admin deleted successfully!");

      // Remove the deleted employee from the admin array
      adminMembers = adminMembers.filter(
        (admin) => admin.admin_id !== admin_id
      );

      // Update the display and pagination
      displayAdminMembers(currentPageForAdmin); // Use the current page or update as necessary
      //setupPaginationAdmin();
    } else {
      showErrorMessage(`Error: ${result.error}`);
    }
  } catch (error) {
    console.error("Error deleting admin:", error);
    showErrorMessage("An error occurred while deleting the admin.");
  }
}


// Get modal elements
const modal = document.getElementById("userModal");
const openModalBtn = document.getElementById("openModal");
const addAdminBtn = document.getElementById("openAdminModal");
const closeModalBtn = document.querySelector(".close-btn");
const submitBtn = document.getElementById("create-user-btn");
const submitAdminBtn = document.getElementById("create-admin-btn");
const newUserForm = document.getElementById("userForm");
const newAdminForm = document.getElementById("newAdminForm");
const modalHeader = document.getElementById("create-modal-header");
// Open the modal
openModalBtn.addEventListener("click", () => {
  modalHeader.textContent = "Create New User";
  newUserForm.style.display = "block";
  newAdminForm.style.display = "none";
  modal.style.display = "block";
});

addAdminBtn.addEventListener("click", () => {
  modalHeader.textContent = "Create New Admin";
  newUserForm.style.display = "none";
  newAdminForm.style.display = "block";
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
newUserForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(event.target);

  console.log("THE FORM DATA:", formData);



  formData.append("isActive", true);

  const sanitizeName = (name) => {
    const sanitized = name.replace(/[^a-zA-Z\s\-]/g, "").trim();
    return sanitized
      .split(/[\s\-]/)
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ")
      .replace(/\s+/g, " ")
      .replace(/(\b[A-Z][a-z]*)(?=\s|$)/g, match => match); // Keep spacing tidy
  };

  // Validate employee number
  const isValidEmployeeNumber = (empNum) => {
    return /^\d{4}-\d{1}-\d{5}$/.test(empNum);
  };

  // Extract and sanitize individual fields
  const fname = sanitizeName(formData.get("fname"));
  const mname = sanitizeName(formData.get("mname") || "");
  const lname = sanitizeName(formData.get("lname"));
  const email = formData.get("email").trim();
  const honorifics = formData.get("honorifics") || "";
  const employee_number = formData.get("employee_number").trim();

  if (!isValidEmployeeNumber(employee_number)) {
    showErrorMessage("Employee number must follow the format xxxx-x-xxxxx.");
    return;
  }

  const userData = {
    fname,
    mname,
    lname,
    email,
    honorifics,
    employee_number,
    isActive: true,
  };

  submitBtn.textContent = "Creating User...";
  submitBtn.disabled = true;

  try {
    const response = await fetch("/arcms/api/v1/admin/create-employee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const result = await response.json();

    if (response.ok) {
      showSuccessMessage("User created successfully!");
      submitBtn.textContent = "Save";
      submitBtn.disabled = false;
      modal.style.display = "none";
      event.target.reset();

      const employee = result.data;

      console.log("THE NEW EMPLOYEE:", employee);

      activeEmployees.push(employee);
      displayActiveMembers(currentPageForActive); // Default to page 1
      setupPaginationActive();
    } else {
      showErrorMessage(`Error: ${result.message}`);
    }

    submitBtn.textContent = "Save";
  } catch (error) {
    console.error("Error creating user:", error);
    showErrorMessage(
      "An error occurred while creating the user. Please try again later."
    );
  }
  submitBtn.disabled = false;
});

newAdminForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(event.target);

  console.log("THE FORM DATA:", formData);

  formData.append("isActive", true);
  const userData = Object.fromEntries(formData.entries());

  submitAdminBtn.textContent = "Creating Admin...";

  try {
    const response = await fetch("/arcms/api/v1/admin/create-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const result = await response.json();

    if (response.ok) {
      showSuccessMessage("Admin created successfully!");
      submitAdminBtn.textContent = "Save";
      submitAdminBtn.disabled = false;
      modal.style.display = "none";
      event.target.reset();

      const employee = result.data;

      console.log("THE NEW ADMIN:", employee);
    } else {
      showErrorMessage(`Error: ${result.message}`);
    }

    submitAdminBtn.textContent = "Save";
  } catch (error) {
    console.error("Error creating user:", error);
    showErrorMessage(
      "An error occurred while creating the user. Please try again later."
    );
  }
});

// Call the function to populate the table when the page loads
fetchAllActiveEmployee();
fetchAllInactiveEmployee();
fetchAllAdmins();
