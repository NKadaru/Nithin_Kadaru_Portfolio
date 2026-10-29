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
 * Sources: Nithin_Kadaru_Full_Stack_Software_Engineer_Resume (2026-10-28),
 * which supersedes PORTFOLIO_QUESTIONNAIRE.md where they differ, + DECISIONS.md.
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

export interface EducationItem {
  degree: string
  field: string
  school: string
  location: string
  graduated: string
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
  /** Name exactly as it appears on the resume. */
  fullName: 'Nithin Reddy Kadaru',
  roleLabel: 'FULL-STACK SOFTWARE ENGINEER',
  seoTitle: 'Nithin Kadaru — Full-Stack Software Engineer',
  seoDescription:
    'Full-stack software engineer building enterprise C#/.NET, Java/Spring Boot and Angular applications on SQL Server and AWS. Selected work, experience and contact.',
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
  location: 'Spring City, PA',
} as const

// ---------------------------------------------------------------------------
// HERO (Q1.4, Q1.5, Q1.6, spec §9, §10)
//
// Headline is kept short so it never collides with the 3D subject. The
// supporting line condenses the resume's professional summary; the full
// summary is used verbatim as the About copy.
// ---------------------------------------------------------------------------

export const hero = {
  label: site.roleLabel,
  /**
   * Kept deliberately short. At display type size a 70-character sentence
   * overflows its column and collides with the 3D subject, which spec §9
   * forbids ("without covering the face"). The rest of the sentence moves to
   * `supporting` below — no wording is lost, it is only redistributed.
   */
  headline: 'I build full-stack enterprise systems.',
  supporting:
    'C#/.NET, Java/Spring Boot and Angular applications on SQL Server and AWS — REST APIs, OAuth 2.0 security, automated testing and CI/CD.',
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
    'Open to full-stack and backend software engineering roles. The fastest way to reach me is email — I reply to everything.',
  email: 'nithin12.reddy@outlook.com',
  /**
   * Phone, as published on the 2026-10-28 resume. Nithin asked for every
   * resume detail to appear on the site, so it is rendered. Set to null to
   * hide it again — the Contact row disappears with it.
   */
  phone: '334-372-9961' as string | null,
  resumeUrl: '/resume/Nithin-Kadaru-Resume.pdf',
  /** PDF lives at public/resume/Nithin-Kadaru-Resume.pdf. */
  resumeAvailable: true,
} as const

// ---------------------------------------------------------------------------
// ABOUT — resume PROFESSIONAL SUMMARY (2026-10-28), verbatim
// ---------------------------------------------------------------------------

export const about = {
  label: 'ABOUT',
  heading: 'Full-stack, from schema to screen.',
  body: [
    'Full-stack Software Engineer experienced in building enterprise C#/.NET, Java/Spring Boot, and Angular applications on SQL Server and AWS.',
    'Designed and developed an end-to-end warehouse management and order fulfillment system and .NET 10 services that integrate two billing systems.',
    'Strong in REST API design, OAuth 2.0 security, automated testing, Continuous Integration/Continuous Delivery (CI/CD), and mentoring newer engineers.',
  ],
} as const

/**
 * STATS (Q5.3) — spec §11 wants four. Three are defensible from the resume
 * (Oct 2021 start, Oct 2022 CTDI start, "2 billing systems"). The mentoring
 * count stays `null` until Nithin supplies a real figure; it will not render
 * rather than show a fabricated number.
 */
export const stats: Stat[] = [
  { value: 5, suffix: '+', label: 'Years shipping production software' },
  { value: 4, suffix: '+', label: 'Years building enterprise .NET at CTDI' },
  { value: 2, label: 'Billing systems integrated through .NET 10 services' },
  { value: null, label: 'TODO: engineers onboarded / mentored' },
]

// ---------------------------------------------------------------------------
// MARQUEE (Q6.1, spec §12)
// ---------------------------------------------------------------------------

export const marqueeItems: string[] = [
  '.NET ENGINEERING',
  'JAVA & SPRING BOOT',
  'ANGULAR',
  'REST API DESIGN',
  'OAUTH 2.0 SECURITY',
  'CLOUD & CI/CD',
  'AI AGENTS & LLM INTEGRATION',
]

// ---------------------------------------------------------------------------
// SELECTED WORK (Part 7, spec §13, §14)
//
// SOURCING: every entry is taken from the 2026-10-28 resume — the CTDI and
// TCS bullets plus the PROJECTS section. Nothing here is a hypothetical idea.
//
// `result` is filled only where the resume states an outcome. The rest stay
// null: a recruiter reads outcomes, so these are the highest-value blanks.
// ---------------------------------------------------------------------------

