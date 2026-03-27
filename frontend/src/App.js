import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [notes, setNotes] = useState([]);
  const [input, setInput] = useState('');

  // Fetch notes on load
  useEffect(() => {
    fetch('http://localhost:5000/api/notes')
      .then(res => res.json())
      .then(data => setNotes(data));
  }, []);

  const addNote = () => {
    if (!input) return;
    fetch('http://localhost:5000/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: input }),
    })
      .then(res => res.json())
      .then(newNote => {
        setNotes([...notes, newNote]);
        setInput('');
      });
  };

  return (
    <div className="app-container">
      <h1>Persistent Notes</h1>
      <div className="input-group">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Write a note..."
        />
        <button onClick={addNote}>Save</button>
      </div>
      <ul>
        {notes.map(note => <li key={note.id}>{note.text}</li>)}
      </ul>
    </div>
  );
}

export default App;