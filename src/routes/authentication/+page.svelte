<script>
    import Header from "$lib/components/Header.svelte";
    import { Profile } from "$lib/store";
    import { browser } from "$app/environment";
    import { initializeApp } from 'firebase/app';
    import { firebaseConfig } from "$lib/firebaseConfig";
    import { getFirestore, doc, getDoc, setDoc, collection, query, where, onSnapshot } from "firebase/firestore";
    import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const googleProvider = new GoogleAuthProvider();
    const db = browser && getFirestore();

    let cred = "login"; //"signup", "login"
    let errmsgg = "", errmsgl = "";
    let email = "", pass = "", showpass = false;
    const SignupWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const cred = result.user;
            const userRef = doc(db, 'LoginUserData', cred.uid);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
                errmsgg = 'This email is already registered!';
            }
            else{
                const generatePassword = (length) => 
                    Array.from({ length }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
                    .charAt(Math.floor(Math.random() * 62))).join('');
                let data = {
                    uid: cred.uid,
                    username: cred.displayName,
                    email: cred.email,
                    emailVerified: cred.emailVerified,
                    phoneNumber: cred.phoneNumber,
                    photoURL: cred.photoURL,
                    password: generatePassword(10),
                    passType: 'auto',
                    createdAt: new Date()
                };
                $Profile = {uid: data.uid, username: data.username, email: data.email, photoURL: data.photoURL};
                const userRef = doc(db, 'LoginUserData', cred.uid);  // Create or reference a document with user UID
                try {
                    await setDoc(userRef, data);
                } catch (error) {
                    errmsgg = 'Database error. Try after some time!';
                }
            }
        } catch (error) {
            if (error.code === 'auth/popup-closed-by-user') {
                errmsgg = 'Popup was closed before completing the sign-in process.';
            } else if (error.code === 'auth/cancelled-popup-request') {
                errmsgg = 'Popup request was cancelled.';
            } else if (error.code === 'auth/account-exists-with-different-credential') {
                errmsgg = 'This email is already associated with another account.';
            } else if (error.code === 'auth/operation-not-allowed') {
                errmsgg = 'This operation is not allowed.';
            } else if (error.code === 'auth/network-request-failed') {
                errmsgg = 'Network error. Please check your internet connection.';
            }
        }
    }
    const LoginWithEmail = async () => {
        if (email != "" && pass != "") {
            const colRef = browser && collection(db, "LoginUserData");
            const q = query(colRef, where("email", "==", email));
            const unsubscribe = browser && onSnapshot(q, (querySnapshot) => {
                let fbTodos = [];
                querySnapshot.forEach((doc) => {
                    fbTodos = { ...doc.data() };
                });
                if (fbTodos) {
                    if (pass == fbTodos.password) {
                        $Profile = {uid: fbTodos.uid, username: fbTodos.username, email: fbTodos.email, photoURL: fbTodos.photoURL};
                        window.location.href = "/";
                    }
                    else {
                        errmsgl = 'Invalid crediantials!';
                    }
                }
                else {
                    errmsgl = 'Email not registered!';
                }
            });
            
        }
        else {
            errmsgl = 'All feilds required!';
        }
    }
    const LoginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const cred = result.user;
            const userRef = doc(db, 'LoginUserData', cred.uid);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
                let data = {
                    uid: cred.uid,
                    username: cred.displayName,
                    email: cred.email,
                    photoURL: cred.photoURL
                };
                $Profile = data;
                window.location.href = "/";
            }
            else{
                errmsgl = 'This email is not registered!';
            }
        } catch (error) {
            if (error.code === 'auth/popup-closed-by-user') {
                errmsgl = 'Popup was closed before completing the login process.';
            } else if (error.code === 'auth/cancelled-popup-request') {
                errmsgl = 'Popup request was cancelled.';
            } else if (error.code === 'auth/operation-not-allowed') {
                errmsgl = 'This operation is not allowed.';
            } else if (error.code === 'auth/network-request-failed') {
                errmsgl = 'Network error. Please check your internet connection.';
            }
        }
    }
</script>

