// Tiny i18n: a module-level store (no provider needed) read via useSyncExternalStore.
// Language is auto-detected from the browser on first visit, overridable, and
// persisted. Strings compose with numbers in the components (no interpolation).
import { useCallback, useSyncExternalStore } from 'react'

export type Lang =
  | 'en' | 'zh' | 'es' | 'hi' | 'ar' | 'pt' | 'fr' | 'de' | 'ja' | 'ko'
  | 'it' | 'tr' | 'id' | 'vi' | 'pl' | 'nl' | 'th' | 'sv' | 'uk' | 'ru'

// English & the rest first; Ukrainian and Russian last (per preference).
export const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
  { code: 'es', label: 'Español' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ar', label: 'العربية' },
  { code: 'pt', label: 'Português' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'it', label: 'Italiano' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'pl', label: 'Polski' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'th', label: 'ไทย' },
  { code: 'sv', label: 'Svenska' },
  { code: 'uk', label: 'Українська' },
  { code: 'ru', label: 'Русский' },
]

// Right-to-left languages.
const RTL = new Set<Lang>(['ar'])
export const isRTL = (lang: Lang): boolean => RTL.has(lang)

type Dict = Record<string, string>

const en = {
  tabata: 'Tabata', clock: 'Clock', timer: 'Timer', start: 'Start', pause: 'Pause',
  resume: 'Resume', skip: 'Skip', restart: 'Restart', again: 'Again', edit: 'Edit',
  save: 'Save', delete: 'Delete', cancel: 'Cancel', back: 'Back', recent: 'Recent',
  presets: 'Presets', name: 'Name', total: 'Total', for: 'For', work: 'Work',
  rest: 'Rest', sets: 'Sets', setRest: 'Rest between sets', prepare: 'Prepare',
  cooldown: 'Cooldown', rounds: 'Rounds', roundsLower: 'rounds', seconds: 'Seconds',
  min: 'Min', sec: 'Sec', getReady: 'Get Ready', done: 'Done', round: 'Round',
  set: 'Set', next: 'Next', roundNames: 'Round labels', advanced: 'Advanced',
  unsaved: 'Unsaved', savePreset: 'Save preset', settings: 'Settings', theme: 'Theme',
  mode: 'Mode', accent: 'Accent', font: 'Font', language: 'Language', auto: 'Auto',
  light: 'Light', dark: 'Dark', custom: 'Custom', support: 'Support',
  reportProblem: 'Report a problem', fullscreen: 'Fullscreen', mute: 'Mute',
  unmute: 'Unmute', sound: 'Sound', sBeeps: 'Beeps', sSoft: 'Soft', sMarimba: 'Marimba',
  sOff: 'Off', pClassic: 'Classic', pGym: 'Gym', pSweat: 'Sweat', pDouble: 'Double Tabata',
}

type Keys = keyof typeof en

const es: Record<Keys, string> = {
  tabata: 'Tabata', clock: 'Reloj', timer: 'Temporizador', start: 'Empezar', pause: 'Pausar',
  resume: 'Reanudar', skip: 'Saltar', restart: 'Reiniciar', again: 'Otra vez', edit: 'Editar',
  save: 'Guardar', delete: 'Eliminar', cancel: 'Cancelar', back: 'Atrás', recent: 'Recientes',
  presets: 'Predefinidos', name: 'Nombre', total: 'Total', for: 'Por', work: 'Trabajo',
  rest: 'Descanso', sets: 'Series', setRest: 'Descanso entre series', prepare: 'Preparar',
  cooldown: 'Enfriamiento', rounds: 'Rondas', roundsLower: 'rondas', seconds: 'Segundos',
  min: 'Min', sec: 'Seg', getReady: 'Prepárate', done: 'Listo', round: 'Ronda', set: 'Serie',
  next: 'Siguiente', roundNames: 'Etiquetas de rondas', advanced: 'Avanzado', unsaved: 'Sin guardar',
  savePreset: 'Guardar predefinido', settings: 'Ajustes', theme: 'Tema', mode: 'Modo',
  accent: 'Color', font: 'Fuente', language: 'Idioma', auto: 'Auto', light: 'Claro', dark: 'Oscuro',
  custom: 'Personalizado', support: 'Soporte', reportProblem: 'Reportar un problema',
  fullscreen: 'Pantalla completa', mute: 'Silenciar', unmute: 'Activar sonido', sound: 'Sonido',
  sBeeps: 'Pitidos', sSoft: 'Suave', sMarimba: 'Marimba', sOff: 'Apagado', pClassic: 'Clásico',
  pGym: 'Gimnasio', pSweat: 'Sudor', pDouble: 'Doble Tabata',
}

