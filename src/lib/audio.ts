// Web Audio cue engine. We synthesize all cues with oscillators so there are no
// asset files to ship and the sounds are sample-accurate even when the tab is
// backgrounded (HTMLAudio gets throttled; the Web Audio clock does not).
//
// Browsers require a user gesture before audio can play, so `unlock()` must be
// called from a click/keydown handler once.
//
// A "sound pack" picks the timbre of all cues; `off` is fully silent.

export type SoundPack = 'beeps' | 'soft' | 'marimba' | 'off'

export const SOUND_PACKS: { id: SoundPack; nameKey: string }[] = [
  { id: 'beeps', nameKey: 'sBeeps' },
  { id: 'soft', nameKey: 'sSoft' },
  { id: 'marimba', nameKey: 'sMarimba' },
  { id: 'off', nameKey: 'sOff' },
]

let ctx: AudioContext | null = null
let pack: SoundPack = 'beeps'
let volume = 0.6

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    try {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return null
      ctx = new Ctor()
    } catch {
      return null
    }
  }
  return ctx
}

export function unlockAudio(): void {
  try {
    const c = getCtx()
    if (c && c.state === 'suspended') void c.resume()
  } catch {
    /* ignore */
  }
}

export function setSoundPack(value: SoundPack): void {
  pack = value
}

export function setVolume(value: number): void {
  volume = Math.max(0, Math.min(1, value))
}

/** Play one tone. `when` is an offset in seconds from now for precise scheduling. */
function tone(
  freq: number,
  durationSec: number,
  when = 0,
  type: OscillatorType = 'sine',
  gainScale = 1,
): void {
  const c = getCtx()
  if (!c) return
  // Audio is a non-essential enhancement; never let it break the timer (e.g. a
  // headless/CI environment with no audio device, or a blocked AudioContext).
  try {
    const start = c.currentTime + when
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, start)

    const peak = 0.0001 + volume * 0.4 * gainScale
    // Short attack + exponential release for a clean "beep" without clicks.
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + durationSec)

    osc.connect(gain).connect(c.destination)
    osc.start(start)
    osc.stop(start + durationSec + 0.02)
  } catch {
    /* ignore */
  }
}

/** A single short countdown pip (the 3-2-1 before any transition). */
export function cuePip(): void {
  if (pack === 'off') return
  if (pack === 'soft') tone(660, 0.12, 0, 'sine', 0.6)
  else if (pack === 'marimba') tone(1047, 0.14, 0, 'triangle', 0.8)
  else tone(880, 0.12, 0, 'square', 0.7)
}

/** Marks the start of a WORK interval. */
export function cueWork(): void {
  if (pack === 'off') return
  if (pack === 'soft') {
    tone(523.25, 0.4, 0, 'sine', 0.9)
  } else if (pack === 'marimba') {
    tone(659.25, 0.45, 0, 'triangle', 1)
    tone(987.77, 0.45, 0.05, 'sine', 0.4)
  } else {
    tone(523.25, 0.5, 0, 'sawtooth', 1)
    tone(784, 0.5, 0, 'sine', 0.5)
  }
}

/** Marks the start of REST. */
export function cueRest(): void {
  if (pack === 'off') return
  if (pack === 'soft') {
    tone(392, 0.28, 0, 'sine', 0.8)
  } else if (pack === 'marimba') {
    tone(440, 0.3, 0, 'triangle', 0.9)
  } else {
    tone(440, 0.18, 0, 'sine')
    tone(330, 0.22, 0.16, 'sine')
  }
}

/** Switch to a pack and play a short sample of it (for the settings picker). */
export function previewSoundPack(p: SoundPack): void {
  setSoundPack(p)
  if (p === 'off') return
  unlockAudio()
  cuePip()
  window.setTimeout(() => cueWork(), 200)
}

/** Celebratory rising arpeggio when the whole workout finishes. */
export function cueFinish(): void {
  if (pack === 'off') return
  const notes = pack === 'soft' ? [392, 494, 587, 784] : [523.25, 659.25, 783.99, 1046.5]
  const wave: OscillatorType = pack === 'beeps' ? 'triangle' : pack === 'soft' ? 'sine' : 'triangle'
  notes.forEach((f, i) => tone(f, 0.35, i * 0.14, wave, 1))
}
