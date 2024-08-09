<template>
  <div ref="editorContainer" class="editor-container"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue';
import '@toast-ui/editor/dist/toastui-editor.css';
import { Editor } from '@toast-ui/editor';

export default defineComponent({
  name: 'MarkdownEditor',
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const editorContainer = ref<HTMLDivElement | null>(null);
    let editor: Editor | null = null;

    onMounted(() => {
      if (editorContainer.value) {
        editor = new Editor({
          el: editorContainer.value,
          height: '500px',
          initialEditType: 'markdown',
          previewStyle: 'vertical',
          initialValue: props.modelValue
        });

        editor.on('change', () => {
          emit('update:modelValue', editor?.getMarkdown());
        });
      }
    });

    watch(
      () => props.modelValue,
      (newValue) => {
        if (editor && editor.getMarkdown() !== newValue) {
          editor.setMarkdown(newValue);
        }
      },
      { immediate: true }
    );

    return {
      editorContainer
    };
  }
});
</script>

<style>
.editor-container {
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
