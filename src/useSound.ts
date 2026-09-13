import { useCallback, useEffect, useRef } from 'react'

export type ScratchPhase = 'start' | 'move' | 'end' | 'tap'
export type SoundKind = 'power' | 'nav' | 'project' | 'secret' | `scratch-${ScratchPhase}`

type ScratchEngine = {
  forward: AudioBufferSourceNode
  reverse: AudioBufferSourceNode
  forwardGain: GainNode
  reverseGain: GainNode
  highpass: BiquadFilterNode
  bandpass: BiquadFilterNode
  tone: OscillatorNode
  toneGain: GainNode
  master: GainNode
  panner: StereoPannerNode
  stopped: boolean
}

type VinylBuffers = { forward: AudioBuffer; reverse: AudioBuffer }

const clamp = (value: number, minimum: number, maximum: number) => Math.min(maximum, Math.max(minimum, value))

function createVinylNoise(audio: AudioContext): VinylBuffers {
  const duration = .72
  const length = Math.floor(audio.sampleRate * duration)
  const forward = audio.createBuffer(1, length, audio.sampleRate)
  const reverse = audio.createBuffer(1, length, audio.sampleRate)
  const data = forward.getChannelData(0)
  let groove = 0
  let phase = 0
  for (let index = 0; index < data.length; index += 1) {
    const white = Math.random() * 2 - 1
    groove = groove * .965 + white * .055
    const cycle = (index / audio.sampleRate * 5.4) % 1
    const sweepFrequency = 135 + cycle * 940
    phase += Math.PI * 2 * sweepFrequency / audio.sampleRate
    const sweepEnvelope = Math.pow(Math.sin(Math.PI * cycle), 1.7)
    const grooveTone = (Math.sin(phase) + Math.sin(phase * 2.03) * .26) * sweepEnvelope * .16
    const rotation = Math.sin(index * .0137) * .08 + Math.sin(index * .0041) * .045
    const dust = Math.random() < .0009 ? (Math.random() * 2 - 1) * .82 : 0
    data[index] = clamp(groove * .62 + white * .11 + rotation + grooveTone + dust, -1, 1)
  }
  const reversed = reverse.getChannelData(0)
  for (let index = 0; index < length; index += 1) reversed[index] = data[length - index - 1]
  return { forward, reverse }
}

function disconnectScratch(engine: ScratchEngine) {
  for (const node of [engine.forward, engine.reverse, engine.forwardGain, engine.reverseGain, engine.highpass, engine.bandpass, engine.tone, engine.toneGain, engine.master, engine.panner]) {
    try { node.disconnect() } catch { /* already disconnected */ }
  }
}

function stopScratch(engine: ScratchEngine, audio: AudioContext, duration = .1) {
  if (engine.stopped) return
  engine.stopped = true
  const now = audio.currentTime
  const end = now + duration
  engine.master.gain.cancelScheduledValues(now)
  engine.master.gain.setValueAtTime(Math.max(.0001, engine.master.gain.value), now)
  engine.master.gain.exponentialRampToValueAtTime(.0001, end)
  engine.toneGain.gain.cancelScheduledValues(now)
  engine.toneGain.gain.setValueAtTime(Math.max(.0001, engine.toneGain.gain.value), now)
  engine.toneGain.gain.exponentialRampToValueAtTime(.0001, end)
  try { engine.forward.stop(end + .025) } catch { /* source already stopped */ }
  try { engine.reverse.stop(end + .025) } catch { /* source already stopped */ }
  try { engine.tone.stop(end + .025) } catch { /* oscillator already stopped */ }
  engine.forward.onended = () => disconnectScratch(engine)
}

