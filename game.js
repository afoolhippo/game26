// ===== DOM取得 =====
const titleScreen = document.getElementById("titleScreen");
const gameScreen = document.getElementById("gameScreen");
const resultScreen = document.getElementById("resultScreen");

const startBtn = document.getElementById("startBtn");
const retryBtn = document.getElementById("retryBtn");

const restBtn = document.getElementById("restBtn");
const shellBtn = document.getElementById("shellBtn");

const shareBtn = document.getElementById("shareBtn");
const homeBtn = document.getElementById("homeBtn");

const titleBackBtn =
document.getElementById("titleBackBtn");

const titleImage = document.getElementById("titleImage");

const timeText = document.getElementById("timeText");
const eventText = document.getElementById("eventText");

const dokidokiMeter =
document.getElementById("dokidokiMeter");

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const resultCanvas =
document.getElementById("resultCanvas");

const resultCtx =
resultCanvas.getContext("2d");

const dog = document.getElementById("dog");
const bike = document.getElementById("bike");
const clover = document.getElementById("clover");
const cat = document.getElementById("cat");

const bg1 = document.getElementById("bg1");
const bg2 = document.getElementById("bg2");

// ===== BGM =====
const bgm = new Audio("bgm.mp3");

bgm.loop = true;
bgm.volume = 0.35;

// ===== 画像 =====
const turtleImg = new Image();
turtleImg.src = "turtle.png";

// ===== 基本設定 =====
const SPRITE_SIZE = 1024 / 3;
const MAX_DOKIDOKI = 100;

let gameRunning = false;
let timerInterval = null;

let time = 60;
let dokidoki = 0;

let bgX = 0;

let turtleX = 120;
let turtleY = 140;

let animFrame = 0;
let animTimer = 0;

// walk / rest / success / fail / shell
let state = "walk";

// 休む時だけ世界停止
let isWorldPaused = false;

// 接触1回判定用
let passedFlags = {
  dog:false,
  bike:false,
  clover:false,
  cat:false
};

// ===== 開始 =====
function startGame(){

  titleScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  time = 60;
  dokidoki = 0;

  bgX = 0;

  state = "walk";
  isWorldPaused = false;

  eventText.textContent = "";

  resetEmoji();
  resetPassFlags();

  gameRunning = true;

  bgm.currentTime = 0;
  bgm.play();

  updateUI();

  clearInterval(timerInterval);

  loop();

  timerInterval = setInterval(()=>{

    if(!gameRunning) return;

    time--;

    dokidoki += 0.25;

    clampDokidoki();

    updateUI();

    if(time <= 0){
      endGame();
    }

  },1000);

}

// ===== メインループ =====
function loop(){

  if(!gameRunning) return;

  requestAnimationFrame(loop);

  ctx.clearRect(0,0,320,240);

  if(!isWorldPaused){

    bgX -= 1;

    if(bgX <= -320){
      bgX = 0;
    }

  }

  bg1.style.left = bgX + "px";
  bg2.style.left = (bgX + 320) + "px";

  moveEmoji(dog,2.2,"dog");
  moveEmoji(bike,3.6,"bike");
  moveEmoji(clover,1.6,"clover");
  moveEmoji(cat,1.4,"cat");

  if(state === "walk"){

    animTimer++;

    if(animTimer >= 18){

      animFrame =
      (animFrame + 1) % 2;

      animTimer = 0;
    }
  }

  drawTurtle();

}

// ===== カメ描画 =====
function drawTurtle(){

  let frameX = animFrame;
  let frameY = 0;

  if(state === "shell"){
    frameX = 2;
    frameY = 0;
  }

  if(state === "rest"){
    frameX = 2;
    frameY = 2;
  }

  if(state === "success"){
    frameX = 0;
    frameY = 1;
  }

  if(state === "fail"){
    frameX = 0;
    frameY = 2;
  }

  ctx.save();

  ctx.translate(turtleX + 64,0);
  ctx.scale(-1,1);

  ctx.drawImage(
    turtleImg,
    frameX * SPRITE_SIZE,
    frameY * SPRITE_SIZE,
    SPRITE_SIZE,
    SPRITE_SIZE,
    turtleX,
    turtleY,
    64,
    64
  );

  ctx.restore();

}

// ===== 絵文字 =====
function moveEmoji(el,speed,type){

  let x = parseFloat(el.style.left);

  if(!isWorldPaused){
    x -= speed;
  }

  if(x < -100){

    if(type === "dog"){
      x = 650 + Math.random()*700;
    }

    if(type === "bike"){
      x = 1000 + Math.random()*900;
    }

    if(type === "clover"){
      x = 550 + Math.random()*700;
    }

    if(type === "cat"){
      x = 1300 + Math.random()*900;
    }

    passedFlags[type] = false;
  }

  el.style.left = x + "px";

  if(x > 110 && x < 170 && !passedFlags[type]){

    if(state === "walk"){

      if(type === "dog"){
        dokidoki += 16;
      }

      if(type === "bike"){
        dokidoki += 11;
      }

      if(type === "cat"){
        dokidoki += 4;
      }

      if(type === "clover"){
        dokidoki -= 10;
      }

      clampDokidoki();
      updateUI();
    }

    passedFlags[type] = true;
  }

}

