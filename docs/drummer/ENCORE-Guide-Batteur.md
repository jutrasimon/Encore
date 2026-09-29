# ENCORE - Batteur-percussionniste

Pack V1 - Proposition de design et guide programmeur

12 septembre 2026


## 1. Ce que livre ce pack

Une classe proposée : Batteur-percussionniste. Dix-huit nouvelles tuiles, organisées en trois modules de six. Le catalogue passerait de 18 à 36 types uniques; les copies du kit de départ ne s’ajoutent pas au nombre de types.

Visuels : une planche de six poses (1536 × 1024), un portrait (1254 × 1254) et dix-huit illustrations individuelles (1254 × 1254). La planche et ses cellules ont exactement les dimensions de la référence guitariste. Les proportions graphiques sont rapprochées, mais les silhouettes ne sont pas des squelettes identiques.

Les règles chiffrées sont une proposition de design à équilibrer. Ce dossier ne modifie aucun dépôt, serveur, score ou écran du jeu. Le JSON est une spécification, pas un module exécutable à importer directement.


## 2. Identité de la classe et départ

Promesse joueur : « Fais circuler le rythme dans tes rangées et tes colonnes. Même les trous peuvent travailler pour toi. » Aucun passif supplémentaire en V1 : l’identité vient des tuiles de départ et des synergies.

Kit initial : 2 × Grosse caisse, 2 × Caisse claire, 1 × Charleston. Chaque copie possède son identifiant d’instance; les charges et les niveaux sont portés par cette instance.

Les placements restent ceux du jeu existant. Ne pas ajouter de déplacement manuel pour cette classe. Toutes les familles peuvent entrer dans son inventaire; les nouvelles tuiles peuvent aussi être obtenues par le guitariste.

V1 de test : les trois modules sont disponibles dans le pool de récompenses partagé lorsque la fonctionnalité Batteur est activée. Les modules servent à organiser le design; ils ne créent pas trois menus ni de nouveaux choix obligatoires. Un déblocage persistant par module pourra venir ensuite, avec des règles à approuver.


## 3. Choisir la classe au début

Nouvelle partie → lobby → choix individuel de classe → prêt → départ de la partie → introduction du premier show. En solo, le bouton de confirmation peut enchaîner directement vers le départ existant.

Afficher deux cartes : Guitariste-chanteur et Batteur-percussionniste. Chaque carte contient portrait, promesse, aperçu des cinq tuiles de départ et bouton « Choisir cette classe ». Ne pas transformer ce choix en achat.

Mémoriser classId par joueur. En coopération, autoriser les doublons. Changer de classe remet uniquement ce joueur à non prêt. Verrouiller le choix quand la partie commence; le serveur valide la classe et crée les cinq instances une seule fois.

Le bouton Prêt reste indisponible tant que la classe n’est pas choisie. Ne pas confondre la carte survolée avec la sélection confirmée. Pour une ancienne sauvegarde sans classId, utiliser le guitariste comme valeur de compatibilité sans recréer son inventaire.

Reconnexion : restaurer classe, inventaire, charges et état depuis l’état autoritaire. Afficher la classe sur le portrait du joueur, la fiche Band et le résumé de lobby. Garder les destinations et les conditions de départ existantes.


## 4. Vocabulaire spatial sans ambiguïté

Dans les exemples : lettres A/B/C = rangées, chiffres 1/2/3 = colonnes. Rangée = toutes les cases de la même coordonnée y. Colonne = toutes les cases de la même coordonnée x. « Alignée » = même rangée OU même colonne, sans diagonale et sans double comptage. Une case vide ne coupe jamais la portée.

Une tuile active existe sur la grille et n’est ni désactivée, ni déjà épuisée. « Espace » = case vide OU occupée par une tuile désactivée. Ces deux états restent distincts en stockage, mais comptent exactement pareil pour tous les effets d’espace.

La tuile source n’est incluse que si le texte l’indique. Les bonus aux « autres » excluent toujours la source. Les cases hors grille ne comptent pas comme des espaces.

« Axe plein » = chaque case de cet axe contient une tuile active. Seul Crash final demande cela pour son bonus; aucune autre tuile n’exige de remplir un axe.

Une désactivation ou un épuisement provoqué à la fin de la chanson ne crée pas un espace pendant cette même résolution. Travailler sur un instantané commun de la grille au début de la résolution.

