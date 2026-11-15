
class View {

    constructor() {
        this.currentPage = "home";
        this.currentCategory = "Tous";
        this.currentTab = "favorites";
        this.editingId = null;

        this.selectedActivityId = null;
this.previousPage = "home";

        this.div = document.createElement("div");
        this.div.className = "campus-app";

        this.div.innerHTML = `
            <div class="app-content">

                <section id="homePage">
                    <header class="mb-4">
                        <small class="text-muted">Bonjour 👋</small>
                        <h4 class="fw-bold text-primary">
                            Qu'est-ce qu'on fait aujourd'hui ?
                        </h4>
                    </header>

                    <div id="categoryFilters"
                         class="d-flex gap-2 flex-wrap mb-4">
                        <button class="btn btn-primary btn-sm"
                                data-category="Tous">Tous</button>
                        <button class="btn btn-outline-primary btn-sm"
                                data-category="Pause Express">Pause Express</button>
                        <button class="btn btn-outline-primary btn-sm"
                                data-category="Afterwork">Afterworks</button>
                        <button class="btn btn-outline-primary btn-sm"
                                data-category="Game Jam">Game Jam</button>
                    </div>

<div class="d-flex justify-content-between align-items-center mb-3">
    <h6 class="fw-bold text-primary mb-0">
        LES ACTIVITÉS
    </h6>

    <span id="activityCounter"
          class="badge rounded-pill bg-primary">
        0
    </span>
</div>

                    <div id="activitiesList"></div>
                </section>

                <section id="myActivitiesPage" class="d-none">
                    <h4 class="fw-bold text-primary mb-4">
                        Mes activités
                    </h4>

                    <div class="d-flex gap-2 mb-4">
                        <button id="favoritesTab"
                                class="btn btn-primary flex-fill">
                            Favoris
                        </button>

                        <button id="organizedTab"
                                class="btn btn-outline-primary flex-fill">
                            Organisées
                        </button>
                    </div>

                    <div id="myActivitiesList"></div>
                </section>


<section id="detailsPage" class="d-none">

    <div class="d-flex align-items-center gap-3 mb-4">
        <button id="backFromDetails"
                class="btn btn-light rounded-circle">
            ←
        </button>

        <h5 class="fw-bold text-primary mb-0">
            Détails de l'activité
        </h5>
    </div>

    <div id="activityDetails"></div>

</section>


                <section id="createPage" class="d-none">
                    <h4 id="formTitle" class="fw-bold text-primary mb-4">
                        Créer une activité
                    </h4>

                    <form id="activityForm">
                        <div class="mb-3">
                            <label class="form-label">Titre</label>
                            <input id="activityTitle" type="text"
                                   class="form-control" required>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Catégorie</label>
                            <select id="activityCategory"
                                    class="form-select" required>
                                <option value="Pause Express">Pause Express</option>
                                <option value="Afterwork">Afterwork</option>
                                <option value="Game Jam">Game Jam</option>
                                <option value="Sport">Sport</option>
                            </select>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Date</label>
                            <input id="activityDate" type="date"
                                   class="form-control" required>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Heure</label>
                            <input id="activityTime" type="time"
                                   class="form-control" required>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Lieu</label>
                            <input id="activityLocation" type="text"
                                   class="form-control" required>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">
                                Nombre maximum de participants
                            </label>
                            <input id="activityMax" type="number"
                                   min="1" class="form-control" required>
                        </div>

                        <div class="mb-4">
                            <label class="form-label">Description</label>
                            <textarea id="activityDescription"
                                      class="form-control"
                                      rows="3" required></textarea>
                        </div>

                        <button type="submit"
                                class="btn btn-primary w-100">
                            Publier l'activité
                        </button>
                    </form>
                </section>

            </div>

            <button id="floatingAdd"
                    class="btn btn-primary floating-add"
                    aria-label="Créer une activité">
                +
            </button>

            <nav class="bottom-nav">
                <button data-page="home" class="nav-item active">
                    🏠<span>Accueil</span>
                </button>

                <button data-page="myActivities" class="nav-item">
                    ❤️<span>Mes activités</span>
                </button>

                <button data-page="create" class="nav-item">
                    ➕<span>Créer</span>
                </button>
            </nav>
        `;

        this.activitiesList =
            this.div.querySelector("#activitiesList");

        this.myActivitiesList =
            this.div.querySelector("#myActivitiesList");

        this.categoryFilters =
            this.div.querySelector("#categoryFilters");

        this.activityForm =
            this.div.querySelector("#activityForm");

        this.activityDetails =
    this.div.querySelector("#activityDetails");

        document.querySelector("#app").appendChild(this.div);
    }

