// Tiny i18n: a module-level store (no provider needed) read via useSyncExternalStore.
// Language is auto-detected from the browser on first visit, overridable, and
// persisted. Strings compose with numbers in the components (no interpolation).
import { useCallback, useSyncExternalStore } from 'react'

export type Lang = 'uk' | 'en' | 'es' | 'fr' | 'de' | 'pt' | 'ru'

export const LANGS: { code: Lang; label: string }[] = [
  { code: 'uk', label: 'Українська' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'pt', label: 'Português' },
  { code: 'ru', label: 'Русский' },
]

type Dict = Record<string, string>

const en = {
  tabata: 'Tabata',
  clock: 'Clock',
  timer: 'Timer',
  start: 'Start',
  pause: 'Pause',
  resume: 'Resume',
  skip: 'Skip',
  restart: 'Restart',
  again: 'Again',
  edit: 'Edit',
  save: 'Save',
  cancel: 'Cancel',
  back: 'Back',
  recent: 'Recent',
  presets: 'Presets',
  name: 'Name',
  total: 'Total',
  for: 'For',
  work: 'Work',
  rest: 'Rest',
  sets: 'Sets',
  setRest: 'Set Rest',
  prepare: 'Prepare',
  cooldown: 'Cooldown',
  rounds: 'Rounds',
  roundsLower: 'rounds',
  seconds: 'Seconds',
  min: 'Min',
  sec: 'Sec',
  getReady: 'Get Ready',
  done: 'Done',
  round: 'Round',
  set: 'Set',
  next: 'Next',
  roundNames: 'Round labels',
  savePreset: 'Save preset',
  settings: 'Settings',
  theme: 'Theme',
  mode: 'Mode',
  accent: 'Accent',
  font: 'Font',
  language: 'Language',
  auto: 'Auto',
  light: 'Light',
  dark: 'Dark',
  custom: 'Custom',
  support: 'Support',
  reportProblem: 'Report a problem',
  fullscreen: 'Fullscreen',
  mute: 'Mute',
  unmute: 'Unmute',
  sound: 'Sound',
  sBeeps: 'Beeps',
  sSoft: 'Soft',
  sMarimba: 'Marimba',
  sOff: 'Off',
  // Built-in preset name prefixes.
  pClassic: 'Classic',
  pGym: 'Gym',
  pSweat: 'Sweat',
  pDouble: 'Double Tabata',
}

type Keys = keyof typeof en

const es: Record<Keys, string> = {
  tabata: 'Tabata', clock: 'Reloj', timer: 'Temporizador', start: 'Empezar', pause: 'Pausar',
  resume: 'Reanudar', skip: 'Saltar', restart: 'Reiniciar', again: 'Otra vez', edit: 'Editar',
  save: 'Guardar', cancel: 'Cancelar', back: 'Atrás', recent: 'Recientes', presets: 'Predefinidos',
  name: 'Nombre', total: 'Total', for: 'Por', work: 'Trabajo', rest: 'Descanso', sets: 'Series',
  setRest: 'Descanso serie', prepare: 'Preparar', cooldown: 'Enfriamiento', rounds: 'Rondas',
  roundsLower: 'rondas', seconds: 'Segundos', min: 'Min', sec: 'Seg', getReady: 'Prepárate',
  done: 'Listo', round: 'Ronda', set: 'Serie', next: 'Siguiente', roundNames: 'Etiquetas de rondas',
  savePreset: 'Guardar predefinido', settings: 'Ajustes',
  theme: 'Tema', mode: 'Modo', accent: 'Color', font: 'Fuente', language: 'Idioma', auto: 'Auto',
  light: 'Claro', dark: 'Oscuro', custom: 'Personalizado', support: 'Soporte',
  reportProblem: 'Reportar un problema', fullscreen: 'Pantalla completa', mute: 'Silenciar',
  unmute: 'Activar sonido', sound: 'Sonido', sBeeps: 'Pitidos', sSoft: 'Suave', sMarimba: 'Marimba',
  sOff: 'Apagado', pClassic: 'Clásico', pGym: 'Gimnasio', pSweat: 'Sudor', pDouble: 'Doble Tabata',
}

