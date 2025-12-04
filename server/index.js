import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public folder
app.use('/images', express.static(path.join(__dirname, '../public/images')));
app.use('/documents', express.static(path.join(__dirname, '../public/documents')));

// Data file path
const DATA_FILE = path.join(__dirname, '../data/content.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure public/images subdirectories exist
const imageDirs = ['gallery', 'hero', 'news', 'team', 'ouderwerkgroep'];
imageDirs.forEach(dir => {
  const dirPath = path.join(__dirname, '../public/images', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Ensure documents directory exists
const documentsDir = path.join(__dirname, '../public/documents');
if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
}

// Initialize data file if it doesn't exist
const initializeDataFile = () => {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      config: {
        menuUrl: 'https://order.hanssens.be/menu/O56/OUDE-VESTIGING',
        homeHeroImage: '/images/hero/school-main.jpeg',
        homeHeroPosition: 'center center',
        homeTitle: 'Samen groeien,\nelk op zijn eigen ritme',
        homeSubtitle: 'Vrije Basisschool Sijsele',
        aboutText: 'In VBS Sint-Maarten staat het kind centraal. Wij geloven in onderwijs dat niet alleen kennis overdraagt, maar ook werkt aan de totale persoonlijkheidsontwikkeling.',
        contactEmail: 'info@vrijebasisschoolsijsele.be',
        contactAddress: 'Kloosterstraat 4a, 8340 Sijsele',
        contactPhoneKloosterstraat: '050 36 32 25',
        contactPhoneHovingenlaan: '050 36 09 71',
        contactPhoneGSM: '0496 23 57 01'
      },
      heroImages: [
        '/images/hero/school-main.jpeg',
        '/images/hero/school-building.jpeg',
        '/images/hero/school-kids.jpeg'
      ],
      news: [],
      events: [],
      albums: [],
      team: [],
      ouderwerkgroep: [],
      submissions: [],
      downloads: [],
      enrollments: [],
      pages: [
        { id: 'home', name: 'Home', slug: 'home', active: true, order: 0, type: 'system' },
        { id: 'about', name: 'Onze School', slug: 'about', active: true, order: 1, type: 'system' },
        { id: 'enroll', name: 'Inschrijven', slug: 'enroll', active: true, order: 2, type: 'system' },
        { id: 'news', name: 'Nieuws', slug: 'news', active: true, order: 3, type: 'system' },
        { id: 'calendar', name: 'Agenda', slug: 'calendar', active: true, order: 4, type: 'system' },
        { id: 'info', name: 'Info', slug: 'info', active: true, order: 5, type: 'system' },
        { id: 'ouderwerkgroep', name: 'Ouderwerkgroep', slug: 'ouderwerkgroep', active: true, order: 6, type: 'system' },
        { id: 'gallery', name: "Foto's", slug: 'gallery', active: true, order: 7, type: 'system' },
        { id: 'contact', name: 'Contact', slug: 'contact', active: true, order: 8, type: 'system' },
      ]
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
  }
};

initializeDataFile();

// Ensure enrollments array exists in existing data files
const ensureEnrollmentsArray = () => {
  try {
    const data = readData();
    if (!data.enrollments) {
      data.enrollments = [];
      writeData(data);
      console.log('✅ Enrollments array toegevoegd aan data bestand');
    }
  } catch (error) {
    console.error('Fout bij toevoegen enrollments array:', error);
  }
};

ensureEnrollmentsArray();

// Helper functions
const readData = () => {
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(data);
};

const writeData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = req.params.category || 'gallery';
    const uploadPath = path.join(__dirname, '../public/images', category);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Alleen afbeeldingen zijn toegestaan!'));
    }
  }
});

// ============ API ROUTES ============

// Get all data
app.get('/api/data', (req, res) => {
  try {
    const data = readData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Fout bij ophalen data' });
  }
});

// ============ CONFIG ROUTES ============
app.get('/api/config', (req, res) => {
  try {
    const data = readData();
    res.json(data.config);
  } catch (error) {
    res.status(500).json({ error: 'Fout bij ophalen configuratie' });
  }
});

app.put('/api/config', (req, res) => {
  try {
    const data = readData();
    data.config = { ...data.config, ...req.body };
    writeData(data);
    res.json({ success: true, config: data.config });
  } catch (error) {
    res.status(500).json({ error: 'Fout bij opslaan configuratie' });
  }
});

