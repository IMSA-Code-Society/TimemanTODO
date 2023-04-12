<script lang="ts">
</script>

<div class="perfectCenter">
    <div id="login">
        <div>
        <form autocomplete="off" autocorrect="off" spellcheck="false">
            <select id="task"></select><br />
            <input placeholder="Goal" id="goal" type="text" /><br />
            <!-- Cannot be type=number b/c when any letter entered, the value becomes "", clearing the input -->
            <div style="display: flex; align-items: center;">
            <input placeholder="Allocated Time" id="alloc" inputmode="decimal" min="0" step="any" oninput="this.value = this.value.replace(/[^1234567890]+/, '')" />
            <button style="flex-shrink: 99; margin-right: 0; align-self: stretch;" onclick="event.preventDefault(); $('#alloc').val(25)">25</button>
            </div>
            <span id="elapsed"></span>
        </form>
        <div style="display: flex;">
            <button onclick="start()" style="background: limegreen;" id="start">Start</button>
            <button onclick="stop()" style="background: indianred;" id="stop">Stop</button>
        </div>
        </div>
    </div>
</div>

<style>
    #login {
        background: conic-gradient(grey 100%, darkgrey 100%);
        border-radius: 10px;
        padding: 5px;
        margin: 10px;
        max-width: 506px;
        width: 100%;
        /* Fix junk pixels on iOS, watch for preformance: */
        /* https://stackoverflow.com/questions/9092125/how-to-debug-dynamically-loaded-javascript-with-jquery-in-the-browsers-debugg */
        transform: translateZ(0);
    }

    #login > div {
        padding: 20px;
        background: white;
        border-radius: 10px;
    }

    #login * {
        font-size: 18pt;
        width: 100%;
    }

    /* GLOBAL */

    :root {
        --viewheight: calc(100%  + env(safe-area-inset-bottom));
    }

    .perfectCenter {
        display: flex;
        justify-content: center;
        align-items: center;
        
        height: var(--viewheight);
        width: 100vw;
        position: absolute;
        left: 0;
        top: 0;
        pointer-events: none;
    }

    .perfectCenter * {
        pointer-events: all;
    }

    input, select, button {
        box-sizing: border-box;
        -webkit-appearance: none;
        border: 1px solid rgb(169, 169, 169);
        border-radius: 5px;
        margin: 2px;
        background-color: white;
    }

    button, select {
        cursor: pointer;
    }
</style>
