(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = matchMedia("(hover: none), (pointer: coarse)").matches;
  const hasGsap = typeof window.gsap !== "undefined";
  const CAT_LABEL = { live: "Live music", events: "Event", tv: "Broadcast TV", film: "Film", social: "Social" };
  const PROJECTS = window.PROJECTS || [];

  /* ---------- split helpers ---------- */
  function splitChars(el) {
    const text = el.textContent;
    el.textContent = "";
    for (const c of text) {
      const s = document.createElement("span");
      s.className = "ch";
      s.textContent = c === " " ? " " : c;
      el.appendChild(s);
    }
  }
  function splitWords(el) {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    words.forEach((w, i) => {
      const s = document.createElement("span");
      s.className = "w";
      s.textContent = w;
      el.appendChild(s);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
  }
  $$(".chars").forEach(splitChars);
  $$(".reveal-words").forEach(splitWords);

  /* ---------- grid ---------- */
  const grid = $("#grid");
  PROJECTS.forEach((p, i) => {
    const card = document.createElement("article");
    card.className = "card" + (p.orient === "h" ? " is-h" : "");
    card.dataset.cat = p.cat;
    card.dataset.index = i;
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Play ${p.title}`);
    card.innerHTML = `
      <div class="card__media">
        <img src="media/${p.id}.jpg" alt="" loading="lazy" decoding="async">
        <video muted loop playsinline preload="none" data-src="media/${p.id}-preview.mp4"></video>
        <span class="card__idx">${String(i + 1).padStart(2, "0")}</span>
        <span class="card__tag">${CAT_LABEL[p.cat] || ""}</span>
      </div>
      <div class="card__info">
        <div>
          <h3 class="card__title">${p.title}</h3>
          <p class="card__client">${p.client}</p>
        </div>
        <span class="card__year">${p.year || ""}</span>
      </div>`;
    grid.appendChild(card);
  });
  $(".work__n").textContent = PROJECTS.length;

  function playPreview(card) {
    const v = $("video", card);
    if (!v.src) {
      v.src = v.dataset.src;
      v.addEventListener("canplay", () => v.classList.add("is-ready"), { once: true });
    }
    const pr = v.play();
    if (pr && pr.catch) pr.catch(() => {});
  }
  function stopPreview(card) { const v = $("video", card); if (v.src) v.pause(); }

  $$(".card").forEach(card => {
    card.addEventListener("click", () => openLb(+card.dataset.index));
    card.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLb(+card.dataset.index); } });
    if (!touch) {
      card.addEventListener("mouseenter", () => playPreview(card));
      card.addEventListener("mouseleave", () => stopPreview(card));
    }
  });
  if (touch && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { playPreview(e.target); $("video", e.target).classList.add("is-ready"); e.target.classList.add("is-inview"); }
        else stopPreview(e.target);
      });
    }, { threshold: .6 });
    $$(".card").forEach(c => io.observe(c));
    const st = document.createElement("style");
    st.textContent = ".card.is-inview .card__media video.is-ready{opacity:1}";
    document.head.appendChild(st);
  }

  /* ---------- filters ---------- */
  $$(".filter").forEach(btn => btn.addEventListener("click", () => {
    $$(".filter").forEach(b => b.classList.toggle("is-active", b === btn));
    const f = btn.dataset.filter;
    let n = 0;
    $$(".card").forEach(c => {
      const show = f === "all" || c.dataset.cat === f;
      c.classList.toggle("is-hidden", !show);
      if (show) n++;
    });
    $(".work__n").textContent = n;
    if (hasGsap) {
      gsap.fromTo(".card:not(.is-hidden)", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .7, stagger: .05, ease: "expo.out", clearProps: "all" });
      ScrollTrigger.refresh();
    }
  }));

  /* ---------- lightbox ---------- */
  const lb = $(".lb");
  const lbMedia = $(".lb__media");
  let lbIndex = 0;
  let lbList = PROJECTS;
  function visibleList() { return $$(".card:not(.is-hidden)").map(c => +c.dataset.index); }
  function renderLb(p, label) {
    lbMedia.innerHTML = "";
    if (p.vimeo) {
      const f = document.createElement("iframe");
      f.src = `https://player.vimeo.com/video/${p.vimeo}?autoplay=1&title=0&byline=0&portrait=0&dnt=1`;
      f.allow = "autoplay; fullscreen; picture-in-picture";
      f.allowFullscreen = true;
      f.title = p.title;
      lbMedia.appendChild(f);
    } else {
      const v = document.createElement("video");
      v.src = p.id === "celibacy" ? `media/${p.id}-preview.mp4` : `media/${p.id}.mp4`;
      v.poster = `media/${p.id}.jpg`;
      v.controls = true; v.autoplay = true; v.playsInline = true;
      if (p.id === "celibacy") { v.loop = true; v.muted = true; }
      lbMedia.appendChild(v);
    }
    $(".lb__idx").textContent = label;
    $(".lb__title").textContent = p.title;
    $(".lb__client").textContent = [p.client, p.year].filter(Boolean).join(" — ");
    $(".lb__role").textContent = p.role;
    $(".lb__desc").textContent = p.desc + (p.id === "celibacy" && !p.vimeo ? " Preview shown — full film on Vimeo soon." : "");
    if (hasGsap && !reduce) gsap.fromTo([lbMedia, ".lb__info"], { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .7, stagger: .08, ease: "expo.out" });
  }
  function openLb(i) {
    lbList = visibleList();
    lbIndex = Math.max(0, lbList.indexOf(i));
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    if (window.__lenis) window.__lenis.stop();
    showLb();
    $(".lb__nav").style.display = "";
  }
  function showLb() {
    const idx = lbList[lbIndex];
    renderLb(PROJECTS[idx], `${String(idx + 1).padStart(2, "0")} / ${String(PROJECTS.length).padStart(2, "0")}`);
  }
  function openReel() {
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    if (window.__lenis) window.__lenis.stop();
    renderLb(window.SHOWREEL, "Showreel");
    $(".lb__nav").style.display = "none";
  }
  new MutationObserver(() => document.body.classList.toggle("lb-open", !lb.hidden)).observe(lb, { attributes: true, attributeFilter: ["hidden"] });
  function closeLb() {
    lb.hidden = true;
    lbMedia.innerHTML = "";
    document.body.style.overflow = "";
    if (window.__lenis) window.__lenis.start();
  }
  $(".lb__close").addEventListener("click", closeLb);
  $(".lb__next").addEventListener("click", () => { lbIndex = (lbIndex + 1) % lbList.length; showLb(); });
  $(".lb__prev").addEventListener("click", () => { lbIndex = (lbIndex - 1 + lbList.length) % lbList.length; showLb(); });
  lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", e => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowRight" && $(".lb__nav").style.display !== "none") $(".lb__next").click();
    if (e.key === "ArrowLeft" && $(".lb__nav").style.display !== "none") $(".lb__prev").click();
  });
  $$("[data-open='showreel-2026']").forEach(b => b.addEventListener("click", openReel));

  /* ---------- clock ---------- */
  const clock = $(".clock");
  const tick = () => {
    try {
      clock.textContent = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Brussels" }).format(new Date());
    } catch (e) { clock.textContent = ""; }
  };
  tick(); setInterval(tick, 15000);

  /* ---------- rotator ---------- */
  const rot = $$(".rotator span");
  let r = 0;
  rot[0].classList.add("is-on");
  setInterval(() => {
    const cur = rot[r];
    cur.classList.remove("is-on"); cur.classList.add("is-out");
    setTimeout(() => cur.classList.remove("is-out"), 700);
    r = (r + 1) % rot.length;
    rot[r].classList.add("is-on");
  }, 1900);

  /* ---------- copy mail ---------- */
  const toast = $(".toast");
  function showToast(t) { toast.textContent = t; toast.classList.add("is-on"); setTimeout(() => toast.classList.remove("is-on"), 2200); }
  $$(".mail").forEach(m => m.addEventListener("click", async () => {
    const addr = m.dataset.mail;
    try { await navigator.clipboard.writeText(addr); showToast("Email copied — talk soon ✺"); }
    catch (e) { location.href = "mailto:" + addr; }
  }));

  /* ---------- cursor ---------- */
  if (!touch) {
    const cur = $(".cursor"), dot = $(".cursor-dot");
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px)`; }, { passive: true });
    (function loop() {
      cx += (mx - cx) * .18; cy += (my - cy) * .18;
      cur.style.transform = `translate(${cx}px,${cy}px)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener("mouseover", e => {
      const card = e.target.closest(".card");
      const link = e.target.closest("a, button, .filter");
      cur.classList.toggle("is-play", !!card);
      cur.classList.toggle("is-link", !card && !!link);
    });
    // magnetic
    $$(".magnetic").forEach(el => {
      el.addEventListener("mousemove", e => {
        const b = el.getBoundingClientRect();
        const x = e.clientX - b.left - b.width / 2, y = e.clientY - b.top - b.height / 2;
        el.style.transform = `translate(${x * .25}px, ${y * .3}px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; el.style.transition = "transform .6s cubic-bezier(.16,1,.3,1)"; setTimeout(() => el.style.transition = "", 600); });
    });
  }

  /* ---------- marquees (scroll-velocity driven) ---------- */
  const marquees = $$(".marquee").map(m => {
    const track = $(".marquee__track", m);
    const base = track.innerHTML;
    track.innerHTML = base + base;
    while (track.scrollWidth < innerWidth * 2.2) track.innerHTML += base;
    return { track, speed: parseFloat(m.dataset.speed || 1), x: 0 };
  });
  let velocity = 0, lastY = scrollY, dir = 1;
  if (!reduce) {
    (function mloop() {
      const y = scrollY;
      const dy = y - lastY; lastY = y;
      if (dy !== 0) dir = dy > 0 ? 1 : -1;
      velocity += (Math.min(Math.abs(dy), 60) - velocity) * .1;
      marquees.forEach(mq => {
        mq.x -= (0.9 + velocity * .35) * mq.speed * dir;
        const gw = groupWidth(mq);
        if (gw > 0) {
          if (mq.x <= -gw) mq.x += gw;
          if (mq.x > 0) mq.x -= gw;
        }
        mq.track.style.transform = `translate3d(${mq.x}px,0,0)`;
      });
      requestAnimationFrame(mloop);
    })();
  }
  function groupWidth(mq) {
    if (mq._gw) return mq._gw;
    // width of one original group = distance between first child and the first repeated child
    const kids = mq.track.children;
    const firstText = kids[0].textContent;
    for (let i = 1; i < kids.length; i++) {
      if (kids[i].textContent === firstText && kids[i].tagName === kids[0].tagName) {
        mq._gw = kids[i].offsetLeft - kids[0].offsetLeft;
        return mq._gw;
      }
    }
    return mq.track.scrollWidth / 2;
  }
  addEventListener("resize", () => marquees.forEach(mq => (mq._gw = 0)));

  /* ---------- no GSAP fallback ---------- */
  const loader = $(".loader");
  if (!hasGsap || reduce) {
    loader.remove();
    document.body.classList.remove("is-loading");
    $$(".reveal-words .w").forEach(w => (w.style.opacity = 1));
    $$(".count").forEach(c => (c.textContent = c.dataset.to));
    return;
  }

  /* ---------- smooth scroll ---------- */
  gsap.registerPlugin(ScrollTrigger);
  if (typeof window.Lenis !== "undefined") {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener("click", e => {
      const id = a.getAttribute("href");
      const target = id === "#top" ? 0 : $(id);
      if (target === null) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: 0, duration: 1.6 });
    }));
    lenis.stop();
  }

  /* ---------- preloader ---------- */
  const num = $(".loader__num"), bar = $(".loader__bar span"), words = $$(".loader__word");
  const heroVideo = $(".hero__video");
  const state = { p: 0 };
  let ready = false;
  const markReady = () => (ready = true);
  if (heroVideo.readyState >= 3) markReady();
  heroVideo.addEventListener("canplay", markReady, { once: true });
  addEventListener("load", markReady, { once: true });
  setTimeout(markReady, 3500);

  const loadTl = gsap.timeline();
  loadTl.to(state, {
    p: 86, duration: 1.4, ease: "power2.inOut",
    onUpdate: () => paint()
  });
  function paint() {
    const v = Math.round(state.p);
    num.textContent = String(v).padStart(3, "0");
    bar.style.width = v + "%";
    words.forEach((w, i) => w.classList.toggle("is-on", v >= (i + 1) * 22));
  }
  function finish() {
    gsap.to(state, {
      p: 100, duration: .45, ease: "power2.out", onUpdate: paint,
      onComplete: () => {
        const tl = gsap.timeline({ onComplete: () => { loader.remove(); document.body.classList.remove("is-loading"); if (window.__lenis) window.__lenis.start(); } });
        tl.to(loader, { yPercent: -100, duration: 1.1, ease: "expo.inOut" })
          .from(".hero__video", { scale: 1.25, duration: 1.8, ease: "expo.out" }, "-=.7")
          .from(".hero__title .ch", { yPercent: 115, rotate: 6, duration: 1.2, stagger: .035, ease: "expo.out" }, "-=1.5")
          .from(".hero__kicker .split-up", { y: 20, opacity: 0, duration: .8, stagger: .08, ease: "expo.out" }, "-=1")
          .from([".hero__lede", ".reel-btn", ".hero__scroll"], { y: 30, opacity: 0, duration: .9, stagger: .08, ease: "expo.out" }, "-=.9")
          .from(".nav", { y: -30, opacity: 0, duration: .8, ease: "expo.out" }, "-=.9");
      }
    });
  }
  (function wait() { if (ready && !loadTl.isActive()) finish(); else setTimeout(wait, 80); })();

  /* ---------- hero scroll out ---------- */
  gsap.to(".hero__title", {
    yPercent: -18, scale: .92, opacity: .15, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });
  gsap.to(".hero__media", {
    yPercent: 18, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });

  /* ---------- statement word reveal ---------- */
  gsap.to(".reveal-words .w", {
    opacity: 1, stagger: .08, ease: "none",
    scrollTrigger: { trigger: ".statement__text", start: "top 80%", end: "bottom 45%", scrub: true }
  });

  /* ---------- counters ---------- */
  $$(".count").forEach(el => {
    const o = { v: 0 };
    gsap.to(o, {
      v: +el.dataset.to, duration: 1.8, ease: "expo.out",
      onUpdate: () => (el.textContent = Math.round(o.v)),
      scrollTrigger: { trigger: el, start: "top 88%", once: true }
    });
  });
  gsap.from(".stat", { y: 60, opacity: 0, duration: 1, stagger: .1, ease: "expo.out", scrollTrigger: { trigger: ".stats", start: "top 85%", once: true } });

  /* ---------- big titles ---------- */
  $$(".big-title, .contact__title").forEach(t => {
    gsap.from($$(".ch", t), {
      yPercent: 110, opacity: 0, duration: 1.1, stagger: .03, ease: "expo.out",
      scrollTrigger: { trigger: t, start: "top 85%", once: true }
    });
  });

  /* ---------- cards ---------- */
  ScrollTrigger.batch(".card", {
    start: "top 90%", once: true,
    onEnter: batch => {
      gsap.fromTo(batch.map(c => $(".card__media", c)),
        { clipPath: "inset(100% 0% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, stagger: .1, ease: "expo.inOut" });
      gsap.fromTo(batch.map(c => $(".card__media img", c)), { scale: 1.35 }, { scale: 1, duration: 1.6, stagger: .1, ease: "expo.out", clearProps: "transform" });
      gsap.fromTo(batch.map(c => $(".card__info", c)), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .9, stagger: .1, delay: .3, ease: "expo.out" });
    }
  });
  gsap.set(".card__media", { clipPath: "inset(100% 0% 0% 0%)" });

  /* ---------- services ---------- */
  gsap.from(".svc__row", { y: 60, opacity: 0, duration: 1, stagger: .12, ease: "expo.out", scrollTrigger: { trigger: ".svc", start: "top 80%", once: true } });

  /* ---------- about ---------- */
  gsap.fromTo(".about__frame img", { yPercent: -12 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: ".about", start: "top bottom", end: "bottom top", scrub: true } });
  gsap.from(".about__frame", { clipPath: "inset(0 0 100% 0)", duration: 1.4, ease: "expo.inOut", scrollTrigger: { trigger: ".about", start: "top 75%", once: true } });
  gsap.from([".about__title", ".about__bio", ".xp li", ".about__meta"], { y: 40, opacity: 0, duration: 1, stagger: .07, ease: "expo.out", scrollTrigger: { trigger: ".about__text", start: "top 75%", once: true } });

  /* ---------- band skew on velocity ---------- */
  const band = $(".band");
  ScrollTrigger.create({
    onUpdate: self => {
      const v = gsap.utils.clamp(-8, 8, self.getVelocity() / 400);
      gsap.to(band, { skewY: v * .4, rotate: -2 + v * .15, duration: .5, ease: "power3.out", overwrite: true });
    }
  });

  addEventListener("load", () => ScrollTrigger.refresh());
})();
