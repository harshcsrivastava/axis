import { pool } from "../../../index.mjs";
import ApiError from "../../utils/api-error.js";
import { verifyAccessToken } from "../../utils/jwt-utils.js";

const authenticate = async (req, res, next) => {
    let token;
    if (req.headers.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        res.redirect("/login.html");
    }

    const decoded = verifyAccessToken(token); // id & email from accessToken
    const user = await pool.query("Select * from users where id = $1", [
        decoded.id,
    ]);
    if (!user) throw ApiError.unauthorized("Not enough clearance!");
    const safeUser = user.rows[0];

    req.user = {
        id: safeUser.id,
        name: safeUser.name,
        email: safeUser.email,
    };

    next();
};

export { authenticate };
