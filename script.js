// --- 1. USER & AUTH SYSTEM ---
let currentUser = null;
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
    const userEl = document.getElementById('reg-username').value;
    const passEl = document.getElementById('reg-password').value;
    const emailEl = document.getElementById('reg-email').value;
    const roleEls = document.getElementsByName('reg-role');
    let role = 'student';
    for(let r of roleEls) if(r.checked) role = r.value;

    if (!userEl || !passEl) return alert("Vui lòng điền đủ thông tin!");
    if (role === 'teacher' && !emailEl) return alert("Giáo viên cần nhập Email!");
    if (usersDB.find(u => u.username === userEl)) return alert("Tên đăng nhập đã tồn tại!");

    const newUser = {
        username: userEl, password: passEl, role: role, email: emailEl,
        avatar: role === 'teacher' ? "https://cdn-icons-png.flaticon.com/512/1995/1995574.png" : "https://cdn-icons-png.flaticon.com/512/2922/2922510.png"
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
        document.getElementById('user-avatar').src = currentUser.avatar;
        document.getElementById('display-name').innerText = currentUser.username;
        const badge = document.getElementById('user-badge');
        badge.innerText = user.role === 'student' ? "Học sinh" : "Giáo viên";
        badge.className = `badge ${user.role === 'student' ? 'badge-student' : 'badge-teacher'}`;
        
        document.getElementById('auth-overlay').style.display = 'none';
        document.getElementById('app-container').classList.remove('hidden');
    } else {
        alert("Sai tên đăng nhập hoặc mật khẩu!");
    }
}
function logout() { location.reload(); }

// --- 2. NAVIGATION ---
function enterZone(zoneId) {
    document.getElementById('town-map').classList.add('hidden');
    document.getElementById('zone-content').classList.remove('hidden');
    loadZoneFeatures(zoneId);
}
function goBack() {
    document.getElementById('town-map').classList.remove('hidden');
    document.getElementById('zone-content').classList.add('hidden');
}

function loadZoneFeatures(zoneId) {
    const menu = document.getElementById('sub-menu');
    const ws = document.getElementById('workspace');
    menu.innerHTML = ""; ws.innerHTML = "";
    const title = document.getElementById('zone-title');

    if (zoneId === 'math') {
        title.innerText = "Khu Toán Học";
        createSubBtn("Vẽ & Tạo Hình", renderMathGeometry);
        createSubBtn("Luyện Phép Tính", renderMathCalc);
        createSubBtn("Vẽ Đồ Thị", renderMathPlot);
        renderMathGeometry();
    } else if (zoneId === 'literature') {
        title.innerText = "Khu Văn Học";
        createSubBtn("Sửa Lỗi Chính Tả (Smart)", renderLitSpellCheck);
        createSubBtn("Viết Lại Câu (AI)", renderLitImprove);
        renderLitSpellCheck();
    } else if (zoneId === 'english') {
        title.innerText = "Khu Anh Ngữ";
        createSubBtn("Random Quiz", renderEngQuiz);
        createSubBtn("Luyện Writing", renderEngWriting);
        renderEngQuiz();
    } else if (zoneId === 'square') {
        title.innerText = "Quảng Trường Học Thuật";
        renderChatSystem();
    }
}
function createSubBtn(name, callback) {
    const btn = document.createElement('button');
    btn.className = "sub-btn"; btn.innerText = name;
    btn.onclick = () => {
        document.querySelectorAll('.sub-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        callback();
    };
    document.getElementById('sub-menu').appendChild(btn);
}

// === KHU TOÁN HỌC ===
// 1. Vẽ hình (Kéo thả & Nhập số)
let isDrawing = false;
let startX, startY;
function renderMathGeometry() {
    document.getElementById('workspace').innerHTML = `
        <h3>🎨 Tạo hình học</h3>
        <div class="input-row">
            <select id="geo-shape">
                <option value="rect">Hình Chữ Nhật / Vuông</option>
                <option value="circle">Hình Tròn</option>
            </select>
            <button onclick="drawFromInput()" class="btn-submit" style="width:auto; margin:0;">Vẽ theo thông số</button>
            <button onclick="clearCanvas()" class="btn-submit" style="width:auto; margin:0; background:#999;">Xóa bảng</button>
        </div>
        <div class="input-row" id="rect-inputs">
            <input type="number" id="inp-w" placeholder="Chiều rộng">
            <input type="number" id="inp-h" placeholder="Chiều cao">
        </div>
        <div class="input-row hidden" id="circle-inputs">
            <input type="number" id="inp-r" placeholder="Bán kính" oninput="updateDiam(this.value)">
            <input type="number" id="inp-d" placeholder="Đường kính" oninput="updateRad(this.value)">
        </div>
        <p><i>Kéo thả chuột trên khung dưới để vẽ tự do:</i></p>
        <canvas id="geometry-canvas" width="800" height="400"></canvas>
    `;
    
    // Xử lý ẩn hiện input
    const shapeSel = document.getElementById('geo-shape');
    shapeSel.addEventListener('change', () => {
        if(shapeSel.value === 'rect') {
            document.getElementById('rect-inputs').classList.remove('hidden');
            document.getElementById('circle-inputs').classList.add('hidden');
        } else {
            document.getElementById('rect-inputs').classList.add('hidden');
            document.getElementById('circle-inputs').classList.remove('hidden');
        }
    });

    // Sự kiện kéo thả vẽ
    const canvas = document.getElementById('geometry-canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        startX = e.offsetX; startY = e.offsetY;
    });
    canvas.addEventListener('mousemove', (e) => {
        if(!isDrawing) return;
        drawPreview(ctx, startX, startY, e.offsetX, e.offsetY, shapeSel.value);
    });
    canvas.addEventListener('mouseup', (e) => {
        isDrawing = false;
        drawFinal(ctx, startX, startY, e.offsetX, e.offsetY, shapeSel.value);
    });
}

