import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { TechnologyRail } from './TechnologyRail'
import type { Project } from './projectData'

export function SleeveNotesDialog({ project, page, onPage, onClose }: {
  project: Project; page: number | 'stack'; onPage: (index: number) => void; onClose: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const timer = useRef<number | undefined>(undefined)
  const [closing, setClosing] = useState(false)
  const track = typeof page === 'number' ? project.tracks[page] : null
  const id = `sleeve-notes-${project.id}`

  useEffect(() => {
    const dialog = dialogRef.current!
    const root = document.documentElement
    const previousOverflow = root.style.overflow
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    root.style.overflow = 'hidden'
    dialog.showModal()
    return () => {
      window.clearTimeout(timer.current)
      dialog.close()
      root.style.overflow = previousOverflow
      if (opener?.isConnected) opener.focus({ preventScroll: true })
    }
  }, [])
  useEffect(() => { bodyRef.current?.scrollTo({ top: 0 }) }, [page])

  const close = () => {
    if (closing) return
    setClosing(true)
    timer.current = window.setTimeout(onClose, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 180)
  }

  return createPortal(<dialog ref={dialogRef} id={id} className={`sleeve-notes ${closing ? 'is-closing' : ''}`}
    aria-labelledby={`${id}-title`} aria-modal="true"
    style={{ '--accent': project.id === 'avvivo' ? '#e4bc5a' : project.accent } as React.CSSProperties}
    onCancel={(event) => { event.preventDefault(); event.stopPropagation(); close() }}
    onKeyDown={(event) => {
      event.stopPropagation()
      if (event.key !== 'Tab') return
      const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'))
        .filter((element) => element.getClientRects().length > 0)
      const first = controls[0], last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }}
    onClick={(event) => {
      if (event.target !== event.currentTarget) return
      const rect = event.currentTarget.getBoundingClientRect()
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close()
    }}>
    <header className="sleeve-notes__header">
      <div><span>{project.title} / {typeof page === 'number' ? `TEMA ${String(page + 1).padStart(2, '0')}` : 'TECNOLOGÍAS'}</span>
        <h2 id={`${id}-title`}>{track?.title ?? 'Stack completo'}</h2></div>
      <button type="button" className="sleeve-notes__close" onClick={close} autoFocus aria-label="Cerrar notas">×</button>
    </header>
    <div ref={bodyRef} className="sleeve-notes__body" key={page}>
      <p className="sleeve-notes__summary">{track?.summary ?? project.statement}</p>
      {track && <dl className="track-story">
        <div><dt>Necesidad</dt><dd>{track.signal}</dd></div>
        <div><dt>Decisión</dt><dd>{track.decision}</dd></div>
        <div><dt>Resultado</dt><dd>{track.result}</dd></div>
      </dl>}
      <h3>Tecnologías y función</h3>
      <TechnologyRail technologies={track?.tech ?? project.stack} />
      {track && <details className="track-evidence"><summary>Ver evidencia</summary><p>{track.proof}</p>{track.evidenceUrl && <a href={track.evidenceUrl} target="_blank" rel="noreferrer">Ver implementación en GitHub ↗</a>}</details>}
      {!track && <a className="icon-credit" href="https://fontawesome.com/license/free" target="_blank" rel="noreferrer">Iconos de marca: Font Awesome · CC BY 4.0</a>}
    </div>
    {typeof page === 'number' && <nav className="sleeve-notes__navigation" aria-label="Recorrer temas">
      <button type="button" disabled={page === 0} onClick={() => onPage(page - 1)}>← Anterior</button>
      <span>{page + 1} / {project.tracks.length}</span>
      <button type="button" disabled={page === project.tracks.length - 1} onClick={() => onPage(page + 1)}>Siguiente →</button>
    </nav>}
  </dialog>, document.body)
}
