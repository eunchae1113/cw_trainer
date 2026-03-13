// js/data.js

// 1. 영어 및 숫자 기본 사전 (다른 곳에서도 재사용하기 위해 분리)
const baseEnglish = {
    '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E',
    '..-.': 'F', '--.': 'G', '....': 'H', '..': 'I', '.---': 'J',
    '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O',
    '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T',
    '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y', '--..': 'Z',
    '.----': '1', '..---': '2', '...--': '3', '....-': '4', '.....': '5',
    '-....': '6', '--...': '7', '---..': '8', '----.': '9', '-----': '0',
    '.-.-.-': '.', '--..--': ',', '..--..': '?'
};

// 메인 모스 부호 데이터베이스
const morseData = {
    english: { ...baseEnglish },

    // 2. 한국어 (표준 한글 모스 부호)
    korean: {
        '.-..': 'ㄱ', '..-.': 'ㄴ', '-...': 'ㄷ', '...-': 'ㄹ', '--': 'ㅁ',
        '.--': 'ㅂ', '--.': 'ㅅ', '-.-': 'ㅇ', '.--.': 'ㅈ', '-.-.': 'ㅊ',
        '-..-': 'ㅋ', '--..': 'ㅌ', '---': 'ㅍ', '.---': 'ㅎ',
        '.': 'ㅏ', '..': 'ㅑ', '-': 'ㅓ', '...': 'ㅕ', '.-': 'ㅗ',
        '-.': 'ㅛ', '....': 'ㅜ', '.-.': 'ㅠ', '-..': 'ㅡ', '..-': 'ㅣ',
        '--.-': 'ㅐ', '-.--': 'ㅔ'
    },

    // 3. Q 부호 및 약어 객체 (기본 알파벳도 입력 가능하도록 병합)
    qcodes: {
        ...baseEnglish 
    }
};

// --- 💡 스마트 사전 등록 로직 ---

// 영문자(A)를 모스 부호(.-)로 찾을 수 있게 뒤집은 맵 생성
const textToMorseMap = {};
for (const [morse, text] of Object.entries(baseEnglish)) {
    textToMorseMap[text] = morse;
}

