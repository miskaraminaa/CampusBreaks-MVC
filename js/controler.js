
/* ==========================================
   OBSERVER 1 : MISE À JOUR DES ACTIVITÉS
========================================== */

class UpdateActivities extends Observer {

    constructor(view) {
        super();
        this.view = view;
    }

update(observable, object) {
    this.view.renderActivityCount(
        observable.getActivityCount()
    );
}
}


/* ==========================================
   OBSERVER 2 : NAVIGATION / INFORMATIONS
========================================== */

class UpdateNavigation extends Observer {

    constructor(view) {
        super();
        this.view = view;
    }

    update(observable, object) {
        console.log(
            "Nombre d'activités :",
            observable.getActivityCount()
        );
    }
}


/* ==========================================
   OBSERVER 3 : DÉTAILS D'UNE ACTIVITÉ
========================================== */

class UpdateActivityDetails extends Observer {

    constructor(view) {
        super();
        this.view = view;
    }

    update(observable, object) {

        if (this.view.selectedActivityId === null) {
            return;
        }

        const activity = observable.getActivityById(
            this.view.selectedActivityId
        );

        this.view.renderActivityDetails(
            activity,
            observable.currentUserId
        );
    }
}


/* ==========================================
   CONTROLLER PRINCIPAL
========================================== */

class Controler {

    constructor(model) {

        this.model = model;
        this.view = new View();

        /* ==================================
           1. ENREGISTREMENT DES OBSERVERS
        ================================== */

        this.updateActivities =
            new UpdateActivities(this.view);

        this.updateNavigation =
            new UpdateNavigation(this.view);

        this.updateActivityDetails =
            new UpdateActivityDetails(this.view);

        this.model.addObservers(this.updateActivities);
        this.model.addObservers(this.updateNavigation);
        this.model.addObservers(this.updateActivityDetails);


        /* ==================================
           2. ACTIONS : NAVIGATION ET ACTIVITÉS
        ================================== */

        this.view.div.addEventListener("click", event => {

            // RETOUR DEPUIS LES DÉTAILS

            if (event.target.closest("#backFromDetails")) {

                this.view.selectedActivityId = null;
                this.view.showPage(this.view.previousPage);

                return;
            }


            // NAVIGATION PRINCIPALE

            const navButton =
                event.target.closest("[data-page]");

            if (navButton) {

                const page = navButton.dataset.page;

                if (page === "create") {
                    this.view.resetForm();
                }

                this.view.selectedActivityId = null;
                this.view.showPage(page);

                return;
            }


            // BOUTON FLOTTANT : CRÉER

            if (event.target.closest("#floatingAdd")) {

                this.view.resetForm();
                this.view.selectedActivityId = null;
                this.view.showPage("create");

                return;
            }


            // ONGLET FAVORIS

            if (event.target.closest("#favoritesTab")) {

                this.view.currentTab = "favorites";
                this.view.renderMyActivities(this.model);

                return;
            }


            // ONGLET ORGANISÉES

            if (event.target.closest("#organizedTab")) {

                this.view.currentTab = "organized";
                this.view.renderMyActivities(this.model);

                return;
            }


            /* ==================================
               3. ACTIONS SUR LES ACTIVITÉS
            ================================== */

            const actionButton =
                event.target.closest("[data-action]");

            if (!actionButton) return;

            const id = Number(actionButton.dataset.id);
            const action = actionButton.dataset.action;


            // AFFICHER LES DÉTAILS

            if (action === "details") {

                const activity =
                    this.model.getActivityById(id);

                if (!activity) return;

                this.view.previousPage =
                    this.view.currentPage;

                this.view.selectedActivityId = id;

                this.view.renderActivityDetails(
                    activity,
                    this.model.currentUserId
                );

                this.view.showPage("details");

                return;
            }


            // REJOINDRE UNE ACTIVITÉ

            if (action === "join") {

                const success = this.model.joinActivity(
                    id,
                    this.model.currentUserId
                );

                if (!success) {
                    alert(
                        "Impossible de rejoindre cette activité."
                    );
                }

                return;
            }


            // QUITTER UNE ACTIVITÉ

            if (action === "leave") {

                const success = this.model.leaveActivity(
                    id,
                    this.model.currentUserId
                );

                if (!success) {
                    alert(
                        "Impossible de quitter cette activité."
                    );
                }

                return;
            }


            // AJOUTER / RETIRER DES FAVORIS

            if (action === "favorite") {

                this.model.toggleFavorite(id);

                return;
            }


            // SUPPRIMER UNE ACTIVITÉ

            if (action === "delete") {

                const activity =
                    this.model.getActivityById(id);

                if (
                    !activity ||
                    activity.organizerId !==
                        this.model.currentUserId
                ) {
                    return;
                }

                if (confirm("Supprimer cette activité ?")) {

                    this.model.deleteActivity(id);
                }

                return;
            }


            // MODIFIER UNE ACTIVITÉ

            if (action === "edit") {

                const activity =
                    this.model.getActivityById(id);

                if (
                    !activity ||
                    activity.organizerId !==
                        this.model.currentUserId
                ) {
                    return;
                }

                this.view.selectedActivityId = null;

                this.view.fillForm(activity);
                this.view.showPage("create");

                return;
            }

        });


        /* ==================================
           4. ACTIONS : FILTRAGE DES ACTIVITÉS
        ================================== */

        this.view.categoryFilters.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest("[data-category]");

                if (!button) return;

                this.view.currentCategory =
                    button.dataset.category;

                this.view.renderFilters();

                this.view.renderActivities(
                    this.model.getActivities()
                );
            }
        );


        /* ==================================
           5. ACTIONS : FORMULAIRE CRUD
        ================================== */

        this.view.activityForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const data = this.view.getFormData();

                if (
                    !data.title ||
                    !data.location ||
                    !data.description ||
                    !Number.isInteger(data.maxParticipants) ||
                    data.maxParticipants < 1
                ) {

                    alert(
                        "Veuillez remplir correctement le formulaire."
                    );

                    return;
                }


                // MODIFICATION

                if (this.view.editingId !== null) {

                    const existing =
                        this.model.getActivityById(
                            this.view.editingId
                        );

                    if (
                        !existing ||
                        existing.organizerId !==
                            this.model.currentUserId
                    ) {
                        return;
                    }

                    this.model.updateActivity(
                        this.view.editingId,
                        data
                    );

                } else {

                    // CRÉATION

                    this.model.addActivity({

                        ...data,

                        participants: [],

                        organizerId:
                            this.model.currentUserId,

                        favorite: false,

                        image:
                            "assets/images/default.jpg"
                    });
                }


                // RETOUR À MES ACTIVITÉS

                this.view.resetForm();

                this.view.selectedActivityId = null;

                this.view.currentTab = "organized";

                this.view.showPage("myActivities");

                this.view.renderMyActivities(this.model);
            }
        );


        /* ==================================
           6. INITIALISATION
        ================================== */

        this.view.renderFilters();

        this.updateActivities.update(
            this.model,
            null
        );

        this.updateNavigation.update(
            this.model,
            null
        );

        this.view.showPage("home");
    }
}
