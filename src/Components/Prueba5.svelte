<script>
  import items from "../items.js";
  import Card from "./Card.svelte";

  // let prefix = "";

  // let name = "";
  // let marca = "";
  // let img = "";
  // let i = 0;

  // $: filtereditems = prefix
  //   ? items.filter(item => {
  //       const name = `${item.name}, ${item.marca}, ${item.img}`;
  //       return name.toLowerCase().startsWith(prefix.toLowerCase());
  //     })
  //   : items;



console.log(items)
</script>

<style>
 

</style>

<!-- https://eugenkiss.github.io/7guis/tasks#crud -->
<!-- <input placeholder="filter prefix" bind:value={prefix} /> -->


  {#each items as item}
  <div class="items js-itemsrb -scll">


    <div class="detalle">
      <h3 class="productName">{item.tipo}</h3>

    </div>
  </div>
  {/each}
