const scenarios = [
  {
    url: "https://secure-paypa1.com/login",
    isPhishing: true,
    explanation:
      "The domain uses a '1' instead of an 'l' in 'paypal'. Lookalike domains are one of the most common phishing tactics.",
    screen: `
      <div class="mock-site mock-paypal">
        <div class="mock-nav"><span class="mock-logo">PayPaI</span></div>
        <div class="mock-card">
          <h2>Log in to your account</h2>
          <p class="mock-urgent">Unusual activity detected. Verify within 24 hours or your account will be suspended.</p>
          <label>Email</label>
          <input type="text" placeholder="you@example.com" />
          <label>Password</label>
          <input type="password" placeholder="••••••••" />
          <button type="button">Log In</button>
        </div>
      </div>`,
  },
  {
    url: "https://www.google.com",
    isPhishing: false,
    explanation:
      "The URL is the canonical google.com domain served over HTTPS. The page design matches the real Google homepage with no urgency or credential prompts.",
    screen: `
      <div class="mock-site mock-google">
        <div class="mock-google-top">Gmail Images</div>
        <div class="mock-google-center">
          <div class="mock-google-logo">Google</div>
          <div class="mock-google-search"><span>🔍</span><input type="text" placeholder="Search Google or type a URL" /></div>
          <div class="mock-google-buttons">
            <button type="button">Google Search</button>
            <button type="button">I'm Feeling Lucky</button>
          </div>
        </div>
      </div>`,
  },
  {
    url: "http://appleid-verify.support-check.net/signin",
    isPhishing: true,
    explanation:
      "Apple would never use a subdomain chain like this. The real domain is 'support-check.net', not apple.com. Also notice it's HTTP, not HTTPS.",
    screen: `
      <div class="mock-site mock-apple">
        <div class="mock-apple-bar">🍎</div>
        <div class="mock-card">
          <h2>Sign in to iCloud</h2>
          <p class="mock-urgent">Your Apple ID has been locked. Confirm your identity to restore access.</p>
          <label>Apple ID</label>
          <input type="text" placeholder="name@icloud.com" />
          <label>Password</label>
          <input type="password" placeholder="••••••••" />
          <button type="button">Continue</button>
        </div>
      </div>`,
  },
  {
    url: "https://github.com/login",
    isPhishing: false,
    explanation:
      "This is the real github.com login page on the correct domain with HTTPS. No fake urgency, no suspicious subdomains.",
    screen: `
      <div class="mock-site mock-github">
        <div class="mock-github-logo">⚡ GitHub</div>
        <div class="mock-card mock-card-dark">
          <h2>Sign in to GitHub</h2>
          <label>Username or email address</label>
          <input type="text" />
          <label>Password</label>
          <input type="password" />
          <button type="button">Sign in</button>
          <p class="mock-link">New to GitHub? Create an account.</p>
        </div>
      </div>`,
  },
  {
    url: "https://microsoft-account.verify-login.co/office365",
    isPhishing: true,
    explanation:
      "The real domain here is 'verify-login.co', not microsoft.com. Attackers often stack Microsoft-sounding words into subdomains to make the URL look legitimate at a glance.",
    screen: `
      <div class="mock-site mock-microsoft">
        <div class="mock-card">
          <div class="mock-ms-logo">▦ Microsoft</div>
          <h2>Sign in</h2>
          <p class="mock-urgent">Your mailbox is almost full. Sign in now to avoid losing incoming messages.</p>
          <label>Email, phone, or Skype</label>
          <input type="text" />
          <button type="button">Next</button>
          <p class="mock-link">No account? Create one!</p>
        </div>
      </div>`,
  },
];

const state = {
  index: 0,
  score: 0,
  locked: false,
};

const urlEl = document.getElementById("fake-url");
const screenEl = document.getElementById("fake-screen");
const progressLabel = document.getElementById("demo-progress-label");
const progressFill = document.getElementById("demo-progress-fill");
const scoreLabel = document.getElementById("demo-score-label");
const feedbackEl = document.getElementById("demo-feedback");
const feedbackTitle = document.getElementById("feedback-title");
const feedbackBody = document.getElementById("feedback-body");
const completeEl = document.getElementById("demo-complete");
const finalBody = document.getElementById("final-score-body");
const browserEl = document.getElementById("fake-browser");
const actionsEl = document.querySelector(".demo-actions");

const render = () => {
  const current = scenarios[state.index];
  urlEl.textContent = current.url;
  screenEl.innerHTML = current.screen;
  progressLabel.textContent = `Scenario ${state.index + 1} of ${scenarios.length}`;
  scoreLabel.textContent = `Score: ${state.score}`;
  progressFill.style.width = `${(state.index / scenarios.length) * 100}%`;
  feedbackEl.hidden = true;
  browserEl.classList.remove("is-correct", "is-wrong");
  state.locked = false;
};

const handleAnswer = (userSaidPhishing) => {
  if (state.locked) return;
  state.locked = true;

  const current = scenarios[state.index];
  const correct = userSaidPhishing === current.isPhishing;

  if (correct) state.score += 1;

  browserEl.classList.add(correct ? "is-correct" : "is-wrong");
  feedbackTitle.textContent = correct ? "Correct!" : "Not quite.";
  feedbackBody.textContent = `${current.isPhishing ? "This was phishing. " : "This was legitimate. "}${current.explanation}`;
  feedbackEl.hidden = false;
  scoreLabel.textContent = `Score: ${state.score}`;
};

const next = () => {
  state.index += 1;
  if (state.index >= scenarios.length) {
    showComplete();
    return;
  }
  render();
};

const showComplete = () => {
  browserEl.hidden = true;
  actionsEl.hidden = true;
  feedbackEl.hidden = true;
  completeEl.hidden = false;
  progressFill.style.width = "100%";
  progressLabel.textContent = `Scenario ${scenarios.length} of ${scenarios.length}`;
  finalBody.textContent = `You scored ${state.score} out of ${scenarios.length}. ${
    state.score === scenarios.length
      ? "Perfect — you're spotting the tells."
      : state.score >= Math.ceil(scenarios.length * 0.6)
        ? "Solid. Keep sharpening your eye on URL details."
        : "Worth another run — focus on the domain and any urgency cues."
  }`;
};

const restart = () => {
  state.index = 0;
  state.score = 0;
  browserEl.hidden = false;
  actionsEl.hidden = false;
  completeEl.hidden = true;
  render();
};

document.getElementById("btn-phishing").addEventListener("click", () => handleAnswer(true));
document.getElementById("btn-legit").addEventListener("click", () => handleAnswer(false));
document.getElementById("btn-next").addEventListener("click", next);
document.getElementById("btn-restart").addEventListener("click", restart);

render();
