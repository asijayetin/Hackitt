let roleStudent = document.getElementById("roleStudent");
let roleOrganizer = document.getElementById("roleOrganizer");
let skillField = document.getElementById("skillField");

function toggleSkillField(){

    if(!skillField) return;

    if(roleOrganizer && roleOrganizer.checked){
        skillField.style.display = "none";
    }
    else{
        skillField.style.display = "flex";
    }
}

if(roleStudent && roleOrganizer){

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

let signupForm = document.getElementById("signupForm");

if(signupForm){

    signupForm.addEventListener(
        "submit",
        function(event){

            event.preventDefault();

            let firstName =
                document.getElementById("firstName").value.trim();

            let lastName =
                document.getElementById("lastName").value.trim();

            let email =
                document.getElementById("signupEmail").value.trim();

            let password =
                document.getElementById("signupPassword").value;

            let confirmPassword =
                document.getElementById("confirmPassword").value;


            let selectedRole =
                document.querySelector(
                    'input[name="role"]:checked'
                );


            if(!selectedRole){

                alert("Please select a role!");

                return;
            }


            let role = selectedRole.value;


            let skillInput =
                document.getElementById("skill");

            let skill =
                skillInput ? skillInput.value.trim() : null;


            if(password !== confirmPassword){

                alert("Passwords do not match!");

                return;
            }


            let users =
                JSON.parse(
                    localStorage.getItem("hackittUsers")
                ) || [];


            for(let i = 0; i < users.length; i++){

                if(users[i].email === email){

                    alert("Email already registered!");

                    return;
                }
            }


            let newUser = {

                firstName: firstName,

                lastName: lastName,

                email: email,

                password: password,

                role: role,

                skill: skill

            };


            users.push(newUser);


            localStorage.setItem(
                "hackittUsers",
                JSON.stringify(users)
            );


            if(role === "student"){

                let participants =
                    JSON.parse(
                        localStorage.getItem(
                            "hackitt_participants"
                        )
                    ) || [];


                let alreadyIn = false;


                for(let i = 0; i < participants.length; i++){

                    if(participants[i].email === email){

                        alreadyIn = true;

                        break;
                    }
                }


                if(!alreadyIn){

                    participants.push({

                        name:
                            firstName +
                            " " +
                            lastName,

                        email: email,

                        skill: skill

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

let loginForm =
    document.getElementById("loginForm");


if(loginForm){

    loginForm.addEventListener(
        "submit",
        function(event){

            event.preventDefault();


            let email =
                document.getElementById("email")
                .value
                .trim();


            let password =
                document.getElementById("password")
                .value;


            let users =
                JSON.parse(
                    localStorage.getItem("hackittUsers")
                ) || [];


            let foundUser = null;


            for(let i = 0; i < users.length; i++){

                if(
                    users[i].email === email &&
                    users[i].password === password
                ){

                    foundUser = users[i];

                    break;
                }
            }


            if(foundUser === null){

                alert(
                    "Invalid email or password!"
                );

                return;
            }


            localStorage.setItem(
                "currentUser",
                JSON.stringify(foundUser)
            );


            alert(
                "Login successful!"
            );


            if(foundUser.role === "student"){

                window.location.href =
                    "student.html";

            }
            else{

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
        localStorage.getItem("currentUser")
    );


/* ==============================
   DISPLAY USER DATA
============================== */

if(currentUser){

    let studentName =
        document.getElementById(
            "studentName"
        );


    if(studentName){

        studentName.innerText =
            currentUser.firstName;
    }


    let profileStudentName =
        document.getElementById(
            "profileStudentName"
        );


    if(profileStudentName){

        profileStudentName.innerText =
            currentUser.firstName +
            " " +
            currentUser.lastName;
    }


    let profileStudentAvatar =
        document.getElementById(
            "profileStudentAvatar"
        );


    if(profileStudentAvatar){

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


    if(profileStudentEmail){

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


    if(organizerName){

        organizerName.innerText =
            currentUser.firstName;
    }


    let profileOrgName =
        document.getElementById(
            "profileOrgName"
        );


    if(profileOrgName){

        profileOrgName.innerText =
            currentUser.firstName +
            " " +
            currentUser.lastName;
    }


    let profileOrgAvatar =
        document.getElementById(
            "profileOrgAvatar"
        );


    if(profileOrgAvatar){

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


    if(profileOrgEmail){

        profileOrgEmail.innerText =
            currentUser.email;


        profileOrgEmail.href =
            "mailto:" +
            currentUser.email;
    }
}


/* ==============================
   NAVIGATION
============================== */

let navLoginBtn =
    document.getElementById(
        "navLoginBtn"
    );

let navSignupBtn =
    document.getElementById(
        "navSignupBtn"
    );

let navDashboardBtn =
    document.getElementById(
        "navDashboardBtn"
    );

let navProfileBtn =
    document.getElementById(
        "navProfileBtn"
    );

let navLogoutBtn =
    document.getElementById(
        "navLogoutBtn"
    );


if(currentUser){

    if(navDashboardBtn){

        if(currentUser.role === "student"){

            navDashboardBtn.href =
                "profile-student.html";

        }
        else{

            navDashboardBtn.href =
                "profile-organizer.html";
        }
    }


    if(navProfileBtn){

        if(currentUser.role === "student"){

            navProfileBtn.href =
                "profile-student.html";

        }
        else{

            navProfileBtn.href =
                "profile-organizer.html";
        }
    }


    if(navLoginBtn){

        navLoginBtn.style.display =
            "none";
    }


    if(navSignupBtn){

        navSignupBtn.style.display =
            "none";
    }


    if(navProfileBtn){

        navProfileBtn.style.display =
            "inline-block";
    }


    if(navLogoutBtn){

        navLogoutBtn.style.display =
            "inline-block";


        navLogoutBtn.addEventListener(
            "click",
            function(event){

                event.preventDefault();

                localStorage.removeItem(
                    "currentUser"
                );

                window.location.href =
                    "index.html";
            }
        );
    }

}
else{

    if(navLoginBtn){

        navLoginBtn.style.display =
            "inline-block";
    }


    if(navSignupBtn){

        navSignupBtn.style.display =
            "inline-block";
    }


    if(navProfileBtn){

        navProfileBtn.style.display =
            "none";
    }


    if(navLogoutBtn){

        navLogoutBtn.style.display =
            "none";
    }
}


/* ==============================
   DASHBOARD / LOGOUT BUTTON
============================== */

let logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if(logoutBtn){

    logoutBtn.addEventListener(
        "click",
        function(event){

            event.preventDefault();

            localStorage.removeItem(
                "currentUser"
            );

            window.location.href =
                "index.html";
        }
    );
}


/* ==============================
   EDIT PROFILE
============================== */

let editButton =
    document.querySelector(
        ".profile-edit-btn"
    );


if(editButton && currentUser){

    editButton.addEventListener(
        "click",
        function(event){

            event.preventDefault();

            openEditProfile();

        }
    );
}


/* ==============================
   CREATE EDIT PROFILE MODAL
============================== */

function openEditProfile(){

    let oldModal =
        document.getElementById(
            "editProfileModal"
        );


    if(oldModal){

        oldModal.remove();
    }


    let modal =
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
                ?
                `
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
                :
                ""
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


    let closeButton =
        document.getElementById(
            "closeEditProfile"
        );


    let saveButton =
        document.getElementById(
            "saveProfileBtn"
        );


    closeButton.addEventListener(
        "click",
        function(){

            modal.remove();

        }
    );


    modal.addEventListener(
        "click",
        function(event){

            if(event.target === modal){

                modal.remove();
            }
        }
    );


    saveButton.addEventListener(
        "click",
        function(){

            saveProfile();

        }
    );
}


/* ==============================
   SAVE PROFILE
============================== */

function saveProfile(){

    let firstName =
        document.getElementById(
            "editFirstName"
        ).value.trim();


    let lastName =
        document.getElementById(
            "editLastName"
        ).value.trim();


    let email =
        document.getElementById(
            "editEmail"
        ).value.trim();


    let skillInput =
        document.getElementById(
            "editSkill"
        );


    let skill =
        skillInput
        ? skillInput.value.trim()
        : currentUser.skill;


    if(
        firstName === "" ||
        lastName === "" ||
        email === ""
    ){

        alert(
            "Please fill all required fields."
        );

        return;
    }


    let oldEmail =
        currentUser.email;


    let users =
        JSON.parse(
            localStorage.getItem(
                "hackittUsers"
            )
        ) || [];


    for(let i = 0; i < users.length; i++){

        if(
            users[i].email === email &&
            users[i].email !== oldEmail
        ){

            alert(
                "Email already registered!"
            );

            return;
        }
    }


    let userFound = false;


    for(let i = 0; i < users.length; i++){

        if(
            users[i].email === oldEmail
        ){

            users[i].firstName =
                firstName;

            users[i].lastName =
                lastName;

            users[i].email =
                email;

            users[i].skill =
                skill;

            currentUser =
                users[i];

            userFound = true;

            break;
        }
    }


    if(!userFound){

        alert(
            "User not found!"
        );

        return;
    }


    localStorage.setItem(
        "hackittUsers",
        JSON.stringify(users)
    );


    localStorage.setItem(
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


    for(let i = 0; i < participants.length; i++){

        if(
            participants[i].email === oldEmail
        ){

            participants[i].name =
                firstName +
                " " +
                lastName;

            participants[i].email =
                email;

            participants[i].skill =
                skill;
        }
    }


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


    for(let i = 0; i < teams.length; i++){

        if(!teams[i].members){
            continue;
        }


        for(let j = 0; j < teams[i].members.length; j++){

            if(
                teams[i].members[j].email ===
                oldEmail
            ){

                teams[i].members[j].name =
                    firstName +
                    " " +
                    lastName;

                teams[i].members[j].email =
                    email;

                teams[i].members[j].skill =
                    skill;
            }
        }
    }


    localStorage.setItem(
        "hackitt_teams",
        JSON.stringify(teams)
    );


    /* ==============================
       UPDATE PAGE
    ============================== */

    let profileStudentName =
        document.getElementById(
            "profileStudentName"
        );


    if(profileStudentName){

        profileStudentName.innerText =
            firstName +
            " " +
            lastName;
    }


    let profileStudentAvatar =
        document.getElementById(
            "profileStudentAvatar"
        );


    if(profileStudentAvatar){

        profileStudentAvatar.innerText =
            (
                firstName.charAt(0) +
                lastName.charAt(0)
            ).toUpperCase();
    }


    let profileStudentEmail =
        document.getElementById(
            "profileStudentEmail"
        );


    if(profileStudentEmail){

        profileStudentEmail.innerText =
            email;

        profileStudentEmail.href =
            "mailto:" +
            email;
    }


    let profileOrgName =
        document.getElementById(
            "profileOrgName"
        );


    if(profileOrgName){

        profileOrgName.innerText =
            firstName +
            " " +
            lastName;
    }


    let profileOrgAvatar =
        document.getElementById(
            "profileOrgAvatar"
        );


    if(profileOrgAvatar){

        profileOrgAvatar.innerText =
            (
                firstName.charAt(0) +
                lastName.charAt(0)
            ).toUpperCase();
    }


    let profileOrgEmail =
        document.getElementById(
            "profileOrgEmail"
        );


    if(profileOrgEmail){

        profileOrgEmail.innerText =
            email;

        profileOrgEmail.href =
            "mailto:" +
            email;
    }


    let organizerName =
        document.getElementById(
            "organizerName"
        );


    if(organizerName){

        organizerName.innerText =
            firstName;
    }


    let studentName =
        document.getElementById(
            "studentName"
        );


    if(studentName){

        studentName.innerText =
            firstName;
    }


    let modal =
        document.getElementById(
            "editProfileModal"
        );


    if(modal){

        modal.remove();
    }


    alert(
        "Profile updated successfully!"
    );
}