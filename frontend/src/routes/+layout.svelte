<script>import { onMount } from "svelte";
import "../app.css";
import { getCurrentConfig } from "$lib";
import { goto } from "$app/navigation";
let isConfigured = false;
onMount(() => {
    if(!getCurrentConfig()){
        isConfigured = true;
        goto("/config");
    }
    isConfigured = true;
});</script>

{#if isConfigured}
    <div class="font-bona-nova bg-slate-700 h-full">
        <slot></slot>
    </div>
{:else}
    <span class="">Please wait...</span>
{/if}
