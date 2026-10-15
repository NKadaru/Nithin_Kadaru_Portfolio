import { principles } from '../content/content'
import { Reveal } from '../components/Reveal'
import { Section, SectionHeading } from '../components/Section'

/**
 * HOW I WORK (spec §17, reframed)
 *
 * The spec's version is "Why Work With Me" — a client sales pitch. For a job
 * search this becomes engineering principles, which is the part a resume
 * cannot convey: how someone operates, not what they know.
 *
 * TODO: Q11.1 was left blank, so these are drawn from Nithin's own CTDI
 * highlights (testing, CI/CD, stakeholder contact, onboarding). He should
 * confirm or replace them.
 */
export function HowIWork() {
  return (
    <Section id="how-i-work" label="HOW I WORK">
      <SectionHeading
        label="HOW I WORK"
        heading="How I operate."
        supporting="The habits behind the work — the part a resume doesn’t capture."
      />

      <ul className="grid gap-px border border-hairline bg-hairline md:grid-cols-2 lg:grid-cols-3">
        {principles.map((principle, i) => (
          <Reveal
            key={principle.title}
            as="li"
            delay={i * 0.06}
            /*
             * Top-aligned rather than space-between: with cards of differing
             * copy length, bottom-aligning the text block leaves the titles
             * sitting at different heights across the row, which reads as
             * sloppy rather than editorial.
             */
            className="group flex min-h-52 flex-col items-start gap-5 bg-void p-8 transition-colors duration-700 hover:bg-canvas md:p-10"
          >
            <span className="font-mono text-xs text-faint" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>

            <div>
              <h3 className="font-display text-h3 text-bone">{principle.title}</h3>
              <p className="mt-3.5 max-w-[32ch] text-sm leading-relaxed text-bone-dim">
                {principle.detail}
              </p>
            </div>
          </Reveal>
        ))}
      </ul>
    </Section>
  )
}
