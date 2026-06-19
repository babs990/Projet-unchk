const router = require('express').Router();
const ctrl   = require('../controllers/communication.controller');
const { authenticate, isStaff, isNotEtudiant, authorize, ROLES } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { upload }   = require('../middleware/upload.middleware');
const { crRules, circRules } = require('../validators/communication.validator');

router.use(authenticate);

// ── Comptes rendus ────────────────────────────────────────────────────────────
router.get('/comptes-rendus',       isNotEtudiant, ctrl.getAllCR);
router.post('/comptes-rendus',      authorize(ROLES.ADMIN, ROLES.ADMINISTRATIF, ROLES.ENSEIGNANT, ROLES.ENSEIGNANT_ASSOCIE, ROLES.RESPONSABLE_FORMATION),
                                    upload.single('fichier'), crRules, validate, ctrl.createCR);
router.get('/comptes-rendus/:id',   isNotEtudiant, ctrl.getOneCR);
router.put('/comptes-rendus/:id',   authorize(ROLES.ADMIN, ROLES.ADMINISTRATIF, ROLES.ENSEIGNANT),
                                    upload.single('fichier'), ctrl.updateCR);
router.delete('/comptes-rendus/:id',isStaff, ctrl.removeCR);

// ── Circulaires ───────────────────────────────────────────────────────────────
router.get('/circulaires',          isNotEtudiant, ctrl.getAllCirc);
router.post('/circulaires',         isStaff, upload.single('fichier'), circRules, validate, ctrl.createCirc);
router.get('/circulaires/:id',      isNotEtudiant, ctrl.getOneCirc);

// ── Notifications ─────────────────────────────────────────────────────────────
router.get('/notifications',        ctrl.getNotifications);
router.put('/notifications/:id/lu', ctrl.markAsRead);
router.put('/notifications/lu-tout',ctrl.markAllRead);

module.exports = router;
