/* ==========================================================
   SHOW/HIDE SKILL FIELD BASED ON ROLE
   Students need to pick a skill (used for team generation).
   Organizers don't, so we hide that field for them.
========================================================== */

let roleStudent = document.getElementById("roleStudent");
let roleOrganizer = document.getElementById("roleOrganizer");
let skillField = document.getElementById("skillField");

function toggleSkillField(){
    if(!skillField) return; // not on this page, skip

    if(roleOrganizer.checked){
        skillField.style.display = "none";
    } else {
        skillField.style.display = "flex";
    }
}

if(roleStudent && roleOrganizer){
    roleStudent.addEventListener("change", toggleSkillField);
    roleOrganizer.addEventListener("change", toggleSkillField);

    toggleSkillField(); // run once on page load too
}


/* ==========================================================
   SIGNUP
========================================================== */

let signupForm = document.getElementById("signupForm");

if(signupForm){
    signupForm.addEventListener("submit", function(event){
        event.preventDefault();

        let firstName = document.getElementById("firstName").value;
        let lastName = document.getElementById("lastName").value;
        let email = document.getElementById("signupEmail").value;
        let password = document.getElementById("signupPassword").value;
        let confirmPassword = document.getElementById("confirmPassword").value;

        let selectedRole = document.querySelector('input[name="role"]:checked');
        let role = selectedRole.value;

        // Only students have a skill field
        let skillInput = document.getElementById("skill");
        let skill = skillInput ? skillInput.value : null;

        if(password !== confirmPassword){
            alert("Passwords do not match!");
            return;
        }

        let users = JSON.parse(localStorage.getItem("hackittUsers")) || [];

        for(let i=0; i<users.length; i++){
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

        localStorage.setItem("hackittUsers", JSON.stringify(users));

        // If this new account is a student, also add them to the
        // participants list that the team generator page reads from.
        if(role === "student"){
            let participants = JSON.parse(localStorage.getItem("hackitt_participants")) || [];

            let alreadyIn = false;
            for(let i=0; i<participants.length; i++){
                if(participants[i].email === email){
                    alreadyIn = true;
                    break;
                }
            }

            if(!alreadyIn){
                participants.push({
                    name: firstName + " " + lastName,
                    email: email,
                    skill: skill
                });

                localStorage.setItem("hackitt_participants", JSON.stringify(participants));
            }
        }

        alert("Account created successfully!");

        window.location.href = "login.html";
    });
}


/* ==========================================================
   LOGIN
========================================================== */

let loginForm = document.getElementById("loginForm");

if(loginForm){
    loginForm.addEventListener("submit", function(event){
        event.preventDefault();

        let email = document.getElementById("email").value;
        let password = document.getElementById("password").value;

        let users = JSON.parse(localStorage.getItem("hackittUsers")) || [];

        let foundUser = null;

        for(let i=0; i<users.length; i++){
            if(users[i].email === email && users[i].password === password){
                foundUser = users[i];
                break;
            }
        }

        if(foundUser === null){
            alert("Invalid email or password!");
            return;
        }

        localStorage.setItem("currentUser", JSON.stringify(foundUser));

        alert("Login successful!");

        if(foundUser.role === "student"){
            window.location.href = "profile-student.html";
        }
        else{
            window.location.href = "profile-organizer.html";
        }
    });
}

let currentUser = JSON.parse(localStorage.getItem("currentUser"));

if(currentUser){

    let studentName = document.getElementById("studentName");

    if(studentName){
        studentName.innerText = currentUser.firstName;
    }

    let profileStudentName = document.getElementById("profileStudentName");

    if(profileStudentName){
        profileStudentName.innerText = currentUser.firstName;
    }

    // Organizer profile page
    let profileOrgName = document.getElementById("profileOrgName");

    if(profileOrgName){
        profileOrgName.innerText = currentUser.firstName + " " + currentUser.lastName;
    }

    let profileOrgAvatar = document.getElementById("profileOrgAvatar");

    if(profileOrgAvatar){
        let firstInitial = currentUser.firstName ? currentUser.firstName.charAt(0) : "";
        let lastInitial = currentUser.lastName ? currentUser.lastName.charAt(0) : "";
        profileOrgAvatar.innerText = (firstInitial + lastInitial).toUpperCase();
    }

    let profileOrgEmail = document.getElementById("profileOrgEmail");

    if(profileOrgEmail){
        profileOrgEmail.innerText = currentUser.email;
        profileOrgEmail.href = "mailto:" + currentUser.email;
    }
}


/* ==========================================================
   NAVBAR LOGIN STATE (index.html and any page with these IDs)
   If someone is logged in, hide Login/Get Started and show
   Profile/Log Out instead.
========================================================== */

let navLoginBtn = document.getElementById("navLoginBtn");
let navSignupBtn = document.getElementById("navSignupBtn");
let navProfileBtn = document.getElementById("navProfileBtn");
let navLogoutBtn = document.getElementById("navLogoutBtn");

if(navLoginBtn && navSignupBtn && navProfileBtn && navLogoutBtn){

    if(currentUser){

        // Logged in: hide login/signup, show profile/logout
        navLoginBtn.style.display = "none";
        navSignupBtn.style.display = "none";

        navProfileBtn.style.display = "inline-block";
        navLogoutBtn.style.display = "inline-block";

        // Send them to the right profile page based on role
        if(currentUser.role === "student"){
            navProfileBtn.href = "profile-student.html";
        } else {
            navProfileBtn.href = "profile-organizer.html";
        }

        navLogoutBtn.addEventListener("click", function(event){
            event.preventDefault();
            localStorage.removeItem("currentUser");
            window.location.href = "index.html";
        });

    } else {

        // Not logged in: keep login/signup visible, profile/logout hidden
        navLoginBtn.style.display = "inline-block";
        navSignupBtn.style.display = "inline-block";

        navProfileBtn.style.display = "none";
        navLogoutBtn.style.display = "none";
    }
}