<script>
  import { cart } from "../stores/stores.js";
  import { get } from "svelte/store";
  import { createEventDispatcher } from "svelte";
  import items from "../items.js";
  import itemsmaster from "../itemsmaster.js";
  import Card2 from "./Card2.svelte";

  const dispatch = createEventDispatcher();
  let svg =
    "M298.7,418.289l-2.906-4.148a.835.835,0,0,0-.528-.251.607.607,0,0,0-.529.251l-2.905,4.148h-3.17a.609.609,0,0,0-.661.625v.191l1.651,5.84a1.336,1.336,0,0,0,1.255.945h8.588a1.261,1.261,0,0,0,1.254-.945l1.651-5.84v-.191a.609.609,0,0,0-.661-.625Zm-5.419,0,1.984-2.767,1.98,2.767Zm1.984,5.024a1.258,1.258,0,1,1,1.319-1.258,1.3,1.3,0,0,1-1.319,1.258Zm0,0";

  let cart_sum = 0;
  let articulo = "Item";
  let visible = false;
  let visiblee = false;

 const cartItems = get(cart);

  const unsubscribe = cart.subscribe(items => {
    const itemValues = Object.values(items);
    cart_sum = 0;
    itemValues.forEach(item => {
      cart_sum += item.count;
    });
  });

  function goToHome() {
    dispatch("nav", {
      option: "home"
    });
  }

  function goToCheckout() {
    dispatch("nav", {
      option: "checkout"
    });
  }
  function goToModa() {
    dispatch("nav", {
      option: "moda"
    });
  }

  const abrirvisible = () => {
    visible = true;
  };
  const cerrarvisible = () => {
    visible = false;
    checkedOut = true;
    cart.update(n => {
      return {};
    });
  };

   const abrirvisiblee = () => {
    visiblee = true;
  };
  const cerrarvisiblee = () => {
    visiblee = false;
    checkedOut = true;
    cart.update(n => {
      return {};
    });
  };


  
  
  let prefix = "";

  let name = "";
  let marca = "";
  let img = "";
  let i = 0;

  $: filtereditems = prefix
    ? itemsmaster.filter(item => {
        const name = `${item.name}, ${item.marca}, ${item.img}, `;
        return name.toLowerCase().startsWith(prefix.toLowerCase());
      })
    : itemsmaster;

</script>

