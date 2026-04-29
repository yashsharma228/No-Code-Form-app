import { Router } from "express";
import { createResponse, getResponsesByFormId } from "../controllers/responseController.js";

const router = Router();

router.post("/", createResponse);
router.get("/:formId", getResponsesByFormId);

export default router;