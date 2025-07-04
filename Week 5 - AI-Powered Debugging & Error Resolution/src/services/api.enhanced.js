// Enhanced API functions with robust error handling and retry logic

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

const handleResponse = async (response) => {
    if (!response.ok) {
        let errorMsg = `HTTP error! Status: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;
        } catch (e) {
            // Ignore JSON parse errors
        }
        throw new Error(errorMsg);
    }
    return response.json();
};

const retryFetch = async (url, options = {}, retries = MAX_RETRIES) => {
    let lastError;
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const response = await fetch(url, options);
            return await handleResponse(response);
        } catch (error) {
            lastError = error;
            if (attempt < retries - 1) {
                await new Promise(res => setTimeout(res, RETRY_DELAY));
            }
        }
    }
    throw new Error(`Network request failed after ${retries} attempts: ${lastError.message}`);
};

export const fetchProducts = async (setLoading) => {
    if (setLoading) setLoading(true);
    try {
        const data = await retryFetch(process.env.REACT_APP_PRODUCTS_ENDPOINT);
        return data;
    } catch (error) {
        // User-friendly error message
        throw new Error(`Failed to fetch products. ${error.message}`);
    } finally {
        if (setLoading) setLoading(false);
    }
};

export const processPayment = async (paymentData, setLoading) => {
    if (setLoading) setLoading(true);
    try {
        const data = await retryFetch(process.env.REACT_APP_PAYMENT_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentData)
        });
        return data;
    } catch (error) {
        throw new Error(`Payment processing failed. ${error.message}`);
    } finally {
        if (setLoading) setLoading(false);
    }
}; 