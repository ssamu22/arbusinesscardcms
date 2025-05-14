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
// const approveAllBtn = document.querySelector(".approve-member-btn");

const tableBodyAdmins = document.getElementById("adminMembersTableBody");
const prevAdminBtn = document.querySelector(".prev-page-admin");
const nextAdminBtn = document.querySelector(".next-page-admin");

const deleteOverlay = document.getElementById("confirm-delete-overlay");
const deleteYesBtn = document.getElementById("delete-yes-btn");
const deleteNoBtn = document.getElementById("delete-no-btn");
const closeDeleteOverlay = document.querySelector(".close-delete-overlay");

const adminDeleteOverlay = document.getElementById(
  "confirm-delete-overlay-admin"
);
const adminDeleteYesBtn = document.getElementById("delete-yes-btn-admin");
const adminDeleteNoBtn = document.getElementById("delete-no-btn-admin");
const admincloseDeleteOverlay = document.querySelector(
  ".close-delete-overlay-admin"
);
const deleteArchiveText = document.getElementById("delete-archive-text");

let employeeToDelete = null;
let unapprovedToDelete = null;
let adminToDelete = null;

// FOR ACTIVE EMPLOYEES

let departmentsList = [];

function showDeleteOverlay(isArchive) {
  console.log(isArchive);
  deleteArchiveText.textContent = "";
  deleteArchiveText.textContent = isArchive
    ? "Are you sure you want to archive this employee?"
    : "Are you sure you want to delete this employee?";
  deleteOverlay.style.display = "flex";

  deleteYesBtn.onclick = () => {
    if (isArchive) {
      archiveUser(employeeToDelete);
    } else {
      deleteUser(employeeToDelete);
    }

    unapprovedToDelete?.remove();
    hideDeleteOverlay();
  };
}

// deleteYesBtn.addEventListener("click", (e) => {
//   unapprovedToDelete?.remove();
//   hideDeleteOverlay();
// });

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

// async function displayActiveMembers(pageNumber) {
//   const startIndex = (pageNumber - 1) * itemsPerPage;
//   const endIndex = startIndex + itemsPerPage;
//   const membersToDisplay = activeEmployees.slice(startIndex, endIndex);
//   membersToDisplay.sort((a, b) => a.employee_number - b.employee_number);

//   tableBodyActive.innerHTML = ""; // Clear existing content
//   membersToDisplay.forEach((member, index) => {
//     const row = document.createElement("tr");

//     const bcardImage = getBcardImage(member.employee_id);

//     console.log("the freaking member:", member);
//     // <td>${startIndex + index + 1}</td>
//     const name =
//       (member.honorifics || "") +
//       " " +
//       member.first_name +
//       " " +
//       (member.middle_name || "") +
//       " " +
//       member.last_name;
//     row.innerHTML = `
//                 <td>${member.employee_number}</td>
//                 <td class="member-info">
//                     <div>
//                         <img src="${member.image_url}" alt="${name}">
//                         <div class="member-name">${name}</div>
//                         <div class="member-email">${member.email}</div>
//                     </div>
//                 </td>
//                 <td>
//                     <button class="edit-btn-active edit-position-btn"></button>
//                     <span class="position-text">${
//                       member.position || "- - -"
//                     }</span>
//                     <input type="text" class="position-input" value="${
//                       member.position || ""
//                     }" style="display: none;" />
//                 </td>
//                 <td>
//                     <button class="edit-btn-active edit-dept-btn"></button>
//                     <span class="dept-text">${getDepartmentName(
//                       member.department_id
//                     )}</span>
//                     <input type="text" class="dept-input" value="${
//                       member.department_id || ""
//                     }" style="display: none;" />
//                 </td>
//                 <td>${member.isActive ? "Active" : "Inactive"}</td>
//                 <td>${member.date_created}</td>
//                 <td>
//                   <a href="#" class="delete-btn" data-id="${
//                     member.employee_id
//                   }">Delete</a>
//                 </td>
//             `;

