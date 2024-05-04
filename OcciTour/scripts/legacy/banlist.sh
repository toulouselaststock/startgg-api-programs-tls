mkdir -p out/Occitour/

if [[ "$1" == "view" ]]
then
    node occitour/ftp/banManager.js list
elif [[ "$1" == "add" ]]
then
    node occitour/ftp/banManager.js add
fi