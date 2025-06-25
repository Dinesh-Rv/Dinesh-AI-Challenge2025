const Observer = require('./observer');

/**
 * @implements Observer
 */
class EmailNotifier extends Observer {
  update(event, data) {
    // Simulate sending email
    console.log(`[EMAIL] Event: ${event}, User: ${data.user}, Details: ${JSON.stringify(data)}`);
  }
}
module.exports = EmailNotifier; 