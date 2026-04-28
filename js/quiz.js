(function(global) {
    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
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
          <div class="sim-sms-header">
            <span class="sim-sms-label">Text message</span>
            <span class="sim-sms-sender">${escapeHtml(s.sender)}</span>
          </div>
          <div class="sim-sms-bubble">${escapeHtml(s.body)}</div>
        </div>
      `;
        }
        const bodyHtml = escapeHtml(s.body).replace(/\n/g, "<br />");
        return `
      <div class="sim-message sim-email">
        <div class="sim-email-header">
          <div class="sim-email-row">
            <span class="sim-email-label">From</span>
            <span class="sim-email-value">
              <strong>${escapeHtml(s.fromName)}</strong>
              &lt;${escapeHtml(s.fromAddress)}&gt;
            </span>
          </div>
          <div class="sim-email-row">
            <span class="sim-email-label">Subject</span>
            <span class="sim-email-value">${escapeHtml(s.subject)}</span>
          </div>
        </div>
        <div class="sim-email-body">${bodyHtml}</div>
      </div>
    `;
    }

    function run(container, questions, options) {
        const opts = options || {};
        const total = questions.length;
        let index = 0;
        let score = 0;
        let answered = false;

        container.innerHTML = `
      <div class="quiz-shell">
        <div class="demo-progress quiz-progress">
          <span class="quiz-counter"></span>
          <div class="demo-progress-bar"><div class="demo-progress-fill quiz-fill"></div></div>
          <span class="quiz-score"></span>
        </div>
        <div class="sim-stage quiz-stage"></div>
        <div class="demo-actions quiz-actions">
          <button class="demo-button demo-button-danger" type="button" data-quiz="phishing">Phishing</button>
          <button class="demo-button demo-button-safe" type="button" data-quiz="safe">Safe</button>
        </div>
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
        const phishingBtn = container.querySelector('[data-quiz="phishing"]');
        const safeBtn = container.querySelector('[data-quiz="safe"]');
        const nextBtn = container.querySelector('[data-quiz="next"]');
        const feedback = container.querySelector(".quiz-feedback");
        const fbTitle = container.querySelector(".quiz-fb-title");
        const fbExplain = container.querySelector(".quiz-fb-explain");
        const progressEl = container.querySelector(".quiz-progress");
        const complete = container.querySelector(".quiz-complete");
        const completeScore = container.querySelector(".quiz-complete-score");
        const completeMsg = container.querySelector(".quiz-complete-msg");
        const completeActions = container.querySelector(".quiz-complete-actions");

        function show() {
            answered = false;
            const q = questions[index];
            stage.innerHTML = renderScenario(q);
            counter.textContent = `Question ${index + 1} of ${total}`;
            fill.style.width = `${(index / total) * 100}%`;
            scoreEl.textContent = `Score: ${score}`;
            feedback.hidden = true;
            actions.hidden = false;
            phishingBtn.disabled = false;
            safeBtn.disabled = false;
        }

        function answer(chose) {
            if (answered) return;
            answered = true;
            const q = questions[index];
            const correct = chose === q.isPhishing;
            if (correct) score += 1;
            phishingBtn.disabled = true;
            safeBtn.disabled = true;
            actions.hidden = true;
            fbTitle.textContent = correct ?
                "Correct!" :
                `Not quite — this one was ${q.isPhishing ? "phishing" : "safe"}.`;
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
                progressEl.hidden = false;
                complete.hidden = true;
                show();
            });
            if (typeof opts.onComplete === "function") {
                opts.onComplete({
                    score,
                    total
                });
            }
        }

        phishingBtn.addEventListener("click", () => answer(true));
        safeBtn.addEventListener("click", () => answer(false));
        nextBtn.addEventListener("click", next);
        show();
    }

    global.PhishyQuiz = {
        run
    };
})(window);