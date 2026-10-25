const Hackathon = require("../models/Hackathon");
const Team = require("../models/Team");
const TeamChangeRequest = require("../models/TeamChangeRequest");

async function syncStudentProfile(user) {
    await Team.updateMany({ "members.userId": user._id }, { $set: {
        "members.$[member].name": user.firstName + " " + user.lastName,
        "members.$[member].email": user.email,
        "members.$[member].skill": user.skill
    } }, { arrayFilters: [{ "member.userId": user._id }] });

    await Hackathon.updateMany({ "participants.userId": user._id }, { $set: {
        "participants.$[participant].name": user.firstName + " " + user.lastName,
        "participants.$[participant].email": user.email,
        "participants.$[participant].skill": user.skill
    } }, { arrayFilters: [{ "participant.userId": user._id }] });
}

async function removeStudentRecords(user) {
    await Team.updateMany({}, { $pull: { members: { userId: user._id } } });
    await Hackathon.updateMany({}, { $pull: { participants: { userId: user._id } } });
    await TeamChangeRequest.deleteMany({ studentId: user._id });
    await user.deleteOne();
}

module.exports = { syncStudentProfile, removeStudentRecords };
