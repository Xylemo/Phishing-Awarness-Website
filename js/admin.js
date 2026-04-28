const root = document.getElementById("admin-root");

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderDenied(reason) {
  root.innerHTML = `
    <header class="dashboard-header">
      <p class="eyebrow">Company</p>
      <h1>${escapeHtml(reason.title)}</h1>
      <p class="dashboard-lede">${escapeHtml(reason.body)}</p>
      <a class="hero-demo-button" href="${escapeHtml(reason.href)}">${escapeHtml(reason.cta)}</a>
    </header>
  `;
}

function fmtNum(n) {
  return new Intl.NumberFormat("en-US").format(n || 0);
}

function fmtPct(p) {
  if (p == null) return "—";
  return `${Math.round(p * 100)}%`;
}

function fmtTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso.replace(" ", "T") + "Z");
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function initials(name, email) {
  const src = (name || email || "?").trim();
  return src
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join("");
}

function renderMembers(data) {
  const isAdmin = data.viewer.role === "admin";
  const members = (data.members || []).filter((m) => m.role !== "admin");

  const totalCourses =
    (window.PhishyCourses && window.PhishyCourses.catalog && window.PhishyCourses.catalog.length) || 0;

  const memberRows = members
    .map((m) => {
      const isSelf = m.id === data.viewer.id;
      const done = m.courses_completed || 0;
      const completionPct = totalCourses > 0 ? Math.round((done / totalCourses) * 100) : 0;
      const removeBtn =
        isAdmin && !isSelf
          ? `<button class="catalog-btn catalog-btn-outline" data-action="remove" data-user-id="${m.id}" data-user-name="${escapeHtml(m.name || m.email)}">Remove</button>`
          : "";
      return `
        <article class="company-member" data-user-id="${m.id}">
          <header class="company-member-head">
            <div class="company-member-avatar">${escapeHtml(initials(m.name, m.email))}</div>
            <div class="company-member-id">
              <h3>${escapeHtml(m.name || "(no name)")}${isSelf ? ' <span class="company-self-tag">you</span>' : ""}</h3>
              <p>${escapeHtml(m.email)}</p>
            </div>
            <span class="course-badge ${m.role === "admin" ? "course-badge-premium" : "course-badge-assigned"}">${m.role === "admin" ? "Admin" : "Employee"}</span>
          </header>
          <div class="company-member-stats">
            <div><span class="company-stat-value">${fmtNum(done)}${totalCourses ? ` / ${fmtNum(totalCourses)}` : ""}</span><span class="company-stat-label">courses done</span></div>
            <div><span class="company-stat-value">${fmtNum(m.course_attempts)}</span><span class="company-stat-label">attempts</span></div>
            <div><span class="company-stat-value">${fmtPct(m.avg_pct)}</span><span class="company-stat-label">avg score</span></div>
          </div>
          <div class="company-member-progress">
            <div class="admin-progress">
              <div class="admin-progress-fill" style="width: ${completionPct}%;"></div>
            </div>
            <span class="company-member-progress-label">
              ${totalCourses === 0 ? "" : `${completionPct}% of training`} ·
              last activity ${fmtTime(m.last_completed_at)}
            </span>
          </div>
          ${removeBtn ? `<footer class="company-member-foot">${removeBtn}</footer>` : ""}
        </article>
      `;
    })
    .join("");

  const addForm = isAdmin
    ? `
      <section class="admin-panel">
        <header class="admin-panel-head">
          <div>
            <h2>Add a team member</h2>
            <p>Create an account in <strong>${escapeHtml(data.company ? data.company.name : "your company")}</strong>. They sign in with the email and password you set.</p>
          </div>
        </header>
        <form id="company-add-form" class="company-add-form">
          <label>Name<input name="name" required placeholder="Full name" /></label>
          <label>Email<input name="email" type="email" required placeholder="employee@example.com" autocomplete="off" /></label>
          <label>Password<input name="password" required minlength="4" placeholder="Initial password" autocomplete="new-password" /></label>
          <label>Role
            <select name="role">
              <option value="user">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <button type="submit" class="catalog-btn">Add member</button>
          <p class="admin-form-error" id="company-add-error" hidden></p>
        </form>
      </section>`
    : "";

  const totalAttempts = members.reduce((acc, m) => acc + (m.course_attempts || 0), 0);
  const totalDone = members.reduce((acc, m) => acc + (m.courses_completed || 0), 0);
  const possible = members.length * totalCourses;
  const overallPct = possible > 0 ? Math.round((totalDone / possible) * 100) : 0;

  return `
    <section class="admin-kpi-grid">
      <div class="admin-kpi">
        <span class="admin-kpi-label">Members</span>
        <span class="admin-kpi-value">${fmtNum(members.length)}</span>
        <span class="admin-kpi-sub">in ${escapeHtml(data.company ? data.company.name : "your company")}</span>
      </div>
      <div class="admin-kpi">
        <span class="admin-kpi-label">Courses completed</span>
        <span class="admin-kpi-value">${fmtNum(totalDone)}${possible ? ` / ${fmtNum(possible)}` : ""}</span>
        <span class="admin-kpi-sub">${overallPct}% of training across the team</span>
      </div>
      <div class="admin-kpi">
        <span class="admin-kpi-label">Total attempts</span>
        <span class="admin-kpi-value">${fmtNum(totalAttempts)}</span>
        <span class="admin-kpi-sub">retakes count toward this total</span>
      </div>
    </section>

    <section class="admin-panel">
      <header class="admin-panel-head">
        <div>
          <h2>Members</h2>
          <p>Progress across your company.</p>
        </div>
      </header>
      <div class="company-member-grid">${memberRows || `<p class="admin-empty-state">No members yet.</p>`}</div>
    </section>

    ${addForm}
  `;
}

