/* ==========================================================
   SHOW/HIDE SKILL FIELD BASED ON ROLE
========================================================== */

let roleStudent = document.getElementById("roleStudent");
let roleOrganizer = document.getElementById("roleOrganizer");
let skillField = document.getElementById("skillField");

function toggleSkillField() {

    if (!skillField) return;

    if (roleOrganizer && roleOrganizer.checked) {

        skillField.style.display = "none";

    } else {

        skillField.style.display = "flex";
    }
}

if (roleStudent && roleOrganizer) {

    roleStudent.addEventListener(
        "change",
        toggleSkillField
    );

    roleOrganizer.addEventListener(
        "change",
        toggleSkillField
    );

    toggleSkillField();
}


/* ==========================================================
   USERS
========================================================== */

const USERS_KEY = "hackittUsers";

function getUsers() {

    return JSON.parse(
        localStorage.getItem(USERS_KEY)
    ) || [];
}

function saveUsers(users) {

    localStorage.setItem(
        USERS_KEY,
        JSON.stringify(users)
    );
}


/* ==========================================================
   SIGNUP
========================================================== */

let signupForm =
    document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            let firstName =
                document.getElementById(
                    "firstName"
                ).value.trim();

            let lastName =
                document.getElementById(
                    "lastName"
                ).value.trim();

            let email =
                document.getElementById(
                    "signupEmail"
                ).value
                    .trim()
                    .toLowerCase();

            let password =
                document.getElementById(
                    "signupPassword"
                ).value;

            let confirmPassword =
                document.getElementById(
                    "confirmPassword"
                ).value;

            let selectedRole =
                document.querySelector(
                    'input[name="role"]:checked'
                );

            if (!selectedRole) {

                alert(
                    "Please select a role!"
                );

                return;
            }

            let role =
                selectedRole.value;

            let skillInput =
                document.getElementById("skill");

            let skill =
                skillInput
                    ? skillInput.value
                    : "General";


            if (password !== confirmPassword) {

                alert(
                    "Passwords do not match!"
                );

                return;
            }


            /* Get ALL existing users */

            let users =
                getUsers();


            /* Check duplicate email */

            let alreadyExists =
                users.some(
                    function(user) {

                        return (
                            user.email &&
                            user.email
                                .toLowerCase() ===
                            email
                        );
                    }
                );


            if (alreadyExists) {

                alert(
                    "Email already registered!"
                );

                return;
            }


            /* Create new user */

            let newUser = {

                id:
                    Date.now().toString(),

                firstName:
                    firstName,

                lastName:
                    lastName,

                email:
                    email,

                password:
                    password,

                role:
                    role,

                skill:
                    role === "student"
                        ? skill
                        : "General"
            };


            /* Keep all previous users */

            users.push(newUser);

            saveUsers(users);


            /* Add student to participants */

            if (role === "student") {

                let participants =
                    JSON.parse(
                        localStorage.getItem(
                            "hackitt_participants"
                        )
                    ) || [];

                let alreadyIn =
                    participants.some(
                        function(participant) {

                            return (
                                participant.email &&
                                participant.email
                                    .toLowerCase() ===
                                email
                            );
                        }
                    );


                if (!alreadyIn) {

                    participants.push({

                        name:
                            firstName +
                            " " +
                            lastName,

                        email:
                            email,

                        skill:
                            skill || "General"
                    });


                    localStorage.setItem(
                        "hackitt_participants",
                        JSON.stringify(
                            participants
                        )
                    );
                }
            }


            alert(
                "Account created successfully!"
            );


            window.location.href =
                "login.html";
        }
    );
}


/* ==========================================================
   LOGIN
========================================================== */

let loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            let email =
                document.getElementById(
                    "email"
                ).value
                    .trim()
                    .toLowerCase();


            let password =
                document.getElementById(
                    "password"
                ).value;


            let users =
                getUsers();


            let foundUser =
                users.find(
                    function(user) {

                        return (
                            user.email &&
                            user.email
                                .toLowerCase() ===
                            email &&
                            user.password ===
                            password
                        );
                    }
                );


            if (!foundUser) {

                alert(
                    "Invalid email or password!"
                );

                return;
            }


            /*
             * IMPORTANT:
             * Current user is stored ONLY
             * in sessionStorage.
             *
             * All registered users remain
             * inside localStorage.
             */

            sessionStorage.setItem(
                "currentUser",
                JSON.stringify(foundUser)
            );


            alert(
                "Login successful!"
            );


            if (
                foundUser.role ===
                "student"
            ) {

                window.location.href =
                    "profile-student.html";

            } else {

                window.location.href =
                    "profile-organizer.html";
            }
        }
    );
}


/* ==========================================================
   CURRENT USER
========================================================== */

let currentUser =
    JSON.parse(
        sessionStorage.getItem(
            "currentUser"
        )
    );


/* ==========================================================
   DISPLAY CURRENT USER
========================================================== */

if (currentUser) {

    let studentName =
        document.getElementById(
            "studentName"
        );

    if (studentName) {

        studentName.innerText =
            currentUser.firstName;
    }


    let profileStudentName =
        document.getElementById(
            "profileStudentName"
        );

    if (profileStudentName) {

        profileStudentName.innerText =
            currentUser.firstName +
            " " +
            currentUser.lastName;
    }


    let profileStudentAvatar =
        document.getElementById(
            "profileStudentAvatar"
        );

    if (profileStudentAvatar) {

        let firstInitial =
            currentUser.firstName
                ? currentUser.firstName.charAt(0)
                : "";

        let lastInitial =
            currentUser.lastName
                ? currentUser.lastName.charAt(0)
                : "";

        profileStudentAvatar.innerText =
            (
                firstInitial +
                lastInitial
            ).toUpperCase();
    }


    let profileStudentEmail =
        document.getElementById(
            "profileStudentEmail"
        );

    if (profileStudentEmail) {

        profileStudentEmail.innerText =
            currentUser.email;

        profileStudentEmail.href =
            "mailto:" +
            currentUser.email;
    }


    let organizerName =
        document.getElementById(
            "organizerName"
        );

    if (organizerName) {

        organizerName.innerText =
            currentUser.firstName;
    }


    let profileOrgName =
        document.getElementById(
            "profileOrgName"
        );

    if (profileOrgName) {

        profileOrgName.innerText =
            currentUser.firstName +
            " " +
            currentUser.lastName;
    }


    let profileOrgAvatar =
        document.getElementById(
            "profileOrgAvatar"
        );

    if (profileOrgAvatar) {

        let firstInitial =
            currentUser.firstName
                ? currentUser.firstName.charAt(0)
                : "";

        let lastInitial =
            currentUser.lastName
                ? currentUser.lastName.charAt(0)
                : "";

        profileOrgAvatar.innerText =
            (
                firstInitial +
                lastInitial
            ).toUpperCase();
    }


    let profileOrgEmail =
        document.getElementById(
            "profileOrgEmail"
        );

    if (profileOrgEmail) {

        profileOrgEmail.innerText =
            currentUser.email;

        profileOrgEmail.href =
            "mailto:" +
            currentUser.email;
    }
}


/* ==========================================================
   NAVIGATION
========================================================== */

let navLoginBtn =
    document.getElementById(
        "navLoginBtn"
    );

let navSignupBtn =
    document.getElementById(
        "navSignupBtn"
    );

let navProfileBtn =
    document.getElementById(
        "navProfileBtn"
    );

let navLogoutBtn =
    document.getElementById(
        "navLogoutBtn"
    );


if (
    navLoginBtn &&
    navSignupBtn &&
    navProfileBtn &&
    navLogoutBtn
) {

    if (currentUser) {

        navLoginBtn.style.display =
            "none";

        navSignupBtn.style.display =
            "none";

        navProfileBtn.style.display =
            "inline-block";

        navLogoutBtn.style.display =
            "inline-block";


        if (
            currentUser.role ===
            "student"
        ) {

            navProfileBtn.href =
                "profile-student.html";

        } else {

            navProfileBtn.href =
                "profile-organizer.html";
        }

    } else {

        navLoginBtn.style.display =
            "inline-block";

        navSignupBtn.style.display =
            "inline-block";

        navProfileBtn.style.display =
            "none";

        navLogoutBtn.style.display =
            "none";
    }
}


