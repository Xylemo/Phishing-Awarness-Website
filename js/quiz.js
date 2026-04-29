(function(global) {
    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function avatarInitial(label) {
        return escapeHtml(String(label || "?").trim().charAt(0).toUpperCase() || "?");
    }

    function closeEmailMenus(root) {
        (root || document).querySelectorAll(".sim-email-menu.is-open").forEach(menu => {
            menu.classList.remove("is-open");
            const toggle = menu.querySelector(".sim-email-menu-toggle");
            if (toggle) toggle.setAttribute("aria-expanded", "false");
        });
    }

    function renderScenario(s) {
        if (s.type === "url") {
            return `
        <div class="sim-message sim-url">
          <div class="sim-url-context">${escapeHtml(s.context || "Would you enter your password on this page?")}</div>
          <div class="sim-url-bar">${escapeHtml(s.url)}</div>
        </div>
      `;
        }
        if (s.type === "sms") {
            return `
        <div class="sim-message sim-sms">
          <div class="sim-phone-shell">
            <div class="sim-imessage-header">
              <div class="sim-imessage-contact">
                <div>
                  <strong>${escapeHtml(s.sender)}</strong>
                </div>
              </div>
            </div>
            <div class="sim-imessage-thread">
              <div class="sim-imessage-phone">
                <div class="sim-sms-bubble">${escapeHtml(s.body)}</div>
                <div class="sim-imessage-alert">
                  <p>If you did not expect this message from an unknown sender, it may be spam.</p>
                  <button class="sim-sms-report-btn" type="button">Report Spam</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
        }
        const bodyHtml = escapeHtml(s.body).replace(/\n/g, "<br />");
        return `
      <div class="sim-message sim-email">
        <article class="sim-email-card sim-gmail-page">
          <h3 class="sim-email-title">${escapeHtml(s.subject)}</h3>
          <div class="sim-email-menu">
            <button class="sim-email-menu-toggle" type="button" aria-expanded="false" aria-label="More email actions">&#8942;</button>
            <div class="sim-email-menu-panel">
              <button class="sim-email-menu-action sim-email-report-btn" type="button">Report phishing</button>
            </div>
          </div>
          <div class="sim-email-header">
            <span class="sim-email-avatar">${avatarInitial(s.fromName)}</span>
            <div class="sim-email-meta">
              <div class="sim-email-sender-line">
                <strong>${escapeHtml(s.fromName)}</strong>
                <span>&lt;${escapeHtml(s.fromAddress)}&gt;</span>
              </div>
              <div class="sim-email-recipient-line">to me</div>
            </div>
          </div>
          <div class="sim-email-body">${bodyHtml}</div>
        </article>
      </div>
    `;
    }

    function run(container, questions, options) {
        const opts = options || {};
        const simulationId = opts.simulationId || "quiz";
        const total = questions.length;
        let index = 0;
        let score = 0;
        let answered = false;
        let runId = null;

        if (window.Phishy && window.Phishy.analytics) {
            window.Phishy.analytics
                .startSimulation(simulationId)
                .then((r) => { runId = r && r.runId; })
                .catch(() => {});
        }

        container.innerHTML = `
      <div class="quiz-shell">
        <div class="demo-progress quiz-progress">
          <span class="quiz-counter"></span>
          <div class="demo-progress-bar"><div class="demo-progress-fill quiz-fill"></div></div>
          <span class="quiz-score"></span>
        </div>
        <div class="sim-stage quiz-stage"></div>
        <div class="demo-actions quiz-actions"></div>
        <div class="demo-complete quiz-complete" hidden>
          <h2>Quiz complete</h2>
          <p class="quiz-complete-score"></p>
          <p class="quiz-complete-msg"></p>
          <div class="quiz-complete-actions"></div>
        </div>
      </div>
    `;

        const counter = container.querySelector(".quiz-counter");
        const fill = container.querySelector(".quiz-fill");
        const scoreEl = container.querySelector(".quiz-score");
        const stage = container.querySelector(".quiz-stage");
        const actions = container.querySelector(".quiz-actions");
        const progressEl = container.querySelector(".quiz-progress");
        const complete = container.querySelector(".quiz-complete");
        const completeScore = container.querySelector(".quiz-complete-score");
        const completeMsg = container.querySelector(".quiz-complete-msg");
        const completeActions = container.querySelector(".quiz-complete-actions");

        function renderActions() {
            return `
                <button class="demo-button demo-button-safe" type="button" data-quiz="safe">Continue Safe</button>
            `;
        }

        function nextLabel() {
            return index === total - 1 ? "See results" : "Next question →";
        }

        function showInlineFeedback(q, correct) {
            const host = q.type === "sms"
                ? stage.querySelector(".sim-imessage-thread")
                : q.type === "email"
                    ? stage.querySelector(".sim-email-card")
                    : stage.querySelector(".sim-url");
            const target = q.type === "sms"
                ? stage.querySelector(".sim-sms-bubble")
                : q.type === "email"
                    ? stage.querySelector(".sim-email-card")
                    : stage.querySelector(".sim-url-bar");

            if (host) {
                host.querySelector(".sim-inline-feedback")?.remove();
                host.classList.add("has-inline-feedback", `has-inline-feedback-${q.type}`);
            }
            if (target) {
                target.classList.add("sim-highlight-target", q.isPhishing ? "is-phishing" : "is-safe");
            }
            if (!host) return;

            const overlay = document.createElement("div");
            overlay.className = `sim-inline-feedback sim-inline-feedback-${q.type} ${q.isPhishing ? "is-phishing" : "is-safe"}`;
            overlay.innerHTML = `
                <span class="sim-inline-feedback-badge">${q.isPhishing ? "Phishing" : "Safe"}</span>
                <h4>${correct ? "Correct" : "Not quite"}: this one is ${q.isPhishing ? "phishing" : "safe"}.</h4>
                <p>${escapeHtml(q.explain || "")}</p>
                <button class="demo-button demo-button-next sim-inline-feedback-next" type="button" data-quiz-next="true">${nextLabel()}</button>
            `;
            host.appendChild(overlay);
        }

        function show() {
            answered = false;
            const q = questions[index];
            stage.innerHTML = renderScenario(q);
            closeEmailMenus(stage);
            actions.innerHTML = renderActions();
            actions.classList.add("is-single");
            counter.textContent = `Question ${index + 1} of ${total}`;
            fill.style.width = `${(index / total) * 100}%`;
            scoreEl.textContent = `Score: ${score}`;
            actions.hidden = false;
        }

        function answer(chose) {
            if (answered) return;
            answered = true;
            const q = questions[index];
            const correct = chose === q.isPhishing;
            if (correct) score += 1;
            if (window.Phishy && window.Phishy.analytics) {
                window.Phishy.analytics.recordAnswer(
                    runId,
                    `${simulationId}:${index}`,
                    chose ? "phishing" : "safe",
                    correct
                );
            }
            closeEmailMenus(stage);
            actions.querySelectorAll("button").forEach((b) => { b.disabled = true; });
            actions.hidden = true;
            scoreEl.textContent = `Score: ${score}`;
            showInlineFeedback(q, correct);
        }

        function next() {
            if (index < total - 1) {
                index += 1;
                show();
                return;
            }
            finish();
        }

        function finish() {
            stage.innerHTML = "";
            actions.hidden = true;
            progressEl.hidden = true;
            const pct = total > 0 ? score / total : 0;
            completeScore.textContent = `You scored ${score} out of ${total}.`;
            completeMsg.textContent =
                pct === 1 ? "Perfect you've got this one nailed." :
                pct >= 0.8 ? "Strong run. Review the explanations on the misses and try again to lock it in." :
                pct >= 0.5 ? "Decent first pass. Run it again to sharpen the patterns you missed." :
                "Plenty of room to grow. Re-read the related material and try this one again.";
            completeActions.innerHTML = `<button class="demo-button demo-button-next" type="button" data-quiz="restart">Try again</button>`;
            complete.hidden = false;
            const restartBtn = container.querySelector('[data-quiz="restart"]');
            restartBtn.addEventListener("click", () => {
                index = 0;
                score = 0;
                runId = null;
                if (window.Phishy && window.Phishy.analytics) {
                    window.Phishy.analytics
                        .startSimulation(simulationId)
                        .then((r) => { runId = r && r.runId; })
                        .catch(() => {});
                }
                progressEl.hidden = false;
                complete.hidden = true;
                show();
            });
            if (window.Phishy && window.Phishy.analytics) {
                window.Phishy.analytics.finishSimulation(runId, score, total);
            }
            if (typeof opts.onComplete === "function") {
                opts.onComplete({
                    score,
                    total
                });
            }
        }

        stage.addEventListener("click", (event) => {
            if (event.target.closest("[data-quiz-next]")) {
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

        actions.addEventListener("click", (event) => {
            const btn = event.target.closest('[data-quiz="safe"]');
            if (btn) answer(false);
        });

        show();
    }

    global.PhishyQuiz = {
        run
    };
})(window);
