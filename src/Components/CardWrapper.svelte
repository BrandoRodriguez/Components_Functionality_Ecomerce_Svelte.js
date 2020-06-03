<script>
  import Card from "./Card.svelte";
  import Card2 from "./Card2.svelte";
  import Prueba2 from "./Prueba2.svelte";
  import items1 from "../items1.js";
  import items2 from "../items2.js";
  import items from "../items.js";
  import Header from "./Header.svelte";
  import { fade, fly } from "svelte/transition";

  let visible = true;
  let scoops = 1;
  let user = { loggedIn: false };


  let prefix = "";

  let name = "";
  let marca = "";
  let img = "";
  let i = 0;

  $: filtereditems = prefix
    ? items.filter(item => {
        const name = `${item.name}, ${item.marca}, ${item.img}`;
        return name.toLowerCase().startsWith(prefix.toLowerCase());
      })
    : items;


  
</script>

<style>
 input {
    display: block;
    margin: 0 0 0.5em 0;
  }

  .img111 {
    display: inline-block;
    vertical-align: middle;
    width: 58px;
  }

  .jjTQwV {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    background-color: rgb(247, 247, 247);
    padding-right: 0px;
    transition: padding-right 0.35s ease-in-out 0s;
    margin-top: 70px;
  }
  .enWbFA {
    background-color: rgb(255, 255, 255);
    width: 280px;
  }

  @media (max-width: 360px) {
    .enWbFA {
      width: 100%;
    }
  }
  .egvYxQ {
    position: fixed;
    width: 100%;
  }

  @media (max-width: 768px) {
    .egvYxQ {
      position: relative;
      width: 100%;
      display: none;
    }
    @media (max-width: 990px) {
      .eaFjsg .popover-content {
        padding: 25px;
      }
    }
  }
  @media (min-width: 991px) {
    .eaFjsg:not(.mobileView) {
      display: none;
    }
  }
  .dZMxZn {
    position: relative;
    cursor: pointer;
  }
  .eaFjsg .popover-handler {
    display: block;
    cursor: pointer;
    padding: 15px;
  }
  .cXRUBX {
    font-size: 14px;
    font-weight: 700;
    color: rgb(13, 17, 54);
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: justify;
    justify-content: space-between;
  }
  .cXRUBX > div:first-child {
    -webkit-box-flex: 1;
    flex-grow: 1;
  }
  .cXRUBX > div {
    display: flex;
    -webkit-box-align: center;
    align-items: center;
  }
  .cXRUBX > div:first-child svg {
    margin-right: 10px;
  }
  .cXRUBX > div:last-child {
    color: rgb(119, 121, 140);
  }
  .bLZUVH {
    padding: 35px 0px 45px;
  }

  @media (max-width: 768px) {
    .bLZUVH {
      padding: 20px 0px 45px;
      margin-left: -20px;
      display: none;
    }
  }
  div {
    font-family: Lato, sans-serif;
    margin: 0px;
  }
  .cjsAMp {
    padding-left: 30px;
    padding-right: 20px;
  }
  .fMlvk {
    margin-bottom: 15px;
    padding-left: 0px;
    position: relative;
    overflow-x: hidden;
  }
  .giPkvJ {
    font-size: 15px;
    font-weight: 700;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    margin-bottom: 12px;
    color: rgb(0, 158, 127);
    cursor: pointer;
    transition: all 0.15s ease-in-out 0s;
    padding: 5px 0px;
    outline: 0px;
  }
  .iMJnej {
    width: 16px;
    margin-right: 15px;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
  }
  .iMJnej svg {
    width: 100%;
    height: auto;
  }
  .iLmyeI {
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: middle;
    overflow: hidden;
  }
  .iznAyA {
    will-change: transform, opacity, height;
    border-left: 0px;
    overflow: hidden;
  }
  .cNbgwQ {
    margin-bottom: 10px;
    padding-left: 32px;
    position: relative;
    overflow-x: hidden;
  }
  .fexoSQ {
    font-size: 13px;
    font-weight: 700;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    margin-bottom: 0px;
    color: rgb(0, 158, 127);
    cursor: pointer;
    transition: all 0.15s ease-in-out 0s;
    padding: 5px 0px;
    outline: 0px;
  }

  .fAryMo {
    width: 10px;
    margin-right: 8px;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
  }
  .fAryMo svg {
    width: 100%;
    height: 2px;
  }
  .iLmyeI {
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: middle;
    overflow: hidden;
  }
  .iznAyA {
    will-change: transform, opacity, height;
    border-left: 0px;
    overflow: hidden;
  }

  .cNbgwQ {
    margin-bottom: 10px;
    padding-left: 32px;
    position: relative;
    overflow-x: hidden;
  }
  .hRTUfE {
    font-size: 13px;
    font-weight: 700;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    margin-bottom: 0px;
    color: rgb(119, 121, 140);
    cursor: pointer;
    transition: all 0.15s ease-in-out 0s;
    padding: 5px 0px;
    outline: 0px;
  }
  .fAryMo {
    width: 10px;
    margin-right: 8px;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
  }
  .iLmyeI {
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: middle;
    overflow: hidden;
  }
  .iznAyA {
    will-change: transform, opacity, height;
    border-left: 0px;
    overflow: hidden;
  }

  /* ---------------- */

  .jjeTWK {
    width: calc(100% - 280px);
    height: auto;
    min-height: 100vh;
    margin-top: 50px;
  }
  @media (min-width: 1024px) {
    .jjeTWK {
      width: calc(100% - 280px);
      height: auto;
      min-height: 100vh;
      margin-top: 30px;
    }
  }
  .fteaaY {
    display: flex;
    flex-wrap: wrap;
    background-color: rgb(247, 247, 247);
    position: relative;
    padding-left: 15px;
  }
  @media (max-width: 768px) {
    .jjeTWK {
      min-height: auto;
    }
  }
  @media (max-width: 990px) {
    .jjeTWK {
      width: 100%;
    }
  }
  @media (max-width: 768px) {
    .fteaaY {
      margin-left: -14px;
      margin-top: 15px;
    }
  }
  .opcion {
    display: none;
  }

  /* ------------------- */

  .bROIVP {
    width: 100%;
    z-index: 3;
    position: fixed;
    background-color: rgb(255, 255, 255);
    height: 55px;
    overflow: hidden;
  }

  @media (min-width: 1024px) {
    .desaparecer {
      display: none;
    }
  }

  .jPglrN {
    display: flex;
    flex-wrap: nowrap;
    align-items: flex-start;
    height: 80px;
    overflow-y: hidden;
    overflow-x: auto;
    padding-top: 15px;
    padding-bottom: 25px;
    padding-left: 15px;
    padding-right: 15px;
  }

  .jPglrN .store-nav-link {
    margin-right: 10px;
  }
  .bROIVP1 {
    width: 100%;
    overflow: hidden;
  }
  /* 
 @media (min-width: 1024px) {
    .desaparecer {
      display: none;
    }
  } */

  .jPglrN1 {
    display: flex;
    flex-wrap: nowrap;
    align-items: flex-start;
    overflow-y: hidden;
    overflow-x: auto;
    padding-top: 15px;
    padding-bottom: 25px;
    padding-right: 15px;
  }

  .jPglrN .store-nav-link a.current-page {
    color: rgb(0, 158, 127);
    background-color: rgb(248, 248, 248);
  }
  .jPglrN .store-nav-link a {
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    font-size: 14px;
    font-weight: 700;
    color: rgb(119, 121, 140);
    line-height: 1.2;
    white-space: nowrap;
    padding: 5px 9px;
    border-radius: 6px;
    text-decoration: none;
  }

  span {
    font-family: Lato, sans-serif;
    margin: 0px;
  }


  
