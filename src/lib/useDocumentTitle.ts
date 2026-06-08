import { useEffect } from 'react'

// Temporarily drive the browser tab title (e.g. a live countdown). Pass `null`
// to leave it alone. On each change it round-trips through the title that was
// in place before, so unmounting cleanly restores the route's own <title>.
// Just a string assignment per update — no allocation, no memory growth.
export function useDocumentTitle(title: string | null): void {
  useEffect(() => {
    if (title == null) return
    const previous = document.title
    document.title = title
    return () => {
      document.title = previous
    }
  }, [title])
}
