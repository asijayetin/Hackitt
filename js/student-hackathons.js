const studentHackathonList = document.getElementById("studentHackathonList");

function addText(parent, tag, text) {
    const element = document.createElement(tag);
    element.textContent = text;
    parent.appendChild(element);
}

function renderStudentHackathons(hackathons) {
    studentHackathonList.innerHTML = "";
    if (!hackathons.length) {
        addText(studentHackathonList, "p", "No open hackathons right now. Check back later.");
        return;
    }

    hackathons.forEach(function (hackathon) {
        const card = document.createElement("article");
        card.className = "hackathon-card";
        const heading = document.createElement("div");
        heading.className = "hackathon-card-heading";
        addText(heading, "h3", hackathon.name);
        const status = document.createElement("span");
        status.className = "hackathon-status " + (hackathon.joined ? "joined" : hackathon.status);
        status.textContent = hackathon.joined ? "Joined" : "Registration open";
        heading.appendChild(status);
        card.appendChild(heading);
        addText(card, "p", hackathon.description);
        addText(card, "p", "Team size: " + hackathon.minTeamSize + "–" + hackathon.maxTeamSize + " · " + hackathon.participantCount + " joined");
        if (hackathon.requiredSkills.length) {
            addText(card, "p", "Skills wanted: " + hackathon.requiredSkills.join(", "));
        }

        if (hackathon.joined) {
            addText(card, "p", hackathon.teamName
                ? "You are in " + hackathon.teamName + "."
                : "You joined and are waiting. Your team will form when enough students sign up.");
            if (hackathon.teamMembers.length) {
                const members = document.createElement("div");
                members.className = "hackathon-team-summary";
                addText(members, "strong", "Your team members");
                addText(members, "p", hackathon.teamMembers.map(function (member) {
                    return member.name + " (" + member.skill + ")";
                }).join(" · "));
                card.appendChild(members);
            }
        } else if (!hackathon.eligible) {
            addText(card, "p", "Your profile skill does not match this hackathon's skill needs.");
            const unavailable = document.createElement("button");
            unavailable.type = "button";
            unavailable.className = "secondary-btn";
            unavailable.textContent = "Skill requirement not met";
            unavailable.disabled = true;
            card.appendChild(unavailable);
        } else {
            const joinButton = document.createElement("button");
            joinButton.type = "button";
            joinButton.className = "primary-btn";
            joinButton.textContent = "Join Hackathon";
            joinButton.addEventListener("click", async function () {
                joinButton.disabled = true;
                try {
                    const result = await apiRequest("/hackathons/" + hackathon.id + "/join", { method: "POST" });
                    alert(result.message);
                    await loadStudentHackathons();
                } catch (error) {
                    alert(error.message);
                    joinButton.disabled = false;
                }
            });
            card.appendChild(joinButton);
        }
        studentHackathonList.appendChild(card);
    });
}

async function loadStudentHackathons() {
    try {
        renderStudentHackathons(await apiRequest("/hackathons"));
    } catch (error) {
        studentHackathonList.textContent = "Log in as a student to browse hackathons. " + error.message;
    }
}

loadStudentHackathons();
