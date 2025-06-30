// Critical Business Logic: Payment Processing with Fraud Detection
// This handles real money transactions - any bug could cost thousands

const crypto = require('crypto');
const axios = require('axios');

class PaymentProcessor {
  constructor(config = {}) {
    this.maxDailyLimit = config.maxDailyLimit || 10000; // $10,000
    this.maxTransactionAmount = config.maxTransactionAmount || 5000; // $5,000
    this.fraudThreshold = config.fraudThreshold || 0.7; // 70% fraud probability
    this.allowedCurrencies = config.allowedCurrencies || ['USD', 'EUR', 'GBP'];
    this.rateLimitWindow = config.rateLimitWindow || 60000; // 1 minute
    this.maxAttemptsPerWindow = config.maxAttemptsPerWindow || 5;
    
    // In-memory stores (in production, these would be Redis/Database)
    this.userDailySpend = new Map();
    this.failedAttempts = new Map();
    this.suspiciousIPs = new Set();
    this.blacklistedCards = new Set();
  }

  /**
   * Process a payment transaction with comprehensive fraud detection
   * @param {Object} transaction - The transaction details
   * @param {string} transaction.userId - User ID
   * @param {number} transaction.amount - Transaction amount
   * @param {string} transaction.currency - Currency code
   * @param {Object} transaction.card - Card details
   * @param {string} transaction.card.number - Card number (encrypted)
   * @param {string} transaction.card.cvv - CVV code
   * @param {string} transaction.card.expiry - Expiry date (MM/YY)
   * @param {Object} transaction.metadata - Additional metadata
   * @param {string} transaction.metadata.ipAddress - User's IP address
   * @param {string} transaction.metadata.userAgent - User's browser
   * @param {string} transaction.metadata.merchantId - Merchant identifier
   * @param {number} transaction.metadata.timestamp - Transaction timestamp
   * @returns {Promise<Object>} Transaction result
   */
  async processPayment(transaction) {
    try {
      // Step 1: Input validation
      this.validateTransaction(transaction);
      
      // Step 2: Rate limiting check
      await this.checkRateLimit(transaction.userId, transaction.metadata.ipAddress);
      
      // Step 3: Business rule validation
      await this.validateBusinessRules(transaction);
      
      // Step 4: Fraud detection
      const fraudScore = await this.calculateFraudScore(transaction);
      
      if (fraudScore > this.fraudThreshold) {
        await this.handleSuspiciousActivity(transaction, fraudScore);
        throw new Error(`Transaction blocked due to high fraud risk: ${fraudScore.toFixed(2)}`);
      }
      
      // Step 5: Card validation
      await this.validateCard(transaction.card);
      
      // Step 6: Daily limit check
      await this.checkDailyLimits(transaction.userId, transaction.amount);
      
      // Step 7: Process with payment gateway
      const paymentResult = await this.processWithGateway(transaction);
      
      // Step 8: Update tracking data
      await this.updateTransactionTracking(transaction, paymentResult);
      
      // Step 9: Log successful transaction
      await this.logTransaction(transaction, paymentResult, 'SUCCESS');
      
      return {
        success: true,
        transactionId: paymentResult.transactionId,
        amount: transaction.amount,
        currency: transaction.currency,
        timestamp: new Date().toISOString(),
        fraudScore: fraudScore,
        gatewayResponse: paymentResult
      };
      
    } catch (error) {
      // Log failed transaction
      await this.logTransaction(transaction, null, 'FAILED', error.message);
      
      // Track failed attempts
      await this.trackFailedAttempt(transaction.userId, transaction.metadata.ipAddress);
      
      throw error;
    }
  }

