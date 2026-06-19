# UNCHK Backend — Service de génération de documents PDF

Service Spring Boot **stateless** dédié à la génération de documents PDF
pour la plateforme UNCHK : bulletins de notes, relevés de notes,
courriers administratifs et notes de service.

## Rôle dans l'architecture 3-tiers

```
Angular  →  Middle Tier Express.js  →  Backend Spring Boot (ce service)
                    │                          │
                    │                          └── Génère le PDF, le renvoie
                    │                              en binaire (pas d'accès BDD)
                    │
                    └── Accès PostgreSQL, auth JWT, CRUD, RBAC
```

Ce service **n'a aucun accès direct à PostgreSQL**. Il reçoit en JSON,
depuis le Middle Tier, toutes les données nécessaires à la génération
(étudiant, notes, courrier, note de service), produit le PDF avec
OpenPDF, et le renvoie en `application/pdf`.

## Stack technique

- Java 17 / Spring Boot 3.3
- OpenPDF 1.3 (génération PDF, fork libre d'iText)
- springdoc-openapi (documentation Swagger)
- Aucune base de données, aucun ORM

## Sécurité

Ce service n'est **jamais exposé directement** au frontend Angular.
Chaque appel entrant doit porter le header :

```
X-Internal-Token: <valeur partagée avec le Middle Tier>
```

Configurée via `INTERNAL_SERVICE_TOKEN` (voir `.env.example`), la même
valeur doit être configurée côté Express dans la variable
`UNCHK_BACKEND_TOKEN` (voir `unchk-middle/.env.example` mis à jour).

## Installation

```bash
# 1. Copier le fichier d'environnement
cp .env.example .env
# Éditer .env : définir INTERNAL_SERVICE_TOKEN (doit matcher le middle)

# 2. Compiler et lancer
mvn clean install
mvn spring-boot:run

# OU construire un jar exécutable
mvn clean package
java -jar target/unchk-backend-1.0.0.jar
```

Le service écoute par défaut sur `http://localhost:8081`.
Documentation Swagger : `http://localhost:8081/swagger-ui.html`.

## Endpoints

| Méthode | Endpoint                       | Description                                       |
|---------|----------------------------------|----------------------------------------------------|
| GET     | `/api/sante`                    | Healthcheck (sans token)                           |
| POST    | `/api/documents/bulletin`       | Bulletin de notes PDF (un semestre)                 |
| POST    | `/api/documents/releve`         | Relevé de notes PDF (toute la scolarité)            |
| POST    | `/api/documents/courrier`       | Mise en forme PDF d'un courrier administratif       |
| POST    | `/api/documents/note-service`   | Mise en forme PDF d'une note de service             |

Tous les endpoints `/api/documents/*` :
- requièrent le header `X-Internal-Token`
- acceptent `application/json` en entrée
- renvoient `application/pdf` en sortie (flux binaire)

### Exemple — Bulletin de notes

```bash
curl -X POST http://localhost:8081/api/documents/bulletin \
  -H "Content-Type: application/json" \
  -H "X-Internal-Token: changez_ce_token_partage_avec_le_middle" \
  -d '{
    "etudiant": {
      "ine": "SN20260001",
      "nom": "Diallo",
      "prenom": "Mamadou",
      "formationIntitule": "Master Ingénierie Logicielle P8",
      "promo": "2025"
    },
    "semestre": "S2 2026",
    "notes": [
      { "matiere": "Algorithmique avancée", "note": 15.5, "credit": 4, "semestre": "S2 2026" },
      { "matiere": "Architecture logicielle", "note": 14.0, "credit": 4, "semestre": "S2 2026" }
    ]
  }' \
  --output bulletin.pdf
```

## Règle métier reprise du Middle Tier

La moyenne pondérée est recalculée ici avec la même formule que côté
Express : `SUM(note × crédit) / SUM(crédit)`. Le calcul est fait par
semestre (bulletin) ou par semestre + global (relevé).

## Tests

```bash
mvn test
```

Inclut un test de démarrage du contexte Spring et un test unitaire
vérifiant que le bulletin génère bien un PDF valide (signature `%PDF-`).

## Note sur cet environnement de génération

Ce projet a été généré sans accès à un environnement Maven/réseau
permettant de le compiler ici. Le code a été relu attentivement
(imports, signatures, types), mais je recommande de lancer
`mvn clean install` dès réception pour détecter d'éventuelles erreurs
de compilation avant intégration.
