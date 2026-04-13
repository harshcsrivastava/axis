import jwt from "jsonwebtoken";

// sign & verify
const generateAccessToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || "15m",
    });
};

const verifyAccessToken = (token) => {
    return jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
};

const generateRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || "7d",
    });
};

const verifyRefreshToken = (token) => {
    return jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET);
};

export {
    generateAccessToken,
    verifyAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
};
