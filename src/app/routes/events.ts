import { Router } from "express";
import { handleEventRegister, handleEvents } from "../controllers/events.controller";

const events = Router();

events.get("", handleEvents);
events.post("/register", handleEventRegister);

export default events;