Harmoniser Larsen délicieux avec la demande du designer : +3 énergie par case vide OU désactivée adjacente. Fumée utilise déjà ce regroupement. Tester ce changement séparément des nouvelles tuiles.


### Module Fondations

| ID | Tuile | Type | Pouvoir de base | Amélioration |
|---|---|---|---|---|
| `perc_kick` | Grosse caisse | Percussion | Produit 1 énergie par tuile active de sa rangée, elle-même comprise. | +1 énergie propre / niveau |
| `perc_snare` | Caisse claire | Percussion | Produit 1 qualité par tuile active de sa colonne, elle-même comprise. | +1 qualité propre / niveau |
| `perc_hihat` | Charleston | Effet | Les autres Percussions actives de sa rangée ou de sa colonne gagnent +1 qualité et +1 énergie avant les multiplicateurs. | +1 énergie propre / niveau |
| `perc_floor_tom` | Tom de plancher | Percussion | Produit 2 qualité, puis +1 qualité par autre Percussion active de sa rangée. | +1 qualité propre / niveau |
| `perc_ride` | Ride de traverse | Percussion | Produit 2 énergie, puis +1 énergie par autre Percussion active de sa colonne. | +1 énergie propre / niveau |
| `perc_crash` | Crash final | Percussion | Produit 2 qualité et 2 énergie. Si toutes les cases de sa rangée OU de sa colonne sont actives, gagne +2 qualité et +2 énergie, une seule fois. | +1 qualité propre / niveau |

Les pouvoirs de soutien ne gagnent pas en intensité avec le niveau dans cette V1.


### Module Montée

| ID | Tuile | Type | Pouvoir de base | Amélioration |
|---|---|---|---|---|
| `perc_roll` | Roulement tenace | Percussion | Gagne 1 charge à chaque apparition active. Produit autant d’énergie que son nombre de charges après tous les gains. Ne dépense pas ses charges. | +1 énergie propre / niveau |
| `perc_measure` | Mesure explosive | Percussion | Gagne 1 charge à chaque apparition active. Après les gains, si elle possède au moins 3 charges, en dépense 3 et produit 12 qualité. Sinon, produit 0 qualité de base. Une seule dépense par apparition. | +1 qualité propre / niveau |
| `perc_metronome` | Métronome trafiqué | Effet | Donne +1 charge aux autres tuiles actives à charge de sa rangée ou de sa colonne, avant leur production et leurs dépenses. Toutes familles admissibles. | +1 énergie propre / niveau |
| `perc_double_pedal` | Double pédale | Effet | Double l’énergie produite par les autres Percussions actives de sa rangée, après les bonus additifs. | +1 énergie propre / niveau |
| `perc_rimshot` | Rimshot précis | Effet | Double la qualité produite par les autres Percussions actives de sa colonne, après les bonus additifs. | +1 qualité propre / niveau |
| `perc_fill` | Fill de panique | Effet | Fait rejouer une fois la production finale des autres Percussions actives de sa rangée ou de sa colonne. S’épuise après la chanson. | +1 énergie propre / niveau |

Les pouvoirs de soutien ne gagnent pas en intensité avec le niveau dans cette V1.


### Module Maillage

| ID | Tuile | Type | Pouvoir de base | Amélioration |
|---|---|---|---|---|
| `perc_riff_bridge` | Riff en cadence | Percussion | Produit 1 qualité, puis +2 qualité par Guitare active de sa rangée ou de sa colonne. | +1 qualité propre / niveau |
| `perc_voice_bridge` | Chant scandé | Percussion | Produit 1 énergie, puis +2 énergie par Voix active de sa rangée ou de sa colonne. | +1 énergie propre / niveau |
| `perc_brushes` | Balais de garage | Percussion | Produit 1 qualité, puis +2 qualité par case vide ou désactivée de sa rangée. | +1 qualité propre / niveau |
| `perc_silence` | Silence qui cogne | Percussion | Produit 1 énergie, puis +2 énergie par case vide ou désactivée de sa colonne. | +1 énergie propre / niveau |
| `perc_patch` | Patch de répétition | Effet | Les autres tuiles actives de sa rangée gagnent +1 qualité. Celles de sa colonne gagnent +1 énergie. Toutes familles admissibles; bonus avant multiplicateurs. | +1 énergie propre / niveau |
| `perc_backstage` | Bracelet des loges | Effet | Produit 1 fan par famille différente parmi les autres tuiles actives de sa rangée ou de sa colonne. | +1 fan propre / niveau |