// ============ HERO IMAGES ROUTES ============
app.get('/api/hero-images', (req, res) => {
  try {
    const data = readData();
    res.json(data.heroImages);
  } catch (error) {
    res.status(500).json({ error: 'Fout bij ophalen hero afbeeldingen' });
  }
});

app.post('/api/hero-images', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Geen bestand geüpload' });
    }
    const imagePath = `/images/hero/${req.file.filename}`;
    const data = readData();
    data.heroImages.push(imagePath);
    writeData(data);
    res.json({ success: true, path: imagePath });
  } catch (error) {
    res.status(500).json({ error: 'Fout bij uploaden afbeelding' });
  }
});

app.delete('/api/hero-images/:index', (req, res) => {
  try {
    const data = readData();
    const index = parseInt(req.params.index);
    if (index >= 0 && index < data.heroImages.length) {
      const imagePath = data.heroImages[index];
      // Delete file from disk
      const fullPath = path.join(__dirname, '../public', imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
      data.heroImages.splice(index, 1);
      writeData(data);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Afbeelding niet gevonden' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Fout bij verwijderen afbeelding' });
  }
});

// ============ NEWS ROUTES ============
app.get('/api/news', (req, res) => {
  try {
    const data = readData();
    res.json(data.news);
  } catch (error) {
    res.status(500).json({ error: 'Fout bij ophalen nieuws' });
  }
});

app.post('/api/news', (req, res) => {
  try {
    const data = readData();
    const newItem = {
      id: Date.now().toString(),
      ...req.body,
      date: req.body.date || new Date().toISOString().split('T')[0]
    };
    data.news.unshift(newItem);
    writeData(data);
    res.json({ success: true, item: newItem });
  } catch (error) {
    res.status(500).json({ error: 'Fout bij toevoegen nieuws' });
  }
});

