import { useState } from 'react';

const SearchBar = () => {
  const [activeTab, setActiveTab] = useState('hotel');

  const tabs = [
    { id: 'hotel', label: '🏨 Hôtel' },
    { id: 'appartement', label: '🏠 Appartement' },
    { id: 'villa', label: '🏡 Villa' },
  ];

  return (
    <div className="search-container">
      <div className="search-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`search-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="search-fields">
        <div className="search-field">
          <label>📍 Destination</label>
          <input type="text" placeholder="Ex : Paris, Nice, Lyon…" />
        </div>
        <div className="search-field">
          <label>📅 Arrivée</label>
          <input type="date" />
        </div>
        <div className="search-field">
          <label>📅 Départ</label>
          <input type="date" />
        </div>
        <div className="search-field">
          <label>👥 Voyageurs</label>
          <select>
            <option>1 adulte</option>
            <option>2 adultes</option>
            <option>2 adultes, 1 enfant</option>
            <option>2 adultes, 2 enfants</option>
            <option>Groupe (+5)</option>
          </select>
        </div>
        <button className="btn-search">🔍 Rechercher</button>
      </div>
    </div>
  );
};

export default SearchBar;
