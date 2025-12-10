// Biến lưu trạng thái người dùng hiện tại
let currentUserRole = null; 

// Dữ liệu mẫu (Giả lập Database)
const mockData = {
    math: "Bài tập tuần này: Vẽ đồ thị hàm số y = 2x + 1",
    english: "Quiz: Chọn từ đồng nghĩa với 'Happy'",
    literature: "Phân tích đoạn trích 'Chiếc lược ngà'"
};

// --- HỆ THỐNG TÀI KHOẢN (MÔ PHỎNG) --- 
function login(role) {
    currentUserRole = role;
    document.getElementById('login-overlay').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    
    // Cập nhật lời chào
    const greeting = role === 'student' ? 'Xin chào, Công dân Học sinh!' : 'Xin chào, Cố vấn Giáo viên!';
    document.getElementById('user-greeting').innerText = greeting;
}

function logout() {
    currentUserRole = null;
    document.getElementById('app-container').style.display = 'none';
    document.getElementById('login-overlay').style.display = 'flex';
    goBack(); // Reset về trang chủ
}

// --- ĐIỀU HƯỚNG --- [cite: 119]
function enterZone(zoneId) {
    document.getElementById('town-map').classList.add('hidden');
    document.getElementById('zone-content').classList.remove('hidden');
    
    renderZoneContent(zoneId);
}

function goBack() {
    document.getElementById('town-map').classList.remove('hidden');
    document.getElementById('zone-content').classList.add('hidden');
}

// --- RENDER NỘI DUNG THEO VAI TRÒ & KHU VỰC --- [cite: 126]
function renderZoneContent(zoneId) {
    const titleMap = {
        'math': 'Math Town - Khu Toán Học',
        'literature': 'Literature House - Khu Văn Học',
        'english': 'English Spot - Khu Anh Ngữ',
        'square': 'Quảng Trường Học Thuật',
        'club': 'Club Hub - Câu Lạc Bộ'
    };
    
    document.getElementById('zone-title').innerText = titleMap[zoneId];
    const teacherBox = document.getElementById('teacher-tools');
    const teacherActions = document.getElementById('teacher-actions');
    const studentBody = document.getElementById('zone-body');

    // Xử lý giao diện cho Giáo viên 
    if (currentUserRole === 'teacher') {
        teacherBox.classList.remove('hidden');
        if (zoneId === 'math' || zoneId === 'literature' || zoneId === 'english') {
            teacherActions.innerHTML = `
                <p>📝 <b>Giao nhiệm vụ mới:</b></p>
                <textarea placeholder="Nhập nội dung bài tập..."></textarea>
                <button class="post-btn" onclick="alert('Đã giao bài thành công lên hệ thống!')">Đăng bài</button>
                <p><i>(Giáo viên có quyền giao bài và duyệt bài tại đây)</i></p>
            `;
        } else if (zoneId === 'square') {
            teacherActions.innerHTML = `<button class="post-btn">Duyệt bài đăng của học sinh</button>`;
        }
    } else {
        teacherBox.classList.add('hidden');
    }

    // Xử lý giao diện cho Học sinh (Các tính năng chuyên sâu) [cite: 140]
    let contentHTML = '';

    if (zoneId === 'math') {
        // Tính năng: Trò chơi toán / Vẽ đồ thị [cite: 147]
        contentHTML = `
            <div style="background:white; padding:10px; border:1px solid orange;">
                <h3>🧮 Thử thách hôm nay</h3>
                <p>${mockData.math}</p>
                <button onclick="alert('Mở công cụ vẽ đồ thị...')" class="post-btn">Mở bảng vẽ tương tác</button>
            </div>
        `;
    } else if (zoneId === 'english') {
        // Tính năng: Quiz từ vựng 
        contentHTML = `
            <h3>🇬🇧 Mini Quiz: School Life</h3>
            <p>Question: Where do students borrow books?</p>
            <input type="radio" name="q1"> Canteen<br>
            <input type="radio" name="q1"> Library<br>
            <input type="radio" name="q1"> Gym<br>
            <button class="post-btn" onclick="alert('Chính xác! +10 điểm')">Nộp bài</button>
        `;
    } else if (zoneId === 'literature') {
        // Tính năng: Sửa bài viết 
        contentHTML = `
            <h3>📖 Góc Sáng Tác</h3>
            <p>Nhập đoạn văn của bạn để hệ thống kiểm tra chính tả:</p>
            <textarea placeholder="Viết đoạn văn tại đây..."></textarea>
            <button class="post-btn" onclick="alert('Đang phân tích lỗi dùng từ...')">Kiểm tra lỗi</button>
        `;
    } else if (zoneId === 'square') {
        // Tính năng: Chia sẻ bài [cite: 191]
        contentHTML = `
            <p><b>Bài viết nổi bật:</b> "Cảm nhận về nhân vật ông Sáu" - Tác giả: Lan Anh (9A)</p>
            <hr>
            <p><i>Bạn có muốn chia sẻ bài làm hay của mình không?</i></p>
            <button class="post-btn">Đăng bài lên Quảng trường</button>
        `;
    }

    studentBody.innerHTML = contentHTML;
}