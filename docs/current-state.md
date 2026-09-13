# État courant : preview ENCORE 0.10.4 / principal 0.9.9

Passe de finition du 11 septembre 2026 sur `preview/audio-0.9.0`, base `dacdaefb168ac3a2b2027d543df8d68afc8505a5`. Le principal reste en 0.9.9 jusqu’à validation utilisateur.

## Couleurs des statistiques et totaux conservés 0.10.4

Base `6bd0c9f`, branche `preview/audio-0.9.0`. Qualité lime et énergie orange, avec deux variables CSS partagées par les jauges, leurs valeurs/barres (y compris overdrive), les courbes et compteurs correspondants des Stats et le diagramme ADN sonore. Les couleurs de famille des tuiles ne changent pas.

Sur la grille après une chanson, chaque tuile non vide conserve en grand son total qualité + énergie + fans, rejoués inclus, selon les mêmes valeurs que le reveal. Les tuiles de soutien sans production affichent 0. Les infobulles de ces cartes indiquent la répartition des points de cette chanson, multiplicateurs et rejoués, puis la règle de l'effet. Les propositions non jouées gardent leur résumé. Aucun recalcul ni modification du moteur : les données résolues existantes alimentent cet affichage.

Validation locale http://127.0.0.1:8002/ dans des profils neufs : palette des jauges distincte et égale aux couleurs du donut, contrôle des totaux contre chaque tuile de la sauvegarde après une chanson, support à zéro et détail d'infobulle inspectés. Contrôle navigateur du reveal central/bords réussi à 320 et 500 px ; composition inchangée. Cinq chansons solo/coop, succès/Studio, sauvegarde/reconnexion, départ des deux joueurs et défaites terminales avec nouveau départ solo vérifiés. npm run check et 142 tests réussis, dont tests des supports à zéro, des rejoués et de l'absence de double application des multiplicateurs. Les imports UI sont invalidés ensemble pour éviter le mélange de versions en cache.

Cible publique : https://jutrasimon.github.io/Encore/audio-test/ . Le correctif du bouton Copier l'invitation 0.10.3 est inclus. Principal 0.9.9 et serveur preview rules 6 / build 0.10.0 inchangés.

## Survol du bouton d'invitation 0.10.3

Base `1a774af`, branche `preview/audio-0.9.0`, test local http://127.0.0.1:8002/ et cible publique https://jutrasimon.github.io/Encore/audio-test/ . Le style lime de survol/focus ne visait que `.class-choice`, excluant le bouton Copier l'invitation. Il vise désormais les boutons actifs de `.class-lobby` ; les boutons désactivés conservent leur état. Modification CSS uniquement, sans changement du reveal, des règles ou de l'action de copie.

Navigateur isolé : survol lime et texte sombre inspectés, focus clavier vérifié, contenu du presse-papiers égal au lien de la room de test, lancement encore désactivé sans second joueur. npm run check et 139 tests réussis. Parcours navigateur de cinq chansons solo et coop : succès, Studio et départ, sauvegarde/reconnexion ; défaites terminales contrôlées et nouveau départ solo également vérifiés. Principal et serveur inchangés.

## Restauration du reveal 0.10.2

Base `9ed268e`, branche `preview/audio-0.9.0`. La correction 0.10.1 n'avait pas restauré l'annonce centrale ni le décor jusqu'au bord inférieur. Recherche dans l'historique : `f40bae9` avait ajouté le déplacement `--deal-name-top`, réduit le nom et désactivé son animation ; suppression de ces trois overrides pour retrouver la présentation de `44ee981` (0.9.16.1), avec `stage-slam` et `name-rip` d'origine.

Le positionnement relatif du corps de l'écran, ajouté pour les couches des autres vues, ne s'applique plus au reveal. Le décor est de nouveau positionné par rapport à `.console` ; hauteur calculée jusqu'au bord intérieur inférieur, sans bande vide et avec numéro de version masqué. Pige, sons, tuiles, portraits, effets et règles inchangés. Les corrections de netteté et de chevauchement de 0.10.1 sont conservées.

