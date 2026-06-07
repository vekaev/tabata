import { useMemo, useState, type ReactNode } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { TopLeft, TopRight, Logo } from '../components/Chrome'
import { NumberStepper } from '../components/NumberStepper'
import { Modal } from '../components/Modal'
import { unlockAudio } from '../lib/audio'
import { useLang, type TFunction } from '../lib/i18n'
import {
  DEFAULT_CONFIG,
  PRESETS,
  configLabel,
  formatClock,
  normalizeConfig,
  sameConfig,
  totalDurationSec,
  type TabataConfig,
} from '../lib/tabata'
import {
  createUserPreset,
  loadConfig,
  loadHiddenPresets,
  loadHistory,
  loadPresets,
  pushHistory,
  saveConfig,
  saveHiddenPresets,
  savePresets,
} from '../lib/storage'

export const Route = createFileRoute('/tabata')({
  head: () => ({
    meta: [
      { title: 'Tabata Timer — 20s Work / 10s Rest Intervals' },
      {
        name: 'description',
        content: 'Classic 20s-on / 10s-off Tabata interval timer with big fullscreen countdown, sets, presets and audio cues.',
      },
    ],
  }),
  component: TabataConfigScreen,
})

type NumericKey = Exclude<keyof TabataConfig, 'id' | 'name' | 'roundNames'>

// Seconds nudge by 5 (the natural HIIT granularity); counts nudge by 1.
// Order fills the 2-column grid row by row: Rounds | Sets, Work | Rest,
// Prepare | Cooldown. "Rest between sets" + round labels live under Advanced.
type FieldDef = {
  key: NumericKey
  labelKey: Parameters<TFunction>[0]
  unitKey: Parameters<TFunction>[0] | null
  min: number
  max: number
  step: number
}

const FIELDS: FieldDef[] = [
  { key: 'rounds', labelKey: 'rounds', unitKey: null, min: 1, max: 99, step: 1 },
  { key: 'sets', labelKey: 'sets', unitKey: null, min: 1, max: 99, step: 1 },
  { key: 'workSec', labelKey: 'work', unitKey: 'seconds', min: 1, max: 3600, step: 5 },
  { key: 'restSec', labelKey: 'rest', unitKey: 'seconds', min: 0, max: 3600, step: 5 },
  { key: 'prepareSec', labelKey: 'prepare', unitKey: 'seconds', min: 0, max: 60, step: 5 },
  { key: 'cooldownSec', labelKey: 'cooldown', unitKey: 'seconds', min: 0, max: 3600, step: 5 },
]

const SET_REST_FIELD: FieldDef = {
  key: 'restBetweenSetsSec',
  labelKey: 'setRest',
  unitKey: 'seconds',
  min: 0,
  max: 3600,
  step: 5,
}

function Chip({
  label,
  selected,
  onSelect,
  corner,
}: {
  label: string
  selected: boolean
  onSelect: () => void
  corner?: ReactNode
}) {
  return (
    <span className="group relative inline-flex">
      <button
        onClick={onSelect}
        aria-pressed={selected}
        className={`focus-ring rounded-full border px-3.5 py-[7px] font-ui text-[0.8rem] tracking-[0.04em] transition-colors ${
          selected
            ? 'border-accent bg-[color-mix(in_srgb,var(--accent)_18%,transparent)] text-fg'
            : 'border-border text-fg-secondary hover:border-border-strong hover:bg-hover hover:text-fg'
        }`}
      >
        {label}
      </button>
      {corner}
    </span>
  )
}

function Field({
  field,
  value,
  onChange,
  t,
}: {
  field: FieldDef
  value: number
  onChange: (v: number) => void
  t: TFunction
}) {
  const label = t(field.labelKey)
  const unit = field.unitKey ? t(field.unitKey) : ''
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="min-w-0 truncate text-left font-display text-[1.05rem] uppercase tracking-[0.08em] text-fg-secondary">
        {label}
        {unit && <span className="ml-1.5 text-fg-tertiary">{unit}</span>}
      </span>
      <div className="shrink-0">
        <NumberStepper
          value={value}
          onChange={onChange}
          label={`${label} ${unit}`.trim()}
          min={field.min}
          max={field.max}
          step={field.step}
          testid={field.key}
        />
      </div>
    </div>
  )
}

