import jwt from 'jsonwebtoken';

interface TokenPayload {
    userId: string;
    tenantId: string;
    email: string;
    role: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
    });
};

export const verifyToken = (token: string, secret: string): TokenPayload => {
    return jwt.verify(token, secret) as TokenPayload;
};
