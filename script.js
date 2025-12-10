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
        createSubBtn("Sửa Lỗi Chính Tả (Spell Check)", renderLitSpellCheck);
        createSubBtn("Viết Lại Câu (AI Style Transfer)", renderLitImprove);
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

// =========================================================
// === KHU TOÁN HỌC (MATH TOWN) ===
// =========================================================

// --- 1. Vẽ hình (Giữ nguyên tính năng kéo thả & nhập liệu) ---
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

    const canvas = document.getElementById('geometry-canvas');
    const ctx = canvas.getContext('2d');
    canvas.addEventListener('mousedown', (e) => { isDrawing = true; startX = e.offsetX; startY = e.offsetY; });
    canvas.addEventListener('mousemove', (e) => { if(!isDrawing) return; drawPreview(ctx, startX, startY, e.offsetX, e.offsetY, shapeSel.value); });
    canvas.addEventListener('mouseup', (e) => { isDrawing = false; drawFinal(ctx, startX, startY, e.offsetX, e.offsetY, shapeSel.value); });
}

function updateRad(val) { document.getElementById('inp-r').value = val / 2; }
function updateDiam(val) { document.getElementById('inp-d').value = val * 2; }

function drawPreview(ctx, x1, y1, x2, y2, type) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); 
    ctx.beginPath(); ctx.strokeStyle = "#FF9800"; ctx.lineWidth = 2;
    if (type === 'rect') ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    else { const r = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)); ctx.arc(x1, y1, r, 0, 2 * Math.PI); ctx.stroke(); }
}
function drawFinal(ctx, x1, y1, x2, y2, type) {
    ctx.beginPath(); ctx.strokeStyle = "#FF9800"; ctx.lineWidth = 3; ctx.fillStyle = "rgba(255, 152, 0, 0.2)";
    if (type === 'rect') { ctx.rect(x1, y1, x2 - x1, y2 - y1); ctx.fill(); ctx.stroke(); }
    else { const r = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)); ctx.arc(x1, y1, r, 0, 2 * Math.PI); ctx.fill(); ctx.stroke(); }
}
function drawFromInput() {
    const canvas = document.getElementById('geometry-canvas'); const ctx = canvas.getContext('2d');
    const type = document.getElementById('geo-shape').value;
    const cx = canvas.width / 2; const cy = canvas.height / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.beginPath(); ctx.fillStyle = "rgba(33, 150, 243, 0.2)"; ctx.strokeStyle = "#2196F3";
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
function clearCanvas() { const c = document.getElementById('geometry-canvas'); c.getContext('2d').clearRect(0, 0, c.width, c.height); }

// --- 2. Luyện Phép Tính (Đã khôi phục đầy đủ tính năng) ---
function renderMathCalc() {
    document.getElementById('workspace').innerHTML = `
        <h3>🧮 Luyện Tập Phép Tính</h3>
        <div class="input-row">
            <select id="calc-topic" style="padding:8px;">
                <option value="basic">Cộng/Trừ/Nhân/Chia</option>
                <option value="gcd">UCLN / BCNN</option>
                <option value="frac">Phân Số</option>
                <option value="algebra">Biểu thức Đại số (Tìm x)</option>
            </select>
            <input type="number" id="calc-qty" value="5" min="1" max="20" style="width:60px; padding:8px;"> câu
            <button onclick="generateMathProblems()" class="btn-submit" style="width:auto; margin:0;">Tạo Đề</button>
        </div>
        <div id="math-questions" style="margin-top:20px;"></div>
    `;
}

function generateMathProblems() {
    const topic = document.getElementById('calc-topic').value;
    const qty = parseInt(document.getElementById('calc-qty').value);
    const container = document.getElementById('math-questions');
    container.innerHTML = "";

    for(let i=1; i<=qty; i++) {
        let diff = Math.ceil(i/3) * 10; 
        let qText = "", ans = 0;
        
        if (topic === 'basic') {
            const op = ['+','-','*'][Math.floor(Math.random()*3)];
            const a = Math.floor(Math.random() * diff) + 1;
            const b = Math.floor(Math.random() * diff) + 1;
            qText = `${a} ${op} ${b} = ?`;
            ans = eval(`${a} ${op} ${b}`);
        } else if (topic === 'gcd') {
            const a = Math.floor(Math.random() * diff) + 4;
            const b = a * (Math.floor(Math.random() * 3) + 1); 
            qText = `BCNN(${a}, ${b}) = ?`; ans = b; // Demo BCNN
        } else if (topic === 'algebra') {
            const x = Math.floor(Math.random() * 10) + 1;
            const c = Math.floor(Math.random() * 10);
            const res = x + c;
            qText = `Tìm x biết: x + ${c} = ${res}`; ans = x;
        } else {
            qText = `1/2 + 1/${i+1} (Làm tròn 2 số thập phân) = ?`; ans = (1/2 + 1/(i+1)).toFixed(2);
        }

        const div = document.createElement('div');
        div.style.marginBottom = "10px";
        div.innerHTML = `
            <span>Câu ${i}: <b>${qText}</b></span>
            <input type="text" id="ans-${i}" placeholder="Đáp án" style="width:100px; padding:5px;">
            <span id="feed-${i}" style="font-weight:bold; margin-left:10px;"></span>
        `;
        container.appendChild(div);
        div.dataset.correct = ans;
    }
    
    const btn = document.createElement('button');
    btn.innerText = "Chấm Điểm"; btn.className = "btn-submit";
    btn.onclick = () => {
        let count = 0;
        for(let i=1; i<=qty; i++) {
            const inp = document.getElementById(`ans-${i}`);
            const feed = document.getElementById(`feed-${i}`);
            const correct = inp.parentElement.dataset.correct;
            
            if(parseFloat(inp.value) === parseFloat(correct)) {
                feed.innerHTML = " ✅ Chính xác"; feed.style.color = "green"; count++;
            } else {
                feed.innerHTML = ` ❌ Sai (Đúng: ${correct})`; feed.style.color = "red";
            }
        }
        alert(`Bạn làm đúng ${count}/${qty} câu!`);
    };
    container.appendChild(btn);
}

// --- 3. Vẽ Đồ Thị (Có nhập X, Y) ---
function renderMathPlot() {
    document.getElementById('workspace').innerHTML = `
        <h3>📈 Vẽ Đồ Thị Hàm Số</h3>
        <div class="input-row">
            <input type="text" id="plot-fn" value="x^2" placeholder="Hàm số (vd: x^2, sin(x))">
        </div>
        <div class="input-row">
            <input type="number" id="x-min" placeholder="X Min" value="-5">
            <input type="number" id="x-max" placeholder="X Max" value="5">
            <input type="number" id="y-min" placeholder="Y Min" value="-5">
            <input type="number" id="y-max" placeholder="Y Max" value="5">
            <button onclick="drawGraph()" class="btn-submit" style="width:auto; margin:0;">Vẽ Đồ Thị</button>
        </div>
        <div id="math-plot" style="width:100%;height:400px; background:white; border:1px solid #ddd;"></div>
    `;
    setTimeout(drawGraph, 500);
}

function drawGraph() {
    const fn = document.getElementById('plot-fn').value;
    const xMin = parseFloat(document.getElementById('x-min').value);
    const xMax = parseFloat(document.getElementById('x-max').value);
    const yMin = parseFloat(document.getElementById('y-min').value);
    const yMax = parseFloat(document.getElementById('y-max').value);

    try {
        functionPlot({
            target: '#math-plot',
            width: 700,
            height: 400,
            yAxis: { domain: [yMin, yMax] },
            xAxis: { domain: [xMin, xMax] },
            grid: true,
            data: [{ fn: fn, color: '#FF9800' }]
        });
    } catch(e) { alert("Lỗi công thức! Hãy kiểm tra lại."); }
}


// =========================================================
// === KHU VĂN HỌC (LITERATURE HOUSE) ===
// =========================================================

// --- 1. Spell Checking (Highlight lỗi sai) ---
function renderLitSpellCheck() {
    document.getElementById('workspace').innerHTML = `
        <h3>📝 Kiểm tra Chính Tả (Vietnamese Spell Checking)</h3>
        <p><i>Hệ thống tự động phát hiện lỗi và bôi đỏ ngay khi nhập.</i></p>
        <div class="editor-container" style="position: relative;">
            <div id="spell-highlight" style="position:absolute; top:0; left:0; width:100%; height:150px; padding:10px; pointer-events:none; color:transparent; white-space:pre-wrap; overflow:auto; font-family:monospace; font-size:14px; z-index:1;"></div>
            <textarea id="spell-input" oninput="liveSpellCheck()" style="width:100%; height:150px; padding:10px; background:transparent; position:relative; z-index:2; font-family:monospace; font-size:14px;" placeholder="Nhập văn bản... (Ví dụ: xắp sếp, sáng lạng)"></textarea>
        </div>
        <div id="spell-suggestions" style="margin-top:15px; min-height:50px;"></div>
    `;
}

function liveSpellCheck() {
    const input = document.getElementById('spell-input');
    const highlight = document.getElementById('spell-highlight');
    const suggestionBox = document.getElementById('spell-suggestions');
    let text = input.value;

    // Từ điển Lỗi (Mô phỏng Dataset lớn)
    const dict = {
        "xắp xếp": "sắp xếp", "sắp sếp": "sắp xếp",
        "hôm lay": "hôm nay", 
        "dất đẹp": "rất đẹp", "rất dẹp": "rất đẹp",
        "truyện cười": "chuyện cười", "câu truyện": "câu chuyện",
        "dành dụm": "dành dụm", "tranh giành": "tranh giành", "tranh dành": "tranh giành",
        "sáng lạng": "xán lạn", "xáng lạn": "xán lạn",
        "bàn hoàn": "bàng hoàng",
        "cọ sát": "cọ xát", 
        "giả thuyết": "giả thuyết (nếu khoa học)", "giả thiết": "giả thiết (toán học)",
        "chân thành": "chân thành", "trân thành": "chân thành",
        "vô hình chung": "vô hình trung"
    };

    let html = text;
    let foundErrors = [];

    // Thuật toán quét và bôi đỏ
    for (let wrong in dict) {
        if (text.toLowerCase().includes(wrong)) {
            // Thay thế từ sai bằng span bôi đỏ (Giữ nguyên vị trí)
            const regex = new RegExp(wrong, 'gi');
            html = html.replace(regex, `<span style="background-color:#ffcccc; border-bottom:2px solid red;">$&</span>`);
            foundErrors.push(`⚠️ <b>${wrong}</b> &rarr; Đề xuất: <b style="color:green">${dict[wrong]}</b>`);
        }
    }

    // Cập nhật lớp highlight (nằm dưới textarea)
    highlight.innerHTML = html.replace(/\n/g, '<br>'); // Xử lý xuống dòng
    suggestionBox.innerHTML = foundErrors.length > 0 ? foundErrors.join('<br>') : "<span style='color:green'>✅ Chưa phát hiện lỗi chính tả.</span>";
}

// --- 2. Viết lại câu (Mô phỏng Seq2Seq / Transformer) ---
function renderLitImprove() {
    document.getElementById('workspace').innerHTML = `
        <h3>✨ AI Rewrite (Style Transfer Model)</h3>
        <p><i>Sử dụng mô hình ngôn ngữ mô phỏng (Seq2Seq Concept) để giữ nghĩa gốc nhưng tăng biểu cảm.</i></p>
        <textarea id="ai-input" style="width:100%; height:100px; padding:10px;" placeholder="Ví dụ: Cây xanh. Trời nắng. Tôi đi học."></textarea>
        <button onclick="rewriteSentencesAI()" class="btn-submit" style="background:#673AB7; width:auto;">Chuyển đổi văn phong</button>
        <div id="ai-output" style="margin-top:15px; background:#f3e5f5; padding:15px; border-radius:5px; border-left: 4px solid #673AB7;"></div>
    `;
}

function rewriteSentencesAI() {
    let text = document.getElementById('ai-input').value;
    
    // Thuật toán Attention mô phỏng (Tìm từ khóa -> Map sang ngữ cảnh -> Sinh câu mới)
    // Đây là cách "Rule-based" để giả lập output của Transformer như GPT
    
    const contextMap = [
        { keywords: ["cây", "xanh"], output: "những tán cây xanh mướt đang rì rào, đung đưa nhẹ nhàng trong gió" },
        { keywords: ["trời", "nắng"], output: "bầu trời cao vời vợi, tràn ngập ánh nắng vàng rực rỡ như rót mật" },
        { keywords: ["mưa", "buồn"], output: "cơn mưa rả rích rơi, gợi lên trong lòng một nỗi buồn man mác khó tả" },
        { keywords: ["cười", "vui"], output: "nụ cười rạng rỡ tỏa nắng, làm bừng sáng cả không gian xung quanh" },
        { keywords: ["đi học", "trường"], output: "háo hức rảo bước trên con đường quen thuộc đến trường, lòng tràn đầy niềm vui" },
        { keywords: ["mẹ", "nấu"], output: "dáng mẹ tần tảo trong bếp, chuẩn bị bữa cơm ấm áp tình yêu thương" },
        { keywords: ["đẹp"], output: "vẻ đẹp kiều diễm tựa như một bức tranh thủy mặc hữu tình" }
    ];

    // Tokenize câu (Tách câu)
    let sentences = text.split(/[.?!]/).filter(s => s.trim().length > 0);
    let resultParagraph = [];

    sentences.forEach(sent => {
        let improved = sent.trim();
        let matched = false;

        // Cơ chế "Encoder": Quét từ khóa
        for (let item of contextMap) {
            // Kiểm tra xem câu có chứa tất cả keyword của 1 context không
            let hasAllKeys = item.keywords.every(k => sent.toLowerCase().includes(k));
            if (hasAllKeys) {
                // Cơ chế "Decoder": Sinh câu mới dựa trên context
                improved = item.output; 
                matched = true;
                break; // Ưu tiên match đầu tiên
            }
        }
        
        // Nếu không match context nào, dùng cơ chế thay thế từ đơn (Back-off)
        if (!matched) {
            improved = improved.replace(/ rất /g, " vô cùng ");
            improved = improved.replace(/ thích /g, " đam mê mãnh liệt ");
            improved = improved.replace(/ nói /g, " cất giọng thổ lộ ");
        }

        // Viết hoa chữ cái đầu
        resultParagraph.push(improved.charAt(0).toUpperCase() + improved.slice(1));
    });

    document.getElementById('ai-output').innerHTML = `<b>Kết quả (Transformer Output):</b><br>${resultParagraph.join('. ')}.`;
}


// =========================================================
// === KHU ANH NGỮ (ENGLISH SPOT) ===
// =========================================================

// --- 1. Random Quiz Generator ---
function renderEngQuiz() {
    document.getElementById('workspace').innerHTML = `
        <h3>🇬🇧 Random Quiz Generator</h3>
        <select id="quiz-topic" style="padding:8px;">
            <option value="school">School (Trường học)</option>
            <option value="travel">Travel (Du lịch)</option>
            <option value="food">Food (Ẩm thực)</option>
        </select>
        <input type="number" id="quiz-qty" value="3" min="1" max="10" style="width:60px; padding:8px;"> câu
        <button onclick="generateQuiz()" class="btn-submit" style="width:auto;">Tạo Đề Ngẫu Nhiên</button>
        <div id="quiz-list" style="margin-top:20px;"></div>
    `;
}
const quizBank = {
    school: [
        {q:"What do you use to write?", a:["Pen", "Spoon", "Tree"], c:0},
        {q:"Where do you read books?", a:["Gym", "Library", "Canteen"], c:1},
        {q:"Who teaches students?", a:["Doctor", "Teacher", "Driver"], c:1},
        {q:"Subject with numbers?", a:["Math", "Art", "Music"], c:0},
        {q:"You carry books in a...?", a:["Car", "Bag", "Pocket"], c:1}
    ],
    travel: [
        {q:"Document to fly abroad?", a:["Passport", "Notebook", "Map"], c:0},
        {q:"Large boat on ocean?", a:["Car", "Ship", "Bike"], c:1},
        {q:"You stay here on holiday?", a:["School", "Hotel", "Hospital"], c:1}
    ],
    food: [
        {q:"It is yellow and curved?", a:["Apple", "Banana", "Grape"], c:1},
        {q:"Italian noodle?", a:["Sushi", "Pasta", "Rice"], c:1},
        {q:"Meal in the morning?", a:["Dinner", "Lunch", "Breakfast"], c:2}
    ]
};
function generateQuiz() {
    const topic = document.getElementById('quiz-topic').value;
    const qty = parseInt(document.getElementById('quiz-qty').value);
    const pool = quizBank[topic];
    const listDiv = document.getElementById('quiz-list');
    
    // Thuật toán Shuffle (Tráo bài ngẫu nhiên)
    let shuffled = [...pool].sort(() => 0.5 - Math.random()); // Copy mảng để không ảnh hưởng gốc
    let selected = shuffled.slice(0, qty);

    listDiv.innerHTML = "";
    selected.forEach((item, idx) => {
        listDiv.innerHTML += `
            <div style="background:#e8f5e9; padding:15px; margin-bottom:10px; border-radius:5px;">
                <b>Q${idx+1}: ${item.q}</b><br>
                ${item.a.map((ans, aIdx) => 
                    `<label style="margin-right:15px; cursor:pointer;">
                        <input type="radio" name="q${idx}" onclick="checkQ(this, ${aIdx}, ${item.c})"> ${ans}
                    </label>`
                ).join('')}
                <span id="res-q${idx}" style="font-weight:bold; margin-left:10px;"></span>
            </div>
        `;
    });
}
function checkQ(inp, choice, correct) {
    const span = document.getElementById(`res-${inp.name}`);
    span.innerHTML = (choice === correct) ? " ✅ Correct" : " ❌ Wrong";
    span.style.color = (choice === correct) ? "green" : "red";
}

// --- 2. Writing Grammar Check (Regex Engine) ---
function renderEngWriting() {
    document.getElementById('workspace').innerHTML = `
        <h3>✍️ Writing Practice (Grammar Check)</h3>
        <p>Chọn thì và viết câu để hệ thống kiểm tra cấu trúc.</p>
        <select id="grammar-tense" style="padding:8px;">
            <option value="simple">Present Simple (Hiện tại đơn)</option>
            <option value="continuous">Present Continuous (Hiện tại tiếp diễn)</option>
        </select>
        <input type="text" id="eng-write" placeholder="Ex: She always goes to school..." style="width:100%; padding:10px; margin-top:10px;">
        <button onclick="checkGrammarAdvanced()" class="btn-submit" style="width:auto;">Phân tích Cấu trúc</button>
        <div id="grammar-res" style="margin-top:15px; padding:10px; border-radius:5px; background:#f0f4f8;"></div>
    `;
}

function checkGrammarAdvanced() {
    const tense = document.getElementById('grammar-tense').value;
    const txt = document.getElementById('eng-write').value.trim();
    const res = document.getElementById('grammar-res');
    
    if(!txt) return res.innerHTML = "Vui lòng nhập câu.";

    // Phân tích sơ bộ (Heuristic)
    const lowerTxt = txt.toLowerCase();
    const words = lowerTxt.replace(/[.]/g, '').split(' ');
    const subject = words[0]; // Giả định từ đầu là chủ ngữ
    
    // Nhóm chủ ngữ
    const isSingular = ['he', 'she', 'it', 'lan', 'nam', 'the cat'].some(s => lowerTxt.startsWith(s));
    const isPlural = ['i', 'you', 'we', 'they', 'students'].some(s => lowerTxt.startsWith(s));

    let analysis = "";
    let isCorrect = false;

    if (tense === 'simple') {
        // --- CHECK HIỆN TẠI ĐƠN ---
        // Dấu hiệu nhận biết
        const signals = ['always', 'usually', 'often', 'sometimes', 'never', 'every'];
        const hasSignal = signals.some(s => lowerTxt.includes(s));
        
        // Check động từ tobe
        if(words.includes('am') || words.includes('is') || words.includes('are')) {
             analysis += "✅ Câu dùng động từ Tobe. <br>";
             isCorrect = true;
        } else {
            // Check động từ thường
            const hasDoes = lowerTxt.includes('does') || lowerTxt.includes('do');
            const endsWithS = words.some((w, i) => i > 0 && w.endsWith('s')); // Check sơ bộ

            if (isSingular) {
                if (hasDoes || endsWithS || lowerTxt.includes('has')) {
                    analysis += "✅ Chủ ngữ số ít (He/She/It) -> Động từ đã chia (s/es/does). <br>";
                    isCorrect = true;
                } else {
                    analysis += "❌ Chủ ngữ số ít -> Động từ thiếu 's/es' hoặc trợ động từ 'does'. <br>";
                }
            } else {
                analysis += "✅ Chủ ngữ số nhiều/I -> Động từ nguyên mẫu. <br>";
                isCorrect = true;
            }
        }
        
        if(lowerTxt.includes('ing') && !lowerTxt.includes('like') && !lowerTxt.includes('love')) {
            analysis += "⚠️ Cảnh báo: Hiện tại đơn thường không dùng V-ing (trừ danh động từ). <br>";
        }
        if (hasSignal) analysis += "🌟 Có dấu hiệu nhận biết (Adverb of frequency).";
        else analysis += "💡 Gợi ý: Thêm trạng từ (always, usually...) để câu rõ nghĩa hơn.";

    } else if (tense === 'continuous') {
        // --- CHECK HIỆN TẠI TIẾP DIỄN ---
        const hasBe = /\b(am|is|are)\b/.test(lowerTxt);
        const hasIng = /\w+ing\b/.test(lowerTxt);
        const signals = ['now', 'right now', 'moment', 'present', 'look', 'listen'];
        const hasSignal = signals.some(s => lowerTxt.includes(s));

        if (hasBe && hasIng) {
            analysis += "✅ Đúng cấu trúc: S + am/is/are + V-ing. <br>";
            isCorrect = true;
        } else {
            analysis += "❌ Sai cấu trúc. Cần có cả Tobe (am/is/are) VÀ V-ing. <br>";
            if(!hasBe) analysis += "&nbsp;&nbsp;- Thiếu Tobe.<br>";
            if(!hasIng) analysis += "&nbsp;&nbsp;- Thiếu V-ing.<br>";
        }

        if (hasSignal) analysis += "🌟 Có từ chỉ thời gian (now, at the moment...).";
        else analysis += "💡 Gợi ý: Thêm 'now' hoặc 'at the moment'.";
    }

    res.innerHTML = isCorrect 
        ? `<div style="color:green"><b>KẾT QUẢ: Hợp lệ</b><br>${analysis}</div>`
        : `<div style="color:red"><b>KẾT QUẢ: Cần chỉnh sửa</b><br>${analysis}</div>`;
}


// =========================================================
// === QUẢNG TRƯỜNG HỌC THUẬT (CHAT & FILE REAL) ===
// =========================================================

function renderChatSystem() {
    document.getElementById('workspace').innerHTML = `
        <div class="chat-container">
            <div id="chat-messages" class="chat-messages"></div>
            <div class="chat-input-area">
                <label class="file-btn" title="Gửi File (Word, PDF, Ảnh)">
                    <i class="fas fa-paperclip"></i>
                    <input type="file" id="chat-file" hidden onchange="handleFileSelect(this)">
                </label>
                <input type="text" id="chat-msg" placeholder="Nhập tin nhắn..." onkeypress="if(event.key==='Enter') sendChat()">
                <button onclick="sendChat()" style="border:none; background:#E91E63; color:white; padding:10px 15px; border-radius:50%; cursor:pointer;"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>
    `;
    loadChatHistory();
}

function handleFileSelect(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // Sử dụng FileReader để tạo Blob URL thật
        // (Lưu ý: Blob URL chỉ tồn tại trong phiên làm việc, muốn lâu dài cần Server thật)
        const fileUrl = URL.createObjectURL(file);
        
        // Icon theo loại file
        let icon = "📄";
        if(file.name.includes(".doc")) icon = "📝";
        if(file.name.includes(".pdf")) icon = "📕";
        if(file.name.includes(".ppt")) icon = "📊";
        if(file.name.match(/.(jpg|jpeg|png|gif)$/i)) icon = "🖼️";

        const msgData = {
            user: currentUser.username, role: currentUser.role,
            text: `đã gửi file: <a href="${fileUrl}" download="${file.name}" class="file-attachment">${icon} ${file.name}</a>`,
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
    // Lưu vào SessionStorage (Tạm thời cho phiên duyệt web)
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