const fr: Record<Keys, string> = {
  tabata: 'Tabata', clock: 'Horloge', timer: 'Minuteur', start: 'Démarrer', pause: 'Pause',
  resume: 'Reprendre', skip: 'Passer', restart: 'Recommencer', again: 'Encore', edit: 'Modifier',
  save: 'Enregistrer', delete: 'Supprimer', cancel: 'Annuler', back: 'Retour', recent: 'Récents',
  presets: 'Préréglages', name: 'Nom', total: 'Total', for: 'Pour', work: 'Effort', rest: 'Repos',
  sets: 'Séries', setRest: 'Repos entre séries', prepare: 'Préparation', cooldown: 'Récupération',
  rounds: 'Rounds', roundsLower: 'rounds', seconds: 'Secondes', min: 'Min', sec: 'Sec',
  getReady: 'Prêt', done: 'Terminé', round: 'Round', set: 'Série', next: 'Suivant',
  roundNames: 'Libellés des rounds', advanced: 'Avancé', unsaved: 'Non enregistré',
  savePreset: 'Enregistrer le préréglage', settings: 'Réglages', theme: 'Thème', mode: 'Mode',
  accent: 'Couleur', font: 'Police', language: 'Langue', auto: 'Auto', light: 'Clair', dark: 'Sombre',
  custom: 'Personnalisé', support: 'Support', reportProblem: 'Signaler un problème',
  fullscreen: 'Plein écran', mute: 'Couper le son', unmute: 'Activer le son', sound: 'Son',
  sBeeps: 'Bips', sSoft: 'Doux', sMarimba: 'Marimba', sOff: 'Aucun', pClassic: 'Classique',
  pGym: 'Salle', pSweat: 'Sueur', pDouble: 'Double Tabata',
}

const de: Record<Keys, string> = {
  tabata: 'Tabata', clock: 'Uhr', timer: 'Timer', start: 'Start', pause: 'Pause', resume: 'Weiter',
  skip: 'Überspringen', restart: 'Neustart', again: 'Nochmal', edit: 'Bearbeiten', save: 'Speichern',
  delete: 'Löschen', cancel: 'Abbrechen', back: 'Zurück', recent: 'Zuletzt', presets: 'Vorlagen',
  name: 'Name', total: 'Gesamt', for: 'Für', work: 'Arbeit', rest: 'Pause', sets: 'Sätze',
  setRest: 'Pause zwischen Sätzen', prepare: 'Vorbereiten', cooldown: 'Abkühlung', rounds: 'Runden',
  roundsLower: 'Runden', seconds: 'Sekunden', min: 'Min', sec: 'Sek', getReady: 'Bereit',
  done: 'Fertig', round: 'Runde', set: 'Satz', next: 'Nächste', roundNames: 'Runden-Labels',
  advanced: 'Erweitert', unsaved: 'Nicht gespeichert', savePreset: 'Vorlage speichern',
  settings: 'Einstellungen', theme: 'Thema', mode: 'Modus', accent: 'Farbe', font: 'Schrift',
  language: 'Sprache', auto: 'Auto', light: 'Hell', dark: 'Dunkel', custom: 'Eigene', support: 'Support',
  reportProblem: 'Problem melden', fullscreen: 'Vollbild', mute: 'Stumm', unmute: 'Ton an',
  sound: 'Ton', sBeeps: 'Piepen', sSoft: 'Sanft', sMarimba: 'Marimba', sOff: 'Aus', pClassic: 'Klassisch',
  pGym: 'Studio', pSweat: 'Schweiß', pDouble: 'Doppel-Tabata',
}

const pt: Record<Keys, string> = {
  tabata: 'Tabata', clock: 'Relógio', timer: 'Timer', start: 'Começar', pause: 'Pausar',
  resume: 'Continuar', skip: 'Pular', restart: 'Reiniciar', again: 'De novo', edit: 'Editar',
  save: 'Salvar', delete: 'Excluir', cancel: 'Cancelar', back: 'Voltar', recent: 'Recentes',
  presets: 'Predefinições', name: 'Nome', total: 'Total', for: 'Por', work: 'Trabalho',
  rest: 'Descanso', sets: 'Séries', setRest: 'Descanso entre séries', prepare: 'Preparar',
  cooldown: 'Desaquecimento', rounds: 'Rounds', roundsLower: 'rounds', seconds: 'Segundos',
  min: 'Min', sec: 'Seg', getReady: 'Prepare-se', done: 'Concluído', round: 'Round', set: 'Série',
  next: 'Próximo', roundNames: 'Rótulos dos rounds', advanced: 'Avançado', unsaved: 'Não salvo',
  savePreset: 'Salvar predefinição', settings: 'Configurações', theme: 'Tema', mode: 'Modo',
  accent: 'Cor', font: 'Fonte', language: 'Idioma', auto: 'Auto', light: 'Claro', dark: 'Escuro',
  custom: 'Personalizado', support: 'Suporte', reportProblem: 'Relatar um problema',
  fullscreen: 'Tela cheia', mute: 'Mudo', unmute: 'Ativar som', sound: 'Som', sBeeps: 'Bips',
  sSoft: 'Suave', sMarimba: 'Marimba', sOff: 'Desligado', pClassic: 'Clássico', pGym: 'Academia',
  pSweat: 'Suor', pDouble: 'Tabata Duplo',
}

