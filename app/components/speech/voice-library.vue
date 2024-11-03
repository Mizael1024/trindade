<script setup lang="ts">
import VoiceCardPro from './voice-card-pro.vue'
import { ref, computed, watch, onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFetch } from 'nuxt/app'

interface Voice {
    gender: string;
    language: any;
    id: number
    name: string | null
    category: string | null
    description: string
    profileUrl: string
    previewUrl: string | null
    elevenLabsId: string | null
    is_pro: number // Mudando de boolean para number para corresponder ao banco
}

interface Favorite {
    id: string
    user_id: string
    voice_id: string
    elevenLabsId: string
}

const { data: voices, pending: isLoading, error } = await useFetch<Voice[]>('/api/voice-library')
const { data: favorites, refresh: refreshFavorites } = await useFetch<Favorite[]>('/api/voices/favorites')

const search = ref('')
const selectedCategory = ref('minhas-vozes')
const selectedSubCategory = ref('all')
const currentPage = ref(1)
const perPage = ref(12)
const favoriteVoiceIds = ref(new Set<string>())

const router = useRouter()

onMounted(() => {
    if (favorites.value) {
        favoriteVoiceIds.value = new Set(favorites.value.map((f: Favorite) => f.elevenLabsId))
    }
})

type AlertType = 'blue' | 'green' | 'red'

const alert = ref<{
    show: boolean
    title: string
    message: string
    type: AlertType
    icon: string
}>({
    show: false,
    title: '',
    message: '',
    type: 'blue',
    icon: 'i-heroicons-information-circle'
})

const showAlert = (title: string, message: string, type: 'primary' | 'success' | 'danger' = 'primary') => {
    const alertTypes: Record<'primary' | 'success' | 'danger', AlertType> = {
        'primary': 'blue',
        'success': 'green',
        'danger': 'red'
    }

    alert.value = {
        show: true,
        title,
        message,
        type: alertTypes[type],
        icon: type === 'danger' ? 'i-heroicons-exclamation-triangle' : 'i-heroicons-information-circle'
    }
}

// Adicione esta nova ref
const isLoadingFavorite = ref<string | null>(null)

async function toggleFavorite(voice: Voice) {
    if (isLoadingFavorite.value === voice.elevenLabsId) return

    isLoadingFavorite.value = voice.elevenLabsId

    try {
        const isFavorite = favoriteVoiceIds.value.has(voice.elevenLabsId!)
        const endpoint = isFavorite
            ? `/api/voices/favorites/${favorites.value?.find((f: Favorite)  => f.elevenLabsId === voice.elevenLabsId)?.id}`
            : '/api/voices/favorites'

        await $fetch(endpoint, {
            method: isFavorite ? 'DELETE' : 'POST',
            body: isFavorite ? undefined : { voice_id: String(voice.id), elevenLabsId: voice.elevenLabsId }
        })

        if (isFavorite) {
            favoriteVoiceIds.value.delete(voice.elevenLabsId!)
        } else {
            favoriteVoiceIds.value.add(voice.elevenLabsId!)
        }
    } catch (error) {
        console.error('Erro ao atualizar favorito:', error)
    } finally {
        isLoadingFavorite.value = null
    }
}

const startIndex = computed(() => (currentPage.value - 1) * perPage.value)
const endIndex = computed(() => {
    const end = startIndex.value + perPage.value
    return end > filteredVoices.value.length ? filteredVoices.value.length : end
})

const mainCategories = [
    { id: 'minhas-vozes', label: 'Minhas Vozes' },
    { id: 'biblioteca', label: 'Biblioteca de Vozes' }
]

const subCategories = [
    { id: 'all', label: 'Todas' }
]

watch(error, (newError) => {
    if (newError) {
        showAlert('Erro', 'Erro ao carregar biblioteca de vozes', 'danger')
    }
})

const filteredVoices = computed(() => {
    if (!voices.value) return []
    const filtered = voices.value.filter((voice: Voice) => {

        const matchesSearch = search.value === '' ||
            (voice.name ?? '').toLowerCase().includes(search.value.toLowerCase())

        if (selectedCategory.value === 'minhas-vozes') {
            return matchesSearch && (voice.elevenLabsId && favoriteVoiceIds.value.has(voice.elevenLabsId))
        } else {
            const matchesSubCategory = selectedSubCategory.value === 'all' ||
                (voice.category ?? '').toLowerCase() === selectedSubCategory.value.toLowerCase()
            return matchesSearch && matchesSubCategory
        }
    })
    return filtered
})

