<script>
import { marked } from "marked";

marked.setOptions({ breaks: true, gfm: true });

let { content = "" } = $props();

const html = $derived(marked.parse(content));
</script>

<div class="reading-markdown">{@html html}</div>