<div class="w-full h-screen relative bg-[var(--bg-secondary-dark)]">
    <Header />
    {#if $Profile?.email}
        {window.location.href = '/'}
    {:else}
        <div class="signup w-72 h-96 p-5 flex items-center absolute rounded-xl top-1/2 left-1/2 bg-white shadow-md {cred == "signup" ? "" : "rotate-[7deg]"}" style="{cred == "signup" ? "animation: rotate 0.7s ease-in-out forwards;" : "animation: signup 1s ease-in-out forwards;"}">
            <div class="grid w-full space-y-3">
                <h1 class="font-bold text-2xl text-center text-gray-900 mb-6">Sign Up</h1>
                <div class="w-full">
                    <button on:click={SignupWithGoogle} class="w-full px-4 py-2.5 flex items-center justify-center gap-2 text-sm font-medium border border-blue-600 hover:bg-blue-200 rounded-md cursor-pointer">
                        <img src="https://img.icons8.com/color/512/google-logo.png" alt="img" class="w-7 h-7">
                        Continue with google
                    </button>
                    {#if errmsgg != ""}
                        <div class="mt-1.5 px-2 py-1 text-sm bg-red-500 text-white flex items-center justify-between gap-2 rounded-md">
                            {errmsgg}
                            <i class="fa fa-close cursor-pointer" on:click={() => {errmsgg = ""}}></i>
                        </div>
                    {/if}
                </div>
                <div class="w-full">
                    <div class="text-center text-sm text-gray-600">
                        By signing up, you agree to our 
                        <a href="#" class="text-blue-500 hover:text-blue-700">Terms of Service</a> and 
                        <a href="#" class="text-blue-500 hover:text-blue-700">Privacy Policy</a>.
                    </div>
                </div>
                <div class="flex items-center space-x-2 my-5">
                    <div class="border-t flex-grow border-gray-200"></div>
                    <span class="text-gray-700">OR</span>
                    <div class="border-t flex-grow border-gray-200"></div>
                </div>
                <p class="text-center">Already have an account <span on:click={() => {cred = "login"}} class="w-fit underline text-purple-600 hover:no-underline cursor-pointer">Login</span></p>
            </div>
        </div>
        <div class="signin w-72 h-96 p-5 flex items-center absolute rounded-xl top-1/2 left-1/2 bg-white shadow-md {cred == "login" ? "" : "rotate-[7deg]"}" style="{cred == "login" ? "animation: rotate 0.7s ease-in-out forwards;" : "animation: signin 1s ease-in-out forwards;"}">
            <div class="grid w-full space-y-3">
                <h1 class="font-bold text-2xl text-center">Log in</h1>
                {#if errmsgl != ""}
                    <div class="px-2 py-1 text-sm bg-red-500 text-white flex items-center justify-between gap-2 rounded-md">
                        {errmsgl}
                        <i class="fa fa-close cursor-pointer" on:click={() => {errmsgl = ""}}></i>
                    </div>
                {/if}
                <form class="w-full space-y-3">
                    <div class="w-full h-10 group">
                        <input bind:value={email} type="text" id="email-log" class="w-full h-10 px-3 py-1 rounded-md border" required>
                        <label for="email-log" class="w-fit relative -top-8 left-2 flex gap-2 items-center px-1 text-gray-700"><i class="fa fa-envelope"></i>Email</label>
                    </div>
                    <div class="w-full h-10 group relative">
                        <input bind:value={pass} type="{showpass ? 'text' : 'password'}" id="pass-log" class="w-full h-10 px-3 pr-7 py-1 rounded-md border" required>
                        <label for="pass-log" class="w-fit relative -top-8 left-2 flex gap-2 items-center px-1 text-gray-700"><i class="fa fa-lock"></i>Password</label>
                        <i class="fa-solid fa-eye{showpass ? '' : '-slash'} absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-sm" on:click={() => {showpass = !showpass}}></i>
                    </div>
                    <button class="w-full p-2 rounded-md text-white bg-purple-600 hover:bg-purple-700 cursor-pointer" on:click={LoginWithEmail}>Login</button>
                </form>
                <div class="flex items-center space-x-2 text-sm">
                    <div class="border-t flex-grow border-gray-200"></div>
                    <span class="text-gray-700">OR</span>
                    <div class="border-t flex-grow border-gray-200"></div>
                </div>
                <button on:click={LoginWithGoogle} class="w-full px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium border border-blue-600 hover:bg-blue-200 rounded-md cursor-pointer">
                    <img src="https://img.icons8.com/color/512/google-logo.png" alt="img" class="w-6 h-6">
                    Login with google
                </button>
                <p class="">Don't have an account <span on:click={() => {cred = "signup"}} class="w-fit underline text-purple-600 hover:no-underline cursor-pointer">Signup</span></p>
            </div>
        </div>
        <style>
            .group input:valid ~ label,
            .group input:focus ~ label{
                top: -50px;
                font-size: 14px;
                transition: all .2s;
                background: #fff;
                padding-left: 8px;
                padding-right: 8px;
            }
            @keyframes signin {
                0%{
                    transform: translate(-50%, -50%) translateX(0);
                    z-index: 1;
                }
                50%{
                    transform: translate(-50%, -50%) translateX(-320px);
                    z-index: 1;
                }
                60%{
                    z-index: 0;
                }
                100%{
                    transform: translate(-50%, -45%) translateX(-20px) rotate(7deg);
                    z-index: 0;
                }
            }
            @keyframes signup {
                0%{
                    transform: translate(-50%, -50%) translateX(0);
                    z-index: 1;
                }
                50%{
                    transform: translate(-50%, -50%) translateX(320px);
                    z-index: 1;
                }
                60%{
                    z-index: 0;
                }
                100%{
                    transform: translate(-50%, -45%) translateX(-22px) rotate(7deg);
                    z-index: 0;
                }
            }
            @keyframes rotate {
                0%{
                    transform: translate(-50%, -50%) rotate(7deg);
                }
                100%{
                    transform: translate(-50%, -50%) rotate(0deg);
                    z-index: 1;
                }
            }
        </style>
    {/if}
</div>
