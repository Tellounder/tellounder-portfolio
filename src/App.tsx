import { useCallback, useEffect, useRef, useState } from 'react'
import logoUrl from '../portadaTellounder.PNG'
import portraitUrl from '../leonardotello.jfif'
import turntableSvg from '../TOCADISCOS.svg?raw'
import avvivoLabelUrl from './assets/project-labels/avvivo.png'
import ayeLabelUrl from './assets/project-labels/aye.webp'
import riseLabelUrl from './assets/project-labels/rise.png'
import hembraLabelUrl from './assets/project-labels/hembra.png'
import antoLabelUrl from './assets/project-labels/anto.png'
import metalmenteLabelUrl from './assets/project-labels/metalmente.svg'
import cielofinalLabelUrl from './assets/project-labels/cielofinal.svg'
import vinylSleeveUrl from './assets/vinyl-sleeve.svg'
import avvivoPrintUrl from './assets/sleeve-logos/avvivo.svg'
import ayePrintUrl from './assets/sleeve-logos/aye.svg'
import risePrintUrl from './assets/sleeve-logos/rise.svg'
import hembraPrintUrl from './assets/sleeve-logos/hembra.svg'
import antoPrintUrl from './assets/sleeve-logos/anto.svg'
import metalmentePrintUrl from './assets/sleeve-logos/metalmente.svg'
import cielofinalPrintUrl from './assets/sleeve-logos/cielofinal.svg'
import { SleeveNotesDialog } from './SleeveNotesDialog'
import { projects, type Project, type ProjectId } from './projectData'
import { absoluteUrl, projectSeo, resolveRoute, seoData, syncDocumentMetadata, type RouteState, type SeoScene } from './seo'
import { useSound, type ScratchPhase } from './useSound'

type Scene = SeoScene
type Tone = 'clean' | 'drive' | 'fuzz'

const sleeveArtwork: Record<ProjectId, string> = {
  avvivo: avvivoPrintUrl, aye: ayePrintUrl, rise: risePrintUrl,
  hembra: hembraPrintUrl, anto: antoPrintUrl,
  metalmente: metalmentePrintUrl, cielofinal: cielofinalPrintUrl,
}

const scenes: Array<{ id: Scene; number: string; label: string; sub: string }> = [
  { id: 'home', number: '00', label: 'Control room', sub: 'Inicio' },
  { id: 'work', number: '01', label: 'Experiencias', sub: 'Obra real' },
  { id: 'services', number: '02', label: 'Servicios', sub: 'Sistemas + IA' },
  { id: 'method', number: '03', label: 'Signal chain', sub: 'Método' },
  { id: 'about', number: '04', label: 'Backstage', sub: 'Identidad' },
  { id: 'contact', number: '05', label: 'Encore', sub: 'Contacto' },
]
const method = [['INPUT', 'Idea', 'Encontrar la señal dentro del ruido.'], ['01', 'Producto', 'Definir el problema, los actores y los límites.'], ['02', 'Experiencia', 'Transformar reglas en recorridos claros.'], ['03', 'Frontend', 'Construir la superficie y su comportamiento.'], ['04', 'Backend', 'Resolver lógica, permisos e integraciones.'], ['05', 'Datos', 'Dar estructura, continuidad y autoridad.'], ['06', 'Cloud', 'Preparar entornos y servicios operables.'], ['LIVE', 'Verificación', 'Publicar, probar y comprobar el resultado.']]

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => { const media = matchMedia('(prefers-reduced-motion: reduce)'); const update = () => setReduced(media.matches); update(); media.addEventListener('change', update); return () => media.removeEventListener('change', update) }, [])
  return reduced
}

function useRandomInterference(active: boolean, reduced: boolean) {
  const ref = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const button = ref.current
    if (!button) return

    let timeout = 0
    let cancelled = false
    const random = (minimum: number, maximum: number) => minimum + Math.random() * (maximum - minimum)
    const reset = () => {
      button.classList.remove('is-interfering')
      button.style.removeProperty('--interference-y')
      button.style.removeProperty('--interference-strength')
      button.style.removeProperty('--interference-shift')
      button.style.removeProperty('--interference-shadow')
      button.style.removeProperty('--interference-band')
    }
    const queue = (callback: () => void, delay: number) => {
      timeout = window.setTimeout(callback, delay)
    }
    const pulse = (remaining: number) => {
      if (cancelled) return
      const shift = random(-2.4, 2.4)
      button.style.setProperty('--interference-y', `${random(7, 91).toFixed(1)}%`)
      button.style.setProperty('--interference-strength', random(.42, .96).toFixed(2))
      button.style.setProperty('--interference-shift', `${shift.toFixed(2)}px`)
      button.style.setProperty('--interference-shadow', `${(-shift).toFixed(2)}px`)
      button.style.setProperty('--interference-band', `${random(1, 3.4).toFixed(1)}px`)
      button.classList.add('is-interfering')
      queue(() => {
        button.classList.remove('is-interfering')
        if (remaining > 1) queue(() => pulse(remaining - 1), random(18, 135))
        else queue(() => pulse(Math.floor(random(2, 6))), random(520, 4300))
      }, random(28, 150))
    }

    reset()
    if (!active && !reduced) queue(() => pulse(Math.floor(random(2, 6))), random(120, 820))

    return () => {
      cancelled = true
      window.clearTimeout(timeout)
      reset()
    }
  }, [active, reduced])

  return ref
}