const zh: Record<Keys, string> = {
  tabata: 'Tabata', clock: '时钟', timer: '计时器', start: '开始', pause: '暂停', resume: '继续',
  skip: '跳过', restart: '重新开始', again: '再来一次', edit: '编辑', save: '保存', delete: '删除',
  cancel: '取消', back: '返回', recent: '最近', presets: '预设', name: '名称', total: '总计',
  for: '共', work: '运动', rest: '休息', sets: '组数', setRest: '组间休息', prepare: '准备',
  cooldown: '放松', rounds: '回合', roundsLower: '回合', seconds: '秒', min: '分', sec: '秒',
  getReady: '准备', done: '完成', round: '回合', set: '组', next: '下一个', roundNames: '回合名称',
  advanced: '高级', unsaved: '未保存', savePreset: '保存预设', settings: '设置', theme: '主题',
  mode: '模式', accent: '强调色', font: '字体', language: '语言', auto: '自动', light: '浅色',
  dark: '深色', custom: '自定义', support: '支持', reportProblem: '报告问题', fullscreen: '全屏',
  mute: '静音', unmute: '取消静音', sound: '声音', sBeeps: '哔哔声', sSoft: '柔和', sMarimba: '马林巴',
  sOff: '关闭', pClassic: '经典', pGym: '健身房', pSweat: '挥汗', pDouble: '双重 Tabata',
}

const hi: Record<Keys, string> = {
  tabata: 'Tabata', clock: 'घड़ी', timer: 'टाइमर', start: 'शुरू', pause: 'रोकें', resume: 'जारी रखें',
  skip: 'छोड़ें', restart: 'फिर से शुरू', again: 'दोबारा', edit: 'संपादित करें', save: 'सहेजें',
  delete: 'हटाएं', cancel: 'रद्द करें', back: 'वापस', recent: 'हाल का', presets: 'प्रीसेट',
  name: 'नाम', total: 'कुल', for: 'के लिए', work: 'काम', rest: 'आराम', sets: 'सेट',
  setRest: 'सेट के बीच आराम', prepare: 'तैयारी', cooldown: 'कूलडाउन', rounds: 'राउंड',
  roundsLower: 'राउंड', seconds: 'सेकंड', min: 'मिनट', sec: 'सेकंड', getReady: 'तैयार हो जाएं',
  done: 'पूर्ण', round: 'राउंड', set: 'सेट', next: 'अगला', roundNames: 'राउंड नाम', advanced: 'उन्नत',
  unsaved: 'असहेजा', savePreset: 'प्रीसेट सहेजें', settings: 'सेटिंग्स', theme: 'थीम', mode: 'मोड',
  accent: 'रंग', font: 'फ़ॉन्ट', language: 'भाषा', auto: 'स्वतः', light: 'हल्का', dark: 'गहरा',
  custom: 'कस्टम', support: 'सहायता', reportProblem: 'समस्या बताएं', fullscreen: 'पूर्ण स्क्रीन',
  mute: 'म्यूट', unmute: 'अनम्यूट', sound: 'ध्वनि', sBeeps: 'बीप', sSoft: 'मृदु', sMarimba: 'मारिम्बा',
  sOff: 'बंद', pClassic: 'क्लासिक', pGym: 'जिम', pSweat: 'पसीना', pDouble: 'डबल Tabata',
}

