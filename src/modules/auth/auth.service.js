import ApiError from "../../utils/api-error.js";
import { pool } from "../../../index.mjs";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
    generateAccessToken,
    generateEmailToken,
    generateRefreshToken,
    verifyRefreshToken,
} from "../../utils/jwt-utils.js";
import { sendVerificationEmail } from "../../common/config/email.js";

const hashFunction = async (payload) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(payload, salt);

    return hash;
};

const comparePassword = async (incomingPassword, hash) => {
    return bcrypt.compare(incomingPassword, hash);
};

const handleRegister = async ({ name, email, password }) => {
    const existingUser = await pool.query(
        "Select * from users where email = $1;",
        [email],
    );

    if (existingUser.rowCount > 0)
        throw ApiError.badRequest("User already registered.");

    const hashedPassword = await hashFunction(password);
    const { rawToken, hashedToken } = await generateEmailToken();

    const sql =
        "Insert into users (name, email, password, verification_token) values ($1, $2, $3, $4);";

    await pool.query(sql, [name, email, hashedPassword, hashedToken]);

    try {
        await sendVerificationEmail(name, email, rawToken);
    } catch (error) {
        console.log(error);
    }

    return { name, email };
};

const handleLogin = async ({ email, password }) => {
    const existingUser = await pool.query(
        "SELECT id, name, email, password, is_verified FROM users WHERE email = $1;",
        [email],
    );

    if (existingUser.rowCount === 0)
        throw ApiError.notFound("User not registered.");

    const user = existingUser.rows[0];

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) throw ApiError.unauthorized("Invalid Credentials");
      
    if (!user.is_verified)
        throw ApiError.unauthorized("Email is not verified!");

    const accessToken = generateAccessToken({ id: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ id: user.id });

    const refreshQuery = "UPDATE users set refresh_token = $1 where email = $2";
    const hash = await hashFunction(refreshToken);

    await pool.query(refreshQuery, [hash, email]);

    return {
        user: { id: user.id, name: user.name, email: user.email },
        accessToken,
        refreshToken,
    };
};

const refresh = async (token) => {
    if (!token) throw ApiError.unauthorized("Refresh token missing");

    let decoded;
    try {
        decoded = verifyRefreshToken(token);
    } catch (error) {
        throw ApiError.unauthorized("Invalid or expired refresh token");
    }

    const existingUser = await pool.query("SELECT * FROM users where id = $1", [
        decoded.id,
    ]);

    if (existingUser.rowCount === 0)
        throw ApiError.unauthorized("User not found");

    const user = existingUser.rows[0];

    const isRefreshTokenValid = await bcrypt.compare(token, user.refresh_token);
    if (!isRefreshTokenValid) {
        throw ApiError.unauthorized("Invalid refresh token");
    }

    const accessToken = generateAccessToken({ id: user.id, email: user.email });

    return { accessToken };
};

const logout = async (userId) => {
    const sql = "UPDATE users set refresh_token = NULL where id = $1";
    await pool.query(sql, [userId]);
};

const hashToken = (token) =>
    crypto.createHash("sha256").update(token).digest("hex");
const verifyEmail = async (token) => {
    const trimmed = String(token).trim();
    if (!trimmed) {
        throw ApiError.badRequest("Invalid or expired verification token");
    }

    const hashedInput = hashToken(trimmed);

    let userReceived = await pool.query(
        "Select * from users where verification_token = $1;",
        [hashedInput],
    );

    if (userReceived.rowCount === 0) {
        userReceived = await pool.query(
            "Select * from users where verification_token = $1;",
            [trimmed],
        ).rows[0];
    }

    if (userReceived.rowCount === 0)
        throw ApiError.badRequest("Invalid or expired verification token");
    const user = userReceived.rows[0];
    await pool.query(
        "UPDATE users SET is_verified = TRUE, verification_token = 1 where id = $1",
        [user.id],
    );

    return user;
};

export { handleRegister, handleLogin, logout, refresh, verifyEmail };
