import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Database from 'better-sqlite3';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Database setup
const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}
const db = new Database(path.join(dbDir, 'database.sqlite'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    createdAt INTEGER
  );
  CREATE TABLE IF NOT EXISTS news (
    id TEXT PRIMARY KEY,
    title TEXT,
    excerpt TEXT,
    content TEXT,
    category TEXT,
    imageUrl TEXT,
    date TEXT,
    author TEXT,
    readTime TEXT,
    createdAt INTEGER
  );
  CREATE TABLE IF NOT EXISTS hero_slides (
    id TEXT PRIMARY KEY,
    title TEXT,
    subtitle TEXT,
    imageUrl TEXT,
    ctaText TEXT,
    ctaLink TEXT,
    orderIndex INTEGER
  );
  CREATE TABLE IF NOT EXISTS partners (
    id TEXT PRIMARY KEY,
    name TEXT,
    logoUrl TEXT,
    websiteUrl TEXT,
    description TEXT,
    type TEXT,
    createdAt INTEGER
  );
  CREATE TABLE IF NOT EXISTS provinces (
    id TEXT PRIMARY KEY,
    name TEXT,
    coordinates TEXT,
    description TEXT,
    primate TEXT,
    dioceses INTEGER,
    population INTEGER,
    established TEXT,
    websiteUrl TEXT,
    imageUrl TEXT
  );
  CREATE TABLE IF NOT EXISTS resources (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    type TEXT,
    category TEXT,
    url TEXT,
    fileUrl TEXT,
    size TEXT,
    downloads INTEGER DEFAULT 0,
    author TEXT,
    tags TEXT,
    createdAt INTEGER
  );
  CREATE TABLE IF NOT EXISTS thematic_areas (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    icon TEXT,
    orderIndex INTEGER
  );
  CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY,
    value TEXT
  );
  CREATE TABLE IF NOT EXISTS staff (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    role TEXT,
    bio TEXT,
    image_url TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TEXT,
    updated_at TEXT
  );
  CREATE TABLE IF NOT EXISTS leadership (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    category TEXT NOT NULL,
    bio TEXT,
    image_url TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TEXT,
    updated_at TEXT
  );
  CREATE TABLE IF NOT EXISTS gallery (
    id TEXT PRIMARY KEY,
    title TEXT,
    image_url TEXT NOT NULL,
    category TEXT,
    date TEXT,
    created_at TEXT,
    updated_at TEXT
  );
