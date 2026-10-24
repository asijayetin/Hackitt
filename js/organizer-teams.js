const savedTeams = document.getElementById("savedTeams");
const teamSummary = document.getElementById("teamSummary");
const teamRequests = document.getElementById("teamRequests");
const requestSummary = document.getElementById("requestSummary");

function addText(parent, tag, text) {
    const element = document.createElement(tag);
    element.textContent = text;
    parent.appendChild(element);
}

function showTeams(teams) {
    savedTeams.innerHTML = "";
    if (teams.length === 0) {
        teamSummary.textContent = "0 teams saved";
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "saved-teams-empty";
        emptyMessage.textContent = "No teams have been generated yet.";
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
        const title = document.createElement("h2");
        const memberList = document.createElement("ul");
        const progress = document.createElement("div");
        const progressBar = document.createElement("span");
        const capacity = Number(team.maxSize) || 1;

        card.className = "saved-team-card";
        heading.className = "saved-team-heading";
        memberList.className = "saved-team-members";
        progress.className = "saved-team-progress";
        progressBar.style.width = Math.min(team.members.length / capacity * 100, 100) + "%";
        title.textContent = team.name;
        heading.appendChild(title);

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
}

async function reviewRequest(requestId, status, button) {
    button.disabled = true;
    try {
        const result = await apiRequest("/team-change-requests/" + requestId, {
            method: "PATCH",
            body: JSON.stringify({ status })
        });
        alert(result.message);
        await loadOrganizerTeams();
    } catch (error) {
        alert(error.message);
        button.disabled = false;
    }
}

function showRequests(requests) {
    teamRequests.innerHTML = "";
    const pendingCount = requests.filter(function (request) {
        return request.status === "pending";
    }).length;
    requestSummary.textContent = pendingCount === 1
        ? "1 request is waiting for your review."
        : pendingCount + " requests are waiting for your review.";

    if (requests.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "saved-teams-empty";
        emptyMessage.textContent = "No team change requests yet.";
        teamRequests.appendChild(emptyMessage);
        return;
    }

    requests.sort(function (first, second) {
        if (first.status === "pending" && second.status !== "pending") return -1;
        if (first.status !== "pending" && second.status === "pending") return 1;
        return new Date(second.createdAt) - new Date(first.createdAt);
    }).forEach(function (request) {
        const card = document.createElement("div");
        card.className = "team-request-card";
        addText(card, "h3", request.studentName);
        addText(card, "p", "Email: " + request.studentEmail);
        addText(card, "p", "Current team: " + request.currentTeamName);
        addText(card, "p", "Reason: " + request.reason);

        const status = document.createElement("span");
        status.className = "saved-team-capacity";
        status.textContent = request.status;
        card.appendChild(status);
        if (request.newTeamName) addText(card, "p", "Moved to: " + request.newTeamName);

        if (request.status === "pending") {
            const actions = document.createElement("div");
            actions.className = "team-request-actions";
            const approve = document.createElement("button");
            approve.className = "primary-btn";
            approve.textContent = "Approve and move";
            approve.addEventListener("click", function () {
                reviewRequest(request._id, "approved", approve);
            });

            const reject = document.createElement("button");
            reject.className = "secondary-btn";
            reject.textContent = "Reject";
            reject.addEventListener("click", function () {
                reviewRequest(request._id, "rejected", reject);
            });
            actions.append(approve, reject);
            card.appendChild(actions);
        }
        teamRequests.appendChild(card);
    });
}

async function loadOrganizerTeams() {
    try {
        const teams = await apiRequest("/teams");
        showTeams(teams);
    } catch (error) {
        teamSummary.textContent = "Could not load teams: " + error.message;
    }

    try {
        const requests = await apiRequest("/team-change-requests");
        showRequests(requests);
    } catch (error) {
        requestSummary.textContent = "Could not load requests: " + error.message;
        teamRequests.textContent = "Log in with the organizer account, then refresh this page.";
    }
}

document.getElementById("refreshRequests").addEventListener("click", loadOrganizerTeams);
loadOrganizerTeams();
window.setInterval(loadOrganizerTeams, 15000);
