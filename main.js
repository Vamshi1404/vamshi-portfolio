/* ============================================================================
   PLOT — main.js
   ----------------------------------------------------------------------------
   Behaviour only. Every string rendered here comes from content.js. Nothing in
   this file knows the person's name, their projects or their links.

   LAYERS, in the order they run
   ─────────────────────────────────────────────────────────────────────────────
   L0  environment          reduced-motion + capability detection
   L1  dom helpers         el(), svg(), text-safe setters
   L2  renderers           one function per section, all fed from PORTFOLIO
   L3  reveal              IntersectionObserver-driven entrance choreography
   L4  chrome              scroll spy, reading progress, section draw-ins
   L5  interactions        stack strata
   L6  terrain             Three.js marching-squares contour landscape
   L7  motion pass         anime.js entrance timeline + instrument counters
   L8  framer island       plotter pen, magnetic CTAs (lazy)
   L9  resilience          every optional layer is wrapped; none can break L1–L5

   Text is written with textContent / createTextNode throughout, so content.js
   can never inject markup. No innerHTML with data anywhere in this file.
   ========================================================================== */

/* ==========================================================================
   L0  ENVIRONMENT
   ========================================================================== */
const DATA = window.PORTFOLIO;
const root = document.documentElement;

const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(pointer: fine)");
const supportsIO = "IntersectionObserver" in window;

/** True when the visitor has asked for reduced motion. Every motion layer
    checks this, and it is live: toggling the OS setting takes effect without
    a reload for the layers that register a listener. */
let reduced = motionQuery.matches;
motionQuery.addEventListener("change", (e) => {
  reduced = e.matches;
  document.dispatchEvent(new CustomEvent("motionpref", { detail: reduced }));
});

const q = (sel, root_ = document) => root_.querySelector(sel);
const qa = (sel, root_ = document) => Array.from(root_.querySelectorAll(sel));

/* ==========================================================================
   L1  DOM HELPERS
   ========================================================================== */

/** Create an element. `cls` may be a string or an array of class names. */
function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls)
    n.className = Array.isArray(cls) ? cls.filter(Boolean).join(" ") : cls;
  if (text != null) n.textContent = text;
  return n;
}

/** Create an SVG element in the correct namespace. */
function svg(tag, attrs) {
  const n = document.createElementNS("http://www.w3.org/2000/svg", tag);
  if (attrs)
    for (const k in attrs)
      if (attrs[k] != null) n.setAttribute(k, String(attrs[k]));
  return n;
}

/** Build an inline SVG path `d` string from points. */
function pathFrom(points) {
  return points
    .map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(2)} ${p[1].toFixed(2)}`)
    .join(" ");
}

/** Append a text node, honouring a *italic* marker used in display copy. */
function richText(target, str) {
  const parts = String(str).split(/\*([^*]+)\*/g);
  parts.forEach((part, i) => {
    if (!part) return;
    if (i % 2 === 1) target.appendChild(el("em", null, part));
    else target.appendChild(document.createTextNode(part));
  });
  return target;
}

/** Ensure a container exists before rendering into it. */
function mount(sel) {
  const node = typeof sel === "string" ? q(sel) : sel;
  if (!node) return null;
  node.textContent = "";
  return node;
}

/** Register reveal children with a stagger index so the CSS delay applies. */
function stagger(nodes, start = 0) {
  nodes.forEach((n, i) => n.style.setProperty("--i", String(start + i)));
}

/** Tag an element (and its direct children) for the reveal observer. */
function reveal(node, mode) {
  if (!node) return node;
  if (mode) node.setAttribute("data-reveal", mode);
  else if (!node.hasAttribute("data-reveal"))
    node.setAttribute("data-reveal", "");
  return node;
}

/** Set a CSS custom property on an element. */
function setVar(node, name, value) {
  if (node) node.style.setProperty(name, value);
}

/* Resolve any CSS colour string (including oklch) to linear-ish sRGB floats
   by letting the 2D canvas normalise it. Keeps styles.css the single source
   of truth for colour. */
const _colourCtx = (() => {
  const c = document.createElement("canvas");
  c.width = c.height = 1;
  return c.getContext("2d", { willReadFrequently: true });
})();
function tokenRgb(tokenName, fallback) {
  try {
    const css = getComputedStyle(root).getPropertyValue(tokenName).trim();
    if (!css) return fallback;
    _colourCtx.fillStyle = "#000";
    _colourCtx.fillStyle = css;
    _colourCtx.fillRect(0, 0, 1, 1);
    const d = _colourCtx.getImageData(0, 0, 1, 1).data;
    if (d[0] === 0 && d[1] === 0 && d[2] === 0 && fallback) return fallback;
    return [d[0] / 255, d[1] / 255, d[2] / 255];
  } catch {
    return fallback;
  }
}

/* ==========================================================================
   L2  RENDERERS
   ========================================================================== */

/* --- document metadata, kept out of index.html ------------------------- */
function renderMeta() {
  if (!DATA.meta) return;
  document.title = DATA.meta.title;
  const desc = q('meta[name="description"]');
  if (desc) desc.setAttribute("content", DATA.meta.description);
  const theme = q('meta[name="theme-color"]');
  if (theme && DATA.meta.themeColor)
    theme.setAttribute("content", DATA.meta.themeColor);
}

/* --- masthead wordmark + navigation ------------------------------------ */
function renderChrome() {
  const mark = q("[data-wordmark]");
  if (mark) mark.textContent = DATA.person.shortName;

  const nav = mount("[data-nav]");
  if (!nav) return;
  DATA.nav.forEach((item) => {
    const a = el("a", ["nav__link", item.cta ? "nav__link--cta" : ""]);
    a.href = `#${item.id}`;
    if (item.index) a.appendChild(el("i", null, item.index));
    a.appendChild(document.createTextNode(item.label));
    a.dataset.navLink = item.id;
    nav.appendChild(a);
  });
}

/* --- 01 HERO ------------------------------------------------------------ */
function renderHero() {
  const h = DATA.hero;

  const eyebrow = mount("[data-hero-eyebrow]");
  if (eyebrow) {
    eyebrow.appendChild(el("span", "marker"));
    eyebrow.appendChild(document.createTextNode(h.eyebrow));
  }

  const name = mount("[data-hero-name]");
  if (name) {
    h.nameLines.forEach((line) => {
      const span = el("span");
      richText(span, line);
      name.appendChild(span);
    });
  }

  const pos = mount("[data-hero-positioning]");
  if (pos) pos.textContent = h.positioning;

  const stmt = mount("[data-hero-statement]");
  if (stmt) stmt.textContent = h.statement;

  const ro = mount("[data-hero-readouts]");
  if (ro) {
    h.readouts.forEach((r, i) => {
      const cell = el("div", "plate__cell");
      cell.appendChild(el("dt", "plate__k", r.label));
      cell.appendChild(el("dd", "plate__v", r.value));
      reveal(cell);
      cell.style.setProperty("--i", String(i));
      ro.appendChild(cell);
    });
  }

  // The scroll cue already exists in the markup. Appending it here as well
  // rendered "Scroll to plot" twice, so only fill it in when it is missing
  // (which is the case if the markup is ever simplified).
  const scrollCue = q(".hero__scroll");
  if (scrollCue && !scrollCue.textContent.trim()) {
    scrollCue.appendChild(el("span", "hero__scroll-tick"));
    scrollCue.appendChild(document.createTextNode("Scroll to plot"));
  }
}

/* --- section header helper --------------------------------------------- */
function fillSecHead(id, note) {
  const head = q(`#${id} .sec-head`);
  if (!head) return;
  const label = q("[data-sec-label]", head);
  const idx = q("[data-sec-index]", head);
  const nte = q("[data-sec-note]", head);
  const source = {
    about: DATA.about,
    work: DATA.work,
    "open-source": DATA.openSource,
    toolkit: DATA.toolkit,
    record: DATA.record,
    resume: DATA.resume,
    contact: DATA.contact,
    beyond: DATA.beyond,
  }[id];
  if (label && source?.eyebrow) label.textContent = source.eyebrow;
  if (nte && note) nte.textContent = note;
  if (idx) reveal(idx, "left");
  if (label) reveal(label);
  if (nte) reveal(nte, "right");
}

