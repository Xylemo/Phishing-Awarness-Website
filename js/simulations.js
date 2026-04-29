// All simulation scenarios
const scenarios = [
  {
    type: "sms",
    sender: "+1 (737) 555-0142",
    body:
      "USPS: Your package could not be delivered due to an incomplete address. " +
      "Please confirm your details and pay the $2.99 redelivery fee at " +
      "usps-redelivery-portal.cc/track to avoid having your package returned.",
    isPhishing: true,
    explain: "USPS doesn't text customers about redelivery fees. The link is a lookalike domain on a suspicious .cc site.",
  },
  {
    type: "email",
    fromName: "GitHub",
    fromAddress: "noreply@github.com",
    subject: "[GitHub] A new SSH key was added to your account",
    body:
      "Hey Guest,\n\nA new SSH key was added to your account.\n\n" +
      "If you did not add this key, you can remove it and reset your password " +
      "by visiting https://github.com/settings/keys.\n\nThanks,\nThe GitHub Team",
    isPhishing: false,
    explain: "The sender and link are both from github.com. It provides guidance if the action wasn't you, rather than demanding immediate action.",
  },
  {
    type: "sms",
    sender: "+1 (415) 555-0199",
    body:
      "Bank of Amrica Alert: We detected unusual activity on your card. " +
      "Verify your identity now to avoid a freeze: bankofamerica-secure.support/verify",
    isPhishing: true,
    explain: "\"Amrica\" is misspelled and the link is a lookalike domain. Banks do not verify identities through SMS links.",
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
    explain: "The sender is not from apple.com, the greeting is generic, and the 24-hour disablement threat creates urgency - a sign of common phishing tactics.",
  },
  {
    type: "sms",
    sender: "729-725 (Verify)",
    body: "Your Google verification code is 482917. Do not share this code with anyone.",
    isPhishing: false,
    explain: "This is a legitimate Google short code. There is no link, and it clearly warns not to share the code - typical for 2FA messages.",
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
    explain: "This is a CEO impersonation (whaling) scam. It uses a personal Gmail address, urgency, and gift cards — common red flags.",
  },
  {
    type: "sms",
    sender: "+1 (302) 555-0173",
    body:
      "Congrats! You've been selected for a $1,000 Amazon gift card. " +
      "Claim within 24 hours: amzn-rewards.top/claim?id=8821",
    isPhishing: true,
    explain: "An unsolicited prize, a 24-hour deadline, and a lookalike .top domain are all strong indicators of a scam.",
  },
  {
    type: "email",
    fromName: "Spotify",
    fromAddress: "no-reply@spotify.com",
    subject: "Your June receipt from Spotify",
    body:
      "Hi Leo,\n\nThanks for being a Premium member. Your subscription " +
      "renewed on June 1 for $10.99. You can view your receipt or manage your plan " +
      "anytime at spotify.com/account.\n\n- The Spotify team",
    isPhishing: false,
    explain: "The sender and link are spotify.com. It uses a named greeting, no urgency — typical of a legitimate receipt.",
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
    explain: "Real DocuSign emails come from docusign.com, not a hyphenated lookalike. The generic greeting and 24-hour deadline are red flags.",
  },
  {
    type: "sms",
    sender: "AA-FLT (24411)",
    body:
      "American Airlines: Your flight AA1283 to DFW is now departing from " +
      "Gate C12. Boarding at 14:30. View your boarding pass in the app.",
    isPhishing: false,
    explain: "This message comes from a registered short code, includes specific flight details, and contains no suspicious links — this is a legitimate airline notification.",
  },
];


// Loading all elements needed for simulation
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