function playNeedleClick(audio: AudioContext, strength = .6) {
  const duration = .055
  const buffer = audio.createBuffer(1, Math.floor(audio.sampleRate * duration), audio.sampleRate)
  const data = buffer.getChannelData(0)
  for (let index = 0; index < data.length; index += 1) {
    const envelope = Math.exp(-index / (audio.sampleRate * .008))
    const impulse = index < 3 || index === Math.floor(audio.sampleRate * .011) ? 1 : 0
    data[index] = ((Math.random() * 2 - 1) * .48 + impulse * .7) * envelope
  }
  const source = audio.createBufferSource()
  const highpass = audio.createBiquadFilter()
  const gain = audio.createGain()
  const now = audio.currentTime
  source.buffer = buffer
  highpass.type = 'highpass'
  highpass.frequency.value = 1250
  gain.gain.setValueAtTime(.0001, now)
  gain.gain.exponentialRampToValueAtTime(.025 + strength * .026, now + .002)
  gain.gain.exponentialRampToValueAtTime(.0001, now + duration)
  source.connect(highpass)
  highpass.connect(gain)
  gain.connect(audio.destination)
  source.onended = () => { source.disconnect(); highpass.disconnect(); gain.disconnect() }
  source.start(now)
  source.stop(now + duration + .01)
}