<style>
  .eMDoa {
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: justify;
    justify-content: space-between;
    position: fixed;
    width: 100%;
    top: 0px;
    left: 0px;
    z-index: 1;
    padding: 15px 10px;
    transition: all 0.25s ease-in-out 0s;
  }
  .dLFRil {
    width: 26px;
    cursor: pointer;
    display: block;
    position: relative;
  }
  .dLFRil > span {
    display: block;
    background-color: rgb(13, 17, 54);
    height: 2px;
    margin-bottom: 6px;
    border-radius: 6px;
    transition: all 0.2s ease-in-out 0s;
  }
  .dLFRil > span:nth-child(1) {
    width: 26px;
  }
  .dLFRil > span:nth-child(2) {
    width: 12px;
  }

  .dLFRil > span:last-child {
    margin-bottom: 0px;
  }
  .dLFRil > span:nth-child(3) {
    width: 22px;
  }
  .dVOQHh {
    margin-left: auto;
    margin-right: auto;
  }
  .gbLpHM {
    color: rgb(13, 17, 54);
    font-size: 26px;
    font-weight: bold;
    cursor: pointer;
    margin-right: 0px;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
  }
  .dVOQHh img {
    display: block;
  }
  .cWnIGY {
    display: block;
    backface-visibility: hidden;
  }
  .dZMxZn {
    position: relative;
    cursor: pointer;
  }
  .dZMxZn .popover-handler {
    display: inline-block;
    cursor: pointer;
  }
  .duLuwV {
    width: auto;
    height: 38px;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    background-color: rgb(255, 255, 255);
    padding-top: 0px;
    padding-bottom: 0px;
    padding-left: 10px;
    padding-right: 10px;
    cursor: pointer;
    border-width: 1px;
    border-style: solid;
    border-color: rgb(241, 241, 241);
    border-image: initial;
    border-radius: 6px;
    outline: 0px;
    -webkit-appearance: media-volume-slider;
  }
  .reuOr {
    margin-right: 7px;
    box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 3px;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    border-radius: 2px;
    overflow: hidden;
  }
  .duLuwV span {
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    font-family: Lato, sans-serif;
    font-size: 15px;
    font-weight: 700;
    text-decoration: none;
    padding: 3px;
    color: rgb(0, 158, 127);
  }
  .bivHNq {
    cursor: pointer;
    color: rgb(13, 17, 54);
    padding: 5px 30px;
  }
  .bivHNq svg {
    display: block;
    width: 17px;
    height: auto;
  }
  div {
    font-family: Lato, sans-serif;
    margin: 0px;
  }
  .eMDoa {
    background-color: rgb(255, 255, 255);
    box-shadow: rgba(0, 0, 0, 0.06) 0px 1px 2px;
  }

  /*  */
  .jtVXiK {
    display: inline-flex;
    -webkit-box-align: center;
    align-items: center;
    color: rgb(0, 158, 127);
  }

  @media (max-width: 767px) {
    .jtVXiK span {
      font-size: 13px;
    }
  }
  .jtVXiK span {
    font-family: Lato, sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: rgb(0, 158, 127);
    padding-left: 10px;
  }

  /*  */
  .reuseModalParentWrapper {
    display: flex;
    overflow: hidden;
    box-sizing: border-box;
  }
  .reuseModalParentWrapper {
    position: fixed;
  }
  .reuseModalParentWrapper {
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 9999;
  }
  .fJdNUn .reuseModalHolder {
    padding: 0px;
    overflow: auto;
    border-radius: 3px 3px 0px 0px;
    border-width: 0px;
    border-style: initial;
    border-color: initial;
    border-image: initial;
  }
  .search-modal-mobile {
    transform: none !important;
    max-width: none !important;
    max-height: none !important;
    top: 0px !important;
    left: 0px !important;
    background: transparent !important;
    border-radius: 0px !important;
  }

  .innerRndComponent {
    width: 100%;
    height: 100%;
    box-sizing: content-box;
  }

  .ftxPjY {
    padding-top: 25px;
    padding-bottom: 25px;
    background-color: rgb(255, 255, 255);
    display: flex;
    width: 100%;
  }
  .gIHDwl {
    color: rgb(13, 17, 54);
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    cursor: pointer;
    border-width: 0px;
    border-style: initial;
    border-color: initial;
    border-image: initial;
    background: transparent;
    padding: 0px 15px;
  }
  .gIHDwl svg {
    display: block;
    width: 20px;
    height: auto;
  }

  .ftxPjY .header-modal-search {
    width: calc(100% - 60px);
  }

  .gYdUDg {
    width: 100%;
    opacity: 1;
    height: 100%;
    -webkit-box-flex: 1;
    flex-grow: 1;
    font-size: 15px;
    color: rgb(119, 121, 140);
    background-color: rgb(255, 255, 255);
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    transition: width 500ms ease-in-out 0s, opacity 500ms ease-in-out 0s;
    border-width: initial;
    border-style: none;
    border-color: initial;
    border-image: initial;
    border-radius: 6px 0px 0px 6px;
  }
  .fHefaw {
    font-family: Lato, sans-serif;
    font-size: 13px;
    color: rgb(0, 158, 127);
    line-height: 38px;
    font-weight: 700;
    background-color: rgb(247, 247, 247);
    margin-left: 5px;
    white-space: nowrap;
    padding: 0px 15px;
    border-radius: 6px;
  }
  .fmayvp {
    width: 100%;
  }
  .fmayvp form {
    display: flex;
    flex-direction: row;
    -webkit-box-align: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background-color: rgb(255, 255, 255);
    white-space: nowrap;
    border-radius: 6px;
    overflow: hidden;
  }
  .ftxPjY .header-modal-search input {
    color: rgb(13, 17, 54);
    padding-left: 5px;
    padding-right: 5px;
  }
  @media (max-width: 420px) {
    .ftxPjY .header-modal-search input {
      width: 150px;
    }
  }

  .juTloE {
    -webkit-box-flex: 1;
    flex-grow: 1;
    font-size: 15px;
    color: rgb(119, 121, 140);
    background-color: rgb(255, 255, 255);
    margin-right: -1px;
    height: 48px;
    border-width: 0px;
    border-style: initial;
    border-color: initial;
    border-image: initial;
    padding: 0px 20px;
  }
  .ftxPjY .header-modal-search button {
    color: rgb(13, 17, 54);
    padding-left: 15px;
    padding-right: 15px;
    background: transparent;
  }
  .jRDsIc {
    font-size: 15px;
    font-family: Lato, sans-serif;
    font-weight: 700;
    color: #000;
    height: 48px;
    padding-left: 30px;
    padding-right: 30px;
    cursor: pointer;
    flex-shrink: 0;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    border-width: 0px;
    border-style: initial;
    border-color: initial;
    border-image: initial;
    outline: 0px;
  }

  .reuseModalOverlay{
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 9999;
}

.hola{
      overflow: scroll;
    height: 700px;
    margin-top: -25px;
}
</style>

