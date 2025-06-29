import { Router } from 'express';
import {globalSearch} from "../controllers/search.controller";
import {asHandler} from "../utils";

const router = Router();

router.get('/', asHandler(globalSearch));

export default router;
