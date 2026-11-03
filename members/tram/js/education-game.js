(() => {
    "use strict";

    const section = document.getElementById("education");
    const list = section?.querySelector(".timeline-list");
    if (!list || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // ===== DỮ LIỆU HỌC VẤN =====
    const milestones = [...list.querySelectorAll(".timeline-item")].map(item => ({
        title: item.querySelector(".timeline-time").textContent.trim(),
        text: item.querySelector(".timeline-desc").textContent.replace(/\s+/g, " ").trim()
    }));
    if (!milestones.length) return;

    // ===== CẤU HÌNH GAME =====
    const W = 960, H = 360, GROUND = 290;
    const PLAYER_X = 150, PROP_AHEAD = 150;
    const SPEED = 3, FIRST = 450, GAP = 500, TAIL = 400, HOLD = 480, TYPE_RATE = 1.5;
    const at = k => FIRST + k * GAP;
    const END = at(milestones.length - 1) + TAIL;

    const css = getComputedStyle(document.documentElement);
    const token = (name, fallback) => css.getPropertyValue(name).trim() || fallback;
    const C = {
        night: token("--bg-darker", "#171826"), dusk: "#3a2a5e",
        ground: "#1d1f3a", soil: "#3a3d63",
        pink: token("--accent-pink", "#ffa2cb"), yellow: token("--accent-yellow", "#f7d51d"),
        blue: token("--accent-blue", "#209cee"), green: token("--accent-green", "#92cc41"),
        red: token("--accent-red", "#e76e55"), white: "#fff", ink: "#141426",
        arcade: token("--font-arcade", "sans-serif")
    };

    // ===== TẠO GIAO DIỆN =====
    const el = (tag, className, parent) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        parent?.appendChild(node);
        return node;
    };

    const stage = el("div", "edu-stage");
    const scene = el("div", "edu-scene", stage);
    const canvas = el("canvas", "edu-canvas", scene);
    canvas.width = W;
    canvas.height = H;
    canvas.setAttribute("aria-hidden", "true");

    // Nút bắt đầu nằm chính giữa game
    const startOverlay = el("div", "edu-start-overlay", scene);
    const startBtn = el("button", "nes-btn is-warning edu-start", startOverlay);
    startBtn.type = "button";
    startBtn.textContent = "🎮 XEM HÀNH TRÌNH";

    // Hộp thoại học vấn
    const dialog = el("div", "nes-container is-dark is-rounded edu-dialog", scene);
    dialog.setAttribute("aria-hidden", "true");
    const dialogTitle = el("span", "timeline-time", dialog);
    const dialogText = el("p", "timeline-desc", dialog);
    const typed = el("span", "", dialogText);
    const rest = el("span", "edu-rest", dialogText);

    // Nút chọn mốc
    const nav = el("div", "edu-nav", stage);
    nav.hidden = true;

    const buttons = milestones.map((m, k) => {
        const btn = el("button", "nes-btn", nav);
        btn.type = "button";
        btn.textContent = m.title;
        btn.addEventListener("click", () => jumpTo(k));
        return btn;
    });

    const coinBox = el("span", "edu-coins", nav);
    el("i", "nes-icon coin is-small", coinBox);
    const coinCount = el("span", "", coinBox);
    coinCount.textContent = "0";

    list.before(stage);
    section.classList.add("is-game");
    const ctx = canvas.getContext("2d");

    // ===== NHÂN VẬT PIXEL =====
    const KID = ["..hhhh..", ".hhhhhhh", "..ssss..", "..sess..", "..ssss..",
                 ".bttttt.", "bbttttt.", "bbttttt.", ".bttttt.", "..pppp.."];
    const LEGS = {
        stand: ["..p..p..", "..p..p.."],
        a: [".p...p..", "pp...pp."],
        b: ["...pp...", "...pp..."]
    };
    const KID_COLORS = { h: C.pink, s: "#ffd8b0", e: C.ink, b: C.yellow, t: C.blue, p: "#3a3d8f" };
    const SHIELD = ["SSSSSSSSSS", "SYYYYYYYYS", "SYYYYYYYYS", "SYYYYYYYYS", "SYYYYYYYYS",
                    ".SYYYYYYS.", ".SYYYYYYS.", "..SYYYYS..", "...SYYS...", "....SS...."];
    const BUG = [".b...b.", "..bbb..", "bbbbbbb", "..bbb..", ".b...b."];

    const rect = (color, x, y, w, h) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); };
    const disc = (color, x, y, r) => {
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    };
    const sprite = (rows, palette, x, y, size) => rows.forEach((row, j) =>
        [...row].forEach((ch, i) => {
            if (palette[ch]) rect(palette[ch], x + i * size, y + j * size, size, size);
        })
    );

    // ===== TRẠNG THÁI GAME =====
    let x = 0, next = 0, hold = 0, tick = 0;
    let rafId = 0, lastTime = 0, shownKey = "";
    let started = false, isVisible = false;
    const collected = new Set();
    const coinsAt = [];

    for (let cx = 250; cx < END; cx += 150) {
        if (milestones.every((_, k) => Math.abs(cx - (at(k) + PROP_AHEAD)) > 100)) {
            coinsAt.push(cx);
        }
    }

    function jumpTo(k) {
        x = at(k) - 420;
        next = k;
        hold = 0;
    }

    function update(dt) {
        tick += dt;
        if (hold > 0) {
            hold -= dt;
            if (hold <= 0) next++;
            return;
        }

        x += SPEED * dt;
        if (next < milestones.length && x >= at(next)) {
            hold = HOLD;
            document.dispatchEvent(new CustomEvent("education:milestone", { detail: { index: next } }));
        } else if (next >= milestones.length && x > END) {
            x = 0;
            next = 0;
            collected.clear();
        }
    }

    // ===== VẼ TRƯỜNG UTH =====
    function drawSchool(sx) {
        rect("#e9e4ff", sx - 70, GROUND - 70, 140, 70);
        rect(C.pink, sx - 80, GROUND - 84, 160, 14);
        rect(C.pink, sx - 22, GROUND - 108, 44, 26);

        ctx.fillStyle = C.ink;
        ctx.font = `700 14px ${C.arcade}`;
        ctx.fillText("UTH", sx - 16, GROUND - 90);

        [-58, -36, 22, 44].forEach(o => rect(C.blue, sx + o, GROUND - 56, 14, 18));
        rect(C.yellow, sx - 12, GROUND - 36, 24, 36);
        rect(C.white, sx + 4, GROUND - 130, 4, 24);
        rect(C.yellow, sx + 8, GROUND - 130, 16, 10);

        [C.pink, C.yellow, C.blue].forEach((color, k) =>
            rect(color, sx + 90, GROUND - 12 * (k + 1), 40 - k * 6, 12)
        );
    }

    // ===== VẼ MÁY TÍNH =====
    function drawLaptop(sx) {
        rect(C.white, sx - 64, GROUND - 118, 128, 82);
        rect(C.ink, sx - 58, GROUND - 112, 116, 70);

        const palette = [C.pink, C.yellow, C.green, C.blue];
        const step = Math.floor(tick / 20);

        for (let r = 0; r < 6; r++) {
            rect(palette[(r + step) % 4], sx - 50 + (r % 3) * 10,
                 GROUND - 104 + r * 10, 20 + ((r * 37 + step * 13) % 50), 5);
        }

        rect(C.white, sx - 8, GROUND - 36, 16, 14);
        rect(C.white, sx - 44, GROUND - 22, 88, 10);
        ctx.fillStyle = C.yellow;
        ctx.font = `700 20px ${C.arcade}`;
        ctx.fillText("</>", sx - 18, GROUND - 128 + Math.sin(tick / 15) * 4);

        rect(C.pink, sx + 80, GROUND - 26, 16, 22);
        rect(C.pink, sx + 96, GROUND - 20, 6, 8);
    }

    // ===== VẼ BIỂU TƯỢNG BẢO MẬT =====
    function drawSecurity(sx) {
        sprite(SHIELD, { S: C.white, Y: C.blue }, sx - 44, GROUND - 104, 8);

        ctx.strokeStyle = C.green;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(sx - 22, GROUND - 60);
        ctx.lineTo(sx - 6, GROUND - 44);
        ctx.lineTo(sx + 22, GROUND - 78);
        ctx.stroke();

        const bx = sx + 80 + Math.sin(tick / 18) * 8;
        sprite(BUG, { b: C.red }, bx - 14, GROUND - 34, 4);

        ctx.strokeStyle = C.white;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(bx, GROUND - 24, 26, 0, Math.PI * 2);
        ctx.moveTo(bx + 18, GROUND - 6);
        ctx.lineTo(bx + 38, GROUND + 4);
        ctx.stroke();
    }

    const PROPS = [drawSchool, drawLaptop, drawSecurity];

    // ===== VẼ CẢNH NỀN =====
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
    sky.addColorStop(0, C.night);
    sky.addColorStop(1, C.dusk);

    function drawHill(speed, amplitude, base, color) {
        ctx.fillStyle = color;
        for (let px = 0; px < W; px += 8) {
            ctx.fillRect(px, base - amplitude * (1 + Math.sin((px + x * speed) / 110)), 8, H);
        }
    }

    function drawBackdrop() {
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, W, H);

        // Sao
        for (let n = 0; n < 45; n++) {
            if ((tick / 30 + n) % 3 < 2) {
                rect("#ffffff88", (n * 97) % W, (n * 53) % 170, 3, 3);
            }
        }

        // Trăng
        disc("#fff3b0", 850, 70, 28);
        disc(C.dusk, 862, 62, 24);

        // Thành phố
        for (let n = 0; n < 17; n++) {
            const bx = ((n * 70 - x * 0.15) % 1190 + 1190) % 1190 - 70;
            const h = 50 + ((n * 37) % 5) * 18;

            rect("#1c1f3d", bx, GROUND - 60 - h, 56, h + 60);

            for (let wy = 0; wy < h; wy += 18) {
                for (const wx of [8, 32]) {
                    if ((n * 7 + wy + wx) % 3 === 0) {
                        rect("#f7d51d66", bx + wx, GROUND - 52 - h + wy, 8, 8);
                    }
                }
            }
        }

        drawHill(0.25, 24, GROUND - 70, "#232650");
        drawHill(0.5, 12, GROUND - 24, "#2a2d5c");

        rect(C.ground, 0, GROUND, W, H);
        rect(C.white, 0, GROUND, W, 4);

        for (let k = 0; k < 30; k++) {
            rect(C.soil, ((k * 61 - x) % W + W) % W,
                 GROUND + 18 + (k % 3) * 12, 14, 4);
        }
    }

    // ===== VẼ CÁC MỐC HỌC VẤN =====
    function drawProps(holding) {
        milestones.forEach((_, k) => {
            const sx = at(k) - x + PLAYER_X + PROP_AHEAD;
            if (sx < -200 || sx > W + 200) return;

            PROPS[k % PROPS.length](sx);

            if (holding && k === next) {
                for (let s = 0; s < 5; s++) {
                    const a = tick / 20 + s * 1.26;
                    rect(C.yellow, sx + Math.cos(a) * 100,
                         GROUND - 70 + Math.sin(a) * 60, 6, 6);
                }
            }
        });
    }

    // ===== VẼ VÀ THU THẬP XU =====
    function drawCoins() {
        coinsAt.forEach((wx, k) => {
            const sx = wx - x + PLAYER_X;

            if (sx < PLAYER_X + 30 && sx > PLAYER_X - 20 && !collected.has(k)) {
                collected.add(k);
                coinCount.textContent = String(collected.size);
            }

            if (collected.has(k) || sx < -20 || sx > W + 20) return;

            const w = 4 + Math.abs(Math.cos(tick / 10 + k)) * 10;
            const y = GROUND - 95 - (k % 3) * 22;
            rect(C.yellow, sx - w / 2, y, w, 20);
            rect("#a8860a", sx - w / 2, y, 2, 20);
        });
    }

    // ===== VẼ NHÂN VẬT =====
    function drawPlayer(holding) {
        const legs = holding ? LEGS.stand : (tick % 24 < 12 ? LEGS.a : LEGS.b);
        const bob = holding || tick % 24 < 12 ? 0 : -2;
        rect("#00000066", PLAYER_X + 2, GROUND - 2, 38, 4);
        sprite([...KID, ...legs], KID_COLORS, PLAYER_X, GROUND - 60 + bob, 5);
    }

    // ===== HỘP THOẠI HỌC VẤN =====
    function syncUI(holding) {
        const key = holding ? `${next}:${Math.floor((HOLD - hold) / TYPE_RATE)}` : "idle";
        if (key === shownKey) return;
        shownKey = key;

        dialog.classList.toggle("is-open", holding);
        buttons.forEach((btn, k) =>
            btn.classList.toggle("is-warning", holding && k === next)
        );

        if (!holding) return;

        const m = milestones[next];
        const n = Math.floor((HOLD - hold) / TYPE_RATE);

        dialogTitle.textContent = m.title;
        typed.textContent = m.text.slice(0, n);
        rest.textContent = m.text.slice(n);
    }

    // ===== VÒNG LẶP GAME =====
    function frame(now) {
        const dt = Math.min((now - lastTime) / 16.667, 3);
        lastTime = now;
        update(dt);

        const holding = hold > 0;
        drawBackdrop();
        drawProps(holding);
        drawCoins();
        drawPlayer(holding);
        syncUI(holding);

        rafId = requestAnimationFrame(frame);
    }

    const start = () => {
        if (!rafId) {
            lastTime = performance.now();
            rafId = requestAnimationFrame(frame);
        }
    };

    const stop = () => {
        cancelAnimationFrame(rafId);
        rafId = 0;
    };

    // ===== MÀN HÌNH BAN ĐẦU =====
    drawBackdrop();
    drawProps(false);
    drawCoins();
    drawPlayer(true);

    // ===== NÚT XEM HÀNH TRÌNH =====
    startBtn.addEventListener("click", () => {
        started = true;
        startOverlay.remove();
        nav.hidden = false;
        if (isVisible) start();
    });

    // ===== CHỈ CHẠY KHI GAME HIỂN THỊ =====
    if ("IntersectionObserver" in window) {
        new IntersectionObserver(([entry]) => {
            isVisible = entry.isIntersecting;
            if (started && isVisible) start();
            else stop();
        }, { threshold: 0.05 }).observe(stage);
    } else {
        isVisible = true;
    }
})();
