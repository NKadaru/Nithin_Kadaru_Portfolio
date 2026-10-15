import { ArrowUpRight, Lock } from 'lucide-react'
import { projects, type Project } from '../content/content'
import { Reveal, RevealText } from '../components/Reveal'
import { Section, SectionHeading, TodoChip } from '../components/Section'

/**
 * SELECTED WORK (spec §13, §14)
 *
 * "Use large editorial project presentations instead of tiny cards." Each
 * entry is a full-width row with an oversized index number, a display-size
 * title, and problem/approach/result as structured prose — the shape a
 * hiring manager actually reads.
 *
 * None of these have screenshots: they are internal enterprise systems. Rather
 * than fake a product shot, each entry gets a typographic treatment built from
 * its own tech stack, which is honest and still visually dominant.
 */
export function Work() {
  return (
    <Section id="work" label="SELECTED WORK">
      <SectionHeading
        label="SELECTED WORK"
        heading="Systems I’ve designed, built and shipped."
        supporting="Enterprise platforms and integrations delivered at CTDI and Tata Consultancy Services. Internal systems, so there are no public links — the engineering is described instead."
      />

      <ol className="flex flex-col">
        {projects.map((project, i) => (
          <ProjectRow key={project.id} project={project} index={i + 1} />
        ))}
      </ol>
    </Section>
  )
}

function ProjectRow({ project, index }: { project: Project; index: number }) {
  return (
    <li className="group border-t border-hairline">
      <Reveal as="article" className="grid gap-8 py-12 md:grid-cols-[auto_1fr] md:gap-16 md:py-16">
        {/* Oversized index — editorial numbering, spec §4 "strong hierarchy" */}
        <span
          className="font-mono text-sm text-faint transition-colors duration-500 group-hover:text-accent md:text-base"
          aria-hidden="true"
        >
          {String(index).padStart(2, '0')}
        </span>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          {/* Left: identity */}
          <div>
            <p className="label mb-4">{project.category}</p>

            <h3 className="max-w-[22ch] font-display text-h3 text-bone transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] md:text-[clamp(1.5rem,2.6vw,2.25rem)] md:group-hover:translate-x-2">
              <RevealText>{project.title}</RevealText>
            </h3>

            {/* Tech stack as hairline chips — no rounded card soup (spec §4) */}
            <ul className="mt-7 flex flex-wrap gap-2">
              {project.tech.map((tech) => (
                <li
                  key={tech}
                  className="border border-hairline px-2.5 py-1 font-mono text-[0.625rem] tracking-wider text-muted uppercase transition-colors duration-500 group-hover:border-hairline-strong"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: the actual substance */}
          <dl className="flex flex-col gap-6 text-sm leading-relaxed">
            <div>
              <dt className="label mb-2">Problem</dt>
              <dd className="text-bone-dim">{project.problem}</dd>
            </div>
            <div>
              <dt className="label mb-2">Approach</dt>
              <dd className="text-bone-dim">{project.approach}</dd>
            </div>
            <div>
              <dt className="label mb-2">Result</dt>
              <dd className="text-bone-dim">
                {project.result ?? (
                  <TodoChip>Needs a defensible metric</TodoChip>
                )}
              </dd>
            </div>

            {/* Link, or an honest explanation of its absence (spec §13 wants a
                View Project CTA — a dead link would be worse than none). */}
            <div className="mt-2">
              {project.link ? (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noreferrer noopener"
                  data-cursor="view"
                  className="inline-flex items-center gap-2 border-b border-hairline-strong pb-1 font-mono text-[0.65rem] tracking-[0.14em] text-bone uppercase transition-colors duration-500 hover:border-accent hover:text-accent"
                >
                  View Project
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              ) : (
                <p className="inline-flex items-center gap-2 font-mono text-[0.625rem] tracking-wider text-faint uppercase">
                  <Lock className="h-3 w-3" aria-hidden="true" />
                  {project.linkNote}
                </p>
              )}
            </div>
          </dl>
        </div>
      </Reveal>
    </li>
  )
}
