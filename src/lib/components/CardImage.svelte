<script>
const { src, alt, className = "" } = $props();

const basePath = src.replace(/\.(png|webp)$/, "");
</script>

<picture>
	<source srcset="{basePath}.avif" type="image/avif" />
	<img src="{basePath}.webp" {alt} class={className} loading="lazy" />
</picture>
