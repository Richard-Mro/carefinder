<template>
  <div ref="editorContainer"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { Editor } from '@toast-ui/editor'

export default defineComponent({
  name: 'MarkdownRenderer',
  props: {
    markdown: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const editorContainer = ref<HTMLDivElement | null>(null)

    onMounted(() => {
      if (editorContainer.value) {
        new Editor({
          el: editorContainer.value,
          initialEditType: 'markdown',
          previewStyle: 'vertical',
          initialValue: props.markdown
        })
      }
    })

    return {
      editorContainer
    }
  }
})
</script>
