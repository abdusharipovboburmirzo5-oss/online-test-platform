// === AUTH (Kirish/Ro‘yxatdan o‘tish) ===
const users = JSON.parse(localStorage.getItem("users")) || {};

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

if (loginForm) {
  loginForm.onsubmit = (e) => {
    e.preventDefault();
    const user = loginUser.value.trim();
    const pass = loginPass.value.trim();

    if (users[user] && users[user] === pass) {
      localStorage.setItem("activeUser", user);
      location.href = "quiz.html";
    } else {
      alert("Login yoki parol xato!");
    }
  };
}

if (registerForm) {
  registerForm.onsubmit = (e) => {
    e.preventDefault();
    const user = regUser.value.trim();
    const pass = regPass.value.trim();

    if (!user || !pass) return alert("Maydonlar bo‘sh bo‘lmasin!");
    if (users[user]) return alert("Bunday foydalanuvchi allaqachon mavjud!");

    users[user] = pass;
    localStorage.setItem("users", JSON.stringify(users));
    alert("Ro‘yxatdan o‘tildi ✅! Endi tizimga kiring.");
    registerForm.reset();
  };
}

// Tablarni boshqarish
document.getElementById("loginTab")?.addEventListener("click", () => {
  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");
  loginTab.classList.add("active");
  registerTab.classList.remove("active");
});
document.getElementById("registerTab")?.addEventListener("click", () => {
  registerForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
  registerTab.classList.add("active");
  loginTab.classList.remove("active");
});

// === QUIZ ===
if (document.getElementById("quizBox")) {
  const user = localStorage.getItem("activeUser");
  if (!user) location.href = "index.html";
  username.textContent = "👤 " + user;

  let questions = [];
  let current = 0;
  let score = 0;

  async function loadQuestions() {
    const res = await fetch("questions.json");
    questions = await res.json();
    loadQuestion();
  }

  function loadQuestion() {
    const q = questions[current];
    questionText.textContent = q.question;
    answers.innerHTML = "";
    q.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.textContent = opt;
      btn.onclick = () => {
        if (i === q.correct) {
          score++;
          btn.classList.add("correct");
        } else btn.classList.add("wrong");
        document.querySelectorAll("#answers button").forEach(b => b.disabled = true);
      };
      answers.appendChild(btn);
    });
  }

  nextBtn.onclick = () => {
    current++;
    if (current < questions.length) loadQuestion();
    else {
      quizBox.classList.add("hidden");
      resultBox.classList.remove("hidden");
      scoreText.textContent = `${score} / ${questions.length} to‘g‘ri javob`;
    }
  };

  logoutBtn.onclick = () => {
    localStorage.removeItem("activeUser");
    location.href = "index.html";
  };

  loadQuestions();
}
