// (기존 코드 윗부분은 그대로 유지)

// 🆕 스터디 문제 출제 함수 (힌트 추가!)
function nextStudyItem() {
    if (typeof morseData === 'undefined' || !morseData[currentLang]) return;
    
    const dict = morseData[currentLang];
    const keys = Object.keys(dict); 
    
    const randomMorse = keys[Math.floor(Math.random() * keys.length)];
    
    currentTargetMorse = randomMorse;
    currentTargetText = dict[randomMorse];
    
    // 💡 핵심 변경: 화면에 글자와 모스 부호(힌트)를 같이 보여줌
    // 예: TARGET: A [ .- ]
    studyTarget.innerText = `${currentTargetText} [ ${currentTargetMorse} ]`; 
    studyResult.innerText = ''; 
    currentSymbol = '';
    morseOutput.innerText = '_';
}

// ... (calculateDotDuration, handleKeyDown, handleKeyUp, appendSymbol 함수는 그대로 유지) ...

// 🛠️ 번역 및 채점 로직 (틀렸을 때 피드백 강화)
function decodeMorse() {
    if (currentSymbol === '') return;

    let translated = '?';
    if (typeof morseData !== 'undefined' && morseData[currentLang]) {
        translated = morseData[currentLang][currentSymbol] || '?';
    }

    // Free Play 모드
    if (appMode === 'free') {
        textOutput.innerText += translated;
        if (textOutput.innerText.length > 15) {
            textOutput.innerText = textOutput.innerText.slice(1);
        }
        currentSymbol = '';
        morseOutput.innerText = '_';
    } 
    // Study 모드
    else if (appMode === 'study') {
        textOutput.innerText = translated; // 내가 방금 친 글자 보여주기
        
        if (currentSymbol === currentTargetMorse) {
            // 정답일 때
            studyResult.innerText = 'GOOD!';
            studyResult.style.color = '#39ff14';
            
            // 1초 뒤에 다음 문제 출제
            setTimeout(() => {
                nextStudyItem();
            }, 1000);
            
        } else {
            // 오답일 때
            studyResult.innerText = 'FAIL';
            studyResult.style.color = '#ff3333';
            
            // 틀리면 문제를 넘기지 않고 다시 칠 수 있게 초기화
            setTimeout(() => { 
                studyResult.innerText = 'TRY AGAIN';
                studyResult.style.color = '#e09f3e';
                currentSymbol = '';
                morseOutput.innerText = '_';
            }, 1000); 
        }
    }
}

// (이벤트 리스너 부분은 그대로 유지)
