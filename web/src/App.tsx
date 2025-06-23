import Header from './layout/Header'
import MainContainer from './layout/MainContainer'
// import Footer from './layout/Footer'

const App = () => {

  return (
    <div className="w-screen h-screen overflow-hidden">
		<div className="flex flex-col h-full">
			<Header />
			<MainContainer />	
		</div>
    </div>
  )
}

export default App