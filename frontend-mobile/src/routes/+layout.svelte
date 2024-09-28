<script>import { onMount } from "svelte";
import "../app.css";
import { getCurrentConfig } from "$lib";
import { goto } from "$app/navigation";

onMount(() => {
    if(!getCurrentConfig()){
        goto("/config");
    }
});</script>

<div class="font-bona-nova bg-slate-700 h-full">
    <slot></slot>
</div>
