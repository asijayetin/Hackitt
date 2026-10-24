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

    let pending = hackathon.participants.filter(function (participant) {
        return !assignedIds.has(String(participant.userId));
    });

    while (pending.length) {
        const person = pending[0];
        const team = chooseTeam(teams, person.skill);
        if (!team) break;
        pending.shift();
        team.members.push({
            userId: person.userId,
            name: person.name,
            email: person.email,
            skill: person.skill
        });
        assignedIds.add(String(person.userId));
    }
    for (const team of teams) await team.save();

    const numberOfNewTeams = Math.floor(pending.length / hackathon.minTeamSize);
    const newTeams = [];
    for (let index = 0; index < numberOfNewTeams; index += 1) {
        newTeams.push(new Team({
            hackathonId: hackathon._id,
            name: "Team " + (teams.length + index + 1),
            maxSize: hackathon.maxTeamSize,
            members: []
        }));
    }

    let assignedToNewTeams = 0;
    while (pending.length) {
        const person = pending[0];
        const team = chooseTeam(newTeams, person.skill);
        if (!team) break;
        pending.shift();
        team.members.push({
            userId: person.userId,
            name: person.name,
            email: person.email,
            skill: person.skill
        });
        assignedToNewTeams += 1;
    }

    if (newTeams.length) await Team.insertMany(newTeams);

    return {
        teamCount: teams.length + newTeams.length,
        assignedCount: assignedIds.size + assignedToNewTeams,
        waitingCount: pending.length
    };
}

module.exports = { updateHackathonTeams };
