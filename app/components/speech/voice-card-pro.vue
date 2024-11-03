<script setup lang="ts">
interface Props {
    voice: {
        name: string | null
        language: string
        gender: string
        description?: string
        profileUrl: string
        elevenLabsId: string | null
    }
    isPlaying: boolean
    isFavorite: boolean
    isLoading: boolean
}

defineProps<Props>()
defineEmits(['play', 'toggle-favorite'])

const handleImageError = (event: Event) => {
    (event.target as HTMLImageElement).src = '@default-avatar.png'
}
</script>

<template>
    <div class="relative p-3 rounded-xl 
              bg-gradient-to-br from-white/50 to-white/30 dark:from-gray-900/50 dark:to-gray-900/30
              backdrop-blur-[12px] backdrop-saturate-[180%]
              border border-white/20 dark:border-white/10
              shadow-enhanced dark:shadow-enhanced-dark">
        <!-- Badge PRO -->
        <div class="absolute -top-2 -right-2">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                   bg-gradient-to-r from-emerald-500 to-green-600
                   text-white shadow-sm">
                PRO
            </span>
        </div>

        <div class="flex items-center gap-3">
            <!-- Container da imagem de perfil -->
            <div class="relative h-12 w-12">
                <div class="h-full w-full rounded-full 
                    shadow-profile dark:shadow-profile-dark 
                    overflow-hidden 
                    border border-gray-300 dark:border-gray-600
                    bg-white dark:bg-gray-800">
                    <img :src="voice.profileUrl || '@/default-avatar.png'" :alt="voice.name ?? ''"
                        class="h-full w-full object-cover"
                        @error="handleImageError" />
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

                    <!-- Descrição personalizada -->
                    <p v-if="voice.description" class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {{ voice.description }}
                    </p>
                </div>
            </div>
        </div>

        <!-- Botões -->
        <div class="mt-4 space-y-2">
            <!-- Prévia da voz -->
            <button @click="$emit('play')" class="w-full py-2.5 px-4 rounded-lg
                     bg-white/50 dark:bg-gray-800/50
                     backdrop-blur-sm
                     border border-gray-300 dark:border-gray-600
                     flex items-center justify-center gap-2
                     transition-colors duration-200
                     hover:bg-white/90 dark:hover:bg-gray-800/90">
                <UIcon :name="isPlaying ? 'i-ph-pause-fill' : 'i-ph-play-fill'"
                    class="w-5 h-5 text-gray-800 dark:text-gray-100" />
                <span class="text-sm font-medium text-gray-800 dark:text-gray-100">
                    {{ isPlaying ? 'Pausar prévia' : 'Ouvir prévia' }}
                </span>
            </button>

            <!-- Botão adicionar/remover -->
            <button @click="$emit('toggle-favorite')" class="absolute top-2 right-2 p-2 rounded-full
                     hover:bg-white/10 dark:hover:bg-gray-800/10
                     transition-colors duration-200" :class="{
                        'text-gray-700': isFavorite,
                        'text-gray-400': !isFavorite
                    }" :disabled="isLoading">
                <UButton v-if="isLoading" color="gray" variant="ghost" :loading="true" class="w-5 h-5 !p-0" />
                <UIcon v-else :name="isFavorite ? 'i-heroicons-bookmark-solid' : 'i-heroicons-bookmark'"
                    class="w-5 h-5" />
            </button>
        </div>
    </div>
</template>

<style scoped>
/* Mantendo os estilos de sombra existentes */
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
