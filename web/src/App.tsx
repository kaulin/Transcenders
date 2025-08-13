import AuthBootstrap from './components/AuthBootstrap';
import Header from './layout/Header';
import MainContainer from './layout/MainContainer';
// import Footer from './layout/Footer'

const App = () => {
  return (
    <div className="w-screen h-screen overflow-hidden">
      <AuthBootstrap>
        <div className="flex flex-col h-full">
          <Header />
          <MainContainer />
        </div>
      </AuthBootstrap>
    </div>
  );
};

export default App;