const ar: Record<Keys, string> = {
  tabata: 'Tabata', clock: 'الساعة', timer: 'مؤقت', start: 'ابدأ', pause: 'إيقاف مؤقت',
  resume: 'استئناف', skip: 'تخطّي', restart: 'إعادة', again: 'مرة أخرى', edit: 'تعديل', save: 'حفظ',
  delete: 'حذف', cancel: 'إلغاء', back: 'رجوع', recent: 'الأخيرة', presets: 'الإعدادات المسبقة',
  name: 'الاسم', total: 'الإجمالي', for: 'لـ', work: 'عمل', rest: 'راحة', sets: 'مجموعات',
  setRest: 'راحة بين المجموعات', prepare: 'استعداد', cooldown: 'تهدئة', rounds: 'جولات',
  roundsLower: 'جولات', seconds: 'ثوانٍ', min: 'دقيقة', sec: 'ثانية', getReady: 'استعد', done: 'تم',
  round: 'جولة', set: 'مجموعة', next: 'التالي', roundNames: 'أسماء الجولات', advanced: 'متقدم',
  unsaved: 'غير محفوظ', savePreset: 'حفظ الإعداد', settings: 'الإعدادات', theme: 'السمة',
  mode: 'الوضع', accent: 'اللون', font: 'الخط', language: 'اللغة', auto: 'تلقائي', light: 'فاتح',
  dark: 'داكن', custom: 'مخصص', support: 'الدعم', reportProblem: 'الإبلاغ عن مشكلة',
  fullscreen: 'ملء الشاشة', mute: 'كتم', unmute: 'تشغيل الصوت', sound: 'الصوت', sBeeps: 'صفير',
  sSoft: 'ناعم', sMarimba: 'ماريمبا', sOff: 'إيقاف', pClassic: 'كلاسيكي', pGym: 'صالة',
  pSweat: 'عرق', pDouble: 'تاباتا مزدوج',
}

const ja: Record<Keys, string> = {
  tabata: 'Tabata', clock: '時計', timer: 'タイマー', start: '開始', pause: '一時停止', resume: '再開',
  skip: 'スキップ', restart: 'リスタート', again: 'もう一度', edit: '編集', save: '保存', delete: '削除',
  cancel: 'キャンセル', back: '戻る', recent: '最近', presets: 'プリセット', name: '名前', total: '合計',
  for: '回数', work: '運動', rest: '休憩', sets: 'セット', setRest: 'セット間休憩', prepare: '準備',
  cooldown: 'クールダウン', rounds: 'ラウンド', roundsLower: 'ラウンド', seconds: '秒', min: '分', sec: '秒',
  getReady: '準備', done: '完了', round: 'ラウンド', set: 'セット', next: '次', roundNames: 'ラウンド名',
  advanced: '詳細', unsaved: '未保存', savePreset: 'プリセットを保存', settings: '設定', theme: 'テーマ',
  mode: 'モード', accent: 'アクセント', font: 'フォント', language: '言語', auto: '自動', light: 'ライト',
  dark: 'ダーク', custom: 'カスタム', support: 'サポート', reportProblem: '問題を報告', fullscreen: '全画面',
  mute: 'ミュート', unmute: 'ミュート解除', sound: 'サウンド', sBeeps: 'ビープ', sSoft: 'ソフト',
  sMarimba: 'マリンバ', sOff: 'オフ', pClassic: 'クラシック', pGym: 'ジム', pSweat: 'スウェット',
  pDouble: 'ダブル Tabata',
}

const ko: Record<Keys, string> = {
  tabata: 'Tabata', clock: '시계', timer: '타이머', start: '시작', pause: '일시정지', resume: '계속',
  skip: '건너뛰기', restart: '다시 시작', again: '다시', edit: '편집', save: '저장', delete: '삭제',
  cancel: '취소', back: '뒤로', recent: '최근', presets: '프리셋', name: '이름', total: '총',
  for: '횟수', work: '운동', rest: '휴식', sets: '세트', setRest: '세트 간 휴식', prepare: '준비',
  cooldown: '쿨다운', rounds: '라운드', roundsLower: '라운드', seconds: '초', min: '분', sec: '초',
  getReady: '준비', done: '완료', round: '라운드', set: '세트', next: '다음', roundNames: '라운드 이름',
  advanced: '고급', unsaved: '저장 안 됨', savePreset: '프리셋 저장', settings: '설정', theme: '테마',
  mode: '모드', accent: '강조색', font: '글꼴', language: '언어', auto: '자동', light: '라이트',
  dark: '다크', custom: '사용자 지정', support: '지원', reportProblem: '문제 신고', fullscreen: '전체 화면',
  mute: '음소거', unmute: '음소거 해제', sound: '소리', sBeeps: '비프', sSoft: '부드럽게', sMarimba: '마림바',
  sOff: '끄기', pClassic: '클래식', pGym: '체육관', pSweat: '땀', pDouble: '더블 Tabata',
}

