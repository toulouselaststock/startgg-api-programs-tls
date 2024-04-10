if [[ "$1" == "discord" ]]
then
    ./OcciTour/scripts/discord.sh 1202647423533449297
    exit 0
elif [[ "$1" == "upload" ]]
then
    ./OcciTour/scripts/upload.sh    
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

./OcciTour/scripts/update.sh
