document.documentElement.classList.add('js');
const rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
const S = [
  ['Lập trình Web (FastAPI / Python)', 85],
  ['Lập trình Mobile (Dart / Flutter)', 80],
  ['Cơ sở dữ liệu (PostgreSQL / SQL)', 80],
  ['Bảo mật thông tin & Hashcat', 75],
  ['Data Mining (Pandas / Scikit-learn)', 70]
];
const b=document.getElementById('bars');
b.innerHTML='<h3 class="serif" style="font-size:20px;margin-bottom:18px">Chuyên môn</h3>'+S.map(s=>`<div class="row"><div><span>${s[0]}</span><span>${s[1]}%</span></div><div class="bar"><i data-w="${s[1]}%" style="--w:${s[1]}%"></i></div></div>`).join('');
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');e.target.querySelectorAll('.bar i').forEach(i=>i.style.width=i.dataset.w);io.unobserve(e.target)}}),{threshold:.15});
document.querySelectorAll('.rv').forEach(el=>io.observe(el));
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const t=document.querySelector(a.getAttribute('href'));if(t){e.preventDefault();t.scrollIntoView({behavior:rm?'auto':'smooth'})}}));
const L=[...document.querySelectorAll('.nav a.l')];
const so=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting)L.forEach(l=>l.classList.toggle('on',l.getAttribute('href')==='#'+x.target.id))}),{rootMargin:'-45% 0px -50% 0px'});
document.querySelectorAll('section').forEach(s=>so.observe(s));
/* =====================================
   ĐOM ĐÓM BAY TỰ DO TRONG ĐÊM
   ===================================== */
(() => {
  const contact = document.querySelector("#contact");

  if (!contact || contact.querySelector(".fireflies")) return;

  const layer = document.createElement("div");
  layer.className = "fireflies";
  layer.setAttribute("aria-hidden", "true");
  contact.prepend(layer);

  const COUNT = window.innerWidth < 600 ? 12 : 22;
  const random = (min, max) => Math.random() * (max - min) + min;

  function createFirefly() {
    const fly = document.createElement("span");
    fly.className = "firefly";

    const size = random(2, 4.5);
    fly.style.setProperty("--size", `${size}px`);
    fly.style.setProperty("--glow-duration", `${random(1.8, 4.5)}s`);
    fly.style.setProperty("--glow-delay", `${random(-4, 0)}s`);

    layer.appendChild(fly);

    const bounds = () => ({
      width: layer.clientWidth,
      height: layer.clientHeight
    });

    const { width, height } = bounds();

    // Vị trí khởi đầu riêng cho từng con
    let x = random(0, Math.max(1, width));
    let y = random(0, Math.max(1, height));

    fly.style.transform = `translate(${x}px, ${y}px)`;

    // Mỗi con có quỹ đạo và tốc độ riêng
    function flyAgain() {
      const size = bounds();

      const nextX = random(0, Math.max(1, size.width));
      const nextY = random(0, Math.max(1, size.height));

      const duration = random(5000, 12000);

      const midX = x + (nextX - x) * random(0.25, 0.75)
        + random(-65, 65);
      const midY = y + (nextY - y) * random(0.25, 0.75)
        + random(-45, 45);

      const animation = fly.animate([
        {
          transform: `translate(${x}px, ${y}px)`
        },
        {
          transform: `translate(${midX}px, ${midY}px)`,
          offset: random(0.35, 0.65)
        },
        {
          transform: `translate(${nextX}px, ${nextY}px)`
        }
      ], {
        duration,
        easing: "ease-in-out",
        fill: "forwards"
      });

      animation.onfinish = () => {
        x = nextX;
        y = nextY;

        // Nghỉ ngẫu nhiên trước khi tiếp tục bay
        setTimeout(flyAgain, random(200, 1800));
      };
    }

    // Mỗi con bắt đầu vào một thời điểm khác nhau
    setTimeout(flyAgain, random(0, 4000));
  }

  for (let i = 0; i < COUNT; i++) {
    createFirefly();
  }
})();

/* Kích hoạt bật/tắt Popover Nhạc cụ khi Click (Hỗ trợ tốt trên Mobile) */
document.addEventListener('DOMContentLoaded', () => {
  const hobbyTag = document.querySelector('.hobby-tag');
  if (hobbyTag) {
    hobbyTag.addEventListener('click', (e) => {
      e.stopPropagation();
      hobbyTag.classList.toggle('active');
    });

    document.addEventListener('click', () => {
      hobbyTag.classList.remove('active');
    });
  }
});

/* Bật/tắt ô hiển thị nhạc cụ khi click/chạm */
document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.hobby-container');
  const toggleBtn = document.getElementById('hobbyToggle');
  
  if (container && toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      container.classList.toggle('active');
    });

    document.addEventListener('click', () => {
      container.classList.remove('active');
    });
  }
});