import type { CSSProperties } from "react"

type WordStyle = CSSProperties & {
  "--word-delay": string
  "--wave-duration": string
}

export function ProblemHighlight({ statement, sequence = 0 }: { statement: string; sequence?: number }) {
  const words = statement.trim().split(/\s+/)
  const duration = Math.max(14, words.length * 0.28 + 5)

  return (
    <span className="problem-highlight" aria-label={statement}>
      <span aria-hidden="true">“</span>
      <span aria-hidden="true">
        {words.map((word, index) => {
          const style: WordStyle = {
            "--word-delay": `${sequence * 1.1 + index * 0.24}s`,
            "--wave-duration": `${duration}s`,
          }

          return (
            <span className="problem-highlight-word" style={style} key={`${word}-${index}`}>
              {word}{index < words.length - 1 ? " " : ""}
            </span>
          )
        })}
      </span>
      <span aria-hidden="true">”</span>
    </span>
  )
}
