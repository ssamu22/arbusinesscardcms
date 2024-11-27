// Function to populate the table with dummy data

const numberButtons = document.querySelector(".number-buttons");
const dummyMembers = [
  {
    name: "Alice Johnson",
    email: "alice@example.com",
    status: "Active",
    joined: "2023-05-15",
    lastAccess: "2023-06-01",
  },
  {
    name: "Bob Smith",
    email: "bob@example.com",
    status: "Blocked",
    joined: "2023-04-20",
    lastAccess: "2023-05-28",
  },
  {
    name: "Charlie Brown",
    email: "charlie@example.com",
    status: "Active",
    joined: "2023-05-01",
    lastAccess: "2023-06-02",
  },
  {
    name: "Diana Ross",
    email: "diana@example.com",
    status: "Suspended",
    joined: "2023-03-10",
    lastAccess: "2023-05-15",
  },
  {
    name: "Ethan Hunt",
    email: "ethan@example.com",
    status: "Active",
    joined: "2023-05-22",
    lastAccess: "2023-06-03",
  },
  {
    name: "Ethan Hunt",
    email: "ethan@example.com",
    status: "Active",
    joined: "2023-05-22",
    lastAccess: "2023-06-03",
  },
  {
    name: "Ethan Hunt",
    email: "ethan@example.com",
    status: "Active",
    joined: "2023-05-22",
    lastAccess: "2023-06-03",
  },
  {
    name: "Ethan Hunt",
    email: "ethan@example.com",
    status: "Active",
    joined: "2023-05-22",
    lastAccess: "2023-06-03",
  },
  {
    name: "Ethan Hunt",
    email: "ethan@example.com",
    status: "Active",
    joined: "2023-05-22",
    lastAccess: "2023-06-03",
  },
  {
    name: "Ethan Hunt",
    email: "ethan@example.com",
    status: "Active",
    joined: "2023-05-22",
    lastAccess: "2023-06-03",
  },
  {
    name: "Ethan Hunt",
    email: "ethan@example.com",
    status: "Active",
    joined: "2023-05-22",
    lastAccess: "2023-06-03",
  },
];

// Number of items to display per page
const itemsPerPage = 5;
const totalPages = Math.ceil(dummyMembers.length / itemsPerPage);
const tableBody = document.getElementById("membersTableBody");

// Generate pagination buttons
for (let i = 1; i <= totalPages; i++) {
  const pageButton = document.createElement("a");
  pageButton.href = "#";
  pageButton.textContent = i;
  pageButton.classList.add("page-btn");

  pageButton.addEventListener("click", function (event) {
    const pageButtons = document.querySelectorAll(".number-buttons a");
    pageButtons.forEach((btn) => btn.classList.remove("active"));
    this.classList.add("active");
    event.preventDefault();
    displayMembers(i); // Display members based on clicked page
  });

  if (i == 1) {
    pageButton.classList.add("active");
  }
  numberButtons.appendChild(pageButton);
}

function displayMembers(pageNumber) {
  const startIndex = (pageNumber - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const membersToDisplay = dummyMembers.slice(startIndex, endIndex);

  // Assuming you have a table body or some other element to display members
  tableBody.innerHTML = ""; // Clear existing content
  membersToDisplay.forEach((member, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
                <td>${startIndex + index + 1}</td>
                <td class="member-info">
                    <img src="boy.png" alt="${member.name}">
                    <div>
                        <div class="member-name">${member.name}</div>
                        <div class="member-email">${member.email}</div>
                    </div>
                </td>
                <td><span class="status status-${member.status.toLowerCase()}">${
      member.status
    }</span></td>
                <td>${member.joined}</td>
                <td>${member.lastAccess}</td>
                <td><a href="#" class="edit-btn">Edit</a></td>
            `;
    tableBody.appendChild(row);
  });
}

// Call the function to populate the table when the page loads
displayMembers(1);
