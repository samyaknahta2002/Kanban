<script>
    import { Profile } from "$lib/store";
    import { flip } from 'svelte/animate';
    import { dndzone, SHADOW_ITEM_MARKER_PROPERTY_NAME } from 'svelte-dnd-action';
    import { fade } from 'svelte/transition';
    import { cubicIn } from 'svelte/easing';

	const flipDurationMs = 300;
    export let name;
	export let items;
	export let verify;
	export let onDrop = () => {};
	export let onAdd = () => {};
    export let onDel = () => {};

    let addCardModal = false, title="", description="", assignee="", due_dt="";

    function handleDndConsiderCards(e) {
        items = e.detail.items;
    }
    function handleDndFinalizeCards(e) {
        onDrop(e.detail.items);
    }
    function addCard() {
        if (title != "") {
            if (title.length >= 3) {
                const newCard = {
                    id: Math.random().toString(),
                    title,
                    description,
                    assignee,
                    due_dt,
                };
                items = [...items, newCard];
                title = "";
                description = "";
                assignee = "";
                due_dt = "";
                addCardModal = false;
                onAdd(items);
            }
        }
    }
    function cancelCard(id) {
        items = items.filter(item => item.id !== id);
        onDel(items);
    }
</script>

<div class="w-full h-full">
    <div class="top relative w-full p-2 flex items-center justify-between gap-2 bg-white rounded-t-md shadow">
        <strong>{name}</strong>
        {#if $Profile?.email && verify == $Profile?.email}
            <div on:click={() => {addCardModal = !addCardModal}} class="w-6 h-6 bg-blue-400 hover:bg-blue-500 text-white flex items-center justify-center rounded-md cursor-pointer">
                <i class="fa fa-plus"></i>
            </div>
            {#if addCardModal}
                <div class="absolute z-50 top-12 left-1/2 -translate-x-1/2 border border-gray-300 rounded-md w-[240px] h-auto px-2 py-2 bg-gray-200">
                    <div class="flex flex-col space-y-2">
                        <input type="text" id="title" minlength="2" maxlength="35" placeholder="Title" bind:value={title} class="w-full bg-white px-2 py-1 border border-gray-300 rounded-md" required>
                        <textarea type="text" id="desc" placeholder="Description" bind:value={description} class="w-full bg-white px-2 py-1 border border-gray-300 rounded-md"></textarea>
                        <input type="text" id="assignee" placeholder="Assignee" bind:value={assignee} class="w-full bg-white px-2 py-1 border border-gray-300 rounded-md">
                        <input type="date" id="dt" bind:value={due_dt} class="w-full bg-white px-2 py-1 border border-gray-300 rounded-md">
                        <button type="submit" on:click={() => addCard()} class="w-full px-2 py-1 border border-gray-300 bg-green-500 text-white hover:bg-green-600 rounded-md cursor-pointer">Create Card</button>
                    </div>
                </div>
            {/if}
        {/if}
    </div>
    {#if $Profile?.email && verify == $Profile?.email}
        <div class="h-[calc(100%-40px)] p-2" use:dndzone={{items, flipDurationMs, zoneTabIndex: -1}} on:consider={handleDndConsiderCards} on:finalize={handleDndFinalizeCards}>
            {#each items as item (item.id)}
                <div class="relative p-2 w-full rounded-md border-2 border-gray-300 space-y-1 mb-2">
                    <div class="w-full font-medium capitalize">{item.title}</div>
                    {#if item.description}
                        <div class="w-full line-clamp-3">{item.description}</div>
                    {/if}
                    {#if item.due_dt}
                        <div class="w-full text-sm text-gray-800">Due Date: {item.due_dt}</div>
                    {/if}
                    <div on:click={() => cancelCard(item.id)} class="absolute top-0 right-0 rounded-full w-6 h-6 hover:bg-red-600/30 hover:text-white flex items-center justify-center cursor-pointer">
                        <i class="fa fa-close"></i>
                    </div>
                    {#if item[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
                        <div in:fade={{duration:200, easing: cubicIn}} class='custom-shadow-item'></div>
                    {/if}
                </div>
            {/each}
        </div>
    {:else}
        <div class="h-[calc(100%-40px)] p-2">
            {#each items as item (item.id)}
                <div class="relative p-2 w-full rounded-md border-2 border-gray-300 space-y-1 mb-2">
                    <div class="w-full font-medium capitalize">{item.title}</div>
                    {#if item.description}
                        <div class="w-full line-clamp-3">{item.description}</div>
                    {/if}
                    {#if item.due_dt}
                        <div class="w-full text-sm text-gray-800">Due Date: {item.due_dt}</div>
                    {/if}
                    {#if item[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
                        <div in:fade={{duration:200, easing: cubicIn}} class='custom-shadow-item'></div>
                    {/if}
                </div>
            {/each}
        </div>
    {/if}
</div>
<style>
    .custom-shadow-item {
		position: absolute;
		top: 0; left:0; right: 0; bottom: 0;
		visibility: visible;
		border: 3px dashed gray;
		background: rgb(128, 128, 128, 0.5);
		opacity: 0.15;
		margin: 0;
        border-radius: 12px;
	}
</style>