Les pouvoirs de soutien ne gagnent pas en intensité avec le niveau dans cette V1.


## 5. Ordre de calcul à intégrer

1. Capturer la grille et les états actifs au début du reveal. Résoudre les portées à partir des coordonnées et des identifiants d’instance.

2. Donner +1 charge d’apparition à chaque instance active à charge. Puis additionner les apports de Gobelet et Métronome. Chaque source ne compte qu’une fois par cible. Une tuile désactivée ne reçoit aucune charge.

3. Calculer les productions de base, les bonus de comptage et les seuils de charge. Mesure explosive dépense 3 charges au maximum une fois, puis conserve le reste. Le Roulement lit les charges après tous les gains.

4. Ajouter les bonus de niveau et les bonus additifs (Médiator, Charleston, Patch, Botte existante). Pour chaque nouvelle tuile, ajouter +1 de upgradeStat par niveau au-delà du niveau de base. Cela augmente sa production propre; cela ne renforce pas son pouvoir de soutien.

5. Appliquer les multiplicateurs existants sur leurs familles actuelles; appliquer Double pédale à l’énergie des Percussions et Rimshot à leur qualité. Plusieurs sources de ×2 se multiplient : deux sources donnent ×4. Les bonus additifs se cumulent avant.

6. Appliquer les rejoués à la production finale mémorisée : total = production × (1 + nombre de rejoués). Deux Fill donnent deux copies supplémentaires, soit ×3, pas ×4. Un rejoué ne relance ni soutien, ni charge, ni dépense, ni rejoué.

7. Additionner qualité, énergie et fans. Puis appliquer épuisements et désactivations, et demander au flux existant la transition appropriée. Réinitialiser les charges au début du prochain show comme les charges existantes, pas entre deux chansons.

Percussion est une nouvelle famille. Une illustration contenant une guitare ou un micro ne change pas la famille. Médiator, Botte, Bouton interdit et Encore conservent leurs cibles actuelles; Métronome et Gobelet ciblent le trait charge, quelle que soit la famille.


## 6. Animation et cadrage du personnage

La planche est une grille 3 colonnes × 2 rangées. Index 0 Rythme, 1 Accent, 2 Fill, 3 Content, 4 Neutre, 5 Triste. Rectangles exacts dans data/assets-manifest.json. Ancres mesurées : x = 256; y = 508, 508, 508, 496, 497 et 498 selon l’index. Le manifeste contient aussi les ancres de la référence guitariste.

Utiliser la même taille de cellule à l’affichage que le guitariste. Ne pas recadrer chaque silhouette sur sa boîte englobante : cela ferait varier sa taille entre les poses. Positionner les ancres de chaque pose sur le même point au sol; ne pas étirer.

Rythme : index 0 au repos. Pendant un reveal de Percussion, alterner 0/1 toutes les 240 ms environ. Utiliser index 2 pour un événement fort explicitement fourni par le jeu (overdrive ou Fill), puis revenir à 0 à la fin du reveal.

Priorité : résultat officiel > événement fort > action Percussion > rythme. Content/Neutre/Triste sont choisis uniquement depuis l’état officiel. Ne pas déduire un résultat à partir du sprite ni déclencher de transition depuis une animation.

Le tambour et les baguettes sont intégrés aux poses. Le batteur n’utilise pas le micro sur pied du guitariste. L’artiste, les traits BD et la foule restent derrière l’interface; pointer-events: none. Ne rien placer au-dessus des scores, boutons ou tuiles.

Arrêter les timers au démontage; respecter pause et prefers-reduced-motion. En mouvement réduit, afficher une pose fixe correspondant à l’état. Éviter les effets clignotants permanents. Les animations n’attendent jamais une image pour calculer un résultat.


## 7. PNG, détourage et icônes

Les sources ne sont pas toutes transparentes. La planche du batteur et 17 illustrations de tuiles ont un fond magenta opaque. Patch de répétition a un alpha natif. Le portrait est opaque, fond olive. Le manifeste donne le mode exact par fichier.

Utiliser dev/asset-loader.js pour retirer le magenta une seule fois au chargement et mettre le canvas en cache. Ne pas traiter le portrait ni les images native_alpha. Servir les fichiers sur la même origine ou avec CORS autorisé.

