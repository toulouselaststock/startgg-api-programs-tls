mkdir -p out/Occitour/logos #insanely smart
node occitour/occiTourScores.js -d dnu occitour/events.txt -o Occitour/ranking.json --names-cache "data/occitourNamesCache$(date +%F).json" -P -e Occitour/events.json
node occitour/fetchImages/main.js out/occitour/events.json