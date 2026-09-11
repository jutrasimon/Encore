# Illustrations de shows (V1)

Intégration visuelle 0.9.15, à partir de `ENCORE-Images-V1.zip` et du portrait fourni le 11 septembre 2026. Les PNG sources sont conservés sans retouche dans `dist/art/stage/`.

- `dist/show-art.js` : `CLASS_ART` associe portrait et poses à `guitarist-singer`. `SHOW_ART` associe les trois lieux et les rectangles de foule à l’ordre des shows. Les lieux se répètent sans changer leur difficulté.
- `ShowVisual` reçoit les états de présentation. Il ne commande jamais le moteur. Le jeu appelle son rendu depuis sa boucle de résolution existante ; aucun timer supplémentaire ne tourne entre les chansons.
- Le magenta des couches est retiré une seule fois à la résolution d’origine, puis mis en cache en mémoire. Les intros et fonds lointains restent opaques. Une image manquante ne bloque pas la partie. Un numéro de génération ignore les chargements d’un écran quitté.
- Ordre : fond, plateau, halo, personnage, premier plan, foule, expressions. Le cadrage utilise les 512 pixels inférieurs, une cellule de personnage de 435 px et les pieds à y=930. Les poses de foule conservent leur échelle et leur ancrage inférieur.
- Chant et riff suivent la famille de la tuile révélée. La pose de fin est prioritaire pendant la dernière séquence du reveal. Les animations réduites figent la foule et les actions. Le canvas laisse passer les clics.
- `dist/polish.css` : `.show-visual` occupe uniquement le pied du reveal, hors flux et sous les compteurs : elle ne réduit jamais la grille. Le jeu normal ne contient plus cette bande. `.show-intro-art` cadre la présentation.
- `dist/art-preview.html` : atelier indépendant pour examiner les trois lieux, les six poses, l’overdrive, la pause et le mouvement réduit aux largeurs 320, 390 et 460. Aucune sauvegarde de jeu n’y est utilisée.

Les assets du lot représentent environ 43 Mo. Ils sont chargés à la demande et mis en cache par le navigateur ; la première scène peut donc arriver après l’interface sur une connexion lente. Une optimisation de livraison des textures pourra être faite séparément sans remplacer les originaux de l’artiste.

Les covers sans personnage fournies ensuite sont stockées dans `shows/*/cover.png` ; les anciennes intros restent archivées. Elles sont opaques, indépendantes de la classe et préchargées. Le micro sur pied est retiré du registre, du chargement et du rendu. Le PNG original est conservé comme source inutilisée.

## Fin de show et dernière chanson

`dist/song-ui.js` rend les verdicts depuis les valeurs du moteur et orchestre uniquement les accents de présentation. Le personnage utilise les poses content/triste existantes de sa classe, avec un cadrage plus grand dans le verdict. La grille reste accessible via Voir le détail.

`dist/art/finale/` conserve les PNG fournis sans retouche : `song-banner.png` (2172 × 724), `splats.png`, `splats-alt.png` et `comics.png` (1536 × 1024). Ces trois planches ont six cellules de 512 × 512, affichées par fonds CSS à 300 % × 200 %. Leur alpha est conservé, notamment le rose. L’atelier affiche toutes les cellules sur fond clair et sombre. Les décorations en jeu restent dans les marges, sous les contrôles, et respectent le mouvement réduit.

## Statistiques 0.9.16

Les trois PNG originaux de 1254 × 1254 sont dans `dist/art/stats/`. `StatIcon(type, size=20, color='#fff3d3')` accepte quality, energy et fans, expose un libellé accessible et produit un masque CSS sans animation permanente. Les anciennes entrées icon(star/bolt/choir) délèguent à ce composant pour éviter les divergences entre écrans. Les limites alpha sont normalisées par dimension maximale, sans étirer ni réécrire les images ; couleurs héritées du contexte, crème dans les textes sombres, lime/orange/rose selon les panneaux.

## Duo et distribution 0.9.17

ShowVisual accepte `players` et `activePlayerId`. `stageCast` conserve l’ordre des joueurs, leurs rôles et leurs positions ; seul l’actif suit les poses de production. Les textures sont mises en cache par classe, sans rechargement à chaque tour. Le partenaire assombri reste visible. L’éclairage passe progressivement d’un musicien à l’autre en 300 ms ; le mouvement réduit applique le changement immédiatement. Le résultat concerne tous les personnages.

`dist/deal-ui.js` anime seulement les tuiles de la grille déjà calculée par le moteur. La distribution suit l’horloge de l’intro existante et se termine avant la première production. Pas de timer indépendant ni de second tirage. Le son est un petit impact synthétique à chaque pose, sous les réglages d’effets existants.
