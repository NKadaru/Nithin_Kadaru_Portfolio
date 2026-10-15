import { skillGroups } from '../content/content'
import { Reveal } from '../components/Reveal'
import { Section, SectionHeading } from '../components/Section'

/**
 * SKILLS (spec §15)
 *
 * "Present interactive typography rather than percentage bars." Percentage
 * bars are also just dishonest — nobody can defend "React: 87%" in an
 * interview. Each group is a row of hairline-separated words that respond to
 * hover; the hierarchy comes from type size and grouping order, with the
 * strongest group first.
 */
export function Skills() {
  return (
    <Section id="skills" label="SKILLS">
      <SectionHeading
        label="SKILLS"
        heading="The stack I work in."
      />

      <div className="flex flex-col">
        {skillGroups.map((group, groupIndex) => (
          <Reveal
            key={group.label}
            delay={groupIndex * 0.05}
            className="grid gap-5 border-t border-hairline py-9 md:grid-cols-[14rem_1fr] md:gap-12"
          >
            <h3 className="label pt-1.5">{group.label}</h3>

            <ul className="flex flex-wrap items-baseline gap-x-7 gap-y-3">
              {group.items.map((item) => (
                <li key={item}>
                  {/*
                    Hover lifts the word to full-contrast bone and reveals an
                    accent underline. Non-interactive elements, so no cursor
                    state and nothing keyboard-focusable — decoration should
                    not create tab stops (spec §31).
                  */}
                  <span className="group relative inline-block cursor-default font-display text-[clamp(1.125rem,1.8vw,1.5rem)] tracking-[-0.015em] text-bone-dim transition-colors duration-400 hover:text-bone">
                    {item}
                    <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full" />
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
