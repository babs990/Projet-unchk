const router = require('express').Router();
const ctrl   = require('../controllers/insertion.controller');
const { authenticate, isStaff, authorize, ROLES } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { partenaireRules, suiviRules } = require('../validators/insertion.validator');

router.use(authenticate);

// ── Partenaires (tout le monde connecté peut voir) ────────────────────────────
router.get('/partenaires',          ctrl.getAllPartenaires);
router.get('/partenaires/:id',      ctrl.getOnePartenaire);
router.post('/partenaires',         authorize(ROLES.ADMIN, ROLES.ADMINISTRATIF, ROLES.APPUI_INSERTION),
                                    partenaireRules, validate, ctrl.createPartenaire);
router.put('/partenaires/:id',      authorize(ROLES.ADMIN, ROLES.ADMINISTRATIF, ROLES.APPUI_INSERTION),
                                    ctrl.updatePartenaire);
router.delete('/partenaires/:id',   isStaff, ctrl.removePartenaire);

// ── Suivi insertion ───────────────────────────────────────────────────────────
router.get('/suivi',                ctrl.getAllSuivi);          // filtré par rôle dans le controller
router.post('/suivi',               authorize(ROLES.ADMIN, ROLES.ADMINISTRATIF, ROLES.APPUI_INSERTION),
                                    suiviRules, validate, ctrl.createSuivi);
router.put('/suivi/:id',            authorize(ROLES.ADMIN, ROLES.ADMINISTRATIF, ROLES.APPUI_INSERTION),
                                    ctrl.updateSuivi);

// ── Statistiques ──────────────────────────────────────────────────────────────
router.get('/statistiques',         authorize(ROLES.ADMIN, ROLES.ADMINISTRATIF, ROLES.APPUI_INSERTION),
                                    ctrl.getStatistiques);

module.exports = router;
