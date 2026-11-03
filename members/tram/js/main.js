// JS – CÁC CHỨC NĂNG CỦA PORTFOLIO

document.addEventListener("DOMContentLoaded", () => {
    // ===== 1. ÂM THANH =====
    let audioCtx = null;
    let sfxEnabled = true;

    // Load saved sound preference
    try {
        const savedSfx = localStorage.getItem("retro_sfx_enabled");
        if (savedSfx !== null) sfxEnabled = savedSfx === "true";
    } catch (e) { /* Storage can be unavailable in private or restricted contexts. */ }

    function initAudioContext() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                audioCtx = new AudioContext();
            }
        }
        if (audioCtx && audioCtx.state === "suspended") {
            audioCtx.resume();
        }
    }
    // Play generic retro tone
    function playTone(freq, type = "square", duration = 0.08, vol = 0.1) {
        if (!sfxEnabled) return;
        try {
            initAudioContext();
            if (!audioCtx) return;

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

            gain.gain.setValueAtTime(vol, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) { 
            // Audio context not allowed or supported
        }
    }
    // Sound FX: Hover blip
    function playHoverSound() {
        playTone(660, "square", 0.04, 0.03);
    }
    // Sound FX: Button click
    function playClickSound() {
        if (!sfxEnabled) return;
        try {
            initAudioContext();
            if (!audioCtx) return;
            const now = audioCtx.currentTime;

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = "square";
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(880, now + 0.05);

            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.12);
        } catch (e) {}
    }
    // Sound FX: Power-up / Modal Fanfare
    function playPowerUpSound() {
        if (!sfxEnabled) return;
        try {
            initAudioContext();
            if (!audioCtx) return;
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            const now = audioCtx.currentTime;

            notes.forEach((freq, idx) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = "triangle";
                osc.frequency.setValueAtTime(freq, now + idx * 0.07);

                gain.gain.setValueAtTime(0.08, now + idx * 0.07);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.15);

                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now + idx * 0.07);
                osc.stop(now + idx * 0.07 + 0.15);
            });
        } catch (e) {}
    }

    // Sound FX: Coin sound
    function playCoinSound() {
        if (!sfxEnabled) return;
        try {
            initAudioContext();
            if (!audioCtx) return;
            const now = audioCtx.currentTime;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(987.77, now); // B5
            osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

            gain.gain.setValueAtTime(0.09, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.35);
        } catch (e) {}
    }
    // Sound FX: Error Buzz
    function playErrorSound() {
        playTone(220, "sawtooth", 0.18, 0.08);
    }
    // Update SFX UI
    const sfxBtn = document.getElementById("sfx-toggle");
    const sfxIcon = document.getElementById("sfx-icon");

    function updateSfxUi() {
        if (!sfxIcon) return;
        if (sfxEnabled) {
            sfxIcon.textContent = "🔊";
            sfxBtn.classList.remove("is-error");
            sfxBtn.classList.add("is-warning");
        } else {
            sfxIcon.textContent = "🔇";
            sfxBtn.classList.remove("is-warning");
            sfxBtn.classList.add("is-error");
        }
    }

    if (sfxBtn) {
        updateSfxUi();
        sfxBtn.addEventListener("click", () => {
            initAudioContext();
            sfxEnabled = !sfxEnabled;
            try {
                localStorage.setItem("retro_sfx_enabled", sfxEnabled.toString());
            } catch (e) { /* The current session can still toggle sound. */ }
            updateSfxUi();
            if (sfxEnabled) playCoinSound();
        });
    }

    // Helper to bind sound effects to interactive elements
    function attachSoundEffects() {
        const interactiveElements = document.querySelectorAll("a, button, .nes-btn, .dock-btn, .nes-badge, .tech-slot, input, textarea");
        interactiveElements.forEach(el => {
            el.removeEventListener("mouseenter", playHoverSound);
            el.removeEventListener("click", playClickSound);
            el.addEventListener("mouseenter", playHoverSound);
            el.addEventListener("click", playClickSound);
        });
    }

    attachSoundEffects();
    const startBtn = document.querySelector(".start-btn");
    if (startBtn) startBtn.addEventListener("click", playPowerUpSound);

    // Text stays in HTML as a fallback when JavaScript is unavailable.
    const tvLines = Array.from(document.querySelectorAll(".tv-text p, .tv-text h1"));
    const tvTexts = tvLines.map(line => Array.from(line.textContent.trim()));
    tvLines.forEach(line => { line.textContent = ""; });

    let tvLineIndex = 0;
    let tvCharacterIndex = 0;
    function typeNextTvCharacter() {
        if (tvLineIndex >= tvLines.length) return;
        const characters = tvTexts[tvLineIndex];
        if (tvCharacterIndex < characters.length) {
            tvLines[tvLineIndex].textContent += characters[tvCharacterIndex++];
            setTimeout(typeNextTvCharacter, 40);
        } else {
            tvLineIndex++;
            tvCharacterIndex = 0;
            setTimeout(typeNextTvCharacter, 180);
        }
    }
    if (tvLines.length) setTimeout(typeNextTvCharacter, 250);

    // ===== 2. NHÂN VẬT GÓC MÀN HÌNH =====
    const mascotSpriteBtn = document.getElementById("mascot-sprite-btn");
    const mascotBalloon = document.getElementById("mascot-balloon");
    const mascotText = document.getElementById("mascot-text");

    const mascotQuotes = [
        "Xin chào! Mình là trợ thủ phép thuật của Trâm (UTH IT)! ✨",
        "Trâm hiện đang theo học ngành CNTT tại Trường ĐH Giao thông Vận tải TP.HCM (Viện Đào tạo CLC) 🎓",
        "Dự án nổi bật: FLUX Multi File Downloader & Quản Lý Vật Tư Xây Dựng 💻",
        "Kỹ năng: Python, PySide6, Socket, SQL Server, HTML/CSS/JS, Git/GitHub 🛠️",
        "Sở thích của Trâm: Xem phim, chơi game và làm đồ handmade  ! 🎮",
        "Email kết nối: thachthitram2k6@gmail.com | SĐT: 0356796802 📞",
        "Cảm ơn bạn đã ghé thăm Portfolio của Trâm! Chúc bạn một ngày thật vui vẻ! 🌟"
    ];

    let quoteIdx = 0;

    function cycleMascotQuote() {
        quoteIdx = (quoteIdx + 1) % mascotQuotes.length;
        if (mascotText) {
            mascotText.textContent = mascotQuotes[quoteIdx];
        }
        playPowerUpSound();
    }

    if (mascotSpriteBtn) {
        mascotSpriteBtn.addEventListener("click", cycleMascotQuote);
    }
    if (mascotBalloon) {
        mascotBalloon.addEventListener("click", cycleMascotQuote);
    }

    // ===== 3. HỘP THOẠI THÀNH TÍCH =====
    const trophyModal = document.getElementById("trophy-modal");
    const openTrophyBtn = document.getElementById("open-trophy-btn");
    const closeTrophyBtn = document.getElementById("close-trophy-modal");

    function openModal() {
        if (!trophyModal) return;
        trophyModal.classList.add("active");
        playPowerUpSound();
    }

    function closeModal() {
        if (!trophyModal) return;
        trophyModal.classList.remove("active");
        playClickSound();
    }

    if (openTrophyBtn) {
        openTrophyBtn.addEventListener("click", openModal);
    }
    if (closeTrophyBtn) {
        closeTrophyBtn.addEventListener("click", closeModal);
    }
    if (trophyModal) {
        trophyModal.addEventListener("click", (e) => {
            if (e.target === trophyModal) closeModal();
        });
    }

    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && trophyModal && trophyModal.classList.contains("active")) {
            closeModal();
        }
    });

    // ===== 4. MENU ĐIỆN THOẠI =====
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const navMenu = document.getElementById("nav-menu");

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            navMenu.classList.toggle("mobile-open");
            playClickSound();
        });

        navMenu.querySelectorAll(".nav-link").forEach(link => {
            link.addEventListener("click", () => {
                navMenu.classList.remove("mobile-open");
            });
        });

        document.addEventListener("click", (e) => {
            if (navMenu.classList.contains("mobile-open") && !navMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                navMenu.classList.remove("mobile-open");
            }
        });
    }

    // ===== 5. NÚT CUỘN TRANG VÀ MENU ĐANG CHỌN =====
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-link");
    const scrollDock = document.getElementById("scroll-dock");
    const dockBtnUp = document.getElementById("dock-btn-up");
    const dockBtnDown = document.getElementById("dock-btn-down");
    const footerTopBtn = document.querySelector(".back-to-top");

    function scrollToHeader(e) {
        if (e) e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
        playCoinSound();
    }

    function scrollToNextSection(e) {
        if (e) e.preventDefault();
        const headerHeight = window.innerWidth <= 576 ? 66 : 76;
        const currentScroll = window.scrollY + headerHeight + 30;

        const sectionElements = Array.from(document.querySelectorAll("section[id]"));
        const nextSection = sectionElements.find(sec => sec.offsetTop > currentScroll);

        if (nextSection) {
            window.scrollTo({
                top: nextSection.offsetTop - headerHeight,
                behavior: "smooth"
            });
            playClickSound();
        } else {
            window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: "smooth"
            });
            playClickSound();
        }
    }

    if (dockBtnUp) {
        dockBtnUp.addEventListener("click", scrollToHeader);
    }

    if (dockBtnDown) {
        dockBtnDown.addEventListener("click", scrollToNextSection);
    }

    if (footerTopBtn) {
        footerTopBtn.addEventListener("click", scrollToHeader);
    }

    let dockHideTimer = null;
    let isDockHovered = false;

    function triggerDockVisibility() {
        if (!scrollDock) return;
        scrollDock.classList.add("is-visible");
        clearTimeout(dockHideTimer);

        if (!isDockHovered) {
            dockHideTimer = setTimeout(() => {
                scrollDock.classList.remove("is-visible");
            }, 1800);
        }
    }

    if (scrollDock) {
        scrollDock.addEventListener("mouseenter", () => {
            isDockHovered = true;
            clearTimeout(dockHideTimer);
            scrollDock.classList.add("is-visible");
        });

        scrollDock.addEventListener("mouseleave", () => {
            isDockHovered = false;
            dockHideTimer = setTimeout(() => {
                scrollDock.classList.remove("is-visible");
            }, 1800);
        });
    }

    window.addEventListener("mousemove", triggerDockVisibility, { passive: true });
    window.addEventListener("scroll", triggerDockVisibility, { passive: true });
    window.addEventListener("touchmove", triggerDockVisibility, { passive: true });

    // Scrollspy for active nav link
    window.addEventListener("scroll", () => {
        let currentSectionId = "";
        const scrollPosition = window.scrollY + 120;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute("id");
            }
        });

        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${currentSectionId}`) {
                link.classList.add("active");
            }
        });
    });

    // ===== 6. KIỂM TRA FORM LIÊN HỆ =====
    const contactForm = document.getElementById("retro-contact-form");
    const nameInput = document.getElementById("contact-name");
    const emailInput = document.getElementById("contact-email");
    const messageInput = document.getElementById("contact-message");

    const nameError = document.getElementById("name-error");
    const emailError = document.getElementById("email-error");
    const messageError = document.getElementById("message-error");
    const formFeedback = document.getElementById("form-feedback");

    function validateEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email.trim());
    }

    function clearError(input, errorElement) {
        if (input) input.classList.remove("input-error");
        if (errorElement) {
            errorElement.textContent = "";
            errorElement.classList.remove("active");
        }
    }

    function showError(input, errorElement, message) {
        if (input) input.classList.add("input-error");
        if (errorElement) {
            errorElement.textContent = `⚠ ${message}`;
            errorElement.classList.add("active");
        }
    }

    // Real-time error clearing on input
    [nameInput, emailInput, messageInput].forEach(input => {
        if (input) {
            input.addEventListener("input", () => {
                if (input === nameInput) clearError(nameInput, nameError);
                if (input === emailInput) clearError(emailInput, emailError);
                if (input === messageInput) clearError(messageInput, messageError);
                if (formFeedback) formFeedback.classList.remove("active");
            });
        }
    });

    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();

            let isValid = true;

            const nameVal = nameInput ? nameInput.value.trim() : "";
            if (!nameVal) {
                showError(nameInput, nameError, "Vui lòng nhập họ và tên của bạn!");
                isValid = false;
            } else if (nameVal.length < 2) {
                showError(nameInput, nameError, "Họ và tên tối thiểu từ 2 ký tự trở lên!");
                isValid = false;
            } else {
                clearError(nameInput, nameError);
            }

            const emailVal = emailInput ? emailInput.value.trim() : "";
            if (!emailVal) {
                showError(emailInput, emailError, "Vui lòng nhập địa chỉ email liên hệ!");
                isValid = false;
            } else if (!validateEmail(emailVal)) {
                showError(emailInput, emailError, "Email không đúng định dạng (ví dụ: name@gmail.com)!");
                isValid = false;
            } else {
                clearError(emailInput, emailError);
            }

            const messageVal = messageInput ? messageInput.value.trim() : "";
            if (!messageVal) {
                showError(messageInput, messageError, "Vui lòng nhập nội dung tin nhắn!");
                isValid = false;
            } else if (messageVal.length < 10) {
                showError(messageInput, messageError, "Nội dung tin nhắn tối thiểu 10 ký tự!");
                isValid = false;
            } else {
                clearError(messageInput, messageError);
            }

            if (isValid) {
                playPowerUpSound();

                if (formFeedback) {
                    formFeedback.innerHTML = `⚔️ <strong>QUEST ACCEPTED!</strong><br>Cảm ơn <strong>${nameVal}</strong>! Nội dung hợp lệ! Đây là biểu mẫu minh họa, chưa được kết nối để gửi email. Bạn có thể liên hệ trực tiếp qua nút Gửi Email ở bên cạnh.`;
                    formFeedback.classList.add("active");
                }

            } else {
                playErrorSound();
            }
        });
    }

    // ===== 7. ÂM THANH MỐC HỌC VẤN =====
    document.addEventListener("education:milestone", playCoinSound);

    // ===== 8. KỸ NĂNG KHI NHẤN VÀO BIỂU TƯỢNG =====
    const techSlots = document.querySelectorAll(".tech-slot");
    const inspectorIcon = document.getElementById("inspector-icon");
    const inspectorName = document.getElementById("inspector-name");
    const inspectorDesc = document.getElementById("inspector-desc");

    function skillRating(slot) {
        const raw = (slot.getAttribute("data-level") || "").trim();
        const value = Number(raw);
        const valid = raw !== "" && Number.isFinite(value) && value >= 0 && value <= 100;
        return {
            valid,
            value: valid ? Math.round(value) : 0,
            percent: valid ? `${Math.round(value)}%` : "—%",
            label: !valid ? "Chưa tự đánh giá" : value <= 25 ? "Đang học nền tảng" :
                value <= 50 ? "Làm được chức năng đơn giản" :
                value <= 75 ? "Áp dụng được trong dự án" : "Xử lý được bài toán phức tạp"
        };
    }

    function updateSkillRating(progress, percent, level, rating) {
        if (progress) {
            progress.value = rating.value;
            progress.setAttribute("aria-valuetext", `${rating.percent} · ${rating.label}`);
            const meter = progress.closest(".skill-meter");
            if (meter) {
                meter.style.setProperty("--skill-fill", `${rating.value}%`);
                meter.setAttribute("data-rated", String(rating.valid));
            }
        }
        if (percent) percent.textContent = rating.percent;
        if (level) level.textContent = rating.label;
    }

    function updateSkillList(id, content) {
        const list = document.getElementById(id);
        if (!list) return;
        const items = (content || "[Điền nội dung]").split("|").map(item => item.trim()).filter(Boolean);
        list.replaceChildren(...items.map(text => {
            const item = document.createElement("li");
            item.textContent = text;
            return item;
        }));
    }

    if (techSlots.length > 0 && inspectorName && inspectorDesc) {
        function activateSlot(slot) {
            techSlots.forEach(other => {
                other.classList.remove("is-active");
                other.setAttribute("aria-pressed", "false");
            });
            slot.classList.add("is-active");
            slot.setAttribute("aria-pressed", "true");
            const iconBox = slot.querySelector(".tech-icon-box");
            if (inspectorIcon) inspectorIcon.innerHTML = iconBox ? iconBox.innerHTML : "";
            inspectorName.textContent = slot.getAttribute("data-tech") || "";
            const inspector = document.getElementById("tech-inspector");
            if (inspector) {
                const color = getComputedStyle(slot).getPropertyValue("--skill-color").trim();
                inspector.style.setProperty("--skill-color", color || "#92cc41");
            }
            inspectorDesc.textContent = slot.getAttribute("data-desc") || "";
            updateSkillRating(document.getElementById("inspector-progress"),
                document.getElementById("inspector-percent"), document.getElementById("inspector-level"), skillRating(slot));
            updateSkillList("inspector-known", slot.getAttribute("data-known"));
            updateSkillList("inspector-learning", slot.getAttribute("data-learning"));
            const evidence = document.getElementById("inspector-evidence");
            if (evidence) {
                const url = slot.getAttribute("data-evidence-url") || "#projects";
                evidence.setAttribute("href", /^(#[\w-]+|https?:\/\/)/i.test(url) ? url : "#projects");
                evidence.textContent = `${slot.getAttribute("data-evidence-title") || "Xem dự án"} →`;
            }
        }

        techSlots.forEach(slot => {
            updateSkillRating(slot.querySelector(".skill-progress"), slot.querySelector(".skill-percent"),
                slot.querySelector(".skill-level"), skillRating(slot));
            slot.addEventListener("click", () => activateSlot(slot));
        });
        activateSlot(Array.from(techSlots).find(slot => slot.classList.contains("is-active")) || techSlots[0]);
    }
});
