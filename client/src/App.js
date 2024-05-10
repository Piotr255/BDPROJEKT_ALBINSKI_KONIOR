import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {useEffect, useState} from "react";
import Panel from "./Panel";

function App() {

  const [panelsCount, setPanelsCount] = useState(2);
  const [userType, setUserType] = useState('Admin');

  function createPanels(numberOfPanels) {
    const panels = [];
    for (let i = 0; i < numberOfPanels; i++) {
      panels.push(<Panel key={i} userType={userType} />);
      panels.push(<hr/>)
    }
    return panels;
  }

  useEffect(() => {
    let userType = window.prompt("Jaki typ użytkownika?", 'Admin');
    setUserType(userType);
    let panel_count = window.prompt("Ile paneli wyświetlić?", '3');
    setPanelsCount(Number(panel_count));
  }, []);

  return (
    <div className="container bg-secondary text-white py-1">
      {createPanels(panelsCount)}
    </div>
  );
}

export default App;
