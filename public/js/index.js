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

