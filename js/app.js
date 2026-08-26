// ==================== COMMON HELPERS ====================

const $ = id => document.getElementById(id);
const USERS_KEY = "hackittUsers";
const PARTICIPANTS_KEY = "hackitt_participants";
const TEAMS_KEY = "hackitt_teams";

const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY)) || [];
const saveUsers = users => localStorage.setItem(USERS_KEY, JSON.stringify(users));
const getParticipants = () => JSON.parse(localStorage.getItem(PARTICIPANTS_KEY)) || [];
const saveParticipants = data => localStorage.setItem(PARTICIPANTS_KEY, JSON.stringify(data));
const getTeams = () => JSON.parse(localStorage.getItem(TEAMS_KEY)) || [];
const saveTeams = data => localStorage.setItem(TEAMS_KEY, JSON.stringify(data));

const normalizeEmail = email => (email || "").trim().toLowerCase();

const getCurrentUser = () =>
    JSON.parse(sessionStorage.getItem("currentUser"));

let currentUser = getCurrentUser();

function findUserByEmail(users, email) {
    email = normalizeEmail(email);
    return users.find(user => normalizeEmail(user.email) === email);
}

function findTeamForUser(teams, email) {
    email = normalizeEmail(email);

    for (const team of teams) {
        if (!team.members) team.members = [];

        if (team.members.some(member => normalizeEmail(member.email) === email)) {
            return team;
        }
    }

    return null;
}

function setText(id, text) {
    const element = $(id);
    if (element) element.innerText = text;
}

function setProfileInfo(nameId, emailId, avatarId, user) {
    if (!user) return;

    const name = `${user.firstName} ${user.lastName}`;

    setText(nameId, name);

    const emailElement = $(emailId);
    if (emailElement) {
        emailElement.innerText = user.email;
        emailElement.href = `mailto:${user.email}`;
    }

    const avatar = $(avatarId);
    if (avatar) {
        const first = user.firstName?.charAt(0) || "";
        const last = user.lastName?.charAt(0) || "";
        avatar.innerText = (first + last).toUpperCase();
    }
}

// ==================== ROLE / SKILL FIELD ====================

const roleStudent = $("roleStudent");
const roleOrganizer = $("roleOrganizer");
const skillField = $("skillField");

function toggleSkillField() {
    if (!skillField) return;
    skillField.style.display =
        roleOrganizer?.checked ? "none" : "flex";
}

if (roleStudent && roleOrganizer) {
    roleStudent.addEventListener("change", toggleSkillField);
    roleOrganizer.addEventListener("change", toggleSkillField);
    toggleSkillField();
}

// ==================== SIGNUP ====================

const signupForm = $("signupForm");

if (signupForm) {
    signupForm.addEventListener("submit", event => {
        event.preventDefault();

        const firstName = $("firstName").value.trim();
        const lastName = $("lastName").value.trim();
        const email = normalizeEmail($("signupEmail").value);
        const password = $("signupPassword").value;
        const confirmPassword = $("confirmPassword").value;
        const selectedRole = document.querySelector(
            'input[name="role"]:checked'
        );

        if (!selectedRole) {
            alert("Please select a role!");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        const role = selectedRole.value;
        const skillInput = $("skill");
        const skill = skillInput ? skillInput.value : "General";
        const users = getUsers();

        if (users.some(user => normalizeEmail(user.email) === email)) {
            alert("Email already registered!");
            return;
        }

        const newUser = {
            id: Date.now().toString(),
            firstName,
            lastName,
            email,
            password,
            role,
            skill: role === "student" ? skill : "General"
        };

        users.push(newUser);
        saveUsers(users);

        if (role === "student") {
            const participants = getParticipants();

            if (!participants.some(
                participant => normalizeEmail(participant.email) === email
            )) {
                participants.push({
                    name: `${firstName} ${lastName}`,
                    email,
                    skill: skill || "General"
                });

                saveParticipants(participants);
            }
        }

        alert("Account created successfully!");
        window.location.href = "login.html";
    });
}

// ==================== LOGIN ====================

const loginForm = $("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", event => {
        event.preventDefault();

        const email = normalizeEmail($("email").value);
        const password = $("password").value;

        const foundUser = getUsers().find(user =>
            normalizeEmail(user.email) === email &&
            user.password === password
        );

        if (!foundUser) {
            alert("Invalid email or password!");
            return;
        }

        sessionStorage.setItem(
            "currentUser",
            JSON.stringify(foundUser)
        );

        currentUser = foundUser;

        alert("Login successful!");

        window.location.href =
            foundUser.role === "student"
                ? "profile-student.html"
                : "profile-organizer.html";
    });
}