`);

// Migrations to add missing columns
const migrations = [
  'ALTER TABLE provinces ADD COLUMN countries TEXT',
  'ALTER TABLE provinces ADD COLUMN latitude REAL',
  'ALTER TABLE provinces ADD COLUMN longitude REAL',
  'ALTER TABLE provinces ADD COLUMN updatedAt TEXT',
  'ALTER TABLE provinces ADD COLUMN createdAt INTEGER',
  'ALTER TABLE partners ADD COLUMN updatedAt TEXT',
  'ALTER TABLE hero_slides ADD COLUMN description TEXT',
  'ALTER TABLE hero_slides ADD COLUMN badge TEXT',
  'ALTER TABLE hero_slides ADD COLUMN image TEXT',
  'ALTER TABLE hero_slides ADD COLUMN "order" INTEGER',
  'ALTER TABLE hero_slides ADD COLUMN updatedAt TEXT',
  'ALTER TABLE hero_slides ADD COLUMN createdAt INTEGER',
  'ALTER TABLE news ADD COLUMN image TEXT',
  'ALTER TABLE news ADD COLUMN updatedAt TEXT',
  'ALTER TABLE resources ADD COLUMN fileName TEXT',
  'ALTER TABLE resources ADD COLUMN updatedAt TEXT',
  'ALTER TABLE resources ADD COLUMN featured INTEGER DEFAULT 0',
  'ALTER TABLE thematic_areas ADD COLUMN iconName TEXT',
  'ALTER TABLE thematic_areas ADD COLUMN "order" INTEGER',
  'ALTER TABLE thematic_areas ADD COLUMN updatedAt TEXT',
  'ALTER TABLE thematic_areas ADD COLUMN createdAt INTEGER'
];

for (const migration of migrations) {
  try {
    db.exec(migration);
  } catch (e) {
    // Ignore errors if column already exists
  }
}

// Seed default admin if not exists
const adminCheck = db.prepare('SELECT * FROM admins WHERE email = ?').get('youroger1@gmail.com');
if (!adminCheck) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO admins (id, email, password, createdAt) VALUES (?, ?, ?, ?)').run('default-admin', 'youroger1@gmail.com', hash, Date.now());
}

// Seed global settings if not exists
const settingsCheck = db.prepare('SELECT * FROM settings WHERE id = ?').get('global');
if (!settingsCheck) {
  db.prepare('INSERT INTO settings (id, value) VALUES (?, ?)').run('global', JSON.stringify({ logoUrl: '' }));
}

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use('/api', limiter);

// Uploads setup
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Auth middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// API Routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user: any = db.prepare('SELECT * FROM admins WHERE email = ?').get(email);
  
  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, email: user.email });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.get('/api/auth/me', authenticateToken, (req: any, res) => {
  res.json({ email: req.user.email });
});

app.post('/api/upload', authenticateToken, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size exceeds the 5MB limit' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(500).json({ error: 'Unknown upload error' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  });
});

// Generic CRUD routes
const tables = ['news', 'hero_slides', 'partners', 'provinces', 'resources', 'thematic_areas', 'admins', 'settings', 'staff', 'leadership', 'gallery'];

tables.forEach(table => {
  // GET all
  app.get(`/api/${table}`, (req, res) => {
    let orderBy = 'createdAt DESC';
    if (table === 'hero_slides' || table === 'thematic_areas' || table === 'staff' || table === 'leadership') orderBy = 'orderIndex ASC';
    if (table === 'provinces') orderBy = 'name ASC';
    
    try {
      // Check if table has createdAt or orderIndex columns before sorting
      const columns = db.prepare(`PRAGMA table_info(${table})`).all() as any[];
      const columnNames = columns.map(c => c.name);
      
      let actualOrderBy = 'id ASC';
      if (orderBy === 'createdAt DESC') {
        if (columnNames.includes('createdAt')) actualOrderBy = 'createdAt DESC';
        else if (columnNames.includes('created_at')) actualOrderBy = 'created_at DESC';
      } else if (orderBy === 'orderIndex ASC') {
        if (columnNames.includes('orderIndex')) actualOrderBy = 'orderIndex ASC';
        else if (columnNames.includes('order_index')) actualOrderBy = 'order_index ASC';
      } else if (orderBy === 'name ASC' && columnNames.includes('name')) {
        actualOrderBy = 'name ASC';
      }

      const rows = db.prepare(`SELECT * FROM ${table} ORDER BY ${actualOrderBy}`).all();
      // Parse JSON fields if needed
      const parsedRows = rows.map((row: any) => {
        if (row.coordinates) {
          try {
            row.coordinates = JSON.parse(row.coordinates);
          } catch (e) {
            row.coordinates = null;
          }
        }
        if (row.tags) {
          try {
            row.tags = JSON.parse(row.tags);
          } catch (e) {
            row.tags = [];
          }
        } else if (table === 'resources') {
          row.tags = [];
        }
        return row;
      });
      res.json(parsedRows);
    } catch (e) {
      console.error(e);
      res.json([]);
    }
  });

  // GET one
  app.get(`/api/${table}/:id`, (req, res) => {
    const row: any = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
    if (row) {
      if (row.coordinates) row.coordinates = JSON.parse(row.coordinates);
      if (row.tags) row.tags = JSON.parse(row.tags);
      res.json(row);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  });

  // POST
  app.post(`/api/${table}`, authenticateToken, (req, res) => {
    const id = Date.now().toString();
    const data = { ...req.body, id };
    
    try {
      const columns = db.prepare(`PRAGMA table_info(${table})`).all() as any[];
      const columnNames = columns.map(c => c.name);
      
      if (columnNames.includes('createdAt')) {
        data.createdAt = Date.now();
      } else if (columnNames.includes('created_at')) {
        data.created_at = new Date().toISOString();
      }

      if (table === 'admins' && data.password) {
        data.password = bcrypt.hashSync(data.password, 10);
      }

      if (data.coordinates && typeof data.coordinates !== 'string') data.coordinates = JSON.stringify(data.coordinates);
      if (data.tags && typeof data.tags !== 'string') data.tags = JSON.stringify(data.tags);

      // Filter out keys that don't exist in the table schema
      const validKeys = Object.keys(data).filter(k => columnNames.includes(k));
      const validValues = validKeys.map(k => data[k]);
      const placeholders = validKeys.map(() => '?').join(',');
      
      db.prepare(`INSERT INTO ${table} (${validKeys.map(k => `"${k}"`).join(',')}) VALUES (${placeholders})`).run(validValues);
      res.json({ id, ...req.body });
    } catch (e: any) {
      console.error(`Error inserting into ${table}:`, e);
      res.status(500).json({ error: e.message });
    }
  });

  // PUT
  app.put(`/api/${table}/:id`, authenticateToken, (req, res) => {
    const data = { ...req.body };
    
    try {
      const columns = db.prepare(`PRAGMA table_info(${table})`).all() as any[];
      const columnNames = columns.map(c => c.name);

      if (table === 'admins' && data.password) {
        data.password = bcrypt.hashSync(data.password, 10);
      }

      if (data.coordinates && typeof data.coordinates !== 'string') data.coordinates = JSON.stringify(data.coordinates);
      if (data.tags && typeof data.tags !== 'string') data.tags = JSON.stringify(data.tags);

      if (columnNames.includes('updatedAt')) {
        data.updatedAt = Date.now();
      } else if (columnNames.includes('updated_at')) {
        data.updated_at = new Date().toISOString();
      }

      // Filter out keys that don't exist in the table schema
      const validKeys = Object.keys(data).filter(k => columnNames.includes(k) && k !== 'id');
      const validValues = validKeys.map(k => data[k]);
      
      if (validKeys.length === 0) {
        return res.json({ id: req.params.id });
      }

      const setClause = validKeys.map(k => `"${k}" = ?`).join(',');
      
      // Check if record exists
      const existing = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
      if (existing) {
        db.prepare(`UPDATE ${table} SET ${setClause} WHERE id = ?`).run([...validValues, req.params.id]);
      } else {
        // Insert if not exists (for settings/global)
        const insertKeys = ['id', ...validKeys];
        const insertValues = [req.params.id, ...validValues];
        const placeholders = insertKeys.map(() => '?').join(',');
        db.prepare(`INSERT INTO ${table} (${insertKeys.map(k => `"${k}"`).join(',')}) VALUES (${placeholders})`).run(insertValues);
      }
      res.json({ id: req.params.id, ...req.body });
    } catch (e: any) {
      console.error(`Error updating ${table}:`, e);
      res.status(500).json({ error: e.message });
    }
  });

  // DELETE
  app.delete(`/api/${table}/:id`, authenticateToken, (req, res) => {
    try {
      db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(req.params.id);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
