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
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "saved-teams-empty";
        emptyMessage.textContent = "Generate teams from the organizer dashboard to see them here.";
        savedTeams.appendChild(emptyMessage);
        return;
    }

    const memberCount = teams.reduce(function (total, team) {
        return total + team.members.length;
    }, 0);
    teamSummary.textContent = teams.length + " teams saved  ·  " + memberCount + " participants assigned";

    teams.forEach(function (team) {
        const card = document.createElement("div");
        const heading = document.createElement("div");
        const memberList = document.createElement("ul");
        const progress = document.createElement("div");
        const progressBar = document.createElement("span");
        const capacity = Number(team.maxSize) || 1;

        card.className = "saved-team-card";
        heading.className = "saved-team-heading";
        memberList.className = "saved-team-members";
        progress.className = "saved-team-progress";
        progressBar.style.width = Math.min(team.members.length / capacity * 100, 100) + "%";
        heading.appendChild(document.createElement("h2"));
        heading.firstChild.textContent = team.name;

        const memberCountText = document.createElement("span");
        memberCountText.className = "saved-team-capacity";
        memberCountText.textContent = team.members.length + " / " + team.maxSize + " members";
        heading.appendChild(memberCountText);
        card.appendChild(heading);
        progress.appendChild(progressBar);
        card.appendChild(progress);

        if (team.members.length === 0) {
            addText(card, "p", "No members yet");
        } else {
            team.members.forEach(function (member) {
                const item = document.createElement("li");
                const name = document.createElement("span");
                const skill = document.createElement("span");
                name.textContent = member.name;
                skill.className = "saved-team-skill";
                skill.textContent = member.skill || "General";
                item.append(name, skill);
                memberList.appendChild(item);
            });
            card.appendChild(memberList);
        }

        savedTeams.appendChild(card);
    });
}).catch(function (error) {
    teamSummary.textContent = "Could not load saved teams: " + error.message;
});
