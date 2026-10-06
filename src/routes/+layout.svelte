<script>
	import "@onsvisual/svelte-components/css/main.css";
	import "../app.css";

	let { children } = $props();
</script>

{@render children?.()}
