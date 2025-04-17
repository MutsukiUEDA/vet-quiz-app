/* ==== 1. Google Sheet の CSV URL ==== */
const CSV_URL = 'https://docs.google.com/spreadsheets/d/2PACX-1vR3-TJZEjscjRTrAOLi3t64v8H7lbV9X2jh-SFdokO2BEFRT4tfwG-MjX7OnxOcpRYvsh8fRb50uViB/export?format=csv&gid=0';

/* ==== 2. 読み込みとパース ==== */
fetch(CSV_URL)
  .then(res => res.text())
  .then(csvText => {
    const { data } = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    // data は [{Question:'',Choice1:'',…}, …] という配列
    const questions = data.map(row => ({
      question : row.Question,
      choices  : [row.Choice1, row.Choice2, row.Choice3, row.Choice4],
      answer   : Number(row.AnswerIndex)   // 数値化
    }));
    startQuiz(questions);                 // ← 以前の関数に丸投げ
  })
  .catch(err => {
    alert('問題データを取得できませんでした');
    console.error(err);
  });

/* ==== 3. ここから下は前回と同じ startQuiz, shuffle など ==== */
/* ==== 3. DOM ==== */
const questionEl = document.getElementById('question');
const choicesEl  = document.getElementById('choices');
const progressEl = document.getElementById('progress-bar');
const scoreEl    = document.getElementById('score-label');
const resultEl   = document.getElementById('result');
const nextBtn    = document.getElementById('next-btn');

/* ==== 4. 初期化 ==== */
initQuiz();
nextBtn.addEventListener('click', () => loadQuestion(++current));

/* ---------- 関数 ---------- */
function initQuiz(){
  quiz = shuffle([...ALL_QUESTIONS]).slice(0,10); // 10問抽出
  current = 0; score = 0;
  loadQuestion(current);
}

function loadQuestion(idx){
  // 終了判定
  if(idx >= quiz.length){ showFinal(); return; }
  // UI リセット
  resultEl.textContent = '';
  nextBtn.classList.add('hidden');
  choicesEl.innerHTML = '';

  const q = quiz[idx];
  questionEl.textContent = q.question;
  q.choices.forEach((text,i)=>{
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = text;
    btn.onclick = ()=> checkAnswer(btn,i,q.answer);
    choicesEl.appendChild(btn);
  });

  updateProgress();
}

function checkAnswer(btn, selected, correct){
  disableChoices();
  if(selected === correct){
    btn.classList.add('correct');
    score++; resultEl.textContent = '正解！';
  }else{
    btn.classList.add('wrong');
    choicesEl.children[correct].firstChild.classList.add('correct');
    resultEl.textContent = '残念…';
  }
  nextBtn.classList.remove('hidden');
  updateProgress();
}

function disableChoices(){
  document.querySelectorAll('.choice-btn').forEach(b=>b.disabled = true);
}

function updateProgress(){
  const percent = ((current+1)/quiz.length)*100;
  progressEl.style.width = `${percent}%`;
  scoreEl.textContent = `${score} / ${quiz.length}`;
}

function showFinal(){
  questionEl.textContent = `終了！得点は ${score} / ${quiz.length} 点`;
  choicesEl.innerHTML = '';
  progressEl.style.width = '100%';
  nextBtn.textContent = 'もう一度';
  nextBtn.classList.remove('hidden');
  nextBtn.onclick = ()=> {
    nextBtn.textContent = '次の問題 ▶';
    initQuiz();
  };
}

/* ---------- ユーティリティ ---------- */
function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]] = [arr[j],arr[i]];
  }
  return arr;
}
