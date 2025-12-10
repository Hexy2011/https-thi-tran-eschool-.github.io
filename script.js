let currentUserRole = null; 

// --- HỆ THỐNG ĐĂNG NHẬP ---
function login(role) {
    currentUserRole = role;
    document.getElementById('login-overlay').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    
    // Cập nhật lời chào
    const greeting = role === 'student' ? 'Xin chào, Công dân Học sinh!' : 'Xin chào, Cố vấn Giáo viên!';
    document.getElementById('user-greeting').innerText = greeting;
    
    // Nếu là giáo viên, hiện công cụ giáo viên
    if (role === 'teacher') {
         // Logic hiển thị cho giáo viên (nếu cần mở rộng sau này)
    }
}

function logout() {
    location.reload(); // Tải lại trang để đăng xuất
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

// --- RENDER NỘI DUNG TỪNG KHU VỰC ---
function renderZoneContent(zoneId) {
    const container = document.getElementById('tool-container');
    const title = document.getElementById('zone-title');

    if (zoneId === 'math') {
        title.innerText = "Math Town - Công Cụ Đồ Thị";
        container.innerHTML = `
            <div class="input-group">
                <input type="text" id="math-formula" placeholder="Nhập hàm số (ví dụ: x^2, sin(x), x+1)..." value="x^2">
                <button class="post-btn" onclick="drawGraph()" style="background:#ff9800;">Vẽ Đồ Thị</button>
            </div>
            <div id="math-plot"></div>
            <p><i>Mẹo: Hãy thử nhập 'sin(x)', 'x^3', hoặc 'x*x - 4'</i></p>
        `;
        // Đợi 0.5s để thư viện tải xong rồi mới vẽ
        setTimeout(drawGraph, 500); 

    } else if (zoneId === 'english') {
        title.innerText = "English Spot - Mini Quiz";
        container.innerHTML = `
            <div id="quiz-box">
                <h3 id="q-text">Loading question...</h3>
                <div id="q-options"></div>
                <p id="q-result" style="margin-top:10px; font-weight:bold;"></p>
                <button class="post-btn" onclick="nextQuestion()" style="margin-top:10px; background:#4caf50;">Câu tiếp theo</button>
            </div>
        `;
        loadQuestion();

    } else if (zoneId === 'literature') {
        title.innerText = "Literature House - AI Trợ Lý Viết Văn";
        container.innerHTML = `
            <p>Nhập đoạn văn của bạn xuống dưới, AI sẽ giúp bạn tìm lỗi chính tả và gợi ý từ ngữ hay hơn:</p>
            <div class="editor-box">
                <textarea id="lit-input" placeholder="Ví dụ: Hôm lay trời dất đẹp, tôi rất là thích đi chơi..."></textarea>
                <button class="post-btn" onclick="analyzeText()" style="background:#2196f3; margin-top:10px;">✨ Phân tích bằng AI</button>
            </div>
            <div id="ai-feedback">Kết quả phân tích sẽ hiện ở đây...</div>
        `;
    } else {
        title.innerText = "Khu vực đang xây dựng";
        container.innerHTML = "<p>Vui lòng quay lại sau.</p>";
    }
}

// --- 1. TÍNH NĂNG TOÁN HỌC (VẼ ĐỒ THỊ) ---
function drawGraph() {
    const formula = document.getElementById('math-formula').value;
    try {
        functionPlot({
            target: '#math-plot',
            width: 800,
            height: 400,
            yAxis: { domain: [-5, 5] },
            grid: true,
            data: [{
                fn: formula,
                color: '#ff9800'
            }]
        });
    } catch (e) {
        console.error(e);
        alert("Công thức chưa đúng hoặc thư viện chưa tải xong. Hãy thử lại!");
    }
}

// --- 2. TÍNH NĂNG TIẾNG ANH (TRẮC NGHIỆM) ---
const questions = [
    { q: "Choose the synonym of 'Happy'", options: ["Sad", "Joyful", "Angry", "Tired"], ans: 1 },
    { q: "I ______ to school everyday.", options: ["go", "goes", "going", "went"], ans: 0 },
    { q: "What is the past tense of 'Eat'?", options: ["Eated", "Ate", "Eaten", "Eating"], ans: 1 }
];
let currentQ = 0;

function loadQuestion() {
    const qData = questions[currentQ];
    document.getElementById('q-text').innerText = `Question ${currentQ + 1}: ${qData.q}`;
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
        document.getElementById('q-result').innerText = "🎉 Chính xác! Bạn rất giỏi.";
        document.getElementById('q-result').style.color = "green";
    } else {
        btnElement.classList.add('wrong');
        allBtns[correctIndex].classList.add('correct'); 
        document.getElementById('q-result').innerText = "❌ Sai rồi. Hãy cố gắng nhé!";
        document.getElementById('q-result').style.color = "red";
    }
}

function nextQuestion() {
    currentQ++;
    if (currentQ >= questions.length) currentQ = 0; 
    loadQuestion();
}

// --- 3. TÍNH NĂNG VĂN HỌC (AI SIMULATION) ---
function analyzeText() {
    let text = document.getElementById('lit-input').value;
    const feedbackBox = document.getElementById('ai-feedback');
    
    if (!text.trim()) {
        feedbackBox.innerHTML = "Vui lòng nhập văn bản để phân tích.";
        return;
    }

    const spellingRules = [
        { wrong: /hôm lay/gi, fix: "hôm nay", type: "error" },
        { wrong: /dất đẹp/gi, fix: "rất đẹp", type: "error" },
        { wrong: /xắp xếp/gi, fix: "sắp xếp", type: "error" }
    ];

    const styleRules = [
        { wrong: /rất là/gi, fix: "vô cùng/thực sự", type: "suggestion" },
        { wrong: /thích/gi, fix: "yêu thích/hứng thú", type: "suggestion" },
        { wrong: /bảo là/gi, fix: "cho rằng/nhận định", type: "suggestion" }
    ];

    let html = text;
    let issuesFound = 0;

    spellingRules.forEach(rule => {
        if (text.match(rule.wrong)) {
            html = html.replace(rule.wrong, `<span class="highlight-error" title="Sửa thành: ${rule.fix}">${rule.wrong.source.replace(/\\/g,'')}</span>`);
            issuesFound++;
        }
    });

    styleRules.forEach(rule => {
        if (text.match(rule.wrong)) {
            html = html.replace(rule.wrong, `<span class="highlight-suggestion" title="Gợi ý: ${rule.fix}">${rule.wrong.source.replace(/\\/g,'')}</span>`);
            issuesFound++;
        }
    });

    if (issuesFound > 0) {
        feedbackBox.innerHTML = `<h4>🔍 Kết quả phân tích AI:</h4><p style="font-size:18px; line-height:1.6;">${html}</p><br><small>(Di chuột vào từ được tô màu để xem gợi ý)</small>`;
    } else {
        feedbackBox.innerHTML = "✅ Tuyệt vời! AI không tìm thấy lỗi nào đáng kể.";
    }
}