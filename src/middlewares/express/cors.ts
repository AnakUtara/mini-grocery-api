import type { CorsOptions } from "cors";
import { clientOrigin } from "../../config/env.config.js";

const corsOptions: CorsOptions = {
	origin: clientOrigin,
	credentials: true,
};

export default corsOptions;