    // Évite d'insérer directement du texte utilisateur
    // dans les templates HTML.
    escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }


activityCard(activity, organized = false) {

    const title = this.escapeHTML(activity.title);
    const location = this.escapeHTML(activity.location);
    const category = this.escapeHTML(activity.category);
    const date = this.escapeHTML(activity.date);
    const time = this.escapeHTML(activity.time);
    const description = this.escapeHTML(activity.description);

    const image = this.escapeHTML(
        activity.image || "assets/images/default.jpg"
    );

    const participantsCount = activity.participants.length;
    const maxParticipants = activity.maxParticipants;

    return `
        <article class="activity-card mb-4">

            <div class="activity-image-container">
                <img
                    src="${image}"
                    alt="${title}"
                    class="activity-image"
                    onerror="this.style.display='none'"
                >

                <span class="activity-category-badge">
                    ${category}
                </span>

                <button
                    class="activity-favorite"
                    data-action="favorite"
                    data-id="${activity.id}"
                    aria-label="Ajouter ou retirer des favoris">
                    ${activity.favorite ? "❤️" : "🤍"}
                </button>
            </div>

            <div class="activity-card-content">

                <h5 class="activity-card-title">
                    ${title}
                </h5>

                <p class="activity-description">
                    ${description}
                </p>

                <div class="activity-meta">
                    <span>📅 ${date} · ${time}</span>
                    <span>📍 ${location}</span>
                </div>

                <div class="activity-participants">
                    <span>
                        👥 ${participantsCount}/${maxParticipants}
                        participants
                    </span>

                    <span class="availability-badge">
                        ${Math.max(0, maxParticipants - participantsCount)}
                        places
                    </span>
                </div>

                <button
                    class="btn btn-outline-primary w-100 mt-3"
                    data-action="details"
                    data-id="${activity.id}">
                    Voir les détails
                </button>

                ${organized ? `
                    <div class="d-flex gap-2 mt-2">
                        <button
                            class="btn btn-light flex-fill"
                            data-action="edit"
                            data-id="${activity.id}">
                            Modifier
                        </button>

                        <button
                            class="btn btn-outline-danger flex-fill"
                            data-action="delete"
                            data-id="${activity.id}">
                            Supprimer
                        </button>
                    </div>
                ` : ""}

            </div>
        </article>
    `;
}

