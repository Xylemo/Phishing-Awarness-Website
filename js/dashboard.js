const root = document.getElementById("dashboard-root");

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderSignedOut() {
  root.innerHTML = `
    <header class="dashboard-header">
      <p class="eyebrow">Dashboard</p>
      <h1>You're not signed in</h1>
      <p class="dashboard-lede">
        The dashboard is for employees and business owners. Sign in to see
        your assigned courses and progress.
      </p>
      <a class="hero-demo-button" href="../login/">Go to sign in</a>
    </header>
  `;
}

function renderBlock(block) {
  if (block.type === "h") return `<h3>${escapeHtml(block.text)}</h3>`;
  if (block.type === "p") return `<p>${escapeHtml(block.text)}</p>`;
  if (block.type === "ul") return `<ul>${block.items.map(i => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`;
  if (block.type === "ol") return `<ol>${block.items.map(i => `<li>${escapeHtml(i)}</li>`).join("")}</ol>`;
  return "";
}

function render() {
  if (!window.Phishy) return;
  const user = window.Phishy.auth.getCurrentUser();
  if (!user) {
    renderSignedOut();
    return;
  }

  const business = window.Phishy.store.getBusiness(user.businessId);
  const assignments = window.Phishy.store.getAssignments(user.id);
  const completedSet = new Set(
    window.Phishy.store.getProgressForUser(user.id).map(p => p.courseId)
  );
  const total = assignments.length;
  const completed = assignments.filter(a => completedSet.has(a.courseId)).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const cardsHtml = assignments.map(a => {
    const course = window.Phishy.store.getCourse(a.courseId);
    if (!course) return "";
    const done = completedSet.has(course.id);
    return `
      <article class="dashboard-course ${done ? "is-done" : ""}" data-course-id="${escapeHtml(course.id)}">
        <div class="dashboard-course-head">
          <span class="course-badge ${done ? "course-badge-done" : "course-badge-assigned"}">${done ? "Completed" : "Assigned"}</span>
          <span class="course-meta">${course.durationMin} min &middot; ${escapeHtml(course.kind)}</span>
        </div>
        <h3>${escapeHtml(course.title)}</h3>
        <p>${escapeHtml(course.description)}</p>
        <div class="dashboard-course-actions">
          <button class="catalog-btn" data-action="open">${done ? "Review" : "Start course"}</button>
        </div>
      </article>
    `;
  }).join("");

  const empty = total === 0
    ? `<p class="dashboard-empty">You don't have any courses assigned yet. Ask your business admin to assign training, or browse the public catalog.</p>`
    : "";

  root.innerHTML = `
    <header class="dashboard-header">
      <p class="eyebrow">Employee dashboard</p>
      <h1>Welcome back, ${escapeHtml(user.name.split(" ")[0])}</h1>
      <p class="dashboard-lede">
        ${escapeHtml(business ? business.name : "Your team")} &middot; ${total} course${total === 1 ? "" : "s"} assigned
      </p>
    </header>

    <section class="dashboard-summary">
      <div class="dashboard-stat">
        <span class="dashboard-stat-value">${completed}/${total}</span>
        <span class="dashboard-stat-label">Courses complete</span>
      </div>
      <div class="dashboard-stat dashboard-stat-bar">
        <div class="dashboard-progress">
          <div class="dashboard-progress-fill" style="width: ${percent}%;"></div>
        </div>
        <span class="dashboard-stat-label">${percent}% of assigned training</span>
      </div>
      <button class="catalog-btn catalog-btn-outline" id="dashboard-signout">Sign out</button>
    </section>

    <section class="dashboard-courses">
      <div class="catalog-section-head">
        <h2>Your assigned courses</h2>
        <p>Complete each one to finish your required training.</p>
      </div>
      ${empty}
      <div class="dashboard-course-grid">${cardsHtml}</div>
    </section>

    <section class="catalog-section catalog-course-view" id="dashboard-course-view" hidden>
      <button class="catalog-back" type="button" id="dashboard-course-back">&larr; Back to dashboard</button>
      <article class="course-paper" id="dashboard-course-paper"></article>
    </section>
  `;

  document.querySelectorAll('.dashboard-course [data-action="open"]').forEach(btn => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".dashboard-course");
      openCourse(card.getAttribute("data-course-id"));
    });
  });

  const signOut = document.getElementById("dashboard-signout");
  if (signOut) {
    signOut.addEventListener("click", async () => {
      signOut.disabled = true;
      await window.Phishy.auth.signOut();
      window.location.href = "../";
    });
  }

  const back = document.getElementById("dashboard-course-back");
  if (back) {
    back.addEventListener("click", () => {
      document.getElementById("dashboard-course-view").hidden = true;
      document.querySelector(".dashboard-courses").hidden = false;
      document.querySelector(".dashboard-summary").hidden = false;
    });
  }
}

