const forgotPwordForm = document.querySelector(".forgot-pword-submit");
const resendEmailSection = document.querySelector(".resend-email-section");
const sendEmailBtn = document.querySelector(".send-email-btn");
const resendEmailBtn = document.querySelector(".resend-email-btn");
const countdownElement = document.getElementById("exp-countdown");
const messageDiv = document.querySelector(".message-div");
const alertMessage = document.querySelector(".alert-message");
const closeMessageBtn = document.querySelector(".close-message-btn");
let timer;
forgotPwordForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!e.target["reset-email"].value)
    return showErrorMessage("Please provide an email!");

  sendTokenLink(e.target["reset-email"].value);
});

resendEmailBtn.addEventListener("click", resendEmail);

async function sendTokenLink(email) {
  sendEmailBtn.textContent = "Sending link...";
  fetch("/arcms/api/v1/employees/forgot-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: email }),
  })
    .then((response) => response.json())
    .then((data) => {
      sendEmailBtn.textContent = "Sending Email";

      if (data.status == "failed") {
        showErrorMessage(data.message);
        sendEmailBtn.textContent = "Send Email";

        return;
      }
      forgotPwordForm.style.display = "none";
      resendEmailSection.style.display = "block";
      startCountdown(10);
    })
    .catch((error) => {
      console.error("Failed to send password reset link:", error);
    });
}

async function resendEmail() {
  stopCountdown();
  forgotPwordForm.style.display = "block";
  resendEmailSection.style.display = "none";
}

function startCountdown(durationInMinutes) {
  let time = durationInMinutes * 60;

  timer = setInterval(() => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    countdownElement.textContent = `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;

    if (time <= 0) {
      clearInterval(timer);
      countdownElement.textContent = "Time's up!";
    }

    time--;
  }, 1000);
}

function stopCountdown() {
  clearInterval(timer);
  countdownElement.textContent = "10:00";
}

function showSuccessMessage(message) {
  messageDiv.style.display = "flex";
  messageDiv.classList.remove("error-message");
  messageDiv.classList.add("success-message");
  alertMessage.textContent = message;
}
function showErrorMessage(message) {
  messageDiv.style.display = "flex";
  messageDiv.classList.remove("success-message");
  messageDiv.classList.add("error-message");
  alertMessage.textContent = message;
}

closeMessageBtn.addEventListener("click", () => {
  messageDiv.style.display = "none";
  messageDiv.classList.remove("success-message");
  messageDiv.classList.remove("error-message");
  alertMessage.textContent = "";
});
