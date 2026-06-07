// Renders a HH:MM:SS / MM:SS string with:
//  - colons nudged up so they sit optically centered against the tall numerals
//    (fonts baseline the colon low), and
//  - every digit in a fixed-width (1ch) centered cell so the layout never
//    shifts as numbers tick — works even for fonts without true tabular figures.
// textContent is unchanged, so it stays assertion-friendly.
export function TimeText({ value }: { value: string }) {
  return (
    <span className="inline-block whitespace-nowrap tabular-nums">
      {value.split('').map((ch, i) =>
        ch === ':' ? (
          <span key={i} className="inline-block -translate-y-[0.12em]">
            :
          </span>
        ) : (
          <span key={i} className="inline-block w-[1ch] text-center">
            {ch}
          </span>
        ),
      )}
    </span>
  )
}