function AmbientCanvas({ tone, reduced, accent }: { tone: Tone; reduced: boolean; accent: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current; const context = canvas?.getContext('2d'); if (!canvas || !context) return
    let frame = 0; let animation = 0; let scrollTimer = 0; let lastPaint = 0; let scrolling = false; const pointer = { x: 0.5, y: 0.5 }
    const points = Array.from({ length: tone === 'fuzz' ? 34 : tone === 'drive' ? 24 : 16 }, (_, index) => ({ x: (Math.sin(index * 91.17 + 2.3) + 1) / 2, y: (Math.cos(index * 47.31 + 0.7) + 1) / 2, phase: index * 0.62 }))
    const rgb = accent.match(/[a-f\d]{2}/gi)?.map((value) => parseInt(value, 16)) ?? [239, 10, 58]
    const resize = () => { const ratio = Math.min(devicePixelRatio, 1.25); canvas.width = canvas.clientWidth * ratio; canvas.height = canvas.clientHeight * ratio; context.setTransform(ratio, 0, 0, ratio, 0, 0) }
    const move = (event: PointerEvent) => { pointer.x = event.clientX / innerWidth; pointer.y = event.clientY / innerHeight }
    const markScroll = () => { scrolling = true; window.clearTimeout(scrollTimer); scrollTimer = window.setTimeout(() => { scrolling = false }, 90) }
    const render = () => {
      const width = canvas.clientWidth; const height = canvas.clientHeight; context.clearRect(0, 0, width, height)
      for (let index = 0; index < points.length; index += 1) {
        const point = points[index]; const drift = reduced ? 0 : Math.sin(frame * 0.006 + point.phase) * 8; const x = point.x * width + drift; const y = point.y * height + (reduced ? 0 : Math.cos(frame * 0.004 + point.phase) * 5); const near = Math.max(0, 1 - Math.hypot(pointer.x * width - x, pointer.y * height - y) / 260)
        context.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${0.09 + near * 0.55})`; context.beginPath(); context.arc(x, y, 1.2 + near * 2, 0, Math.PI * 2); context.fill()
        for (let targetIndex = index + 1; targetIndex < points.length; targetIndex += 1) {
          const target = points[targetIndex]; const tx = target.x * width; const ty = target.y * height; const distance = Math.hypot(tx - x, ty - y)
          if (distance < 145) { context.strokeStyle = `rgba(255,255,255,${0.055 - distance / 4000})`; context.lineWidth = 0.4; context.beginPath(); context.moveTo(x, y); context.lineTo(tx, ty); context.stroke() }
        }
      }
      frame += 1
    }
    const draw = (timestamp: number) => { animation = requestAnimationFrame(draw); if (document.hidden || scrolling || timestamp - lastPaint < 40) return; lastPaint = timestamp; render() }
    resize(); render(); if (!reduced) animation = requestAnimationFrame(draw); addEventListener('resize', resize); addEventListener('pointermove', move); addEventListener('scroll', markScroll, { passive: true })
    return () => { cancelAnimationFrame(animation); window.clearTimeout(scrollTimer); removeEventListener('resize', resize); removeEventListener('pointermove', move); removeEventListener('scroll', markScroll) }
  }, [accent, reduced, tone])
  return <canvas ref={ref} className="ambient" aria-hidden="true" />
}

function ProjectArtifact({ project }: { project: Project }) {
  if (project.id === 'avvivo') return <div className="artifact artifact--avvivo"><div className="system-orbit orbit-a"><span>Cliente</span></div><div className="system-orbit orbit-b"><span>Tienda</span></div><div className="system-core">A</div><div className="system-label label-a">Reels / Vivos</div><div className="system-label label-b">Toques / Tramas</div><div className="system-label label-c">Datos / Reglas</div></div>
  if (project.id === 'aye') return <div className="artifact artifact--aye">{[0, 1, 2, 3, 4].map((index) => <div className="catalog-card" key={index}><i /><span>Producto {index + 1}</span><b>Disponible</b></div>)}</div>
  if (project.id === 'rise') return <div className="artifact artifact--rise"><div className="record-disc"><i /><span>RISE</span></div><div className="equalizer">{Array.from({ length: 28 }, (_, index) => <i key={index} style={{ '--bar': index } as React.CSSProperties} />)}</div><span className="artifact-caption">DISTRIBUCIÓN / MÚSICA / LETRAS</span></div>
  if (project.id === 'hembra') return <div className="artifact artifact--hembra"><div className="botanical-ring ring-one" /><div className="botanical-ring ring-two" />{Array.from({ length: 9 }, (_, index) => <i className="petal" key={index} style={{ '--petal': index } as React.CSSProperties} />)}<strong>H</strong><span>BOTÁNICA / IDENTIDAD / JOYERÍA</span></div>
  return <div className="artifact artifact--anto"><div className="aperture">{Array.from({ length: 8 }, (_, index) => <i key={index} style={{ '--blade': index } as React.CSSProperties} />)}<span>AG</span></div><div className="focus-mark focus-a" /><div className="focus-mark focus-b" /><span className="artifact-caption">SHOWS / RETRATOS / MARCAS</span></div>
}

function HeroAmpSelector({ project, audio, onPreview, onOpen }: { project: Project; audio: boolean; onPreview: (id: ProjectId) => void; onOpen: (id: ProjectId) => void }) {
  const projectIndex = Math.max(0, projects.findIndex((item) => item.id === project.id))
  const center = (projects.length - 1) / 2
  const ampStyle = { '--project-count': projects.length, '--amp-color': project.accent, '--glow-shift': `${(projectIndex - center) * 9}%`, '--speaker-shift': `${(projectIndex - center) * 10}px` } as React.CSSProperties

  return <div className="hero-amp" style={ampStyle}>
    <div className="hero-amp__head"><span><i /> TELLOUNDER / MASTER SELECTOR</span><b>CH {project.number}</b><em>{audio ? 'AMP HOT' : 'STANDBY'}</em></div>
    <a className="hero-amp__cabinet" href={projectSeo[project.id].path} onClick={(event) => { event.preventDefault(); onOpen(project.id) }} aria-label={`Abrir el caso de estudio ${project.title}`}>
      <span className="hero-amp__speaker" aria-hidden="true" />
      <span className="hero-amp__glow" aria-hidden="true" />
      <span className="hero-amp__grille" aria-hidden="true" />
      <span className="hero-amp__badge" aria-live="polite"><small>CHANNEL {project.number} / {project.type}</small><strong>{project.title}</strong><em>{project.subtitle}</em><b>OPEN EXPERIENCE ↗</b></span>
    </a>
    <div className="hero-amp__controls" aria-label="Seleccionar experiencia"><span className="hero-amp__input-label">INPUT<br />SELECT</span>{projects.map((item, index) => <a href={projectSeo[item.id].path} key={item.id} className={`amp-channel ${item.id === project.id ? 'is-active' : ''}`} style={{ '--channel': item.accent, '--knob-rest': `${-52 + index * 13}deg` } as React.CSSProperties} aria-current={item.id === project.id ? 'page' : undefined} aria-label={`Abrir ${item.title}`} onPointerEnter={() => onPreview(item.id)} onFocus={() => onPreview(item.id)} onClick={(event) => { event.preventDefault(); onOpen(item.id) }}><i className="hero-amp__knob" /><span>{item.number}</span><small>{item.title}</small></a>)}</div>
  </div>
}

const recordMarks: Record<ProjectId, React.ReactNode> = {
  avvivo: <img className="record-label__logo record-label__logo--avvivo" src={avvivoLabelUrl} alt="" aria-hidden="true" draggable="false" />,
  aye: <img className="record-label__logo record-label__logo--aye" src={ayeLabelUrl} alt="" aria-hidden="true" draggable="false" />,
  rise: <img className="record-label__logo record-label__logo--rise" src={riseLabelUrl} alt="" aria-hidden="true" draggable="false" />,
  hembra: <img className="record-label__logo record-label__logo--hembra" src={hembraLabelUrl} alt="" aria-hidden="true" draggable="false" />,
  anto: <img className="record-label__logo record-label__logo--anto" src={antoLabelUrl} alt="" aria-hidden="true" draggable="false" />,
  metalmente: <img className="record-label__logo record-label__logo--metalmente" src={metalmenteLabelUrl} alt="" aria-hidden="true" draggable="false" />,
  cielofinal: <img className="record-label__logo record-label__logo--cielofinal" src={cielofinalLabelUrl} alt="" aria-hidden="true" draggable="false" />,
}

function ProjectTurntable({ project, trackIndex, signal, scratch, onCueFirst }: { project: Project; trackIndex: number; signal: () => void; scratch: (phase: ScratchPhase, velocity?: number) => void; onCueFirst: () => void }) {
  const [playing, setPlaying] = useState(true)
  const [armDown, setArmDown] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [scratching, setScratching] = useState(false)
  const [scratchAngle, setScratchAngle] = useState(0)
  const [cueing, setCueing] = useState(false)
  const timer = useRef<number | null>(null)
  const scratchRef = useRef(scratch)
  const drag = useRef<{ pointerId: number; startX: number; lastX: number; lastTime: number; velocity: number; wasPlaying: boolean } | null>(null)
  scratchRef.current = scratch

  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current)
    setPlaying(true); setArmDown(false); setCueing(true); setScratching(false); setScratchAngle(0)
    timer.current = window.setTimeout(() => { setArmDown(true); setCueing(false) }, 360)
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
      if (drag.current) { scratchRef.current('end', drag.current.velocity); drag.current = null }
    }
  }, [project.id, trackIndex])

  const toggle = () => {
    const next = !playing
    setPlaying(next); setArmDown(next); setCueing(false); signal()
  }
  const cueTrack = () => {
    if (timer.current) window.clearTimeout(timer.current)
    setPlaying(false); setArmDown(false); setCueing(true); signal()
    onCueFirst()
    timer.current = window.setTimeout(() => { setPlaying(true); setArmDown(true); setCueing(false) }, 520)
  }
  const touchRecord = () => { scratch('tap', .72); setScratching(true); window.setTimeout(() => setScratching(false), 260) }
  const startScratch = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { pointerId: event.pointerId, startX: event.clientX, lastX: event.clientX, lastTime: performance.now(), velocity: 0, wasPlaying: playing }
    setPlaying(false); setScratching(true); setScratchAngle(0); scratch('start')
  }
  const moveScratch = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return
    setScratchAngle((event.clientX - drag.current.startX) * .72)
    const now = performance.now()
    const elapsed = Math.max(8, now - drag.current.lastTime)
    const instantVelocity = (event.clientX - drag.current.lastX) / elapsed
    const velocity = drag.current.velocity * .58 + (Math.abs(instantVelocity) < .012 ? 0 : instantVelocity) * .42
    drag.current.lastX = event.clientX; drag.current.lastTime = now; drag.current.velocity = velocity
    scratch('move', velocity)
  }
  const finishScratch = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return
    const { wasPlaying: resume, velocity } = drag.current
    drag.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    scratch('end', velocity); setScratching(false); setScratchAngle(0); setPlaying(resume)
  }
  const track = project.tracks[trackIndex]
  const trackNumber = String(trackIndex + 1).padStart(2, '0')
  const trackProgress = project.tracks.length > 1 ? trackIndex / (project.tracks.length - 1) : 0
  const status = scratching ? 'VINYL TOUCH / SCRATCH' : cueing ? `SEEKING TRACK ${trackNumber}` : !playing ? 'PAUSED / SELECT PLAY TO RESUME' : !armDown ? 'PLATTER READY / ARM UP' : `${track.chapter} / SIGNAL ROTATING`
  const pitchPosition = ((speed - .65) / .75) * 100

  return <div className={`turntable-instrument ${playing ? 'is-playing' : 'is-paused'} ${armDown ? 'arm-down' : 'arm-up'} ${scratching ? 'is-scratching' : ''} ${cueing ? 'is-cueing' : ''}`} style={{ '--record': project.accent, '--spin-duration': `${3.8 / speed}s`, '--scratch-angle': `${scratchAngle}deg`, '--pitch-position': `${88 - pitchPosition * .76}%`, '--arm-angle': `${11.5 + trackProgress * 8.5}deg`, '--track-inset': `${5 + trackProgress * 19}%` } as React.CSSProperties}><div className="turntable-deck"><div className="turntable-chassis" role="img" aria-label="Tocadiscos Tellounder" dangerouslySetInnerHTML={{ __html: turntableSvg }} /><div className="project-record" key={project.id} role="button" tabIndex={0} aria-label={`Vinilo de ${project.title}. Tocá o arrastrá para hacer scratch.`} onPointerDown={startScratch} onPointerMove={moveScratch} onPointerUp={finishScratch} onPointerCancel={finishScratch} onLostPointerCapture={finishScratch} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); touchRecord() } }}><div className="record-grooves" /><div className="record-track-indicator" aria-hidden="true" /><div className="record-label"><small>TRK {trackNumber} / {String(project.tracks.length).padStart(2, '0')}</small><strong>{recordMarks[project.id]}</strong><span>TELLOUNDER</span></div></div><button className="turntable-cue" type="button" aria-label="Volver al primer track" onClick={cueTrack}><i /><span>CUE</span></button><button className="turntable-power" type="button" aria-pressed={playing} aria-label={playing ? 'Pausar tocadiscos' : 'Reproducir tocadiscos'} onClick={toggle}><i /><span>{playing ? 'PAUSE' : 'PLAY'}</span></button><button className="turntable-arm-control" type="button" aria-pressed={armDown} aria-label={armDown ? 'Levantar brazo' : 'Bajar brazo'} onClick={() => { setArmDown((value) => !value); signal() }}><span>ARM</span><strong>{armDown ? 'DOWN' : 'UP'}</strong></button><label className="turntable-pitch"><span>PITCH</span><input type="range" min="0.65" max="1.4" step="0.05" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} aria-label="Velocidad del tocadiscos" /><i /><strong>{speed.toFixed(2)}×</strong></label></div><div className="turntable-readout"><span><i /> {playing && armDown ? `TRACK ${trackNumber}` : 'DECK ONLINE'}</span><strong>{track.title}</strong><small>{status}</small></div></div>
}

function HomeScene({ selectProject, openServices, audio, primary }: { selectProject: (id: ProjectId) => void; openServices: () => void; audio: boolean; primary: boolean }) {
  const [previewId, setPreviewId] = useState<ProjectId>('avvivo')
  const previewProject = projects.find((project) => project.id === previewId) ?? projects[0]
  const Heading = primary ? 'h1' : 'h2'
  return <section className="scene home-scene" aria-labelledby="home-title"><div className="home-copy"><span className="eyebrow">LEONARDO EMMANUEL TELLO / DIGITAL PRODUCT BUILDER</span><Heading id="home-title"><span className="home-heading__context">Desarrollo de sistemas digitales para empresas</span>Ideas con <em>volumen.</em><br />Sistemas que funcionan.</Heading><p>Diseño y desarrollo productos digitales de punta a punta: estrategia, UX, frontend, backend, APIs, datos, cloud, automatización e IA aplicada con RAG.</p><div className="home-actions"><a className="line-button" href="/servicios" onClick={(event) => { event.preventDefault(); openServices() }}>Ver servicios</a><a className="home-github" href={seoData.site.profiles.github} target="_blank" rel="noreferrer">GitHub / tellounder ↗</a></div><div className="home-status"><i /> SIGNAL ONLINE <span>{audio ? 'AUDIO ARMED' : 'SILENT MODE'}</span></div></div><div className="home-side"><HeroAmpSelector project={previewProject} audio={audio} onPreview={setPreviewId} onOpen={selectProject} /></div></section>
}

function AlbumSleeve({ project, activeTrack, onTrack }: { project: Project; activeTrack: number; onTrack: (index: number) => void }) {
  const [notes, setNotes] = useState<number | 'stack' | null>(null)
  const [shareStatus, setShareStatus] = useState('')
  const resolvedTrack = Math.min(activeTrack, project.tracks.length - 1)
  const selectedTrack = project.tracks[resolvedTrack]
  const seo = projectSeo[project.id]
  const shareUrl = absoluteUrl(seo.path)
  const shareMessage = `${seo.shareText}\n\n${project.statement}\nAlcance: ${project.role}\n${shareUrl}`
  const whatsappShare = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`

  useEffect(() => { setNotes(null) }, [project.id])

  const chooseTrack = (index: number) => {
    onTrack(index)
    setNotes(index)
  }

  const shareProject = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: seo.title, text: seo.shareText, url: shareUrl })
        setShareStatus('Caso compartido')
      } else {
        await navigator.clipboard.writeText(shareMessage)
        setShareStatus('Enlace copiado')
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setShareStatus('Usá WhatsApp o copiá el enlace')
    }
    window.setTimeout(() => setShareStatus(''), 2600)
  }

  return <article className="album-sleeve" aria-label={`Funda de vinilo interactiva de ${project.title}`} style={{ '--sleeve-ink': project.id === 'avvivo' ? '#e4bc5a' : project.accent } as React.CSSProperties}>
    <img className="sleeve-vector" src={vinylSleeveUrl} alt="" aria-hidden="true" draggable="false" />
    <svg className="sleeve-ring-wear" viewBox="0 0 800 800" aria-hidden="true" focusable="false">
      <circle cx="400" cy="400" r="372" strokeWidth="7" strokeDasharray="210 32 136 64 351 71 89 46" />
      <circle cx="400" cy="400" r="369" strokeWidth="2" strokeDasharray="40 89 300 27 61 180" />
    </svg>
    <div className="album-sleeve__spine" aria-hidden="true"><span>TELLOUNDER DEVELOPER · {project.title}</span><b>TLL—{project.number}</b></div>
    <div className="sleeve-artwork" aria-hidden="true">
      <img key={project.id} src={sleeveArtwork[project.id]} alt="" loading="lazy" decoding="async" draggable="false" />
    </div>
    <div className="sleeve-cardboard-grain" aria-hidden="true" />
    <header className="album-sleeve__header">
      <div className="album-release"><span>TELLOUNDER DEVELOPER</span><strong>STEREO / VOL. {project.number}</strong></div>
      <div className="sleeve-title"><h2>{project.title}</h2><span className="sleeve-edition" aria-label={project.id === 'avvivo' ? 'Edición Gold' : `Edición ${project.number}`}>{project.id === 'avvivo' ? 'GOLD' : project.number}<small>EDITION</small></span></div>
      <span className="sleeve-subtitle">{project.subtitle}</span>
      <p>{project.statement}</p>
      <strong>{project.role}</strong>
    </header>
    <div className="sleeve-track-heading"><span>LADO A <i>/</i> {String(project.tracks.length).padStart(2, '0')} TEMAS</span><small>Tocá un tema para leer sus notas</small></div>
    <div className="album-now-playing" aria-live="polite"><span>EN EL PLATO</span><b>{String(resolvedTrack + 1).padStart(2, '0')}</b><strong>{selectedTrack.title}</strong></div>
    <div className="album-tracklist">
      {project.tracks.map((track, index) => {
        const selected = resolvedTrack === index
        const headingId = `track-heading-${project.id}-${index}`
        return <section className={`album-track ${selected ? 'is-selected' : ''}`} aria-labelledby={headingId} key={track.title}>
          <h3 id={headingId}><button className="album-track__trigger" type="button" aria-haspopup="dialog" aria-controls={`sleeve-notes-${project.id}`} onClick={() => chooseTrack(index)}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <i aria-hidden="true" />
            <span className="album-track__copy"><small>{track.chapter}</small><span className="album-track__title"><span>{track.title}</span><i aria-hidden="true" /></span><span className="album-track__summary">{track.summary}</span></span>
            <strong aria-hidden="true">↗</strong>
          </button></h3>
        </section>
      })}
    </div>
    <button className="project-stack-trigger" type="button" aria-haspopup="dialog" aria-controls={`sleeve-notes-${project.id}`} onClick={() => setNotes('stack')}>Ver stack completo <span>{project.stack.length} tecnologías ↗</span></button>
    <footer className="album-credits"><div className="sleeve-signature"><img src={logoUrl} alt="Tellounder" loading="lazy" /><span>CONCEPTO, DISEÑO Y DESARROLLO<br /><b>LEONARDO EMMANUEL TELLO</b></span></div><div className="project-share"><a className="hot-button" href={project.url} target="_blank" rel="noreferrer">Ver sitio ↗</a>{project.repository && <a className="line-button" href={project.repository} target="_blank" rel="noreferrer">Código ↗</a>}<button className="line-button" type="button" onClick={shareProject}>Compartir caso</button><a className="share-whatsapp" href={whatsappShare} target="_blank" rel="noreferrer">WhatsApp ↗</a></div><span className="project-share__status" role="status" aria-live="polite">{shareStatus}</span></footer>
    <div className="sleeve-colophon"><a href={project.url} target="_blank" rel="noreferrer">{project.host} ↗</a><span>TLL—{project.number} / 33⅓ RPM</span><svg viewBox="0 0 92 24" aria-hidden="true" focusable="false"><path d="M1 0v24M5 0v24M9 0v24M16 0v24M20 0v24M24 0v24M32 0v24M37 0v24M41 0v24M45 0v24M53 0v24M60 0v24M64 0v24M68 0v24M77 0v24M82 0v24M87 0v24M91 0v24" /></svg></div>
    {notes !== null && <SleeveNotesDialog key={project.id} project={project} page={notes} onPage={chooseTrack} onClose={() => setNotes(null)} />}
  </article>
}

