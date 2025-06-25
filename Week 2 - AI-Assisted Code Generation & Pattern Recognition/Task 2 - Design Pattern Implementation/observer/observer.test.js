const EventSubject = require('./eventSubject');
const EmailNotifier = require('./emailNotifier');
const SmsNotifier = require('./smsNotifier');

describe('Observer Pattern', () => {
  test('Observers receive notifications', () => {
    const subject = new EventSubject();
    const email = new EmailNotifier();
    const sms = new SmsNotifier();

    const emailSpy = jest.spyOn(email, 'update');
    const smsSpy = jest.spyOn(sms, 'update');

    subject.subscribe(email);
    subject.subscribe(sms);

    subject.notify('user_registered', { user: 'test' });

    expect(emailSpy).toHaveBeenCalledWith('user_registered', { user: 'test' });
    expect(smsSpy).toHaveBeenCalledWith('user_registered', { user: 'test' });
  });

  test('Unsubscribed observer does not receive notifications', () => {
    const subject = new EventSubject();
    const email = new EmailNotifier();

    const emailSpy = jest.spyOn(email, 'update');

    subject.subscribe(email);
    subject.unsubscribe(email);

    subject.notify('user_login', { user: 'test2' });

    expect(emailSpy).not.toHaveBeenCalled();
  });
}); 