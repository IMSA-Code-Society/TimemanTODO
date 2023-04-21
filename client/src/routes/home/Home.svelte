<script lang="ts">
    import Tasks from "./tasks/Tasks.svelte";
    import Sidebar from "./Sidebar.svelte";
    import MiniTimer from "../../lib/MiniTimer.svelte";
</script>

<Sidebar let:currentTab><Tasks {currentTab} /></Sidebar>
<MiniTimer />