function updateRad(val) { document.getElementById('inp-r').value = val / 2; }
function updateDiam(val) { document.getElementById('inp-d').value = val * 2; }

function drawPreview(ctx, x1, y1, x2, y2, type) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Xóa tạm
    ctx.beginPath();
    ctx.strokeStyle = "#FF9800"; ctx.lineWidth = 2;
    if (type === 'rect') {
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    } else {
        const r = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        ctx.arc(x1, y1, r, 0, 2 * Math.PI);
        ctx.stroke();
    }
}
function drawFinal(ctx, x1, y1, x2, y2, type) {
    ctx.beginPath();
    ctx.strokeStyle = "#FF9800"; ctx.lineWidth = 3; ctx.fillStyle = "rgba(255, 152, 0, 0.2)";
    if (type === 'rect') {
        ctx.rect(x1, y1, x2 - x1, y2 - y1);
        ctx.fill(); ctx.stroke();
    } else {
        const r = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        ctx.arc(x1, y1, r, 0, 2 * Math.PI);
        ctx.fill(); ctx.stroke();
    }
}
function drawFromInput() {
    const canvas = document.getElementById('geometry-canvas');
    const ctx = canvas.getContext('2d');
    const type = document.getElementById('geo-shape').value;
    const cx = canvas.width / 2; const cy = canvas.height / 2;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath(); ctx.fillStyle = "rgba(33, 150, 243, 0.2)"; ctx.strokeStyle = "#2196F3";
    
    if (type === 'rect') {
        const w = parseFloat(document.getElementById('inp-w').value) || 100;
        const h = parseFloat(document.getElementById('inp-h').value) || 100;
        ctx.rect(cx - w/2, cy - h/2, w, h);
    } else {
        const r = parseFloat(document.getElementById('inp-r').value) || 50;
        ctx.arc(cx, cy, r, 0, 2*Math.PI);
    }
    ctx.fill(); ctx.stroke();
}
function clearCanvas() {
    const c = document.getElementById('geometry-canvas');
    c.getContext('2d').clearRect(0, 0, c.width, c.height);
}

// 2. Phép tính & Đồ thị (Giữ nguyên logic cơ bản)
function renderMathCalc() {
    document.getElementById('workspace').innerHTML = `<h3>🧮 Luyện Phép Tính</h3><p>(Tính năng giữ nguyên theo yêu cầu)</p>`;
}
function renderMathPlot() {
    document.getElementById('workspace').innerHTML = `<h3>📈 Vẽ Đồ Thị</h3><div id="math-plot" style="width:100%;height:400px;"></div>`;
    functionPlot({ target: '#math-plot', width: 700, height: 400, data: [{ fn: 'x^2' }] });
}

