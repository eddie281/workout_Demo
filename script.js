// Fitness Tracker App Script

let workouts = [];
let lastDeleted = null;
let currentName = null;
let currentEmail = null;
let currentGoal = null;

// Utility: apply theme mode
function applyTheme(mode) {
  if (mode === "dark") {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }
}

// Utility: apply text size
function applyTextSize(size) {
  if (size === "large") {
    document.body.classList.add("large-text");
  } else {
    document.body.classList.remove("large-text");
  }
}

// Utility: apply dashboard view mode (summary vs detailed)
function applyViewMode(view) {
  if (view === "detailed") {
    document.getElementById("summaryView").style.display = "none";
    document.getElementById("detailedView").style.display = "block";
  } else {
    document.getElementById("summaryView").style.display = "block";
    document.getElementById("detailedView").style.display = "none";
  }
}

// Render dashboard summary and detailed list
function renderDashboard() {
  // Summary stats
  let total = workouts.length;
  let totalMin = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
  document.getElementById("totalWorkouts").textContent = total;
  document.getElementById("totalMinutes").textContent = totalMin;
  // Detailed list
  let listEl = document.getElementById("activityList");
  listEl.innerHTML = "";
  workouts.forEach((w, index) => {
    let li = document.createElement("li");
    let dateStr = w.date ? w.date : "(no date)";
    li.textContent = `${dateStr} - ${w.activity} for ${w.duration} min`;
    if (w.notes && w.notes.trim() !== "") {
      li.textContent += ` (${w.notes.trim()})`;
    }
    // Delete button for each entry
    let delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "deleteBtn";
    delBtn.dataset.index = index;
    li.appendChild(delBtn);
    listEl.appendChild(li);
  });
  // Attach delete event handlers
  document.querySelectorAll(".deleteBtn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      let idx = e.target.dataset.index;
      if (idx >= 0) {
        // Remove entry and save for undo
        lastDeleted = workouts[idx];
        workouts.splice(idx, 1);
        localStorage.setItem("workouts", JSON.stringify(workouts));
        renderDashboard();
        // Show undo prompt
        document.getElementById("undoMsg").style.display = "block";
      }
    });
  });
}

// Show a given main section and highlight nav
function showSection(section) {
  // Hide all sections
  document.getElementById("dashboardSection").style.display = "none";
  document.getElementById("logSection").style.display = "none";
  document.getElementById("settingsSection").style.display = "none";
  document.getElementById("helpSection").style.display = "none";
  // Show target section
  document.getElementById(section + "Section").style.display = "block";
  // Update nav active state
  document
    .querySelectorAll(".navbtn")
    .forEach((btn) => btn.classList.remove("active"));
  let navBtnId = "nav" + section.charAt(0).toUpperCase() + section.slice(1);
  let activeBtn = document.getElementById(navBtnId);
  if (activeBtn) activeBtn.classList.add("active");
}

// Initialize main app (after onboarding)
function initMain() {
  // Welcome message
  let name = localStorage.getItem("name") || "Guest";
  document.getElementById("welcomeMsg").textContent = "Hello, " + name + "!";
  // Display goal if set
  let goal = localStorage.getItem("goal");
  if (goal) {
    document.getElementById("goalDisplay").textContent =
      "Daily Goal: " + goal + " steps";
  }
  // Load saved workouts
  let stored = localStorage.getItem("workouts");
  workouts = stored ? JSON.parse(stored) : [];
  // Apply preferences
  let theme = localStorage.getItem("theme") || "light";
  let textSize = localStorage.getItem("textSize") || "normal";
  let viewMode = localStorage.getItem("viewMode") || "summary";
  applyTheme(theme);
  applyTextSize(textSize);
  applyViewMode(viewMode);
  // Set settings controls to current values
  document.getElementById("darkModeToggle").checked = theme === "dark";
  document.getElementById("fontSizeSelect").value = textSize;
  document.getElementById("viewSelect").value = viewMode;
  // Render dashboard content
  renderDashboard();
  // Show Dashboard by default
  showSection("dashboard");
}