app.put('/api/news/:id', (req, res) => {
  try {
    const data = readData();
    const index = data.news.findIndex(n => n.id === req.params.id);
    if (index !== -1) {
      data.news[index] = { ...data.news[index], ...req.body };
      writeData(data);
      res.json({ success: true, item: data.news[index] });
    } else {
      res.status(404).json({ error: 'Nieuws niet gevonden' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Fout bij bijwerken nieuws' });
  }
});

app.delete('/api/news/:id', (req, res) => {
  try {
    const data = readData();
    const index = data.news.findIndex(n => n.id === req.params.id);
    if (index !== -1) {
      data.news.splice(index, 1);
      writeData(data);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Nieuws niet gevonden' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Fout bij verwijderen nieuws' });
  }
});

// ============ EVENTS ROUTES ============
app.get('/api/events', (req, res) => {
  try {
    const data = readData();
    res.json(data.events);
  } catch (error) {
    res.status(500).json({ error: 'Fout bij ophalen evenementen' });
  }
});

app.post('/api/events', (req, res) => {
  try {
    const data = readData();
    const newEvent = {
      id: Date.now().toString(),
      ...req.body
    };
    data.events.push(newEvent);
    writeData(data);
    res.json({ success: true, item: newEvent });
  } catch (error) {
    res.status(500).json({ error: 'Fout bij toevoegen evenement' });
  }
});

app.put('/api/events/:id', (req, res) => {
  try {
    const data = readData();
    const index = data.events.findIndex(e => e.id === req.params.id);
    if (index !== -1) {
      data.events[index] = { ...data.events[index], ...req.body };
      writeData(data);
      res.json({ success: true, item: data.events[index] });
    } else {
      res.status(404).json({ error: 'Evenement niet gevonden' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Fout bij bijwerken evenement' });
  }
});

app.delete('/api/events/:id', (req, res) => {
  try {
    const data = readData();
    const index = data.events.findIndex(e => e.id === req.params.id);
    if (index !== -1) {
      data.events.splice(index, 1);
      writeData(data);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Evenement niet gevonden' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Fout bij verwijderen evenement' });
  }
});

// ============ ALBUMS ROUTES ============
app.get('/api/albums', (req, res) => {
  try {
    const data = readData();
    res.json(data.albums);
  } catch (error) {
    res.status(500).json({ error: 'Fout bij ophalen albums' });
  }
});

app.post('/api/albums', (req, res) => {
  try {
    const data = readData();
    const newAlbum = {
      id: Date.now().toString(),
      images: [],
      createdDate: new Date().toISOString().split('T')[0],
      ...req.body
    };
    data.albums.push(newAlbum);
    writeData(data);
    res.json({ success: true, item: newAlbum });
  } catch (error) {
    res.status(500).json({ error: 'Fout bij toevoegen album' });
  }
});

app.put('/api/albums/:id', (req, res) => {
  try {
    const data = readData();
    const index = data.albums.findIndex(a => a.id === req.params.id);
    if (index !== -1) {
      data.albums[index] = { ...data.albums[index], ...req.body };
      writeData(data);
      res.json({ success: true, item: data.albums[index] });
    } else {
      res.status(404).json({ error: 'Album niet gevonden' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Fout bij bijwerken album' });
  }
});

app.delete('/api/albums/:id', (req, res) => {
  try {
    const data = readData();
    const index = data.albums.findIndex(a => a.id === req.params.id);
    if (index !== -1) {
      // Delete all images in album
      const album = data.albums[index];
      album.images.forEach(img => {
        const fullPath = path.join(__dirname, '../public', img);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
      data.albums.splice(index, 1);
      writeData(data);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Album niet gevonden' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Fout bij verwijderen album' });
  }
});

// Add image to album
app.post('/api/albums/:id/images', upload.array('images', 20), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Geen bestanden geüpload' });
    }
    const data = readData();
    const album = data.albums.find(a => a.id === req.params.id);
    if (!album) {
      return res.status(404).json({ error: 'Album niet gevonden' });
    }
    const newImages = req.files.map(f => `/images/gallery/${f.filename}`);
    album.images.push(...newImages);
    if (!album.coverImage && newImages.length > 0) {
      album.coverImage = newImages[0];
    }
    writeData(data);
    res.json({ success: true, images: newImages });
  } catch (error) {
    res.status(500).json({ error: 'Fout bij uploaden afbeeldingen' });
  }
});

// Delete image from album
app.delete('/api/albums/:albumId/images/:imageIndex', (req, res) => {
  try {
    const data = readData();
    const album = data.albums.find(a => a.id === req.params.albumId);
    if (!album) {
      return res.status(404).json({ error: 'Album niet gevonden' });
    }
    const imageIndex = parseInt(req.params.imageIndex);
    if (imageIndex >= 0 && imageIndex < album.images.length) {
      const imagePath = album.images[imageIndex];
      const fullPath = path.join(__dirname, '../public', imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
      album.images.splice(imageIndex, 1);
      writeData(data);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Afbeelding niet gevonden' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Fout bij verwijderen afbeelding' });
  }
});

// ============ TEAM ROUTES ============
app.get('/api/team', (req, res) => {
  try {
    const data = readData();
    res.json(data.team);
  } catch (error) {
    res.status(500).json({ error: 'Fout bij ophalen team' });
  }
});

app.post('/api/team', (req, res) => {
  try {
    const data = readData();
    const newMember = {
      id: Date.now().toString(),
      ...req.body
    };
    data.team.push(newMember);
    writeData(data);
    res.json({ success: true, item: newMember });
  } catch (error) {
    res.status(500).json({ error: 'Fout bij toevoegen teamlid' });
  }
});

app.put('/api/team/:id', (req, res) => {
  try {
    const data = readData();
    const index = data.team.findIndex(t => t.id === req.params.id);
    if (index !== -1) {
      data.team[index] = { ...data.team[index], ...req.body };
      writeData(data);
      res.json({ success: true, item: data.team[index] });
    } else {
      res.status(404).json({ error: 'Teamlid niet gevonden' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Fout bij bijwerken teamlid' });
  }
});

app.delete('/api/team/:id', (req, res) => {
  try {
    const data = readData();
    const index = data.team.findIndex(t => t.id === req.params.id);
    if (index !== -1) {
      const member = data.team[index];
      if (member.imageUrl && member.imageUrl.startsWith('/images/')) {
        const fullPath = path.join(__dirname, '../public', member.imageUrl);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
      data.team.splice(index, 1);
      writeData(data);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Teamlid niet gevonden' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Fout bij verwijderen teamlid' });
  }
});

// Upload team member image
app.post('/api/team/:id/image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Geen bestand geüpload' });
    }
    const data = readData();
    const member = data.team.find(t => t.id === req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Teamlid niet gevonden' });
    }
    // Delete old image if exists
    if (member.imageUrl && member.imageUrl.startsWith('/images/')) {
      const oldPath = path.join(__dirname, '../public', member.imageUrl);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    member.imageUrl = `/images/team/${req.file.filename}`;
    writeData(data);
    res.json({ success: true, path: member.imageUrl });
  } catch (error) {
    res.status(500).json({ error: 'Fout bij uploaden afbeelding' });
  }
});

// ============ OUDERWERKGROEP ROUTES ============
app.get('/api/ouderwerkgroep', (req, res) => {
  try {
    const data = readData();
    res.json(data.ouderwerkgroep);
  } catch (error) {
    res.status(500).json({ error: 'Fout bij ophalen ouderwerkgroep' });
  }
});

app.post('/api/ouderwerkgroep', (req, res) => {
  try {
    const data = readData();
    const newActivity = {
      id: Date.now().toString(),
      ...req.body
    };
    data.ouderwerkgroep.push(newActivity);
    writeData(data);
    res.json({ success: true, item: newActivity });
  } catch (error) {
    res.status(500).json({ error: 'Fout bij toevoegen activiteit' });
  }
});

app.put('/api/ouderwerkgroep/:id', (req, res) => {
  try {
    const data = readData();
    const index = data.ouderwerkgroep.findIndex(o => o.id === req.params.id);
    if (index !== -1) {
      data.ouderwerkgroep[index] = { ...data.ouderwerkgroep[index], ...req.body };
      writeData(data);
      res.json({ success: true, item: data.ouderwerkgroep[index] });
    } else {
      res.status(404).json({ error: 'Activiteit niet gevonden' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Fout bij bijwerken activiteit' });
  }
});

app.delete('/api/ouderwerkgroep/:id', (req, res) => {
  try {
    const data = readData();
    const index = data.ouderwerkgroep.findIndex(o => o.id === req.params.id);
    if (index !== -1) {
      const activity = data.ouderwerkgroep[index];
      if (activity.image && activity.image.startsWith('/images/')) {
        const fullPath = path.join(__dirname, '../public', activity.image);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
      data.ouderwerkgroep.splice(index, 1);
      writeData(data);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Activiteit niet gevonden' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Fout bij verwijderen activiteit' });
  }
});

// Upload ouderwerkgroep activity image
app.post('/api/ouderwerkgroep/:id/image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Geen bestand geüpload' });
    }
    const data = readData();
    const activity = data.ouderwerkgroep.find(o => o.id === req.params.id);
    if (!activity) {
      return res.status(404).json({ error: 'Activiteit niet gevonden' });
    }
    // Delete old image if exists
    if (activity.image && activity.image.startsWith('/images/')) {
      const oldPath = path.join(__dirname, '../public', activity.image);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    activity.image = `/images/ouderwerkgroep/${req.file.filename}`;
    writeData(data);
    res.json({ success: true, path: activity.image });
  } catch (error) {
    res.status(500).json({ error: 'Fout bij uploaden afbeelding' });
  }
});

// ============ SUBMISSIONS ROUTES ============
app.get('/api/submissions', (req, res) => {
  try {
    const data = readData();
    res.json(data.submissions);
  } catch (error) {
    res.status(500).json({ error: 'Fout bij ophalen inzendingen' });
  }
});

app.post('/api/submissions', (req, res) => {
  try {
    const data = readData();
    const newSubmission = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      status: 'Nieuw',
      ...req.body
    };
    data.submissions.unshift(newSubmission);
    writeData(data);
    res.json({ success: true, item: newSubmission });
  } catch (error) {
    res.status(500).json({ error: 'Fout bij toevoegen inzending' });
  }
});

app.put('/api/submissions/:id', (req, res) => {
  try {
    const data = readData();
    const index = data.submissions.findIndex(s => s.id === req.params.id);
    if (index !== -1) {
      data.submissions[index] = { ...data.submissions[index], ...req.body };
      writeData(data);
      res.json({ success: true, item: data.submissions[index] });
    } else {
      res.status(404).json({ error: 'Inzending niet gevonden' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Fout bij bijwerken inzending' });
  }
});

app.delete('/api/submissions/:id', (req, res) => {
  try {
    const data = readData();
    const index = data.submissions.findIndex(s => s.id === req.params.id);
    if (index !== -1) {
      data.submissions.splice(index, 1);
      writeData(data);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Inzending niet gevonden' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Fout bij verwijderen inzending' });
  }
});

// ============ PAGES ROUTES ============
app.get('/api/pages', (req, res) => {
  try {
    const data = readData();
    res.json(data.pages || []);
  } catch (error) {
    res.status(500).json({ error: 'Fout bij ophalen paginas' });
  }
});

app.put('/api/pages', (req, res) => {
  try {
    const data = readData();
    data.pages = req.body;
    writeData(data);
    res.json({ success: true, pages: data.pages });
  } catch (error) {
    res.status(500).json({ error: 'Fout bij opslaan paginas' });
  }
});

// ============ GENERIC IMAGE UPLOAD ============
app.post('/api/upload/:category', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Geen bestand geüpload' });
    }
    const category = req.params.category;
    const imagePath = `/images/${category}/${req.file.filename}`;
    res.json({ success: true, path: imagePath });
  } catch (error) {
    res.status(500).json({ error: 'Fout bij uploaden afbeelding' });
  }
});

// ============ DOCUMENT UPLOAD CONFIG ============
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../public/documents');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const documentUpload = multer({
  storage: documentStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit for documents
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|xls|xlsx|ppt|pptx|ics/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      cb(null, true);
    } else {
      cb(new Error('Alleen documenten (PDF, Word, Excel, PowerPoint, ICS) zijn toegestaan!'));
    }
  }
});

