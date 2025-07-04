# React useProducts Performance Optimization

## 1. Performance Bottlenecks
- **Repeated Network Requests:**
  - The `filterProducts` function fetches products from the server every time filters change, even if products are already loaded.
- **No Memoization:**
  - Filtering is not memoized, so it may be recomputed unnecessarily.

## 2. Optimization Strategy
- **Cache Products:**
  - Fetch products once and cache them in state.
- **In-Memory Filtering:**
  - Filter products in-memory using the cached list.
- **Memoization:**
  - Use `useMemo` to memoize filtered products.
- **Performance Monitoring:**
  - Use `console.time` and `console.timeEnd` to measure filtering duration.

---

## Before (Original Code)
```ts
const filterProducts = (filters: string[]) => {
  setIsFetching(true);
  getProducts().then((products: IProduct[]) => {
    setIsFetching(false);
    let filteredProducts;
    if (filters && filters.length > 0) {
      filteredProducts = products.filter((p: IProduct) =>
        filters.find((filter: string) =>
          p.availableSizes.find((size: string) => size === filter)
        )
      );
    } else {
      filteredProducts = products;
    }
    setFilters(filters);
    setProducts(filteredProducts);
  });
};
```

## After (Optimized Code)
```ts
import { useCallback, useMemo, useState } from 'react';
import { useProductsContext } from './ProductsContextProvider';
import { IProduct } from 'models';
import { getProducts } from 'services/products';

const useProducts = () => {
  const {
    isFetching,
    setIsFetching,
    products,
    setProducts,
    filters,
    setFilters,
  } = useProductsContext();
  const [allProducts, setAllProducts] = useState<IProduct[]>([]);

  const fetchProducts = useCallback(() => {
    setIsFetching(true);
    getProducts().then((products: IProduct[]) => {
      setIsFetching(false);
      setAllProducts(products);
      setProducts(products);
    });
  }, [setIsFetching, setProducts]);

  const filterProducts = useCallback((filters: string[]) => {
    setFilters(filters);
    console.time('Product Filtering');
    let filteredProducts;
    if (filters && filters.length > 0) {
      filteredProducts = allProducts.filter((p: IProduct) =>
        filters.find((filter: string) =>
          p.availableSizes.find((size: string) => size === filter)
        )
      );
    } else {
      filteredProducts = allProducts;
    }
    setProducts(filteredProducts);
    console.timeEnd('Product Filtering');
  }, [allProducts, setFilters, setProducts]);

  const memoizedProducts = useMemo(() => {
    if (filters && filters.length > 0) {
      return allProducts.filter((p: IProduct) =>
        filters.find((filter: string) =>
          p.availableSizes.find((size: string) => size === filter)
        )
      );
    }
    return allProducts;
  }, [allProducts, filters]);

  return {
    isFetching,
    fetchProducts,
    products: memoizedProducts,
    filterProducts,
    filters,
  };
};
```

## Performance Metrics
- Filtering is now performed in-memory and memoized, reducing network requests and unnecessary computations.
- `console.time`/`console.timeEnd` logs the filtering duration in the browser console for monitoring.

---
**Summary:**
- Cache data and filter in-memory for better performance.
- Use `useMemo` and `useCallback` for expensive computations and stable references.
- Use `console.time` for simple performance monitoring. 