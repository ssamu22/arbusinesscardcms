
let employees = []; 
let currentPage = 1;

async function fetchAllEmployee() {
  try {
    console.log("Fetching employee details...");

    const response = await fetch("/admin/employees");

    if (!response.ok) {
        throw new Error(`Failed to fetch employees: ${response.statusText}`);
    }

    const { employeesList } = await response.json();

    employees = employeesList;

    // Step 5: Log the data to verify
    console.log("Fetched Employees:", employees);

    displayMembers(currentPage); // Default to page 1
    setupPagination();
  } catch (error) {
    console.error("Error fetching employees:", error);
  }
}

// Number of items to display per page
const itemsPerPage = 5;
const totalPages = Math.ceil(employees.length / itemsPerPage);
const tableBody = document.getElementById("membersTableBody");

// Generate pagination buttons
function setupPagination() {
  const totalPages = Math.ceil(employees.length / itemsPerPage);
  const paginationContainer = document.querySelector(".number-buttons");

  paginationContainer.innerHTML = ""; // Clear existing pagination buttons
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("a");
    pageButton.href = "#";
    pageButton.textContent = i;
    pageButton.classList.add("page-btn");

    pageButton.addEventListener("click", function (event) {
      event.preventDefault();
      currentPage = i;
      displayMembers(i);
      updatePaginationState();
      updateActivePage(i);
    });

    if (i === currentPage) {
      pageButton.classList.add("active");
    }

    paginationContainer.appendChild(pageButton);
  }

  updatePaginationState();
}

function updateActivePage(selectedPage) {
  const pageButtons = document.querySelectorAll(".number-buttons a");
  pageButtons.forEach((btn) => {
    btn.classList.remove("active"); // Remove active class from all buttons
  });

  const selectedButton = document.querySelector(`.number-buttons a:nth-child(${selectedPage})`);
  selectedButton.classList.add("active"); // Add active class to the clicked button
}

function updatePaginationState() {
  const totalResults = employees.length;
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalResults);

  document.querySelector(".pagination-info span:nth-child(1)").textContent = startIndex;
  document.querySelector(".pagination-info span:nth-child(2)").textContent = endIndex;
  document.querySelector(".pagination-info span:nth-child(3)").textContent = totalResults;
  
}

async function displayMembers(pageNumber) {
  const startIndex = (pageNumber - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const membersToDisplay = employees.slice(startIndex, endIndex);

  tableBody.innerHTML = ""; // Clear existing content
  membersToDisplay.forEach((member, index) => {
    const row = document.createElement("tr");
    const name = (member.honorifics || "") + " " + member.first_name + " " + (member.middle_name || "") + " " + member.last_name;
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
                  <a href="#" class="edit-btn" data-id="${member.employee_id}">Edit</a>
                  &nbsp;|&nbsp;
                  <a href="#" class="delete-btn" data-id="${member.employee_id}">Delete</a>
                </td>
            `;
    tableBody.appendChild(row);
  });

  const editButtons = document.querySelectorAll(".edit-btn");
  const deleteButtons = document.querySelectorAll(".delete-btn");
  editButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const employeeId = event.target.getAttribute("data-id");
      window.location.href = "/admin/employees/edit/" + employeeId;
    });
  });
  deleteButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const employeeId = event.target.getAttribute("data-id");
      const confirmation = confirm("Are you sure you want to delete this employee?");
      if (confirmation) {
        deleteUser(employeeId);
      }
    });
  });
}

async function deleteUser(employee_id) {
  employee_id = Number(employee_id);
  try {
    const response = await fetch("/admin/employee/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify( {employee_id} ), // Wrap employee_id in an object
    });

    const result = await response.json();

    if (response.ok) {
      alert("User deleted successfully!");

      // Remove the deleted employee from the employees array
      employees = employees.filter(employee => employee.employee_id !== employee_id);

      // Update the display and pagination
      displayMembers(currentPage); // Use the current page or update as necessary
      setupPagination();
    } else {
      alert(`Error: ${result.error}`);
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    alert("An error occurred while deleting the user.");
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
document.getElementById("userForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(event.target);
  const userData = Object.fromEntries(formData.entries());
  
  submitBtn.textContent = "Loading...";
  submitBtn.disabled = true;

  try {
    const response = await fetch("/admin/employees", {
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
      
      employees.push(employee);
      displayMembers(currentPage); // Default to page 1
      setupPagination();

    } else {
      alert(`Error: ${result.error}`);
    }
  } catch (error) {
    console.error("Error creating user:", error);
    alert("An error occurred while creating the user.");
  }
});

// Call the function to populate the table when the page loads
fetchAllEmployee();
