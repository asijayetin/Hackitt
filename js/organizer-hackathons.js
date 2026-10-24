const organizerHackathonList = document.getElementById("organizerHackathonList");
const createHackathonForm = document.getElementById("createHackathonForm");
const createHackathonBtn = document.getElementById("createHackathonBtn");

function addText(parent, tag, text) {
    const element = document.createElement(tag);
    element.textContent = text;
    parent.appendChild(element);
}

function renderOrganizerHackathons(hackathons) {
    organizerHackathonList.innerHTML = "";
    if (!hackathons.length) {
        addText(organizerHackathonList, "p", "No hackathons yet. Create your first one above.");
        return;
    }

    hackathons.forEach(function (hackathon) {
        const card = document.createElement("article");
        card.className = "hackathon-card";
        const heading = document.createElement("div");
        heading.className = "hackathon-card-heading";
        addText(heading, "h3", hackathon.name);
        const status = document.createElement("span");
        status.className = "hackathon-status " + hackathon.status;
        status.textContent = hackathon.status === "open" ? "Registration open" : "Registration closed";
        heading.appendChild(status);
        card.appendChild(heading);
        addText(card, "p", hackathon.description);
        addText(card, "p", "Team size: " + hackathon.minTeamSize + "–" + hackathon.maxTeamSize);
        addText(card, "p", hackathon.participantCount + " students · " + hackathon.teamCount + " teams · " + hackathon.waitingCount + " waiting for a team");
        if (hackathon.requiredSkills.length) {
            addText(card, "p", "Skills: " + hackathon.requiredSkills.join(", "));
        }
        hackathon.teamMembers.forEach(function (team) {
            const teamBox = document.createElement("div");
            teamBox.className = "hackathon-team-summary";
            addText(teamBox, "strong", team.name + " · " + team.members.length + "/" + team.maxSize);
            addText(teamBox, "p", team.members.map(function (member) {
                return member.name + " (" + member.skill + ")";
            }).join(" · "));
            card.appendChild(teamBox);
        });

        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "secondary-btn";
        toggle.textContent = hackathon.status === "open" ? "Close registration" : "Open registration";
        toggle.addEventListener("click", async function () {
            toggle.disabled = true;
            try {
                await apiRequest("/hackathons/" + hackathon.id + "/status", {
                    method: "PATCH",
                    body: JSON.stringify({ status: hackathon.status === "open" ? "closed" : "open" })
                });
                await loadOrganizerHackathons();
            } catch (error) {
                alert(error.message);
                toggle.disabled = false;
            }
        });
        card.appendChild(toggle);
        organizerHackathonList.appendChild(card);
    });
}

async function loadOrganizerHackathons() {
    try {
        renderOrganizerHackathons(await apiRequest("/hackathons"));
    } catch (error) {
        organizerHackathonList.textContent = "Log in as an organizer to manage hackathons. " + error.message;
    }
}

createHackathonForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const minTeamSize = Number(document.getElementById("minTeamSize").value);
    const maxTeamSize = Number(document.getElementById("maxTeamSize").value);
    if (minTeamSize > maxTeamSize) {
        alert("Maximum team size must be at least the minimum team size.");
        return;
    }

    const requiredSkills = Array.from(createHackathonForm.querySelectorAll("input[name='requiredSkills']:checked"))
        .map(function (input) { return input.value; });
    const body = {
        name: document.getElementById("hackathonName").value.trim(),
        description: document.getElementById("hackathonDescription").value.trim(),
        minTeamSize,
        maxTeamSize,
        requiredSkills
    };

    createHackathonBtn.disabled = true;
    try {
        const result = await apiRequest("/hackathons", {
            method: "POST",
            body: JSON.stringify(body)
        });
        alert(result.message);
        createHackathonForm.reset();
        document.getElementById("minTeamSize").value = 3;
        document.getElementById("maxTeamSize").value = 4;
        await loadOrganizerHackathons();
    } catch (error) {
        alert(error.message);
    } finally {
        createHackathonBtn.disabled = false;
    }
});

loadOrganizerHackathons();
