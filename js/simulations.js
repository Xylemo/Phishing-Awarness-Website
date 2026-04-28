const scenarios = [
  {
    type: "sms",
    sender: "+1 (737) 555-0142",
    body:
      "USPS: Your package could not be delivered due to an incomplete address. " +
      "Please confirm your details and pay the $2.99 redelivery fee at " +
      "usps-redelivery-portal.cc/track to avoid return.",
    isPhishing: true,
    explain:
      "The USPS does not text you to collect a redelivery fee, and the link " +
      "uses a lookalike domain (usps-redelivery-portal.cc) on a suspicious " +
      "top-level domain. Real USPS tracking lives on usps.com.",
  },
  {
    type: "email",
    fromName: "GitHub",
    fromAddress: "noreply@github.com",
    subject: "[GitHub] A new SSH key was added to your account",
    body:
      "Hey Guest,\n\nA new SSH key was added to your account.\n\n" +
      "If you didn't add this key, you can remove it and reset your password " +
      "by visiting https://github.com/settings/keys.\n\nThanks,\nThe GitHub Team",
    isPhishing: false,
    explain:
      "The sender domain is github.com, the link points to github.com, the " +
      "greeting uses your real username, and the message tells you what to do " +
      "if it wasn't you instead of demanding immediate action.",
  },
  {
    type: "sms",
    sender: "+1 (415) 555-0199",
    body:
      "Bank of Amrica Alert: We detected unusual activity on your card. " +
      "Verify your identity now to avoid a freeze: bankofamerica-secure.support/verify",
    isPhishing: true,
    explain:
      "Bank of Amrica is misspelled, and the link uses a " +
      "lookalike domain (bankofamerica-secure.support) instead of the real " +
      "bankofamerica.com. Banks also won't ask you to verify your identity " +
      "through a text link.",
  },
  {
    type: "email",
    fromName: "Apple Support",
    fromAddress: "support@apple-id-verify.com",
    subject: "Your Apple ID has been locked",
    body:
      "Dear Customer,\n\nYour Apple ID has been temporarily locked due to " +
      "suspicious activity. To restore access, you must verify your account " +
      "within 24 hours or it will be permanently disabled.\n\n" +
      "Click here to verify: http://apple-id-verify.com/unlock\n\n" +
      "Apple Support Team",
    isPhishing: true,
    explain:
      "The sender domain (apple-id-verify.com) is not apple.com. The greeting " +
      "is generic ('Dear Customer'), the tone is urgent, and the threat of " +
      "permanent disablement is meant to rush you. Real Apple emails come from " +
      "apple.com and link to appleid.apple.com.",
  },
  {
    type: "sms",
    sender: "729-725 (Verify)",
    body: "Your Google verification code is 482917. Do not share this code with anyone.",
    isPhishing: false,
    explain:
      "Google's short code (729-725) is consistent with their real 2FA " +
      "messages, the code is the message itself (no link to click), and it " +
      "explicitly tells you not to share it. As long as you actually requested " +
      "a sign-in, this is normal.",
  },
  {
    type: "email",
    fromName: "Mark Stevens, CEO",
    fromAddress: "mark.stevens.ceo@gmail.com",
    subject: "Quick favor - need this done before my flight",
    body:
      "Hi,\n\nI'm boarding a flight in 20 minutes and need a favor. Can you " +
      "pick up five $200 Apple gift cards for a client thank-you? Scratch off " +
      "the backs and email me the codes ASAP. I'll reimburse you when I land.\n\n" +
      "Thanks,\nMark",
    isPhishing: true,
    explain:
      "Classic whaling attempt. The 'CEO' is emailing from a personal gmail.com " +
      "address instead of the company domain, the request is urgent, and the " +
      "ask (gift card codes) is a textbook scam. Real executives don't ask " +
      "employees to buy gift cards over email.",
  },
  {
    type: "sms",
    sender: "+1 (302) 555-0173",
    body:
      "Congrats! You've been selected for a $1,000 Amazon gift card. " +
      "Claim within 24 hours: amzn-rewards.top/claim?id=8821",
    isPhishing: true,
    explain:
      "Unsolicited prizes that demand action 'within 24 hours' are almost " +
      "always scams, and the link uses a lookalike (amzn-rewards.top) on a " +
      ".top domain rather than amazon.com.",
  },
  {
    type: "email",
    fromName: "Spotify",
    fromAddress: "no-reply@spotify.com",
    subject: "Your June receipt from Spotify",
    body:
      "Hi Leo,\n\nThanks for being a Premium member. Your subscription " +
      "renewed on June 1 for $10.99. View your receipt or manage your plan " +
      "anytime at spotify.com/account.\n\n- The Spotify team",
    isPhishing: false,
    explain:
      "Sender is spotify.com, the link goes to spotify.com, it greets you by " +
      "name, and it's an informational receipt &mdash; no urgency, no request " +
      "for credentials. This is what a legitimate transactional email looks like.",
  },
  {
    type: "email",
    fromName: "DocuSign",
    fromAddress: "service@docu-sign-secure.net",
    subject: "Document waiting for your signature",
    body:
      "Hello,\n\nYou have a confidential document awaiting your signature. " +
      "It will expire in 24 hours.\n\nView and sign now: " +
      "http://docu-sign-secure.net/sign/x8H22\n\nDocuSign Service Team",
    isPhishing: true,
    explain:
      "Real DocuSign messages come from docusign.com or docusign.net, not " +
      "'docu-sign-secure.net'. The 24-hour expiration pressure plus a generic " +
      "greeting is the giveaway. Real signature requests are tied to a person " +
      "you do business with.",
  },
  {
    type: "sms",
    sender: "AA-FLT (24411)",
    body:
      "American Airlines: Your flight AA1283 to DFW is now departing from " +
      "Gate C12. Boarding at 14:30. View your boarding pass in the app.",
    isPhishing: false,
    explain:
      "Short codes (5-6 digit numbers) come from registered senders. The " +
      "message references a specific flight and gate, doesn't include a link " +
      "to click, and points you to the official app. That's the legitimate " +
      "pattern for airline notifications.",
  },
];

