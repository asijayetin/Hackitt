const participantsList = document.getElementById("participantsList");
const participantSearch = document.getElementById("participantSearch");
const participantCount = document.getElementById("participantCount");
let allParticipants = [];

function showParticipants(searchText) {
    const search = searchText.toLowerCase();
    const matches = allParticipants.filter(function (participant) {
        const details = participant.name + " " + participant.email + " " + (participant.skill || "General");
        return details.toLowerCase().includes(search);
    });

    participantsList.innerHTML = "";
    participantCount.textContent = matches.length + " of " + allParticipants.length + " participants";

    if (matches.length === 0) {
        participantsList.textContent = "No matching participants found.";
        return;
    }

    matches.forEach(function (participant) {
        const card = document.createElement("div");
        const name = document.createElement("h2");
        const email = document.createElement("p");
        const skill = document.createElement("p");

        card.className = "dashboard-card";
        name.textContent = participant.name;
        email.textContent = "Email: " + participant.email;
        skill.textContent = "Skill: " + (participant.skill || "General");
        card.append(name, email, skill);
        participantsList.appendChild(card);
    });
}

participantSearch.addEventListener("input", function () {
    showParticipants(participantSearch.value.trim());
});

apiRequest("/participants").then(function (participants) {
    allParticipants = participants;
    if (allParticipants.length === 0) {
        participantCount.textContent = "0 participants";
        participantsList.textContent = "No students have registered yet.";
        return;
    }
    showParticipants("");
}).catch(function (error) {
    participantCount.textContent = "Participants could not be loaded";
    participantsList.textContent = error.message;
});
