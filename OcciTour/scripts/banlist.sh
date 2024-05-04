mkdir -p data/Occitour/meta

if [[ "$1" == "view" ]]
then
    node OcciTour/ftp/banManager.js list
elif [[ "$1" == "add" ]]
then
    node OcciTour/ftp/banManager.js add
fi