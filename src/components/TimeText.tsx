// Renders a HH:MM:SS / MM:SS string with the colons nudged up so they sit
// optically centered against the tall numerals (the font baselines the colon
// low). textContent is unchanged, so it stays assertion-friendly.
export function TimeText({ value }: { value: string }) {
  // inline-block + nowrap keeps the whole time on one line (the per-character
  // spans would otherwise be allowed to wrap when the font is very large).
  return (
    <span className="inline-block whitespace-nowrap">
      {value.split('').map((ch, i) =>
        ch === ':' ? (
          <span key={i} className="inline-block -translate-y-[0.12em]">
            :
          </span>
        ) : (
          <span key={i}>{ch}</span>
        ),
      )}
    </span>
  )
}
