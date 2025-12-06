let expression = "";
let audioCtx = null;
const resultEl = document.getElementById('result');
const historyEl = document.getElementById('history');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const themeToggle = document.getElementById('theme-toggle');
const soundToggle = document.getElementById('sound-toggle');

// Load Preferences on Start
window.onload = function() {
    if (localStorage.getItem('theme') === 'light') { document.body.classList.add('light-mode'); themeToggle.checked = true; }
    if (localStorage.getItem('sound') === 'on') { soundToggle.checked = true; }
    const lastRes = localStorage.getItem('lastResult');
    if(lastRes && lastRes !== "0" && lastRes !== "Error") { resultEl.innerText = lastRes; expression = lastRes; historyEl.innerText = "Restored Session"; }
};

// Theme & Sound Logic
function toggleTheme() {
    if (themeToggle.checked) { document.body.classList.add('light-mode'); localStorage.setItem('theme', 'light'); }
    else { document.body.classList.remove('light-mode'); localStorage.setItem('theme', 'dark'); }
}
function saveSoundPref() { localStorage.setItem('sound', soundToggle.checked ? 'on' : 'off'); }

function playSound() {
    if (!soundToggle.checked) return;
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator(); const gainNode = audioCtx.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(600, audioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    osc.connect(gainNode); gainNode.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + 0.1);
}

// Display & Math Logic
function updateDisplay() {
    let displayExpr = expression
        .replace(/Math.sin\(/g, 'sin(').replace(/Math.cos\(/g, 'cos(').replace(/Math.tan\(/g, 'tan(')
        .replace(/Math.sqrt\(/g, '√(').replace(/Math.log\(/g, 'ln(').replace(/Math.exp\(/g, 'exp(')
        .replace(/Math.PI/g, 'π').replace(/Math.E/g, 'e').replace(/\*/g, '×').replace(/\//g, '÷');
    resultEl.innerText = displayExpr || "0";
    const len = resultEl.innerText.length;
    if (len > 15) resultEl.style.fontSize = "22px"; else if (len > 10) resultEl.style.fontSize = "30px"; else resultEl.style.fontSize = "40px";
}

function append(val) {
    playSound();
    if (navigator.vibrate) navigator.vibrate(20);
    const lastChar = expression.slice(-1); const operators = ['+', '-', '*', '/', '%'];
    if (expression === "" && operators.includes(val) && val !== '-') return;
    if (operators.includes(val) && operators.includes(lastChar)) { expression = expression.slice(0, -1) + val; }
    else if (val === '.') { const parts = expression.split(/[\+\-\*\/]/); const currentNum = parts[parts.length - 1]; if (!currentNum.includes('.')) expression += val; }
    else { expression += val; }
    updateDisplay();
}

function clearCalc() { playSound(); expression = ""; historyEl.innerText = ""; localStorage.removeItem('lastResult'); updateDisplay(); }

function del() { 
    playSound();
    if (expression.length > 0) { 
        if(expression.endsWith('Math.sin(') || expression.endsWith('Math.cos(') || expression.endsWith('Math.tan(') || expression.endsWith('Math.log(') || expression.endsWith('Math.exp(')) {
            expression = expression.slice(0, -9);
        } else if(expression.endsWith('Math.sqrt(')) {
            expression = expression.slice(0, -10);
        } else if(expression.endsWith('Math.PI')) {
            expression = expression.slice(0, -7);
        } else {
            expression = expression.slice(0, -1); 
        }
        updateDisplay(); 
    } 
}

function calculate() {
    playSound();
    try {
        if(expression === "") return;
        const safeChars = /^[0-9+\-*/%.()\sMath.sincosqrtloexpPIE]+$/;
        if (!safeChars.test(expression)) { throw new Error("Invalid Input"); }
        let displayExpr = resultEl.innerText; historyEl.innerText = displayExpr + " =";
        let res = eval(expression);
        if (!isFinite(res) || isNaN(res)) { resultEl.innerText = "Error"; expression = ""; }
        else { res = parseFloat(res.toFixed(8)); expression = res.toString(); resultEl.innerText = expression; localStorage.setItem('lastResult', expression); updateDisplay(); }
    } catch (err) { resultEl.innerText = "Error"; expression = ""; }
}

// Keyboard Support
document.addEventListener('keydown', function(event) {
    const key = event.key;
    if ((key >= '0' && key <= '9') || key === '.') append(key);
    else if (key === '+') append('+'); else if (key === '-') append('-'); else if (key === '*') append('*');
    else if (key === '/') { event.preventDefault(); append('/'); } else if (key === '%') append('%');
    else if (key === 'Enter' || key === '=') calculate(); else if (key === 'Backspace') del(); else if (key === 'Escape') clearCalc();
});

// UI Navigation
function openSidebar() { sidebar.classList.add('open'); overlay.classList.add('active'); }
function closeAll() {
    sidebar.classList.remove('open'); overlay.classList.remove('active');
    document.getElementById('modal-signin').classList.remove('active');
    document.getElementById('modal-settings').classList.remove('active');
}
function showToast(msg) {
    const toast = document.getElementById('toast'); toast.innerText = msg; toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function handleNav(action) {
    if (action === 'home') { 
        closeAll(); switchTab('basic'); clearCalc(); showToast('Welcome Home'); 
        window.scrollTo(0,0);
    } 
    else if (action === 'sci') { 
        closeAll(); switchTab('sci'); showToast('Scientific Mode Activated'); 
        window.scrollTo(0,0);
    }
    else if (action === 'settings') { 
        closeAll(); 
        setTimeout(() => { document.getElementById('modal-settings').classList.add('active'); overlay.classList.add('active'); }, 300); 
    }
    else if (action === 'signin') { 
        closeAll(); 
        setTimeout(() => { document.getElementById('modal-signin').classList.add('active'); overlay.classList.add('active'); }, 300); 
    }
}

function switchTab(mode) {
    const basicKeys = document.getElementById('basic-keys'); const sciKeys = document.getElementById('sci-keys');
    const tabBasic = document.getElementById('tab-basic'); const tabSci = document.getElementById('tab-sci');
    if (mode === 'basic') { basicKeys.classList.add('active'); sciKeys.classList.remove('active'); tabBasic.classList.add('active'); tabSci.classList.remove('active'); }
    else { basicKeys.classList.remove('active'); sciKeys.classList.add('active'); tabBasic.classList.remove('active'); tabSci.classList.remove('active'); }
}
