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
    console.log('🎵 Tentando alternar reprodução do áudio')
    console.log('Estado atual do áudio:', {
        audioExists: !!audio.value,
        isPlaying: isPlaying.value,
        currentTime: currentTime.value,
        duration: duration.value
    })

    if (!audio.value) {
        console.warn('❌ Elemento de áudio não encontrado')
        return
    }

    if (isPlaying.value) {
        console.log('⏸️ Pausando áudio')
        audio.value.pause()
    } else {
        console.log('▶️ Iniciando reprodução')
        audio.value.play()
            .then(() => console.log('✅ Reprodução iniciada com sucesso'))
            .catch(error => console.error('❌ Erro ao reproduzir:', error))
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

const play = () => {
    console.log('🎵 Método play chamado externamente')
    if (audio.value) {
        console.log('▶️ Tentando reproduzir áudio')
        audio.value.play()
            .then(() => {
                console.log('✅ Reprodução iniciada com sucesso')
                isPlaying.value = true
            })
            .catch(error => console.error('❌ Erro ao reproduzir:', error))
    } else {
        console.warn('❌ Elemento de áudio não disponível para reprodução')
    }
}

// Exponha o método play para o componente pai
defineExpose({ play })

watch(() => props.audioSrc, async (newSrc, oldSrc) => {
    console.log('🔄 audioSrc alterado:', {
        oldSrc: oldSrc?.substring(0, 50) + '...',
        newSrc: newSrc?.substring(0, 50) + '...'
    })

    try {
        if (audio.value) {
            console.log('⏹️ Limpando áudio anterior')
            audio.value.pause()
            audio.value.remove()
            audio.value = null
        }
        
        if (newSrc) {
            console.log('🆕 Criando novo elemento de áudio')
            audio.value = document.createElement('audio')
            audio.value.crossOrigin = 'anonymous'
            
            audio.value.addEventListener('loadedmetadata', () => {
                console.log('📊 Metadados carregados:', {
                    duration: audio.value.duration,
                    readyState: audio.value.readyState
                })
                duration.value = audio.value.duration
            })
            
            audio.value.addEventListener('timeupdate', () => {
                currentTime.value = audio.value.currentTime
            })
            
            audio.value.addEventListener('play', () => {
                console.log('▶️ Evento play disparado')
                isPlaying.value = true
            })

            audio.value.addEventListener('pause', () => {
                console.log('⏸️ Evento pause disparado')
                isPlaying.value = false
            })
            
            audio.value.addEventListener('ended', () => {
                console.log('⏹️ Áudio finalizado')
                isPlaying.value = false
                currentTime.value = 0
            })
            
            audio.value.addEventListener('error', (e) => {
                console.error('❌ Erro no áudio:', {
                    error: e,
                    errorCode: audio.value.error?.code,
                    errorMessage: audio.value.error?.message,
                    src: audio.value.src
                })
            })

            audio.value.addEventListener('canplay', () => {
                console.log('✅ Áudio pronto para reprodução')
            })

            audio.value.addEventListener('waiting', () => {
                console.log('⏳ Aguardando dados do áudio')
            })

            audio.value.src = newSrc
            
            await audio.value.load()
            
            console.log('🎵 Elemento de áudio configurado:', {
                src: audio.value.src,
                readyState: audio.value.readyState
            })
        }
    } catch (error) {
        console.error('❌ Erro ao configurar áudio:', error)
    }
}, { immediate: true })

onMounted(() => {
    console.log('🎵 AudioPlayer montado')
    console.log('audioSrc inicial:', props.audioSrc)
})

onUnmounted(() => {
    console.log('🗑️ AudioPlayer desmontado')
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
