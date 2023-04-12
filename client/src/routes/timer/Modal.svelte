<!-- Toggle Switch -->
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/css-toggle-switch@latest/dist/toggle-switch.min.css" />

<script lang="ts">
  import {createEventDispatcher, onDestroy} from "svelte";
  import type {Acomplishment} from "../../lib/api";

  export let openTarget: EventTarget;

  let dialogRef: HTMLDialogElement;

  const dispatch = createEventDispatcher<{ close: Acomplishment }>();

  function submit(ev: SubmitEvent) {
    const formRef = ev.target as HTMLFormElement;
    const submitType = (ev.submitter as HTMLInputElement).name as "cancel" | "skip" | "finish";
    const formData = new FormData(ev.target as HTMLFormElement);
    switch (submitType) {
      case "finish":
        dispatch("close", {productive: formData.get("productive") === "on", accomplishment: formData.get("accomplishment") as string});
        break;
      case "skip":
        dispatch("close", {productive: undefined, accomplishment: undefined});
        break
      case "cancel":
        break;  // no op
    }
    formRef.reset();
  }

  function lightDismiss({target:dialog}) {
    // Dismiss if clicked background
    if (dialog.nodeName === 'DIALOG')
      dialog.close('dismiss')
  }

  openTarget.addEventListener("open", () => dialogRef.showModal());
  onDestroy(() => openTarget.removeEventListener("open", null));
</script>

<!-- TODO: make the dialog part its own component? -->
<dialog bind:this={dialogRef} on:click={lightDismiss}>
  <form method="dialog" on:submit={submit}>
    <p class="modal-title">What did you accomplish?</p>
    <textarea id="prompt" name="accomplishment" style="width: 100%; resize: none; min-height: 55px;" oninput="this.style.height = 'auto'; this.style.height = this.scrollHeight+3+'px';"></textarea>

    Productive?
    <label class="switch-light" style="display: inline-block; width: 65px; vertical-align: middle;">
      <input type="checkbox" name="productive" checked>
      <span>
        <span>☹️</span>
        <span>😊</span>
        <a class="btn btn-primary"></a>
      </span>
    </label>

    <div>
      <input
        type="submit"
        value="Cancel"
        name="cancel"
        formnovalidate
        style="margin-right: 5px" />
      <input
        type="submit"
        value="Skip"
        name="skip"
        formnovalidate />
      <strong style="float: right">
        <input
          type="submit"
          value="Finish"
          name="finish"
          />
      </strong>
    </div>
  </form>
</dialog>

<style>
  dialog {
    width: 95%;
    max-width: 500px;
    border: 1px solid rgba(0,0,0,.2);
    border-radius: 0.3rem;
    padding: 1rem;
    display: block;
    opacity: 0;
    margin-top: 0;
    transition: opacity, margin-top;
    transition-duration: 400ms;
  }
  dialog:not([open]) {
    pointer-events: none;
  }
  dialog[open] {
    opacity: 1;
    /* TODO: show modal on bottom on mobile */
    margin-top: 1.75rem;
  }
  dialog::backdrop {
    background-color: black;
    opacity: 0.5;
  }
  /* TODO: make accessible with prefers-reduced-motion */

  input[type="submit"] {
    /* Reset */
    appearance: none;
    border: 0;
    background: 0;
    display: inline;
    padding: 0;

    /* Styles */
    color: #007bff;
  }

  .btn-primary {
    background-color: #007bff;
    border-radius: 0.25rem;
  }
</style>
