const EventSubject = require('./eventSubject');
const EmailNotifier = require('./emailNotifier');
const SmsNotifier = require('./smsNotifier');

const subject = new EventSubject();
const email = new EmailNotifier();
const sms = new SmsNotifier();

subject.subscribe(email);
subject.subscribe(sms);

subject.notify('user_registered', { user: 'alice', email: 'alice@example.com' });
subject.notify('user_login', { user: 'bob' });
subject.notify('profile_update', { user: 'carol', changes: ['email', 'password'] }); 