mkdir -p out/occitour-logos
node OcciTour/fetchImages/main.js out/Occitour/events.json
tar -czf out/Occitour/logos.tar.gz -C out/occitour-logos/ .