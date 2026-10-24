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
        addText(card, "p", "Team size: " + hackathon.minTeamSize + "–" + hackathon.maxTeamSize + " · Starter teams: " + (hackathon.initialTeamCount || 3));
        const pool = hackathon.prizePool || { first: 10000, second: 5000, third: 3000 };
        addText(card, "p", "Prize pool: 1st ₹" + pool.first + " · 2nd ₹" + pool.second + " · 3rd ₹" + pool.third);
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

        if (hackathon.status === "completed") {
            (hackathon.results || []).forEach(function (winner) {
                const resultBox = document.createElement("div");
                resultBox.className = "hackathon-team-summary";
                addText(resultBox, "strong", winner.rank + (winner.rank === 1 ? "st" : winner.rank === 2 ? "nd" : "rd") + " place · " + winner.teamName + " · ₹" + winner.prizeAmount);
                addText(resultBox, "p", (winner.members || []).map(function (member) { return member.name + " (" + member.skill + ")"; }).join(" · "));
                card.appendChild(resultBox);
            });
            organizerHackathonList.appendChild(card);
            return;
        }

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

        if (hackathon.status === "closed" && hackathon.teamMembers.length) {
            const resultsForm = document.createElement("form");
            resultsForm.className = "hackathon-results-form";
            addText(resultsForm, "h4", "Finish event and choose winners");
            ["1st", "2nd", "3rd"].forEach(function (place, index) {
                const label = document.createElement("label");
                label.textContent = place + " place team";
                const select = document.createElement("select");
                select.name = "winner" + (index + 1);
                const empty = document.createElement("option");
                empty.value = "";
                empty.textContent = index === 0 ? "Choose a team" : "No prize for this place";
                select.appendChild(empty);
                hackathon.teamMembers.forEach(function (team) {
                    const option = document.createElement("option");
                    option.value = team.id;
                    option.textContent = team.name;
                    select.appendChild(option);
                });
                label.appendChild(select);
                resultsForm.appendChild(label);
            });
            const finish = document.createElement("button");
            finish.type = "submit";
            finish.className = "primary-btn";
            finish.textContent = "Save winners";
            resultsForm.appendChild(finish);
            resultsForm.addEventListener("submit", async function (event) {
                event.preventDefault();
                const winners = [1, 2, 3].map(function (rank) {
                    return { teamId: resultsForm.elements["winner" + rank].value };
                });
                if (!winners[0].teamId) return alert("Choose the first place team before finishing.");
                if (winners.filter(function (winner) { return winner.teamId; }).some(function (winner, position, list) {
                    return list.findIndex(function (item) { return item.teamId === winner.teamId; }) !== position;
                })) return alert("Each prize place needs a different team.");
                finish.disabled = true;
                try {
                    const result = await apiRequest("/hackathons/" + hackathon.id + "/results", {
                        method: "PATCH",
                        body: JSON.stringify({ winners })
                    });
                    alert(result.message);
                    await loadOrganizerHackathons();
                } catch (error) {
                    alert(error.message);
                    finish.disabled = false;
                }
            });
            card.appendChild(resultsForm);
        }
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
        initialTeamCount: Number(document.getElementById("initialTeamCount").value),
        requiredSkills,
        prizePool: {
            first: Number(document.getElementById("firstPrize").value),
            second: Number(document.getElementById("secondPrize").value),
            third: Number(document.getElementById("thirdPrize").value)
        }
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