/* --- 02 ABOUT ----------------------------------------------------------- */
function renderAbout() {
  fillSecHead("about", "Who · and how I work");

  const hl = mount("[data-about-headline]");
  if (hl) richText(hl, DATA.about.headline);

  const body = mount("[data-about-body]");
  if (body) {
    DATA.about.body.forEach((para) => {
      const p = el("p", null, para);
      reveal(p);
      body.appendChild(p);
    });
  }

  const mg = mount("[data-about-marginalia]");
  if (mg) {
    DATA.about.marginalia.forEach((m) => {
      const wrap = el("div");
      wrap.appendChild(el("dt", null, m.term));
      wrap.appendChild(el("dd", null, m.value));
      reveal(wrap, "right");
      mg.appendChild(wrap);
    });
  }

  const spec = mount("[data-about-spec]");
  if (spec) {
    DATA.about.spec.forEach((row, i) => {
      const r = el("div", "spec__row");
      r.appendChild(el("dt", null, row.term));
      r.appendChild(el("dd", null, row.value));
      reveal(r);
      r.style.setProperty("--i", String(i));
      spec.appendChild(r);
    });
  }
}

/* --- 03 SELECTED WORK --------------------------------------------------- */
function renderWork() {
  fillSecHead("work", "BaseWise · Pramana · Reposort");

  const headline = mount("[data-work-headline]");
  if (headline) richText(headline, DATA.work.headline);

  const list = mount("[data-work-list]");
  if (!list) return;

  DATA.work.projects.forEach((p, i) => {
    list.appendChild(buildProject(p, i));
  });
}

function buildProject(p, i) {
  const frame = el("article", [
    "plateframe",
    p.flagship ? "plateframe--flagship" : "",
  ]);
  frame.id = `project-${p.id}`;
  reveal(frame);

  /* --- head: identity + description + dense brief --- */
  const head = el("div", "pf__head");
  const meta = el("p", "pf__meta");
  meta.appendChild(el("span", "marker"));
  meta.appendChild(el("span", null, p.year));
  if (p.flagship) meta.appendChild(el("span", null, "Flagship"));
  head.appendChild(meta);
  head.appendChild(el("h3", "pf__title", p.title));
  const sub = el("p", "pf__sub", p.subtitle);
  head.appendChild(sub);
  head.appendChild(el("p", "pf__desc", p.description));
  /* Short precise bullets. Only rendered from content.js — no invented copy. */
  if (p.points?.length) {
    const ul = el("ul", "pf__points");
    p.points.forEach((t) => ul.appendChild(el("li", null, t)));
    head.appendChild(ul);
  }
  frame.appendChild(head);

  /* --- aside: link + stack --- */
  const aside = el("div", "pf__aside");

  const link = el("a", "pf__link", p.linkLabel);
  link.href = p.repo;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.dataset.cursor = "SOURCE";
  link.setAttribute(
    "aria-label",
    `${p.linkLabel}, ${p.title} repository (opens in a new tab)`,
  );
  aside.appendChild(link);

  const stackWrap = el("div");
  stackWrap.appendChild(el("p", "pf__meta", "Stack"));
  const chips = el("div", "chips");
  p.stack.forEach((s) => chips.appendChild(el("span", "chip", s)));
  stackWrap.appendChild(chips);
  aside.appendChild(stackWrap);
  frame.appendChild(aside);

  /* Diagrams, fact tiles, highlight lists and plate captions were removed:
     each project is now title + description + Problem/System/Approach/Result
     brief + link + stack only. All of that information lives in the brief
     above, so nothing below would add information — only decoration. */

  return frame;
}

/* Project diagram treatments (pipeline rail, verdict ledger, repo graph)
   were removed. Each project now renders title + description, short
   bullets, link, and stack. No decorative figures. */

/* --- 04 OPEN SOURCE ----------------------------------------------------- */
function renderOpenSource() {
  fillSecHead("open-source", "One part of the practice");

  const list = mount("[data-oss-list]");
  if (!list) return;

  const oss = el("div", "oss");
  const lede = el("p", "oss__lede", DATA.openSource.lede);
  reveal(lede);
  oss.appendChild(lede);

  DATA.openSource.contributions.forEach((c) => {
    const card = el("article", "osscard");
    reveal(card);

    const head = el("div", "osscard__head");
    const stamp = el("p", "osscard__stamp");
    stamp.appendChild(el("span", "marker"));
    stamp.appendChild(document.createTextNode(c.role));
    head.appendChild(stamp);
    head.appendChild(el("h3", "osscard__title", c.project));
    head.appendChild(el("p", "osscard__summary", c.summary));
    head.appendChild(el("p", "osscard__note", c.roleNote));
    const link = el("a", "pf__link", c.linkLabel);
    link.href = c.repo;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.dataset.cursor = "SOURCE";
    link.setAttribute(
      "aria-label",
      `${c.linkLabel}, ${c.project} repository (opens in a new tab)`,
    );
    head.appendChild(link);
    card.appendChild(head);

    const body = el("div", "osscard__body");

    /* instrument readouts */
    const inst = el("dl", "instruments");
    c.metrics.forEach((m, i) => {
      const cell = el("div", "plate__cell");
      cell.appendChild(el("dt", "plate__k", m.label));
      const dd = el("dd", "plate__v");
      // Count-up target lives in a data attribute; initCounters animates the
      // text. Under reduced motion the resting value is the real figure, so
      // the number is never briefly a misleading zero.
      dd.dataset.count = String(m.value);
      dd.dataset.prefix = m.prefix || "";
      dd.dataset.suffix = m.suffix || "";
      dd.textContent = `${m.prefix || ""}${reduced ? m.value : 0}${m.suffix || ""}`;
      cell.appendChild(dd);
      cell.style.setProperty("--i", String(i));
      inst.appendChild(cell);
    });
    body.appendChild(inst);

    /* router diagram */
    body.appendChild(buildRouter(c.routing));

    /* additional work */
    const listEl = el("ul", "hlist");
    c.highlights.forEach((h) => listEl.appendChild(el("li", null, h)));
    body.appendChild(listEl);

    card.appendChild(body);
    oss.appendChild(card);
  });

  list.appendChild(oss);
}

/** Two model tiers, a router, and the fallback path.
    Geometry is explicit and collision-free: each box reserves a 34-unit band
    with the tick on one line and the label on the next, and the complexity
    axis label lives in a left gutter rotated away from every wire and box. */
