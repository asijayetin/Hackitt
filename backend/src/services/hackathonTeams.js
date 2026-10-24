const Team = require("../models/Team");

function chooseTeam(teams, skill) {
    const skillName = (skill || "General").trim().toLowerCase();
    const availableTeams = teams.filter(function (team) {
        return team.members.length < team.maxSize;
    });

    availableTeams.sort(function (first, second) {
        if (first.members.length !== second.members.length) {
            return first.members.length - second.members.length;
        }

        const firstSameSkill = first.members.filter(function (member) {
            return (member.skill || "General").trim().toLowerCase() === skillName;
        }).length;
        const secondSameSkill = second.members.filter(function (member) {
            return (member.skill || "General").trim().toLowerCase() === skillName;
        }).length;
        return firstSameSkill - secondSameSkill;
    });

    return availableTeams[0] || null;
}

async function updateHackathonTeams(hackathon) {
    const teams = await Team.find({ hackathonId: hackathon._id }).sort({ createdAt: 1 });
    const assignedIds = new Set();
    teams.forEach(function (team) {
        team.members.forEach(function (member) {
            assignedIds.add(String(member.userId));
        });
    });

    const pending = hackathon.participants.filter(function (participant) {
        return !assignedIds.has(String(participant.userId));
    });
    const starterTeamCount = hackathon.initialTeamCount || hackathon.minTeamSize || 3;

    while (pending.length) {
        const person = pending.shift();
        let team = null;

        // Start each of the first few teams with one student.
        if (teams.length < starterTeamCount) {
            team = new Team({
                hackathonId: hackathon._id,
                name: "Team " + (teams.length + 1),
                maxSize: hackathon.maxTeamSize,
                members: []
            });
            teams.push(team);
        } else {
            team = chooseTeam(teams, person.skill);
        }

        // If every team is full, make a new team so no one has to wait.
        if (!team) {
            team = new Team({
                hackathonId: hackathon._id,
                name: "Team " + (teams.length + 1),
                maxSize: hackathon.maxTeamSize,
                members: []
            });
            teams.push(team);
        }

        team.members.push({
            userId: person.userId,
            name: person.name,
            email: person.email,
            skill: person.skill
        });
        await team.save();
        assignedIds.add(String(person.userId));
    }

    return {
        teamCount: teams.length,
        assignedCount: assignedIds.size,
        waitingCount: 0
    };
}

module.exports = { updateHackathonTeams };
