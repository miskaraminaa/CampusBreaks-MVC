
class Model extends Observable {

    constructor() {
        super();
        this.currentUserId = 1;
        this.activities = [
            {
                id: 1,
                title: "Ping-Pong au Bât. 5",
                image: "assets/images/pingpong.jpg",
                category: "Pause Express",
                date: "2026-11-20",
                time: "14:30",
                location: "Bâtiment 5",
                description: "Une pause ping-pong entre étudiants.",
                maxParticipants: 6,
                participants: [2, 3],
                organizerId: 2,
                favorite: false
            },
            {
                id: 2,
                title: "Game Jam du weekend",
                image: "assets/images/gamejam.jpg",
                category: "Game Jam",
                date: "2026-11-21",
                time: "14:00",
                location: "Salle informatique",
                description: "Créons des jeux ensemble !",
                maxParticipants: 12,
                participants: [2, 3, 4],
                organizerId: 3,
                favorite: true
            },
            {
                id: 3,
                title: "Afterwork terrasse",
                image: "assets/images/afterwork.jpg",
                category: "Afterwork",
                date: "2026-11-22",
                time: "18:00",
                location: "Cafétéria",
                description: "Rencontre entre étudiants.",
                maxParticipants: 20,
                participants: [2, 4],
                organizerId: 4,
                favorite: false
            }
        ];

this.storageKey = "campusbreaks_activities";

try {
    const savedActivities = localStorage.getItem(this.storageKey);

    if (savedActivities !== null) {
        const parsed = JSON.parse(savedActivities);

        if (Array.isArray(parsed)) {
            this.activities = parsed;
        }
    }
} catch (error) {
    console.error(
        "Impossible de charger les activités enregistrées :",
        error
    );
}

    }

    getActivities() {
        return this.activities.map(activity => ({
            ...activity,
            participants: [...activity.participants]
        }));
    }

    getActivityById(id) {
        const activity = this.activities.find(
            activity => activity.id === id
        );

        return activity
            ? {...activity, participants: [...activity.participants]}
            : null;
    }

    addActivity(activity) {
        const newId = Math.max(
            0,
            ...this.activities.map(a => a.id)
        ) + 1;

        const newActivity = {
    ...activity,
    id: newId,
    participants: [...(activity.participants || [])],
    favorite: activity.favorite || false,
    image: activity.image || "assets/images/default.jpg"
};

        this.activities.push(newActivity);

        this.saveActivities();

this.setChanged();
this.notifyObservers();

        return newId;
    }

    updateActivity(id, changes) {
        const activity = this.activities.find(
            activity => activity.id === id
        );

        if (!activity) return false;

        const {id: ignoredId, ...allowedChanges} = changes;
        Object.assign(activity, allowedChanges);

        this.saveActivities();

this.setChanged();
this.notifyObservers();

        return true;
    }

    deleteActivity(id) {
        const index = this.activities.findIndex(
            activity => activity.id === id
        );

        if (index === -1) return false;

        this.activities.splice(index, 1);

        this.saveActivities();

this.setChanged();
this.notifyObservers();

        return true;
    }

    toggleFavorite(id) {
        const activity = this.activities.find(
            activity => activity.id === id
        );

        if (!activity) return false;

        activity.favorite = !activity.favorite;

        this.saveActivities();

this.setChanged();
this.notifyObservers();

        return true;
    }

    getFavorites() {
        return this.getActivities().filter(
            activity => activity.favorite
        );
    }

getOrganizedActivities() {
    return this.getActivities().filter(
        activity => activity.organizerId === this.currentUserId
    );
}

getActivityCount() {
    return this.activities.length;
}


joinActivity(id, userId) {
    const activity = this.activities.find(
        activity => activity.id === id
    );

    if (!activity) return false;

    // L'utilisateur participe déjà
    if (activity.participants.includes(userId)) {
        return false;
    }

    // L'activité est complète
    if (activity.participants.length >= activity.maxParticipants) {
        return false;
    }

    activity.participants.push(userId);

    this.saveActivities();
    this.setChanged();
    this.notifyObservers();

    return true;
}

leaveActivity(id, userId) {
    const activity = this.activities.find(
        activity => activity.id === id
    );

    if (!activity) return false;

    const index = activity.participants.indexOf(userId);

    if (index === -1) return false;

    activity.participants.splice(index, 1);

    this.saveActivities();
    this.setChanged();
    this.notifyObservers();

    return true;
}

saveActivities() {
    try {
        localStorage.setItem(
            this.storageKey,
            JSON.stringify(this.activities)
        );
    } catch (error) {
        console.error(
            "Impossible d'enregistrer les activités :",
            error
        );
    }
}


}
