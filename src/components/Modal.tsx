// Minimal accessible modal: overlay + centered dialog, Escape / click-outside to
// close, focus moved in on open and restored on close. Kept dependency-free
// (the same role Radix/shadcn Dialog plays, but tiny for our single use).
import { useEffect, useRef, type ReactNode } from 'react'
import { CloseIcon } from './icons'

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    restoreRef.current = document.activeElement as HTMLElement
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    // Move focus into the dialog (first focusable element).
    panelRef.current?.querySelector<HTMLElement>('input, button, [tabindex]')?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      restoreRef.current?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 max-h-[85dvh] w-[min(380px,92vw)] overflow-y-auto rounded-xl border border-border bg-surface p-5 text-start shadow-2xl"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-ui text-[0.7rem] uppercase tracking-[0.2em] text-fg-tertiary">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="focus-ring -mr-1 -mt-1 flex h-8 w-8 items-center justify-center rounded-md text-fg-secondary transition-colors hover:bg-hover hover:text-fg"
          >
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
