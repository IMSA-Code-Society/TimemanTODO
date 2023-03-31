import * as client from "./client.js"

for (const [key, val] of Object.entries(client)) {
  window[key] = val;
}

document.getElementById("form").onsubmit = ev => {
  ev.preventDefault();
  const formData = new FormData(ev.currentTarget as HTMLFormElement);
  client.makeCommit({
    database: formData.get("database") as string,
    // @ts-ignore
    operation: formData.get("operation"),
    payloadId: Number.parseInt(formData.get("payloadId") as string) || JSON.parse(formData.get("payloadValue") as string).id,
    payloadValue: formData.get("payloadValue") as string,
    timestamp: new Date().getTime(),
  }).then(() => console.log("Commit success!"));
}
