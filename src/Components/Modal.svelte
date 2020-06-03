<script>
  import { createEventDispatcher, onDestroy } from "svelte";
  import { fly } from "svelte/transition";

  let visible = true;
  const dispatch = createEventDispatcher();
  const close = () => dispatch("close");

  let modal;

  const handle_keydown = e => {
    if (e.key === "Escape") {
      close();
      return;
    }

    if (e.key === "Tab") {
      // trap focus
      const nodes = modal.querySelectorAll("*");
      const tabbable = Array.from(nodes).filter(n => n.tabIndex >= 0);

      let index = tabbable.indexOf(document.activeElement);
      if (index === -1 && e.shiftKey) index = 0;

      index += tabbable.length + (e.shiftKey ? -1 : 1);
      index %= tabbable.length;

      tabbable[index].focus();
      e.preventDefault();
    }
  };

  const previously_focused =
    typeof document !== "undefined" && document.activeElement;

  if (previously_focused) {
    onDestroy(() => {
      previously_focused.focus();
    });
  }
</script>

<style>
  .modal-background {
    position: fixed;
    top: 40px;
    left: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }
  @media (max-width: 360px) {
    .modal-background {
      position: fixed;
      top: 40px;
      left: 0;
      width: 100%;
      height: 100%;
      cursor: pointer;
    }
  }
  @media (min-width: 1366px) {
    .modal-background {
      position: fixed;
      top: 0px;
      left: 0;
      width: 100%;
      height: 100%;
      cursor: pointer;
    }
  }
  @media (min-width: 1660px) {
    .modal-background {
      position: fixed;
      top: -50px;
      left: 0;
      width: 100%;
      height: 100%;
      cursor: pointer;
    }
  }
  .modal {
    position: absolute;
    left: 50%;
    top: 50%;
    width: calc(100vw);
    max-width: 32em;
    max-height: calc(100vh - 3em);
    overflow: auto;
    transform: translate(-50%, -50%);
    border-radius: 0.2em;
    background: white;
  }
  @media (max-width: 360px) {
    .modal {
      position: absolute;
      left: 50%;
      top: 50%;
      width: calc(100vw);
      max-width: 32em;
      max-height: calc(100vh - 3em);
      overflow: auto;
      transform: translate(-50%, -50%);
      border-radius: 0.2em;
      background: white;
    }
  }
  @media (min-width: 375px) {
    .modal {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 100%;
      max-width: 100%;
      max-height: calc(100vh - 3em);
      overflow: auto;
      transform: translate(-50%, -50%);
      border-radius: 0.2em;
      background: white;
    }
  }
  @media (min-width: 411px) {
    .modal {
      position: absolute;
      left: 50%;
      top: 50%;
      width: auto;
      max-width: 32em;
      max-height: calc(100vh - 3em);
      overflow: auto;
      transform: translate(-50%, -50%);
      border-radius: 0.2em;
      background: white;
    }
  }
  @media (min-width: 768px) {
    .modal {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 100%;
      max-width: 100%;
      max-height: 100%;
      overflow: auto;
      transform: translate(-50%, -50%);
      border-radius: 0.2em;
      background: white;
    }
  }
  @media (min-width: 1366px) {
    .modal {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 100%;
      max-width: 100%;
      max-height: 100%;
      overflow: auto;
      transform: translate(-50%, -50%);
      border-radius: 0.2em;
      background: white;
    }
  }
  @media (min-width: 990px) {
    .lgMmoT {
      top: 20px;
      left: 25px;
    }
  }
  @media (max-width: 360px) {
    .lgMmoT {
      top: 40px;
      left: 25px;
    }
  }
  @media (min-width: 411px) {
    .lgMmoT {
      top: 40px;
      left: 25px;
    }
  }
  @media (min-width: 375px) {
    .lgMmoT {
      top: 40px;
      left: 25px;
    }
  }
  @media (min-width: 768px) {
    .lgMmoT {
      top: 66px;
      left: 25px;
    }
  }
  @media (min-width: 1024px) {
    .lgMmoT {
      top: 66px;
      left: 25px;
    }
  }
  .lgMmoT {
    position: absolute;
    z-index: 999;
  }
  @media (min-width: 1366px) {
    .lgMmoT {
      position: absolute;
      top: 70px;
      left: 60px;
      z-index: 999;
    }
  }
  .lgMmoT .reusecore__button {
    font-family: Lato, sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: rgb(119, 121, 140);
    height: 30px;
  }
  .lgMmoT .reusecore__button .btn-icon {
    margin-right: 5px;
  }
  .ciDCaj span.btn-icon {
    display: flex;
  }
  .lgMmoT .reusecore__button .btn-text {
    padding: 0px;
  }
  .ciDCaj {
    cursor: pointer;
    display: inline-flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    background-color: rgb(0, 158, 127);
    width: auto;
    color: rgb(255, 255, 255);
    font-family: Lato, sans-serif;
    font-weight: 700;
    padding-top: 0px;
    padding-bottom: 0px;
    box-sizing: border-box;
    height: 38px;
    padding-left: 15px;
    padding-right: 15px;
    font-size: 14px;
    text-decoration: none;
    border-width: 0px;
    border-style: initial;
    border-color: initial;
    border-image: initial;
    transition: all 0.3s ease 0s;
    border-radius: 6px;
  }
  .btn:hover {
    background: rgb(0, 158, 127);
    color: #fff;
  }
  .btn {
    background-color: rgb(255, 255, 255);
    border: 1px solid rgb(241, 241, 241);
    color: rgb(119, 121, 140);
    -webkit-appearance: media-sliderthumb;
  }
</style>

<svelte:window on:keydown={handle_keydown} />

<div transition:fly={{ y: 200, duration: 1000 }} class="modal-background">
  <div class="modal" role="dialog" aria-modal="true" bind:this={modal}>
    <div class="ProductDetailsstyle__BackButton-tn8bpu-2 lgMmoT">
      <!-- <button
        on:click={close}
        type="button"
        class="Buttonstyle__ButtonStyle-voymor-0 ciDCaj reusecore__button btn">
        <span class="btn-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="8.003"
            viewBox="0 0 12 8.003">
            <path
              data-name="_ionicons_svg_ios-arrow-round-back (2)"
              d="M116.447,160.177a.545.545,0,0,1,0,.767l-2.53,2.538h9.641a.542.542,0,0,1,0,1.084h-9.641l2.534,2.538a.549.549,0,0,1,0,.767.54.54,0,0,1-.763,0l-3.435-3.46a.608.608,0,0,1-.113-.171.517.517,0,0,1-.042-.208.543.543,0,0,1,.154-.379l3.435-3.46A.531.531,0,0,1,116.447,160.177Z"
              transform="translate(-112.1 -160.023)"
              fill="currentColor" />
          </svg>
        </span>
        <span class="btn-text">Back</span>
      </button> -->
    </div>
    <slot />
  </div>
</div>
