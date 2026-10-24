let loggedInUser = JSON.parse(sessionStorage.getItem("currentUser"));
let teamList = document.getElementById("teamList");

async function showTeams() {
    loggedInUser = JSON.parse(sessionStorage.getItem("currentUser"));
    teamList.innerHTML = "";
    try {
        const teams = await apiRequest("/teams");
        if (teams.length === 0) {
            teamList.innerHTML = "<div class=\"dashboard-card\"><h2>Teams Coming Soon</h2><p>The organizer has not generated teams yet.</p></div>";
            return;
        }
        const myTeam = teams.find(function (team) {
            return loggedInUser && team.members.some(function (member) { return member.email.toLowerCase() === (loggedInUser.email || "").toLowerCase(); });
        });
        if (myTeam) {
            teamList.innerHTML = "<div class=\"dashboard-card\"><h2>You are already in a team</h2><p>You joined " + myTeam.name + ".</p><p>" + myTeam.members.length + " / " + myTeam.maxSize + " members</p>" + myTeam.members.map(function (member) { return "<p>" + member.name + " - " + (member.skill || "General") + "</p>"; }).join("") + "</div>";
            return;
        }
        teams.forEach(function (team) {
            const members = team.members.map(function (member) { return "<p>" + member.name + " - " + (member.skill || "General") + "</p>"; }).join("");
            const action = team.members.length < team.maxSize ? "<button class=\"generate-btn\" onclick=\"joinTeam('" + team._id + "')\">Join Team</button>" : "<p>Team Full</p>";
            teamList.innerHTML += "<div class=\"dashboard-card\"><h2>" + team.name + "</h2><p>" + team.members.length + " / " + team.maxSize + " members</p>" + members + action + "</div>";
        });
    } catch (error) {
        teamList.innerHTML = "<div class=\"dashboard-card\"><h2>Could not load teams</h2><p>" + error.message + "</p></div>";
    }
}

async function joinTeam(teamId) {
    if (!loggedInUser) return alert("Please login first.");
    try {
        const result = await apiRequest("/teams/" + teamId + "/join", { method: "POST", body: "{}" });
        alert(result.message);
        showTeams();
    } catch (error) { alert(error.message); }
}

showTeams();
