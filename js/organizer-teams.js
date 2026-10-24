const savedTeams = document.getElementById("savedTeams");
const teamSummary = document.getElementById("teamSummary");

function addText(parent, tag, text) {
    const element = document.createElement(tag);
    element.textContent = text;
    parent.appendChild(element);
}

apiRequest("/teams").then(function (teams) {
    if (teams.length === 0) {
        teamSummary.textContent = "No teams have been generated yet.";
        return;
    }

    teamSummary.textContent = teams.length + " teams saved";

    teams.forEach(function (team) {
        const card = document.createElement("div");
        card.className = "team-card";
        addText(card, "h2", team.name);
        addText(card, "p", team.members.length + " / " + team.maxSize + " members");

        if (team.members.length === 0) {
            addText(card, "p", "No members yet");
        } else {
            team.members.forEach(function (member) {
                addText(card, "p", member.name + " - " + (member.skill || "General"));
            });
        }

        savedTeams.appendChild(card);
    });
}).catch(function (error) {
    teamSummary.textContent = "Could not load saved teams: " + error.message;
});
