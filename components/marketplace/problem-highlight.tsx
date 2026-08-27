import type { CSSProperties, ElementType } from "react"

type SheenStyle = CSSProperties & {
  "--sheen-delay": string
  "--sheen-ink"?: string
}

/**
 * The statement, with a slow sheen passing across it.
 *
 * This renders the block that holds the text rather than a span inside it, and
 * that is load-bearing. A multi-line *inline* box paints its background across
 * the imaginary unbroken box - every line laid end to end - so a gradient
 * positioned against the visible width lands somewhere off in the middle of a
 * line that was never drawn, and the sheen is invisible almost all the time.
 * On a block box the positioning area is the box you can actually see.
 */
export function ProblemHighlight({
  statement,
  sequence = 0,
  ink,
  as: Tag = "p",
  className = "",
}: {
  statement: string
  sequence?: number
  /** The statement's own colour; the sheen travels between two of these. */
  ink?: string
  as?: ElementType
  className?: string
}) {
  // Every card shares one period so the offsets stay fixed relative to each
  // other, and the modulo keeps a card far down the board from waiting the
  // better part of a minute for its first pass.
  const style: SheenStyle = { "--sheen-delay": `${(sequence % 8) * 1.1}s` }
  if (ink) style["--sheen-ink"] = ink

  return (
    <Tag className={`problem-sheen ${className}`} style={style}>
      {`“${statement}”`}
    </Tag>
  )
}