Contrôle navigateur reproductible : `node scripts/check-reveal-browser.mjs http://127.0.0.1:8002/` (Playwright existant via `PLAYWRIGHT_MODULE`, profils neufs). Vérifie position centrale, animation, grand texte, trois bords du décor au pixel près, navigation et version masquées pendant le reveal, puis neuf cases et retour de navigation. Captures locales inspectées à 500×920 et 320×700. Coop mixte : captures des deux introductions et annonce centrale rejouée au deuxième joueur. Tests moteur et syntaxe : 139 tests et npm run check réussis. Parcours navigateur de cinq chansons solo (53/51) et coop (96/96), sauvegarde/reconnexion, succès vers Studio et départ après les deux joueurs vérifiés. Défaite terminale sur cinq chansons en solo/coop, détail, bilan et nouveau départ solo également vérifiés en navigateur isolé. Aucun état utilisateur ni changement serveur.

Ces invariants visuels et le contrôle navigateur sont désormais inscrits dans AGENTS.md. Cible publique : https://jutrasimon.github.io/Encore/audio-test/ ; principal 0.9.9 et serveur preview rules 6 / build 0.10.0 inchangés.

## Finition visuelle batteur et reveal 0.10.1

Base `135fbda`, branche `preview/audio-0.9.0`, validation locale sur http://127.0.0.1:8002/ avec profils temporaires et rooms en mémoire ; cible de test publique https://jutrasimon.github.io/Encore/audio-test/ . Les captures acceptées en 0.10.0 ne constituaient pas une validation suffisante : textes superposés et scène comprimée étaient encore visibles.

Survol et focus du choix de classe lime. Les cinq tuiles de départ de chaque classe sont des boutons de consultation : infobulle commune au survol, au focus ou au toucher, sans sélection de classe ni explosion décorative. Infobulles contenues dans le téléphone, avec défilement si nécessaire.

Les originaux batteur sont des PNG de 1254 px, détaillés. Suppression de la miniature intermédiaire 256 px ; conservation des pixels originaux détourés, recadrage des marges transparentes et affichage par image native. Les fichiers originaux restent inchangés. Les cartes batteur réservent des zones séparées pour illustration, nom et résumé compact sur deux lignes ; portée courte et valeurs avec StatIcon, règle complète dans les détails. Pas de modification du moteur ou des valeurs.

Reveal : fond sombre, navigation masquée, footer de scène réservé. Sa hauteur est calculée depuis le bas du corps de l'écran, qui contient le décor, au lieu du bas de la console ; la scène ne commence plus derrière les compteurs. La pige, les explosions, points flottants, chronologie et alternance des joueurs sont conservés.

Validation : npm run check et 139 tests réussis. Navigateurs 320×700 et 500×920 : survol lime, infobulle de départ, limites du téléphone, 18 illustrations chargées à plus de 256 px, absence de chevauchement art/nom/valeurs, captures françaises et anglaises inspectées. Reveal en mouvement normal vérifié en solo et coop mixte : deux personnages, joueur actif alterné, partenaire au repos. Cinq chansons solo et coop, reconnexion/sauvegarde, succès vers Studio et départ ; cinq chansons de défaite contrôlée dans les deux modes, détail/bilan et nouveau départ solo. Aucun état utilisateur utilisé. Les effets audio n'ont pas fait l'objet d'une nouvelle écoute humaine ; leur chronologie n'a pas changé.

Client uniquement : serveur preview reste rules 6 / build 0.10.0 ; moteur et authentification inchangés. Principal reste 0.9.9. Publication réservée à la preview pour validation utilisateur.

## Batteur V1 et packs séparés 0.10.0

Base `dba8ed1`, branche `preview/audio-0.9.0`, URL de validation publique : https://jutrasimon.github.io/Encore/audio-test/ . Intégration depuis le pack utilisateur Batteur V1, sans repartir de son ancienne référence de dépôt.

