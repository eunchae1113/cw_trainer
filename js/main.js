// js/main.js

// --- 1. DOM 요소 연결 (HTML의 화면 요소들 가져오기) ---
const wpmSlider = document.getElementById('wpm-slider');
const wpmDisplay = document.getElementById('wpm-display');
const toneSlider = document.getElementById('tone-slider');
const toneDisplay = document.getElementById('tone-display');
const langSelect = document.getElementById('lang-select');
const keyModeRadios = document.getElementsByName('key-mode');
const morseOutput = document.getElementById('morse-output');
const textOutput = document.getElementById('text-output');
const startBtn = document.getElementById('start-btn');

// --- 2. 상태 관리 변수 ---
let wpm = parseInt(wpmSlider.value);
let keyMode = 'straight';
let currentLang = langSelect.value;
let currentSymbol = '';
let pressStartTime = 0;
let decodeTimer = null;

// --- 3. UI 이벤트 리스너 (사용자가 설정을 바꿀 때) ---
wpmSlider.addEventListener('input', (e) => {
    wpm = parseInt(e.target.value);
    wpmDisplay.innerText = wpm;
});

toneSlider.addEventListener('input', (e) => {
    const freq = parseInt(e.target.value);
    toneDisplay.innerText = freq;
    // audio.js에 작성될 주파수 변경 함수 호출
    if (typeof updateTone === 'function') updateTone(freq); 
});

langSelect.addEventListener('change', (e) => {
    currentLang = e.target.value;
    textOutput.innerText = ''; // 언어가 바뀌면 이전 텍스트 초기화
});

keyModeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        keyMode = e.target.value;
    });
});

startBtn.addEventListener('click', () => {
    // audio.js에 작성될 오디오 초기화 함수 호출
    if (typeof initAudio === 'function') {
        initAudio(); 
        startBtn.innerText = 'AUDIO READY';
        startBtn.style.backgroundColor = '#39ff14';
        startBtn.style.color = '#000';
    } else {
        alert('아직 audio.js 파일이 준비되지 않았습니다!');
    }
});

// --- 4. 모스 부호 판독 로직 ---

// WPM(Word Per Minute)을 기반으로 단점(Dot)의 기준 시간(ms) 계산
// 표준 공식: 단점 1개의 길이(ms) = 1200 / WPM
function calculateDotDuration() {
    return 1200 / wpm; 
}

// 키를 누를 때
function handleKeyDown(e) {
    if (e.repeat) return; // 키를 꾹 누르고 있을 때 발생하는 중복 입력 방지
    
    // 스페이스바를 누를 때 화면이 아래로 스크롤되는 기본 브라우저 동작 막기
    if (e.code === 'Space' || e.code === 'KeyQ' || e.code === 'KeyW') {
        e.preventDefault();
    }

    if (keyMode === 'straight' && e.code === 'Space') {
        if (typeof startTone === 'function') startTone();
        pressStartTime = Date.now();
    } 
    else if (keyMode === 'paddle') {
        if (e.code === 'KeyQ' || e.code === 'KeyW') {
            if (typeof startTone === 'function') startTone();
            // 패들은 누르는 즉시 부호를 판단함
            let symbol = e.code === 'KeyQ' ? '.' : '-';
            appendSymbol(symbol);
        }
    }
}

// 키를 뗄 때
function handleKeyUp(e) {
    if (keyMode === 'straight' && e.code === 'Space') {
        if (typeof stopTone === 'function') stopTone();
        
        const duration = Date.now() - pressStartTime;
        const dotLen = calculateDotDuration();
        
        // 누른 시간이 (단점 길이의 1.5배) 이하면 단점, 초과면 장점으로 판독
        let symbol = duration <= dotLen * 1.5 ? '.' : '-';
        appendSymbol(symbol);
    }
    else if (keyMode === 'paddle' && (e.code === 'KeyQ' || e.code === 'KeyW')) {
        if (typeof stopTone === 'function') stopTone();
    }
}

// 부호 조합 및 번역 타이머
function appendSymbol(symbol) {
    if (currentSymbol === '') morseOutput.innerText = ''; // 첫 입력 시 화면의 '_' 지우기
    currentSymbol += symbol;
    morseOutput.innerText = currentSymbol;

    // 이전 타이머 취소 후 재설정
    clearTimeout(decodeTimer);
    
    // 단점 길이의 3배(표준 글자 간격)만큼 추가 입력이 없으면 번역 시작
    const gapDuration = calculateDotDuration() * 3;
    decodeTimer = setTimeout(() => {
        decodeMorse();
    }, gapDuration); 
}

// 부호를 텍스트로 번역 (data.js 활용)
function decodeMorse() {
    if (currentSymbol === '') return;

    let translated = '?'; // 사전에 없으면 물음표 출력
    
    // data.js에 작성될 morseData 객체에서 현재 언어에 맞는 글자 찾기
    if (typeof morseData !== 'undefined' && morseData[currentLang]) {
        translated = morseData[currentLang][currentSymbol] || '?';
    }

    textOutput.innerText += translated;
    currentSymbol = '';
    morseOutput.innerText = '_';

    // 텍스트가 너무 길어져서 화면 밖으로 나가는 것 방지
    if (textOutput.innerText.length > 15) {
        textOutput.innerText = textOutput.innerText.slice(1);
    }
}

// 이벤트 리스너 등록
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);
