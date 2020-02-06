<template>
  <vue-tags-input
    v-model="labelTag"
    :tags="value"
    :autocomplete-items="filteredItems"
    :add-only-from-autocomplete="true"
    @tags-changed="newTags => updateValue(newTags)"
  />
</template>

<script lang="ts">
import Vue from 'vue';

import VueTagsInput from '@johmun/vue-tags-input';

export default Vue.extend({
  name: 'TagsInput',
  components: {
    VueTagsInput,
  },
  props: {
    value: { required: true },
    autocompleteItems: { type: Array as () => Array<any>, required: true },
  },
  methods: {
    updateValue: function update(value) {
      this.$emit('input', value);
    },
  },
  data() {
    return {
      labelTag: '',
    };
  },
  computed: {
    filteredItems(): any[] {
      if (this.autocompleteItems && this.autocompleteItems.length > 1) {
        return this.autocompleteItems.filter(i => i.text.toLowerCase().indexOf(this.labelTag.toLowerCase()) !== -1);
      }

      throw new Error('Cannot connect to the server');
    },
  },
});
</script>
