console.log("hey hey");
// DOM Elements
const registerForm = document.getElementById("register-form");
const registerBtn = document.getElementById("register-btn");
const registerErrorsList = document.querySelector(".register-errors-list");
const registerErrorsDiv = document.querySelector(".register-errors");
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

const register = async ({ ...userInput }) => {
  try {
    const response = await axios.post(
      "https://arbusinesscardcms.onrender.com/arcms/api/v1/employees/signup",
      userInput
    );
    console.log("THE RESPONSE DATA:", response.data);
    console.log("RELOCATING...");
    window.location.assign("/success");
  } catch (err) {
    console.log("ERRORS:", err.response.data.errors);
    registerErrorsList.innerHTML = "";
    err.response.data.errors.forEach((error) => {
      const li = document.createElement("li");
      li.textContent = error;
      registerErrorsList.appendChild(li);
    });

    registerErrorsDiv.style.display = "block";
  }
};
