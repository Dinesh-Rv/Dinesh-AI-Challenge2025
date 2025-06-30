# Gilded Rose Test & Coverage Report

## Test Results

- **Test Suites:** 1 passed, 1 total
- **Tests:** 15 passed, 15 total
- **Snapshots:** 0 total
- **All tests passed successfully.**

## Coverage Summary

| Metric      | Percentage |
|-------------|------------|
| Statements  | 100%       |
| Branches    | 95.83%     |
| Functions   | 100%       |
| Lines       | 100%       |

- **All files:** 100% statements, 95.83% branches, 100% functions, 100% lines
- **File:** `gilded_rose.js` — 100% statements, 95.83% branches, 100% functions, 100% lines

## Edge Cases & Critical Paths Covered

- Normal item: quality and sellIn decrease
- Aged Brie: quality increases, including after expiration
- Aged Brie: quality never exceeds 50
- Backstage passes: quality increases by 1, 2, or 3 depending on sellIn
- Backstage passes: quality drops to 0 after concert
- Backstage passes: edge cases for sellIn exactly 11 and 6
- Sulfuras: quality and sellIn never change
- Normal item: quality never drops below 0
- Expired normal item: quality decreases by 2
- Error handling: invalid Item and Shop input throws errors
- Default updater: unknown item type handled as normal item

## Example Test Output

```
 PASS  test/gilded_rose.test.js
  Gilded Rose
    ✓ should decrease sellIn and quality for normal items
    ✓ should increase quality for Aged Brie
    ✓ should increase quality by 2 for expired Aged Brie
    ✓ should not increase quality above 50 for Aged Brie
    ✓ should increase quality by 2 when 10 >= sellIn > 5 for Backstage passes
    ✓ should increase quality by 1 when sellIn is exactly 11 for Backstage passes
    ✓ should increase quality by 3 when 5 >= sellIn >= 0 for Backstage passes
    ✓ should increase quality by 2 when sellIn is exactly 6 for Backstage passes
    ✓ should drop quality to 0 after concert for Backstage passes
    ✓ should not change quality or sellIn for Sulfuras
    ✓ should not decrease quality below 0 for normal items
    ✓ should decrease quality by 2 for expired normal items
    ✓ should throw error for invalid Item input
    ✓ should throw error for invalid Shop input
    ✓ should use default updater for unknown item type

Test Suites: 1 passed, 1 total
Tests:       15 passed, 15 total
Snapshots:   0 total
```

## Conclusion

- All critical logic, edge cases, and error handling are now fully tested.
- The project meets and exceeds the 85%+ coverage goal, achieving 100% line/function coverage and nearly perfect branch coverage. 