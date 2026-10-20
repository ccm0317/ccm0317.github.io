/**
 * 張哲銘 Chang Che-Ming — 個人履歷網站互動腳本
 *
 * 1. 進場動畫（GSAP：標題、淡入、視差）
 * 2. 文件／影片彈窗
 * 3. 導覽列（捲動底色、手機版自動隱藏）
 * 4. 關鍵數據卡（數字滾動、點擊跳轉提示；專頁案例抵達提示）
 */

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const mobileQuery = window.matchMedia("(max-width: 768px)");

/* ------------------------------------------------------------------
 * 1. 進場動畫
 * ------------------------------------------------------------------ */

function revealAll() {
  document.querySelectorAll(".hero-title .word, .fade-up").forEach((el) => {
    el.style.opacity = "1";
    el.style.transform = "none";
  });
}

function initAnimations() {
  // GSAP 由 CDN 載入；未載入或使用者偏好減少動態時，直接顯示所有內容
  if (typeof gsap === "undefined" || prefersReducedMotion) {
    revealAll();
    return;
  }
  if (typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);

  gsap.to(".hero-title .word", { y: "0%", duration: 1.2, stagger: 0.15, ease: "power4.out", delay: 0.2 });

  document.querySelectorAll(".fade-up").forEach((el) => {
    gsap.fromTo(
      el,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
      },
    );
  });

  document.querySelectorAll(".parallax-img").forEach((img) => {
    gsap.fromTo(
      img,
      { y: "-8%" },
      {
        y: "8%",
        ease: "none",
        scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true },
      },
    );
  });

  const mountainBg = document.querySelector(".hero-mountain-bg");
  if (mountainBg) {
    gsap.fromTo(
      mountainBg,
      { y: "-5%" },
      { y: "15%", ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } },
    );
  }
}

/* ------------------------------------------------------------------
 * 2. 文件／影片彈窗
 *    觸發元素：.open-modal，搭配 data-pdf 或 data-src，data-type = pdf | video | image
 * ------------------------------------------------------------------ */

function initModal() {
  const modal = document.getElementById("pdf-modal");
  if (!modal) return;

  const frame = document.getElementById("pdf-frame");
  const image = document.getElementById("modal-img");
  const externalLink = document.getElementById("modal-external-link");

  // YouTube 嵌入網址轉成可在新分頁開啟的一般網址
  const toExternalUrl = (url) => {
    const list = url.match(/list=([\w-]+)/);
    if (list) return `https://www.youtube.com/playlist?list=${list[1]}`;
    const video = url.match(/youtube\.com\/embed\/([\w-]+)/);
    if (video && video[1] !== "videoseries") return `https://youtu.be/${video[1]}`;
    return url;
  };

  const open = (url, type) => {
    document.body.style.overflow = "hidden";
    if (externalLink) {
      externalLink.href = toExternalUrl(url);
      externalLink.style.display = "inline-block";
    }
    const isImage = type === "image";
    if (frame) {
      frame.src = isImage ? "" : url;
      frame.style.display = isImage ? "none" : "block";
    }
    if (image) {
      image.src = isImage ? url : "";
      image.style.display = isImage ? "block" : "none";
    }
    modal.classList.add("active");
  };

  const close = () => {
    modal.classList.remove("active");
    document.body.style.overflow = "";
    setTimeout(() => {
      if (frame) {
        frame.src = "";
        frame.style.display = "block";
      }
      if (image) {
        image.src = "";
        image.style.display = "none";
      }
      if (externalLink) externalLink.href = "#";
    }, 350);
  };

  document.querySelectorAll(".open-modal").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      const pdf = trigger.dataset.pdf;
      const url = trigger.dataset.src || pdf;
      if (url) open(url, trigger.dataset.type || (pdf ? "pdf" : "video"));
    });
  });

  document.querySelector(".modal-close")?.addEventListener("click", close);
  document.querySelector(".modal-bg")?.addEventListener("click", close);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("active")) close();
  });
}

/* ------------------------------------------------------------------
 * 3. 導覽列
 *    桌機：捲動超過 80px 加上底色（.scrolled）
 *    手機：往下捲隱藏、往上捲出現（.nav-hidden）
 * ------------------------------------------------------------------ */

function initNavbar() {
  const nav = document.querySelector(".navbar");
  if (!nav) return;

  let lastY = window.scrollY;
  let ticking = false;

  const update = () => {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 80);

    if (!mobileQuery.matches || y < 120 || y < lastY - 4) nav.classList.remove("nav-hidden");
    else if (y > lastY + 4) nav.classList.add("nav-hidden");

    lastY = y;
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true },
  );

  // 手機版點選章節後保持收起，避免擋住區段標題
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (mobileQuery.matches) setTimeout(() => nav.classList.add("nav-hidden"), 50);
    });
  });

  update();
}

/* ------------------------------------------------------------------
 * 4. 關鍵數據卡
 *    數字滾動：<span class="count" data-to="1.8" data-dec="1">，首次進入畫面時播放一次
 *    點擊跳轉：卡片為 <a href="#目標">，抵達後目標閃一下墨綠框（.is-flash）
 * ------------------------------------------------------------------ */

function initMetrics() {
  const counters = document.querySelectorAll(".metric-num .count");

  if (!prefersReducedMotion && "IntersectionObserver" in window && counters.length) {
    const decimals = (el) => parseInt(el.dataset.dec || "0", 10);

    const countUp = (el) => {
      const target = parseFloat(el.dataset.to);
      const duration = 1400;
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = (target * eased).toFixed(decimals(el));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          countUp(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.3 },
    );

    counters.forEach((el) => {
      el.textContent = (0).toFixed(decimals(el));
      observer.observe(el);
    });
  }

  // 從首頁關鍵數據卡連到專頁（urban-renewal.html#case-…）時，抵達後同樣閃一下
  const arrived = location.hash && document.querySelector(`.urban-renewal-card${location.hash}`);
  if (arrived) {
    setTimeout(() => {
      arrived.classList.add("is-flash");
      setTimeout(() => arrived.classList.remove("is-flash"), 1800);
    }, prefersReducedMotion ? 0 : 500);
  }

  document.querySelectorAll('a.metric-card[href^="#"]').forEach((card) => {
    card.addEventListener("click", () => {
      const target = document.querySelector(card.getAttribute("href"));
      if (!target) return;
      target.classList.remove("is-flash");
      setTimeout(
        () => {
          target.classList.add("is-flash");
          setTimeout(() => target.classList.remove("is-flash"), 1800);
        },
        prefersReducedMotion ? 0 : 650,
      );
    });
  });
}

// 從首頁點進專頁（網址沒有 #）時，一律從頁首開始，不沿用上一頁的捲動位置
if (!location.hash) {
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  const toTop = () => {
    const header = document.querySelector(".subpage-header");
    if (header) header.scrollIntoView({ block: "start", behavior: "instant" });
    else window.scrollTo(0, 0);
  };
  toTop();
  window.addEventListener("load", toTop, { once: true });
}

initAnimations();
initModal();
initNavbar();
initMetrics();
