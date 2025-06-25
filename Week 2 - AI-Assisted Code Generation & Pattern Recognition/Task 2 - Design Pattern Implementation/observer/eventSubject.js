class EventSubject {
  constructor() {
    this.observers = [];
  }

  /**
   * Subscribe an observer
   * @param {import('./observer')} observer
   */
  subscribe(observer) {
    this.observers.push(observer);
  }

  /**
   * Unsubscribe an observer
   * @param {import('./observer')} observer
   */
  unsubscribe(observer) {
    this.observers = this.observers.filter(obs => obs !== observer);
  }

  /**
   * Notify all observers
   * @param {string} event
   * @param {object} data
   */
  notify(event, data) {
    this.observers.forEach(observer => observer.update(event, data));
  }
}
module.exports = EventSubject; 