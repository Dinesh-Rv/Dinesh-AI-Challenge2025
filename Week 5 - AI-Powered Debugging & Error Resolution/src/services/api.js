export const fetchProducts = async () => {
    const response = await fetch(process.env.REACT_APP_PRODUCTS_ENDPOINT);
    const data = await response.json();
    // No error handling!
    return data;
};
export const processPayment = async (paymentData) => {
    const response = await fetch(process.env.REACT_APP_PAYMENT_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(paymentData)
    });
    return response.json();
};