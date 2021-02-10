<script lang="typescript">
  import { onDestroy, onMount } from "svelte";
  import { DogecoinService } from "../services/DogecoinService";
  import Chart from "chart.js";
  import { isString } from "lodash";
  import dayjs from "dayjs";
  import Wallets from "./Wallets.svelte";

  let price: any;
  let changeInPrice: any;
  let changeInPercentage: any;
  let canvas: any;
  let hasError = false;
  let priceMode = DogecoinService.priceModes.flat;
  let dogecoinChart: Chart;

  const APICallTimeout = 60 * 1000;

  const APICallInterval = setInterval(async () => {
    await updatePrice();
    await updateChart();
  }, APICallTimeout);

  async function updatePrice() {
    const result = await DogecoinService.getPrice();
    if (result.error) {
      console.error(result.error);
      hasError = true;
    } else if (result.price != null) {
      price = result.price;
      changeInPrice = result.changeInPrice;
      changeInPercentage = result.changeInPercentage;
      hasError = false;
      if (isString(changeInPrice)) {
        if (changeInPrice.startsWith("+")) {
          priceMode = DogecoinService.priceModes.up;
        } else if (changeInPrice.startsWith("-")) {
          priceMode = DogecoinService.priceModes.down;
        } else {
          priceMode = DogecoinService.priceModes.flat;
        }
      }
    }
  }

  onMount(async () => {
    await updatePrice();
    await buildChart();
  });

  onDestroy(() => {
    clearInterval(APICallInterval);
  });

  async function buildChart() {
    // @ts-ignore
    const ctx = canvas.getContext("2d");
    const data = await buildChartData();
    dogecoinChart = new Chart(ctx, {
      type: "line",
      data,
      options: {
        legend: {
          display: false,
        },
        title: {
          display: false,
        },
        scales: {
          xAxes: [
            {
              gridLines: {
                display: false,
              },
              ticks: {
                display: false,
              },
            },
          ],
          yAxes: [
            {
              gridLines: {
                // display: false,
              },
            },
          ],
        },
      },
    });
  }

  async function buildChartData(): Promise<Chart.ChartData> {
    const historicalData = await DogecoinService.getHistoricalData();
    let color = "#43a047";
    if (isString(changeInPrice) && changeInPrice.startsWith("-")) {
      color = "#e53935";
    }
    const data: Chart.ChartData = {
      labels: [...historicalData.labels, dayjs().format("MMM DD YYYY")],
      datasets: [
        {
          label: "$",
          data: [...historicalData.prices, +price],
          borderColor: color,
          fill: false,
          pointRadius: 2,
          borderWidth: 2,
        },
      ],
    };

    return data;
  }

  async function updateChart() {
    if (dogecoinChart != null) {
      const data = await buildChartData();
      dogecoinChart.data = data;
      dogecoinChart.update({ duration: 0 });
    }
  }
</script>

<main class="dogecoin__main-container">
  <div class="dogecoin__header">
    <img
      src="https://www.okchanger.com/cryptocurrency/preview-file/1712"
      width="300"
      alt="Dogecoin VS Code"
      class="dogecoin__icon"
    />
    <h1 class="dogecoin__name">Dogecoin</h1>
  </div>
  <div class="dogecoin__detail">
    <div class="dogecoin__price">
      {#if price != null}
        <h2 class={`dogecoin__${priceMode}`}>$ {price}</h2>
      {:else if hasError}
        <p>There was an error while loading the Dogecoin price</p>
      {:else}
        <p>Loading...</p>
      {/if}
    </div>
    <div class="dogecoin__price-change">
      {#if changeInPrice && changeInPercentage}
        <h3 class={`dogecoin__${priceMode}`}>
          {changeInPrice} ({changeInPercentage}%)
        </h3>
      {/if}
    </div>
  </div>
  <div class="dogecoin__chart-container">
    <canvas bind:this={canvas} width="400" height="200" />
  </div>

  <Wallets {price} />
</main>

<style>
  .dogecoin__main-container {
    max-width: 500px;
    width: 100%;
    margin: 0 auto;
    padding: 15px 0;
  }

  .dogecoin__header {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
  .dogecoin__icon {
    width: 35px;
    height: 35px;
  }

  .dogecoin__name {
    margin: 0 0 0 10px;
    font-size: medium;
  }
  .dogecoin__detail {
  }

  .dogecoin__price {
    margin-top: 10px;
    text-align: center;
    font-size: large;
  }

  .dogecoin__price-change {
    margin-top: 10px;
    text-align: center;
    font-size: medium;
  }

  .dogecoin__chart-container {
    margin-top: 30px;
  }

  .dogecoin__up {
    color: #43a047;
  }

  .dogecoin__down {
    color: #e53935;
  }
</style>
