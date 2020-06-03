<script>
  import CheckoutItem from "./CheckoutItem.svelte";
  import { cart } from "../stores/stores.js";
  import { get } from "svelte/store";
  import { fly } from "svelte/transition";

  let checkedOut = false;
  let sumatotal = 0;
  let cartItems = [];
  const unsubscribe = cart.subscribe(items => {
    cartItems = Object.values(items);
  });

  const checkout = () => {
    checkedOut = true;
    cart.update(n => {
      return {};
    });
  };

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
  let visible = false;
</script>


<style>
  .checkout-container {
    width: 70vw;
    margin: 7vh auto 0 auto;
    display: flex;
    flex-direction: column;
  }
  .empty-message {
    margin: 10px 0;
  }
  button {
    align-self: flex-start;
    padding: 5px 20px;
    margin: 20px 0;
    background: #20447d;
    color: white;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }
  @media screen and (max-width: 1600px) {
    .checkout-container {
      width: 80vw;
    }
  }
  @media screen and (max-width: 1400px) {
    .checkout-container {
      width: 100%;
    }
  }
  @media screen and (max-width: 454px) {
    button {
      align-self: stretch;
    }
  }

  /*  */
  .eVxmaB {
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: auto;
  }
  .bCKENA {
    display: flex;
    -webkit-box-pack: center;
    justify-content: center;
    margin: 20px 0px;
  }
  .bCKENA > button {
    box-shadow: none;
    background-color: transparent;
    display: inline-flex;
    cursor: pointer;
    font-family: Lato, sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: rgb(0, 158, 127);
    border-width: 0px;
    border-style: initial;
    border-color: initial;
    border-image: initial;
    outline: 0px;
    transition: color 0.35s ease 0s;
  }
  @media (max-width: 767px) {
    .iHtosU {
      height: 45px;
    }
  }
  .iHtosU {
    height: 48px;
    width: calc(100% - 30px);
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: justify;
    justify-content: space-between;
    background-color: rgb(0, 158, 127);
    box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px;
    cursor: pointer;
    margin-bottom: 15px;
    margin-left: 15px;
    padding: 0px;
    border-radius: 48px;
    border-width: 0px;
    border-style: initial;
    border-color: initial;
    border-image: initial;
    outline: 0px;
  }
  .iHtosU > a {
    width: 100%;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: justify;
    justify-content: space-between;
    padding-left: 30px;
  }
  .eKpZme {
    font-family: Lato, sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: rgb(255, 255, 255);
    padding-left: 5px;
    padding-right: 10px;
  }
  @media (max-width: 767px) {
    .KJSiM {
      height: 41px;
    }
  }
  .KJSiM {
    width: auto;
    height: 44px;
    display: inline-flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    background-color: rgb(255, 255, 255);
    font-family: Lato, sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: rgb(0, 158, 127);
    margin-right: 2px;
    padding: 0px 30px;
    overflow: hidden;
    border-radius: 28px;
  }

  /*  */
  .reuseModalHolder,
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
    background: rgba(0, 0, 0, 0.3);
  }
  .reuseModalHolder {
    padding: 0px;
    overflow: auto;
    border-radius: 3px 3px 0px 0px;
    border-width: 0px;
    border-style: initial;
    border-color: initial;
    border-image: initial;
  }
  .add-address-modal {
    width: 100%;
    height: auto;
    background-color: rgb(247, 248, 249);
    box-sizing: border-box;
    padding: 30px;
    border-width: 0px;
    border-style: initial;
    border-color: initial;
    border-image: initial;
  }

  .hDejwL {
    font-family: Poppins, sans-serif;
    font-size: 19px;
    font-weight: 700;
    color: rgb(13, 17, 54);
    margin-bottom: 15px;
  }
  .deGZNA {
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-bottom: 15px;
  }
  .jFvJIE:hover,
  .jFvJIE:focus {
    outline: 0px;
  }
  .jFvJIE {
    width: 100%;
    height: 54px;
    font-family: Lato, sans-serif;
    color: rgb(13, 17, 54);
    font-size: 16px;
    line-height: 19px;
    font-weight: 400;
    box-sizing: border-box;
    border-radius: 6px;
    border-width: 1px;
    border-style: solid;
    border-color: rgb(241, 241, 241);
    border-image: initial;
    padding: 0px 18px;
    transition: border-color 0.25s ease 0s;
  }
  .hYIhzj {
    color: red;
    padding-bottom: 10px;
    margin-top: -5px;
  }
  .dYRvKF {
    cursor: pointer;
    display: inline-flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    background-color: rgb(0, 158, 127);
    width: 100%;
    color: rgb(255, 255, 255);
    font-family: Lato, sans-serif;
    font-weight: 700;
    padding-top: 0px;
    padding-bottom: 0px;
    box-sizing: border-box;
    height: 44px;
    padding-left: 20px;
    padding-right: 20px;
    font-size: 14px;
    border-radius: 6px;
    text-decoration: none;
    border-width: 0px;
    border-style: initial;
    border-color: initial;
    border-image: initial;
    transition: all 0.3s ease 0s;
  }
  .dYRvKF span.btn-text {
    padding-left: 4px;
    padding-right: 4px;
    white-space: nowrap;
  }

  /*  */

  .iuZybX {
    width: 100%;
    display: flex;
    flex-direction: column;
  }
  .ihJQyq {
    font-family: Lato, sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: rgb(13, 17, 54);
    text-align: center;
    margin-bottom: 40px;
  }
  .bJvjJg {
    display: flex;
    flex-direction: column;
    padding-left: 15px;
  }
  .cSMtnt {
    display: flex;
    width: 100%;
    align-items: flex-start;
    -webkit-box-pack: start;
    justify-content: flex-start;
    margin-bottom: 25px;
  }
  .dwZrDQ {
    font-family: Lato, sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: rgb(13, 17, 54);
  }
  .bYcxrK {
    font-family: Lato, sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: rgb(119, 121, 140);
    margin: 0px 12px;
  }
  .jsCFpB {
    font-family: Lato, sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: rgb(119, 121, 140);
    margin-right: 15px;
  }
  .gCXrSa {
    font-family: Lato, sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: rgb(119, 121, 140);
    margin-left: auto;
  }
  .cSMtnt:last-child {
    margin-bottom: 0px;
  }
  .cSMtnt {
    display: flex;
    width: 100%;
    align-items: flex-start;
    -webkit-box-pack: start;
    justify-content: flex-start;
    margin-bottom: 25px;
  }
  .dwZrDQ {
    font-family: Lato, sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: rgb(13, 17, 54);
  }
  .bYcxrK {
    font-family: Lato, sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: rgb(119, 121, 140);
    margin: 0px 12px;
  }
  .dPNmUJ {
    margin-top: 20px;
    border-top: 1px solid rgb(230, 230, 230);
    padding: 20px 15px 0px;
  }
  .bMlMJp {
    display: flex;
    width: 100%;
    -webkit-box-pack: justify;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .jIRiMb {
    font-family: Lato, sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: rgb(119, 121, 140);
  }

  /*  */

  .iDOcsn {
    background-color: rgb(247, 247, 247);
    position: relative;
    min-height: 100vh;
        top: 20px;
  }

  @media (max-width: 767px) {
    .jVIgkG {
      padding: 50px 25px;
    }
  }
  .jVIgkG {
    background-color: rgb(255, 255, 255);
    position: relative;
    margin-left: auto;
    margin-right: auto;
    border-width: 1px;
    border-style: solid;
    border-color: rgb(241, 241, 241);
    border-image: initial;
    padding: 60px;
    border-radius: 6px;
    overflow: hidden;
  }
  @media (max-width: 767px) {
    .jVIgkG .home-btn {
      font-size: 13px;
      height: 34px;
      padding: 5px 12px;
    }
  }
  .jVIgkG .home-btn {
    display: inline-flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    font-family: Lato, sans-serif;
    font-size: 15px;
    font-weight: 400;
    color: rgb(119, 121, 140);
    height: 36px;
    position: absolute;
    top: 15px;
    right: 15px;
    padding: 5px 15px;
    border-width: 1px;
    border-style: solid;
    border-color: rgb(230, 230, 230);
    border-image: initial;
    border-radius: 6px;
    transition: all 0.15s ease-in-out 0s;
    text-decoration: none;
  }
  @media (max-width: 767px) {
    .hHIjuJ {
      margin-bottom: 30px;
    }
  }
  @media (max-width: 767px) {
    .foYIyC {
      font-size: 16px;
      margin-bottom: 25px;
    }
  }
  .foYIyC {
    font-family: Poppins, sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: rgb(13, 17, 54);
    line-height: 1;
    margin-bottom: 32px;
  }
  .kJwZtp {
    font-family: Lato, sans-serif;
    font-size: 15px;
    color: rgb(13, 17, 54);
    font-weight: 400;
    line-height: 1.2;
    display: block;
    margin: 0px;
  }
  @media (max-width: 767px) {
    .iYeVqc {
      flex-wrap: wrap;
    }
  }

  .iYeVqc {
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: justify;
    justify-content: space-between;
    margin-top: 30px;
  }
  .Fmmyl:first-child {
    padding-left: 0px;
    border-left: 0px;
  }
  @media (max-width: 767px) {
    .Fmmyl {
      max-width: 100%;
      margin-bottom: 20px;
      flex: 0 0 100%;
      padding: 0px;
      border-width: 0px;
      border-style: initial;
      border-color: initial;
      border-image: initial;
    }
  }
  .Fmmyl .title {
    margin-bottom: 10px;
  }
  .loLWBC {
    font-family: Lato, sans-serif;
    font-size: 15px;
    color: rgb(13, 17, 54);
    font-weight: 700;
    line-height: 1.2;
    display: block;
    margin: 0px;
  }
  .kJwZtp:last-child {
    color: rgb(66, 69, 97);
  }
  .kJwZtp {
    font-family: Lato, sans-serif;
    font-size: 15px;
    color: rgb(13, 17, 54);
    font-weight: 400;
    line-height: 1.2;
    display: block;
    margin: 0px;
  }
  @media (max-width: 767px) {
    .Fmmyl {
      max-width: 100%;
      margin-bottom: 20px;
      flex: 0 0 100%;
      padding: 0px;
      border-width: 0px;
      border-style: initial;
      border-color: initial;
      border-image: initial;
    }
  }
  .Fmmyl .title {
    margin-bottom: 10px;
  }
  .kJwZtp:last-child {
    color: rgb(66, 69, 97);
  }
  .kJwZtp {
    font-family: Lato, sans-serif;
    font-size: 15px;
    color: rgb(13, 17, 54);
    font-weight: 400;
    line-height: 1.2;
    display: block;
    margin: 0px;
  }
  @media (max-width: 767px) {
    .Fmmyl {
      max-width: 100%;
      margin-bottom: 20px;
      flex: 0 0 100%;
      padding: 0px;
      border-width: 0px;
      border-style: initial;
      border-color: initial;
      border-image: initial;
    }
  }

  
.c-mini-cart__illustration {
    margin: 80px auto 0;
    width: 100%;
    max-width: 162.5px;
}
.c-mini-cart__illustration>svg {
    display: block;
    width: 100%;
    height: auto;
}

.dznoMc {
    font-family: Lato, sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: rgb(119, 121, 140);
    display: block;
    width: 100%;
    text-align: center;
    padding: 40px 0px;
}
</style>

<div class="checkout-container">
  {#if cartItems.length === 0}
    {#if checkedOut}
      <div class="OrderReceivedstyle__OrderRecivedWrapper-sc-1c48wfp-0 iDOcsn">
        <div
          class="OrderReceivedstyle__OrderRecivedContainer-sc-1c48wfp-1 jVIgkG">
          <a class="home-btn" href="/">
            <span style="vertical-align: inherit;">
              <span style="vertical-align: inherit;">De vuelta a casa</span>
            </span>
          </a>
          <div class="OrderReceivedstyle__OrderInfo-sc-1c48wfp-2 hHIjuJ">
            <h2 class="OrderReceivedstyle__BlockTitle-sc-1c48wfp-5 foYIyC">
              <span style="vertical-align: inherit;">
                <span style="vertical-align: inherit;">orden recibida</span>
              </span>
            </h2>
            <p class="OrderReceivedstyle__Text-sc-1c48wfp-6 kJwZtp">
              <span style="vertical-align: inherit;">
                <span style="vertical-align: inherit;">Gracias.</span>
                <span style="vertical-align: inherit;">
                  Tu orden ha sido recibida
                </span>
              </span>
            </p>
            <div
              class="OrderReceivedstyle__InfoBlockWrapper-sc-1c48wfp-7 iYeVqc">
              <div class="OrderReceivedstyle__InfoBlock-sc-1c48wfp-8 Fmmyl">
                <p class="OrderReceivedstyle__Text-sc-1c48wfp-6 loLWBC title">
                  <span style="vertical-align: inherit;">
                    <span style="vertical-align: inherit;">
                      Número de orden
                    </span>
                  </span>
                </p>
                <p class="OrderReceivedstyle__Text-sc-1c48wfp-6 kJwZtp">
                  <span style="vertical-align: inherit;">
                    <span style="vertical-align: inherit;">1444</span>
                  </span>
                </p>
              </div>
              <div class="OrderReceivedstyle__InfoBlock-sc-1c48wfp-8 Fmmyl">
                <p class="OrderReceivedstyle__Text-sc-1c48wfp-6 loLWBC title">
                  <span style="vertical-align: inherit;">
                    <span style="vertical-align: inherit;">Fecha</span>
                  </span>
                </p>
                <p class="OrderReceivedstyle__Text-sc-1c48wfp-6 kJwZtp">
                  <span style="vertical-align: inherit;">
                    <span style="vertical-align: inherit;">
                      14 de marzo de 2019
                    </span>
                  </span>
                </p>
              </div>
              <div class="OrderReceivedstyle__InfoBlock-sc-1c48wfp-8 Fmmyl">
                <p class="OrderReceivedstyle__Text-sc-1c48wfp-6 loLWBC title">
                  <span style="vertical-align: inherit;">
                    <span style="vertical-align: inherit;">Total</span>
                  </span>
                </p>
                <p class="OrderReceivedstyle__Text-sc-1c48wfp-6 kJwZtp">
                  <span style="vertical-align: inherit;">
                    <span style="vertical-align: inherit;">$ 10,944.00</span>
                  </span>
                </p>
              </div>
              <div class="OrderReceivedstyle__InfoBlock-sc-1c48wfp-8 Fmmyl">
                <p class="OrderReceivedstyle__Text-sc-1c48wfp-6 loLWBC title">
                  <span style="vertical-align: inherit;">
                    <span style="vertical-align: inherit;">Método de pago</span>
                  </span>
                </p>
                <p class="OrderReceivedstyle__Text-sc-1c48wfp-6 kJwZtp">
                  <span style="vertical-align: inherit;">
                    <span style="vertical-align: inherit;">
                      Contra reembolso
                    </span>
                  </span>
                </p>
              </div>
            </div>
          </div>
          <!-- <div class="OrderReceivedstyle__OrderDetails-sc-1c48wfp-3 LAMYM">
            <h2 class="OrderReceivedstyle__BlockTitle-sc-1c48wfp-5 foYIyC">
              <span style="vertical-align: inherit;">
                <span style="vertical-align: inherit;">
                  Detalles del pedido
                </span>
              </span>
            </h2>
            <div class="OrderReceivedstyle__ListItem-sc-1c48wfp-9 cbQBZt">
              <div class="OrderReceivedstyle__ListTitle-sc-1c48wfp-10 dvtNhw">
                <p class="OrderReceivedstyle__Text-sc-1c48wfp-6 loLWBC">
                  <span style="vertical-align: inherit;">
                    <span style="vertical-align: inherit;">Artículo total</span>
                  </span>
                </p>
              </div>
              <div class="OrderReceivedstyle__ListDes-sc-1c48wfp-11 dmrHfn">
                <p class="OrderReceivedstyle__Text-sc-1c48wfp-6 kJwZtp">
                  <span style="vertical-align: inherit;">
                    <span style="vertical-align: inherit;">6 artículos</span>
                  </span>
                </p>
              </div>
            </div>
            <div class="OrderReceivedstyle__ListItem-sc-1c48wfp-9 cbQBZt">
              <div class="OrderReceivedstyle__ListTitle-sc-1c48wfp-10 dvtNhw">
                <p class="OrderReceivedstyle__Text-sc-1c48wfp-6 loLWBC">
                  <span style="vertical-align: inherit;">
                    <span style="vertical-align: inherit;">
                      Tiempo de la orden
                    </span>
                  </span>
                </p>
              </div>
              <div class="OrderReceivedstyle__ListDes-sc-1c48wfp-11 dmrHfn">
                <p class="OrderReceivedstyle__Text-sc-1c48wfp-6 kJwZtp">
                  <span style="vertical-align: inherit;">
                    <span style="vertical-align: inherit;">13:00 19/12/19</span>
                  </span>
                </p>
              </div>
            </div>
            <div class="OrderReceivedstyle__ListItem-sc-1c48wfp-9 cbQBZt">
              <div class="OrderReceivedstyle__ListTitle-sc-1c48wfp-10 dvtNhw">
                <p class="OrderReceivedstyle__Text-sc-1c48wfp-6 loLWBC">
                  <span style="vertical-align: inherit;">
                    <span style="vertical-align: inherit;">
                      El tiempo de entrega
                    </span>
                  </span>
                </p>
              </div>
              <div class="OrderReceivedstyle__ListDes-sc-1c48wfp-11 dmrHfn">
                <p class="OrderReceivedstyle__Text-sc-1c48wfp-6 kJwZtp">
                  <span style="vertical-align: inherit;">
                    <span style="vertical-align: inherit;">
                      Entrega exprés de 90 minutos
                    </span>
                  </span>
                </p>
              </div>
            </div>
            <div class="OrderReceivedstyle__ListItem-sc-1c48wfp-9 cbQBZt">
              <div class="OrderReceivedstyle__ListTitle-sc-1c48wfp-10 dvtNhw">
                <p class="OrderReceivedstyle__Text-sc-1c48wfp-6 loLWBC">
                  <span style="vertical-align: inherit;">
                    <span style="vertical-align: inherit;">
                      Lugar de entrega
                    </span>
                  </span>
                </p>
              </div>
              <div class="OrderReceivedstyle__ListDes-sc-1c48wfp-11 dmrHfn">
                <p class="OrderReceivedstyle__Text-sc-1c48wfp-6 kJwZtp">
                  <span style="vertical-align: inherit;">
                    <span style="vertical-align: inherit;">
                      1.er piso, Casa 149, Carretera-22, Mohakhali DOHS, Dhaka -
                      Norte
                    </span>
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div class="OrderReceivedstyle__TotalAmount-sc-1c48wfp-4 gdNFpp">
            <h2 class="OrderReceivedstyle__BlockTitle-sc-1c48wfp-5 foYIyC">
              <span style="vertical-align: inherit;">
                <span style="vertical-align: inherit;">Cantidad total</span>
              </span>
            </h2>
            <div class="OrderReceivedstyle__ListItem-sc-1c48wfp-9 cbQBZt">
              <div class="OrderReceivedstyle__ListTitle-sc-1c48wfp-10 dvtNhw">
                <p class="OrderReceivedstyle__Text-sc-1c48wfp-6 loLWBC">
                  <span style="vertical-align: inherit;">
                    <span style="vertical-align: inherit;">Subtotal</span>
                  </span>
                </p>
              </div>
              <div class="OrderReceivedstyle__ListDes-sc-1c48wfp-11 dmrHfn">
                <p class="OrderReceivedstyle__Text-sc-1c48wfp-6 kJwZtp">
                  <span style="vertical-align: inherit;">
                    <span style="vertical-align: inherit;">$ 10,864.00</span>
                  </span>
                </p>
              </div>
            </div>
            <div class="OrderReceivedstyle__ListItem-sc-1c48wfp-9 cbQBZt">
              <div class="OrderReceivedstyle__ListTitle-sc-1c48wfp-10 dvtNhw">
                <p class="OrderReceivedstyle__Text-sc-1c48wfp-6 loLWBC">
                  <span style="vertical-align: inherit;">
                    <span style="vertical-align: inherit;">Método de pago</span>
                  </span>
                </p>
              </div>
              <div class="OrderReceivedstyle__ListDes-sc-1c48wfp-11 dmrHfn">
                <p class="OrderReceivedstyle__Text-sc-1c48wfp-6 kJwZtp">
                  <span style="vertical-align: inherit;">
                    <span style="vertical-align: inherit;">
                      Contra reembolso
                    </span>
                  </span>
                </p>
              </div>
            </div>
            <div class="OrderReceivedstyle__ListItem-sc-1c48wfp-9 cbQBZt">
              <div class="OrderReceivedstyle__ListTitle-sc-1c48wfp-10 dvtNhw">
                <p class="OrderReceivedstyle__Text-sc-1c48wfp-6 loLWBC">
                  <span style="vertical-align: inherit;">
                    <span style="vertical-align: inherit;">
                      Contra reembolso
                    </span>
                  </span>
                </p>
              </div>
              <div class="OrderReceivedstyle__ListDes-sc-1c48wfp-11 dmrHfn">
                <p class="OrderReceivedstyle__Text-sc-1c48wfp-6 kJwZtp">
                  <span style="vertical-align: inherit;">
                    <span style="vertical-align: inherit;">10</span>
                  </span>
                </p>
              </div>
            </div>
            <div class="OrderReceivedstyle__ListItem-sc-1c48wfp-9 cbQBZt">
              <div class="OrderReceivedstyle__ListTitle-sc-1c48wfp-10 dvtNhw">
                <p class="OrderReceivedstyle__Text-sc-1c48wfp-6 loLWBC">
                  <span style="vertical-align: inherit;">
                    <span style="vertical-align: inherit;">Total</span>
                  </span>
                </p>
              </div>
              <div class="OrderReceivedstyle__ListDes-sc-1c48wfp-11 dmrHfn">
                <p class="OrderReceivedstyle__Text-sc-1c48wfp-6 kJwZtp">
                  <span style="vertical-align: inherit;">
                    <span style="vertical-align: inherit;">$ 10,874.00</span>
                  </span>
                </p>
              </div>
            </div>
          </div> -->
        </div>
      </div>
    {:else}
      <span class="CartItemCardstyle__NoProductMsg-xuzuaf-18 dznoMc">Tu carrito esta vacío.</span>

      <div class="c-mini-cart__illustration">
            <svg xmlns="http://www.w3.org/2000/svg" width="346" height="447" viewBox="0 0 346 447">
    <g fill="none" fill-rule="evenodd">
        <path fill="#060000" d="M163.786 326.593h-.044a1.151 1.151 0 0 1-1.108-1.196c.208-5.436-.156-11.314-.61-14.73a1.152 1.152 0 1 1 2.284-.303c.466 3.512.842 9.55.629 15.122a1.153 1.153 0 0 1-1.15 1.107"></path>
        <path fill="rgb(0, 158, 127)" d="M59.946 282.537l.089-.073c2.696-2.19 5.868-3.455 9.26-3.455.368 0 .734.015 1.097.045.099-.03.205-.045.315-.045 1.251 0 14.466 2.02 39.278 6.004a1.153 1.153 0 0 1-.365 2.275c-16.107-2.586-25.596-4.065-31.168-4.905 5.133 4.105 8.57 11.552 8.57 20.039 0 8.445-3.403 15.86-8.492 19.979 3.527-.54 8.618-1.333 15.956-2.493a1.15 1.15 0 1 1 .36 2.275c-23.092 3.653-23.853 3.653-24.14 3.653-.11 0-.215-.015-.316-.044a13.95 13.95 0 0 1-1.096.043c-3.419 0-6.615-1.285-9.326-3.509-14.284 1.805-28.922 3.51-32.188 3.51-.11 0-.217-.015-.317-.044-.362.028-.727.043-1.095.043-9.775 0-17.728-10.503-17.728-23.413s7.953-23.413 17.728-23.413c.368 0 .733.015 1.095.045.1-.03.207-.045.316-.045 3.182 0 17.818 1.712 32.167 3.528zm-25.063-.645l.02.014c5.475 3.989 9.192 11.69 9.192 20.516 0 8.845-3.733 16.56-9.227 20.542 5.398-.554 13.37-1.486 22.968-2.691-3.713-4.164-6.115-10.308-6.262-17.184h-4.543a1.152 1.152 0 1 1 0-2.302h4.579c.34-6.473 2.68-12.23 6.21-16.197-9.594-1.206-17.55-2.14-22.937-2.698zm116.433 9.844c11.53 1.9 17.584 2.923 17.998 3.04l.838.237v14.808l-.825.244-.01.003c-.167.048-.963.237-18.535 3.11l-.371-2.273c11.627-1.902 15.886-2.625 17.438-2.898v-11.168c-1.883-.333-7.002-1.196-16.907-2.83l.374-2.273zm-124.948.447c-4.212 0-7.625 4.584-7.625 10.24 0 5.655 3.413 10.24 7.625 10.24 4.211 0 7.624-4.585 7.624-10.24 0-5.656-3.413-10.24-7.624-10.24zm42.926 0c-4.211 0-7.625 4.584-7.625 10.24 0 5.655 3.414 10.24 7.625 10.24 4.212 0 7.626-4.585 7.626-10.24 0-5.656-3.414-10.24-7.626-10.24z"></path>
        <path fill="#060000" d="M198.856 79.7c3.959 0 7.18 3.221 7.18 7.18 0 3.568-2.615 6.536-6.029 7.088l.001 106.059c.465-.125.919-.223 1.355-.29a20.039 20.039 0 0 1 2.387-.234 1.11 1.11 0 0 1 .326-.048c2.21 0 4.949.23 7.323.615 11.969 1.941 20.655 17.842 20.655 37.808 0 20.856-9.348 37.823-20.84 37.823h-11.207v11.766L336.75 435.413a1.152 1.152 0 0 1-1.692 1.564l-136.202-147.36-136.201 147.36a1.152 1.152 0 1 1-1.692-1.564l78.454-84.88c-2.882.119-5.926.138-8.63.138h-.202c-.473.005-1.347.018-2.366.035-1.791.027-4.022.061-5.319.061-13.04 0-26.633-2.48-28.59-20.877-1.988-18.678-.354-29.574.797-34.407 1.134-4.753 4.261-7.646 8.134-7.561a7.928 7.928 0 0 1 5.587 2.471l.039.044.198-8.688c.1-4.403 3.77-7.89 8.166-7.803a7.977 7.977 0 0 1 6.234 3.233 7.983 7.983 0 0 1 1.779-2.512 7.958 7.958 0 0 1 5.692-2.216 7.926 7.926 0 0 1 5.587 2.473 7.929 7.929 0 0 1 2.216 5.693l-.002.108.042-.04a7.945 7.945 0 0 1 5.692-2.216c4.301.098 7.729 3.665 7.804 8.12.157 9.394.105 25.381-.38 38.284a1.153 1.153 0 0 1-1.15 1.108h-.045a1.152 1.152 0 0 1-1.107-1.195c.483-12.86.535-28.795.378-38.159-.054-3.213-2.492-5.785-5.551-5.855-2.781-.045-5.179 1.925-5.705 4.583l-.106 22.362v6.568c0 .094-.01.185-.032.273l-.001.038a1.152 1.152 0 0 1-1.152 1.147h-.006a1.152 1.152 0 0 1-1.146-1.157l.034-7.092v-21.196c.01-.39.045-.773.107-1.15l.023-4.563c.071-3.153-2.42-5.76-5.552-5.83a5.7 5.7 0 0 0-4.049 1.578 5.639 5.639 0 0 0-1.76 3.973l-.046 1.996-.56 29.564a1.152 1.152 0 0 1-1.114 1.129c-.05.006-.099.01-.15.01h-.026a1.153 1.153 0 0 1-1.126-1.178l.516-22.696c.002-.082.013-.162.03-.24l.023-1.199a1.154 1.154 0 0 1-.015-.219l.123-5.416.001-.212a5.69 5.69 0 0 0-5.552-5.596 5.717 5.717 0 0 0-4.05 1.578 5.643 5.643 0 0 0-1.76 3.974l-.297 13.064a1.087 1.087 0 0 1-.057.325c.026.296.036.595.029.897l-.398 17.514a1.151 1.151 0 0 1-1.15 1.125h-.028a1.152 1.152 0 0 1-1.126-1.177l.399-17.515a5.64 5.64 0 0 0-1.579-4.049 5.642 5.642 0 0 0-3.973-1.76c-4.119-.06-5.511 4.41-5.84 5.792-1.118 4.69-2.7 15.293-.748 33.63 1.422 13.365 9.04 18.817 26.299 18.817 1.288 0 3.504-.034 5.283-.062 1.205-.02 2.21-.034 2.603-.034 3.413 0 7.367-.031 10.815-.258h.053l56.051-60.644V275.7h-15.43c-5.59 0-10.138-4.547-10.138-10.138 0-3.306 1.59-6.248 4.047-8.1-4.484-1.044-7.834-5.074-7.834-9.872 0-3.486 1.768-6.566 4.454-8.391-3.97-1.374-6.828-5.15-6.828-9.582 0-3.234 1.523-6.12 3.89-7.978-4.785-.81-8.439-4.983-8.439-9.994 0-5.59 4.548-10.139 10.138-10.139h20.784c1.056 0 2.093.163 3.09.485.735-.437 1.5-.827 2.267-1.156l-.001-106.868c-3.414-.552-6.028-3.52-6.028-7.087 0-3.96 3.22-7.18 7.18-7.18zm2.858 122.313c-.55.086-1.125.227-1.706.414v.056l-.166-.002c-3.075 1.034-6.298 3.317-7.286 5.338l-7.54 17.37c-1.72 3.963.104 8.586 4.066 10.306 1.91.83 4.038.862 5.991.092a7.778 7.778 0 0 0 4.315-4.158l9.12-21.006a1.15 1.15 0 1 1 2.177.192l5.156 21.697a1.152 1.152 0 0 1-2.24.533l-4.358-18.331-7.742 17.833a10.054 10.054 0 0 1-5.057 5.16c5.11.513 9.112 4.84 9.112 10.084 0 4.072-2.413 7.59-5.884 9.202a10.141 10.141 0 0 1 5.058 8.77c0 3.153-1.446 5.974-3.71 7.835h10.194c10.22 0 18.537-15.934 18.537-35.52 0-18.526-8.05-33.802-18.72-35.533a43.469 43.469 0 0 0-1.566-.224c-.142.04-.295.051-.451.03-4.057-.54-5.83-.365-7.3-.138zm-7.122 55.715h-12.318c-4.32 0-7.835 3.516-7.835 7.835 0 4.32 3.515 7.835 7.835 7.835h12.318c4.32 0 7.835-3.515 7.835-7.835s-3.515-7.835-7.835-7.835zm.827-17.972h-16.932c-4.32 0-7.835 3.515-7.835 7.835s3.515 7.834 7.835 7.834h16.932c4.32 0 7.834-3.515 7.834-7.834 0-4.32-3.514-7.835-7.834-7.835zm-11.437-17.973l-7.869.001c-4.319 0-7.834 3.514-7.834 7.834s3.515 7.835 7.834 7.835h11.71c-4.89-2.339-7.096-8.169-4.92-13.18l1.08-2.49zm8.366-17.971h-20.784c-4.32 0-7.835 3.514-7.835 7.834s3.515 7.834 7.835 7.834h13.42l5.48-12.625c.526-1.076 1.382-2.101 2.428-3.023a7.2 7.2 0 0 0-.544-.02zm6.508-121.807a4.881 4.881 0 0 0-4.876 4.876 4.881 4.881 0 0 0 4.876 4.876 4.881 4.881 0 0 0 4.875-4.876 4.881 4.881 0 0 0-4.875-4.876z"></path>
        <path fill="rgb(0, 158, 127)" d="M312.861 104.972v.851l-45.4 41.962 45.4 41.962v.851H198.024v-85.626h114.837zm-37.978-62.618a1.153 1.153 0 0 1-.05 1.628L240.03 76.663a1.151 1.151 0 0 1-1.629-.051 1.153 1.153 0 0 1 .05-1.629l34.802-32.68a1.153 1.153 0 0 1 1.629.05zM127.09 39.24l33.403 34.11a1.152 1.152 0 0 1-1.647 1.613l-33.402-34.11a1.152 1.152 0 0 1 1.646-1.613zm115.09-20.387c.578.265.832.95.568 1.527l-19.874 43.408a1.153 1.153 0 1 1-2.096-.96l19.874-43.407a1.153 1.153 0 0 1 1.528-.568zm-81.557-1.108l18.038 44.202a1.152 1.152 0 1 1-2.133.87L158.49 18.615a1.152 1.152 0 1 1 2.133-.87zM198.64 9.36c.636 0 1.152.515 1.152 1.152v47.741a1.152 1.152 0 1 1-2.304 0V10.512c0-.637.515-1.152 1.152-1.152z"></path>
    </g>
</svg>

          </div>

    {/if}
  {:else}
    {#each cartItems as item (item.name)}
      <CheckoutItem {item} />
    {/each}
    <div class="CartItemCardstyle__CheckoutButtonWrapper-xuzuaf-15 eVxmaB">
      <span class="CartItemCardstyle__PromoCode-xuzuaf-13 bCKENA">
        <button>Do you have a voucher?</button>
      </span>
      <button
        on:click={abrirvisible}
        class="CartItemCardstyle__CheckoutButton-xuzuaf-14 iHtosU">
        <a class="CartItemCardstyle__Title-xuzuaf-16 eKpZme">Checkout</a>
        <span class="CartItemCardstyle__PriceBox-xuzuaf-17 KJSiM">S./</span>
      </button>
    </div>
  {/if}
</div>

{#if visible}
  <div class="reuseModalParentWrapper">
    <div
      class="reuseModalHolder add-address-modal"
      style="max-width: 320px; max-height: 813px; width: 360px; height: auto;
      position: absolute; left: 0px; top: 70px; opacity: 1; transform:
      scale3d(1, 1, 1); margin-left: 5.5%; display: block;">
      <div class="innerRndComponent">
        <form action="#">
          <div class="Updatestyle__Heading-sc-1hcedug-1 hDejwL">
            Add New Contact
          </div>
          <div class="Updatestyle__FieldWrapper-sc-1hcedug-0 deGZNA">
            <input
              class="UpdateContact__StyledInput-sc-196y1x0-0 jFvJIE form-control"
              placeholder="Enter a phone number"
              id="my-input-id"
              name="number"
              value="" />
          </div>
          <div class="UpdateContact__StyledError-sc-196y1x0-1 hYIhzj">
            Number is required
          </div>
          <button
            on:click={cerrarvisible}
            type="submit"
            class="Buttonstyle__ButtonStyle-voymor-0 dYRvKF reusecore__button">
            <span class="btn-text">Save Contact</span>
          </button>
        </form>
      </div>

      <div class="CheckoutWithSidebarstyle__CartWrapper-sc-1fbaxpu-20 evBiYl">
        <div class="sticky-outer-wrapper" style="">
          <div
            class="sticky-inner-wrapper "
            style="position: relative; z-index: 999; transform: translate3d(0px,
            0px, 0px);">
            <div
              class="CheckoutWithSidebarstyle__OrderInfo-sc-1fbaxpu-21 iuZybX">
              <h3 class="CheckoutWithSidebarstyle__Title-sc-1fbaxpu-22 ihJQyq">
                <span style="vertical-align: inherit;">
                  <span style="vertical-align: inherit;">Su pedido</span>
                </span>
              </h3>
              <div
                style="position: relative; overflow: hidden; width: 100%;
                height: auto; min-height: 0px; max-height: 390px;">
                <div
                  style="position: relative; overflow: scroll; margin-bottom:
                  -17px; min-height: 17px; max-height: calc(407px); margin-left:
                  0px; padding-left: 0px; padding-right: 15px;">
                  <div
                    class="CheckoutWithSidebarstyle__ItemsWrapper-sc-1fbaxpu-23
                    bJvjJg">
                    <div
                      class="CheckoutWithSidebarstyle__Items-sc-1fbaxpu-25
                      cSMtnt">
                      <span
                        class="CheckoutWithSidebarstyle__Quantity-sc-1fbaxpu-26
                        dwZrDQ">
                        <span style="vertical-align: inherit;">
                          <span style="vertical-align: inherit;">1</span>
                        </span>
                      </span>
                      <span
                        class="CheckoutWithSidebarstyle__Multiplier-sc-1fbaxpu-27
                        bYcxrK">
                        <span style="vertical-align: inherit;">
                          <span style="vertical-align: inherit;">X</span>
                        </span>
                      </span>
                      <span
                        class="CheckoutWithSidebarstyle__ItemInfo-sc-1fbaxpu-28
                        jsCFpB">
                        <span style="vertical-align: inherit;">
                          <span style="vertical-align: inherit;">
                            Arándanos
                          </span>
                        </span>
                        <span style="vertical-align: inherit;">
                          <span style="vertical-align: inherit;">|</span>
                          <span style="vertical-align: inherit;">1 libra</span>
                        </span>
                      </span>
                      <span
                        class="CheckoutWithSidebarstyle__Price-sc-1fbaxpu-29
                        gCXrSa">
                        <span style="vertical-align: inherit;">
                          <span style="vertical-align: inherit;">$</span>
                        </span>
                        <span style="vertical-align: inherit;">
                          <span style="vertical-align: inherit;">7.20</span>
                        </span>
                      </span>
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
                  style="position: absolute; width: 6px; transition: opacity
                  200ms ease 0s; opacity: 0; right: 2px; bottom: 2px; top: 2px;
                  border-radius: 3px;">
                  <div
                    style="position: relative; display: block; width: 100%;
                    cursor: pointer; border-radius: inherit; background-color:
                    rgba(0, 0, 0, 0.2); height: 0px;" />
                </div>
              </div>
              <div
                class="CheckoutWithSidebarstyle__CalculationWrapper-sc-1fbaxpu-24
                dPNmUJ">
                <div
                  class="CheckoutWithSidebarstyle__TextWrapper-sc-1fbaxpu-30
                  bMlMJp">
                  <span
                    class="CheckoutWithSidebarstyle__Text-sc-1fbaxpu-31 jIRiMb">
                    <span style="vertical-align: inherit;">
                      <span style="vertical-align: inherit;">Subtotal</span>
                    </span>
                  </span>
                  <span
                    class="CheckoutWithSidebarstyle__Text-sc-1fbaxpu-31 jIRiMb">
                    <span style="vertical-align: inherit;">
                      <span style="vertical-align: inherit;">$</span>
                    </span>
                    <span style="vertical-align: inherit;">
                      <span style="vertical-align: inherit;">10.20</span>
                    </span>
                  </span>
                </div>
                <div
                  class="CheckoutWithSidebarstyle__TextWrapper-sc-1fbaxpu-30
                  bMlMJp">
                  <span
                    class="CheckoutWithSidebarstyle__Text-sc-1fbaxpu-31 jIRiMb">
                    <span style="vertical-align: inherit;">
                      <span style="vertical-align: inherit;">
                        Gastos de envío
                      </span>
                    </span>
                  </span>
                  <span
                    class="CheckoutWithSidebarstyle__Text-sc-1fbaxpu-31 jIRiMb">
                    <span style="vertical-align: inherit;">
                      <span style="vertical-align: inherit;">$</span>
                    </span>
                    <span style="vertical-align: inherit;">
                      <span style="vertical-align: inherit;">0.00</span>
                    </span>
                  </span>
                </div>
                <div
                  class="CheckoutWithSidebarstyle__TextWrapper-sc-1fbaxpu-30
                  bMlMJp">
                  <span
                    class="CheckoutWithSidebarstyle__Text-sc-1fbaxpu-31 jIRiMb">
                    <span style="vertical-align: inherit;">
                      <span style="vertical-align: inherit;">Descuento</span>
                    </span>
                  </span>
                  <span
                    class="CheckoutWithSidebarstyle__Text-sc-1fbaxpu-31 jIRiMb">
                    <span style="vertical-align: inherit;">
                      <span style="vertical-align: inherit;">$</span>
                    </span>
                    <span style="vertical-align: inherit;">
                      <span style="vertical-align: inherit;">0.00</span>
                    </span>
                  </span>
                </div>
                <div
                  class="CheckoutWithSidebarstyle__TextWrapper-sc-1fbaxpu-30
                  bMlMJp"
                  style="margin-top: 20px;">
                  <span
                    class="CheckoutWithSidebarstyle__Bold-sc-1fbaxpu-32 bLZxHH">
                    <span style="vertical-align: inherit;">
                      <span style="vertical-align: inherit;">Total</span>
                      <span
                        class="CheckoutWithSidebarstyle__Small-sc-1fbaxpu-33
                        fdQquj">
                        <span style="vertical-align: inherit;">(</span>
                      </span>
                      <span
                        class="CheckoutWithSidebarstyle__Small-sc-1fbaxpu-33
                        fdQquj">
                        <span style="vertical-align: inherit;">
                          IVA incluido
                        </span>
                      </span>
                      <span
                        class="CheckoutWithSidebarstyle__Small-sc-1fbaxpu-33
                        fdQquj">
                        <span style="vertical-align: inherit;">)</span>
                      </span>
                    </span>
                    <span
                      class="CheckoutWithSidebarstyle__Small-sc-1fbaxpu-33
                      fdQquj">
                      <span style="vertical-align: inherit;" />
                      <span style="vertical-align: inherit;" />
                      <span style="vertical-align: inherit;" />
                    </span>
                  </span>
                  <span
                    class="CheckoutWithSidebarstyle__Bold-sc-1fbaxpu-32 bLZxHH">
                    <span style="vertical-align: inherit;">
                      <span style="vertical-align: inherit;">$</span>
                    </span>
                    <span style="vertical-align: inherit;">
                      <span style="vertical-align: inherit;">10.20</span>
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
{/if}
