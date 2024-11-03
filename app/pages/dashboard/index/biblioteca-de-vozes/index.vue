<template>
    <div class="min-h-screen bg-voice-library">
        <!-- Componente original -->
        <VoiceLibrary />
    </div>
</template>

<script setup>
import VoiceLibrary from '~/components/speech/voice-library.vue'
definePageMeta({
    middleware: ['auth']
})
</script>

<style>
.bg-voice-library {
    background-color: #f5f5f5;
}

:root.dark .bg-voice-library {
    background-color: rgb(18, 18, 18);
}
</style>
