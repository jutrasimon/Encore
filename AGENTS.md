# ENCORE : reprise et validation

- Source de vérité : dépôt `jutrasimon/Encore`. Commencer par `git fetch`, lire les SHA distants et `docs/current-state.md`. Ne jamais reconstruire le projet depuis une ancienne copie temporaire ou un résumé de chat.
- Avant modification, identifier branche, SHA de base et URL testée. Ne pas écraser les modifications distantes; utiliser une avance rapide, jamais un push forcé.
- Le design attendu est documenté dans la section « Boucle de jeu validée » du README. Un show échoué termine la tournée. Un show réussi exige une action Studio par joueur avant le suivant. Les niveaux restent sans fin. Une amélioration audio ou visuelle ne change pas ces règles.
- Distinguer un choix entre chansons (`draft`) du Studio entre shows (`reward`). L’auto-ready ne doit jamais contourner ces choix ni redémarrer une défaite (`lost`).
- Tester cinq chansons complètes, la réussite vers le Studio, l’échec terminal, le nouveau départ et les sauvegardes, en solo et en coop. Les tests ne remplacent pas un essai des écrans dans le navigateur.
- `dist/engine.js` est exécuté localement en solo et dans la fonction Supabase en coop. Tout changement de règles exige leur publication cohérente et la vérification de la copie serveur. Conserver l’authentification existante.
- Publier d’abord une version de test reviewable sur la branche existante `preview/audio-0.9.0`, puis la promouvoir sur `main` après validation. Vérifier le succès GitHub Actions et la version réellement servie. Conserver les sauvegardes séparées.
- Mettre à jour `docs/current-state.md` quand l’état change. Les documents `audio-*-handoff.md` et `0.7.0.md` sont des archives, pas des instructions courantes.
- Ne pas dire « testé dans le navigateur » ou « publié » sans avoir effectué et vérifié l’action correspondante. Signaler précisément les limites restantes.

- Cadre visuel invariant : tous les écrans, présentations et popups restent dans le rectangle exact du téléphone (`.console`). Une présentation modale remplace visuellement tout cet écran, jamais une fenêtre plus large que le jeu. Vérifier les limites après redimensionnement mobile.
- En coop, chaque joueur confirme « Monter sur scène » avant la première chanson de chaque show, via `ready`. Aucun auto-ready à `round === 0` ne doit contourner cette confirmation ; les choix draft/Studio restent obligatoires.
- Icônes de statistiques : utiliser `StatIcon` (`dist/stat-icon.js`) et les trois masques PNG communs ; ne pas réintroduire étoiles ou caractères éclair pour les valeurs.
