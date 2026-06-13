## Plateforme de Gestion Universitaire UNCHK 

---

##  Lancement du projet

### Prerequis
- Node.js >= 18
- npm >= 9

### Installation & demarrage
```bash
# 1. Installer les dependances
npm install

# 2. Lancer le serveur de dÃ©veloppement
ng serve

# 3. Ouvrir dans le navigateur
#  http://localhost:4200
```

### Build de production
```bash
ng build --configuration=production
# Resultat dans : dist/uchk-angular/
```

---

## les Comptes de demonstration

| Role            | Email                    | Mot de passe | Modules accessibles                    |
|-----------------|--------------------------|-------------|----------------------------------------|
| Administrateur  | admin@uchk.sn            | admin123    | Tout                                   |
| Administratif   | admin2@uchk.sn           | admin123    | Administration + Communication         |
| Enseignant      | enseignant@uchk.sn       | admin123    | Formations + Communication             |
| Tuteur          | tuteur@uchk.sn           | admin123    | Formations + Insertion + Ã‰tudiants     |
| Appui Insertion | insertion@uchk.sn        | admin123    | Insertion + Communication              |
| Ã‰tudiant        | etudiant@uchk.sn         | admin123    | Son dossier + Formations               |

---

## Architecture du projet

```
src/
â”œâ”€â”€ app/
â”‚   â”œâ”€â”€ core/
â”‚   â”‚   â”œâ”€â”€ models/index.ts          â† Interfaces TypeScript (Student, Formation, etc.)
â”‚   â”‚   â”œâ”€â”€ services/
â”‚   â”‚   â”‚   â”œâ”€â”€ auth.service.ts      â† Authentification + gestion rÃ´les (Signals Angular 17)
â”‚   â”‚   â”‚   â””â”€â”€ data.service.ts      â† DonnÃ©es simulÃ©es (remplacer par HttpClient en Phase 2)
â”‚   â”‚   â””â”€â”€ guards/auth.guard.ts     â† Protection des routes par rÃ´le
â”‚   â”œâ”€â”€ shared/
â”‚   â”‚   â””â”€â”€ components/shell/        â† Layout principal (sidebar + topbar + notifications)
â”‚   â””â”€â”€ features/
â”‚       â”œâ”€â”€ auth/login/              â† Page de connexion
â”‚       â”œâ”€â”€ dashboard/               â† Tableau de bord (dynamique selon le rÃ´le)
â”‚       â”œâ”€â”€ communication/           â† Comptes rendus + documents
â”‚       â”œâ”€â”€ administration/          â† Courriers + RH + Budget
â”‚       â”œâ”€â”€ formations/              â† Formations + EDT + Formateurs
â”‚       â”œâ”€â”€ insertion/               â† Stats insertion + Stages + Partenaires (Chart.js)
â”‚       â””â”€â”€ etudiant/
â”‚           â”œâ”€â”€ list/                â† Liste avec recherche et filtres
â”‚           â””â”€â”€ detail/              â† Fiche profil complÃ¨te
â”œâ”€â”€ styles.scss                      â† ThÃ¨me Material custom + variables CSS
â””â”€â”€ index.html
```

---

## ðŸ“‹ Modules fonctionnels

| Module            | FonctionnalitÃ©s                                                                 |
|-------------------|---------------------------------------------------------------------------------|
| **Dashboard**     | KPIs dynamiques par rÃ´le, bar chart, liste Ã©quipe, formations actives           |
| **Communication** | Comptes rendus (CRUD + recherche), documents (table + tÃ©lÃ©chargement)           |
| **Administration**| Courriers arrivÃ©/dÃ©part (CRUD), dossiers RH (table), Budget prÃ©visionnel/rÃ©alisÃ©|
| **Formations**    | Table formations, EDT grille 5 jours colorÃ©e par type, cartes formateurs        |
| **Insertion**     | KPIs, Chart.js (barres + donut), table stages, cartes partenaires               |
| **Ã‰tudiants**     | Table + recherche + filtres (statut, genre), fiche profil complÃ¨te avec stage   |

---

## ðŸ§ª Guide de test

### Test 1 â€” Authentification
```
1. Ouvrir http://localhost:4200 â†’ redirection vers /login
2. Cliquer chip "Admin" â†’ email/mdp prÃ©-remplis
3. Cliquer "Se connecter" â†’ spinner â†’ dashboard
4. Essayer email invalide â†’ message d'erreur rouge
5. Se dÃ©connecter â†’ retour /login
```

### Test 2 â€” ContrÃ´le des accÃ¨s par rÃ´le
```
ConnectÃ© en "Ã‰tudiant" :
  â†’ VÃ©rifier que "Administration" n'est PAS dans la sidebar
  â†’ VÃ©rifier que "Insertion" n'est PAS dans la sidebar
  â†’ Module Ã‰tudiants â†’ affiche directement SA fiche

ConnectÃ© en "Enseignant" :
  â†’ Pas d'Administration, pas d'Insertion
  â†’ Formations, Communication, Dashboard âœ“
```