function WorkScene({ project, select, play, scratch, reduced, primary }: { project: Project; select: (id: ProjectId) => void; play: () => void; scratch: (phase: ScratchPhase, velocity?: number) => void; reduced: boolean; primary: boolean }) {
  const [mode, setMode] = useState<'story' | 'live'>('story')
  const [frameKey, setFrameKey] = useState(0)
  const [activeTrack, setActiveTrack] = useState(0)
  const liveTriggerRef = useRandomInterference(mode === 'live', reduced)
  useEffect(() => { setMode('story'); setActiveTrack(0) }, [project.id])
  const openLive = () => window.open(project.url, '_blank', 'noopener,noreferrer')
  const chooseTrack = (index: number) => { setActiveTrack(index); play() }
  const resolvedTrack = Math.min(activeTrack, project.tracks.length - 1)
  const Heading = primary ? 'h1' : 'h2'
  return <section className="scene work-scene" data-project={project.id} aria-labelledby="project-title">
    <aside className="work-selector" aria-label="Seleccionar experiencia">
      <span className="selector-label">RECORD CRATE / {String(projects.length).padStart(2, '0')} RELEASES</span>
      {projects.map((item) => <a href={projectSeo[item.id].path} key={item.id} aria-current={project.id === item.id ? 'page' : undefined} className={project.id === item.id ? 'is-active' : ''} onClick={(event) => { event.preventDefault(); select(item.id); play() }} style={{ '--project': item.accent } as React.CSSProperties}><span>{item.number}</span><i /><b>{item.title}</b><small>{item.subtitle}</small></a>)}
    </aside>
    <div className={`project-stage ${mode === 'live' ? 'is-live-mode' : ''}`}>
      <header className="project-stage__header">
        <div>
          <span className="eyebrow">{project.type}</span>
          <Heading id="project-title">{project.title}{project.id === 'avvivo' && <span className="project-gold-badge">GOLD</span>}</Heading>
        </div>
        <div className="project-mode" role="tablist" aria-label="Modo de experiencia">
          <button role="tab" aria-selected={mode === 'story'} className={mode === 'story' ? 'is-active' : ''} onClick={() => setMode('story')}>Contratapa</button>
          <button ref={liveTriggerRef} role="tab" aria-selected={mode === 'live'} className={`site-live-trigger ${mode === 'live' ? 'is-active' : ''}`} onClick={() => setMode('live')}><span>Sitio vivo</span></button>
        </div>
      </header>
      <div className="project-stage__body">
        {mode === 'story' ? <>
          <div className="artifact-shell"><ProjectTurntable project={project} trackIndex={resolvedTrack} signal={play} scratch={scratch} onCueFirst={() => chooseTrack(0)} /></div>
          <AlbumSleeve project={project} activeTrack={resolvedTrack} onTrack={chooseTrack} />
        </> : <div className="live-monitor">
          <div className="browser-bar"><div className="browser-lights"><i /><i /><i /></div><span>{project.url}</span><button onClick={() => setFrameKey((value) => value + 1)}>RECARGAR</button><button onClick={openLive}>ABRIR ↗</button></div>
          {project.embeddable ? <iframe key={`${project.id}-${frameKey}`} src={project.url} title={`Sitio vivo de ${project.title}`} loading="eager" /> : <div className="frame-protected"><ProjectArtifact project={project} /><div><span>CSP / FRAME PROTECTED</span><h2>AVVIVO protege su aplicación.</h2><p>El sitio productivo sólo permite marcos de dominios autorizados. Abrilo en su ventana real para recorrerlo completo.</p><button className="hot-button" onClick={openLive}>Abrir AVVIVO ↗</button></div></div>}
        </div>}
      </div>
    </div>
  </section>
}

