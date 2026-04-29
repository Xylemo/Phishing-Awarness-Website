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
        Sign in to access your training courses.
      </p>
      <a class="hero-demo-button" href="../login/">Go to sign in</a>
    </header>
  `;
}

function fmtNum(n) {
    return new Intl.NumberFormat("en-US").format(n || 0);
}

function fmtTime(iso) {
    if (!iso) return "-";
    const d = new Date(iso.replace(" ", "T") + "Z");
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString();
}

function firstName(user) {
    const name = (user.name || user.email || "there").trim();
    return name.split(/\s+/)[0];
}

let viewState = "catalog";
let activeSlug = null;
let cachedCompletions = {};
let cachedUser = null;

function courseStatus(course) {
    const c = cachedCompletions[course.slug];
    if (!c) return {
        label: "Not started",
        state: "todo"
    };
    const total = c.bestTotal || course.questions.length;
    const score = c.bestScore == null ? 0 : c.bestScore;
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    return {
        label: `Completed · best ${score}/${total} (${pct}%)`,
        state: "done",
        pct,
        attempts: c.attempts,
        when: c.lastCompletedAt,
    };
}

function renderCatalog() {
    const courses = (window.PhishyCourses && window.PhishyCourses.catalog) || [];
    const completedSlugs = courses.filter((c) => cachedCompletions[c.slug]);
    const total = courses.length;
    const completed = completedSlugs.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    const adminLink =
        cachedUser && cachedUser.role === "admin" ?
        `<a class="catalog-btn catalog-btn-outline" href="../company/">Open company panel</a>` :
        "";

    const cards = courses
        .map((c) => {
            const status = courseStatus(c);
            const badgeClass =
                status.state === "done" ? "course-badge-done" : "course-badge-assigned";
            const action = status.state === "done" ? "Retake" : "Start course";
            return `
        <article class="dashboard-course ${status.state === "done" ? "is-done" : ""}" data-slug="${escapeHtml(c.slug)}">
          <div class="dashboard-course-head">
            <span class="course-badge ${badgeClass}">${escapeHtml(status.label)}</span>
            <span class="course-meta">${c.questions.length} questions · ${c.durationMin} min</span>
          </div>
          <h3>${escapeHtml(c.title)}</h3>
          <p>${escapeHtml(c.description)}</p>
          <div class="dashboard-course-actions">
            <button class="catalog-btn" data-action="open" data-slug="${escapeHtml(c.slug)}">${action}</button>
          </div>
        </article>
      `;
        })
        .join("");

    return `
    <section class="dashboard-summary">
      <div class="dashboard-stat">
        <span class="dashboard-stat-value">${completed}/${total}</span>
        <span class="dashboard-stat-label">Courses completed</span>
      </div>
      <div class="dashboard-stat dashboard-stat-bar">
        <div class="dashboard-progress">
          <div class="dashboard-progress-fill" style="width: ${percent}%;"></div>
        </div>
        <span class="dashboard-stat-label">${percent}% of training complete</span>
      </div>
      <div class="dashboard-actions">
        ${adminLink}
        <button class="catalog-btn catalog-btn-outline" id="dashboard-signout">Sign out</button>
      </div>
    </section>

    <section class="dashboard-courses">
      <div class="catalog-section-head">
        <h2>Your training courses</h2>
        <p>Complete each one to finish your phishing-awareness training.</p>
      </div>
      <div class="dashboard-course-grid">${cards}</div>
    </section>
  `;
}

function renderCourseView(slug) {
    const courses = (window.PhishyCourses && window.PhishyCourses.catalog) || [];
    const course = courses.find((c) => c.slug === slug);
    if (!course) return `<p class="admin-form-error">Course not found.</p>`;
    const status = courseStatus(course);

    return `
    <section class="catalog-section catalog-course-view">
      <button class="catalog-back" type="button" id="dashboard-course-back">&larr; Back to courses</button>
      <article class="course-paper">
        <header class="course-paper-head">
          <p class="article-category">Course · ${course.questions.length} questions · ${course.durationMin} min</p>
          <h2>${escapeHtml(course.title)}</h2>
          <p class="course-paper-desc">${escapeHtml(course.description)}</p>
          ${
            status.state === "done"
              ? `<p class="course-paper-note"><span class="course-done-pill">&#10003; Completed</span> · ${escapeHtml(status.label)}. Run it again to improve your score.</p>`
              : ""
          }
        </header>
        <div class="course-quiz-host" id="course-quiz-host"></div>
      </article>
    </section>
  `;
}

async function refreshCompletions() {
    try {
        const data = await window.Phishy.me.courses();
        cachedCompletions = data.completions || {};
    } catch (_) {
        cachedCompletions = {};
    }
}

async function render() {
    if (!window.Phishy) return;
    cachedUser = window.Phishy.auth.getCurrentUser();
    if (!cachedUser) {
        renderSignedOut();
        return;
    }

    await refreshCompletions();

    root.innerHTML = `
    <header class="dashboard-header">
      <p class="eyebrow">${cachedUser.role === "admin" ? "Admin" : "Employee"} dashboard</p>
      <h1>Welcome back, ${escapeHtml(firstName(cachedUser))}</h1>
      <p class="dashboard-lede">
        ${cachedUser.companyName ? escapeHtml(cachedUser.companyName) + " &middot; " : ""}Signed in as ${escapeHtml(cachedUser.email)}
      </p>
    </header>
    <div id="dashboard-body"></div>
  `;

    paintBody();
}

function paintBody() {
    const body = document.getElementById("dashboard-body");
    if (!body) return;
    if (viewState === "course" && activeSlug) {
        body.innerHTML = renderCourseView(activeSlug);
        bindCourseView();
    } else {
        body.innerHTML = renderCatalog();
        bindCatalog();
    }
}

function bindCatalog() {
    document.querySelectorAll('[data-action="open"]').forEach((btn) => {
        btn.addEventListener("click", () => {
            activeSlug = btn.dataset.slug;
            viewState = "course";
            paintBody();
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
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
}

function bindCourseView() {
    const back = document.getElementById("dashboard-course-back");
    if (back) {
        back.addEventListener("click", () => {
            viewState = "catalog";
            activeSlug = null;
            paintBody();
        });
    }

    const host = document.getElementById("course-quiz-host");
    const courses = (window.PhishyCourses && window.PhishyCourses.catalog) || [];
    const course = courses.find((c) => c.slug === activeSlug);
    if (!host || !course || !window.PhishyQuiz || !window.PhishyQuiz.run) return;

    window.PhishyQuiz.run(host, course.questions, {
        simulationId: course.slug,
        onComplete: async ({
            score,
            total
        }) => {
            try {
                await window.Phishy.me.completeCourse(course.slug, score, total);
                await refreshCompletions();
            } catch (err) {
                console.error("completeCourse failed", err);
            }
        },
    });
}

if (root) {
    if (window.Phishy) {
        window.Phishy.ready().then(render);
    } else {
        render();
    }
}