// On page load, decide onboarding vs main app
window.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("name")) {
    // User already set up -> go to main app
    document.getElementById("onboarding").style.display = "none";
    document.getElementById("mainApp").style.display = "block";
    initMain();
  } else {
    // First visit -> show onboarding
    document.getElementById("onboarding").style.display = "block";
    document.getElementById("mainApp").style.display = "none";
  }

  // Onboarding step 1 Next
  document.getElementById("next1").addEventListener("click", () => {
    // Clear previous errors
    document.getElementById("nameError").textContent = "";
    document.getElementById("emailError").textContent = "";
    document.getElementById("passwordError").textContent = "";
    document.getElementById("confirmError").textContent = "";
    // Validate inputs
    let nameVal = document.getElementById("nameInput").value.trim();
    let emailVal = document.getElementById("emailInput").value.trim();
    let passVal = document.getElementById("passwordInput").value;
    let confirmVal = document.getElementById("confirmInput").value;
    let valid = true;
    if (nameVal === "") {
      document.getElementById("nameError").textContent = "Name is required.";
      valid = false;
    }
    if (emailVal === "" || !emailVal.includes("@")) {
      document.getElementById("emailError").textContent =
        "Please enter a valid email.";
      valid = false;
    }
    if (passVal.length < 6) {
      document.getElementById("passwordError").textContent =
        "Password must be at least 6 characters.";
      valid = false;
    }
    if (confirmVal !== passVal) {
      document.getElementById("confirmError").textContent =
        "Passwords do not match.";
      valid = false;
    }
    if (!valid) return;
    // Save entered data to temp variables
    currentName = nameVal;
    currentEmail = emailVal;
    // (Password is not stored in this demo)
    // Proceed to next step
    document.getElementById("step1").style.display = "none";
    document.getElementById("step2").style.display = "block";
  });

  // Onboarding step 2 Next
  document.getElementById("next2").addEventListener("click", () => {
    document.getElementById("goalError").textContent = "";
    let goalVal = document.getElementById("goalInput").value;
    if (goalVal === "" || parseInt(goalVal) <= 0) {
      document.getElementById("goalError").textContent =
        "Please enter a valid goal or skip.";
      return;
    }
    currentGoal = parseInt(goalVal);
    document.getElementById("step2").style.display = "none";
    document.getElementById("step3").style.display = "block";
  });

  // Onboarding Finish (step 3)
  document.getElementById("finishBtn").addEventListener("click", () => {
    // Get preferences selections
    let darkPref = document.getElementById("darkModeInput").checked;
    let textPref = document.getElementById("textSizeSelect").value;
    // Save profile & prefs to localStorage
    localStorage.setItem("name", currentName ? currentName : "Guest");
    localStorage.setItem("goal", currentGoal ? currentGoal : "10000");
    localStorage.setItem("theme", darkPref ? "dark" : "light");
    localStorage.setItem("textSize", textPref);
    localStorage.setItem("viewMode", "summary");
    localStorage.setItem("workouts", "[]");
    // Show main app
    document.getElementById("onboarding").style.display = "none";
    document.getElementById("mainApp").style.display = "block";
    // Apply theme/text preferences immediately
    applyTheme(darkPref ? "dark" : "light");
    applyTextSize(textPref);
    // Initialize main content
    initMain();
  });

  // Onboarding Back buttons
  document.getElementById("back1").addEventListener("click", () => {
    document.getElementById("step2").style.display = "none";
    document.getElementById("step1").style.display = "block";
  });
  document.getElementById("back2").addEventListener("click", () => {
    document.getElementById("step3").style.display = "none";
    document.getElementById("step2").style.display = "block";
  });

  // Skip links (with confirmation prompt for mindful decision)
  function skipAll() {
    if (!currentName) currentName = "Guest";
    if (!currentGoal) currentGoal = 10000;
    // Save defaults or collected info
    localStorage.setItem("name", currentName);
    localStorage.setItem("goal", currentGoal.toString());
    localStorage.setItem("theme", "light");
    localStorage.setItem("textSize", "normal");
    localStorage.setItem("viewMode", "summary");
    localStorage.setItem("workouts", "[]");
    // Show main app
    document.getElementById("onboarding").style.display = "none";
    document.getElementById("mainApp").style.display = "block";
    initMain();
  }
  document.getElementById("skipOnboarding").addEventListener("click", (e) => {
    e.preventDefault();
    if (!confirm("Skip setup and continue as guest?")) return;
    currentName = "Guest";
    currentGoal = 10000;
    skipAll();
  });
  document.getElementById("skip2").addEventListener("click", (e) => {
    e.preventDefault();
    if (!confirm("Skip remaining setup steps?")) return;
    if (!currentName) currentName = "Guest";
    currentGoal = 10000;
    skipAll();
  });
  document.getElementById("skip3").addEventListener("click", (e) => {
    e.preventDefault();
    if (!confirm("Skip customization and finish setup?")) return;
    if (!currentName) currentName = "Guest";
    if (!currentGoal) currentGoal = 10000;
    skipAll();
  });

  // Navigation buttons
  document
    .getElementById("navDashboard")
    .addEventListener("click", () => showSection("dashboard"));
  document
    .getElementById("navLog")
    .addEventListener("click", () => showSection("log"));
  document
    .getElementById("navSettings")
    .addEventListener("click", () => showSection("settings"));
  document
    .getElementById("navHelp")
    .addEventListener("click", () => showSection("help"));

  // Settings controls
  document.getElementById("darkModeToggle").addEventListener("change", (e) => {
    let isDark = e.target.checked;
    localStorage.setItem("theme", isDark ? "dark" : "light");
    applyTheme(isDark ? "dark" : "light");
  });
  document.getElementById("fontSizeSelect").addEventListener("change", (e) => {
    let size = e.target.value;
    localStorage.setItem("textSize", size);
    applyTextSize(size);
  });
  document.getElementById("viewSelect").addEventListener("change", (e) => {
    let view = e.target.value;
    localStorage.setItem("viewMode", view);
    applyViewMode(view);
  });

  // Toggle additional fields in Log form
  document.getElementById("toggleDetails").addEventListener("click", (e) => {
    e.preventDefault();
    let extraFields = document.getElementById("additionalFields");
    if (extraFields.style.display === "none") {
      extraFields.style.display = "block";
      document.getElementById("toggleDetails").textContent =
        "Hide extra details";
    } else {
      extraFields.style.display = "none";
      document.getElementById("toggleDetails").textContent = "Add more details";
    }
  });

  // Handle Log Activity form submission
  document.getElementById("logForm").addEventListener("submit", (e) => {
    e.preventDefault();
    document.getElementById("logError").textContent = "";
    let activity = document.getElementById("activityType").value.trim();
    let durationVal = document.getElementById("durationInput").value;
    let dateVal = document.getElementById("dateInput").value;
    let notesVal = document.getElementById("notesInput").value;
    if (activity === "" || durationVal === "") {
      document.getElementById("logError").textContent =
        "Please fill out activity and duration.";
      return;
    }
    // Create entry
    let entry = {
      activity: activity,
      duration: parseInt(durationVal),
      date: dateVal,
      notes: notesVal,
    };
    workouts.push(entry);
    localStorage.setItem("workouts", JSON.stringify(workouts));
    renderDashboard();
    // Reset form for next entry
    document.getElementById("logForm").reset();
    document.getElementById("additionalFields").style.display = "none";
    document.getElementById("toggleDetails").textContent = "Add more details";
    // Clear any undo prompt (new action taken)
    document.getElementById("undoMsg").style.display = "none";
    lastDeleted = null;
    // Feedback for user
    alert("Activity added successfully!");
  });

  // Undo deletion
  document.getElementById("undoLink").addEventListener("click", (e) => {
    e.preventDefault();
    if (lastDeleted) {
      workouts.push(lastDeleted);
      localStorage.setItem("workouts", JSON.stringify(workouts));
      renderDashboard();
      lastDeleted = null;
    }
    document.getElementById("undoMsg").style.display = "none";
  });

  // Help: Show user guide (brief instructions)
  document.getElementById("showGuide").addEventListener("click", (e) => {
    e.preventDefault();
    alert(
      "User Guide:\\n1. Use the Dashboard to view your progress.\\n" +
        "2. Log Activity to add new workouts.\\n" +
        "3. Visit Settings to customize view and preferences.\\n" +
        "4. Use Undo to revert mistakes.\\nHave fun tracking!"
    );
  });

  // Reset all data (Clear data and restart)
  document.getElementById("resetDataBtn").addEventListener("click", () => {
    if (
      confirm("Are you sure you want to delete all data and reset the app?")
    ) {
      localStorage.clear();
      location.reload();
    }
  });
});
