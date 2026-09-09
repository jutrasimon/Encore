# Encore!

Roguelite musical pour navigateur, mobile d'abord. Solo et coopération à deux,
sans création de compte. Direction artistique : console Game Boy pirate, écran
vert, coque crème et accents orange. Version 0.2.0.

## Hébergement retenu

- Sources : https://github.com/jutrasimon/Encore
- Jeu : GitHub Pages, dossier `dist`, publication par GitHub Actions.
- Serveur : fonction Supabase `encore`, projet `imghkkvpotbxqvwnbjxg`.
- Persistance : PostgreSQL, table `encore_rooms`, RLS activée et aucun accès
  direct pour les rôles navigateur `anon` et `authenticated`.
- Offre Supabase Free vérifiée. Aucun service Render, Cloudflare ou itch.io requis.

Le forfait gratuit comporte des quotas, dont 500 000 appels de fonction/mois et
500 Mo de base de données. Supabase peut mettre le projet en pause après une
semaine d'inactivité. Ne pas activer un forfait payant sans accord explicite.
La progression est conservée 24 heures après la dernière activité du band.
Les salons expirés sont supprimés lors d'une prochaine création. Maximum 100
salons enregistrés simultanément pour borner le stockage de ce prototype.

## Jouer

Entrer un pseudo, créer un band et partager son lien ou son code à 12 caractères.
Le créateur lance la tournée après l'arrivée du deuxième joueur. Chaque joueur
clique pour être prêt; la manche se résout quand tous sont prêts. Entre les shows,
chacun choisit sa récompense. L'inventaire se consulte sur un écran distinct.

Une identité aléatoire est conservée dans le navigateur pour reprendre son band.
Effacer les données du navigateur fait perdre cette identité. Un joueur qui se
déconnecte conserve sa place; il n'est pas remplacé en cours de tournée.
Le solo est sauvegardé localement, indépendamment du serveur.

## Règles du prototype

- Grille 3 × 3. Neuf instances pigées sans remise à l'intérieur d'une manche;
  toutes les tuiles admissibles redeviennent disponibles à la manche suivante.
- Inventaire insuffisant : cases vides ajoutées puis mélangées avec les tuiles.
- Adjacence orthogonale. Une guitare entre deux voix reçoit ×4; les voix ×2 chacune.
- Résolution automatique : phases réservées déplacement/transformation,
  charges et pouvoirs, bonus additifs, multiplicateurs, points, épuisement et
  désactivation. Redéclencher répète uniquement la production des points.
- Charges, épuisement et désactivation persistent pendant le show, puis se
  réinitialisent au suivant. Une tuile désactivée reste dans les piges.
- Qualité ET énergie requises en cinq manches maximum, objectifs multipliés par
  le nombre de joueurs. Les grilles sont individuelles; leurs points s'ajoutent.
- Fans directs des tuiles, plus `floor((qualité personnelle + énergie personnelle)/10)`
  à la fin du show. Formule provisoire, aucun achat avec les fans actuellement.
- Trois shows et 18 sortes de tuiles. Entre les shows : ajouter une des trois
  propositions, améliorer une tuile (+3 maximum) ou retirer définitivement une tuile.
- Les améliorations de guitare ajoutent de la qualité, le canard des fans,
  les autres de l'énergie. L'amélioration ne change pas la portée des pouvoirs.

## Architecture

`dist/engine.js` contient les règles déterministes, partagées entre le solo et le
serveur. En multijoueur, le serveur choisit la graine aléatoire et valide les actions.
`server/http.js` authentifie les jetons joueur et limite taille/méthodes/origines.
`server/room.js` protège chaque écriture par comparaison atomique de version.
Un identifiant unique empêche de réappliquer une action après une réponse perdue.
`server/index.ts` assure la persistance via l'API PostgreSQL de Supabase.

La synchronisation utilise des requêtes HTTP : deux secondes quand on attend le
band, dix secondes autrement. Elle s'arrête dans un onglet masqué et à la fin de
la tournée. Les états inchangés ne sont pas retransmis. Ce prototype n'utilise pas
encore Supabase Realtime. L'indication de présence tolère environ une minute.

La vérification JWT du point d'entrée est désactivée volontairement : le serveur
utilise des identifiants joueur aléatoires de 256 bits, hachés en base, et vérifie
l'appartenance au salon à chaque accès. La clé `service_role` reste dans
l'environnement serveur. Aucun secret d'administration ne figure dans `dist`.
Le code du band est une invitation, pas une preuve d'identité d'un membre existant.
La création publique est bornée en stockage mais ne comporte pas encore de CAPTCHA;
un lancement à grande échelle nécessitera une protection contre les abus de quotas.

## Développement et publication

Node 22 ou supérieur pour les tests. Aucune dépendance npm requise.

```sh
npm run check
npm test
npm run dev
```

Ouvrir http://localhost:8000. Attention : le multijoueur utilise le projet Supabase
configuré dans `dist/config.js`; les tests unitaires utilisent un stockage simulé.

La migration initiale est dans `supabase/migrations`. Pour redéployer le serveur
avec le connecteur Supabase, transmettre `server/index.ts`, `server/http.js`,
`server/room.js` et `dist/engine.js` en conservant leurs chemins, point d'entrée
`server/index.ts`, nom `encore`, `verify_jwt=false` (authentification personnalisée).
Avec le CLI Supabase, `supabase/config.toml` référence le même point d'entrée.
Mettre à jour le serveur aussi quand les règles partagées changent.

Pour GitHub Pages : Settings > Pages > Source > GitHub Actions. Le workflow
`.github/workflows/pages.yml` teste puis publie `dist` à chaque push sur `main`.
L'activation initiale de Pages peut nécessiter une action de l'administrateur.

## Validation et limites

18 tests couvrent les règles, les commandes simultanées, les doublons, les accès
non autorisés, les salons complets/expirés et la reprise après redémarrage du
gestionnaire serveur. Ils ne remplacent pas les essais sur téléphones réels.

L'illustration de scène est fixe. Pas encore de personnages personnalisables,
de synergies entre grilles, de métaprogression entre tournées ni de migration des
sauvegardes d'une version de règles à l'autre. L'équilibrage reste expérimental.
