import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

const sourceImage = join(rootDir, "static/images/04-The-Clock.png");
const staticDir = join(rootDir, "static");

async function generateFavicons() {
	console.log("Generating favicons from The Clock card...");

	// Generate 16x16 favicon
	await sharp(sourceImage)
		.resize(16, 16, {
			fit: "cover",
			position: "center",
		})
		.toFile(join(staticDir, "favicon-16x16.png"));
	console.log("✓ Generated favicon-16x16.png");

	// Generate 32x32 favicon
	await sharp(sourceImage)
		.resize(32, 32, {
			fit: "cover",
			position: "center",
		})
		.toFile(join(staticDir, "favicon-32x32.png"));
	console.log("✓ Generated favicon-32x32.png");

	// Generate main favicon
	await sharp(sourceImage)
		.resize(48, 48, {
			fit: "cover",
			position: "center",
		})
		.toFile(join(staticDir, "favicon.png"));
	console.log("✓ Generated favicon.png");

	// Generate Apple touch icon (180x180)
	await sharp(sourceImage)
		.resize(180, 180, {
			fit: "cover",
			position: "center",
		})
		.toFile(join(staticDir, "apple-touch-icon.png"));
	console.log("✓ Generated apple-touch-icon.png");

	// Generate OG image (1200x630 for social media)
	await sharp(sourceImage)
		.resize(1200, 630, {
			fit: "cover",
			position: "center",
		})
		.toFile(join(staticDir, "og-image.png"));
	console.log("✓ Generated og-image.png");

	console.log("\n✨ All favicons generated successfully!");
}

generateFavicons().catch((error) => {
	console.error("Error generating favicons:", error);
	process.exit(1);
});
