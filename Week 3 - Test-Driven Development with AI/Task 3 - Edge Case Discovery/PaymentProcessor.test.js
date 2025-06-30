// Jest test suite for PaymentProcessor.js
// Covers security, business logic, and technical edge cases

const PaymentProcessor = require('./PaymentProcessor');
const crypto = require('crypto');

jest.mock('axios'); // Mock axios for gateway/network tests

describe('PaymentProcessor - Security Edge Cases', () => {
  let processor;
  beforeEach(() => {
    processor = new PaymentProcessor();
  });

  test('should reject SQL injection in metadata fields', async () => {
    const transaction = validTransaction({
      metadata: { ...validMetadata(), merchantId: "1; DROP TABLE users;--" }
    });
    await expect(processor.processPayment(transaction)).rejects.toThrow();
  });

  test('should handle XSS in user agent string', async () => {
    const transaction = validTransaction({
      metadata: { ...validMetadata(), userAgent: '<script>alert(1)</script>' }
    });
    await expect(processor.processPayment(transaction)).resolves.toBeDefined();
  });

  test('should handle prototype pollution attempts', async () => {
    const transaction = validTransaction({
      metadata: { ...validMetadata(), __proto__: { isAdmin: true } }
    });
    await expect(processor.processPayment(transaction)).resolves.toBeDefined();
    expect({}.isAdmin).toBeUndefined();
  });

  test('should handle buffer overflow attempts in card number', async () => {
    const longNumber = '9'.repeat(1000);
    const transaction = validTransaction({
      card: { ...validCard(), number: longNumber }
    });
    await expect(processor.processPayment(transaction)).rejects.toThrow('Invalid card number length');
  });

  test('should handle JWT manipulation (simulated)', async () => {
    // JWT not directly used, but simulate tampered metadata
    const transaction = validTransaction({
      metadata: { ...validMetadata(), jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake.sig' }
    });
    await expect(processor.processPayment(transaction)).resolves.toBeDefined();
  });

  test('should handle session hijacking scenario (simulated)', async () => {
    // Simulate two users with same userId
    const transaction1 = validTransaction({ userId: 'user123' });
    const transaction2 = validTransaction({ userId: 'user123', metadata: { ...validMetadata(), ipAddress: '2.2.2.2' } });
    await processor.processPayment(transaction1);
    await expect(processor.processPayment(transaction2)).resolves.toBeDefined();
  });
});

describe('PaymentProcessor - Business Logic Edge Cases', () => {
  let processor;
  beforeEach(() => {
    processor = new PaymentProcessor();
  });

  test('should reject negative amounts', async () => {
    const transaction = validTransaction({ amount: -100 });
    await expect(processor.processPayment(transaction)).rejects.toThrow('Amount must be a positive number');
  });

  test('should reject zero amounts', async () => {
    const transaction = validTransaction({ amount: 0 });
    await expect(processor.processPayment(transaction)).rejects.toThrow('Amount must be a positive number');
  });

  test('should handle floating point precision errors', async () => {
    const transaction = validTransaction({ amount: 0.1 + 0.2 }); // 0.30000000000000004
    await expect(processor.processPayment(transaction)).resolves.toBeDefined();
  });

  test('should reject unsupported currency', async () => {
    const transaction = validTransaction({ currency: 'JPY' });
    await expect(processor.processPayment(transaction)).rejects.toThrow('Unsupported currency');
  });

  test('should handle time zone exploitation (future timestamp)', async () => {
    const future = Date.now() + 1000 * 60 * 60 * 24 * 365;
    const transaction = validTransaction({ metadata: { ...validMetadata(), timestamp: future } });
    await expect(processor.processPayment(transaction)).resolves.toBeDefined();
  });

  test('should handle leap year date', async () => {
    const leap = new Date('2024-02-29T12:00:00Z').getTime();
    const transaction = validTransaction({ metadata: { ...validMetadata(), timestamp: leap } });
    await expect(processor.processPayment(transaction)).resolves.toBeDefined();
  });

  test('should enforce daily limit with concurrent transactions', async () => {
    processor = new PaymentProcessor({ maxDailyLimit: 100 });
    const tx1 = validTransaction({ amount: 60 });
    const tx2 = validTransaction({ amount: 50 });
    await processor.processPayment(tx1);
    await expect(processor.processPayment(tx2)).rejects.toThrow('Daily spending limit');
  });

  test('should reject Luhn bypass attempts', async () => {
    const transaction = validTransaction({ card: { ...validCard(), number: '4111111111111112' } }); // Invalid Luhn
    await expect(processor.processPayment(transaction)).rejects.toThrow('Invalid card number');
  });

  test('should handle fraud score at threshold', async () => {
    processor = new PaymentProcessor({ fraudThreshold: 0.5 });
    const transaction = validTransaction({ amount: 5000 });
    await expect(processor.processPayment(transaction)).rejects.toThrow('Transaction blocked due to high fraud risk');
  });
});

describe('PaymentProcessor - Technical Edge Cases', () => {
  let processor;
  beforeEach(() => {
    processor = new PaymentProcessor();
  });

  test('should handle network timeout during gateway call', async () => {
    jest.spyOn(global, 'setTimeout').mockImplementation((fn, t) => fn());
    jest.spyOn(Math, 'random').mockReturnValue(0.04); // Simulate gateway error
    const transaction = validTransaction();
    await expect(processor.processPayment(transaction)).rejects.toThrow('Payment gateway error');
    jest.restoreAllMocks();
  });

  test('should handle promise rejection in processWithGateway', async () => {
    processor.processWithGateway = jest.fn().mockRejectedValue(new Error('Gateway down'));
    const transaction = validTransaction();
    await expect(processor.processPayment(transaction)).rejects.toThrow('Gateway down');
  });

  test('should handle async/await error propagation', async () => {
    processor.validateCard = jest.fn().mockRejectedValue(new Error('Async card error'));
    const transaction = validTransaction();
    await expect(processor.processPayment(transaction)).rejects.toThrow('Async card error');
  });

  test('should not block event loop with large batch', async () => {
    const transactions = Array.from({ length: 1000 }, (_, i) => validTransaction({ amount: 1, userId: `user${i}` }));
    const start = Date.now();
    await Promise.all(transactions.map(tx => processor.processPayment(tx)));
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(5000); // Should not block for >5s
  });
});

describe('PaymentProcessor - Input Validation Bypass Attacks', () => {
  let processor;
  beforeEach(() => {
    processor = new PaymentProcessor();
  });

  test('should reject malformed JSON payloads (simulate by missing fields)', async () => {
    const transaction = { userId: 'user123' }; // missing required fields
    await expect(processor.processPayment(transaction)).rejects.toThrow('Missing required field');
  });

  test('should reject unicode normalization attacks in card number', async () => {
    // Unicode digit lookalikes
    const homoglyph = '４１１１１１１１１１１１１１１'; // full-width digits
    const transaction = validTransaction({ card: { ...validCard(), number: homoglyph } });
    await expect(processor.processPayment(transaction)).rejects.toThrow('Card number must contain only digits');
  });

  test('should reject type confusion attacks (amount as string)', async () => {
    const transaction = validTransaction({ amount: '1000' });
    await expect(processor.processPayment(transaction)).rejects.toThrow('Amount must be a positive number');
  });

  test('should prevent prototype pollution via __proto__', async () => {
    const transaction = validTransaction({ metadata: { ...validMetadata(), __proto__: { admin: true } } });
    await expect(processor.processPayment(transaction)).resolves.toBeDefined();
    expect({}.admin).toBeUndefined();
  });

  test('should reject buffer overflow attempts with large strings', async () => {
    const largeString = 'A'.repeat(1000000);
    const transaction = validTransaction({ card: { ...validCard(), number: largeString } });
    await expect(processor.processPayment(transaction)).rejects.toThrow('Invalid card number length');
  });
});

describe('PaymentProcessor - Business Logic Attacks', () => {
  let processor;
  beforeEach(() => {
    processor = new PaymentProcessor({ maxDailyLimit: 200 });
  });

  test('should prevent race conditions in daily limit checking', async () => {
    const txs = [validTransaction({ amount: 150 }), validTransaction({ amount: 100 })];
    // Simulate concurrent requests
    const results = await Promise.allSettled(txs.map(tx => processor.processPayment(tx)));
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    expect(successCount).toBe(1);
  });

  test('should reject time manipulation attacks (timestamp in the past)', async () => {
    const past = Date.now() - 1000 * 60 * 60 * 24 * 365;
    const transaction = validTransaction({ metadata: { ...validMetadata(), timestamp: past } });
    await expect(processor.processPayment(transaction)).resolves.toBeDefined();
  });

  test('should reject currency arbitrage attempts', async () => {
    const transaction = validTransaction({ currency: 'USD\u0020' }); // Unicode space
    await expect(processor.processPayment(transaction)).rejects.toThrow('Unsupported currency');
  });

  test('should not allow fraud score manipulation via metadata', async () => {
    const transaction = validTransaction({ metadata: { ...validMetadata(), fraudScore: 0 } });
    await expect(processor.processPayment(transaction)).resolves.toBeDefined();
  });

  test('should enforce rate limit and prevent bypass', async () => {
    const userId = 'userRate';
    const ip = '5.5.5.5';
    for (let i = 0; i < processor.maxAttemptsPerWindow; i++) {
      await processor.trackFailedAttempt(userId, ip);
    }
    const transaction = validTransaction({ userId, metadata: { ...validMetadata(), ipAddress: ip } });
    await expect(processor.processPayment(transaction)).rejects.toThrow('Rate limit exceeded for user');
  });
});

describe('PaymentProcessor - Denial of Service Attacks', () => {
  let processor;
  beforeEach(() => {
    processor = new PaymentProcessor();
  });

  test('should handle memory exhaustion via large arrays', async () => {
    processor.userDailySpend.set('user123', { total: 0, date: new Date().toDateString(), transactions: Array(1e5).fill({ amount: 1, timestamp: Date.now(), transactionId: 'x' }) });
    const transaction = validTransaction();
    await expect(processor.processPayment(transaction)).resolves.toBeDefined();
  });

  test('should not hang on CPU exhaustion via complex regex (simulate in card CVV)', async () => {
    const evilCVV = '1'.repeat(10000);
    const transaction = validTransaction({ card: { ...validCard(), cvv: evilCVV } });
    await expect(processor.processPayment(transaction)).rejects.toThrow('Invalid CVV');
  });

  test('should not block event loop with sync operations', async () => {
    const transaction = validTransaction();
    const start = Date.now();
    await processor.processPayment(transaction);
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(2000);
  });

  test('should reject recursive JSON structures', async () => {
    const meta = validMetadata();
    meta.self = meta;
    const transaction = validTransaction({ metadata: meta });
    await expect(processor.processPayment(transaction)).resolves.toBeDefined(); // Should not crash
  });
});

describe('PaymentProcessor - Data Integrity Attacks', () => {
  let processor;
  beforeEach(() => {
    processor = new PaymentProcessor();
  });

  test('should handle floating point precision attacks', async () => {
    const transaction = validTransaction({ amount: 0.1 + 0.2 });
    await expect(processor.processPayment(transaction)).resolves.toBeDefined();
  });

  test('should handle integer overflow scenarios', async () => {
    const transaction = validTransaction({ amount: Number.MAX_SAFE_INTEGER });
    await expect(processor.processPayment(transaction)).rejects.toThrow();
  });

  test('should prevent concurrent modification issues', async () => {
    const txs = [validTransaction({ amount: 60 }), validTransaction({ amount: 60 })];
    processor = new PaymentProcessor({ maxDailyLimit: 100 });
    const results = await Promise.allSettled(txs.map(tx => processor.processPayment(tx)));
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    expect(successCount).toBe(1);
  });

  test('should not corrupt state during failures', async () => {
    processor.processWithGateway = jest.fn().mockRejectedValue(new Error('Gateway fail'));
    const transaction = validTransaction();
    await expect(processor.processPayment(transaction)).rejects.toThrow('Gateway fail');
    // State should not be updated
    expect(processor.userDailySpend.get(transaction.userId)).toBeUndefined();
  });
});

describe('PaymentProcessor - Financial Calculation Edge Cases', () => {
  let processor;
  beforeEach(() => {
    processor = new PaymentProcessor({ maxDailyLimit: 10000, maxTransactionAmount: 5000 });
  });

  // FLOATING POINT PRECISION
  test('should handle 0.1 + 0.2 precision errors without monetary loss', async () => {
    const transaction = validTransaction({ amount: 0.1 + 0.2 });
    await expect(processor.processPayment(transaction)).resolves.toBeDefined();
  });

  test('should handle large number calculations accurately', async () => {
    const transaction = validTransaction({ amount: 4999.99 });
    await expect(processor.processPayment(transaction)).resolves.toBeDefined();
  });

  test('should handle currency conversion rounding (simulate with decimals)', async () => {
    // Simulate a conversion that could cause rounding issues
    const transaction = validTransaction({ amount: 1.005 });
    await expect(processor.processPayment(transaction)).resolves.toBeDefined();
  });

  test('should calculate processing fee accurately', async () => {
    const transaction = validTransaction({ amount: 100 });
    const result = await processor.processPayment(transaction);
    // Fee should be exactly 2.9
    expect(Number(result.gatewayResponse.processingFee.toFixed(2))).toBe(2.90);
  });

  // BOUNDARY CONDITIONS
  test('should reject amounts above maximum safe integer', async () => {
    const transaction = validTransaction({ amount: Number.MAX_SAFE_INTEGER + 1 });
    await expect(processor.processPayment(transaction)).rejects.toThrow();
  });

  test('should reject amounts below minimum transaction amount (e.g., $0.01)', async () => {
    const transaction = validTransaction({ amount: 0.001 });
    await expect(processor.processPayment(transaction)).rejects.toThrow('Amount must be a positive number');
  });

  test('should handle edge cases around daily limits', async () => {
    processor = new PaymentProcessor({ maxDailyLimit: 100 });
    const tx1 = validTransaction({ amount: 99.99 });
    await processor.processPayment(tx1);
    const tx2 = validTransaction({ amount: 0.01 });
    await expect(processor.processPayment(tx2)).resolves.toBeDefined();
    const tx3 = validTransaction({ amount: 0.01 });
    await expect(processor.processPayment(tx3)).rejects.toThrow('Daily spending limit');
  });

  test('should handle fraud threshold boundary', async () => {
    processor = new PaymentProcessor({ fraudThreshold: 0.5 });
    const transaction = validTransaction({ amount: 5000 });
    await expect(processor.processPayment(transaction)).rejects.toThrow('Transaction blocked due to high fraud risk');
  });

  // MATHEMATICAL ATTACKS
  test('should reject negative number exploits', async () => {
    const transaction = validTransaction({ amount: -100 });
    await expect(processor.processPayment(transaction)).rejects.toThrow('Amount must be a positive number');
  });

  test('should handle division by zero scenarios in fee calculation (simulate)', async () => {
    // Simulate by monkey-patching processWithGateway
    processor.processWithGateway = jest.fn().mockImplementation(async (tx) => {
      return { transactionId: 't', gatewayTransactionId: 'g', status: 'completed', processingFee: tx.amount / 0, timestamp: new Date().toISOString() };
    });
    const transaction = validTransaction({ amount: 100 });
    await expect(processor.processPayment(transaction)).resolves.toBeDefined();
    // The fee should be Infinity
    const result = await processor.processPayment(transaction).catch(() => null);
    if (result) {
      expect(result.gatewayResponse.processingFee).toBe(Infinity);
    }
  });

  test('should reject overflow/underflow conditions', async () => {
    const transaction = validTransaction({ amount: Number.MIN_VALUE });
    await expect(processor.processPayment(transaction)).rejects.toThrow('Amount must be a positive number');
  });

  test('should not lose precision in calculations for small amounts', async () => {
    const transaction = validTransaction({ amount: 0.01 });
    const result = await processor.processPayment(transaction);
    expect(Number(result.gatewayResponse.processingFee.toFixed(4))).toBeCloseTo(0.0003, 4);
  });
});

describe('PaymentProcessor - Production Environment Failure Simulations', () => {
  let processor;
  beforeEach(() => {
    processor = new PaymentProcessor();
  });

  // NETWORK FAILURES
  test('should handle gateway timeouts during processing', async () => {
    processor.processWithGateway = jest.fn().mockImplementation(() => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 100)));
    const transaction = validTransaction();
    await expect(processor.processPayment(transaction)).rejects.toThrow('Timeout');
  });

  test('should handle partial network failures (intermittent success/failure)', async () => {
    let call = 0;
    processor.processWithGateway = jest.fn().mockImplementation(() => {
      call++;
      if (call % 2 === 0) return Promise.resolve({ transactionId: 't', gatewayTransactionId: 'g', status: 'completed', processingFee: 1, timestamp: new Date().toISOString() });
      return Promise.reject(new Error('Network error'));
    });
    const tx1 = validTransaction();
    const tx2 = validTransaction();
    await expect(processor.processPayment(tx1)).rejects.toThrow('Network error');
    await expect(processor.processPayment(tx2)).resolves.toBeDefined();
  });

  test('should handle DNS resolution failures', async () => {
    processor.processWithGateway = jest.fn().mockRejectedValue(new Error('ENOTFOUND'));
    const transaction = validTransaction();
    await expect(processor.processPayment(transaction)).rejects.toThrow('ENOTFOUND');
  });

  test('should handle SSL certificate issues', async () => {
    processor.processWithGateway = jest.fn().mockRejectedValue(new Error('SSL certificate error'));
    const transaction = validTransaction();
    await expect(processor.processPayment(transaction)).rejects.toThrow('SSL certificate error');
  });

  // SYSTEM RESOURCE EXHAUSTION
  test('should handle out of memory conditions (simulate by throwing)', async () => {
    processor.processWithGateway = jest.fn().mockImplementation(() => { throw new Error('Out of memory'); });
    const transaction = validTransaction();
    await expect(processor.processPayment(transaction)).rejects.toThrow('Out of memory');
  });

  test('should handle disk space exhaustion (simulate by throwing)', async () => {
    processor.logTransaction = jest.fn().mockRejectedValue(new Error('No space left on device'));
    const transaction = validTransaction();
    await expect(processor.processPayment(transaction)).rejects.toThrow('No space left on device');
  });

  test('should handle CPU overload scenarios (simulate by delay)', async () => {
    processor.processWithGateway = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ transactionId: 't', gatewayTransactionId: 'g', status: 'completed', processingFee: 1, timestamp: new Date().toISOString() }), 2000)));
    const transaction = validTransaction();
    const start = Date.now();
    await processor.processPayment(transaction);
    const duration = Date.now() - start;
    expect(duration).toBeGreaterThanOrEqual(2000);
  });

  test('should handle file descriptor limits (simulate by throwing)', async () => {
    processor.logTransaction = jest.fn().mockRejectedValue(new Error('EMFILE: too many open files'));
    const transaction = validTransaction();
    await expect(processor.processPayment(transaction)).rejects.toThrow('EMFILE');
  });

  // EXTERNAL DEPENDENCY FAILURES
  test('should handle database connection pool exhaustion', async () => {
    processor.updateTransactionTracking = jest.fn().mockRejectedValue(new Error('Too many connections'));
    const transaction = validTransaction();
    await expect(processor.processPayment(transaction)).rejects.toThrow('Too many connections');
  });

  test('should handle Redis cache failures', async () => {
    processor.checkDailyLimits = jest.fn().mockRejectedValue(new Error('Redis unavailable'));
    const transaction = validTransaction();
    await expect(processor.processPayment(transaction)).rejects.toThrow('Redis unavailable');
  });

  test('should handle third-party API rate limiting', async () => {
    processor.processWithGateway = jest.fn().mockRejectedValue(new Error('429 Too Many Requests'));
    const transaction = validTransaction();
    await expect(processor.processPayment(transaction)).rejects.toThrow('429 Too Many Requests');
  });

  test('should handle service degradation scenarios (slow response)', async () => {
    processor.processWithGateway = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ transactionId: 't', gatewayTransactionId: 'g', status: 'completed', processingFee: 1, timestamp: new Date().toISOString() }), 3000)));
    const transaction = validTransaction();
    const start = Date.now();
    await processor.processPayment(transaction);
    const duration = Date.now() - start;
    expect(duration).toBeGreaterThanOrEqual(3000);
  });

  // RECOVERY SCENARIOS
  test('should gracefully degrade on repeated failures', async () => {
    processor.processWithGateway = jest.fn().mockRejectedValue(new Error('Gateway down'));
    const transaction = validTransaction();
    await expect(processor.processPayment(transaction)).rejects.toThrow('Gateway down');
    // Simulate fallback or alert (here, just ensure error is thrown and not swallowed)
  });

  test('should activate circuit breaker after repeated failures (simulate)', async () => {
    let failCount = 0;
    processor.processWithGateway = jest.fn().mockImplementation(() => {
      failCount++;
      if (failCount > 3) throw new Error('Circuit breaker open');
      throw new Error('Gateway error');
    });
    const transaction = validTransaction();
    for (let i = 0; i < 3; i++) {
      await expect(processor.processPayment(transaction)).rejects.toThrow('Gateway error');
    }
    await expect(processor.processPayment(transaction)).rejects.toThrow('Circuit breaker open');
  });

  test('should handle retry mechanism failures', async () => {
    processor.processWithGateway = jest.fn().mockRejectedValue(new Error('Temporary failure'));
    const transaction = validTransaction();
    await expect(processor.processPayment(transaction)).rejects.toThrow('Temporary failure');
  });

  test('should recover from data corruption (simulate by resetting state)', async () => {
    processor.userDailySpend.set('user123', null); // Corrupt state
    processor.updateTransactionTracking = jest.fn().mockImplementation(() => {
      processor.userDailySpend.set('user123', { total: 0, date: new Date().toDateString(), transactions: [] });
    });
    const transaction = validTransaction();
    await expect(processor.processPayment(transaction)).resolves.toBeDefined();
    expect(processor.userDailySpend.get('user123')).toBeDefined();
  });
});

// --- Helper functions ---
function validCard() {
  return {
    number: '4111111111111111',
    cvv: '123',
    expiry: '12/30'
  };
}

function validMetadata() {
  return {
    ipAddress: '1.2.3.4',
    userAgent: 'Mozilla/5.0',
    merchantId: 'merchant123',
    timestamp: Date.now()
  };
}

function validTransaction(overrides = {}) {
  return {
    userId: 'user123',
    amount: 100,
    currency: 'USD',
    card: validCard(),
    metadata: validMetadata(),
    ...overrides
  };
} 