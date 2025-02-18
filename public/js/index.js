import { register } from "./authenticate.js";

console.log("hey hey");
// DOM Elements
const registerForm = document.getElementById("register-form");
const registerBtn = document.getElementById("register-btn");
// Delegation
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    registerBtn.disabled = true;
    registerBtn.textContent = "Registering...";
    const fname = document.getElementById("fname").value;
    const lname = document.getElementById("lname").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("passwordConfirm").value;

    try {
      await register({ fname, lname, email, password, passwordConfirm });
    } catch (err) {
      console.log(err);
    } finally {
      registerBtn.disabled = false;
      registerBtn.textContent = "Register";
    }
  });
}

// document
//   .getElementById("login-form")
//   .addEventListener("submit", async function (event) {
//     event.preventDefault();

//     const errorElement = document.getElementById("error-message");
//     errorElement.textContent = "";
//     errorElement.classList.add("d-none");

//     const formData = new FormData(this);
//     const data = Object.fromEntries(formData);

//     try {
//       const response = await fetch("/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(data),
//       });

//       if (response.ok) {
//         window.location.href = "/home";
//       } else {
//         if (response.status === 401) {
//           const result = await response.json();
//           displayError(result.message || "Invalid email or password.");
//         } else {
//           throw new Error("Unexpected server response.");
//         }
//       }
//     } catch (error) {
//       displayError("An error occurred. Please try again later.");
//       console.error("Login error:", error);
//     }
//   });

// function displayError(message) {
//   const errorElement = document.getElementById("error-message");
//   errorElement.textContent = message;
//   errorElement.classList.remove("d-none");
// }
