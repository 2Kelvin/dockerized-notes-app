import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:5000/api/notes';

function App() {
  const [notes, setNotes] = useState([]);
  const [input, setInput] = useState('');

  const fetchNotes = () => {
    fetch(API_URL).then(res => res.json()).then(data => setNotes(data));
  };

  useEffect(() => { fetchNotes(); }, []);

  const saveNote = () => {
    if (!input.trim()) return;
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: input }),
    }).then(() => {
      setInput('');
      fetchNotes();
    });
  };

  const deleteNote = (id) => {
    fetch(`${API_URL}/${id}`, { method: 'DELETE' }).then(() => fetchNotes());
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') saveNote();
  };

  return (
    <div className="app-container">
      <h1>Pro Notes</h1>
      <div className="input-group">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Press Enter to save..."
        />
        <button onClick={saveNote}>Save</button>
      </div>

      <ul className="notes-list">
        {notes.map(note => (
          <li key={note.id} className="note-item">
            <span>{note.text}</span>
            <button className="delete-btn" onClick={() => deleteNote(note.id)}>✕</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;