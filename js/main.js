"use strict";

/* ---------- 1. Header scroll ---------- */
const header = document.getElementById("header");
window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 60);
});

/* ---------- 2. Mobile menu ---------- */
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");
const closeMenu  = document.getElementById("closeMenu");
const overlay    = document.getElementById("overlay");
const mobLinks   = document.querySelectorAll(".mob-link");

function openNav()  { mobileMenu.classList.add("open"); overlay.classList.add("active"); document.body.style.overflow="hidden"; }
function closeNav() { mobileMenu.classList.remove("open"); overlay.classList.remove("active"); document.body.style.overflow=""; }

hamburger.addEventListener("click", openNav);
closeMenu.addEventListener("click", closeNav);
overlay.addEventListener("click", closeNav);
mobLinks.forEach(l => l.addEventListener("click", closeNav));

/* ---------- 3. Smooth scroll ---------- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", e => {
    const t = document.querySelector(a.getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - header.offsetHeight, behavior:"smooth" });
  });
});

/* ---------- 4. Reveal on scroll ---------- */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((entry, _) => {
    if (!entry.isIntersecting) return;
    const siblings = [...entry.target.parentElement.querySelectorAll(".reveal")];
    const idx = siblings.indexOf(entry.target);
    setTimeout(() => entry.target.classList.add("visible"), idx * 120);
    revealObs.unobserve(entry.target);
  });
}, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
document.querySelectorAll(".reveal").forEach(el => revealObs.observe(el));

/* ---------- 5. Counter animation ---------- */
function countUp(el, target, suffix, dur = 2000) {
  const start = performance.now();
  const step = (now) => {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(eased * target).toLocaleString() + suffix;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
let counted = false;
const statsEl = document.querySelector(".hero-stats");
if (statsEl) {
  new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !counted) {
      counted = true;
      document.querySelectorAll(".stat-item").forEach(item => {
        countUp(
          item.querySelector(".stat-num"),
          parseInt(item.dataset.count),
          item.dataset.suffix || ""
        );
      });
    }
  }, { threshold: 0.5 }).observe(statsEl);
}

/* ---------- 6. Portfolio filter ---------- */
const filterBtns  = document.querySelectorAll(".filter-btn");
const portCards   = document.querySelectorAll(".port-card");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const INIT = 8;
let curFilter = "all", showAll = false;

function applyFilter(f) {
  curFilter = f; showAll = false;
  let visible = 0;
  portCards.forEach(c => {
    const match = f === "all" || c.dataset.category === f;
    if (match) {
      visible++;
      c.style.display = visible <= INIT ? "" : "none";
    } else {
      c.style.display = "none";
    }
  });
  const total = [...portCards].filter(c => f === "all" || c.dataset.category === f).length;
  if (loadMoreBtn) {
    loadMoreBtn.style.display = total > INIT ? "inline-flex" : "none";
    loadMoreBtn.innerHTML = '더 보기 <i class="fa fa-plus"></i>';
  }
}

filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    applyFilter(btn.dataset.filter);
  });
});

if (loadMoreBtn) {
  loadMoreBtn.addEventListener("click", () => {
    if (!showAll) {
      portCards.forEach(c => {
        if (curFilter === "all" || c.dataset.category === curFilter) c.style.display = "";
      });
      showAll = true;
      loadMoreBtn.innerHTML = '접기 <i class="fa fa-minus"></i>';
    } else {
      applyFilter(curFilter);
    }
  });
}
applyFilter("all");

/* ---------- 7. Contact form ---------- */
const form    = document.getElementById("contactForm");
const formMsg = document.getElementById("formMsg");

if (form) {
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const name    = document.getElementById("name").value.trim();
    const phone   = document.getElementById("phone").value.trim();
    const email   = document.getElementById("email").value.trim();
    const service = document.getElementById("service").value;
    const message = document.getElementById("message").value.trim();
    if (!name || !phone || !message) { showMsg("필수 항목을 모두 입력해주세요.", "error"); return; }
    btn.disabled = true;
    btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> 전송 중...';
    try {
      const r = await fetch("tables/inquiries", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ name, phone, email, service, message, submitted_at: new Date().toISOString() })
      });
      if (r.ok || r.status === 201) {
        showMsg("✅ 문의가 접수되었습니다. 빠른 시일 내에 연락드리겠습니다!", "success");
        form.reset();
      } else throw new Error();
    } catch { showMsg("⚠️ 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.", "error"); }
    finally {
      btn.disabled = false;
      btn.innerHTML = '문의 보내기 <i class="fa fa-paper-plane"></i>';
    }
  });
}
function showMsg(msg, type) {
  formMsg.textContent = msg;
  formMsg.className = "form-notice " + type;
  setTimeout(() => { formMsg.textContent = ""; formMsg.className = "form-notice"; }, 6000);
}

/* ---------- 8. Top button ---------- */
const topBtn = document.getElementById("topBtn");
window.addEventListener("scroll", () => topBtn.classList.toggle("show", window.scrollY > 400));
topBtn?.addEventListener("click", () => window.scrollTo({ top:0, behavior:"smooth" }));

/* ---------- 9. Nav active state ---------- */
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll("#gnb ul li a");
new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    navLinks.forEach(l => l.style.color = "");
    const a = document.querySelector(`#gnb ul li a[href="#${e.target.id}"]`);
    if (a) a.style.color = "var(--gold)";
  });
}, { threshold: 0.45 }).observe && sections.forEach(s =>
  new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      navLinks.forEach(l => l.style.color = "");
      const a = document.querySelector(`#gnb ul li a[href="#${entries[0].target.id}"]`);
      if (a) a.style.color = "var(--gold)";
    }
  }, { threshold: 0.45 }).observe(s)
);

/* ---------- 10. Hero Canvas Particles ---------- */
(function initParticles() {
  const canvas = document.getElementById("heroCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let W, H, dots = [], mouse = { x: -999, y: -999 };

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });

  // Create dots
  for (let i = 0; i < 90; i++) {
    dots.push({
      x: Math.random() * 1200,
      y: Math.random() * 800,
      r: Math.random() * 1.2 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.4 + 0.1
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw lines between close dots
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x;
        const dy = dots[i].y - dots[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(dots[i].x, dots[i].y);
          ctx.lineTo(dots[j].x, dots[j].y);
          ctx.strokeStyle = `rgba(201,168,76,${0.08 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Draw dots
    dots.forEach(d => {
      // Gentle repulsion from mouse
      const dx = d.x - mouse.x, dy = d.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        d.vx += dx / dist * 0.4;
        d.vy += dy / dist * 0.4;
      }
      // Limit speed
      const speed = Math.sqrt(d.vx * d.vx + d.vy * d.vy);
      if (speed > 1.5) { d.vx /= speed; d.vy /= speed; }

      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,168,76,${d.alpha})`;
      ctx.fill();

      d.x += d.vx;
      d.y += d.vy;
      if (d.x < 0 || d.x > W) d.vx *= -1;
      if (d.y < 0 || d.y > H) d.vy *= -1;
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ---------- 11. Subtle parallax on hero ---------- */
const heroBg = document.querySelector(".hero-bg-img");
window.addEventListener("scroll", () => {
  if (!heroBg) return;
  const y = window.scrollY;
  if (y < window.innerHeight) {
    heroBg.style.transform = `scale(1.05) translateY(${y * 0.15}px)`;
  }
});
