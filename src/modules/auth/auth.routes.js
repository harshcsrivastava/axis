import { Router } from "express";
import ApiResponse from "../../utils/api-response.js";
import validate from "../../common/middleware/validate.middleware.js";
import { LoginDto, RegisterDto } from "./dto/index.js";
import * as controller from "./auth.controller.js";

const router = Router();

router.get("/health", (req, res) => {
    return ApiResponse.health(res, "Lock & Loaded!");
});

router.post("/register", validate(RegisterDto), controller.register);
router.post("/login", validate(LoginDto), controller.login);
export default router;
