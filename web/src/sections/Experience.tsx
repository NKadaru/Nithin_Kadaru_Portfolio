import { experience, type ExperienceItem } from '../content/content'
import { Reveal, RevealText } from '../components/Reveal'
import { Section, SectionHeading, TodoChip } from '../components/Section'

/**
 * EXPERIENCE
 *
 * Not in the original spec — it is written for a freelancer selling websites.
 * Required here because Q0.2 is a job search, and employment history is the
 * first thing a recruiter looks for. Its absence reads as concealment.
 */
export function Experience() {
  return (
    <Section id="experience" label="EXPERIENCE">
      <SectionHeading
        label="EXPERIENCE"
        heading="Where I’ve done the work."
      />

      <ol className="flex flex-col">
        {experience.map((role) => (
          <RoleRow key={`${role.company}-${role.start}`} role={role} />
        ))}
      </ol>
    </Section>
  )
}

function RoleRow({ role }: { role: ExperienceItem }) {
  const locationIsTodo = role.location.startsWith('TODO')

  return (
    <li className="border-t border-hairline">
      <Reveal as="article" className="grid gap-8 py-12 md:grid-cols-[14rem_1fr] md:gap-12 md:py-16">
        {/* Left rail: dates, location, status */}
        <div className="flex flex-col gap-3">
          <p className="font-mono text-xs tracking-wider text-bone-dim">
            {role.start} — {role.end}
          </p>

          {role.current ? (
            <p className="inline-flex items-center gap-2 font-mono text-[0.625rem] tracking-wider text-accent uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              Current
            </p>
          ) : null}

          {locationIsTodo ? (
            <TodoChip>Location</TodoChip>
          ) : (
            <p className="font-mono text-[0.625rem] tracking-wider text-faint uppercase">
              {role.location}
            </p>
          )}
        </div>

        {/* Right: the role itself */}
        <div>
          <h3 className="font-display text-h3 text-bone">
            <RevealText>{role.role}</RevealText>
          </h3>
          <p className="mt-1.5 font-mono text-sm text-accent">{role.company}</p>

          <p className="mt-6 max-w-[60ch] text-lead text-bone-dim">{role.summary}</p>

          <ul className="mt-8 flex flex-col gap-3.5">
            {role.highlights.map((highlight, i) => (
              <li
                key={i}
                className="grid max-w-[68ch] grid-cols-[auto_1fr] gap-3.5 text-sm leading-relaxed text-bone-dim"
              >
                <span className="mt-2 h-px w-3.5 shrink-0 bg-hairline-strong" aria-hidden="true" />
                {highlight}
              </li>
            ))}
          </ul>

          <ul className="mt-8 flex flex-wrap gap-2">
            {role.tech.map((tech) => (
              <li
                key={tech}
                className="border border-hairline px-2.5 py-1 font-mono text-[0.625rem] tracking-wider text-muted uppercase"
              >
                {tech}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </li>
  )
}