<div class="Headerstyle__MobileHeaderInnerWrapper-r27s8s-8 eMDoa unSticky home">
  <div class="Headerstyle__DrawerWrapper-r27s8s-9 gNJBsN">
    <div class="drawer__handler" style="display: inline-block;">
      <div class="Headerstyle__HamburgerIcon-r27s8s-11 dLFRil">
        <span />
        <span />
        <span />
      </div>
    </div>
  </div>
  <div class="Headerstyle__LogoWrapper-r27s8s-10 dVOQHh">
    <span on:click={goToHome} class="Logostyle__LogoBox-f7qftd-0 gbLpHM">
      <!-- <img
        src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDkuMTI0IiBoZWlnaHQ9IjE4Ij48ZyBkYXRhLW5hbWU9Ikdyb3VwIDI4MjkiPjxwYXRoIGRhdGEtbmFtZT0iUGF0aCAyNjkwIiBkPSJNMCAuNjUybDIuMDcyLjAyNkMzLjgxNC42OTkgNS41NjMuNjI3IDcuMjk2Ljc2M2E1LjIgNS4yIDAgMDE0LjggNC4xNjEgNS4yMjIgNS4yMjIgMCAwMS00LjQyMyA2LjQ4NCAyMS42NjIgMjEuNjYyIDAgMDEtMy40MjIuMTE3Yy0uMzkzIDAtLjQ4Ni4xMjQtLjQ4Mi41LjAxOSAxLjcuMDA4IDMuNDA2LjAwOCA1LjEwOXYuNTM0SDB6bTMuODMyIDcuNjY5Yy40NyAwIC45LjAxNyAxLjMxOCAwYTEwLjQ0OSAxMC40NDkgMCAwMDEuNzgxLS4xNTMgMS45NDQgMS45NDQgMCAwMDEuNTI3LTEuOTUgMS45NzQgMS45NzQgMCAwMC0xLjI5My0yLjA0IDEwLjc0OCAxMC43NDggMCAwMC0zLjMzMi0uMjI5eiIgZmlsbD0iIzBkMTEzNiIvPjxwYXRoIGRhdGEtbmFtZT0iUGF0aCAyNjkxIiBkPSJNMTA5LjEyNCA5LjM2YTQuMjY5IDQuMjY5IDAgMDAtMi4wMTMtLjAxOSAyLjUyMSAyLjUyMSAwIDAwLTEuOSAyLjQzMWMtLjA2OSAxLjc0MS0uMDQ3IDMuNDg1LS4wNjMgNS4yMjd2LjYyN2gtMy41ODFWNS44MDRoMy40NjZ2MS40MjVhMy4yNjYgMy4yNjYgMCAwMTIuMzQ5LTEuNDc3IDEwLjk0NiAxMC45NDYgMCAwMTEuNzQuMDEzeiIgZmlsbD0iIzAwOGQ3MSIvPjxwYXRoIGRhdGEtbmFtZT0iUGF0aCAyNjkyIiBkPSJNNDguODIzLjY3OGguNTE2YzIuMjM2LjAyIDQuNDc4LS4wNjQgNi43LjA4OWE0LjQxMiA0LjQxMiAwIDAxNC4yODMgMy41ODUgMy44NzYgMy44NzYgMCAwMS0yLjE4MiA0LjQyNS40LjQgMCAwMC0uMDg5LjA2IDExLjAyOCAxMS4wMjggMCAwMTEuNTE1LjkyOSA0LjMzOSA0LjMzOSAwIDAxLjc2NCA1LjQzMSA0Ljc2MSA0Ljc2MSAwIDAxLTQuMTk1IDIuNDI1Yy0yLjM5My4wODQtNC43OTEuMDI3LTcuMTg3LjAzYS41NDYuNTQ2IDAgMDEtLjEzLS4wMzh6bTMuNjYzIDEzLjloMi4xYTcuMDgzIDcuMDgzIDAgMDAuOC0uMDMzIDEuOTMyIDEuOTMyIDAgMDAxLjgxLTEuOCAxLjgxNiAxLjgxNiAwIDAwLTEuNDA2LTJjLTEuMDc4LS4xNjQtMi4xODQtLjE1NS0zLjMwNS0uMjIyem0wLTcuMWMuNzU5IDAgMS40ODguMDE5IDIuMjE2LS4wMDlhMy4xMTkgMy4xMTkgMCAwMC45My0uMTkzIDEuNjUgMS42NSAwIDAwMS4wOTItMS42ODUgMS41NjcgMS41NjcgMCAwMC0xLjIxLTEuNjM0Yy0uOTg3LS4xNi0yLS4xNTktMy4wMjgtLjIyOXoiIGZpbGw9IiMwMDhkNzEiLz48cGF0aCBkYXRhLW5hbWU9IlBhdGggMjY5MyIgZD0iTTM4LjQ1OCA5LjY4NmMuODQ4LS45MzUgMS43NjEtMS44MiAyLjUyNS0yLjgxOWEyLjU0OCAyLjU0OCAwIDAxMi41LTEuMTE0YzEuMDI1LjEgMi4wNjYuMDIxIDMuMjA4LjAyMWwtNC42MzQgNC45ODIgNC43MzQgNi45Yy0xLjMgMC0yLjUxOS0uMDMtMy43MzcuMDE0YTEuMDY5IDEuMDY5IDAgMDEtMS4wOC0uNTc3Yy0uNzY0LTEuMjE0LTEuNTgzLTIuMzkzLTIuNDE2LTMuNjM5LS40LjQzNi0uNzgxLjgzNi0xLjEzOCAxLjI1OC0uMDcxLjA4NC0uMDU4LjI1Mi0uMDU5LjM4MnYyLjUzNmgtMy41NjdWLjM1OGgzLjU1NHY5LjN6IiBmaWxsPSIjMGQxMTM2Ii8+PHBhdGggZGF0YS1uYW1lPSJQYXRoIDI2OTQiIGQ9Ik03My40OTMgMTcuNjQ0aC0zLjE5NWwtLjEyNi0xLjE3NGExMi40MyAxMi40MyAwIDAxLTEuMTg1Ljk2OGMtMS40MS45LTQuNDU5Ljg3My01Ljc1Ny0xLjIzNWEzLjQ0NSAzLjQ0NSAwIDAxMi4zMjktNS4yMjhjMS4wNjktLjI1OCAyLjE3MS0uMzg0IDMuMjU3LS41Ny4wOTItLjAxNi4xODMtLjAzMy4yNzUtLjA0N2EuODA5LjgwOSAwIDAwLjc3MS0uNTg3IDEuMDE4IDEuMDE4IDAgMDAtLjI5NS0xLjAyMyAyLjA3MyAyLjA3MyAwIDAwLTIuMDg1LS40MjggMS44MTEgMS44MTEgMCAwMC0xLjMzOCAxLjM0NWMtLjAxNi4wNS0uMDEzLjEwNi0uMDI2LjE1N2ExLjE0MiAxLjE0MiAwIDAxLS4wNjMuMTQzbC0xLjU0Ny0uM2MtLjUxNy0uMS0xLjAxMS0uMjA5LTEuNTQ2LS4zMjFhMy42OSAzLjY5IDAgMDEuODU5LTIuMDc1IDQuNzg5IDQuNzg5IDAgMDEyLjgyMy0xLjY3OCA3LjIzIDcuMjMgMCAwMTQuMTIyLjI2NCAzLjkgMy45IDAgMDEyLjYyOSAzLjc4MWMuMDU5IDEuNjQ4LjAxIDMuMy4wMjQgNC45NS4wMSAxLjAwNy4wNDggMi4wMTYuMDc0IDMuMDU4em0tMy42MS01LjE3NmMtLjQyMy4wNjMtLjgyLjEtMS4yMDcuMTg1YTE0LjY4OCAxNC42ODggMCAwMC0xLjgzNy40NjhjLS40NDkuMTYxLS41NTcuNi0uNTQ4IDEuMDU5YTEuMTMxIDEuMTMxIDAgMDAuNTg1IDEuMDIxIDIuMjM1IDIuMjM1IDAgMDAyLjY1OC0uNzE5IDMuMTc4IDMuMTc4IDAgMDAuMzQ5LTIuMDEzeiIgZmlsbD0iIzAwOGQ3MSIvPjxwYXRoIGRhdGEtbmFtZT0iUGF0aCAyNjk1IiBkPSJNOTguNTA5IDE3LjYzOWgtMy4ybC0uMTI1LTEuMjI4YS44NjIuODYyIDAgMDAtLjE1NC4xMjljLTEuMzQ1IDEuOTM0LTQuOTE4IDEuODY5LTYuNDE3LjE1OGEzLjQyMyAzLjQyMyAwIDAxMS40NTctNS41NTQgMjkuNzI0IDI5LjcyNCAwIDAxMy4yMzYtLjY1NmMuMjc0LS4wNTMuNTUzLS4wODEuODI2LS4xMzhhLjg4OC44ODggMCAwMC40OS0xLjU2MyAyLjAyNiAyLjAyNiAwIDAwLTIuMDMxLS40ODYgMS44IDEuOCAwIDAwLTEuNDExIDEuMzE2Yy0uMDM0LjEtLjA1LjItLjA4Ni4zNTlsLTMuMTIzLS42MjlhMy45MzEgMy45MzEgMCAwMTEuOTU0LTMuMDM1IDYuNTI3IDYuNTI3IDAgMDE2LjM0My0uMjI0QTMuNjc1IDMuNjc1IDAgMDE5OC40IDkuNDk3Yy4wNjQgMS41ODEuMDIxIDMuMTY3LjAzNyA0Ljc1MS4wMTYgMS4xMTIuMDQ4IDIuMjMuMDcyIDMuMzkxem0tMy41NDUtNS4xODJjLS44LjEyNS0xLjUuMjEzLTIuMTg3LjM0OWEzLjU2MSAzLjU2MSAwIDAwLS45NjYuMzQgMS4wNDcgMS4wNDcgMCAwMC0uNSAxLjA5MiAxLjExNCAxLjExNCAwIDAwLjYzNS45OSAyLjEgMi4xIDAgMDAyLjg1My0xLjMgMTAuNzgyIDEwLjc4MiAwIDAwLjE2NS0xLjQ2OHoiIGZpbGw9IiMwMDhkNzEiLz48cGF0aCBkYXRhLW5hbWU9IlBhdGggMjY5NiIgZD0iTTMyLjM2NyA5LjU0NGwtMy4wNTguOTE4YTcuMDIzIDcuMDIzIDAgMDAtMS4wMDctMS4yMjcgMi42NTMgMi42NTMgMCAwMC00LjE0NyAxLjU3OCA0LjY0OSA0LjY0OSAwIDAwLS4wMDYgMS43NzMgMi41NjEgMi41NjEgMCAwMDIuMjIyIDIuMDUyIDIuNSAyLjUgMCAwMDIuODMtMS40NDRjLjA1My0uMS4yNDMtLjIyNi4zMy0uMi45NjkuMjc2IDEuOTMxLjU3OSAyLjk1Ni44OTRhNy43NzMgNy43NzMgMCAwMS0uMjguNzkyQTUuNTc2IDUuNTc2IDAgMDEyNi45NTQgMThhNi4yODcgNi4yODcgMCAxMS0uMTYzLTEyLjU2OSA1Ljc1MyA1Ljc1MyAwIDAxNC42MzggMi4wODUgNC42MjUgNC42MjUgMCAwMS45MzggMi4wMjh6IiBmaWxsPSIjMGQxMTM2Ii8+PHBhdGggZGF0YS1uYW1lPSJQYXRoIDI2OTciIGQ9Ik03NS45NDcgNS43OTJoOS42NzRjLjAwNi4xMjYuMDE4LjI1Mi4wMTguMzc5IDAgLjYzOS0uMDM4IDEuMjgxLjAxMyAxLjkxNmExLjQyNCAxLjQyNCAwIDAxLS40ODMgMS4xODVjLTEuNTcyIDEuNjI3LTMuMTIzIDMuMjc0LTQuNjgxIDQuOTE0LS4wODguMDkzLS4xNjkuMTkyLS4zMDcuMzUxSDg1Ljd2My4xaC05LjljLS4wMS0uMTUtLjAyNi0uMjkxLS4wMjYtLjQzMiAwLS43MzIuMDIyLTEuNDY1LS4wMS0yLjJhMS4yNDEgMS4yNDEgMCAwMS40LS45ODNjMS41MjYtMS42IDMuMDM2LTMuMjA5IDQuNTUxLTQuODE3LjA4LS4wODUuMTU1LS4xNzUuMjc5LS4zMTdoLTUuMDUzeiIgZmlsbD0iIzAwOGQ3MSIvPjxwYXRoIGRhdGEtbmFtZT0iUGF0aCAyNjk4IiBkPSJNMTQuNDg1IDE3LjYyNlY1LjgwNWgzLjU2N3YxMS44MjF6IiBmaWxsPSIjMGQxMTM2Ii8+PHBhdGggZGF0YS1uYW1lPSJQYXRoIDI2OTkiIGQ9Ik0xOC4zODYgMi4xMzhhMi4xIDIuMSAwIDAxLTIuMTQ4IDIuMSAyLjEzOSAyLjEzOSAwIDAxLTIuMDc4LTIuMTRBMi4xNDEgMi4xNDEgMCAwMTE2LjI4Ni4wMDVhMi4wODIgMi4wODIgMCAwMTIuMSAyLjEzM3oiIGZpbGw9IiMwMDhkNzEiLz48L2c+PC9zdmc+"
        alt="Logo A & C"
        class="Logostyle__LogoImage-f7qftd-1 cWnIGY" />
    </span> -->
      <svg
        width="40"
        height="40"
        viewBox="0 0 176 176"
        fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M164.497 89.2272C165.168 88.5521 165.168 87.4504 164.497
          86.7753L156.379 78.5889C155.708 77.9138 155.513 76.6685 155.94
          75.8209L161.133 65.5275C161.562 64.6778 161.219 63.6282 160.375
          63.1953L150.124 57.9191C149.279 57.484 148.706 56.3598 148.851
          55.4221L150.611 44.027C150.756 43.0872 150.106 42.1953 149.169
          42.0426L137.788 40.1932C136.85 40.0412 135.959 39.1486 135.807
          38.213L133.957 26.832C133.807 25.895 132.914 25.2481 131.975
          25.3917L120.581 27.1495C119.641 27.2931 118.518 26.7208 118.083
          25.8767L112.809 15.6256C112.374 14.7808 111.324 14.4387 110.475
          14.8667L100.181 20.0598C99.3315 20.4872 98.0883 20.29 97.4132
          19.6213L89.2275 11.501C88.5517 10.833 87.45 10.833 86.7749
          11.501L78.5885 19.6213C77.9134 20.29 76.6688 20.4886 75.8206
          20.0598L65.5279 14.8667C64.6782 14.4387 63.6279 14.7808 63.1943
          15.6256L57.9188 25.8767C57.4837 26.7208 56.3595 27.2931 55.4211
          27.1495L44.0275 25.3917C43.0877 25.2467 42.1944 25.895 42.0423
          26.832L40.193 38.213C40.0416 39.1486 39.1483 40.0412 38.212
          40.1932L26.8318 42.0426C25.8955 42.1953 25.2479 43.0893 25.3915
          44.027L27.1493 55.4221C27.2922 56.3612 26.7213 57.4854 25.8765
          57.9191L15.6254 63.1953C14.7806 63.6303 14.4385 64.6799 14.8672
          65.5275L20.0604 75.8209C20.4863 76.6685 20.2898 77.9138 19.6218
          78.5889L11.5016 86.7753C10.8328 87.4504 10.8328 88.5521 11.5016
          89.2272L19.6218 97.4129C20.2898 98.088 20.4884 99.334 20.0604
          100.182L14.8672 110.476C14.4385 111.326 14.7806 112.374 15.6254
          112.809L25.8765 118.084C26.7213 118.519 27.2922 119.641 27.1493
          120.58L25.3915 131.975C25.2465 132.915 25.8955 133.806 26.8318
          133.958L38.212 135.807C39.1483 135.958 40.0416 136.85 40.193
          137.789L42.0423 149.169C42.1944 150.107 43.0898 150.757 44.0275
          150.611L55.4211 148.852C56.3609 148.707 57.4851 149.28 57.9188
          150.124L63.1943 160.375C63.6293 161.22 64.6803 161.562 65.5279
          161.134L75.8206 155.941C76.6688 155.514 77.9134 155.71 78.5885
          156.379L86.7749 164.498C87.45 165.167 88.5517 165.167 89.2275
          164.498L97.4132 156.379C98.0883 155.71 99.3329 155.514 100.181
          155.941L110.476 161.134C111.325 161.564 112.374 161.22 112.807
          160.375L118.083 150.124C118.518 149.28 119.641 148.707 120.581
          148.852L131.975 150.611C132.914 150.757 133.805 150.107 133.957
          149.169L135.807 137.789C135.957 136.85 136.85 135.959 137.788
          135.807L149.169 133.958C150.106 133.807 150.756 132.915 150.611
          131.975L148.851 120.58C148.706 119.641 149.279 118.519 150.124
          118.084L160.375 112.809C161.219 112.374 161.56 111.324 161.133
          110.476L155.94 100.182C155.513 99.3319 155.708 98.088 156.379
          97.4129L164.497 89.2272Z"
          fill="rgb(0, 158, 127)" />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M80.9468 113.992L71.1801 104.225L57.4443 90.4859L66.8366
          81.0894L80.5773 94.8209C80.7814 95.025 81.1116 95.025 81.3164
          94.8209L109.157 66.9875L118.557 76.377L80.9468 113.992Z"
          fill="#fff" />
      </svg>
    </span>
  </div>
  <div class="LanguageSwitcherstyle__Box-sc-2keas9-0 klmBvw">
    <div
      class="Popoverstyle__PopoverWrapper-ebbms3-0 dZMxZn popover-wrapper right">
      <div class="popover-handler">
        <button
          on:click={goToCheckout}
          class="LanguageSwitcherstyle__SelectedItem-sc-2keas9-1 duLuwV">
          <div class="LanguageSwitcherstyle__Flag-sc-2keas9-2 reuOr" />

          <div class="CartItemCardstyle__PopupItemCount-xuzuaf-2 jtVXiK">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="19px"
              height="24px"
              viewBox="0 0 23.786 30">
              <g data-name="shopping-bag (3)" transform="translate(-53.023)">
                <g data-name="Group 2704">
                  <g data-name="Group 17" transform="translate(53.023 5.918)">
                    <g data-name="Group 16">
                      <path
                        data-name="Path 3"
                        d="M76.8,119.826l-1.34-16.881A2.109,2.109,0,0,0,73.362,101H70.716v3.921a.879.879,0,1,1-1.757,0V101H60.875v3.921a.879.879,0,1,1-1.757,0V101H56.472a2.109,2.109,0,0,0-2.094,1.937l-1.34,16.886a4.885,4.885,0,0,0,4.87,5.259H71.926a4.884,4.884,0,0,0,4.87-5.261Zm-7.92-8.6-4.544,4.544a.878.878,0,0,1-1.243,0l-2.13-2.13A.878.878,0,0,1,62.2,112.4l1.509,1.508,3.923-3.923a.879.879,0,1,1,1.242,1.243Z"
                        transform="translate(-53.023 -101.005)"
                        fill="currentColor" />
                    </g>
                  </g>
                  <g data-name="Group 19" transform="translate(59.118)">
                    <g data-name="Group 18">
                      <path
                        data-name="Path 4"
                        d="M162.838,0a5.806,5.806,0,0,0-5.8,5.8v.119H158.8V5.8a4.042,4.042,0,1,1,8.083,0v.119h1.757V5.8A5.806,5.806,0,0,0,162.838,0Z"
                        transform="translate(-157.039)"
                        fill="currentColor" />
                    </g>
                  </g>
                </g>
              </g>
            </svg>

            <span>
              {#if cart_sum > 0}
                <div class="circle">{cart_sum}</div>
              {/if}
              Item
            </span>
          </div>

        </button>

      </div>
    </div>
  </div>
  <div on:click={abrirvisible} class="Headerstyle__SearchWrapper-r27s8s-0 bivHNq searchIconWrapper">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14px"
      height="14px"
      viewBox="0 0 14 14">
      <path
        d="M14.771,12.752,11.32,9.286a5.519,5.519,0,0,0,1.374-3.634A5.763,5.763,0,0,0,6.839,0,5.763,5.763,0,0,0,.984,5.652,5.763,5.763,0,0,0,6.839,11.3a5.936,5.936,0,0,0,3.354-1.023l3.477,3.492a.783.783,0,0,0,1.08.02A.72.72,0,0,0,14.771,12.752ZM6.839,1.475a4.259,4.259,0,0,1,4.327,4.178A4.259,4.259,0,0,1,6.839,9.83,4.259,4.259,0,0,1,2.511,5.652,4.259,4.259,0,0,1,6.839,1.475Z"
        transform="translate(-0.984)"
        fill="currentColor" />
    </svg>

  </div>
  <!-- <svg width="176" height="176" viewBox="0 0 176 176" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M164.497 89.2272C165.168 88.5521 165.168 87.4504 164.497 86.7753L156.379 78.5889C155.708 77.9138 155.513 76.6685 155.94 75.8209L161.133 65.5275C161.562 64.6778 161.219 63.6282 160.375 63.1953L150.124 57.9191C149.279 57.484 148.706 56.3598 148.851 55.4221L150.611 44.027C150.756 43.0872 150.106 42.1953 149.169 42.0426L137.788 40.1932C136.85 40.0412 135.959 39.1486 135.807 38.213L133.957 26.832C133.807 25.895 132.914 25.2481 131.975 25.3917L120.581 27.1495C119.641 27.2931 118.518 26.7208 118.083 25.8767L112.809 15.6256C112.374 14.7808 111.324 14.4387 110.475 14.8667L100.181 20.0598C99.3315 20.4872 98.0883 20.29 97.4132 19.6213L89.2275 11.501C88.5517 10.833 87.45 10.833 86.7749 11.501L78.5885 19.6213C77.9134 20.29 76.6688 20.4886 75.8206 20.0598L65.5279 14.8667C64.6782 14.4387 63.6279 14.7808 63.1943 15.6256L57.9188 25.8767C57.4837 26.7208 56.3595 27.2931 55.4211 27.1495L44.0275 25.3917C43.0877 25.2467 42.1944 25.895 42.0423 26.832L40.193 38.213C40.0416 39.1486 39.1483 40.0412 38.212 40.1932L26.8318 42.0426C25.8955 42.1953 25.2479 43.0893 25.3915 44.027L27.1493 55.4221C27.2922 56.3612 26.7213 57.4854 25.8765 57.9191L15.6254 63.1953C14.7806 63.6303 14.4385 64.6799 14.8672 65.5275L20.0604 75.8209C20.4863 76.6685 20.2898 77.9138 19.6218 78.5889L11.5016 86.7753C10.8328 87.4504 10.8328 88.5521 11.5016 89.2272L19.6218 97.4129C20.2898 98.088 20.4884 99.334 20.0604 100.182L14.8672 110.476C14.4385 111.326 14.7806 112.374 15.6254 112.809L25.8765 118.084C26.7213 118.519 27.2922 119.641 27.1493 120.58L25.3915 131.975C25.2465 132.915 25.8955 133.806 26.8318 133.958L38.212 135.807C39.1483 135.958 40.0416 136.85 40.193 137.789L42.0423 149.169C42.1944 150.107 43.0898 150.757 44.0275 150.611L55.4211 148.852C56.3609 148.707 57.4851 149.28 57.9188 150.124L63.1943 160.375C63.6293 161.22 64.6803 161.562 65.5279 161.134L75.8206 155.941C76.6688 155.514 77.9134 155.71 78.5885 156.379L86.7749 164.498C87.45 165.167 88.5517 165.167 89.2275 164.498L97.4132 156.379C98.0883 155.71 99.3329 155.514 100.181 155.941L110.476 161.134C111.325 161.564 112.374 161.22 112.807 160.375L118.083 150.124C118.518 149.28 119.641 148.707 120.581 148.852L131.975 150.611C132.914 150.757 133.805 150.107 133.957 149.169L135.807 137.789C135.957 136.85 136.85 135.959 137.788 135.807L149.169 133.958C150.106 133.807 150.756 132.915 150.611 131.975L148.851 120.58C148.706 119.641 149.279 118.519 150.124 118.084L160.375 112.809C161.219 112.374 161.56 111.324 161.133 110.476L155.94 100.182C155.513 99.3319 155.708 98.088 156.379 97.4129L164.497 89.2272Z" fill="#FF4A00"></path>
<path fill-rule="evenodd" clip-rule="evenodd" d="M80.9468 113.992L71.1801 104.225L57.4443 90.4859L66.8366 81.0894L80.5773 94.8209C80.7814 95.025 81.1116 95.025 81.3164 94.8209L109.157 66.9875L118.557 76.377L80.9468 113.992Z" fill="black"></path>
</svg> -->
</div>

{#if visible}
<!-- <div class="reuseModalOverlay "></div> -->
<div class="reuseModalParentWrapper">
  <div
    class="reuseModalHolder search-modal-mobile"
    style="width: 100%; height: 100%; position: absolute; left: 0px; top: 0px;
    opacity: 1; transform: scale3d(1, 1, 1);">
    <div class="innerRndComponent">
      <div class="Headerstyle__SearchModalWrapper-r27s8s-22 ftxPjY">
        <button on:click={cerrarvisible}
          type="submit"
          class="Headerstyle__SearchModalClose-r27s8s-23 gIHDwl">
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
        </button>
        <div
          class="SearchBoxstyle__SearchWrapper-li71fg-0 bYCPyw
          header-modal-search">
          <div class="SearchBoxstyle__SearchBoxWrapper-li71fg-8 gYdUDg ">
            <span class="SearchBoxstyle__CurrentType-li71fg-1 fHefaw">
              Constructor
            </span>
            <div
              class="SearchBoxstyle__SearchInputWrapper-li71fg-6 fmayvp
              undefined "
              style="height: 35px;">
              <form>
                <input 
                  type="text"
                  placeholder="Busque sus productos aquí"
                  class="SearchBoxstyle__SearchBox-li71fg-5 juTloE"
                  bind:value={prefix}/>
                <!-- <label on:click={abrirvisiblee}  class="SearchBoxstyle__SearchButton-li71fg-7 jRDsIc">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14px"
                    height="14px"
                    viewBox="0 0 14 14">
                    <path
                      d="M14.771,12.752,11.32,9.286a5.519,5.519,0,0,0,1.374-3.634A5.763,5.763,0,0,0,6.839,0,5.763,5.763,0,0,0,.984,5.652,5.763,5.763,0,0,0,6.839,11.3a5.936,5.936,0,0,0,3.354-1.023l3.477,3.492a.783.783,0,0,0,1.08.02A.72.72,0,0,0,14.771,12.752ZM6.839,1.475a4.259,4.259,0,0,1,4.327,4.178A4.259,4.259,0,0,1,6.839,9.83,4.259,4.259,0,0,1,2.511,5.652,4.259,4.259,0,0,1,6.839,1.475Z"
                      transform="translate(-0.984)"
                      fill="currentColor" />
                </svg>
          
                </label> -->
              </form>
            </div>
          </div>
        </div>
      </div>
      <div class="hola">

{#each filtereditems as item}
  <Card2 {item} />
{/each}


</div>
    </div>


  </div> 
</div>

{/if}


