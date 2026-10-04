# Lire les fichiers du jeu

Ce qui se lit et ce qui se publie est @PROCESS.TheGameFilesAreReadByDecompilingTheirAssemblyInAScratchDirectory ;
ce fichier porte l'outil et la commande, pour qu'une vérification se refasse à l'identique.

## Prérequis

Le SDK `dotnet` et `ilspycmd` (`dotnet tool install -g ilspycmd`). L'un des deux manque : s'arrêter et le dire,
plutôt que lire le jeu par ses seules chaînes.

## Commandes

Le jeu est installé par Steam (application `1284190`), dans une des bibliothèques que liste
`~/.steam/steam/steamapps/libraryfolders.vdf` (lignes `path`). Dans cette bibliothèque, `<lib>` ci-dessous :

1. **La build** : `grep buildid <lib>/steamapps/appmanifest_1284190.acf`.
2. **La release** : `strings "<lib>/steamapps/common/The Planet Crafter/Planet Crafter_Data/globalgamemanagers" | grep -m1 -E '^[0-9]+\.[0-9]{3}$'`.
   Elle doit exister dans le corpus comme `@GAME_RELEASE.<release>` ; sinon la déclarer dans la même pull request.
3. **Décompiler**, dans le répertoire temporaire de la session, jamais dans le dépôt :

   ```
   ilspycmd -p -o <scratchpad>/decompiled "<lib>/steamapps/common/The Planet Crafter/Planet Crafter_Data/Managed/Assembly-CSharp.dll"
   ```

   La logique du jeu est sous `<scratchpad>/decompiled/SpaceCraft/`, un fichier par type.
4. **Chercher** par type et par membre (`grep -rn 'GetValue' <scratchpad>/decompiled/SpaceCraft/WorldUnitSystemTerraformation.cs`),
   ou par chaîne (`strings` sur l'assembly) pour une unité ou un libellé.

## Ce qui entre dans le dépôt

Le fait lu, la release, la build, la date et le type ou le membre qui le porte, dans le `SOURCE` de l'entité qu'il
établit ou réfute :

```
SOURCE "Game assembly Assembly-CSharp.dll of release 2.103, Steam build 25296421, decompiled on 2026-10-04:"
	+ "WorldUnitSystemTerraformation.GetValue folds the Ti of the planets in the order of the save"
	REF @GAME_RELEASE.2.103
```

Jamais une ligne de code décompilé, un fichier du jeu, ni un chemin du poste (`/home/...`).
