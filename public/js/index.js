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
    const mname = document.getElementById("mname").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("passwordConfirm").value;
    const honorifics = document.getElementById("honorifics").value;

    try {
      await register({
        fname,
        mname,
        lname,
        email,
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
      // "/arcms/api/v1/employees/signup",
      "https://arbusinesscardcms.onrender.com/arcms/api/v1/employees/signup",
      userInput
    );

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
