document.addEventListener("DOMContentLoaded", () =>{
    const registerForm = document.getElementById("signup-form");
    const email = document.getElementById("email");
    const username = document.getElementById("username");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");

    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const avatar = document.querySelector("input[name='avatar']:checked");
    
        if (password.value!==confirmPassword.value){
            alert("Passwords not match");
            return;
        }
        const signup = {
            Email: email.value,
            UserName: username.value,
            Password: password.value,
            Avatar: avatar.value
        }
        console.log(signup);

        async function register() {
            const url = "http://localhost:3000/api/users/register";
            try {
                
                    const res = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json",},
                    credentials: "include",
                    body: JSON.stringify(signup)
                });

                if (!res.ok) {
                    throw new Error(`Reponse status: ${res.status}`);
                }
                const result = await res.json();
                console.log(result);
                window.location.href = result.redirectTo;
                alert("Registration successful!");
            } catch (error) {
                console.log(error);
            }
        }
        register();
    })
})
