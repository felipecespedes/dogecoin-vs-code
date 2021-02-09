<script>
  import { onDestroy, onMount } from "svelte";
  import { DogecoinService } from "../services/DogecoinService";

  let price;
  let changeInPrice;
  let changeInPercentage;
  let hasError = false;
  const APICallTimeout = 5 * 1000;
  const APICallInterval = setInterval(() => {
    updatePrice();
  }, APICallTimeout);

  function updatePrice() {
    DogecoinService.getPrice().then((result) => {
      if (result.error) {
        console.error(result.error);
        hasError = true;
      } else if (result.price != null) {
        price = result.price;
        changeInPrice = result.changeInPrice;
        changeInPercentage = result.changeInPercentage;
        hasError = false;
      }
    });
  }

  onMount(() => {
    updatePrice();
  });

  onDestroy(() => clearInterval(APICallInterval));
</script>

<main>
  <img
    src="https://www.okchanger.com/cryptocurrency/preview-file/1712"
    width="300"
    alt="Dogecoin VS Code"
    class="dogecoin__icon"
  />
  <h1>Dogecoin</h1>
  {#if price != null}
    <h2>$ {price}</h2>
    {#if changeInPrice && changeInPercentage}
      <h3>{changeInPrice} ({changeInPercentage}%)</h3>
    {/if}
  {:else if hasError}
    <p>There was an error while loading the Dogecoin price</p>
  {:else}
    <p>Loading...</p>
  {/if}
</main>

<style>
  .dogecoin__icon {
    margin: 0 auto;
    display: block;
    width: 80px;
    height: 80px;
  }
</style>
