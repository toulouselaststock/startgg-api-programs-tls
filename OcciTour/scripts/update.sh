mkdir -p out/Occitour/results
mkdir -p data/OcciTour/namesCache
node OcciTour/occiTourScores.js -d dnu $1 -o Occitour/results/ranking.json --names-cache "data/OcciTour/namesCache/occitourNamesCache.json" -P -e Occitour/results/events.json -b data/OcciTour/meta/bannis.json -q data/OcciTour/meta/regions.json