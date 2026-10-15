/**
 * SINGLE SOURCE OF TRUTH for all site content.
 *
 * Every string the user sees lives here. Components never hardcode copy, so
 * content can change without touching markup (and so the hero can be swapped
 * without a rebuild — spec §27).
 *
 * INTEGRITY RULES — do not break these:
 *   1. No invented metrics. Unknown numbers are `null` and render as a visible
 *      TODO chip in development, and are omitted entirely in production.
 *   2. No invented testimonials, client names, or achievements.
 *   3. Anything marked `TODO:` is awaiting a real answer from Nithin.
 *
 * Sources: PORTFOLIO_QUESTIONNAIRE.md (Parts 0–19) + DECISIONS.md.
 */

export interface NavLink {
  label: string
  href: string
}

export interface SocialLink {
  label: string
  url: string
  icon: 'mail' | 'linkedin' | 'github' | 'file'
}

export interface Stat {
  /** `null` = not yet supplied. Never guess. */
  value: number | null
  suffix?: string
  label: string
}

export interface Project {
  id: string
  title: string
  category: string
  tech: string[]
  problem: string
  approach: string
  /** `null` = no defensible metric supplied yet. */
  result: string | null
  /** Public link, or null when the work is internal/not publicly visible. */
  link: string | null
  /** Why there is no link — shown instead of a dead CTA. */
  linkNote?: string
}

export interface ExperienceItem {
  company: string
  role: string
  start: string
  end: string
  location: string
  current?: boolean
  summary: string
  highlights: string[]
  tech: string[]
}

export interface SkillGroup {
  label: string
  items: string[]
}

export interface Principle {
  title: string
  detail: string
}

// ---------------------------------------------------------------------------
// IDENTITY (Q1.1, Q1.2, Q1.3, Q1.7, Q1.8, Q1.9)
// ---------------------------------------------------------------------------

export const site = {
  wordmark: 'NITHIN',
  fullName: 'Nithin Kadaru',
  roleLabel: '.NET DEVELOPER',
  seoTitle: 'Nithin Kadaru — Backend .NET Engineer',
  seoDescription:
    'Backend .NET engineer building the APIs, services and integrations enterprise systems run on. Selected work, experience and contact.',
  /**
   * Q1.9: no custom domain yet — Vercel project subdomain.
   *
   * This must match the slug Vercel assigns the project. Confirm it on the
   * dashboard after the first deploy; if it differs, update ALL FOUR of:
   *   - here
   *   - index.html (canonical, og:url, og:image, twitter:image, JSON-LD url)
   *   - public/sitemap.xml
   *   - public/robots.txt
   */
  canonicalUrl: 'https://nithin-kadaru-portfolio.vercel.app',
  location: 'West Chester, PA',
} as const

// ---------------------------------------------------------------------------
// HERO (Q1.4, Q1.5, Q1.6, spec §9, §10)
//
// NOTE ON SOURCING: Q1.4 as submitted was a 60-word resume summary — unusable
// at display type size (it would fill the viewport and bury the 3D subject the
// spec requires at 75–85% height). The headline/supporting line below are
// Nithin's own words, taken from the text he put in the Q1.6 field, which was
// itself a headline rather than a button label. The full resume paragraph is
// reused verbatim as the About copy. Nothing here is invented.
// ---------------------------------------------------------------------------

export const hero = {
  label: site.roleLabel,
  /**
   * Kept deliberately short. At display type size a 70-character sentence
   * overflows its column and collides with the 3D subject, which spec §9
   * forbids ("without covering the face"). The rest of the sentence moves to
   * `supporting` below — no wording is lost, it is only redistributed.
   */
  headline: 'I build scalable backend systems.',
  supporting:
    'Modern full-stack web applications on C#, .NET, ASP.NET Core, REST APIs and SQL Server — secure, high-performance services that businesses run on.',
  primaryCta: { label: 'View My Work', href: '#work' },
  secondaryCta: { label: 'Download Resume', href: '/resume/Nithin-Kadaru-Resume.pdf' },
  scrollHint: 'SCROLL TO EXPLORE',
} as const

// ---------------------------------------------------------------------------
// LOADER (Q4.1, Q4.2 — both counter and line)
// ---------------------------------------------------------------------------

export const loader = {
  wordmark: site.wordmark,
  message: 'Loading experience',
  showCounter: true,
  showLine: true,
} as const

// ---------------------------------------------------------------------------
// NAVIGATION (spec §5). Services dropped — Q0.2 is a job search, not client work.
// ---------------------------------------------------------------------------

