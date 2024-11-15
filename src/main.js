import { web } from "./application/web.js";
import { logger } from "./application/logging.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

web.listen(PORT, () => {
  logger.info("App start, http://localhost:" + PORT);
});