const stage = document.getElementById("sim-stage");
const counter = document.getElementById("sim-counter");
const progressFill = document.getElementById("sim-progress-fill");
const scoreLabel = document.getElementById("sim-score");
const actions = document.getElementById("sim-actions");
const feedback = document.getElementById("sim-feedback");
const feedbackTitle = document.getElementById("sim-feedback-title");
const feedbackExplain = document.getElementById("sim-feedback-explain");
const nextBtn = document.getElementById("sim-next-btn");
const complete = document.getElementById("sim-complete");
const completeScore = document.getElementById("sim-complete-score");
const completeMsg = document.getElementById("sim-complete-msg");
const restartBtn = document.getElementById("sim-restart-btn");
const progress = document.getElementById("sim-progress");

let index = 0;
let score = 0;
let answered = false;
let simRunId = null;
const SIM_ID = "spot_the_phishing";

function startSimRun() {
  simRunId = null;
  if (window.Phishy && window.Phishy.analytics) {
    window.Phishy.analytics
      .startSimulation(SIM_ID)
      .then((r) => { simRunId = r && r.runId; })
      .catch(() => {});
  }
}
startSimRun();

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function avatarInitial(label) {
  return escapeHtml(String(label || "?").trim().charAt(0).toUpperCase() || "?");
}

function emailSnippet(text) {
  return escapeHtml(String(text || "").replace(/\s+/g, " ").trim()).slice(0, 96);
}

function renderActions(scenario) {
  if (scenario.type === "url") {
    return `
      <button class="demo-button demo-button-danger" type="button" data-answer="phishing">Phishing</button>
      <button class="demo-button demo-button-safe" type="button" data-answer="safe">Safe</button>
    `;
  }

  return `
    <button class="demo-button demo-button-safe" type="button" data-answer="safe">Continue Safe</button>
  `;
}

function closeEmailMenus(root) {
  (root || document).querySelectorAll(".sim-email-menu.is-open").forEach(menu => {
    menu.classList.remove("is-open");
    const toggle = menu.querySelector(".sim-email-menu-toggle");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  });
}

