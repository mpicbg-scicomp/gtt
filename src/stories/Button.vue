<template>
    <button class="normal" :rounded="rounded" v-bind:class="{ rounded: rounded }" :disabled="disabled" @click="callback($event)">
        <slot></slot>
    </button>
</template>

<script>
 export default {
   props: {
     disabled: Boolean,
     rounded: Boolean,
   },
   methods: {
     callback(e) {
       this.$emit('click', e);
     },
   },
 };
</script>

<style>
    button {
        color: rgb(66, 185, 131);
        border-color: rgb(66, 185, 131);
        border: 3px solid;
        border-top-color: currentcolor;
        border-right-color: currentcolor;
        border-bottom-color: currentcolor;
        border-left-color: currentcolor;
        padding: 10px 20px;
        background-color: white;
        outline: none;
    }

    .rounded {
        border-radius: 5px;
    }
</style>