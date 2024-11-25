<template>
  <div>
    <TtsFastApi />
  </div>
</template>

<script setup>
import TtsFastApi from '~/components/speech/tts-fast-api.vue'

// Define o middleware de autenticação
definePageMeta({
  middleware: ['auth'],
  layout: 'dashboard'
})
</script>