function buildRouter(r) {
  const wrap = el("div", "router");
  wrap.setAttribute("data-reveal", "");

  const s = svg("svg", {
    class: "router__fig",
    viewBox: "0 0 340 150",
    role: "img",
    "aria-label": `Routing diagram: a router labelled ${r.routerLabel} selects between ${r.tiers
      .map((t) => t.label)
      .join(" and ")}, with ${r.fallbackNote.toLowerCase()}.`,
  });

  // Box bands. TICK_Y/LABEL_Y keep a 15-unit baseline gap inside a 34-unit
  // box, so the two lines of type never touch.
  const BW = 78,
    BH = 34;
  const TICK_Y = 13,
    LABEL_Y = 28;
  const tierX = 246,
    tierY = [10, 106];
  const routerX = 134,
    routerY = 58;
  const axisX = 13; // left gutter, clear of the input wire
  const wireX0 = 24; // input wire starts right of the gutter

  // A box is one rect, one signal edge, a tick and a label.
  const box = (x, y, opts) => {
    s.appendChild(
      svg("rect", {
        class: `r-box${opts.router ? " r-box--router" : ""}`,
        x,
        y,
        width: BW,
        height: BH,
        rx: 0,
      }),
    );
    s.appendChild(
      svg("rect", { class: "r-box r-box--edge", x, y, width: 2, height: BH }),
    );
    const tick = svg("text", { class: "r-tick", x: x + 8, y: y + TICK_Y });
    tick.textContent = opts.tick;
    if (opts.tickInk) tick.setAttribute("fill", "var(--signal-ink)");
    s.appendChild(tick);
    const label = svg("text", { class: "r-label", x: x + 8, y: y + LABEL_Y });
    label.textContent = opts.label;
    s.appendChild(label);
  };

  r.tiers.forEach((t, i) => {
    box(tierX, tierY[i], {
      tick: `TIER ${String.fromCharCode(65 + i)}`,
      label: t.label.replace(/^Configured model tier /, "Model tier "),
    });
  });

  box(routerX, routerY, {
    tick: "OPT-IN",
    label: r.routerLabel,
    router: true,
    tickInk: true,
  });

  // Live wires: router → each tier
  tierY.forEach((y) => {
    const y0 = routerY + BH / 2;
    const y1 = y + BH / 2;
    const x0 = routerX + BW;
    const x1 = tierX;
    const mx = (x0 + x1) / 2;
    s.appendChild(
      svg("path", {
        class: "r-wire r-wire--live",
        d: `M${x0} ${y0} C ${mx} ${y0}, ${mx} ${y1}, ${x1} ${y1}`,
      }),
    );
  });

  // Fallback: tier A → tier B, dashed, routed clear around the right.
  s.appendChild(
    svg("path", {
      class: "r-wire r-wire--fallback",
      d: `M${tierX + BW} ${tierY[0] + BH} C ${tierX + BW + 24} ${tierY[0] + BH}, ${tierX + BW + 24} ${tierY[1]}, ${tierX + BW} ${tierY[1] + BH / 2}`,
    }),
  );

  // Input wire, and its tick set above the wire rather than beside it.
  const midY = routerY + BH / 2;
  s.appendChild(
    svg("path", {
      class: "r-wire",
      d: `M${wireX0} ${midY} L ${routerX} ${midY}`,
    }),
  );
  const inTick = svg("text", { class: "r-tick", x: wireX0, y: midY - 8 });
  inTick.textContent = "LLM INVOCATION";
  s.appendChild(inTick);

  // The complexity axis label lives in the left gutter, rotated, so it can
  // never sit on a wire or inside a box. It previously ran straight through
  // the router's own label.
  const band = svg("text", {
    class: "r-axis",
    x: axisX,
    y: 75,
    "text-anchor": "middle",
    transform: "rotate(-90 13 75)",
  });
  band.textContent = "TASK COMPLEXITY";
  s.appendChild(band);

  // The figure is authored in a 320-unit coordinate space, so its type scales
  // with the box. The wrapper caps the width to keep that scale — and the
  // resulting type size — constant once the card gets the full measure.
  const draw = el("div", "router__draw");
  draw.appendChild(s);
  wrap.appendChild(draw);

  const note = el("p", "router__note");
  const a = el("span");
  a.appendChild(el("i"));
  a.appendChild(document.createTextNode(r.routerNote));
  const b = el("span");
  b.appendChild(el("i", "fb"));
  b.appendChild(document.createTextNode(r.fallbackNote));
  note.appendChild(a);
  note.appendChild(b);
  wrap.appendChild(note);

  return wrap;
}

/* --- 05 THE STACK ------------------------------------------------------ */
function renderToolkit() {
  fillSecHead("toolkit", "Models · data · systems · cloud");

  const hl = mount("[data-toolkit-headline]");
  if (hl) richText(hl, DATA.toolkit.headline);
  const lede = mount("[data-toolkit-lede]");
  if (lede) lede.textContent = DATA.toolkit.lede;

  const stack = mount("[data-toolkit-stack]");
  if (!stack) return;

  DATA.toolkit.groups.forEach((g, i) => {
    const panelId = `stratum-panel-${g.index}`;
    const stratum = el("div", "stratum");
    stratum.dataset.stratum = g.index;

    const btn = el("button", "stratum__btn");
    btn.type = "button";
    btn.id = `stratum-btn-${g.index}`;
    btn.setAttribute("aria-expanded", "true");
    btn.setAttribute("aria-controls", panelId);
    btn.dataset.cursor = "OPEN";

    btn.appendChild(el("span", "stratum__idx", g.index));
    const nameWrap = el("span", "stratum__namewrap");
    nameWrap.appendChild(el("span", "stratum__name", g.name));
    nameWrap.appendChild(el("span", "stratum__note", g.note));
    btn.appendChild(nameWrap);
    const count = el("span", "stratum__count");
    count.appendChild(
      el("span", null, String(g.items.length).padStart(2, "0")),
    );
    count.appendChild(el("span", "stratum__sign"));
    btn.appendChild(count);
    stratum.appendChild(btn);

    const panel = el("div", "stratum__panel");
    panel.id = panelId;
    panel.dataset.open = "true";
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-labelledby", btn.id);
    const inner = el("div", "stratum__inner");
    const list = el("ul", "stratum__list");
    g.items.forEach((item, k) => {
      const li = el("li", "stratum__item", item);
      li.style.setProperty("--i", String(k));
      list.appendChild(li);
    });
    inner.appendChild(list);
    panel.appendChild(inner);
    stratum.appendChild(panel);

    stack.appendChild(stratum);
  });
}

/* --- 06 RECORD ---------------------------------------------------------- */
function renderRecord() {
  fillSecHead("record", "Education · open source");

  const hl = mount("[data-record-headline]");
  if (hl) richText(hl, DATA.record.headline);

  const list = mount("[data-record-list]");
  if (!list) return;

  DATA.record.entries.forEach((e, i) => {
    const item = el("li", "ledger__item");
    if (e.featured) item.dataset.featured = "true";
    reveal(item, "left");
    item.style.setProperty("--i", String(i));

    const aside = el("div", "ledger__aside");
    aside.appendChild(el("p", "ledger__kind", e.kind));
    aside.appendChild(el("p", "ledger__period", e.period));
    item.appendChild(aside);

    const main = el("div", "ledger__main");
    main.appendChild(el("h3", "ledger__title", e.title));
    main.appendChild(el("p", "ledger__org", e.org));
    main.appendChild(el("p", "ledger__detail", e.detail));

    if (e.facts?.length) {
      const facts = el("dl", "ledger__facts");
      e.facts.forEach((f) => {
        const d = el("div");
        d.appendChild(el("dt", null, f.label));
        d.appendChild(el("dd", null, f.value));
        facts.appendChild(d);
      });
      main.appendChild(facts);
    }

    if (e.coursework?.length) {
      const cw = el("div", "ledger__course");
      cw.appendChild(el("p", "k mono", "Relevant coursework"));
      const chips = el("div", "chips");
      e.coursework.forEach((c) => chips.appendChild(el("span", "chip", c)));
      cw.appendChild(chips);
      main.appendChild(cw);
    }

    if (e.link) {
      const a = el("a", "pf__link", e.linkLabel);
      a.href = e.link;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.dataset.cursor = "SOURCE";
      a.setAttribute(
        "aria-label",
        `${e.linkLabel}, ${e.title} (opens in a new tab)`,
      );
      main.appendChild(a);
    }

    item.appendChild(main);
    list.appendChild(item);
  });
}

/* --- RESUME ---------------------------------------------------------------
   The resume rendered as a themed sheet: same paper, ink, serif display
   and mono labels as the rest of the site. The download button prints this
   sheet alone (print stylesheet isolates it), so the visitor saves a PDF
   with no backend and no dependency. */
