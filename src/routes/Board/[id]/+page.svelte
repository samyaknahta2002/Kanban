<script>
    import { Profile } from "$lib/store";
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { initializeApp } from 'firebase/app';
    import { getFirestore, onSnapshot, collection, doc, getDoc, updateDoc, query, where } from 'firebase/firestore';
    import { firebaseConfig } from '$lib/firebaseConfig';
    import Board from "$lib/components/Board.svelte";
    import Header from '$lib/components/Header.svelte';

    const app = browser && initializeApp(firebaseConfig);
    const db = browser && getFirestore(app);
    $: docId = $page.params.id;

    onMount(() => {
        const colRef = browser && collection(db, 'Kanban');
        const q = query(colRef, where("k_id", "==", docId));
        const unsubscribe = browser && onSnapshot(q, (querySnapshot) => {
            let fbTodos = [];
            querySnapshot.forEach((doc) => {
                fbTodos = {...doc.data(), path: doc.id };
            });
            Data = fbTodos;
        });
        return () => unsubscribe && unsubscribe();
    });
    let h, name = "", add = false, Data = [];

	async function handleBoardUpdated(newColumnsData) {
        const ref = doc(db, 'Kanban', Data.path);
        await updateDoc(ref, {
            kanbanData: newColumnsData,
        });
	}
    async function addColumns(docId) {
        if (name != "") {
            if (name.length >= 3) {
                const ref = doc(db, 'Kanban', docId);
                let kdata = [
                    ...Data.kanbanData,
                    {
                        id: "c" + Data.kanbanData.length,
                        name,
                        items: []
                    }
                ];
                await updateDoc(ref, {
                    kanbanData: kdata,
                });
            }
        }
    }
</script>
<div class="w-full h-screen" bind:clientHeight={h}>
    <Header />
    <div class="w-full overflow-auto p-5" style="max-height: {h-44}px;">
        <Board columns={Data} h={h-44} onFinalUpdate={handleBoardUpdated}>
            {#if $Profile?.email && Data.admin == $Profile?.email}
                <slot>
                    <div class="w-[200px] h-full relative">
                        <div class="w-fit m-auto">
                            <button on:click={() => {add = !add}} class="px-4 py-2 font-medium rounded-md bg-green-500 hover:bg-green-600 text-white cursor-pointer">Add Column</button>
                        </div>
                        {#if add}
                            <div class="absolute top-12 left-1/2 -translate-x-1/2 border border-gray-300 rounded-md w-[190px] h-auto px-2 py-2">
                                <div class="flex flex-col space-y-2">
                                    <input type="text" id="name" minlength="2" maxlength="35" placeholder="Name" bind:value={name} class="w-full px-2 py-1 border border-gray-300 rounded-md" required>
                                    <button type="submit" on:click={() => addColumns(Data.path)} class="w-full px-2 py-1 border border-gray-300 bg-green-500 text-white hover:bg-green-600 rounded-md cursor-pointer">Create</button>
                                </div>
                            </div>
                        {/if}
                    </div>
                </slot>
            {/if}
        </Board>
    </div>
</div>
 