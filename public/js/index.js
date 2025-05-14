console.log("hey hey");
// DOM Elements
const registerForm = document.getElementById("register-form");
const registerBtn = document.getElementById("register-btn");
const registerErrorsList = document.querySelector(".register-errors-list");
const registerErrorsDiv = document.querySelector(".register-errors");
// Delegation
const sanitizeInput = (input) => {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

const capitalizeWords = (str) => {
  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    registerBtn.disabled = true;
    registerBtn.textContent = "Registering...";

    const rawFname = document.getElementById("fname").value.trim();
    const rawLname = document.getElementById("lname").value.trim();
    const rawMname = document.getElementById("mname").value.trim();
    const rawEmployeeNumber = document
      .getElementById("employee_number")
      .value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("passwordConfirm").value;
    const honorifics = sanitizeInput(
      document.getElementById("honorifics").value
    );
    const privacyCheckbox = document.getElementById("agreePrivacy");

    // Validation rules
    const nameRegex = /^[a-zA-Z .'-]+$/;
    const employeeNumRegex = /^\d{4}-\d{4}[A-Z]$/;
    const errors = [];

    // Validate names
    if (!nameRegex.test(rawFname))
      errors.push("First name contains invalid characters.");
    if (!nameRegex.test(rawLname))
      errors.push("Last name contains invalid characters.");
    if (rawMname && !nameRegex.test(rawMname))
      errors.push("Middle name contains invalid characters.");

    // Validate employee number
    if (!employeeNumRegex.test(rawEmployeeNumber)) {
      errors.push("Employee number must follow the format XXXX-XXXXA.");
    }

    // Validate email

    if (!isLPUEmail(email)) {
      errors.push("Please enter a valid LPU email address.");
    }

    // Validate password
    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(password)
    ) {
      errors.push("Password does not meet complexity requirements.");
    }

    if (password !== passwordConfirm) {
      errors.push("Passwords do not match.");
    }

    if (!privacyCheckbox.checked) {
      e.preventDefault();
      errors.push("You must agree to the Privacy Policy before registering.");
      return;
    }

    if (errors.length > 0) {
      window.showRegisterErrors(errors);
      registerBtn.disabled = false;
      registerBtn.textContent = "Register";
      return;
    }

    // Capitalize names
    const fname = sanitizeInput(capitalizeWords(rawFname));
    const lname = sanitizeInput(capitalizeWords(rawLname));
    const mname = sanitizeInput(capitalizeWords(rawMname));
    const employee_number = sanitizeInput(rawEmployeeNumber);

    try {
      await register({
        fname,
        mname,
        lname,
        email: sanitizeInput(email),
        employee_number,
        password,
        passwordConfirm,
        honorifics,
      });
    } catch (err) {
      console.log(err);
    } finally {
      registerBtn.disabled = false;
      registerBtn.textContent = "Register";
    }
  });
}

const register = async ({ ...userInput }) => {
  try {
    const response = await axios.post(
      "/arcms/api/v1/employees/signup",
      // "https://arbusinesscardcms.onrender.com/arcms/api/v1/employees/signup",
      userInput
    );

    window.location.assign("/success");
  } catch (err) {
    const errorCount = document.querySelector(".error-count");
    console.log("ERRORS:", err.response.data.errors);
    errorCount.textContent = err.response.data.errors.length;
    registerErrorsList.innerHTML = "";
    err.response.data.errors.forEach((error) => {
      const li = document.createElement("li");
      li.textContent = error;
      registerErrorsList.appendChild(li);
    });

    registerErrorsDiv.style.display = "block";
  }
};

function isLPUEmail(email) {
  return email.endsWith("@lpunetwork.edu.ph") || email.endsWith("@lpu.edu.ph");
}