function renderResume() {
  fillSecHead("resume", "Education · skills · work");

  const r = DATA.resume;
  if (!r) return;

  const hl = mount("[data-resume-headline]");
  if (hl) richText(hl, r.headline);
  const lede = mount("[data-resume-lede]");
  if (lede) lede.textContent = r.lede;
  const note = mount("[data-resume-note]");
  if (note) note.textContent = r.note;

  const dl = q("[data-resume-download]");
  if (dl) {
    dl.appendChild(el("span", null, r.downloadLabel));
    dl.appendChild(el("span", null, "↓"));
    dl.setAttribute("href", "#resume");
    dl.setAttribute("aria-label", `${r.downloadLabel}, saves the resume below as a PDF`);
    dl.addEventListener("click", (e) => {
      e.preventDefault();
      printResumeSheet();
    });
  }

  const sheet = mount("[data-resume-sheet]");
  if (sheet) buildResumeSheet(sheet, r);
}

/** Print only the resume sheet. The print stylesheet hides the rest of the
    page while `print-resume` is on <body>; choosing "Save as PDF" in the
    dialog downloads the resume as a PDF. */
function printResumeSheet() {
  document.body.classList.add("print-resume");
  const done = () => {
    document.body.classList.remove("print-resume");
    window.removeEventListener("afterprint", done);
  };
  window.addEventListener("afterprint", done);
  // If the dialog is cancelled the class still has to come off: most
  // browsers fire afterprint either way; a fallback timer covers the rest.
  setTimeout(done, 3000);
  window.print();
}

/** Build the themed sheet from DATA.resume. Every string is resume content,
    written with textContent — phone and CGPA are not in the data on purpose. */
function buildResumeSheet(sheet, r) {
  const sec = (title) => {
    const wrap = el("section", "rsheet__sec");
    wrap.appendChild(el("h4", "rsheet__h", title));
    return wrap;
  };
  const bullets = (items) => {
    const ul = el("ul", "rsheet__list");
    items.forEach((t) => ul.appendChild(el("li", null, t)));
    return ul;
  };

  /* --- header --- */
  const head = el("div", "rsheet__head");
  head.appendChild(el("p", "rsheet__name display", r.name));
  head.appendChild(el("p", "rsheet__role mono", r.role));
  const contact = el("p", "rsheet__contact mono");
  const links = [
    { label: DATA.person.email, href: `mailto:${DATA.person.email}` },
    { label: "GitHub", href: DATA.person.github, ext: true },
    { label: "LinkedIn", href: DATA.person.linkedin, ext: true },
    { label: "LeetCode", href: DATA.person.leetcode, ext: true },
  ];
  links.forEach((l, i) => {
    if (i) contact.appendChild(document.createTextNode("  ·  "));
    const a = el("a", null, l.label);
    a.href = l.href;
    if (l.ext) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
    contact.appendChild(a);
  });
  head.appendChild(contact);
  sheet.appendChild(head);

  /* --- summary --- */
  const sum = sec("Summary");
  sum.appendChild(el("p", "rsheet__p", r.summary));
  sheet.appendChild(sum);

  /* --- education --- */
  const edu = sec("Education");
  const e = r.education;
  edu.appendChild(el("p", "rsheet__item-h", e.school));
  edu.appendChild(el("p", "rsheet__item-sub", `${e.degree} · ${e.period}`));
  edu.appendChild(el("p", "rsheet__p", e.affiliation));
  edu.appendChild(el("p", "rsheet__p", `Relevant coursework: ${e.coursework}`));
  sheet.appendChild(edu);

  /* --- skills --- */
  const sk = sec("Technical Skills");
  const dl = el("dl", "rsheet__skills");
  r.skillGroups.forEach((g) => {
    const row = el("div", "rsheet__skill");
    row.appendChild(el("dt", null, g.category));
    row.appendChild(el("dd", null, g.items));
    dl.appendChild(row);
  });
  sk.appendChild(dl);
  sheet.appendChild(sk);

  /* --- open source --- */
  const os = sec("Open Source");
  const o = r.openSource;
  os.appendChild(el("p", "rsheet__item-h", o.project));
  os.appendChild(el("p", "rsheet__item-sub", `${o.role} · ${o.period}`));
  os.appendChild(bullets(o.bullets));
  sheet.appendChild(os);

  /* --- projects --- */
  const pr = sec("Projects");
  r.projects.forEach((p) => {
    const blk = el("div", "rsheet__proj");
    blk.appendChild(el("p", "rsheet__item-h", p.title));
    blk.appendChild(el("p", "rsheet__item-sub", p.period));
    blk.appendChild(bullets(p.bullets));
    blk.appendChild(el("p", "rsheet__stack mono", `Tech: ${p.stack}`));
    pr.appendChild(blk);
  });
  sheet.appendChild(pr);

  /* --- profiles --- */
  const pf = sec("Profiles");
  const prow = el("p", "rsheet__p");
  r.profiles.forEach((pr2, i) => {
    if (i) prow.appendChild(document.createTextNode("  ·  "));
    prow.appendChild(el("span", null, `${pr2.label}: ${pr2.value}`));
  });
  pf.appendChild(prow);
  sheet.appendChild(pf);
}

/* --- BEYOND + QUOTE -------------------------------------------------------
   Additive only: two plain paragraphs and one verbatim closing line. */
function renderBeyond() {
  fillSecHead("beyond", "Elsewhere");

  const lede = mount("[data-beyond-lede]");
  if (lede) {
    richText(lede, DATA.beyond.lede);
    reveal(lede);
  }

  const body = mount("[data-beyond-body]");
  if (body) {
    DATA.beyond.body.forEach((para) => {
      const p = el("p", null, para);
      reveal(p);
      body.appendChild(p);
    });
  }

  /* Art is static markup: reveal it, never mount (mount clears content). */
  const art = document.querySelector("[data-beyond-art]");
  if (art) reveal(art);

  const quote = mount("[data-quote]");
  if (quote) {
    quote.textContent = DATA.quote;
    reveal(quote);
  }
}

/* --- 07 CONTACT --------------------------------------------------------- */
function renderContact() {
  // Only shown if a confirmed availability string is added to content.js.
  fillSecHead("contact", DATA.person.availability || "Open channel");

  const hl = mount("[data-contact-headline]");
  if (hl) {
    hl.appendChild(document.createTextNode(DATA.contact.headline + " "));
    hl.appendChild(el("em", null, DATA.contact.headlineAccent));
  }

  const lede = mount("[data-contact-lede]");
  if (lede) lede.textContent = DATA.contact.lede;

  const cta = q("[data-contact-cta]");
  if (cta) {
    cta.href = `mailto:${DATA.person.email}`;
    cta.setAttribute(
      "aria-label",
      `${DATA.contact.cta}, opens your email app to ${DATA.person.email}`,
    );
    cta.appendChild(el("span", null, DATA.contact.cta));
    cta.appendChild(el("span", null, "→"));
  }

  const note = mount("[data-contact-ctanote]");
  if (note) {
    note.textContent = DATA.contact.ctaNote;
    const a = el("a", null, DATA.person.email);
    a.href = `mailto:${DATA.person.email}`;
    note.appendChild(document.createTextNode(" "));
    note.appendChild(a);
  }

  const recs = mount("[data-contact-records]");
  if (recs) {
    DATA.contact.readouts.forEach((r, i) => {
      const row = el("div", "crecord");
      reveal(row, "right");
      row.style.setProperty("--i", String(i));
      row.appendChild(el("dt", "crecord__k", r.label));
      const dd = el("dd");
      const a = el("a", "crecord__v", DATA.person[r.valueKey]);
      const href = `${r.hrefPrefix}${DATA.person[r.hrefKey]}`;
      a.href = href;
      a.dataset.cursor = "OPEN";
      const external = r.hrefPrefix === "";
      if (external) {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.setAttribute(
          "aria-label",
          `${r.label}, ${DATA.person[r.valueKey]} (opens in a new tab)`,
        );
      } else {
        a.setAttribute("aria-label", `${r.label}, ${DATA.person[r.valueKey]}`);
      }
      dd.appendChild(a);
      row.appendChild(dd);
      row.appendChild(el("span", "crecord__arrow", external ? "↗" : "→"));
      recs.appendChild(row);
    });
  }
}

