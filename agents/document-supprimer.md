# Supprimer un document de `docs/` ou toucher l'index des règles du README

**Un document de `docs/` n'est supprimé qu'une fois toutes ses citations repointées.** Un document n'est gardé que
tant qu'il porte un fait qu'aucune autre maison ne tient ; mais avant de le supprimer, compter ses citations dans les
deux mondes. `awawa lint --strict .` voit les ancres du corpus et rien d'autre ; `grep -rn '<nom du document>' .`
trouve les commentaires de code, le README et les autres documents, que rien ne signale. Mesuré le 2026-09-18 à la
suppression de `docs/game-rules.md` : 6 ancres du corpus levées par `L016`, contre 24 commentaires de code, 13 lignes
du README et 2 liens entre documents qu'aucune commande n'a vus. Un commentaire de code cite alors l'entité, jamais
le document : `@see @RULE.TheSaveOnPrimeBecomesSaveA`
(@DECISION.ADocumentIsDeletedOnlyWhenEveryCitationIsRepointed).

**Les règles de fusion vivent dans le corpus, y compris pour le lecteur public.**
`docs/awawa-project-specification/rules.awawa` est leur maison publique unique : le fichier est du texte simple et se
lit tel quel, `awawa show @RULE.<Nom> docs/` en imprime une. Le README en tient l'index — une ligne par sujet nommant
la `RULE` — et ne redit aucune règle (@DECISION.MergeRulesHaveOnePublicHome).
