(async () => {
    
    let [teamScores, teamnames] = await Promise.all([
        fetch('../SLT-Teams-Performance.json')
            .then( res => res.json() ),
        fetch('../../SLT Data/TeamNames.json')
            .then( res => res.json() ),
    ])
    console.log(teamScores, teamnames);

    teamScores = Object.entries(teamScores);
    teamScores.sort( (a, b) => b[1].score - a[1].score );
    console.log(teamScores)

    let teamHTML = ""
    let ptsHTML = ""
    let APHTML = ""

    let i = 0;
    for (let [team, teamData] of teamScores){
        let teamName = teamnames[team];

        teamHTML += `
            <div class = "team ">
                <div class = "teamName ${i % 2 == 1 ? "grey" : "black"}">${teamName || team}</div>
                <div class = "captain">${teamName ? "(Équipe " + team +")" : ""}</div>
            </div>
        ` 

        ptsHTML += `
            <div class = "score ${i % 2 == 1 ? "grey" : "black"}">${teamData.score}</div>
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