Deux classes sélectionnables avant la tournée. Classe confirmée et état prêt individuels ; changement de classe remet uniquement son propriétaire à non prêt. En coop, doublons autorisés et lancement par l'hôte après les deux confirmations. Les kits sont créés une fois au start autoritaire. Le solo passe du choix à l'introduction puis Monter sur scène. Les anciennes sauvegardes conservent leurs instances, charges et niveaux ; classe guitariste par défaut, ancien lobby avec inventaire conservé et classe verrouillée.

36 types : 18 guitariste, 18 batteur. La dernière instruction utilisateur remplace le pool partagé du guide : draft et Ajouter au Studio utilisent le pack de la classe. `TILE_PACKS.neutral` existe mais reste vide ; le choix ultérieur d'un nombre égal de tuiles provenant des deux packs n'a pas été fait. Aucune nouvelle catégorie Studio. Les ponts Guitare/Voix du batteur conservent leur définition, avec leur intérêt à revoir lors de cette sélection neutre.

Moteur : portées rangée/colonne/croix, instantané des états actifs, gains de charges avant seuils, bonus avant multiplicateurs propres Q/É, rejoués additifs sans relancer les effets, charges réinitialisées seulement au prochain show. Patch suit la définition (rangée Q, colonne É), pas l'exemple inversé. Larsen inclut les cases vides ; Botte garde le calcul existant (production propre), contrairement à l'annexe du guide. Objectifs, draft, trois catégories Studio et défaite terminale conservés.

Portrait et six poses selon la classe, ancres au sol, cadence du batteur sur le clock du reveal, poses de résultat prioritaires, partenaire inactif immobile, repli portrait si la planche échoue. PNG individuels : clé magenta ciblée au chargement, thumbnail canvas en cache ; Patch à alpha natif et portrait opaque non détourés. Rendu de tuiles commun, noms/types/valeurs en HTML, famille Percussion distincte. Textes français/anglais dans le catalogue.

Validation : 139 tests réussis et npm run check. Tests moteur solo et coop sur cinq chansons, succès/Studio et échec terminal, sauvegardes anciennes/nouvelles, packs exclusifs, charges, seuils, multiplicateurs, rejoués, migration et concurrence HTTP. Navigateurs locaux dans des profils temporaires sur un serveur en mémoire : cinq chansons solo batteur avec rechargement, victoire 44/52 et Studio ; cinq chansons coop mixte, victoire 85/86, changement de classe individuel, reconnexion, confirmation des deux joueurs et départ Studio des deux joueurs. Parcours négatifs de cinq chansons avec inventaires vides contrôlés en solo et coop : verdicts de défaite, absence de Studio ; détail, bilan et nouveau départ solo. Aucune erreur JavaScript relevée. Écrans mobiles 320×700, galerie des 18 illustrations sur panneaux clairs/sombres, portraits et deux personnages de résultat inspectés. Ces fixtures ne modifient aucune sauvegarde utilisateur ni room distante existante.

Équilibrage indicatif dans `docs/drummer/balance-v1.json`, script de reproduction adjacent : 100 graines identiques et même stratégie de sélection. Premiers shows gagnés : guitariste 72/100, batteur 100/100 ; deuxième 36/72 et 90/100 ; troisième 2/36 et 5/90 parmi les survivants. Ce n'est pas une mesure humaine ni une preuve d'équilibre ; chiffres V1 conservés pour essai utilisateur.

Serveur preview `encore-preview` version 2 publié : protocol 2, rules 6, build 0.10.0. Quatre fichiers relus et identiques au bundle local, table/RPC de preview et authentification de membre existantes conservées. Principal `encore` vérifié inchangé : rules 4 / build 0.9.9. Aucun déploiement main.

## Anglais par défaut 0.9.24

Base `db73938`, branche `preview/audio-0.9.0`. Sans préférence enregistrée, l'application démarre en anglais. Un choix existant Français / English reste prioritaire ; les sauvegardes de partie et les règles ne changent pas. Document initial en anglais, puis langue enregistrée appliquée au démarrage. Les trois salles continuent de boucler à difficulté croissante après le niveau 3, sans limite de niveau.

Validation : npm run check et 123 tests réussis. Accueil local vérifié dans le navigateur : anglais, titre anglais et version 0.9.24. Aucun nouveau parcours complet de tournée dans le navigateur pour ce changement de préférence initiale.