/* --- 08 COLOPHON -------------------------------------------------------- */
function renderFooter() {
  const name = mount("[data-footer-name]");
  if (name) name.textContent = DATA.person.name;
  const role = mount("[data-footer-role]");
  if (role) {
    role.textContent = [DATA.person.role, DATA.person.location]
      .filter(Boolean)
      .join(" · ");
  }
  const note = mount("[data-footer-note]");
  if (note) note.textContent = DATA.footer.note;
  const col = mount("[data-footer-colophon]");
  if (col) col.textContent = DATA.footer.colophon;
  const top = mount("[data-footer-totop]");
  if (top) top.textContent = DATA.footer.backToTop;
}

/* --- the convergence figure in the contact section ---------------------
   Removed per redesign: contact is plain type + hairlines now. Kept as a
   no-op so the existing markup never breaks. */
function buildConvergence() {
  return;
  const g = q("[data-convergence] .convergence__rules");
  if (!g) return;
  const W = 1200,
    H = 520,
    cx = 600,
    cy = 260;
  const frag = document.createDocumentFragment();

  // Horizontal rules, spaced wider as they move away from the centre: a
  // survey grid in one-point perspective.
  for (let i = -7; i <= 7; i++) {
    const t = i / 7;
    const y = cy + Math.sign(t) * Math.pow(Math.abs(t), 1.7) * (H / 2);
    const inset = 1 - Math.abs(t) * 0.55;
    const line = svg("line", {
      x1: cx - (W / 2) * inset,
      y1: y.toFixed(1),
      x2: cx + (W / 2) * inset,
      y2: y.toFixed(1),
    });
    line.style.opacity = String(0.9 - Math.abs(t) * 0.45);
    frag.appendChild(line);
  }
  // Vertical rules converging toward the same centre.
  for (let i = -6; i <= 6; i++) {
    if (i === 0) continue;
    const t = i / 6;
    const x = cx + Math.sign(t) * Math.pow(Math.abs(t), 1.7) * (W / 2);
    const inset = 1 - Math.abs(t) * 0.5;
    const line = svg("line", {
      x1: x.toFixed(1),
      y1: cy - (H / 2) * inset,
      x2: x.toFixed(1),
      y2: cy + (H / 2) * inset,
    });
    line.style.opacity = String(0.75 - Math.abs(t) * 0.4);
    frag.appendChild(line);
  }
  g.appendChild(frag);
}

/* ==========================================================================
   L3  REVEAL
   One observer for the whole page. Each element animates once and then stops
   being observed, so there is no ongoing cost and nothing re-animates on the
   way back up.
   ========================================================================== */
function initReveal() {
  if (!supportsIO) {
    qa("[data-reveal]").forEach((n) => n.classList.add("is-in"));
    qa(".draw-path").forEach((n) => n.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
  );
  qa("[data-reveal], .draw-path").forEach((n) => io.observe(n));

  // The contact convergence figure gets its own trigger.
  const conv = q("[data-convergence]");
  if (conv) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          q(".convergence")?.classList.add("is-in");
          cio.disconnect();
        });
      },
      { threshold: 0.25 },
    );
    cio.observe(conv);
  }
}

/* ==========================================================================
   L4  CHROME BEHAVIOUR
   ========================================================================== */

/* Per-section accent, read by the scroll spy so the masthead can announce
   which chapter the reader is in. Kept as a plain map rather than parsed from
   computed style: --sec-accent on each section is a var() reference, and
   resolving that back out of getComputedStyle is not reliable across
   browsers, whereas this map can never disagree with styles.css by more than
   a copy-paste. */
const SECTION_ACCENT = {
  about: ["var(--signal)", "var(--signal-ink)"],
  toolkit: ["var(--signal)", "var(--signal-ink)"],
  work: ["var(--signal)", "var(--signal-ink)"],
  "open-source": ["var(--signal)", "var(--signal-ink)"],
  record: ["var(--signal)", "var(--signal-ink)"],
  resume: ["var(--signal)", "var(--signal-ink)"],
  contact: ["var(--signal)", "var(--signal-ink)"],
  beyond: ["var(--signal)", "var(--signal-ink)"],
};

function initScrollState() {
  const masthead = q("#masthead");
  const bar = q("[data-progress]");
  const links = qa("[data-nav-link]");

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const y = window.scrollY || 0;
      const max = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      setVar(bar, "--p", String(Math.min(1, y / max).toFixed(4)));
      if (masthead) masthead.dataset.stuck = y > 24 ? "true" : "false";
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (!supportsIO) return;
  // Scroll spy: the section occupying the middle band of the viewport wins.
  // While it is at it, it also updates --live-accent / --live-accent-ink on
  // <html>, so the reading-progress bar and the active nav link tint to match
  // whichever chapter — About, The Stack, Open Source, Record — the reader is
  // currently in.
  const sections = links
    .map((l) => document.getElementById(l.dataset.navLink))
    .filter(Boolean);
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => {
          const on = l.dataset.navLink === entry.target.id;
          if (on) l.setAttribute("aria-current", "true");
          else l.removeAttribute("aria-current");
        });
        const accent = SECTION_ACCENT[entry.target.id];
        if (accent) {
          root.style.setProperty("--live-accent", accent[0]);
          root.style.setProperty("--live-accent-ink", accent[1]);
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
  );
  sections.forEach((s) => spy.observe(s));
}

/* ==========================================================================
   L5  INTERACTIONS
   ========================================================================== */

/** The Stack: all groups visible by default; headers toggle independently. */
function initStrata() {
  qa(".stratum").forEach((stratum) => {
    const btn = q(".stratum__btn", stratum);
    const panel = q(".stratum__panel", stratum);
    if (!btn || !panel) return;
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", open ? "false" : "true");
      panel.dataset.open = open ? "false" : "true";
    });
  });
}

/* ==========================================================================
   L6  TERRAIN — the signature moment
   A real topographic map: marching squares over a fractal value field, drawn
   as ink hairlines in Three.js, then swept by a vermillion scan until a
   surveyor's crosshair resolves on the highest point. No textures, no models,
   no post-processing: one BufferGeometry and one ShaderMaterial.
   ========================================================================== */

/** Deterministic PRNG so the landscape is identical on every load. */
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fractal value noise on a grid, smoothed by bilinear interpolation. */
function valueNoise(size, seed) {
  const rnd = mulberry32(Math.floor(seed * 1000) || 1);
  const base = 8;
  const layers = [];
  for (let o = 0; o < 4; o++) {
    const n = base * Math.pow(2, o);
    const grid = new Float32Array(n * n);
    for (let i = 0; i < grid.length; i++) grid[i] = rnd();
    layers.push({ n, grid });
  }
  const smooth = (t) => t * t * (3 - 2 * t);
  const out = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let amp = 1,
        sum = 0,
        norm = 0;
      for (const { n, grid } of layers) {
        const fx = (x / size) * n,
          fy = (y / size) * n;
        const x0 = Math.floor(fx) % n,
          y0 = Math.floor(fy) % n;
        const x1 = (x0 + 1) % n,
          y1 = (y0 + 1) % n;
        const tx = smooth(fx - Math.floor(fx)),
          ty = smooth(fy - Math.floor(fy));
        const a = grid[y0 * n + x0],
          b = grid[y0 * n + x1];
        const c = grid[y1 * n + x0],
          d = grid[y1 * n + x1];
        const top = a + (b - a) * tx;
        const bot = c + (d - c) * tx;
        sum += (top + (bot - top) * ty) * amp;
        norm += amp;
        amp *= 0.5;
      }
      out[y * size + x] = sum / norm;
    }
  }
  // A broad radial swell so the landscape has a clear "mass" to survey,
  // offset from centre so the peak is not dead in the middle.
  let min = Infinity,
    max = -Infinity;
  for (const v of out) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  const span = max - min || 1;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * size + x;
      const nx = x / size - 0.5,
        ny = y / size - 0.5;
      const swell = Math.exp(-(nx * nx * 3.4 + ny * ny * 3.4) * 2.1);
      out[i] = ((out[i] - min) / span) * 0.62 + swell * 0.38;
    }
  }
  return out;
}

