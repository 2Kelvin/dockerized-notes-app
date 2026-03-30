const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// 1. Point to the data folder inside the backend directory
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'notes.json');

// 2. Ensure the directory exists first
if (!fs.existsSync(DATA_DIR)) {
    console.log("Creating data directory at:", DATA_DIR);
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 3. Ensure the file exists
if (!fs.existsSync(DATA_FILE)) {
    console.log("Creating empty notes.json at:", DATA_FILE);
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Get all notes
app.get('/api/notes', (req, res) => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error("Error reading notes:", err);
        res.status(500).json({ error: "Could not read notes" });
    }
});

// Save a note
app.post('/api/notes', (req, res) => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        const notes = JSON.parse(data);
        const newNote = { id: Date.now(), text: req.body.text };
        notes.push(newNote);
        fs.writeFileSync(DATA_FILE, JSON.stringify(notes, null, 2));
        res.status(201).json(newNote);
    } catch (err) {
        console.error("Error saving note:", err);
        res.status(500).json({ error: "Could not save note" });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// replace db with postgres and also include redis for caching