mkdir -p out/occitour/results
node occitour/occiTourScores.js -d dnu occitour/events.txt -o Occitour/results/ranking.json --names-cache "data/Occitour/namesCache/occitourNamesCache$(date +%F).json" -P -e Occitour/results/events.json -b data/Occitour/meta/bannis.json -q data/occitour/meta/regions.json
node occitour/preview/main.js out/occitour/results/ranking.json
start occitour/preview/page/index.html