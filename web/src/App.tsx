import Header from './layout/Header'
import MainContainer from './layout/MainContainer'
// import Footer from './layout/Footer'

// import Background from './components/Background'

// const bubbles = [
//   { id: 1, colStart: 1, rowStart: 1, colSpan: 2, rowSpan: 2, className: "bg-bubble-8" },
//   { id: 1, colStart: 4, rowStart: 1, colSpan: 2, rowSpan: 2, className: "bg-bubble-4" },
//   { id: 1, colStart: 6, rowStart: 1, colSpan: 3, rowSpan: 3, className: "bg-bubble-6" },
//   { id: 1, colStart: 10, rowStart: 1, colSpan: 2, rowSpan: 2, className: "bg-bubble-8" },
//   { id: 1, colStart: 12, rowStart: 1, colSpan: 1, rowSpan: 1, className: "bg-bubble-4" },
//   { id: 1, colStart: 4, rowStart: 2, colSpan: 2, rowSpan: 2, className: "bg-bubble-6" },
//   { id: 1, colStart: 8, rowStart: 2, colSpan: 2, rowSpan: 2, className: "bg-bubble-8" },
//   { id: 1, colStart: 11, rowStart: 2, colSpan: 2, rowSpan: 2, className: "bg-bubble-8" },
//   { id: 1, colStart: 3, rowStart: 3, colSpan: 2, rowSpan: 2, className: "bg-bubble-8" },
// ]

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
