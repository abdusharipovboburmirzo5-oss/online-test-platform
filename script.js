// === RO‘YXATDAN O‘TISH / KIRISH ===
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
      location.href = "profile.html";
    } else alert("Login yoki parol noto‘g‘ri!");
  };
}

if (registerForm) {
  registerForm.onsubmit = (e) => {
    e.preventDefault();
    const user = regUser.value.trim();
    const pass = regPass.value.trim();
    if (users[user]) alert("Bunday foydalanuvchi mavjud!");
    else {
      users[user] = pass;
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("activeUser", user);
      alert("Ro‘yxatdan o‘tildi!");
      location.href = "profile.html";
    }
  };
}

document.getElementById("loginTab")?.addEventListener("click", () => {
  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");
});
document.getElementById("registerTab")?.addEventListener("click", () => {
  registerForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
});

// === PROFIL SAHIFASI ===
if (document.body.classList.contains("profile-page")) {
  const user = localStorage.getItem("activeUser");
  if (!user) location.href = "index.html";

  document.getElementById("username").textContent = "👤 " + user;
  document.getElementById("nameDisplay").textContent = user;

  const score = localStorage.getItem("lastScore") || "Hozircha yo‘q";
  document.getElementById("scoreInfo").textContent = score;

  const motivatsiyalar = [
    "Hech qachon taslim bo‘lmang — katta natija sabr bilan keladi!",
    "Bugun boshlang, erta kech bo‘lishi mumkin.",
    "Bilim — kuch, uni to‘plang va ulashing.",
    "Sizning harakatlaringiz kelajagingizni yaratadi."
  ];
  document.getElementById("motivationText").textContent =
    motivatsiyalar[Math.floor(Math.random() * motivatsiyalar.length)];

  document.getElementById("logoutBtn").onclick = () => {
    localStorage.removeItem("activeUser");
    location.href = "index.html";
  };

  document.getElementById("startQuizBtn").onclick = () => {
    location.href = "quiz.html";
  };
}

// === TEST SAHIFASI ===
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
      localStorage.setItem("lastScore", `${score}/${questions.length}`);
    }
  };

  logoutBtn.onclick = () => {
    localStorage.removeItem("activeUser");
    location.href = "index.html";
  };

  loadQuestions();
}
