<template>
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 font-inter">
        <AppPageContainer title="Converta Texto em Fala"
            description="Desfrute da potência da nossa tecnologia avançada para gerar fala realista e cativante em uma ampla gama de idiomas.">

            <!-- Grid layout -->
            <div class="max-w-7xl mx-auto grid grid-cols-12 gap-6">
                <!-- Lista de vozes (lado esquerdo) -->
                <div class="col-span-3">
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Vozes Disponíveis</h3>
                        <div class="space-y-2 max-h-[600px] overflow-y-auto">
                            <button
                                v-for="voice in availableVoices"
                                :key="voice.id"
                                @click="selectVoice(voice)"
                                class="w-full text-left px-4 py-3 rounded-lg transition-colors"
                                :class="[
                                    selectedVoice?.id === voice.id
                                        ? 'bg-blue-50 dark:bg-blue-900/50 border-2 border-blue-500'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-2 border-transparent'
                                ]"
                            >
                                <div class="flex flex-col">
                                    <span class="font-medium text-gray-900 dark:text-white">
                                        {{ voice.name }}
                                    </span>
                                    <span class="text-sm text-gray-500 dark:text-gray-400">
                                        {{ voice.language }}
                                    </span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Editor de texto (lado direito) -->
                <div class="col-span-9">
                    <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden h-full flex flex-col">
                        <div class="p-3 bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
                            <div class="flex items-center space-x-2">
                                <!-- Voz selecionada -->
                                <div
                                    class="flex items-center space-x-3 px-3 py-1.5 rounded-full bg-white dark:bg-gray-600">
                                    <span class="text-sm font-medium text-gray-900 dark:text-white">
                                        {{ selectedVoice?.name || 'Selecione uma voz' }}
                                    </span>
                                </div>
                                <span class="text-sm font-light text-gray-500 dark:text-gray-300">
                                    {{ text.length }} / 800
                                </span>
                            </div>

                            <!-- Botão gerar -->
                            <button @click="generateSpeech"
                                class="px-4 py-2 text-sm font-normal text-white bg-black dark:bg-white dark:text-gray-900 rounded-full hover:bg-gray-900 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                :disabled="isGenerating || text.length === 0">
                                <span v-if="!isGenerating">Gerar fala</span>
                                <span v-else class="flex items-center">
                                    <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white dark:text-gray-900"
                                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                            stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                        </path>
                                    </svg>
                                    Gerando...
                                </span>
                            </button>
                        </div>

                        <!-- Área de texto -->
                        <textarea v-model="text"
                            placeholder="Comece a digitar ou cole qualquer texto que deseja transformar em fala realista."
                            class="w-full h-60 sm:h-80 p-4 sm:p-6 lg:p-8 text-base sm:text-lg font-light border-0 focus:outline-none focus:ring-0 resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                            maxlength="800"></textarea>

                        <!-- Player de áudio -->
                        <AudioPlayer v-if="generatedAudioSrc" ref="audioPlayerRef" :audioSrc="generatedAudioSrc"
                            @delete="deleteAudio" />
                    </div>
                </div>
            </div>
        </AppPageContainer>
    </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import AudioPlayer from './AudioPlayer.vue'
import { useFetch } from '#imports'
import { toast } from 'vue-sonner'

// Refs essenciais
const text = ref('')
const isGenerating = ref(false)
const generatedAudioSrc = ref(null)
const audioPlayerRef = ref(null)
const isLoadingVoices = ref(true)
const selectedVoice = ref(null)
const availableVoices = ref([])

// Função para buscar vozes
const fetchAvailableVoices = async () => {
  isLoadingVoices.value = true
  console.log('Iniciando busca de vozes...')
  
  try {
    const response = await fetch('/api/tts/speakers')
    
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`)
    }
    
    const voices = await response.json()
    console.log('Vozes recebidas:', voices)
    
    if (Array.isArray(voices)) {
      availableVoices.value = voices.map(voice => ({
        id: voice,
        name: voice.charAt(0).toUpperCase() + voice.slice(1),
        language: 'Português (BR)'
      }))
      
      if (availableVoices.value.length > 0 && !selectedVoice.value) {
        selectedVoice.value = availableVoices.value[0]
      }
    } else {
      throw new Error('Formato de dados inválido')
    }
  } catch (error) {
    console.error('Erro ao buscar vozes:', error)
    toast.error('Não foi possível carregar a lista de vozes')
  } finally {
    isLoadingVoices.value = false
  }
}

// Função para gerar fala
const generateSpeech = async () => {
  if (!text.value || !selectedVoice.value) {
    toast.error('Por favor, selecione uma voz e digite algum texto')
    return
  }

  isGenerating.value = true
  try {
    console.log('Iniciando geração com:', {
      text: text.value,
      voice_id: selectedVoice.value.id
    })

    const response = await fetch('/api/tts-fast-api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text.value,
        voice_id: selectedVoice.value.id,
        language: 'pt'
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Falha ao gerar áudio')
    }

    console.log('Resposta recebida, criando blob...')
    const audioBlob = await response.blob()
    console.log('Tamanho do blob:', audioBlob.size, 'bytes')
    
    if (generatedAudioSrc.value) {
      URL.revokeObjectURL(generatedAudioSrc.value)
    }
    
    generatedAudioSrc.value = URL.createObjectURL(audioBlob)
    console.log('URL do áudio criada:', generatedAudioSrc.value)

    await nextTick()
    
    if (audioPlayerRef.value) {
      audioPlayerRef.value.play()
    }
  } catch (error) {
    console.error('Erro detalhado ao gerar áudio:', error)
    toast.error(error.message || 'Erro ao gerar o áudio. Por favor, tente novamente.')
  } finally {
    isGenerating.value = false
  }
}

// Função para selecionar voz
const selectVoice = (voice) => {
  selectedVoice.value = voice
}

// Função para deletar áudio
const deleteAudio = () => {
  if (generatedAudioSrc.value) {
    URL.revokeObjectURL(generatedAudioSrc.value)
  }
  generatedAudioSrc.value = null
}

// Inicialização
onMounted(async () => {
  await fetchAvailableVoices()
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

.font-inter {
    font-family: 'Inter', sans-serif;
}

/* Adicione estes estilos para garantir alturas iguais */
.grid {
    display: grid;
    grid-template-rows: 1fr;
}

.col-span-3,
.col-span-9 {
    display: flex;
    flex-direction: column;
}

.h-full {
    height: 100%;
}
/* Adicione estes estilos para melhorar a rolagem */
.max-h-\[600px\] {
    scrollbar-width: thin;
    scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

:deep(.max-h-\[600px\])::-webkit-scrollbar {
    width: 6px;
}

:deep(.max-h-\[600px\])::-webkit-scrollbar-track {
    background: transparent;
}

:deep(.max-h-\[600px\])::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 3px;
}
</style>