### Test 3 â€” Communication
```
1. Onglet "Comptes rendus" â†’ 5 CRs listÃ©s
2. Taper "tutorat" â†’ filtrage temps rÃ©el
3. "Nouveau CR" â†’ modal avec formulaire Material
4. Remplir + Enregistrer â†’ nouveau CR en tÃªte + snackbar vert
5. Onglet "Documents" â†’ table avec tÃ©lÃ©chargement
```

### Test 4 â€” Administration
```
1. Onglet "Courriers" â†’ 3 arrivÃ©s | 2 dÃ©parts
2. "Nouveau courrier" â†’ modal â†’ sauvegarder â†’ apparaÃ®t dans la liste
3. Onglet "RH" â†’ table formateurs avec avatars colorÃ©s
4. Onglet "Budget 2025" â†’ barres de progression prÃ©visionnel vs rÃ©alisÃ©
```

### Test 5 â€” Formations & EDT
```
1. Onglet "Formations" â†’ table des 5 formations
2. Onglet "Emploi du temps" â†’ grille 5 colonnes (Lun-Ven)
   - Vert : Cours   |  Bleu : TD   |  Violet : TP   |  Rouge : Examen
3. Onglet "Formateurs" â†’ cartes avec avatar, spÃ©cialitÃ©, badges formations
4. "Nouvelle formation" â†’ modal â†’ crÃ©er â†’ apparaÃ®t dans la table
```

### Test 6 â€” Insertion (Admin ou Insertion)
```
1. Onglet "Statistiques" :
   - 4 KPI cards (dont une hero verte foncÃ©e)
   - Bar chart Chart.js : Ã©volution 2021-2024
   - Donut chart : rÃ©partition 2024
2. Onglet "Stages" â†’ table avec notes colorÃ©es
3. Onglet "Partenaires" â†’ cartes actif/inactif
4. "Nouveau partenaire" â†’ modal â†’ ajoutÃ©
```

### Test 7 â€” Ã‰tudiants
```
1. Liste des 8 Ã©tudiants avec avatars colorÃ©s
2. Rechercher "Diallo" â†’ filtrage instantanÃ©
3. Filtre "Actifs" â†’ 6 Ã©tudiants
4. Filtre "FÃ©minin" â†’ filtre par genre
5. Clic Å“il â†’ fiche dÃ©taillÃ©e :
   - Hero banner vert foncÃ© avec initiales
   - Infos personnelles + parcours
   - Card stage avec note
   - Progress bar formation
6. "â† Retour" â†’ retour liste
7. "Ajouter un Ã©tudiant" â†’ modal complet
```

### Test 8 â€” Notifications
```
1. Badge rouge sur cloche topbar (nombre non lus)
2. Clic cloche â†’ menu Material avec liste
3. Clic notification â†’ marque comme lue + navigation
4. "Tout marquer lu" â†’ badge disparaÃ®t
```

### Test 9 â€” Responsive
```
R©duire la fenÃªtre < 900px :
  â†’ Sidebar disparaÃ®t (transform)
  â†’ Bouton hamburger apparaÃ®t
  â†’ Clic â†’ sidebar slide in
  â†’ KPI grid passe Ã  2 colonnes
  â†’ EDT grille passe Ã  2 colonnes
```

---

## ðŸ”„ Phase 2 â€” Connexion API Spring Boot

Remplacer les mÃ©thodes du `DataService` par des appels HTTP :

```typescript
// data.service.ts â€” AVANT (Phase 1)
getStudents(): Observable<Student[]> {
  return of(this.students).pipe(delay(300));
}

// data.service.ts â€” APRÃˆS (Phase 2)
getStudents(): Observable<Student[]> {
  return this.http.get<Student[]>(`${this.API}/students`, {
    headers: { Authorization: `Bearer ${this.tokenService.get()}` }
  });
}
```

Il suffit d'injecter `HttpClient` dans le service et de changer l'implÃ©mentation de chaque mÃ©thode.

### Variables d'environnement
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1'
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.uchk.sn/api/v1'
};
```

---

## ðŸ“¦ Stack technique

| Couche     | Technologie               | Version |
|------------|---------------------------|---------|
| Framework  | Angular                   | 17      |
| UI Library | Angular Material          | 17      |
| Charts     | Chart.js                  | 4.4     |
| State      | Angular Signals           | 17      |
| Styles     | SCSS + CSS Variables      | â€”       |
| Routing    | Angular Router (lazy)     | 17      |
| Guards     | CanActivateFn             | 17      |

