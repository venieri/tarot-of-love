<script>
  let { src, alt, className = '' } = $props();

  // Convert /images/card-name.png to base path for WebP/AVIF
  const basePath = src.replace('.png', '');
</script>

<picture>
  <source srcset="{basePath}.avif" type="image/avif" />
  <source srcset="{basePath}.webp" type="image/webp" />
  <img {src} {alt} class={className} loading="lazy" />
</picture>
