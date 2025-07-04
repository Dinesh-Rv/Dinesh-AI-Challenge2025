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

export default useProducts; 