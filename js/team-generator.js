/* ==========================================================
   TEAM GENERATOR
   ----------------------------------------------------------
   This file does 3 things:
   1. Holds mock participant data (replace with real data
      from your backend/database later)
   2. Runs a "greedy round-robin" algorithm to split
      participants into balanced teams
   3. Renders the result onto the page
========================================================== */


/* ----------------------------------------------------------
   1. PARTICIPANT DATA
   Real signups are stored in the browser's localStorage
   under the key "hackitt_participants" (see signup.js).
   That's basically a mini "database" living in the browser
   for now, until you build a real backend.

   If nobody has signed up yet (localStorage is empty), we
   fall back to mock data so the page still has something to
   show while you're building/demoing.
---------------------------------------------------------- */

const mockParticipants = [
    { name: "Aditi Sharma",  skill: "Frontend" },
    { name: "Rohan Verma",   skill: "Backend" },
    { name: "Simran Kaur",   skill: "Design" },
    { name: "Karan Mehta",   skill: "Backend" },
    { name: "Neha Gupta",    skill: "Frontend" },
    { name: "Aman Singh",    skill: "ML/Data" },
    { name: "Priya Nair",    skill: "Design" },
    { name: "Vikram Rao",    skill: "Frontend" },
    { name: "Ishita Joshi",  skill: "Backend" },
    { name: "Yash Patel",    skill: "ML/Data" },
    { name: "Diya Malhotra", skill: "Design" },
    { name: "Arjun Reddy",   skill: "Frontend" },
];

function loadParticipants() {
    const stored = localStorage.getItem("hackitt_participants");

    if (stored) {
        const realParticipants = JSON.parse(stored);

        // Only use real data if at least one student has signed up
        if (realParticipants.length > 0) {
            return realParticipants;
        }
    }

    // Nobody's signed up yet — show mock data so the demo isn't empty
    return mockParticipants;
}

const participants = loadParticipants();


/* ----------------------------------------------------------
   2. THE ALGORITHM
   Goal: split "participants" into "numTeams" teams so every
   team gets a mix of skills instead of all-frontend or
   all-design teams.

   How it works:
   a) Group participants by skill
      { Frontend: [...], Backend: [...], Design: [...] }
   b) Walk through each skill group, and hand people out to
      teams in rotation (team 0, team 1, team 2, team 0, ...)
   c) Because we rotate across EVERY skill group, each team
      ends up with a slice of every skill instead of one team
      hoarding all the frontend people.
---------------------------------------------------------- */

function generateTeams(people, numTeams) {

    // a) Group by skill
    const groups = {};
    people.forEach((person) => {
        if (!groups[person.skill]) {
            groups[person.skill] = [];
        }
        groups[person.skill].push(person);
    });

    // Set up empty teams: [[], [], []] for numTeams = 3
    const teams = Array.from({ length: numTeams }, () => []);

    // b) + c) Round-robin through each skill group
    let teamIndex = 0;

    Object.values(groups).forEach((groupOfPeople) => {
        groupOfPeople.forEach((person) => {
            teams[teamIndex].push(person);

            // move to the next team, wrapping back to 0
            teamIndex = (teamIndex + 1) % numTeams;
        });
    });

    return teams;
}


/* ----------------------------------------------------------
   3. RENDER RESULT TO THE PAGE
---------------------------------------------------------- */

function renderTeams(teams) {

    const resultsContainer = document.getElementById("teams-results");
    resultsContainer.innerHTML = ""; // clear old results before drawing new ones

    teams.forEach((team, index) => {

        // Build one team card
        const card = document.createElement("div");
        card.className = "team-card";

        const heading = document.createElement("h4");
        heading.textContent = `Team ${index + 1}`;
        card.appendChild(heading);

        const memberList = document.createElement("ul");
        memberList.className = "team-member-list";

        team.forEach((person) => {
            const item = document.createElement("li");
            item.innerHTML = `${person.name} <span class="team-member-skill">${person.skill}</span>`;
            memberList.appendChild(item);
        });

        card.appendChild(memberList);
        resultsContainer.appendChild(card);
    });

    // Show the results section (it starts hidden)
    resultsContainer.classList.add("visible");
}


/* ----------------------------------------------------------
   HOOK UP THE BUTTON
---------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {

    const generateBtn = document.getElementById("generate-btn");
    const teamSizeInput = document.getElementById("team-size");
    const participantCountEl = document.getElementById("participant-count");

    participantCountEl.textContent = participants.length;

    generateBtn.addEventListener("click", () => {

        const teamSize = parseInt(teamSizeInput.value, 10);

        if (!teamSize || teamSize < 2) {
            alert("Please enter a team size of at least 2.");
            return;
        }

        // Work out how many teams we need based on team size
        const numTeams = Math.ceil(participants.length / teamSize);

        const teams = generateTeams(participants, numTeams);

        renderTeams(teams);
    });

});