import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 requests por ventana
    message: 'Demasiadas solicitudes desde esta IP, intente más tarde',
    standardHeaders: true,
    legacyHeaders: false,
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // 5 intentos de login
    message: 'Demasiados intentos de inicio de sesión',
    skipSuccessfulRequests: true,
});