/* Marching-squares edge table. Bits: TL 8, TR 4, BR 2, BL 1.
   Edges: 0 = top, 1 = right, 2 = bottom, 3 = left. */
const MS_TABLE = [
  [],
  [[2, 3]],
  [[1, 2]],
  [[1, 3]],
  [[0, 1]],
  [
    [0, 3],
    [1, 2],
  ],
  [[0, 2]],
  [[0, 3]],
  [[0, 3]],
  [[0, 2]],
  [
    [0, 1],
    [2, 3],
  ],
  [[0, 1]],
  [[1, 3]],
  [[1, 2]],
  [[2, 3]],
  [],
];

/** Build the contour line geometry. Returns typed arrays ready for BufferGeometry. */
function buildContourGeometry(field, size, opts) {
  const { levels, amp, extent } = opts;
  const positions = [];
  const aY = [];
  const aD = []; // draw order, 0 → 1, so the pen draws level by level
  const step = 1;
  const segsByLevel = Array.from({ length: levels }, () => []);

  for (let li = 0; li < levels; li++) {
    const level = (li + 0.5) / levels;
    for (let y = 0; y < size - 1; y += step) {
      for (let x = 0; x < size - 1; x += step) {
        const a = field[y * size + x];
        const b = field[y * size + x + 1];
        const c = field[(y + 1) * size + x + 1];
        const d = field[(y + 1) * size + x];
        const idx =
          (a > level ? 8 : 0) |
          (b > level ? 4 : 0) |
          (c > level ? 2 : 0) |
          (d > level ? 1 : 0);
        const pairs = MS_TABLE[idx];
        if (!pairs.length) continue;

        const px = (i) => (i / (size - 1) - 0.5) * extent;
        const pz = (j) => (j / (size - 1) - 0.5) * extent;
        const py = (v) => (v - 0.5) * amp;

        const lerp = (v0, v1) => {
          const denom = v1 - v0;
          return Math.abs(denom) < 1e-6 ? 0.5 : (level - v0) / denom;
        };
        // Edge crossing points, in (x, z) grid space.
        const E = [
          [x + lerp(a, b), y], // top
          [x + 1, y + lerp(b, c)], // right
          [x + lerp(d, c), y + 1], // bottom
          [x, y + lerp(a, d)], // left
        ];
        for (const [e0, e1] of pairs) {
          const p0 = E[e0],
            p1 = E[e1];
          segsByLevel[li].push([
            px(p0[0]),
            py(level),
            pz(p0[1]),
            px(p1[0]),
            py(level),
            pz(p1[1]),
          ]);
        }
      }
    }
  }

  let drawn = 0;
  for (const segs of segsByLevel) drawn += segs.length;
  let cursor = 0;
  segsByLevel.forEach((segs) => {
    for (const s of segs) {
      positions.push(s[0], s[1], s[2], s[3], s[4], s[5]);
      aY.push(s[1], s[4]);
      const d = drawn ? cursor / drawn : 0;
      aD.push(d, d);
      cursor++;
    }
  });

  return {
    positions: new Float32Array(positions),
    aY: new Float32Array(aY),
    aD: new Float32Array(aD),
    count: positions.length / 3,
  };
}

/** Deterministic sample points for the plumb lines, avoiding the extremes. */
function samplePoints(field, size, n) {
  const pts = [];
  const rnd = mulberry32(20260926);
  let guard = 0;
  while (pts.length < n && guard++ < 400) {
    const x = 0.18 + rnd() * 0.64;
    const y = 0.18 + rnd() * 0.64;
    const v = field[Math.floor(y * size) * size + Math.floor(x * size)];
    if (v > 0.34 && v < 0.86) pts.push([x, y, v]);
  }
  return pts;
}

