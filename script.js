import Papa from 'https://cdn.jsdelivr.net/npm/papaparse@5.4.3/+esm'; // ← ES6 import でも OK

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR3-TJZEjscjRTrAOLi3t64v8H7lbV9X2jh-SFdokO2BEFRT4tfwG-MjX7OnxOcpRYvsh8fRb50uViB/pub?gid=0&single=true&output=csv';

/* メイン */
fetch(CSV_URL)
  .then(r => r.text())
  .then(text => {
    const { data } = Papa.parse(text, { header: true, skipEmptyLines: true });
    const qs = data.map(r => ({
      question: r.Question,
      choices : [r.Choice1, r.Choice2, r.Choice3, r.Choice4],
      answer  : Number(r.AnswerIndex)
    }));
    startQuiz(qs);           // ← この関数を下で実装
  })
  .catch(e => {
    alert('問題データを取得できませんでした');
    console.error(e);
  });


/* ここからクイズのロジック ==================== */
let quiz = [], current = 0, score = 0;

const questionEl = document.getElementById('question');
const choicesEl  = document.getElementById('choices');
const progressEl = document.getElementById('progress-bar');
const scoreEl    = document.getElementById('score-label');
const resultEl   = document.getElementById('result');
const nextBtn    = document.getElementById('next-btn');

nextBtn.addEventListener('click', () => loadQuestion(++current));

function startQuiz(all) {
  quiz = shuffle([...all]).slice(0, 10); // 10 問抽出
  current = score = 0;
  loadQuestion(current);
}

function loadQuestion(i) {
  if (i >= quiz.length) { showFinal(); return; }
  resultEl.textContent = '';
  nextBtn.classList.add('hidden');
  choicesEl.innerHTML = '';

  const q = quiz[i];
  questionEl.textContent = q.question;
  q.choices.forEach((c, idx) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = c;
    btn.onclick = () => checkAnswer(btn, idx, q.answer);
    choicesEl.appendChild(btn);
  });
  updateProgress();
}

function checkAnswer(btn, sel, ans) {
  disableChoices();
  if (sel === ans) { btn.classList.add('correct'); score++; resultEl.textContent = '正解！'; }
  else {
    btn.classList.add('wrong');
    choicesEl.children[ans].firstChild.classList.add('correct');
    resultEl.textContent = '残念…';
  }
  nextBtn.classList.remove('hidden');
  updateProgress();
}

function disableChoices() { document.querySelectorAll('.choice-btn').forEach(b => b.disabled = true); }

function updateProgress() {
  progressEl.style.width = ((current + 1) / quiz.length * 100) + '%';
  scoreEl.textContent = `${score} / ${quiz.length}`;
}

function showFinal() {
  questionEl.textContent = `終了！得点は ${score} / ${quiz.length} 点`;
  choicesEl.innerHTML = '';
  progressEl.style.width = '100%';
  nextBtn.textContent = 'もう一度';
  nextBtn.classList.remove('hidden');
  nextBtn.onclick = () => location.reload();
}

function shuffle(a) { for (let i = a.length - 1; i; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
