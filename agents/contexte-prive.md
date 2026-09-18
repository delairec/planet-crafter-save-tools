# Lire une save ou un plan du dépôt privé

Organisation de `.do-not-commit/planet-crafter-save-tools/` :

- `plans/plan.md` — ce que le corpus ne dit pas : le protocole de vérification et ses mesures (md5 de la sortie de
  référence, forme de la sortie d'erreur). Ni les tâches, ni leur ordre : l'ordre est calculé à partir des `AFTER`
  du corpus, et la chronologie se lit dans git et dans les pull requests.
- `resources.md` — sources externes utiles au projet (identifiants de world objects, wiki, saves), décrites par ce
  qu'elles sont réellement et par ce qui y est fiable ou non. À enrichir au fil des sources rencontrées.
- `saves/` — saves de référence privées, fichiers très lourds (jusqu'à 3 Mo, 8 Mo au total) : ne les ouvrir que si
  la tâche l'exige, et jamais en entier. Ne jamais les copier dans l'arbre public.

**Rafraîchir le clone privé avant de lire une save ou un plan.** `.do-not-commit/` est un clone figé au dernier
`bun install`, et chaque worktree lié porte le sien : `bun run private:sync` (fetch plus fast-forward sur la branche
du projet). Le corpus, lui, ne demande plus rien — il est dans la branche.
