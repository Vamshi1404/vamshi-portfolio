/* ============================================================================
   content.js — THE ONLY FILE YOU NEED TO EDIT TO PERSONALISE THIS PORTFOLIO
   ----------------------------------------------------------------------------
   Every piece of personal, project, skill and link content on the site lives
   here. index.html contains structure only; styles.css contains only design
   tokens and layout; main.js contains only behaviour.

   HOW TO EDIT
   - Strings are plain text. Keep them factual — this portfolio deliberately
     avoids inflated claims, invented metrics and fabricated testimonials.
     Every number below is sourced from the résumé, not estimated.
   - `nav`, `sections` and `plates` control the anchor navigation and the
     numbered section headers. Keep the `id` values in sync with the ids that
     already exist in index.html (they are referenced by the nav and the URL
     hash, so changing an id means changing it in both places).
   - `resume.file` points at the resume PDF in assets/. Export the resume to
     assets/resume.pdf and the viewer + download button work with no edits.
   - `openSource[].metrics` are factual counts taken from the contribution.
   - Nothing here is fetched at runtime. No API keys, no backend, no env vars.
   ========================================================================== */

/**
 * The single portfolio data object. Exported on `window.PORTFOLIO` (plain
 * script, no build step) so main.js can read it.
 */
const portfolio = {
  /* -----------------------------------------------------------------------
     person — identity, contact details and public profile links.
     Edit these to change who the site is about.
     --------------------------------------------------------------------- */
  person: {
    /** Full name, used in the hero display type, document title and footer. */
    name: "Borra Vamshi Thirumal Reddy",
    /** Short form used where the full name is too long (footer colophon, meta). */
    shortName: "Vamshi Thirumal Reddy",
    /** Primary positioning line. Rendered as the hero subtitle. */
    role: "AI / ML · Data Systems · LLM Engineering",
    /** One-line identity statement. Used in the hero and the about section. */
    identity:
      "Learning AI systems by building them. LLM engineering, data applications, backend systems.",
    /** Email address. mailto: links are generated from this. */
    email: "vamshithirumal787@gmail.com",
    /* Phone intentionally omitted from the public portfolio. Contact is
       email-first via GitHub / LinkedIn / LeetCode below. */
    /** Primary GitHub profile URL. */
    github: "https://github.com/Vamshi1404",
    /** LinkedIn profile URL. */
    linkedin: "https://www.linkedin.com/in/vamshi-thirumal-reddy",
    /** LeetCode profile URL. */
    leetcode: "https://leetcode.com/vamshi_thirumal_reddy",
    /* Intentionally no location or availability string here: neither is stated
       in the source resume, so nothing is asserted. Add `location` and
       `availability` below (and the matching hero/colophon fields) only once
       they are confirmed, and the layout picks them up automatically. */
  },

  /* -----------------------------------------------------------------------
     meta — document metadata. main.js writes these into the <head> so that
     no personal string has to live inside index.html.
     --------------------------------------------------------------------- */
  meta: {
    /** Browser tab title. */
    title:
      "Borra Vamshi Thirumal Reddy · AI/ML, Data Systems, LLM Engineering",
    /** Meta description for search engines. */
    description:
      "Portfolio of Borra Vamshi Thirumal Reddy. Builds AI/ML systems, data-intensive applications and LLM infrastructure: NL-to-SQL analytics, verification pipelines, repo intelligence, plus open-source work.",
    /** Theme colour matched to the paper background token in styles.css. */
    themeColor: "#f5f2ec",
  },

  /* -----------------------------------------------------------------------
     nav — the minimal anchor navigation. `id` must match a section id in
     index.html.
     --------------------------------------------------------------------- */
  nav: [
    { id: "resume", label: "View Resume" },
    { id: "contact", label: "Contact", cta: true },
  ],

  /* -----------------------------------------------------------------------
     hero — the opening plate. The 3D contour terrain is generated in main.js
     from `terrain` settings; these strings are the typographic layer.
     --------------------------------------------------------------------- */
  hero: {
    /** Small mono label above the name. */
    eyebrow: "Portfolio",
    /**
     * The name, split into display lines. Each array item becomes one line of
     * the hero heading. An item may be wrapped in *asterisks* to render in
     * the display serif's italic — used here to set the middle name apart.
     */
    nameLines: ["Borra Vamshi", "*Thirumal* Reddy"],
    /** Positioning line, rendered directly under the name. */
    positioning: "AI / ML · Data Systems · LLM Engineering",
    /**
     * Supporting statement, derived from the projects in this file.
     * Three short clauses that name what the work actually does.
     */
    statement:
      "I build AI systems that turn messy data and complex questions into reliable software.",
    /* Location and availability are omitted on purpose — see the note on
       `person` above. The hero plate and colophon fall back to the role line
       when these are absent. */
    /**
     * Instrument readouts shown in the hero plate strip along the bottom.
     * Engineering facts only — no grades, no single-proof framing.
     */
    readouts: [
      { label: "Builds", value: "LLM systems · data apps" },
      { label: "Core", value: "Python · SQL · FastAPI" },
    ],
    /**
     * Terrain settings for the signature Three.js contour landscape.
     * `intensity` controls the noise amplitude, `levels` the number of
     * iso-height contour lines, `seed` shifts the generated field so the
     * landscape is deterministic across reloads.
     */
    terrain: {
      seed: 7.3,
      intensity: 1.0,
      levels: 22,
      gridSize: 96,
      /** Camera orbit speed. Set to 0 for a completely static scene. */
      spin: 0.055,
    },
  },

  /* -----------------------------------------------------------------------
     about — editorial biography and the specification list that supports it.
     `body` is an array of paragraphs. Keep paragraphs short: two or three
     sentences each. There is deliberately no photograph in this layout.
     --------------------------------------------------------------------- */
  about: {
    /** Section eyebrow. */
    eyebrow: "About",
    /** Large editorial statement that sets up the biography. */
    headline: "LLM systems and data apps, verified before they ship.",
    body: [
      "I'm learning AI systems by building them. My work spans AI/ML engineering, LLM systems, data-heavy applications, and backend services.",
      "I build natural-language data interfaces, retrieval and verification systems, data pipelines, and developer tooling. My loop: build, test, verify, deploy. Checks, not guesses.",
      "Recent work: BaseWise (self-checking NL to SQL plus analytics), Pramana (retrieval-based misinformation checks), Reposort (AI repo intelligence plus auto-repair), plus upstream LLM routing work in HoloViz Lumen.",
    ],
    marginalia: [
      { term: "Method", value: "Build → test → verify → deploy" },
      { term: "Focus", value: "LLM systems · data · backend" },
    ],
    spec: [
      {
        term: "Problems",
        value:
          "Natural-language data interfaces, LLM apps, retrieval systems, verification systems, data pipelines, developer tooling",
      },
      {
        term: "Systems",
        value: "Python · SQL · FastAPI · PostgreSQL · Docker · Redis · GCP",
      },
      {
        term: "Practice",
        value: "RAG · LLM self-audit · REST APIs · ETL · vector search · CI/CD",
      },
    ],
  },

  /* -----------------------------------------------------------------------
     work — the selected projects. Each one is title + description +
     short bullets + link + stack. No diagrams.
     Order matters: the first project is treated as the flagship.
     --------------------------------------------------------------------- */
  work: {
    eyebrow: "Selected Work",
    headline: "Projects",
    projects: [
      {
        /* --- identity --- */
        id: "basewise",
        title: "BaseWise",
        subtitle: "Natural Language to SQL & Analytics",
        year: "2026",
        /** Marks the project as the flagship case study. Rendered larger. */
        flagship: true,
        /** Real repository URL. */
        repo: "https://github.com/Vamshi1404/BaseWise",
        /** Link label. Use "View on GitHub" when there is no live demo. */
        linkLabel: "View on GitHub",
        /** One line. Factual only. Detail lives in `points` below. */
        description:
          "Plain-English questions to validated SQL, explanations, and charts.",
        /** Short precise bullets. Factual only, from the project itself. */
        points: [
          "Runs on linked PostgreSQL databases. FastAPI plus SQLAlchemy backend, React frontend.",
          "Keyword plus embedding retrieval finds the right tables.",
          "A second LLM pass audits the SQL. Catches about 1 in 8 to 10 queries in testing.",
          "Every answer carries 3-tier confidence and auto chart data.",
          "Fernet-encrypted credentials, JWT auth, injection guards, audit log.",
        ],
        /** Technology stack. Rendered as mono chips. */
        stack: [
          "Python",
          "FastAPI",
          "SQLAlchemy",
          "PostgreSQL",
          "LLM Orchestration",
          "Groq",
          "Gemini",
          "SQL",
          "Data Pipelines",
          "React",
          "TypeScript",
        ],
      },
      {
        id: "pramana",
        title: "Pramana",
        subtitle: "Misinformation Verification Pipeline",
        year: "Sep 2025 to Jan 2026",
        flagship: false,
        repo: "https://github.com/channi23/OrangeLens",
        linkLabel: "View on GitHub",
        description:
          "Text or image claims checked against live sources. True, false, or misleading.",
        /** Short precise bullets. Factual only, from the project itself. */
        points: [
          "Gemini API on Vertex AI retrieves live web evidence per claim.",
          "Handles text, image, and mixed posts with preprocessing.",
          "Content-hash ledger caches verdicts. Repeats hit cache about 1 in 5 times.",
          "Cached verdicts return in under 2 seconds.",
        ],
        stack: [
          "Python",
          "Gemini API",
          "Vertex AI",
          "Google Cloud Platform",
          "Retrieval-Augmented Verification",
        ],
      },
      {
        id: "reposort",
        title: "Reposort",
        subtitle: "AI Repo Intelligence & Auto-Repair",
        year: "Dec 2025 to Feb 2026",
        flagship: false,
        repo: "https://github.com/channi23/RepoSort",
        linkLabel: "View on GitHub",
        description:
          "Codebases mapped to architecture graphs, with scans, fix plans, and diffs.",
        /** Short precise bullets. Factual only, from the project itself. */
        points: [
          "NestJS plus Redis backend processes sandboxed repos, 2 to 3 at once.",
          "Next.js plus React Flow UI shows the architecture graph.",
          "Detects hardcoded secrets, unsafe eval, missing input validation.",
          "AI refactor plans with auto diffs. Walkthroughs 20 to 8 min in testing, review effort down about a third.",
        ],
        stack: [
          "NestJS",
          "Redis",
          "Next.js",
          "React Flow",
          "Gemini API",
          "GitHub",
        ],
      },
    ],
  },

  /* -----------------------------------------------------------------------
     openSource — a dedicated annex, visually distinct from the project
     plates. Facts are taken directly from the contribution record.
     --------------------------------------------------------------------- */
  openSource: {
    eyebrow: "Open Source",
    headline: "Work in the open.",
    lede: "Contributions and engineering work in public repositories. One part of a broader practice building AI and data systems.",
    contributions: [
      {
        project: "HoloViz Lumen",
        repo: "https://github.com/holoviz/lumen",
        role: "Contributor",
        roleNote: "Upstream contribution · LLM utilities",
        summary:
          "Opt-in LLM routing across two model tiers, with Pydantic-validated schema, SDK fixes, docs, and tests.",
        /**
         * Router diagram. Two tiers, a router, and a fallback path.
         * `tiers` are the two configured model tiers; the router picks one
         * based on task complexity and falls back to the other on failure.
         */
        routing: {
          routerLabel: "Router",
          routerNote: "Picks tier by complexity",
          tiers: [
            { id: "tier-a", label: "Tier A", note: "Primary band" },
            { id: "tier-b", label: "Tier B", note: "Alternate band" },
          ],
          fallbackNote: "Auto fallback on failure",
        },
        /** Additional work shipped alongside the routing feature. */
        highlights: [
          "Opt-in routing + fallback",
          "Pydantic-validated schema",
          "SDK kwargs + routing-key fixes",
          "Docs fixed: Panel · governance · hvPlot",
        ],
        /** Factual counts from the contribution. Rendered as instrument readouts. */
        metrics: [
          { label: "Tiers", value: 2, suffix: "" },
          { label: "Tests", value: 6, suffix: "" },
          { label: "Coverage", value: 98, suffix: "%", prefix: "~" },
          { label: "Review rounds", value: 4, suffix: "" },
          { label: "Doc fixes", value: 4, suffix: "" },
        ],
        linkLabel: "View on GitHub",
      },
    ],
  },

  /* -----------------------------------------------------------------------
     toolkit — "The Stack". Five groups, each a list of technologies.
     All groups render expanded — no click required. Deliberately NOT a tag
     cloud and NOT progress bars: fixed order, plain lists under headers.
     Every item below appears in the résumé's Technical Skills section.
     --------------------------------------------------------------------- */
  toolkit: {
    eyebrow: "The Stack",
    headline: "From model to interface.",
    lede: "What I reach for to build LLM systems and data applications: models and retrieval, data and storage, backend and deployment, interfaces for decisions.",
    groups: [
      {
        index: "01",
        name: "AI & LLM Engineering",
        note: "Models, retrieval & orchestration",
        items: [
          "LLM Orchestration",
          "Gemini",
          "Mistral",
          "Groq",
          "LangChain",
          "LangGraph",
          "RAG",
          "Prompt Engineering",
          "Vertex AI",
          "LLM Evaluation",
          "LLM Routing",
        ],
      },
      {
        index: "02",
        name: "Data Engineering",
        note: "Storage, processing & analysis",
        items: [
          "Python",
          "SQL",
          "Pandas",
          "NumPy",
          "Scikit-learn",
          "TensorFlow",
          "PostgreSQL",
          "BigQuery",
          "DuckDB",
          "ETL Pipelines",
          "Data Pipeline Design",
          "Data Modeling",
          "Data Cleaning & Wrangling",
          "Statistical Analysis",
          "Hypothesis Testing",
        ],
      },
      {
        index: "03",
        name: "Backend Engineering",
        note: "APIs, services & infrastructure",
        items: [
          "Java",
          "FastAPI",
          "REST APIs",
          "SQLAlchemy",
          "Redis",
          "Supabase",
          "Docker",
          "CI/CD",
          "Data Structures & Algorithms",
          "DBMS",
          "Data Mining",
        ],
      },
      {
        index: "04",
        name: "Cloud & DevOps",
        note: "Deployment, versioning & delivery",
        items: [
          "Google Cloud Platform",
          "Docker",
          "Git",
          "GitHub",
          "Agile/Scrum",
        ],
      },
      {
        index: "05",
        name: "Analytics & Visualization",
        note: "Insights, dashboards & reporting",
        items: [
          "Data Visualization",
          "KPI & Trend Reporting",
          "Dashboarding",
          "Automated Report Generation",
          "Business Intelligence",
          "Predictive Modeling",
          "Regression",
          "Classification",
          "Feature Engineering",
          "Exploratory Data Analysis",
        ],
      },
    ],
  },

  /* -----------------------------------------------------------------------
     record — experience and education, presented as a chronological ledger.
     Do not invent employment. The open-source contribution is listed as the
     primary record item because it is the one with a verifiable outcome.
     --------------------------------------------------------------------- */
  record: {
    eyebrow: "Record",
    headline: "Study, backed by shipped work.",
    entries: [
      {
        kind: "Education",
        title: "B.Tech, CSE (AI & ML)",
        org: "CVR College of Engineering · JNTUH",
        period: "2023 to 2027",
        detail:
          "Coursework in ML, deep learning, statistics, AI, DSA, DBMS, and data mining.",
        coursework: [
          "ML",
          "Deep Learning",
          "Statistics & Probability",
          "AI",
          "DSA",
          "DBMS",
          "Data Mining",
        ],
        featured: false,
      },
      {
        kind: "Open Source",
        title: "HoloViz Lumen, Contributor",
        org: "HoloViz",
        period: "2026",
        detail:
          "Opt-in LLM routing across two model tiers, with schema validation, SDK fixes, docs, and tests. See Open Source for detail.",
        link: "https://github.com/holoviz/lumen",
        linkLabel: "View on GitHub",
        /** Renders the entry with the signal accent. */
        featured: false,
      },
    ],
  },

  /* -----------------------------------------------------------------------
     resume — single-file CV. `file` must point at the PDF in assets/.
     Drop the exported resume at assets/resume.pdf and both the viewer and
     the download button pick it up with no other change.
     --------------------------------------------------------------------- */
  resume: {
    eyebrow: "Resume",
    headline: "The full picture.",
    lede: "Education, skills, projects, and open-source work, set in this site's own type system below. Download produces the same resume as a PDF.",
    /** Small caption next to the download button. */
    note: "Themed sheet · PDF on download",
    /** Label for the download button. */
    downloadLabel: "Download PDF",
    /* Phone and CGPA from the source file are intentionally not published
       here — contact stays email-first and grades stay off the portfolio. */
    name: "Borra Vamshi Thirumal Reddy",
    role: "AI / ML · Data Systems · LLM Engineering",
    summary:
      "Learning AI systems by building them. Focused on data analysis, statistical modeling, and applied machine learning. Experience building end-to-end data pipelines, predictive models, and LLM-powered analytics platforms that turn raw and relational data into business-ready insights. Active open-source contributor to the HoloViz visualization ecosystem (Panel, hvPlot). Comfortable across the modern data stack, including Python, SQL, Pandas, Scikit-learn, PyTorch, and TensorFlow, with hands-on work in natural-language-to-SQL systems, automated reporting, and KPI/trend analysis.",
    education: {
      school: "CVR College of Engineering",
      degree:
        "Bachelor of Technology (B.Tech), Computer Science & Engineering (AI & ML)",
      affiliation: "Affiliated to JNTUH, Hyderabad",
      period: "Sep 2023 to Jun 2027",
      coursework:
        "Machine Learning, Deep Learning, Statistics & Probability, AI, Data Structures & Algorithms, DBMS, Data Mining",
    },
    skillGroups: [
      { category: "Languages", items: "Python, SQL, Java" },
      {
        category: "Data Science & ML",
        items:
          "Pandas, NumPy, Scikit-learn, TensorFlow, Statistical Analysis, Hypothesis Testing, Predictive Modeling, Feature Engineering, EDA, Regression & Classification",
      },
      {
        category: "Data Engineering & Databases",
        items:
          "PostgreSQL, SQLAlchemy, BigQuery, DuckDB, Redis, Supabase, ETL & Data Pipeline Design, Data Cleaning & Wrangling, Data Modeling",
      },
      {
        category: "AI & LLM Systems",
        items:
          "LLM Orchestration (Gemini, Mistral, Groq), LangChain, LangGraph, Retrieval-Augmented Generation, Prompt Engineering, Vertex AI, LLM Evaluation & Routing",
      },
      {
        category: "Visualization & Reporting",
        items:
          "KPI & Trend Reporting, Dashboarding, Automated Report Generation (PDF/HTML/JSON), Business Intelligence",
      },
      {
        category: "Cloud & Tools",
        items:
          "Google Cloud Platform, Docker, Git, GitHub, FastAPI, REST APIs, CI/CD, Agile/Scrum",
      },
    ],
    openSource: {
      project: "holoviz/lumen: AI-powered data analytics and visualization framework",
      period: "2026",
      role: "Merged Contributor",
      bullets: [
        "Designed and shipped an opt-in model-routing feature for the LLM invocation layer, selecting between 2 model tiers by task complexity, with a Pydantic-validated schema and automatic fallback on routing failures.",
        "Authored a unit-test suite of 6 tests covering routing decisions, exception handling, SDK-kwargs stripping, and backward compatibility, reaching ~98% patch coverage on the change.",
        "Addressed 4 rounds of maintainer review, resolving edge cases in SDK constructor kwargs and routing-key handling before merge.",
        "Identified and fixed 4 broken documentation links across the Panel, HoloViz governance, and hvPlot pages, verifying each replacement URL.",
      ],
    },
    projects: [
      {
        title: "BaseWise: AI-Powered Natural Language to SQL and Data Analytics Platform",
        period: "2026",
        bullets: [
          "Built an end-to-end natural-language-to-SQL platform (FastAPI, SQLAlchemy, PostgreSQL) that turns plain-English questions into validated SQL, explanations, and confidence scores across multiple linked databases.",
          "Designed a self-verification pipeline where a second LLM pass audits generated SQL against schema and intent, catching misjoins in roughly 1 of every 8 to 10 queries during testing.",
          "Built a 3-tier confidence-scoring system combining LLM self-assessment with execution signals, an autonomous Analysis Mode that auto-generates chart-ready statistics, and secured the pipeline with Fernet-encrypted credentials, JWT authentication, and full audit logging.",
        ],
        stack:
          "Python, FastAPI, SQLAlchemy, PostgreSQL, LLM Orchestration (Groq/Gemini), React, TypeScript",
      },
      {
        title: "Pramana: LLM-Based Retrieval and Misinformation Verification Pipeline",
        period: "Sep 2025 to Jan 2026",
        bullets: [
          "Designed a hybrid content-verification pipeline using the Gemini API (Vertex AI) to classify content as true, false, or misleading via retrieval-based fact-checking, tested across text, image, and mixed-post categories.",
          "Built a content-hash ledger with verify-once caching, skipping repeat verification for roughly 1 in 5 previously seen items and cutting cached response time to under 2 seconds, backed by text and image preprocessing.",
        ],
        stack:
          "Python, Gemini API (Vertex AI), Google Cloud Platform, Retrieval-Augmented Verification",
      },
      {
        title: "RepoSort: AI Repo Intelligence and Auto-Repair System",
        period: "Dec 2025 to Feb 2026",
        bullets: [
          "Built the AI planning engine, graph-based repo-analysis pipeline, and a scalable NestJS + Redis backend for multi-stage, sandboxed repository processing, cutting first-pass code walkthroughs from ~20 to ~8 minutes while handling 2 to 3 repos concurrently in testing.",
          "Implemented static analysis and security scanning for common vulnerabilities (hardcoded secrets, unsafe eval, missing input validation) and generated AI-driven refactor plans with automated diffs, cutting manual review on flagged files by roughly a third in internal trials.",
        ],
        stack: "NestJS, Redis, Next.js, React Flow, Gemini API, GitHub",
      },
    ],
    profiles: [{ label: "LeetCode", value: "vamshi_thirumal_reddy" }],
  },

  /* -----------------------------------------------------------------------
     contact — the closing movement. No form: a direct email CTA plus the
     four public links. All links are generated from person.* above.
     --------------------------------------------------------------------- */
  contact: {
    eyebrow: "Contact",
    /** The large closing statement. The CTA label is separate so it can be
     *  phrased as an action. */
    headline: "Let's build",
    headlineAccent: "intelligent systems.",
    /** Text above the primary CTA. */
    lede: "I build AI systems that turn messy data and complex questions into reliable software. Email is fastest. Include context, data, and timeline.",
    /** Primary call to action. Becomes a mailto: link to person.email. */
    cta: "Email me",
    /** Small line under the CTA. */
    ctaNote: "Replies in a day or two. No form, no tracking.",
    /** The closing readouts. Email + public profiles only. */
    readouts: [
      {
        label: "Email",
        valueKey: "email",
        hrefKey: "email",
        hrefPrefix: "mailto:",
      },
      {
        label: "GitHub",
        valueKey: "github",
        hrefKey: "github",
        hrefPrefix: "",
      },
      {
        label: "LinkedIn",
        valueKey: "linkedin",
        hrefKey: "linkedin",
        hrefPrefix: "",
      },
      {
        label: "LeetCode",
        valueKey: "leetcode",
        hrefKey: "leetcode",
        hrefPrefix: "",
      },
    ],
  },

  /* -----------------------------------------------------------------------
     footer — colophon. Deliberately technical, like the back of a chart plate.
     --------------------------------------------------------------------- */
  footer: {
    /** Line under the wordmark. */
    note: "Static. One file. No trackers.",
    /** Small print line. */
    colophon: "Instrument + Mono. Drawn with Three.js.",
    /** Label for the back-to-top control. */
    backToTop: "Back to top",
  },
};

/* Expose the data for main.js. Also assigned to window so the page keeps
   working if this file is loaded as a plain script before main.js. */
if (typeof window !== "undefined") {
  window.PORTFOLIO = portfolio;
}
