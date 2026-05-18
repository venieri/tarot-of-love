// Mailgun API key for sending reading emails (client-side route uses VITE_ prefix)
export const MAILGUN_API_KEY =
	import.meta.env.VITE_MAILGUN_API_KEY || "YOUR_API_KEY_HERE";
