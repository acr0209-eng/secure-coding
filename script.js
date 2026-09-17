// Computer Networks - Week 3 Lab - login page action
// Demo only: this browser-side check is not a replacement for server authentication.

const form = document.getElementById("login-form");
const errorMsg = document.getElementById("error-msg");
const loginPanel = document.querySelector(".login-panel");
const userIdInput = document.getElementById("userid");
const passwordInput = document.getElementById("userpw");

const DEMO_USER = "student";
const DEMO_PASSWORD_HASH = 3112874110;

function demoHash(value) {
  let hash = 2166136261;

  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.style.display = "block";
  loginPanel.classList.add("has-error");
  passwordInput.focus();
  passwordInput.select();
}

function showSuccess(userId) {
  loginPanel.classList.remove("has-error");
  loginPanel.classList.add("is-authenticated");
  loginPanel.innerHTML = `
    <div class="success-state" role="status">
      <span class="success-icon" aria-hidden="true">✓</span>
      <p>CAU SECURITY PORTAL</p>
      <h2>로그인 완료</h2>
      <strong>${userId}</strong>
      <span>산업보안학과 포털에 접속했습니다.</span>
      <button id="logout-button" type="button">로그아웃</button>
      <small>현재 화면은 프론트엔드 동작 확인용 데모입니다.</small>
    </div>
  `;

  document.getElementById("logout-button").addEventListener("click", () => {
    window.location.reload();
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const userId = userIdInput.value.trim();
  const password = passwordInput.value;
  errorMsg.style.display = "none";

  if (userId !== DEMO_USER || demoHash(password) !== DEMO_PASSWORD_HASH) {
    showError("아이디 또는 비밀번호가 올바르지 않습니다.");
    return;
  }

  showSuccess(userId);
});
