import ApiError from "../../utils/api-error.js";
import { pool } from "../../../index.mjs";
import bcrypt from "bcryptjs";
import {
    generateAccessToken,
    generateRefreshToken,
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

export { handleRegister, handleLogin };