//     tableBodyActive.appendChild(row);
//     const editButtonPosition = row.querySelector(".edit-position-btn");
//     const editButtonDept = row.querySelector(".edit-dept-btn");

//     editButtonPosition.addEventListener("click", (event) => {
//       const textSpan = row.querySelector(".position-text");
//       const inputField = row.querySelector(".position-input");

//       const isEditing = inputField.style.display === "inline-block";

//       if (isEditing) {
//         // Save logic
//         const newPosition = inputField.value.trim();
//         textSpan.textContent = newPosition ? newPosition : "- - -";
//         textSpan.style.display = "inline";
//         inputField.style.display = "none";
//         editButtonPosition.classList.remove("active");
//         editButtonPosition.disabled = true;

//         updateEmployeePosition(member.employee_id, newPosition);
//         editButtonPosition.disabled = false;
//       } else {
//         // Edit logic
//         textSpan.style.display = "none";
//         inputField.style.display = "inline-block";
//         editButtonPosition.classList.add("active");
//       }
//     });

//     const select = document.createElement("select");
//     select.className = "dept-select";
//     select.style.display = "none";

//     // Populate options
//     departmentsList.forEach((dept) => {
//       const option = document.createElement("option");
//       option.value = dept.department_id;
//       option.textContent = dept.department_name;
//       select.appendChild(option);
//     });

//     row.querySelector("td:nth-child(4)").appendChild(select);

//     editButtonDept.addEventListener("click", (event) => {
//       const deptText = row.querySelector(".dept-text");
//       const deptInput = row.querySelector(".dept-input");

//       const isEditing = select.style.display === "inline-block";

//       if (isEditing) {
//         const selectedId = select.value;
//         console.log("Dept ID: " + selectedId);
//         const selectedName = getDepartmentName(selectedId);

//         deptText.textContent = selectedName;
//         deptText.style.display = "inline";
//         select.style.display = "none";
//         editButtonDept.classList.remove("active");
//         editButtonDept.disabled = true;

//         updateEmployeeDepartment(member.employee_id, selectedId);
//         editButtonDept.disabled = false;
//       } else {
//         select.value = member.department_id;
//         deptText.style.display = "none";
//         select.style.display = "inline-block";
//         editButtonDept.classList.add("active");
//       }
//     });

//     function getDepartmentName(deptId) {
//       const dept = departmentsList.find((d) => d.department_id == deptId);
//       console.log("Depts: " + JSON.stringify(departmentsList));
//       console.log("Dept Name: " + dept);
//       return dept ? dept.department_name : "- - -";
//     }
//   });

//   const deleteButtons = document.querySelectorAll(".delete-btn");

//   deleteButtons.forEach((button) => {
//     button.addEventListener("click", (event) => {
//       const employeeId = event.target.getAttribute("data-id");

//       employeeToDelete = employeeId;
//       unapprovedToDelete = button.parentElement.parentElement;
//       showDeleteOverlay();
//     });
//   });
// }

