const router = require('express').Router();
const ctrl   = require('../controllers/administration.controller');
const { authenticate, isStaff } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { upload }   = require('../middleware/upload.middleware');

// Toutes les routes administration sont réservées au staff
router.use(authenticate, isStaff);

// ── Courriers ─────────────────────────────────────────────────────────────────
router.get('/courriers',          ctrl.getAllCourriers);
router.post('/courriers',         upload.single('fichier'), ctrl.createCourrier);
router.get('/courriers/:id',      ctrl.getOneCourrier);
router.put('/courriers/:id/statut', ctrl.updateCourrierStatut);

// ── Notes de service ──────────────────────────────────────────────────────────
router.get('/notes-service',      ctrl.getAllNotes);
router.post('/notes-service',     ctrl.createNote);

// ── Budget ────────────────────────────────────────────────────────────────────
router.get('/budget',             ctrl.getBudget);
router.post('/budget',            ctrl.createBudgetLigne);
router.put('/budget/:id',         ctrl.updateBudgetLigne);

// ── Personnel (RH) ────────────────────────────────────────────────────────────
router.get('/personnel',          ctrl.getPersonnel);
router.post('/personnel',         ctrl.createPersonnel);
router.put('/personnel/:id',      ctrl.updatePersonnel);

module.exports = router;
