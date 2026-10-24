const hackathonHistoryList = document.getElementById("hackathonHistoryList");

function historyText(parent, tag, text) {
    const item = document.createElement(tag);
    item.textContent = text;
    parent.appendChild(item);
}

function addSavedHistory(hackathons) {
    Array.from(hackathonHistoryList.querySelectorAll("[data-sample-hackathon]")).forEach(function (sample) {
        const title = sample.querySelector("h4");
        if (title && hackathons.some(function (hackathon) { return hackathon.name === title.textContent.trim(); })) sample.remove();
    });

    hackathons.filter(function (hackathon) { return hackathon.joined; }).forEach(function (hackathon) {

        const row = document.createElement("article");
        row.className = "history-item";
        const info = document.createElement("div");
        info.className = "history-info";
        historyText(info, "h4", hackathon.name);
        historyText(info, "p", hackathon.teamName ? "Team: " + hackathon.teamName : "You joined · Waiting for a team");
        const pool = hackathon.prizePool || { first: 0, second: 0, third: 0 };
        historyText(info, "p", "Prize pool: ₹" + pool.first + " · ₹" + pool.second + " · ₹" + pool.third);
        (hackathon.results || []).forEach(function (result) {
            historyText(info, "p", result.rank + (result.rank === 1 ? "st" : result.rank === 2 ? "nd" : "rd") + " place: " + result.teamName + " · ₹" + result.prizeAmount);
            historyText(info, "p", "Team members: " + (result.members || []).map(function (member) { return member.name + " (" + member.skill + ")"; }).join(", "));
        });
        row.appendChild(info);

        const badge = document.createElement("span");
        badge.className = "history-status " + (hackathon.status === "completed" ? "completed" : "upcoming");
        badge.textContent = hackathon.status === "completed" ? "Completed" : hackathon.status === "closed" ? "Registration closed" : "Upcoming";
        row.appendChild(badge);
        hackathonHistoryList.appendChild(row);
    });
}

apiRequest("/hackathons").then(addSavedHistory).catch(function () {
    // Keep the sample history visible if the API is unavailable or the user is logged out.
});
