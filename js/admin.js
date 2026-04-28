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
      <p class="eyebrow">Admin</p>
      <h1>${escapeHtml(reason.title)}</h1>
      <p class="dashboard-lede">${escapeHtml(reason.body)}</p>
      <a class="hero-demo-button" href="${escapeHtml(reason.href)}">${escapeHtml(reason.cta)}</a>
    </header>
  `;
}

function initials(name) {
  return (name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0].toUpperCase())
    .join("");
}

let activeTab = "team";

function render() {
  if (!window.Phishy) return;
  const user = window.Phishy.auth.getCurrentUser();
  if (!user) {
    renderDenied({
      title: "Sign in required",
      body: "The admin panel is for business owners. Sign in with an admin account to continue.",
      href: "../login/",
      cta: "Go to sign in"
    });
    return;
  }
  if (user.role !== "admin") {
    renderDenied({
      title: "Admins only",
      body: "Your account doesn't have admin access. Visit your employee dashboard instead.",
      href: "../dashboard/",
      cta: "Open dashboard"
    });
    return;
  }

  const business = window.Phishy.store.getBusiness(user.businessId);
  const employees = window.Phishy.store
    .getUsersInBusiness(user.businessId)
    .filter(u => u.role === "employee");
  const courses = window.Phishy.store.getCourses();

  let totalAssignments = 0;
  let totalCompleted = 0;
  employees.forEach(emp => {
    const a = window.Phishy.store.getAssignments(emp.id);
    totalAssignments += a.length;
    a.forEach(asg => {
      if (window.Phishy.store.getProgress(emp.id, asg.courseId)) totalCompleted += 1;
    });
  });
  const completionRate = totalAssignments > 0 ? Math.round((totalCompleted / totalAssignments) * 100) : 0;

  const peopleCards = employees.map(emp => {
    const assignments = window.Phishy.store.getAssignments(emp.id);
    const completed = assignments.filter(a =>
      window.Phishy.store.getProgress(emp.id, a.courseId)
    ).length;
    const empPercent = assignments.length > 0 ? Math.round((completed / assignments.length) * 100) : 0;
    const statusLabel = assignments.length === 0
      ? "No assignments"
      : completed === assignments.length
        ? "All complete"
        : `${completed} of ${assignments.length} done`;
    const statusClass = assignments.length === 0
      ? "course-badge-premium"
      : completed === assignments.length
        ? "course-badge-done"
        : "course-badge-assigned";

    return `
      <article class="admin-person" data-user-id="${escapeHtml(emp.id)}">
        <header class="admin-person-head">
          <div class="article-avatar admin-person-avatar">${escapeHtml(initials(emp.name))}</div>
          <div class="admin-person-id">
            <h3>${escapeHtml(emp.name)}</h3>
            <p>${escapeHtml(emp.email)}</p>
          </div>
          <span class="course-badge ${statusClass}">${escapeHtml(statusLabel)}</span>
        </header>
        <div class="admin-person-progress">
          <div class="admin-progress">
            <div class="admin-progress-fill" style="width: ${empPercent}%;"></div>
          </div>
          <span class="admin-person-progress-label">${empPercent}%</span>
        </div>
        <footer class="admin-person-foot">
          <button class="catalog-btn catalog-btn-outline" data-action="manage">Manage assignments</button>
          <button class="catalog-btn catalog-btn-danger" data-action="remove">Remove</button>
        </footer>
      </article>
    `;
  }).join("");

  const courseCards = courses.map(c => `
    <article class="admin-course course-card-tier-${c.isFree ? "free" : "premium"}" data-course-id="${escapeHtml(c.id)}">
      <div class="course-card-stripe"></div>
      <div class="admin-course-body">
        <div class="admin-course-head">
          <div class="course-card-icon">${escapeHtml(initials(c.title))}</div>
          <span class="course-badge ${c.isFree ? "course-badge-free" : "course-badge-premium"}">${c.isFree ? "Free" : "Premium"}</span>
        </div>
        <h3>${escapeHtml(c.title)}</h3>
        <p>${escapeHtml(c.description)}</p>
      </div>
      <footer class="admin-course-foot">
        <span class="course-meta">${c.durationMin} min &middot; ${escapeHtml(c.kind)}</span>
        <button class="catalog-btn catalog-btn-outline" data-action="edit-course">Edit course</button>
      </footer>
    </article>
  `).join("");

  root.innerHTML = `
    <header class="admin-page-hero">
      <div class="admin-page-hero-text">
        <p class="eyebrow">Admin panel</p>
        <h1>${escapeHtml(business ? business.name : "Your business")}</h1>
        <p class="dashboard-lede">
          Signed in as ${escapeHtml(user.name)} &middot; ${escapeHtml(user.email)}
        </p>
      </div>
      <div class="admin-page-hero-actions">
        <a class="catalog-btn catalog-btn-outline" href="../simulations/">View as employee</a>
        <button class="catalog-btn catalog-btn-outline" id="admin-signout">Sign out</button>
      </div>
    </header>

    <section class="admin-kpi-grid">
      <div class="admin-kpi">
        <span class="admin-kpi-label">Employees</span>
        <span class="admin-kpi-value">${employees.length}</span>
        <span class="admin-kpi-sub">on ${escapeHtml(business ? business.name : "your team")}</span>
      </div>
      <div class="admin-kpi">
        <span class="admin-kpi-label">Active assignments</span>
        <span class="admin-kpi-value">${totalAssignments}</span>
        <span class="admin-kpi-sub">across all employees</span>
      </div>
      <div class="admin-kpi">
        <span class="admin-kpi-label">Completed</span>
        <span class="admin-kpi-value">${totalCompleted}</span>
        <span class="admin-kpi-sub">${totalAssignments - totalCompleted} still in progress</span>
      </div>
      <div class="admin-kpi admin-kpi-bar">
        <span class="admin-kpi-label">Completion rate</span>
        <span class="admin-kpi-value">${completionRate}%</span>
        <div class="admin-progress">
          <div class="admin-progress-fill" style="width: ${completionRate}%;"></div>
        </div>
      </div>
    </section>

    <nav class="admin-tabs" role="tablist">
      <button class="admin-tab ${activeTab === "team" ? "is-active" : ""}" data-tab="team" role="tab">
        Team members
        <span class="admin-tab-count">${employees.length}</span>
      </button>
      <button class="admin-tab ${activeTab === "courses" ? "is-active" : ""}" data-tab="courses" role="tab">
        Course library
        <span class="admin-tab-count">${courses.length}</span>
      </button>
    </nav>

    <section class="admin-panel" data-panel="team" ${activeTab !== "team" ? "hidden" : ""}>
      <header class="admin-panel-head">
        <div>
          <h2>Team members</h2>
          <p>Add and remove employee accounts. Employees sign in with the email and password you set.</p>
        </div>
        <button class="catalog-btn" id="admin-toggle-add">+ Add employee</button>
      </header>

      <form class="admin-add-form" id="admin-add-user" hidden>
        <div class="admin-form-row">
          <label>Name<input name="name" required placeholder="Full name" /></label>
          <label>Email<input name="email" type="email" required placeholder="employee@example.com" /></label>
          <label>Password<input name="password" required minlength="4" placeholder="Initial password" /></label>
          <button type="submit" class="catalog-btn">Save</button>
          <button type="button" class="catalog-btn catalog-btn-outline" id="admin-cancel-add">Cancel</button>
        </div>
        <p class="admin-form-error" id="admin-add-error" hidden></p>
      </form>

      <div class="admin-people-grid">
        ${peopleCards || `<p class="admin-empty-state">No employees on the team yet. Click <strong>+ Add employee</strong> to invite your first one.</p>`}
      </div>
    </section>

    <section class="admin-panel" data-panel="courses" ${activeTab !== "courses" ? "hidden" : ""}>
      <header class="admin-panel-head">
        <div>
          <h2>Course library</h2>
          <p>Edit titles, descriptions, durations, and which courses are part of the free preview.</p>
        </div>
      </header>
      <div class="admin-course-grid">${courseCards}</div>
    </section>

    <div class="admin-modal" id="admin-modal" hidden>
      <div class="admin-modal-card" id="admin-modal-card"></div>
    </div>
  `;

  bindEvents();
}

function bindEvents() {
  document.querySelectorAll(".admin-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      activeTab = tab.getAttribute("data-tab");
      document.querySelectorAll(".admin-tab").forEach(t => {
        t.classList.toggle("is-active", t.getAttribute("data-tab") === activeTab);
      });
      document.querySelectorAll(".admin-panel").forEach(panel => {
        panel.hidden = panel.getAttribute("data-panel") !== activeTab;
      });
    });
  });

  const addForm = document.getElementById("admin-add-user");
  const toggleBtn = document.getElementById("admin-toggle-add");
  const cancelBtn = document.getElementById("admin-cancel-add");
  const addError = document.getElementById("admin-add-error");

  if (toggleBtn && addForm) {
    toggleBtn.addEventListener("click", () => {
      addForm.hidden = false;
      const firstInput = addForm.querySelector("input");
      if (firstInput) firstInput.focus();
    });
  }
  if (cancelBtn && addForm) {
    cancelBtn.addEventListener("click", () => {
      addForm.hidden = true;
      addForm.reset();
      if (addError) addError.hidden = true;
    });
  }
  if (addForm) {
    addForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (addError) addError.hidden = true;
      const submitBtn = addForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      try {
        await window.Phishy.store.addUser({
          name: addForm.elements.name.value.trim(),
          email: addForm.elements.email.value.trim(),
          password: addForm.elements.password.value,
          role: "employee"
        });
        render();
      } catch (err) {
        if (addError) {
          addError.textContent = err.message;
          addError.hidden = false;
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  document.querySelectorAll('.admin-person [data-action="manage"]').forEach(btn => {
    btn.addEventListener("click", () => {
      const userId = btn.closest(".admin-person").getAttribute("data-user-id");
      openAssignments(userId);
    });
  });

  document.querySelectorAll('.admin-person [data-action="remove"]').forEach(btn => {
    btn.addEventListener("click", async () => {
      const userId = btn.closest(".admin-person").getAttribute("data-user-id");
      const target = window.Phishy.store.getUser(userId);
      if (target && confirm(`Remove ${target.name} from your team? Their assignments and progress will be deleted.`)) {
        btn.disabled = true;
        try { await window.Phishy.store.deleteUser(userId); }
        finally { render(); }
      }
    });
  });

  document.querySelectorAll('.admin-course [data-action="edit-course"]').forEach(btn => {
    btn.addEventListener("click", () => {
      const courseId = btn.closest(".admin-course").getAttribute("data-course-id");
      openCourseEditor(courseId);
    });
  });

  const signOut = document.getElementById("admin-signout");
  if (signOut) {
    signOut.addEventListener("click", async () => {
      signOut.disabled = true;
      await window.Phishy.auth.signOut();
      window.location.href = "../";
    });
  }
}

function showModal(html) {
  const modal = document.getElementById("admin-modal");
  const card = document.getElementById("admin-modal-card");
  if (!modal || !card) return;
  card.innerHTML = html;
  modal.hidden = false;
  modal.addEventListener("click", (e) => {
    if (e.target === modal) hideModal();
  });
}

function hideModal() {
  const modal = document.getElementById("admin-modal");
  if (modal) modal.hidden = true;
}

function openAssignments(userId) {
  const user = window.Phishy.store.getUser(userId);
  if (!user) return;
  const courses = window.Phishy.store.getCourses();
  const checks = courses.map(c => {
    const assigned = window.Phishy.store.isAssigned(userId, c.id);
    const done = !!window.Phishy.store.getProgress(userId, c.id);
    return `
      <label class="admin-check">
        <input type="checkbox" data-course-id="${escapeHtml(c.id)}" ${assigned ? "checked" : ""} />
        <span class="admin-check-body">
          <span class="admin-check-title">${escapeHtml(c.title)}</span>
          <span class="admin-check-meta">${c.durationMin} min &middot; ${c.isFree ? "Free" : "Premium"}${done ? " &middot; ✓ Completed" : ""}</span>
        </span>
      </label>
    `;
  }).join("");

  showModal(`
    <header class="admin-modal-head">
      <h3>Assignments for ${escapeHtml(user.name)}</h3>
      <button class="admin-modal-close" type="button" aria-label="Close" data-close>&times;</button>
    </header>
    <div class="admin-checks">${checks}</div>
    <footer class="admin-modal-foot">
      <button class="catalog-btn catalog-btn-outline" type="button" data-close>Cancel</button>
      <button class="catalog-btn" type="button" id="admin-save-assignments">Save changes</button>
    </footer>
  `);

  document.querySelectorAll("#admin-modal [data-close]").forEach(b => b.addEventListener("click", hideModal));

  const saveBtn = document.getElementById("admin-save-assignments");
  saveBtn.addEventListener("click", async () => {
    saveBtn.disabled = true;
    const courseIds = Array.from(
      document.querySelectorAll(".admin-checks input[type=checkbox]:checked")
    ).map((i) => i.getAttribute("data-course-id"));
    try {
      await window.Phishy.store.setAssignments(userId, courseIds);
    } finally {
      hideModal();
      render();
    }
  });
}

function openCourseEditor(courseId) {
  const course = window.Phishy.store.getCourse(courseId);
  if (!course) return;

  showModal(`
    <header class="admin-modal-head">
      <h3>Edit course</h3>
      <button class="admin-modal-close" type="button" aria-label="Close" data-close>&times;</button>
    </header>
    <form class="admin-form admin-form-stacked" id="course-edit-form">
      <label>Title<input name="title" required value="${escapeHtml(course.title)}" /></label>
      <label>Description<textarea name="description" rows="3" required>${escapeHtml(course.description)}</textarea></label>
      <label>Duration (minutes)<input name="durationMin" type="number" min="1" max="120" value="${course.durationMin}" /></label>
      <label class="admin-check">
        <input type="checkbox" name="isFree" ${course.isFree ? "checked" : ""} />
        <span class="admin-check-body">
          <span class="admin-check-title">Free preview</span>
          <span class="admin-check-meta">Available without sign-in</span>
        </span>
      </label>
    </form>
    <footer class="admin-modal-foot">
      <button class="catalog-btn catalog-btn-outline" type="button" data-close>Cancel</button>
      <button class="catalog-btn" type="button" id="course-save">Save course</button>
    </footer>
  `);

  document.querySelectorAll("#admin-modal [data-close]").forEach(b => b.addEventListener("click", hideModal));

  const courseSaveBtn = document.getElementById("course-save");
  courseSaveBtn.addEventListener("click", async () => {
    courseSaveBtn.disabled = true;
    const form = document.getElementById("course-edit-form");
    const data = new FormData(form);
    try {
      await window.Phishy.store.updateCourse(course.id, {
        title: (data.get("title") || "").toString().trim(),
        description: (data.get("description") || "").toString().trim(),
        durationMin: parseInt(data.get("durationMin"), 10) || course.durationMin,
        isFree: form.elements.isFree.checked,
      });
    } finally {
      hideModal();
      render();
    }
  });
}

if (root) {
  if (window.Phishy) {
    window.Phishy.ready().then(render);
  } else {
    render();
  }
}