function nextLabel() {
  return index === scenarios.length - 1 ? "See results" : "Next scenario ->";
}

function showInlineFeedback(scenario, correct) {
  const host = scenario.type === "sms"
    ? stage.querySelector(".sim-imessage-thread")
    : scenario.type === "email"
      ? stage.querySelector(".sim-email-card")
      : stage.querySelector(".sim-url");
  const target = scenario.type === "sms"
    ? stage.querySelector(".sim-sms-bubble")
    : scenario.type === "email"
      ? stage.querySelector(".sim-email-card")
      : stage.querySelector(".sim-url-bar");

  if (host) {
    host.querySelector(".sim-inline-feedback")?.remove();
    host.classList.add("has-inline-feedback", `has-inline-feedback-${scenario.type}`);
  }

  if (target) {
    target.classList.add("sim-highlight-target", scenario.isPhishing ? "is-phishing" : "is-safe");
  }

  if (!host) return;

  const overlay = document.createElement("div");
  overlay.className = `sim-inline-feedback sim-inline-feedback-${scenario.type} ${scenario.isPhishing ? "is-phishing" : "is-safe"}`;
  overlay.innerHTML = `
    <span class="sim-inline-feedback-badge">${scenario.isPhishing ? "Phishing" : "Safe"}</span>
    <h4>${correct ? "Correct" : "Not quite"}: this one is ${scenario.isPhishing ? "phishing" : "safe"}.</h4>
    <p>${scenario.explain}</p>
    <button class="demo-button demo-button-next sim-inline-feedback-next" type="button" data-inline-next="true">${nextLabel()}</button>
  `;
  host.appendChild(overlay);
}

function renderScenario(scenario) {
  if (scenario.type === "sms") {
    return `
      <div class="sim-message sim-sms">
        <div class="sim-phone-shell">
          <div class="sim-phone-status">
            <span>9:41</span>
            <div class="sim-phone-icons">
              <span class="sim-phone-signal"></span>
              <span class="sim-phone-wifi"></span>
              <span class="sim-phone-battery"></span>
            </div>
          </div>
          <div class="sim-imessage-header">
            <span class="sim-imessage-back">&#10094; Messages</span>
            <div class="sim-imessage-contact">
              <span class="sim-imessage-avatar">${avatarInitial(scenario.sender)}</span>
              <div>
                <strong>${escapeHtml(scenario.sender)}</strong>
                <span>iMessage</span>
              </div>
            </div>
            <span class="sim-imessage-info">i</span>
          </div>
          <div class="sim-imessage-thread">
            <div class="sim-imessage-date">Today</div>
            <div class="sim-sms-bubble">${escapeHtml(scenario.body)}</div>
            <div class="sim-imessage-alert">
              <p>If you did not expect this message from an unknown sender, it may be spam.</p>
              <button class="sim-sms-report-btn" type="button">Report Spam</button>
            </div>
          </div>
          <div class="sim-imessage-compose">
            <span class="sim-imessage-compose-icon">+</span>
            <span class="sim-imessage-compose-field">iMessage</span>
            <span class="sim-imessage-compose-icon">&#9654;</span>
          </div>
          <div class="sim-phone-home"></div>
        </div>
      </div>
    `;
  }

  const bodyHtml = escapeHtml(scenario.body).replace(/\n/g, "<br />");
  const snippet = emailSnippet(scenario.body);
  return `
    <div class="sim-message sim-email">
      <div class="sim-gmail-topbar">
        <div class="sim-gmail-brand">
          <span class="sim-gmail-brand-mark"></span>
          <span>Gmail</span>
        </div>
        <div class="sim-gmail-search">Search in mail</div>
        <div class="sim-gmail-user">${avatarInitial(scenario.fromName)}</div>
      </div>
      <div class="sim-gmail-layout">
        <aside class="sim-gmail-nav" aria-hidden="true">
          <div class="sim-gmail-compose">Compose</div>
          <div class="sim-gmail-nav-item sim-gmail-nav-item-active">Inbox</div>
          <div class="sim-gmail-nav-item">Starred</div>
          <div class="sim-gmail-nav-item">Sent</div>
          <div class="sim-gmail-nav-item">Drafts</div>
        </aside>
        <div class="sim-gmail-main">
          <div class="sim-gmail-toolbar">
            <strong>Inbox</strong>
            <span>1 selected</span>
          </div>
          <div class="sim-gmail-list">
            <div class="sim-gmail-row sim-gmail-row-active">
              <span class="sim-gmail-row-star">&#9734;</span>
              <span class="sim-gmail-row-from">${escapeHtml(scenario.fromName)}</span>
              <span class="sim-gmail-row-subject">${escapeHtml(scenario.subject)}</span>
              <span class="sim-gmail-row-snippet">${snippet}</span>
              <span class="sim-gmail-row-time">Now</span>
            </div>
          </div>
          <article class="sim-email-card">
            <div class="sim-email-card-top">
              <h3 class="sim-email-title">${escapeHtml(scenario.subject)}</h3>
              <div class="sim-email-menu">
                <button class="sim-email-menu-toggle" type="button" aria-expanded="false" aria-label="More email actions">&#8942;</button>
                <div class="sim-email-menu-panel">
                  <button class="sim-email-menu-action sim-email-report-btn" type="button">Report phishing</button>
                </div>
              </div>
            </div>
            <div class="sim-email-header">
              <span class="sim-email-avatar">${avatarInitial(scenario.fromName)}</span>
              <div class="sim-email-meta">
                <div class="sim-email-sender-line">
                  <strong>${escapeHtml(scenario.fromName)}</strong>
                  <span>&lt;${escapeHtml(scenario.fromAddress)}&gt;</span>
                </div>
                <div class="sim-email-recipient-line">to me</div>
              </div>
            </div>
            <div class="sim-email-body">${bodyHtml}</div>
          </article>
        </div>
      </div>
    </div>
  `;
}

