if [[ "$1" == "discord" ]]
then
    ./OcciTour/scripts/dl_results.sh
    ./OcciTour/scripts/discord.sh 1202647423533449297
    exit 0
elif [[ "$1" == "upload" ]]
then
    read -e -s -p "pass?" password
    ./OcciTour/scripts/upload_results.sh    
    exit 0
elif [[ "$1" == "view-banlist" ]]
then
    ./OcciTour/scripts/banlist.sh view    
    exit 0
elif [[ "$1" == "ban" ]]
then
    ./OcciTour/scripts/banlist.sh add    
    exit 0
fi

read -e -s -p "Mot de passe serveur (c normal si rien s'affiche quand vous tapez) : " password
./OcciTour/scripts/update_routine.sh $password
