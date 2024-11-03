<template>
    <ClientOnly>
      <VoiceClone />
    </ClientOnly>
  </template>
  
  <script setup>
  import VoiceClone from '~/components/speech/voice-clone.vue'
  
  definePageMeta({
    middleware: ['auth'],
    keepalive: true
  })
  </script>
  
  