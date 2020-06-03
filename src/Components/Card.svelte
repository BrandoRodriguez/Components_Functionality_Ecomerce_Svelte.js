<script>
  import { get } from "svelte/store";
  import { cart } from "../stores/stores.js";
  import { fade, fly } from "svelte/transition";
  import Modal from "./Modal.svelte";
  import CardDescripcion from "./CardDescripcion.svelte";

  let showModal = false;
  let visible = false;
  let scoops = 1;
  let svg =
    "M298.7,418.289l-2.906-4.148a.835.835,0,0,0-.528-.251.607.607,0,0,0-.529.251l-2.905,4.148h-3.17a.609.609,0,0,0-.661.625v.191l1.651,5.84a1.336,1.336,0,0,0,1.255.945h8.588a1.261,1.261,0,0,0,1.254-.945l1.651-5.84v-.191a.609.609,0,0,0-.661-.625Zm-5.419,0,1.984-2.767,1.98,2.767Zm1.984,5.024a1.258,1.258,0,1,1,1.319-1.258,1.3,1.3,0,0,1-1.319,1.258Zm0,0";
  let soles = "$";

 

  export let item;
  let {
    name,
   img,
   img1,
   img2,
   img3,
   descripcion,
   marca,
   ancho,
   profundidad,
   alto,
   material,
   Tipodeconexión,
   peso,
   precio,
   precioantes,
   oferta,
   categoriageneral,
   categoria,
   count
  } = item;


  $: doubled = inCart * precio;
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
</script>