function updateProgress() {
  counter.textContent = `Scenario ${index + 1} of ${scenarios.length}`;
  const percent = (index / scenarios.length) * 100;
  progressFill.style.width = `${percent}%`;
  scoreLabel.textContent = `Score: ${score}`;
}

function showScenario() {
  answered = false;
  const scenario = scenarios[index];
  stage.innerHTML = renderScenario(scenario);
  stage.classList.remove("sim-stage-answered");
  closeEmailMenus(stage);
  actions.innerHTML = renderActions(scenario);
  actions.classList.toggle("is-single", scenario.type !== "url");
  feedback.hidden = true;
  actions.hidden = false;
  updateProgress();
}

function answer(userPickedPhishing) {
  if (answered) return;
  answered = true;
  feedback.hidden = true;

  const scenario = scenarios[index];
  const correct = userPickedPhishing === scenario.isPhishing;
  if (correct) score += 1;
  if (window.Phishy && window.Phishy.analytics) {
    window.Phishy.analytics.recordAnswer(
      simRunId,
      `${SIM_ID}:${index}`,
      userPickedPhishing ? "phishing" : "safe",
      correct
    );
  }

  closeEmailMenus(stage);
  stage.classList.add("sim-stage-answered");
  stage.querySelectorAll("button").forEach(btn => {
    btn.disabled = true;
  });
  actions.querySelectorAll("button").forEach(btn => {
    btn.disabled = true;
  });
  actions.hidden = true;

  feedbackTitle.textContent = correct
    ? "Correct!"
    : `Not quite — this one was ${scenario.isPhishing ? "phishing" : "safe"}.`;
  feedbackExplain.innerHTML = scenario.explain;
  feedback.hidden = false;
  showInlineFeedback(scenario, correct);
  feedback.hidden = true;

  scoreLabel.textContent = `Score: ${score}`;

  if (index === scenarios.length - 1) {
    nextBtn.textContent = "See results";
  } else {
    nextBtn.textContent = "Next scenario →";
  }
}

function next() {
  if (index < scenarios.length - 1) {
    index += 1;
    showScenario();
    return;
  }

  finish();
}

