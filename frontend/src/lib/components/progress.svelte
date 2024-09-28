<script lang="ts">
    export let progress: number = 0;
    export let total: number = 0;

    $: percentage = Math.round(progress / total * 100);
</script>

<style>
    .progress {
        position: relative;
        width: 100%;
        height: 1.5rem;
        background-color: #f5f5f5;
        border-radius: 0.5rem;
    }

    .progress-bar {
        position: absolute;
        height: 100%;
        background-color: #007bff;
        border-radius: 0.5rem;
        transition: width 0.5s;
    }

    .progress-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #000;
    }
</style>

<div class="progress">
    <div class="progress-bar" style="width: {percentage}%;"></div>
    <div class="progress-text">{percentage}%</div>
</div>