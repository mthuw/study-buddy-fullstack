document.getElementById("adminLoginForm").addEventListener("submit", async (e) =>{
    e.preventDefault();
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const loginError = document.getElementById("loginError");
    const loginData = {
        email: email.value,
        password: password.value
    };

    try {
        const res = await fetch("http://localhost:3000/api/admin/adminLogin", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            credentials: "include",
            body: JSON.stringify(loginData)
        })
        if (!res.ok){
            loginError.textContent = "Login failed";
            loginError.style.display = "block";
        } 
        const result = await res.json()
        console.log(result)
        window.location.href = result.redirectTo;

        
    } catch (error) {
        console.error("Login error:", error);
    }
})