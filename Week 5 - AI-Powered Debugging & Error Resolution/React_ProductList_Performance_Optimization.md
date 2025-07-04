# React ProductList Performance Optimization

## 1. Performance Bottlenecks
- **Expensive Filtering on Every Render:**
  - The filtering logic runs on every render, even if `products` and `filters` haven't changed. This can be costly for large product lists.
- **Unnecessary Re-renders:**
  - If the parent component re-renders, `ProductList` will also re-render, causing the filter to run again.

## 2. Memoization
- Use `React.useMemo` to memoize the filtered products so the filtering only runs when `products` or `filters` change.

## 3. Filtering Logic Optimization
- The current logic is already efficient, but memoization will prevent unnecessary recalculations.

## 4. Performance Monitoring
- Use `console.time` and `console.timeEnd` to measure filtering duration.
- Optionally, use `React.memo` to prevent unnecessary re-renders if the props are unchanged.

---

## Before (Original Code)
```js
const ProductList = ({ products, filters }) => {
    //Expensive filtering on every render
    const filteredProducts = products.filter(product => {
        return filters.sizes.every(size =>
            product.availableSizes.includes(size)
        ) && product.price <= filters.maxPrice;
    });
    return (
        <div>
            {filteredProducts.map(product => (
                <ProductItem key={product.id} product={product} />
            ))}
        </div>
    );
};
```

## After (Optimized Code)
```js
import React from 'react';

const ProductList = React.memo(({ products, filters }) => {
    console.time('Product Filtering');
    const filteredProducts = React.useMemo(() => {
        return products.filter(product =>
            filters.sizes.every(size =>
                product.availableSizes.includes(size)
            ) && product.price <= filters.maxPrice
        );
    }, [products, filters]);
    console.timeEnd('Product Filtering');

    return (
        <div>
            {filteredProducts.map(product => (
                <ProductItem key={product.id} product={product} />
            ))}
        </div>
    );
});
```

## Performance Metrics
- With memoization, filtering only runs when `products` or `filters` change, reducing unnecessary computations.
- `console.time`/`console.timeEnd` logs the filtering duration in the browser console for monitoring.
- `React.memo` prevents re-renders if props are shallowly equal.

---
**Summary:**
- Use `useMemo` for expensive computations.
- Use `React.memo` for functional components to avoid unnecessary re-renders.
- Use `console.time` for simple performance monitoring. 