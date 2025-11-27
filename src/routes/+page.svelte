<script>
  import { game } from '$lib/store.svelte.js';
  import { spreadPositions } from '$lib/cards.js';
  import CardImage from '$lib/components/CardImage.svelte';

  function handleQuestionSubmit() {
    if (game.question.trim()) {
      game.shuffleDeck();
      setTimeout(() => {
        game.startSelection();
      }, 2000);
    }
  }

  function handleCardSelect(card) {
    const position = spreadPositions[game.selectedCards.length];
    game.selectCard(card, position.name);
  }

  async function handleGetReading() {
    await game.getReading();
  }

  function isCardSelected(cardId) {
    return game.selectedCards.some(c => c.id === cardId);
  }
</script>

<div class="min-h-screen bg-black text-gothic-silver">
  <div class="container mx-auto px-4 py-6 md:py-12 max-w-4xl">
    <header class="text-center mb-8 md:mb-16">
      <h1 class="text-3xl md:text-5xl font-light mb-2 tracking-wide text-white">Lydia Venieri's<br class="md:hidden" /> Tarot of Love</h1>
      <p class="text-sm md:text-base font-light text-white/60">Ask the Oracle</p>
    </header>

    {#if game.gameStage === 'question'}
      <div class="max-w-xl mx-auto">
        <div class="border border-gothic-silver/20 p-6 md:p-8">
          <label for="question" class="block text-sm md:text-base mb-4 font-light text-white/80">
            Your question
          </label>
          <textarea
            id="question"
            bind:value={game.question}
            class="w-full h-32 md:h-40 px-4 py-3 bg-transparent border border-gothic-silver/30
                   focus:outline-none focus:border-gothic-crimson text-white placeholder-white/30
                   font-light text-sm md:text-base"
            placeholder="What question weighs upon your heart?"
          ></textarea>
          <button
            onclick={handleQuestionSubmit}
            disabled={!game.question.trim()}
            class="mt-6 w-full bg-transparent border border-gothic-crimson text-gothic-crimson
                   px-6 py-3 md:py-4 font-light text-sm md:text-base tracking-wide
                   hover:bg-gothic-crimson hover:text-black transition-all
                   disabled:opacity-30 disabled:cursor-not-allowed"
          >
            CONSULT THE CARDS
          </button>
        </div>
      </div>
    {/if}

    {#if game.gameStage === 'shuffle'}
      <div class="text-center">
        <p class="text-sm md:text-base mb-12 md:mb-16 font-light text-white/60">Shuffling the cards...</p>
        <div class="relative h-48 md:h-64 w-32 md:w-40 mx-auto">
          {#each game.shuffledDeck.slice(0, 10) as card, i}
            <div
              class="absolute inset-0 bg-card-back border border-gothic-silver/20 transition-all animate-pulse"
              style="
                transform: translate({i * 2}px, {i * 2}px) rotate({(i - 5) * 0.5}deg);
                animation-delay: {i * 50}ms;
                z-index: {10 - i};
              "
            ></div>
          {/each}
        </div>
      </div>
    {/if}

    {#if game.gameStage === 'selection'}
      <div>
        <div class="text-center mb-8 md:mb-12">
          <p class="text-xs md:text-sm mb-2 font-light text-white/60 uppercase tracking-wider">
            Card {game.selectedCards.length + 1} of 5
          </p>
          <p class="text-xl md:text-2xl mb-1 text-gothic-crimson font-light">
            {spreadPositions[game.selectedCards.length]?.name}
          </p>
          <p class="text-xs md:text-sm font-light text-white/50 max-w-md mx-auto px-4">
            {spreadPositions[game.selectedCards.length]?.description}
          </p>
        </div>

        <div class="relative h-56 md:h-72 w-36 md:w-48 mx-auto mb-12 md:mb-16">
          {#each game.shuffledDeck.slice(0, 15) as card, i}
            <button
              onclick={() => handleCardSelect(card)}
              disabled={isCardSelected(card.id) || game.selectedCards.length >= 5}
              aria-label="Select tarot card"
              class="absolute inset-0 bg-card-back border border-gothic-silver/30
                     hover:border-gothic-crimson hover:z-50 hover:scale-105
                     transition-all disabled:opacity-0 disabled:pointer-events-none"
              style="
                transform: translate({i * 3}px, {i * 2}px) rotate({(i - 7) * 1}deg);
                z-index: {isCardSelected(card.id) ? 0 : 15 - i};
              "
            >
            </button>
          {/each}
        </div>

        {#if game.selectedCards.length > 0}
          <div class="border-t border-gothic-silver/20 pt-8 md:pt-12">
            <p class="text-xs md:text-sm mb-6 md:mb-8 text-center font-light text-white/60 uppercase tracking-wider">
              Selected Cards
            </p>
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 max-w-4xl mx-auto">
              {#each game.selectedCards as selected}
                <div class="text-center">
                  <div class="mb-2">
                    <CardImage
                      src={selected.image}
                      alt={selected.name}
                      className="w-full border border-gothic-silver/20"
                    />
                  </div>
                  <p class="text-xs text-gothic-crimson font-light mb-1">{selected.position}</p>
                  <p class="text-xs text-white/70 font-light">{selected.name}</p>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {/if}

    {#if game.gameStage === 'reading'}
      <div>
        <div class="mb-8 md:mb-12">
          <div class="border border-gothic-silver/20 p-4 mb-8 md:mb-12">
            <p class="text-sm md:text-base text-center font-light italic text-white/80">"{game.question}"</p>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 mb-8 md:mb-12">
            {#each game.selectedCards as selected}
              <div class="border border-gothic-silver/10 p-3 md:p-4">
                <CardImage
                  src={selected.image}
                  alt={selected.name}
                  className="w-full mb-3 border border-gothic-silver/20"
                />
                <p class="text-xs text-gothic-crimson text-center mb-1 font-light">{selected.position}</p>
                <p class="text-xs text-center mb-2 font-light text-white">{selected.name}</p>
                <p class="text-xs italic mb-2 font-light text-white/60 hidden md:block">"{selected.byeline}"</p>
                <p class="text-xs leading-relaxed font-light text-white/70 hidden md:block">{selected.description}</p>
              </div>
            {/each}
          </div>
        </div>

        {#if !game.reading && !game.isLoadingReading}
          <div class="max-w-xl mx-auto border-t border-gothic-silver/20 pt-8 md:pt-12">
            <button
              onclick={handleGetReading}
              class="w-full bg-transparent border border-gothic-crimson text-gothic-crimson
                     px-6 py-3 md:py-4 font-light text-sm md:text-base tracking-wide
                     hover:bg-gothic-crimson hover:text-black transition-all"
            >
              RECEIVE YOUR READING
            </button>
          </div>
        {/if}

        {#if game.isLoadingReading}
          <div class="text-center border-t border-gothic-silver/20 pt-8 md:pt-12">
            <p class="text-sm md:text-base font-light text-white/60 animate-pulse">The Oracle contemplates...</p>
          </div>
        {/if}

        {#if game.reading}
          <div class="max-w-2xl mx-auto border-t border-gothic-silver/20 pt-8 md:pt-12">
            <p class="text-xs md:text-sm mb-6 md:mb-8 text-center font-light text-white/60 uppercase tracking-wider">
              Your Reading
            </p>
            <div class="border border-gothic-silver/20 p-6 md:p-8 mb-8">
              <p class="whitespace-pre-wrap leading-relaxed text-sm md:text-base font-light text-white/90">
                {game.reading}
              </p>
            </div>
            <button
              onclick={() => game.reset()}
              class="w-full bg-transparent border border-gothic-silver/30 text-white
                     px-6 py-3 font-light text-sm tracking-wide
                     hover:border-gothic-silver hover:bg-gothic-silver hover:text-black transition-all"
            >
              NEW READING
            </button>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>