export const projects: Project[] = [
  {
    id: 'billing-translation-layer',
    title: 'Billing Systems Translation Layer',
    category: 'Enterprise Integration',
    tech: ['.NET 10', 'C#', 'ASP.NET Core', 'REST APIs', 'SQL Server'],
    problem:
      'Two billing systems used different data formats, so the two applications that depend on them could not exchange data consistently.',
    approach:
      'Built .NET 10 web services as a translation layer that normalizes data formats across both billing systems, giving the two applications one consistent contract.',
    result: '2 billing systems normalized behind one layer, so 2 separate applications now exchange data consistently.',
    link: null,
    linkNote: 'Internal enterprise system — not publicly accessible',
  },
  {
    id: 'warehouse-management',
    title: 'Warehouse Management & Order Fulfillment',
    category: 'Enterprise Platform',
    tech: ['C#', '.NET', 'ASP.NET Core', 'EF Core', 'SQL Server'],
    problem:
      'Inventory tracking, order processing and fulfillment workflows needed to run as one end-to-end system.',
    approach:
      'Designed and developed the system in C# and .NET end to end, from requirements gathering with clients and stakeholders through inventory tracking, order processing and fulfillment workflows, on SQL Server and Entity Framework Core data layers.',
    result: null, // TODO: orders/day? sites live? error-rate or throughput change?
    link: null,
    linkNote: 'Internal enterprise system — not publicly accessible',
  },
  {
    id: 'cloud-native-aws',
    title: 'Cloud Services & Authentication on AWS',
    category: 'Cloud & Platform',
    tech: ['AWS Cognito', 'Secrets Manager', 'Lambda', 'ECS', 'S3', 'Elasticsearch/Kibana'],
    problem:
      'Enterprise .NET applications needed managed authentication, securely stored credentials and cloud-hosted features.',
    approach:
      'Implemented authentication with AWS Cognito and managed credentials in AWS Secrets Manager; built and deployed cloud features using AWS Lambda, ECS, S3 and Elasticsearch/Kibana, released through GitLab CI/CD and Octopus Deploy.',
    result: null, // TODO: scale, cost change, or reliability figure
    link: null,
    linkNote: 'Internal enterprise system — not publicly accessible',
  },
  {
    id: 'hfo-wealth-management',
    title: 'Family Wealth Reporting Microservices',
    category: 'Microservices · Banking',
    tech: ['Java', 'Spring Boot', 'Spring Security', 'OAuth 2.0', 'Angular', 'JUnit', 'Mockito'],
    problem:
      'The HFO wealth management project at PNC Private Bank Hawthorn needed account information combined with family member details, with each family’s page visible only to people the main account holder authorizes.',
    approach:
      'Designed RESTful Spring Boot microservices in layered controller, service and data-access designs. One retrieves account information with family member details and generates a report for each family, backed by a database of family members and page-access records. Endpoints use Spring Security and OAuth 2.0 token-based authentication with role-based authorization, and feed reusable Angular components and services.',
    result: null, // TODO: families/reports served? defect rate? release cadence?
    link: null,
    linkNote: 'Delivered at Tata Consultancy Services — client system, not public',
  },
  {
    id: 'workout-scheduler',
    title: 'Workout Scheduler with an AI Agent',
    category: 'Personal Project · AI Agents',
    tech: ['Angular 20', 'TypeScript', '.NET 10', 'OAuth 2.0', 'WHOOP', 'Google Gemini'],
    problem:
      'A fixed workout plan does not account for how recovered you are on a given day.',
    approach:
      'Built a full-stack workout scheduler with Angular 20 (TypeScript) and a .NET 10 API, integrating WHOOP via OAuth 2.0. An AI agent built on Google Gemini reads WHOOP recovery data and adapts daily workout plans.',
    result: null,
    link: 'https://github.com/NKadaru/Schedule_Workouts',
  },
]

// ---------------------------------------------------------------------------
// EXPERIENCE (Part 8 — required for a job search, Q0.2)
// Highlights are the 2026-10-28 resume bullets, verbatim.
// ---------------------------------------------------------------------------

