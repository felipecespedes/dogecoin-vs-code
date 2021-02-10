<script lang="typescript">
  import { onDestroy, onMount } from "svelte";
  import type { Wallet } from "../models/Wallet";
  import { DogecoinService } from "../services/DogecoinService";
  import Fa from "svelte-fa";
  import {
    faWallet,
    faCheck,
    faTimes,
    faTrash,
    // faCopy,
  } from "@fortawesome/free-solid-svg-icons";
  import ButtonWithConfirmation from "./ButtonWithConfirmation.svelte";

  export let price: string;

  let isAddingWallet = false;
  let isLoading = false;
  let error: string | null = null;
  let wallets: Wallet[] = [];
  let newWalletAddress = "";
  const maxWallets = 3;

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
    if (wallets.length >= maxWallets) {
      return;
    }

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
    error = null;
  }

  function cancelFlowToAddWalletAddress() {
    isAddingWallet = false;
    newWalletAddress = "";
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
        initializeWalletAddresses(event.data.payload.walletAddresses);
        break;
      default:
        break;
    }
  }

  function calculateUSDPrice(dogecoin: string, usd: string): string {
    return DogecoinService.dogecoinToUSD(dogecoin, usd);
  }

  function requireFocus(el: any) {
    el.focus();
  }

  function removeWalletAddress(address: string) {
    const newWallets = wallets.filter((o) => o.address !== address);
    wallets = [...newWallets];
    tsvscode.postMessage({
      type: "update-wallet-addresses",
      walletAddresses: newWallets,
    });
  }
</script>

<div class="wallets">
  {#if !isAddingWallet && wallets.length < maxWallets}
    <div class="wallets__add-button-container">
      <button
        on:click={startFlowToAddWalletAddress}
        title="Add wallet address"
        class="wallets__action-button"
      >
        <Fa icon={faWallet} size="1x" />
      </button>
    </div>
  {:else if isAddingWallet && !isLoading}
    <div class="wallets__add-container">
      <input
        type="text"
        placeholder="Enter wallet address"
        class="wallets__address-input"
        bind:value={newWalletAddress}
        on:keypress={e => e.key === 'Enter' && addWallet()}
        use:requireFocus
      />
      {#if error !== null}
        <span class="wallet__error">{error}</span>
      {/if}
      <div class="wallets__action-buttons-container">
        <button
          on:click={addWallet}
          class="wallets__action-button wallets__action-button--confirm"
          title="Confirm"
        >
          <Fa icon={faCheck} size="1x" />
        </button>
        <button
          on:click={cancelFlowToAddWalletAddress}
          class="wallets__action-button wallets__action-button--cancel"
          title="Cancel"
        >
          <Fa icon={faTimes} size="1x" />
        </button>
      </div>
    </div>
  {:else if isLoading}
    <p>Validating...</p>
  {/if}
  <ul class="wallets__list">
    {#each wallets as wallet}
      <li class="wallets__wallet">
        {#if wallet.balance == null}
          <p>Loading balance...</p>
        {:else}
          <div class="wallets__balance-container">
            <p class="wallets__balance">DOGE: {wallet.balance}</p>
            <div class="wallets__price-container">
              <p class="wallets__price">
                $ {calculateUSDPrice(wallet.balance, price)}
              </p>
            </div>
          </div>
          <div class="wallets__address-container">
            <p class="wallets__address">{wallet.address}</p>
            <ButtonWithConfirmation
              icon={faTrash}
              title="Remove wallet address"
              confirmationHandler={() => removeWalletAddress(wallet.address)}
            />
          </div>
        {/if}
      </li>
    {/each}
  </ul>
</div>

<style>
  .wallets {
    margin-top: 20px;
  }
  .wallets__wallet {
    list-style: none;
    border-top: 1px solid #555;
    padding: 15px 0;
  }

  .wallets__address-input {
    margin: 0 0 5px;
  }

  .wallet__error {
    color: #e53935;
    margin-bottom: 5px;
  }

  .wallets__action-button {
    width: 35px;
  }

  .wallets__action-button--confirm {
    margin-right: 5px;
  }

  .wallets__add-button-container {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
  }

  .wallets__add-container {
    display: flex;
    flex-direction: column;
  }

  .wallets__action-buttons-container {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
  }

  .wallets__list {
    margin-top: 20px;
    padding-left: 0;
  }

  .wallets__balance-container {
    display: flex;
    flex-direction: column;
  }

  .wallets__balance {
    font-size: medium;
  }

  .wallets__price {
    font-size: small;
    margin: 5px 0;
  }

  .wallets__change {
    font-size: small;
  }

  .wallets__address-container {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .wallets__address {
    flex: 1;
    font-size: small;
  }
</style>
