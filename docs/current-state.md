# État courant : preview ENCORE 0.9.10 / principal 0.9.9

Passe de finition du 11 septembre 2026 sur `preview/audio-0.9.0`, base `dacdaefb168ac3a2b2027d543df8d68afc8505a5`. Le principal reste en 0.9.9 jusqu’à validation utilisateur.

## Ajustement du survol des actions

Sur la base preview `6152320`, la distorsion et la traînée de particules s’appliquent aussi aux actions principales, à Passer et au bouton solo. Hors résolution, le canvas est limité à la coque plutôt qu’au plateau pour ne pas couper les particules des boutons. Pendant la résolution, les impacts restent limités au plateau. Les boutons désactivés et les animations réduites restent exclus.

## Finition 0.9.10

- Rendu incrémental des écrans : contrôles, focus et défilement conservés lors des mises à jour; transitions courtes sur les changements de vue.
- Retour au plateau sans fondu noir complet; raccord du plateau commun et sortie raccourcie après la fin des explosions.
- Impacts et stickers reviennent à leur position de repos; effets conservés, survol adouci, couleurs des ressources cohérentes et annonces moins concurrentes. Les compteurs reçoivent les points à l’arrivée visuelle du transfert.
- Le client réessaie une fois après un refus HTTP 429, avec le même identifiant d’action et une attente supérieure à la garde serveur de 200 ms. Un échec final laisse la validation manuelle disponible.
- Animations réduites et petits écrans pris en compte.
- Aucun changement de `dist/engine.js`, d’authentification ou de fonction serveur. Le serveur reste en 0.9.9, protocole 2 / règles 4.

## Vérifications de cette passe

- `npm run check` et `npm test` : 91 tests. Les sous-processus Node nécessitent une exécution autorisée dans cette session Windows; le mode sans isolation passe aussi.
- Navigateur intégré : deux tournées solo de cinq chansons, défaite terminale, reprise après rechargement, nouveau départ avec cinq tuiles, réussite (57 qualité / 36 énergie), sauvegarde au Studio et ajout avant le show suivant.
- Coop réelle à deux : cinq chansons, quatre choix, réussite (123 / 84), Studio obligatoire avec attente de chacun, amélioration et retrait. Reconnexion pendant le passage au show suivant corrigée et vérifiée; deuxième show de cinq chansons terminé en défaite (178 / 91 pour des objectifs 140 / 128), conservée après rechargement. Nouveau band vérifié séparément.
- Écrans contrôlés à 390 × 844 et au format 320 × 700 du banc `mobile-preview.html`, ainsi qu’au bureau. Inventaire, choix, détails, réglages, animations réduites et conservation du focus vérifiés. Aucun avertissement ni erreur dans les journaux des deux clients coop contrôlés.
- Workflows preview 34561170232, 34561770990 et 34561922688 réussis. Les fichiers servis ont été comparés aux sources. Vérifier le dernier workflow de la branche à chaque reprise.
- Principal réellement servi : 0.9.9. Santé du serveur : build 0.9.9, protocole 2, règles 4. Aucun moteur ni serveur modifié pendant cette passe.
- Limites : pas d’essai sur téléphone physique ni d’évaluation auditive du mix sur appareil. La sensation finale attend le retour utilisateur sur la preview; aucune promotion sur `main` autorisée à ce stade.

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
