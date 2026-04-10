// ========================
// API HELPERS
// ========================

const API_BASE = '';

let users = [];
let departments = [];
let employees = [];
let requests = [];

async function apiGet(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
  return data;
}

async function apiPost(endpoint, data) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const responseData = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(responseData.message || `Error ${res.status}`);
  return responseData;
}

async function apiPut(endpoint, data) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const responseData = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(responseData.message || `Error ${res.status}`);
  return responseData;
}

async function apiDelete(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'DELETE',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
  return data;
}

async function loadData() {
  try {
    users = await apiGet('/users');
    departments = await apiGet('/departments');
    employees = await apiGet('/employees');
    requests = await apiGet('/requests');
  } catch (e) {
    console.warn("Loading from server failed:", e);
  }
}

// ========================
// GLOBAL STATE
// ========================

let currentUser = null;

function setAuthState(isAuth, user = null) {
  if (isAuth && user) {
    currentUser = {
      name: user.firstName + " " + user.lastName,
      email: user.email,
      role: user.role
    };
    sessionStorage.setItem("auth_token", JSON.stringify({ id: user.id, email: user.email, role: user.role }));
    document.body.className = user.role === "Admin" ? "authenticated is-admin" : "authenticated";
    updateProfileUI(user);
  } else {
    currentUser = null;
    sessionStorage.removeItem("auth_token");
    document.body.className = "not-authenticated";
    if (document.getElementById("userRole"))
      document.getElementById("userRole").innerText = "Guest";
  }
}

function updateProfileUI(user) {
  if (document.getElementById("userRole"))
    document.getElementById("userRole").innerText = user.role;
  if (document.getElementById("profileName"))
    document.getElementById("profileName").innerText = "Name: " + user.firstName + " " + user.lastName;
  if (document.getElementById("profileEmail"))
    document.getElementById("profileEmail").innerText = "Email: " + user.email;
  if (document.getElementById("profileRole"))
    document.getElementById("profileRole").innerText = "Role: " + user.role;
}

// ========================
// ROUTING
// ========================

function navigateTo(path) {
  window.location.hash = "#/" + path;
}

function handleRouting() {
  let hash = window.location.hash || "#/";
  let route = hash.replace("#/", "");
  let pageId = route ? route + "-page" : "dashboard-page";

  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));

  if (!currentUser) {
    if (["profile", "employees", "accounts", "departments", "requests"].includes(route)) {
      navigateTo("login");
      pageId = "login-page";
    }
  } else {
    if (currentUser.role !== "Admin" && ["employees", "accounts", "departments"].includes(route)) {
      navigateTo("profile");
      pageId = "profile-page";
    }
  }

  const page = document.getElementById(pageId);
  if (page) page.classList.add("active");

  if (route === "profile") renderProfile();
  if (route === "accounts") renderAccounts();
  if (route === "employees") renderEmployees();
  if (route === "departments") renderDepartments();
  if (route === "requests") renderRequestsTable();
}

window.addEventListener("hashchange", handleRouting);

// ========================
// INITIALIZATION
// ========================