export const navLinks: NavLink[] = [
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#work' },
  { label: 'Experience', href: '#experience' },
  { label: 'Skills', href: '#skills' },
  { label: 'Contact', href: '#contact' },
]

export const navCta = { label: 'Get in Touch', href: '#contact' }

// ---------------------------------------------------------------------------
// CONTACT (Part 2). Q2.1 = no form, direct editorial links only.
// ---------------------------------------------------------------------------

export const socials: SocialLink[] = [
  { label: 'Email', url: 'mailto:nithin12.reddy@outlook.com', icon: 'mail' },
  {
    label: 'LinkedIn',
    url: 'https://www.linkedin.com/in/nithin-reddy-kadaru',
    icon: 'linkedin',
  },
  { label: 'GitHub', url: 'https://github.com/NKadaru', icon: 'github' },
]

export const contact = {
  label: 'CONTACT',
  heading: 'Have a role in mind? Let’s talk.',
  supporting:
    'Open to backend and full-stack .NET engineering roles. The fastest way to reach me is email — I reply to everything.',
  email: 'nithin12.reddy@outlook.com',
  /**
   * Phone (Q2.0): supplied privately, DELIBERATELY NOT RENDERED and
   * deliberately not recorded in source — a number in a public repository is
   * as scrapable as one in the page.
   *
   * Awaiting Nithin's decision between: omit entirely / JS-obfuscate /
   * resume-PDF-only. Until then this stays null.
   */
  phone: null as string | null,
  resumeUrl: '/resume/Nithin-Kadaru-Resume.pdf',
  /** TODO: Nithin to supply the actual PDF. Button hidden until the file exists. */
  resumeAvailable: false,
} as const

// ---------------------------------------------------------------------------
// ABOUT (Q1.4 verbatim, spec §11)
// ---------------------------------------------------------------------------

export const about = {
  label: 'ABOUT',
  heading: 'More than a .NET developer.',
  body: [
    'Results-driven .NET backend and full-stack developer with experience designing, developing and maintaining scalable web applications using C#, .NET, ASP.NET Core, RESTful APIs, SQL Server and modern front-end technologies.',
    'Skilled in building secure, high-performance solutions, integrating APIs, optimizing database operations and delivering reliable software aligned with business requirements.',
  ],
} as const

/**
 * STATS (Q5.3) — spec §11 wants four. Only two are currently defensible from
 * the resume. The other two are `null` until Nithin supplies real figures;
 * they will not render rather than show a fabricated number.
 */
export const stats: Stat[] = [
  { value: 5, suffix: '+', label: 'Years shipping production software' },
  { value: 4, suffix: '+', label: 'Years building enterprise .NET at CTDI' },
  { value: null, label: 'TODO: billing systems integrated' },
  { value: null, label: 'TODO: engineers onboarded / mentored' },
]

// ---------------------------------------------------------------------------
// MARQUEE (Q6.1, spec §12)
// ---------------------------------------------------------------------------

export const marqueeItems: string[] = [
  '.NET ENGINEERING',
  'API DESIGN',
  'SYSTEM INTEGRATION',
  'CLOUD & CI/CD',
  'FULL-STACK DEVELOPMENT',
  'AI-ASSISTED DEVELOPMENT',
]

// ---------------------------------------------------------------------------
// SELECTED WORK (Part 7, spec §13, §14)
//
// SOURCING NOTE: these four are drawn from work Nithin describes doing at CTDI
// and TCS in his own Part 8 answers — real shipped systems, not the three
// hypothetical project ideas from the Q1.6 answer (a support-ticket system, an
// auth platform and a reporting dashboard), which he explicitly labelled
// "project ideas, not claims that you've already built them."
//
// `result` is null on every entry because no defensible metric has been
// supplied yet. These are the highest-value blanks on the whole site:
// a recruiter reads outcomes, not responsibilities.
// ---------------------------------------------------------------------------

