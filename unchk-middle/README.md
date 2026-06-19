# UNCHK Middle Tier — API REST

API REST sécurisée servant de couche intermédiaire entre le frontend Angular et la base de données PostgreSQL, pour la plateforme de gestion administrative et pédagogique de l'Université Cheikh Hamidou Kane (UNCHK).

## Stack technique

- Node.js 18+ / Express.js 4.x
- PostgreSQL 15
- JWT (jsonwebtoken) pour l'authentification stateless
- bcryptjs pour le hash des mots de passe
- express-validator pour la validation des entrées
- Swagger / OpenAPI 3.0 pour la documentation
- Winston pour les logs

## Prérequis

- Node.js >= 18
- PostgreSQL >= 15 installé et démarré

## Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Copier le fichier d'environnement
cp .env.example .env
# Puis éditer .env avec vos identifiants PostgreSQL

# 3. Créer la base de données
createdb unchk_db

# 4. Exécuter le script de création du schéma
psql -d unchk_db -f sql/01_schema.sql

# 5. Générer les données de démonstration (comptes + données de test)
node sql/seed.js

# 6. Démarrer le serveur
npm run dev    # mode développement avec nodemon
npm start      # mode production
```

L'API est accessible sur `http://localhost:3000`.
La documentation Swagger est sur `http://localhost:3000/api-docs`.

## Comptes de démonstration

Générés par `node sql/seed.js` :

| Rôle              | Email                  | Mot de passe   |
|-------------------|-------------------------|----------------|
| ADMIN             | admin@unchk.sn          | admin123       |
| ENSEIGNANT        | enseignant@unchk.sn     | prof123        |
| TUTEUR            | tuteur@unchk.sn         | tuteur123      |
| APPUI_INSERTION   | insertion@unchk.sn      | insertion123   |
| ETUDIANT          | etudiant@unchk.sn       | etudiant123    |

## Structure du projet

```
src/
├── config/         Configuration (base de données, Swagger, logger)
├── middleware/     Auth JWT, gestion erreurs, validation, upload fichiers
├── controllers/     Logique métier par module
├── validators/      Règles de validation express-validator
├── routes/          Définition des endpoints REST
├── utils/           Helpers (réponses HTTP, JWT, pagination)
└── server.js        Point d'entrée de l'application

sql/
├── 01_schema.sql    Script de création des 17 tables
├── 02_seed_demo.sql Exemple de seed SQL brut (hash factices)
└── seed.js          Script Node.js générant le seed avec vrais hash bcrypt
```

## Modules API disponibles

| Module          | Base URL                  | Description                                  |
|------------------|----------------------------|-----------------------------------------------|
| Auth             | `/api/auth`                | Login, logout, refresh, profil, mot de passe |
| Étudiants        | `/api/etudiants`           | Dossiers étudiants, notes, statistiques      |
| Formations       | `/api/formations`          | Formations, créneaux EDT, réunions           |
| Communication    | `/api/communication`       | Comptes rendus, circulaires, notifications   |
| Administration   | `/api/administration`      | Courriers, notes de service, budget, RH      |
| Insertion        | `/api/insertion`           | Partenaires, suivi, statistiques insertion   |
| Utilisateurs     | `/api/utilisateurs`        | Gestion des comptes utilisateurs             |

## Sécurité

- Authentification par JWT Bearer Token (expiration 24h)
- Sessions stockées et révocables en base (table `sessions_token`)
- Mots de passe hashés avec bcrypt (coût 12)
- RBAC (Role-Based Access Control) sur 8 rôles utilisateurs
- Rate limiting sur l'endpoint de login (5 tentatives/minute)
- CORS restreint aux origines autorisées
- Headers de sécurité via Helmet

## Format des réponses

Toutes les réponses suivent un format JSON standardisé :

```json
{
  "success": true,
  "message": "Succès",
  "data": { }
}
```

Pour les listes paginées :

```json
{
  "success": true,
  "data": [ ],
  "pagination": { "total": 50, "page": 1, "limit": 10, "totalPages": 5 }
}
```

## Healthcheck

```bash
curl http://localhost:3000/api/health
```

## Connexion avec le Frontend Angular

Dans le projet Angular, configurer l'URL de l'API dans l'environnement :

```typescript
// environment.ts
export const environment = {
  apiUrl: 'http://localhost:3000/api'
};
```

## Prochaines étapes

- Connexion au Backend Spring Boot (calculs complexes, exports PDF/Excel)
- Tests automatisés (Jest + Supertest)
- Déploiement (Docker, variables d'environnement de production)
