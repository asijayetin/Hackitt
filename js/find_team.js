let loggedInUser = JSON.parse(
    localStorage.getItem("currentUser")
);

let teamList = document.getElementById("teamList");

function showTeams(){

    let teams = JSON.parse(
        localStorage.getItem("hackitt_teams")
    ) || [];

    teamList.innerHTML = "";

    if(teams.length === 0){

        teamList.innerHTML = `
            <div class="dashboard-card">
                <h2>Teams Coming Soon</h2>

                <p>
                    The organizer has not generated teams yet.
                </p>
            </div>
        `;

        return;
    }

    let alreadyJoined = false;
    let joinedTeam = null;

    if(loggedInUser){

        for(let i = 0; i < teams.length; i++){

            for(let j = 0; j < teams[i].members.length; j++){

                if(
                    teams[i].members[j].email ===
                    loggedInUser.email
                ){

                    alreadyJoined = true;
                    joinedTeam = teams[i];

                    break;
                }
            }

            if(alreadyJoined){
                break;
            }
        }
    }

    if(alreadyJoined){

        let members = "";

        for(let i = 0; i < joinedTeam.members.length; i++){

            members += `
                <p>
                    ${joinedTeam.members[i].name}
                    - ${joinedTeam.members[i].skill || "General"}
                </p>
            `;
        }

        teamList.innerHTML = `
            <div class="dashboard-card">

                <h2>
                    ${joinedTeam.name}
                </h2>

                <p>
                    ${joinedTeam.members.length} /
                    ${joinedTeam.maxSize} members
                </p>

                ${members}

                <p style="color:#00e5ff; font-weight:bold;">
                    ✓ You are a member of this team
                </p>

            </div>
        `;

        localStorage.setItem(
            "hackitt_current_team",
            JSON.stringify(joinedTeam)
        );

        return;
    }

    for(let i = 0; i < teams.length; i++){

        let team = teams[i];

        let card = document.createElement("div");

        card.className = "dashboard-card";

        let members = "";

        for(let j = 0; j < team.members.length; j++){

            members += `
                <p>
                    ${team.members[j].name}
                    - ${team.members[j].skill || "General"}
                </p>
            `;
        }

        let button = "";

        if(team.members.length < team.maxSize){

            button = `
                <button
                    class="generate-btn"
                    onclick="joinTeam(${i})">
                    Join Team
                </button>
            `;

        }
        else{

            button = `
                <p>
                    Team Full
                </p>
            `;
        }

        card.innerHTML = `

            <h2>
                ${team.name}
            </h2>

            <p>
                ${team.members.length} /
                ${team.maxSize} members
            </p>

            ${members}

            ${button}

        `;

        teamList.appendChild(card);
    }
}


function joinTeam(teamIndex){

    if(!loggedInUser){

        alert("Please login first.");

        return;
    }

    let teams = JSON.parse(
        localStorage.getItem("hackitt_teams")
    ) || [];

    let team = teams[teamIndex];

    if(!team){

        alert("Team not found.");

        return;
    }

    if(team.members.length >= team.maxSize){

        alert("This team is already full.");

        return;
    }

    for(let i = 0; i < teams.length; i++){

        for(let j = 0; j < teams[i].members.length; j++){

            if(
                teams[i].members[j].email ===
                loggedInUser.email
            ){

                alert(
                    "You are already in a team."
                );

                return;
            }
        }
    }

    let newMember = {

        name:
            loggedInUser.firstName +
            " " +
            loggedInUser.lastName,

        email:
            loggedInUser.email,

        skill:
            loggedInUser.skill ||
            "General"
    };

    team.members.push(newMember);

    localStorage.setItem(
        "hackitt_teams",
        JSON.stringify(teams)
    );

    localStorage.setItem(
        "hackitt_current_team",
        JSON.stringify(team)
    );

    alert(
        "You joined " +
        team.name +
        " successfully!"
    );

    showTeams();
}


showTeams();

