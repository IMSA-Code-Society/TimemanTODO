import * as client from "./client.js"

for (const [key, val] of Object.entries(client)) {
  window[key] = val;
}

