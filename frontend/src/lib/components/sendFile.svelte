<script lang="ts">
    import { sizeCalculator } from "$lib";
    import { sendFileChunked } from "$lib/fileReadWrite";
    import { receivers } from "$lib/stores/receivers";
    import { FilePlus2, Upload } from "lucide-svelte";
    import { onMount } from "svelte";
    
    let file: File | null = null;
    let currentUser: App.Configurations;

    const handleFile = (e: any) => {
        file = e.target.files[0];
    }

    const handleUpload = async() => {
        if (!file) {
            return;
        }
        try{
            await sendFileChunked(file, currentUser.id, $receivers);
        }
        catch(err){
            console.log("error sending file: ", err);
        }
    }

    onMount(() => {
        currentUser = JSON.parse(localStorage.getItem("config") as string);
    })
</script>

{#if file}
    <div class="flex flex-col items-start justify-center gap-3 text-gray-300 w-full h-full p-3  rounded-lg">
        <div class="flex gap-10">
            <h1 class="font-bold">File Name:</h1>
            <h1 class="font-gupter">{file.name}</h1>
        </div>
        <div class="flex gap-10">
            <h1 class="font-bold">File Type:</h1>
            <h1 class="font-gupter">{file.type}</h1>
        </div>
        <div class="flex gap-10">
            <h1 class="font-bold">File Size:</h1>
            <h1 class="font-gupter">{sizeCalculator(file.size)}</h1>
        </div>
    </div>
{:else}
    <label class="flex flex-col gap-3 items-center justify-center text-gray-300 w-full h-full p-5 bg-gray-500 rounded-lg">
        <FilePlus2 class="w-10 h-10" />
        <input type="file" class="hidden" on:change={handleFile}>
        <h1>Attach a file</h1>
    </label>
{/if}


<div class="flex w-full gap-2">
    <button class="flex gap-2 items-center justify-center w-1/2 { file? "bg-green-400": "bg-gray-700" } p-2 rounded-md" on:click={handleUpload}> <Upload class="w-4 h-4"/> Send File</button>
    <button class="flex gap-2 items-center justify-center w-1/2 { file? "bg-gray-400": "bg-gray-700" } p-2 rounded-md" on:click={() => file = null}> Cancel</button>
</div>

<div class="flex flex-col w-full">
    
</div>