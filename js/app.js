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
            role: role
        };

        users.push(newUser);

        localStorage.setItem("hackittUsers", JSON.stringify(users));

        alert("Account created successfully!");

        window.location.href = "login.html";
    });
}


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
            window.location.href = "student.html";
        }
        else{
            window.location.href = "profile_organizer.html";
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
}