Le détourage fourni vise le fond magenta saturé, pas toute couleur rose. Les sources ont des contours crème opaques; quelques pixels de frange peuvent demander une retouche d’export pour la production. L’aperçu sert à les examiner sur fonds clair et sombre.

Les nouvelles illustrations sont des PNG carrés individuels. L’ancien atlas contient des découpes irrégulières : ne pas réutiliser ses coordonnées pour ces fichiers. Conserver le composant de tuile existant et sa boîte d’icône; l’aperçu utilise 64 pixels CSS à titre de comparaison.

Noms, famille, niveau, valeurs, charges et marqueur d’épuisement restent en HTML/UI réelle. Les PNG ne contiennent aucun texte fonctionnel. Utiliser object-fit: contain ou l’équivalent canvas; ne pas agrandir la carte pour la nouvelle classe.

Les libellés PERCUSSION et EFFET doivent rester écrits. Ne pas compter sur le cyan seul, déjà présent dans les effets existants, pour distinguer les familles. Réutiliser les icônes de stats déjà approuvées dans le jeu.


## 8. Travaux pour le programmeur

Ajouter la définition de classe, le starter et classId dans les modèles joueur et sauvegarde. Ajouter la sélection au lobby et la validation côté serveur. Préserver les anciennes sauvegardes et l’inventaire lors des reconnexions.

Ajouter percussion au catalogue des familles et aux filtres de collection. Transcrire new-tiles.proposal.json dans le format réel des TILES. Ajouter une valeur upgradeStat explicite; éviter le défaut « toute nouvelle famille gagne énergie ». Ne pas faire dépendre les pouvoirs de noms français.

Étendre le moteur et son équivalent serveur avec row, column, cross et space. Garder une seule définition des règles partagée si l’architecture le permet; sinon exiger des résultats identiques client/serveur sur les mêmes fixtures.

Dans le rendu art existant (dist/art.js dans la référence lue), ajouter la route vers les PNG individuels. L’ancien atlas et ses masques restent utilisables pour les 18 anciennes tuiles. Les fichiers source réels à modifier doivent être confirmés depuis l’outil de build du dépôt.

Ajouter les tuiles au pool existant de récompenses, sans créer de quatrième choix au Studio, sans remplacer le draft entre chansons et sans réécrire les transitions de show. Le lot ne change pas les objectifs des trois premiers lieux.

Ajouter les poses selon classId et les événements du reveal. Conserver une image de repli si le chargement échoue. Les résultats et les actions restent accessibles sans animation.

Intégrer sur la branche de prévisualisation prévue par le dépôt; comparer avec la référence dacdaefb168ac3a2b2027d543df8d68afc8505a5. Ne promouvoir vers main qu’après validation du jeu complet. Ce pack n’a pas fait ces modifications.


## 9. Cas de validation concrets

Portée trouée : Grosse caisse en A1, A2 vide, Guitare active en A3 → 2 énergie de base. Remplacer A2 vide par une tuile désactivée → toujours 2 énergie. La Guitare reste dans la portée.

Espaces : Balais en A1, A2 vide, A3 désactivée → 5 qualité. Remplacer A3 par une tuile active → 3 qualité. Une case hors grille ne compte jamais.

Charleston en B2 : Percussions en A2 et B1 → chacune reçoit +1 Q et +1 É. Percussion en A1 (diagonale) → aucun bonus. La source ne se soutient pas elle-même.

Patch en B2 : Guitare en A2 reçoit +1 Q; Voix en B1 reçoit +1 É. Les multiplicateurs de famille existants s’appliquent ensuite. Pas de cible double au centre, car la source est exclue.

Mesure avec 2 charges, active et alignée à un Métronome : 2 + 1 apparition + 1 soutien = 4; dépense 3 → 12 Q de base et 1 charge restante. Si un Fill la cible, total 24 Q avant autres bonus, toujours 1 charge restante.

Deux Métronomes alignés et un Gobelet adjacent apportent +4 charges au total à une cible active (+1, +1, +2), en plus de son gain d’apparition. Une cible désactivée reçoit 0.

Crash avec rangée pleine et colonne pleine → 4 Q + 4 É de base, jamais 6 + 6. Si les deux axes ont un trou, conserve 2 + 2.

