# État courant : ENCORE 0.9.9

Correctif du 10 septembre 2026, basé sur `main` 3fd49f6 (0.9.8).

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
- Le navigateur distant ne peut pas ouvrir le serveur localhost de cette session. Les essais visuels se font sur la preview publiée.
- Les sources n’ont aucune dépendance npm. Le connecteur GitHub peut publier avec Git Data si le terminal n’a pas d’identifiants. Ne jamais afficher les binaires en base64.

## Suite connue

La demande d’icônes qualité/énergie dans les textes des tuiles n’est pas incluse dans ce correctif de progression.