async function displayActiveMembers(pageNumber) {
  const startIndex = (pageNumber - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const membersToDisplay = activeEmployees.slice(startIndex, endIndex);
  membersToDisplay.sort((a, b) => a.employee_number - b.employee_number);

  tableBodyActive.innerHTML = ""; // Clear existing content

  for (const [index, member] of membersToDisplay.entries()) {
    const row = document.createElement("tr");

    const bcardImage = await getBcardImage(member.employee_id); // Await async function

    console.log("the freaking image:", bcardImage);
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
                <td>
                    <button class="edit-btn-active edit-position-btn"></button>
                    <span class="position-text">${
                      member.position || "- - -"
                    }</span>
                    <input type="text" class="position-input" value="${
                      member.position || ""
                    }" style="display: none;" />
                </td>
                <td>
                    <button class="edit-btn-active edit-dept-btn"></button>
                    <span class="dept-text">${getDepartmentName(
                      member.department_id
                    )}</span>
                    <input type="text" class="dept-input" value="${
                      member.department_id || ""
                    }" style="display: none;" />
                </td>
                <td>${member.isActive ? "Active" : "Inactive"}</td>
                <td>${member.date_created}</td>
                <td>
                  <a href="#" class="delete-btn" data-id="${
                    member.employee_id
                  }">Archive</a>
                </td>

      <td style = "text-align: center;">
        
      ${
        bcardImage && bcardImage.image_url
          ? `
                <a href="${bcardImage.image_url}" target="_blank">
      Yes
    </a>
        `
          : "<p>No</p>"
      }


  
      </td>
            `;

    tableBodyActive.appendChild(row);
    const editButtonPosition = row.querySelector(".edit-position-btn");
    const editButtonDept = row.querySelector(".edit-dept-btn");

    editButtonPosition.addEventListener("click", (event) => {
      const textSpan = row.querySelector(".position-text");
      const inputField = row.querySelector(".position-input");

      const isEditing = inputField.style.display === "inline-block";

      if (isEditing) {
        const newPosition = inputField.value.trim();
        textSpan.textContent = newPosition ? newPosition : "- - -";
        textSpan.style.display = "inline";
        inputField.style.display = "none";
        editButtonPosition.classList.remove("active");
        editButtonPosition.disabled = true;

        updateEmployeePosition(member.employee_id, newPosition);
        editButtonPosition.disabled = false;
      } else {
        textSpan.style.display = "none";
        inputField.style.display = "inline-block";
        editButtonPosition.classList.add("active");
      }
    });

    const select = document.createElement("select");
    select.className = "dept-select";
    select.style.display = "none";

    departmentsList.forEach((dept) => {
      const option = document.createElement("option");
      option.value = dept.department_id;
      option.textContent = dept.department_name;
      select.appendChild(option);
    });

    row.querySelector("td:nth-child(4)").appendChild(select);

    editButtonDept.addEventListener("click", (event) => {
      const deptText = row.querySelector(".dept-text");
      const deptInput = row.querySelector(".dept-input");

      const isEditing = select.style.display === "inline-block";

      if (isEditing) {
        const selectedId = select.value;
        console.log("Dept ID: " + selectedId);
        const selectedName = getDepartmentName(selectedId);

        deptText.textContent = selectedName;
        deptText.style.display = "inline";
        select.style.display = "none";
        editButtonDept.classList.remove("active");
        editButtonDept.disabled = true;

        updateEmployeeDepartment(member.employee_id, selectedId);
        editButtonDept.disabled = false;
      } else {
        select.value = member.department_id;
        deptText.style.display = "none";
        select.style.display = "inline-block";
        editButtonDept.classList.add("active");
      }
    });

    function getDepartmentName(deptId) {
      const dept = departmentsList.find((d) => d.department_id == deptId);
      console.log("Depts: " + JSON.stringify(departmentsList));
      console.log("Dept Name: " + dept);
      return dept ? dept.department_name : "- - -";
    }
  }

  const deleteButtons = document.querySelectorAll(".delete-btn");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const employeeId = event.target.getAttribute("data-id");

      employeeToDelete = employeeId;
      unapprovedToDelete = button.parentElement.parentElement;
      showDeleteOverlay(true);
    });
  });
}

async function getBcardImage(employee_id) {
  try {
    const response = await fetch(
      `/arcms/api/v1/employees/bcard-image/${employee_id}`
    );

    if (!response.ok) {
      console.log("Error getting business card image");
    }

    const imageData = await response.json();

    console.log("IMAGE DATA RESPONSE:", imageData);
    return imageData;
  } catch (err) {
    console.log("Error getting business card image:", err);
  }
}

async function updateEmployeeDepartment(employee_id, departmentId) {
  try {
    const response = await fetch(
      `/arcms/api/v1/employees/department/${employee_id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ department_id: departmentId }),
      }
    );

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Update failed");

    showSuccessMessage("Department updated successfully!");
    console.log("Department updated:", result);
  } catch (error) {
    showErrorMessage("Failed to update department: " + error.message);
  }
}

