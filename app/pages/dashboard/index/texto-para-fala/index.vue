<template>
    <TextToSpeech />
</template>

<script setup>
import TextToSpeech from '~/components/speech/tts.vue'

definePageMeta({
    middleware: ['auth']
})
</script>
