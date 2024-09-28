<script lang="ts">
    import CurrentUser from "$lib/components/currentUser.svelte";


</script>

<div class="flex flex-col items-center justify-center w-screen h-screen bg-black gap-10">
    <CurrentUser />

    <div class="flex gap-2">
        <a class="bg-green-400 py-2 px-3 rounded-md" href="/receivefiles">Receive</a>
        <a class="bg-gray-300 py-2 px-3 rounded-md" href="/sharefiles">Share</a>
    </div>
</div>