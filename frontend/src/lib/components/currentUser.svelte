<script lang="ts">
    import { onMount } from "svelte";

    let currentUser: any;
    onMount(() => {
        currentUser = JSON.parse(localStorage.getItem("config") as string);
    })
</script>

{#if currentUser}
    <div class="flex flex-col items-center justify-center gap-2 p-5">
        <img src={`/${currentUser.avatar}.jpg`} alt={`${currentUser.username} avatar`} class="w-28 h-28 rounded-md">
        <h1 class="font-bold text-xl text-gray-300">{currentUser.username}</h1>
    </div>
{/if}