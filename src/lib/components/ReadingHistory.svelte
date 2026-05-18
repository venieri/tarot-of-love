<script>
import { game } from "$lib/store.svelte.js";
import CardImage from "./CardImage.svelte";
import ShareReadingButton from "./ShareReadingButton.svelte";

let showHistory = $state(false);
</script>

{#if game.history.length > 0}
	<div class="border-t border-gothic-silver/20 pt-8 md:pt-12 mt-8 md:mt-12">
		<button
			onclick={() => (showHistory = !showHistory)}
			class="w-full flex items-center justify-between px-6 py-4 border border-gothic-silver/30
         hover:border-gothic-silver/50 transition-all"
		>
			<span class="text-sm font-light text-white/70 uppercase tracking-wider">
				Reading History ({game.history.length})
			</span>
			<span class="text-white/50 text-xl">
				{showHistory ? "−" : "+"}
			</span>
		</button>

		{#if showHistory}
			<div class="mt-6 space-y-6">
				{#each game.history as entry}
					<div class="border border-gothic-silver/20 p-4 md:p-6">
						<div class="mb-4">
							<p class="text-xs text-white/50 mb-2">
								{new Date(entry.timestamp).toLocaleDateString("en-US", {
									year: "numeric",
									month: "long",
									day: "numeric",
									hour: "2-digit",
									minute: "2-digit",
								})}
							</p>
							<p class="text-sm font-light italic text-white/80">
								"{entry.question}"
							</p>
						</div>

						<div class="grid grid-cols-5 gap-2 mb-4 items-start">
							{#each entry.cards as card}
								<div class="text-center">
									<CardImage
										src={card.image}
										alt={card.name}
										className="w-full border border-gothic-silver/20 mb-1"
									/>
									<p class="text-xs text-gothic-crimson font-light">
										{card.position}
									</p>
								</div>
							{/each}
						</div>

						<div class="border-t border-gothic-silver/10 pt-4">
							<p class="text-xs text-white/70 font-light leading-relaxed">
								{entry.reading.slice(0, 200)}...
							</p>
							<div class="mt-3 flex flex-col gap-2">
								<button
									onclick={() => {
										game.question = entry.question;
										game.selectedCards = entry.cards;
										game.reading = entry.reading;
										game.shareId = entry.shareId || "";
										game.gameStage = "reading";
										showHistory = false;
										window.scrollTo({ top: 0, behavior: "smooth" });
									}}
									class="text-xs text-gothic-crimson hover:text-white transition-colors text-left"
								>
									View full reading →
								</button>
								{#if entry.shareId}
									<ShareReadingButton
										question={entry.question}
										reading={entry.reading}
										shareId={entry.shareId}
									/>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
{/if}
