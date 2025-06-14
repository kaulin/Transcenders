import Header from './layout/Header'
import MainContainer from './layout/MainContainer'
// import Footer from './layout/Footer'

import Background from './components/Background'


const bubbles = [
  { id: 1, colStart: 2, rowStart: 1, colSpan: 1, rowSpan: 1, className: "bg-bubble max-w-[100%]" },
  { id: 1, colStart: 1, rowStart: 3, colSpan: 2, rowSpan: 2, className: "bg-bubble max-w-[80%]" },
  { id: 1, colStart: 2, rowStart: 6, colSpan: 1, rowSpan: 1, className: "bg-bubble max-w-[50%]" },
  { id: 1, colStart: 8, rowStart: 1, colSpan: 2, rowSpan: 2, className: "bg-bubble max-w-[80%]" },
  { id: 1, colStart: 11, rowStart: 2, colSpan: 1, rowSpan: 1, className: "bg-bubble max-w-[60%]" },
  { id: 1, colStart: 5, rowStart: 2, colSpan: 1, rowSpan: 1, className: "bg-bubble max-w-[70%]" },
  { id: 1, colStart: 4, rowStart: 6, colSpan: 2, rowSpan: 2, className: "bg-bubble max-w-[80%]" },
  { id: 1, colStart: 8, rowStart: 5, colSpan: 1, rowSpan: 1, className: "bg-bubble max-w-[80%]" },
  { id: 1, colStart: 12, rowStart: 4, colSpan: 2, rowSpan: 2, className: "bg-bubble max-w-[90%]" },
  { id: 1, colStart: 11, rowStart: 6, colSpan: 2, rowSpan: 2, className: "bg-bubble max-w-[90%]" }
]

const App = () => {

  return (
    <div className="relative w-screen h-screen overflow-hidden">
		  {/* <Background bubbles={bubbles} /> */}

      <div className="relative z-10 flex flex-col h-full">
        <Header />
        <MainContainer />	
      </div>
    </div>
  )
}

export default App