const paginatedVoices = computed(() => {
    if (!filteredVoices.value) return []
    return filteredVoices.value.slice(startIndex.value, endIndex.value)
})

const audioRef = ref<HTMLAudioElement | null>(null)
const playingVoiceId = ref<string | null>(null)

const playVoiceSample = async (elevenLabsId: string) => {
    try {
        if (playingVoiceId.value === elevenLabsId && audioRef.value) {
            audioRef.value.pause()
            playingVoiceId.value = null
            return
        }

        if (audioRef.value) {
            audioRef.value.pause()
        }

        const voice = voices.value?.find((v: Voice) => v.elevenLabsId === elevenLabsId)
        if (!voice?.previewUrl) {
            throw new Error('URL de amostra não disponível')
        }

        const audio = new Audio(voice.previewUrl)
        audioRef.value = audio
        await audio.play()
        playingVoiceId.value = elevenLabsId

        audio.onended = () => {
            playingVoiceId.value = null
        }
    } catch (error) {
        // Substituir o toast.error por showAlert
        showAlert('Erro', 'Erro ao reproduzir amostra de voz', 'danger')
        playingVoiceId.value = null
    }
}

onBeforeUnmount(() => {
    if (audioRef.value) {
        audioRef.value.pause()
        audioRef.value = null
    }
})

const navigateToCloneVoice = () => {
    router.push('/dashboard/clone-de-voz')
}

// Adicione esta nova ref
const hoveredVoice = ref<string | null>(null)

// Adicione este watch após os outros watches
watch(selectedCategory, () => {
    currentPage.value = 1 // Reseta para a primeira página quando mudar de categoria
})

// Modifique o watch existente para mostrar mais detalhes
watch(voices, (newVoices) => {
    if (newVoices) {
        console.log('Vozes PRO:', newVoices.filter((v: Voice) => v.is_pro === 1))
        console.log('Detalhes das vozes:', newVoices.map((v: Voice) => ({
            id: v.id,
            name: v.name,
            is_pro: v.is_pro,
            type: typeof v.is_pro,
            category: v.category
        })))
    }
})
</script>

