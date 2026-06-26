document.addEventListener("DOMContentLoaded", () => {
  const email = document.getElementById("Email");
  const password = document.getElementById("Password");
  const submitForm = document.getElementById("login-form");
  const statusLogin = document.getElementById("status");

  submitForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const emailValue = email.value;
    const passwordValue = password.value;
    const loginData = {
      Email: emailValue,
      Password: passwordValue,
    };
    console.log(loginData);

    async function sendLogin() {
      const url = "http://localhost:3000/api/users/login";
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", //receives session cookie
          body: JSON.stringify(loginData),
        });

        if (!response.ok) {
          statusLogin.innerHTML = "Incorrect password or email";
          statusLogin.style.display = "block";
          throw new Error(`Reponse status: ${response.status}`);
        } else {
          statusLogin.style.display = "none";
        }
        const result = await response.json();
        console.log(result);
        window.location.href = result.redirectTo;
      } catch (error) {
        console.error(error.message);
      }
    }
    sendLogin();
  });
});
