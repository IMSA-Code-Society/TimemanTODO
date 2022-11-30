import * as client from "./client.js"

for (const [key, val] of Object.entries(client)) {
  window[key] = val;
}

document.getElementById("form").onsubmit = ev => {
  ev.preventDefault();
  console.log(new FormData(ev.currentTarget as HTMLFormElement));
}