async function initTerrain() {
  const host = q("[data-terrain]");
  if (!host) return;

  // Reduced motion, no WebGL, a small screen, or a hidden tab: skip entirely.
  // The static SVG contour plate in the HTML stays as the figure instead.
  const isSmall = window.matchMedia("(max-width: 48rem)").matches;
  const isCoarse = window.matchMedia("(pointer: coarse)").matches;
  if (reduced || isSmall || isCoarse) {
    host.dataset.webgl = "off";
    return;
  }

  let THREE;
  try {
    THREE = await import("three");
  } catch (err) {
    host.dataset.webgl = "off";
    console.warn(
      "[plot] three.js unavailable, using the static contour plate.",
      err,
    );
    return;
  }

  const cfg = DATA.hero.terrain;
  const size = cfg.gridSize;
  const canvas = q("[data-terrain-canvas]", host);
  if (!canvas) {
    host.dataset.webgl = "off";
    return;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
  } catch (err) {
    host.dataset.webgl = "off";
    console.warn(
      "[plot] WebGL context unavailable, using the static contour plate.",
      err,
    );
    return;
  }

  const SPAN = 6.4;
  const AMP = 1.15 * (cfg.intensity || 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
  camera.position.set(0, 1.75, 4.5);

  // --- colours, read from the stylesheet so CSS stays the source of truth
  const ink = tokenRgb("--ink", [0.2, 0.2, 0.2]);
  const signal = tokenRgb("--signal", [0.85, 0.3, 0.15]);
  const rule = tokenRgb("--rule-strong", [0.76, 0.75, 0.72]);

  // --- the field and its contours
  const field = valueNoise(size, cfg.seed);
  const geo = buildContourGeometry(field, size, {
    levels: cfg.levels,
    span: SPAN,
    amp: AMP,
    extent: SPAN,
  });

  const cGeo = new THREE.BufferGeometry();
  cGeo.setAttribute("position", new THREE.BufferAttribute(geo.positions, 3));
  cGeo.setAttribute("aY", new THREE.BufferAttribute(geo.aY, 1));
  cGeo.setAttribute("aD", new THREE.BufferAttribute(geo.aD, 1));

  const uniforms = {
    uInk: { value: new THREE.Color(ink[0], ink[1], ink[2]) },
    uSignal: { value: new THREE.Color(signal[0], signal[1], signal[2]) },
    uSweep: { value: -10 },
    uReveal: { value: 0 },
    uOpacity: { value: 0.62 },
  };
  const cMat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */ `
      attribute float aY;
      attribute float aD;
      uniform float uSweep;
      uniform float uReveal;
      varying float vBand;
      varying float vFade;
      void main() {
        // The pen highlights a moving horizontal band of the landscape.
        float d = abs(aY - uSweep);
        vBand = 1.0 - smoothstep(0.0, 0.62, d);
        // Everything past the pen's progress is collapsed below the scene and
        // faded out, so the map appears to be drawn rather than revealed.
        float drawn = step(aD, uReveal);
        vFade = drawn;
        vec3 p = position;
        p.y = mix(-2.6, p.y, drawn);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uInk;
      uniform vec3 uSignal;
      uniform float uOpacity;
      varying float vBand;
      varying float vFade;
      void main() {
        vec3 c = mix(uInk, uSignal, vBand * vBand);
        float a = uOpacity * (0.30 + 0.70 * vBand) * vFade;
        if (a < 0.004) discard;
        gl_FragColor = vec4(c, a);
      }
    `,
  });
  const contours = new THREE.LineSegments(cGeo, cMat);
  scene.add(contours);

  // --- the survey grid on the base plane
  const basePos = [];
  const G = 8,
    half = SPAN * 0.62;
  for (let i = 0; i <= G; i++) {
    const t = (i / G) * 2 - 1;
    basePos.push(t * half, 0, -half, t * half, 0, half);
    basePos.push(-half, 0, t * half, half, 0, t * half);
  }
  const bGeo = new THREE.BufferGeometry();
  bGeo.setAttribute("position", new THREE.Float32BufferAttribute(basePos, 3));
  const bMat = new THREE.LineBasicMaterial({
    color: new THREE.Color(rule[0], rule[1], rule[2]),
    transparent: true,
    opacity: 0.5,
  });
  const base = new THREE.LineSegments(bGeo, bMat);
  base.position.y = -AMP * 0.5 - 0.08;
  scene.add(base);

  // --- plumb lines: raw samples dropped to the base plane
  const pts = samplePoints(field, size, 7);
  const plumbPos = [];
  const ex = (v) => (v - 0.5) * SPAN;
  for (const [x, y, v] of pts) {
    const X = (x - 0.5) * SPAN,
      Z = (y - 0.5) * SPAN;
    const top = (v - 0.5) * AMP;
    plumbPos.push(X, top, Z, X, -AMP * 0.5 - 0.08, Z);
  }
  const plGeo = new THREE.BufferGeometry();
  plGeo.setAttribute("position", new THREE.Float32BufferAttribute(plumbPos, 3));
  const plMat = new THREE.LineBasicMaterial({
    color: new THREE.Color(ink[0], ink[1], ink[2]),
    transparent: true,
    opacity: 0.22,
  });
  scene.add(new THREE.LineSegments(plGeo, plMat));

  // --- the surveyor's marker on the highest point
  let peak = { x: 0.5, y: 0.5, v: -1 };
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const v = field[y * size + x];
      if (v > peak.v) peak = { x: x / size, y: y / size, v };
    }
  }
  const peakY = (peak.v - 0.5) * AMP;
  const L = 0.17,
    STEM = 0.5;
  const markPos = [
    peakX(-L),
    peakY,
    peakZ(0),
    peakX(L),
    peakY,
    peakZ(0),
    peakX(0),
    peakY,
    peakZ(-L),
    peakX(0),
    peakY,
    peakZ(L),
    peakX(0),
    peakY,
    peakZ(0),
    peakX(0),
    peakY - STEM,
    peakZ(0),
  ];
  function peakX(dx) {
    return (peak.x - 0.5) * SPAN + dx;
  }
  function peakZ(dz) {
    return (peak.y - 0.5) * SPAN + dz;
  }
  const mGeo = new THREE.BufferGeometry();
  mGeo.setAttribute("position", new THREE.Float32BufferAttribute(markPos, 3));
  const mMat = new THREE.LineBasicMaterial({
    color: new THREE.Color(signal[0], signal[1], signal[2]),
    transparent: true,
    opacity: 0,
  });
  const marker = new THREE.LineSegments(mGeo, mMat);
  scene.add(marker);
  marker.renderOrder = 2;

  // --- sizing
  let visible = true;
  function resize() {
    const r = host.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width));
    const h = Math.max(1, Math.round(r.height));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Pull the camera back on narrow viewports so the landscape still fits.
    camera.fov = w / h < 1.15 ? 54 : 42;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  // Stop rendering when the hero scrolls away: no battery or frame budget
  // spent on an off-screen canvas.
  if (supportsIO) {
    new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          visible = e.isIntersecting;
        }),
      { threshold: 0 },
    ).observe(host);
  }
  document.addEventListener("visibilitychange", () => {
    visible = !document.hidden;
  });

  // --- the loop
  const clock = new THREE.Clock();
  let revealT = 0;
  let sweepT = 0;
  let raf = 0;
  const maxY = AMP * 0.5;
  const minY = -AMP * 0.5;

  function frame() {
    raf = requestAnimationFrame(frame);
    if (!visible) return;
    const dt = Math.min(0.05, clock.getDelta());
    const t = clock.elapsedTime;

    // The pen draws the map on, level by level, over ~2.6s.
    if (revealT < 1) {
      revealT = Math.min(1, revealT + dt / 2.6);
      const e = 1 - Math.pow(1 - revealT, 3); // easeOutCubic
      uniforms.uReveal.value = e;
      if (revealT >= 1) mMat.opacity = 0.95;
    }

    // The scan sweeps the finished landscape, top to bottom and back.
    sweepT += dt * 0.16;
    const ping = Math.sin(sweepT);
    uniforms.uSweep.value = ping * maxY;

    // Slow orbit. Pointer adds a small parallax offset, never a spin.
    const drift = reduced ? 0 : cfg.spin;
    const a = t * drift;
    const px = pointer.x * 0.34;
    const py = pointer.y * 0.2;
    camera.position.x = Math.sin(a) * 4.35 + px;
    camera.position.z = Math.cos(a) * 4.35;
    camera.position.y = 1.7 + py;
    camera.lookAt(0, 0.05, 0);

    marker.rotation.y = 0; // cross stays axis-aligned: a survey mark, not a spinner
    renderer.render(scene, camera);
  }

  host.dataset.webgl = "on";
  frame();

  // --- teardown, so a context can never leak over a long session
  function dispose() {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
    cGeo.dispose();
    cMat.dispose();
    bGeo.dispose();
    bMat.dispose();
    plGeo.dispose();
    plMat.dispose();
    mGeo.dispose();
    mMat.dispose();
    renderer.dispose();
  }
  window.addEventListener("pagehide", dispose, { once: true });
}

/* Shared pointer position, written by the pen island (or a passive tracker)
   and read by the terrain each frame. Never triggers a layout read. */
const pointer = { x: 0, y: 0 };

/** A passive pointer tracker for the terrain parallax. Desktop only. */
function initPointerTracking() {
  if (!finePointer.matches || reduced) return;
  let tx = 0,
    ty = 0,
    raf = 0;
  window.addEventListener(
    "pointermove",
    (e) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          pointer.x += (tx - pointer.x) * 0.08;
          pointer.y += (ty - pointer.y) * 0.08;
        });
      }
    },
    { passive: true },
  );
}

/* ==========================================================================
   L7  MOTION PASS — anime.js
   The entrance timeline and the instrument counters. These are the two things
   CSS transitions cannot express: an orchestrated opening sequence, and a
   number that eases to its value.
   ========================================================================== */

/** anime.js, imported once and shared. Returns null if the CDN is unreachable,
    which is a supported state: every animated layer degrades to a resting
    value or a CSS transition. */
let animePromise = null;
function loadAnime() {
  if (!animePromise) {
    animePromise = import("animejs")
      .then((m) => m.default)
      .catch((err) => {
        console.warn(
          "[plot] anime.js unavailable; resting values and CSS transitions cover the rest.",
          err,
        );
        return null;
      });
  }
  return animePromise;
}

async function initAnimeLayer() {
  if (reduced) return;
  const anime = await loadAnime();
  if (!anime) return;

  // --- the opening sequence. Type first, then the statement, then the plate:
  //     the page settles in the order a reader reads it.
  const opening = [
    "[data-hero-eyebrow]",
    "[data-hero-name] span",
    "[data-hero-positioning]",
    "[data-hero-statement]",
    ".hero__actions",
    ".plate--hero .plate__cell",
  ];
  const present = opening.flatMap((sel) => qa(sel));
  if (present.length) {
    anime.set(present, { opacity: 0 });
    anime({
      targets: present,
      opacity: [0, 1],
      translateY: [16, 0],
      duration: 820,
      delay: anime.stagger(80, { start: 90 }),
      easing: "easeOutExpo",
    });
  }
}

/* --- instrument readouts -------------------------------------------------
   Count up on scroll-in. Deliberately NOT inside the anime layer: reduced
   motion must remove the count-up but never the figure itself, so this runs
   in every mode and simply skips the tween when motion is reduced. */
