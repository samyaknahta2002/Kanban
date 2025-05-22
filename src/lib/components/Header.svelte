<script>
    import { Profile } from "$lib/store";
    function logOut() {
        $Profile = [];
        window.location.href = "/";
    }
</script>
<div class="w-full px-3 py-1 flex items-center justify-between shadow">
    <a href="/" class="logo text-lg font-bold">KANBAN</a>
    {#if $Profile?.email}
        <div on:click={logOut} class="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 cursor-pointer">
            <i class="fa-solid fa-right-from-bracket"></i>
        </div>
    {:else}
        <a href="/authentication" class="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200">
            <i class="fa-solid fa-right-to-bracket"></i>
        </a>
    {/if}
</div>