function TabataConfigScreen() {
  const navigate = useNavigate()
  const { t } = useLang()
  const [config, setConfig] = useState<TabataConfig>(() =>
    loadConfig({ id: 'custom', name: 'Custom', ...DEFAULT_CONFIG }),
  )
  const [userPresets, setUserPresets] = useState<TabataConfig[]>(() => loadPresets())
  const [history, setHistory] = useState<TabataConfig[]>(() => loadHistory())
  // The config currently being named-and-saved (inline editor), plus its draft name.
  const [naming, setNaming] = useState<TabataConfig | null>(null)
  const [draftName, setDraftName] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [hidden, setHidden] = useState<string[]>(() => loadHiddenPresets())

  // Saved presets first; then built-ins the user hasn't hidden.
  const presets = useMemo(
    () => [...userPresets, ...PRESETS.filter((p) => !hidden.includes(p.id))],
    [userPresets, hidden],
  )
  // Recent shows every config you've run, except ones you've explicitly saved
  // (those live in Presets, so they're not duplicated). Built-in presets do NOT
  // suppress Recent — running one still counts as recent.
  const recent = useMemo(
    () => history.filter((h) => !userPresets.some((p) => sameConfig(p, h))),
    [history, userPresets],
  )
  const total = useMemo(() => totalDurationSec(config), [config])
  // Whether the current config already exists as a preset (built-in or saved).
  const isSaved = useMemo(() => presets.some((p) => sameConfig(p, config)), [presets, config])

  const setField = (key: NumericKey, value: number) => {
    setConfig((prev) => ({ ...prev, [key]: value, id: 'custom', name: 'Custom' }))
  }

  const setRoundName = (index: number, value: string) => {
    setConfig((prev) => {
      const roundNames = [...(prev.roundNames ?? [])]
      roundNames[index] = value
      return { ...prev, roundNames }
    })
  }

  const apply = (preset: TabataConfig) => setConfig({ ...preset })

  const deletePreset = (id: string) => {
    if (id.startsWith('user-')) {
      const next = userPresets.filter((p) => p.id !== id)
      setUserPresets(next)
      savePresets(next)
    } else {
      // Built-in: hide it (so it can be brought back later if needed).
      const next = [...hidden, id]
      setHidden(next)
      saveHiddenPresets(next)
    }
  }

  const beginSave = (source: TabataConfig) => {
    setNaming(source)
    setDraftName(configLabel(source))
  }

  const confirmSave = () => {
    if (!naming) return
    const name = draftName.trim() || configLabel(naming)
    const nextPresets = [...userPresets, createUserPreset(naming, name)]
    setUserPresets(nextPresets)
    savePresets(nextPresets)
    // It now lives in Presets; the `recent` filter hides it from Recent.
    setNaming(null)
  }

  const start = () => {
    unlockAudio()
    const normalized = normalizeConfig(config)
    saveConfig(normalized)
    setHistory(pushHistory(normalized))
    navigate({ to: '/workout' })
  }

  return (
    <div className="screen gap-6 py-8">
      <TopLeft title={t('tabata')} />
      <TopRight />
      <Logo />
      <h1 className="sr-only">Tabata Timer</h1>

      <div className="flex w-[min(820px,94vw)] flex-col items-center gap-6">
        {recent.length > 0 && (
          <section className="flex w-full flex-col items-center gap-2">
            <h2 className="font-ui text-[0.65rem] uppercase tracking-[0.2em] text-fg-tertiary">
              {t('recent')}
            </h2>
            {/* extra top padding leaves room for the floating Save button */}
            <div className="flex flex-wrap justify-center gap-2 pt-3" aria-label={t('recent')}>
              {recent.map((item) => (
                <Chip
                  key={item.id}
                  label={item.name}
                  selected={sameConfig(config, item)}
                  onSelect={() => apply(item)}
                  corner={
                    <button
                      className="hover-reveal focus-ring absolute -top-3 right-0 z-10 flex h-[20px] items-center gap-1 rounded-full bg-accent px-2 text-[0.6rem] font-semibold uppercase leading-none tracking-wide text-white shadow-md ring-2 ring-surface"
                      onClick={() => beginSave(item)}
                      aria-label={`${t('save')} ${item.name}`}
                      title={t('savePreset')}
                    >
                      ★ {t('save')}
                    </button>
                  }
                />
              ))}
            </div>
          </section>
        )}

        {presets.length > 0 && (
          <section className="flex w-full flex-col items-center gap-2">
            <h2 className="font-ui text-[0.65rem] uppercase tracking-[0.2em] text-fg-tertiary">
              {t('presets')}
            </h2>
            <div className="flex flex-wrap justify-center gap-2" aria-label={t('presets')}>
              {presets.map((preset) => {
                const label =
                  'nameKey' in preset
                    ? `${t(preset.nameKey as Parameters<TFunction>[0])} ${configLabel(preset)}`
                    : preset.name
                return (
                  <Chip
                    key={preset.id}
                    label={label}
                    selected={sameConfig(config, preset)}
                    onSelect={() => apply(preset)}
                    corner={
                      <button
                        className="hover-reveal focus-ring absolute -right-[7px] -top-[7px] flex h-[18px] w-[18px] items-center justify-center rounded-full border border-border bg-surface text-xs leading-none text-fg-tertiary transition-colors hover:border-rest hover:text-rest"
                        onClick={() => deletePreset(preset.id)}
                        aria-label={`Delete ${label}`}
                        title="Delete"
                      >
                        ×
                      </button>
                    }
                  />
                )
              })}
            </div>
          </section>
        )}

        <div className="grid w-full grid-cols-1 gap-x-14 gap-y-3.5 sm:grid-cols-2">
          {FIELDS.map((field) => (
            <Field
              key={field.key}
              field={field}
              value={config[field.key]}
              onChange={(v) => setField(field.key, v)}
              t={t}
            />
          ))}
        </div>

        <div className="w-full">
          <button
            onClick={() => setShowAdvanced((v) => !v)}
            aria-expanded={showAdvanced}
            className="focus-ring mx-auto flex items-center gap-2 rounded-md px-3 py-1.5 font-ui text-[0.8rem] uppercase tracking-[0.12em] text-fg-tertiary transition-colors hover:text-fg"
          >
            {t('advanced')} <span className="text-[0.7rem]">{showAdvanced ? '▲' : '▼'}</span>
          </button>

          {showAdvanced && (
            <div className="mt-4 flex w-full flex-col gap-5">
              {/* Rest between sets (only affects workouts with more than one set). */}
              <Field
                field={SET_REST_FIELD}
                value={config.restBetweenSetsSec}
                onChange={(v) => setField('restBetweenSetsSec', v)}
                t={t}
              />

              {/* Per-round labels. */}
              <div>
                <p className="mb-2 font-ui text-[0.65rem] uppercase tracking-[0.2em] text-fg-tertiary">
                  {t('roundNames')}
                </p>
                <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
                  {Array.from({ length: config.rounds }).map((_, i) => (
                    <div className="flex items-center gap-2" key={i}>
                      <span className="w-6 shrink-0 text-right font-display text-sm text-fg-tertiary">
                        {i + 1}
                      </span>
                      <input
                        value={config.roundNames?.[i] ?? ''}
                        onChange={(e) => setRoundName(i, e.target.value)}
                        placeholder={`${t('round')} ${i + 1}`}
                        maxLength={40}
                        className="focus-ring w-full rounded border border-border bg-transparent px-2.5 py-1.5 font-ui text-sm text-fg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="m-0 flex items-center gap-2 font-ui text-[0.85rem] uppercase tracking-[0.18em] text-fg-tertiary">
          <span data-testid="total">
            {t('total')} {formatClock(total)}
          </span>
          {!isSaved && (
            <span className="inline-flex items-center gap-1 text-accent-strong">
              <span aria-hidden>•</span> {t('unsaved')}
            </span>
          )}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3.5">
          <button className="btn btn-solid min-w-[200px]" onClick={start}>
            {t('start')}
          </button>
          {!isSaved && (
            <button
              className="btn min-w-[150px] border-accent bg-accent text-[1.1rem] text-white hover:opacity-90"
              onClick={() => beginSave(config)}
            >
              ★ {t('save')}
            </button>
          )}
        </div>
      </div>

      <Modal open={!!naming} onClose={() => setNaming(null)} title={t('savePreset')}>
        <label className="flex flex-col gap-1">
          <span className="font-ui text-[0.65rem] uppercase tracking-[0.2em] text-fg-tertiary">
            {t('name')}
          </span>
          <input
            data-testid="preset-name"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') confirmSave()
            }}
            placeholder={t('name')}
            className="focus-ring w-full rounded border border-border bg-transparent px-3 py-2 font-ui text-sm text-fg"
          />
        </label>
        <div className="mt-4 flex justify-end gap-2">
          <button
            className="btn w-auto px-4 py-2 text-[0.9rem]"
            onClick={() => setNaming(null)}
          >
            {t('cancel')}
          </button>
          <button className="btn btn-solid w-auto px-4 py-2 text-[0.9rem]" onClick={confirmSave}>
            {t('save')}
          </button>
        </div>
      </Modal>
    </div>
  )
}