// ============ DOWNLOADS ROUTES ============
app.get('/api/downloads', (req, res) => {
  try {
    const data = readData();
    res.json(data.downloads || []);
  } catch (error) {
    res.status(500).json({ error: 'Fout bij ophalen downloads' });
  }
});

app.post('/api/downloads', documentUpload.single('document'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Geen bestand geüpload' });
    }
    const data = readData();
    if (!data.downloads) data.downloads = [];
    
    const newDownload = {
      id: Date.now().toString(),
      title: req.body.title || req.file.originalname,
      filename: req.file.filename,
      originalName: req.file.originalname,
      uploadDate: new Date().toISOString().split('T')[0]
    };
    
    data.downloads.push(newDownload);
    writeData(data);
    res.json({ success: true, item: newDownload });
  } catch (error) {
    res.status(500).json({ error: 'Fout bij uploaden document' });
  }
});

app.delete('/api/downloads/:id', (req, res) => {
  try {
    const data = readData();
    if (!data.downloads) data.downloads = [];
    
    const index = data.downloads.findIndex(d => d.id === req.params.id);
    if (index !== -1) {
      const download = data.downloads[index];
      // Delete file from disk
      const fullPath = path.join(__dirname, '../public/documents', download.filename);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
      data.downloads.splice(index, 1);
      writeData(data);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Document niet gevonden' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Fout bij verwijderen document' });
  }
});

