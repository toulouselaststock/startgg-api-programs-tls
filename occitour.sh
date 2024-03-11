mkdir -p out/Occitour
node OcciTour/occiTourScores.js OcciTour/events.txt -d dnu -o OcciTour/current.json --names-cache "data/occitourNamesCache$(date +%F).json"
node OcciTour/occiTourScores.js OcciTour/events.txt -e -d dnu -o OcciTour/previous.json --names-cache "data/occitourNamesCache$(date +%F).json"
node OcciTour/ftp/main.js