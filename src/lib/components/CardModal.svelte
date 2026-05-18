<script>
import CardImage from "./CardImage.svelte";

let { card = $bindable(null), onClose } = $props();

function handleBackdropClick(e) {
	if (e.target === e.currentTarget) {
		onClose?.();
	}
}

function handleKeydown(e) {
	if (e.key === "Escape") {
		onClose?.();
	}
}
</script>

{#if card}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		role="dialog"
		aria-modal="true"
		aria-label="{card.name} card details"
		tabindex="-1"
	>
		<div
			class="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-black border border-gothic-silver/30 p-6 md:p-8"
		>
			<button
				type="button"
				onclick={onClose}
				class="absolute top-2 right-2 z-10 flex min-h-11 min-w-11 items-center justify-center rounded-full
					text-2xl leading-none text-white/50 hover:bg-white/10 hover:text-white"
				aria-label="Close"
			>
				×
			</button>

			<div class="flex flex-col md:flex-row gap-6">
				<div class="flex-shrink-0 md:w-48">
					<button
						type="button"
						onclick={onClose}
						class="group block w-full text-left"
						aria-label="Close card details"
					>
						<CardImage
							src={card.image}
							alt={card.name}
							className="w-full border border-gothic-silver/20 group-active:border-gothic-crimson transition-colors"
						/>
						<p
							class="mt-2 text-center text-xs font-light text-white/40 md:hidden"
						>
							Tap card to close
						</p>
					</button>
				</div>

				<div class="flex-1">
					<h2 class="text-2xl font-light text-white mb-2">
						{card.name}
					</h2>

					{#if card.position}
						<p class="text-sm text-gothic-crimson mb-4 uppercase tracking-wide">
							{card.position}
						</p>
					{/if}

					<div class="space-y-4">
						<div>
							<p class="text-sm font-light italic text-white/80 mb-2">
								"{card.byeline}"
							</p>
						</div>

						<div>
							<h3
								class="text-xs uppercase tracking-wider text-white/60 mb-2"
							>
								Meaning
							</h3>
							<p class="text-sm font-light text-white/90 leading-relaxed">
								{card.description}
							</p>
						</div>

						<div>
							<h3
								class="text-xs uppercase tracking-wider text-white/60 mb-2"
							>
								Reverse Meaning
							</h3>
							<p class="text-sm font-light text-white/70 leading-relaxed">
								{card.reverse}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