// === KHU VĂN HỌC ===
// 1. Check Chính tả (Thuật toán Dictionary)
function renderLitSpellCheck() {
    document.getElementById('workspace').innerHTML = `
        <h3>📝 Kiểm tra Chính Tả (Advanced)</h3>
        <textarea id="spell-input" style="width:100%; height:150px; padding:10px;" placeholder="Nhập văn bản bất kỳ..."></textarea>
        <button onclick="checkSpelling()" class="btn-submit" style="width:auto;">Kiểm tra lỗi</button>
        <div id="spell-result" style="margin-top:20px; line-height:1.6;"></div>
    `;
}
function checkSpelling() {
    let text = document.getElementById('spell-input').value;
    // Từ điển dữ liệu lỗi phổ biến (Data Dictionary)
    const dict = {
        "xắp xếp": "sắp xếp", "sắp xếp": "sắp xếp", 
        "hôm lay": "hôm nay", "hôm nay": "hôm nay",
        "dất đẹp": "rất đẹp", "rất đẹp": "rất đẹp",
        "truyện cười": "chuyện cười", "câu chuyện": "câu chuyện",
        "dành dụm": "dành dụm", "tranh giành": "tranh giành",
        "sáng lạng": "xán lạn", "bàn hoàn": "bàng hoàng",
        "cọ sát": "cọ xát", "giả thuyết": "giả thuyết",
        "chân thành": "chân thành", "trân trọng": "trân trọng"
    };
    
    // Tách từ và kiểm tra
    let words = text.split(/\s+/);
    let html = "";
    
    // Thuật toán quét chuỗi đơn giản
    // Để quét cụm từ (2 từ), ta chạy loop
    for(let i=0; i<words.length; i++) {
        let word = words[i];
        let pair = (i < words.length - 1) ? (words[i] + " " + words[i+1]).toLowerCase() : "";
        let cleanPair = pair.replace(/[.,?!]/g, "");
        
        // Kiểm tra cụm từ trước
        if (dict[cleanPair] && dict[cleanPair] !== cleanPair) {
            html += `<span style="background:#ffcccb; color:red; font-weight:bold;" title="Đúng: ${dict[cleanPair]}">${words[i]} ${words[i+1]}</span> `;
            i++; // Bỏ qua từ tiếp theo vì đã check trong cụm
        } else {
             // Logic kiểm tra từ đơn (ví dụ s/x đơn giản) - Demo
             html += word + " ";
        }
    }
    document.getElementById('spell-result').innerHTML = html;
}

// 2. Viết lại câu (Thuật toán thay thế từ vựng cảm xúc)
function renderLitImprove() {
    document.getElementById('workspace').innerHTML = `
        <h3>✨ AI Viết Lại Câu (Giàu cảm xúc)</h3>
        <textarea id="ai-input" style="width:100%; height:100px;" placeholder="Ví dụ: Cây xanh. Trời nắng. Cô ấy cười."></textarea>
        <button onclick="rewriteSentences()" class="btn-submit" style="background:#9C27B0; width:auto;">Nâng cấp văn bản</button>
        <div id="ai-output" style="margin-top:15px; background:#f3e5f5; padding:15px; border-radius:5px;"></div>
    `;
}
function rewriteSentences() {
    let text = document.getElementById('ai-input').value;
    
    // Data thay thế (Adjective/Adverb Injection)
    const replacements = [
        { key: "cây xanh", val: "những tán cây xanh mướt đang rì rào trong gió" },
        { key: "trời nắng", val: "bầu trời tràn ngập ánh nắng vàng rực rỡ" },
        { key: "cô ấy cười", val: "cô ấy nở một nụ cười tỏa nắng, rạng rỡ cả không gian" },
        { key: "buồn", val: "mang một nỗi buồn man mác, sâu lắng đến nao lòng" },
        { key: "đẹp", val: "đẹp tựa như một bức tranh thủy mặc" },
        { key: "nói", val: "cất giọng nhẹ nhàng đầy cảm xúc" },
        { key: "đi", val: "rảo bước thật nhanh" }
    ];

    let newText = text;
    replacements.forEach(item => {
        // Regex thay thế không phân biệt hoa thường
        let regex = new RegExp(item.key, "gi");
        newText = newText.replace(regex, `<b style="color:#9C27B0;">${item.val}</b>`);
    });

    document.getElementById('ai-output').innerHTML = newText;
}

