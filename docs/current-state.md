# État courant : preview ENCORE 0.9.10 / principal 0.9.9

Passe de finition du 11 septembre 2026 sur `preview/audio-0.9.0`, base `dacdaefb168ac3a2b2027d543df8d68afc8505a5`. Le principal reste en 0.9.9 jusqu’à validation utilisateur.

## Finition 0.9.10

- Rendu incrémental des écrans : contrôles, focus et défilement conservés lors des mises à jour; transitions courtes sur les changements de vue.
- Retour au plateau sans fondu noir complet; raccord du plateau commun et sortie raccourcie après la fin des explosions.
- Impacts et stickers reviennent à leur position de repos; effets conservés, survol adouci, couleurs des ressources cohérentes et annonces moins concurrentes. Les compteurs reçoivent les points à l’arrivée visuelle du transfert.
- Le client réessaie une fois après un refus HTTP 429, avec le même identifiant d’action et une attente supérieure à la garde serveur de 200 ms. Un échec final laisse la validation manuelle disponible.
- Animations réduites et petits écrans pris en compte.
- Aucun changement de `dist/engine.js`, d’authentification ou de fonction serveur. Le serveur reste en 0.9.9, protocole 2 / règles 4.

## Vérifications de cette passe

- `npm run check` et 89 tests passent (Node avec `--experimental-test-isolation=none` dans cette session Windows).
- Essais navigateur en cours sur localhost : résolution solo, choix intermédiaires, écran 390 × 844.
- Publication preview et validation complète solo/coop à vérifier avant livraison.


## Règles

La cinquième chanson mène au Studio uniquement si les deux objectifs sont atteints. Un objectif manqué termine la tournée. Le bilan et les fans restent consultables; une nouvelle tournée commence avec l’inventaire initial. Les niveaux sans fin, les choix entre chansons et les améliorations sans plafond sont conservés.

La version 0.7.0 avait introduit une reprise du même show après défaite. Ce comportement est retiré. Une sauvegarde `lost` reste terminée; une sauvegarde `reward` avec `retry=true` est adaptée en `lost`. Les tentatives déjà commencées restent jouables, sans réécriture de leur historique.

Le plateau reste visible après la résolution. « Passer au Studio » ouvre les trois actions ajouter, améliorer, retirer, plus passer. En coop, chacun doit choisir; ensuite la première chanson du show suivant démarre automatiquement. Le bilan de défaite propose le bilan du band et une nouvelle tournée.

## Publication et contrôle

- Dépôt : https://github.com/jutrasimon/Encore
- Principal : `main`, https://jutrasimon.github.io/Encore/
- Test : `preview/audio-0.9.0`, https://jutrasimon.github.io/Encore/audio-test/
- Serveur : fonction Supabase `encore`, projet `imghkkvpotbxqvwnbjxg`.
- Vérifier les SHA et les workflows distants à chaque reprise : ce fichier décrit la version, pas une preuve de publication.
- Les sauvegardes principal/test ont des préfixes distincts. La preview utilise le même serveur multijoueur.
- Validation : `npm run check`, `npm test`, puis essais dans le navigateur. Les tests `progression.test.mjs` protègent la boucle complète en solo et à deux, les blocages après défaite et la migration.
- Le navigateur intégré de cette session peut ouvrir localhost:8000. La livraison doit aussi être contrôlée sur la preview publiée.
- Les sources n’ont aucune dépendance npm. Le connecteur GitHub peut publier avec Git Data si le terminal n’a pas d’identifiants. Ne jamais afficher les binaires en base64.

## Suite connue

La demande d’icônes qualité/énergie dans les textes des tuiles n’est pas incluse dans ce correctif de progression.
