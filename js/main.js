// js/main.js

// --- 1. DOM 요소 연결 ---
const wpmSlider = document.getElementById('wpm-slider');
const wpmDisplay = document.getElementById('wpm-display');
const toneSlider = document.getElementById('tone-slider');
const toneDisplay = document.getElementById('tone-display');
const langSelect = document.getElementById('lang-select');
const keyModeRadios = document.getElementsByName('key-mode');
const appModeRadios = document.getElementsByName('app-mode');
const morseOutput = document.getElementById('morse-output');
const textOutput = document.getElementById('text-output');
const startBtn = document.getElementById('start-btn');
const modeDisplay = document.getElementById('mode-display');

const studyContainer = document.getElementById('study-container');
const studyTarget = document.getElementById('study-target');
const studyResult = document.getElementById('study-result');

// --- 2. 상태 관리 변수 ---
let wpm = parseInt(wpmSlider.value);
let keyMode = 'straight';
let appMode = 'free'; // 'free' 또는 'study'
let currentLang = langSelect.value;
let currentSymbol = '';
let pressStartTime = 0;
let decodeTimer = null;

let currentTargetMorse = '';
let currentTargetText = '';

// --- 3. UI 이벤트 리스너 ---
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
    if (appMode === 'study') nextStudyItem();
});

keyModeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => { keyMode = e.target.value; });
});

appModeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        appMode = e.target.value;
        textOutput.innerText = '';
        currentSymbol = '';
        morseOutput.innerText = '_';
        
        if (appMode === 'study') {
            modeDisplay.innerText = 'MODE: STUDY';
            studyContainer.style.display = 'flex';
            nextStudyItem();
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

// --- 4. 스터디 문제 출제 함수 (힌트 포함) ---
function nextStudyItem() {
    if (typeof morseData === 'undefined' || !morseData[currentLang]) return;
    
    const dict = morseData[currentLang];
    const keys = Object.keys(dict); 
    
    const randomMorse = keys[Math.floor(Math.random() * keys.length)];
    
    currentTargetMorse = randomMorse;
    currentTargetText = dict[randomMorse];
    
    // 화면에 글자와 모스 부호(힌트)를 같이 보여줌
    studyTarget.innerText = `${currentTargetText} [ ${currentTargetMorse} ]`; 
    studyResult.innerText = ''; 
    currentSymbol = '';
    morseOutput.innerText = '_';
}

// --- 5. 모스 부호 판독 및 번역 로직 ---
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

function decodeMorse() {
    if (currentSymbol === '') return;

    let translated = '?';
    if (typeof morseData !== 'undefined' && morseData[currentLang]) {
        translated = morseData[currentLang][currentSymbol] || '?';
    }

    if (appMode === 'free') {
        textOutput.innerText += translated;
        if (textOutput.innerText.length > 15) {
            textOutput.innerText = textOutput.innerText.slice(1);
        }
        currentSymbol = '';
        morseOutput.innerText = '_';
    } 
    else if (appMode === 'study') {
        textOutput.innerText = translated; 
        
        if (currentSymbol === currentTargetMorse) {
            studyResult.innerText = 'GOOD!';
            studyResult.style.color = '#39ff14';
            setTimeout(() => {
                nextStudyItem();
            }, 1000);
            
        } else {
            studyResult.innerText = 'FAIL';
            studyResult.style.color = '#ff3333';
            setTimeout(() => { 
                studyResult.innerText = 'TRY AGAIN';
                studyResult.style.color = '#e09f3e';
                currentSymbol = '';
                morseOutput.innerText = '_';
            }, 1000); 
        }
    }
}

// --- 6. 이벤트 리스너 등록 ---
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);