async function updateEmployeePosition(employee_id, newPosition) {
  try {
    const response = await fetch(`/arcms/api/v1/employees/${employee_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ position: newPosition }),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Update failed");

    showSuccessMessage("Employee position updated successfully!");
    console.log("Position updated:", result);
  } catch (error) {
    showErrorMessage("Failed to update position: " + error.message);
  }
}

async function fetchDepartments() {
  const response = await fetch("/api/departments");
  departmentsList = await response.json();
}

// FOR INACTIVE EMPLOYEES

// approveAllBtn.addEventListener("click", (e) => {
//   approveAllBtn.disabled = true;
//   approveAllBtn.textContent = "Approving...";
//   approveAll();
// });

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
                  <a href="#" class="delete-btn delete-btn-inactive" data-id="${member.employee_id}">Deny</a>
                </td>
            `;
    tableBodyInactive.appendChild(row);
  });

  const editButtons = document.querySelectorAll(".edit-btn-inactive");
  const deleteButtons = document.querySelectorAll(".delete-btn-inactive");
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
      showDeleteOverlay(false);
    });
  });
}

async function approveUser(employeeId) {
  try {
    const response = await fetch(`/arcms/api/v1/auth/approve/${employeeId}`, {
      method: "POST",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      errorData.message ||
        `Failed to approve employee (Status: ${response.status})`;
      showErrorMessage(errorMessage);
      console.error("Approve User API Error:", errorData);
      return;
    }

    const result = await response.json();
    const employee = result.data;

    console.log("APPROVE USER RESULT:", result);

    // activeEmployees.push(employee);
    // displayActiveMembers(currentPageForActive);
    // setupPaginationActive();
    showSuccessMessage(`Employee ${employee.employee_number} is approved!`);
  } catch (err) {
    console.error("Network or unexpected error approving user:", err);
    showErrorMessage(
      "An unexpected error occurred while approving the user. Please try again later."
    );
  }
}

// async function approveAll() {
//   try {
//     tableBodyInactive.innerHTML = "";
//     const response = await fetch(`/arcms/api/v1/auth/approveAll`, {
//       method: "POST",
//     });

//     const result = await response.json();

//     result.data.forEach((employee) => {
//       activeEmployees.push(employee);
//       displayActiveMembers(currentPageForActive);
//       setupPaginationActive();
//     });

//     approveAllBtn.disabled = false;
//     approveAllBtn.textContent = "Approve All";
//     showSuccessMessage(`All inactive employees are activated!`);
//     // location.reload();
//   } catch (err) {
//     console.log(err);
//   }
// }

async function archiveUser(employee_id) {
  employee_id = Number(employee_id);
  try {
    const response = await fetch(
      `/arcms/api/v1/employees/archive/${employee_id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      }
    );

    const result = await response.json();

    if (response.ok) {
      showErrorMessage("User archived successfully!");

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
    showErrorMessage("An error occurred while archiving the user.");
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
      displayInactiveMembers(currentPageForActive); // Use the current page or update as necessary
      setupPaginationActive();
    } else {
      showErrorMessage(`Error: ${result.error}`);
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    showErrorMessage("An error occurred while archiving the user.");
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
    const name = member.admin_name || "";
    row.innerHTML = `
                <td>${member.employee_number}</td>
                <td class="member-info">
                    <div>
                        <img src="${member.image_url}" alt="${name}">
                        <div class="member-name">${name}</div>
                        <div class="member-email">${member.email}</div>
                    </div>
                </td>
                <td>${showAdminType(member.admin_type)}</td>
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

function showAdminType(adminType) {
  if (adminType === "human_resources") {
    return "Human Resources";
  } else if (adminType === "center_for_public_affairs") {
    return "Public Affairs";
  } else {
    return "- - -";
  }
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
const newAdminInputs = document.querySelectorAll(".new-admin-input");
const newUserInputs = document.querySelectorAll(".new-user-input");

// Open the modal
openModalBtn.addEventListener("click", () => {
  modalHeader.textContent = "Invite an Employee";
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

  closeModalBtn.disabled = true;

  const formData = new FormData(event.target);
  submitBtn.disabled = true;
  newUserInputs.forEach((input) => {
    input.disabled = true;
  });

  console.log("THE FORM DATA:", formData);

  formData.append("isActive", true);

  const sanitizeName = (name) => {
    const sanitized = name.replace(/[^a-zA-Z\s\-]/g, "").trim();
    return sanitized
      .split(/[\s\-]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ")
      .replace(/\s+/g, " ")
      .replace(/(\b[A-Z][a-z]*)(?=\s|$)/g, (match) => match); // Keep spacing tidy
  };

  // Validate employee number
  const isValidEmployeeNumber = (empNum) => {
    return /^\d{4}-\d{4}[A-Z]$/.test(empNum);
  };

  // Extract and sanitize individual fields
  const fname = sanitizeName(formData.get("fname"));
  const mname = sanitizeName(formData.get("mname") || "");
  const lname = sanitizeName(formData.get("lname"));
  const email = formData.get("email").trim();
  const honorifics = formData.get("honorifics") || "";
  const employee_number = formData.get("employee_number").trim();

  if (!isValidEmployeeNumber(employee_number)) {
    showErrorMessage("Employee number must follow the format XXXX-XXXXA.");
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
    newUserInputs.forEach((input) => {
      input.disabled = false;
    });
    submitBtn.disabled = false;
    closeModalBtn.disabled = false;
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
  closeModalBtn.disabled = true;

  // Get and sanitize values
  const nameInput = document.getElementById("new-admin-name");
  const employeeNumberInput = document.getElementById("admin-employee-number");
  const adminTypeInput = document.getElementById("admin-type");

  // Sanitize name: remove unwanted characters and capitalize
  let rawName = nameInput.value;
  rawName = rawName.replace(/[^a-zA-Z\s\-'.]/g, ""); // allow letters, space, hyphen, apostrophe, period
  rawName = rawName
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  nameInput.value = rawName;

  // Validate employee number: must match pattern xxxx-xxxxF
  const employeeNumber = employeeNumberInput.value.trim();
  const employeePattern = /^\d{4}-\d{4}[A-Z]$/;
  if (!employeePattern.test(employeeNumber)) {
    showErrorMessage("Employee Number must be in the format XXXX-XXXXA.");
    return;
  }

  // Validate admin type
  const adminType = adminTypeInput.value;
  if (adminType === "0") {
    showErrorMessage("Please select a valid Admin Type.");
    return;
  }

  // Prepare form for submission
  closeModalBtn.disabled = true;
  newAdminInputs.forEach((input) => (input.disabled = true));
  submitAdminBtn.textContent = "Creating Admin...";

  formData.set("admin_name", rawName); // update sanitized name
  formData.set("employee_number", employeeNumber);
  formData.append("isActive", true);

  const userData = Object.fromEntries(formData.entries());

  console.log("The new admin: " + JSON.stringify(userData));

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

      const admin = result.data;

      console.log("THE NEW ADMIN:", admin);

      adminMembers.push(admin);
      displayAdminMembers(currentPageForAdmin); // Default to page 1
      setupPaginationAdmin();
    } else {
      showErrorMessage(`${result.message}`);
    }

    submitAdminBtn.textContent = "Save";
    newAdminInputs.forEach((input) => {
      input.disabled = false;
    });
    closeModalBtn.disabled = false;
  } catch (error) {
    console.error("Error creating user:", error);
    showErrorMessage(
      "An error occurred while creating the user. Please try again later."
    );
  }
});

// Call the function to populate the table when the page loads
fetchAllActiveEmployee();
fetchDepartments();
fetchAllInactiveEmployee();
fetchAllAdmins();
