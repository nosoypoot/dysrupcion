import { handleReview } from "../src/review/handler";

// This entry point always serves a simulation, including Vercel's first deployment.
// It never imports the production Worker, reads secrets, or opens a database.
export default { fetch: handleReview };
