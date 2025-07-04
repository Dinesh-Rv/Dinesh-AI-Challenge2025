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

export default ProductList; 