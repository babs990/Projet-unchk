const router = require('express').Router();
const ctrl   = require('../controllers/utilisateurs.controller');
const { authenticate, isStaff } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

router.use(authenticate);

// ── Liste utilisateurs (staff only) ───────────────────────────────────────────
router.get('/',    isStaff, ctrl.getAll);

// ── Détail / modification (soi-même ou admin) ─────────────────────────────────
router.get('/:id', ctrl.getOne);
router.put('/:id', upload.single('avatar'), ctrl.update);

// ── Activer / désactiver un compte (admin only) ───────────────────────────────
router.put('/:id/actif', isStaff, ctrl.toggleActif);

module.exports = router;
