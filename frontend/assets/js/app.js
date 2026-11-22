const app = document.getElementById("app");
const API = "/api";

const session = {
  get token() { return localStorage.getItem("placement_token"); },
  get user() { return JSON.parse(localStorage.getItem("placement_user") || "null"); },
  set(token, user) {
    localStorage.setItem("placement_token", token);
    localStorage.setItem("placement_user", JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem("placement_token");
    localStorage.removeItem("placement_user");
  }
};

async function api(path, options = {}) {
  const headers = options.headers ? { ...options.headers } : {};
  if (!(options.body instanceof FormData)) headers["Content-Type"] = "application/json";
  if (session.token) headers.Authorization = `Bearer ${session.token}`;
  const response = await fetch(API + path, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Something went wrong");
  return data;
}

function toast(message, error = false) {
  const element = document.getElementById("toast");
  element.textContent = message;
  element.className = `toast show${error ? " error" : ""}`;
  setTimeout(() => element.className = "toast", 2600);
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[char]));
}

function route() {
  const hash = location.hash.replace("#", "") || "/";
  if (hash === "/") return renderHome();
  if (hash === "/login") return renderLogin();
  if (hash === "/register/student") return renderStudentRegister();
  if (hash === "/register/company") return renderCompanyRegister();
  if (!session.user) {
    location.hash = "/login";
    return;
  }
  if (hash === "/dashboard" || hash === "/") renderDashboard();
  else if (hash === "/profile") renderProfile();
  else if (hash === "/companies") renderCompanies();
  else if (hash === "/students") renderStudents();
  else if (hash === "/jobs") renderJobs();
  else if (hash === "/applications") renderApplications();
  else if (hash === "/placements") renderPlacements();
  else renderDashboard();
}

function renderHome() {
  app.innerHTML = `
    <div class="landing">
      <nav class="nav">
        <a class="brand" href="#/"><span class="brand-mark">P</span> PlacementHub</a>
        <div class="nav-links">
          <a href="#/jobs">Opportunities</a>
          <a href="#/register/company">For Companies</a>
          <a class="btn btn-secondary" href="#/login">Login</a>
          <a class="btn btn-primary" href="#/register/student">Student Registration</a>
        </div>
      </nav>
      <main class="hero">
        <div>
          <div class="eyebrow">MCA Placement Portal</div>
          <h1>Build your career. Connect with opportunity.</h1>
          <p>One professional platform for students, recruiters and placement administrators to manage the complete recruitment journey.</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="#/register/student">Register as Student</a>
            <a class="btn btn-secondary" href="#/register/company">Register your Company</a>
          </div>
        </div>
        <div class="hero-card">
          <div class="stat-preview">
            <div class="preview-box"><strong>240+</strong><span>Registered Students</span></div>
            <div class="preview-box"><strong>35+</strong><span>Hiring Partners</span></div>
            <div class="preview-box"><strong>120+</strong><span>Open Positions</span></div>
            <div class="preview-box"><strong>78%</strong><span>Placement Rate</span></div>
          </div>
        </div>
      </main>
    </div>`;
}

function renderLogin() {
  app.innerHTML = `
    <main class="auth-wrap">
      <form class="auth-card" id="loginForm">
        <a class="back-link" href="#/">← Back to Home</a>
        <h1>Welcome back</h1>
        <div class="field"><label>Email address</label><input type="email" name="email" required placeholder="you@example.com"></div>
        <div class="field"><label>Password</label><input type="password" name="password" required minlength="6" placeholder="Enter your password"></div>
        <button class="btn btn-primary auth-submit" type="submit">Sign In</button>
        <p class="auth-switch">New student? <a href="#/register/student">Create an account</a></p>
      </form>
    </main>`;
  document.getElementById("loginForm").onsubmit = async event => {
    event.preventDefault();
    const form = new FormData(event.target);
    try {
      const data = await api("/auth/login", { method:"POST", body:JSON.stringify(Object.fromEntries(form)) });
      session.set(data.token, data.user);
      location.hash = "/dashboard";
    } catch (error) { toast(error.message, true); }
  };
}

