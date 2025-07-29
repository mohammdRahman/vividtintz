module.exports = async function (context, req) {
    // Set default CORS headers
    context.res = {
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS"
        }
    };

    // Handle OPTIONS (preflight) requests
    if (req.method === "OPTIONS") {
        context.res.status = 204;
        return;
    }

    // Input validation
    if (!req.body) {
        context.res.status = 400;
        context.res.body = JSON.stringify({ error: "Request body missing" });
        return;
    }

    const booking = req.body;
    context.log("✅ New booking received:", booking);

    try {
        // Validate required fields
        const required = ['name', 'email', 'phone', 'vehicleType', 'serviceType', 'date', 'time'];
        const missing = required.filter(field => !booking[field]);

        if (missing.length > 0) {
            context.res.status = 400;
            context.res.body = JSON.stringify({ 
                error: `Missing required fields: ${missing.join(', ')}` 
            });
            return;
        }

      const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const logicAppUrl = "https://prod-18.northcentralus.logic.azure.com:443/workflows/b96b44c4a70b4b89948877873a5a4e80/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=ECp64mRbYMEdjYOOV9uP0K-JdNDdV2FNANHk1g3raf4";

const logicAppRes = await fetch(logicAppUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(booking)
});

if (!logicAppRes.ok) {
    throw new Error(`Logic App failed: ${logicAppRes.statusText}`);
}

// Final response
context.res.status = 200;
context.res.body = JSON.stringify({
    message: "Booking sent to Logic App",
    booking: booking
});


    } catch (error) {
        context.log("❌ Error:", error);
        context.res.status = 500;
        context.res.body = JSON.stringify({ 
            error: "Internal server error",
            details: error.message 
        });
    }
};