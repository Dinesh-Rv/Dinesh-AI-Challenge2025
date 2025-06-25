/**
 * @interface Observer
 */
class Observer {
  /**
   * @param {string} event
   * @param {object} data
   */
  update(event, data) {
    throw new Error('update() must be implemented');
  }
}
module.exports = Observer; 