// ===================================================
// 8-BIT RETRO PORTFOLIO ENGINE - JAVASCRIPT
// Features: Web Audio SFX, Dynamic Projects Render, TV Typing,
// Mascot Dialogues, Trophy Modal, Client-Side Form Validation
// ===================================================

document.addEventListener("DOMContentLoaded", () => {
    // ---------------------------------------------------
    // 1. 8-BIT WEB AUDIO SYNTHESIZER
    // Generates authentic NES/Gameboy sound waves in real time
    // ---------------------------------------------------
    let audioCtx = null;
    let sfxEnabled = true;

    // Load saved sound preference
    if (localStorage.getItem("retro_sfx_enabled") !== null) {
        sfxEnabled = localStorage.getItem("retro_sfx_enabled") === "true";
    }

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
            localStorage.setItem("retro_sfx_enabled", sfxEnabled.toString());
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

    // ---------------------------------------------------
    // 2. DYNAMIC PROJECTS RENDERING (DRY PRINCIPLE)
    // Renders project cards from a structured data array
    // ---------------------------------------------------
    const projectsData = [
        {
            id: "PROJECT 01",
            title: "FLUX MULTI FILE DOWNLOADER",
            category: "MÔ HÌNH CLIENT–SERVER",
            rank: "RANK: S",
            image: "images/project_flux.jpg",
            imageAlt: "Ảnh giao diện FLUX Multi File Downloader",
            desc: "Ứng dụng tải nhiều tệp tin theo mô hình Client–Server, hỗ trợ tìm kiếm, quản lý và theo dõi tiến trình tải dữ liệu an toàn và ổn định.",
            role: "Thiết kế một số chức năng giao diện, kiểm thử và viết báo cáo đồ án.",
            tags: ["Python", "PySide6", "Socket", "TLS/SSL"]
        },
        {
            id: "PROJECT 02",
            title: "QUẢN LÝ VẬT TƯ XÂY DỰNG",
            category: "DATABASE & WAREHOUSE",
            rank: "RANK: S",
            image: "images/project_inventory.jpg",
            imageAlt: "Ảnh giao diện Quản Lý Vật Tư Xây Dựng",
            desc: "Hệ thống quản lý vật tư, kho hàng và các nghiệp vụ nhập, xuất, chuyển kho dành cho doanh nghiệp xây dựng với cơ sở dữ liệu quan hệ chặt chẽ.",
            role: "Xây dựng chức năng chuyển kho, xử lý tương tranh dữ liệu và kiểm thử hệ thống.",
            tags: ["Python", "Streamlit", "SQL Server", "Concurrency"]
        }
    ];

    function renderProjects() {
        const projectsContainer = document.getElementById("projects-container");
        if (!projectsContainer) return;

        projectsContainer.innerHTML = projectsData.map(project => `
            <div class="nes-container with-title is-rounded is-dark quest-card">
                <p class="title">${project.id}</p>
                <div>
                    <div class="quest-img-wrapper">
                        <img src="${project.image}" alt="${project.imageAlt}">
                    </div>
                    <div class="quest-header">
                        <span class="quest-rank">${project.category}</span>
                        <span class="quest-exp">${project.rank}</span>
                    </div>
                    <h3 class="quest-title">${project.title}</h3>
                    <p class="quest-desc">${project.desc}</p>
                    <div class="quest-role">
                        <strong>Vai trò:</strong> ${project.role}
                    </div>
                    <div class="quest-tags">
                        ${project.tags.map(tag => `<span class="quest-tag">${tag}</span>`).join("")}
                    </div>
                </div>
            </div>
        `).join("");
    }

    renderProjects();
    attachSoundEffects();

    // ---------------------------------------------------
    // 3. TV SCREEN TYPING EFFECT
    // ---------------------------------------------------
    const lines = document.querySelectorAll(".tv-text p, .tv-text h1, .start-btn");
    const texts = Array.from(lines, line => line.textContent.trim());

    lines.forEach(line => {
        line.textContent = "";
    });

    const startBtn = document.querySelector(".start-btn");
    if (startBtn) {
        startBtn.classList.remove("show");
    }

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    async function typingEffect() {
        await sleep(800);

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].classList.contains("start-btn")) {
                lines[i].classList.add("show");
                lines[i].textContent = texts[i];
                playCoinSound();
                continue;
            }

            for (const char of texts[i]) {
                lines[i].textContent += char;
                playTone(520, "sine", 0.02, 0.015);
                await sleep(35);
            }

            await sleep(250);
        }
    }

    typingEffect();

    if (startBtn) {
        startBtn.addEventListener("click", () => {
            playPowerUpSound();
        });
    }

    // ---------------------------------------------------
    // 4. INTERACTIVE CORNER MASCOT
    // ---------------------------------------------------
    const mascotSpriteBtn = document.getElementById("mascot-sprite-btn");
    const mascotBalloon = document.getElementById("mascot-balloon");
    const mascotText = document.getElementById("mascot-text");

    const mascotQuotes = [
        "Xin chào! Mình là trợ thủ phép thuật của Trâm (UTH IT)! ✨",
        "Trâm hiện đang theo học ngành CNTT tại Trường ĐH Giao thông Vận tải TP.HCM (Viện Đào tạo CLC) 🎓",
        "Dự án nổi bật: FLUX Multi File Downloader & Quản Lý Vật Tư Xây Dựng 💻",
        "Kỹ năng: Python, PySide6, Socket, SQL Server, HTML/CSS/JS, Git/GitHub 🛠️",
        "Sở thích của Trâm: Xem phim, chơi game và móc len! 🎮",
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

    // ---------------------------------------------------
    // 5. ACHIEVEMENTS / TROPHY MODAL
    // ---------------------------------------------------
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

    // ---------------------------------------------------
    // 6. MOBILE MENU TOGGLE
    // ---------------------------------------------------
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

    // ---------------------------------------------------
    // 7. SCROLLSPY & 2-WAY VERTICAL SCROLL DOCK
    // ---------------------------------------------------
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
            // Already at or past the last section, scroll to footer
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

    // Auto-hide scroll dock when there is NO movement / interaction
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

    // Trigger visibility on mouse movement, scrolling, or touch swipe
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

    // ---------------------------------------------------
    // 8. JAVASCRIPT CONTACT FORM VALIDATION
    // Robust client-side validation with inline field errors
    // ---------------------------------------------------
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

            // 1. Validate Name
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

            // 2. Validate Email
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

            // 3. Validate Message
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

            // Handle submission outcome
            if (isValid) {
                playPowerUpSound();

                if (formFeedback) {
                    formFeedback.innerHTML = `⚔️ <strong>QUEST ACCEPTED!</strong><br>Cảm ơn <strong>${nameVal}</strong>! Lời nhắn của bạn đã được gửi thành công đến Thạch Thị Trâm. Mình sẽ phản hồi bạn qua email <strong>${emailVal}</strong> trong thời gian sớm nhất!`;
                    formFeedback.classList.add("active");
                }

                contactForm.reset();
            } else {
                playErrorSound();
            }
        });
    }

    // ---------------------------------------------------
    // 9. RESUME / CV DOWNLOAD SIMULATION
    // ---------------------------------------------------
    const resumeBtn = document.getElementById("resume-btn");
    if (resumeBtn) {
        resumeBtn.addEventListener("click", () => {
            playCoinSound();
            alert("📄 [CV / RESUME]\n\nTính năng tải CV đang được chuẩn bị. Bạn có thể gửi email trực tiếp tới thachthitram2k6@gmail.com để nhận CV chi tiết nhé!");
        });
    }

    // ---------------------------------------------------
    // 10. TECH ARSENAL INSPECTOR INTERACTION
    // Real-time HUD readout when hovering/clicking tech icons
    // ---------------------------------------------------
    const techSlots = document.querySelectorAll(".tech-slot");
    const inspectorIcon = document.getElementById("inspector-icon");
    const inspectorName = document.getElementById("inspector-name");
    const inspectorStatus = document.getElementById("inspector-status");
    const inspectorDesc = document.getElementById("inspector-desc");

    if (techSlots.length > 0 && inspectorName && inspectorDesc) {
        techSlots.forEach(slot => {
            function activateSlot() {
                techSlots.forEach(s => s.classList.remove("is-active"));
                slot.classList.add("is-active");

                const iconBox = slot.querySelector(".tech-icon-box");
                const iconHtml = iconBox ? iconBox.innerHTML : "";
                const techName = slot.getAttribute("data-tech") || "";
                const techTag = slot.getAttribute("data-tag") || "ACTIVE";
                const techDesc = slot.getAttribute("data-desc") || "";

                if (inspectorIcon) inspectorIcon.innerHTML = iconHtml;
                if (inspectorName) inspectorName.textContent = techName;
                if (inspectorStatus) inspectorStatus.textContent = techTag;
                if (inspectorDesc) inspectorDesc.textContent = techDesc;
            }

            slot.addEventListener("mouseenter", () => {
                activateSlot();
            });

            slot.addEventListener("click", () => {
                activateSlot();
            });
        });
    }
});
