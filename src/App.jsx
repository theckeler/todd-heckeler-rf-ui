import IconRail from "./components/IconRail";
import MainContent from "./components/MainContent";
import Sidebar from "./components/Sidebar";

function App() {
  return (
    <div className="app-shell">
      <IconRail />
      <Sidebar />
      <MainContent />
    </div>
  );
}

export default App;