export const experience: ExperienceItem[] = [
  {
    company: 'CTDI',
    role: 'Programmer',
    start: "Oct '22",
    end: 'Present',
    location: 'TODO: location',
    current: true,
    summary:
      'Design and develop enterprise C#/.NET applications on SQL Server and AWS, from client requirements through tested, automated releases.',
    highlights: [
      'Designed and developed an end-to-end warehouse management and order fulfillment system in C# and .NET, from requirements gathering with clients and stakeholders through inventory tracking, order processing, and fulfillment workflows.',
      'Built .NET 10 web services as a translation layer that normalizes data formats across 2 billing systems, enabling 2 separate applications to exchange data consistently.',
      'Developed and maintained C# and ASP.NET Core REST APIs with SQL Server and Entity Framework Core data layers, stored procedures, and functions across .NET Core 3.1, .NET 5, and .NET 10 applications.',
      'Implemented authentication with AWS Cognito and managed credentials in AWS Secrets Manager; built and deployed cloud features using AWS Lambda, ECS, S3, and Elasticsearch/Kibana.',
      'Wrote automated unit and integration tests and maintained GitLab CI/CD pipelines with Octopus Deploy releases across development, QA, staging, and production environments.',
      'Mentored and onboarded new engineers on the codebase, tooling, and coding standards.',
    ],
    tech: [
      'C#',
      '.NET 10',
      'ASP.NET Core',
      'EF Core',
      'SQL Server',
      'AWS',
      'GitLab CI/CD',
      'Octopus Deploy',
    ],
  },
  {
    company: 'Tata Consultancy Services (TCS)',
    role: 'Software Engineer',
    start: "Oct '21",
    end: "Oct '22",
    location: 'United States',
    summary:
      'Built RESTful Java/Spring Boot microservices and Angular features for the HFO wealth management project at PNC Private Bank Hawthorn.',
    highlights: [
      'Designed and developed RESTful microservices in Java and Spring Boot for the HFO wealth management project at PNC Private Bank Hawthorn, translating requirements from product owners, designers, and stakeholders into layered controller, service, and data-access designs.',
      'Built a microservice that retrieves account information together with family member details and generates reports for each family, with a database storing family member details and page-access records.',
      'Secured endpoints with Spring Security and OAuth 2.0, implementing token-based authentication and role-based authorization so only people authorized by the main account holder can access a family’s page.',
      'Implemented REST endpoints with request validation and exception handling, integrated with the Angular application, and developed reusable Angular components and services that consumed them.',
      'Wrote JUnit and Mockito tests covering service logic and exception scenarios to catch defects before release.',
    ],
    tech: [
      'Java',
      'Spring Boot',
      'Spring Security',
      'OAuth 2.0',
      'Angular',
      'REST APIs',
      'JUnit',
      'Mockito',
    ],
  },
]

// ---------------------------------------------------------------------------
// EDUCATION (2026-10-28 resume)
// ---------------------------------------------------------------------------

export const education: EducationItem[] = [
  {
    degree: 'Master of Science',
    field: 'Computer Science',
    school: 'Texas State University',
    location: 'San Marcos, TX',
    graduated: 'August 2021',
  },
  {
    degree: 'Bachelor of Engineering',
    field: 'Computer Science',
    school: 'Osmania University',
    location: 'Telangana, India',
    graduated: 'May 2018',
  },
]

// ---------------------------------------------------------------------------
// SKILLS (Part 9, spec §15 — interactive typography, never percentage bars)
// Groups and items follow the resume's TECHNICAL SKILLS section.
// ---------------------------------------------------------------------------

export const skillGroups: SkillGroup[] = [
  { label: 'Languages', items: ['C#', 'TypeScript', 'SQL', 'Java', 'HTML', 'CSS'] },
  {
    label: 'Frameworks & Libraries',
    items: [
      '.NET Core',
      '.NET 5',
      '.NET 10',
      'ASP.NET Core',
      'Entity Framework Core',
      'Angular',
      'Blazor',
      'Spring Boot',
      'Spring Security',
    ],
  },
  {
    label: 'APIs & Architecture',
    items: ['Object-Oriented Programming', 'REST APIs', 'Microservices', 'OAuth 2.0'],
  },
  {
    label: 'Databases',
    items: ['Microsoft SQL Server', 'PostgreSQL', 'MySQL', 'MongoDB'],
  },
  {
    label: 'Cloud & DevOps',
    items: [
      'AWS Lambda',
      'AWS Cognito',
      'AWS ECS',
      'AWS S3',
      'AWS Secrets Manager',
      'Elasticsearch/Kibana',
      'CI/CD pipelines (GitLab, Octopus Deploy)',
      'Git',
    ],
  },
  {
    label: 'Testing & Tools',
    items: [
      'Unit & Integration Testing',
      'JUnit',
      'Mockito',
      'Postman',
      'Visual Studio',
      'Agile/Scrum',
    ],
  },
  {
    /**
     * Backed by evidence on the resume: Kiro for AI-assisted development, and
     * a Google Gemini agent in the Workout Scheduler project.
     */
    label: 'AI',
    items: ['AI-assisted development (Kiro)', 'LLM integration (Google Gemini)', 'AI agents'],
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
  copyright: `© ${new Date().getFullYear()} ${site.fullName}`,
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