// Data sending
function startSimRun() {
    simRunId = null;
    if (window.Phishy && window.Phishy.analytics) {
        window.Phishy.analytics
            .startSimulation(SIM_ID)
            .then((r) => {
                simRunId = r && r.runId;
            })
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
    const host = scenario.type === "sms" ?
        stage.querySelector(".sim-imessage-thread") :
        scenario.type === "email" ?
        stage.querySelector(".sim-email-card") :
        stage.querySelector(".sim-url");
    const target = scenario.type === "sms" ?
        stage.querySelector(".sim-sms-bubble") :
        scenario.type === "email" ?
        stage.querySelector(".sim-email-card") :
        stage.querySelector(".sim-url-bar");

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
          <div class="sim-imessage-header">
            <div class="sim-imessage-contact">
              <div>
                <strong>${escapeHtml(scenario.sender)}</strong>
              </div>
            </div>
          </div>
          <div class="sim-imessage-thread">
            <div class="sim-imessage-phone">
            <div class="sim-sms-bubble">${escapeHtml(scenario.body)}</div>
            <div class="sim-imessage-alert">
              <p>If you did not expect this message from an unknown sender, it may be spam.</p>
              <button class="sim-sms-report-btn" type="button">Report Spam</button>
            </div>
          </div>
        </div>
      </div>
    `;
    }

    const bodyHtml = escapeHtml(scenario.body).replace(/\n/g, "<br />");
    const snippet = emailSnippet(scenario.body);
    return `
    <div class="sim-message sim-email">
      <article class="sim-email-card sim-gmail-page">
        <h3 class="sim-email-title">${escapeHtml(scenario.subject)}</h3>
        <div class="sim-email-menu">
          <button class="sim-email-menu-toggle" type="button" aria-expanded="false" aria-label="More email actions">&#8942;</button>
          <div class="sim-email-menu-panel">
            <button class="sim-email-menu-action sim-email-report-btn" type="button">Report phishing</button>
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
  `;
}

function updateProgress() {
    counter.textContent = `Scenario ${index + 1} of ${scenarios.length}`;
    const percent = (index + 1) / (scenarios.length) * 100;
    progressFill.style.width = `${percent}%`;
    scoreLabel.textContent = `Score: ${score}`;
}

const coachShown = new Set();
const activeCoaches = [];

function clampHorizontally(coach) {
    requestAnimationFrame(() => {
        const cr = coach.getBoundingClientRect();
        const margin = 8;
        let leftPx = parseFloat(coach.style.left);
        if (cr.right > window.innerWidth - margin) {
            leftPx -= cr.right - (window.innerWidth - margin);
        }
        if (cr.left < margin) {
            leftPx += margin - cr.left;
        }
        coach.style.left = `${leftPx}px`;
    });
}

function placeCoachBelow(coach, target) {
    if (!target || !coach.isConnected) return;
    const r = target.getBoundingClientRect();
    coach.style.left = `${r.left + r.width / 2}px`;
    coach.style.top = `${r.bottom + 10}px`;
    clampHorizontally(coach);
}

function placeCoachLeftOf(coach, target) {
    if (!target || !coach.isConnected) return;
    const r = target.getBoundingClientRect();
    coach.style.left = `${r.left - 12}px`;
    coach.style.top = `${r.top + r.height / 2}px`;
}

function placeCoachRightOf(coach, target) {
    if (!target || !coach.isConnected) return;
    const r = target.getBoundingClientRect();
    coach.style.left = `${r.right + 12}px`;
    coach.style.top = `${r.top + r.height / 2}px`;
}

function attachCoach(target, html, placement) {
    if (!target) return null;
    const coach = document.createElement("div");
    const placementClass =
        placement === "left" ? "sim-coach-left" :
        placement === "right" ? "sim-coach-right" : "";
    coach.className = placementClass ? `sim-coach ${placementClass}` : "sim-coach";
    coach.innerHTML = html;
    document.body.appendChild(coach);
    const placer =
        placement === "left" ? placeCoachLeftOf :
        placement === "right" ? placeCoachRightOf :
        placeCoachBelow;
    placer(coach, target);
    const reposition = () => placer(coach, target);
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    activeCoaches.push({
        coach,
        reposition
    });
    return coach;
}

function dismissCoaches() {
    while (activeCoaches.length) {
        const {
            coach,
            reposition
        } = activeCoaches.pop();
        window.removeEventListener("scroll", reposition, true);
        window.removeEventListener("resize", reposition);
        coach.remove();
    }
    document.querySelectorAll(".sim-coach").forEach((c) => c.remove());
}

function waitForLoader() {
    const loader = document.getElementById("site-loader");
    if (!loader || loader.classList.contains("is-hidden")) return Promise.resolve();
    return new Promise((resolve) => {
        const done = () => {
            classObs.disconnect();
            removalObs.disconnect();
            resolve();
        };
        const classObs = new MutationObserver(() => {
            if (loader.classList.contains("is-hidden")) done();
        });
        classObs.observe(loader, {
            attributes: true,
            attributeFilter: ["class"]
        });
        const removalObs = new MutationObserver(() => {
            if (!document.body.contains(loader)) done();
        });
        removalObs.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

function showFirstScenarioCoach(scenario) {
    if (coachShown.has(scenario.type)) return;
    coachShown.add(scenario.type);
    waitForLoader().then(() => {
        if (answered || scenarios[index] !== scenario) return;

        if (scenario.type === "sms") {
            const target = stage.querySelector(".sim-sms-report-btn");
            attachCoach(target, `
        <span class="sim-coach-text">Tap <strong>Report Spam</strong> if this text looks like phishing.</span>
        <button class="sim-coach-dismiss" type="button" data-coach-dismiss>Got it</button>
      `, "right");
        } else if (scenario.type === "email") {
            const target = stage.querySelector(".sim-email-menu-toggle");
            attachCoach(target, `
        <span class="sim-coach-text">Open the <strong>three dots (⋮)</strong> and pick <strong>Report phishing</strong> to flag this email.</span>
        <button class="sim-coach-dismiss" type="button" data-coach-dismiss>Got it</button>
      `, "left");
        }

        const safeBtn = actions.querySelector('[data-answer="safe"]');
        attachCoach(safeBtn, `
      <span class="sim-coach-text">If nothing looks off, click <strong>Continue Safe</strong> to move on.</span>
      <button class="sim-coach-dismiss" type="button" data-coach-dismiss>Got it</button>
    `, "left");
    });
}

function showScenario() {
    answered = false;
    const scenario = scenarios[index];
    stage.innerHTML = renderScenario(scenario);
    stage.classList.remove("sim-stage-answered");
    closeEmailMenus(stage);
    dismissCoaches();
    actions.innerHTML = renderActions(scenario);
    actions.classList.toggle("is-single", scenario.type !== "url");
    feedback.hidden = true;
    actions.hidden = false;
    updateProgress();
    showFirstScenarioCoach(scenario);
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
    dismissCoaches();
    stage.classList.add("sim-stage-answered");
    stage.querySelectorAll("button").forEach(btn => {
        btn.disabled = true;
    });
    actions.querySelectorAll("button").forEach(btn => {
        btn.disabled = true;
    });
    actions.hidden = true;

    feedbackTitle.textContent = correct ?
        "Correct!" :
        `Not quite this one was ${scenario.isPhishing ? "phishing" : "safe"}.`;
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
    actions.innerHTML = "";
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
            "Good start. Check the Safety Tips page for the patterns to watch for.";
    } else {
        completeMsg.textContent =
            "Plenty of room to grow. Read through the Safety Tips page and run it again.";
    }

    complete.hidden = false;
}

function restart() {
    index = 0;
    score = 0;
    coachShown.clear();
    complete.hidden = true;
    progress.hidden = false;
    startSimRun();
    showScenario();
}

actions.addEventListener("click", event => {
    if (event.target.closest("[data-coach-dismiss]")) {
        dismissCoaches();
        return;
    }
    const actionBtn = event.target.closest("[data-answer]");
    if (!actionBtn || answered) return;
    answer(actionBtn.dataset.answer === "phishing");
});

stage.addEventListener("click", event => {
    if (event.target.closest("[data-coach-dismiss]")) {
        dismissCoaches();
        return;
    }

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

document.addEventListener("click", (event) => {
    if (event.target.closest("[data-coach-dismiss]")) {
        dismissCoaches();
    }
});

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
        return course.isFree ?
            {
                label: "Free",
                available: true,
                action: "Start course"
            } :
            {
                label: "Premium",
                available: false,
                action: "Sign in to unlock"
            };
    }
    const assigned = window.Phishy.store.isAssigned(user.id, course.id);
    const done = !!window.Phishy.store.getProgress(user.id, course.id);
    if (done) return {
        label: "Completed",
        available: true,
        action: "Review",
        state: "done"
    };
    if (course.isFree) return {
        label: "Free",
        available: true,
        action: "Start course"
    };
    if (assigned) return {
        label: "Assigned",
        available: true,
        action: "Start course",
        state: "assigned"
    };
    return {
        label: "Premium",
        available: false,
        action: "Ask your admin to assign"
    };
}

function renderCatalog() {
    if (!grid || !window.Phishy) return;
    const user = window.Phishy.auth.getCurrentUser();
    const courses = window.Phishy.store.getCourses();

    grid.innerHTML = courses.map(course => {
        const state = courseCardState(course, user);
        const badgeClass = state.state === "done" ? "course-badge-done" :
            state.state === "assigned" ? "course-badge-assigned" :
            course.isFree ? "course-badge-free" : "course-badge-premium";
        const tier = course.isFree ? "free" : "premium";
        const stateClass = state.state === "done" ? " is-done" :
            state.state === "assigned" ? " is-assigned" :
            !state.available ? " is-locked" : "";
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
                    onComplete: async ({
                        score,
                        total
                    }) => {
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
        courseView.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
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
    courseView.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
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
