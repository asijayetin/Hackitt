const roleStudent =
    document.getElementById("roleStudent");

const roleOrganizer =
    document.getElementById("roleOrganizer");

const skillField =
    document.getElementById("skillField");


/* =========================================================
   ROLE / SKILL FIELD
========================================================= */

function toggleSkillField() {

    if (!skillField) return;

    if (
        roleOrganizer &&
        roleOrganizer.checked
    ) {

        skillField.style.display = "none";

    } else {

        skillField.style.display = "flex";
    }
}


if (
    roleStudent &&
    roleOrganizer
) {

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


/* =========================================================
   USERS
========================================================= */

const USERS_KEY = "hackittUsers";


function getUsers() {

    let users =
        JSON.parse(
            localStorage.getItem(USERS_KEY)
        ) || [];


    /*
     * Old users migration.
     */

    if (users.length === 0) {

        const oldUsers =
            JSON.parse(
                localStorage.getItem("teamforge_users")
            ) || [];


        if (oldUsers.length > 0) {

            users = oldUsers;

            localStorage.setItem(
                USERS_KEY,
                JSON.stringify(users)
            );
        }
    }


    return users;
}


function saveUsers(users) {

    localStorage.setItem(
        USERS_KEY,
        JSON.stringify(users)
    );
}


/* =========================================================
   SIGNUP
========================================================= */

const signupForm =
    document.getElementById("signupForm");


if (signupForm) {

    signupForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const firstName =
                document.getElementById(
                    "firstName"
                ).value.trim();


            const lastName =
                document.getElementById(
                    "lastName"
                ).value.trim();


            const email =
                document.getElementById(
                    "signupEmail"
                ).value
                    .trim()
                    .toLowerCase();


            const password =
                document.getElementById(
                    "signupPassword"
                ).value;


            const confirmPassword =
                document.getElementById(
                    "confirmPassword"
                ).value;


            const selectedRole =
                document.querySelector(
                    'input[name="role"]:checked'
                );


            if (!selectedRole) {

                alert(
                    "Please select a role!"
                );

                return;
            }


            const role =
                selectedRole.value;


            const skillInput =
                document.getElementById("skill");


            const skill =
                skillInput
                    ? skillInput.value.trim()
                    : "General";


            if (
                password !==
                confirmPassword
            ) {

                alert(
                    "Passwords do not match!"
                );

                return;
            }


            /*
             * Get ALL existing users.
             */

            let users =
                getUsers();


            /*
             * Duplicate email check.
             */

            const alreadyExists =
                users.some(
                    function (user) {

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


            /*
             * Create new user.
             */

            const newUser = {

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


            /*
             * IMPORTANT:
             * Push new user.
             * Old users are NOT deleted.
             */

            users.push(newUser);

            saveUsers(users);


            /*
             * Add student to participants.
             */

            if (role === "student") {

                let participants =
                    JSON.parse(
                        localStorage.getItem(
                            "hackitt_participants"
                        )
                    ) || [];


                const exists =
                    participants.some(
                        function (person) {

                            return (
                                person.email &&
                                person.email
                                    .toLowerCase() ===
                                email
                            );
                        }
                    );


                if (!exists) {

                    participants.push({

                        name:
                            `${firstName} ${lastName}`,

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


/* =========================================================
   LOGIN
========================================================= */

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const email =
                document.getElementById(
                    "email"
                ).value
                    .trim()
                    .toLowerCase();


            const password =
                document.getElementById(
                    "password"
                ).value;


            /*
             * Get ALL registered users.
             */

            const users =
                getUsers();


            /*
             * Find matching user.
             */

            const foundUser =
                users.find(
                    function (user) {

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
             *
             * Current user is stored ONLY
             * in sessionStorage.
             *
             * It is NOT stored in localStorage.
             *
             * Therefore all registered users
             * stay in hackittUsers.
             */

            sessionStorage.setItem(
                "currentUser",
                JSON.stringify(foundUser)
            );


            /*
             * Redirect according to role.
             */

            if (
                foundUser.role ===
                "student"
            ) {

                window.location.href =
                    "student.html";

            } else {

                window.location.href =
                    "organizer.html";
            }
        }
    );
}


/* =========================================================
   CURRENT USER
========================================================= */

/*
 * IMPORTANT:
 * Only sessionStorage is checked.
 *
 * This prevents an old user from
 * automatically appearing as logged in
 * from localStorage.
 */

let currentUser =
    JSON.parse(
        sessionStorage.getItem(
            "currentUser"
        )
    );


/* =========================================================
   HELPER FUNCTIONS
========================================================= */

function setText(id, value) {

    const element =
        document.getElementById(id);


    if (element) {

        element.innerText =
            value;
    }
}


function setEmail(id, email) {

    const element =
        document.getElementById(id);


    if (element) {

        element.innerText =
            email;

        element.href =
            "mailto:" + email;
    }
}


function setAvatar(
    id,
    firstName,
    lastName
) {

    const element =
        document.getElementById(id);


    if (!element) return;


    const first =
        firstName
            ? firstName.charAt(0)
            : "";


    const last =
        lastName
            ? lastName.charAt(0)
            : "";


    element.innerText =
        (
            first +
            last
        ).toUpperCase();
}


/* =========================================================
   DISPLAY CURRENT USER
========================================================= */

function displayUserData() {

    if (!currentUser) return;


    /*
     * Student
     */

    setText(
        "studentName",
        currentUser.firstName
    );


    setText(
        "profileStudentName",
        `${currentUser.firstName} ${currentUser.lastName}`
    );


    setAvatar(
        "profileStudentAvatar",
        currentUser.firstName,
        currentUser.lastName
    );


    setEmail(
        "profileStudentEmail",
        currentUser.email
    );


    /*
     * Organizer
     */

    setText(
        "organizerName",
        currentUser.firstName
    );


    setText(
        "profileOrgName",
        `${currentUser.firstName} ${currentUser.lastName}`
    );


    setAvatar(
        "profileOrgAvatar",
        currentUser.firstName,
        currentUser.lastName
    );


    setEmail(
        "profileOrgEmail",
        currentUser.email
    );
}


displayUserData();


/* =========================================================
   NAVIGATION
========================================================= */

const navLoginBtn =
    document.getElementById(
        "navLoginBtn"
    );


const navSignupBtn =
    document.getElementById(
        "navSignupBtn"
    );


const navDashboardBtn =
    document.getElementById(
        "navDashboardBtn"
    );


const navProfileBtn =
    document.getElementById(
        "navProfileBtn"
    );


const navLogoutBtn =
    document.getElementById(
        "navLogoutBtn"
    );


/* =========================================================
   LOGOUT
========================================================= */

function logout(event) {

    if (event) {

        event.preventDefault();
    }


    /*
     * Remove ONLY current login session.
     *
     * Registered users remain safe
     * inside hackittUsers.
     */

    sessionStorage.removeItem(
        "currentUser"
    );


    /*
     * Also remove old currentUser
     * key if it exists from previous version.
     */

    localStorage.removeItem(
        "currentUser"
    );


    window.location.href =
        "index.html";
}


/* =========================================================
   NAVIGATION BASED ON LOGIN
========================================================= */

if (currentUser) {

    /*
     * Dashboard
     */

    if (navDashboardBtn) {

        navDashboardBtn.href =
            currentUser.role === "student"
                ? "student.html"
                : "organizer.html";
    }


    /*
     * Profile
     */

    if (navProfileBtn) {

        navProfileBtn.href =
            currentUser.role === "student"
                ? "profile-student.html"
                : "profile-organizer.html";
    }


    /*
     * Hide Login
     */

    if (navLoginBtn) {

        navLoginBtn.style.display =
            "none";
    }


    /*
     * Hide Signup
     */

    if (navSignupBtn) {

        navSignupBtn.style.display =
            "none";
    }


    /*
     * Show Profile
     */

    if (navProfileBtn) {

        navProfileBtn.style.display =
            "inline-block";
    }


    /*
     * Show Logout
     */

    if (navLogoutBtn) {

        navLogoutBtn.style.display =
            "inline-block";


        navLogoutBtn.addEventListener(
            "click",
            logout
        );
    }


} else {

    /*
     * User is NOT logged in.
     */

    if (navLoginBtn) {

        navLoginBtn.style.display =
            "inline-block";
    }


    if (navSignupBtn) {

        navSignupBtn.style.display =
            "inline-block";
    }


    if (navProfileBtn) {

        navProfileBtn.style.display =
            "none";
    }


    if (navLogoutBtn) {

        navLogoutBtn.style.display =
            "none";
    }
}


/* =========================================================
   LOGOUT BUTTON
========================================================= */

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        logout
    );
}


/* =========================================================
   EDIT PROFILE BUTTON
========================================================= */

const editButton =
    document.querySelector(
        ".profile-edit-btn"
    );


if (
    editButton &&
    currentUser
) {

    editButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            openEditProfile();
        }
    );
}


/* =========================================================
   OPEN EDIT PROFILE
========================================================= */

function openEditProfile() {

    const oldModal =
        document.getElementById(
            "editProfileModal"
        );


    if (oldModal) {

        oldModal.remove();
    }


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "editProfileModal";


    modal.className =
        "edit-profile-modal active";


    modal.innerHTML = `

        <div class="edit-profile-box">

            <button
                class="close-edit"
                id="closeEditProfile">

                &times;

            </button>


            <h2>
                Edit Profile
            </h2>


            <div class="edit-form-group">

                <label>
                    First Name
                </label>

                <input
                    type="text"
                    id="editFirstName"
                    value="${currentUser.firstName || ""}"
                >

            </div>


            <div class="edit-form-group">

                <label>
                    Last Name
                </label>

                <input
                    type="text"
                    id="editLastName"
                    value="${currentUser.lastName || ""}"
                >

            </div>


            <div class="edit-form-group">

                <label>
                    Email
                </label>

                <input
                    type="email"
                    id="editEmail"
                    value="${currentUser.email || ""}"
                >

            </div>


            ${
                currentUser.role === "student"
                    ? `

                    <div class="edit-form-group">

                        <label>
                            Skill
                        </label>

                        <input
                            type="text"
                            id="editSkill"
                            value="${currentUser.skill || ""}"
                            placeholder="Enter your skill"
                        >

                    </div>

                    `
                    : ""
            }


            <button
                id="saveProfileBtn">

                Save Changes

            </button>

        </div>
    `;


    document.body.appendChild(
        modal
    );


    document
        .getElementById(
            "closeEditProfile"
        )
        .addEventListener(
            "click",
            function () {

                modal.remove();
            }
        );


    modal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                modal
            ) {

                modal.remove();
            }
        }
    );


    document
        .getElementById(
            "saveProfileBtn"
        )
        .addEventListener(
            "click",
            saveProfile
        );
}


/* =========================================================
   SAVE PROFILE
========================================================= */

function saveProfile() {

    const firstName =
        document.getElementById(
            "editFirstName"
        ).value.trim();


    const lastName =
        document.getElementById(
            "editLastName"
        ).value.trim();


    const email =
        document.getElementById(
            "editEmail"
        ).value
            .trim()
            .toLowerCase();


    const skillInput =
        document.getElementById(
            "editSkill"
        );


    const skill =
        skillInput
            ? skillInput.value.trim()
            : currentUser.skill;


    if (
        !firstName ||
        !lastName ||
        !email
    ) {

        alert(
            "Please fill all required fields."
        );

        return;
    }


    const oldEmail =
        currentUser.email
            .toLowerCase();


    /*
     * Get all users.
     */

    let users =
        getUsers();


    /*
     * Duplicate email check.
     */

    const duplicate =
        users.some(
            function (user) {

                return (
                    user.email &&
                    user.email
                        .toLowerCase() ===
                    email &&
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


    /*
     * Find current user.
     */

    const user =
        users.find(
            function (user) {

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


    /*
     * Update user.
     */

    user.firstName =
        firstName;

    user.lastName =
        lastName;

    user.email =
        email;

    user.skill =
        skill;


    currentUser =
        user;


    /*
     * Save ALL users.
     */

    saveUsers(users);


    /*
     * IMPORTANT:
     * Current user ONLY in sessionStorage.
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


    participants.forEach(
        function (person) {

            if (
                person.email &&
                person.email
                    .toLowerCase() ===
                oldEmail
            ) {

                person.name =
                    `${firstName} ${lastName}`;

                person.email =
                    email;

                person.skill =
                    skill;
            }
        }
    );


    localStorage.setItem(
        "hackitt_participants",
        JSON.stringify(
            participants
        )
    );


    /*
     * Update team member information.
     */

    let teams =
        JSON.parse(
            localStorage.getItem(
                "hackitt_teams"
            )
        ) || [];


    teams.forEach(
        function (team) {

            if (!team.members) return;


            team.members.forEach(
                function (member) {

                    if (
                        member.email &&
                        member.email
                            .toLowerCase() ===
                        oldEmail
                    ) {

                        member.name =
                            `${firstName} ${lastName}`;

                        member.email =
                            email;

                        member.skill =
                            skill;
                    }
                }
            );
        }
    );


    localStorage.setItem(
        "hackitt_teams",
        JSON.stringify(
            teams
        )
    );


    /*
     * Update page.
     */

    setText(
        "profileStudentName",
        `${firstName} ${lastName}`
    );


    setAvatar(
        "profileStudentAvatar",
        firstName,
        lastName
    );


    setEmail(
        "profileStudentEmail",
        email
    );


    setText(
        "profileOrgName",
        `${firstName} ${lastName}`
    );


    setAvatar(
        "profileOrgAvatar",
        firstName,
        lastName
    );


    setEmail(
        "profileOrgEmail",
        email
    );


    setText(
        "studentName",
        firstName
    );


    setText(
        "organizerName",
        firstName
    );


    const modal =
        document.getElementById(
            "editProfileModal"
        );


    if (modal) {

        modal.remove();
    }


    alert(
        "Profile updated successfully!"
    );
}