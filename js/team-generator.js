let lastGeneratedTeams = [];

function showGeneratedTeams(teams) {
    const results = document.getElementById("teams-results");
    results.innerHTML = "";

    teams.forEach(function (team) {
        const card = document.createElement("div");
        card.className = "team-card";
        const names = team.members.map(function (member) {
            return "<li>" + member.name + " <span class=\"team-member-skill\">" + (member.skill || "General") + "</span></li>";
        }).join("");
        card.innerHTML = "<h4>" + team.name + "</h4><p>Team members:</p><ul class=\"team-member-list\">" + names + "</ul><p>Team size: " + team.members.length + " / " + team.maxSize + "</p>";
        results.appendChild(card);
    });

    results.classList.add("visible");
}

function downloadTeamsAsCSV(teams) {
    const rows = [["Team", "Name", "Skill", "Email"]];
    teams.forEach(function (team) {
        team.members.forEach(function (member) {
            rows.push([team.name, member.name, member.skill || "General", member.email || ""]);
        });
    });
    const csv = rows.map(function (row) {
        return row.map(function (value) { return '"' + String(value).replace(/"/g, '""') + '"'; }).join(",");
    }).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = "hackitt_teams.csv";
    link.click();
    URL.revokeObjectURL(link.href);
}

document.addEventListener("DOMContentLoaded", async function () {
    const generateButton = document.getElementById("generate-btn");
    const downloadButton = document.getElementById("download-btn");
    const count = document.getElementById("participant-count");

    try {
        const participants = await apiRequest("/participants");
        count.textContent = participants.length;
    } catch (error) {
        count.textContent = "Login as organizer to load";
    }

    generateButton.addEventListener("click", async function () {
        const teamSize = Number(document.getElementById("team-size").value);
        try {
            const result = await apiRequest("/teams/generate", {
                method: "POST",
                body: JSON.stringify({ teamSize })
            });
            lastGeneratedTeams = result.teams;
            showGeneratedTeams(lastGeneratedTeams);
            downloadButton.style.display = "inline-block";
            alert(result.message);
        } catch (error) {
            alert(error.message);
        }
    });

    downloadButton.addEventListener("click", function () {
        downloadTeamsAsCSV(lastGeneratedTeams);
    });
});
