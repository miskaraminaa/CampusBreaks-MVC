
class Observable {
    constructor() {
        this.observers = [];
        this.state = false;
    }

    addObservers(observer) {
        this.observers.push(observer);
    }

    setChanged() {
        this.state = true;
    }

    notifyObservers(object = null) {
        if (this.state) {
            this.state = false;

            for (let observer of this.observers) {
                observer.update(this, object);
            }
        }
    }

    clearObservers() {
        this.observers = [];
    }

    removeObserver(observer) {
        this.observers = this.observers.filter(
            obs => obs !== observer
        );
    }
}

class Observer {
    update(observable, object) {
        // Sera redéfinie dans les contrôleurs d'update.
    }
}
