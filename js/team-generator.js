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


function loadParticipants() {

    let stored =
        localStorage.getItem("hackitt_participants");

    if (stored) {

        let participants =
            JSON.parse(stored);

        if (participants.length > 0) {
            return participants;
        }
    }

    return mockParticipants;
}


let participants = loadParticipants();

let lastGeneratedTeams = [];


/* ==============================
   GENERATE BALANCED TEAMS
============================== */

function generateTeams(people, numTeams) {

    let groups = {};

    people.forEach(function(person) {

        let skill =
            person.skill || "General";

        if (!groups[skill]) {
            groups[skill] = [];
        }

        groups[skill].push(person);
    });


    let teams = Array.from(
        { length: numTeams },
        () => []
    );


    let teamIndex = 0;


    Object.values(groups).forEach(function(group) {

        group.forEach(function(person) {

            teams[teamIndex].push(person);

            teamIndex =
                (teamIndex + 1) % numTeams;
        });
    });


    return teams;
}


/* ==============================
   DISPLAY GENERATED TEAMS
============================== */

function renderTeams(teams, teamSize) {

    let resultsContainer =
        document.getElementById("teams-results");

    if (!resultsContainer) {
        return;
    }

    resultsContainer.innerHTML = "";

    let savedTeams = [];


    teams.forEach(function(team, index) {

        /*
         * Actual team members remain empty.
         * Students join later from Find a Team.
         */

        let teamData = {

            name:
                "Team " + (index + 1),

            maxSize:
                teamSize,

            members: []

        };


        savedTeams.push(teamData);


        let card =
            document.createElement("div");

        card.className =
            "team-card";


        let recommendedMembers =
            team.map(function(person) {

                return `
                    <li>
                        ${person.name}

                        <span class="team-member-skill">
                            ${person.skill || "General"}
                        </span>
                    </li>
                `;

            }).join("");


        card.innerHTML = `

            <h4>
                ${teamData.name}
            </h4>

            <p>
                Recommended members based on skills:
            </p>

            <ul class="team-member-list">
                ${recommendedMembers}
            </ul>

            <p>
                Team size: ${teamSize}
            </p>

        `;


        resultsContainer.appendChild(card);

    });


    /*
     * Save empty teams.
     * Students are added only after Join Team.
     */

    localStorage.setItem(
        "hackitt_teams",
        JSON.stringify(savedTeams)
    );


    lastGeneratedTeams = savedTeams;


    resultsContainer.classList.add(
        "visible"
    );
}


/* ==============================
   DOWNLOAD TEAMS AS CSV
============================== */

function downloadTeamsAsCSV(teams) {

    if (!teams || teams.length === 0) {

        alert(
            "Generate teams first before downloading."
        );

        return;
    }


    let rows = [
        ["Team", "Name", "Skill", "Email"]
    ];


    teams.forEach(function(team) {

        /*
         * If students have joined,
         * export actual members.
         */

        if (
            team.members &&
            team.members.length > 0
        ) {

            team.members.forEach(function(person) {

                rows.push([
                    team.name,
                    person.name,
                    person.skill || "General",
                    person.email || ""
                ]);

            });

        }
        else {

            rows.push([
                team.name,
                "No members joined yet",
                "",
                ""
            ]);

        }

    });


    let csvContent =
        rows.map(function(row) {

            return row.map(function(value) {

                return '"' +
                    String(value)
                        .replace(/"/g, '""') +
                    '"';

            }).join(",");

        }).join("\n");


    let blob =
        new Blob(
            [csvContent],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    let url =
        URL.createObjectURL(blob);


    let link =
        document.createElement("a");

    link.href =
        url;

    link.download =
        "hackitt_teams.csv";


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}


/* ==============================
   PAGE LOAD
============================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        let generateBtn =
            document.getElementById(
                "generate-btn"
            );


        let downloadBtn =
            document.getElementById(
                "download-btn"
            );


        let teamSizeInput =
            document.getElementById(
                "team-size"
            );


        let participantCount =
            document.getElementById(
                "participant-count"
            );


        if (
            !generateBtn ||
            !teamSizeInput
        ) {
            return;
        }


        if (participantCount) {

            participantCount.textContent =
                participants.length;
        }


        /* ==============================
           GENERATE BUTTON
        ============================== */

        generateBtn.addEventListener(
            "click",
            function() {

                let teamSize =
                    parseInt(
                        teamSizeInput.value,
                        10
                    );


                if (
                    !teamSize ||
                    teamSize < 2
                ) {

                    alert(
                        "Please enter a team size of at least 2."
                    );

                    return;
                }


                if (
                    teamSize >
                    participants.length
                ) {

                    alert(
                        "Team size cannot be greater than the number of participants."
                    );

                    return;
                }


                let numTeams =
                    Math.ceil(
                        participants.length /
                        teamSize
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


                if (downloadBtn) {

                    downloadBtn.style.display =
                        "inline-block";
                }


                alert(
                    numTeams +
                    " teams generated successfully!"
                );

            }
        );


        /* ==============================
           DOWNLOAD BUTTON
        ============================== */

        if (downloadBtn) {

            downloadBtn.addEventListener(
                "click",
                function() {

                    downloadTeamsAsCSV(
                        lastGeneratedTeams
                    );

                }
            );
        }

    }
);