</style>




<div class="StoreNavstyle__StoreNavWrapper-z670xw-0 bROIVP desaparecer ">
  <div class="StoreNavstyle__StoreNavLinks-z670xw-1 jPglrN">
    <div class="store-nav-link">
      <a class=" current-page" style="display:flex;align-items:center" href="/">
        <input
          id="select1"
          class="opcion"
          type="radio"
          bind:group={scoops}
          value={1} />

        <label for="select1" class="TreeMenustyle__Title-sc-1pcei7c-2 iLmyeI">
          Accesorios y Conexiones
        </label>

      </a>
    </div>

    <div class="store-nav-link">
      <a class="" style="display:flex;align-items:center" href="/">
        <input
          id="select2"
          class="opcion"
          type="radio"
          bind:group={scoops}
          value={2} />
        <label for="select2" class="TreeMenustyle__Title-sc-1pcei7c-2 iLmyeI" />
      </a>
    </div>
    <div class="store-nav-link">
      <a class="" style="display:flex;align-items:center" href="/">
        <input
          id="select3"
          class="opcion"
          type="radio"
          bind:group={scoops}
          value={3} />
        <label for="select3" class="TreeMenustyle__Title-sc-1pcei7c-2 iLmyeI" />
      </a>
    </div>
    <div class="store-nav-link">
      <a class="" style="display:flex;align-items:center" href="/">
        <input
          id="select4"
          class="opcion"
          type="radio"
          bind:group={scoops}
          value={4} />
        <label for="select4" class="TreeMenustyle__Title-sc-1pcei7c-2 iLmyeI" />
      </a>
    </div>
    <div class="store-nav-link">
      <a class="" style="display:flex;align-items:center" href="/">
        <span class="label" />
      </a>
    </div>
    <div class="store-nav-link">
      <a class="" style="display:flex;align-items:center" href="/">
        <span class="label" />
      </a>
    </div>
    <div class="store-nav-link">
      <a class="" style="display:flex;align-items:center" href="/">
        <span class="label" />
      </a>
    </div>
    <div class="store-nav-link">
      <a class="" style="display:flex;align-items:center" href="/">
        <span class="label" />
      </a>
    </div>
  </div>
