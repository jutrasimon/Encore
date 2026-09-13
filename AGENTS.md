# ENCORE : reprise et validation

- Source de vérité : dépôt `jutrasimon/Encore`. Commencer par `git fetch`, lire les SHA distants et `docs/current-state.md`. Ne jamais reconstruire le projet depuis une ancienne copie temporaire ou un résumé de chat.
- Avant modification, identifier branche, SHA de base et URL testée. Ne pas écraser les modifications distantes; utiliser une avance rapide, jamais un push forcé.
- Le design attendu est documenté dans la section « Boucle de jeu validée » du README. Un show échoué termine la tournée. Un show réussi exige trois catégories Studio complétées (Ajouter, Améliorer, Retirer, chacune avec possibilité de passer), puis Partir en show par joueur avant le suivant. Les niveaux restent sans fin. Une amélioration audio ou visuelle ne change pas ces règles.
- Distinguer un choix entre chansons (`draft`) du Studio entre shows (`reward`). L’auto-ready ne doit jamais contourner ces choix ni redémarrer une défaite (`lost`).
- Tester cinq chansons complètes, la réussite vers le Studio, l’échec terminal, le nouveau départ et les sauvegardes, en solo et en coop. Les tests ne remplacent pas un essai des écrans dans le navigateur.
- `dist/engine.js` est exécuté localement en solo et dans la fonction Supabase en coop. Tout changement de règles exige leur publication cohérente et la vérification de la copie serveur. Conserver l’authentification existante.
- Publier d’abord une version de test reviewable sur la branche existante `preview/audio-0.9.0`, puis la promouvoir sur `main` après validation. Vérifier le succès GitHub Actions et la version réellement servie. Conserver les sauvegardes séparées.
- Mettre à jour `docs/current-state.md` quand l’état change. Les documents `audio-*-handoff.md` et `0.7.0.md` sont des archives, pas des instructions courantes.
- Ne pas dire « testé dans le navigateur » ou « publié » sans avoir effectué et vérifié l’action correspondante. Signaler précisément les limites restantes.

- Cadre visuel invariant : tous les écrans, présentations et popups restent dans le rectangle exact du téléphone (`.console`). Une présentation modale remplace visuellement tout cet écran, jamais une fenêtre plus large que le jeu. Vérifier les limites après redimensionnement mobile.
- En coop, chaque joueur confirme « Monter sur scène » avant la première chanson de chaque show, via `ready`. Aucun auto-ready à `round === 0` ne doit contourner cette confirmation ; les choix draft/Studio restent obligatoires.
- Icônes de statistiques : utiliser `StatIcon` (`dist/stat-icon.js`) et les trois masques PNG communs ; ne pas réintroduire étoiles ou caractères éclair pour les valeurs.

- Localisation : tout nouveau texte visible ou accessible doit avoir sa traduction dans `dist/locales/en.tsv`. Conserver les noms de joueurs sous `translate="no"`, les valeurs des champs et les identifiants du moteur ; aucune règle de jeu ne dépend de la langue. Reconstruire le catalogue avec `npm run check`.

- Classes et packs : `TILE_PACKS` sépare les 18 tuiles guitariste des 18 tuiles batteur. Le pack `neutral` est vide jusqu’au choix utilisateur explicite d’un nombre égal de tuiles de chaque pack. Ne pas confondre pack de disponibilité et famille de calcul. Ne pas recréer le starter à la reconnexion.

- Reveal validé : conserver l'annonce centrale grand format et ses animations `stage-slam` / `name-rip` (référence `44ee981`, avant déplacement en bas par `f40bae9`). Le décor rejoint les trois bords intérieurs du téléphone ; ni version ni bande vide pendant la résolution. Ne pas modifier cette composition lors d'une intégration de classe, de tuile ou d'un autre écran. Pour une modification du reveal, exécuter `scripts/check-reveal-browser.mjs` contre un serveur de test, inspecter ses captures d'introduction ET de résolution, puis vérifier l'annonce du deuxième joueur. Les tests moteur seuls ne valident pas ces invariants visuels.
