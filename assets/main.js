(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = matchMedia("(hover: none), (pointer: coarse)").matches;
  const hasGsap = typeof window.gsap !== "undefined";
  const PROJECTS = window.PROJECTS || [];

  /* ---------- split text into chars (slide-up animation) ---------- */
  $$(".split").forEach(el => {
    const text = el.textContent;
    el.textContent = "";
    [...text].forEach(c => {
      const s = document.createElement("span");
      s.className = "ch";
      s.textContent = c;
      el.appendChild(s);
    });
  });

  /* ---------- rotator ---------- */
  const rot = $$(".rotator b");
  const rotBox = $(".rotator");
  const phone = matchMedia("(max-width: 600px)");
  // on phones the box follows the current word, so there is no gap before "— Brussels"
  const fitRot = () => {
    if (!rotBox) return;
    if (phone.matches) rotBox.style.width = rot[r].scrollWidth + "px";
    else rotBox.style.width = "";
  };
  let r = 0;
  if (rot.length) {
    rot[0].classList.add("is-on");
    rotBox.style.transition = "width .8s cubic-bezier(.16,1,.3,1)";
    fitRot();
    phone.addEventListener ? phone.addEventListener("change", fitRot) : phone.addListener(fitRot);
    document.fonts && document.fonts.ready.then(fitRot);
    setInterval(() => {
      const cur = rot[r];
      cur.classList.remove("is-on"); cur.classList.add("is-out");
      setTimeout(() => cur.classList.remove("is-out"), 800);
      r = (r + 1) % rot.length;
      rot[r].classList.add("is-on");
      fitRot();
    }, 2000);
  }

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
    chip.hidden = true;
    updateCount();
    if (hasGsap && !reduce) {
      gsap.fromTo(".card:not(.is-hidden)", { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 1, stagger: .05, ease: "expo.inOut" });
      ScrollTrigger.refresh();
    }
  }));

  /* ---------- brands: marquee + click to filter ---------- */
  const BRANDS = window.BRANDS || [];
  const brandTrack = $("#brands");
  const chip = $(".brand-chip");
  const brandHTML = BRANDS.map((b, i) => `<button class="brand" data-brand="${i}">${b.name}</button>`).join("");
  // with "reduce motion" on (common on iPhones) show all brands as a static wrapped list instead of a frozen, cut-off strip
  if (reduce) { brandTrack.innerHTML = brandHTML; brandTrack.parentElement.classList.add("is-static"); }
  else brandTrack.innerHTML = brandHTML + brandHTML + brandHTML;
  function showBrand(i) {
    const b = BRANDS[i];
    const ids = new Set(b.ids);
    $$(".filter").forEach(f => f.classList.remove("is-active"));
    $$(".card").forEach(c => c.classList.toggle("is-hidden", !ids.has(PROJECTS[+c.dataset.index].id)));
    $(".brand-chip__name").textContent = b.name;
    chip.hidden = false;
    updateCount();
    const work = $("#work");
    if (window.__lenis) window.__lenis.scrollTo(work, { duration: 1.6 }); else work.scrollIntoView({ behavior: "smooth" });
    if (hasGsap && !reduce) {
      gsap.fromTo(".card:not(.is-hidden)", { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 1.1, stagger: .08, delay: .6, ease: "expo.inOut" });
      ScrollTrigger.refresh();
    }
  }
  brandTrack.addEventListener("click", e => { const b = e.target.closest(".brand"); if (b) showBrand(+b.dataset.brand); });
  chip.addEventListener("click", () => $(".filter[data-filter='all']").click());
  function updateCount() { $(".h2 .count").textContent = $$(".card:not(.is-hidden)").length; }

  // marquee motion, speeds up with scroll
  let mx = 0, lastY = scrollY, vel = 0, dir = 1, hover = false, groupW = 0;
  // pause on hover only with a real mouse (on phones a tap would freeze it forever)
  brandTrack.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") hover = true; });
  brandTrack.addEventListener("pointerleave", () => (hover = false));
  const measureBrands = () => { const kids = brandTrack.children; if (kids.length > BRANDS.length) groupW = kids[BRANDS.length].offsetLeft - kids[0].offsetLeft; };
  addEventListener("resize", measureBrands);
  document.fonts && document.fonts.ready.then(measureBrands);
  measureBrands();
  if (!reduce) (function loop() {
    const y = scrollY, dy = y - lastY; lastY = y;
    if (dy) dir = dy > 0 ? 1 : -1;
    vel += (Math.min(Math.abs(dy), 80) - vel) * .08;
    if (!hover) mx -= (0.6 + vel * .25) * dir;
    if (groupW) { if (mx <= -groupW) mx += groupW; if (mx > 0) mx -= groupW; }
    brandTrack.style.transform = `translate3d(${mx}px,0,0)`;
    requestAnimationFrame(loop);
  })();

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
  // phones: the address bar showing/hiding must not re-trigger animations
  ScrollTrigger.config({ ignoreMobileResize: true });
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
  gsap.set(".hero__title .ch", { yPercent: 115 });
  gsap.set(".nav", { opacity: 0 });
  const lineTl = gsap.to(".loader__line", { scaleX: .85, duration: 1.1, ease: "power2.inOut" });
  (function wait() {
    if (!ready || lineTl.isActive()) return setTimeout(wait, 60);
    gsap.timeline({ onComplete: () => { loader.remove(); document.body.classList.remove("is-loading"); } })
      .to(".loader__line", { scaleX: 1, duration: .35, ease: "power2.out" })
      .to(".loader", { opacity: 0, duration: .8, ease: "power2.inOut" })
      .from(".hero__video", { scale: 1.08, duration: 2.2, ease: "expo.out" }, "<")
      .to(".hero__title .ch", { yPercent: 0, duration: 1.3, stagger: .045, ease: "expo.out" }, "-=1.7")
      .to(".hero .line > span, .hero__reel > span", { yPercent: 0, duration: 1.2, stagger: .1, ease: "expo.out" }, "-=1.1")
      .to(".nav", { opacity: 1, duration: 1 }, "-=1");
  })();

  /* ---------- scroll ---------- */
  gsap.to(".hero__video", { yPercent: 12, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".hero__text", { opacity: 0, y: -40, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "60% top", scrub: true } });

  gsap.set(".card", { clipPath: "inset(100% 0 0 0)" });
  ScrollTrigger.batch(".card", {
    start: "top 92%", once: true,
    onEnter: b => {
      gsap.to(b, { clipPath: "inset(0% 0 0 0)", duration: 1.2, stagger: .09, ease: "expo.inOut" });
      gsap.fromTo(b.map(c => $("img", c)), { scale: 1.25 }, { scale: 1, duration: 1.8, stagger: .09, ease: "expo.out", clearProps: "transform" });
    }
  });

  // section titles: chars slide up
  $$(".h2, .contact__title").forEach(t => {
    gsap.from($$(".ch", t), { yPercent: 110, opacity: 0, duration: 1.1, stagger: .03, ease: "expo.out", scrollTrigger: { trigger: t, start: "top 88%", once: true } });
  });
  gsap.from(".brands", { opacity: 0, duration: 1.2, scrollTrigger: { trigger: ".brands", start: "top 90%", once: true } });

  $$(".about__lede, .xp li, .about__small, .mail, .socials").forEach(el => {
    gsap.from(el, { opacity: 0, y: 24, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
  });
  gsap.fromTo(".about__img img", { yPercent: -8 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: ".about", start: "top bottom", end: "bottom top", scrub: true } });

  addEventListener("load", () => ScrollTrigger.refresh());
})();