export const projects: Project[] = [
  {
    id: 'billing-translation-layer',
    title: 'Billing Systems Translation Layer',
    category: 'Enterprise Integration',
    tech: ['.NET 10', 'C#', 'ASP.NET Core Web API', 'REST', 'SQL Server'],
    problem:
      'Multiple billing platforms spoke incompatible data formats, so every new integration meant bespoke point-to-point glue code.',
    approach:
      'Built web services in .NET 10 that act as a translation layer between systems, normalizing data formats so disparate platforms communicate through one consistent contract.',
    result: null, // TODO: systems integrated? integration time saved? volume handled?
    link: null,
    linkNote: 'Internal enterprise system — not publicly accessible',
  },
  {
    id: 'warehouse-management',
    title: 'Warehouse Management & Order Fulfillment',
    category: 'Enterprise Platform',
    tech: ['C#', 'ASP.NET Core', 'EF Core', 'SQL Server', '.NET Core MVC'],
    problem:
      'Inventory tracking, order processing and fulfillment workflows needed to run as one coherent end-to-end system.',
    approach:
      'Designed and developed the platform end to end — inventory tracking, order processing and fulfillment workflows — including schema design, stored procedures and the REST APIs above them.',
    result: null, // TODO: orders/day? sites live? error-rate or throughput change?
    link: null,
    linkNote: 'Internal enterprise system — not publicly accessible',
  },
  {
    id: 'cloud-native-aws',
    title: 'Cloud-Native Services on AWS',
    category: 'Cloud & Platform',
    tech: ['AWS Lambda', 'Cognito', 'ECS', 'S3', 'Elasticsearch/Kibana', 'PostgreSQL'],
    problem:
      'Enterprise .NET workloads needed to run and scale as cloud-native services with managed auth, search and secret handling.',
    approach:
      'Built and supported services across Lambda, ECS and S3, with Cognito for identity, Secrets Manager for credentials, PostgreSQL for persistence, and Elasticsearch/Kibana for search and observability.',
    result: null, // TODO: scale, cost change, or reliability figure
    link: null,
    linkNote: 'Internal enterprise system — not publicly accessible',
  },
  {
    id: 'microservices-platform',
    title: 'Microservices Platform with Angular Front End',
    category: 'Microservices',
    tech: ['Spring Boot', 'REST APIs', 'Angular', 'Spring Security', 'OAuth2', 'JUnit'],
    problem:
      'An enterprise application needed to move from monolithic delivery to independently deployable services with a modern front end.',
    approach:
      'Implemented a microservices architecture in Spring Boot exposing REST APIs to an Angular front end, secured with Spring Security and OAuth2, and covered by JUnit/Mockito test suites.',
    result: null, // TODO: services delivered? coverage? release cadence?
    link: null,
    linkNote: 'Delivered at Tata Consultancy Services — client system, not public',
  },
]

// ---------------------------------------------------------------------------
// EXPERIENCE (Part 8 — required for a job search, Q0.2)
// Verbatim from Nithin's Q1.6/Part 8 answers.
// ---------------------------------------------------------------------------

export const experience: ExperienceItem[] = [
  {
    company: 'CTDI',
    role: '.NET Developer',
    start: "Oct '22",
    end: 'Present',
    location: 'TODO: location',
    current: true,
    summary:
      'Design, develop and maintain backend features for enterprise .NET applications, translating business and client requirements into technical designs and shipped implementations.',
    highlights: [
      'Built backend features across .NET Core MVC, .NET Core 3.1 and .NET 5, turning business and client requirements into technical designs.',
      'Built server-side components and REST APIs in C# and ASP.NET Core Web API, with data access over SQL Server and EF Core — including schema design, stored procedures and functions.',
      'Partnered directly with clients and business stakeholders to gather requirements and communicate progress through the development lifecycle.',
      'Authored and executed automated unit and integration test suites to catch regressions before release.',
      'Built and maintained CI/CD pipelines automating build, test and deployment across development, QA, staging and production.',
      'Used AWS — Lambda, Cognito, ECS, S3, Elasticsearch/Kibana, Secrets Manager and PostgreSQL — to build and support cloud-native applications, adopting AI-assisted development tooling to improve delivery speed.',
      'Built .NET 10 web services acting as a translation layer across multiple billing systems, normalizing formats for consistent communication between platforms.',
      'Designed and developed an end-to-end warehouse management and order fulfillment system covering inventory tracking, order processing and fulfillment workflows.',
      'Worked in an Agile/Scrum team through sprint planning, standups and retrospectives.',
      'Onboarded new team members onto the codebase, tooling and workflows, mentoring them on coding standards and best practices.',
    ],
    tech: [
      'C#',
      '.NET 10',
      'ASP.NET Core Web API',
      'EF Core',
      'SQL Server',
      'AWS',
      'CI/CD',
      'Agile/Scrum',
    ],
  },
  {
    company: 'Tata Consultancy Services — US',
    role: 'Software Engineer',
    start: "Oct '21",
    end: "Oct '22",
    location: 'TODO: location',
    summary:
      'Delivered enterprise applications end to end within an Agile team, from requirements through design, implementation and testing.',
    highlights: [
      'Worked across design, development, implementation and testing of enterprise applications in an Agile methodology.',
      'Translated functional and non-functional requirements into system specifications with product designers and business customers, contributing to architecture aligned to client standards.',
      'Implemented a microservices architecture in Spring Boot exposing REST APIs to an Angular front end, secured with Spring Security and OAuth2.',
      'Used Angular services to retrieve and render server data, building new UI components and enhancements to existing applications.',
      'Wrote unit tests with JUnit and Mockito to validate service behaviour.',
    ],
    tech: ['Java', 'Spring Boot', 'Spring Security', 'OAuth2', 'Angular', 'REST APIs', 'JUnit'],
  },
]

