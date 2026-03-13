// js/audio.js

let audioCtx;
let oscillator;
let gainNode;
let isPlaying = false;

// 1. 오디오 초기화 (main.js에서 [AUDIO START] 버튼 클릭 시 호출됨)
function initAudio() {
    // 이미 초기화되었다면 중복 실행 방지
    if (audioCtx) return; 

    // 다양한 브라우저 호환성을 위한 AudioContext 생성
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();

    // 볼륨 조절을 위한 GainNode (앰프 역할) 생성
    gainNode = audioCtx.createGain();
    gainNode.gain.value = 0; // 처음엔 소리가 나지 않도록 볼륨을 0으로 설정
    gainNode.connect(audioCtx.destination); // 최종 스피커로 연결

    // 실제 소리의 파형을 만들어내는 Oscillator 생성
    oscillator = audioCtx.createOscillator();
    oscillator.type = 'sine'; // 모스 부호에 가장 적합한 부드러운 사인파
    
    // HTML에 있는 Tone 슬라이더의 현재 값을 가져와서 주파수 설정 (기본값 700Hz)
    const toneSlider = document.getElementById('tone-slider');
    const initialFreq = toneSlider ? parseInt(toneSlider.value) : 700;
    oscillator.frequency.value = initialFreq;

    // 발진기를 앰프에 연결하고 작동 시작 (볼륨이 0이라 아직 들리진 않음)
    oscillator.connect(gainNode);
    oscillator.start(); 
}

// 2. 소리 켜기 (키보드를 누를 때 호출)
function startTone() {
    if (!audioCtx || isPlaying) return;
    
    // 뚝 끊기는 파핑(Popping) 노이즈를 방지하기 위해 0.015초에 걸쳐 볼륨을 1로 부드럽게 올림
    gainNode.gain.setTargetAtTime(1, audioCtx.currentTime, 0.015);
    isPlaying = true;
}

// 3. 소리 끄기 (키보드에서 손을 뗄 때 호출)
function stopTone() {
    if (!audioCtx || !isPlaying) return;
    
    // 마찬가지로 노이즈 방지를 위해 부드럽게 볼륨을 0으로 내림
    gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.015);
    isPlaying = false;
}

// 4. 주파수 변경 (UI에서 Tone 슬라이더를 움직일 때 호출)
function updateTone(freq) {
    if (oscillator) {
        // 소리가 나는 도중에도 즉각적으로 음높이가 변하도록 설정
        oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
    }
}