</div>
<!-- 
<div class="StoreNavstyle__StoreNavWrapper-z670xw-0 bROIVP1 desaparecer">
  <div class="StoreNavstyle__StoreNavLinks-z670xw-1 jPglrN1">
    {#each items as item}
      <Card {item} />
    {/each}
  </div>
</div> -->

<main class="pagesstyle__MainContentArea-sc-1ufuelp-3 jjTQwV">

  <div class="pagesstyle__SidebarSection-sc-1ufuelp-4 enWbFA">
    <div class="Sidebarstyle__CategoryWrapper-sc-10zqjq2-3 egvYxQ">

      <div class="Sidebarstyle__PopoverWrapper-sc-10zqjq2-0 eaFjsg">
        <div
          class="Popoverstyle__PopoverWrapper-ebbms3-0 dZMxZn popover-wrapper
          category-popover">
          <div class="popover-handler">
            <div class="Sidebarstyle__PopoverHandler-sc-10zqjq2-5 cXRUBX">
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 14 14">
                  <path
                    data-name="Path 2029"
                    d="M13.563,7.876H8.313a.437.437,0,0,0-.437.437v5.25A.437.437,0,0,0,8.313,14h5.25A.437.437,0,0,0,14,13.564V8.314A.437.437,0,0,0,13.563,7.876Zm0-7.875H8.313a.437.437,0,0,0-.437.437v5.25a.437.437,0,0,0,.437.437h5.25A.437.437,0,0,0,14,5.688V.438A.437.437,0,0,0,13.563,0ZM5.687,0H.437A.438.438,0,0,0,0,.438v5.25a.437.437,0,0,0,.437.437h5.25a.437.437,0,0,0,.437-.437V.438A.438.438,0,0,0,5.687,0Zm0,7.875H.437A.437.437,0,0,0,0,8.314v5.25A.437.437,0,0,0,.437,14h5.25a.437.437,0,0,0,.437-.437V8.314A.437.437,0,0,0,5.687,7.876Z"
                    transform="translate(0 -0.001)"
                    fill="currentColor" />
                </svg>
                Select your Category
              </div>
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="10"
                  height="5"
                  viewBox="0 0 10 5">
                  <path
                    data-name="Path 2030"
                    d="M0,63.75l5,5,5-5Z"
                    transform="translate(0 -63.75)"
                    fill="currentColor" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="Sidebarstyle__SidebarWrapper-sc-10zqjq2-2 bLZUVH">
        <div class="sticky-outer-wrapper" style="">
          <div
            class="sticky-inner-wrapper "
            style="position: relative; transform: translate3d(0px, 0px, 0px);">
            <div
              style="position:relative;overflow:hidden;width:100%;height:auto;min-height:0;max-height:688px">
              <div
                style="position: relative; overflow: scroll; margin-right:
                -17px; margin-bottom: -17px; min-height: 17px; max-height:
                705px; margin-left: 0px;">
                <div class="Sidebarstyle__TreeWrapper-sc-10zqjq2-4 cjsAMp">
                  <div class="TreeMenustyle__Frame-sc-1pcei7c-4 fMlvk">
                    <header
                      class="TreeMenustyle__Header-sc-1pcei7c-0 giPkvJ parent"
                      open="">
                      <input
                        id="select1"
                        class="opcion"
                        type="radio"
                        bind:group={scoops}
                        value={1} />

                      <div
                        class="TreeMenustyle__IconWrapper-sc-1pcei7c-1 iMJnej">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18px"
                          height="18px"
                          viewBox="0 0 18 18">
                          <g data-name="Layer 2">
                            <g data-name="Layer 3">
                              <path
                                data-name="Path 16"
                                d="M10.235 3.966a2.943 2.943 0
                                00-1.38-2.122c-.528-.243-.485-.618-.338-.854s.41-.231.832.164a5
                                5 0 011.368 2.87z"
                                fill="currentColor"
                                stroke="currentColor"
                                stroke-miterlimit="10"
                                stroke-width=".416" />
                              <path
                                data-name="Path 17"
                                d="M6.514 7.976a4.757 4.757 0 109.513
                                0c0-2.627-1.5-4.976-4.757-4.73-2.619.197-4.767
                                1.656-4.756 4.73z"
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.387" />
                              <path
                                data-name="Path 18"
                                d="M6.514 7.976a4.757 4.757 0 109.513
                                0c0-2.627-1.5-4.976-4.757-4.73-2.619.197-4.767
                                1.656-4.756 4.73z"
                                fill="currentColor" />
                              <path
                                data-name="Path 19"
                                d="M14.731 5.045s1.506 1.544.714
                                2.993c-.287.526-1.2.192-1.234-.485s.25-1.27-.236-2.05c-.349-.566.26-.878.756-.458z"
                                fill="#fff" />
                              <path
                                data-name="Path 20"
                                d="M10.834 3.413s1.161-4.315 6.469-2.048c0
                                0-2.459 4.074-6.469 2.048z"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.387" />
                              <path
                                data-name="Path 21"
                                d="M10.834 3.413s1.161-4.315 6.469-2.048c0
                                0-2.459 4.074-6.469 2.048z"
                                fill="#fff" />
                              <path
                                data-name="Path 22"
                                d="M10.516 4.513a10.193 10.193 0
                                015.63-2.863c-2.736-.521-6.018 1.748-6.018
                                1.748s.289.864.388 1.115z"
                                fill="currentColor"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width=".035" />
                              <path
                                data-name="Path 23"
                                d="M10.895
                                9.896h0c-.268-.877-1.969-1.65-4.234-1.72a5.286
                                5.286 0 00-4.515 1.858 2 2 0 00-.551
                                1.308h0a4.934 4.934 0 004.768 4.426c3.133.223
                                3.786-.96 4.225-1.9a6.363 6.363 0 00.307-3.972z"
                                fill="#fff"
                                stroke="#fff"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="3.19" />
                              <path
                                data-name="Path 24"
                                d="M10.895
                                9.896h0c-.268-.877-1.969-1.65-4.234-1.72a5.286
                                5.286 0 00-4.515 1.858 2 2 0 00-.551
                                1.308h0a4.934 4.934 0 004.768 4.426c3.133.223
                                3.786-.96 4.225-1.9a6.363 6.363 0 00.307-3.972z"
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.387" />
                              <path
                                data-name="Path 25"
                                d="M10.895
                                9.896h0c-.268-.877-1.969-1.65-4.234-1.72a5.286
                                5.286 0 00-4.515 1.858 2 2 0 00-.551
                                1.308h0a4.934 4.934 0 004.768 4.426c3.133.223
                                3.786-.96 4.225-1.9a6.363 6.363 0 00.307-3.972z"
                                fill="#fff"
                                stroke="currentColor"
                                stroke-miterlimit="10"
                                stroke-width=".069" />
                              <path
                                data-name="Path 26"
                                d="M10.895
                                9.896c-.268-.877-1.969-1.65-4.234-1.72a5.286
                                5.286 0 00-4.515 1.858 2 2 0 00-.551 1.308 4.934
                                4.934 0 004.768 4.426c3.133.223 3.786-.96
                                4.225-1.9a6.363 6.363 0 00.307-3.972z"
                                fill="currentColor" />
                              <path
                                data-name="Path 27"
                                d="M1.595 11.342a4.375 4.375 0 00.128.684 2.664
                                2.664 0 00.3.335c1.067 1.028 4.409 1.723 7.173 1
                                .883-.23
                                1.522-1.3.526-1.851-.139-.076-.243-.184-.208-.277s.089-.106.269-.1a1.2
                                1.2 0 001.232-.735 4.126 4.126 0
                                00-.121-.509c-.272-.876-1.974-1.644-4.239-1.715a5.286
                                5.286 0 00-4.515 1.858 2.024 2.024 0 00-.545
                                1.31z"
                                fill="#fff" />
                              <path
                                data-name="Path 28"
                                d="M1.921 9.984a1.569 1.569 0 00.1 2.377c1.066
                                1.028 4.409 1.723 7.173 1 .883-.23
                                1.522-1.3.526-1.851-.139-.076-.243-.184-.208-.277s.089-.106.269-.1a1.183
                                1.183 0 001.259-.823 1.321 1.321 0 00-.785-1.413"
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width=".416" />
                              <path
                                data-name="Path 29"
                                d="M8.013
                                10.78c-.018.471-.87.791-1.9.752s-1.856-.423-1.837-.9.87-.963
                                1.9-.924 1.855.605 1.837 1.072z"
                                fill="currentColor"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width=".555" />
                              <path
                                data-name="Path 30"
                                d="M9.722 12.123a2.411 2.411 0 01.467 2.08 2.759
                                2.759 0 01-1.5 2.427"
                                fill="none"
                                stroke="#fff"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width=".555" />
                            </g>
                          </g>
                        </svg>
                      </div>

                      <label
                        for="select1"
                        class="TreeMenustyle__Title-sc-1pcei7c-2 iLmyeI">
                        Accesorios y conexiones
                      </label>
                    </header>

                    <div
                      style="opacity: 1; height: auto;"
                      class="TreeMenustyle__Content-sc-1pcei7c-3 iznAyA">

                      <div style="transform: translate3d(0px, 0px, 0px);">
                        <div class="TreeMenustyle__Frame-sc-1pcei7c-4 cNbgwQ">

                          <header
                            class="TreeMenustyle__Header-sc-1pcei7c-0 fexoSQ
                            child"
                            open="">
                            <div
                              class="TreeMenustyle__IconWrapper-sc-1pcei7c-1
                              fAryMo">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12px"
                                height="2px"
                                viewBox="0 0 12 2">
                                <rect
                                  data-name="Rectangle 522"
                                  width="12px"
                                  height="2px"
                                  rx="1"
                                  fill="currentColor" />
                              </svg>
                            </div>
                            <input
                              id="select2"
                              class="opcion"
                              type="radio"
                              bind:group={scoops}
                              value={2} />
                            <label
                              for="select2"
                              class="TreeMenustyle__Title-sc-1pcei7c-2 iLmyeI">
                              Fruits
                            </label>
                          </header>

                          <div
                            style="opacity: 1; height: 0px;"
                            class="TreeMenustyle__Content-sc-1pcei7c-3 iznAyA">
                            <div
                              style="transform: translate3d(0px, 0px, 0px);" />
                          </div>
                        </div>
                        <div class="TreeMenustyle__Frame-sc-1pcei7c-4 cNbgwQ">

                          <header
                            class="TreeMenustyle__Header-sc-1pcei7c-0 hRTUfE
                            child">
                            <div
                              class="TreeMenustyle__IconWrapper-sc-1pcei7c-1
                              fAryMo">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12px"
                                height="2px"
                                viewBox="0 0 12 2">
                                <rect
                                  data-name="Rectangle 522"
                                  width="12px"
                                  height="2px"
                                  rx="1"
                                  fill="currentColor" />
                              </svg>
                            </div>
                            <input
                              id="select3"
                              class="opcion"
                              type="radio"
                              bind:group={scoops}
                              value={3} />
                            <label
                              for="select3"
                              class="TreeMenustyle__Title-sc-1pcei7c-2 iLmyeI">
                              Vegetables
                            </label>
                          </header>

                          <div
                            style="opacity:0;height:0"
                            class="TreeMenustyle__Content-sc-1pcei7c-3 iznAyA">
                            <div style="transform:translate3d(20px,0,0)" />
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              </div>

              <div
                style="position: absolute; height: 6px; transition: opacity
                200ms ease 0s; opacity: 0; right: 2px; bottom: 2px; left: 2px;
                border-radius: 3px;">
                <div
                  style="position: relative; display: block; height: 100%;
                  cursor: pointer; border-radius: inherit; background-color:
                  rgba(0, 0, 0, 0.2); width: 0px;" />
              </div>
              <div
                style="position: absolute; width: 6px; transition: opacity 200ms
                ease 0s; opacity: 0; right: 2px; bottom: 2px; top: 2px;
                border-radius: 3px;">
                <div
                  style="position: relative; display: block; width: 100%;
                  cursor: pointer; border-radius: inherit; background-color:
                  rgba(0, 0, 0, 0.2); height: 0px; transform: translateY(0px);" />
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>

  <div class="pagesstyle__ContentSection-sc-1ufuelp-5 jjeTWK">

    {#if scoops === 1}
      <div>
        <div class="Productsstyle__ProductsRow-p6azvq-0 fteaaY">
          <div
            class="StoreNavstyle__StoreNavWrapper-z670xw-0 bROIVP1 desaparecer">

            <div class="StoreNavstyle__StoreNavLinks-z670xw-1 jPglrN1">
              {#each items as item}
                <Card {item} />
              {/each}
            </div>
            


          </div>

          {#each items1 as item}
            <Card {item} />
          {/each}

        </div>
      </div>
    {:else if scoops === 2}
      <div>
        <div class="Productsstyle__ProductsRow-p6azvq-0 fteaaY">
          {#each items1 as item}
            <Card {item} />
          {/each}
        </div>
      </div>
    {:else if scoops === 3}
      <p>item3</p>
    {:else}
      <p>item4</p>
    {/if}

  </div>

</main>
