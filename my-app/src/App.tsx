import { useState } from 'react';
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
    <div className="h-screen flex flex-col">
      <header className="bg-blue-600 text-white px-4 py-2 flex justify-between items-center">
        <h1 className="text-lg font-semibold">Text Embedding Explorer</h1>
        <button
          className="bg-blue-800 hover:bg-blue-700 px-3 py-1 rounded"
          onClick={() => setShowSettings(true)}
        >
          Settings
        </button>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 flex items-center justify-center">
          <ScatterPlot
            data={dataManager.getEmbeddings()}
            width={600}
            height={400}
            onSelect={setSelected}
          />
        </main>
        <aside className="w-64 bg-neutral-800 text-white p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-2">Selection</h2>
          <p className="mb-2">Selected Points: {selected.length}</p>
          <ul className="space-y-1 text-sm">
            {selected.map((idx) => {
              const item = dataManager.getEmbeddings()[idx];
              return <li key={idx}>{String(item.content)}</li>;
            })}
          </ul>
        </aside>
      </div>
      {showSettings && (
        <SettingsModal manager={settingsManager} onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

export default App;