// Q 부호 및 CW 약어 리스트
const rawQcodesAndAbbr = {
    // 📡 Q 부호 (Q-Codes)
    "QRA": "QRA: 귀국의 명칭은 무엇입니까?",
    "QRG": "QRG: 이곳의 정확한 주파수를 지시하여 주시겠습니까?",
    "QRI": "QRI: 이곳의 발사 음질은 어떠합니까?",
    "QRK": "QRK: 이곳의 신호의 명료도는 어떠합니까?",
    "QRL": "QRL: 그곳은 통신중입니까?",
    "QRM": "QRM: 그곳은 혼신을 받고 있습니까?",
    "QRN": "QRN: 그곳은 공전의 방해를 받고 있습니까?",
    "QRO": "QRO: 이곳의 송신기의 전력을 증가할까요?",
    "QRP": "QRP: 이곳의 송신기의 전력을 감소할까요?",
    "QRQ": "QRQ: 이곳은 좀 더 빨리 송신할까요?",
    "QRS": "QRS: 이곳은 좀 더 느리게 송신할까요?",
    "QRT": "QRT: 이곳은 송신을 중지할까요?",
    "QRU": "QRU: 그곳은 이곳에 전송할 것이 있습니까?",
    "QRV": "QRV: 그곳은 준비가 되어 있습니까?",
    "QRW": "QRW: 이곳은 ...에 그곳이 ...KHZ(MHZ)로 호출할 수 있음을 통지할까요?",
    "QRX": "QRX: 그곳은 몇 시에 재차 이곳을 호출하겠습니까?",
    "QRZ": "QRZ: 누가 이곳을 호출하고 있습니까?",
    "QSB": "QSB: 이곳의 신호에는 페이딩(Fading)이 있습니까?",
    "QSD": "QSD: 이곳의 전건조작은 부정확합니까?",
    "QSK": "QSK: 그곳은 신호 사이에 이곳을 청취할 수 있습니까?",
    "QSL": "QSL: 그곳은 수신증을 보낼 수 있습니까?",
    "QSM": "QSM: 송신한 최후의 전보(또는 이전 전보)를 반복할까요?",
    "QSN": "QSN: 그곳은 이곳을 ...KHZ(MHZ)로 청취하였습니까?",
    "QSP": "QSP: 그곳은 무료로 ...에 중계하여 주시겠습니까?",
    "QSU": "QSU: 이 주파수 또는 ...KHZ(MHZ)로 송신 또는 응답 할까요?",
    "QSW": "QSW: 이 주파수 또는 ...KHZ(MHZ)로 송신하여 주시겠습니까?",
    "QSX": "QSX: 그곳은 ...(호출부호)를 ...KHZ(MHZ)로 청수하여 주겠습니까?",
    "QSY": "QSY: 이곳은 다른 주파수로 변경하여 전송할까요?",
    "QSZ": "QSZ: 이곳은 각 어, 또는 각 집합을 2회 이상 송신할까요?",
    "QTC": "QTC: 그곳에는 송신할 전보가 몇 통 있습니까?",
    "QTH": "QTH: 위도 및 경도로 표시하는 그곳의 위치는 몇 도입니까?",
    "QTR": "QTR: 정확한 시간은 몇 시입니까?",

    // 💬 CW 통신 약어 (Abbreviations)
    "ANT": "ANT: 안테나",
    "CFM": "CFM: Confirm (확인)",
    "DE": "DE: This is (~로부터)",
    "DX": "DX: Distance (장거리 교신)",
    "ES": "ES: And (그리고)",
    "EYEBALL": "EYE-BALL: 직접 만나는 것, 모임",
    "FB": "FB: Fine Business (훌륭함, 아주 좋음)",
    "GB": "GB: Good bye",
    "GE": "GE: Good evening",
    "GM": "GM: Good morning",
    "HANDLE": "HANDLE: 이름 대신 쓰는 별명, 애칭",
    "HI": "HI: 웃음",
    "I": "I: TV나 전화 등에 들어가는 전파방해(Interference)",
    "LOCAL": "LOCAL: 근거리 또는 국내",
    "OM": "OM: Old Man (선배, 연장자의 존칭)",
    "OP": "OP: Operator (조작자)",
    "POWER": "POWER: 송신기 출력, 경제적 사항",
    "PSE": "PSE: Please (부탁합니다)",
    "R": "R: Roger (수신 완료)",
    "RIG": "RIG: 무전기",
    "RPT": "RPT: Report (보고)",
    "RX": "RX: Receiver (수신기)",
    "SKED": "SKED: Schedule (일정)",
    "TNX": "TNX: Thanks (감사)",
    "TKS": "TKS: Thanks (감사)",
    "TU": "TU: Thank you (감사합니다)",
    "TX": "TX: Transmitter (송신기)",
    "XYL": "XYL: 부인(아내)을 지칭",
    "YL": "YL: Young Lady (미혼 여성의 총칭)",
    "YB": "YB: Young Boy (젊은이나 학생)",
    "UR": "UR: Your (당신의)",
    "VY": "VY: Very (매우)",
    "WX": "WX: Weather (날씨)",
    "Z": "Z: GMT 국제 표준시",
    "73": "73: Best Regard (남녀 공동 작별인사)",
    "88": "88: Love & Kisses (주로 여성이 사용하는 작별인사)",
    "TRX": "TRX: Transceiver (송수신기)"
};

// 텍스트 단어를 모스 부호 문자열로 변환하여 qcodes 객체에 자동으로 집어넣는 반복문
for (const [word, meaning] of Object.entries(rawQcodesAndAbbr)) {
    let morseString = "";
    // 단어의 각 알파벳을 순회하며 모스 부호로 변환하여 이어붙임 (예: QRA -> --.-.-.-)
    for (let i = 0; i < word.length; i++) {
        const char = word[i].toUpperCase();
        if (textToMorseMap[char]) {
            morseString += textToMorseMap[char];
        }
    }
    // 변환된 모스 문자열을 키로, 뜻을 값으로 등록
    if (morseString) {
        morseData.qcodes[morseString] = meaning;
    }
}
