import type { CSSProperties } from "react"

const ACCENTS = ["#d84d37", "#b86a18", "#39766d", "#6e5ca5", "#34719a"]

type WordStyle = CSSProperties & {
  "--word-accent": string
  "--word-delay": string
  "--wave-duration": string
}

export function ProblemHighlight({ statement, sequence = 0 }: { statement: string; sequence?: number }) {
  const words = statement.trim().split(/\s+/)
  const duration = Math.max(7, words.length * 0.18 + 2.2)

  return (
    <span className="problem-highlight" aria-label={statement}>
      <span aria-hidden="true">“</span>
      <span aria-hidden="true">
        {words.map((word, index) => {
          const style: WordStyle = {
            "--word-accent": ACCENTS[index % ACCENTS.length],
            "--word-delay": `${sequence * 0.65 + index * 0.18}s`,
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