const fr: Record<Keys, string> = {
  tabata: 'Tabata', clock: 'Horloge', timer: 'Minuteur', start: 'Démarrer', pause: 'Pause',
  resume: 'Reprendre', skip: 'Passer', restart: 'Recommencer', again: 'Encore', edit: 'Modifier',
  save: 'Enregistrer', cancel: 'Annuler', back: 'Retour', recent: 'Récents', presets: 'Préréglages',
  name: 'Nom', total: 'Total', for: 'Pour', work: 'Effort', rest: 'Repos', sets: 'Séries',
  setRest: 'Repos série', prepare: 'Préparation', cooldown: 'Récupération', rounds: 'Rounds',
  roundsLower: 'rounds', seconds: 'Secondes', min: 'Min', sec: 'Sec', getReady: 'Prêt',
  done: 'Terminé', round: 'Round', set: 'Série', next: 'Suivant', roundNames: 'Libellés des rounds',
  savePreset: 'Enregistrer le préréglage', settings: 'Réglages',
  theme: 'Thème', mode: 'Mode', accent: 'Couleur', font: 'Police', language: 'Langue', auto: 'Auto',
  light: 'Clair', dark: 'Sombre', custom: 'Personnalisé', support: 'Support',
  reportProblem: 'Signaler un problème', fullscreen: 'Plein écran', mute: 'Couper le son',
  unmute: 'Activer le son', sound: 'Son', sBeeps: 'Bips', sSoft: 'Doux', sMarimba: 'Marimba',
  sOff: 'Aucun', pClassic: 'Classique', pGym: 'Salle', pSweat: 'Sueur', pDouble: 'Double Tabata',
}

const de: Record<Keys, string> = {
  tabata: 'Tabata', clock: 'Uhr', timer: 'Timer', start: 'Start', pause: 'Pause',
  resume: 'Weiter', skip: 'Überspringen', restart: 'Neustart', again: 'Nochmal', edit: 'Bearbeiten',
  save: 'Speichern', cancel: 'Abbrechen', back: 'Zurück', recent: 'Zuletzt', presets: 'Vorlagen',
  name: 'Name', total: 'Gesamt', for: 'Für', work: 'Arbeit', rest: 'Pause', sets: 'Sätze',
  setRest: 'Satzpause', prepare: 'Vorbereiten', cooldown: 'Abkühlung', rounds: 'Runden',
  roundsLower: 'Runden', seconds: 'Sekunden', min: 'Min', sec: 'Sek', getReady: 'Bereit',
  done: 'Fertig', round: 'Runde', set: 'Satz', next: 'Nächste', roundNames: 'Runden-Labels',
  savePreset: 'Vorlage speichern', settings: 'Einstellungen',
  theme: 'Thema', mode: 'Modus', accent: 'Farbe', font: 'Schrift', language: 'Sprache', auto: 'Auto',
  light: 'Hell', dark: 'Dunkel', custom: 'Eigene', support: 'Support',
  reportProblem: 'Problem melden', fullscreen: 'Vollbild', mute: 'Stumm',
  unmute: 'Ton an', sound: 'Ton', sBeeps: 'Piepen', sSoft: 'Sanft', sMarimba: 'Marimba',
  sOff: 'Aus', pClassic: 'Klassisch', pGym: 'Studio', pSweat: 'Schweiß', pDouble: 'Doppel-Tabata',
}

const pt: Record<Keys, string> = {
  tabata: 'Tabata', clock: 'Relógio', timer: 'Timer', start: 'Começar', pause: 'Pausar',
  resume: 'Continuar', skip: 'Pular', restart: 'Reiniciar', again: 'De novo', edit: 'Editar',
  save: 'Salvar', cancel: 'Cancelar', back: 'Voltar', recent: 'Recentes', presets: 'Predefinições',
  name: 'Nome', total: 'Total', for: 'Por', work: 'Trabalho', rest: 'Descanso', sets: 'Séries',
  setRest: 'Descanso série', prepare: 'Preparar', cooldown: 'Desaquecimento', rounds: 'Rounds',
  roundsLower: 'rounds', seconds: 'Segundos', min: 'Min', sec: 'Seg', getReady: 'Prepare-se',
  done: 'Concluído', round: 'Round', set: 'Série', next: 'Próximo', roundNames: 'Rótulos dos rounds',
  savePreset: 'Salvar predefinição', settings: 'Configurações',
  theme: 'Tema', mode: 'Modo', accent: 'Cor', font: 'Fonte', language: 'Idioma', auto: 'Auto',
  light: 'Claro', dark: 'Escuro', custom: 'Personalizado', support: 'Suporte',
  reportProblem: 'Relatar um problema', fullscreen: 'Tela cheia', mute: 'Mudo',
  unmute: 'Ativar som', sound: 'Som', sBeeps: 'Bips', sSoft: 'Suave', sMarimba: 'Marimba',
  sOff: 'Desligado', pClassic: 'Clássico', pGym: 'Academia', pSweat: 'Suor', pDouble: 'Tabata Duplo',
}

