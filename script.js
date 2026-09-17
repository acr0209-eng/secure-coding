// Computer Networks - Week 3 Lab - login page action
// Demo only: no real authentication is performed in the browser.

const form = document.getElementById("login-form");
const errorMsg = document.getElementById("error-msg");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  errorMsg.style.display = "none";
  alert("Demo login submitted. Real authentication must be handled on a server.");
});