const it: Record<Keys, string> = {
  tabata: 'Tabata', clock: 'Orologio', timer: 'Timer', start: 'Avvia', pause: 'Pausa', resume: 'Riprendi',
  skip: 'Salta', restart: 'Ricomincia', again: 'Ancora', edit: 'Modifica', save: 'Salva', delete: 'Elimina',
  cancel: 'Annulla', back: 'Indietro', recent: 'Recenti', presets: 'Preimpostazioni', name: 'Nome',
  total: 'Totale', for: 'Per', work: 'Lavoro', rest: 'Riposo', sets: 'Set', setRest: 'Riposo tra i set',
  prepare: 'Preparazione', cooldown: 'Defaticamento', rounds: 'Round', roundsLower: 'round',
  seconds: 'Secondi', min: 'Min', sec: 'Sec', getReady: 'Preparati', done: 'Fatto', round: 'Round',
  set: 'Set', next: 'Successivo', roundNames: 'Nomi dei round', advanced: 'Avanzate', unsaved: 'Non salvato',
  savePreset: 'Salva preimpostazione', settings: 'Impostazioni', theme: 'Tema', mode: 'Modalità',
  accent: 'Colore', font: 'Carattere', language: 'Lingua', auto: 'Auto', light: 'Chiaro', dark: 'Scuro',
  custom: 'Personalizzato', support: 'Supporto', reportProblem: 'Segnala un problema',
  fullscreen: 'Schermo intero', mute: 'Muto', unmute: 'Riattiva audio', sound: 'Suono', sBeeps: 'Bip',
  sSoft: 'Morbido', sMarimba: 'Marimba', sOff: 'Off', pClassic: 'Classico', pGym: 'Palestra',
  pSweat: 'Sudore', pDouble: 'Doppio Tabata',
}

const tr: Record<Keys, string> = {
  tabata: 'Tabata', clock: 'Saat', timer: 'Zamanlayıcı', start: 'Başlat', pause: 'Duraklat',
  resume: 'Devam', skip: 'Atla', restart: 'Yeniden başlat', again: 'Tekrar', edit: 'Düzenle',
  save: 'Kaydet', delete: 'Sil', cancel: 'İptal', back: 'Geri', recent: 'Son kullanılan',
  presets: 'Hazır ayarlar', name: 'Ad', total: 'Toplam', for: 'Tur', work: 'Çalışma', rest: 'Dinlenme',
  sets: 'Setler', setRest: 'Setler arası dinlenme', prepare: 'Hazırlık', cooldown: 'Soğuma',
  rounds: 'Tur', roundsLower: 'tur', seconds: 'Saniye', min: 'Dk', sec: 'Sn', getReady: 'Hazır ol',
  done: 'Bitti', round: 'Tur', set: 'Set', next: 'Sonraki', roundNames: 'Tur adları', advanced: 'Gelişmiş',
  unsaved: 'Kaydedilmedi', savePreset: 'Hazır ayarı kaydet', settings: 'Ayarlar', theme: 'Tema',
  mode: 'Mod', accent: 'Renk', font: 'Yazı tipi', language: 'Dil', auto: 'Oto', light: 'Açık',
  dark: 'Koyu', custom: 'Özel', support: 'Destek', reportProblem: 'Sorun bildir', fullscreen: 'Tam ekran',
  mute: 'Sessiz', unmute: 'Sesi aç', sound: 'Ses', sBeeps: 'Bip', sSoft: 'Yumuşak', sMarimba: 'Marimba',
  sOff: 'Kapalı', pClassic: 'Klasik', pGym: 'Spor salonu', pSweat: 'Ter', pDouble: 'Çift Tabata',
}

const id: Record<Keys, string> = {
  tabata: 'Tabata', clock: 'Jam', timer: 'Pengatur waktu', start: 'Mulai', pause: 'Jeda', resume: 'Lanjut',
  skip: 'Lewati', restart: 'Mulai ulang', again: 'Lagi', edit: 'Edit', save: 'Simpan', delete: 'Hapus',
  cancel: 'Batal', back: 'Kembali', recent: 'Terbaru', presets: 'Preset', name: 'Nama', total: 'Total',
  for: 'Untuk', work: 'Kerja', rest: 'Istirahat', sets: 'Set', setRest: 'Istirahat antar set',
  prepare: 'Persiapan', cooldown: 'Pendinginan', rounds: 'Ronde', roundsLower: 'ronde', seconds: 'Detik',
  min: 'Mnt', sec: 'Dtk', getReady: 'Bersiap', done: 'Selesai', round: 'Ronde', set: 'Set',
  next: 'Berikutnya', roundNames: 'Nama ronde', advanced: 'Lanjutan', unsaved: 'Belum disimpan',
  savePreset: 'Simpan preset', settings: 'Pengaturan', theme: 'Tema', mode: 'Mode', accent: 'Warna',
  font: 'Font', language: 'Bahasa', auto: 'Otomatis', light: 'Terang', dark: 'Gelap', custom: 'Kustom',
  support: 'Dukungan', reportProblem: 'Laporkan masalah', fullscreen: 'Layar penuh', mute: 'Bisukan',
  unmute: 'Suarakan', sound: 'Suara', sBeeps: 'Bip', sSoft: 'Lembut', sMarimba: 'Marimba', sOff: 'Mati',
  pClassic: 'Klasik', pGym: 'Gym', pSweat: 'Keringat', pDouble: 'Tabata Ganda',
}

