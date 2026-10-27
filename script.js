const questions = [
  { question: "Which language structures the content of a web page?", options: ["HTML", "CSS", "SQL", "Python"], answer: 0, explanation: "HTML defines the structure and content of a web page." },
  { question: "Which technology is mainly used to style a web page?", options: ["Java", "CSS", "Git", "JSON"], answer: 1, explanation: "CSS controls visual presentation, including layout, colors, and typography." },
  { question: "What does SaaS stand for?", options: ["Software as a Service", "Storage as a System", "Security as a Server", "Software and Source"], answer: 0, explanation: "SaaS means Software as a Service: software accessed over the internet." },
  { question: "Which browser feature can store small amounts of data for a demo app?", options: ["LocalStorage", "HTML heading", "CSS grid", "A hyperlink"], answer: 0, explanation: "LocalStorage saves key-value data in the user's browser." },
  { question: "Which HTTP method is commonly used to send new data to a server?", options: ["GET", "POST", "TRACE", "HEAD"], answer: 1, explanation: "POST is commonly used to submit data for server-side processing." }
];

const $ = (id) => document.getElementById(id);
let currentIndex = 0;
let score = 0;
let selected = false;

function loadQuestion() {
  selected = false;
  const q = questions[currentIndex];
  $("question-number").textContent = `Question ${currentIndex + 1} of ${questions.length}`;
  $("question-text").textContent = q.question;
  $("question-count").textContent = `${questions.length} questions`;
  $("progress").style.width = `${(currentIndex / questions.length) * 100}%`;
  $("feedback").textContent = "";
  $("next-btn").disabled = true;
  $("next-btn").textContent = currentIndex === questions.length - 1 ? "View results →" : "Next question →";
  $("options").innerHTML = "";
  q.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "option";
    button.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
    button.addEventListener("click", () => chooseAnswer(index, button));
    $("options").appendChild(button);
  });
}

function chooseAnswer(index, button) {
  if (selected) return;
  selected = true;
  const q = questions[currentIndex];
  const buttons = [...$("options").querySelectorAll("button")];
  buttons.forEach((b) => { b.disabled = true; });
  if (index === q.answer) {
    score++;
    button.classList.add("correct");
    $("feedback").textContent = `✓ ${q.explanation}`;
    $("feedback").style.color = "var(--green)";
  } else {
    button.classList.add("wrong");
    buttons[q.answer].classList.add("correct");
    $("feedback").textContent = `Not quite. ${q.explanation}`;
    $("feedback").style.color = "var(--red)";
  }
  $("progress").style.width = `${((currentIndex + 1) / questions.length) * 100}%`;
  $("next-btn").disabled = false;
}

function showResults() {
  $("quiz-area").classList.add("hidden");
  $("result-area").classList.remove("hidden");
  const percent = Math.round((score / questions.length) * 100);
  $("result-score").textContent = `${score} / ${questions.length}`;
  $("result-title").textContent = percent >= 80 ? "Excellent work!" : percent >= 50 ? "Good effort!" : "Keep practising!";
  $("result-emoji").textContent = percent >= 80 ? "🏆" : percent >= 50 ? "🌟" : "💪";
  $("result-message").textContent = `You scored ${percent}%. Review the explanations and try again to improve your score.`;
  saveResult(score, questions.length);
  updateDashboard();
}

function saveResult(value, total) {
  let history = [];
  try { history = JSON.parse(localStorage.getItem("smartquiz-history") || "[]"); } catch { history = []; }
  history.push({ score: value, total, date: new Date().toISOString() });
  localStorage.setItem("smartquiz-history", JSON.stringify(history.slice(-100)));
}

function updateDashboard() {
  let history = [];
  try { history = JSON.parse(localStorage.getItem("smartquiz-history") || "[]"); } catch { history = []; }
  $("completed-stat").textContent = history.length;
  if (!history.length) {
    $("best-stat").textContent = "—";
    $("latest-stat").textContent = "—";
    return;
  }
  const best = Math.max(...history.map(item => Math.round(item.score / item.total * 100)));
  const latest = history[history.length - 1];
  $("best-stat").textContent = `${best}%`;
  $("latest-stat").textContent = `${Math.round(latest.score / latest.total * 100)}%`;
}

$("next-btn").addEventListener("click", () => {
  if (currentIndex < questions.length - 1) {
    currentIndex++;
    loadQuestion();
  } else {
    showResults();
  }
});

$("restart-btn").addEventListener("click", () => {
  currentIndex = 0;
  score = 0;
  $("result-area").classList.add("hidden");
  $("quiz-area").classList.remove("hidden");
  loadQuestion();
  document.getElementById("quiz").scrollIntoView({ behavior: "smooth", block: "start" });
});

loadQuestion();
updateDashboard();
