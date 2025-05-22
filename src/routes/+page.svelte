<script>
    import { Profile } from "$lib/store";
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { initializeApp } from 'firebase/app';
    import { getFirestore, onSnapshot, collection, doc, addDoc, query, where } from 'firebase/firestore';
    import { firebaseConfig } from '$lib/firebaseConfig';
    import Header from '$lib/components/Header.svelte';

    const app = browser && initializeApp(firebaseConfig);
    const db = browser && getFirestore(app);
    let h;
    let kanbans = [], addModal = false, title = "", error = "", msg = "";
    onMount(() => {
        const colRef = browser && collection(db, 'Kanban');
        const q = query(colRef, where("k_email", "==", $Profile.email));
        const unsubscribe = browser && onSnapshot(q, (querySnapshot) => {
            let fbTodos = [];
            querySnapshot.forEach((doc) => {
                fbTodos.push({...doc.data(), path: doc.id });
            });
            kanbans = fbTodos;
        });
        return () => unsubscribe && unsubscribe();
    });

    function getDateTime(dt) {
        const now = new Date(dt);
        const pad = (n) => n.toString().padStart(2, '0');
        const year = now.getFullYear();
        const month = pad(now.getMonth() + 1);
        const day = pad(now.getDate());

        return `${year}-${month}-${day}`;
    }
    function openModal() {
        addModal = true;
    }
    async function createCompany() {
        if (title != "") {
            if (title.length >= 3) {
                const randomCharString = () => [...Array(10)].map(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.charAt(Math.random() * 62 | 0)).join('');
                try {
                    const docRef = addDoc(collection(db, 'Kanban'), {
                        k_id: randomCharString(),
                        k_email: $Profile.email,
                        admin: $Profile.email,
                        k_title: title,
                        k_users: [{email: $Profile.email, permission: "admin"}],
                        kanbanData: [],
                        dt: new Date().toString(),
                    });
                    msg = "Created successfully";
                    error = "";
                    if (docRef) {
                        title = "";
                        addModal = false;
                        error = "";
                        msg = "";
                    }
                } catch (error) {
                    error = 'Database error. Try after some time!';
                }
            } else {
                error = "Company name is atlest of 3 digits!";
            }
        }
        else{
            error = "Company name required!!";
        }
    }
</script>

<div class="w-full h-screen" bind:clientHeight={h}>
    <Header />
    {#if $Profile?.email}
        <div class="w-full overflow-auto p-5 flex flex-wrap items-center gap-5" style="max-height: {h-44}px;">
            {#each kanbans as k}
                <a href="/Board/{k.k_id}" class="w-48 h-[200px] p-2 border border-gray-200 rounded-md shadow space-y-1 hover:scale-105">
                    <img class="w-full border border-gray-300 rounded-md" src="https://media.istockphoto.com/id/1451737966/vector/kanban-board-project-management-agile-teams-notes-on-boards-office-planning-and-lead-tasks.jpg?s=612x612&w=0&k=20&c=9AfTAYdgGuYGf5L7brRi12fNLKhLSMeKmgPHcaUB9s4=" alt="img">
                    <div class="line-clamp-1 break-all font-medium">Company: {k.k_title}</div>
                    <div class="line-clamp-1 break-all text-sm text-gray-800 font-medium">Created at: {getDateTime(k.dt)}</div>
                </a>
            {/each}
            <button class="w-48 h-[200px] p-2 border border-gray-200 rounded-md shadow space-y-1 cursor-pointer hover:scale-105" on:click={openModal}>
                <div class="text-gray-800 font-medium">Create New Company</div>
            </button>
        </div>
        {#if addModal}
            <div class="absolute top-11 bottom-0 left-0 w-full bg-black/20 backdrop-blur z-50 flex items-center justify-center">
                <div class="absolute z-0 w-full h-full" on:click={() => {addModal = false}}></div>
                <div class="w-[60%] max-w-[500px] min-w-[300px] px-4 py-8 bg-white rounded-2xl z-10 space-y-6">
                    <h1 class="text-xl font-bold text-black text-center capitalize">Create new company</h1>
                    <div class="flex flex-col px-4 space-y-7">
                        <div class="flex flex-col space-y-2">
                            <label for="title">Company Name</label>
                            <input type="text" id="title" minlength="2" maxlength="35" placeholder="Name" bind:value={title} class="w-full px-2 py-1 border border-gray-300 rounded-md" required>
                        </div>
                        {#if error}
                            <div class="w-full flex items-center justify-between gap-2 text-white bg-red-600/60 px-2 py-1 rounded-md">
                                {error}
                                <div on:click={() => {error = ""}} class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-600/70 cursor-pointer">
                                    <i class="fa fa-close text-black"></i>
                                </div>
                            </div>
                        {/if}
                        {#if msg}
                            <div class="w-full flex items-center justify-between gap-2 text-white bg-red-600/60 px-2 py-1 rounded-md">
                                {msg}
                                <div on:click={() => {msg = ""}} class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-600/70 cursor-pointer">
                                    <i class="fa fa-close text-black"></i>
                                </div>
                            </div>
                        {/if}
                        <div class="flex flex-col">
                            <button type="submit" on:click={createCompany} class="w-full px-2 py-2 border border-gray-300 bg-green-500 text-white hover:bg-green-600 rounded-md cursor-pointer">Create</button>
                        </div>
                    </div>
                </div>
            </div>
        {/if}
    {/if}
</div>
