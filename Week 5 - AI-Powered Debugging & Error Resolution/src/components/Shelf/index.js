//State mutation bug
const addProduct = (product) => {
    const productAlreadyInCart = products.find(p => p.id ===
        product.id);
    if (productAlreadyInCart) {
        productAlreadyInCart.quantity++; //
        // Direct state mutation!
        setProducts([...products]);
    } else {
        product.quantity = 1; //
        // Mutating props!  
        setProducts([...products, product]);
    }
};