import ApiError from "../../utils/api-error.js";
import { pool } from "../../../index.mjs";
import bcrypt from "bcryptjs";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from "../../utils/jwt-utils.js";

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

    const sql =
        "Insert into users (name, email, password) values ($1, $2, $3);";

    await pool.query(sql, [name, email, hashedPassword]);

    return { name, email };
};

const handleLogin = async ({ email, password }) => {
    const existingUser = await pool.query(
        "SELECT id, name, email, password FROM users WHERE email = $1;",
        [email],
    );

    if (existingUser.rowCount === 0)
        throw ApiError.notFound("User not registered.");

    const user = existingUser.rows[0];

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) throw ApiError.unauthorized("Invalid Credentials");

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

export { handleRegister, handleLogin, logout, refresh };