function renderStudentRegister() {
  app.innerHTML = `
    <main class="auth-wrap"><form class="auth-card wide" id="studentRegister">
      <a class="back-link" href="#/">← Back to Home</a><h1>Student Registration</h1>
      <div class="form-grid">
        ${textField("name","Full name","Required","Name")}
        ${textField("email","Email address","you@example.com","email")}
        ${textField("password","Password","Minimum 6 characters","password")}
        ${textField("rollNumber","Roll number","e.g. MCA2026001")}
        ${textField("course","Course","MCA")}
        ${textField("semester","Semester","3","number")}
        ${textField("phone","Phone number","+91 98765 43210","tel")}
        ${textField("cgpa","CGPA","0 - 10","number")}
        ${textField("skills","Skills","Java, SQL, React","text","full")}
      </div>
      <button class="btn btn-primary auth-submit" type="submit">Create Student Account</button>
      <p class="auth-switch">Already registered? <a href="#/login">Sign in</a></p>
    </form></main>`;
  document.getElementById("studentRegister").onsubmit = async event => {
    event.preventDefault();
    const form = new FormData(event.target);
    try {
      const data = await api("/auth/register/student", { method:"POST", body:JSON.stringify(Object.fromEntries(form)) });
      session.set(data.token, data.user);
      location.hash = "/dashboard";
    } catch (error) { toast(error.message, true); }
  };
}

function renderCompanyRegister() {
  app.innerHTML = `
    <main class="auth-wrap"><form class="auth-card wide" id="companyRegister">
      <a class="back-link" href="#/">← Back to Home</a><h1>Company Registration</h1>
      <div class="form-grid">
        ${textField("name","Contact person","Full name")}
        ${textField("email","Official email","company@example.com","email")}
        ${textField("password","Password","Minimum 6 characters","password")}
        ${textField("companyName","Company name","Company Pvt. Ltd.","text","full")}
        ${textField("industry","Industry","Information Technology")}
        ${textField("website","Website","https://example.com","url")}
        ${textField("phone","Phone","+91 98765 43210","tel")}
        ${textField("address","Address","City, State","text","full")}
        ${textField("description","Company description","Tell students about your company","textarea","full")}
      </div>
      <button class="btn btn-primary auth-submit" type="submit">Create Company Account</button>
      <p class="auth-switch">Already registered? <a href="#/login">Sign in</a></p>
    </form></main>`;
  document.getElementById("companyRegister").onsubmit = async event => {
    event.preventDefault();
    const form = new FormData(event.target);
    try {
      const data = await api("/auth/register/company", { method:"POST", body:JSON.stringify(Object.fromEntries(form)) });
      session.set(data.token, data.user);
      location.hash = "/dashboard";
    } catch (error) { toast(error.message, true); }
  };
}

function textField(name, label, placeholder = "", type = "text", span = "") {
  if (type === "textarea") return `<div class="field ${span}"><label>${label}</label><textarea name="${name}" rows="3" placeholder="${placeholder}"></textarea></div>`;
  return `<div class="field ${span}"><label>${label}</label><input name="${name}" type="${type}" placeholder="${placeholder}" ${["name","email","password","rollNumber","companyName"].includes(name) ? "required" : ""}></div>`;
}