function initCounters(anime) {
  const counters = qa("[data-count]");
  if (!counters.length) return;

  const target = (n) => Number(n.dataset.count) || 0;
  const paint = (n, v) => {
    n.textContent = `${n.dataset.prefix || ""}${v}${n.dataset.suffix || ""}`;
  };

  const run = (n) => {
    const to = target(n);
    // No tween available (reduced motion, or the CDN failed): the figure still
    // has to be right, so land on it directly.
    if (reduced || typeof anime !== "function") {
      paint(n, to);
      return;
    }
    const obj = { v: 0 };
    anime({
      targets: obj,
      v: to,
      duration: 1100,
      delay: 120,
      easing: "easeOutCubic",
      update: () => {
        paint(n, Math.round(obj.v));
      },
      complete: () => {
        paint(n, to);
      },
    });
  };

  // Resting value up front: the real figure when motion is reduced, and zero
  // only while the count-up is still pending.
  counters.forEach((n) => paint(n, reduced ? target(n) : 0));

  if (!supportsIO) {
    counters.forEach(run);
    return;
  }
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        run(e.target);
        io.unobserve(e.target);
      }),
    { threshold: 0.6 },
  );
  counters.forEach((n) => io.observe(n));
}

/* ==========================================================================
   L8  FRAMER MOTION ISLAND
   Loaded lazily, after first paint, and entirely optional. Two jobs:
     1. the plotter pen      — spring-followed crosshair with a live X/Y readout
     2. magnetic CTAs        — spring pull toward the pointer
   If this import fails for any reason the page is unchanged: every one of
   these is additive, and the CSS fallbacks are already in place.
   ========================================================================== */
async function initFramerIsland() {
  if (reduced || !finePointer.matches) return;

  let React, createRoot, framer, htm, html;
  try {
    [React, framer, htm] = await Promise.all([
      import("react"),
      import("framer-motion"),
      import("htm"),
    ]);
    ({ createRoot } = await import("react-dom/client"));
    html = htm.bind(React.createElement);
  } catch (err) {
    console.warn(
      "[plot] Framer Motion island unavailable; CSS motion only.",
      err,
    );
    return;
  }
  const {
    useState,
    useRef,
    useEffect,
    useMotionValue,
    useSpring,
    useAnimationFrame,
  } = framer;

  /* --- 1. the plotter pen ------------------------------------------------ */
  function Pen() {
    const ref = useRef(null);
    const x = useMotionValue(-200);
    const y = useMotionValue(-200);
    const sx = useSpring(x, { stiffness: 420, damping: 36, mass: 0.4 });
    const sy = useSpring(y, { stiffness: 420, damping: 36, mass: 0.4 });

    const [on, setOn] = useState(false);
    const [armed, setArmed] = useState(false);
    const [label, setLabel] = useState("");
    const [coords, setCoords] = useState("0.000 0.000");
    const seen = useRef(false);

    useEffect(() => {
      const move = (e) => {
        x.set(e.clientX);
        y.set(e.clientY);
        if (!seen.current) {
          seen.current = true;
          setOn(true);
        }
        setCoords(
          `${(e.clientX / window.innerWidth).toFixed(3)} ${(e.clientY / window.innerHeight).toFixed(3)}`,
        );
        const hit =
          e.target instanceof Element
            ? e.target.closest("[data-cursor]")
            : null;
        const next = hit ? hit.dataset.cursor || "" : "";
        setArmed(next.length > 0);
        if (next) setLabel(next);
      };
      const leave = () => setOn(false);
      window.addEventListener("pointermove", move, { passive: true });
      document.addEventListener("pointerleave", leave);
      return () => {
        window.removeEventListener("pointermove", move);
        document.removeEventListener("pointerleave", leave);
      };
    }, [x, y]);

    useAnimationFrame(() => {
      const node = ref.current;
      if (!node) return;
      node.style.transform = `translate3d(${sx.get().toFixed(1)}px, ${sy.get().toFixed(1)}px, 0)`;
    });

    return html`
      <div
        ref=${ref}
        class="pen"
        data-active=${on ? "true" : "false"}
        data-armed=${armed ? "true" : "false"}
        aria-hidden="true"
      >
        <svg class="pen__cross" viewBox="0 0 40 40" focusable="false">
          <path d="M20 4v9M20 27v9M4 20h9M27 20h9"></path>
          <circle cx="20" cy="20" r="1.6" class="pen__dot"></circle>
        </svg>
        <span class="pen__label">${label}</span>
        <span class="pen__coords">${coords}</span>
      </div>
    `;
  }

  /* --- 2. magnetic CTAs --------------------------------------------------
     A real spring per element, writing a transform straight to the existing
     node. React owns the physics; the DOM stays vanilla-owned. */
  function Magnetic({ target }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const sx = useSpring(x, { stiffness: 260, damping: 22, mass: 0.5 });
    const sy = useSpring(y, { stiffness: 260, damping: 22, mass: 0.5 });

    useEffect(() => {
      const node = target;
      if (!node) return;
      node.classList.add("is-magnetic");
      const onMove = (e) => {
        const r = node.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * 0.28);
        y.set((e.clientY - (r.top + r.height / 2)) * 0.34);
      };
      const reset = () => {
        x.set(0);
        y.set(0);
      };
      node.addEventListener("pointermove", onMove);
      node.addEventListener("pointerleave", reset);
      node.addEventListener("blur", reset);
      return () => {
        node.removeEventListener("pointermove", onMove);
        node.removeEventListener("pointerleave", reset);
        node.removeEventListener("blur", reset);
      };
    }, [target, x, y]);

    useAnimationFrame(() => {
      if (!target) return;
      target.style.transform = `translate3d(${sx.get().toFixed(2)}px, ${sy.get().toFixed(2)}px, 0)`;
    });

    return null;
  }

  /* --- mount ------------------------------------------------------------- */
  const host = document.createElement("div");
  host.id = "motion-island";
  host.setAttribute("aria-hidden", "true");
  host.style.cssText =
    "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none";
  document.body.appendChild(host);

  const magnets = Array.from(document.querySelectorAll("[data-magnetic]"));

  const App = () => html`
    <${Pen} />
    ${magnets.map((n, i) => html`<${Magnetic} key=${"m" + i} target=${n} />`)}
  `;

  try {
    createRoot(host).render(html`<${App} />`);
    document.body.classList.add("has-pen");
    // The vanilla pen is replaced once the spring-driven one is live.
    q(".pen")?.setAttribute("data-active", "false");
  } catch (err) {
    console.warn("[plot] motion island failed to mount; CSS motion only.", err);
    host.remove();
  }
}

/* ==========================================================================
   L9  BOOT
   ========================================================================== */
function boot() {
  if (!DATA) {
    // The bootstrap in index.html is watching for this: it un-hides the static
    // shell and shows a notice rather than leaving a blank page.
    console.error(
      "[plot] content.js did not load — the page cannot be populated.",
    );
    return;
  }
  // Tell the bootstrap we are alive, so it does not raise a false alarm if the
  // page is simply slow rather than broken. Done as early as possible: the
  // watchdog in index.html only needs to know we started.
  window.__PLOT_BOOTED = true;
  try {
    renderMeta();
    renderChrome();
    renderHero();
    renderAbout();
    renderWork();
    renderOpenSource();
    renderToolkit();
    renderRecord();
    renderResume();
    renderBeyond();
    renderContact();
    renderFooter();
    buildConvergence();

    initReveal();
    initScrollState();
    initStrata();
    initPointerTracking();

    // The terrain and the motion libraries are all deferred past first paint
    // so they can never delay LCP.
    const afterPaint = () => {
      initTerrain();
      // Counters need the tween engine, so load it once and share it.
      loadAnime().then((lib) => initCounters(lib));
      initAnimeLayer();
      initFramerIsland();
    };
    if ("requestIdleCallback" in window)
      requestIdleCallback(afterPaint, { timeout: 1200 });
    else setTimeout(afterPaint, 260);
  } catch (err) {
    // A throw here still leaves everything that was rendered before it intact,
    // so force the reveal system open rather than stranding it.
    console.error("[plot] boot failed:", err);
    document.documentElement.classList.add("boot-failed");
  }
}

if (document.readyState === "loading")
  document.addEventListener("DOMContentLoaded", boot, { once: true });
else boot();
