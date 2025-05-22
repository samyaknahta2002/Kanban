<script>
    import { flip } from 'svelte/animate';
    import { dndzone } from 'svelte-dnd-action';
    import Column from './Column.svelte';

    // will be called any time a card or a column gets dropped to update the parent data
    export let onFinalUpdate = () => {};
    export let columns;
    export let h;
    const flipDurationMs = 300;

    function handleDndConsiderColumns(e) {
        columns.kanbanData = e.detail.items;
    }
    function handleDndFinalizeColumns(e) {
        onFinalUpdate(e.detail.items);
    }
    function handleItemFinalize(columnIdx, newItems) {
		columns.kanbanData[columnIdx].items = newItems;
		onFinalUpdate([...columns.kanbanData]);
	}
</script>

<div class="w-full overflow-auto" style="height: {h - 40}px;">
    <section use:dndzone={{items:columns.kanbanData, flipDurationMs, type:'column'}} on:consider={handleDndConsiderColumns} on:finalize={handleDndFinalizeColumns} class="w-full h-full flex gap-2 overflow-x-auto">
        {#each columns.kanbanData as {id, name, items}, idx (id)}
            <div class="w-[250px] h-full border border-gray-300 rounded-md" animate:flip="{{ duration: flipDurationMs }}">
                <Column name={name} verify={columns?.admin} items={items} onDrop={(newItems) => handleItemFinalize(idx, newItems)} onAdd={(newItems) => handleItemFinalize(idx, newItems)} onDel={(newItems) => handleItemFinalize(idx, newItems)} />
            </div>
        {/each}
        <slot />
    </section>
</div>