function finish() {
  stage.innerHTML = "";
  feedback.hidden = true;
  actions.hidden = true;
  progress.hidden = true;

  if (window.Phishy && window.Phishy.analytics) {
    window.Phishy.analytics.finishSimulation(simRunId, score, scenarios.length);
  }

  completeScore.textContent = `You scored ${score} out of ${scenarios.length}.`;
  const percent = score / scenarios.length;
  if (percent === 1) {
    completeMsg.textContent =
      "Perfect score. You've got a sharp eye for the red flags.";
  } else if (percent >= 0.75) {
    completeMsg.textContent =
      "Solid run. Review the explanations on the ones you missed and try again.";
  } else if (percent >= 0.5) {
    completeMsg.textContent =
      "Good start. Check the Warning Signs page for the patterns to watch for.";
  } else {
    completeMsg.textContent =
      "Plenty of room to grow. Read through the Warning Signs page and run it again.";
  }

  complete.hidden = false;
}

function restart() {
  index = 0;
  score = 0;
  complete.hidden = true;
  progress.hidden = false;
  startSimRun();
  showScenario();
}

actions.addEventListener("click", event => {
  const actionBtn = event.target.closest("[data-answer]");
  if (!actionBtn || answered) return;
  answer(actionBtn.dataset.answer === "phishing");
});

stage.addEventListener("click", event => {
  if (event.target.closest("[data-inline-next]")) {
    next();
    return;
  }

  if (answered) return;

  const menuToggle = event.target.closest(".sim-email-menu-toggle");
  if (menuToggle) {
    const menu = menuToggle.closest(".sim-email-menu");
    const shouldOpen = !menu.classList.contains("is-open");
    closeEmailMenus(stage);
    if (shouldOpen) {
      menu.classList.add("is-open");
      menuToggle.setAttribute("aria-expanded", "true");
    }
    return;
  }

  if (event.target.closest(".sim-email-report-btn") || event.target.closest(".sim-sms-report-btn")) {
    answer(true);
    return;
  }

  closeEmailMenus(stage);
});

nextBtn.addEventListener("click", next);
restartBtn.addEventListener("click", restart);

showScenario();

const statusEl = document.getElementById("catalog-status");
const grid = document.getElementById("catalog-grid");
const courseView = document.getElementById("course-view");
const coursePaper = document.getElementById("course-paper");
const courseBack = document.getElementById("course-back");
const demoSection = document.getElementById("demo-section");

function initials(name) {
  return (name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0].toUpperCase())
    .join("");
}

function renderStatus() {
  if (!statusEl || !window.Phishy) return;
  const user = window.Phishy.auth.getCurrentUser();

  if (!user) {
    statusEl.innerHTML = `
      <p class="page-hero-card-eyebrow">Guest mode</p>
      <h3>Track your progress</h3>
      <p class="page-hero-card-body">
        Sign in to unlock premium courses, save your scores, and pick up where you left off.
      </p>
      <a class="catalog-btn" href="../login/">Sign in</a>
      <p class="page-hero-card-foot">
        New employer? <a href="../login/">Sign in as the business owner.</a>
      </p>
    `;
    return;
  }

  const assignments = window.Phishy.store.getAssignments(user.id);
  const completed = assignments.filter(a =>
    window.Phishy.store.getProgress(user.id, a.courseId)
  ).length;
  const total = assignments.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const dashHref = user.role === "admin" ? "../company/" : "../dashboard/";
  const dashLabel = user.role === "admin" ? "Open company panel" : "Open dashboard";

  statusEl.innerHTML = `
    <header class="page-hero-card-head">
      <div class="article-avatar">${escapeHtml(initials(user.name))}</div>
      <div>
        <p class="page-hero-card-eyebrow">${user.role === "admin" ? "Business owner" : "Employee"}</p>
        <h3>${escapeHtml(user.name)}</h3>
      </div>
    </header>
    <div class="page-hero-card-progress">
      <div class="page-hero-card-bar">
        <div class="page-hero-card-fill" style="width: ${percent}%;"></div>
      </div>
      <p>${total === 0 ? "No courses assigned yet." : `${completed} of ${total} assigned course${total === 1 ? "" : "s"} complete (${percent}%).`}</p>
    </div>
    <div class="page-hero-card-actions">
      <a class="catalog-btn" href="${dashHref}">${dashLabel}</a>
      <button class="catalog-btn catalog-btn-outline" type="button" id="status-signout">Sign out</button>
    </div>
  `;

  const signoutBtn = document.getElementById("status-signout");
  if (signoutBtn) {
    signoutBtn.addEventListener("click", async () => {
      signoutBtn.disabled = true;
      await window.Phishy.auth.signOut();
      window.location.reload();
    });
  }
}