/* ==========================================================
   LOGOUT
========================================================== */

function logoutUser(event) {

    event.preventDefault();


    /*
     * Remove current login session.
     *
     * Do NOT remove hackittUsers,
     * participants or teams.
     */

    sessionStorage.removeItem(
        "currentUser"
    );


    /*
     * Remove old currentUser created
     * by previous versions of the project.
     */

    localStorage.removeItem(
        "currentUser"
    );


    window.location.href =
        "index.html";
}


/* Navbar logout */

if (navLogoutBtn) {

    navLogoutBtn.addEventListener(
        "click",
        logoutUser
    );
}


/* Other logout buttons */

let logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        logoutUser
    );
}


/* ==========================================================
   EDIT PROFILE
========================================================== */

let editProfileBtn =
    document.getElementById(
        "editProfileBtn"
    );

let editProfileModal =
    document.getElementById(
        "editProfileModal"
    );

let closeEditProfile =
    document.getElementById(
        "closeEditProfile"
    );

let saveProfileBtn =
    document.getElementById(
        "saveProfileBtn"
    );


if (
    editProfileBtn &&
    editProfileModal &&
    saveProfileBtn
) {

    editProfileBtn.addEventListener(
        "click",
        function(event) {

            event.preventDefault();


            if (!currentUser) {

                alert(
                    "Please log in first."
                );

                return;
            }


            document.getElementById(
                "editFirstName"
            ).value =
                currentUser.firstName || "";


            document.getElementById(
                "editLastName"
            ).value =
                currentUser.lastName || "";


            document.getElementById(
                "editEmail"
            ).value =
                currentUser.email || "";


            let editSkillSelect =
                document.getElementById(
                    "editSkill"
                );


            if (
                editSkillSelect &&
                currentUser.skill
            ) {

                editSkillSelect.value =
                    currentUser.skill;
            }


            editProfileModal.classList.add(
                "active"
            );
        }
    );


    if (closeEditProfile) {

        closeEditProfile.addEventListener(
            "click",
            function() {

                editProfileModal.classList.remove(
                    "active"
                );
            }
        );
    }


    editProfileModal.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                editProfileModal
            ) {

                editProfileModal.classList.remove(
                    "active"
                );
            }
        }
    );


    saveProfileBtn.addEventListener(
        "click",
        function() {

            let updatedFirstName =
                document.getElementById(
                    "editFirstName"
                ).value.trim();


            let updatedLastName =
                document.getElementById(
                    "editLastName"
                ).value.trim();


            let updatedEmail =
                document.getElementById(
                    "editEmail"
                ).value
                    .trim()
                    .toLowerCase();


            let editSkill =
                document.getElementById(
                    "editSkill"
                );


            let updatedSkill =
                editSkill
                    ? editSkill.value
                    : currentUser.skill;


            if (
                !updatedFirstName ||
                !updatedLastName ||
                !updatedEmail
            ) {

                alert(
                    "Please fill in all fields."
                );

                return;
            }


            let oldEmail =
                currentUser.email
                    .toLowerCase();


            let users =
                getUsers();

            let duplicate =
                users.some(
                    function(user) {

                        return (
                            user.email &&
                            user.email
                                .toLowerCase() ===
                            updatedEmail &&
                            user.email
                                .toLowerCase() !==
                            oldEmail
                        );
                    }
                );


            if (duplicate) {

                alert(
                    "Email already registered!"
                );

                return;
            }


            let user =
                users.find(
                    function(user) {

                        return (
                            user.email &&
                            user.email
                                .toLowerCase() ===
                            oldEmail
                        );
                    }
                );


            if (!user) {

                alert(
                    "User not found!"
                );

                return;
            }


            user.firstName =
                updatedFirstName;

            user.lastName =
                updatedLastName;

            user.email =
                updatedEmail;

            user.skill =
                updatedSkill;


            currentUser =
                user;


            /*
             * Save ALL users.
             */

            saveUsers(users);


            /*
             * Save current user ONLY
             * in sessionStorage.
             */

            sessionStorage.setItem(
                "currentUser",
                JSON.stringify(
                    currentUser
                )
            );


            /*
             * Update participants.
             */

            let participants =
                JSON.parse(
                    localStorage.getItem(
                        "hackitt_participants"
                    )
                ) || [];


            for (
                let i = 0;
                i < participants.length;
                i++
            ) {

                if (
                    participants[i].email &&
                    participants[i].email
                        .toLowerCase() ===
                    oldEmail
                ) {

                    participants[i].name =
                        updatedFirstName +
                        " " +
                        updatedLastName;

                    participants[i].email =
                        updatedEmail;

                    participants[i].skill =
                        updatedSkill;

                    break;
                }
            }


            localStorage.setItem(
                "hackitt_participants",
                JSON.stringify(
                    participants
                )
            );


            /*
             * Update team members.
             */

            let teams =
                JSON.parse(
                    localStorage.getItem(
                        "hackitt_teams"
                    )
                ) || [];


            for (
                let i = 0;
                i < teams.length;
                i++
            ) {

                if (!teams[i].members) {
                    teams[i].members = [];
                }


                for (
                    let j = 0;
                    j < teams[i].members.length;
                    j++
                ) {

                    let member =
                        teams[i].members[j];


                    if (
                        member.email &&
                        member.email
                            .toLowerCase() ===
                        oldEmail
                    ) {

                        member.name =
                            updatedFirstName +
                            " " +
                            updatedLastName;

                        member.email =
                            updatedEmail;

                        member.skill =
                            updatedSkill;
                    }
                }
            }


            localStorage.setItem(
                "hackitt_teams",
                JSON.stringify(
                    teams
                )
            );


            /*
             * Update page immediately.
             */

            let profileStudentNameEl =
                document.getElementById(
                    "profileStudentName"
                );


            if (profileStudentNameEl) {

                profileStudentNameEl.innerText =
                    updatedFirstName +
                    " " +
                    updatedLastName;
            }


            let profileStudentEmailEl =
                document.getElementById(
                    "profileStudentEmail"
                );


            if (profileStudentEmailEl) {

                profileStudentEmailEl.innerText =
                    updatedEmail;

                profileStudentEmailEl.href =
                    "mailto:" +
                    updatedEmail;
            }


            let profileOrgNameEl =
                document.getElementById(
                    "profileOrgName"
                );


            if (profileOrgNameEl) {

                profileOrgNameEl.innerText =
                    updatedFirstName +
                    " " +
                    updatedLastName;
            }


            let profileOrgEmailEl =
                document.getElementById(
                    "profileOrgEmail"
                );


            if (profileOrgEmailEl) {

                profileOrgEmailEl.innerText =
                    updatedEmail;

                profileOrgEmailEl.href =
                    "mailto:" +
                    updatedEmail;
            }


            let studentNameEl =
                document.getElementById(
                    "studentName"
                );


            if (studentNameEl) {

                studentNameEl.innerText =
                    updatedFirstName;
            }


            let organizerNameEl =
                document.getElementById(
                    "organizerName"
                );


            if (organizerNameEl) {

                organizerNameEl.innerText =
                    updatedFirstName;
            }


            editProfileModal.classList.remove(
                "active"
            );


            alert(
                "Profile updated!"
            );
        }
    );
}


