/* =========================================================
   HACKITT - APP.JS
========================================================= */


/* =========================================================
   ROLE / SKILL
========================================================= */

const roleStudent =
    document.getElementById("roleStudent");

const roleOrganizer =
    document.getElementById("roleOrganizer");

const skillField =
    document.getElementById("skillField");


function toggleSkillField() {

    if (!skillField) return;

    if (
        roleOrganizer &&
        roleOrganizer.checked
    ) {

        skillField.style.display =
            "none";

    } else {

        skillField.style.display =
            "flex";
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
   USER STORAGE
========================================================= */

/*
   hackittUsers
   = ALL registered users

   currentUser
   = ONLY currently logged-in user
*/

const USERS_KEY =
    "hackittUsers";


function getUsers() {

    let users =
        JSON.parse(
            localStorage.getItem(
                USERS_KEY
            )
        ) || [];


    /*
       If an old key exists and
       hackittUsers is empty,
       migrate old users.
    */

    if (users.length === 0) {

        const oldUsers =
            JSON.parse(
                localStorage.getItem(
                    "teamforge_users"
                )
            ) || [];


        if (
            oldUsers.length > 0
        ) {

            users =
                oldUsers;

            localStorage.setItem(
                USERS_KEY,
                JSON.stringify(
                    users
                )
            );
        }
    }


    return users;
}


function saveUsers(users) {

    localStorage.setItem(
        USERS_KEY,
        JSON.stringify(
            users
        )
    );
}


/* =========================================================
   SIGNUP
========================================================= */

const signupForm =
    document.getElementById(
        "signupForm"
    );


if (signupForm) {

    signupForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            /* ==============================
               GET FORM DATA
            ============================== */

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


            /* ==============================
               VALIDATION
            ============================== */

            if (!selectedRole) {

                alert(
                    "Please select a role!"
                );

                return;
            }


            const role =
                selectedRole.value;


            const skillInput =
                document.getElementById(
                    "skill"
                );


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


            /* ==============================
               GET ALL USERS
            ============================== */

            let users =
                getUsers();


            /* ==============================
               CHECK DUPLICATE EMAIL
            ============================== */

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


            /* ==============================
               CREATE USER
            ============================== */

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


            /* ==============================
               ADD USER
               WITHOUT DELETING OLD USERS
            ============================== */

            users.push(
                newUser
            );


            saveUsers(
                users
            );


            /* =================================================
               ADD STUDENT TO PARTICIPANTS
            ================================================= */

            if (
                role === "student"
            ) {

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


            /* ==============================
               SUCCESS
            ============================== */

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
    document.getElementById(
        "loginForm"
    );


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


            /* ==============================
               GET ALL REGISTERED USERS
            ============================== */

            const users =
                getUsers();


            /* ==============================
               FIND LOGIN USER
            ============================== */

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


            /* ==============================
               SAVE CURRENT USER ONLY
            ============================== */

            sessionStorage.setItem(
                "currentUser",
                JSON.stringify(
                    foundUser
                )
            );


            localStorage.setItem(
                "currentUser",
                JSON.stringify(
                    foundUser
                )
            );


            /* ==============================
               REDIRECT BY ROLE
            ============================== */

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

let currentUser =
    JSON.parse(
        sessionStorage.getItem(
            "currentUser"
        ) ||
        localStorage.getItem(
            "currentUser"
        )
    );


/* =========================================================
   HELPER FUNCTIONS
========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.innerText =
            value;
    }
}


function setEmail(
    id,
    email
) {

    const element =
        document.getElementById(
            id
        );


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
        document.getElementById(
            id
        );


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


    /* ==============================
       STUDENT
    ============================== */

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


    /* ==============================
       ORGANIZER
    ============================== */

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


    sessionStorage.removeItem(
        "currentUser"
    );


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

    /* Dashboard */

    if (navDashboardBtn) {

        navDashboardBtn.href =
            currentUser.role === "student"
                ? "student.html"
                : "organizer.html";
    }


    /* Profile */

    if (navProfileBtn) {

        navProfileBtn.href =
            currentUser.role === "student"
                ? "profile-student.html"
                : "profile-organizer.html";
    }


    if (navLoginBtn) {

        navLoginBtn.style.display =
            "none";
    }


    if (navSignupBtn) {

        navSignupBtn.style.display =
            "none";
    }


    if (navProfileBtn) {

        navProfileBtn.style.display =
            "inline-block";
    }


    if (navLogoutBtn) {

        navLogoutBtn.style.display =
            "inline-block";


        navLogoutBtn.addEventListener(
            "click",
            logout
        );
    }

} else {

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


    /* ==============================
       GET ALL USERS
    ============================== */

    let users =
        getUsers();


    /* ==============================
       CHECK DUPLICATE EMAIL
    ============================== */

    const duplicate =
        users.some(
            function (user) {

                return (
                    user.email &&
                    user.email.toLowerCase() ===
                    email &&
                    user.email.toLowerCase() !==
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


    /* ==============================
       FIND USER
    ============================== */

    const user =
        users.find(
            function (user) {

                return (
                    user.email &&
                    user.email.toLowerCase() ===
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


    /* ==============================
       UPDATE USER
    ============================== */

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


    /* ==============================
       SAVE ALL USERS
    ============================== */

    saveUsers(
        users
    );


    /* ==============================
       UPDATE CURRENT USER
    ============================== */

    sessionStorage.setItem(
        "currentUser",
        JSON.stringify(
            currentUser
        )
    );


    localStorage.setItem(
        "currentUser",
        JSON.stringify(
            currentUser
        )
    );


    /* =================================================
       UPDATE PARTICIPANTS
    ================================================= */

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
                person.email.toLowerCase() ===
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


    /* =================================================
       UPDATE TEAM MEMBER
    ================================================= */

    let teams =
        JSON.parse(
            localStorage.getItem(
                "hackitt_teams"
            )
        ) || [];


    teams.forEach(
        function (team) {

            if (
                !team.members
            ) return;


            team.members.forEach(
                function (member) {

                    if (
                        member.email &&
                        member.email.toLowerCase() ===
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


    /* ==============================
       UPDATE PAGE
    ============================== */

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