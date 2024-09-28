<script lang="ts">
    import {receivers} from "$lib/stores/receivers";
</script>

<div class="flex flex-col gap-2 w-full h-full p-2">
    <span class="font-bold text-gray-300 border-b border-gray-500">Receivers:</span>
    {#each $receivers as receiver}
        <div class="flex gap-2 items-center w-full p-2 bg-gray-300 rounded-md">
            <img src={`/${receiver[2]}.jpg`} alt={`/${receiver[1]} avatar`} class="w-10 h-10 rounded-lg">
            <h1 class="font-gupter text-xl font-bold">{receiver[1]}</h1>
        </div>
    {/each}
</div>