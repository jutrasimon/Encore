# Encore!

## 🎮 [Jouer à Encore](https://jutrasimon.github.io/Encore/)

Roguelite musical pour navigateur, mobile d'abord. Solo et coopération à deux,
sans création de compte. Direction artistique : console Game Boy pirate, écran
vert, coque crème et accents orange. Version 0.8.1.

## Jouer à deux

1. Créer un band, puis copier l’invitation depuis le lobby.
2. Le deuxième joueur ouvre le lien sur son appareil, entre son nom et rejoint.
   Le champ accepte aussi un code avec espaces ou un lien complet.
3. Le créateur lance quand les deux joueurs sont présents. Chacun valide la chanson
   et choisit sa propre tuile; les scores du show sont communs.

Le lobby attend deux participants. Une coupure temporaire conserve la session;
« Reprendre mon band » retrouve le même musicien sur son appareil.

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
clique pour être prêt; la chanson se résout quand tous sont prêts. Entre les shows,
chacun choisit sa récompense. Après chaque chanson, le plateau reste visible. Continuer ouvre le choix de trois tuiles distinctes tirées dans le pool du rôle; posséder déjà une sorte proposée reste permis. Le choix ramène au plateau avant de lancer la prochaine chanson. L'inventaire défile en trois colonnes, avec les copies épuisées à la fin. Elles ne peuvent pas recevoir de focus; un focus se libère dès que sa copie s’épuise.

Une identité aléatoire est conservée dans le navigateur pour reprendre son band.
Effacer les données du navigateur fait perdre cette identité. Un joueur qui se
déconnecte conserve sa place; il n'est pas remplacé en cours de tournée.
Le solo est sauvegardé localement, indépendamment du serveur.

## Règles du prototype

- Guitariste-chanteur : 5 tuiles (2 guitares, 2 voix, 1 médiator) et 1 focus. Le rôle configure le nombre de départ et son pool.
- Focus : sélection de copies précises, poids de pige ×2, sans duplication. Modifiable librement entre les chansons avant de se déclarer prêt. Avec 9 tuiles disponibles ou moins, elles sont toutes pigées.
- Focus temporaire : capacité distincte, expirant dès la fin du show. Le modèle et l’affichage sont prêts; aucune des 18 tuiles actuelles ne donne encore ce bonus.
- Grille 3 × 3. Neuf instances pigées sans remise à l'intérieur d'une chanson;
  toutes les tuiles admissibles redeviennent disponibles à la chanson suivante.
- Inventaire insuffisant : cases vides ajoutées puis mélangées avec les tuiles.
- Adjacence orthogonale. Une guitare entre deux voix reçoit ×4; les voix ×2 chacune.
- Résolution automatique : phases réservées déplacement/transformation,
  charges et pouvoirs, bonus additifs, multiplicateurs, points, épuisement et
  désactivation. Redéclencher répète uniquement la production des points.
- Charges, épuisement et désactivation persistent pendant le show, puis se
  réinitialisent au suivant. Une tuile désactivée reste dans les piges.
- Qualité ET énergie requises en cinq chansons complètes, objectifs multipliés par
  le nombre de joueurs. Les grilles sont individuelles; leurs points s'ajoutent.
- Overdrive visuel au dépassement d’un objectif; double overdrive quand les deux sont dépassés. Les cinq chansons restent jouées; aucun multiplicateur automatique ajouté.
- Fans directs des tuiles, plus `floor((qualité personnelle + énergie personnelle)/10)`
  à la fin du show. Formule provisoire, aucun achat avec les fans actuellement.
- Niveaux sans fin, trois salles récurrentes et 18 sortes de tuiles. Entre les shows : ajouter une des trois
  propositions, améliorer une tuile (sans plafond) ou retirer définitivement une tuile.
- Les améliorations de guitare ajoutent de la qualité, le canard des fans,
  les autres de l'énergie. L'amélioration ne change pas la portée des pouvoirs.

## Architecture

`dist/engine.js` contient les règles déterministes, partagées entre le solo et le
serveur. En multijoueur, le serveur choisit la graine aléatoire et valide les actions.
`server/http.js` authentifie les jetons joueur et limite taille/méthodes/origines.
`server/room.js` protège chaque écriture par comparaison atomique de version.
Un identifiant unique empêche de réappliquer une action après une réponse perdue.
`server/index.ts` assure la persistance via l'API PostgreSQL de Supabase.

La synchronisation utilise des requêtes HTTP : 1,5 seconde quand on attend le
band (dont les choix de tuiles), quatre secondes autrement. Elle s'arrête dans un onglet masqué et à la fin de
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

Les tests couvrent les règles, les commandes simultanées, les doublons, les accès
non autorisés, les salons complets/expirés et la reprise après redémarrage du
gestionnaire serveur. Ils ne remplacent pas les essais sur téléphones réels.

L'illustration de scène est fixe. Pas encore de personnages personnalisables,
de synergies entre grilles, de métaprogression entre tournées. Les sauvegardes v1 sont adaptées en conservant leur inventaire; L'équilibrage reste expérimental.

## Bilan live (0.8.1)

Portraits carrés cliquables, fans du band additionnés, onglet Band et profils individuels. Le plateau ajuste sa taille à la hauteur disponible; inventaire et rapports gardent leur défilement. Le son se règle dans Réglages et la version est gravée en bas de la coque. Chaque tuile partage les mêmes détails au survol, au focus clavier et au clic.

Les résolutions enregistrent les productions, fans directs et bonus de fin de show, liens, redéclenchements, multiplicateurs, occupation de grille et contributions par sorte de tuile. Les graphiques proposent production, cumul et variation entre chansons, filtres joueur/band et show/tournée. Les 250 dernières chansons détaillées sont conservées pour borner les réponses réseau; les compteurs de carrière restent cumulatifs. Les anciennes sauvegardes conservent leurs fans sans inventer les mesures absentes. Le bilan est accessible au Studio et avant de quitter.
