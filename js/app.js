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
   EDIT PROFILE MODAL (profile-student.html)
   Opens the modal pre-filled with the logged-in student's
   data, and saves changes back to localStorage in all 3
   places that need to stay in sync: currentUser, the
   hackittUsers list, and the hackitt_participants list
   (which the team generator reads from).
========================================================== */

let editProfileBtn = document.getElementById("editProfileBtn");
let editProfileModal = document.getElementById("editProfileModal");
let closeEditProfile = document.getElementById("closeEditProfile");
let saveProfileBtn = document.getElementById("saveProfileBtn");

if(editProfileBtn && editProfileModal && saveProfileBtn){

    editProfileBtn.addEventListener("click", function(event){
        event.preventDefault();

        if(!currentUser){
            alert("Please log in first.");
            return;
        }

        // Pre-fill the form with the current values
        document.getElementById("editFirstName").value = currentUser.firstName || "";
        document.getElementById("editLastName").value = currentUser.lastName || "";
        document.getElementById("editEmail").value = currentUser.email || "";

        let editSkillSelect = document.getElementById("editSkill");
        if(editSkillSelect && currentUser.skill){
            editSkillSelect.value = currentUser.skill;
        }

        editProfileModal.classList.add("active");
    });

    if(closeEditProfile){
        closeEditProfile.addEventListener("click", function(){
            editProfileModal.classList.remove("active");
        });
    }

    // Close if the person clicks the dark overlay outside the box
    editProfileModal.addEventListener("click", function(event){
        if(event.target === editProfileModal){
            editProfileModal.classList.remove("active");
        }
    });

    saveProfileBtn.addEventListener("click", function(){

        let updatedFirstName = document.getElementById("editFirstName").value.trim();
        let updatedLastName = document.getElementById("editLastName").value.trim();
        let updatedEmail = document.getElementById("editEmail").value.trim();
        let updatedSkill = document.getElementById("editSkill").value;

        if(!updatedFirstName || !updatedLastName || !updatedEmail){
            alert("Please fill in all fields.");
            return;
        }

        let oldEmail = currentUser.email;

        // Update currentUser
        currentUser.firstName = updatedFirstName;
        currentUser.lastName = updatedLastName;
        currentUser.email = updatedEmail;
        currentUser.skill = updatedSkill;

        localStorage.setItem("currentUser", JSON.stringify(currentUser));

        // Update this user inside hackittUsers
        let users = JSON.parse(localStorage.getItem("hackittUsers")) || [];

        for(let i = 0; i < users.length; i++){
            if(users[i].email === oldEmail){
                users[i].firstName = updatedFirstName;
                users[i].lastName = updatedLastName;
                users[i].email = updatedEmail;
                users[i].skill = updatedSkill;
                break;
            }
        }

        localStorage.setItem("hackittUsers", JSON.stringify(users));

        // Update this student inside hackitt_participants
        // (this is what the team generator reads from)
        let participants = JSON.parse(localStorage.getItem("hackitt_participants")) || [];

        for(let i = 0; i < participants.length; i++){
            if(participants[i].email === oldEmail){
                participants[i].name = updatedFirstName + " " + updatedLastName;
                participants[i].email = updatedEmail;
                participants[i].skill = updatedSkill;
                break;
            }
        }

        localStorage.setItem("hackitt_participants", JSON.stringify(participants));

        // Reflect the change immediately on the page
        let profileStudentNameEl = document.getElementById("profileStudentName");
        if(profileStudentNameEl){
            profileStudentNameEl.innerText = updatedFirstName;
        }

        let profileStudentEmailEl = document.getElementById("profileStudentEmail");
        if(profileStudentEmailEl){
            profileStudentEmailEl.innerText = updatedEmail;
            profileStudentEmailEl.href = "mailto:" + updatedEmail;
        }

        editProfileModal.classList.remove("active");

        alert("Profile updated!");
    });
}

/* ==========================================================
   LOG OUT (works on ANY page that has a #navLogoutBtn,
   not just index.html — e.g. profile-student.html, check.html)
========================================================== */

let anyPageLogoutBtn = document.getElementById("navLogoutBtn");