function ServicesScene({ primary, focusRag, selectProject, openContact }: { primary: boolean; focusRag: boolean; selectProject: (id: ProjectId) => void; openContact: () => void }) {
  const generalPage = seoData.pages.find((page) => page.id === 'services') ?? seoData.pages[0]
  const ragPage = seoData.pages.find((page) => page.id === 'rag') ?? generalPage
  const page = focusRag ? ragPage : generalPage
  const Heading = primary ? 'h1' : 'h2'
  const services = focusRag ? [...seoData.services].sort((a, b) => Number(b.id === 'ia-rag') - Number(a.id === 'ia-rag')) : seoData.services

  return <section className={`scene services-scene ${focusRag ? 'is-rag-focus' : ''}`} aria-labelledby="services-title">
    <header className="services-heading">
      <span className="eyebrow">SYSTEMS / PRODUCT / COGNITION</span>
      <Heading id="services-title">{page.h1}</Heading>
      <p>{page.lead}</p>
      <div className="services-heading__actions"><a className="hot-button" href="/contacto" onClick={(event) => { event.preventDefault(); openContact() }}>Contame el desafío</a><a className="line-button" href={seoData.site.profiles.github} target="_blank" rel="noreferrer">Ver GitHub ↗</a></div>
    </header>
    <div className="services-grid">
      {services.map((service, index) => <article className={`service-card ${service.id === 'ia-rag' ? 'service-card--rag' : ''}`} id={`service-${service.id}`} key={service.id}>
        <span>0{index + 1} / {service.id.replaceAll('-', ' ')}</span>
        <h3>{service.title}</h3>
        <p>{service.summary}</p>
        <p className="service-card__detail">{service.detail}</p>
        {service.projectIds.length > 0 && <div className="service-card__cases" aria-label={`Casos vinculados con ${service.title}`}>{service.projectIds.map((id) => {
          const linkedProject = projects.find((item) => item.id === id)
          return linkedProject ? <a href={projectSeo[id].path} onClick={(event) => { event.preventDefault(); selectProject(id) }} key={id}>{linkedProject.title} ↗</a> : null
        })}</div>}
      </article>)}
    </div>
    <aside className="services-trust" aria-label="Criterio de implementación"><span><i /> CRITERIO DE TRABAJO</span><p>La tecnología se elige por la función que debe cumplir. En IA aplicada, las fuentes, los permisos, el contexto y la revisión humana forman parte del sistema.</p></aside>
  </section>
}

