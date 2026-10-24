/* Nền động dùng chung cho mọi trang.
   Cách dùng: <canvas id="magic" data-mode="team"></canvas>
   data-mode có 3 kiểu: "team" (trang chủ), "code" (lập trình viên), "tester" (PASS / FAIL / BUG) */
(function () {
  var c = document.getElementById("magic");
  if (!c) return;
  var x = c.getContext("2d"), dpr = Math.min(devicePixelRatio || 1, 2), W, H, P = [];
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var G = "240,198,116", OK = "123,227,160", BAD = "255,106,77", LI = "196,179,214";
  var SETS = {
    team: { ratio: .28, alpha: .3, words: [["{ }", G], ["</>", G], ["0101", LI], ["( )", G], ["=>", LI], ["[ ]", G], ["if", LI]] },
    code: { ratio: .32, alpha: .32, words: [["{ }", G], ["</>", G], ["const", LI], ["return", LI], ["html", G], ["css", G], ["git", LI], ["=>", G], ["0101", LI]] },
    tester: { ratio: .6, alpha: .42, words: [["PASS", OK], ["FAIL", BAD], ["BUG", BAD], ["TC-001", G], ["TC-017", G], ["✔", OK], ["✖", BAD], ["404", BAD], ["null", LI], ["assert", LI], ["🐞", G]] }
  };
  var S = SETS[c.dataset.mode] || SETS.code;

  function build() {
    W = innerWidth; H = innerHeight; c.width = W * dpr; c.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.min(120, Math.round(W / 10)); P = [];
    for (var i = 0; i < n; i++) {
      var w = Math.random() < S.ratio ? S.words[(Math.random() * S.words.length) | 0] : null;
      P.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.6 + .4, v: Math.random() * .25 + .06, t: Math.random() * 6.28, s: Math.random() * .02 + .008, w: w });
    }
  }
  function draw() {
    x.clearRect(0, 0, W, H);
    for (var i = 0; i < P.length; i++) {
      var p = P[i]; p.t += p.s;
      var a = .35 + .65 * Math.abs(Math.sin(p.t));
      if (!reduce) { p.y -= p.v; if (p.y < -24) { p.y = H + 24; p.x = Math.random() * W; } }
      if (p.w) {
        x.globalAlpha = a * S.alpha; x.fillStyle = "rgb(" + p.w[1] + ")";
        x.font = "600 " + (13 + p.r * 5) + "px ui-monospace, Menlo, Consolas, monospace"; x.fillText(p.w[0], p.x, p.y);
      } else {
        x.globalAlpha = a * .85; x.fillStyle = "rgb(" + G + ")"; x.shadowColor = "rgb(" + G + ")"; x.shadowBlur = 8;
        x.beginPath(); x.arc(p.x, p.y, p.r, 0, 6.283); x.fill(); x.shadowBlur = 0;
      }
    }
    x.globalAlpha = 1;
    if (!reduce) requestAnimationFrame(draw);
  }
  build(); draw();
  addEventListener("resize", function () { build(); if (reduce) draw(); });

  /* Kính lúp đi theo con trỏ: chỉ chạy khi trang có <div class="lens" id="lens"> */
  var lens = document.getElementById("lens");
  if (lens && !reduce && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    var mx = -200, my = -200, lx = mx, ly = my;
    addEventListener("pointermove", function (e) { mx = e.clientX; my = e.clientY; });
    (function loop() {
      lx += (mx - lx) * .2; ly += (my - ly) * .2;
      lens.style.transform = "translate(" + (lx - 50) + "px," + (ly - 50) + "px)";
      requestAnimationFrame(loop);
    })();
  }
})();