function shell(title, content) {
  const user = session.user;
  const role = user.role;
  const links = role === "admin" ? [
    ["/dashboard","▦","Dashboard"], ["/students","👥","Students"], ["/companies","🏢","Companies"],
    ["/jobs","💼","Job Opportunities"], ["/applications","📝","Applications"], ["/placements","🎓","Placements"]
  ] : role === "company" ? [
    ["/dashboard","▦","Dashboard"], ["/profile","🏢","Company Profile"], ["/jobs","💼","Job Vacancies"], ["/applications","📝","Applications"]
  ] : [
    ["/dashboard","▦","Dashboard"], ["/profile","👤","My Profile"], ["/jobs","💼","Find Jobs"], ["/applications","📝","My Applications"], ["/placements","🎓","Placement Results"]
  ];
  app.innerHTML = `
    <div class="shell">
      <aside class="sidebar" id="sidebar">
        <a class="brand" href="#/dashboard"><span class="brand-mark">P</span> PlacementHub</a>
        <nav class="side-nav">${links.map(([route,icon,label]) =>
          `<a class="side-link ${location.hash === "#" + route ? "active" : ""}" href="#${route}"><span>${icon}</span>${label}</a>`
        ).join("")}</nav>
        <button class="side-link logout" id="logout">↪ Logout</button>
      </aside>
      <div class="main">
        <header class="topbar">
          <div style="display:flex;align-items:center;gap:8px"><button class="mobile-menu" id="menu">☰</button><h2>${title}</h2></div>
          <div class="profile-chip"><span>${escapeHTML(user.name)}</span><span class="avatar">${escapeHTML(user.name[0] || "U").toUpperCase()}</span></div>
        </header>
        <main class="content">${content}</main>
      </div>
    </div>`;
  document.getElementById("logout").onclick = () => { session.clear(); location.hash = "/"; };
  document.getElementById("menu").onclick = () => document.getElementById("sidebar").classList.toggle("open");
}

async function renderDashboard() {
  if (session.user.role === "admin") {
    try {
      const data = await api("/dashboard");
      const c = data.cards;
      shell("Dashboard", `
        <div class="cards">
          ${metric("👥","Registered Students",c.students)}
          ${metric("🏢","Companies",c.companies)}
          ${metric("💼","Job Opportunities",c.jobs)}
          ${metric("🎓","Placed Students",c.placed)}
          ${metric("⏳","Pending Applications",c.pending)}
        </div>
        <div class="section-head"><h3>Recent Applications</h3><a class="btn btn-secondary btn-sm" href="#/applications">View All</a></div>
        <div class="card table-wrap">${applicationTable(data.recentApplications)}</div>
      `);
    } catch (error) { shell("Dashboard", `<div class="card"><p>${escapeHTML(error.message)}</p></div>`); }
  } else if (session.user.role === "company") {
    shell("Company Dashboard", await companyDashboardHTML());
  } else {
    shell("Student Dashboard", await studentDashboardHTML());
  }
}

function metric(icon, label, value) {
  return `<div class="card metric"><div class="metric-top"><span>${label}</span><span class="metric-icon">${icon}</span></div><strong>${value}</strong></div>`;
}

async function studentDashboardHTML() {
  try {
    const [profile, jobs, applications] = await Promise.all([
      api("/students/me"), api("/jobs"), api("/applications/mine")
    ]);
    return `
      <div class="cards">
        ${metric("💼","Open Jobs",jobs.filter(j => j.status === "Open").length)}
        ${metric("📝","Applications",applications.length)}
        ${metric("🎓","Placement Status",profile.placementStatus === "Placed" ? "Placed" : "Seeking")}
      </div>
      <div class="section-head"><h3>Recommended Opportunities</h3><a class="btn btn-secondary btn-sm" href="#/jobs">Browse Jobs</a></div>
      ${jobGrid(jobs.filter(j => j.status === "Open").slice(0,6))}
    `;
  } catch (error) { return `<div class="card">${escapeHTML(error.message)}</div>`; }
}

async function companyDashboardHTML() {
  try {
    const [profile, jobs, applications] = await Promise.all([
      api("/companies/me"), api("/jobs/mine"), api("/applications")
    ]);
    return `
      <div class="cards">
        ${metric("💼","Posted Jobs",jobs.length)}
        ${metric("📝","Applications",applications.length)}
        ${metric("✅","Approved",applications.filter(a => a.status === "Approved").length)}
      </div>
      <div class="section-head"><h3>Recent Applications</h3><a class="btn btn-primary btn-sm" href="#/applications">Manage Applications</a></div>
      <div class="card table-wrap">${applicationTable(applications.slice(0,8))}</div>
    `;
  } catch (error) { return `<div class="card">${escapeHTML(error.message)}</div>`; }
}

async function renderProfile() {
  if (session.user.role === "student") {
    try {
      const p = await api("/students/me");
      shell("Student Profile", `
        <div class="card">
          <form id="profileForm" class="form-grid">
            ${textField("rollNumber","Roll Number",p.rollNumber,"text")}
            ${textField("course","Course",p.course)}
            ${textField("semester","Semester",p.semester,"number")}
            ${textField("phone","Phone",p.phone,"tel")}
            ${textField("cgpa","CGPA",p.cgpa,"number")}
            ${textField("address","Address",p.address || "","text","full")}
            ${textField("skills","Skills",(p.skills || []).join(", "), "text","full")}
            <div class="field full"><label>Resume</label>
              ${p.resume ? `<a class="back-link" href="${escapeHTML(p.resume)}" target="_blank">View uploaded resume</a>` : "<span>Not uploaded</span>"}
              <input type="file" id="resumeFile" accept=".pdf,.doc,.docx">
            </div>
            <div class="field full"><button class="btn btn-primary" type="submit">Save Profile</button></div>
          </form>
        </div>`);
      fillExistingValues(document.getElementById("profileForm"), p);
      document.getElementById("profileForm").onsubmit = async event => {
        event.preventDefault();
        try {
          const fd = new FormData(event.target);
          await api("/students/me", { method:"PUT", body:JSON.stringify(Object.fromEntries(fd)) });
          const file = document.getElementById("resumeFile").files[0];
          if (file) {
            const resumeData = new FormData();
            resumeData.append("resume", file);
            await api("/students/resume", { method:"POST", body:resumeData });
          }
          toast("Profile updated successfully");
          renderProfile();
        } catch (error) { toast(error.message, true); }
      };
    } catch (error) { shell("Student Profile", `<div class="card">${escapeHTML(error.message)}</div>`); }
  } else {
    try {
      const p = await api("/companies/me");
      shell("Company Profile", `
        <div class="card"><form id="companyProfile" class="form-grid">
          ${textField("companyName","Company Name",p.companyName)}
          ${textField("industry","Industry",p.industry)}
          ${textField("website","Website",p.website,"url")}
          ${textField("phone","Phone",p.phone,"tel")}
          ${textField("address","Address",p.address || "","text","full")}
          ${textField("description","Description",p.description || "","textarea","full")}
          <div class="field full"><button class="btn btn-primary" type="submit">Save Company Profile</button></div>
        </form></div>`);
      fillExistingValues(document.getElementById("companyProfile"), p);
      document.getElementById("companyProfile").onsubmit = async event => {
        event.preventDefault();
        try {
          await api("/companies/me", { method:"PUT", body:JSON.stringify(Object.fromEntries(new FormData(event.target))) });
          toast("Company profile updated");
          renderProfile();
        } catch (error) { toast(error.message, true); }
      };
    } catch (error) { shell("Company Profile", `<div class="card">${escapeHTML(error.message)}</div>`); }
  }
}

function fillExistingValues(form, data) {
  [...form.elements].forEach(element => {
    if (element.name && data[element.name] !== undefined && element.type !== "file") {
      element.value = data[element.name] ?? "";
    }
  });
}

async function renderCompanies() {
  if (session.user.role !== "admin") return renderDashboard();
  try {
    const companies = await api("/companies");
    shell("Company Management", `
      <div class="section-head"><h3>Registered Companies</h3><button class="btn btn-primary" id="addCompany">Add Company</button></div>
      <div class="card table-wrap"><table>
        <thead><tr><th>Company</th><th>Industry</th><th>Contact</th><th>Website</th><th>Actions</th></tr></thead>
        <tbody>${companies.map(c => `<tr>
          <td><strong>${escapeHTML(c.companyName)}</strong></td><td>${escapeHTML(c.industry || "-")}</td>
          <td>${escapeHTML(c.user?.email || "-")}</td><td>${c.website ? `<a class="back-link" href="${escapeHTML(c.website)}" target="_blank">Visit</a>` : "-"}</td>
          <td><button class="btn btn-danger btn-sm" data-delete-company="${c._id}">Delete</button></td>
        </tr>`).join("") || `<tr><td colspan="5" class="empty">No companies found</td></tr>`}</tbody>
      </table></div>`);
    document.getElementById("addCompany").onclick = () => openCompanyModal();
    document.querySelectorAll("[data-delete-company]").forEach(button => button.onclick = async () => {
      if (!confirm("Delete this company?")) return;
      try { await api("/companies/" + button.dataset.deleteCompany, { method:"DELETE" }); toast("Company deleted"); renderCompanies(); }
      catch (error) { toast(error.message, true); }
    });
  } catch (error) { shell("Company Management", `<div class="card">${escapeHTML(error.message)}</div>`); }
}

function openCompanyModal(company = null) {
  document.body.insertAdjacentHTML("beforeend", `
    <div class="modal-backdrop"><div class="modal"><div class="modal-head"><h3>Add Company</h3><button class="close">&times;</button></div>
      <form id="companyForm" class="form-grid">
        ${textField("companyName","Company Name","","text","full")}
        ${textField("email","Login Email","","email")}
        ${textField("password","Temporary Password","","password")}
        ${textField("industry","Industry")}
        ${textField("phone","Phone","","tel")}
        ${textField("website","Website","","url","full")}
        ${textField("address","Address","","text","full")}
        <div class="field full"><button class="btn btn-primary" type="submit">Create Company</button></div>
      </form>
    </div></div>`);
  const modal = document.querySelector(".modal-backdrop");
  modal.querySelector(".close").onclick = () => modal.remove();
  modal.onclick = event => { if (event.target === modal) modal.remove(); };
  document.getElementById("companyForm").onsubmit = async event => {
    event.preventDefault();
    try {
      await api("/companies", { method:"POST", body:JSON.stringify(Object.fromEntries(new FormData(event.target))) });
      modal.remove(); toast("Company created"); renderCompanies();
    } catch (error) { toast(error.message, true); }
  };
}

async function renderStudents() {
  if (session.user.role !== "admin") return renderDashboard();
  try {
    const students = await api("/students");
    shell("Student Management", `
      <div class="section-head"><h3>All Students</h3>
        <div class="toolbar"><input id="studentSearch" placeholder="Search roll or skill"><select id="studentStatus"><option value="">All statuses</option><option>Placed</option><option>Not Placed</option></select></div>
      </div>
      <div class="card table-wrap"><table><thead><tr><th>Student</th><th>Roll Number</th><th>CGPA</th><th>Skills</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>${students.map(s => `<tr><td><strong>${escapeHTML(s.user?.name || "-")}</strong><br><small>${escapeHTML(s.user?.email || "")}</small></td>
          <td>${escapeHTML(s.rollNumber)}</td><td>${s.cgpa ?? "-"}</td><td>${escapeHTML((s.skills || []).join(", ") || "-")}</td>
          <td><span class="badge ${s.placementStatus.replace(" ","")}">${escapeHTML(s.placementStatus)}</span></td>
          <td><button class="btn btn-danger btn-sm" data-delete-student="${s._id}">Delete</button></td></tr>`).join("") || `<tr><td colspan="6" class="empty">No students found</td></tr>`}</tbody></table></div>`);
    document.querySelectorAll("[data-delete-student]").forEach(button => button.onclick = async () => {
      if (!confirm("Delete this student?")) return;
      try { await api("/students/" + button.dataset.deleteStudent, { method:"DELETE" }); toast("Student deleted"); renderStudents(); }
      catch (error) { toast(error.message, true); }
    });
    const search = document.getElementById("studentSearch");
    const status = document.getElementById("studentStatus");
    const filterStudents = () => {
      const term = search.value.toLowerCase();
      const selected = status.value;
      document.querySelectorAll("tbody tr").forEach(row => {
        if (!row.dataset) return;
        const text = row.textContent.toLowerCase();
        const statusText = row.querySelector(".badge")?.textContent;
        row.style.display = text.includes(term) && (!selected || statusText === selected) ? "" : "none";
      });
    };
    search.oninput = filterStudents;
    status.onchange = filterStudents;
  } catch (error) { shell("Student Management", `<div class="card">${escapeHTML(error.message)}</div>`); }
}

async function renderJobs() {
  try {
    const canPost = ["admin","company"].includes(session.user.role);
    const jobs = await api(canPost && session.user.role === "company" ? "/jobs/mine" : "/jobs");
    shell("Job Opportunities", `
      <div class="section-head"><h3>${canPost ? "Job Vacancies" : "Available Jobs"}</h3>
        <div class="toolbar"><input id="jobSearch" placeholder="Search jobs"><select id="jobStatus"><option value="">All statuses</option><option>Open</option><option>Closed</option></select>
        ${canPost ? '<button class="btn btn-primary" id="addJob">Post Job</button>' : ""}</div>
      </div>${jobGrid(jobs)}`);
    if (canPost) document.getElementById("addJob").onclick = () => openJobModal();
    document.querySelectorAll("[data-apply-job]").forEach(button => button.onclick = () => applyToJob(button.dataset.applyJob));
    document.querySelectorAll("[data-edit-job]").forEach(button => button.onclick = () => openJobModal(jobs.find(j => j._id === button.dataset.editJob)));
    document.querySelectorAll("[data-delete-job]").forEach(button => button.onclick = async () => {
      if (!confirm("Delete this job?")) return;
      try { await api("/jobs/" + button.dataset.deleteJob, { method:"DELETE" }); toast("Job deleted"); renderJobs(); }
      catch (error) { toast(error.message, true); }
    });
    const search = document.getElementById("jobSearch");
    const status = document.getElementById("jobStatus");
    const filterJobs = () => {
      const term = search.value.toLowerCase();
      const selected = status.value;
      document.querySelectorAll(".job-card").forEach(card => {
        const badge = card.querySelector(".badge")?.textContent;
        card.style.display = card.textContent.toLowerCase().includes(term) &&
          (!selected || badge === selected) ? "" : "none";
      });
    };
    search.oninput = filterJobs;
    status.onchange = filterJobs;
  } catch (error) { shell("Job Opportunities", `<div class="card">${escapeHTML(error.message)}</div>`); }
}

function jobGrid(jobs) {
  if (!jobs.length) return `<div class="card empty">No job opportunities found</div>`;
  return `<div class="job-grid">${jobs.map(job => `
    <article class="card job-card">
      <span class="badge ${job.status === "Open" ? "Open" : "Closed"}">${escapeHTML(job.status)}</span>
      <h3>${escapeHTML(job.title)}</h3>
      <div class="job-meta"><span>${escapeHTML(job.company?.companyName || "Company")}</span><span>• ${escapeHTML(job.location)}</span><span>• ${escapeHTML(job.jobType)}</span></div>
      <p>${escapeHTML((job.description || "").slice(0,150))}${job.description?.length > 150 ? "..." : ""}</p>
      <div class="job-meta"><span>CGPA: ${job.requiredCgpa || 0}+</span><span>Vacancies: ${job.vacancies || 1}</span></div>
      <div class="job-actions">
        ${session.user.role === "student" ? `<button class="btn btn-primary" data-apply-job="${job._id}">Apply Now</button>` : ""}
        ${["admin","company"].includes(session.user.role) ? `<button class="btn btn-secondary btn-sm" data-edit-job="${job._id}">Edit</button><button class="btn btn-danger btn-sm" data-delete-job="${job._id}">Delete</button>` : ""}
      </div>
    </article>`).join("")}</div>`;
}

async function applyToJob(jobId) {
  document.body.insertAdjacentHTML("beforeend", `
    <div class="modal-backdrop"><div class="modal"><div class="modal-head"><h3>Submit Application</h3><button class="close">&times;</button></div>
      <form id="applyForm">
        <div class="field"><label>Cover Letter</label><textarea name="coverLetter" rows="6" placeholder="Explain why you are a good fit..." required></textarea></div>
        <button class="btn btn-primary" type="submit">Submit Application</button>
      </form></div></div>`);
  const modal = document.querySelector(".modal-backdrop");
  modal.querySelector(".close").onclick = () => modal.remove();
  modal.onclick = event => { if (event.target === modal) modal.remove(); };
  document.getElementById("applyForm").onsubmit = async event => {
    event.preventDefault();
    try {
      await api("/applications/jobs/" + jobId, { method:"POST", body:JSON.stringify(Object.fromEntries(new FormData(event.target))) });
      modal.remove(); toast("Application submitted");
    } catch (error) { toast(error.message, true); }
  };
}

async function openJobModal(job = null) {
  let companyOptions = "";
  if (session.user.role === "admin") {
    try {
      const companies = await api("/companies");
      companyOptions = `<div class="field full"><label>Company</label><select name="company" required>${companies.map(c => `<option value="${c._id}" ${job?.company?._id === c._id ? "selected" : ""}>${escapeHTML(c.companyName)}</option>`).join("")}</select></div>`;
    } catch {}
  }
  document.body.insertAdjacentHTML("beforeend", `
    <div class="modal-backdrop"><div class="modal"><div class="modal-head"><h3>${job ? "Edit Job" : "Post Job"}</h3><button class="close">&times;</button></div>
      <form id="jobForm" class="form-grid">
        ${companyOptions}
        ${textField("title","Job Title",job?.title || "", "text","full")}
        ${textField("location","Location",job?.location || "")}
        ${textField("salary","Salary Package",job?.salary || "")}
        ${textField("requiredCgpa","Minimum CGPA",job?.requiredCgpa || 0,"number")}
        ${textField("vacancies","Vacancies",job?.vacancies || 1,"number")}
        ${textField("requiredSkills","Required Skills",(job?.requiredSkills || []).join(", "), "text","full")}
        <div class="field"><label>Job Type</label><select name="jobType"><option ${job?.jobType === "Full-time" ? "selected" : ""}>Full-time</option><option ${job?.jobType === "Internship" ? "selected" : ""}>Internship</option><option ${job?.jobType === "Contract" ? "selected" : ""}>Contract</option></select></div>
        <div class="field"><label>Status</label><select name="status"><option ${job?.status === "Open" ? "selected" : ""}>Open</option><option ${job?.status === "Closed" ? "selected" : ""}>Closed</option></select></div>
        <div class="field full"><label>Description</label><textarea name="description" rows="5" required>${escapeHTML(job?.description || "")}</textarea></div>
        <div class="field full"><button class="btn btn-primary" type="submit">${job ? "Save Changes" : "Post Job"}</button></div>
      </form>
    </div></div>`);
  const modal = document.querySelector(".modal-backdrop");
  modal.querySelector(".close").onclick = () => modal.remove();
  modal.onclick = event => { if (event.target === modal) modal.remove(); };
  document.getElementById("jobForm").onsubmit = async event => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.target));
    body.requiredCgpa = Number(body.requiredCgpa);
    body.vacancies = Number(body.vacancies);
    try {
      await api(job ? "/jobs/" + job._id : "/jobs", { method:job ? "PUT" : "POST", body:JSON.stringify(body) });
      modal.remove(); toast(job ? "Job updated" : "Job posted"); renderJobs();
    } catch (error) { toast(error.message, true); }
  };
}

async function renderApplications() {
  if (session.user.role === "student") {
    try {
      const applications = await api("/applications/mine");
      shell("My Applications", `
        <div class="section-head"><h3>Application Tracking</h3></div>
        <div class="card table-wrap">${applicationTable(applications, true)}</div>`);
    } catch (error) { shell("My Applications", `<div class="card">${escapeHTML(error.message)}</div>`); }
  } else {
    try {
      const applications = await api("/applications");
      shell("Applications", `
        <div class="section-head"><h3>Student Applications</h3>
          <div class="toolbar"><select id="applicationFilter"><option value="">All statuses</option><option>Applied</option><option>Under Review</option><option>Shortlisted</option><option>Approved</option><option>Rejected</option></select></div>
        </div>
        <div class="card table-wrap">${applicationTable(applications, false, true)}</div>`);
      document.getElementById("applicationFilter").onchange = event => {
        const value = event.target.value;
        document.querySelectorAll("#applicationRows tr[data-status]").forEach(row => {
          row.style.display = !value || row.dataset.status === value ? "" : "none";
        });
      };
      document.querySelectorAll("[data-status-app]").forEach(select => select.onchange = async () => {
        try {
          await api("/applications/" + select.dataset.statusApp + "/status", { method:"PUT", body:JSON.stringify({ status:select.value }) });
          toast("Application status updated"); renderApplications();
        } catch (error) { toast(error.message, true); }
      });
    } catch (error) { shell("Applications", `<div class="card">${escapeHTML(error.message)}</div>`); }
  }
}

function applicationTable(applications, studentView = false, manageView = false) {
  if (!applications.length) return `<div class="empty">No applications found</div>`;
  return `<table><thead><tr><th>${studentView ? "Job" : "Student"}</th><th>${studentView ? "Company" : "Job"}</th><th>Applied On</th><th>Status</th>${manageView ? "<th>Update</th>" : ""}</tr></thead>
    <tbody id="${manageView ? "applicationRows" : ""}">${applications.map(app => {
      const studentName = app.student?.user?.name || app.student?.rollNumber || "Student";
      const jobTitle = app.job?.title || "Job";
      const companyName = app.job?.company?.companyName || "-";
      const statusClass = app.status.replace(" ","");
      return `<tr data-status="${escapeHTML(app.status)}">
        <td><strong>${escapeHTML(studentView ? jobTitle : studentName)}</strong>${!studentView ? `<br><small>${escapeHTML(app.student?.rollNumber || "")}</small>` : ""}</td>
        <td>${escapeHTML(studentView ? companyName : jobTitle)}</td>
        <td>${new Date(app.createdAt).toLocaleDateString()}</td>
        <td><span class="badge ${statusClass}">${escapeHTML(app.status)}</span></td>
        ${manageView ? `<td><select class="btn btn-secondary btn-sm" data-status-app="${app._id}">${["Applied","Under Review","Shortlisted","Approved","Rejected"].map(s => `<option ${app.status === s ? "selected" : ""}>${s}</option>`).join("")}</select></td>` : ""}
      </tr>`;
    }).join("")}</tbody></table>`;
}

async function renderPlacements() {
  if (session.user.role !== "admin") {
    try {
      const placements = await api("/placements");
      shell("Placement Results", `
        <div class="section-head"><h3>Placement Records</h3></div>
        <div class="card table-wrap">${placementTable(placements, false)}</div>`);
    } catch (error) { shell("Placement Results", `<div class="card">${escapeHTML(error.message)}</div>`); }
    return;
  }
  try {
    const [placements, students, companies, jobs] = await Promise.all([
      api("/placements"), api("/students"), api("/companies"), api("/jobs")
    ]);
    shell("Placement Management", `
      <div class="section-head"><h3>Placement Records</h3><button class="btn btn-primary" id="addPlacement">Add Placement</button></div>
      <div class="card table-wrap">${placementTable(placements, true)}</div>`);
    document.getElementById("addPlacement").onclick = () => openPlacementModal(students, companies, jobs);
    document.querySelectorAll("[data-delete-placement]").forEach(button => button.onclick = async () => {
      if (!confirm("Delete this placement record?")) return;
      try { await api("/placements/" + button.dataset.deletePlacement, { method:"DELETE" }); toast("Placement deleted"); renderPlacements(); }
      catch (error) { toast(error.message, true); }
    });
  } catch (error) { shell("Placement Management", `<div class="card">${escapeHTML(error.message)}</div>`); }
}

function placementTable(placements, manage) {
  if (!placements.length) return `<div class="empty">No placement records found</div>`;
  return `<table><thead><tr><th>Student</th><th>Company</th><th>Job</th><th>Package</th><th>Offer Date</th><th>Status</th>${manage ? "<th>Action</th>" : ""}</tr></thead>
    <tbody>${placements.map(p => `<tr>
      <td><strong>${escapeHTML(p.student?.user?.name || p.student?.rollNumber || "-")}</strong></td>
      <td>${escapeHTML(p.company?.companyName || "-")}</td><td>${escapeHTML(p.job?.title || "-")}</td>
      <td>${p.package ? p.package + " LPA" : "-"}</td><td>${new Date(p.offerDate).toLocaleDateString()}</td>
      <td><span class="badge ${escapeHTML(p.status)}">${escapeHTML(p.status)}</span></td>
      ${manage ? `<td><button class="btn btn-danger btn-sm" data-delete-placement="${p._id}">Delete</button></td>` : ""}
    </tr>`).join("")}</tbody></table>`;
}

function openPlacementModal(students, companies, jobs) {
  document.body.insertAdjacentHTML("beforeend", `
    <div class="modal-backdrop"><div class="modal"><div class="modal-head"><h3>Add Placement Record</h3><button class="close">&times;</button></div>
      <form id="placementForm" class="form-grid">
        <div class="field full"><label>Student</label><select name="student" required>${students.map(s => `<option value="${s._id}">${escapeHTML(s.user?.name || s.rollNumber)} - ${escapeHTML(s.rollNumber)}</option>`).join("")}</select></div>
        <div class="field"><label>Company</label><select name="company" required>${companies.map(c => `<option value="${c._id}">${escapeHTML(c.companyName)}</option>`).join("")}</select></div>
        <div class="field"><label>Job</label><select name="job" required>${jobs.map(j => `<option value="${j._id}">${escapeHTML(j.title)}</option>`).join("")}</select></div>
        ${textField("package","Package (LPA)","","number")}
        ${textField("offerDate","Offer Date","","date")}
        <div class="field"><label>Status</label><select name="status"><option>Offered</option><option>Joined</option><option>Declined</option></select></div>
        <div class="field full"><button class="btn btn-primary" type="submit">Save Placement</button></div>
      </form>
    </div></div>`);
  const modal = document.querySelector(".modal-backdrop");
  modal.querySelector(".close").onclick = () => modal.remove();
  modal.onclick = event => { if (event.target === modal) modal.remove(); };
  document.getElementById("placementForm").onsubmit = async event => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.target));
    body.package = Number(body.package);
    try {
      await api("/placements", { method:"POST", body:JSON.stringify(body) });
      modal.remove(); toast("Placement record added"); renderPlacements();
    } catch (error) { toast(error.message, true); }
  };
  setTimeout(() => {
    document.querySelectorAll("[data-delete-placement]").forEach(button => button.onclick = async () => {
      if (!confirm("Delete this placement record?")) return;
      try { await api("/placements/" + button.dataset.deletePlacement, { method:"DELETE" }); toast("Placement deleted"); renderPlacements(); }
      catch (error) { toast(error.message, true); }
    });
  });
}

window.addEventListener("hashchange", route);
if (!location.hash) location.hash = "/";
route();
