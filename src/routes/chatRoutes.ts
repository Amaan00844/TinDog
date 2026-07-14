import { Router } from "express";
import { chatController, clearMemoryController } from "../controllers/chatController.js";

export const chatRouter = Router();

chatRouter.post("/chat", (request, response, next) => {
  void chatController(request, response).catch(next);
});

chatRouter.post("/memory/clear", (request, response, next) => {
  void clearMemoryController(request, response).catch(next);
});
