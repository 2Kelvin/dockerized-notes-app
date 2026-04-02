import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = '/api/notes';

function App() {
  const [notes, setNotes] = useState([]);
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState(null);

  const fetchNotes = () => {
    fetch(API_URL).then(res => res.json()).then(data => setNotes(data));
  };

  useEffect(() => { fetchNotes(); }, []);

  const saveNote = () => {
    if (!input.trim()) return;

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: input }),
    }).then(() => {
      setInput('');
      setEditingId(null);
      fetchNotes();
    });
  };

  const startEdit = (note) => {
    setEditingId(note.id);
    setInput(note.text);
  };

  const deleteNote = (id) => {
    fetch(`${API_URL}/${id}`, { method: 'DELETE' }).then(() => fetchNotes());
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') saveNote();
  };

  return (
    <div className="app-container">
      <div className="container">
        <h1>Pro Notes</h1>
        <div className="input-group">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={editingId ? "Edit your note..." : "Press Enter to save..."}
          />
          <button onClick={saveNote} className={editingId ? "update-btn" : "save-btn"}>
            {editingId ? 'Update' : 'Save'}
          </button>
        </div>

        <ul className="notes-list">
          {notes.map(note => (
            <li key={note.id} className="note-item">
              <span className="note-text">{note.text}</span>
              <div className="actions">
                <button className="edit-btn" onClick={() => startEdit(note)}>
                  Edit
                </button>
                <button className="delete-btn" onClick={() => deleteNote(note.id)}>
                  {/* Trash Can Icon */}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;