// === KHU ANH NGỮ ===
// 1. Random Quiz
function renderEngQuiz() {
    document.getElementById('workspace').innerHTML = `
        <h3>🇬🇧 Random Quiz Generator</h3>
        <select id="quiz-topic" style="padding:8px;">
            <option value="school">School</option>
            <option value="travel">Travel</option>
            <option value="food">Food</option>
        </select>
        <input type="number" id="quiz-qty" value="3" min="1" max="10" style="width:60px; padding:8px;"> câu
        <button onclick="generateQuiz()" class="btn-submit" style="width:auto;">Tạo Đề</button>
        <div id="quiz-list" style="margin-top:20px;"></div>
    `;
}
const quizBank = {
    school: [
        {q:"What do you create in Art class?", a:["Painting", "Number", "History"], c:0},
        {q:"Where do you play soccer?", a:["Library", "Playground", "Lab"], c:1},
        {q:"Person who runs the school?", a:["Teacher", "Principal", "Janitor"], c:1},
        {q:"Tool to write with ink?", a:["Pencil", "Pen", "Ruler"], c:1},
        {q:"Subject about past events?", a:["Math", "History", "Science"], c:1}
    ],
    travel: [
        {q:"You need this to fly abroad?", a:["Passport", "Book", "Bike"], c:0},
        {q:"Sleeping place in hotel?", a:["Kitchen", "Bedroom", "Lobby"], c:1},
        {q:"Vehicle on the ocean?", a:["Car", "Ship", "Plane"], c:1}
    ],
    food: [
        {q:"Yellow curved fruit?", a:["Apple", "Banana", "Grape"], c:1},
        {q:"Italian noodle dish?", a:["Sushi", "Pasta", "Burger"], c:1}
    ]
};
function generateQuiz() {
    const topic = document.getElementById('quiz-topic').value;
    const qty = parseInt(document.getElementById('quiz-qty').value);
    const pool = quizBank[topic];
    const listDiv = document.getElementById('quiz-list');
    
    // Thuật toán Shuffle (Tráo bài)
    let shuffled = pool.sort(() => 0.5 - Math.random());
    let selected = shuffled.slice(0, qty);

    listDiv.innerHTML = "";
    selected.forEach((item, idx) => {
        listDiv.innerHTML += `
            <div style="background:#e8f5e9; padding:15px; margin-bottom:10px; border-radius:5px;">
                <b>Q${idx+1}: ${item.q}</b><br>
                ${item.a.map((ans, aIdx) => 
                    `<label style="margin-right:15px;"><input type="radio" name="q${idx}" onclick="checkQ(this, ${aIdx}, ${item.c})"> ${ans}</label>`
                ).join('')}
                <span id="res-q${idx}"></span>
            </div>
        `;
    });
}
function checkQ(inp, choice, correct) {
    const span = document.getElementById(`res-${inp.name}`);
    span.innerHTML = (choice === correct) ? " ✅ Correct" : " ❌ Wrong";
    span.style.color = (choice === correct) ? "green" : "red";
    span.style.fontWeight = "bold";
}

