import React from "react"

type Bubble = {
  id: number
  colStart: number
  rowStart: number
  colSpan?: number
  rowSpan?: number
  className?: string
}

type BackgroundProps = {
  bubbles: Bubble[]
}

const Background: React.FC<BackgroundProps> = ({ bubbles }) => {
  return (
    <div className="absolute inset-0 grid grid-cols-12 grid-rows-8 w-full h-full pointer-events-none">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className={`col-start-${bubble.colStart} row-start-${bubble.rowStart} 
            ${bubble.colSpan ? `col-span-${bubble.colSpan}` : ""} 
            ${bubble.rowSpan ? `row-span-${bubble.rowSpan}` : ""} 
            ${bubble.className ?? ""}`}
        />
      ))}
    </div>
  )
}

export default Background
