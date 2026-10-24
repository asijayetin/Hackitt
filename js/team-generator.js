let lastGeneratedTeams = [];

function showGeneratedTeams(teams) {
    const results = document.getElementById("teams-results");
    results.innerHTML = "";

    teams.forEach(function (team) {
        const card = document.createElement("div");
        card.className = "team-card";
        const title = document.createElement("h4");
        title.textContent = team.name;
        const size = document.createElement("p");
        size.textContent = "Team size: " + team.members.length + " / " + team.maxSize;
        const list = document.createElement("ul");
        list.className = "team-member-list";

        team.members.forEach(function (member) {
            const item = document.createElement("li");
            const name = document.createElement("span");
            const skill = document.createElement("span");
            name.textContent = member.name;
            skill.className = "team-member-skill";
            skill.textContent = member.skill || "General";
            item.append(name, skill);
            list.appendChild(item);
        });

        card.append(title, size, list);
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

async function loadCounts() {
    try {
        const participants = await apiRequest("/participants");
        document.getElementById("participant-count").textContent = participants.length;
        const pending = await apiRequest("/teams/pending");
        document.getElementById("pending-count").textContent = pending.length;
    } catch (error) {
        document.getElementById("pending-count").textContent = "Login as organizer to view";
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    const generateButton = document.getElementById("generate-btn");
    const downloadButton = document.getElementById("download-btn");
    await loadCounts();

    generateButton.addEventListener("click", async function () {
        const teamSize = Number(document.getElementById("team-size").value);
        const teamCount = Number(document.getElementById("team-count").value);
        generateButton.disabled = true;

        try {
            const result = await apiRequest("/teams/generate", {
                method: "POST",
                body: JSON.stringify({ teamSize, teamCount })
            });
            lastGeneratedTeams = result.teams;
            showGeneratedTeams(lastGeneratedTeams);
            downloadButton.style.display = "inline-block";
            alert(result.message);
            await loadCounts();
        } catch (error) {
            alert(error.message);
        } finally {
            generateButton.disabled = false;
        }
    });

    downloadButton.addEventListener("click", function () {
        downloadTeamsAsCSV(lastGeneratedTeams);
    });
});
