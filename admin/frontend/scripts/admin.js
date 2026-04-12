document.addEventListener("DOMContentLoaded", () => {
  let users = [];
  let editingId = null;
  let deletingId = null;

  const userBody = document.getElementById("userBody");
  const userCount = document.getElementById("userCount");
  const searchInput = document.getElementById("searchInput");

  const modals = {
    add: document.getElementById("addModal"),
    edit: document.getElementById("editModal"),
    delete: document.getElementById("deleteModal"),
  };

  const openModal = (el) => el.classList.add("is-open");
  const closeModal = (el) => el.classList.remove("is-open");
  const closeAllModals = () => Object.values(modals).forEach(closeModal);

  const escHtml = (str) =>
    String(str).replace(
      /[&<>"']/g,
      (m) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[m],
    );

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/admin/users", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

      const result = await res.json();
      users = result.map((dbUser) => ({
        id: dbUser.UserID,
        username: dbUser.UserName,
        email: dbUser.Email,
        avatar: dbUser.Avatar,
        role: "User",
      }));

      refresh();
    } catch (error) {
      console.error("Could not fetch users:", error);
    }
  };

  const addUserToDb = async (username, email, password) => {
    const res = await fetch("http://localhost:3000/api/admin/addUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        UserName: username,
        Email: email,
        Password: password,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to create user.");
    }
    return res.json();
  };

  const updateUserInDb = async (id, email) => {
    const res = await fetch(`http://localhost:3000/api/admin/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ Email: email }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to update user.");
    }
    return res.json();
  };

  const deleteUserFromDb = async (id) => {
    const res = await fetch(
      `http://localhost:3000/api/admin/deleteUser/${id}`,
      {
        method: "DELETE",
        credentials: "include",
      },
    );
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to delete user.");
    }
  };
  //render
  const icons = {
    edit: `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`,
    delete: `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M19 6l-1 14H6L5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M9 6V4h6v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`,
  };

  const generateUserRow = (u) => `
    <tr>
        <td>
        <div class="td-actions">
            <button class="icon-btn icon-btn--edit" data-id="${u.id}" title="Edit">
            ${icons.edit}
            </button>
            <button class="icon-btn icon-btn--delete" data-id="${u.id}" title="Delete">
            ${icons.delete}
            </button>
        </div>
        </td>
        <td>${escHtml(u.email)}</td>
        <td>${escHtml(u.username)}</td>
        <td><span class="role-badge">${escHtml(u.role)}</span></td>
    </tr>
    `;

  const render = (list) => {
    userBody.innerHTML = list.map(generateUserRow).join("");
    userCount.textContent = `${list.length} user${list.length === 1 ? "" : "s"}`;
  };

  const refresh = () => {
    const q = searchInput.value.trim().toLowerCase();
    render(
      q
        ? users.filter(
            (u) =>
              u.email.toLowerCase().includes(q) ||
              u.username.toLowerCase().includes(q),
          )
        : users,
    );
  };

  searchInput.addEventListener("input", refresh);

  userBody.addEventListener("click", (e) => {
    const editBtn = e.target.closest(".icon-btn--edit");
    const deleteBtn = e.target.closest(".icon-btn--delete");

    if (editBtn) {
      const u = users.find((x) => x.id === Number(editBtn.dataset.id));
      if (!u) return;
      editingId = u.id;
      document.getElementById("editUsername").value = u.username;
      document.getElementById("editEmail").value = u.email;
      document.getElementById("editError").textContent = "";
      openModal(modals.edit);
    }

    if (deleteBtn) {
      const u = users.find((x) => x.id === Number(deleteBtn.dataset.id));
      if (!u) return;
      deletingId = u.id;
      document.getElementById("deleteUserName").textContent = u.username;
      openModal(modals.delete);
    }
  });

  document.getElementById("addUser").addEventListener("click", () => {
    ["addUsername", "addEmail", "addPassword", "addPasswordRepeat"].forEach(
      (id) => (document.getElementById(id).value = ""),
    );
    document.getElementById("addError").textContent = "";
    openModal(modals.add);
    setTimeout(() => document.getElementById("addUsername").focus(), 60);
  });

  document
    .getElementById("addCancel")
    .addEventListener("click", () => closeModal(modals.add));

  document.getElementById("addCreate").addEventListener("click", async () => {
    const username = document.getElementById("addUsername").value.trim();
    const email = document.getElementById("addEmail").value.trim();
    const password = document.getElementById("addPassword").value;
    const repeat = document.getElementById("addPasswordRepeat").value;
    const err = document.getElementById("addError");

    if (!username || !email || !password || !repeat)
      return (err.textContent = "All fields are required.");
    if (password !== repeat)
      return (err.textContent = "Passwords do not match.");
    if (users.some((u) => u.username === username))
      return (err.textContent = "Username already exists.");

    try {
      await addUserToDb(username, email, password);
      closeModal(modals.add);
      await fetchUsers();
    } catch (e) {
      err.textContent = e.message;
    }
  });

  document
    .getElementById("editCancel")
    .addEventListener("click", () => closeModal(modals.edit));

  document.getElementById("editUpdate").addEventListener("click", async () => {
    const email = document.getElementById("editEmail").value.trim();
    const err = document.getElementById("editError");

    if (!email) return (err.textContent = "Email is required.");

    try {
      await updateUserInDb(editingId, email);
      const u = users.find((x) => x.id === editingId);
      if (u) u.email = email;
      closeModal(modals.edit);
      refresh();
    } catch (e) {
      err.textContent = e.message;
    }
  });

  document
    .getElementById("deleteCancel")
    .addEventListener("click", () => closeModal(modals.delete));

  document
    .getElementById("deleteConfirm")
    .addEventListener("click", async () => {
      try {
        await deleteUserFromDb(deletingId);
        users = users.filter((u) => u.id !== deletingId);
        closeModal(modals.delete);
        refresh();
      } catch (e) {
        console.error("Delete failed:", e.message);
      }
    });

  document.querySelectorAll(".field__eye").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.target);
      input.type = input.type === "password" ? "text" : "password";
    });
  });

  Object.values(modals).forEach((m) =>
    m.addEventListener("click", (e) => {
      if (e.target === m) closeModal(m);
    }),
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAllModals();
  });

  fetchUsers();
});
