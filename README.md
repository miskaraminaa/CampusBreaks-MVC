
## Architecture MVC

CampusBreaks repose sur une architecture **Model–View–Controller (MVC)**, associée au patron de conception **Observer/Observable**.

Cette architecture sépare les responsabilités :

- **Model** : contient les activités et la logique métier (CRUD, favoris, participations et persistance).
- **View** : affiche les activités, les formulaires, les détails et la navigation.
- **Controler** : reçoit les actions de l'utilisateur et appelle les méthodes du modèle.
- **Observable** : notifie les observateurs lorsque les données changent.
- **Observer** : définit l'interface `update()` utilisée pour actualiser les vues.

### Diagramme d'architecture et de classes

```mermaid
classDiagram
    direction TB

    class Observable {
        -observers
        -state
        +addObservers(observer)
        +setChanged()
        +notifyObservers(object)
        +removeObserver(observer)
        +clearObservers()
    }

    class Observer {
        +update(observable, object)
    }

    class Model {
        +activities
        +currentUserId
        +storageKey
        +getActivities()
        +getActivityById(id)
        +getFavorites()
        +getOrganizedActivities()
        +getActivityCount()
        +addActivity(activity)
        +updateActivity(id, changes)
        +deleteActivity(id)
        +toggleFavorite(id)
        +joinActivity(id, userId)
        +leaveActivity(id, userId)
        +saveActivities()
    }

    class View {
        +currentPage
        +currentCategory
        +currentTab
        +selectedActivityId
        +renderActivities(activities)
        +renderMyActivities(model)
        +renderActivityDetails(activity, userId)
        +renderActivityCount(count)
        +renderFilters()
        +showPage(page)
        +getFormData()
        +fillForm(activity)
        +resetForm()
    }

    class Controler {
        +model
        +view
        +updateActivities
        +updateNavigation
        +updateActivityDetails
    }

    class UpdateActivities {
        +update(observable, object)
    }

    class UpdateNavigation {
        +update(observable, object)
    }

    class UpdateActivityDetails {
        +update(observable, object)
    }

    class LocalStorage {
        +getItem(key)
        +setItem(key, value)
    }

    Observable <|-- Model

    Observer <|-- UpdateActivities
    Observer <|-- UpdateNavigation
    Observer <|-- UpdateActivityDetails

    Controler --> Model : actions
    Controler --> View : initialise
    Controler --> UpdateActivities : enregistre
    Controler --> UpdateNavigation : enregistre
    Controler --> UpdateActivityDetails : enregistre

    Model o-- Observer : notifie
    UpdateActivities --> View : actualise les listes
    UpdateNavigation --> View : actualise le compteur
    UpdateActivityDetails --> View : actualise les details

    Model ..> LocalStorage : sauvegarde et chargement
```

### Fonctionnement du pattern Observer

Le modèle hérite de la classe `Observable`.

Lorsqu'une activité est créée, modifiée ou supprimée, ou lorsqu'un utilisateur modifie ses favoris ou sa participation :

1. Le contrôleur appelle la méthode correspondante du modèle.
2. Le modèle modifie ses données.
3. Le modèle sauvegarde les changements avec `saveActivities()`.
4. Le modèle appelle `setChanged()`.
5. Le modèle appelle `notifyObservers()`.
6. Les observateurs enregistrés reçoivent la notification via `update()`.
7. Les méthodes de la vue actualisent les éléments affichés.

Les trois observateurs spécialisés sont :

- **UpdateActivities** : actualise l'accueil et la rubrique Mes activités.
- **UpdateNavigation** : actualise le compteur global d'activités.
- **UpdateActivityDetails** : actualise les détails et le nombre de participants.

## Diagramme de séquence

### Cas d'utilisation : rejoindre une activité

Ce diagramme illustre le déroulement d'une participation, depuis le clic utilisateur jusqu'à l'actualisation de l'interface.

```mermaid
sequenceDiagram
    autonumber

    actor User as Utilisateur
    participant View
    participant Controller as Controler
    participant Model
    participant Storage as localStorage
    participant Observable
    participant Observer as UpdateActivityDetails

    User->>View: Cliquer sur Rejoindre
    View->>Controller: Evenement click
    Controller->>Model: joinActivity(id, currentUserId)

    Model->>Model: Rechercher l'activite
    Model->>Model: Verifier les places disponibles

    alt Participation autorisee
        Model->>Model: Ajouter userId aux participants
        Model->>Storage: setItem(key, JSON.stringify(activities))
        Model->>Observable: setChanged()
        Model->>Observable: notifyObservers()
        Note over Model,Observable: Methodes heritees de Observable
        Observable->>Observer: update(model, null)
        Observer->>View: renderActivityDetails(activity, userId)
        View-->>User: Afficher Quitter et le nouveau compteur
        Model-->>Controller: true
    else Activite complete ou deja rejoint
        Model-->>Controller: false
        Controller-->>User: Afficher un message d'erreur
    end
```

**Remarque :** le modèle hérite des méthodes d'`Observable`. Les appels à `setChanged()` et `notifyObservers()` sont donc exécutés sur l'instance du modèle. Le diagramme représente `Observable` séparément pour rendre le mécanisme plus lisible.

### Cas d'utilisation : créer une activité

```mermaid
sequenceDiagram
    autonumber

    actor User as Utilisateur
    participant View
    participant Controller as Controler
    participant Model
    participant Storage as localStorage
    participant Observer as UpdateActivities

    User->>View: Remplir le formulaire
    User->>View: Cliquer sur Publier
    View->>Controller: Evenement submit
    Controller->>View: getFormData()
    View-->>Controller: Donnees du formulaire

    Controller->>Controller: Verifier les champs

    alt Donnees valides
        Controller->>Model: addActivity(data)
        Model->>Model: Generer un identifiant
        Model->>Model: Ajouter l'activite
        Model->>Storage: setItem(key, JSON.stringify(activities))
        Model->>Model: setChanged()
        Model->>Observer: notifyObservers() puis update()
        Observer->>View: renderActivities(activities)
        Observer->>View: renderMyActivities(model)
        Controller->>View: showPage(myActivities)
        View-->>User: Afficher la nouvelle activite
    else Donnees invalides
        Controller-->>User: Message de validation
    end
```

## Avantages de l'architecture

- **Séparation des responsabilités** : chaque classe possède un rôle clairement défini.
- **Maintenabilité** : les changements d'interface n'imposent pas de modifier la logique métier.
- **Réutilisabilité** : plusieurs observateurs peuvent réagir à une même modification.
- **Synchronisation automatique** : les vues sont actualisées après notification du modèle.
- **Persistance** : les activités sont conservées localement grâce à `localStorage`.
