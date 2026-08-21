let loggedInUser = JSON.parse(
    localStorage.getItem("currentUser")
);

let teamList = document.getElementById("teamList");


function showTeams(){

    loggedInUser = JSON.parse(
        localStorage.getItem("currentUser")
    );

    let teams = JSON.parse(
        localStorage.getItem("hackitt_teams")
    ) || [];

    teamList.innerHTML = "";

    if(teams.length === 0){

        teamList.innerHTML = `
            <div class="dashboard-card">
                <h2>Teams Coming Soon</h2>
                <p>The organizer has not generated teams yet.</p>
            </div>
        `;

        return;
    }


    // Check if current user already joined a team
    // (compare emails case-insensitively and trimmed, so a
    // capital letter or stray space doesn't break the match)

    let joinedTeam = null;

    if(loggedInUser){

        let myEmail = (loggedInUser.email || "").trim().toLowerCase();

        for(let team of teams){

            if(!team.members){
                team.members = [];
            }

            if(
                team.members.some(
                    member =>
                        (member.email || "").trim().toLowerCase() === myEmail
                )
            ){

                joinedTeam = team;
                break;
            }
        }
    }


    // Show joined team

    if(joinedTeam){

        let members = joinedTeam.members
            .map(
                member =>
                    `<p>${member.name} - ${member.skill || "General"}</p>`
            )
            .join("");

        teamList.innerHTML = `
            <div class="dashboard-card">

                <h2>You are already in a team</h2>

                <p>
                    You joined ${joinedTeam.name}.
                </p>

                <p>
                    ${joinedTeam.members.length}
                    /
                    ${joinedTeam.maxSize}
                    members
                </p>

                ${members}

            </div>
        `;

        return;
    }


    // Show available teams

    teams.forEach(
        (team, index) => {

            if(!team.members){
                team.members = [];
            }

            let members = team.members
                .map(
                    member =>
                        `<p>${member.name} - ${member.skill || "General"}</p>`
                )
                .join("");


            let action =
                team.members.length < team.maxSize

                ? `
                    <button
                        class="generate-btn"
                        onclick="joinTeam(${index})">

                        Join Team

                    </button>
                  `

                : `<p>Team Full</p>`;


            teamList.innerHTML += `

                <div class="dashboard-card">

                    <h2>
                        ${team.name}
                    </h2>

                    <p>
                        ${team.members.length}
                        /
                        ${team.maxSize}
                        members
                    </p>

                    ${members}

                    ${action}

                </div>

            `;
        }
    );
}


function joinTeam(teamIndex){

    loggedInUser = JSON.parse(
        localStorage.getItem("currentUser")
    );


    if(!loggedInUser){

        alert("Please login first.");

        return;
    }


    let teams = JSON.parse(
        localStorage.getItem("hackitt_teams")
    ) || [];


    let team = teams[teamIndex];


    if(!team){
        return;
    }


    if(!team.members){
        team.members = [];
    }


    if(team.members.length >= team.maxSize){

        alert("This team is already full.");

        return;
    }


    // Check if student is already in any team
    // (same case-insensitive, trimmed comparison as showTeams())

    let myEmail = (loggedInUser.email || "").trim().toLowerCase();

    let alreadyJoined = teams.some(
        team =>
            (team.members || []).some(
                member =>
                    (member.email || "").trim().toLowerCase() === myEmail
            )
    );


    if(alreadyJoined){

        alert("You are already in a team.");

        return;
    }


    // Add student

    team.members.push({

        name:
            `${loggedInUser.firstName || ""} ${loggedInUser.lastName || ""}`.trim(),

        email:
            loggedInUser.email,

        skill:
            loggedInUser.skill || "General"

    });


    localStorage.setItem(
        "hackitt_teams",
        JSON.stringify(teams)
    );


    alert(
        `You joined ${team.name}!`
    );


    showTeams();
}


showTeams();