import { Router } from "express";
import {
  createForm,
  deleteForm,
  getFormById,
  getForms,
  updateForm,
} from "../controllers/formController.js";

const router = Router();

router.route("/").post(createForm).get(getForms);
router.route("/:id").get(getFormById).put(updateForm).delete(deleteForm);

export default router;