const teamList = document.getElementById("teamList");
const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "null");

function showMessage(title, message, linkText, linkUrl) {
    teamList.innerHTML = "";
    const card = document.createElement("div");
    card.className = "student-team-message";

    const heading = document.createElement("h2");
    heading.textContent = title;
    const text = document.createElement("p");
    text.textContent = message;
    card.append(heading, text);

    if (linkText) {
        const link = document.createElement("a");
        link.href = linkUrl;
        link.className = "primary-btn";
        link.textContent = linkText;
        card.appendChild(link);
    }

    teamList.appendChild(card);
}

function showAssignedTeam(team) {
    teamList.innerHTML = "";

    const card = document.createElement("div");
    card.className = "student-team-card";

    const heading = document.createElement("div");
    heading.className = "student-team-heading";
    const name = document.createElement("h2");
    name.textContent = team.name;
    const status = document.createElement("span");
    status.className = "student-team-status";
    status.textContent = "Team assigned";
    heading.append(name, status);

    const count = document.createElement("p");
    count.className = "student-team-count";
    count.textContent = team.members.length + " of " + team.maxSize + " members";

    const list = document.createElement("div");
    list.className = "student-team-members";

    team.members.forEach(function (member) {
        const row = document.createElement("div");
        row.className = "student-team-member";
        const memberName = document.createElement("span");
        memberName.textContent = member.name + (member.email.toLowerCase() === currentUser.email.toLowerCase() ? " (You)" : "");
        const skill = document.createElement("span");
        skill.className = "saved-team-skill";
        skill.textContent = member.skill || "General";
        row.append(memberName, skill);
        list.appendChild(row);
    });

    card.append(heading, count, list);
    teamList.appendChild(card);
}

async function loadMyTeam() {
    if (!currentUser || !currentUser.email) {
        showMessage("Please log in", "Log in with your student account to see your team.", "Go to Login", "login.html");
        return;
    }

    if (currentUser.role !== "student") {
        showMessage("Student account required", "Log in as a student to view an assigned team.", "Go to Login", "login.html");
        return;
    }

    try {
        const teams = await apiRequest("/teams");
        const myTeam = teams.find(function (team) {
            return team.members.some(function (member) {
                return member.email.toLowerCase() === currentUser.email.toLowerCase();
            });
        });

        if (myTeam) {
            showAssignedTeam(myTeam);
        } else if (teams.length === 0) {
            showMessage("Teams are not ready yet", "The organizer has not generated teams. Check back later.");
        } else {
            showMessage("Team assignment pending", "The organizer has not assigned you to a team yet. Please check back later.");
        }
    } catch (error) {
        showMessage("Could not load your team", error.message);
    }
}

loadMyTeam();
