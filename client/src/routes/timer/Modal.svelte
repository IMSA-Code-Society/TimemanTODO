<!-- Toggle Switch -->
<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/css-toggle-switch@latest/dist/toggle-switch.min.css" />

<dialog class="modal fade" data-backdrop="static" data-keyboard="false" tabindex="-1" id="post-reflect" style="padding-top: env(safe-area-inset-top)">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-body">
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
          <a href="#" data-dismiss="modal" onclick="$('#post-reflect').val('cancel')" style="margin-right: 5px">Cancel</a>
          <a href="#" data-dismiss="modal" onclick="$('#post-reflect').val('skip')">Skip</a>
          <strong style="float: right"><a href="#" data-dismiss="modal">Finish</a></strong>
        </div>
      </div>
    </div>
  </div>
</dialog>

<style>
</style>