const uk: Record<Keys, string> = {
  tabata: 'Табата', clock: 'Годинник', timer: 'Таймер', start: 'Старт', pause: 'Пауза',
  resume: 'Далі', skip: 'Пропустити', restart: 'Спочатку', again: 'Ще раз', edit: 'Змінити',
  save: 'Зберегти', cancel: 'Скасувати', back: 'Назад', recent: 'Нещодавні', presets: 'Шаблони',
  name: 'Назва', total: 'Усього', for: 'На', work: 'Робота', rest: 'Відпочинок', sets: 'Сети',
  setRest: 'Пауза між сетами', prepare: 'Підготовка', cooldown: 'Заминка', rounds: 'Раунди',
  roundsLower: 'раундів', seconds: 'Секунди', min: 'Хв', sec: 'Сек', getReady: 'Приготуйся',
  done: 'Готово', round: 'Раунд', set: 'Сет', next: 'Далі', roundNames: 'Підписи раундів',
  savePreset: 'Зберегти шаблон', settings: 'Налаштування',
  theme: 'Тема', mode: 'Режим', accent: 'Колір', font: 'Шрифт', language: 'Мова', auto: 'Авто',
  light: 'Світла', dark: 'Темна', custom: 'Свій', support: 'Підтримка',
  reportProblem: 'Повідомити про проблему', fullscreen: 'На весь екран', mute: 'Без звуку',
  unmute: 'Увімкнути звук', sound: 'Звук', sBeeps: 'Сигнали', sSoft: 'М’який', sMarimba: 'Марімба',
  sOff: 'Вимк', pClassic: 'Класика', pGym: 'Зал', pSweat: 'Піт', pDouble: 'Подвійна Табата',
}

const ru: Record<Keys, string> = {
  tabata: 'Табата', clock: 'Часы', timer: 'Таймер', start: 'Старт', pause: 'Пауза',
  resume: 'Продолжить', skip: 'Пропустить', restart: 'Заново', again: 'Ещё раз', edit: 'Изменить',
  save: 'Сохранить', cancel: 'Отмена', back: 'Назад', recent: 'Недавние', presets: 'Шаблоны',
  name: 'Название', total: 'Всего', for: 'На', work: 'Работа', rest: 'Отдых', sets: 'Сеты',
  setRest: 'Отдых между сетами', prepare: 'Подготовка', cooldown: 'Заминка', rounds: 'Раунды',
  roundsLower: 'раундов', seconds: 'Секунды', min: 'Мин', sec: 'Сек', getReady: 'Приготовься',
  done: 'Готово', round: 'Раунд', set: 'Сет', next: 'Далее', roundNames: 'Подписи раундов',
  savePreset: 'Сохранить шаблон', settings: 'Настройки',
  theme: 'Тема', mode: 'Режим', accent: 'Цвет', font: 'Шрифт', language: 'Язык', auto: 'Авто',
  light: 'Светлая', dark: 'Тёмная', custom: 'Свой', support: 'Поддержка',
  reportProblem: 'Сообщить о проблеме', fullscreen: 'Полный экран', mute: 'Без звука',
  unmute: 'Включить звук', sound: 'Звук', sBeeps: 'Сигналы', sSoft: 'Мягкий', sMarimba: 'Маримба',
  sOff: 'Выкл', pClassic: 'Классика', pGym: 'Зал', pSweat: 'Пот', pDouble: 'Двойная Табата',
}

const DICTS: Record<Lang, Dict> = { uk, en, es, fr, de, pt, ru }

const STORAGE_KEY = 'lang'

function detect(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null
    if (saved && DICTS[saved]) return saved
  } catch {
    /* ignore */
  }
  const nav = typeof navigator !== 'undefined' ? navigator.language.slice(0, 2) : 'en'
  return (DICTS as Record<string, Dict>)[nav] ? (nav as Lang) : 'en'
}

let current: Lang = detect()
const listeners = new Set<() => void>()

export const getLang = (): Lang => current

export function setLang(lang: Lang): void {
  current = lang
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    /* ignore */
  }
  if (typeof document !== 'undefined') document.documentElement.lang = lang
  listeners.forEach((fn) => fn())
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export type TFunction = (key: Keys) => string

export function useLang() {
  const lang = useSyncExternalStore(subscribe, getLang, getLang)
  const t = useCallback<TFunction>((key) => DICTS[lang][key] ?? en[key] ?? key, [lang])
  return { lang, setLang, t }
}
