/* === 1. Google Sheet CSV URL ================================= */
const CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vR3-TJZEjscjRTrAOLi3t64v8H7lbV9X2jh-SFdokO2BEFRT4tfwG-MjX7OnxOcpRYvsh8fRb50uViB/pub?gid=0&single=true&output=csv';

/* === 2. CSV を読み込み、配列にしてからクイズ開始 ============ */
fetch(CSV_URL)
.then(response => response.text())
.then(csvText => {
  const { data } = Papa.parse(csvText, { header: true, skipEmptyLines: true });

  const questions = data.map(row => {
    const choices = [row.Choice1, row.Choice2, row.Choice3, row.Choice4];

    let answer = Number(row.AnswerIndex);
    if (isNaN(answer)) {
      answer = choices.indexOf(row.AnswerIndex); // 文字列としてマッチ
    }

    if (answer < 0 || answer >= choices.length) {
      console.warn(`無効な正解: ${row.AnswerIndex}（問題: ${row.Question}）`);
    }

    return {
      question: row.Question,
      choices,
      answer,
      explanation: row.Explanation 
    };
  });

  startQuiz(questions);
})
.catch(error => {
  alert('問題データを取得できませんでした');
  console.error(error);
});

/* === 2. クイズ機能（ロジック本体） =========================== */

let quiz = [], current = 0, score = 0;

const questionEl = document.getElementById('question');
const choicesEl  = document.getElementById('choices');
const progressEl = document.getElementById('progress-bar');
const scoreEl    = document.getElementById('score-label');
const resultEl   = document.getElementById('result');
const explainEl  = document.getElementById('explanation');
const nextBtn    = document.getElementById('next-btn');

nextBtn.addEventListener('click', () => loadQuestion(++current));

function startQuiz(all) {
quiz = shuffle([...all]).slice(0, 10);
current = score = 0;
loadQuestion(current);
}

function loadQuestion(i) {
if (i >= quiz.length) {
  showFinal();
  return;
}

resultEl.textContent = '';
explainEl.textContent = ''; 
explainEl.classList.add('hidden');
nextBtn.classList.add('hidden');
choicesEl.innerHTML = '';

const q = quiz[i];
questionEl.textContent = q.question;

q.choices.forEach((text, idx) => {
  const btn = document.createElement('button');
  btn.className = 'choice-btn';
  btn.textContent = text;
  btn.onclick = () => checkAnswer(btn, idx, q.answer);
  const li = document.createElement('li');
  li.appendChild(btn);
  choicesEl.appendChild(li);
});

updateProgress();
}

function checkAnswer(btn, selected, correct) {
disableChoices();

if (selected === correct) {
  btn.classList.add('correct');
  score++;
  resultEl.textContent = '正解！';
} else {
  btn.classList.add('wrong');

  if (correct >= 0 && correct < choicesEl.children.length) {
    const correctBtn = choicesEl.children[correct].firstChild;
    if (correctBtn) {
      correctBtn.classList.add('correct');
    }
  }

  resultEl.textContent = '残念…';
}

const exp = quiz[current].explanation;
if (exp) {
  explainEl.textContent = exp;
  explainEl.classList.remove('hidden');
}  

nextBtn.classList.remove('hidden');
updateProgress();
}

function disableChoices() {
document.querySelectorAll('.choice-btn').forEach(b => b.disabled = true);
}

function updateProgress() {
const percent = ((current + 1) / quiz.length) * 100;
progressEl.style.width = `${percent}%`;
scoreEl.textContent = `${score} / ${quiz.length}`;
}

function showFinal() {
questionEl.textContent = `終了！得点は ${score} / ${quiz.length} 点`;
resultEl.textContent = ''; 
explainEl.textContent = '';
explainEl.classList.add('hidden');
choicesEl.innerHTML = '';
progressEl.style.width = '100%';
nextBtn.textContent = 'もう一度';
nextBtn.classList.remove('hidden');
nextBtn.onclick = () => location.reload();
}

function shuffle(arr) {
for (let i = arr.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [arr[i], arr[j]] = [arr[j], arr[i]];
}
return arr;
}