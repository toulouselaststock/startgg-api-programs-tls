mkdir -p out/occitour-logos
node occitour/fetchImages/main.js out/occitour/events.json
tar -czf out/occitour/logos.tar.gz -C out/occitour-logos/ .

node OcciTour/ftp/upload.js