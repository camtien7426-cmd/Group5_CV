document.addEventListener('DOMContentLoaded', () => {
    const totalQuestions = 10;
    const userAnswers = {};

    // DOM Elements
    const optionButtons = document.querySelectorAll('.option-btn');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const submitBtn = document.getElementById('submit-btn');
    const resultSection = document.getElementById('result-section');
    const resetBtn = document.getElementById('reset-btn');

    // 1. XỬ LÝ SỰ KIỆN NÚT CHỌN ĐÁP ÁN
    optionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const qNum = this.getAttribute('data-question');
            const selectedOpt = this.getAttribute('data-option');

            // Ghi nhận lựa chọn của câu hỏi tương ứng
            userAnswers[qNum] = selectedOpt;

            // Bỏ class 'selected' của các nút khác trong cùng câu hỏi
            const siblingButtons = document.querySelectorAll(`.option-btn[data-question="${qNum}"]`);
            siblingButtons.forEach(btn => btn.classList.remove('selected'));

            // Thêm class 'selected' cho nút vừa chọn
            this.classList.add('selected');

            // Cập nhật thanh tiến trình
            updateProgress();
        });
    });

    // 2. CẬP NHẬT THANH TIẾN TRÌNH
    function updateProgress() {
        const answeredCount = Object.keys(userAnswers).length;
        const percentage = Math.round((answeredCount / totalQuestions) * 100);
        
        progressFill.style.width = `${percentage}%`;
        progressText.innerText = `Đã hoàn thành: ${answeredCount}/${totalQuestions} câu`;
    }

    // 3. XỬ LÝ NỘP BÀI VÀ TÍNH THỐNG KÊ
    submitBtn.addEventListener('click', () => {
        const answeredCount = Object.keys(userAnswers).length;

        // Kiểm tra xem đã làm đủ 10 câu chưa
        if (answeredCount < totalQuestions) {
            alert(`Bạn mới trả lời ${answeredCount}/${totalQuestions} câu. Vui lòng chọn đủ 10 câu hỏi để xem kết quả nhé!`);
            return;
        }

        // Tính số lượng từng đáp án (A, B, C, D)
        const counts = { A: 0, B: 0, C: 0, D: 0 };
        Object.values(userAnswers).forEach(opt => {
            if (counts[opt] !== undefined) counts[opt]++;
        });

        // Hiển thị phần trăm lên các thanh thống kê
        ['A', 'B', 'C', 'D'].forEach(opt => {
            const percent = Math.round((counts[opt] / totalQuestions) * 100);
            document.getElementById(`val-${opt}`).innerText = `${counts[opt]}/${totalQuestions} câu (${percent}%)`;
            document.getElementById(`bar-${opt}`).style.width = `${percent}%`;
        });

        // Tìm đáp án có số lượng chọn nhiều nhất
        let dominantOption = 'A';
        let maxCount = counts.A;

        ['B', 'C', 'D'].forEach(opt => {
            if (counts[opt] > maxCount) {
                maxCount = counts[opt];
                dominantOption = opt;
            }
        });

        // Chẩn đoán tính cách dựa trên nhóm đáp án chiếm ưu thế
        const descriptions = {
            'A': `
                <p>Bạn thuộc <strong>NHÓM PHÂN TÍCH & LÝ TRÍ</strong> (Chiếm đa số lựa chọn A).</p>
                <br>
                <p>• <strong>Đặc điểm nổi bật:</strong> Bạn là người cẩn thận, nguyên tắc và luôn tiếp cận mọi vấn đề bằng sự logic. Bạn thích sự ổn định, rõ ràng và ngăn nắp trong cuộc sống.</p>
                <p>• <strong>Điểm mạnh:</strong> Khả năng tập trung cao, chú ý đến chi tiết, đáng tin cậy và luôn làm việc có kế hoạch.</p>
                <p>• <strong>Định hướng phù hợp:</strong> Lập trình viên, Kế toán, Chuyên viên phân tích dữ liệu, Nghiên cứu khoa học.</p>
            `,
            'B': `
                <p>Bạn thuộc <strong>NHÓM TÌNH CẢM & KẾT NỐI</strong> (Chiếm đa số lựa chọn B).</p>
                <br>
                <p>• <strong>Đặc điểm nổi bật:</strong> Bạn sở hữu chỉ số EQ cao, luôn biết lắng nghe và quan tâm sâu sắc đến cảm xúc của mọi người xung quanh. Bạn là "keo gắn kết" trong mọi tập thể.</p>
                <p>• <strong>Điểm mạnh:</strong> Thấu hiểu, chan hòa, kỹ năng giao tiếp tốt và có khả năng hòa giải mâu thuẫn tuyệt vời.</p>
                <p>• <strong>Định hướng phù hợp:</strong> Quản trị nhân sự, Tâm lý học, Giáo dục, Tự vấn viên, Chăm sóc khách hàng.</p>
            `,
            'C': `
                <p>Bạn thuộc <strong>NHÓM LÃNH ĐẠO & QUYẾT ĐOÁN</strong> (Chiếm đa số lựa chọn C).</p>
                <br>
                <p>• <strong>Đặc điểm nổi bật:</strong> Bạn mang tinh thần của một chiến binh: dứt khoát, tự tin và không ngại thử thách. Bạn luôn muốn hướng tới mục tiêu cao nhất và chủ động trong mọi việc.</p>
                <p>• <strong>Điểm mạnh:</strong> Tốc độ hành động nhanh, tầm nhìn tốt, bản lĩnh và có khả năng truyền cảm hứng cho người khác.</p>
                <p>• <strong>Định hướng phù hợp:</strong> Quản lý dự án, Khởi nghiệp (CEO), Marketing Manager, Chuyên viên kinh doanh.</p>
            `,
            'D': `
                <p>Bạn thuộc <strong>NHÓM SÁNG TẠO & TỰ DO</strong> (Chiếm đa số lựa chọn D).</p>
                <br>
                <p>• <strong>Đặc điểm nổi bật:</strong> Bạn là một tâm hồn tự do, giàu trí tưởng tượng và luôn sẵn sàng phá vỡ các giới hạn gò bó. Bạn nhìn thế giới qua những góc nhìn rất riêng và mới lạ.</p>
                <p>• <strong>Điểm mạnh:</strong> Tư duy vượt giới hạn (Out-of-the-box), giàu ý tưởng đột phá, linh hoạt và thích ứng nhanh với cái mới.</p>
                <p>• <strong>Định hướng phù hợp:</strong> Thiết kế UI/UX, Content Creator, Đạo diễn/Biên kịch, Kiến trúc sư, Nghệ thuật.</p>
            `
        };

        // Gán nội dung chẩn đoán
        document.getElementById('verdict-text').innerHTML = descriptions[dominantOption];

        // Mở khu vực kết quả & cuộn mượt xuống bên dưới
        resultSection.classList.remove('hidden');
        resultSection.scrollIntoView({ behavior: 'smooth' });
    });

    // 4. RESET LÀM LẠI BÀI TRẮC NGHIỆM
    resetBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
            location.reload();
        }, 400);
    });
});