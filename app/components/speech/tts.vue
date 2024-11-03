<template>
    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 font-inter">
        <AppPageContainer title="Converta Texto em Fala"
            description="Desfrute da potência da nossa tecnologia avançada para gerar fala realista e cativante em uma ampla gama de idiomas.">

            <!-- Plano atual -->
            <div class="max-w-7xl mx-auto mb-4">
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <div v-if="isLoading" class="flex items-center space-x-2">
                        <UIcon name="i-ph-spinner" class="animate-spin" />
                        <span class="text-sm text-gray-500">Carregando informações...</span>
                    </div>
                    
                    <div v-else class="flex items-center justify-between mb-2">
                        <div class="flex items-center space-x-4">
                            <div class="flex items-center space-x-2">
                                <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Seu plano atual:</span>
                                <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ userPlan?.planName }}</span>
                            </div>
                            <div class="flex items-center space-x-2">
                                <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Caracteres:</span>
                                <span class="text-sm font-semibold text-gray-900 dark:text-white">
                                    {{ formattedUsage }}
                                </span>
                            </div>
                        </div>
                        <button @click="navigateToBilling"
                            class="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                            Fazer upgrade
                        </button>
                    </div>
                </div>
            </div>

            <!-- Grid layout -->
            <div class="max-w-7xl mx-auto grid grid-cols-12 gap-6">
                <!-- Lista de vozes (lado esquerdo) -->
                <div class="col-span-3">
                    <VoiceList :voices="favoriteVoices" :selectedVoice="selectedVoice" :isPlaying="isPlaying"
                        :playingVoice="playingVoice" @select-voice="selectVoice" @preview-voice="handlePreviewVoice" />
                </div>

                <!-- Editor de texto (lado direito) -->
                <div class="col-span-9">
                    <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden h-full flex flex-col">
                        <div class="p-3 bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
                            <div class="flex items-center space-x-2">
                                <!-- Voz selecionada -->
                                <div
                                    class="flex items-center space-x-3 px-3 py-1.5 rounded-full bg-white dark:bg-gray-600">
                                    <img :src="selectedVoice?.profileUrl" :alt="selectedVoice?.name || 'Voz'"
                                        class="w-8 h-8 rounded-full object-cover" />
                                    <span class="text-sm font-medium text-gray-900 dark:text-white">
                                        {{ selectedVoice?.name }}
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
import { ref, nextTick, onMounted, onUnmounted, watch, computed } from 'vue'
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue'
import { ChevronDown, Play, Pause, CheckIcon } from 'lucide-vue-next'
import AudioPlayer from './AudioPlayer.vue'
import { useUserSession } from '#imports'
import VoiceList from './voice-list.vue'
import { useFetch } from '#imports'
import { useNuxtApp } from '#app'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

// Refs essenciais
const text = ref('')
const isVoiceOpen = ref(false)
const voiceDropdownStyle = ref({})
const hoveredVoice = ref(null)
const isPlaying = ref(false)
const playingVoice = ref(null)
const audio = ref(null)
const isGenerating = ref(false)
const generatedAudioSrc = ref(null)
const voiceButton = ref(null)
const audioPlayerRef = ref(null)

// Adicione um ref para controlar o loading
const isLoading = ref(true)

// Buscar vozes e favoritos da API em paralelo
const [{ data: voices }, { data: favorites }] = await Promise.all([
    useFetch('/api/voice-library'),
    useFetch('/api/voices/favorites')
])

// Computed para filtrar apenas as vozes favoritadas
const favoriteVoices = computed(() => {
    if (!voices.value || !favorites.value) return []
    return voices.value.filter(voice =>
        favorites.value.some(f => f.elevenLabsId === voice.elevenLabsId)
    )
})

// Inicializar selectedVoice com a primeira voz favoritada
const selectedVoice = ref(null)
watch(favoriteVoices, (newVoices) => {
    if (newVoices.length > 0 && !selectedVoice.value) {
        selectedVoice.value = newVoices[0]
    }
}, { immediate: true })

const charactersUsed = ref(0)
const audioCache = ref(new Map())
const { user, refreshUser } = useUserSession()
const userUsage = ref(null)

// Cache local para dados do usuário
const localUserData = ref(null)

const userPlanInfo = ref(null)

const userInfo = ref(null)

// Adicione estas refs
const userPlan = ref(null)

// Atualizar o charactersUsed quando userUsage mudar
watch(() => userUsage.value?.charactersUsed, (newValue) => {
    charactersUsed.value = newValue || 0
})

// Manter apenas esta função
const refreshUsage = async () => {
  try {
    const response = await fetch('/api/user/usage/verify')
    const data = await response.json()
    
    userPlan.value = {
      planName: data.planName,
      monthlyCredits: data.totalDisponivel
    }
    
    userUsage.value = {
      charactersUsed: data.creditosAtuais,
      charactersTotal: data.totalDisponivel,
      extraCredits: data.creditosExtras || 0,
      lastUpdated: data.ultimaAtualizacao
    }
  } catch (error) {
    console.error('Erro ao atualizar dados de uso:', error)
  } finally {
    isLoading.value = false
  }
}