function courseCardState(course, user) {
  if (!user) {
    return course.isFree
      ? { label: "Free", available: true, action: "Start course" }
      : { label: "Premium", available: false, action: "Sign in to unlock" };
  }
  const assigned = window.Phishy.store.isAssigned(user.id, course.id);
  const done = !!window.Phishy.store.getProgress(user.id, course.id);
  if (done) return { label: "Completed", available: true, action: "Review", state: "done" };
  if (course.isFree) return { label: "Free", available: true, action: "Start course" };
  if (assigned) return { label: "Assigned", available: true, action: "Start course", state: "assigned" };
  return { label: "Premium", available: false, action: "Ask your admin to assign" };
}

function renderCatalog() {
  if (!grid || !window.Phishy) return;
  const user = window.Phishy.auth.getCurrentUser();
  const courses = window.Phishy.store.getCourses();

  grid.innerHTML = courses.map(course => {
    const state = courseCardState(course, user);
    const badgeClass = state.state === "done" ? "course-badge-done"
      : state.state === "assigned" ? "course-badge-assigned"
      : course.isFree ? "course-badge-free" : "course-badge-premium";
    const tier = course.isFree ? "free" : "premium";
    const stateClass = state.state === "done" ? " is-done"
      : state.state === "assigned" ? " is-assigned"
      : !state.available ? " is-locked" : "";
    return `
      <article class="course-card course-card-tier-${tier}${stateClass}" data-course-id="${escapeHtml(course.id)}">
        <div class="course-card-stripe"></div>
        <div class="course-card-body">
          <div class="course-card-head">
            <div class="course-card-icon">${escapeHtml(initials(course.title))}</div>
            <span class="course-badge ${badgeClass}">${escapeHtml(state.label)}</span>
          </div>
          <h3 class="course-card-title">${escapeHtml(course.title)}</h3>
          <p class="course-card-desc">${escapeHtml(course.description)}</p>
        </div>
        <footer class="course-card-foot">
          <span class="course-meta">${course.durationMin} min &middot; ${escapeHtml(course.kind)}</span>
          ${
            state.available
              ? `<button class="catalog-btn" data-action="open" data-course-id="${escapeHtml(course.id)}">${escapeHtml(state.action)}</button>`
              : (user
                  ? `<button class="catalog-btn catalog-btn-muted" disabled>${escapeHtml(state.action)}</button>`
                  : `<a class="catalog-btn catalog-btn-outline" href="../login/">${escapeHtml(state.action)}</a>`)
          }
        </footer>
      </article>
    `;
  }).join("");

  grid.querySelectorAll('[data-action="open"]').forEach(btn => {
    btn.addEventListener("click", () => openCourse(btn.dataset.courseId));
  });
}

function renderBlock(block) {
  if (block.type === "h") return `<h3>${escapeHtml(block.text)}</h3>`;
  if (block.type === "p") return `<p>${escapeHtml(block.text)}</p>`;
  if (block.type === "ul") return `<ul>${block.items.map(i => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`;
  if (block.type === "ol") return `<ol>${block.items.map(i => `<li>${escapeHtml(i)}</li>`).join("")}</ol>`;
  return "";
}