// ===== 休む =====
restBtn.onclick = ()=>{

  if(!gameRunning) return;
  if(state !== "walk") return;

  state = "rest";
  isWorldPaused = true;

  eventText.textContent = "zzz...";

  setTimeout(()=>{

    const dogX = parseFloat(dog.style.left);
    const bikeX = parseFloat(bike.style.left);
    const catX = parseFloat(cat.style.left);

    const dangerNear =
      (dogX > 40 && dogX < 240) ||
      (bikeX > 40 && bikeX < 240) ||
      (catX > 60 && catX < 220);

    if(dangerNear){

      state = "fail";

      dokidoki += 24;

      eventText.textContent =
      "からまれた💦";

    }else{

      state = "success";

      dokidoki -= 30;

      eventText.textContent =
      "しっかり やすめた！";
    }

    clampDokidoki();
    updateUI();

    setTimeout(()=>{

      state = "walk";
      isWorldPaused = false;

      eventText.textContent = "";

      resetPassFlags();

    },1800);

  },1800);

};

// ===== 甲羅 =====
shellBtn.onclick = ()=>{

  if(!gameRunning) return;
  if(state !== "walk") return;

  state = "shell";

  eventText.textContent =
  "こうらに かくれた";

  setTimeout(()=>{

    state = "walk";

    eventText.textContent = "";

    resetPassFlags();

  },1600);

};

// ===== UI =====
function updateUI(){

  timeText.textContent = time;

  const percent =
  Math.floor(dokidoki);

  const filled =
  Math.floor(percent / 10);

  let meter = "";

  for(let i=0; i<10; i++){

    if(i < filled){
      meter += "█";
    }else{
      meter += "░";
    }

  }

  dokidokiMeter.textContent =
  meter + " " + percent + "%";

}

// ===== 値制限 =====
function clampDokidoki(){

  if(dokidoki < 0){
    dokidoki = 0;
  }

  if(dokidoki > MAX_DOKIDOKI){
    dokidoki = MAX_DOKIDOKI;
  }

}

// ===== 初期配置 =====
function resetEmoji(){

  dog.style.left = "650px";
  bike.style.left = "1000px";
  clover.style.left = "550px";
  cat.style.left = "1300px";

}

// ===== 通過判定 =====
function resetPassFlags(){

  passedFlags = {
    dog:false,
    bike:false,
    clover:false,
    cat:false
  };

}

// ===== 結果 =====
function endGame(){

  gameRunning = false;

  clearInterval(timerInterval);

  bgm.pause();

  gameScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");

  let rank = "のんびりカメ";
  let comment =
  "きょうも ゆっくり さんぽした。";

  let resultFrameX = 0;
  let resultFrameY = 0;

  if(dokidoki >= 70){

    rank = "ドキドキカメ";

    comment =
    "いろいろ あって どきどきした。";

    resultFrameX = 0;
    resultFrameY = 2;

  }

  else if(dokidoki <= 25){

    rank = "ごきげんカメ";

    comment =
    "とても きもちいい さんぽだった！";

    resultFrameX = 0;
    resultFrameY = 1;

  }

  else{

    resultFrameX = 0;
    resultFrameY = 0;
  }

  document.getElementById("resultRank")
  .textContent = rank;

  document.getElementById("resultComment")
  .textContent = comment;

  resultCtx.clearRect(0,0,96,96);

  resultCtx.drawImage(
    turtleImg,
    resultFrameX * SPRITE_SIZE,
    resultFrameY * SPRITE_SIZE,
    SPRITE_SIZE,
    SPRITE_SIZE,
    0,
    0,
    96,
    96
  );

}

// ===== シェア =====
shareBtn.onclick = ()=>{

  const text =
`のんびり さんぽしました 🐢

ドキドキ ${Math.floor(dokidoki)}%

無料ブラウザゲーム
「カメカメライフ」

#カメカメライフ
#カバゲーセン`;

  window.open(
    "https://twitter.com/intent/tweet?text=" +
    encodeURIComponent(text),
    "_blank"
  );

};

// ===== もう1回 =====
retryBtn.onclick = ()=>{

  resultScreen.classList.add("hidden");
  gameScreen.classList.add("hidden");

  titleScreen.classList.remove("hidden");

};

// ===== タイトル戻る =====
titleBackBtn.onclick = ()=>{

  gameRunning = false;

  clearInterval(timerInterval);

  bgm.pause();

  gameScreen.classList.add("hidden");

  titleScreen.classList.remove("hidden");

};

// ===== ホーム =====
homeBtn.onclick = ()=>{

  location.href =
  "https://afoolhippo.github.io/home/";

};

// ===== 開始 =====
startBtn.onclick = startGame;
titleImage.onclick = startGame;