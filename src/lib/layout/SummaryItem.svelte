<script>
	export let section;
</script>

<div class="summary-item">
	<div class="summary-value">
		<span class="summary-label">
			{section.indicator}
		</span>
		<span class="summary-number">
			{#if section.value}
				{section.value}
			{:else}
				&mdash;
			{/if}
		</span>
		{#if section.note}
			<span class="summary-note">
				{section.note}
			</span>
		{/if}
	</div>
	<div class="summary-description">
		{@html section.content}
	</div>
</div>

<style>
	.summary-item {
		display: flex;
		flex-direction: row;
	}
	:global(.summary-item + .summary-item) {
		border-top: 1px solid #bcbcbd;
		padding-top: 12px;
	}
	.summary-label {
		display: block;
		font-weight: bold;
	}
	.summary-number {
		display: block;
		font-size: 2rem;
		font-weight: bold;
		line-height: 1.1;
		width: 200px;
		max-width: 200px;
		overflow: none;
	}
	@media (max-width: 600px) {
		.summary-number {
			width: 150px;
			max-width: 150px;
		}
	}
	.summary-description {
		font-size: 16px;
		border-left: 1px solid #bcbcbd;
		padding-left: 12px;
	}
	.summary-description :global(p) {
		margin-bottom: 4px;
	}
	.summary-description :global(p + p) {
		margin-top: 12px;
	}
	.summary-note {
		font-size: 16px;
		display: block;
		color: #707071;
		margin-top: 6px;
	}
</style>