function openCourse(courseId) {
  if (!window.Phishy || !coursePaper || !courseView) return;
  const course = window.Phishy.store.getCourse(courseId);
  if (!course) return;
  const user = window.Phishy.auth.getCurrentUser();
  const done = user ? !!window.Phishy.store.getProgress(user.id, courseId) : false;
  const isQuiz =
    course.kind === "quiz" &&
    Array.isArray(course.body) &&
    course.body.length > 0 &&
    course.body[0] &&
    typeof course.body[0].isPhishing === "boolean";

  if (isQuiz) {
    if (!user) {
      coursePaper.innerHTML = `
        <header class="course-paper-head">
          <p class="article-category">${course.isFree ? "Free course" : "Premium course"} &middot; ${course.body.length} questions</p>
          <h2>${escapeHtml(course.title)}</h2>
          <p class="course-paper-desc">${escapeHtml(course.description)}</p>
        </header>
        <div class="course-paper-body">
          <p>This course is a ${course.body.length}-question quiz on real-world phishing examples.</p>
          <p>Sign in to take it and have your score saved to your training record.</p>
        </div>
        <footer class="course-paper-foot">
          <a class="catalog-btn" href="../login/">Sign in to start</a>
        </footer>
      `;
    } else {
      coursePaper.innerHTML = `
        <header class="course-paper-head">
          <p class="article-category">${course.isFree ? "Free course" : "Premium course"} &middot; ${course.body.length} questions</p>
          <h2>${escapeHtml(course.title)}</h2>
          <p class="course-paper-desc">${escapeHtml(course.description)}</p>
          ${done ? `<p class="course-paper-note"><span class="course-done-pill">&#10003; Completed</span> &middot; Run it again to improve your score.</p>` : ""}
        </header>
        <div class="course-quiz-host"></div>
      `;
      const host = coursePaper.querySelector(".course-quiz-host");
      if (window.PhishyQuiz && window.PhishyQuiz.run) {
        window.PhishyQuiz.run(host, course.body, {
          onComplete: async ({ score, total }) => {
            try {
              await window.Phishy.store.markComplete(user.id, courseId, score);
            } catch (err) {
              console.error("markComplete failed", err);
            }
            renderStatus();
            renderCatalog();
          },
        });
      }
    }
    if (demoSection) demoSection.hidden = true;
    courseView.hidden = false;
    courseView.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const bodyHtml = (course.body || []).map(renderBlock).join("");
  coursePaper.innerHTML = `
    <header class="course-paper-head">
      <p class="article-category">${course.isFree ? "Free course" : "Premium course"} &middot; ${course.durationMin} min</p>
      <h2>${escapeHtml(course.title)}</h2>
      <p class="course-paper-desc">${escapeHtml(course.description)}</p>
    </header>
    <div class="course-paper-body">${bodyHtml}</div>
    <footer class="course-paper-foot">
      ${user
        ? (done
            ? `<span class="course-done-pill">&#10003; Completed</span>
               <button class="catalog-btn catalog-btn-outline" id="course-mark-incomplete">Mark as not done</button>`
            : `<button class="catalog-btn" id="course-mark-complete">Mark as complete</button>`)
        : `<p class="course-paper-note">Sign in to mark this course complete and track progress.</p>
           <a class="catalog-btn" href="../login/">Sign in</a>`}
    </footer>
  `;

  if (user) {
    const completeBtn = document.getElementById("course-mark-complete");
    const incompleteBtn = document.getElementById("course-mark-incomplete");
    if (completeBtn) {
      completeBtn.addEventListener("click", async () => {
        completeBtn.disabled = true;
        try {
          await window.Phishy.store.markComplete(user.id, courseId);
        } finally {
          renderStatus();
          renderCatalog();
          openCourse(courseId);
        }
      });
    }
    if (incompleteBtn) {
      incompleteBtn.addEventListener("click", async () => {
        incompleteBtn.disabled = true;
        try {
          await window.Phishy.store.clearProgress(user.id, courseId);
        } finally {
          renderStatus();
          renderCatalog();
          openCourse(courseId);
        }
      });
    }
  }

  if (demoSection) demoSection.hidden = true;
  courseView.hidden = false;
  courseView.scrollIntoView({ behavior: "smooth", block: "start" });
}

if (courseBack && courseView) {
  courseBack.addEventListener("click", () => {
    courseView.hidden = true;
    if (demoSection) demoSection.hidden = false;
  });
}

function initCatalog() {
  renderStatus();
  renderCatalog();
}

if (window.Phishy) {
  window.Phishy.ready().then(initCatalog);
} else {
  initCatalog();
}
