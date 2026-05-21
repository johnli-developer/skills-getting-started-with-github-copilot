document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message and reset activity selector
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";
        activityCard.setAttribute("data-activity", name);

        const spotsLeft = details.max_participants - details.participants.length;
        const participantsHeader = details.participants.length > 0 ? "Participants" : "No participants yet";

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p class="availability"><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <p class="participants-title">${participantsHeader}</p>
            <ul class="participants-list">
              ${details.participants
                .map(
                  (participant) =>
                    `<li class="participant-item"><span class="participant-email">${participant}</span><button class="participant-delete" data-activity="${name}" data-email="${participant}" aria-label="Remove ${participant}">&times;</button></li>`
                )
                .join("")}
            </ul>
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Immediately update the DOM for the specific activity so users see the change
        try {
          const cards = Array.from(activitiesList.querySelectorAll('.activity-card'));
          const card = cards.find(c => {
            const h4 = c.querySelector('h4');
            return h4 && h4.textContent.trim() === activity;
          });

          if (card) {
            const ul = card.querySelector('.participants-list');
            const title = card.querySelector('.participants-title');
            const avail = card.querySelector('.availability');

            if (ul) {
              const li = document.createElement('li');
              li.className = 'participant-item';
              li.innerHTML = `<span class="participant-email">${email}</span><button class="participant-delete" data-activity="${activity}" data-email="${email}" aria-label="Remove ${email}">&times;</button>`;
              ul.appendChild(li);
            }

            if (title && title.textContent.includes('No participants')) {
              title.textContent = 'Participants';
            }

            if (avail) {
              const m = avail.textContent.match(/(\d+) spots left/);
              if (m) {
                const n = Math.max(0, parseInt(m[1], 10) - 1);
                avail.innerHTML = `<strong>Availability:</strong> ${n} spots left`;
              }
            }
          }
        } catch (err) {
          console.error('Error updating DOM after signup:', err);
        }

        // Refresh full list to ensure consistency
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Event delegation for participant delete buttons
  activitiesList.addEventListener("click", async (event) => {
    const btn = event.target.closest(".participant-delete");
    if (!btn) return;

    const email = btn.dataset.email;
    const activity = btn.dataset.activity;

    if (!email || !activity) return;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/participants?email=${encodeURIComponent(email)}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        messageDiv.classList.remove("hidden");
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "Failed to remove participant";
        messageDiv.className = "error";
        messageDiv.classList.remove("hidden");
      }

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to remove participant. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error removing participant:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
