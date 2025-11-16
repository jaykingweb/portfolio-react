// Open Modal
function openModal() {
  document.getElementById("messageModal").style.display = "flex";
}

// Close Modal
function closeModal() {
  document.getElementById("messageModal").style.display = "none";
}

// Close when clicking outside modal
window.onclick = function (e) {
  if (e.target === document.getElementById("messageModal")) {
    closeModal();
  }
};

// Toast helper (shows temporary bottom-center popup)
function showToast(message, variant = "success", duration = 3200) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.remove("success");
  void toast.offsetWidth; // force reflow to restart animation
  if (variant === "success") toast.classList.add("success");
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
    // clear text after animation
    setTimeout(() => (toast.textContent = ""), 220);
  }, duration);
}

// Form loading helper: disables/enables submit and cancel buttons and toggles text
function setFormLoading(isLoading) {
  const form = document.getElementById("contactForm");
  if (!form) return;
  const sendBtn =
    form.querySelector(".send-btn") ||
    form.querySelector('button[type="submit"]');
  const cancelBtn = form.querySelector(".cancel-btn");
  if (isLoading) {
    if (sendBtn) {
      sendBtn.dataset._origText = sendBtn.textContent;
      sendBtn.textContent = "Sending...";
      sendBtn.disabled = true;
      sendBtn.setAttribute("aria-busy", "true");
    }
    if (cancelBtn) {
      cancelBtn.disabled = true;
    }
  } else {
    if (sendBtn) {
      if (sendBtn.dataset._origText)
        sendBtn.textContent = sendBtn.dataset._origText;
      sendBtn.disabled = false;
      sendBtn.removeAttribute("aria-busy");
    }
    if (cancelBtn) {
      cancelBtn.disabled = false;
    }
  }
}

// Handle Form Submission
// Config: Formspree endpoint (set by user)
// Using Formspree endpoint provided by user: https://formspree.io/f/xjkjedlr
const EMAIL_ENDPOINT = "https://formspree.io/f/xjkjedlr"; // <-- posts form data to Formspree

document
  .getElementById("contactForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const nameEl = document.getElementById("name");
    const subjectEl = document.getElementById("subject");
    const emailEl = document.getElementById("email");
    const messageEl = document.getElementById("message");

    const name = nameEl ? nameEl.value.trim() : "";
    const subject = subjectEl ? subjectEl.value.trim() : "";
    const email = emailEl ? emailEl.value.trim() : "";
    const message = messageEl ? messageEl.value.trim() : "";

    // Error elements (these should exist in the HTML; if not, create local fallbacks)
    const nameError = document.getElementById("nameError");
    const subjectError = document.getElementById("subjectError");
    const emailError = document.getElementById("emailError");
    const messageError = document.getElementById("messageError");

    let hasError = false;
    if (!name) {
      if (nameError) nameError.textContent = "Full Name is required";
      hasError = true;
    } else if (nameError) {
      nameError.textContent = "";
    }

    if (!subject) {
      if (subjectError) subjectError.textContent = "Subject is required";
      hasError = true;
    } else if (subjectError) {
      subjectError.textContent = "";
    }

    if (!email) {
      if (emailError) emailError.textContent = "Email is required";
      hasError = true;
    } else if (emailError) {
      emailError.textContent = "";
    }

    if (!message) {
      if (messageError) messageError.textContent = "Message is required";
      hasError = true;
    } else if (messageError) {
      messageError.textContent = "";
    }

    if (hasError) return;

    // Helper to fallback to mailto if automated send is not configured or fails
    // Waits `delayMs` (ms) showing a loading state before redirecting to mail client
    const fallbackToMailto = (delayMs = 2000) => {
      const mailtoLink = `mailto:jaywebx@gmail.com?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(
        "From: " + name + " (" + email + ")\n\n" + message
      )}`;
      // show loading UI
      setFormLoading(true);
      setTimeout(() => {
        // open mail client
        window.location.href = mailtoLink;
        // restore UI (in case mail client doesn't navigate)
        setFormLoading(false);
        closeModal();
      }, delayMs);
    };

    // If EMAIL_ENDPOINT provided, try to POST the form data
    if (EMAIL_ENDPOINT && EMAIL_ENDPOINT.trim() !== "") {
      try {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("subject", subject);
        formData.append("email", email);
        formData.append("message", message);

        // Show a simple inline status if available
        let statusEl = document.getElementById("formStatus");
        if (!statusEl) {
          statusEl = document.createElement("div");
          statusEl.id = "formStatus";
          statusEl.style.marginTop = "10px";
          const form = document.getElementById("contactForm");
          if (form) form.appendChild(statusEl);
        }
        statusEl.textContent = "Sending...";

        const res = await fetch(EMAIL_ENDPOINT, {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
          },
        });

        if (res.ok) {
          statusEl.textContent = "Message sent — thank you!";
          // show success toast
          try {
            showToast("Message sent successfully", "success", 3000);
          } catch (e) {
            /* ignore */
          }
          // reset form
          document.getElementById("contactForm").reset();
          setTimeout(() => {
            closeModal();
            statusEl.textContent = "";
          }, 1400);
        } else {
          // Non-2xx from endpoint; fallback to mail client
          statusEl.textContent =
            "Failed to send automatically — opening mail client...";
          // short delay then fallback with loading
          setTimeout(() => {
            fallbackToMailto(2000);
          }, 900);
        }
      } catch (err) {
        // Network or CORS error — fallback
        console.error("Auto-send failed:", err);
        alert(
          "Automatic sending failed. The mail client will open so you can send the message manually."
        );
        fallbackToMailto(2000);
      }
    } else {
      // No endpoint configured; fallback to mailto behavior (user must send manually)
      // show 2s loading then open mail client
      fallbackToMailto(2000);
    }
  });
