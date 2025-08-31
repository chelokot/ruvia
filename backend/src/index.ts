import "dotenv/config";
import { initApp } from "./services/app.js";

const runner = await initApp();

runner();
