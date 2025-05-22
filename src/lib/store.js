import { writable } from "svelte/store";
import { browser } from "$app/environment";

let data = [];
export const tasks = writable(browser ? JSON.parse(localStorage.getItem("tasks") || JSON.stringify(data)) : []);
tasks.subscribe((val) => browser && (localStorage.tasks = JSON.stringify(val)));

export const Profile = writable(browser ? JSON.parse(localStorage.getItem("Profile") || JSON.stringify({})) : {});
Profile.subscribe((val) => browser && (localStorage.Profile = JSON.stringify(val)));