if(anyPageLogoutBtn){
    anyPageLogoutBtn.addEventListener("click", function(event){
        event.preventDefault();
        localStorage.removeItem("currentUser");
        window.location.href = "index.html";
    });
}
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

    } else {

        // Not logged in: keep login/signup visible, profile/logout hidden
        navLoginBtn.style.display = "inline-block";
        navSignupBtn.style.display = "inline-block";

        navProfileBtn.style.display = "none";
        navLogoutBtn.style.display = "none";
    }
}


/* ==========================================================
   STUDENT PROFILE: TEAM STATUS BANNER
   Shows one of three states, based on what's in localStorage:
   1. Organizer hasn't generated teams yet
   2. Teams exist, this student is already in one -> show it
   3. Teams exist, this student hasn't joined yet -> nudge them
========================================================== */

let teamBannerTitle = document.getElementById("teamBannerTitle");
let teamBannerText = document.getElementById("teamBannerText");
let teamBannerBtn = document.getElementById("teamBannerBtn");

if(teamBannerTitle && teamBannerText && teamBannerBtn){

    let teams = JSON.parse(localStorage.getItem("hackitt_teams")) || [];

    if(teams.length === 0){

        // 1. No teams generated yet
        teamBannerTitle.innerText = "Hackitt Summer Jam 2026";
        teamBannerText.innerText = "Teams have not been generated yet. Check back soon!";
        teamBannerBtn.innerText = "Check Team";
        teamBannerBtn.href = "check.html";

    } else {

        let myTeam = null;

        if(currentUser){
            let myBannerEmail = (currentUser.email || "").trim().toLowerCase();

            for(let team of teams){
                if(!team.members){
                    team.members = [];
                }

                let isMember = team.members.some(function(member){
                    return (member.email || "").trim().toLowerCase() === myBannerEmail;
                });

                if(isMember){
                    myTeam = team;
                    break;
                }
            }
        }

        if(myTeam){

            // 2. Already in a team
            teamBannerTitle.innerText = "You're in " + myTeam.name + "!";
            teamBannerText.innerText =
                myTeam.members.length + "/" + myTeam.maxSize + " members";
            teamBannerBtn.innerText = "View My Team";
            teamBannerBtn.href = "check.html";

        } else {

            // 3. Teams exist, student hasn't joined one
            teamBannerTitle.innerText = "Teams are ready!";
            teamBannerText.innerText = "Head over and pick your team.";
            teamBannerBtn.innerText = "Check Team";
            teamBannerBtn.href = "check.html";
        }
    }
}


/* ==========================================================
   STUDENT DASHBOARD: "MY TEAM" WIDGET (student.html)
   Same idea as the profile banner above, but for the
   dashboard's team-section card.
========================================================== */

let myTeamStatus = document.getElementById("myTeamStatus");
let myTeamMessage = document.getElementById("myTeamMessage");
let myTeamName = document.getElementById("myTeamName");
let myTeamMembers = document.getElementById("myTeamMembers");

if(myTeamStatus && myTeamMessage){

    let dashboardTeams = JSON.parse(localStorage.getItem("hackitt_teams")) || [];

    let myAssignedTeam = null;

    if(currentUser){

        let myEmail = (currentUser.email || "").trim().toLowerCase();

        for(let team of dashboardTeams){
            if(!team.members){
                team.members = [];
            }

            let isMember = team.members.some(function(member){
                return (member.email || "").trim().toLowerCase() === myEmail;
            });

            if(isMember){
                myAssignedTeam = team;
                break;
            }
        }
    }

    if(myAssignedTeam){

        // Student has a team: show it
        myTeamStatus.innerText = "Assigned";
        myTeamStatus.style.color = "#00e5ff";

        if(myTeamName){
            myTeamName.innerText = myAssignedTeam.name;
        }

        myTeamMessage.innerText =
            myAssignedTeam.members.length + "/" + myAssignedTeam.maxSize + " members";

        if(myTeamMembers){
            myTeamMembers.innerHTML = myAssignedTeam.members
                .map(function(member){
                    return "<p>" + member.name + " - " + (member.skill || "General") + "</p>";
                })
                .join("");
        }

    } else if(dashboardTeams.length === 0){

        // No teams generated yet at all
        myTeamStatus.innerText = "Not Assigned";
        myTeamMessage.innerText =
            "Your team will appear here once the organizer generates the teams.";

    } else {

        // Teams exist, but this student hasn't joined one
        myTeamStatus.innerText = "Not Assigned";
        myTeamMessage.innerText =
            "Teams are ready! Go to Check Team to join one.";
    }
}