Bracelet aligné à deux Guitares, une Voix et une Percussion → 3 fans, pas 4. Canard continue de compter les sortes de tuiles (kind), pas les familles.

Fin de show : victoire mène au flux existant; défaite reste terminale. Le choix de classe, le Studio, les récompenses et la reconnexion ne doivent pas dupliquer le starter ni réinitialiser des charges pendant le show.

Équilibrage : comparer les deux classes sur les mêmes graines et parcours des trois shows (34/32, 70/64, 122/110). Mesurer distributions Q/É, taux d’échec, intérêt des choix et pics ×4/rejoués. Aucun résultat d’équilibrage n’est affirmé par ce pack.


## 10. Livraison et statut

Ouvrir Apercu-Batteur.html via un serveur local dans le dossier extrait : python3 -m http.server 8080, puis http://localhost:8080/Apercu-Batteur.html. L’aperçu montre les images, les portées et les textes; il ne simule pas le moteur du jeu.

Les fichiers JSON séparent proposition de tuiles, catalogue de référence et métadonnées visuelles. Le guide Markdown contient la même spécification lisible et peut être copié directement au programmeur.

Vérification des assets : dimensions, modes de fond, présence des dix-huit illustrations et correspondance des identifiants. Le rapport dev/validation.json décrit les contrôles exécutés. L’intégration dans le vrai jeu et l’équilibrage restent à faire.


L’aperçu HTML n’a pas pu être exécuté dans le navigateur de cet environnement : Chromium absent et téléchargement indisponible. Sa syntaxe et ses fichiers ont été contrôlés; valider le rendu et les interactions dans le navigateur du projet.

## Annexe - Les 18 tuiles existantes

Référence du catalogue lu; ne pas les remplacer par les propositions ci-dessus.

| ID | Tuile | Type | Pouvoir |
|---|---|---|---|
| `guitar` | Six-cordes rafistolée | Guitare | 1 qualité, multipliée par 2 pour chaque Voix active adjacente. |
| `voice` | Micro cabossé | Voix | 1 énergie, multipliée par 2 pour chaque Guitare active adjacente. |
| `pick` | Médiator fétiche | Effet | Les Guitares actives adjacentes gagnent +1 qualité avant les multiplicateurs. |
| `boot` | Botte de tempo | Effet | Les Guitares et Voix actives adjacentes gagnent +1 énergie. |
| `lighter` | Briquet cheap | Effet | 1 énergie, puis +1 énergie par autre Briquet actif sur la grille. |
| `duck` | Canard de scène | Effet | 1 fan par sorte de tuile active adjacente différente (kind, pas famille). |
| `smoke` | Fumée de garage | Effet | 2 énergie par case vide ou désactivée adjacente. |
| `cup` | Gobelet suspect | Effet | Donne +2 charges aux tuiles actives à charge adjacentes, puis s’épuise après la chanson. |
| `refrain` | Refrain parasite | Voix | Gagne +1 charge par apparition active. Énergie = charges, multipliée par 2 par Guitare active adjacente. |
| `choir` | Chorale du fond | Effet | 1 énergie par Voix active sur la grille. |
| `last` | Une dernière! | Voix | 1 énergie, ou 6 pendant la dernière chanson; multipliée par 2 par Guitare active adjacente. |
| `solo` | Solo interminable | Guitare | 2 qualité, ou 6 si c’est le seul Solo actif; multipliée par 2 par Voix active adjacente. |
| `note` | Note teeeeenue | Guitare | Gagne +1 charge par apparition active. Dépense 3 charges si possible pour 12 qualité; multipliée par 2 par Voix active adjacente. |
| `pedal` | Bouton interdit | Effet | Double la production des Guitares actives adjacentes, puis s’épuise après la chanson. |
| `encore` | Encore! Encore! | Effet | Fait rejouer une fois les Guitares actives adjacentes, puis s’épuise après la chanson. |
| `kamikaze` | Guitare kamikaze | Guitare | 8 qualité, multipliée par 2 par Voix active adjacente. S’épuise après la chanson. |
| `amp` | Ampli à boutte | Effet | 8 énergie, puis se désactive pour le reste du show; peut encore apparaître sur la grille. |
| `feedback` | Larsen délicieux | Effet | Version lue : +3 énergie par tuile désactivée adjacente. Changement demandé à intégrer : +3 énergie par case vide OU désactivée adjacente. |