const vi: Record<Keys, string> = {
  tabata: 'Tabata', clock: 'Đồng hồ', timer: 'Hẹn giờ', start: 'Bắt đầu', pause: 'Tạm dừng',
  resume: 'Tiếp tục', skip: 'Bỏ qua', restart: 'Khởi động lại', again: 'Lại', edit: 'Sửa', save: 'Lưu',
  delete: 'Xóa', cancel: 'Hủy', back: 'Quay lại', recent: 'Gần đây', presets: 'Cài đặt sẵn', name: 'Tên',
  total: 'Tổng', for: 'Cho', work: 'Tập', rest: 'Nghỉ', sets: 'Hiệp', setRest: 'Nghỉ giữa hiệp',
  prepare: 'Chuẩn bị', cooldown: 'Thả lỏng', rounds: 'Vòng', roundsLower: 'vòng', seconds: 'Giây',
  min: 'Phút', sec: 'Giây', getReady: 'Sẵn sàng', done: 'Xong', round: 'Vòng', set: 'Hiệp', next: 'Tiếp',
  roundNames: 'Tên vòng', advanced: 'Nâng cao', unsaved: 'Chưa lưu', savePreset: 'Lưu cài đặt',
  settings: 'Cài đặt', theme: 'Giao diện', mode: 'Chế độ', accent: 'Màu', font: 'Phông chữ',
  language: 'Ngôn ngữ', auto: 'Tự động', light: 'Sáng', dark: 'Tối', custom: 'Tùy chỉnh', support: 'Hỗ trợ',
  reportProblem: 'Báo lỗi', fullscreen: 'Toàn màn hình', mute: 'Tắt tiếng', unmute: 'Bật tiếng',
  sound: 'Âm thanh', sBeeps: 'Bíp', sSoft: 'Nhẹ', sMarimba: 'Marimba', sOff: 'Tắt', pClassic: 'Cổ điển',
  pGym: 'Phòng gym', pSweat: 'Đổ mồ hôi', pDouble: 'Tabata đôi',
}

const pl: Record<Keys, string> = {
  tabata: 'Tabata', clock: 'Zegar', timer: 'Minutnik', start: 'Start', pause: 'Pauza', resume: 'Wznów',
  skip: 'Pomiń', restart: 'Od nowa', again: 'Jeszcze raz', edit: 'Edytuj', save: 'Zapisz', delete: 'Usuń',
  cancel: 'Anuluj', back: 'Wstecz', recent: 'Ostatnie', presets: 'Szablony', name: 'Nazwa', total: 'Razem',
  for: 'Na', work: 'Praca', rest: 'Odpoczynek', sets: 'Serie', setRest: 'Przerwa między seriami',
  prepare: 'Przygotowanie', cooldown: 'Wyciszenie', rounds: 'Rundy', roundsLower: 'rund', seconds: 'Sekundy',
  min: 'Min', sec: 'Sek', getReady: 'Przygotuj się', done: 'Gotowe', round: 'Runda', set: 'Seria',
  next: 'Następny', roundNames: 'Nazwy rund', advanced: 'Zaawansowane', unsaved: 'Niezapisane',
  savePreset: 'Zapisz szablon', settings: 'Ustawienia', theme: 'Motyw', mode: 'Tryb', accent: 'Kolor',
  font: 'Czcionka', language: 'Język', auto: 'Auto', light: 'Jasny', dark: 'Ciemny', custom: 'Własny',
  support: 'Wsparcie', reportProblem: 'Zgłoś problem', fullscreen: 'Pełny ekran', mute: 'Wycisz',
  unmute: 'Włącz dźwięk', sound: 'Dźwięk', sBeeps: 'Sygnały', sSoft: 'Miękki', sMarimba: 'Marimba',
  sOff: 'Wył.', pClassic: 'Klasyczny', pGym: 'Siłownia', pSweat: 'Pot', pDouble: 'Podwójna Tabata',
}

