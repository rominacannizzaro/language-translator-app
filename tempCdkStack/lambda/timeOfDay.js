export async function index () {
    try {
        // Get current time in human-readable format
        const now = new Date(Date.now()).toString();
        console.log(now);

        return {
            statusCode: 200,
            body: now,
        };
    } catch (e) {
        console.log(e);
    };
};
