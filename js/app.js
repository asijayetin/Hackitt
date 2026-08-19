/* ==============================
   ROLE / SKILL
============================== */

const roleStudent = document.getElementById("roleStudent");
const roleOrganizer = document.getElementById("roleOrganizer");
const skillField = document.getElementById("skillField");

function toggleSkillField() {

    if (!skillField) return;

    skillField.style.display =
        roleOrganizer && roleOrganizer.checked
            ? "none"
            : "flex";
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


/* ==============================
   SIGNUP
============================== */

const signupForm =
    document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const firstName =
                document.getElementById("firstName")
                    .value.trim();

            const lastName =
                document.getElementById("lastName")
                    .value.trim();

            const email =
                document.getElementById("signupEmail")
                    .value.trim();

            const password =
                document.getElementById("signupPassword")
                    .value;

            const confirmPassword =
                document.getElementById("confirmPassword")
                    .value;

            const selectedRole =
                document.querySelector(
                    'input[name="role"]:checked'
                );

            if (!selectedRole) {

                alert("Please select a role!");

                return;
            }

            const role =
                selectedRole.value;

            const skillInput =
                document.getElementById("skill");

            const skill =
                skillInput
                    ? skillInput.value.trim()
                    : null;


            if (password !== confirmPassword) {

                alert("Passwords do not match!");

                return;
            }


            let users =
                JSON.parse(
                    localStorage.getItem("hackittUsers")
                ) || [];


            if (
                users.some(
                    user => user.email === email
                )
            ) {

                alert("Email already registered!");

                return;
            }


            const newUser = {

                firstName,
                lastName,
                email,
                password,
                role,
                skill

            };


            users.push(newUser);

            localStorage.setItem(
                "hackittUsers",
                JSON.stringify(users)
            );


            /* Add student to participants */

            if (role === "student") {

                let participants =
                    JSON.parse(
                        localStorage.getItem(
                            "hackitt_participants"
                        )
                    ) || [];


                if (
                    !participants.some(
                        person =>
                            person.email === email
                    )
                ) {

                    participants.push({

                        name:
                            `${firstName} ${lastName}`,

                        email,

                        skill

                    });

                    localStorage.setItem(
                        "hackitt_participants",
                        JSON.stringify(participants)
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


/* ==============================
   LOGIN
============================== */

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const email =
                document.getElementById("email")
                    .value.trim();

            const password =
                document.getElementById("password")
                    .value;


            const users =
                JSON.parse(
                    localStorage.getItem("hackittUsers")
                ) || [];


            const foundUser =
                users.find(
                    user =>
                        user.email === email &&
                        user.password === password
                );


            if (!foundUser) {

                alert(
                    "Invalid email or password!"
                );

                return;
            }


            /* Current login session */

            sessionStorage.setItem(
                "currentUser",
                JSON.stringify(foundUser)
            );


            alert("Login successful!");


            if (
                foundUser.role === "student"
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


/* ==============================
   CURRENT USER
============================== */

let currentUser =
    JSON.parse(
        sessionStorage.getItem("currentUser")
    );


/* ==============================
   DISPLAY USER DATA
============================== */

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.innerText = value;
    }
}


function setEmail(id, email) {

    const element =
        document.getElementById(id);

    if (element) {

        element.innerText = email;

        element.href =
            "mailto:" + email;
    }
}


function setAvatar(id, firstName, lastName) {

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
        (first + last).toUpperCase();
}


function displayUserData() {

    if (!currentUser) return;


    /* Student */

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


    /* Organizer */

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


/* ==============================
   NAVIGATION
============================== */

const navLoginBtn =
    document.getElementById("navLoginBtn");

const navSignupBtn =
    document.getElementById("navSignupBtn");

const navDashboardBtn =
    document.getElementById("navDashboardBtn");

const navProfileBtn =
    document.getElementById("navProfileBtn");

const navLogoutBtn =
    document.getElementById("navLogoutBtn");


function logout(event) {

    if (event) {
        event.preventDefault();
    }

    sessionStorage.removeItem(
        "currentUser"
    );

    window.location.href =
        "index.html";
}


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
        navLoginBtn.style.display = "none";
    }

    if (navSignupBtn) {
        navSignupBtn.style.display = "none";
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


/* ==============================
   NORMAL LOGOUT BUTTON
============================== */

const logoutBtn =
    document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        logout
    );
}


/* ==============================
   EDIT PROFILE
============================== */

const editButton =
    document.querySelector(
        ".profile-edit-btn"
    );


if (editButton && currentUser) {

    editButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            openEditProfile();
        }
    );
}


/* ==============================
   OPEN EDIT PROFILE
============================== */

function openEditProfile() {

    const oldModal =
        document.getElementById(
            "editProfileModal"
        );

    if (oldModal) {
        oldModal.remove();
    }


    const modal =
        document.createElement("div");

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
                    value="${currentUser.firstName || ""}">

            </div>


            <div class="edit-form-group">

                <label>
                    Last Name
                </label>

                <input
                    type="text"
                    id="editLastName"
                    value="${currentUser.lastName || ""}">

            </div>


            <div class="edit-form-group">

                <label>
                    Email
                </label>

                <input
                    type="email"
                    id="editEmail"
                    value="${currentUser.email || ""}">

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
                            placeholder="Enter your skill">

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


    document.body.appendChild(modal);


    document
        .getElementById("closeEditProfile")
        .addEventListener(
            "click",
            function () {

                modal.remove();
            }
        );


    modal.addEventListener(
        "click",
        function (event) {

            if (event.target === modal) {
                modal.remove();
            }
        }
    );


    document
        .getElementById("saveProfileBtn")
        .addEventListener(
            "click",
            saveProfile
        );
}


/* ==============================
   SAVE PROFILE
============================== */

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
        ).value.trim();


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
        currentUser.email;


    let users =
        JSON.parse(
            localStorage.getItem(
                "hackittUsers"
            )
        ) || [];


    /* Check duplicate email */

    if (
        users.some(
            user =>
                user.email === email &&
                user.email !== oldEmail
        )
    ) {

        alert(
            "Email already registered!"
        );

        return;
    }


    /* Update user */

    const user =
        users.find(
            user =>
                user.email === oldEmail
        );


    if (!user) {

        alert("User not found!");

        return;
    }


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


    localStorage.setItem(
        "hackittUsers",
        JSON.stringify(users)
    );


    /* Update login session */

    sessionStorage.setItem(
        "currentUser",
        JSON.stringify(currentUser)
    );


    /* ==============================
       UPDATE PARTICIPANT
    ============================== */

    let participants =
        JSON.parse(
            localStorage.getItem(
                "hackitt_participants"
            )
        ) || [];


    participants.forEach(
        person => {

            if (person.email === oldEmail) {

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
        JSON.stringify(participants)
    );


    /* ==============================
       UPDATE TEAM MEMBER
    ============================== */

    let teams =
        JSON.parse(
            localStorage.getItem(
                "hackitt_teams"
            )
        ) || [];


    teams.forEach(
        team => {

            if (!team.members) return;


            team.members.forEach(
                member => {

                    if (
                        member.email === oldEmail
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
        JSON.stringify(teams)
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