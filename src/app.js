import { Router } from "express"
import ApiResponse from "./utils/api-response.js";

const router = Router()

router.get("/health", (req, res) => {
    return ApiResponse.health(res)
})

export default router;