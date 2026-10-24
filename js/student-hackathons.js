const studentHackathonList = document.getElementById("studentHackathonList");

function addText(parent, tag, text) {
    const element = document.createElement(tag);
    element.textContent = text;
    parent.appendChild(element);
}

function addPrize(prizes, place, amount) {
    const item = document.createElement("div");
    item.className = "hackathon-prize-item";
    addText(item, "span", place);
    addText(item, "strong", "₹" + amount);
    prizes.appendChild(item);
}

function renderStudentHackathons(hackathons) {
    studentHackathonList.innerHTML = "";
    studentHackathonList.classList.remove("hackathon-load-error");
    if (!hackathons.length) {
        const empty = document.createElement("p");
        empty.className = "hackathon-empty-state";
        empty.textContent = "No open hackathons right now. Check back later.";
        studentHackathonList.appendChild(empty);
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
        status.textContent = hackathon.status === "completed" ? "Completed" : hackathon.joined ? "Joined" : "Registration open";
        heading.appendChild(status);
        card.appendChild(heading);
        const description = document.createElement("p");
        description.className = "hackathon-description";
        description.textContent = hackathon.description;
        card.appendChild(description);

        const details = document.createElement("div");
        details.className = "hackathon-info-grid";
        [["TEAM SIZE", hackathon.minTeamSize + "–" + hackathon.maxTeamSize], ["REGISTERED", String(hackathon.participantCount) + " students"]].forEach(function (detail) {
            const item = document.createElement("div");
            item.className = "hackathon-info-item";
            addText(item, "span", detail[0]);
            addText(item, "strong", detail[1]);
            details.appendChild(item);
        });
        card.appendChild(details);

        const pool = hackathon.prizePool || { first: 10000, second: 5000, third: 3000 };
        const prizePanel = document.createElement("div");
        prizePanel.className = "hackathon-prize-panel";
        addText(prizePanel, "p", "PRIZE POOL");
        const prizes = document.createElement("div");
        prizes.className = "hackathon-prize-list";
        addPrize(prizes, "1st place", pool.first);
        addPrize(prizes, "2nd place", pool.second);
        addPrize(prizes, "3rd place", pool.third);
        prizePanel.appendChild(prizes);
        card.appendChild(prizePanel);
        if (hackathon.requiredSkills.length) {
            const skills = document.createElement("div");
            skills.className = "hackathon-required-skills";
            addText(skills, "span", "LOOKING FOR");
            const chips = document.createElement("div");
            chips.className = "hackathon-skill-chips";
            hackathon.requiredSkills.forEach(function (skill) {
                const chip = document.createElement("span");
                chip.textContent = skill;
                chips.appendChild(chip);
            });
            skills.appendChild(chips);
            card.appendChild(skills);
        }

        if (hackathon.joined) {
            addText(card, "p", hackathon.teamName
                ? "You are in " + hackathon.teamName + "."
                : "You are registered. Your team assignment is being prepared.");
            if (hackathon.teamMembers.length) {
                const members = document.createElement("div");
                members.className = "hackathon-team-summary";
                addText(members, "strong", "Your team members");
                addText(members, "p", hackathon.teamMembers.map(function (member) {
                    return member.name + " (" + member.skill + ")";
                }).join(" · "));
                card.appendChild(members);
            }
            (hackathon.results || []).forEach(function (winner) {
                const resultBox = document.createElement("div");
                resultBox.className = "hackathon-team-summary";
                addText(resultBox, "strong", winner.rank + (winner.rank === 1 ? "st" : winner.rank === 2 ? "nd" : "rd") + " place · " + winner.teamName + " · ₹" + winner.prizeAmount);
                card.appendChild(resultBox);
            });
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
        studentHackathonList.classList.add("hackathon-load-error");
        studentHackathonList.textContent = "Log in as a student to browse hackathons. " + error.message;
    }
}

loadStudentHackathons();
