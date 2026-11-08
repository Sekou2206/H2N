(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  const desk = window.matchMedia("(min-width:861px)").matches;
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

  const year = $(".year");
  if (year) year.textContent = new Date().getFullYear();

  $$(".fr").forEach(fr => {
    const j = () => (Math.random() - .5) * 6;
    const d = `M${12 + j()} ${52 + j()} C ${6 + j()} ${14 + j()}, ${88 + j()} ${4 + j()}, ${94 + j()} ${46 + j()} S ${40 + j()} ${100 + j()}, ${10 + j()} ${60 + j()} S ${30 + j()} ${8 + j()}, ${62 + j()} ${10 + j()}`;
    fr.insertAdjacentHTML("beforeend", `<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="${d}" vector-effect="non-scaling-stroke"/></svg>`);
  });

  const slides = $$(".vf__slides img");
  const flash = $(".flash");
  const focus = $(".vf__focus");
  const num = $(".vf__n");
  let cur = 0;
  const shoot = () => {
    slides[cur].classList.remove("is-on");
    cur = (cur + 1) % slides.length;
    slides[cur].classList.add("is-on");
    num.textContent = `${String(cur + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
    focus.classList.remove("is-snap"); void focus.offsetWidth; focus.classList.add("is-snap");
    if (!reduce) { flash.style.transition = "none"; flash.style.opacity = .55; requestAnimationFrame(() => { flash.style.transition = "opacity .5s ease-out"; flash.style.opacity = 0; }); }
  };
  let shotTimer = null;
  const startShots = () => { if (!shotTimer && !reduce) shotTimer = setInterval(shoot, 3000); };

  const tc = $(".tc");
  const t0 = performance.now();
  const pad = n => String(n).padStart(2, "0");
  const tick = () => {
    const ms = performance.now() - t0, s = Math.floor(ms / 1000);
    tc.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(Math.floor(ms / 40) % 25)}`;
    requestAnimationFrame(tick);
  };
  tick();

  const panels = $$(".acc__p");
  panels.forEach(p => {
    const open = () => { panels.forEach(o => o.classList.toggle("is-open", o === p)); };
    p.addEventListener("click", open);
    if (desk) p.addEventListener("mouseenter", open);
  });

  const lb = $(".lb"), lbImg = $(".lb__fig img"), lbCount = $(".lb__count");
  let group = [], idx = 0;
  const show = () => { lbImg.src = group[idx].src; lbImg.alt = group[idx].alt; lbCount.textContent = `${idx + 1} / ${group.length}`; };
  const openLb = (items, i) => { group = items; idx = i; show(); lb.classList.add("is-on"); lb.setAttribute("aria-hidden", "false"); window.lenis && window.lenis.stop(); };
  const closeLb = () => { lb.classList.remove("is-on"); lb.setAttribute("aria-hidden", "true"); window.lenis && window.lenis.start(); };
  const frames = $$(".fr");
  const frameItems = frames.map(f => ({ src: f.dataset.lbSrc, alt: f.querySelector("img").alt }));
  frames.forEach((f, i) => f.addEventListener("click", () => { f.classList.add("is-kept"); openLb(frameItems, i); }));
  $$(".acc__row").forEach(row => {
    const imgs = [...row.querySelectorAll("img")];
    const items = imgs.map(im => ({ src: im.src, alt: im.alt }));
    imgs.forEach((im, i) => im.addEventListener("click", e => { e.stopPropagation(); openLb(items, i); }));
  });
  $(".lb__x").addEventListener("click", closeLb);
  $(".lb__nav--p").addEventListener("click", () => { idx = (idx - 1 + group.length) % group.length; show(); });
  $(".lb__nav--n").addEventListener("click", () => { idx = (idx + 1) % group.length; show(); });
  lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });
  addEventListener("keydown", e => {
    if (!lb.classList.contains("is-on")) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowRight") { idx = (idx + 1) % group.length; show(); }
    if (e.key === "ArrowLeft") { idx = (idx - 1 + group.length) % group.length; show(); }
  });

  const disk = $(".dial__disk");
  const modes = $$(".dial__m");
  const mps = $$(".mp");
  let mode = 0, turn = 0, auto = null;
  const setMode = i => {
    const diff = ((i - mode) % 4 + 4) % 4;
    turn -= (diff > 2 ? diff - 4 : diff) * 90;
    mode = i;
    disk.style.transform = `rotate(${turn}deg)`;
    modes.forEach((m, k) => m.classList.toggle("is-on", k === i));
    mps.forEach((p, k) => p.classList.toggle("is-on", k === i));
  };
  modes.forEach(m => m.addEventListener("click", () => { clearInterval(auto); auto = null; setMode(+m.dataset.i); }));
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting && !auto && !reduce) auto = setInterval(() => setMode((mode + 1) % 4), 4200);
    if (!en.isIntersecting && auto) { clearInterval(auto); auto = null; }
  }), { threshold: .4 });
  io.observe($(".modes"));

  const intro = $(".intro");
  if (!hasGsap || reduce) {
    intro.remove();
    $(".focus__img img").style.filter = "none";
    startShots();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  document.body.classList.add("is-locked");

  let lenis = null;
  if (typeof window.Lenis !== "undefined") {
    lenis = new Lenis({ lerp: .09, smoothWheel: true });
    lenis.stop();
    window.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  $$('a[href^="#"]').forEach(a => a.addEventListener("click", e => {
    const t = $(a.getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(t, { duration: 1.6 }) : t.scrollIntoView({ behavior: "smooth" });
  }));

  gsap.timeline({
    onComplete: () => {
      intro.remove();
      document.body.classList.remove("is-locked");
      lenis && lenis.start();
      startShots();
      ScrollTrigger.refresh();
    }
  })
    .from(".intro__h", { yPercent: 40, opacity: 0, duration: .9, ease: "expo.out" })
    .to(".intro__logo .dot", { scale: 1, duration: .5, ease: "back.out(3)" }, "-=.3")
    .to(".intro__logo", { opacity: 0, scale: .9, duration: .4, ease: "power2.in", delay: .35 })
    .to(".intro__blade--t", { yPercent: -100, duration: 1, ease: "expo.inOut" }, "-=.05")
    .to(".intro__blade--b", { yPercent: 100, duration: 1, ease: "expo.inOut" }, "<")
    .from(".vf__screen", { scale: .92, duration: 1.4, ease: "expo.out" }, "<.2")
    .from(".vf__title>span", { yPercent: 100, opacity: 0, duration: 1.1, ease: "expo.out", stagger: .1 }, "<.3")
    .from(".vf__k,.vf__lead,.vf__cta,.vf__read li", { y: 16, opacity: 0, duration: .8, ease: "expo.out", stagger: .06 }, "<.2");

  if (desk) {
    gsap.to(".focus__img img", { filter: "blur(0px)", scale: 1, ease: "none", scrollTrigger: { trigger: ".focus", start: "top top", end: "60% bottom", scrub: true } });
    const val = $(".focus__val");
    const steps = ["∞", "10 m", "5 m", "3 m", "2 m", "1,5 m"];
    ScrollTrigger.create({ trigger: ".focus", start: "top top", end: "60% bottom", onUpdate: s => { val.textContent = steps[Math.min(steps.length - 1, Math.floor(s.progress * steps.length))]; } });
    gsap.to(".focus__ring", { rotate: 300, ease: "none", scrollTrigger: { trigger: ".focus", start: "top top", end: "60% bottom", scrub: true } });
  } else {
    gsap.to(".focus__img img", { filter: "blur(0px)", scale: 1, ease: "none", scrollTrigger: { trigger: ".focus__img", start: "top 90%", end: "center center", scrub: true } });
  }

  gsap.from(".focus__big", { y: 40, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".focus", start: "top 70%" } });

  $$(".h2").forEach(h => gsap.from(h, { y: 60, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: h, start: "top 88%" } }));
  gsap.from(".acc__p", { y: 80, opacity: 0, duration: 1.2, ease: "expo.out", stagger: .08, scrollTrigger: { trigger: ".acc", start: "top 85%" } });
  gsap.from(".fr", { y: 30, opacity: 0, duration: .9, ease: "expo.out", stagger: .04, scrollTrigger: { trigger: ".film", start: "top 85%" } });
  gsap.from(".dial", { rotate: -120, opacity: 0, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: ".modes__wrap", start: "top 80%" } });
  gsap.from(".book__in>*", { y: 40, opacity: 0, duration: 1.1, ease: "expo.out", stagger: .08, scrollTrigger: { trigger: ".book", start: "top 70%" } });
  gsap.from(".foot__h", { yPercent: 30, opacity: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: ".foot", start: "top 90%" } });

  addEventListener("load", () => ScrollTrigger.refresh());
})();
