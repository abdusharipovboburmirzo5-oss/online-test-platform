let questions = [];
let currentQuestion = 0;
let score = 0;

const quiz = document.getElementById("quiz");
const startBtn = document.getElementById("start-btn");
const progressBar = document.getElementById("progress-bar");

startBtn.addEventListener("click", startQuiz);

async function startQuiz() {
  startBtn.style.display = "none";
  const res = await fetch("questions.json");
  questions = await res.json();
  showQuestion();
}

function showQuestion() {
  if (currentQuestion < questions.length) {
    const q = questions[currentQuestion];
    const progressPercent = ((currentQuestion) / questions.length) * 100;
    progressBar.style.width = `${progressPercent}%`;

    quiz.innerHTML = `
      <h2>${q.question}</h2>
      ${q.options.map((opt, i) => `
        <div class="option" onclick="selectOption(${i})">${opt}</div>
      `).join("")}
    `;
  } else {
    showResult();
  }
}

function selectOption(index) {
  const q = questions[currentQuestion];
  const options = document.querySelectorAll(".option");

  options.forEach((option, i) => {
    if (i === q.correct) {
      option.classList.add("correct");
    } else if (i === index) {
      option.classList.add("wrong");
    }
    option.style.pointerEvents = "none";
  });

  if (index === q.correct) score++;

  setTimeout(() => {
    currentQuestion++;
    showQuestion();
  }, 800);
}

function showResult() {
  progressBar.style.width = "100%";
  quiz.innerHTML = `
    <div id="result">
      <h2>✅ Test yakunlandi!</h2>
      <p>Siz ${questions.length} ta savoldan <strong>${score}</strong> tasiga to‘g‘ri javob berdingiz.</p>
      <p>Foiz: <strong>${Math.round((score / questions.length) * 100)}%</strong></p>
      <button class="btn" onclick="restartQuiz()">🔄 Qayta boshlash</button>
    </div>
  `;
}

function restartQuiz() {
  currentQuestion = 0;
  score = 0;
  startQuiz();
}
