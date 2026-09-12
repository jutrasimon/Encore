# État courant : preview ENCORE 0.9.21 / principal 0.9.9

Passe de finition du 11 septembre 2026 sur `preview/audio-0.9.0`, base `dacdaefb168ac3a2b2027d543df8d68afc8505a5`. Le principal reste en 0.9.9 jusqu’à validation utilisateur.

## Distribution mélangée et cadre borné 0.9.21

Base `4e381b1`. Ordre d’arrivée visuel des neuf cases mélangé par Fisher-Yates une fois par plateau, puis conservé pendant toutes les frames. Les emplacements et calculs du reveal ne changent pas. Cadre centré avec hauteur limitée par la largeur (environ 1:2) et 1040 px maximum, pour éviter un téléphone excessivement long dans une grande fenêtre ou avec dézoom. Aucun moteur ni serveur modifié.

Validation : 116 tests, ordre stable et permutation complète inclus. Navigateur local : coop dans une fenêtre 1100 × 1800, cadre 496 × 1028 centré ; mobile 320 × 700, cadre 308 × 628 sans débordement horizontal, grille et navigation visibles. Pas de nouveau parcours complet de tournée navigateur pour cette correction visuelle. Preview : https://jutrasimon.github.io/Encore/audio-test/.

## Titre d’accueil statique 0.9.20

Base `909b2e6`. ENCORE sur l’accueil est retiré des cibles de distorsion/particules au pointeur ; règle CSS de déformation du titre supprimée. L’étiquette de version du cadre lit désormais la constante de version commune. Aucun moteur ni serveur modifié. Syntaxe et 115 tests validés ; accueil inspecté dans le navigateur local. Pas de nouveau parcours complet de tournée pour ce retrait visuel. Preview : https://jutrasimon.github.io/Encore/audio-test/.

## Distribution des cases vides 0.9.19

Base `7b17f71`. Les neuf emplacements participent à la distribution, y compris les cases nulles/vides : masquées au départ, elles arrivent avec le même mouvement et le même son de pose. Aucun changement de tirage, de durée d’annonce, de moteur ou de serveur. Mouvement réduit immédiat conservé.

Validation : 115 tests réussis, incluant les parcours moteur solo/coop existants et les distributions avec zéro à neuf tuiles occupées. Contrôle navigateur local du composant avec les vrais rendus de tuiles : neuf opacités à zéro avant la distribution, cases vides animées séquentiellement, styles transitoires nettoyés à la fin. Pas de nouveau parcours complet de cinq chansons en navigateur pour cette correction. Preview : https://jutrasimon.github.io/Encore/audio-test/ ; serveur preview toujours 0.9.18/rules 5, principal 0.9.9 inchangé.

## Studio à trois catégories 0.9.18

Base `f40bae901e68ef3f1cdaff896b7be2640c075e21`. Studio reconstruit avec les PNG fournis : panorama, fond crème, titres HTML sur bandeaux, billet et planches alpha en sprites CSS (décorations 724 × 724 ; splats/BD 512 × 512). La maquette reste une référence, jamais une interface. Aucun détourage. Trois onglets, sélection rose, détail à hauteur naturelle, confirmation explicite, catégorie passée/complétée, Bilan avec retour et sélection conservée. Aucun compteur de chanson ni jauges dans le Studio. Défilement dans le cadre du téléphone, galerie sur deux colonnes à 320 px et textes lisibles. Tampon de 250 ms et éclat de 350 ms, désactivés en mouvement réduit.

Moteur : `player.studio` contient la visite (show/attempt), les trois confirmations et le départ. Chaque catégorie n’agit qu’une fois ; les propositions restent fixes, les options d’inventaire sont recalculées. Passer compte comme complété sans effet. Les anciennes récompenses déjà confirmées sont migrées comme complétées pour ne pas redonner de choix. À 3/3, Partir en show est explicite pour chaque joueur. Les conditions d’accès, cinq chansons, drafts, défaite terminale, calculs et double confirmation Monter sur scène restent inchangés.

Serveur de preview isolé : fonction `encore-preview` version 1, health protocol 2 / rules 5 / build 0.9.18 ; table `encore_preview_rooms` et RPC correspondante via migration `20260911215619_studio_preview_rooms.sql`. Authentification de membre 256 bits conservée ; RLS et absence de droits anon/authenticated vérifiées. Les anciens bands sont lus dans `encore_rooms` puis copiés lors d’une transaction authentifiée vers la table preview, sans écriture sur la table principale. Ne pas déployer `encore` pendant cette preview : il reste en rules 4 / build 0.9.9. Les quatre fichiers du bundle serveur ont été relus et comparés à la copie locale, moteur compris.