// ---------------------------------------------------------------------------
// SKILLS (Part 9, spec §15 — interactive typography, never percentage bars)
// Categorized from Nithin's flat TECHNICAL SKILLS list, strongest group first.
// ---------------------------------------------------------------------------

export const skillGroups: SkillGroup[] = [
  {
    label: 'Backend & Web',
    items: [
      'ASP.NET Core Web API',
      '.NET 10',
      '.NET 5',
      '.NET Core',
      'REST APIs',
      'Entity Framework Core',
      'Blazor',
      'Node.js',
    ],
  },
  { label: 'Languages', items: ['C#', 'Java', 'C++', 'C', 'SQL'] },
  {
    label: 'Databases',
    items: ['Microsoft SQL Server', 'PostgreSQL', 'Oracle', 'MySQL', 'MongoDB'],
  },
  {
    label: 'Cloud & DevOps',
    items: ['AWS', 'CI/CD Pipelines', 'Git', 'GitBash', 'Agile/Scrum'],
  },
  { label: 'Frontend', items: ['Angular', 'HTML', 'CSS', 'JavaScript', 'PHP'] },
  {
    label: 'Tools',
    items: ['Visual Studio', 'Postman', 'Eclipse IDE', 'PyCharm', 'Mockito', 'XAMPP'],
  },
  {
    /**
     * Honest framing. The resume evidence is "AI-first development and
     * AI-assisted programming tools" — i.e. using AI to build software.
     * Q0.3 asked to position "Agentic AI development", which would imply
     * building agentic systems. No evidence for that was supplied, so the
     * stronger claim is deliberately not made here. See DECISIONS.md.
     */
    label: 'AI-Assisted Development',
    items: ['AI-first development workflow', 'Kiro', 'AI-assisted programming tooling'],
  },
]

// ---------------------------------------------------------------------------
// HOW I WORK (spec §17, reframed from "Why Work With Me" for a hiring audience)
// TODO: Nithin to confirm or replace — Q11.1 was left blank.
// ---------------------------------------------------------------------------

export const principles: Principle[] = [
  {
    title: 'Tested before it ships',
    detail: 'Unit and integration suites are part of the feature, not a follow-up ticket.',
  },
  {
    title: 'Pipelines over handoffs',
    detail: 'Build, test and deploy automated across every environment from dev to production.',
  },
  {
    title: 'Contracts that hold',
    detail: 'APIs designed so the systems on either side can change independently.',
  },
  {
    title: 'Close to the stakeholder',
    detail: 'Requirements clarified directly with the people who asked for them.',
  },
  {
    title: 'Readable beats clever',
    detail: 'Code the next engineer can own without a walkthrough.',
  },
  {
    title: 'Leave the codebase joinable',
    detail: 'Onboarding and mentoring treated as part of the engineering work.',
  },
]

// ---------------------------------------------------------------------------
// FINAL CTA + FOOTER (spec §22, §23 — reframed for hiring)
// ---------------------------------------------------------------------------

export const finalCta = {
  heading: 'Let’s talk about what you’re building.',
  buttonLabel: 'Get in Touch',
  href: '#contact',
} as const

export const footer = {
  wordmark: site.wordmark,
  centerLine: 'Built with curiosity + code',
  copyright: `© ${new Date().getFullYear()} Nithin Kadaru`,
} as const

// ---------------------------------------------------------------------------
// SECTIONS OMITTED, AND WHY
// ---------------------------------------------------------------------------

/**
 * - Services (spec §16): dropped. Q0.2 is a job search, not client work.
 * - Achievements (spec §18): omitted. Q12.1 blank; the spec's list belongs to
 *   the original author and will not be reused.
 * - Community (spec §19): omitted. Q13.1 blank. Candidate replacement is
 *   Nithin's mentoring/onboarding story, which already appears under
 *   `principles` and in the CTDI highlights.
 * - Testimonials (spec §20): omitted. Q14.1 blank, and spec §20 explicitly
 *   forbids inventing them.
 */
export const omittedSections = ['services', 'achievements', 'community', 'testimonials'] as const
