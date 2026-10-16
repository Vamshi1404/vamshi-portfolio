/* ============================================================================
   PLOT — main.js
   ----------------------------------------------------------------------------
   Behaviour only. Every string rendered here comes from content.js. Nothing in
   this file knows the person's name, their projects or their links.

   LAYERS, in the order they run
   ─────────────────────────────────────────────────────────────────────────────
   L0  environment          capability detection
   L1  dom helpers         el(), text-safe setters
   L2  renderers           one function per section, all fed from PORTFOLIO
   L3  chrome              scroll spy for the anchor navigation
   Static build: no animation libraries, no canvas, no network calls.

   Text is written with textContent / createTextNode throughout, so content.js
   can never inject markup. No innerHTML with data anywhere in this file.
   ========================================================================== */

/* ==========================================================================
   L0  ENVIRONMENT
   ========================================================================== */
const DATA = window.PORTFOLIO;
const root = document.documentElement;

const supportsIO = "IntersectionObserver" in window;

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

/* Static build: reveal is a no-op. Content is visible by default via CSS,
   so nothing can ever be stranded invisible by an enhancement layer. */
function reveal(node) {
  return node;
}

/** Set a CSS custom property on an element. */
function setVar(node, name, value) {
  if (node) node.style.setProperty(name, value);
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
  /* Full name on wide screens; first name only below 640px (CSS toggles
     which span shows, so no JS is involved in the switch). */
  const full = q("[data-wordmark-full]");
  if (full) full.textContent = DATA.person.name;
  const short = q("[data-wordmark-short]");
  if (short) short.textContent = DATA.person.shortName.split(" ")[0];

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

/* Projects are always open: title plus full content, no toggle. */
function buildProject(p, i) {
  const frame = el("article", ["fold", "fold--project", "fold--static"]);
  frame.id = `project-${p.id}`;

  const head = el("div", "fold__head");
  const titles = el("span", "fold__titles");
  const meta = el("span", "fold__meta");
  meta.appendChild(el("span", null, p.year));
  if (p.flagship) meta.appendChild(el("span", null, "Flagship"));
  titles.appendChild(meta);
  titles.appendChild(el("span", "fold__title", p.title));
  head.appendChild(titles);
  frame.appendChild(head);

  const body = el("div", "fold__body");
  body.appendChild(el("p", "pf__desc", p.description));
  /* Short precise bullets. Only rendered from content.js — no invented copy. */
  if (p.points?.length) {
    const ul = el("ul", "pf__points");
    p.points.forEach((t) => ul.appendChild(el("li", null, t)));
    body.appendChild(ul);
  }
  const link = el("a", "pf__link", p.linkLabel);
  link.href = p.repo;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.setAttribute(
    "aria-label",
    `${p.linkLabel}, ${p.title} repository (opens in a new tab)`,
  );
  body.appendChild(link);
  const chips = el("div", "chips");
  p.stack.forEach((s) => chips.appendChild(el("span", "chip", s)));
  body.appendChild(chips);
  frame.appendChild(body);

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

  DATA.openSource.contributions.forEach((c, i) => {
    const card = el("details", ["fold", "fold--oss"]);
    if (i === 0) card.setAttribute("open", "");

    const head = el("summary", "fold__head");
    const titles = el("span", "fold__titles");
    titles.appendChild(el("span", "fold__meta", c.role));
    titles.appendChild(el("span", "fold__title", c.project));
    head.appendChild(titles);
    head.appendChild(el("span", "fold__sign", "+"));
    card.appendChild(head);

    const body = el("div", "fold__body");
    body.appendChild(el("p", "osscard__summary", c.summary));
    body.appendChild(el("p", "osscard__note", c.roleNote));

    /* plain metric lines: label and figure, no animated instruments */
    const inst = el("ul", "fold__metrics");
    c.metrics.forEach((m) => {
      inst.appendChild(
        el("li", null, `${m.label}: ${m.prefix || ""}${m.value}${m.suffix || ""}`),
      );
    });
    body.appendChild(inst);

    /* additional work */
    const listEl = el("ul", "hlist");
    c.highlights.forEach((h) => listEl.appendChild(el("li", null, h)));
    body.appendChild(listEl);

    const link = el("a", "pf__link", c.linkLabel);
    link.href = c.repo;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute(
      "aria-label",
      `${c.linkLabel}, ${c.project} repository (opens in a new tab)`,
    );
    body.appendChild(link);

    card.appendChild(body);
    oss.appendChild(card);
  });

  list.appendChild(oss);
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
    const stratum = el("details", ["fold", "fold--stratum"]);
    if (i === 0) stratum.setAttribute("open", "");

    const btn = el("summary", "fold__head");
    btn.appendChild(el("span", "fold__meta", g.index));
    const nameWrap = el("span", "fold__titles");
    nameWrap.appendChild(el("span", "fold__title", g.name));
    nameWrap.appendChild(el("span", "fold__sub", g.note));
    btn.appendChild(nameWrap);
    const count = el("span", "fold__count");
    count.appendChild(
      el("span", null, String(g.items.length).padStart(2, "0")),
    );
    count.appendChild(el("span", "fold__sign", "+"));
    btn.appendChild(count);
    stratum.appendChild(btn);

    const panel = el("div", "fold__body");
    const list = el("ul", "stratum__list");
    g.items.forEach((item, k) => {
      list.appendChild(el("li", "stratum__item", item));
    });
    panel.appendChild(list);
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

    const fold = el("details", "fold");
    if (i === 0) fold.setAttribute("open", "");
    const head = el("summary", "fold__head");
    const titles = el("span", "fold__titles");
    const meta = el("span", "fold__meta");
    meta.appendChild(el("span", null, e.kind));
    meta.appendChild(el("span", null, e.period));
    titles.appendChild(meta);
    titles.appendChild(el("span", "fold__title", e.title));
    head.appendChild(titles);
    head.appendChild(el("span", "fold__sign", "+"));
    fold.appendChild(head);

    const main = el("div", "fold__body");
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
      a.setAttribute(
        "aria-label",
        `${e.linkLabel}, ${e.title} (opens in a new tab)`,
      );
      main.appendChild(a);
    }

    fold.appendChild(main);
    item.appendChild(fold);
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
    wrap.appendChild(el("h3", "rsheet__h", title));
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
      /* Arrow lives inside the dd so the dl contains only dt/dd groups. */
      dd.appendChild(el("span", "crecord__arrow", external ? " ↗" : " →"));
      row.appendChild(dd);
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

    /* Clean static build: content renders fully visible with no motion
       systems. initScrollState keeps the nav spy and masthead state.
       Terrain, counters, cursor, magnetics, the anime layer and the
       framer island are never started, so the page has zero CDN
       dependencies and renders identically everywhere. */
    initScrollState();
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
