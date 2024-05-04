askPass() {
  read -e -s -p "Mot de passe serveur (c normal si rien s'affiche quand vous tapez) : " password
}

if [[ "$1" == "discord" ]]
then
    ./OcciTour/scripts/dl_results.sh
    ./OcciTour/scripts/discord.sh 1202647423533449297
    exit 0
elif [[ "$1" == "view-banlist" ]]
then
    ./OcciTour/scripts/banlist.sh view    
    exit 0
elif [[ "$1" == "ban" ]]
then
    ./OcciTour/scripts/banlist.sh add    
    exit 0
elif [[ "$1" == "fetch-ranking" ]]
then
    askPass
    ./OcciTour/scripts/dl_results.sh $password
    ./OcciTour/scripts/preview.sh
    exit 0
elif [[ "$1" == "ranking" ]]
then
    ./OcciTour/scripts/preview.sh
    exit 0
fi

askPass
./OcciTour/scripts/update_routine_preview.sh $password
