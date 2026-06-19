const router  = require('express').Router();
const rateLimit = require('express-rate-limit');
const ctrl    = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate }     = require('../middleware/validate.middleware');
const { loginRules, changePasswordRules } = require('../validators/auth.validator');

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max:      parseInt(process.env.LOGIN_RATE_LIMIT_MAX) || 5,
  message:  { success: false, message: 'Trop de tentatives. Réessayez dans 1 minute.' },
  standardHeaders: true,
  legacyHeaders:   false,
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:    { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Connexion réussie }
 *       401: { description: Identifiants incorrects }
 */
router.post('/login',   loginLimiter, loginRules, validate, ctrl.login);
router.post('/logout',  authenticate, ctrl.logout);
router.post('/refresh', ctrl.refresh);
router.get('/me',       authenticate, ctrl.me);
router.put('/password', authenticate, changePasswordRules, validate, ctrl.changePassword);

module.exports = router;
