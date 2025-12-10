let currentUserRole = null; 

// --- 1. HỆ THỐNG ĐĂNG NHẬP ---
function login(role) {
    currentUserRole = role;
    document.getElementById('login-overlay').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    
    const greeting = role === 'student' ? 'Xin chào, Công dân Học sinh!' : 'Xin chào, Cố vấn Giáo viên!';
    document.getElementById('user-greeting').innerText = greeting;
}

function logout() {
    location.reload(); 
}

function goBack() {
    document.getElementById('town-map').classList.remove('hidden');
    document.getElementById('zone-content').classList.add('hidden');
}

function enterZone(zoneId) {
    document.getElementById('town-map').classList.add('hidden');
    document.getElementById('zone-content').classList.remove('hidden');
    renderZoneContent(zoneId);
}

// --- 2. RENDER GIAO DIỆN TỪNG KHU VỰC ---
function renderZoneContent(zoneId) {
    const container = document.getElementById('tool-container');
    const title = document.getElementById('zone-title');

    if (zoneId === 'math') {
        // Giao diện Toán
        title.innerText = "Math Town - Công Cụ Đồ Thị";
        container.innerHTML = `
            <div class="input-group">
                <input type="text" id="math-formula" placeholder="Nhập hàm số (vd: x^2, sin(x))..." value="x^2">
                <button class="post-btn" onclick="drawGraph()" style="background:#ff9800;">Vẽ Đồ Thị</button>
            </div>
            <div id="math-plot"></div>
            <p><i>Mẹo: Thử nhập 'sin(x)', 'x^3', hoặc 'x*x - 4'</i></p>
        `;
        setTimeout(drawGraph, 500); 

    } else if (zoneId === 'english') {
        // Giao diện Tiếng Anh
        title.innerText = "English Spot - Mini Quiz";
        container.innerHTML = `
            <div id="quiz-box">
                <h3 id="q-text">Đang tải câu hỏi...</h3>
                <div id="q-options"></div>
                <p id="q-result" style="margin-top:10px; font-weight:bold;"></p>
                <button class="post-btn" onclick="nextQuestion()" style="background:#4caf50;">Câu tiếp theo</button>
            </div>
        `;
        loadQuestion();

    } else if (zoneId === 'literature') {
        // Giao diện Văn Học
        title.innerText = "Literature House - AI Trợ Lý Viết Văn";
        container.innerHTML = `
            <p>Nhập đoạn văn để kiểm tra lỗi chính tả:</p>
            <div class="editor-box">
                <textarea id="lit-input" placeholder="Ví dụ: Hôm lay trời dất đẹp..."></textarea>
                <button class="post-btn" onclick="analyzeText()" style="background:#2196f3;">✨ Phân tích AI</button>
            </div>
            <div id="ai-feedback"></div>
        `;
    } else {
        title.innerText = "Khu vực đang xây dựng";
        container.innerHTML = "<p>Vui lòng quay lại sau.</p>";
    }
}

// --- 3. CHỨC NĂNG TOÁN HỌC ---
function drawGraph() {
    const formula = document.getElementById('math-formula').value;
    try {
        functionPlot({
            target: '#math-plot',
            width: 800,
            height: 400,
            yAxis: { domain: [-5, 5] },
            grid: true,
            data: [{ fn: formula, color: '#ff9800' }]
        });
    } catch (e) { 
        console.error(e);
        alert("Công thức chưa đúng. Hãy thử lại!");
    }
}

// --- 4. CHỨC NĂNG TIẾNG ANH ---
const questions = [
    { q: "Từ đồng nghĩa với 'Happy'?", options: ["Sad", "Joyful", "Angry", "Tired"], ans: 1 },
    { q: "I ______ to school everyday.", options: ["go", "goes", "going", "went"], ans: 0 },
    { q: "Quá khứ của 'Eat'?", options: ["Eated", "Ate", "Eaten", "Eating"], ans: 1 }
];
let currentQ = 0;

function loadQuestion() {
    const qData = questions[currentQ];
    document.getElementById('q-text').innerText = `Câu ${currentQ + 1}: ${qData.q}`;
    const optsDiv = document.getElementById('q-options');
    optsDiv.innerHTML = "";
    document.getElementById('q-result').innerText = "";

    qData.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(index, btn);
        optsDiv.appendChild(btn);
    });
}

function checkAnswer(index, btnElement) {
    const correctIndex = questions[currentQ].ans;
    const allBtns = document.querySelectorAll('.quiz-option');
    allBtns.forEach(b => b.disabled = true);

    if (index === correctIndex) {
        btnElement.classList.add('correct');
        document.getElementById('q-result').innerText = "🎉 Chính xác!";
        document.getElementById('q-result').style.color = "green";
    } else {
        btnElement.classList.add('wrong');
        allBtns[correctIndex].classList.add('correct'); 
        document.getElementById('q-result').innerText = "❌ Sai rồi!";
        document.getElementById('q-result').style.color = "red";
    }
}

function nextQuestion() {
    currentQ++;
    if (currentQ >= questions.length) currentQ = 0; 
    loadQuestion();
}

// --- 5. CHỨC NĂNG VĂN HỌC (AI) ---
function analyzeText() {
    let text = document.getElementById('lit-input').value;
    const feedbackBox = document.getElementById('ai-feedback');
    
    if (!text.trim()) { feedbackBox.innerHTML = "Hãy nhập văn bản."; return; }

    // Luật sửa lỗi (Demo)
    const rules = [
        { wrong: /hôm lay/gi, fix: "hôm nay" },
        { wrong: /dất đẹp/gi, fix: "rất đẹp" },
        { wrong: /rất là/gi, fix: "vô cùng" },
        { wrong: /xắp xếp/gi, fix: "sắp xếp" }
    ];

    let html = text;
    let found = false;
    rules.forEach(rule => {
        if (text.match(rule.wrong)) {
            html = html.replace(rule.wrong, `<span class="highlight-error" title="Sửa thành: ${rule.fix}">${rule.wrong.source.replace(/\\/g,'')}</span>`);
            found = true;
        }
    });

    if (found) {
        feedbackBox.innerHTML = `<h4>Kết quả phân tích:</h4><p style="line-height:1.6; font-size:18px;">${html}</p><small>(Di chuột vào chữ màu đỏ để xem gợi ý sửa)</small>`;
    } else {
        feedbackBox.innerHTML = `<h4>Kết quả phân tích:</h4><p>Không tìm thấy lỗi sai cơ bản nào!</p>`;
    }
}