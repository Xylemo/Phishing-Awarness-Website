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
        <div class="demo-feedback quiz-feedback" hidden>
          <h3 class="quiz-fb-title"></h3>
          <p class="quiz-fb-explain"></p>
          <button class="demo-button demo-button-next" type="button" data-quiz="next">Next question →</button>
        </div>
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
        const nextBtn = container.querySelector('[data-quiz="next"]');
        const feedback = container.querySelector(".quiz-feedback");
        const fbTitle = container.querySelector(".quiz-fb-title");
        const fbExplain = container.querySelector(".quiz-fb-explain");
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
            feedback.hidden = true;
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
            fbTitle.textContent = correct ?
                "Correct!" :
                `Not quite this one was ${q.isPhishing ? "phishing" : "safe"}.`;
            fbExplain.textContent = q.explain;
            feedback.hidden = false;
            scoreEl.textContent = `Score: ${score}`;
            nextBtn.textContent = index === total - 1 ? "See results" : "Next question →";
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
            feedback.hidden = true;
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

        nextBtn.addEventListener("click", next);
        show();
    }

    global.PhishyQuiz = {
        run
    };
})(window);