// ==================== DISPLAY CURRENT USER ====================

if (currentUser) {
    setText("studentName", currentUser.firstName);
    setText("organizerName", currentUser.firstName);

    setProfileInfo(
        "profileStudentName",
        "profileStudentEmail",
        "profileStudentAvatar",
        currentUser
    );

    setProfileInfo(
        "profileOrgName",
        "profileOrgEmail",
        "profileOrgAvatar",
        currentUser
    );
}

// ==================== NAVIGATION ====================

const navLoginBtn = $("navLoginBtn");
const navSignupBtn = $("navSignupBtn");
const navProfileBtn = $("navProfileBtn");
const navLogoutBtn = $("navLogoutBtn");

if (navLoginBtn && navSignupBtn && navProfileBtn && navLogoutBtn) {
    const loggedIn = !!currentUser;

    navLoginBtn.style.display = loggedIn ? "none" : "inline-block";
    navSignupBtn.style.display = loggedIn ? "none" : "inline-block";
    navProfileBtn.style.display = loggedIn ? "inline-block" : "none";
    navLogoutBtn.style.display = loggedIn ? "inline-block" : "none";

    if (loggedIn) {
        navProfileBtn.href =
            currentUser.role === "student"
                ? "profile-student.html"
                : "profile-organizer.html";
    }
}

// ==================== LOGOUT ====================

function logoutUser(event) {
    event.preventDefault();

    sessionStorage.removeItem("currentUser");
    localStorage.removeItem("currentUser");

    window.location.href = "index.html";
}

if (navLogoutBtn) {
    navLogoutBtn.addEventListener("click", logoutUser);
}

const logoutBtn = $("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", logoutUser);
}

// ==================== EDIT PROFILE ====================

const editProfileBtn = $("editProfileBtn");
const editProfileModal = $("editProfileModal");
const closeEditProfile = $("closeEditProfile");
const saveProfileBtn = $("saveProfileBtn");

if (editProfileBtn && editProfileModal && saveProfileBtn) {

    editProfileBtn.addEventListener("click", event => {
        event.preventDefault();

        if (!currentUser) {
            alert("Please log in first.");
            return;
        }

        $("editFirstName").value = currentUser.firstName || "";
        $("editLastName").value = currentUser.lastName || "";
        $("editEmail").value = currentUser.email || "";

        const editSkill = $("editSkill");

        if (editSkill && currentUser.skill) {
            editSkill.value = currentUser.skill;
        }

        editProfileModal.classList.add("active");
    });

    if (closeEditProfile) {
        closeEditProfile.addEventListener("click", () => {
            editProfileModal.classList.remove("active");
        });
    }

    editProfileModal.addEventListener("click", event => {
        if (event.target === editProfileModal) {
            editProfileModal.classList.remove("active");
        }
    });

    saveProfileBtn.addEventListener("click", () => {
        const updatedFirstName = $("editFirstName").value.trim();
        const updatedLastName = $("editLastName").value.trim();
        const updatedEmail = normalizeEmail($("editEmail").value);

        const editSkill = $("editSkill");
        const updatedSkill = editSkill
            ? editSkill.value
            : currentUser.skill;

        if (!updatedFirstName || !updatedLastName || !updatedEmail) {
            alert("Please fill in all fields.");
            return;
        }

        const oldEmail = normalizeEmail(currentUser.email);
        const users = getUsers();

        const duplicate = users.some(user =>
            normalizeEmail(user.email) === updatedEmail &&
            normalizeEmail(user.email) !== oldEmail
        );

        if (duplicate) {
            alert("Email already registered!");
            return;
        }

        const user = findUserByEmail(users, oldEmail);

        if (!user) {
            alert("User not found!");
            return;
        }

        user.firstName = updatedFirstName;
        user.lastName = updatedLastName;
        user.email = updatedEmail;
        user.skill = updatedSkill;

        currentUser = user;

        saveUsers(users);

        sessionStorage.setItem(
            "currentUser",
            JSON.stringify(currentUser)
        );

        // Update participant
        const participants = getParticipants();
        const participant = participants.find(
            p => normalizeEmail(p.email) === oldEmail
        );

        if (participant) {
            participant.name =
                `${updatedFirstName} ${updatedLastName}`;
            participant.email = updatedEmail;
            participant.skill = updatedSkill;
        }

        saveParticipants(participants);

        // Update team members
        const teams = getTeams();

        teams.forEach(team => {
            if (!team.members) team.members = [];

            team.members.forEach(member => {
                if (normalizeEmail(member.email) === oldEmail) {
                    member.name =
                        `${updatedFirstName} ${updatedLastName}`;
                    member.email = updatedEmail;
                    member.skill = updatedSkill;
                }
            });
        });

        saveTeams(teams);

        // Update page immediately
        setText(
            "profileStudentName",
            `${updatedFirstName} ${updatedLastName}`
        );

        setText("studentName", updatedFirstName);

        setText(
            "profileOrgName",
            `${updatedFirstName} ${updatedLastName}`
        );

        setText("organizerName", updatedFirstName);

        const studentEmail = $("profileStudentEmail");
        if (studentEmail) {
            studentEmail.innerText = updatedEmail;
            studentEmail.href = `mailto:${updatedEmail}`;
        }

        const orgEmail = $("profileOrgEmail");
        if (orgEmail) {
            orgEmail.innerText = updatedEmail;
            orgEmail.href = `mailto:${updatedEmail}`;
        }

        editProfileModal.classList.remove("active");

        alert("Profile updated!");
    });
}