// Computed properties
const formattedUsage = computed(() => {
  const usage = userUsage.value
  if (!usage) return '0 / 0'
  const { charactersUsed, charactersTotal, extraCredits } = usage
  return `${charactersUsed} / ${charactersTotal + (extraCredits || 0)}`
})

const planName = computed(() => {
  return userInfo.value?.subscription?.name || 'Plano Gratuito'
})

// Lifecycle hooks
onMounted(() => {
  refreshUsage()
  
  window.addEventListener('subscription-updated', async (event) => {
    await refreshUsage()
  })
})

onUnmounted(() => {
  window.removeEventListener('subscription-updated', refreshUsage)
})

// Função de preview de áudio otimizada
const toggleAudioPreview = async (voiceId) => {
    if (isPlaying.value && playingVoice.value === voiceId) {
        audioCache.value.get(voiceId).pause()
        isPlaying.value = false
        playingVoice.value = null
        return
    }

    if (playingVoice.value) {
        audioCache.value.get(playingVoice.value)?.pause()
    }

    if (!audioCache.value.has(voiceId)) {
        const voice = voices.value.find(v => v.id === voiceId)
        const newAudio = new Audio(voice.sampleUrl)
        audioCache.value.set(voiceId, newAudio)

        newAudio.onended = () => {
            isPlaying.value = false
            playingVoice.value = null
        }
    }

    const audioElement = audioCache.value.get(voiceId)
    audioElement.currentTime = 0
    await audioElement.play()

    isPlaying.value = true
    playingVoice.value = voiceId
}

// Otimizar generateSpeech para usar Promise.all
const generateSpeech = async () => {
    if (text.value.length === 0) return

    // Adicione esta verificação no início da função
    if (!selectedVoice.value) {
        toast.error('Por favor, selecione uma voz antes de gerar o áudio.')
        return
    }

    // Verificar caracteres disponíveis
    if (userUsage.value) {
        const { creditosAtuais, totalDisponivel, creditosExtras } = userUsage.value
        const total = totalDisponivel === -1 ? -1 : totalDisponivel + (creditosExtras || 0)

        if (total !== -1) {
            const remainingCredits = total - creditosAtuais
            if (remainingCredits < text.value.length) {
                navigateToBilling()
                return
            }
        }
    }

    isGenerating.value = true
    generatedAudioSrc.value = null

    try {
        const nuxtApp = useNuxtApp()
        
        await nuxtApp.runWithContext(async () => {
            const audioResponse = await fetch('/api/demo/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: text.value,
                    voiceId: selectedVoice.value.elevenLabsId,
                    settings: {
                        stability: 1,
                        similarity_boost: 1,
                        use_speaker_boost: true
                    }
                })
            })

            if (!audioResponse.ok) {
                const errorData = await audioResponse.json().catch(() => null)
                throw new Error(errorData?.message || 'Erro ao gerar fala')
            }

            const audioBlob = await audioResponse.blob()
            generatedAudioSrc.value = URL.createObjectURL(audioBlob)

            // Atualiza os dados de uso após gerar o áudio com sucesso
            await Promise.all([
                refreshUsage(),
                refreshUser()
            ])
        })

        await nextTick()
        setTimeout(() => {
            audioPlayerRef.value?.play?.()
        }, 100)

    } catch (error) {
        if (error.message === 'Limite de caracteres excedido') {
            navigateToBilling()
        } else {
            alert(error.message)
        }
    } finally {
        isGenerating.value = false
    }
}

const deleteAudio = () => {
    if (generatedAudioSrc.value) {
        URL.revokeObjectURL(generatedAudioSrc.value)
    }
    generatedAudioSrc.value = null
}

const showPlayButton = (voiceId) => {
    hoveredVoice.value = voiceId
}

const hidePlayButton = () => {
    hoveredVoice.value = null
}

const selectVoice = (voice) => {
    selectedVoice.value = voice
}

const handlePreviewVoice = (voice) => {
    toggleAudioPreview(voice.id)
}

onUnmounted(() => {
    window.removeEventListener('userPlanUpdated', refreshUsage)
    audioCache.value.forEach(audio => audio.pause())
    audioCache.value.clear()
})

// Chame a função quando o componente for montado
onMounted(async () => {
    await refreshUsage()
})

// Atualizar quando houver mudanças na assinatura
watch(() => user.value?.subscription?.variantId, async (newVariantId, oldVariantId) => {
    if (newVariantId !== oldVariantId) {
        await refreshUsage()
    }
}, { immediate: true })

// Antes dos outros setups, adicione:
const { data: initialUsage } = await useFetch('/api/user/usage/verify')

// Se houver dados iniciais, já configure
if (initialUsage.value) {
  userPlan.value = {
    planName: initialUsage.value.planName,
    monthlyCredits: initialUsage.value.totalDisponivel
  }
  
  userUsage.value = {
    charactersUsed: initialUsage.value.creditosAtuais,
    charactersTotal: initialUsage.value.totalDisponivel,
    extraCredits: initialUsage.value.creditosExtras || 0
  }
  
  isLoading.value = false
}

// Mantenha o onMounted para atualizações subsequentes
onMounted(async () => {
  if (!userPlan.value) {
    await refreshUsage()
  }
})

// Adicionar função de navegação
const router = useRouter()
const navigateToBilling = () => {
    router.push('/dashboard/settings/billing')
}
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
</style>
