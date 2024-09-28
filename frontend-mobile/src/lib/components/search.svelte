<script lang="ts">
    import { PUBLIC_API_URL } from "$env/static/public";
    import { receivers } from "$lib/stores/receivers";
    import { receiverSelectionMode } from "$lib/stores/receiverSelectionMode";
    import { fade, fly } from "svelte/transition";

    let users: any[] = [];

    const handleSearch = async (event: any) => {
        const username = event.target.value;
        if(username === "") return;
        try{
            const res = await fetch(PUBLIC_API_URL + `/finduser/${username}`);
            if(!res.ok){
                throw new Error("Failed to validate username");
            }
            users = await res.json();
        } catch(e) {
            console.log(e);
        }
    }

    const handleCheck = (event: any, user: any) => {
        const element = document.getElementById(`label${user[0]}`);
        if(event.target.checked){
            $receivers = [...$receivers, user];
            if(element){
                element.classList.add("border-2", "border-fuchsia-500", "bg-gray-700");
            }
        }
        else{
            const rec = $receivers.filter((receiver) => receiver[0] !== user[0]);
            $receivers = [...rec];
            if(element){
                element.classList.remove("border-2", "border-fuchsia-500", "bg-gray-700");
            }
        }
    }

    const removeReceiver = (receiverid: string) => {
        const rec = $receivers.filter((receiver) => receiver[0] !== receiverid);
        $receivers = [...rec];
        const element: HTMLInputElement | null = document.getElementById(`label${receiverid}`) as HTMLInputElement;
        if(element){
            const checkbox = document.getElementById(`checkbox${receiverid}`) as HTMLInputElement;
            if(checkbox){
                checkbox.checked = false;
            }
            element.classList.remove("border-2", "border-fuchsia-500", "bg-gray-700");
        }
    }
</script>

<h1 class="text-gray-300 p-3 text-sm">Search the usernames you want to share files with</h1>
<label class="flex items-center justify-center gap-2 w-full text-sm">
    <input type="text" class="px-2 py-1 w-3/4 border rounded-lg" placeholder="Search username" on:change={handleSearch} on:keyup={handleSearch}>
</label>

<div class=" grid grid-cols-4 items-start justify-start p-3">
    {#each users as user}
        <label for={`checkbox${user[0]}`} id={`label${user[0]}`} class="flex flex-col items-center p-1 rounded-md md:hover:scale-110">
            <img src={`/${user[2]}.jpg`} alt={`${user[1]} avatar`} class="rounded-md">
            <div class="text-gray-300 text-sm font-bold">
                {user[1]}
            </div>
            <input type="checkbox" name={`checkbox${user[0]}`} id={`checkbox${user[0]}`} class="hidden" on:change={(e) => handleCheck(e, user)}>
        </label>
    {/each}
</div>

<div class="fixed bottom-0 flex flex-col w-full p-2 bg-gray-700 rounded-t-xl gap-2">
    <h1 class="text-xs text-gray-300 font-bold px-3">Click the avatar to remove a receiver</h1>
    <div class="w-full overflow-x-auto">
        <div class="grid grid-flow-row gap-1 grid-cols-8 rounded-xl">
            {#each $receivers as receiver}
                <button class="flex flex-col items-center p-1 bg-black rounded-lg overflow-hidden" on:click={() => removeReceiver(receiver[0])}>
                    <img src={`/${receiver[2]}.jpg`} alt={`${receiver[1]} avatar`} class="rounded-md">
                    <div class="text-gray-300 text-xs font-bold">
                        {receiver[1]}
                    </div>
                </button>
            {/each}
        </div>
    </div>
    <button class="bg-green-400 px-2 py-1 rounded-md" on:click={() => receiverSelectionMode.set(false)}>Done</button>
</div>