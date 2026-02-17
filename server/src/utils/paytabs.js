import crypto from "crypto";

// Read env vars lazily (ES module imports are hoisted before dotenv.config runs)
const getConfig = () => ({
    baseUrl: process.env.PAYTABS_BASE_URL || "https://secure.paytabs.sa",
    serverKey: process.env.PAYTABS_SERVER_KEY,
    profileId: Number(process.env.PAYTABS_PROFILE_ID),
});

/**
 * Create a PayTabs Hosted Payment Page
 */
export const createPaymentPage = async ({
    amount,
    currency = "SAR",
    cartId,
    cartDescription,
    customerDetails,
    callbackUrl,
    returnUrl,
}) => {
    const { baseUrl, serverKey, profileId } = getConfig();

    const body = {
        profile_id: profileId,
        tran_type: "sale",
        tran_class: "ecom",
        cart_id: cartId,
        cart_description: cartDescription,
        cart_currency: currency,
        cart_amount: amount,
        callback: callbackUrl,
        return: returnUrl,
        hide_shipping: true,
    };

    if (customerDetails) {
        body.customer_details = customerDetails;
    }

    const response = await fetch(`${baseUrl}/payment/request`, {
        method: "POST",
        headers: {
            Authorization: serverKey,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "PayTabs payment request failed");
    }

    return data;
};

/**
 * Verify PayTabs callback signature (HMAC-SHA256)
 */
export const verifySignature = (postFields, signature) => {
    const { serverKey } = getConfig();
    const fields = { ...postFields };
    delete fields.signature;

    // Remove empty values
    const filtered = {};
    for (const [key, value] of Object.entries(fields)) {
        if (value !== "" && value !== null && value !== undefined) {
            filtered[key] = value;
        }
    }

    // Sort by key
    const sorted = {};
    Object.keys(filtered).sort().forEach((key) => {
        sorted[key] = filtered[key];
    });

    // Build URL-encoded query string
    const query = new URLSearchParams(sorted).toString();

    const computedSignature = crypto
        .createHmac("sha256", serverKey)
        .update(query)
        .digest("hex");

    return crypto.timingSafeEqual(
        Buffer.from(computedSignature, "hex"),
        Buffer.from(signature, "hex")
    );
};

/**
 * Query a transaction by reference
 */
export const queryTransaction = async (tranRef) => {
    const { baseUrl, serverKey, profileId } = getConfig();

    const response = await fetch(`${baseUrl}/payment/query`, {
        method: "POST",
        headers: {
            Authorization: serverKey,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            profile_id: profileId,
            tran_ref: tranRef,
        }),
    });

    return response.json();
};

/**
 * Refund a transaction via PayTabs
 */
export const refundTransaction = async ({ tranRef, cartId, cartDescription, currency, amount }) => {
    const { baseUrl, serverKey, profileId } = getConfig();

    const response = await fetch(`${baseUrl}/payment/request`, {
        method: "POST",
        headers: {
            Authorization: serverKey,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            profile_id: profileId,
            tran_type: "refund",
            tran_ref: tranRef,
            cart_id: cartId,
            cart_description: cartDescription,
            cart_currency: currency || "SAR",
            cart_amount: amount,
        }),
    });

    return response.json();
};
