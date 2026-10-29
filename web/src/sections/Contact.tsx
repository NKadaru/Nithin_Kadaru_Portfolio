import { ArrowUpRight, FileText, Github, Linkedin, Mail } from 'lucide-react'
import {
  contact,
  finalCta,
  footer,
  site,
  socials,
  type SocialLink,
} from '../content/content'
import { Reveal, RevealText } from '../components/Reveal'
import { Section, TodoChip } from '../components/Section'

const ICONS = {
  mail: Mail,
  linkedin: Linkedin,
  github: Github,
  file: FileText,
} as const

/**
 * CONTACT (spec §21), reframed for a job search.
 *
 * Q2.1 = no form, so this is direct editorial links. That is arguably the
 * better choice here anyway: a recruiter who wants to reach you will use
 * email or LinkedIn, and a form adds a step plus a deliverability risk.
 */
export function Contact() {
  return (
    <Section id="contact" label="CONTACT">
      <div className="grid gap-16 lg:grid-cols-[1fr_1fr] lg:gap-24">
        <div>
          <Reveal>
            <p className="label mb-6 flex items-center gap-3">
              <span className="inline-block h-px w-8 bg-accent" aria-hidden="true" />
              {contact.label}
            </p>
          </Reveal>

          <h2 className="max-w-[16ch] font-display text-h2 text-bone">
            <RevealText delay={0.08}>{contact.heading}</RevealText>
          </h2>

          <Reveal delay={0.16}>
            <p className="mt-7 max-w-[46ch] text-lead text-bone-dim">{contact.supporting}</p>
          </Reveal>

          <Reveal delay={0.24}>
            <p className="mt-10 font-mono text-xs tracking-wider text-faint uppercase">
              Based in {site.location}
            </p>
          </Reveal>
        </div>

        {/* Primary email as an oversized link — the main conversion point. */}
        <div className="flex flex-col">
          <Reveal>
            <a
              href={`mailto:${contact.email}`}
              data-cursor="view"
              className="group block border-t border-hairline py-8 transition-colors duration-500 hover:border-accent"
            >
              <span className="label mb-3 block">Email</span>
              <span className="flex items-center justify-between gap-4">
                <span className="font-display text-[clamp(1.125rem,2.2vw,1.75rem)] break-all text-bone transition-colors duration-500 group-hover:text-accent">
                  {contact.email}
                </span>
                <ArrowUpRight
                  className="h-5 w-5 shrink-0 text-muted transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent"
                  aria-hidden="true"
                />
              </span>
            </a>
          </Reveal>

          {socials
            .filter((social) => social.icon !== 'mail')
            .map((social, i) => (
              <SocialRow key={social.label} social={social} delay={(i + 1) * 0.07} />
            ))}

          {/* Resume download (Q2.0 = yes). The whole block is omitted until the
              PDF exists — a button that 404s is worse than no button, and an
              empty bordered row is worse than nothing at all. The TODO marker
              is development-only. */}
          {contact.resumeAvailable ? (
            <Reveal delay={0.28}>
              <a
                href={contact.resumeUrl}
                download
                className="group flex items-center justify-between gap-4 border-t border-b border-hairline py-8 transition-colors duration-500 hover:border-accent"
              >
                <span>
                  <span className="label mb-3 block">Resume</span>
                  <span className="font-display text-[clamp(1.125rem,2.2vw,1.75rem)] text-bone transition-colors duration-500 group-hover:text-accent">
                    Download PDF
                  </span>
                </span>
                <FileText
                  className="h-5 w-5 shrink-0 text-muted transition-colors duration-500 group-hover:text-accent"
                  aria-hidden="true"
                />
              </a>
            </Reveal>
          ) : import.meta.env.DEV ? (
            <div className="border-t border-b border-hairline py-8">
              <TodoChip>Resume PDF not yet supplied</TodoChip>
            </div>
          ) : (
            /* Close the list with a hairline so the last row isn't open-ended. */
            <div className="border-t border-hairline" />
          )}
        </div>
      </div>
    </Section>
  )
}

function SocialRow({ social, delay }: { social: SocialLink; delay: number }) {
  const Icon = ICONS[social.icon]

  return (
    <Reveal delay={delay}>
      <a
        href={social.url}
        target="_blank"
        rel="noreferrer noopener"
        data-cursor="view"
        className="group flex items-center justify-between gap-4 border-t border-hairline py-8 transition-colors duration-500 hover:border-accent"
      >
        <span>
          <span className="label mb-3 block">{social.label}</span>
          <span className="font-display text-[clamp(1.125rem,2.2vw,1.75rem)] text-bone transition-colors duration-500 group-hover:text-accent">
            {social.url.replace(/^https?:\/\/(www\.)?/, '')}
          </span>
        </span>
        <Icon
          className="h-5 w-5 shrink-0 text-muted transition-colors duration-500 group-hover:text-accent"
          aria-hidden="true"
        />
      </a>
    </Reveal>
  )
}

/**
 * FINAL CTA (spec §22) — "dramatic minimal".
 * Reframed from "Start a Project" for a hiring audience.
 */
export function FinalCta() {
  return (
    <section
      aria-label="Get in touch"
      className="gutter border-t border-hairline py-28 text-center md:py-40"
    >
      <h2 className="mx-auto max-w-[24ch] font-display text-[clamp(1.875rem,calc(6vw_-_0.125rem),4.875rem)] leading-[0.95] tracking-[-0.04em] text-bone">
        <RevealText>{finalCta.heading}</RevealText>
      </h2>

      <Reveal delay={0.15}>
        <a
          href={finalCta.href}
          data-cursor="view"
          className="mt-14 inline-flex items-center gap-3 border border-bone bg-bone px-9 py-4 font-mono text-[0.7rem] tracking-[0.16em] text-void uppercase transition-colors duration-500 hover:bg-transparent hover:text-bone"
        >
          {finalCta.buttonLabel}
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </Reveal>
    </section>
  )
}

/** FOOTER (spec §23) — minimal, three-part. */
export function Footer() {
  return (
    <footer className="gutter border-t border-hairline py-10">
      <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
        <span className="font-display text-base tracking-[-0.02em] text-bone">
          {footer.wordmark}
        </span>

        <span className="font-mono text-[0.625rem] tracking-wider text-faint uppercase">
          {footer.centerLine}
        </span>

        <div className="flex items-center gap-6">
          <ul className="flex items-center gap-4">
            {socials.map((social) => {
              const Icon = ICONS[social.icon]
              return (
                <li key={social.label}>
                  <a
                    href={social.url}
                    target={social.icon === 'mail' ? undefined : '_blank'}
                    rel={social.icon === 'mail' ? undefined : 'noreferrer noopener'}
                    aria-label={social.label}
                    className="block text-muted transition-colors duration-300 hover:text-bone"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                </li>
              )
            })}
          </ul>
          <span className="font-mono text-[0.625rem] tracking-wider text-faint">
            {footer.copyright}
          </span>
        </div>
      </div>
    </footer>
  )
}