<style>
  .reuseModalHolder {
    padding: 0px;
    overflow: auto;
    border-radius: 3px 3px 0px 0px;
    border-width: 0px;
    border-style: initial;
    border-color: initial;
    border-image: initial;
  }
  .reuseModalHolder {
    width: 100%;
    height: 100%;
    z-index: 99999;
  }
  .reuseModalHolder {
    display: flex;
    overflow: hidden;
    box-sizing: border-box;
  }
  div {
    font-family: Lato, sans-serif;
    margin: 0px;
  }
  .innerRndComponent {
    width: 100%;
    height: 100%;
    box-sizing: content-box;
  }
  *,
  ::before,
  ::after {
    box-sizing: inherit;
  }
  .dJblge {
    max-width: 100%;
  }
  .fOsizy {
    background-color: rgb(255, 255, 255);
    position: relative;
    display: flex;
    flex-wrap: wrap;
    -webkit-box-align: stretch;
    align-items: stretch;
    min-height: 100%;
    box-sizing: border-box;
    box-shadow: rgba(0, 0, 0, 0.16) 0px 10px 40px;
    border-radius: 6px;
    overflow: hidden;
  }
  .fMlFIC {
    max-width: 50%;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    position: relative;
    flex: 0 0 50%;
    padding: 30px 60px;
  }
  .fOsizy * {
    box-sizing: border-box;
  }
  .carousel-with-custom-dots {
    padding-bottom: 100px;
  }
  .react-multi-carousel-list {
    display: flex;
    align-items: center;
    position: relative;
  }
  .fMlFIC img {
    width: 100%;
  }
  .fOsizy * {
    box-sizing: border-box;
  }
  .fMlFIC img {
    width: 70%;
  }
  li {
    list-style: none;
  }
  .fOsizy * {
    box-sizing: border-box;
  }
  .react-multi-carousel-dot-list {
    position: absolute;
    bottom: 0;
    display: flex;
    left: 0;
    right: 0;
    justify-content: center;
    padding: 0;
    list-style: none;
    text-align: center;
  }
  .hkJujT {
    height: auto;
    border-width: 1px;
    border-style: solid;
    border-color: rgb(241, 241, 241);
    border-image: initial;
    border-radius: 6px;
    padding: 0px;
    outline: none;
    overflow: hidden;
    margin: 5px;
  }
  .hkJujT:hover {
    border-width: 1px;
    border-style: solid;
    border-color: rgb(0, 158, 127);
    border-image: initial;
  }
  .gwwLZz {
    font-family: Lato, sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: rgb(255, 255, 255);
    line-height: 24px;
    background-color: rgb(251, 185, 121);
    padding-left: 10px;
    padding-right: 10px;
    display: inline-block;
    position: absolute;
    top: 43px;
    right: 30px;
    transform: translate3d(0px, 0px, 1px);
    border-radius: 12px;
  }
  @media (min-width: 768px) {
    .gwwLZz {
      top: 65px;
      right: 30px;
    }
  }
  @media (min-width: 1366px) {
    .gwwLZz {
      top: 70px;
      right: 30px;
    }
  }
  .DNQhx {
    max-width: 50%;
    flex: 0 0 50%;
    border-left: 1px solid rgb(243, 243, 243);
  }
  .hJAUJy {
    padding: 50px;
  }
  .fOsizy * {
    box-sizing: border-box;
  }
  .kzoayf {
    width: 100%;
    display: flex;
    align-items: flex-start;
    -webkit-box-pack: start;
    justify-content: flex-start;
  }
  .mqzOv {
    font-family: Poppins, sans-serif;
    font-size: 19px;
    font-weight: 700;
    color: rgb(13, 17, 54);
    line-height: 1.5;
    display: flex;
  }
  @media (min-width: 1600px) {
    .mqzOv {
      font-family: Poppins, sans-serif;
      font-size: 21px;
      font-weight: 700;
      color: rgb(13, 17, 54);
      line-height: 1.5;
      display: flex;
    }
  }
  .fbUCfN {
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    flex-shrink: 0;
    margin-left: 30px;
    line-height: 60px;
    margin-top: 15px;
  }
  @media (min-width: 768px) {
    .fbUCfN {
      display: flex;
      -webkit-box-align: center;
      align-items: center;
      flex-shrink: 0;
      line-height: 60px;
      margin-top: 15px;
    }
  }
  @media (min-width: 1024px) {
    .fbUCfN {
      display: flex;
      -webkit-box-align: center;
      align-items: center;
      flex-shrink: 0;
      margin-left: 30px;
      line-height: 60px;
      margin-top: 15px;
    }
  }

  @media (min-width: 1600px) {
    .fbUCfN {
      display: flex;
      -webkit-box-align: center;
      align-items: center;
      flex-shrink: 0;
      margin-left: 440px;
      line-height: 60px;
      margin-top: 15px;
    }
  }
  .OLDqC {
    font-family: Lato, sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: rgb(66, 69, 97);
    line-height: 2;
  }
  .hmqfIE {
    margin-top: 30px;
  }
  .CyALc:last-child {
    margin-bottom: 0px;
  }
  .CyALc {
    display: flex;
    flex-wrap: wrap;
    -webkit-box-align: center;
    align-items: center;
    margin-bottom: 10px;
  }
  .eLZhSZ {
    font-family: Lato, sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: rgb(13, 17, 54);
    margin-right: 10px;
    margin-bottom: 10px;
    background-color: rgb(247, 247, 247);
    cursor: pointer;
    height: 30px;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    padding: 0px 15px;
    border-radius: 6px;
  }
  .eLZhSZ {
    font-family: Lato, sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: rgb(13, 17, 54);
    margin-right: 10px;
    margin-bottom: 10px;
    background-color: rgb(247, 247, 247);
    cursor: pointer;
    height: 30px;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    padding: 0px 15px;
    border-radius: 6px;
  }
  @media (max-width: 767px) {
    .fMlFIC {
      max-width: 100%;
      order: 0;
      flex: 0 0 100%;
    }
  }
  @media (max-width: 767px) {
    .fMlFIC img {
      min-width: auto !important;
    }
  }
  @media (max-width: 320px) {
    .fMlFIC img {
      min-width: auto !important;
      width: 200px;
    }
  }
  @media (max-width: 767px) {
    .DNQhx {
      max-width: 100%;
      order: 1;
      flex: 0 0 100%;
      padding: 10px 0px 30px;
    }
  }
  @media (max-width: 767px) {
    .hJAUJy {
      padding: 0px 30px 30px;
    }
  }
  @media (max-width: 767px) {
    .mqzOv {
      word-break: break-word;
    }
  }
  @media (max-width: 767px) {
    .fbUCfN {
      margin-left: 15px;
    }
  }

  .card-size > div {
    height: 100%;
  }










  .react-reveal {
    animation-fill-mode: both;
    animation-duration: 800ms;
    animation-delay: 0ms;
    animation-iteration-count: 1;
    opacity: 1;
  }

  .gqAiKu .product-meta .productPriceWrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .gqAiKu .product-meta .productPriceWrapper .product-price {
    font-family: Lato, sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: rgb(0, 158, 127);
  }

  div {
    font-family: Lato, sans-serif;
    margin: 0px;
  }
  .product-price {
    font-family: Lato, sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: rgb(13, 17, 54);
    white-space: nowrap;
  }

  @media (min-width: 1366px) {
    .product-price {
      margin-top: 0px;
      position: inherit;
      font-family: Lato, sans-serif;
      font-size: 15px;
      font-weight: 700;
      color: rgb(0, 158, 127);
    }
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

  @media (max-width: 767px) {
    .btn-text {
      display: none;
    }
  }

  @media (max-width: 767px) {
    .button-card {
      width: 32px;
      height: 32px;
      padding: 0px;
      border-radius: 50%;
    }
  }
  .btn-text {
    padding: 0px 0px 0px 6px;
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
  @media (max-width: 767px) {
    .dIPXl {
      min-height: 123px;
      padding: 5px 20px;
    }
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
 
  .jYDToY {
    font-family: Lato, sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: rgb(255, 255, 255);
    line-height: 24px;
    background-color: rgb(255, 173, 94);
    padding-left: 10px;
    padding-right: 10px;
    display: inline-block;
    border-radius: 12px;
  }

  .irboLw {
    max-width: 18%;
    padding-left: 15px;
    padding-right: 15px;
    margin-bottom: 30px;
    flex: 0 0 20%;
  }
  .rheIJ {
    height: 100%;
  }
  .rheIJ > div {
    height: 100%;
  }

  .dHUSDJ {
    height: 100%;
    width: 100%;
    background-color: rgb(255, 255, 255);
    position: relative;
    font-family: Lato, sans-serif;
    cursor: pointer;
    border-radius: 6px;
  }
  .ghRfMn {
    height: 240px;
    position: relative;
    text-align: center;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    padding: 5px;
  }
  .ghRfMn img {
    max-width: 65%;
    max-height: 100%;
    display: inline-block;
  }
  .jYDToY {
    font-family: Lato, sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: rgb(255, 255, 255);
    line-height: 24px;
    background-color: rgb(255, 173, 94);
    padding-left: 10px;
    padding-right: 10px;
    display: inline-block;
    position: absolute;
    top: 15px;
    right: 15px;
    border-radius: 12px;
  }
  .dIPXl {
    padding: 10px 25px 30px;
  }
  .dIPXl .product-title {
    font-family: Lato, sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: rgb(13, 17, 54);
    width: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin: 0px 0px 7px;
    overflow: hidden;
  }
  .dIPXl .product-weight {
    font-family: Lato, sans-serif;
    font-size: 13px;
    font-weight: 400;
    color: rgb(119, 121, 140);
  }
  .dIPXl .product-meta {
    margin-top: 30px;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: justify;
    justify-content: space-between;
  }
  .dIPXl .product-meta .productPriceWrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .dIPXl .product-meta .productPriceWrapper .discountedPrice {
    font-family: Lato, sans-serif;
    font-size: 13px;
    font-weight: 400;
    color: rgb(255, 173, 94);
    font-style: italic;
    position: absolute;
    top: -20px;
    left: -4px;
    padding: 0px 5px;
    overflow: hidden;
  }

  @media (max-width: 767px) {
    .irboLw {
      max-width: 47%;
      flex: 0 0 50%;
    }
  }
  @media (max-width: 768px) {
    .irboLw {
      padding-left: 5px;
      padding-right: 5px;
      margin-bottom: 15px;
    }
  }
  @media (max-width: 767px) {
    .ghRfMn {
      height: 145px;
    }
  }

  @media (max-width: 767px) {
    .dIPXl {
      min-height: 123px;
      padding: 0px 20px;
    }
  }

  @media (max-width: 767px) {
    .dIPXl .product-title {
      font-size: 14px;
      margin: 0px 0px 5px;
    }
  }
  @media (max-width: 767px) {
    .dIPXl .product-weight {
      font-size: 12px;
    }
  }
  @media (max-width: 767px) {
    .dIPXl .product-meta {
      min-height: 32px;
    }
  }

  @media (max-width: 767px) {
    .dIPXl .product-meta .productPriceWrapper .product-price {
      font-size: 14px;
      font-family: Lato, sans-serif;
      font-size: 15px;
      font-weight: 700;
      color: rgb(0, 158, 127);
    }
  }

  @media (max-width: 767px) {
    .dIPXl .product-meta .cart-button .btn-text {
      display: none;
    }
  }
  @media (max-width: 1500px) and (min-width: 1301px) {
    .irboLw {
      max-width: 21.8%;
      flex: 0 0 25%;
    }
  }

  @media (max-width: 1300px) and (min-width: 768px) {
    .irboLw {
      max-width: 29.9%;
      flex: 0 0 33.333%;
    }
  }

  @media (max-width: 1199px) and (min-width: 991px) {
    .irboLw {
      padding-left: 10px;
      padding-right: 10px;
      margin-bottom: 20px;
    }
  }

  @media (max-width: 768px) {
    .irboLw {
      padding-left: 5px;
      padding-right: 5px;
      margin-bottom: 15px;
    }
  }

  /* Button */
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
  }
  .dMHyRK {
    pointer-events: none;
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
    -webkit-appearance: media-sliderthumb;
  }

  .reuseModalParentWrapper {
    display: flex;
    overflow: hidden;
    box-sizing: border-box;
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
  .innerRndComponent {
    width: 100%;
    height: 100%;
    box-sizing: content-box;
  }
  .fBqntg {
    position: fixed;
    top: 20px;
    right: 15px;
    z-index: 1;
    cursor: pointer;
    color: rgba(0, 0, 0, 0.5);
    display: inline-block;
    padding: 10px 15px;
    background: transparent;
    border-width: 0px;
    border-style: initial;
    border-color: initial;
    border-image: initial;
    outline: none;
  }
  .fBqntg svg {
    width: 12px;
    height: 12px;
  }

  .dJblge {
    max-width: 1020px;
  }
  .fOsizy {
    background-color: rgb(255, 255, 255);
    position: relative;
    display: flex;
    flex-wrap: wrap;
    -webkit-box-align: stretch;
    align-items: stretch;
    min-height: 100%;
    box-sizing: border-box;
    box-shadow: rgba(0, 0, 0, 0.16) 0px 10px 40px;
    border-radius: 6px;
    overflow: hidden;
  }
  .fMlFIC {
    max-width: 50%;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    position: relative;
    flex: 0 0 50%;
    padding: 30px 60px;
  }
  .carousel-with-custom-dots {
    padding-bottom: 100px;
  }

  @media (max-width: 767px) {
    .carousel-with-custom-dots {
      padding-bottom: 65px;
    }
  }

  .fOsizy * {
    box-sizing: border-box;
    cursor: pointer;
  }

  .react-multi-carousel-dot-list {
    position: absolute;
    bottom: 0;
    display: flex;
    left: 0;
    right: 0;
    justify-content: center;
    padding: 0;
    margin: 0;
    list-style: none;
    text-align: center;
  }

  .hkJujT {
    width: 70px;
    height: auto;
    border-width: 1px;
    border-style: solid;
    border-color: rgb(241, 241, 241);
    border-image: initial;
    border-radius: 6px;
    padding: 0px;
    outline: none;
    overflow: hidden;
  }
  .hkJujT:last-child {
    margin-right: 0px;
  }
  .jweBTn {
    font-family: Lato, sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: rgb(255, 255, 255);
    line-height: 24px;
    background-color: rgb(255, 173, 94);
    padding-left: 10px;
    padding-right: 10px;
    display: inline-block;
    position: absolute;
    top: 30px;
    right: 30px;
    transform: translate3d(0px, 0px, 1px);
    border-radius: 12px;
  }
  .DNQhx {
    max-width: 50%;
    flex: 0 0 50%;
    border-left: 1px solid rgb(243, 243, 243);
  }
  .hJAUJy {
    padding: 50px;
  }
  .kzoayf {
    width: 100%;
    display: flex;
    align-items: flex-start;
    -webkit-box-pack: start;
    justify-content: flex-start;
    margin-bottom: 10px;
  }
  .mqzOv {
    font-family: Poppins, sans-serif;
    font-size: 21px;
    font-weight: 700;
    color: rgb(13, 17, 54);
    line-height: 1.5;
    display: flex;
  }
  .fbUCfN {
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    flex-shrink: 0;
    margin-left: 25px;
    line-height: 31px;
  }
  .hVvfEF {
    font-family: Lato, sans-serif;
    font-size: 13px;
    font-weight: 400;
    color: rgb(255, 173, 94);
    font-style: italic;
    position: relative;
    margin-right: 10px;
    padding: 0px 5px;
    overflow: hidden;
  }
  .hVvfEF::before {
    content: "";
    width: 100%;
    height: 1px;
    display: inline-block;
    background-color: rgb(255, 173, 94);
    position: absolute;
    top: 50%;
    left: 0px;
  }
  .cqZYhV {
    font-family: Lato, sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: rgb(0, 158, 127);
  }

  .btDBfe {
    font-family: Lato, sans-serif;
    font-size: 13px;
    font-weight: 400;
    color: rgb(119, 121, 140);
  }
  .OLDqC {
    font-family: Lato, sans-serif;
    font-size: 15px;
    font-weight: 400;
    color: rgb(66, 69, 97);
    line-height: 2;
    margin-top: 30px;
  }
  .jiwWyF {
    display: flex;
    flex-direction: column;
  }

  .EWA-dv {
    margin-top: 60px;
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
  }
  .dMHyRK {
    pointer-events: none;
  }

  .hmqfIE {
    margin-top: 30px;
  }
  .CyALc:last-child {
    margin-bottom: 0px;
  }
  .CyALc {
    display: flex;
    flex-wrap: wrap;
    -webkit-box-align: center;
    align-items: center;
    margin-bottom: 10px;
  }
  .eLZhSZ {
    font-family: Lato, sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: rgb(13, 17, 54);
    margin-right: 10px;
    margin-bottom: 10px;
    background-color: rgb(247, 247, 247);
    cursor: pointer;
    height: 30px;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    padding: 0px 15px;
    border-radius: 6px;
  }

  /*  */
  .quick-view-overlay {
    background-color: rgba(0, 0, 0, 0.5);
  }
  .reuseModalOverlay {
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 9999;
  }
  .reuseModalOverlay {
    content: "";
    position: absolute;
    bottom: 0;
    right: 0;
    position: fixed;
  }

  @media (max-width: 767px) {
    .fBqntg {
      top: 5px;
      right: 0px;
    }
  }

  @media (max-width: 767px) {
    .fMlFIC {
      max-width: 100%;
      order: 0;
      flex: 0 0 100%;
      padding: 30px 47px 40px 30px;
    }
  }

  @media (max-width: 767px) {
    .DNQhx {
      max-width: 100%;
      order: 1;
      flex: 0 0 100%;
      padding: 10px 0px 30px;
    }
  }
  @media (max-width: 767px) {
    .hJAUJy {
      padding: 0px 30px 30px;
    }
  }

  @media (max-width: 1024px) {
    .tamaño {
    transform: scale3d(1, 1, 1);
    position: fixed;
    top: 100px;
    left: 0;
    width: 100%;
    height: 600px;
    margin-top: -25px;
    cursor: pointer;
    }
  }
  @media (min-width: 1660px) {
    .tamaño {
      max-height: 909px;
      width: 900px;
      height: auto;
      position: absolute;
      left: 210px;
      top: 30px;
      opacity: 1;
      transform: scale3d(1, 1, 1);
    }
  }
  @media (min-width: 1660px) {
    .tamaño {
      max-height: 909px;
      width: 900px;
      height: auto;
      position: fixed;
      top: 30px;
      opacity: 1;
      transform: scale3d(1, 1, 1);
    }
  }

  .opcion {
    display: none;
  }

</style>


<div class="Productsstyle__ProductsCol-p6azvq-2 irboLw">
  <div class="Productsstyle__ProductCardWrapper-p6azvq-7 rheIJ">
    <div
      class="react-reveal ancho"
      style="animation-fill-mode: both; animation-duration: 800ms;
      animation-delay: 0ms; animation-iteration-count: 1; opacity: 1;
      animation-name: react-reveal-251371714274058-1;">
      <div
        class="ProductCardstyle__ProductCardWrapper-sc-14yo7ej-0 dHUSDJ
        product-card">
        <div
          on:click={abrirvisible}
          class="ProductCardstyle__ProductImageWrapper-sc-14yo7ej-1 ghRfMn">

          <img src={`img/${img}`} alt={name} />

          <span class="ProductCardstyle__DiscountPercent-sc-14yo7ej-3 jYDToY">
            {oferta}
          </span>

        </div>
        <div class="ProductCardstyle__ProductInfo-sc-14yo7ej-4 dIPXl">

          <h3 class="product-title">{name}</h3>

          <span class="product-weight">{marca}</span>

          <div class="product-meta">
            <div class="productPriceWrapper">
              <span class="product-price">S/{precio}</span>

            </div>
            
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
              <button
                on:click={addToCart}
                class="button-general button-card .cart-button ">

                <span class="button-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14.4"
                    height="12"
                    viewBox="0 0 14.4 12">
                    <g
                      data-name="Group 120"
                      transform="translate(-288 -413.89)">
                      <path data-name="Path 154" fill="currentColor" d={svg} />
                    </g>
                  </svg>
                </span>
                <span class="btn-text">Card</span>
              </button>
            {/if}

          </div>
        </div>
      </div>
    </div>
  </div>

</div> 





{#if visible}
  <div class="reuseModalOverlay quick-view-overlay" ></div>
  <div class="reuseModalParentWrapper">
    <div class="reuseModalHolder quick-view-modal tamaño">
      <div class="innerRndComponent">
        <button
          on:click={cerrarvisible}
          class="QuickViewstyle__ModalClose-sc-28ycgw-19 fBqntg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="10.003"
            height="10"
            viewBox="0 0 10.003 10">
            <path
              data-name="_ionicons_svg_ios-close (5)"
              d="M166.686,165.55l3.573-3.573a.837.837,0,0,0-1.184-1.184l-3.573,3.573-3.573-3.573a.837.837,0,1,0-1.184,1.184l3.573,3.573-3.573,3.573a.837.837,0,0,0,1.184,1.184l3.573-3.573,3.573,3.573a.837.837,0,0,0,1.184-1.184Z"
              transform="translate(-160.5 -160.55)"
              fill="currentColor" />
          </svg>
        </button>
        <div class="QuickViewstyle__QuickViewWrapper-sc-28ycgw-0 dJblge">
          <div
            class="QuickViewstyle__ProductDetailsWrapper-sc-28ycgw-1 fOsizy
            product-card"
            dir="ltr">
            <div class="QuickViewstyle__ProductPreview-sc-28ycgw-2 fMlFIC">
              <div class="react-multi-carousel-list carousel-with-custom-dots ">

                {#if scoops === 1}
                  <img
                    src={`img/${img}`}
                    alt={name}
                    draggable="false"
                    class="product-image"
                    style="min-width: auto; height: auto; position: relative;
                    margin: auto;" />
                {:else if scoops === 2}
                  <img
                    src={`img/${img1}`}
                    alt={name}
                    draggable="false"
                    class="product-image"
                    style="min-width: auto; height: auto; position: relative;
                    margin: auto;" />
                {:else if scoops === 3}
                  <img
                    src={`img/${img2}`}
                    alt={name}
                    draggable="false"
                    class="product-image"
                    style="min-width: auto; height: auto; position: relative;
                    margin: auto;" />
                {:else}
                  <img
                    src={`img/${img3}`}
                    alt={name}
                    draggable="false"
                    class="product-image"
                    style="min-width: auto; height: auto; position: relative;
                    margin: auto;" />
                {/if}

                <ul class="react-multi-carousel-dot-list ">
                  <li
                    data-index="0"
                    class="MultiCarousel__SingleItem-sc-1l8qqrp-0 hkJujT
                    custom-dot custom-dot false">
                    <input
                      id="vista"
                      class="opcion"
                      type="radio"
                      bind:group={scoops}
                      value={1} />
                    <label class="vista-cursor" for="vista">
                      <img
                        src={`img/${img}`}
                        alt={name}
                        draggable="false"
                        style="width: 100%; height: 100%; position: relative;" />
                    </label>
                  </li>
                  <li
                    data-index="1"
                    class="MultiCarousel__SingleItem-sc-1l8qqrp-0 hkJujT
                    custom-dot false">
                    <input
                      id="vista1"
                      class="opcion"
                      type="radio"
                      bind:group={scoops}
                      value={2} />
                    <label class="vista-cursor" for="vista1">
                      <img
                        src={`img/${img1}`}
                        alt={name}
                        draggable="false"
                        style="width: 100%; height: 100%; position: relative;" />
                    </label>
                  </li>
                  <li
                    data-index="2"
                    class="MultiCarousel__SingleItem-sc-1l8qqrp-0 hkJujT
                    custom-dot false">
                    <input
                      id="vista2"
                      class="opcion"
                      type="radio"
                      bind:group={scoops}
                      value={3} />
                    <label class="vista-cursor" for="vista2">
                      <img
                        src={`img/${img2}`}
                        alt={name}
                        draggable="false"
                        style="width: 100%; height: 100%; position: relative;" />
                    </label>
                  </li>
                  <li
                    data-index="3"
                    class="MultiCarousel__SingleItem-sc-1l8qqrp-0 hkJujT
                    custom-dot false">
                    <input
                      id="vista3"
                      class="opcion"
                      type="radio"
                      bind:group={scoops}
                      value={4} />
                    <label class="vista-cursor" for="vista3">
                      <img
                        src={`img/${img3}`}
                        alt={name}
                        draggable="false"
                        style="width: 100%; height: 100%; position: relative;" />
                    </label>
                  </li>
                </ul>

              </div>
              <span class="QuickViewstyle__DiscountPercent-sc-28ycgw-4 jweBTn">
                {oferta}
              </span>
            </div>
            <div
              dir="ltr"
              class="QuickViewstyle__ProductInfoWrapper-sc-28ycgw-5 DNQhx">
              <div class="QuickViewstyle__ProductInfo-sc-28ycgw-6 hJAUJy">
                <div
                  class="QuickViewstyle__ProductTitlePriceWrapper-sc-28ycgw-7
                  kzoayf">
                  <h1 class="QuickViewstyle__ProductTitle-sc-28ycgw-8 mqzOv">
                    {name}
                  </h1>
                  <div
                    class="QuickViewstyle__ProductPriceWrapper-sc-28ycgw-9
                    fbUCfN">
                    <span class="QuickViewstyle__SalePrice-sc-28ycgw-11 hVvfEF">
                      s/{precioantes}.00
                    </span>
                    <div
                      class="QuickViewstyle__ProductPrice-sc-28ycgw-10 cqZYhV">
                      S/{precio}.00
                    </div>
                  </div>
                </div>
                <div class="QuickViewstyle__ProductWeight-sc-28ycgw-12 btDBfe">
                  {marca}
                </div>
                <p
                  class="QuickViewstyle__ProductDescription-sc-28ycgw-13 OLDqC">
                  {descripcion}
                </p>

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
                    <span
                      class="Counterstyle__CounterValue-sc-14ahato-2 dMHyRK">
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
                  <button
                    on:click={addToCart}
                    class="button-general button-card .cart-button ">

                    <span class="button-icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14.4"
                        height="12"
                        viewBox="0 0 14.4 12">
                        <g
                          data-name="Group 120"
                          transform="translate(-288 -413.89)">
                          <path
                            data-name="Path 154"
                            fill="currentColor"
                            d={svg} />
                        </g>
                      </svg>
                    </span>
                    <!-- <span class="btn-tex">Card</span> -->
                  </button>
                {/if}

                <div class="QuickViewstyle__ProductMeta-sc-28ycgw-16 hmqfIE">
                  <div class="QuickViewstyle__MetaSingle-sc-28ycgw-17 CyALc">
                    <span class="QuickViewstyle__MetaItem-sc-28ycgw-18 eLZhSZ">
                      {categoriageneral}
                    </span>
                    <span class="QuickViewstyle__MetaItem-sc-28ycgw-18 eLZhSZ">
                      {categoria}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

{/if}






