import { education, type EducationItem } from '../content/content'
import { Reveal, RevealText } from '../components/Reveal'
import { Section, SectionHeading } from '../components/Section'

/**
 * EDUCATION
 *
 * Same left-rail / right-body grid as Experience so the two read as one
 * timeline, without the highlights and tech chips a degree doesn't need.
 */
export function Education() {
  return (
    <Section id="education" label="EDUCATION">
      <SectionHeading label="EDUCATION" heading="Where I studied." compact />

      <ol className="flex flex-col">
        {education.map((item) => (
          <DegreeRow key={`${item.school}-${item.degree}`} item={item} />
        ))}
      </ol>
    </Section>
  )
}

function DegreeRow({ item }: { item: EducationItem }) {
  return (
    <li className="border-t border-hairline">
      <Reveal
        as="article"
        className="grid gap-6 py-10 md:grid-cols-[14rem_1fr] md:gap-12 md:py-12"
      >
        <div className="flex flex-col gap-3">
          <p className="font-mono text-sm tracking-wider text-bone-dim">{item.graduated}</p>
          <p className="font-mono text-xs tracking-wider text-faint uppercase">
            {item.location}
          </p>
        </div>

        <div>
          <h3 className="font-display text-h3 text-bone">
            <RevealText>{`${item.degree}, ${item.field}`}</RevealText>
          </h3>
          <p className="mt-1.5 font-mono text-sm text-accent">{item.school}</p>
        </div>
      </Reveal>
    </li>
  )
}
