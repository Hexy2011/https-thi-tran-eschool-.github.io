// --- 1. HỆ THỐNG QUẢN LÝ TÀI KHOẢN (LOCALSTORAGE) ---
let currentUser = null;

// Tải danh sách user từ bộ nhớ trình duyệt (nếu chưa có thì tạo mảng rỗng)
let usersDB = JSON.parse(localStorage.getItem('eschool_users')) || [];

function switchAuthMode(mode) {
    document.getElementById('tab-login').classList.toggle('active', mode === 'login');
    document.getElementById('tab-register').classList.toggle('active', mode === 'register');
    document.getElementById('form-login').classList.toggle('hidden', mode !== 'login');
    document.getElementById('form-register').classList.toggle('hidden', mode !== 'register');
}

function toggleEmailField(isTeacher) {
    const emailInput = document.getElementById('reg-email');
    if (isTeacher) emailInput.classList.remove('hidden');
    else emailInput.classList.add('hidden');
}

function handleRegister() {
    const userEl = document.getElementById('reg-username');
    const passEl = document.getElementById('reg-password');
    const roleEls = document.getElementsByName('reg-role');
    const emailEl = document.getElementById('reg-email');

    let role = 'student';
    for(let r of roleEls) if(r.checked) role = r.value;

    if (!userEl.value || !passEl.value) {
        alert("Vui lòng điền đủ tên và mật khẩu!");
        return;
    }
    if (role === 'teacher' && !emailEl.value) {
        alert("Giáo viên bắt buộc phải có Email!");
        return;
    }

    // Kiểm tra trùng tên
    if (usersDB.find(u => u.username === userEl.value)) {
        alert("Tên đăng nhập đã tồn tại!");
        return;
    }

    // Tạo user mới
    const newUser = {
        username: userEl.value,
        password: passEl.value,
        role: role,
        email: emailEl.value || "",
        avatar: role === 'teacher' 
            ? "https://cdn-icons-png.flaticon.com/512/1995/1995574.png" 
            : "https://cdn-icons-png.flaticon.com/512/2922/2922510.png"
    };

    usersDB.push(newUser);
    localStorage.setItem('eschool_users', JSON.stringify(usersDB));
    alert("Đăng ký thành công! Hãy đăng nhập.");
    switchAuthMode('login');
}

function handleLogin() {
    const userIn = document.getElementById('login-username').value;
    const passIn = document.getElementById('login-password').value;

    const user = usersDB.find(u => u.username === userIn && u.password === passIn);

    if (user) {
        currentUser = user;
        renderUserInfo();
        document.getElementById('auth-overlay').style.display = 'none';
        document.getElementById('app-container').classList.remove('hidden');
    } else {
        alert("Sai tên đăng nhập hoặc mật khẩu!");
    }
}

function renderUserInfo() {
    document.getElementById('user-avatar').src = currentUser.avatar;
    document.getElementById('display-name').innerText = currentUser.username;
    const badge = document.getElementById('user-badge');
    
    if (currentUser.role === 'student') {
        badge.innerText = "Học sinh";
        badge.className = "badge badge-student"; // Màu xanh biển
    } else {
        badge.innerText = "Giáo viên";
        badge.className = "badge badge-teacher"; // Màu xanh lá
    }
}

function logout() {
    currentUser = null;
    location.reload();
}

// --- 2. HỆ THỐNG ĐIỀU HƯỚNG ---
function enterZone(zoneId) {
    document.getElementById('town-map').classList.add('hidden');
    document.getElementById('zone-content').classList.remove('hidden');
    loadZoneFeatures(zoneId);
}

function goBack() {
    document.getElementById('town-map').classList.remove('hidden');
    document.getElementById('zone-content').classList.add('hidden');
}

// --- 3. TÍNH NĂNG CHI TIẾT CÁC KHU VỰC ---

function loadZoneFeatures(zoneId) {
    const menu = document.getElementById('sub-menu');
    const workspace = document.getElementById('workspace');
    menu.innerHTML = "";
    workspace.innerHTML = "";
    const title = document.getElementById('zone-title');

    if (zoneId === 'math') {
        title.innerText = "Khu Toán Học";
        createSubBtn("Vẽ Hình Học", renderMathGeometry);
        createSubBtn("Luyện Phép Tính", renderMathCalc);
        renderMathGeometry(); // Mặc định vào vẽ hình

    } else if (zoneId === 'literature') {
        title.innerText = "Khu Văn Học";
        createSubBtn("Sửa Lỗi Chính Tả", renderLitSpellCheck);
        createSubBtn("Nâng Cấp Bài Văn (AI)", renderLitImprove);
        renderLitSpellCheck();

    } else if (zoneId === 'english') {
        title.innerText = "Khu Anh Ngữ";
        createSubBtn("Quiz Theo Chủ Đề", renderEngQuiz);
        createSubBtn("Luyện Writing (Thì)", renderEngWriting);
        renderEngQuiz();

    } else if (zoneId === 'square') {
        title.innerText = "Quảng Trường Học Thuật";
        renderChatSystem();
    }
}

