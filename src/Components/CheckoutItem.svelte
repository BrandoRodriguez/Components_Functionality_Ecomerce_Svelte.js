<script>
  import { cart } from "../stores/stores.js";
  import { fly } from "svelte/transition";

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
  $: doubled = count * precio;

  const countButtonHandler = e => {
    if (e.target.classList.contains("add")) {
      count++;
    } else if (count >= 1) {
      count--;
    }
    cart.update(n => ({ ...n, [name]: { ...n[name], count } }));
  };

  const removeItem = () => {
    cart.update(n => {
      delete n[name];
      return n;
    });
  };
</script>

<style>
  button {
    font-family: Lato, sans-serif;
    margin: 0px;
  }

  /*  */
  .CartItemCardstyle__ItemWrapper-xuzuaf-4 {
    max-height: calc(100vh - 245px);
    background-color: rgb(255, 255, 255);
  }
  .cEAUrG {
    font-size: 14px;
    font-weight: 700;
    padding-top: 30px;
    padding-bottom: 20px;
    padding-left: 15px;
    padding-right: 25px;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    border-bottom: 1px solid rgb(247, 247, 247);
  }
  .eIGyji {
    display: flex;
    font-size: 15px;
    font-weight: 700;
    -webkit-box-pack: justify;
    justify-content: space-between;
    -webkit-box-align: center;
    align-items: center;
    flex-shrink: 0;
    width: 30px;
    height: 90px;
    flex-direction: column-reverse;
    background-color: rgb(247, 247, 247);
    color: rgb(13, 17, 54);
    border-radius: 200px;
    overflow: hidden;
  }
  .bIQMmh {
    background-color: transparent;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    height: 100%;
    cursor: pointer;
    color: rgb(119, 121, 140);
    border-width: initial;
    border-style: none;
    border-color: initial;
    border-image: initial;
    padding: 10px;
    -webkit-appearance: media-sliderthumb;
  }
  .dMHyRK {
    pointer-events: none;
  }
  .bIQMmh {
    background-color: transparent;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    height: 100%;
    cursor: pointer;
    color: rgb(119, 121, 140);
    border-width: initial;
    border-style: none;
    border-color: initial;
    border-image: initial;
    padding: 10px;
    -webkit-appearance: media-sliderthumb;
  }
  .fVHYzs {
    width: 60px;
    height: 60px;
    object-fit: cover;
    margin: 0px 15px;
  }
  .QZGNI {
    display: flex;
    flex-direction: column;
    margin-left: 15px;
  }
  .iUpewi {
    font-weight: 400;
    color: rgb(13, 17, 54);
    margin-bottom: 0px;
    line-height: 1.5;
  }
  .effwGm {
    color: rgb(0, 158, 127);
    margin-top: 10px;
    margin-bottom: 10px;
  }
  .cYyRFl {
    font-size: 13px;
    font-weight: 400;
    color: rgb(119, 121, 140);
    margin-bottom: 5px;
  }
  .cLjIxt {
    color: rgb(13, 17, 54);
    margin-left: auto;
  }
  .dByUKe {
    margin-left: 15px;
    cursor: pointer;
    color: rgba(0, 0, 0, 0.25);
    background-color: transparent;
    padding: 5px;
    border-width: 0px;
    border-style: initial;
    border-color: initial;
    border-image: initial;
    outline: 0px;
    transition: all 0.4s ease 0s;
  }
</style>

<div 
  style="position: relative; overflow: hidden; width: 100%; height: auto;
  min-height: 0px; max-height: 100vh; border-bottom: 1px solid rgb(247, 247,
  247); font-family: Lato, sans-serif;">
  <div
    style="position: relative; overflow: scroll; margin-right: -17px;
    margin-bottom: -17px; min-height: 17px; max-height: calc(100vh + 17px);
    margin-left: 0px;">
    <div class="CartItemCardstyle__ItemWrapper-xuzuaf-4 bpIPBu items-wrapper">
      <div class="CartItemstyle__ItemBox-sc-1otw30s-0 cEAUrG">
        <div class="Counterstyle__CounterBox-sc-14ahato-0 eIGyji">
          <button
            on:click={countButtonHandler}
            class="Counterstyle__CounterButton-sc-14ahato-1 bIQMmh">
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
            {count}
          </span>
          <button
            on:click={countButtonHandler}
            class=" add Counterstyle__CounterButton-sc-14ahato-1 bIQMmh">
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
        <img
          class="CartItemstyle__Image-sc-1otw30s-2 fVHYzs"
          src={`img/${img}`}
          alt={name} />
        <div class="CartItemstyle__Information-sc-1otw30s-1 QZGNI">
          <span class="CartItemstyle__Name-sc-1otw30s-3 iUpewi">{name}</span>
          <span class="CartItemstyle__Price-sc-1otw30s-4 effwGm">
            S/.{precio}.00
          </span>
          <span class="CartItemstyle__Weight-sc-1otw30s-5 cYyRFl">
            {marca}
          </span>
        </div>
        <span class="CartItemstyle__Total-sc-1otw30s-6 cLjIxt">
          S./{doubled}
        </span>
        <button
          on:click={removeItem}
          class="CartItemstyle__RemoveButton-sc-1otw30s-7 dByUKe">
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
      </div>
    </div>
  </div>
  <div
    style="position: absolute; height: 6px; transition: opacity 200ms ease 0s;
    opacity: 0; right: 2px; bottom: 2px; left: 2px; border-radius: 3px;">
    <div
      style="position: relative; display: block; height: 100%; cursor: pointer;
      border-radius: inherit; background-color: rgba(0, 0, 0, 0.2); width: 0px;" />
  </div>
  <div
    style="position: absolute; width: 6px; transition: opacity 200ms ease 0s;
    opacity: 0; right: 2px; bottom: 2px; top: 2px; border-radius: 3px;">
    <div
      style="position: relative; display: block; width: 100%; cursor: pointer;
      border-radius: inherit; background-color: rgba(0, 0, 0, 0.2); height: 0px;" />
  </div>
</div>
