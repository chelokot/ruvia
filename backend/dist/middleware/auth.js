export function createAuthMiddleware(deps) {
    return async (context, next) => {
        const body = await context.req.json().catch(() => null);
        const idToken = body && typeof body.token === 'string' ? body.token : '';
        console.log('idToken', idToken);
        if (!idToken) {
            return context.json({ ok: false }, 400);
        }
        try {
            const decodedToken = await deps.auth.verifyIdToken(idToken);
            console.log('decodedToken', decodedToken);
            await next();
        }
        catch (error) {
            console.error('error', error);
            return context.json({ ok: false }, 401);
        }
    };
}
