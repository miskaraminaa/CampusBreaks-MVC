
/* ==========================================
   OBSERVER 1 : MISE À JOUR DES ACTIVITÉS
========================================== */

class UpdateActivities extends Observer {

    constructor(view) {
        super();
        this.view = view;
    }

    update(observable, object) {

        // Actualiser les activités de l'accueil
        this.view.renderActivities(
            observable.getActivities()
        );

        // Actualiser les favoris et activités organisées
        this.view.renderMyActivities(observable);
    }
}


/* ==========================================
   OBSERVER 2 : COMPTEUR D'ACTIVITÉS
========================================== */

class UpdateNavigation extends Observer {

    constructor(view) {
        super();
        this.view = view;
    }

    update(observable, object) {

        // Actualiser le compteur dans l'interface
        this.view.renderActivityCount(
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

        // Aucune activité sélectionnée
        if (this.view.selectedActivityId === null) {
            return;
        }

        const activity = observable.getActivityById(
            this.view.selectedActivityId
        );

        // Actualiser les détails et les participants
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
           1. INITIALISATION DES OBSERVERS
        ================================== */

        this.updateActivities =
            new UpdateActivities(this.view);

        this.updateNavigation =
            new UpdateNavigation(this.view);

        this.updateActivityDetails =
            new UpdateActivityDetails(this.view);


        // Enregistrer les observers auprès du modèle
        this.model.addObservers(this.updateActivities);
        this.model.addObservers(this.updateNavigation);
        this.model.addObservers(this.updateActivityDetails);


        /* ==================================
           2. ACTIONS : NAVIGATION
        ================================== */

        this.view.div.addEventListener("click", event => {

            // RETOUR DEPUIS LA PAGE DÉTAILS

            if (event.target.closest("#backFromDetails")) {

                this.view.selectedActivityId = null;

                this.view.showPage(
                    this.view.previousPage
                );

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


            // BOUTON FLOTTANT : CRÉER UNE ACTIVITÉ

            if (event.target.closest("#floatingAdd")) {

                this.view.resetForm();
                this.view.selectedActivityId = null;
                this.view.showPage("create");

                return;
            }


            // ONGLET FAVORIS

            if (event.target.closest("#favoritesTab")) {

                this.view.currentTab = "favorites";

                this.view.renderMyActivities(
                    this.model
                );

                return;
            }


            // ONGLET ACTIVITÉS ORGANISÉES

            if (event.target.closest("#organizedTab")) {

                this.view.currentTab = "organized";

                this.view.renderMyActivities(
                    this.model
                );

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

                // Mémoriser la page précédente
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

                const success =
                    this.model.joinActivity(
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

                const success =
                    this.model.leaveActivity(
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

                const confirmation = confirm(
                    "Voulez-vous vraiment supprimer cette activité ?"
                );

                if (confirmation) {

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

                // Préremplir le formulaire
                this.view.fillForm(activity);

                // Afficher le formulaire
                this.view.showPage("create");

                return;
            }

        });


        /* ==================================
           4. ACTIONS : FILTRAGE
        ================================== */

        this.view.categoryFilters.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest("[data-category]");

                if (!button) return;

                // Catégorie sélectionnée
                this.view.currentCategory =
                    button.dataset.category;

                // Actualiser les boutons de filtre
                this.view.renderFilters();

                // Actualiser les activités affichées
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

                // Récupérer les données du formulaire
                const data = this.view.getFormData();


                // Validation des données
                if (
                    !data.title ||
                    !data.location ||
                    !data.description ||
                    !data.date ||
                    !data.time ||
                    !Number.isInteger(data.maxParticipants) ||
                    data.maxParticipants < 1
                ) {

                    alert(
                        "Veuillez remplir correctement tous les champs."
                    );

                    return;
                }


                // MODIFIER UNE ACTIVITÉ EXISTANTE

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

                    // Empêcher de réduire la capacité
                    // sous le nombre de participants
                    if (
                        data.maxParticipants <
                        existing.participants.length
                    ) {

                        alert(
                            "La capacité ne peut pas être inférieure au nombre de participants actuels."
                        );

                        return;
                    }

                    this.model.updateActivity(
                        this.view.editingId,
                        data
                    );

                } else {

                    // CRÉER UNE NOUVELLE ACTIVITÉ

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


                // Réinitialiser le formulaire
                this.view.resetForm();

                this.view.selectedActivityId = null;

                // Afficher les activités organisées
                this.view.currentTab = "organized";

                this.view.showPage("myActivities");

                this.view.renderMyActivities(
                    this.model
                );
            }
        );


        /* ==================================
           6. INITIALISATION DE L'INTERFACE
        ================================== */

        // Afficher les filtres
        this.view.renderFilters();

        // Afficher les activités
        this.updateActivities.update(
            this.model,
            null
        );

        // Afficher le compteur
        this.updateNavigation.update(
            this.model,
            null
        );

        // Page initiale
        this.view.showPage("home");
    }
}
