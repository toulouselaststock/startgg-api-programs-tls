# Mettre à jour le classement

## Installation

1) Installer [Git for Windows](https://git-scm.com/download/win) (vous inquiétez pas, y aura pas de trucs compliqués à faire avec, c'est juste pour avoir un terminal) 

2) Installer [NodeJS](https://nodejs.org/en) (télécharger "Node.js (LTS)")
3) Clic droit sur le dossier dans lequel vous voulez placer le programme de l'occitour -> Open Git Bash here
4) Un terminal s'ouvre, entrez-y
   ```bash
   git clone https://github.com/toulouselaststock/startgg-api-programs-tls --recurse-submodules
   ```
   Puis
      ```bash
   cd startgg-api-programs-tls 
   ```
   Puis
   ```bash
   ./install.sh
   ```

## Utilisation

### Mise à jour des score
1) Ouvrir le tableur des tournois [(lien disponible sur le serveur discord)](https://discord.com/channels/1179434769453416470/1182776962519928913/1209255727022219364), et copier le tableau (à partir de la case "Nom Tournoi", jusqu'à la dernière case remplie).  
   Ouvrir le fichier `startgg-api-programs-tls/Occitour/events.txt`, et y coller le tableau (remplacer tout le contenu). Pour vous assurer que vous avez bien fait la copie, vérifiez que le format reste le même (les premières lignes ne devraient pas changer par exemple)

2) Si le terminal n'est pas déjà ouvert dans le bon dossier, clic droit sur le dossier startgg-api-programs-tls  -> Open Git Bash here
3) Taper
   ```bash
   ./occitour.sh
   ```
   Le programme va vous demander un mot de passe, trouvable [sur le serveur discord](https://discord.com/channels/1179434769453416470/1192829393198919690/1227254753637961738)  
   (il prend quelques minutes)   

   Puis
   ```
   ./occitour.sh upload
   ```
   qui vous demandera également un mot de passe, c'est le même que précédemment. 

   Une page devrait s'ouvrir dans votre navigateur, avec le classement calculé. C'est surtout utile pour [la partie suivante](#poster-le-classement-sur-discord).

   Le site sera mis à jour automatiquement dans les 24h.

### Poster le classement sur discord 
1) Copier le token du bot discord [sur le serveur discord de l'orga](https://discord.com/channels/1179434769453416470/1192829393198919690/1227258409749844008)
2) Coller sont contenu dans `startgg-api-programs-tls/Occitour/discord/secrets.json`
3) Entrer un message, qui sera ajouté au début du post, dans `startgg-api-programs-tls/Occitour/discord/message.txt`. N'hésitez pas à vous baser sur la preview du classement qui s'est ouverte quand le calcul de celui-ci s'est terminé (si vous l'avez fermé, vous pouvez le trouver dans `startgg-api-programs-tls/Occitour/preview/page/index.html`).
4) Dans le terminal, entrer
   ```bash
   ./occitour.sh discord
   ```

### Bannir un joueur
Dans le terminal, entrer 
```bash
./occitour.sh  ban
```

Puis le nom et le slug start.gg du joueur en question. Le slug est trouvable sur la page de profil start.gg du joueur. Le nom n'est pas réellement important, on le garde dans la base de données juste pour se rappeler de qui est qui.