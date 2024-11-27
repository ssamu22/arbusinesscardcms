// Edit buttons for the university principles: vision, misison, core values, philo
const editBtns = document.querySelectorAll(".uni-edit-btn");
// Submit buttons for the university principles: vision, misison, core values, philo
const submitBtns = document.querySelectorAll(".uni-submit-btn");
const principleTexts = document.querySelectorAll(".lpu-principle");
// Add click handlers to the edit buttons
editBtns.forEach((btn, idx) => {
  btn.addEventListener("click", () => {
    principleTexts[idx].disabled = !principleTexts[idx].disabled;
    // Hides the submit button if cancel button is pressed
    if (btn.classList.contains("cancel-btn")) {
      submitBtns[idx].style.display = "none";
      btn.classList.remove("cancel-btn");
      btn.textContent = "Edit";
      return;
    }

    // Displays submit button
    submitBtns[idx].style.display = "inline";
    // Turns the edit button into a cancel button after it is pressed
    btn.textContent = "Cancel";
    btn.classList.add("cancel-btn");
  });
});
