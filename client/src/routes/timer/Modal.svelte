<!-- Toggle Switch -->
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/css-toggle-switch@latest/dist/toggle-switch.min.css" />

<script lang="ts">
  export let openTarget: EventTarget;

  let dialogRef: HTMLDialogElement;

  openTarget.addEventListener("open", () => dialogRef.showModal());
</script>

<dialog bind:this={dialogRef}>
  <form method="dialog">
    <p class="modal-title">What did you accomplish?</p>
    <textarea id="prompt" style="width: 100%; resize: none; min-height: 55px;" oninput="this.style.height = 'auto'; this.style.height = this.scrollHeight+3+'px';"></textarea>

    Productive?
    <label class="switch-light" style="display: inline-block; width: 65px; vertical-align: middle;">
      <input type="checkbox" checked>
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
          formnovalidate />
      </strong>
    </div>
  </form>
</dialog>

<style>
  dialog {
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
</style>
