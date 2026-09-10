> Historique : remplacé par [audio-0.9.1-handoff.md](audio-0.9.1-handoff.md). Les animations demandées sont maintenant autorisées et implémentées.

# ENCORE 0.9.0 audio : point de reprise

## Périmètre confirmé le 10 septembre 2026

- Dépôt : https://github.com/jutrasimon/Encore
- Branche de test : `preview/audio-0.9.0`.
- Base vérifiée sur GitHub : `7deaa19e65605cb58be815255fbfa3abccc2f311` (0.8.2).
- Audio préparé dans le commit local `930d22d`, preview dans `cf57d5c`.
- Simon demande la publication de cette version audio pour la tester. Les nouvelles animations, distorsions et modifications de gameplay restent en pause.
- La branche `main` ne reçoit pas ces changements.

## Contenu

Trois pistes DJARTMUSIC fournies, musique de menus, sons JDSherbert et licence,
foule synthétique, annonces Song one à Song five, fondus et baisse de musique
pendant les voix, réglages musique / effets / voix. Version visible : 0.9.0.
Les annonces de noms sont celles de la version audio préparée ; la demande
ultérieure de voix façon Mortal Kombat reste à traiter après le test.

## Publication et essai

- URL prévue : https://jutrasimon.github.io/Encore/audio-test/
- `.github/workflows/audio-preview.yml` teste la branche puis assemble le `dist`
  de `main` avec cette preview dans le sous-dossier `audio-test/`.
- Les sauvegardes locales de la preview utilisent le préfixe `audio-preview.`.
- Le serveur multijoueur existant est partagé ; aucun changement serveur requis.
- L'ouverture du jeu exige une interaction pour débloquer le son du navigateur.
- `npm run check` et les 66 tests de `npm test` passent le 10 septembre 2026.
- Les essais sur appareils réels et le jugement du mix restent à Simon.
- Un déploiement ultérieur de `main` peut retirer ce sous-dossier : relancer une
  publication de la branche de test si nécessaire.

## Continuer sans perdre le fil

Vérifier le SHA réel de la branche sur GitHub et le résultat de son workflow
avant d'annoncer un déploiement. Le `git push` local ne dispose pas d'identifiants
GitHub dans cet environnement ; le connecteur GitHub permet de créer les blobs,
l'arbre, le commit et de déplacer la branche en avance rapide. Transférer les
fichiers binaires par programme, sans afficher leur contenu base64 dans la
conversation. Ne pas repartir d'une ancienne copie dans `/workspace/sites`.
