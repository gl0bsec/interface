import { useState } from 'react';
import './App.css';
import ScatterPlot from './components/ScatterPlot';
import { DataManager } from './DataManager';
import { SettingsManager } from './SettingsManager';
import SettingsModal from './components/SettingsModal';

const dataManager = new DataManager();
const settingsManager = new SettingsManager();

function App() {
  const [selected, setSelected] = useState<number[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="App" style={{ padding: 20 }}>
      <h1>Text Embedding Explorer (React)</h1>
      <button onClick={() => setShowSettings(true)}>Settings</button>
      <div style={{ marginTop: 20 }}>
        <ScatterPlot
          data={dataManager.getEmbeddings()}
          width={600}
          height={400}
          onSelect={setSelected}
        />
      </div>
      <div style={{ marginTop: 10 }}>
        Selected Points: {selected.length}
      </div>
      {showSettings && (
        <SettingsModal manager={settingsManager} onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

export default App;