<template>
    <AppPageContainer title="Biblioteca de Vozes" description="Explore nossa coleção de vozes">
        <!-- Reduzindo o espaçamento vertical geral -->
        <div class="space-y-4"> <!-- Alterado de space-y-6 para space-y-4 -->
            <!-- Adicionar o alerta logo no início -->
            <UAlert v-if="alert.show" :title="alert.title" :description="alert.message" :color="alert.type"
                :icon="alert.icon" class="mb-4"
                :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'gray', variant: 'link', padded: false }"
                @close="alert.show = false" />

            <UProgress v-if="isLoading" indeterminate class="mb-4" />

            <!-- Barra de busca e botão -->
            <div class="flex items-center gap-4">
                <UInput v-model="search" icon="i-heroicons-magnifying-glass-20-solid" placeholder="Buscar vozes..."
                    size="lg" class="flex-1" />
                <UButton color="black" icon="i-ph-plus-circle-duotone" @click="navigateToCloneVoice">
                    Clonar Voz
                </UButton>
            </div>

            <!-- Navegação de categorias -->
            <nav class="mb-4 border-b border-gray-200 dark:border-gray-700"> <!-- Reduzido de mb-8 para mb-4 -->
                <div class="flex space-x-8">
                    <button v-for="category in mainCategories" :key="category.id"
                        @click="selectedCategory = category.id" class="relative py-4 px-1 text-sm font-medium" :class="{
                            'text-gray-900 dark:text-white': selectedCategory === category.id,
                            'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200': selectedCategory !== category.id
                        }">
                        {{ category.label }}
                        <!-- Indicador de ativo -->
                        <div v-if="selectedCategory === category.id"
                            class="absolute bottom-0 inset-x-0 h-0.5 bg-gray-900 dark:bg-white">
                        </div>
                    </button>
                </div>

                <!-- Subcategorias (se necessário) -->
                <div v-if="selectedCategory === 'biblioteca'" class="flex space-x-6 mt-4 pb-4">
                    <button v-for="category in subCategories" :key="category.id"
                        @click="selectedSubCategory = category.id" class="text-sm font-medium px-3 py-1.5 rounded-full"
                        :class="{
                            'bg-gray-900 text-white dark:bg-white dark:text-gray-900': selectedSubCategory === category.id,
                            'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200': selectedSubCategory !== category.id
                        }">
                        {{ category.label }}
                    </button>
                </div>
            </nav>

            <!-- Substitua o bloco do grid existente por este -->
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                <template v-for="voice in paginatedVoices" :key="voice.elevenLabsId ?? ''">
                    <!-- Use VoiceCardPro para vozes PRO -->
                    <VoiceCardPro v-if="voice.is_pro === 1" :voice="{
                        ...voice,
                        gender: voice.gender || 'male'
                    }" :is-playing="playingVoiceId === voice.elevenLabsId"
                        :is-favorite="favoriteVoiceIds.has(voice.elevenLabsId ?? '')"
                        :is-loading="isLoadingFavorite === voice.elevenLabsId"
                        @play="playVoiceSample(voice.elevenLabsId ?? '')" @toggle-favorite="toggleFavorite(voice)" />

                    <!-- Use o card normal para vozes não-PRO -->
                    <div v-else class="relative p-3 rounded-xl 
                               bg-white/40 dark:bg-gray-900/40
                               backdrop-blur-[12px] backdrop-saturate-[180%]
                               border border-white/20 dark:border-white/10
                               shadow-enhanced dark:shadow-enhanced-dark">
                        <div class="flex items-center gap-3"> <!-- Reduzido gap-4 para gap-3 -->
                            <!-- Container da imagem de perfil -->
                            <div class="relative h-12 w-12"> <!-- Reduzido de h-14/w-14 para h-12/w-12 -->
                                <div class="h-full w-full rounded-full 
                                    shadow-profile dark:shadow-profile-dark 
                                    overflow-hidden 
                                    border border-gray-300 dark:border-gray-600
                                    bg-white dark:bg-gray-800">

                                    <img :src="voice.profileUrl || '/images/default-avatar.png'" :alt="voice.name ?? ''"
                                        class="h-full w-full object-cover"
                                        @error="(event: any) => { const target = event.target as HTMLImageElement; target.src = '/images/default-avatar.png' }" />
                                </div>
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex flex-col gap-2">
                                    <!-- Nome e Categoria -->
                                    <div>
                                        <h3 class="font-medium text-gray-900 dark:text-white">
                                            {{ voice.name }}
                                        </h3>
                                        <div class="flex items-center gap-2 mt-1">
                                            <!-- Language -->
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                 bg-gray-50 text-gray-600
                                                 dark:bg-gray-800/50 dark:text-gray-300
                                                 border border-gray-200 dark:border-gray-700">
                                                {{ voice.language === 'pt-BR' ? 'Português' :
                                                    voice.language === 'en-US' ? 'Inglês' :
                                                        voice.language }}
                                            </span>

                                            <!-- Gender -->
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                 bg-gray-50 text-gray-600
                                                 dark:bg-gray-800/50 dark:text-gray-300
                                                 border border-gray-200 dark:border-gray-700">
                                                {{ voice.gender === 'male' ? 'Homem' : 'Mulher' }}
                                            </span>
                                        </div>
                                    </div>

                                    <!-- Descrição personalizada (se existir) -->
                                    <p v-if="voice.description && !voice.description.includes('Voz masculina - Sem categoria') && !voice.description.includes('Voz feminina - Sem categoria')"
                                        class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                        {{ voice.description }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Reduzindo espaçamento dos botões -->
                        <div class="mt-4 space-y-2"> <!-- Alterado de mt-8 space-y-3 para mt-4 space-y-2 -->
                            <!-- Prévia da voz -->
                            <button @click="playVoiceSample(voice.elevenLabsId ?? '')" class="w-full py-2.5 px-4 rounded-lg
                                bg-white/50 dark:bg-gray-800/50
                                backdrop-blur-sm
                                border border-gray-300 dark:border-gray-600
                                flex items-center justify-center gap-2
                                transition-colors duration-200
                                hover:bg-white/90 dark:hover:bg-gray-800/90">

                                <UIcon
                                    :name="playingVoiceId === voice.elevenLabsId ? 'i-ph-pause-fill' : 'i-ph-play-fill'"
                                    class="w-5 h-5 text-gray-800 dark:text-gray-100" />

                                <span class="text-sm font-medium text-gray-800 dark:text-gray-100">
                                    {{ playingVoiceId === voice.elevenLabsId ? 'Pausar prévia' : 'Ouvir prévia' }}
                                </span>
                            </button>

                            <!-- Botão adicionar/remover -->
                            <button @click="toggleFavorite(voice)" class="absolute top-2 right-2 p-2 rounded-full
                                       hover:bg-white/10 dark:hover:bg-gray-800/10
                                       transition-colors duration-200" :class="{
                                        'text-gray-700': favoriteVoiceIds.has(voice.elevenLabsId ?? ''),
                                        'text-gray-400': !favoriteVoiceIds.has(voice.elevenLabsId ?? '')
                                    }" :disabled="isLoadingFavorite === voice.elevenLabsId">
                                <UButton v-if="isLoadingFavorite === voice.elevenLabsId" color="gray" variant="ghost"
                                    :loading="true" class="w-5 h-5 !p-0" />
                                <UIcon v-else
                                    :name="favoriteVoiceIds.has(voice.elevenLabsId ?? '') ? 'i-heroicons-bookmark-solid' : 'i-heroicons-bookmark'"
                                    class="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </template>
            </div>

            <!-- Ajustando a paginação para ser mais compacta -->
            <div class="flex flex-col sm:flex-row justify-between items-center gap-2 mt-4">
                <p class="text-sm text-gray-700">
                    Mostrando {{ startIndex + 1 }} até {{ endIndex }} de {{ filteredVoices.length }} vozes
                </p>
                <UPagination v-model="currentPage" :total="filteredVoices.length" :per-page="perPage"
                    :ui="{ wrapper: 'gap-1' }" size="sm" />
            </div>
        </div>
    </AppPageContainer>
</template>

<style>
/* Apenas sombras essenciais para o efeito glassmorphism */
.shadow-glass {
    box-shadow:
        0 4px 6px -1px rgba(0, 0, 0, 0.05),
        0 2px 4px -1px rgba(0, 0, 0, 0.03),
        0 0 0 1px rgba(255, 255, 255, 0.2);
}

.dark .shadow-glass-dark {
    box-shadow:
        0 4px 6px -1px rgba(0, 0, 0, 0.2),
        0 2px 4px -1px rgba(0, 0, 0, 0.1),
        0 0 0 1px rgba(255, 255, 255, 0.05);
}

/* Sombras mais pronunciadas para o card */
.shadow-enhanced {
    box-shadow:
        0 4px 6px -1px rgba(0, 0, 0, 0.08),
        0 2px 4px -1px rgba(0, 0, 0, 0.06),
        0 0 0 1px rgba(255, 255, 255, 0.2),
        0 12px 24px -4px rgba(0, 0, 0, 0.08),
        0 8px 16px -4px rgba(0, 0, 0, 0.04);
}

.dark .shadow-enhanced-dark {
    box-shadow:
        0 4px 6px -1px rgba(0, 0, 0, 0.3),
        0 2px 4px -1px rgba(0, 0, 0, 0.2),
        0 0 0 1px rgba(255, 255, 255, 0.05),
        0 12px 24px -4px rgba(0, 0, 0, 0.3),
        0 8px 16px -4px rgba(0, 0, 0, 0.2);
}

/* Sombras sutis para os botões */
.shadow-button {
    box-shadow:
        0 1px 2px rgba(0, 0, 0, 0.04),
        0 1px 1px rgba(0, 0, 0, 0.03),
        inset 0 0 0 1px rgba(0, 0, 0, 0.02);
}

.dark .shadow-button-dark {
    box-shadow:
        0 1px 2px rgba(0, 0, 0, 0.2),
        0 1px 1px rgba(0, 0, 0, 0.15),
        inset 0 0 0 1px rgba(255, 255, 255, 0.02);
}

/* Sombras para a imagem de perfil */
.shadow-profile {
    box-shadow:
        0 2px 4px -1px rgba(0, 0, 0, 0.06),
        0 4px 6px -1px rgba(0, 0, 0, 0.08),
        inset 0 2px 4px rgba(0, 0, 0, 0.06);
}

.dark .shadow-profile-dark {
    box-shadow:
        0 2px 4px -1px rgba(0, 0, 0, 0.2),
        0 4px 6px -1px rgba(0, 0, 0, 0.3),
        inset 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>
