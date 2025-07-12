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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white dark:bg-neutral-800 text-black dark:text-white p-6 rounded-lg shadow-xl w-80 space-y-4 transition">
        <h3 className="text-lg font-semibold">Settings</h3>
        <label className="block text-sm">
          API Key
          <input
            type="password"
            className="mt-1 w-full border rounded px-2 py-1"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          Model
          <select
            className="mt-1 w-full border rounded px-2 py-1"
            value={model}
            onChange={e => setModel(e.target.value)}
          >
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-4-turbo-preview">GPT-4 Turbo</option>
          </select>
        </label>
        <label className="block text-sm">
          Endpoint
          <input
            type="text"
            className="mt-1 w-full border rounded px-2 py-1"
            value={endpoint}
            onChange={e => setEndpoint(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          Max Tokens
          <input
            type="number"
            className="mt-1 w-full border rounded px-2 py-1"
            value={maxTokens}
            onChange={e => setMaxTokens(parseInt(e.target.value))}
          />
        </label>
        <div className="flex justify-end space-x-2 pt-2">
          <button
            className="bg-gray-200 px-3 py-1 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded"
            onClick={() => {
              manager.update({ apiKey, model, endpoint, maxTokens });
              onClose();
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
