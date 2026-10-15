import { about, stats } from '../content/content'
import { Reveal } from '../components/Reveal'
import { Section, SectionHeading, TodoChip } from '../components/Section'

/** ABOUT (spec §11) */
export function About() {
  return (
    <Section id="about" label="ABOUT">
      <div className="grid gap-16 lg:grid-cols-[1fr_1fr] lg:gap-24">
        <div>
          <SectionHeading label={about.label} heading={about.heading} className="mb-10" />
        </div>

        <div className="flex flex-col gap-8">
          {about.body.map((paragraph, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <p className="text-lead text-bone-dim">{paragraph}</p>
            </Reveal>
          ))}
        </div>
      </div>

      <Stats />
    </Section>
  )
}

/**
 * Four-up stat row (spec §11).
 *
 * Stats with a `null` value are not rendered in production — a portfolio
 * showing "0+ integrations" is worse than showing three stats. In development
 * they render as TODO markers so the gap stays visible until Nithin supplies
 * real figures.
 */
function Stats() {
  const known = stats.filter((stat) => stat.value !== null)
  const unknown = stats.filter((stat) => stat.value === null)

  return (
    <div className="mt-24 border-t border-hairline pt-12 md:mt-32">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4">
        {known.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 0.07}>
            <div className="flex flex-col gap-3">
              <dt className="order-2 max-w-[18ch] text-sm leading-snug text-muted">
                {stat.label}
              </dt>
              <dd className="order-1 font-display text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-[-0.04em] text-bone">
                {stat.value}
                {stat.suffix ? <span className="text-accent">{stat.suffix}</span> : null}
              </dd>
            </div>
          </Reveal>
        ))}

        {unknown.map((stat) => (
          <div key={stat.label} className="flex items-start">
            <TodoChip>{stat.label}</TodoChip>
          </div>
        ))}
      </dl>
    </div>
  )
}
