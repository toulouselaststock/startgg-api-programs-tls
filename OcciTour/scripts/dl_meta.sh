mkdir -p data/OcciTour/meta
node OcciTour/ftp/main.js download -l data/OcciTour/meta -r htdocs/OcciTour/meta/ -t 30 -p "$1"