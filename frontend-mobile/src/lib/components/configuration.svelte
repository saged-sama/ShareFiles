<script lang="ts">
    import { onMount } from "svelte";
    import Warn from "./warn.svelte";
    import { PUBLIC_API_URL } from "$env/static/public";
    import { generateKeyPair } from "$lib/crypto";
    import { goto } from "$app/navigation";
    import { CircleCheck } from "lucide-svelte";
    
    let nameWarning = false;
    let nameUniqueWarning = false;
    let avatars: number[] = [1, 2, 3, 4, 5, 6, 7];
    let givenUsername: string = "";
    let chosenAvatar: string = "1";

    const handleSubmit = async() =>{
        if(givenUsername === ""){
            nameWarning = true;
            return;
        }
        
        const { publicKey, privateKey } = await generateKeyPair();

        const dataObj = {
            username: givenUsername,
            avatar: chosenAvatar,
            publicKey
        }

        try{
            const res = await fetch(PUBLIC_API_URL + "/config", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dataObj)
            });
            if(!res.ok){
                throw new Error("Failed to save configuration");
            }

            const config = await res.json();
            localStorage.setItem("config", JSON.stringify(config));
            // console.log(config);
            localStorage.setItem("privateKey", privateKey);
            givenUsername = "";
            chosenAvatar = "1";
            goto("/");
        }catch(e){
            console.log(e);
        }
    }

    const handleNameChange = async(event: any) => {
        nameWarning = false
        nameUniqueWarning = false;

        const username = event.target.value;
        if(username === ""){
            return;
        }

        try{
            const res = await fetch(PUBLIC_API_URL + "/config/validate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username })
            });
            if(!res.ok){
                throw new Error("Failed to validate username");
            }
            const { valid } = await res.json();
            if(!valid){
                nameUniqueWarning = true;
            }
            else{
                nameUniqueWarning = false;
            }
        }
        catch(e){
            console.log(e);
        }
    }
</script>

<div class="relative flex flex-col w-full h-full bg-black">
    <div class="flex flex-col bg-black gap-1 h-4/5 w-full text-sm">
        <h1 class="font-bold text-gray-200 p-3 px-5">Choose your favorite avatar</h1>
        <div class="px-3 h-3/5">
            <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 xl:grid-cols-10 lg:grid-cols-12 gap-2">
                {#each avatars as avatar}
                    <label for={`radio${avatar}`} class="relative flex items-center justify-center {chosenAvatar === `${avatar}`? "border-4 rounded-md inline-block border-green-600": ""}">
                        <div class="absolute {chosenAvatar === `${avatar}` ? "block" : "hidden"} text-white opacity-100 font-bold z-50"> <CircleCheck class="fill-green-600 w-5 h-5"/> </div>
                        <img src={`/${avatar}.jpg`} alt={`avatar${avatar}`} class="rounded-md {chosenAvatar === `${avatar}` ? "opacity-70" : "opacity-100"}">
                        <input type="button" id={`radio${avatar}`} name={`radio${avatar}`} class="hidden" value={avatar} on:click={() => {chosenAvatar = `${avatar}`}}>
                    </label>
                {/each}
            </div>
        </div>
    </div>
    
    <div class="absolute bottom-0 w-full bg-gray-700 rounded-xl text-sm">
        <label class="flex flex-col gap-2 p-5">
            <div class="font-bold text-gray-300">Pick up a nice username for yourself <span class="text-red-400">*</span></div>
            <input type="text" class="{nameWarning ? "border-red-400": ""} rounded-md p-2 w-full bg-black text-gray-300" placeholder="username" name="username" bind:value={givenUsername} on:keyup={handleNameChange} on:change={handleNameChange}>
            <div class="text-xs">
                {#if nameWarning}
                    <Warn message="Username cannot be empty"/>
                {/if}
                {#if nameUniqueWarning}
                    <Warn message="Username already taken"/>
                {/if}
            </div>
        </label>
        <button class="p-3 bg-green-400 w-full rounded-md font-bold" on:click={handleSubmit}>
            Proceed
        </button>
    </div>
</div>