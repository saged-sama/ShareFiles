import { PUBLIC_API_URL, PUBLIC_API_WS } from "$env/static/public";
import { decryptData, encryptData } from "./crypto";

export const getFileWritable = async (filename: string) => {
    const fileHandle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [
            {
                accept: {
                    "file/*": []
                }
            }
        ]
    });

    const writable = await fileHandle.createWritable();
    return writable;
}

export const writeFileChunked = async(writable: any, data: any) => {
    const privateKey = localStorage.getItem("privateKey");
    const writable_data = await decryptData(data.encryptedData, data.encryptedAesKey, data.iv, privateKey as string);
    const blob = new Blob([writable_data]);
    await writable.write(blob);
}

const getReceiverById = (receiverId: string, receivers: any[]) => {
    return receivers.find((receiver) => receiver[0] === receiverId);
}

export const sendFileChunked = async (file: File, currentUserId: string, receivers: any[]) => {
    const socket = new WebSocket(PUBLIC_API_WS + "/connect/" + currentUserId);

    const chunkSize =  5 * 1024 * 1024;
    const totalChunks = Math.ceil(file.size / chunkSize);
    let count = 0;
    const chunkHistory: { [key: string]: number } = {};

    receivers.forEach(async (receiver) => {
        chunkHistory[receiver[0]] = 0;
        const response = await fetch(PUBLIC_API_URL + `/check/${currentUserId}---${receiver[0]}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                filename: file.name,
                filesize: file.size
            })
        });

        if(!response.ok){
            console.log("Failed to send to: ", receiver[0]);
        }
    });

    socket.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        if(data.message === "No"){
            receivers = receivers.filter((receiver) => receiver[0] !== data.id);
        }

        else if(data.message !== "Yes"){
            if(chunkHistory[data.id] === parseInt(data.message)){
                chunkHistory[data.id] = parseInt(data.message) + 1;
                if(chunkHistory[data.id] === totalChunks){
                    count += 1; 
                    if(count === receivers.length){
                        socket.close();
                    }
                }
                else{
                    await sendFileChunk(file, chunkHistory[data.id], chunkSize, getReceiverById(data.id, receivers), currentUserId);
                }
            }
        }

        else{
            await sendFileChunk(file, 0, chunkSize, getReceiverById(data.id, receivers), currentUserId);
        }
    }

    while(count < receivers.length && receivers.length > 0){
        return new Promise((resolve) => setTimeout(resolve, 100));
    }
}

const sendFileChunk = async (file: File, chunkNo: number, chunkSize: number, receiver: any, currentUserId: string) => {
    const start = chunkNo * chunkSize;
    const end = Math.min(start + chunkSize);
    const chunk = file.slice(start, end);

    const chunkArrayBuffer = await chunk.arrayBuffer();
    const { encryptedData, encryptedAesKey, iv } = await encryptData(chunkArrayBuffer, receiver[3]);

    const formData = new FormData();
    formData.append("filename", file.name);
    formData.append("filesize", file.size.toString());
    formData.append("totalChunks", Math.ceil(file.size / chunkSize).toString());
    formData.append("chunkNo", chunkNo.toString());
    formData.append("encryptedData", encryptedData);
    formData.append("encryptedAesKey", encryptedAesKey);
    formData.append("iv", iv);

    const response = await fetch(PUBLIC_API_URL + `/share/${currentUserId}---${receiver[0]}`, {
        method: "POST",
        body: formData
    });

    if(!response.ok){
        console.log("Failed to send to: ", receiver[0]);
    }
}