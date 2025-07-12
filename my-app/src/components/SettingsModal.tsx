import { useState } from 'react';
import { SettingsManager } from '../SettingsManager';

interface Props {
  manager: SettingsManager;
  onClose: () => void;
}

export default function SettingsModal({ manager, onClose }: Props) {
  const initial = manager.get();
  const [apiKey, setApiKey] = useState(initial.apiKey);
  const [model, setModel] = useState(initial.model);
  const [endpoint, setEndpoint] = useState(initial.endpoint);
  const [maxTokens, setMaxTokens] = useState(initial.maxTokens);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)' }}>
      <div style={{ margin: '100px auto', padding: 20, background: '#fff', maxWidth: 400 }}>
        <h3>Settings</h3>
        <label>API Key
          <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} />
        </label>
        <label>Model
          <select value={model} onChange={e => setModel(e.target.value)}>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-4-turbo-preview">GPT-4 Turbo</option>
          </select>
        </label>
        <label>Endpoint
          <input type="text" value={endpoint} onChange={e => setEndpoint(e.target.value)} />
        </label>
        <label>Max Tokens
          <input type="number" value={maxTokens} onChange={e => setMaxTokens(parseInt(e.target.value))} />
        </label>
        <div style={{ marginTop: 10 }}>
          <button onClick={() => { manager.update({ apiKey, model, endpoint, maxTokens }); onClose(); }}>Save</button>
          <button onClick={onClose} style={{ marginLeft: 10 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

