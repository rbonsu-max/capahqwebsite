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
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import sharp from 'sharp';

// Load environment variables
dotenv.config();

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (to: string, subject: string, html: string) => {
  if (!process.env.SMTP_HOST) {
    console.log('SMTP not configured. Email would have been sent to:', to);
    console.log('Subject:', subject);
    console.log('Content:', html);
    return;
  }
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"CAPA HQ" <noreply@capahq.org>',
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
  process.exit(1);
}

const DEFAULT_JWT_SECRET = 'your-secret-key-change-this-in-production';
const finalJwtSecret = JWT_SECRET || DEFAULT_JWT_SECRET;

// Database setup
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'data', 'database.sqlite');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

console.log(`Using database at: ${dbPath}`);
const db = new Database(dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    mustChangePassword INTEGER DEFAULT 0,
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
  CREATE TABLE IF NOT EXISTS programs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    link TEXT,
    order_index INTEGER DEFAULT 0,
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
  'ALTER TABLE thematic_areas ADD COLUMN createdAt INTEGER',
  'ALTER TABLE admins ADD COLUMN role TEXT DEFAULT "admin"',
  'ALTER TABLE admins ADD COLUMN mustChangePassword INTEGER DEFAULT 0'
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
  db.prepare('INSERT INTO admins (id, email, password, role, mustChangePassword, createdAt) VALUES (?, ?, ?, ?, ?, ?)').run('default-admin', 'youroger1@gmail.com', hash, 'super_admin', 0, Date.now());
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

// Simple request logger
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  }
  next();
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use('/api', limiter);

// Uploads setup
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
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

  jwt.verify(token, finalJwtSecret, (err: any, user: any) => {
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
    const token = jwt.sign({ 
      email: user.email, 
      role: user.role,
      mustChangePassword: user.mustChangePassword 
    }, finalJwtSecret, { expiresIn: '24h' });
    res.json({ 
      token, 
      email: user.email, 
      role: user.role,
      mustChangePassword: !!user.mustChangePassword 
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/auth/change-password', authenticateToken, (req: any, res) => {
  const { currentPassword, newPassword } = req.body;
  const user: any = db.prepare('SELECT * FROM admins WHERE email = ?').get(req.user.email);

  if (user && bcrypt.compareSync(currentPassword, user.password)) {
    const hash = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE admins SET password = ?, mustChangePassword = 0 WHERE email = ?').run(hash, req.user.email);
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Invalid current password' });
  }
});

app.post('/api/auth/reset-password', authenticateToken, (req: any, res) => {
  // Only super admin can reset passwords
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { userId, newPassword } = req.body;
  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE admins SET password = ?, mustChangePassword = 1 WHERE id = ?').run(hash, userId);
  res.json({ success: true });
});

app.get('/api/auth/me', authenticateToken, (req: any, res) => {
  const user: any = db.prepare('SELECT email, role, mustChangePassword FROM admins WHERE email = ?').get(req.user.email);
  if (user) {
    res.json({ 
      email: user.email, 
      role: user.role, 
      mustChangePassword: !!user.mustChangePassword 
    });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.post('/api/upload', authenticateToken, (req, res) => {
  upload.single('file')(req, res, async (err) => {
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

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    const isImage = ['.jpg', '.jpeg', '.png', '.webp'].includes(fileExt);

    if (isImage) {
      try {
        const optimizedFilename = `opt-${req.file.filename.split('.')[0]}.webp`;
        const optimizedPath = path.join(uploadsDir, optimizedFilename);
        
        await sharp(filePath)
          .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(optimizedPath);
        
        // Remove original file
        fs.unlinkSync(filePath);
        
        return res.json({ url: `/uploads/${optimizedFilename}` });
      } catch (error) {
        console.error('Image optimization error:', error);
        // Fallback to original if optimization fails
      }
    }
    
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  });
});

app.post('/api/gallery/bulk', authenticateToken, (req, res) => {
  const { images, title, category, date } = req.body;
  if (!images || !Array.isArray(images)) {
    return res.status(400).json({ error: 'Images array is required' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO gallery (id, title, image_url, category, date, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction((items) => {
      for (const imageUrl of items) {
        const id = (Date.now() + Math.random()).toString();
        stmt.run(id, title, imageUrl, category, date, new Date().toISOString());
      }
    });

    transaction(images);
    res.json({ success: true, count: images.length });
  } catch (e: any) {
    console.error('Bulk gallery upload error:', e);
    res.status(500).json({ error: e.message });
  }
});

// Generic CRUD routes
const tables = ['news', 'hero_slides', 'partners', 'provinces', 'resources', 'thematic_areas', 'admins', 'settings', 'staff', 'leadership', 'gallery', 'programs'];

tables.forEach(table => {
  // GET all
  app.get(`/api/${table}`, (req, res) => {
    let orderBy = 'createdAt DESC';
    if (table === 'hero_slides' || table === 'thematic_areas' || table === 'staff' || table === 'leadership' || table === 'programs') orderBy = 'orderIndex ASC';
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
  app.post(`/api/${table}`, authenticateToken, async (req, res) => {
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

      let plainPassword = '';
      if (table === 'admins') {
        if (!data.password) {
          // Generate a random password if not provided
          plainPassword = Math.random().toString(36).slice(-8);
          data.password = plainPassword;
        } else {
          plainPassword = data.password;
        }
        data.password = bcrypt.hashSync(data.password, 10);
        data.mustChangePassword = 1; // Require password change on first login
      }

      if (data.coordinates && typeof data.coordinates !== 'string') data.coordinates = JSON.stringify(data.coordinates);
      if (data.tags && typeof data.tags !== 'string') data.tags = JSON.stringify(data.tags);

      // Filter out keys that don't exist in the table schema
      const validKeys = Object.keys(data).filter(k => columnNames.includes(k));
      const validValues = validKeys.map(k => data[k]);
      const placeholders = validKeys.map(() => '?').join(',');
      
      db.prepare(`INSERT INTO ${table} (${validKeys.map(k => `"${k}"`).join(',')}) VALUES (${placeholders})`).run(validValues);
      
      const responseData = { id, ...req.body };
      if (table === 'admins' && plainPassword) {
        responseData.password = plainPassword;
      }
      res.json(responseData);
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

