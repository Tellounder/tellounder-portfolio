import { useId, useState } from 'react'
import { faReact, faTypescript, faNodeJs, faGoogle, faGithub, faSpotify, faHtml5, faCss3Alt, faSquareJs, faPython, faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import type { ProjectTech } from './projectData'

const brands = [
  [/^react(?:\s+\d|$)/i, faReact, '#61DAFB'],
  [/^typescript/i, faTypescript, '#3178C6'],
  [/^node\.js/i, faNodeJs, '#5FA04E'],
  [/^google one tap/i, faGoogle, '#4285F4'],
  [/^github/i, faGithub, '#FFFFFF'],
  [/^spotify/i, faSpotify, '#1ED760'],
  [/^html/i, faHtml5, '#E34F26'],
  [/^css/i, faCss3Alt, '#1572B6'],
  [/^javascript/i, faSquareJs, '#F7DF1E'],
  [/^python/i, faPython, '#3776AB'],
  [/^whatsapp/i, faWhatsapp, '#25D366'],
] as const

export function TechnologyIcon({ name }: { name: string }) {
  const match = brands.find(([pattern]) => pattern.test(name))
  if (!match) return null
  const [width, height, , , paths] = match[1].icon
  return <svg className="technology-icon" viewBox={`0 0 ${width} ${height}`} aria-hidden="true" focusable="false">
    {(Array.isArray(paths) ? paths : [paths]).map((d, i) => <path key={i} d={d} fill={match[2]} />)}
  </svg>
}

export function TechnologyRail({ technologies }: { technologies: ProjectTech[] }) {
  const [selected, setSelected] = useState<number | null>(null)
  const detailId = useId()
  return <div className="technology-rail">
    <div className="technology-rail__items" aria-label="Tecnologías aplicadas; seleccioná una para conocer su función">
      {technologies.map((tech, index) => <button key={tech.name} type="button" aria-expanded={selected === index} aria-controls={detailId} title={`${tech.name}: ${tech.use}`} onClick={() => setSelected(selected === index ? null : index)}>
        <TechnologyIcon name={tech.name} /><span>{tech.name}</span>
      </button>)}
    </div>
    <div id={detailId} hidden={selected === null} className="technology-rail__detail" role="status">
      {selected !== null && <p><strong>{technologies[selected].name}</strong> — {technologies[selected].use}</p>}
    </div>
  </div>
}
