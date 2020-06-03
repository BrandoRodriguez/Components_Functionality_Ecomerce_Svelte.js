<script>
  import { get } from "svelte/store";
  import { cart } from "../stores/stores.js";
  import { fly } from "svelte/transition";
  import Modal from "./Modal.svelte";

  export let medida;
  export let precio;
  export let ico;

  const cartItems = get(cart);
  let inCart = cartItems[name] ? cartItems[name].count : 0;

  function addToCart() {
    inCart++;
    cart.update(n => {
      return { ...n, [name]: { ...item, count: inCart } };
    });
  }
  const countButtonHandler = e => {
    if (e.target.classList.contains("add")) {
      inCart--;
    } else if (inCart >= 1) {
      inCart++;
    }
    cart.update(n => {
      return { ...n, [name]: { ...item, count: inCart } };
    });
  };
</script>

<style>
  div {
    font-family: Lato, sans-serif;
    margin: 0px;
  }
  *,
  ::before,
  ::after {
    box-sizing: inherit;
  }

  div {
    font-family: Lato, sans-serif;
    margin: 0px;
  }
  .button-general {
    cursor: pointer;
    display: inline-flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    width: auto;
    font-family: Lato, sans-serif;
    font-weight: 700;
    padding-top: 0px;
    padding-bottom: 0px;
    box-sizing: border-box;
    color: rgb(0, 158, 127);
    background-color: transparent;
    height: 38px;
    padding-left: 15px;
    padding-right: 15px;
    font-size: 14px;
    text-decoration: none;
    border-image: initial;
    border-width: 1px;
    border-style: solid;
    border-color: rgb(241, 241, 241);
    transition: all 0.35s ease 0s;
    border-radius: 20px;
  }
  .button-general span.button-icon {
    display: flex;
    font-size: 20px;
    font-weight: 100;
  }
  .button-card {
    height: 36px;
    padding-left: 17px;
    padding-right: 17px;
    font-size: 13px;
    font-weight: 700;
    border-width: 2px;
    border-style: solid;
    border-color: rgb(247, 247, 247);
    border-image: initial;
    border-radius: 18px;
  }
  .button-card:hover {
    background: rgb(0, 158, 127);
    color: #fff;
  }
  .fmEddu {
    display: flex;
    background-color: rgb(0, 158, 127);
    color: rgb(255, 255, 255);
    font-size: 15px;
    font-weight: 700;
    -webkit-box-pack: justify;
    justify-content: space-between;
    -webkit-box-align: center;
    align-items: center;
    flex-shrink: 0;
    width: 104px;
    height: 36px;
    border-radius: 200px;
    overflow: hidden;
  }

  .bPmfin {
    background-color: transparent;
    color: rgb(255, 255, 255);
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    height: 100%;
    cursor: pointer;
    border-width: initial;
    border-style: none;
    border-color: initial;
    border-image: initial;
    padding: 10px;
    -webkit-appearance: media-volume-slider;
  }
  *,
  ::before,
  ::after {
    box-sizing: inherit;
  }
  button {
    font-family: Lato, sans-serif;
    margin: 0px;
  }

  .fILoFu {
    width: 100%;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: justify;
    justify-content: space-between;
    background-color: rgb(255, 255, 255);
    border-bottom: 1px solid rgb(241, 241, 241);
  }
  @media (max-width: 990px) {
    .hbqbsH {
      margin-right: 30px;
    }
  }
  .hbqbsH {
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-right: 40px;
  }
  .jjyQfw {
    font-family: Lato, sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: rgb(22, 31, 106);
    margin-bottom: 10px;
  }
  @media (max-width: 990px) {
    .kbZYLS {
      margin-right: 20px;
    }
  }
  .kbZYLS {
    display: flex;
    flex-shrink: 0;
    -webkit-box-align: baseline;
    align-items: baseline;
  }
  @media (max-width: 990px) {
    .cjrrYE {
      display: none;
    }
  }
  .cjrrYE {
    font-family: Lato, sans-serif;
    font-size: 13px;
    font-weight: 400;
    color: rgb(119, 121, 140);
  }
  .iCYaYm {
    font-family: Lato, sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: rgb(22, 31, 106);
    padding-right: 20px;
  }
</style>
<div class="ProductDetailsFoodstyle__ItemWrapper-hqku2g-19 fILoFu">
  <div class="ProductDetailsFoodstyle__ItemNameDetails-hqku2g-20 hbqbsH">
    <span class="ProductDetailsFoodstyle__ItemName-hqku2g-21 jjyQfw">
      {medida}
    </span>
  </div>
  <div class="ProductDetailsFoodstyle__ItemNamePricing-hqku2g-23 kbZYLS">
    <span class="ProductDetailsFoodstyle__HelpText-hqku2g-24 cjrrYE" />
    <span class="ProductDetailsFoodstyle__ItemPrice-hqku2g-25 iCYaYm">
      {precio}
    </span>
  </div>
  <div class="QuickViewstyle__ProductCartBtn-sc-28ycgw-14 EWA-dv">
    {#if inCart > 0}
      <div class="Counterstyle__CounterBox-sc-14ahato-0 fmEddu">
        <button
          class="add Counterstyle__CounterButton-sc-14ahato-1 bPmfin"
          on:click={countButtonHandler}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12px"
            height="2px"
            viewBox="0 0 12 2">
            <rect
              data-name="Rectangle 522"
              width="12"
              height="2"
              rx="1"
              fill="currentColor" />
          </svg>
        </button>
        <span class="Counterstyle__CounterValue-sc-14ahato-2 dMHyRK">
          {inCart}
        </span>
        <button
          class=" Counterstyle__CounterButton-sc-14ahato-1 bPmfin"
          on:click={countButtonHandler}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12px"
            height="12px"
            viewBox="0 0 12 12">
            <g
              id="Group_3351"
              data-name="Group 3351"
              transform="translate(-1367 -190)">
              <rect
                data-name="Rectangle 520"
                width="12"
                height="2"
                rx="1"
                transform="translate(1367 195)"
                fill="currentColor" />
              <rect
                data-name="Rectangle 521"
                width="12"
                height="2"
                rx="1"
                transform="translate(1374 190) rotate(90)"
                fill="currentColor" />
            </g>
          </svg>
        </button>
      </div>
    {:else}
      <button on:click={addToCart} class="button-general button-card">
        <span class="button-icon">{ico}</span>
      </button>
    {/if}
  </div>
</div>



