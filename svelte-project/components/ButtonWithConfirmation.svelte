<script lang="typescript">
  import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
  import Fa from "svelte-fa";

  export let icon: any;
  export let title: any;
  export let confirmationHandler = () => {};

  let isConfirming = false;

  function startConfirmationFlow() {
    isConfirming = true;
  }

  function handleConfirmation() {
    confirmationHandler();
    isConfirming = false;
  }

  function handleCancelation() {
    isConfirming = false;
  }
</script>

<div class="button-with-confirmation">
  {#if !isConfirming}
    <button
      class="button-with-confirmation__action-button"
      {title}
      on:click={startConfirmationFlow}
    >
      <Fa {icon} size="1x" />
    </button>
  {:else}
    <button
      class="button-with-confirmation__action-button button-with-confirmation__action-button--confirm"
      title="Confirm"
      on:click={handleConfirmation}
    >
      <Fa icon={faCheck} size="1x" />
    </button>
    <button
      class="button-with-confirmation__action-button button-with-confirmation__action-button--cancel"
      title="Cancel"
      on:click={handleCancelation}
    >
      <Fa icon={faTimes} size="1x" />
    </button>
  {/if}
</div>

<style>
  .button-with-confirmation {
    display: flex;
    flex-direction: row;
  }

  .button-with-confirmation__action-button {
    width: 35px;
  }

  .button-with-confirmation__action-button--confirm {
    margin-right: 5px;
  }
</style>
