import { Router } from "express"
import "dotenv/config";
import ApiResponse from "./utils/api-response.js";
import authRoute from "./modules/auth/auth.routes.js"

const router = Router()

router.get("/health", (req, res) => {
    return ApiResponse.health(res)
})

router.use("/auth", authRoute);

export default router;