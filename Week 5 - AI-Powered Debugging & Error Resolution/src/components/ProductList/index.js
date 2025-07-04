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