const participantTotal = document.getElementById("participantTotal");
const teamTotal = document.getElementById("teamTotal");

apiRequest("/participants").then(function (participants) {
    participantTotal.textContent = participants.length;
}).catch(function () {
    participantTotal.textContent = "Login required";
});

apiRequest("/teams").then(function (teams) {
    teamTotal.textContent = teams.length;
}).catch(function () {
    teamTotal.textContent = "Unavailable";
});
