# Supprimer un document de `docs/` ou toucher l'index des règles du README

**Un document de `docs/` n'est supprimé qu'une fois toutes ses citations repointées**
(@DECISION.ADocumentIsDeletedOnlyWhenEveryCitationIsRepointed). Compter ses citations dans les deux mondes :
`awawa lint --strict .` voit les ancres du corpus et rien d'autre ; `grep -rn '<nom du document>' .` trouve les
commentaires de code, le README et les autres documents, que rien ne signale. Un commentaire de code cite alors l'entité, jamais
le document : `@see @RULE.TheSaveOnPrimeBecomesSaveA`.

**Les règles de fusion vivent dans le corpus, y compris pour le lecteur public**
(@DECISION.MergeRulesHaveOnePublicHome) : `awawa show @RULE.<Nom> .` en imprime une.
