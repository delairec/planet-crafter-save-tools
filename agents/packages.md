# Créer, renommer ou supprimer un package, ajouter une dépendance

Matrice de dépendances par préfixe (appliquée, voir les instructions `~/.ai`) : `core-*` → `shared-*`, `util-*` ;
`util-*` → aucune ; `cli-*` → `shared-*`, `util-*`, `core-*` ; `ui-*` → `shared-*`, `util-*`, `core-*` ;
`shared-*` → `util-*`. Elle est vérifiée par `bun run check:dependencies` et documentée dans le `README.md` public :
elle n'est pas recopiée dans le corpus.

**Ce que fait chaque package est dans le corpus** : `awawa status PACKAGE .`, puis `awawa show @PACKAGE.<Nom> .`.
Ne pas tenir la liste ici en double.

Note historique : `util-parsing`, `util-messages` et `shared-mapping` ont été dissous, `util-platforms` renommé
`shared-platforms`. Ne pas les recréer, ni créer un nouveau package `util-*` sauf helper réellement générique
(@DECISION.DissolvedPackagesAreNotRecreated).
