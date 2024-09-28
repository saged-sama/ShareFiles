<script lang="ts">
    import { fly } from "svelte/transition";
    import Search from "$lib/components/search.svelte";
    import { onMount } from "svelte";
    import { receiverSelectionMode } from "$lib/stores/receiverSelectionMode";
    import SendFile from "$lib/components/sendFile.svelte";
    import Receivers from "$lib/components/receivers.svelte";
    import CurrentUser from "$lib/components/currentUser.svelte";

    let receiverSelectionModeOn = true;

    onMount(() => {
        receiverSelectionMode.subscribe((value) => {
            receiverSelectionModeOn = value;
        });
    });
</script>

{#if receiverSelectionModeOn}
    <div class="flex flex-col items-center min-w-screen min-h-screen h-full bg-black">
        <div class="h-1/2 w-full">
            <CurrentUser />
        </div>
        <div class="flex flex-col items-center p-3 w-full">
            <Search />
        </div>
    </div>
{:else}
    <div class="flex flex-col items-center min-w-screen min-h-screen bg-black text-sm">
        <div class="flex flex-col gap-2 w-full p-2">
            <SendFile />
        </div>
        <div class="flex flex-col gap-2 w-full p-2">
            <Receivers />
        </div>
    </div>
{/if}