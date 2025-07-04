// Immutable and best-practice version of addProduct
const addProduct = (product) => {
    const productAlreadyInCart = products.find(p => p.id === product.id);
    if (productAlreadyInCart) {
        setProducts(products => products.map(p =>
            p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        ));
    } else {
        setProducts(products => [...products, { ...product, quantity: 1 }]);
    }
}; 