// ==================== TEAM STATUS BANNER ====================

const teamBannerTitle = $("teamBannerTitle");
const teamBannerText = $("teamBannerText");
const teamBannerBtn = $("teamBannerBtn");

if (teamBannerTitle && teamBannerText && teamBannerBtn) {
    const teams = getTeams();

    if (teams.length === 0) {
        teamBannerTitle.innerText =
            "Hackitt Summer Jam 2026";

        teamBannerText.innerText =
            "Teams have not been generated yet. Check back soon!";

        teamBannerBtn.innerText = "Check Team";
        teamBannerBtn.href = "check.html";

    } else {
        const myTeam = currentUser
            ? findTeamForUser(teams, currentUser.email)
            : null;

        if (myTeam) {
            teamBannerTitle.innerText =
                `You're in ${myTeam.name}!`;

            teamBannerText.innerText =
                `${myTeam.members.length}/${myTeam.maxSize} members`;

            teamBannerBtn.innerText = "View My Team";
            teamBannerBtn.href = "check.html";

        } else {
            teamBannerTitle.innerText =
                "Teams are ready!";

            teamBannerText.innerText =
                "Head over and pick your team.";

            teamBannerBtn.innerText = "Check Team";
            teamBannerBtn.href = "check.html";
        }
    }
}

// ==================== STUDENT DASHBOARD ====================

const myTeamStatus = $("myTeamStatus");
const myTeamMessage = $("myTeamMessage");
const myTeamName = $("myTeamName");
const myTeamMembers = $("myTeamMembers");

if (myTeamStatus && myTeamMessage) {
    const dashboardTeams = getTeams();

    const myAssignedTeam = currentUser
        ? findTeamForUser(dashboardTeams, currentUser.email)
        : null;

    if (myAssignedTeam) {
        myTeamStatus.innerText = "Assigned";
        myTeamStatus.style.color = "#00e5ff";

        if (myTeamName) {
            myTeamName.innerText = myAssignedTeam.name;
        }

        myTeamMessage.innerText =
            `${myAssignedTeam.members.length}/${myAssignedTeam.maxSize} members`;

        if (myTeamMembers) {
            myTeamMembers.innerHTML =
                myAssignedTeam.members
                    .map(member =>
                        `<p>${member.name} - ${member.skill || "General"}</p>`
                    )
                    .join("");
        }

    } else if (dashboardTeams.length === 0) {
        myTeamStatus.innerText = "Not Assigned";

        myTeamMessage.innerText =
            "Your team will appear here once the organizer generates the teams.";

    } else {
        myTeamStatus.innerText = "Not Assigned";

        myTeamMessage.innerText =
            "Teams are ready! Go to Check Team to join one.";
    }
}