async function render() {
  if (!window.Phishy) return;
  const user = window.Phishy.auth.getCurrentUser();
  if (!user) {
    renderDenied({
      title: "Sign in required",
      body: "The company panel is for company members. Sign in to continue.",
      href: "../login/",
      cta: "Go to sign in",
    });
    return;
  }

  root.innerHTML = `
    <header class="admin-page-hero">
      <div class="admin-page-hero-text">
        <p class="eyebrow">Company panel</p>
        <h1 id="company-title">${escapeHtml(user.companyName || "Your company")}</h1>
        <p class="dashboard-lede">
          Signed in as ${escapeHtml(user.name || user.email)} &middot; ${escapeHtml(user.email)}
        </p>
      </div>
      <div class="admin-page-hero-actions">
        <a class="catalog-btn catalog-btn-outline" href="../dashboard/">My dashboard</a>
        <button class="catalog-btn catalog-btn-outline" id="company-refresh">Refresh</button>
        <button class="catalog-btn catalog-btn-outline" id="company-signout">Sign out</button>
      </div>
    </header>
    <div id="company-body">
      <p class="dashboard-loading">Loading company…</p>
    </div>
  `;

  document.getElementById("company-refresh").addEventListener("click", render);
  document.getElementById("company-signout").addEventListener("click", async () => {
    await window.Phishy.auth.signOut();
    window.location.href = "../";
  });

  const body = document.getElementById("company-body");
  let data;
  try {
    data = await window.Phishy.company.overview();
  } catch (err) {
    body.innerHTML = `<p class="admin-form-error">Couldn't load the company: ${escapeHtml(err.message || "unknown error")}</p>`;
    return;
  }

  if (data.company) {
    document.getElementById("company-title").textContent = data.company.name;
  }

  body.innerHTML = renderMembers(data);
  bindActions();
}

function bindActions() {
  document.querySelectorAll('[data-action="remove"]').forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.userId;
      const name = btn.dataset.userName;
      if (!confirm(`Remove ${name} from your company? This deletes their account and progress.`)) return;
      btn.disabled = true;
      try {
        await window.Phishy.company.removeUser(id);
        render();
      } catch (err) {
        alert("Couldn't remove: " + (err.message || "unknown"));
        btn.disabled = false;
      }
    });
  });

  const addForm = document.getElementById("company-add-form");
  const addError = document.getElementById("company-add-error");
  if (addForm) {
    addForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (addError) addError.hidden = true;
      const submitBtn = addForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      try {
        await window.Phishy.company.addUser({
          name: addForm.elements.name.value.trim(),
          email: addForm.elements.email.value.trim(),
          password: addForm.elements.password.value,
          role: addForm.elements.role.value,
        });
        render();
      } catch (err) {
        if (addError) {
          const msg = err.message === "email_taken"
            ? "That email is already in use."
            : "Couldn't add member: " + (err.message || "unknown");
          addError.textContent = msg;
          addError.hidden = false;
        }
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
}

if (root) {
  if (window.Phishy) {
    window.Phishy.ready().then(render);
  } else {
    render();
  }
}
