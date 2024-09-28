<script lang="ts">
    import { goto } from "$app/navigation";
    import { PUBLIC_API_URL, PUBLIC_API_WS } from "$env/static/public";
    import { getTime, sizeCalculator } from "$lib";
    import ReceptionAnimation from "$lib/components/receptionAnimation.svelte";
    import Progress from "$lib/components/progress.svelte";
    import { getFileWritable, writeFileChunked } from "$lib/fileReadWrite";
    import { onMount } from "svelte";

    let filename: string = "";
    let filesize: number = 0;
    let approval: boolean = false;
    let socket: WebSocket;
    let currentUser: App.Configurations;
    let sender: string = "";
    let writable: any;
    let total: number = 0;
    let progress: number = 0;
    let start: any;
    let time: number = 0;
    let EstimatedTime: number = 0;

    const getWritable = async () => {
        writable = await getFileWritable(filename);
        if(writable){
            await sendMessage("Yes");
            approval = false;
            start = new Date().getTime();
        }
    }

    const sendMessage = async (message: string) => {
        approval = false;

        const response = await fetch(PUBLIC_API_URL + "/approval", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message,
                senderId: sender,
                id: currentUser.id
            })
        })

        if(!response.ok){
            console.log("Error in sending message");
        }
    }

    onMount(async() => {
        currentUser = JSON.parse(localStorage.getItem("config") as string);
        socket = new WebSocket(PUBLIC_API_WS + "/connect/" + currentUser.id);

        socket.onmessage = async (e) => {
            time = (new Date().getTime() - start) / 1000;
            const data = JSON.parse(e.data);
            sender = data.sender;
            
            if(data.receiver === currentUser.id){
                filename = data.filename;
                filesize = data.filesize;
                approval = true;
                time = (new Date().getTime() - start) / 1000;
            }

            else{
                total = data.totalChunks;
                progress = data.chunkNo;
                await writeFileChunked(writable, data);
                time = (new Date().getTime() - start) / 1000;
                if(data.chunkNo === data.totalChunks-1){
                    await writable.close();
                    writable = null;
                    socket.close();
                    goto("/");
                }
                time = (new Date().getTime() - start) / 1000;
                await sendMessage(`${data.chunkNo}`);
                time = (new Date().getTime() - start) / 1000;
            }
        }
    })

    $: EstimatedTime = (total / progress) * time;
</script>

<div class="flex flex-col items-center justify-center min-h-screen min-w-screen bg-black p-3">
    <div>
        <ReceptionAnimation />
    </div>
    {#if approval}
        <div class="flex flex-col items-start justify-center text-gray-300 h-full p-5 gap-3 text-wrap border border-gray-300 rounded-md">
            <h1 class="flex gap-5 font-sans"> <span class="font-bold">File Name:</span> {filename}</h1>
            <h2 class="flex gap-5 font-sans"> <span class="font-bold">File Size:</span> {sizeCalculator(filesize)}</h2>
            <div class="flex gap-2 w-full text-black">
                <button class="bg-green-400 p-3 rounded-md w-1/2" on:click={async () => await getWritable()}>Accept</button>
                <button class="bg-gray-300 p-3 rounded-md w-1/2" on:click={async () => await sendMessage("No")}>Decline</button>
            </div>
        </div>
    {:else if total}
        <div class="flex flex-col items-start justify-center text-gray-300 h-full p-5 gap-3 text-wrap border border-gray-300 rounded-md">
            <h1 class="flex gap-5 font-sans"> <span class="font-bold">File Name:</span> {filename}</h1>
            <h2 class="flex gap-5 font-sans"> <span class="font-bold">File Size:</span> {sizeCalculator(filesize)}</h2>
            <Progress {total} {progress} />
            <div class="flex gap-10 w-full text-gray-300 font-gupter">
                <div><span>Elapsed Time:</span> {getTime(time)}</div>
                <div><span>Estimated Time:</span> {getTime(EstimatedTime)}</div>
            </div>
        </div>
    {/if}
</div>