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

const refreshToken = async (req, res) => {
    const token = req.cookies?.refreshToken;
    const { accessToken } = await authService.refresh(token);
    ApiResponse.ok(res, "Token refreshed", { accessToken });
};

const logout = async (req, res) => {
    await authService.logout(req.user.id);
    res.clearCookie("refreshToken");
    ApiResponse.ok(res, "Logged out successfully");
};

const verifyEmail = async (req, res) => {
    await authService.verifyEmail(req.params.token)
    ApiResponse.ok(res, "Email Verified Successfully")
};

export { register, login, refreshToken, logout, verifyEmail };
