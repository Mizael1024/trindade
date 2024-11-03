<template>
    <div class="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
                <button @click="toggleAudioPlayback"
                    class="p-2 bg-black dark:bg-white rounded-full shadow-sm hover:bg-gray-900 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500">
                    <Play v-if="!isPlaying" class="w-6 h-6 text-white dark:text-gray-900" />
                    <Pause v-else class="w-6 h-6 text-white dark:text-gray-900" />
                </button>
                <div>
                    <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Generated Audio</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatTime(currentTime) }} / {{
                        formatTime(duration) }}</p>
                </div>
            </div>
            <div class="flex items-center space-x-2">
                <button @click="downloadAudio"
                    class="p-2 bg-gray-200 dark:bg-gray-700 rounded-full shadow-sm hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500">
                    <Download class="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
                <button @click="deleteAudio"
                    class="p-2 bg-gray-200 dark:bg-gray-700 rounded-full shadow-sm hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500">
                    <Trash2 class="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
            </div>
        </div>
        <input type="range" min="0" :max="duration" v-model="currentTime" @input="seekAudio"
            class="w-full mt-4 accent-black dark:accent-white" />
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { Play, Pause, Download, Trash2 } from 'lucide-vue-next'

const props = defineProps({
    audioSrc: {
        type: String,
        required: true
    }
})

const emit = defineEmits(['delete'])

const audio = ref(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)

const toggleAudioPlayback = () => {
    if (!audio.value) return

    if (isPlaying.value) {
        audio.value.pause()
    } else {
        audio.value.play()
    }
    isPlaying.value = !isPlaying.value
}

const seekAudio = () => {
    if (!audio.value) return
    audio.value.currentTime = currentTime.value
}

const downloadAudio = () => {
    if (!audio.value) return
    const a = document.createElement('a')
    a.href = audio.value.src
    a.download = 'generated_speech.mp3'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
}

const deleteAudio = () => {
    if (audio.value) {
        audio.value.pause()
        audio.value = null
    }
    emit('delete')
}

const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

watch(() => props.audioSrc, (newSrc) => {
    if (newSrc) {
        audio.value = new Audio(newSrc)
        audio.value.addEventListener('loadedmetadata', () => {
            duration.value = audio.value.duration
        })
        audio.value.addEventListener('timeupdate', () => {
            currentTime.value = audio.value.currentTime
        })
        audio.value.addEventListener('ended', () => {
            isPlaying.value = false
            currentTime.value = 0 // Reinicia o tempo atual para o início
        })
    }
})

onMounted(() => {
    if (props.audioSrc) {
        audio.value = new Audio(props.audioSrc)
        audio.value.addEventListener('loadedmetadata', () => {
            duration.value = audio.value.duration
        })
        audio.value.addEventListener('timeupdate', () => {
            currentTime.value = audio.value.currentTime
        })
        audio.value.addEventListener('ended', () => {
            isPlaying.value = false
            currentTime.value = 0 // Reinicia o tempo atual para o início
        })
    }
})

onUnmounted(() => {
    if (audio.value) {
        audio.value.pause()
        audio.value = null
    }
})
</script>

<style scoped>
/* Estilos personalizados para o input range no modo escuro */
.dark input[type="range"]::-webkit-slider-thumb {
    background: white;
}

.dark input[type="range"]::-moz-range-thumb {
    background: white;
}

.dark input[type="range"]::-ms-thumb {
    background: white;
}
</style>
