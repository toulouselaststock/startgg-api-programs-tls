mkdir -p out/Occitour/results
mkdir -p data/Occitour/namesCache
node OcciTour/occiTourScores.js -d dnu $1 -o Occitour/results/ranking.json --names-cache "data/Occitour/namesCache/occitourNamesCache.json" -P -e Occitour/results/events.json -b data/Occitour/meta/bannis.json -q data/Occitour/meta/regions.json