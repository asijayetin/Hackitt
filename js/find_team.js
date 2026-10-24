const teamList = document.getElementById("teamList");
const loggedInUser = JSON.parse(sessionStorage.getItem("currentUser") || "null");

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

async function showAssignedTeam(team) {
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
        memberName.textContent = member.name + (member.email.toLowerCase() === loggedInUser.email.toLowerCase() ? " (You)" : "");
        const skill = document.createElement("span");
        skill.className = "saved-team-skill";
        skill.textContent = member.skill || "General";
        row.append(memberName, skill);
        list.appendChild(row);
    });

    card.append(heading, count, list);
    await showTeamChangeRequest(card);
    teamList.appendChild(card);
}

async function showTeamChangeRequest(card) {
    const panel = document.createElement("div");
    panel.className = "student-change-request";
    const heading = document.createElement("h3");
    heading.textContent = "Need a different team?";
    panel.appendChild(heading);

    try {
        const request = await apiRequest("/team-change-requests/mine");
        if (request) {
            const status = document.createElement("p");
            status.className = "student-request-status";
            status.textContent = "Request " + request.status;
            panel.appendChild(status);

            const reason = document.createElement("p");
            reason.textContent = "Your reason: " + request.reason;
            panel.appendChild(reason);

            if (request.newTeamName) {
                const moved = document.createElement("p");
                moved.textContent = "The organizer moved you to " + request.newTeamName + ". Your current team is shown above.";
                panel.appendChild(moved);
            }

            if (request.status === "pending") {
                card.appendChild(panel);
                return;
            }
        }

        const form = document.createElement("form");
        const reasonInput = document.createElement("textarea");
        const submit = document.createElement("button");
        reasonInput.required = true;
        reasonInput.minLength = 5;
        reasonInput.maxLength = 300;
        reasonInput.placeholder = "Tell the organizer why you need a team change";
        reasonInput.setAttribute("aria-label", "Reason for team change");
        submit.type = "submit";
        submit.className = "primary-btn";
        submit.textContent = "Send Request";
        const note = document.createElement("p");
        note.textContent = "The organizer can approve this if another team has an open spot.";
        form.append(note, reasonInput, submit);

        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            submit.disabled = true;
            try {
                const result = await apiRequest("/team-change-requests", {
                    method: "POST",
                    body: JSON.stringify({ reason: reasonInput.value.trim() })
                });
                alert(result.message);
                await loadMyTeam();
            } catch (error) {
                alert(error.message);
                submit.disabled = false;
            }
        });

        panel.appendChild(form);
        card.appendChild(panel);
    } catch (error) {
        const message = document.createElement("p");
        message.textContent = "Could not load request status: " + error.message;
        panel.appendChild(message);
        card.appendChild(panel);
    }
}

async function loadMyTeam() {
    if (!loggedInUser || !loggedInUser.email) {
        showMessage("Please log in", "Log in with your student account to see your team.", "Go to Login", "login.html");
        return;
    }

    if (loggedInUser.role !== "student") {
        showMessage("Student account required", "Log in as a student to view an assigned team.", "Go to Login", "login.html");
        return;
    }

    try {
        const teams = await apiRequest("/teams");
        const myTeam = teams.find(function (team) {
            return team.members.some(function (member) {
                return member.email.toLowerCase() === loggedInUser.email.toLowerCase();
            });
        });

        if (myTeam) {
            await showAssignedTeam(myTeam);
        } else if (teams.length === 0) {
            showMessage("Teams are not ready yet", "The organizer has not generated teams. Check back later.");
        } else {
            showMessage("You are waiting for a team", "The organizer will add teams when needed. The system will assign you based on your skill and available space.");
        }
    } catch (error) {
        showMessage("Could not load your team", error.message);
    }
}

loadMyTeam();