const nl: Record<Keys, string> = {
  tabata: 'Tabata', clock: 'Klok', timer: 'Timer', start: 'Start', pause: 'Pauze', resume: 'Hervat',
  skip: 'Overslaan', restart: 'Opnieuw', again: 'Nog eens', edit: 'Bewerken', save: 'Opslaan',
  delete: 'Verwijderen', cancel: 'Annuleren', back: 'Terug', recent: 'Recent', presets: 'Presets',
  name: 'Naam', total: 'Totaal', for: 'Voor', work: 'Werk', rest: 'Rust', sets: 'Sets',
  setRest: 'Rust tussen sets', prepare: 'Voorbereiden', cooldown: 'Cooldown', rounds: 'Rondes',
  roundsLower: 'rondes', seconds: 'Seconden', min: 'Min', sec: 'Sec', getReady: 'Maak je klaar',
  done: 'Klaar', round: 'Ronde', set: 'Set', next: 'Volgende', roundNames: 'Rondenamen',
  advanced: 'Geavanceerd', unsaved: 'Niet opgeslagen', savePreset: 'Preset opslaan', settings: 'Instellingen',
  theme: 'Thema', mode: 'Modus', accent: 'Kleur', font: 'Lettertype', language: 'Taal', auto: 'Auto',
  light: 'Licht', dark: 'Donker', custom: 'Aangepast', support: 'Ondersteuning', reportProblem: 'Probleem melden',
  fullscreen: 'Volledig scherm', mute: 'Dempen', unmute: 'Dempen opheffen', sound: 'Geluid', sBeeps: 'Pieptonen',
  sSoft: 'Zacht', sMarimba: 'Marimba', sOff: 'Uit', pClassic: 'Klassiek', pGym: 'Sportschool',
  pSweat: 'Zweet', pDouble: 'Dubbele Tabata',
}

const th: Record<Keys, string> = {
  tabata: 'Tabata', clock: 'นาฬิกา', timer: 'ตัวจับเวลา', start: 'เริ่ม', pause: 'หยุดชั่วคราว',
  resume: 'ทำต่อ', skip: 'ข้าม', restart: 'เริ่มใหม่', again: 'อีกครั้ง', edit: 'แก้ไข', save: 'บันทึก',
  delete: 'ลบ', cancel: 'ยกเลิก', back: 'กลับ', recent: 'ล่าสุด', presets: 'พรีเซ็ต', name: 'ชื่อ',
  total: 'รวม', for: 'จำนวน', work: 'ออกกำลัง', rest: 'พัก', sets: 'เซ็ต', setRest: 'พักระหว่างเซ็ต',
  prepare: 'เตรียม', cooldown: 'คูลดาวน์', rounds: 'รอบ', roundsLower: 'รอบ', seconds: 'วินาที',
  min: 'นาที', sec: 'วินาที', getReady: 'เตรียมตัว', done: 'เสร็จ', round: 'รอบ', set: 'เซ็ต',
  next: 'ถัดไป', roundNames: 'ชื่อรอบ', advanced: 'ขั้นสูง', unsaved: 'ยังไม่บันทึก', savePreset: 'บันทึกพรีเซ็ต',
  settings: 'ตั้งค่า', theme: 'ธีม', mode: 'โหมด', accent: 'สี', font: 'แบบอักษร', language: 'ภาษา',
  auto: 'อัตโนมัติ', light: 'สว่าง', dark: 'มืด', custom: 'กำหนดเอง', support: 'สนับสนุน',
  reportProblem: 'รายงานปัญหา', fullscreen: 'เต็มจอ', mute: 'ปิดเสียง', unmute: 'เปิดเสียง', sound: 'เสียง',
  sBeeps: 'บี๊บ', sSoft: 'นุ่ม', sMarimba: 'มาริมบา', sOff: 'ปิด', pClassic: 'คลาสสิก', pGym: 'ยิม',
  pSweat: 'เหงื่อ', pDouble: 'Tabata คู่',
}

const sv: Record<Keys, string> = {
  tabata: 'Tabata', clock: 'Klocka', timer: 'Timer', start: 'Starta', pause: 'Pausa', resume: 'Återuppta',
  skip: 'Hoppa över', restart: 'Börja om', again: 'Igen', edit: 'Redigera', save: 'Spara', delete: 'Ta bort',
  cancel: 'Avbryt', back: 'Tillbaka', recent: 'Senaste', presets: 'Förinställningar', name: 'Namn',
  total: 'Totalt', for: 'Antal', work: 'Arbete', rest: 'Vila', sets: 'Set', setRest: 'Vila mellan set',
  prepare: 'Förbered', cooldown: 'Nedvarvning', rounds: 'Ronder', roundsLower: 'ronder', seconds: 'Sekunder',
  min: 'Min', sec: 'Sek', getReady: 'Gör dig redo', done: 'Klar', round: 'Rond', set: 'Set', next: 'Nästa',
  roundNames: 'Rondnamn', advanced: 'Avancerat', unsaved: 'Osparat', savePreset: 'Spara förinställning',
  settings: 'Inställningar', theme: 'Tema', mode: 'Läge', accent: 'Färg', font: 'Typsnitt', language: 'Språk',
  auto: 'Auto', light: 'Ljust', dark: 'Mörkt', custom: 'Anpassad', support: 'Support',
  reportProblem: 'Rapportera ett problem', fullscreen: 'Helskärm', mute: 'Tysta', unmute: 'Slå på ljud',
  sound: 'Ljud', sBeeps: 'Pip', sSoft: 'Mjuk', sMarimba: 'Marimba', sOff: 'Av', pClassic: 'Klassisk',
  pGym: 'Gym', pSweat: 'Svett', pDouble: 'Dubbel Tabata',
}

