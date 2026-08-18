const mockParticipants = [
    { name: "Aditi Sharma", skill: "Frontend", email: "aditi@example.com" },
    { name: "Rohan Verma", skill: "Backend", email: "rohan@example.com" },
    { name: "Simran Kaur", skill: "Design", email: "simran@example.com" },
    { name: "Karan Mehta", skill: "Backend", email: "karan@example.com" },
    { name: "Neha Gupta", skill: "Frontend", email: "neha@example.com" },
    { name: "Aman Singh", skill: "ML/Data", email: "aman@example.com" },
    { name: "Priya Nair", skill: "Design", email: "priya@example.com" },
    { name: "Vikram Rao", skill: "Frontend", email: "vikram@example.com" },
    { name: "Ishita Joshi", skill: "Backend", email: "ishita@example.com" },
    { name: "Yash Patel", skill: "ML/Data", email: "yash@example.com" },
    { name: "Diya Malhotra", skill: "Design", email: "diya@example.com" },
    { name: "Arjun Reddy", skill: "Frontend", email: "arjun@example.com" }
];

function loadParticipants(){
    let stored = localStorage.getItem("hackitt_participants");

    if(stored){
        let realParticipants = JSON.parse(stored);

        if(realParticipants.length > 0){
            return realParticipants;
        }
    }

    return mockParticipants;
}

const participants = loadParticipants();

function generateTeams(people, numTeams){

    let groups = {};

    people.forEach(function(person){

        if(!groups[person.skill]){
            groups[person.skill] = [];
        }

        groups[person.skill].push(person);
    });

    let teams = Array.from(
        {length: numTeams},
        function(){
            return [];
        }
    );

    let teamIndex = 0;

    Object.values(groups).forEach(function(group){

        group.forEach(function(person){

            teams[teamIndex].push(person);

            teamIndex =
                (teamIndex + 1) % numTeams;
        });
    });

    return teams;
}

// Keeps the most recently generated teams so the download
// button can use them without re-reading localStorage.
let lastGeneratedTeams = [];

function renderTeams(teams, teamSize){

    let resultsContainer =
        document.getElementById("teams-results");

    resultsContainer.innerHTML = "";

    let savedTeams = [];

    teams.forEach(function(team, index){

        let teamData = {
            name: "Team " + (index + 1),
            maxSize: teamSize,
            members: team
        };

        savedTeams.push(teamData);

        let card =
            document.createElement("div");

        card.className = "team-card";

        let heading =
            document.createElement("h4");

        heading.textContent =
            teamData.name;

        card.appendChild(heading);

        let memberList =
            document.createElement("ul");

        memberList.className =
            "team-member-list";

        team.forEach(function(person){

            let item =
                document.createElement("li");

            item.innerHTML =
                person.name +
                " <span class='team-member-skill'>" +
                person.skill +
                "</span>";

            memberList.appendChild(item);
        });

        card.appendChild(memberList);

        resultsContainer.appendChild(card);
    });

    localStorage.setItem(
        "hackitt_teams",
        JSON.stringify(savedTeams)
    );

    lastGeneratedTeams = savedTeams;

    resultsContainer.classList.add("visible");
}


/* ==========================================================
   DOWNLOAD TEAMS AS EXCEL (CSV)
   CSV files open directly in Excel, so we don't need any
   extra library for this. Each row is one team member, with
   which team they landed in.
========================================================== */

function downloadTeamsAsCSV(teams){

    if(!teams || teams.length === 0){
        alert("Generate teams first before downloading.");
        return;
    }

    let rows = [];

    // Header row
    rows.push(["Team", "Name", "Skill", "Email"]);

    teams.forEach(function(team){

        team.members.forEach(function(person){

            rows.push([
                team.name,
                person.name,
                person.skill,
                person.email || ""
            ]);
        });
    });

    // Turn each row into a comma-separated line.
    // Wrapping values in quotes handles names/emails that
    // might contain commas.
    let csvContent = rows.map(function(row){

        return row.map(function(value){
            return '"' + String(value).replace(/"/g, '""') + '"';
        }).join(",");

    }).join("\n");

    let blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    let url = URL.createObjectURL(blob);

    let link = document.createElement("a");
    link.href = url;
    link.download = "hackitt_teams.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}


document.addEventListener(
    "DOMContentLoaded",
    function(){

        let generateBtn =
            document.getElementById("generate-btn");

        let downloadBtn =
            document.getElementById("download-btn");

        let teamSizeInput =
            document.getElementById("team-size");

        let participantCountEl =
            document.getElementById("participant-count");

        if(!generateBtn || !teamSizeInput){
            return;
        }

        participantCountEl.textContent =
            participants.length;

        generateBtn.addEventListener(
            "click",
            function(){

                let teamSize =
                    parseInt(
                        teamSizeInput.value,
                        10
                    );

                if(!teamSize || teamSize < 2){

                    alert(
                        "Please enter a team size of at least 2."
                    );

                    return;
                }

                if(teamSize > participants.length){

                    alert(
                        "Team size cannot be greater than the number of participants."
                    );

                    return;
                }

                let numTeams =
                    Math.ceil(
                        participants.length / teamSize
                    );

                let teams =
                    generateTeams(
                        participants,
                        numTeams
                    );

                renderTeams(
                    teams,
                    teamSize
                );

                // Now that teams exist, show the download button
                if(downloadBtn){
                    downloadBtn.style.display = "inline-block";
                }

                alert(
                    numTeams +
                    " teams generated successfully!"
                );
            }
        );

        if(downloadBtn){
            downloadBtn.addEventListener(
                "click",
                function(){
                    downloadTeamsAsCSV(lastGeneratedTeams);
                }
            );
        }
    }
);