const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title:       'UNCHK API REST',
      version:     '1.0.0',
      description: 'API Middle Tier — Plateforme de Gestion Administrative et Pédagogique UNCHK',
      contact: {
        name:  'UNCHK Support',
        email: 'support@unchk.edu.sn',
      },
    },
    servers: [
      { url: 'http://localhost:3000/api', description: 'Développement' },
      { url: 'https://api.unchk.edu.sn/api', description: 'Production' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type:         'http',
          scheme:       'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string'  },
            errors:  { type: 'array', items: { type: 'object' } },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string'  },
            data:    { type: 'object'  },
          },
        },
        Utilisateur: {
          type: 'object',
          properties: {
            id:       { type: 'integer' },
            nom:      { type: 'string'  },
            prenom:   { type: 'string'  },
            email:    { type: 'string'  },
            role:     { type: 'string', enum: ['ADMIN','ADMINISTRATIF','ENSEIGNANT','ENSEIGNANT_ASSOCIE','RESPONSABLE_FORMATION','TUTEUR','ETUDIANT','APPUI_INSERTION'] },
            telephone:{ type: 'string'  },
            actif:    { type: 'boolean' },
          },
        },
        Etudiant: {
          type: 'object',
          properties: {
            id:             { type: 'integer' },
            ine:            { type: 'string'  },
            nom:            { type: 'string'  },
            prenom:         { type: 'string'  },
            date_naissance: { type: 'string', format: 'date' },
            lieu_naissance: { type: 'string'  },
            sexe:           { type: 'string', enum: ['M','F'] },
            formation_id:   { type: 'integer' },
            promo:          { type: 'string'  },
            statut:         { type: 'string', enum: ['actif','diplome','abandonne','suspendu'] },
            moyenne:        { type: 'number'  },
          },
        },
        Note: {
          type: 'object',
          properties: {
            id:           { type: 'integer' },
            etudiant_id:  { type: 'integer' },
            matiere:      { type: 'string'  },
            note:         { type: 'number'  },
            credit:       { type: 'integer' },
            semestre:     { type: 'string'  },
            enseignant_id:{ type: 'integer' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