## Localisation français/anglais et couches Stats 0.9.23

Base `c649b4c`. Les décors de dernière chanson ne sont montés que dans la vue de jeu. Console isolée, panneaux au niveau 1 et actions/navigation au niveau 2, au-dessus du décor : les taches ne passent plus devant Stats.

Réglages accessibles depuis l’accueil ; sélecteur Français / English, français par défaut. Préférence `encore.language` avec le préfixe de sauvegarde existant (`audio-preview.` en preview), indépendante des parties et des autres clients. Changement immédiat, sans commande serveur, sans rechargement, musique continue. Attribut lang du document, titre de page, accessibilité, nombres des graphiques, annonces de chanson/nom/verdict suivent la langue. Les noms saisis par les joueurs sont explicitement exclus de la traduction, y compris un nom identique à une statistique.

Catalogue central `dist/locales/en.tsv` (source française → anglais) compilé par `scripts/build-locales.mjs` pendant `npm run check` vers `dist/locales/en.js`. `dist/i18n.js` traduit uniquement la présentation et conserve les textes d’origine pour le retour au français ; observer limité aux textes et attributs accessibles, sans changement de datasets, valeurs de champs, identifiants ou état de jeu. Les descriptions de tuiles sont traduites avant l’enrichissement typographique pour préserver les phrases complètes. Noms/règles des 18 tuiles, trois salles, états coop, Studio, inventaire/focus, bilans, règles, messages réseau et annonces couverts. Les données moteur et messages serveur sources restent en français ; aucun déploiement serveur requis.

Validation : 123 tests (parcours moteur cinq chansons solo/coop, succès/échec, Studio, sauvegardes ; catalogue complet des tuiles/salles, langue de repli, chiffres/identifiants conservés, annonces vocales bilingues et descriptions sans mutation). Navigateur local : passage anglais depuis l’accueil, persistance au rechargement, reprise en lecture d’une sauvegarde existante, verdict/Studio/Stats/règles traduits, retour français sans rechargement ; aucun décor de chanson dans Stats. Test isolé d’un joueur nommé Qualité : nom inchangé et statistique Quality, puis retour français correct. Réglages à 320 × 700 sans débordement. Aucun choix de Studio ni état de partie modifié pendant ces contrôles ; pas de nouveau parcours complet coop navigateur. Preview : https://jutrasimon.github.io/Encore/audio-test/ ; principal et serveur conservés.

## Lisibilité et reveal individuel 0.9.22

Base `c7b8200`. Titre Stats du band sur une ligne, même hauteur réservée que les profils individuels. Bordure, bandeau et halo d’infobulle suivent la couleur du type. Stickers miniatures retirés des onglets Studio. Accélération du reveal calculée sur le temps local de chaque joueur, jamais sur le temps cumulé des deux prestations.

À la fin de l’effet de chaque tuile, son total qualité + énergie + fans (redéclenchements inclus) apparaît au centre de sa case avec un éclat de particules, dans la police des annonces GREAT/AWESOME. Il reste suspendu et rétrécit progressivement jusqu’à la fin de la prestation ; nettoyage au changement de joueur et à l’arrêt du reveal. En mouvement réduit, chiffre fixe sans explosion ni déplacement. Aucune modification des règles, de l’état sauvegardé ou du serveur.

Validation : syntaxe et 117 tests, dont mêmes durées pour deux prestations identiques et conservation des scores. Page de composants locale sans sauvegarde : titre sur une ligne, aucun sticker Studio, contour/bandeau d’infobulle Effet cyan (120,211,223), total 20 suspendu puis réduit à 45 %, disparition au nettoyage, aucune erreur console. Le chargement d’une fixture dans la sauvegarde solo locale a été refusé par la revue automatique pour risque d’écrasement ; validation remplacée par une page isolée sans accès aux sauvegardes. Pas de nouveau parcours complet solo/coop en navigateur pour cette passe. Preview : https://jutrasimon.github.io/Encore/audio-test/.

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