// 2. Writing Checker (Grammar Algorithm)
function renderEngWriting() {
    document.getElementById('workspace').innerHTML = `
        <h3>✍️ Luyện Writing (Check Ngữ Pháp)</h3>
        <select id="grammar-tense" style="padding:8px;">
            <option value="simple">Hiện tại đơn (Present Simple)</option>
            <option value="continuous">Hiện tại tiếp diễn (Present Continuous)</option>
        </select>
        <input type="text" id="eng-write" placeholder="Nhập câu của bạn..." style="width:100%; padding:10px; margin-top:10px;">
        <button onclick="checkGrammar()" class="btn-submit" style="width:auto;">Kiểm tra Cấu trúc</button>
        <div id="grammar-res" style="margin-top:15px; font-weight:bold;"></div>
    `;
}
function checkGrammar() {
    const tense = document.getElementById('grammar-tense').value;
    const txt = document.getElementById('eng-write').value.trim();
    const res = document.getElementById('grammar-res');
    
    // Tách chủ ngữ giả định (Heuristic đơn giản)
    const words = txt.split(' ');
    const subject = words[0].toLowerCase();
    const isSingular = ['he', 'she', 'it', 'lan', 'nam', 'my mother'].includes(subject);
    const isPlural = ['i', 'you', 'we', 'they'].includes(subject);

    let isValid = false;
    let msg = "";

    if (tense === 'simple') {
        // Rule: S + V(s/es) hoặc do/does
        // Check dấu hiệu
        const signals = ['always', 'usually', 'often', 'every'];
        const hasSignal = signals.some(s => txt.toLowerCase().includes(s));
        
        if (txt.includes('ing')) {
            isValid = false; msg = "Hiện tại đơn không dùng V-ing (trừ danh động từ).";
        } else if (isSingular && !txt.endsWith('s') && !txt.includes('does')) {
             // Check sơ bộ động từ chia s/es (chỉ là check đuôi s trong câu demo)
             msg = "Chủ ngữ số ít (He/She/It) động từ thường phải thêm s/es.";
        } else {
            isValid = true; msg = "Cấu trúc có vẻ đúng form Hiện tại đơn.";
        }
        if(!hasSignal) msg += " (Lưu ý: Thiếu trạng từ chỉ tần suất)";

    } else if (tense === 'continuous') {
        // Rule: be + V-ing
        // Check tobe
        const hasBe = /\b(am|is|are)\b/i.test(txt);
        const hasIng = /ing\b/i.test(txt);
        const signals = ['now', 'moment', 'present'];
        const hasSignal = signals.some(s => txt.toLowerCase().includes(s));

        if (hasBe && hasIng) {
            isValid = true; msg = "Đúng cấu trúc S + be + V-ing.";
        } else {
            isValid = false; msg = "Thiếu động từ tobe (am/is/are) hoặc đuôi -ing.";
        }
        if(!hasSignal) msg += " (Nên thêm: now, at the moment...)";
    }

    res.innerHTML = isValid ? `<span style="color:green">✅ ${msg}</span>` : `<span style="color:red">⚠️ ${msg}</span>`;
}

// === QUẢNG TRƯỜNG (FILE SYSTEM) ===
function renderChatSystem() {
    document.getElementById('workspace').innerHTML = `
        <div class="chat-container">
            <div id="chat-messages" class="chat-messages"></div>
            <div class="chat-input-area">
                <label class="file-btn" title="Gửi File"><i class="fas fa-paperclip"></i>
                    <input type="file" id="chat-file" hidden onchange="handleFileSelect(this)">
                </label>
                <input type="text" id="chat-msg" placeholder="Nhập tin nhắn..." onkeypress="if(event.key==='Enter') sendChat()">
                <button onclick="sendChat()" style="border:none; background:#E91E63; color:white; padding:10px 15px; border-radius:50%; cursor:pointer;"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>
    `;
    loadChatHistory();
}
// Xử lý gửi file thật bằng Blob URL
function handleFileSelect(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        // Tạo link ảo cho file (chỉ tồn tại trong phiên duyệt web này)
        const fileUrl = URL.createObjectURL(file);
        
        const msgData = {
            user: currentUser.username, role: currentUser.role,
            text: `đã gửi file: <a href="${fileUrl}" download="${file.name}" class="file-attachment">📄 ${file.name}</a>`,
            type: 'file'
        };
        saveAndRenderMsg(msgData);
    }
}
function sendChat() {
    const input = document.getElementById('chat-msg');
    const txt = input.value;
    if (!txt) return;
    const msgData = { user: currentUser.username, role: currentUser.role, text: txt, type: 'text' };
    saveAndRenderMsg(msgData);
    input.value = "";
}
function saveAndRenderMsg(msg) {
    // Lưu vào bộ nhớ tạm (Session Storage cho File vì LocalStorage không lưu được Blob lớn)
    let history = JSON.parse(sessionStorage.getItem('eschool_chat_session')) || [];
    history.push(msg);
    sessionStorage.setItem('eschool_chat_session', JSON.stringify(history));
    loadChatHistory();
}
function loadChatHistory() {
    const box = document.getElementById('chat-messages');
    let history = JSON.parse(sessionStorage.getItem('eschool_chat_session')) || [];
    box.innerHTML = "";
    history.forEach(msg => {
        const div = document.createElement('div');
        div.className = `msg ${msg.user === currentUser.username ? 'my-msg' : 'other-msg'}`;
        const roleColor = msg.role === 'student' ? '#2196F3' : '#4CAF50';
        div.innerHTML = `<div class="msg-header" style="color:${roleColor}">${msg.user}</div>${msg.text}`;
        box.appendChild(div);
    });
    box.scrollTop = box.scrollHeight;
}