/* ==========================================================
   STUDENT PROFILE: TEAM STATUS BANNER
========================================================== */

let teamBannerTitle =
    document.getElementById(
        "teamBannerTitle"
    );

let teamBannerText =
    document.getElementById(
        "teamBannerText"
    );

let teamBannerBtn =
    document.getElementById(
        "teamBannerBtn"
    );


if (
    teamBannerTitle &&
    teamBannerText &&
    teamBannerBtn
) {

    let teams =
        JSON.parse(
            localStorage.getItem(
                "hackitt_teams"
            )
        ) || [];


    if (teams.length === 0) {

        teamBannerTitle.innerText =
            "Hackitt Summer Jam 2026";

        teamBannerText.innerText =
            "Teams have not been generated yet. Check back soon!";

        teamBannerBtn.innerText =
            "Check Team";

        teamBannerBtn.href =
            "check.html";

    } else {

        let myTeam = null;


        if (currentUser) {

            let myBannerEmail =
                (
                    currentUser.email ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            for (
                let team of teams
            ) {

                if (!team.members) {

                    team.members = [];
                }


                let isMember =
                    team.members.some(
                        function(member) {

                            return (
                                (
                                    member.email ||
                                    ""
                                )
                                    .trim()
                                    .toLowerCase() ===
                                myBannerEmail
                            );
                        }
                    );


                if (isMember) {

                    myTeam =
                        team;

                    break;
                }
            }
        }


        if (myTeam) {

            teamBannerTitle.innerText =
                "You're in " +
                myTeam.name +
                "!";

            teamBannerText.innerText =
                myTeam.members.length +
                "/" +
                myTeam.maxSize +
                " members";

            teamBannerBtn.innerText =
                "View My Team";

            teamBannerBtn.href =
                "check.html";

        } else {

            teamBannerTitle.innerText =
                "Teams are ready!";

            teamBannerText.innerText =
                "Head over and pick your team.";

            teamBannerBtn.innerText =
                "Check Team";

            teamBannerBtn.href =
                "check.html";
        }
    }
}


/* ==========================================================
   STUDENT DASHBOARD: MY TEAM
========================================================== */

let myTeamStatus =
    document.getElementById(
        "myTeamStatus"
    );

let myTeamMessage =
    document.getElementById(
        "myTeamMessage"
    );

let myTeamName =
    document.getElementById(
        "myTeamName"
    );

let myTeamMembers =
    document.getElementById(
        "myTeamMembers"
    );


if (
    myTeamStatus &&
    myTeamMessage
) {

    let dashboardTeams =
        JSON.parse(
            localStorage.getItem(
                "hackitt_teams"
            )
        ) || [];


    let myAssignedTeam =
        null;


    if (currentUser) {

        let myEmail =
            (
                currentUser.email ||
                ""
            )
                .trim()
                .toLowerCase();


        for (
            let team of dashboardTeams
        ) {

            if (!team.members) {

                team.members = [];
            }


            let isMember =
                team.members.some(
                    function(member) {

                        return (
                            (
                                member.email ||
                                ""
                            )
                                .trim()
                                .toLowerCase() ===
                            myEmail
                        );
                    }
                );


            if (isMember) {

                myAssignedTeam =
                    team;

                break;
            }
        }
    }


    if (myAssignedTeam) {

        myTeamStatus.innerText =
            "Assigned";


        myTeamStatus.style.color =
            "#00e5ff";


        if (myTeamName) {

            myTeamName.innerText =
                myAssignedTeam.name;
        }


        myTeamMessage.innerText =
            myAssignedTeam.members.length +
            "/" +
            myAssignedTeam.maxSize +
            " members";


        if (myTeamMembers) {

            myTeamMembers.innerHTML =
                myAssignedTeam.members
                    .map(
                        function(member) {

                            return (
                                "<p>" +
                                member.name +
                                " - " +
                                (
                                    member.skill ||
                                    "General"
                                ) +
                                "</p>"
                            );
                        }
                    )
                    .join("");
        }


    } else if (
        dashboardTeams.length === 0
    ) {

        myTeamStatus.innerText =
            "Not Assigned";


        myTeamMessage.innerText =
            "Your team will appear here once the organizer generates the teams.";


    } else {

        myTeamStatus.innerText =
            "Not Assigned";


        myTeamMessage.innerText =
            "Teams are ready! Go to Check Team to join one.";
    }
}