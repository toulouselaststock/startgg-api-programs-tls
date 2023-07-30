(async () => {
    
    let [teamScores, oldTeamScores, teamnames] = await Promise.all([
        fetch('../SLT-Teams-Performance.json')
            .then( res => res.json() ),
        fetch('../backup/latest/SLT-Teams-Performance.json')
            .then( res => res.json() ),
        fetch('../../SLT Data/TeamNames.json')
            .then( res => res.json() ),
    ])
    console.log(teamScores, oldTeamScores, teamnames);


    teamScores = Object.entries(teamScores);
    teamScores.sort( (a, b) => b[1].score - a[1].score );

    let oldPositions = {}
    if (oldTeamScores){
        oldTeamScores = Object.entries(oldTeamScores);
        oldTeamScores.sort( (a, b) => b[1].score - a[1].score );

        for (let i = 0; i < oldTeamScores.length; i++){
            oldPositions[oldTeamScores[i][0]] = i;
        }
    }

    let teamHTML = ""
    let ptsHTML = ""
    let APHTML = ""

    console.log(oldPositions);

    let i = 0;
    for (let [team, teamData] of teamScores){
        let teamName = teamnames[team];
        let oldpos = oldPositions[team];

        console.log(team, i, oldpos)

        teamHTML += `
            <div class = "team ">
                <div class = "arrow ${oldpos == undefined ? "" : i > oldpos ? "down" : i < oldpos ? "up": ""}"></div>
                <div class = "teamNames">
                    <div class = "teamName ${i % 2 == 1 ? "grey" : "black"}">${teamName || team}</div>
                    <div class = "captain">${teamName ? "(Équipe " + team +")" : ""}</div>
                </div>
            </div>
        ` 

        ptsHTML += `
            <div class = "score ${i % 2 == 1 ? "grey" : "black"}">${teamData.score} (${teamData.avg})</div>
        `

        APHTML += `
            <div class = "ap_ ${i % 2 == 1 ? "grey" : "black"}">${teamData.activePlayers}</div>
        `
        i++;
    }
    $(".equipes_content").html(teamHTML);
    $(".pts_content").html(ptsHTML);
    $(".ap_content").html(APHTML);
})()