document.addEventListener("DOMContentLoaded", async function() {
  console.log("Page loaded, initializing...");
  
  // Load data first
  await loadData();
  console.log("Data loaded:", { users: users.length, departments: departments.length });
  
  // Check for existing auth
  const tokenStr = sessionStorage.getItem("auth_token");
  if (tokenStr) {
    try {
      const token = JSON.parse(tokenStr);
      const user = users.find(u => u.id === token.id);
      if (user && user.verified) {
        setAuthState(true, user);
      }
    } catch (e) {
      sessionStorage.removeItem("auth_token");
    }
  }
  
  // Initial routing
  if (!window.location.hash) {
    navigateTo("");
  }
  handleRouting();
  
  console.log("Initialization complete");
  
  // Register form
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async function(e) {
      e.preventDefault();

      const firstName = registerFirstName.value.trim();
      const lastName = registerLastName.value.trim();
      const email = registerEmail.value.trim();
      const password = registerPassword.value;

      if (password.length < 6) {
        alert("Password must be at least 6 characters!");
        return;
      }

      try {
        await apiPost('/auth/register', {
          firstName,
          lastName,
          email,
          password,
          role: "User"
        });
        localStorage.setItem("unverified_email", email);
        navigateTo("verify");
      } catch (err) {
        alert(err.message || 'Registration failed');
      }
    });
  }

  // Login form
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async function(e) {
      e.preventDefault();

      const email = loginEmail.value.trim();
      const password = loginPassword.value;

      if (!email || !password) {
        alert("Please enter email and password");
        return;
      }

      try {
        const user = await apiPost('/auth/login', { email, password });
        setAuthState(true, user);
        navigateTo("profile");
      } catch (err) {
        alert(err.message || 'Login failed');
      }
    });
  }

  // Verify email
  window.simulateVerification = async function() {
    const email = localStorage.getItem("unverified_email");
    if (!email) return;

    try {
      await apiPost('/auth/verify', { email });
      localStorage.removeItem("unverified_email");
      const successAlert = document.getElementById("verificationSuccess");
      if (successAlert) successAlert.classList.remove("d-none");
      setTimeout(() => navigateTo("login"), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  // Profile edit form
  const profileEditForm = document.getElementById("profileEditForm");
  if (profileEditForm) {
    profileEditForm.addEventListener("submit", async function(e) {
      e.preventDefault();

      const firstName = editFirstName.value;
      const lastName = editLastName.value;
      const password = editPassword.value;
      const account = users.find(u => u.email === currentUser.email);

      if (!account) return;

      try {
        await apiPut(`/users/${account.id}`, { firstName, lastName, password });
        await loadData();
        const updated = users.find(u => u.email === currentUser.email);
        if (updated) setAuthState(true, updated);
        alert("Profile updated successfully!");
        renderProfile();
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // Account form
  const accountFormFields = document.getElementById("accountFormFields");
  if (accountFormFields) {
    accountFormFields.addEventListener("submit", async function(e) {
      e.preventDefault();

      const firstName = document.getElementById("accFirstName").value.trim();
      const lastName = document.getElementById("accLastName").value.trim();
      const email = document.getElementById("accEmail").value.trim();
      const password = document.getElementById("accPassword").value.trim();
      const role = document.getElementById("accRole").value;
      const verified = document.getElementById("accVerified").checked;

      const form = document.getElementById("accountForm");
      const editId = form.dataset.editId;

      if (!firstName || !lastName || !email || !role) {
        alert("All fields are required!");
        return;
      }

      if (password && password.length < 6) {
        alert("Password must be at least 6 characters!");
        return;
      }

      try {
        if (editId) {
          if (password) {
            await apiPut(`/users/${editId}`, { firstName, lastName, email, password, confirmPassword: password, role, verified });
          } else {
            await apiPut(`/users/${editId}`, { firstName, lastName, email, role, verified });
          }
        } else {
          if (!password) {
            alert("Password is required for new accounts!");
            return;
          }
          await apiPost('/users', { title: "User", firstName, lastName, email, password, confirmPassword: password, role, verified });
        }
        await loadData();
        renderAccounts();
        hideAccountForm();
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // Employee form
  const employeeFormFields = document.getElementById("employeeFormFields");
  if (employeeFormFields) {
    employeeFormFields.addEventListener("submit", async function(e) {
      e.preventDefault();

      const id = document.getElementById("empId").value.trim();
      const email = document.getElementById("empEmail").value.trim();
      const position = document.getElementById("empPosition").value.trim();
      const department = document.getElementById("empDept").value;
      const hireDate = document.getElementById("empHireDate").value.trim();

      if (!id || !email || !position || !department) {
        alert("Please fill in all required fields");
        return;
      }

      const accountExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (!accountExists) {
        alert("User email does not exist. Please use a registered account email.");
        return;
      }

      try {
        const existing = employees.findIndex(emp => emp.id === id);
        if (existing >= 0) {
          await apiPut(`/employees/${id}`, { id, email, position, department, hireDate });
        } else {
          await apiPost('/employees', { id, email, position, department, hireDate });
        }
        await loadData();
        renderEmployees();
        this.reset();
        hideEmployeeForm();
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // Department form
  const deptFormFields = document.getElementById("deptFormFields");
  if (deptFormFields) {
    deptFormFields.addEventListener("submit", async function(e) {
      e.preventDefault();

      const name = document.getElementById("deptName").value.trim();
      const description = document.getElementById("deptDesc").value.trim();
      const deptForm = document.getElementById("deptForm");
      const editId = deptForm.dataset.editIndex;

      if (!name || !description) {
        alert("Please fill in all required fields");
        return;
      }

      try {
        if (editId) {
          await apiPut(`/departments/${editId}`, { name, description });
        } else {
          await apiPost('/departments', { name, description });
        }
        await loadData();
        renderDepartments();
        populateDepartmentDropdown();
        hideDeptForm();
      } catch (err) {
        alert(err.message);
      }
    });
  }

  // Request form
  const requestForm = document.getElementById("requestForm");
  if (requestForm) {
    requestForm.addEventListener("submit", async function(e) {
      e.preventDefault();

      if (!currentUser) {
        alert("Please login first.");
        return;
      }

      const type = document.getElementById("reqType").value;
      const itemNames = document.querySelectorAll(".item-name");
      const itemQtys = document.querySelectorAll(".item-qty");

      if (!type) {
        alert("Please select a request type.");
        return;
      }

      if (itemNames.length === 0) {
        alert("Add at least one item.");
        return;
      }

      const items = [];
      for (let i = 0; i < itemNames.length; i++) {
        const name = itemNames[i].value.trim();
        const qty = parseInt(itemQtys[i].value);
        if (!name || qty <= 0) {
          alert("Invalid item name or quantity.");
          return;
        }
        items.push({ name, qty });
      }

      try {
        await apiPost('/requests', {
          employeeEmail: currentUser.email,
          type,
          items: JSON.stringify(items),
          status: "Pending",
          date: new Date().toLocaleDateString()
        });
        await loadData();
        renderRequestsTable();
        this.reset();
        document.getElementById("itemsContainer").innerHTML = "";
        hideRequestModal();
      } catch (err) {
        alert(err.message);
      }
    });
  }

  populateDepartmentDropdown();
  renderAccounts();
  renderEmployees();
  renderDepartments();
  renderRequestsTable();
});

// ========================
// LOGOUT
// ========================

function logout() {
  setAuthState(false);
  navigateTo("");
}

// ========================
// PROFILE PAGE
// ========================

function renderProfile() {
  if (!currentUser) return;
  const account = users.find(u => u.email === currentUser.email);
  if (!account) return;

  document.getElementById("profileName").innerText = "Name: " + account.firstName + " " + account.lastName;
  document.getElementById("profileEmail").innerText = "Email: " + account.email;
  document.getElementById("profileRole").innerText = "Role: " + account.role;
  document.getElementById("profileView").style.display = "block";
  document.getElementById("profileEditForm").style.display = "none";
}

function enableProfileEdit() {
  const account = users.find(u => u.email === currentUser.email);
  if (!account) return;

  document.getElementById("editFirstName").value = account.firstName;
  document.getElementById("editLastName").value = account.lastName;
  document.getElementById("profileView").style.display = "none";
  document.getElementById("profileEditForm").style.display = "block";
}

function cancelProfileEdit() {
  document.getElementById("profileEditForm").style.display = "none";
  document.getElementById("profileView").style.display = "block";
}

document.getElementById("profileEditForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const firstName = editFirstName.value;
  const lastName = editLastName.value;
  const password = editPassword.value;
  const account = users.find(u => u.email === currentUser.email);

  if (!account) return;

  try {
    await apiPut(`/users/${account.id}`, { firstName, lastName, password });
    await loadData();
    const updated = users.find(u => u.email === currentUser.email);
    if (updated) setAuthState(true, updated);
    alert("Profile updated successfully!");
    renderProfile();
  } catch (err) {
    alert(err.message);
  }
});

// ========================
// ACCOUNTS
// ========================

function renderAccounts() {
  const tbody = document.getElementById("accountTableBody");
  tbody.innerHTML = "";

  if (!users || users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center">No accounts</td></tr>`;
    return;
  }

  users.forEach(acc => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${acc.firstName} ${acc.lastName}</td>
      <td>${acc.email}</td>
      <td>${acc.role}</td>
      <td>${acc.verified ? "✔" : "✖"}</td>
      <td>
        <button class="btn btn-sm btn-primary2 me-1" onclick="editAccount(${acc.id})">Edit</button>
        <button class="btn btn-sm btn-warning me-1" onclick="resetAccountPassword(${acc.id})">Reset Password</button>
        <button class="btn btn-sm btn-danger" onclick="deleteAccount(${acc.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function showAccountForm() {
  const wrapper = document.getElementById("accountForm");
  const form = document.getElementById("accountFormFields");
  wrapper.dataset.editId = "";
  form.reset();
  document.getElementById("accPassword").removeAttribute("readonly");
  document.getElementById("accPasswordLabel").textContent = "Password";
  wrapper.style.display = "block";
}

function hideAccountForm() {
  const wrapper = document.getElementById("accountForm");
  wrapper.style.display = "none";
}

async function editAccount(id) {
  try {
    const accWithHash = await apiGet(`/users/${id}/with-hash`);
    document.getElementById("accFirstName").value = accWithHash.firstName;
    document.getElementById("accLastName").value = accWithHash.lastName;
    document.getElementById("accEmail").value = accWithHash.email;
    document.getElementById("accPassword").value = accWithHash.passwordHash;
    document.getElementById("accPassword").setAttribute("readonly", true);
    document.getElementById("accPasswordLabel").textContent = "Password (leave empty to keep current)";
    document.getElementById("accRole").value = accWithHash.role;
    document.getElementById("accVerified").checked = accWithHash.verified;
  } catch (err) {
    alert(err.message);
    return;
  }

  const form = document.getElementById("accountForm");
  form.dataset.editId = id;
  form.style.display = "block";
}

async function deleteAccount(id) {
  if (users.find(u => u.id === id).email === currentUser.email) {
    alert("Cannot delete your own account.");
    return;
  }
  if (!confirm("Are you sure you want to delete this account?")) return;

  try {
    await apiDelete(`/users/${id}`);
    await loadData();
    renderAccounts();
  } catch (err) {
    alert(err.message);
  }
}

async function resetAccountPassword(id) {
  const newPassword = prompt("Enter new password (min 6 chars):");
  if (!newPassword || newPassword.length < 6) {
    alert("Password must be at least 6 characters");
    return;
  }

  try {
    await apiPut(`/users/${id}`, { password: newPassword, confirmPassword: newPassword });
    alert("Password reset successfully!");
  } catch (err) {
    alert(err.message);
  }
}

document.getElementById("accountFormFields").addEventListener("submit", async function(e) {
  e.preventDefault();

  const firstName = document.getElementById("accFirstName").value.trim();
  const lastName = document.getElementById("accLastName").value.trim();
  const email = document.getElementById("accEmail").value.trim();
  const password = document.getElementById("accPassword").value.trim();
  const role = document.getElementById("accRole").value;
  const verified = document.getElementById("accVerified").checked;

  const form = document.getElementById("accountForm");
  const editId = form.dataset.editId;

  if (!firstName || !lastName || !email || !role) {
    alert("All fields are required!");
    return;
  }

  if (password && password.length < 6) {
    alert("Password must be at least 6 characters!");
    return;
  }

  try {
    if (editId) {
      if (password) {
        await apiPut(`/users/${editId}`, { firstName, lastName, email, password, confirmPassword: password, role, verified });
      } else {
        await apiPut(`/users/${editId}`, { firstName, lastName, email, role, verified });
      }
    } else {
      if (!password) {
        alert("Password is required for new accounts!");
        return;
      }
      await apiPost('/users', { title: "User", firstName, lastName, email, password, confirmPassword: password, role, verified });
    }
    await loadData();
    renderAccounts();
    hideAccountForm();
  } catch (err) {
    alert(err.message);
  }
});

// ========================
// EMPLOYEES
// ========================

function renderEmployees() {
  const tbody = document.getElementById("employeeTableBody");
  tbody.innerHTML = "";

  if (!employees || employees.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center">No employees</td></tr>`;
    return;
  }

  employees.forEach(emp => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${emp.id}</td>
      <td>${emp.email}</td>
      <td>${emp.position}</td>
      <td>${emp.department}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="editEmployee('${emp.id}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteEmployee('${emp.id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function showEmployeeForm() {
  document.getElementById("employeeForm").style.display = "block";
}

function hideEmployeeForm() {
  const form = document.getElementById("employeeFormFields");
  if (form) form.reset();
  document.getElementById("empId").disabled = false;
  document.getElementById("employeeForm").style.display = "none";
}

async function deleteEmployee(id) {
  if (!confirm("Are you sure you want to delete this employee?")) return;

  try {
    await apiDelete(`/employees/${id}`);
    await loadData();
    renderEmployees();
  } catch (err) {
    alert(err.message);
  }
}

function editEmployee(id) {
  const emp = employees.find(e => e.id === id);
  if (!emp) return;

  document.getElementById("empId").value = emp.id;
  document.getElementById("empId").disabled = true;
  document.getElementById("empEmail").value = emp.email;
  document.getElementById("empPosition").value = emp.position;
  document.getElementById("empDept").value = emp.department;
  document.getElementById("empHireDate").value = emp.hireDate || "";
  showEmployeeForm();
}

document.getElementById("employeeFormFields").addEventListener("submit", async function(e) {
  e.preventDefault();

  const id = document.getElementById("empId").value.trim();
  const email = document.getElementById("empEmail").value.trim();
  const position = document.getElementById("empPosition").value.trim();
  const department = document.getElementById("empDept").value;
  const hireDate = document.getElementById("empHireDate").value.trim();

  if (!id || !email || !position || !department) {
    alert("Please fill in all required fields");
    return;
  }

  const accountExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
  if (!accountExists) {
    alert("User email does not exist. Please use a registered account email.");
    return;
  }

  try {
    const existing = employees.findIndex(emp => emp.id === id);
    if (existing >= 0) {
      await apiPut(`/employees/${id}`, { id, email, position, department, hireDate });
    } else {
      await apiPost('/employees', { id, email, position, department, hireDate });
    }
    await loadData();
    renderEmployees();
    this.reset();
    hideEmployeeForm();
  } catch (err) {
    alert(err.message);
  }
});

// ========================
// DEPARTMENTS
// ========================

function renderDepartments() {
  const tbody = document.getElementById("deptTableBody");
  tbody.innerHTML = "";

  if (!departments || departments.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="text-center">No departments</td></tr>`;
    return;
  }

  departments.forEach((dept, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${dept.name}</td>
      <td>${dept.description}</td>
      <td>
        <button class="btn btn-sm btn-primary2 me-1" onclick="editDepartment(${dept.id})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteDepartment(${dept.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function showDeptForm() {
  const deptForm = document.getElementById("deptForm");
  deptForm.style.display = "block";
  if (!deptForm.dataset.editIndex) {
    document.getElementById("deptName").value = "";
    document.getElementById("deptDesc").value = "";
  }
}

function hideDeptForm() {
  const deptForm = document.getElementById("deptForm");
  deptForm.style.display = "none";
  deptForm.dataset.editIndex = "";
  document.getElementById("deptName").value = "";
  document.getElementById("deptDesc").value = "";
}

function editDepartment(id) {
  const dept = departments.find(d => d.id === id);
  if (!dept) return;

  document.getElementById("deptName").value = dept.name;
  document.getElementById("deptDesc").value = dept.description;

  const deptForm = document.getElementById("deptForm");
  deptForm.dataset.editIndex = id;
  showDeptForm();
}

async function deleteDepartment(id) {
  if (!confirm("Are you sure you want to delete this department?")) return;

  try {
    await apiDelete(`/departments/${id}`);
    await loadData();
    renderDepartments();
    populateDepartmentDropdown();
  } catch (err) {
    alert(err.message);
  }
}

document.getElementById("deptFormFields").addEventListener("submit", async function(e) {
  e.preventDefault();

  const name = document.getElementById("deptName").value.trim();
  const description = document.getElementById("deptDesc").value.trim();
  const deptForm = document.getElementById("deptForm");
  const editId = deptForm.dataset.editIndex;

  if (!name || !description) {
    alert("Please fill in all required fields");
    return;
  }

  try {
    if (editId) {
      await apiPut(`/departments/${editId}`, { name, description });
    } else {
      await apiPost('/departments', { name, description });
    }
    await loadData();
    renderDepartments();
    populateDepartmentDropdown();
    hideDeptForm();
  } catch (err) {
    alert(err.message);
  }
});

function populateDepartmentDropdown() {
  const deptSelect = document.getElementById("empDept");
  if (!deptSelect) return;

  deptSelect.innerHTML = '<option value="">-- Select Department --</option>';
  departments.forEach(dept => {
    const option = document.createElement("option");
    option.value = dept.name;
    option.textContent = dept.name;
    deptSelect.appendChild(option);
  });
}

// ========================
// REQUESTS
// ========================

function addItemRow(name = "", qty = "") {
  const container = document.getElementById("itemsContainer");
  const div = document.createElement("div");
  div.classList.add("d-flex", "mb-2");
  div.innerHTML = `
    <input type="text" class="form-control me-2 item-name" placeholder="Item name" value="${name}" required>
    <input type="number" class="form-control me-2 item-qty" placeholder="Qty" min="1" value="${qty}" required>
    <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">×</button>
  `;
  container.appendChild(div);
}

function showRequestModal() {
  const modalEl = document.getElementById("newRequestModal");
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();
  if (document.getElementById("itemsContainer").children.length === 0) {
    addItemRow();
  }
}

function hideRequestModal() {
  const modalEl = document.getElementById("newRequestModal");
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.hide();
}

function renderRequestsTable() {
  const tbody = document.getElementById("requestTableBody");
  tbody.innerHTML = "";

  if (!currentUser) return;

  let filteredRequests;
  if (currentUser.role === "Admin") {
    filteredRequests = requests;
  } else {
    filteredRequests = requests.filter(req => req.employeeEmail === currentUser.email);
  }

  if (!filteredRequests || filteredRequests.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center">No requests</td></tr>`;
    return;
  }

  filteredRequests.forEach(req => {
    let itemsObj = [];
    try { itemsObj = JSON.parse(req.items); } catch {}

    const itemsFormatted = itemsObj.map(i => `${i.name} (x${i.qty})`).join("<br>");
    let badgeClass = "bg-warning";
    if (req.status === "Approved") badgeClass = "bg-success";
    if (req.status === "Rejected") badgeClass = "bg-danger";

    let actions = "";
    if (currentUser.role === "Admin") {
      actions = `
        <button class="btn btn-sm btn-success me-1" onclick="updateRequestStatus(${req.id}, 'Approved')">Approve</button>
        <button class="btn btn-sm btn-danger" onclick="updateRequestStatus(${req.id}, 'Rejected')">Reject</button>
      `;
    } else {
      actions = `<button class="btn btn-sm btn-danger" onclick="deleteRequest(${req.id})">Delete</button>`;
    }

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${req.employeeEmail}</td>
      <td>${req.type}</td>
      <td>${itemsFormatted}</td>
      <td>${req.date}</td>
      <td><span class="badge ${badgeClass}">${req.status}</span></td>
      <td>${actions}</td>
    `;
    tbody.appendChild(row);
  });
}

async function updateRequestStatus(id, newStatus) {
  if (currentUser.role !== "Admin") return;

  try {
    await apiPut(`/requests/${id}/status`, { status: newStatus });
    await loadData();
    renderRequestsTable();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteRequest(id) {
  if (!confirm("Are you sure you want to delete this request?")) return;
  if (currentUser.role === "Admin") return;

  try {
    await apiDelete(`/requests/${id}`);
    await loadData();
    renderRequestsTable();
  } catch (err) {
    alert(err.message);
  }
}