renderActivityCount(count) {
    this.div.querySelector("#activityCounter").textContent = count;
}
    renderActivities(activities) {
        const filtered = activities.filter(activity =>
            this.currentCategory === "Tous" ||
            activity.category === this.currentCategory
        );

        this.activitiesList.innerHTML = filtered.length
            ? filtered.map(a => this.activityCard(a)).join("")
            : `<p class="text-center text-muted">
                   Aucune activité disponible.
               </p>`;
    }

    renderMyActivities(model) {
        const activities = this.currentTab === "favorites"
            ? model.getFavorites()
            : model.getOrganizedActivities();

        this.myActivitiesList.innerHTML = activities.length
            ? activities.map(a =>
                this.activityCard(
                    a,
                    this.currentTab === "organized"
                )
              ).join("")
            : `<p class="text-center text-muted">
                   Aucune activité dans cette catégorie.
               </p>`;

        this.div.querySelector("#favoritesTab").className =
            this.currentTab === "favorites"
                ? "btn btn-primary flex-fill"
                : "btn btn-outline-primary flex-fill";

        this.div.querySelector("#organizedTab").className =
            this.currentTab === "organized"
                ? "btn btn-primary flex-fill"
                : "btn btn-outline-primary flex-fill";
    }

    renderFilters() {
        this.categoryFilters
            .querySelectorAll("[data-category]")
            .forEach(button => {
                const active =
                    button.dataset.category === this.currentCategory;

                button.classList.toggle("btn-primary", active);
                button.classList.toggle("btn-outline-primary", !active);
            });
    }

    showPage(page) {
        this.currentPage = page;

        const pages = {
    home: "#homePage",
    myActivities: "#myActivitiesPage",
    create: "#createPage",
    details: "#detailsPage"
};

        Object.values(pages).forEach(selector => {
            this.div.querySelector(selector)
                .classList.add("d-none");
        });

        this.div.querySelector(pages[page])
            .classList.remove("d-none");

        this.div.querySelectorAll("[data-page]")
            .forEach(button => {
                button.classList.toggle(
                    "active",
                    button.dataset.page === page
                );
            });

        this.div.querySelector("#floatingAdd")
            .classList.toggle("d-none", page === "create");
    }

    resetForm() {
        this.editingId = null;
        this.activityForm.reset();
        this.div.querySelector("#formTitle").textContent =
            "Créer une activité";
    }

    fillForm(activity) {
        this.editingId = activity.id;

        this.div.querySelector("#formTitle").textContent =
            "Modifier une activité";

        this.div.querySelector("#activityTitle").value =
            activity.title;

        this.div.querySelector("#activityCategory").value =
            activity.category;

        this.div.querySelector("#activityDate").value =
            activity.date;

        this.div.querySelector("#activityTime").value =
            activity.time;

        this.div.querySelector("#activityLocation").value =
            activity.location;

        this.div.querySelector("#activityMax").value =
            activity.maxParticipants;

        this.div.querySelector("#activityDescription").value =
            activity.description;
    }

    getFormData() {
        return {
            title: this.div.querySelector("#activityTitle").value.trim(),
            category: this.div.querySelector("#activityCategory").value,
            date: this.div.querySelector("#activityDate").value,
            time: this.div.querySelector("#activityTime").value,
            location: this.div.querySelector("#activityLocation").value.trim(),
            maxParticipants: Number(
                this.div.querySelector("#activityMax").value
            ),
            description: this.div.querySelector("#activityDescription").value.trim()
        };
    }


renderActivityDetails(activity, currentUserId) {

    if (!activity) {
        this.activityDetails.innerHTML = `
            <p class="text-muted text-center">
                Cette activité n'existe plus.
            </p>
        `;
        return;
    }

    const isParticipant =
        activity.participants.includes(currentUserId);

    const isFull =
        activity.participants.length >= activity.maxParticipants;

    const remaining =
        activity.maxParticipants - activity.participants.length;

    this.activityDetails.innerHTML = `
        <div class="card p-4">

            <div class="activity-banner mb-3">
    <img
        src="${this.escapeHTML(activity.image || 'assets/images/default.jpg')}"
        alt="${this.escapeHTML(activity.title)}"
        class="activity-image"
        onerror="this.style.display='none'"
    >
</div>

            <h4 class="fw-bold text-primary">
                ${this.escapeHTML(activity.title)}
            </h4>

            <span class="badge bg-light text-primary mb-3">
                ${this.escapeHTML(activity.category)}
            </span>

            <div class="mb-3">
                <p class="mb-2">
                    📅 ${this.escapeHTML(activity.date)}
                    à ${this.escapeHTML(activity.time)}
                </p>

                <p class="mb-2">
                    📍 ${this.escapeHTML(activity.location)}
                </p>
            </div>

            <h6 class="fw-bold">Description</h6>

            <p class="text-muted">
                ${this.escapeHTML(activity.description)}
            </p>

            <hr>

            <h6 class="fw-bold">Participants</h6>

            <p>
                ${activity.participants.length}
                / ${activity.maxParticipants}
                participants
            </p>

            <div class="progress mb-3">
                <div class="progress-bar"
                     role="progressbar"
                     style="width: ${Math.min(
                         100,
                         activity.participants.length /
                         activity.maxParticipants * 100
                     )}%">
                </div>
            </div>

            <p class="small text-muted">
                ${remaining} place(s) disponible(s)
            </p>

            <button
                class="btn ${isParticipant
                    ? "btn-outline-danger"
                    : "btn-primary"} w-100"
                data-action="${isParticipant ? "leave" : "join"}"
                data-id="${activity.id}"
                ${!isParticipant && isFull ? "disabled" : ""}>

                ${isParticipant
                    ? "Quitter l'activité"
                    : isFull
                        ? "Activité complète"
                        : "Rejoindre la pause"}
            </button>

            <div class="text-center mt-3">
                ${isParticipant
                    ? `<span class="text-success fw-bold">
                           ✓ Vous avez rejoint cette activité
                       </span>`
                    : ""}
            </div>
        </div>
    `;
}

}