export function useSound() {
  const context = useRef<AudioContext | null>(null)
  const noise = useRef<VinylBuffers | null>(null)
  const scratch = useRef<ScratchEngine | null>(null)
  const tapTimer = useRef<number | null>(null)

  const sound = useCallback((kind: SoundKind, enabled: boolean, amount = 0) => {
    if (!enabled) {
      if (scratch.current && context.current) {
        stopScratch(scratch.current, context.current, .025)
        scratch.current = null
      }
      return
    }

    const audio = context.current?.state === 'closed' || !context.current ? new AudioContext({ latencyHint: 'interactive' }) : context.current
    context.current = audio
    if (audio.state === 'suspended') void audio.resume().catch(() => undefined)

    const startScratch = () => {
      if (tapTimer.current) window.clearTimeout(tapTimer.current)
      if (scratch.current) stopScratch(scratch.current, audio, .025)
      const forward = audio.createBufferSource()
      const reverse = audio.createBufferSource()
      const forwardGain = audio.createGain()
      const reverseGain = audio.createGain()
      const highpass = audio.createBiquadFilter()
      const bandpass = audio.createBiquadFilter()
      const tone = audio.createOscillator()
      const toneGain = audio.createGain()
      const master = audio.createGain()
      const panner = audio.createStereoPanner()
      const now = audio.currentTime

      noise.current ??= createVinylNoise(audio)
      forward.buffer = noise.current.forward
      reverse.buffer = noise.current.reverse
      forward.loop = true
      reverse.loop = true
      forward.playbackRate.value = .48
      reverse.playbackRate.value = .48
      forwardGain.gain.value = .72
      reverseGain.gain.value = .0001
      highpass.type = 'highpass'
      highpass.frequency.value = 145
      bandpass.type = 'bandpass'
      bandpass.frequency.value = 760
      bandpass.Q.value = .58
      tone.type = 'triangle'
      tone.frequency.value = 155
      toneGain.gain.value = .0015
      master.gain.setValueAtTime(.0001, now)
      master.gain.exponentialRampToValueAtTime(.016, now + .018)
      panner.pan.value = 0

      forward.connect(forwardGain)
      reverse.connect(reverseGain)
      forwardGain.connect(highpass)
      reverseGain.connect(highpass)
      highpass.connect(bandpass)
      bandpass.connect(master)
      tone.connect(toneGain)
      toneGain.connect(bandpass)
      master.connect(panner)
      panner.connect(audio.destination)

      const engine: ScratchEngine = { forward, reverse, forwardGain, reverseGain, highpass, bandpass, tone, toneGain, master, panner, stopped: false }
      const offset = Math.random() * noise.current.forward.duration
      forward.start(now, offset)
      reverse.start(now, (noise.current.reverse.duration - offset) % noise.current.reverse.duration)
      tone.start(now)
      scratch.current = engine
      playNeedleClick(audio, .72)
      return engine
    }

    const moveScratch = (engine: ScratchEngine, velocity: number) => {
      if (engine.stopped) return
      const now = audio.currentTime
      const signed = clamp(velocity, -2.6, 2.6)
      const magnitude = Math.abs(signed)
      const direction = signed === 0 ? 0 : Math.sign(signed)
      const normalized = Math.min(1, magnitude / 2.5)
      const gain = .008 + normalized * .075
      const toneGain = .001 + normalized * .012
      const frequency = (direction < 0 ? 650 : 900) + normalized * (direction < 0 ? 2200 : 2900)
      const toneFrequency = 118 + normalized * (direction < 0 ? 430 : 650)

      engine.master.gain.setTargetAtTime(gain, now, .016)
      engine.toneGain.gain.setTargetAtTime(toneGain, now, .012)
      engine.bandpass.frequency.setTargetAtTime(frequency, now, .014)
      engine.bandpass.Q.setTargetAtTime(.54 + normalized * .46, now, .018)
      engine.forward.playbackRate.setTargetAtTime(.35 + normalized * 2.4, now, .012)
      engine.reverse.playbackRate.setTargetAtTime(.35 + normalized * 2.4, now, .012)
      engine.forwardGain.gain.setTargetAtTime(direction < 0 ? .0001 : 1, now, .014)
      engine.reverseGain.gain.setTargetAtTime(direction < 0 ? 1 : .0001, now, .014)
      engine.tone.frequency.setTargetAtTime(toneFrequency, now, .012)
      engine.tone.detune.setTargetAtTime(direction * (100 + normalized * 260), now, .016)
      engine.panner.pan.setTargetAtTime(direction * normalized * .14, now, .018)
    }

    if (kind === 'scratch-start') {
      startScratch()
      return
    }
    if (kind === 'scratch-move') {
      const engine = scratch.current ?? startScratch()
      if (engine) moveScratch(engine, amount)
      return
    }
    if (kind === 'scratch-end') {
      const engine = scratch.current
      if (!engine) return
      moveScratch(engine, amount * .42)
      stopScratch(engine, audio, .12)
      scratch.current = null
      playNeedleClick(audio, .22)
      return
    }
    if (kind === 'scratch-tap') {
      const engine = startScratch()
      if (!engine) return
      moveScratch(engine, amount || .72)
      tapTimer.current = window.setTimeout(() => {
        if (scratch.current === engine) scratch.current = null
        stopScratch(engine, audio, .14)
        playNeedleClick(audio, .18)
      }, 145)
      return
    }

    const now = audio.currentTime
    const gain = audio.createGain()
    const filter = audio.createBiquadFilter()
    gain.gain.setValueAtTime(.0001, now)
    gain.gain.exponentialRampToValueAtTime(kind === 'power' ? .1 : .035, now + .015)
    gain.gain.exponentialRampToValueAtTime(.0001, now + (kind === 'power' ? .65 : .17))
    filter.type = 'lowpass'
    filter.frequency.value = kind === 'secret' ? 1400 : 650
    filter.connect(gain)
    gain.connect(audio.destination)
    const notes = kind === 'power' ? [55, 82.4, 110] : kind === 'project' ? [98, 147] : kind === 'secret' ? [147, 220, 294] : [110]
    notes.forEach((frequency, index) => {
      const oscillator = audio.createOscillator()
      oscillator.type = index ? 'triangle' : 'sawtooth'
      oscillator.frequency.setValueAtTime(frequency, now)
      oscillator.connect(filter)
      oscillator.start(now + index * .018)
      oscillator.stop(now + (kind === 'power' ? .68 : .18))
      oscillator.onended = () => oscillator.disconnect()
    })
    window.setTimeout(() => { try { filter.disconnect(); gain.disconnect() } catch { /* already disconnected */ } }, kind === 'power' ? 760 : 260)
  }, [])

  useEffect(() => () => {
    if (tapTimer.current) window.clearTimeout(tapTimer.current)
    if (scratch.current && context.current) stopScratch(scratch.current, context.current, .015)
    scratch.current = null
    const audio = context.current
    context.current = null
    noise.current = null
    if (audio && audio.state !== 'closed') void audio.close()
  }, [])

  return sound
}