// ============ ENROLLMENTS ROUTES ============
app.get('/api/enrollments', (req, res) => {
  try {
    const data = readData();
    res.json(data.enrollments || []);
  } catch (error) {
    res.status(500).json({ error: 'Fout bij ophalen inschrijvingen' });
  }
});

app.post('/api/enrollments', (req, res) => {
  try {
    const data = readData();
    if (!data.enrollments) data.enrollments = [];
    
    const newEnrollment = {
      id: Date.now().toString(),
      submittedAt: new Date().toISOString(),
      status: 'nieuw',
      ...req.body
    };
    
    data.enrollments.unshift(newEnrollment);
    writeData(data);
    res.json({ success: true, item: newEnrollment });
  } catch (error) {
    res.status(500).json({ error: 'Fout bij opslaan inschrijving' });
  }
});

app.get('/api/enrollments/:id', (req, res) => {
  try {
    const data = readData();
    if (!data.enrollments) data.enrollments = [];
    
    const enrollment = data.enrollments.find(e => e.id === req.params.id);
    if (enrollment) {
      res.json(enrollment);
    } else {
      res.status(404).json({ error: 'Inschrijving niet gevonden' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Fout bij ophalen inschrijving' });
  }
});

app.put('/api/enrollments/:id', (req, res) => {
  try {
    const data = readData();
    if (!data.enrollments) data.enrollments = [];
    
    const index = data.enrollments.findIndex(e => e.id === req.params.id);
    if (index !== -1) {
      data.enrollments[index] = { ...data.enrollments[index], ...req.body };
      writeData(data);
      res.json({ success: true, item: data.enrollments[index] });
    } else {
      res.status(404).json({ error: 'Inschrijving niet gevonden' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Fout bij bijwerken inschrijving' });
  }
});

app.delete('/api/enrollments/:id', (req, res) => {
  try {
    const data = readData();
    if (!data.enrollments) data.enrollments = [];
    
    const index = data.enrollments.findIndex(e => e.id === req.params.id);
    if (index !== -1) {
      data.enrollments.splice(index, 1);
      writeData(data);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Inschrijving niet gevonden' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Fout bij verwijderen inschrijving' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server draait op http://localhost:${PORT}`);
  console.log(`📁 Afbeeldingen worden opgeslagen in /public/images`);
  console.log(`💾 Data wordt opgeslagen in /data/content.json`);
});