Validation : 114 tests réussis (cinq chansons solo/coop, succès, échec terminal, nouveau départ, sauvegardes ; trois actions, options réévaluées, catégorie passée/vide, doublons et reconnexion HTTP). Navigateur local : ajouter puis améliorer puis retirer la même tuile, Bilan sans perte de sélection, 3/3 persistant après rechargement ; format 320 × 700 sans débordement, bouton Bilan dans le cadre. Coop réelle sur la nouvelle fonction : cinq chansons/quatre drafts via API dans une partie QA dédiée avec niveaux de tuiles renforcés pour garantir le succès ; Studio testé avec deux clients navigateur, choix indépendants, catégorie passée, attente du premier départ et reconnexion conservant les confirmations, second départ vers Le petit pub. Pas de nouveau parcours d’échec complet en navigateur. La création d’un ancien band QA sur le serveur principal a été refusée par la revue automatique ; le chemin de copie d’un ancien band n’a donc pas été vérifié en production.

Preview cible : https://jutrasimon.github.io/Encore/audio-test/. Principal inchangé en 0.9.9 ; aucune promotion sans validation utilisateur.

## Distribution et duo sur scène 0.9.17

Base `44ee981`. Grille recentrée verticalement dans son espace disponible ; navigation Band renommée Stats. Pendant l’annonce existante du nom, les tuiles déjà tirées arrivent du centre vers leurs emplacements par intervalles de 55 ms maximum, avec une pose de 180 ms et un petit son percussif. Aucun nouveau tirage ni allongement du reveal. Le nom est affiché dans le pied de scène pour laisser les neuf slots visibles. En mouvement réduit, distribution immédiate sans déplacements ni série percussive.

Le rendu de scène reçoit les joueurs réels et le joueur actif. En duo, deux personnages liés à leurs classes occupent des positions fixes côte à côte : seul l’actif prend les poses de jeu, l’autre reste immobile et assombri. Éclairage croisé de 300 ms au changement de joueur. Les deux prennent la pose de résultat à la fin du show. Atelier enrichi avec duo et sélection du joueur actif.

Validation : 108 tests, dont distribution avant la fin de l’intro, cases vides, mouvement réduit, absence de mutation et alternance des poses. Navigateur local : centrage mesuré, navigation Stats, chanson solo complète avec annonce et distribution ; duo contrôlé dans les trois lieux via l’atelier et alternance A/B. Les tests moteur couvrent cinq chansons solo/coop, Studio, défaite et sauvegardes ; pas de nouveau parcours complet en coop réelle dans le navigateur pour cette passe. Aucun moteur ni serveur modifié. Preview : https://jutrasimon.github.io/Encore/audio-test/.

## Compteur restauré 0.9.16.1

Base `46a6e53`. À la demande utilisateur, retrait du bandeau rose et du tampon sur le compteur, retour au panneau sombre compact CHANSON X / 5 avec chiffre lime, en jeu comme pendant le reveal. Les autres décorations et les règles restent inchangées. Validation : 105 tests réussis et compteur contrôlé dans le navigateur local.

## Cadre, confirmations et icônes 0.9.16

Base preview `2c01231c86d73ab1ed01d371a53f6d487b4081b0`. Tous les dialogues occupent le rectangle exact de la console, recalculé au redimensionnement. La présentation indique simplement le nombre de chansons. Les consignes AGENTS.md rendent cette limite persistante.

En coop, le créateur prépare le show ; chaque musicien confirme ensuite Monter sur scène. La commande ready existante porte cette confirmation ; l’auto-ready est bloqué à round 0, y compris après Studio et reconnexion. Le premier clic affiche les joueurs prêts/en attente, le deuxième démarre. Moteur, sauvegardes, serveur et authentification inchangés.

Les PNG diamant/éclair/personnage-cœur sont des masques alpha communs via StatIcon(type, size, color), avec proportions et marges compensées en CSS. Jauges, tuiles, explications, bilans, fans, transferts de points et Studio utilisent le même rendu. Dernier score sous les jauges, ligne inférieure retirée, portrait centré et fans alignés avec le nom, flèche après BAND supprimée.

Validation : syntaxe, 105 tests dont les parcours moteur de cinq chansons solo/coop et un contrôle de double confirmation. Navigateur : dimensions popup/console identiques à 496 × 886 et 308 × 688, solo animé, valeurs et icônes lisibles à 320 px, masques contrôlés sur fonds clair/sombre à 20/28/40 px, espaces de 6 px de part et d’autre du bandeau, portrait centré et nom/fans sur le même axe ; vraie session coop à deux clients, aucun reveal après le premier clic, passage à 1/5 sur les deux clients uniquement après le second. Pas de nouveau parcours complet de cinq chansons en coop navigateur dans cette passe. URL preview : https://jutrasimon.github.io/Encore/audio-test/. Principal conservé en 0.9.9.

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
