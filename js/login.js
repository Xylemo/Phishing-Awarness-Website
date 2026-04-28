const form = document.getElementById("login-form");
const notice = document.getElementById("login-notice");
const errorBox = document.getElementById("login-error");

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (errorBox) {
      errorBox.hidden = true;
      errorBox.textContent = "";
    }

    const email = form.elements.email.value.trim();
    const password = form.elements.password.value;

    if (!email || !password) {
      if (errorBox) {
        errorBox.textContent = "Enter your email and password.";
        errorBox.hidden = false;
      }
      return;
    }

    if (!window.Phishy) {
      if (notice) notice.hidden = false;
      return;
    }

    const submitBtn = form.querySelector(".auth-submit");
    if (submitBtn) submitBtn.disabled = true;

    try {
      const user = await window.Phishy.auth.signIn(email, password);
      if (!user) {
        if (errorBox) {
          errorBox.textContent =
            "That email and password didn't match. Try one of the demo accounts shown below.";
          errorBox.hidden = false;
        }
        return;
      }
      const next = user.role === "admin" ? "../admin/" : "../dashboard/";
      window.location.href = next;
    } catch (err) {
      if (errorBox) {
        errorBox.textContent = err.message || "Sign in failed. Try again.";
        errorBox.hidden = false;
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}
