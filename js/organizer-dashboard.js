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

const pendingRequestTotal = document.getElementById("pendingRequestTotal");
if (pendingRequestTotal) {
    apiRequest("/team-change-requests").then(function (requests) {
        const pendingCount = requests.filter(function (request) {
            return request.status === "pending";
        }).length;
        pendingRequestTotal.textContent = pendingCount === 1
            ? "1 request needs your review."
            : pendingCount + " requests need your review.";
    }).catch(function () {
        pendingRequestTotal.textContent = "Log in as organizer to view requests.";
    });
}
