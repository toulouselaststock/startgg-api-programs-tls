mkdir -p out/occitour
node occitour/occiTourScores.js -d dnu occitour/events.txt -o Occitour/ranking.json --names-cache "data/occitourNamesCache$(date +%F).json" -P -e Occitour/events.json
node occitour/preview/main.js out/occitour/ranking.json