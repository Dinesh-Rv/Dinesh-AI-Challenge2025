const { processSalesData, SalesDataError } = require('./convertedCode');

describe('processSalesData', () => {
  const validRecords = [
    { amount: 100, category: 'Books', date: '2024-06-01' },
    { amount: '200', category: 'Electronics', date: '2024-06-15' },
    { amount: 50, category: 'Books', date: '2024-07-01' }
  ];

  it('should process valid sales records', () => {
    const result = processSalesData(validRecords);
    expect(result.totalSales).toBe(350);
    expect(result.averageSale).toBeCloseTo(116.666, 2);
    expect(result.salesByCategory).toEqual({ Books: 150, Electronics: 200 });
    expect(result.monthlySales).toEqual({ '2024-06': 300, '2024-07': 50 });
    expect(result.recordCount).toBe(3);
  });

  it('should throw error for empty input', () => {
    expect(() => processSalesData([])).toThrow(SalesDataError);
  });

  it('should throw error for missing fields', () => {
    const bad = [{ amount: 10, category: 'A' }];
    expect(() => processSalesData(bad)).toThrow(SalesDataError);
  });

  it('should throw error for invalid amount', () => {
    const bad = [{ amount: 'abc', category: 'A', date: '2024-06-01' }];
    expect(() => processSalesData(bad)).toThrow(SalesDataError);
  });

  it('should throw error for invalid date', () => {
    const bad = [{ amount: 10, category: 'A', date: 'not-a-date' }];
    expect(() => processSalesData(bad)).toThrow(SalesDataError);
  });

  it('should handle Date objects as input', () => {
    const records = [
      { amount: 10, category: 'A', date: new Date('2024-06-01') }
    ];
    const result = processSalesData(records);
    expect(result.totalSales).toBe(10);
    expect(result.monthlySales).toHaveProperty('2024-06', 10);
  });
}); 