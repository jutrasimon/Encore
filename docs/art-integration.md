# Illustrations de shows (V1)

Intégration visuelle 0.9.12, à partir de `ENCORE-Images-V1.zip` et du portrait fourni le 11 septembre 2026. Les PNG sources sont conservés sans retouche dans `dist/art/stage/`.

- `dist/show-art.js` : `CLASS_ART` associe portrait, poses et microphone à `guitarist-singer`. `SHOW_ART` associe les trois lieux et les rectangles de foule à l’ordre des shows. Les lieux se répètent sans changer leur difficulté.
- `ShowVisual` reçoit les états de présentation. Il ne commande jamais le moteur. Le jeu appelle son rendu depuis sa boucle de résolution existante ; aucun timer supplémentaire ne tourne entre les chansons.
- Le magenta des couches est retiré une seule fois à la résolution d’origine, puis mis en cache en mémoire. Les intros et fonds lointains restent opaques. Une image manquante ne bloque pas la partie. Un numéro de génération ignore les chargements d’un écran quitté.
- Ordre : fond, plateau, halo, personnage, microphone, premier plan, foule, expressions. Le cadrage utilise les 512 pixels inférieurs, une cellule de personnage de 435 px et les pieds à y=930. Les poses de foule conservent leur échelle et leur ancrage inférieur.
- Chant et riff suivent la famille de la tuile révélée. La pose de fin est prioritaire, conservée après rechargement. Les animations réduites figent la foule et les actions. Le canvas laisse passer les clics.
- `dist/polish.css` : `.show-visual` réserve la place sous la grille et réduit la bande sur les écrans bas. `.show-intro-art` cadre la présentation.
- `dist/art-preview.html` : atelier indépendant pour examiner les trois lieux, les six poses, l’overdrive, la pause et le mouvement réduit aux largeurs 320, 390 et 460. Aucune sauvegarde de jeu n’y est utilisée.

Les assets du lot représentent environ 43 Mo. Ils sont chargés à la demande et mis en cache par le navigateur ; la première scène peut donc arriver après l’interface sur une connexion lente. Une optimisation de livraison des textures pourra être faite séparément sans remplacer les originaux de l’artiste.
