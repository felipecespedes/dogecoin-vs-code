<script lang="typescript">
  import { onDestroy, onMount } from "svelte";
  import type { Wallet } from "../models/Wallet";
  import { DogecoinService } from "../services/DogecoinService";

  let isAddingWallet = false;
  let isLoading = false;
  let hasError = false;
  let error: string | null = null;
  let wallets: Wallet[] = [];
  let newWalletAddress = "";

  onMount(() => {
    window.addEventListener("message", onWindowMessage);
    tsvscode.postMessage({
      type: "get-stored-wallet-addresses",
    });
  });

  onDestroy(() => {
    window.removeEventListener("message", onWindowMessage);
  });

  async function addWallet() {
    isLoading = true;
    const isAlreadyAdded = wallets.find((o) => o.address === newWalletAddress);
    if (!isAlreadyAdded) {
      const isValidAddress = await DogecoinService.isValidAddress(
        newWalletAddress
      );
      if (isValidAddress) {
        const balance = await DogecoinService.getAddressBalance(
          newWalletAddress
        );
        wallets = [...wallets, { address: newWalletAddress, balance: balance }];
        isAddingWallet = false;
        newWalletAddress = "";
        tsvscode.postMessage({
          type: "update-wallet-addresses",
          walletAddresses: wallets.map((o) => o.address),
        });
      } else {
        error = "Please enter a valid Dogecoin wallet address";
      }
    } else {
      error = "Wallet address is already added";
    }
    isLoading = false;
  }

  function startFlowToAddWalletAddress() {
    isAddingWallet = true;
  }

  async function initializeWalletAddresses(walletAddresses: string[]) {
    const newWallets: Wallet[] = [];
    for (let i = 0; i < walletAddresses.length; i++) {
      const address = walletAddresses[i];
      newWallets.push({
        address,
        balance: await DogecoinService.getAddressBalance(address),
      });
    }
    wallets = [...newWallets];
  }

  function onWindowMessage(event: any) {
    switch (event.data?.command) {
      case "return-wallet-addresses":
        console.log(event.data.payload.walletAddresses);
        initializeWalletAddresses(event.data.payload.walletAddresses);
        break;
      default:
        break;
    }
  }
</script>

<div class="wallets">
  <div>
    <button on:click={startFlowToAddWalletAddress}>Add wallet address</button>
  </div>
  {#if isAddingWallet && !isLoading}
    <div class="wallets__add-container">
      <input
        type="text"
        placeholder="Enter wallet address"
        bind:value={newWalletAddress}
      />
      {#if error !== null}
        <span class="wallet__error">{error}</span>
      {/if}
      <button on:click={addWallet}>Add</button>
    </div>
  {:else if isLoading}
    <p>Validating...</p>
  {/if}
  <ul>
    {#each wallets as wallet}
      <li class="wallets__wallet">
        {#if wallet.balance == null}
          <p>Loading balance...</p>
        {:else}
          <div>
            <p>DOGE: {wallet.balance}</p>
            <div>
              <p>$ 1200</p>
              <p>$ +6</p>
            </div>
          </div>
          <div>
            <p>{wallet.address}</p>
            <button>Copy</button>
          </div>
        {/if}
      </li>
    {/each}
  </ul>
</div>

<style>
  .wallets__wallet {
    list-style: none;
  }

  .wallet__error {
    color: crimson;
  }
</style>
