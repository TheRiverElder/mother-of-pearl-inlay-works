<script lang="ts">
	import { onMount } from 'svelte';
    import { drawHexagon } from './core';

	export let cellSize: number = 10;
	export let edgeCellCount: number = 12;

	let canvas: HTMLCanvasElement;

	function redraw() {
		if (!canvas) return;

		const { width, height } = canvas.getBoundingClientRect();
		canvas.width = width;
		canvas.height = height;

		const g: CanvasRenderingContext2D = canvas.getContext('2d');

		g.save();

		g.translate(width / 2, height / 2);
		drawHexagon(g, cellSize, edgeCellCount);

		g.restore();
	}

	onMount(redraw);
</script>

<main>
	<canvas bind:this={canvas}></canvas>
</main>

<style>
	main, canvas {
		width: 100%;
		height: 100%;
		padding: 0;
		margin: 0;
	}
</style>