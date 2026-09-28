# Créer, renommer ou supprimer un package, ajouter une dépendance

La matrice de dépendances par préfixe est celle de @RULE.package_depends_on_allowed_kinds_only de `~/.ai`. Elle est
vérifiée par `bun run check:dependencies` et documentée dans `docs/wiki/architecture.md` : elle n'est pas recopiée
dans le corpus.

**Ce que fait chaque package est dans le corpus** : `awawa status PACKAGE .`, puis `awawa show @PACKAGE.<Nom> .`.
Ne pas tenir la liste ici en double.

Note historique : `util-parsing`, `util-messages` et `shared-mapping` ont été dissous, `util-platforms` renommé
`shared-platforms` (@DECISION.DissolvedPackagesAreNotRecreated).
