const User = require("../models/User");
const Team = require("../models/Team");
const Hackathon = require("../models/Hackathon");

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

async function assignStudent(student, teams) {
    const team = chooseTeam(teams, student.skill);
    if (!team) return null;

    team.members.push({
        userId: student._id,
        name: student.firstName + " " + student.lastName,
        email: student.email,
        skill: student.skill || "General"
    });
    await team.save();
    return team;
}

async function assignPendingStudents() {
    const teams = await Team.find({ hackathonId: null }).sort({ createdAt: 1 });
    const students = await User.find({ role: "student" }).sort({ createdAt: 1 });
    const events = await Hackathon.find({}, "participants.userId");
    const eventParticipantIds = new Set();
    events.forEach(function (event) {
        event.participants.forEach(function (participant) {
            eventParticipantIds.add(String(participant.userId));
        });
    });
    const assignedIds = new Set();
    const assignedEmails = new Set();

    teams.forEach(function (team) {
        team.members.forEach(function (member) {
            if (member.userId) assignedIds.add(String(member.userId));
            if (member.email) assignedEmails.add(member.email.trim().toLowerCase());
        });
    });

    let assignedCount = 0;
    for (const student of students) {
        if (assignedIds.has(String(student._id)) || assignedEmails.has(student.email.trim().toLowerCase()) || eventParticipantIds.has(String(student._id))) continue;
        const team = await assignStudent(student, teams);
        if (!team) break;
        assignedIds.add(String(student._id));
        assignedEmails.add(student.email.trim().toLowerCase());
        assignedCount += 1;
    }

    const pendingCount = students.filter(function (student) {
        return !assignedIds.has(String(student._id)) && !assignedEmails.has(student.email.trim().toLowerCase()) && !eventParticipantIds.has(String(student._id));
    }).length;
    return { assignedCount, pendingCount };
}

async function assignNewStudent(student) {
    const teams = await Team.find({ hackathonId: null }).sort({ createdAt: 1 });
    const alreadyAssigned = teams.some(function (team) {
        return team.members.some(function (member) {
            return (member.userId && String(member.userId) === String(student._id)) ||
                (member.email && member.email.trim().toLowerCase() === student.email.trim().toLowerCase());
        });
    });
    if (alreadyAssigned) return null;
    return assignStudent(student, teams);
}

module.exports = { assignPendingStudents, assignNewStudent };