function createSubBtn(name, callback) {
    const btn = document.createElement('button');
    btn.className = "sub-btn";
    btn.innerText = name;
    btn.onclick = () => {
        document.querySelectorAll('.sub-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        callback();
    };
    document.getElementById('sub-menu').appendChild(btn);
}

// === A. MATH FUNCTIONS ===
function renderMathGeometry() {
    const ws = document.getElementById('workspace');
    ws.innerHTML = `
        <h3>🎨 Công cụ Tạo hình & Vẽ</h3>
        <div style="margin-bottom:10px;">
            <select id="geo-shape" style="padding:5px;">
                <option value="rect">Hình Vuông/Chữ Nhật</option>
                <option value="circle">Hình Tròn</option>
            </select>
            <input type="number" id="geo-w" placeholder="Rộng / Bán kính" style="width:100px; padding:5px;">
            <input type="number" id="geo-h" placeholder="Cao (nếu là HCN)" style="width:100px; padding:5px;">
            <button onclick="drawGeometry()" class="btn-submit" style="width:auto;">Vẽ Ngay</button>
        </div>
        <canvas id="geometry-canvas" width="600" height="400"></canvas>
    `;
}

function drawGeometry() {
    const canvas = document.getElementById('geometry-canvas');
    const ctx = canvas.getContext('2d');
    const type = document.getElementById('geo-shape').value;
    const w = parseInt(document.getElementById('geo-w').value) || 50;
    const h = parseInt(document.getElementById('geo-h').value) || w;

    // Xóa cũ
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#FF9800";
    ctx.fillStyle = "rgba(255, 152, 0, 0.2)";

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    if (type === 'rect') {
        ctx.rect(centerX - w/2, centerY - h/2, w, h);
        ctx.fillText(`Kích thước: ${w} x ${h}`, centerX - w/2, centerY - h/2 - 10);
    } else {
        ctx.arc(centerX, centerY, w, 0, 2 * Math.PI);
        ctx.fillText(`Bán kính: ${w}`, centerX - w, centerY - w - 10);
    }
    ctx.fill();
    ctx.stroke();
}

function renderMathCalc() {
    const ws = document.getElementById('workspace');
    ws.innerHTML = `
        <h3>🧮 Tạo Phép Tính</h3>
        <select id="calc-topic" style="padding:8px;">
            <option value="basic">Cộng/Trừ/Nhân/Chia</option>
            <option value="gcd">Ước/Bội (UCLN, BCNN)</option>
            <option value="frac">Phân Số</option>
        </select>
        <input type="number" id="calc-qty" value="5" min="1" max="20" style="width:60px;"> câu
        <button onclick="generateMathProblems()" class="btn-submit" style="width:auto;">Tạo Đề</button>
        <div id="math-questions" style="margin-top:20px;"></div>
    `;
}

function generateMathProblems() {
    const topic = document.getElementById('calc-topic').value;
    const qty = parseInt(document.getElementById('calc-qty').value);
    const container = document.getElementById('math-questions');
    container.innerHTML = "";

    for(let i=1; i<=qty; i++) {
        // Logic giả lập tăng độ khó
        let diff = Math.ceil(i/3) * 10; 
        let qText = "", ans = 0;
        
        if (topic === 'basic') {
            const a = Math.floor(Math.random() * diff) + 1;
            const b = Math.floor(Math.random() * diff) + 1;
            qText = `${a} + ${b} = ?`; ans = a+b;
        } else if (topic === 'gcd') {
            const a = Math.floor(Math.random() * diff) + 4;
            const b = a * 2; 
            qText = `UCLN(${a}, ${b}) = ?`; ans = a; // Giả lập đơn giản
        } else {
            qText = `1/2 + 1/${i+1} (Dạng thập phân) = ?`; ans = (1/2 + 1/(i+1)).toFixed(2);
        }

        const div = document.createElement('div');
        div.style.marginBottom = "10px";
        div.innerHTML = `
            <span>Câu ${i}: <b>${qText}</b></span>
            <input type="text" id="ans-${i}" placeholder="Đáp án">
            <span id="feed-${i}"></span>
        `;
        container.appendChild(div);
        
        // Lưu đáp án vào thuộc tính
        div.dataset.correct = ans;
    }
    
    // Nút nộp bài
    const btn = document.createElement('button');
    btn.innerText = "Chấm Điểm";
    btn.className = "btn-submit";
    btn.onclick = () => {
        let count = 0;
        for(let i=1; i<=qty; i++) {
            const inp = document.getElementById(`ans-${i}`);
            const feed = document.getElementById(`feed-${i}`);
            const correct = inp.parentElement.dataset.correct;
            
            if(inp.value == correct) {
                feed.innerHTML = " ✅ Chính xác";
                feed.className = "correct";
                count++;
            } else {
                feed.innerHTML = ` ❌ Sai rồi (Đúng: ${correct})`;
                feed.className = "incorrect";
            }
        }
        alert(`Bạn làm đúng ${count}/${qty} câu!`);
    };
    container.appendChild(btn);
}

// === B. LITERATURE FUNCTIONS (AI SIMULATION) ===
function renderLitSpellCheck() {
    const ws = document.getElementById('workspace');
    ws.innerHTML = `
        <h3>📝 Kiểm tra Chính Tả</h3>
        <textarea id="lit-input" style="width:100%; height:100px;" placeholder="Nhập văn bản vào đây... Ví dụ: 'xắp sếp', 'hôm lay'"></textarea>
        <button onclick="runSpellCheck()" class="btn-submit" style="width:auto; background:#2196F3;">Kiểm tra ngay</button>
        <div id="lit-result" style="margin-top:15px;"></div>
    `;
}

function runSpellCheck() {
    let text = document.getElementById('lit-input').value;
    const dict = [
        { wrong: /xắp xếp/gi, right: "sắp xếp" },
        { wrong: /hôm lay/gi, right: "hôm nay" },
        { wrong: /truyện cười/gi, right: "chuyện cười" },
        { wrong: /dất đẹp/gi, right: "rất đẹp" }
    ];
    
    let html = text;
    let errors = 0;
    dict.forEach(rule => {
        if(text.match(rule.wrong)) {
            html = html.replace(rule.wrong, `<span style="background:#ffcccb; padding:2px; border-radius:3px; font-weight:bold;" title="Gợi ý: ${rule.right}">${rule.wrong.source.replace(/\\/g,'')}</span>`);
            errors++;
        }
    });

    document.getElementById('lit-result').innerHTML = errors > 0 
        ? `<h4>Phát hiện ${errors} lỗi sai:</h4><p>${html}</p><small>(Di chuột vào lỗi để xem sửa)</small>` 
        : "<h4 style='color:green'>Không tìm thấy lỗi chính tả phổ biến!</h4>";
}

function renderLitImprove() {
    const ws = document.getElementById('workspace');
    ws.innerHTML = `
        <h3>✨ AI Nâng Cấp Văn Bản</h3>
        <textarea id="ai-input" style="width:100%; height:100px;" placeholder="Ví dụ: 'Bầu trời đẹp. Cây xanh.'"></textarea>
        <button onclick="runAIImprove()" class="btn-submit" style="width:auto; background:#9C27B0;">Nâng Cấp Văn Phong</button>
        <div id="ai-output" style="margin-top:15px; background:#f3e5f5; padding:10px; border-radius:5px;"></div>
    `;
}

function runAIImprove() {
    let text = document.getElementById('ai-input').value;
    // AI giả lập bằng cách thêm từ ngữ miêu tả
    if (text.includes("trời đẹp")) text = text.replace("trời đẹp", "bầu trời xanh thẳm, cao vời vợi đẹp như một bức tranh");
    if (text.includes("Cây xanh")) text = text.replace("Cây xanh", "Những tán cây xanh mướt rung rinh trong gió nhẹ");
    if (text.includes("buồn")) text = text.replace("buồn", "mang một nỗi buồn man mác, sâu lắng");
    
    document.getElementById('ai-output').innerHTML = `<b>AI Đề xuất:</b><br>${text}`;
}

// === C. ENGLISH FUNCTIONS ===
function renderEngQuiz() {
    const ws = document.getElementById('workspace');
    ws.innerHTML = `
        <h3>🇬🇧 Topic Quiz</h3>
        <div style="margin-bottom:10px;">
            <button onclick="startQuiz('school')" class="sub-btn">School</button>
            <button onclick="startQuiz('sport')" class="sub-btn">Sport</button>
            <button onclick="startQuiz('movies')" class="sub-btn">Movies</button>
        </div>
        <div id="quiz-area"></div>
    `;
}

const quizData = {
    school: [
        { q: "Where do you read books?", a: ["Library", "Canteen", "Gym"], c: 0 },
        { q: "Person who teaches you?", a: ["Doctor", "Teacher", "Pilot"], c: 1 }
    ],
    sport: [
        { q: "King of sports?", a: ["Tennis", "Football", "Golf"], c: 1 },
        { q: "Sport played in water?", a: ["Swimming", "Running", "Boxing"], c: 0 }
    ],
    movies: [
        { q: "Funny movie genre?", a: ["Horror", "Comedy", "Action"], c: 1 }
    ]
};

function startQuiz(topic) {
    const area = document.getElementById('quiz-area');
    const questions = quizData[topic];
    // Ngẫu nhiên hóa (demo)
    const q = questions[Math.floor(Math.random() * questions.length)];
    
    area.innerHTML = `
        <div style="background:#e8f5e9; padding:20px; border-radius:10px;">
            <h4>Topic: ${topic.toUpperCase()}</h4>
            <p style="font-size:18px;">${q.q}</p>
            ${q.a.map((ans, idx) => 
                `<button onclick="checkQuizAns(this, ${idx}, ${q.c})" style="display:block; width:100%; margin:5px 0; padding:10px; border:1px solid #ccc; cursor:pointer;">${ans}</button>`
            ).join('')}
            <p id="quiz-res"></p>
        </div>
    `;
}

function checkQuizAns(btn, choice, correct) {
    const res = document.getElementById('quiz-res');
    if(choice === correct) {
        btn.style.background = "#c8e6c9";
        res.innerHTML = "✅ Correct! Good job.";
    } else {
        btn.style.background = "#ffcdd2";
        res.innerHTML = "❌ Wrong answer.";
    }
}

function renderEngWriting() {
    const ws = document.getElementById('workspace');
    ws.innerHTML = `
        <h3>✍️ Grammar Correction</h3>
        <select id="tense-select" style="padding:5px;">
            <option value="simple">Present Simple (Hiện tại đơn)</option>
            <option value="continuous">Present Continuous (HT Tiếp diễn)</option>
        </select>
        <input type="text" id="eng-input" placeholder="Write a sentence... (e.g., I go to school)" style="width:100%; padding:10px; margin-top:10px;">
        <button onclick="checkGrammar()" class="btn-submit" style="width:auto;">Check & Fix</button>
        <div id="eng-fix" style="margin-top:10px; font-weight:bold;"></div>
    `;
}

function checkGrammar() {
    const tense = document.getElementById('tense-select').value;
    let txt = document.getElementById('eng-input').value;
    const res = document.getElementById('eng-fix');

    if (tense === 'continuous') {
        // Kiểm tra V-ing và tobe
        if (!txt.includes("ing")) {
            res.innerHTML = `⚠️ Gợi ý sửa: Thêm 'ing'. Ví dụ: "I am going..."`;
            res.className = "incorrect";
            return;
        }
    }
    res.innerHTML = "✅ Câu có cấu trúc ổn (AI Simulation Passed).";
    res.className = "correct";
}

// === D. CHAT SYSTEM (QUẢNG TRƯỜNG) ===
function renderChatSystem() {
    const ws = document.getElementById('workspace');
    ws.innerHTML = `
        <div class="chat-container">
            <div id="chat-messages" class="chat-messages">
                <div style="text-align:center; color:#999; font-style:italic;">Chào mừng đến Quảng Trường!</div>
            </div>
            <div class="chat-input-area">
                <label class="file-btn" title="Gửi File"><i class="fas fa-paperclip"></i> <input type="file" hidden onchange="alert('Đã đính kèm file (Giả lập)')"></label>
                <input type="text" id="chat-msg" placeholder="Nhập tin nhắn..." onkeypress="if(event.key==='Enter') sendChat()">
                <button onclick="sendChat()" style="border:none; background:#E91E63; color:white; padding:10px 15px; border-radius:50%; cursor:pointer;"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>
    `;
    loadChatHistory();
}

function sendChat() {
    const input = document.getElementById('chat-msg');
    const txt = input.value;
    if (!txt) return;

    const msgData = {
        user: currentUser.username,
        role: currentUser.role,
        text: txt,
        time: new Date().toLocaleTimeString()
    };

    // Lưu vào LocalStorage
    let history = JSON.parse(localStorage.getItem('eschool_chat')) || [];
    history.push(msgData);
    localStorage.setItem('eschool_chat', JSON.stringify(history));

    input.value = "";
    loadChatHistory();
}

function loadChatHistory() {
    const box = document.getElementById('chat-messages');
    let history = JSON.parse(localStorage.getItem('eschool_chat')) || [];
    
    box.innerHTML = "";
    history.forEach(msg => {
        const div = document.createElement('div');
        div.className = `msg ${msg.user === currentUser.username ? 'my-msg' : 'other-msg'}`;
        
        // Hiện tên và chức danh
        const roleTitle = msg.role === 'student' ? 'Học sinh' : 'Giáo viên';
        const roleColor = msg.role === 'student' ? '#2196F3' : '#4CAF50';
        
        div.innerHTML = `
            <div class="msg-header" style="color:${roleColor}">${msg.user} (${roleTitle})</div>
            ${msg.text}
        `;
        box.appendChild(div);
    });
    box.scrollTop = box.scrollHeight;
}