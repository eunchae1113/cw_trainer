// js/main.js

const wpmSlider = document.getElementById('wpm-slider');
const wpmDisplay = document.getElementById('wpm-display');
const toneSlider = document.getElementById('tone-slider');
const toneDisplay = document.getElementById('tone-display');
const langSelect = document.getElementById('lang-select');
const keyModeRadios = document.getElementsByName('key-mode');
const appModeRadios = document.getElementsByName('app-mode'); // 🆕 스터디 모드 토글
const morseOutput = document.getElementById('morse-output');
const textOutput = document.getElementById('text-output');
const startBtn = document.getElementById('start-btn');
const modeDisplay = document.getElementById('mode-display');

// 🆕 스터디 모드용 UI 요소
const studyContainer = document.getElementById('study-container');
const studyTarget = document.getElementById('study-target');
const studyResult = document.getElementById('study-result');

let wpm = parseInt(wpmSlider.value);
let keyMode = 'straight';
let appMode = 'free'; // 'free' 또는 'study'
let currentLang = langSelect.value;
let currentSymbol = '';
let pressStartTime = 0;
let decodeTimer = null;

// 🆕 스터디 모드 상태 변수
let currentTargetMorse = '';
let currentTargetText = '';

wpmSlider.addEventListener('input', (e) => {
    wpm = parseInt(e.target.value);
    wpmDisplay.innerText = wpm;
});

toneSlider.addEventListener('input', (e) => {
    const freq = parseInt(e.target.value);
    toneDisplay.innerText = freq;
    if (typeof updateTone === 'function') updateTone(freq); 
});

langSelect.addEventListener('change', (e) => {
    currentLang = e.target.value;
    textOutput.innerText = '';
    // 스터디 모드 중 언어가 바뀌면 새로운 문제 출제
    if (appMode === 'study') nextStudyItem();
});

keyModeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => { keyMode = e.target.value; });
});

// 🆕 앱 모드(Free/Study) 변경 이벤트
appModeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        appMode = e.target.value;
        textOutput.innerText = '';
        currentSymbol = '';
        morseOutput.innerText = '_';
        
        if (appMode === 'study') {
            modeDisplay.innerText = 'MODE: STUDY';
            studyContainer.style.display = 'flex';
            nextStudyItem(); // 문제 출제
        } else {
            modeDisplay.innerText = 'MODE: FREE PLAY';
            studyContainer.style.display = 'none';
        }
    });
});

startBtn.addEventListener('click', () => {
    if (typeof initAudio === 'function') {
        initAudio(); 
        startBtn.innerText = 'AUDIO READY';
        startBtn.style.backgroundColor = '#39ff14';
        startBtn.style.color = '#000';
    }
});

// 🆕 다음 스터디 문제 출제 함수
function nextStudyItem() {
    if (typeof morseData === 'undefined' || !morseData[currentLang]) return;
    
    const dict = morseData[currentLang];
    const keys = Object.keys(dict); // 현재 언어의 모든 모스 부호 목록
    
    // 무작위로 하나 뽑기
    const randomMorse = keys[Math.floor(Math.random() * keys.length)];
    
    currentTargetMorse = randomMorse;
    currentTargetText = dict[randomMorse];
    
    studyTarget.innerText = currentTargetText; // 화면에 타겟 표시
    studyResult.innerText = ''; // 이전 결과 지우기
}

function calculateDotDuration() {
    return 1200 / wpm; 
}

function handleKeyDown(e) {
    if (e.repeat) return;
    if (e.code === 'Space' || e.code === 'KeyQ' || e.code === 'KeyW') e.preventDefault();

    if (keyMode === 'straight' && e.code === 'Space') {
        if (typeof startTone === 'function') startTone();
        pressStartTime = Date.now();
    } 
    else if (keyMode === 'paddle') {
        if (e.code === 'KeyQ' || e.code === 'KeyW') {
            if (typeof startTone === 'function') startTone();
            let symbol = e.code === 'KeyQ' ? '.' : '-';
            appendSymbol(symbol);
        }
    }
}

function handleKeyUp(e) {
    if (keyMode === 'straight' && e.code === 'Space') {
        if (typeof stopTone === 'function') stopTone();
        const duration = Date.now() - pressStartTime;
        const dotLen = calculateDotDuration();
        let symbol = duration <= dotLen * 1.5 ? '.' : '-';
        appendSymbol(symbol);
    }
    else if (keyMode === 'paddle' && (e.code === 'KeyQ' || e.code === 'KeyW')) {
        if (typeof stopTone === 'function') stopTone();
    }
}

function appendSymbol(symbol) {
    if (currentSymbol === '') morseOutput.innerText = '';
    currentSymbol += symbol;
    morseOutput.innerText = currentSymbol;

    clearTimeout(decodeTimer);
    const gapDuration = calculateDotDuration() * 3;
    decodeTimer = setTimeout(() => {
        decodeMorse();
    }, gapDuration); 
}

// 🛠️ 번역 및 채점 로직 통합
function decodeMorse() {
    if (currentSymbol === '') return;

    let translated = '?';
    if (typeof morseData !== 'undefined' && morseData[currentLang]) {
        translated = morseData[currentLang][currentSymbol] || '?';
    }

    // Free Play 모드일 때
    if (appMode === 'free') {
        textOutput.innerText += translated;
        if (textOutput.innerText.length > 15) {
            textOutput.innerText = textOutput.innerText.slice(1);
        }
    } 
    // Study 모드일 때 (채점)
    else if (appMode === 'study') {
        textOutput.innerText = translated; // 내가 입력한 결과 보여주기
        
        if (currentSymbol === currentTargetMorse) {
            studyResult.innerText = 'GOOD!';
            studyResult.style.color = '#39ff14'; // 정답은 네온 그린
            setTimeout(nextStudyItem, 1000); // 1초 뒤 다음 문제
        } else {
            studyResult.innerText = 'FAIL';
            studyResult.style.color = '#ff3333'; // 오답은 빨간색
            // 틀리면 다시 도전할 수 있게 1초 뒤 실패 글자만 지움
            setTimeout(() => { studyResult.innerText = ''; }, 1000); 
        }
    }

    currentSymbol = '';
    morseOutput.innerText = '_';
}

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);
