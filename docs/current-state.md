# État courant : preview ENCORE 0.9.15 / principal 0.9.9

Passe de finition du 11 septembre 2026 sur `preview/audio-0.9.0`, base `dacdaefb168ac3a2b2027d543df8d68afc8505a5`. Le principal reste en 0.9.9 jusqu’à validation utilisateur.

## Verdict plein écran et dernière chanson 0.9.15

Base preview `208182eb0894bc0b6ad2c1e7f2e05260629b3494`. Le dernier reveal conserve toute sa durée, explosion comprise, puis la grille disparaît en 180 ms. Le verdict remplace le plateau : personnage content/triste lié à la classe, objectifs réels et statut atteint/manque, fans, dernière chanson, accès Studio ou bilan. Voir le détail conserve les neuf cases et permet de revenir au verdict. Navigation et règles inchangées.

Bandeau rose avec compteur HTML, tampon 250 ms par chanson, décors dans les marges et projecteurs discrets à la dernière chanson, annonce sonore sur l’événement existant. Éclats BD de 350 ms, deux maximum, et bref éclairage de la jauge atteinte. Les décors ne capturent aucun clic ; mouvement réduit fixe. Les quatre nouveaux PNG ont déjà un canal alpha : aucun détourage. L’atelier présente leurs découpes sur fonds clair et sombre.

Validation : syntaxe et 103 tests, incluant cinq chansons solo/coop, succès/échec, Studio, nouveau départ et sauvegardes. Navigateur local : fixtures produites par le moteur après quatre chansons, cinquième chanson animée vers les deux verdicts, retour aux neuf cases, reprise d’une défaite sauvegardée, bilan, Studio obligatoire puis chanson 1 du show suivant. Format 320 × 700 sans débordement ; scène du reveal vérifiée sous les compteurs après la transition. Pas de nouveau parcours complet en coop réelle dans le navigateur pour cette passe. Aucun moteur, serveur ou principal modifié. URL preview : https://jutrasimon.github.io/Encore/audio-test/.

## Intros et covers 0.9.14

Base preview `d6675e7`. Trois nouvelles covers opaques sans personnage, associées au lieu via son index et préchargées depuis le rendu du jeu. Intro recomposée : en-tête ENCORE et croix intégrée, numéro, titre, ambiance, cover 3:2 avec fondu inférieur, objectifs issus de `targets(game)` et bouton Monter sur scène. Ce bouton conserve l’action start et ses conditions dans le lobby ; en consultation d’un show commencé, il ferme la présentation sans rejouer une chanson. Le microphone sur pied n’est plus chargé ni dessiné dans les scènes (les tuiles Voix restent identiques).

Validation : syntaxe et 98 tests, dont covers, objectifs coop et conditions d’entrée. Navigateur : intro solo réelle, format 320 × 700, image au ratio 1.5, contenu sans défilement ni débordement, bouton accessible, démarrage par Monter sur scène. Le plateau et le pied du reveal restent ceux de 0.9.13. Aucun moteur ou serveur modifié. Preview : https://jutrasimon.github.io/Encore/audio-test/.

## Correction du placement 0.9.13

Base preview `9e510f9`. Retrait de la bande décorative en jeu normal pour restaurer la grille. Pendant le reveal, la scène est positionnée hors flux, en pleine largeur sous les compteurs jusqu’au bas de la console. Le texte d’annonce la surplombe. Le canvas adapte son cadrage sans déformer les proportions ; les poses de fin apparaissent dans la dernière séquence du reveal.

Vérification navigateur sur un reveal figé généré depuis les fonctions réelles : à 500 × 900, la grille mesure 427.33 px avec et sans illustration. Cadrage aussi contrôlé à 320 × 700. Tests de non-régression de placement ajoutés ; aucune règle ni durée de résolution modifiée. Preview : https://jutrasimon.github.io/Encore/audio-test/.

## Illustrations 0.9.12

Base preview `5d8d9d3`, URL de test : https://jutrasimon.github.io/Encore/audio-test/. Intros et scènes superposées des trois shows intégrées depuis le lot de l’artiste. Portrait et poses connectés au rôle `guitarist-singer` via un registre de présentation séparé du moteur. Foule et actions suivent la résolution existante ; poses de fin conservées, mouvement réduit, détourage magenta mis en cache et protection des chargements tardifs. Voir `docs/art-integration.md` et l’atelier `art-preview.html`.

Validation : syntaxe et 96 tests, dont les parcours de cinq chansons solo/coop, Studio obligatoire, défaite, nouveau départ, sauvegardes, mapping des illustrations et priorité des poses. Navigateur : trois lieux dans l’atelier, formats 320/390/460, états Content/Triste et mouvement réduit ; intro du petit pub, portrait, reprise de sauvegarde, chansons 4 et 5 puis défaite 69/32, rechargement terminal avec pose triste, nouveau départ avec cinq tuiles et intro sous-sol. Aucun moteur ni serveur modifié. Pas de nouveau parcours complet de coop réelle pour ce changement visuel ; les essais de coop réelle de la passe précédente restent décrits plus bas. Les PNG originaux sont chargés à la demande, leur poids peut retarder la première apparition du décor sur réseau lent.

## Survol adouci (0.9.11.1)

Base preview a37717a. Intensité de distorsion des boutons réduite de moitié, réglable via BUTTON_WARP_INTENSITY dans dist/juice.js (0 désactive, 0.5 doux, 1 intensité précédente). Particules conservées. URL de test : https://jutrasimon.github.io/Encore/audio-test/. Aucun changement de règles.

## Ajustements 0.9.11

Base preview `fb4ded0`. L’ADN sonore affiche la stat dominante au centre (35 qualité / 65 énergie → 65 % ÉNERGIE), avec un état équilibré et un état sans points. Tous les boutons principaux et secondaires utilisent la classe commune `action-button`, y compris Continuer, les choix, le Studio, les bilans et les dialogues. Les effets utilisent cette classe unique. Le filtre déforme le bouton entier (fond, contour et texte), sans simple inclinaison, avec une amplitude adaptée à sa taille. Vérification syntaxique et 93 tests réussis, dont les pourcentages dominants et la couverture des modèles de boutons de chaque écran.

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
