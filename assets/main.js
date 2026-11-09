(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = matchMedia("(hover: none), (pointer: coarse)").matches;
  const hasGsap = typeof window.gsap !== "undefined";
  const PROJECTS = window.PROJECTS || [];

  /* ---------- grid ---------- */
  const grid = $("#grid");
  PROJECTS.forEach((p, i) => {
    const card = document.createElement("article");
    card.className = "card";
    card.dataset.cat = p.cat;
    card.dataset.index = i;
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", p.title);
    card.innerHTML = `
      <img src="media/${p.id}${p.orient === "v" ? "-thumb" : ""}.jpg" alt="" loading="lazy" decoding="async">
      <video muted loop playsinline preload="none" data-src="media/${p.id}-preview.mp4"></video>
      <div class="card__info">
        <h3 class="card__title">${p.title}</h3>
        <p class="card__client">${p.client.split(" — ")[0].split(" · ")[0]}</p>
      </div>`;
    grid.appendChild(card);
  });

  function play(card) {
    const v = $("video", card);
    if (!v.src) {
      v.src = v.dataset.src;
      v.addEventListener("playing", () => v.classList.add("is-ready"), { once: true });
    }
    card.classList.add("is-playing");
    const pr = v.play();
    if (pr && pr.catch) pr.catch(() => {});
  }
  function stop(card) { card.classList.remove("is-playing"); const v = $("video", card); if (v.src) v.pause(); }

  $$(".card").forEach(card => {
    card.addEventListener("click", () => openLb(+card.dataset.index));
    card.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLb(+card.dataset.index); } });
    if (!touch) {
      card.addEventListener("mouseenter", () => play(card));
      card.addEventListener("mouseleave", () => stop(card));
    }
  });
  if (touch && "IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver(es => es.forEach(e => (e.isIntersecting ? play(e.target) : stop(e.target))), { threshold: .7 });
    $$(".card").forEach(c => io.observe(c));
  }

  /* ---------- filters ---------- */
  $$(".filter").forEach(btn => btn.addEventListener("click", () => {
    $$(".filter").forEach(b => b.classList.toggle("is-active", b === btn));
    const f = btn.dataset.filter;
    $$(".card").forEach(c => c.classList.toggle("is-hidden", !(f === "all" || c.dataset.cat === f)));
    if (hasGsap && !reduce) {
      gsap.fromTo(".card:not(.is-hidden)", { opacity: 0 }, { opacity: 1, duration: .6, stagger: .03, ease: "power2.out" });
      ScrollTrigger.refresh();
    }
  }));

  /* ---------- lightbox ---------- */
  const lb = $(".lb"), lbMedia = $(".lb__media");
  let list = [], pos = 0;
  function render(p) {
    lbMedia.innerHTML = "";
    if (p.vimeo) {
      const f = document.createElement("iframe");
      f.src = `https://player.vimeo.com/video/${p.vimeo}?autoplay=1&title=0&byline=0&portrait=0&dnt=1`;
      f.allow = "autoplay; fullscreen; picture-in-picture";
      f.allowFullscreen = true; f.title = p.title;
      lbMedia.appendChild(f);
    } else {
      const v = document.createElement("video");
      const previewOnly = p.id === "celibacy";
      v.src = previewOnly ? `media/${p.id}-preview.mp4` : `media/${p.id}.mp4`;
      v.poster = `media/${p.id}.jpg`;
      v.controls = !previewOnly; v.autoplay = true; v.playsInline = true;
      if (previewOnly) { v.muted = true; v.loop = true; }
      lbMedia.appendChild(v);
    }
    $(".lb__title").textContent = p.title;
    $(".lb__meta").textContent = [p.client, p.role].filter(Boolean).join(" — ");
    $(".lb__desc").textContent = p.desc + (p.id === "celibacy" && !p.vimeo ? " Full film coming soon." : "");
    if (hasGsap && !reduce) gsap.fromTo([lbMedia, ".lb__info"], { opacity: 0 }, { opacity: 1, duration: .6, stagger: .08, ease: "power2.out" });
  }
  function show() { render(PROJECTS[list[pos]]); }
  function open() {
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    if (window.__lenis) window.__lenis.stop();
  }
  function openLb(i) {
    list = $$(".card:not(.is-hidden)").map(c => +c.dataset.index);
    pos = Math.max(0, list.indexOf(i));
    $(".lb__nav").style.visibility = "";
    open(); show();
  }
  function openReel() {
    $(".lb__nav").style.visibility = "hidden";
    open(); render(window.SHOWREEL);
  }
  function close() {
    lb.hidden = true; lbMedia.innerHTML = "";
    document.body.style.overflow = "";
    if (window.__lenis) window.__lenis.start();
  }
  $(".lb__close").addEventListener("click", close);
  $(".lb__next").addEventListener("click", () => { pos = (pos + 1) % list.length; show(); });
  $(".lb__prev").addEventListener("click", () => { pos = (pos - 1 + list.length) % list.length; show(); });
  document.addEventListener("keydown", e => {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    if ($(".lb__nav").style.visibility === "hidden") return;
    if (e.key === "ArrowRight") $(".lb__next").click();
    if (e.key === "ArrowLeft") $(".lb__prev").click();
  });
  $$("[data-open='showreel']").forEach(b => b.addEventListener("click", openReel));

  /* ---------- copy mail ---------- */
  const toast = $(".toast");
  $$(".mail").forEach(m => m.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(m.dataset.mail);
      toast.textContent = "Email copied";
      toast.classList.add("is-on");
      setTimeout(() => toast.classList.remove("is-on"), 1800);
    } catch (e) { location.href = "mailto:" + m.dataset.mail; }
  }));

  /* ---------- no animation fallback ---------- */
  const loader = $(".loader");
  if (!hasGsap || reduce) {
    loader.remove();
    document.body.classList.remove("is-loading");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  if (typeof window.Lenis !== "undefined") {
    const lenis = new Lenis({ duration: 1.1 });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener("click", e => {
      const id = a.getAttribute("href");
      const target = id === "#top" ? 0 : $(id);
      if (target === null) return;
      e.preventDefault();
      lenis.scrollTo(target, { duration: 1.4 });
    }));
  }

  /* ---------- intro ---------- */
  const heroVideo = $(".hero__video");
  let ready = false;
  const go = () => (ready = true);
  if (heroVideo.readyState >= 3) go();
  heroVideo.addEventListener("canplay", go, { once: true });
  setTimeout(go, 2500);

  gsap.set(".hero .line > span, .hero__reel > span", { yPercent: 105 });
  gsap.set(".nav", { opacity: 0 });
  const lineTl = gsap.to(".loader__line", { scaleX: .85, duration: 1.1, ease: "power2.inOut" });
  (function wait() {
    if (!ready || lineTl.isActive()) return setTimeout(wait, 60);
    gsap.timeline({ onComplete: () => { loader.remove(); document.body.classList.remove("is-loading"); } })
      .to(".loader__line", { scaleX: 1, duration: .35, ease: "power2.out" })
      .to(".loader", { opacity: 0, duration: .8, ease: "power2.inOut" })
      .from(".hero__video", { scale: 1.08, duration: 2.2, ease: "expo.out" }, "<")
      .to(".hero .line > span, .hero__reel > span", { yPercent: 0, duration: 1.2, stagger: .1, ease: "expo.out" }, "-=1.6")
      .to(".nav", { opacity: 1, duration: 1 }, "-=1");
  })();

  /* ---------- scroll ---------- */
  gsap.to(".hero__video", { yPercent: 12, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".hero__text", { opacity: 0, y: -40, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "60% top", scrub: true } });

  ScrollTrigger.batch(".card", {
    start: "top 92%", once: true,
    onEnter: b => gsap.fromTo(b, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.1, stagger: .08, ease: "expo.out" })
  });
  gsap.set(".card", { opacity: 0 });

  $$(".h2, .about__lede, .xp li, .about__small, .contact__title, .mail, .socials").forEach(el => {
    gsap.from(el, { opacity: 0, y: 24, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
  });
  gsap.fromTo(".about__img img", { yPercent: -8 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: ".about", start: "top bottom", end: "bottom top", scrub: true } });

  addEventListener("load", () => ScrollTrigger.refresh());
})();