  validateTransaction(transaction) {
    if (!transaction) {
      throw new Error('Transaction object is required');
    }

    // Required fields validation
    const requiredFields = ['userId', 'amount', 'currency', 'card', 'metadata'];
    for (const field of requiredFields) {
      if (!transaction[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Amount validation
    if (typeof transaction.amount !== 'number' || transaction.amount <= 0) {
      throw new Error('Amount must be a positive number');
    }

    if (transaction.amount > this.maxTransactionAmount) {
      throw new Error(`Amount exceeds maximum limit of ${this.maxTransactionAmount}`);
    }

    // Currency validation
    if (!this.allowedCurrencies.includes(transaction.currency)) {
      throw new Error(`Unsupported currency: ${transaction.currency}`);
    }

    // Card validation
    if (!transaction.card.number || !transaction.card.cvv || !transaction.card.expiry) {
      throw new Error('Incomplete card information');
    }

    // Metadata validation
    const requiredMetadata = ['ipAddress', 'userAgent', 'merchantId', 'timestamp'];
    for (const field of requiredMetadata) {
      if (!transaction.metadata[field]) {
        throw new Error(`Missing required metadata: ${field}`);
      }
    }
  }

  async checkRateLimit(userId, ipAddress) {
    const now = Date.now();
    const windowStart = now - this.rateLimitWindow;
    
    // Check user rate limit
    const userKey = `user_${userId}`;
    const userAttempts = this.failedAttempts.get(userKey) || [];
    const recentUserAttempts = userAttempts.filter(time => time > windowStart);
    
    if (recentUserAttempts.length >= this.maxAttemptsPerWindow) {
      throw new Error('Rate limit exceeded for user');
    }
    
    // Check IP rate limit
    const ipKey = `ip_${ipAddress}`;
    const ipAttempts = this.failedAttempts.get(ipKey) || [];
    const recentIPAttempts = ipAttempts.filter(time => time > windowStart);
    
    if (recentIPAttempts.length >= this.maxAttemptsPerWindow * 2) { // Stricter for IP
      this.suspiciousIPs.add(ipAddress);
      throw new Error('Rate limit exceeded for IP address');
    }
  }

  async validateBusinessRules(transaction) {
    // Check if it's a weekend transaction (higher risk)
    const transactionDate = new Date(transaction.metadata.timestamp);
    const dayOfWeek = transactionDate.getDay();
    
    if ((dayOfWeek === 0 || dayOfWeek === 6) && transaction.amount > 1000) {
      // Weekend transactions over $1000 require additional validation
      if (!transaction.metadata.weekendApprovalCode) {
        throw new Error('Weekend transactions over $1000 require approval code');
      }
    }
    
    // Check for suspicious timing (multiple transactions in quick succession)
    const userId = transaction.userId;
    const userTransactions = this.userDailySpend.get(userId) || { transactions: [], total: 0 };
    const recentTransactions = userTransactions.transactions.filter(
      t => (transaction.metadata.timestamp - t.timestamp) < 30000 // 30 seconds
    );
    
    if (recentTransactions.length >= 3) {
      throw new Error('Too many transactions in quick succession');
    }
  }

  async calculateFraudScore(transaction) {
    let score = 0;
    
    // IP-based risk factors
    if (this.suspiciousIPs.has(transaction.metadata.ipAddress)) {
      score += 0.3;
    }
    
    // Amount-based risk factors
    if (transaction.amount > 2000) score += 0.2;
    if (transaction.amount > 4000) score += 0.3;
    
    // Time-based risk factors
    const hour = new Date(transaction.metadata.timestamp).getHours();
    if (hour < 6 || hour > 22) { // Late night/early morning
      score += 0.2;
    }
    
    // User behavior analysis
    const userHistory = this.userDailySpend.get(transaction.userId);
    if (userHistory) {
      const avgTransaction = userHistory.total / userHistory.transactions.length;
      if (transaction.amount > avgTransaction * 5) { // 5x normal amount
        score += 0.4;
      }
    } else {
      // New user - higher risk
      score += 0.1;
    }
    
    // Geographic risk (simplified - in reality would use IP geolocation)
    const riskCountries = ['XX', 'YY']; // Placeholder country codes
    // This would typically involve IP geolocation service
    
    // Card-based risk factors
    if (this.blacklistedCards.has(transaction.card.number)) {
      score = 1.0; // Immediate block
    }
    
    return Math.min(score, 1.0); // Cap at 1.0
  }

  async validateCard(card) {
    // Basic Luhn algorithm validation
    const cardNumber = card.number.replace(/\s/g, '');
    
    if (!/^\d+$/.test(cardNumber)) {
      throw new Error('Card number must contain only digits');
    }
    
    if (cardNumber.length < 13 || cardNumber.length > 19) {
      throw new Error('Invalid card number length');
    }
    
    // Luhn algorithm check
    let sum = 0;
    let isEven = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    if (sum % 10 !== 0) {
      throw new Error('Invalid card number');
    }
    
    // CVV validation
    if (!/^\d{3,4}$/.test(card.cvv)) {
      throw new Error('Invalid CVV');
    }
    
    // Expiry validation
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryRegex.test(card.expiry)) {
      throw new Error('Invalid expiry format (MM/YY)');
    }
    
    const [month, year] = card.expiry.split('/');
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const now = new Date();
    
    if (expiryDate < now) {
      throw new Error('Card has expired');
    }
  }

  async checkDailyLimits(userId, amount) {
    const today = new Date().toDateString();
    const userSpend = this.userDailySpend.get(userId) || { total: 0, date: today, transactions: [] };
    
    // Reset if it's a new day
    if (userSpend.date !== today) {
      userSpend.total = 0;
      userSpend.date = today;
      userSpend.transactions = [];
    }
    
    if (userSpend.total + amount > this.maxDailyLimit) {
      throw new Error(`Daily spending limit of ${this.maxDailyLimit} would be exceeded`);
    }
  }

  async processWithGateway(transaction) {
    // Simulate payment gateway call
    // In reality, this would call Stripe, PayPal, etc.
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    
    // Simulate random gateway failures
    if (Math.random() < 0.05) { // 5% failure rate
      throw new Error('Payment gateway error: Connection timeout');
    }
    
    // Simulate card declined
    if (Math.random() < 0.1) { // 10% decline rate
      throw new Error('Payment declined by issuing bank');
    }
    
    return {
      transactionId: `txn_${crypto.randomBytes(16).toString('hex')}`,
      gatewayTransactionId: `gw_${crypto.randomBytes(12).toString('hex')}`,
      status: 'completed',
      processingFee: transaction.amount * 0.029, // 2.9% fee
      timestamp: new Date().toISOString()
    };
  }

  async updateTransactionTracking(transaction, paymentResult) {
    // Update daily spend tracking
    const userId = transaction.userId;
    const today = new Date().toDateString();
    const userSpend = this.userDailySpend.get(userId) || { total: 0, date: today, transactions: [] };
    
    userSpend.total += transaction.amount;
    userSpend.transactions.push({
      amount: transaction.amount,
      timestamp: transaction.metadata.timestamp,
      transactionId: paymentResult.transactionId
    });
    
    this.userDailySpend.set(userId, userSpend);
  }

  async handleSuspiciousActivity(transaction, fraudScore) {
    // Add IP to suspicious list
    this.suspiciousIPs.add(transaction.metadata.ipAddress);
    
    // In production, this would:
    // - Send alert to fraud team
    // - Log to security monitoring system
    // - Potentially block user temporarily
    console.warn(`Suspicious activity detected for user ${transaction.userId}, fraud score: ${fraudScore}`);
  }

  async trackFailedAttempt(userId, ipAddress) {
    const now = Date.now();
    
    // Track failed attempts for user
    const userKey = `user_${userId}`;
    const userAttempts = this.failedAttempts.get(userKey) || [];
    userAttempts.push(now);
    this.failedAttempts.set(userKey, userAttempts);
    
    // Track failed attempts for IP
    const ipKey = `ip_${ipAddress}`;
    const ipAttempts = this.failedAttempts.get(ipKey) || [];
    ipAttempts.push(now);
    this.failedAttempts.set(ipKey, ipAttempts);
  }

  async logTransaction(transaction, result, status, errorMessage = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      userId: transaction.userId,
      amount: transaction.amount,
      currency: transaction.currency,
      status: status,
      transactionId: result?.transactionId || null,
      ipAddress: transaction.metadata.ipAddress,
      userAgent: transaction.metadata.userAgent,
      errorMessage: errorMessage
    };
    
    // In production, this would write to a logging service
    console.log(`Transaction Log: ${JSON.stringify(logEntry)}`);
  }
}

module.exports = PaymentProcessor;