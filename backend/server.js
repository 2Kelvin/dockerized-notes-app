const express = require('express');
const { Pool } = require('pg');
const redis = require('redis');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Function to read secret from Docker
const getDatabasePassword = () => {
    const secretPath = '/run/secrets/database_password';
    if (fs.existsSync(secretPath)) {
        return fs.readFileSync(secretPath, 'utf8').trim();
    }
    return process.env.DB_PASSWORD; // Fallback for local testing
};

// 1. Postgres Setup
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: getDatabasePassword(),
    port: process.env.DB_PORT,
});

const initDb = async () => {
    let connected = false;
    let attempts = 5;

    while (!connected && attempts > 0) {
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS notes (
                  id SERIAL PRIMARY KEY,
                  text TEXT NOT NULL,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
            connected = true;
            console.log('✅ Database tables initialized');
        } catch (err) {
            attempts--;
            console.log(`⚠️ Database not ready... retrying (${attempts} attempts left)`);
            await new Promise(res => setTimeout(res, 5000)); // Wait 5 seconds
        }
    }

    if (!connected) throw new Error("Could not connect to Postgres after multiple attempts");
};

// 2. Redis Setup
const redisClient = redis.createClient({ url: process.env.REDIS_URL });
redisClient.on('error', (err) => console.error('Redis Error', err));

// --- Helper: Clear Cache ---
const clearCache = async () => {
    if (redisClient.isOpen) {
        await redisClient.del('notes_list');
    }
};

// --- CRUD Routes ---

// GET: Fetch all notes (with Redis caching)
app.get('/api/notes', async (req, res) => {
    try {
        const cachedNotes = await redisClient.get('notes_list');
        if (cachedNotes) {
            return res.json(JSON.parse(cachedNotes));
        }

        const result = await pool.query('SELECT * FROM notes ORDER BY created_at DESC');
        // Cache for 1 hour (3600 seconds)
        await redisClient.setEx('notes_list', 3600, JSON.stringify(result.rows));
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Create note
app.post('/api/notes', async (req, res) => {
    try {
        const { text } = req.body;
        const result = await pool.query('INSERT INTO notes (text) VALUES ($1) RETURNING *', [text]);
        await clearCache();
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT: Update note
app.put('/api/notes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        await pool.query('UPDATE notes SET text = $1 WHERE id = $2', [text, id]);
        await clearCache();
        res.json({ message: "Updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE: Remove note
app.delete('/api/notes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM notes WHERE id = $1', [id]);
        await clearCache();
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Server Startup Logic ---
const startServer = async () => {
    try {
        // 1. Connect to Redis first
        await redisClient.connect();
        console.log('✅ Connected to Redis');

        // 2. Initialize Postgres Table
        await initDb();
        console.log('✅ Database tables initialized');

        // 3. Start listening for requests
        app.listen(PORT, () => console.log(`🚀 Pro Server running on port ${PORT}`));
    } catch (err) {
        console.error('❌ CRITICAL STARTUP ERROR:', err);
    }
};

startServer();