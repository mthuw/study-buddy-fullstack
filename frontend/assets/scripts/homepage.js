console.log("app.js loaded ✅");

document.addEventListener("DOMContentLoaded", () => {
  
  const openBtn = document.getElementById("openProfileModal");
  const modal = document.getElementById("profileModal");
  const form = document.getElementById("profileForm");
  const closeBtn = document.getElementById("closeProfileModal");
  const cancelBtn = document.getElementById("cancelProfileModal");

  const supportsDialog = typeof modal.showModal === "function";

  const openModal = () => {
    if (supportsDialog) modal.showModal();
  };

  const closeModal = () => {
    if (supportsDialog) modal.close();
  };

  openBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);

  // Click outside the form closes the modal
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Submit: validate then close (demo behavior)
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); 
    
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    const { studyField, subjects, lookingFor, availability } = data;
    try {
        const response = await fetch("http://localhost:3000/api/profilePost/newProfilePost", {
          method: "POST",
          headers: {"Content-Type": "application/json",},
          credentials: "include",
          body: JSON.stringify({ studyField, subjects, lookingFor, availability })
        });
        const result = await response.json();
        console.log(result)
        if (response.ok){
          closeModal();
          form.reset();
          getData();
        }
      } catch (error) {
        console.error("Error:", error);
      }
  });
});

async function getData() {
  const url = "http://localhost:3000/api/profilePost/getProfilePosts";
  const container = document.getElementById("container");
  const heading = document.getElementById("heading");
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {"Content-Type": "application/json",},
      credentials: "include"
    });
    const result = await response.json();
    console.log(result);
    // const welcome = document.getElementById("welcome");
    // welcome.innerHTML = `<h1>Welcome to StudyHub, ${result.message}! 👋</h1>`
    heading.innerHTML = `<h4>${result.length} Study Buddies Available</h4>`
    container.innerHTML = result.map(user => `
            <article>
              <header>
                <div aria-hidden="true">👨‍💻</div>
                <div>
                  <h3>${user.UserName}</h3>
                  <p>${user.studyField}</p>
                </div>
                <div style="display:none"></div>
              </header>

              <p>${user.lookingFor}</p>

              <ul aria-label="Topics" id="subjects">
                  ${user.subjects.split(",").map(subject=>`<li>${subject.trim()}</li>`).join("")}
                
              </ul>

              <ul aria-label="Availability and format" id="availability">
                <li>${user.availability}</li>
               
              </ul>

              <button type="button">Connect</button>
            </article>`).join("");
    
  } catch (error) {
    console.error(error.message);
  }
}

async function logout(){
  const btn = document.getElementById("logout-btn");
}
getData();