function MethodScene({ primary }: { primary: boolean }) {
  const [active, setActive] = useState(0)
  const Heading = primary ? 'h1' : 'h2'
  return <section className="scene method-scene" aria-labelledby="method-title"><header className="scene-heading"><span className="eyebrow">FROM INPUT TO LIVE / INTERACTIVE SIGNAL</span><Heading id="method-title">Signal chain</Heading><p>No es una lista de tecnologías. Es el recorrido que convierte una idea en un producto comprobable.</p></header><div className="method-board"><div className="method-cable"><span style={{ width: `${active / (method.length - 1) * 100}%` }} /></div><div className="method-nodes">{method.map(([number, title], index) => <button key={title} className={index === active ? 'is-active' : index < active ? 'is-passed' : ''} onClick={() => setActive(index)}><i /><span>{number}</span><b>{title}</b></button>)}</div><div className="method-readout"><span>{method[active][0]}</span><div><h3>{method[active][1]}</h3><p>{method[active][2]}</p></div><strong>{active === 7 ? 'SIGNAL LIVE' : 'SIGNAL ACTIVE'}</strong></div></div><blockquote>“Un deploy no demuestra que el sistema funciona. El resultado se verifica.”</blockquote></section>
}

function AboutScene({ primary }: { primary: boolean }) {
  const chapters = [
    { label: 'Sonido', signal: 'El origen', title: 'Primero aprendí a escuchar.', body: 'El audio me enseñó que una experiencia no es una suma de piezas: es una señal completa. Fuente, recorrido, interferencia, respuesta y emoción.', skills: ['Audio', 'Señal', 'Calibración'] },
    { label: 'Electrónica', signal: 'Materia y circuito', title: 'Entender qué conecta con qué.', body: 'La electrónica convirtió la curiosidad en método: diagnosticar, prototipar, medir y encontrar la causa real antes de reemplazar una pieza.', skills: ['Circuitos', 'Diagnóstico', 'Prototipos'] },
    { label: 'Diseño', signal: 'Forma con intención', title: 'Hacer visible una idea.', body: 'El diseño sumó identidad, jerarquía y narrativa. No decoro interfaces: organizo información para que una persona entienda, decida y avance.', skills: ['Identidad', 'UX / UI', 'Narrativa'] },
    { label: 'Software', signal: 'Construcción digital', title: 'De la interfaz al funcionamiento.', body: 'El desarrollo web conectó frontend, backend, APIs, datos y cloud. La pantalla dejó de ser el resultado final y pasó a ser la entrada a un producto.', skills: ['Frontend', 'Backend', 'Cloud'] },
    { label: 'Sistemas', signal: 'Producto end-to-end', title: 'Las partes empiezan a responder juntas.', body: 'Construir sistemas significa definir actores, reglas, estados, operaciones y evidencia. AVVIVO es la expresión más completa de esa manera de pensar.', skills: ['Producto', 'Arquitectura', 'Operación'] },
    { label: 'Cognición', signal: 'La etapa actual', title: 'Software que trabaja con contexto y evidencia.', body: 'La IA aplicada amplía un sistema cuando consulta conocimiento propio, recupera fuentes y mantiene reglas, permisos y revisión humana.', skills: ['IA aplicada', 'RAG', 'Gobernanza'] },
  ]
  const [chapter, setChapter] = useState(4)
  const selected = chapters[chapter]
  const Heading = primary ? 'h1' : 'h2'
  return <section className="scene about-scene" aria-labelledby="about-title"><figure className="about-portrait about-portrait--photo"><img className="about-portrait__image" src={portraitUrl} alt="Leonardo Emmanuel Tello, creador de Tellounder" loading="lazy" decoding="async" /><div className="portrait-signal" /><figcaption>TELLOUNDER<br />LEONARDO / 2014—NOW</figcaption></figure><div className="about-copy"><span className="eyebrow">BEHIND THE SIGNAL</span><Heading id="about-title">Soy Leonardo.<br />Construyo como Tellounder.</Heading><p>Tellounder nació desde la electrónica y el sonido. La necesidad de entender cómo se conectan las partes evolucionó hacia el diseño, el software y los productos digitales completos.</p><p>Hoy llevo ideas desde una conversación inicial hasta una experiencia, una arquitectura y un funcionamiento comprobable.</p><a className="about-github" href={seoData.site.profiles.github} target="_blank" rel="noreferrer">github.com/tellounder ↗</a></div><div className="chapter-switcher" role="tablist" aria-label="Capítulos de la trayectoria">{chapters.map((item, index) => <button key={item.label} id={`chapter-tab-${index}`} role="tab" aria-selected={index === chapter} aria-controls="chapter-panel" className={index === chapter ? 'is-active' : ''} onClick={() => setChapter(index)}><span>0{index + 1}</span>{item.label}</button>)}</div><div className="chapter-panel" id="chapter-panel" role="tabpanel" aria-labelledby={`chapter-tab-${chapter}`} key={selected.label}><div className="chapter-panel__number">0{chapter + 1}</div><div className="chapter-panel__copy"><span>{selected.signal}</span><h3>{selected.title}</h3><p>{selected.body}</p></div><div className="chapter-panel__skills">{selected.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></div><div className="about-quote">No hago solamente sitios.<br /><strong>Construyo el sistema que una idea necesita para existir.</strong></div></section>
}

function ContactScene({ primary }: { primary: boolean }) {
  const [intent, setIntent] = useState('producto'); const intents = { presencia: 'Necesito una presencia digital', producto: 'Quiero construir un producto', sistema: 'Tengo un sistema para evolucionar', equipo: 'Quiero sumar a Tellounder' }
  const selectedIntent = intents[intent as keyof typeof intents]
  const whatsappHref = `https://wa.me/5491130623998?text=${encodeURIComponent(`Hola Leonardo, llegué desde Tellounder. ${selectedIntent}.`)}`
  const Heading = primary ? 'h1' : 'h2'
  return <section className="scene contact-scene" aria-labelledby="contact-title"><span className="eyebrow">ENCORE / START A SIGNAL</span><Heading id="contact-title">¿Qué querés <em>construir?</em></Heading><div className="intent-board">{(Object.keys(intents) as Array<keyof typeof intents>).map((key, index) => <button key={key} className={intent === key ? 'is-active' : ''} onClick={() => setIntent(key)}><span>0{index + 1}</span>{intents[key]}</button>)}</div><div className="contact-output"><span>SELECTED INPUT</span><h3>{selectedIntent}</h3><p>Contame qué existe hoy, qué necesitás cambiar y qué debería poder hacer el resultado.</p><div className="contact-actions"><a className="hot-button" href={whatsappHref} target="_blank" rel="noreferrer">WhatsApp / +54 9 11 3062-3998 ↗</a><a className="line-button" href={seoData.site.profiles.instagram} target="_blank" rel="noreferrer">Instagram / @tellounder ↗</a><a className="contact-link" href={seoData.site.profiles.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a><a className="contact-link" href={seoData.site.profiles.github} target="_blank" rel="noreferrer">GitHub / tellounder ↗</a></div></div><img src={logoUrl} alt="" aria-hidden="true" /></section>
}

function App({ initialAudio = false }: { initialAudio?: boolean }) {
  const initialRouteRef = useRef<RouteState | null>(null)
  if (!initialRouteRef.current) initialRouteRef.current = resolveRoute(window.location.pathname)
  const initialRoute = initialRouteRef.current
  const reduced = useReducedMotion()
  const sound = useSound()
  const [powered, setPowered] = useState(true)
  const [audio, setAudio] = useState(initialAudio)
  const [route, setRoute] = useState<RouteState>(initialRoute)
  const [scene, setScene] = useState<Scene>(initialRoute.scene)
  const [projectId, setProjectId] = useState<ProjectId>(initialRoute.projectId ?? 'avvivo')
  const [tone, setTone] = useState<Tone>('drive')
  const [xray, setXray] = useState(false)
  const initialScrollDone = useRef(false)
  const project = projects.find((item) => item.id === projectId) ?? projects[0]
  const accent = scene === 'work' ? project.accent : '#ef0a3a'

  const scrollToScene = useCallback((next: Scene, behavior: ScrollBehavior = 'smooth') => {
    window.requestAnimationFrame(() => document.getElementById(next)?.scrollIntoView({ behavior: reduced ? 'auto' : behavior, block: 'start' }))
  }, [reduced])

  const commitRoute = useCallback((path: string, replace = false) => {
    const next = resolveRoute(path)
    const currentPath = window.location.pathname.replace(/\/+$/, '') || '/'
    const nextPath = next.path.replace(/\/+$/, '') || '/'
    if (currentPath !== nextPath) window.history[replace ? 'replaceState' : 'pushState']({ tellounder: next.id }, '', next.path)
    setRoute(next)
    setScene(next.scene)
    if (next.projectId) setProjectId(next.projectId)
    scrollToScene(next.scene)
  }, [scrollToScene])

  const pathForScene = useCallback((next: Scene) => {
    if (next === 'work') return projectSeo[projectId].path
    const preferredId = next === 'services' ? 'services' : next
    return seoData.pages.find((page) => page.id === preferredId)?.path ?? '/'
  }, [projectId])

  const navigate = useCallback((next: Scene) => {
    commitRoute(pathForScene(next))
    sound('nav', audio)
  }, [audio, commitRoute, pathForScene, sound])

  const selectProject = useCallback((id: ProjectId) => {
    setProjectId(id)
    commitRoute(projectSeo[id].path)
    sound('project', audio)
  }, [audio, commitRoute, sound])

  useEffect(() => { document.documentElement.dataset.tone = tone; document.documentElement.classList.toggle('xray', xray) }, [tone, xray])
  useEffect(() => {
    document.body.classList.toggle('is-gated', !powered)
    return () => document.body.classList.remove('is-gated')
  }, [powered])
  useEffect(() => syncDocumentMetadata(route), [route])
  useEffect(() => {
    const onPopState = () => {
      const next = resolveRoute(window.location.pathname)
      setRoute(next)
      setScene(next.scene)
      if (next.projectId) setProjectId(next.projectId)
      setPowered(true)
      scrollToScene(next.scene, 'auto')
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [scrollToScene])
  useEffect(() => {
    if (!powered || initialScrollDone.current) return
    initialScrollDone.current = true
    scrollToScene(route.scene, 'auto')
    const settle = window.setTimeout(() => scrollToScene(route.scene, 'auto'), 320)
    return () => window.clearTimeout(settle)
  }, [powered, route.scene, scrollToScene])
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.defaultPrevented) return
      if (document.querySelector('dialog[open]')) return
      if (event.target instanceof HTMLElement && event.target.closest('input, textarea, select, button, [contenteditable="true"]')) return
      const index = Number(event.key) - 1
      if (/^[1-9]$/.test(event.key) && projects[index]) selectProject(projects[index].id)
      if (event.key === 'Escape') navigate('home')
      if (scene === 'work' && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
        event.preventDefault()
        const current = projects.findIndex((item) => item.id === projectId)
        const delta = event.key === 'ArrowRight' ? 1 : -1
        selectProject(projects[(current + delta + projects.length) % projects.length].id)
      }
      if (event.key.toLowerCase() === 'x') setXray((value) => !value)
    }
    addEventListener('keydown', keydown)
    return () => removeEventListener('keydown', keydown)
  }, [navigate, projectId, scene, selectProject])
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-scene]'))
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const element = entry.target as HTMLElement
        element.classList.add('is-visible')
      })
    }, { rootMargin: '-34% 0px -48% 0px', threshold: 0 })
    sections.forEach((section) => observer.observe(section))
    let animationFrame = 0
    const updateProgress = () => {
      animationFrame = 0
      const available = document.documentElement.scrollHeight - window.innerHeight
      const progress = available > 0 ? window.scrollY / available : 0
      document.documentElement.style.setProperty('--page-progress', String(progress))
      const probe = window.innerHeight * .42
      let activeSection = sections[0]
      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= probe) activeSection = section
      })
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8) activeSection = sections.at(-1) ?? activeSection
      if (activeSection) setScene(activeSection.dataset.scene as Scene)
    }
    const onScroll = () => { if (!animationFrame) animationFrame = window.requestAnimationFrame(updateProgress) }
    updateProgress()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
    }
  }, [powered])
  return <>
    <div className="control-room" data-tone={tone} style={{ '--accent': accent } as React.CSSProperties}>
      <AmbientCanvas tone={tone} reduced={reduced} accent={accent} /><div className="leather-texture" aria-hidden="true" /><div className="global-noise" />
      <header className="topbar"><a className="brand" href="/" onClick={(event) => { event.preventDefault(); navigate('home') }} aria-label="Volver al inicio de Tellounder"><img src={logoUrl} alt="Tellounder" /></a><nav aria-label="Secciones principales">{scenes.map((item) => <a href={pathForScene(item.id)} key={item.id} aria-current={scene === item.id ? 'page' : undefined} className={scene === item.id ? 'is-active' : ''} onClick={(event) => { event.preventDefault(); navigate(item.id) }}><span>{item.number}</span><b>{item.label}</b><small>{item.sub}</small></a>)}</nav><div className="top-tools"><button onClick={() => setXray(!xray)} className={xray ? 'is-active' : ''}>X-RAY <kbd>X</kbd></button><button onClick={() => { setAudio(!audio); sound('secret', !audio) }} className={audio ? 'is-active' : ''}>{audio ? 'AUDIO ON' : 'AUDIO OFF'}</button></div></header>
      <main className="viewport">
        <div id="home" data-scene="home"><HomeScene selectProject={selectProject} openServices={() => navigate('services')} audio={audio} primary={route.id === 'home'} /></div>
        <div className="flow-ribbon" aria-hidden="true"><div><span>PRODUCTO</span><i>✦</i><span>DISEÑO</span><i>✦</i><span>FRONTEND</span><i>✦</i><span>BACKEND</span><i>✦</i><span>SISTEMAS</span><i>✦</i><span>COGNICIÓN</span><i>✦</i><span>PRODUCTO</span><i>✦</i><span>DISEÑO</span><i>✦</i><span>FRONTEND</span><i>✦</i><span>BACKEND</span><i>✦</i></div></div>
        <div id="work" data-scene="work"><WorkScene project={project} select={selectProject} play={() => sound('project', audio)} scratch={(phase, velocity) => sound(`scratch-${phase}`, audio, velocity)} reduced={reduced} primary={Boolean(route.projectId)} /></div>
        <section className="flow-statement"><span>BEYOND THE SCREEN / 2014—2026</span><p>No hago solamente sitios.</p><strong>Construyo el sistema que una idea necesita para existir.</strong></section>
        <div id="services" data-scene="services"><ServicesScene primary={route.id === 'services' || route.id === 'rag'} focusRag={route.id === 'rag'} selectProject={selectProject} openContact={() => navigate('contact')} /></div>
        <div id="method" data-scene="method"><MethodScene primary={route.id === 'method'} /></div>
        <div id="about" data-scene="about"><AboutScene primary={route.id === 'about'} /></div>
        <div id="contact" data-scene="contact"><ContactScene primary={route.id === 'contact'} /></div>
      </main>
      <footer className="statusbar"><span><i /> CONTROL ROOM ONLINE</span><span>CHAPTER / {scene.toUpperCase()}</span><span>SCROLL / FLOW</span><span>ESC / HOME</span><div className="tone-control">{(['clean', 'drive', 'fuzz'] as Tone[]).map((item) => <button key={item} className={tone === item ? 'is-active' : ''} onClick={() => setTone(item)}>{item}</button>)}</div></footer>
    </div>
  </>
}

export default App
