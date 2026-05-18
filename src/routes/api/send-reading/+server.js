import FormData from "form-data";
import Mailgun from "mailgun.js";
import { env } from "$env/dynamic/private";
import { json } from "@sveltejs/kit";

export const prerender = false;

const MAILGUN_DOMAIN = "sandboxe624bd57c16849db930a11823b84f301.mailgun.org";

function getMailgunApiKey() {
	return env.MAILGUN_API_KEY || env.VITE_MAILGUN_API_KEY;
}

export async function POST({ request }) {
	try {
		const { email, question, cards, reading, isDeepReading } =
			await request.json();

		if (!email || !reading) {
			return json({ error: "Missing required fields" }, { status: 400 });
		}

		const mailgunApiKey = getMailgunApiKey();
		if (!mailgunApiKey) {
			console.error("Mailgun API key not configured");
			return json({ error: "Email service not configured" }, { status: 500 });
		}

		const mailgun = new Mailgun(FormData);
		const mg = mailgun.client({
			username: "api",
			key: mailgunApiKey,
		});

		// Format the email content
		const cardsList = cards
			.map((card) => `${card.position}: ${card.name}`)
			.join("\n");

		const readingType = isDeepReading ? "Deep Oracle Reading" : "Tarot Reading";

		const emailBody = `
Lydia Venieri's Tarot of Love
${readingType}

Your Question:
"${question}"

Cards Selected:
${cardsList}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${reading}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This reading was created for you by Lydia Venieri's Tarot of Love.
Visit https://tarot-of-love.vercel.app to receive another reading.
`;

		const data = await mg.messages.create(MAILGUN_DOMAIN, {
			from: "Lydia Venieri's Tarot of Love <postmaster@sandboxe624bd57c16849db930a11823b84f301.mailgun.org>",
			to: [email],
			subject: `Your ${readingType} from Lydia Venieri`,
			text: emailBody,
		});

		console.log("Email sent successfully:", data);
		return json({ success: true, messageId: data.id });
	} catch (error) {
		console.error("Error sending email:", error);
		return json(
			{ error: "Failed to send email", details: error.message },
			{ status: 500 },
		);
	}
}
