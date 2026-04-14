# 24 secondes par seconde — Feuille de route

Roadmap interactive pour le mémoire *24 secondes par seconde — L'audiovisuel à l'épreuve de l'économie de l'attention*.

Synchronisation temps réel via Firebase : tu coches, ton superviseur voit.

---

## Setup en 10 minutes

### 1. Firebase (gratuit)

1. Va sur [console.firebase.google.com](https://console.firebase.google.com)
2. **Créer un projet** → nomme-le `thesis-roadmap` (désactive Google Analytics si tu veux)
3. Dans le panneau gauche : **Build → Realtime Database → Créer une base de données**
   - Choisis la région **europe-west1** (Belgique)
   - Démarre en **mode test** (ouvert 30 jours — on sécurisera après)
4. Dans le panneau gauche : **Paramètres du projet** (roue dentée) → **Général** → descends jusqu'à **Vos applications** → clique sur l'icône **Web** (`</>`)
5. Nomme l'app `roadmap`, clique **Enregistrer l'application**
6. Copie les valeurs de `firebaseConfig` dans `src/firebase.js`

### 2. Sécuriser (optionnel mais recommandé après le mode test)

Dans **Realtime Database → Règles**, remplace par :

```json
{
  "rules": {
    "roadmap": {
      ".read": true,
      ".write": true
    }
  }
}
```

> Ça suffit pour deux personnes. Si tu veux restreindre l'écriture à toi seul, active l'**Authentification anonyme** dans Firebase et adapte les règles.

### 3. Lancer en local

```bash
npm install
npm run dev
```

Ouvre `http://localhost:5173/thesis-roadmap/`

### 4. Déployer sur GitHub Pages

```bash
# Crée le repo sur GitHub (ex: thesis-roadmap)
git init
git add .
git commit -m "initial commit"
git remote add origin git@github.com:TON_USERNAME/thesis-roadmap.git
git push -u origin main
```

Ensuite sur GitHub :

1. Va dans **Settings → Pages**
2. Source : **GitHub Actions**
3. Le workflow `.github/workflows/deploy.yml` va se déclencher automatiquement
4. Ton site sera live à `https://TON_USERNAME.github.io/thesis-roadmap/`

> **Important** : si ton repo s'appelle autrement que `thesis-roadmap`, change le `base` dans `vite.config.js` pour matcher.

### 5. Partager avec ton superviseur

Envoie-lui l'URL GitHub Pages. Il verra ta progression en temps réel — pas besoin de compte, pas besoin de login.

---

## Structure du projet

```
thesis-roadmap/
├── .github/workflows/deploy.yml   ← Auto-deploy GitHub Pages
├── src/
│   ├── main.jsx                   ← Point d'entrée React
│   ├── App.jsx                    ← Composant roadmap complet
│   └── firebase.js                ← Config Firebase (à remplir)
├── index.html
├── package.json
└── vite.config.js
```
