mkdir -p out/occitour
node occitour/occiTourScores.js -d dnu occitour/events.txt -o Occitour/ranking.json --names-cache "data/occitourNamesCache$(date +%F).json" -P -e Occitour/events.
node occitour/preview/main.js out/occitour/ranking.json
start occitour/preview/page/index.html