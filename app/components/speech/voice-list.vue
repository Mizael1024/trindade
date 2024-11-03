<template>
    <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden h-full flex flex-col">
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Minhas Vozes</h3>
        </div>

        <!-- Mensagem quando não há vozes favoritadas -->
        <div v-if="!voices.length" class="flex-grow flex flex-col items-center justify-center p-6 text-center">
            <div class="mb-4">
                <svg class="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z">
                    </path>
                </svg>
            </div>
            <p class="text-gray-600 dark:text-gray-400 mb-2">
                Você ainda não tem vozes favoritadas
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-500 mb-4">
                Visite nossa biblioteca de vozes para escolher suas favoritas
            </p>
            <a href="/dashboard/biblioteca-de-vozes"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Explorar Biblioteca de Vozes
            </a>
        </div>

        <!-- Lista de vozes favoritadas -->
        <div v-else class="overflow-y-auto flex-grow p-4 space-y-3" style="max-height: 420px;">
            <div v-for="voice in voices" :key="voice.id" @click="$emit('select-voice', voice)" class="flex items-center p-3 rounded-xl cursor-pointer
                  transition-colors duration-200
                  hover:bg-gray-50 dark:hover:bg-gray-700 group"
                :class="{ 'bg-gray-50 dark:bg-gray-700': selectedVoice?.elevenLabsId === voice.elevenLabsId }">
                <div class="relative">
                    <div class="h-14 w-14 rounded-full shadow-md overflow-hidden">
                        <img :src="voice.profileUrl" :alt="voice.name || 'Voz'" class="h-full w-full object-cover" />
                    </div>
                    <div class="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center
                      opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        @click.stop="playVoiceSample(voice)">
                        <Play v-if="!playingVoiceId || playingVoiceId !== voice.elevenLabsId"
                            class="w-5 h-5 text-white" />
                        <Pause v-else class="w-5 h-5 text-white" />
                    </div>
                </div>
                <div class="ml-4 flex-1">
                    <p class="text-base font-medium text-gray-900 dark:text-white mb-0.5">{{ voice.name }}</p>
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-gray-500 dark:text-gray-400">
                            {{ voice.language === 'pt-BR' ? 'Português' : 'Inglês' }}
                        </span>
                        <span class="text-xs text-gray-500 dark:text-gray-400">
                            {{ voice.gender === 'male' ? 'Homem' : 'Mulher' }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Play, Pause } from 'lucide-vue-next'
import { ref, onBeforeUnmount } from 'vue'

const audioRef = ref<HTMLAudioElement | null>(null)
const playingVoiceId = ref<string | null>(null)

const props = defineProps<{
    voices: any[]
    selectedVoice: any
    isPlaying: boolean
    playingVoice: string | null
}>()

const emit = defineEmits<{
    'select-voice': [voice: any]
    'preview-voice': [voice: any]
}>()

const playVoiceSample = async (voice: any) => {
    try {
        if (playingVoiceId.value === voice.elevenLabsId && audioRef.value) {
            audioRef.value.pause()
            playingVoiceId.value = null
            return
        }

        if (audioRef.value) {
            audioRef.value.pause()
        }

        if (!voice?.previewUrl) {
            throw new Error('URL de amostra não disponível')
        }

        const audio = new Audio(voice.previewUrl)
        audioRef.value = audio
        await audio.play()
        playingVoiceId.value = voice.elevenLabsId

        audio.onended = () => {
            playingVoiceId.value = null
        }
    } catch (error) {
        console.error('Erro ao reproduzir amostra de voz:', error)
        playingVoiceId.value = null
    }
}

onBeforeUnmount(() => {
    if (audioRef.value) {
        audioRef.value.pause()
        audioRef.value = null
    }
})
</script>

<style scoped>
.overflow-y-auto {
    scrollbar-width: thin;
    scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
    width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
    background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 3px;
}
</style>
