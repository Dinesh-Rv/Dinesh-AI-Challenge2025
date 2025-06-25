const Observer = require('./observer');

/**
 * @implements Observer
 */
class SmsNotifier extends Observer {
  update(event, data) {
    // Simulate sending SMS
    console.log(`[SMS] Event: ${event}, User: ${data.user}, Details: ${JSON.stringify(data)}`);
  }
}
module.exports = SmsNotifier; 