<style>
  /* --------- Card Animation ---------- */
  .card:not(:empty):hover,
  .card:not(:empty):focus {
    z-index: 1;
    color: #fff;
    background: #ea124f;
    opacity: 1;
    /* -webkit-transform: scale(1.15) rotateZ(20deg); */
    /* transform: scale(1.15) rotateZ(20deg); */
    cursor: pointer;
  }
  .card:not(:empty):hover:after,
  .card:not(:empty):focus:after {
    opacity: 1;
  }
  .card:not(:empty):hover:before,
  .card:not(:empty):focus:before {
    opacity: 0;
  }

  .card {
    background: #fcc99e;
    border-radius: 0.7em;
    display: -webkit-box;
    display: flex;
    -webkit-box-pack: start;
    justify-content: flex-start;
    -webkit-box-align: end;
    align-items: flex-end;
    -webkit-transition: all 0.4s cubic-bezier(0.33, 1, 0.68, 1);
    transition: all 0.4s cubic-bezier(0.33, 1, 0.68, 1);
    -webkit-transition-property: background, color, opacity, -webkit-transform;
    transition-property: background, color, opacity, -webkit-transform;
    transition-property: background, transform, color, opacity;
    transition-property: background, transform, color, opacity,
      -webkit-transform;
  }
  /* .card:not(:empty):before {
  box-shadow: -2px 2px 8px 2px rgba(0, 0, 0, 0.2);
} */
  .card:empty {
    opacity: 0.3;
  }
  .card:before,
  .card:after {
    content: "";
    position: absolute;
    border-radius: 0.7em;
    z-index: -1;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    -webkit-transition: opacity 0.4s cubic-bezier(0.33, 1, 0.68, 1);
    transition: opacity 0.4s cubic-bezier(0.33, 1, 0.68, 1);
  }
  .card:after {
    box-shadow: -5px 5px 12px 6px rgba(0, 0, 0, 0.1);
    opacity: 0;
  }

  /* --------- Grid ---------- */
  .grid {
    width: 100%;
    height: 100%;
    display: grid;
    overflow: hidden;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(4, 1fr);
    grid-gap: 20px;
    padding-left: 100px;
    padding-right: 100px;
    margin-top: 100px;
  }

  @media (max-width: 360px) {
    .grid {
      width: 100%;
      height: 100%;
      padding: 10px;
      display: grid;
      overflow: hidden;
      grid-template-columns: repeat(5, 1fr);
      grid-template-rows: repeat(4, 1fr);
      grid-gap: 10px;
    }
  }
  .item1 {
    grid-area: 1 / 1 / 3 / 3;
  }

  .item2 {
    grid-area: 3 / 3 / 4 / 4;
  }
  .item2.card:hover,
  .item2.card:focus {
    background: #00005c;
  }

  .item3 {
    grid-area: 4 / 1 / 5 / 4;
  }

  .item4 {
    grid-area: 1 / 3 / 2 / 5;
  }

  .item5 {
    grid-area: 2 / 4 / 3 / 5;
  }

  .item6 {
    grid-area: 3 / 4 / 4 / 5;
  }

  .item7 {
    grid-area: 3 / 4 / 5 / 5;
  }

  .item8 {
    grid-area: 1 / 5 / 2 / 6;
  }
  .item8.card:hover,
  .item8.card:focus {
    background: #f57b51;
  }

  .item9 {
    grid-area: 2 / 5 / 3 / 6;
  }

  .item10 {
    grid-area: 3 / 5 / 4 / 6;
  }

  .item11 {
    grid-area: 4 / 5 / 5 / 6;
  }
  .item11.card:hover,
  .item11.card:focus {
    background: #00a8cc;
  }

  .content {
    display: -webkit-box;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    flex-direction: column;
    -webkit-box-pack: center;
    justify-content: center;
  }

  /*--------- Layout -------- */
  *,
  *:before,
  *:after {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
  }

  body,
  html {
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: "PT Sans", sans-serif;
    background: #fff6d9;
    display: -webkit-box;
    display: flex;
    -webkit-box-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    align-items: center;
  }

  h1,
  h2,
  h3,
  h4,
  h5 {
    margin: 2.75rem 0 1.05rem;
    line-height: 1.2;
    font-family: "Jost", sans-serif;
  }

  h1 {
    margin-top: 0;
    font-size: 3.052em;
  }
  @media (max-width: 360px) {
    h1 {
      margin-top: 0;
      font-size: 15px;
    }
  }

  h2 {
    font-size: 1em;
  }

  p {
    line-height: 1.3;
  }

  /* --------- Responsive ---------- */
  @media only screen and (max-width: 600px) {
    .grid {
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(6, minmax(auto, 150px));
      overflow-y: scroll;
    }

    .item1 {
      grid-area: 1 / 1 / 2 / 3;
    }

    .card {
      grid-area: auto;
      text-align: left;
    }
    .card:empty {
      display: none;
    }
  }

  @media (max-width: 600px) {
    .item4 {
      grid-area: 2 / 1 / 2 / 3;
    }
  }

  .letra {
    font-family: Poppins, sans-serif;
    font-size: 45px;
    font-weight: 700;
    color: rgb(13, 17, 54);
    margin-bottom: 15px;
    text-align: center;
  }
  .sup {
    font-family: Lato, sans-serif;
    font-size: 19px;
    font-weight: 400;
    color: rgb(119, 121, 140);
    margin-bottom: 60px;
    text-align: center;
  }
  @media (max-width: 360px) {
    .cerrar{
      display: none;
    }
  }
   @media (max-width: 375px) {
    .cerrar{
      display: none;
    }
  }
    @media (max-width: 411px) {
    .cerrar{
      display: none;
    }
  }
</style>

<main class="grid cerrar">
  <section class="content item1 ">
    <!-- <h1 class="letra">Abarrotes entregados en 90 minutos</h1> -->
    

  </section>
  <section class="card item2">
    <img
      src="https://promart.vteximg.com.br/arquivos/dv-destacado-coronahome-14052020-40-v2.png"
      alt="" />
  </section>
  <section class="card item3">
    <img src="" alt="" />
  </section>
  <section class="card item4">

  </section>
  <section class="card item5">
    <img
      src="https://promart.vteximg.com.br/arquivos/dv-destacado-coronahome-14052020-44.png"
      alt="" />
  </section>
  <section class="card item7" />
  <section class="card item8">
    <img
      src="https://promart.vteximg.com.br/arquivos/dv-destacado-coronahome-14052020-16.png"
      alt="" />
  </section>
  <section class="card item9">
    <img
      src="https://promart.vteximg.com.br/arquivos/dv-destacado-coronahome-14052020-18.png"
      alt="" />
  </section>
  <section class="card item10">
    <img
      src="https://promart.vteximg.com.br/arquivos/dv-destacado-coronahome-14052020-51.png"
      alt="" />
  </section>
  <section class="card item11">
    <img
      src="https://promart.vteximg.com.br/arquivos/dv-destacado-coronahome-14052020-67.png"
      alt="" />
  </section>
</main>