const uk: Record<Keys, string> = {
  tabata: 'Табата', clock: 'Годинник', timer: 'Таймер', start: 'Старт', pause: 'Пауза', resume: 'Далі',
  skip: 'Пропустити', restart: 'Спочатку', again: 'Ще раз', edit: 'Змінити', save: 'Зберегти',
  delete: 'Видалити', cancel: 'Скасувати', back: 'Назад', recent: 'Нещодавні', presets: 'Шаблони',
  name: 'Назва', total: 'Усього', for: 'На', work: 'Робота', rest: 'Відпочинок', sets: 'Сети',
  setRest: 'Пауза між сетами', prepare: 'Підготовка', cooldown: 'Заминка', rounds: 'Раунди',
  roundsLower: 'раундів', seconds: 'Секунди', min: 'Хв', sec: 'Сек', getReady: 'Приготуйся', done: 'Готово',
  round: 'Раунд', set: 'Сет', next: 'Далі', roundNames: 'Підписи раундів', advanced: 'Розширені',
  unsaved: 'Не збережено', savePreset: 'Зберегти шаблон', settings: 'Налаштування', theme: 'Тема',
  mode: 'Режим', accent: 'Колір', font: 'Шрифт', language: 'Мова', auto: 'Авто', light: 'Світла',
  dark: 'Темна', custom: 'Свій', support: 'Підтримка', reportProblem: 'Повідомити про проблему',
  fullscreen: 'На весь екран', mute: 'Без звуку', unmute: 'Увімкнути звук', sound: 'Звук', sBeeps: 'Сигнали',
  sSoft: 'М’який', sMarimba: 'Марімба', sOff: 'Вимк', pClassic: 'Класика', pGym: 'Зал', pSweat: 'Піт',
  pDouble: 'Подвійна Табата',
}

const ru: Record<Keys, string> = {
  tabata: 'Табата', clock: 'Часы', timer: 'Таймер', start: 'Старт', pause: 'Пауза', resume: 'Продолжить',
  skip: 'Пропустить', restart: 'Заново', again: 'Ещё раз', edit: 'Изменить', save: 'Сохранить',
  delete: 'Удалить', cancel: 'Отмена', back: 'Назад', recent: 'Недавние', presets: 'Шаблоны',
  name: 'Название', total: 'Всего', for: 'На', work: 'Работа', rest: 'Отдых', sets: 'Сеты',
  setRest: 'Отдых между сетами', prepare: 'Подготовка', cooldown: 'Заминка', rounds: 'Раунды',
  roundsLower: 'раундов', seconds: 'Секунды', min: 'Мин', sec: 'Сек', getReady: 'Приготовься', done: 'Готово',
  round: 'Раунд', set: 'Сет', next: 'Далее', roundNames: 'Подписи раундов', advanced: 'Дополнительно',
  unsaved: 'Не сохранено', savePreset: 'Сохранить шаблон', settings: 'Настройки', theme: 'Тема',
  mode: 'Режим', accent: 'Цвет', font: 'Шрифт', language: 'Язык', auto: 'Авто', light: 'Светлая',
  dark: 'Тёмная', custom: 'Свой', support: 'Поддержка', reportProblem: 'Сообщить о проблеме',
  fullscreen: 'Полный экран', mute: 'Без звука', unmute: 'Включить звук', sound: 'Звук', sBeeps: 'Сигналы',
  sSoft: 'Мягкий', sMarimba: 'Маримба', sOff: 'Выкл', pClassic: 'Классика', pGym: 'Зал', pSweat: 'Пот',
  pDouble: 'Двойная Табата',
}

const DICTS: Record<Lang, Dict> = {
  en, zh, es, hi, ar, pt, fr, de, ja, ko, it, tr, id, vi, pl, nl, th, sv, uk, ru,
}

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

function applyDir(lang: Lang): void {
  if (typeof document === 'undefined') return
  document.documentElement.lang = lang
  document.documentElement.dir = isRTL(lang) ? 'rtl' : 'ltr'
}
applyDir(current)

export const getLang = (): Lang => current

export function setLang(lang: Lang): void {
  current = lang
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    /* ignore */
  }
  applyDir(lang)
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
