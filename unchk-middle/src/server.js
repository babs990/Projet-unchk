require('dotenv').config();

const express      = require('express');
const helmet       = require('helmet');
const cors         = require('cors');
const morgan       = require('morgan');
const path         = require('path');
const fs           = require('fs');
const swaggerUi    = require('swagger-ui-express');

const swaggerSpec  = require('./config/swagger');
const logger       = require('./config/logger');
const { pool }     = require('./config/database');
const { errorHandler, notFound } = require('./middleware/error.middleware');

// ── Routes ─────────────────────────────────────────────────────────────────
const authRoutes           = require('./routes/auth.routes');
const etudiantsRoutes      = require('./routes/etudiants.routes');
const formationsRoutes     = require('./routes/formations.routes');
const communicationRoutes  = require('./routes/communication.routes');
const administrationRoutes = require('./routes/administration.routes');
const insertionRoutes      = require('./routes/insertion.routes');
const utilisateursRoutes   = require('./routes/utilisateurs.routes');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Dossiers requis ────────────────────────────────────────────────────────
['logs', process.env.UPLOAD_DIR || 'uploads'].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ── Sécurité ───────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // pour servir les fichiers uploadés
}));

// ── CORS ───────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:4200')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origine non autorisée par CORS : ${origin}`));
    }
  },
  credentials: true,
}));

// ── Parsing ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Logs HTTP ──────────────────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
  stream: { write: (msg) => logger.info(msg.trim()) },
}));

// ── Fichiers statiques (documents/images uploadés) ────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')));

// ── Documentation Swagger ──────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'UNCHK API — Documentation',
}));

// ── Healthcheck ────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ success: true, message: 'API opérationnelle', db: 'connectée', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ success: false, message: 'Base de données indisponible' });
  }
});

// ── Montage des routes ─────────────────────────────────────────────────────
app.use('/api/auth',           authRoutes);
app.use('/api/etudiants',      etudiantsRoutes);
app.use('/api/formations',     formationsRoutes);
app.use('/api/communication',  communicationRoutes);
app.use('/api/administration', administrationRoutes);
app.use('/api/insertion',      insertionRoutes);
app.use('/api/utilisateurs',   utilisateursRoutes);

// ── 404 et erreurs globales ────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Démarrage ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`🚀 API UNCHK démarrée sur le port ${PORT}`);
  logger.info(`📚 Documentation Swagger : http://localhost:${PORT}/api-docs`);
  logger.info(`🌍 Environnement : ${process.env.NODE_ENV || 'development'}`);
});

// ── Arrêt propre ───────────────────────────────────────────────────────────
process.on('SIGTERM', async () => {
  logger.info('SIGTERM reçu, fermeture du serveur...');
  await pool.end();
  process.exit(0);
});

module.exports = app;
