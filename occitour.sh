if [[ "$1" == "discord" ]]
then
    ./OcciTour/scripts/discord.sh 1202647423533449297
    exit 0
elif [[ "$1" == "upload" ]]
then
    ./OcciTour/scripts/upload.sh    
    exit 0
fi

./OcciTour/scripts/update.sh
