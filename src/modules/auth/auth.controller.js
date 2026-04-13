import ApiResponse from "../../utils/api-response.js";
import * as authService from "./auth.service.js";

const register = async (req, res) => {
    const user = await authService.handleRegister(req.body);
    return ApiResponse.created(res, "User Created Successfully", user);
};

const login = async (req, res) => {
    const { user, accessToken, refreshToken } = await authService.handleLogin(
        req.body,
    );

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return ApiResponse.ok(res, "Login Successfull", { user, accessToken });
};

export { register, login };