function openCourse(courseId) {
  const user = window.Phishy.auth.getCurrentUser();
  if (!user) return;
  const course = window.Phishy.store.getCourse(courseId);
  if (!course) return;

  const view = document.getElementById("dashboard-course-view");
  const paper = document.getElementById("dashboard-course-paper");
  if (!view || !paper) return;

  const done = !!window.Phishy.store.getProgress(user.id, courseId);
  const isQuiz =
    course.kind === "quiz" &&
    Array.isArray(course.body) &&
    course.body.length > 0 &&
    course.body[0] &&
    typeof course.body[0].isPhishing === "boolean";

  if (isQuiz) {
    paper.innerHTML = `
      <header class="course-paper-head">
        <p class="article-category">${course.isFree ? "Free course" : "Premium course"} &middot; ${course.body.length} questions</p>
        <h2>${escapeHtml(course.title)}</h2>
        <p class="course-paper-desc">${escapeHtml(course.description)}</p>
        ${done ? `<p class="course-paper-note"><span class="course-done-pill">&#10003; Completed</span> &middot; Run it again to improve your score.</p>` : ""}
      </header>
      <div class="course-quiz-host"></div>
    `;
    const host = paper.querySelector(".course-quiz-host");
    if (window.PhishyQuiz && window.PhishyQuiz.run) {
      window.PhishyQuiz.run(host, course.body, {
        onComplete: async ({ score }) => {
          try { await window.Phishy.store.markComplete(user.id, courseId, score); }
          catch (err) { console.error("markComplete failed", err); }
          render();
        },
      });
    }

    document.querySelector(".dashboard-courses").hidden = true;
    document.querySelector(".dashboard-summary").hidden = true;
    view.hidden = false;
    view.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const bodyHtml = (course.body || []).map(renderBlock).join("");

  paper.innerHTML = `
    <header class="course-paper-head">
      <p class="article-category">${course.isFree ? "Free course" : "Premium course"} &middot; ${course.durationMin} min</p>
      <h2>${escapeHtml(course.title)}</h2>
      <p class="course-paper-desc">${escapeHtml(course.description)}</p>
    </header>
    <div class="course-paper-body">${bodyHtml}</div>
    <footer class="course-paper-foot">
      ${done
        ? `<span class="course-done-pill">&#10003; Completed</span>
           <button class="catalog-btn catalog-btn-outline" id="course-mark-incomplete">Mark as not done</button>`
        : `<button class="catalog-btn" id="course-mark-complete">Mark as complete</button>`}
    </footer>
  `;

  document.querySelector(".dashboard-courses").hidden = true;
  document.querySelector(".dashboard-summary").hidden = true;
  view.hidden = false;
  view.scrollIntoView({ behavior: "smooth", block: "start" });

  const completeBtn = document.getElementById("course-mark-complete");
  const incompleteBtn = document.getElementById("course-mark-incomplete");
  if (completeBtn) {
    completeBtn.addEventListener("click", async () => {
      completeBtn.disabled = true;
      try { await window.Phishy.store.markComplete(user.id, courseId); }
      finally { render(); }
    });
  }
  if (incompleteBtn) {
    incompleteBtn.addEventListener("click", async () => {
      incompleteBtn.disabled = true;
      try { await window.Phishy.store.clearProgress(user.id, courseId); }
      finally { render(); }
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
