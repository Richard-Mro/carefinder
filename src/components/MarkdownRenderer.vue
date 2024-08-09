<template>
  <div ref="editorContainer"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { Editor } from '@toast-ui/editor';

export default defineComponent({
  name: 'MarkdownRenderer',
  props: {
    markdown: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const editorContainer = ref<HTMLDivElement | null>(null);

    onMounted(() => {
      try {
        if (editorContainer.value) {
          new Editor({
            el: editorContainer.value,
            initialEditType: 'markdown',
            previewStyle: 'vertical',
            initialValue: props.markdown,
          });
        }
      } catch (error) {
        console.error('Error initializing Toast UI Editor:', error);
      }
    });

    return {
      editorContainer,
    };
  },
});
</script>
