import { createApp } from "./app";
import { registerMainWindow } from "./window/main";

const app = createApp();
registerMainWindow(app);
