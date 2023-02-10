<script>
    import Tasks from "./tasks/Tasks.svelte";
    import Sidebar from "./Sidebar.svelte";
	import Chart from "./Chart.svelte";
	export let due;
</script>

<Sidebar />
<Tasks /><Chart></Chart>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>