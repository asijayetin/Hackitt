const eventRegistrationTotal = document.getElementById("eventRegistrationTotal");
const teamTotal = document.getElementById("teamTotal");
const activeHackathonTotal = document.getElementById("activeHackathonTotal");

apiRequest("/hackathons").then(function (hackathons) {
    eventRegistrationTotal.textContent = hackathons.reduce(function (total, hackathon) {
        return total + hackathon.participantCount;
    }, 0);
    teamTotal.textContent = hackathons.reduce(function (total, hackathon) {
        return total + hackathon.teamCount;
    }, 0);
    activeHackathonTotal.textContent = hackathons.filter(function (hackathon) {
        return hackathon.status === "open";
    }).length;
}).catch(function () {
    eventRegistrationTotal.textContent = "—";
    teamTotal.textContent = "—";
    activeHackathonTotal.textContent = "—";
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
