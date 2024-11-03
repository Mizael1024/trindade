<template>
    <PopUpCloneCredits v-model="showCloneCreditsModal" @update:modelValue="showCloneCreditsModal = $event" />

    <div class="min-h-screen bg-gray-100 dark:bg-gray-900 font-inter overflow-auto">
        <AppPageContainer title="Clone de Voz"
            description="Crie sua própria voz digital personalizada usando amostras de áudio.">

            <!-- Contador de Créditos -->
            <div class="mb-4 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Créditos Disponíveis</h3>
                        <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                            {{ availableCredits }} <span class="text-sm text-gray-500">crédito(s)</span>
                        </p>
                    </div>
                    <UButton size="lg" color="blue" variant="solid"
                        class="font-semibold shadow-lg hover:scale-105 transition-transform duration-200"
                        @click="redirectToPayment">
                        <template #leading>
                            <UIcon name="i-ph-coin-vertical-duotone" class="text-xl" />
                        </template>
                        Comprar Créditos
                    </UButton>
                </div>
            </div>

            <!-- Alert para mensagens -->
            <UAlert v-if="alert.show" :title="alert.title" :description="alert.message" :color="alert.type"
                :icon="alert.icon" class="mb-4"
                :close-button="{ icon: 'i-heroicons-x-mark-20-solid', color: 'gray', variant: 'link', padded: false }"
                @close="alert.show = false" />

            <!-- Modifique o alerta quando não houver créditos -->
            <UAlert v-if="!isLoadingCredits && availableCredits === 0" title="Créditos Esgotados"
                description="Você precisa adquirir mais créditos para continuar clonando vozes." color="red"
                icon="i-heroicons-exclamation-triangle" class="mb-4">
                <template #action>
                    <UButton color="red" variant="soft" @click="redirectToPayment">
                        Comprar Créditos
                    </UButton>
                </template>
            </UAlert>

            <div class="max-w-5xl mx-auto pb-6">
                <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-lg">
                    <div class="p-6 space-y-6">
                        <!-- Nome da Voz -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Nome da Voz
                            </label>
                            <input v-model="formData.name" type="text"
                                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Digite um nome para sua voz" />
                        </div>

                        <!-- Descrição -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Descrição (opcional)
                            </label>
                            <textarea v-model="formData.description" rows="2"
                                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Descreva sua voz" />
                        </div>

                        <!-- Upload de Amostras -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Amostras de Voz (máx. 25)
                            </label>
                            <div class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                                <div class="text-center">
                                    <div class="flex justify-center mb-4">
                                        <UIcon name="i-ph-microphone-duotone" class="h-12 w-12 text-gray-400" />
                                    </div>
                                    <div class="space-y-2">
                                        <p class="text-gray-500 dark:text-gray-400">
                                            Arraste e solte arquivos de áudio ou
                                        </p>
                                        <button @click="triggerFileInput"
                                            class="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                                            selecione do seu computador
                                        </button>
                                        <input ref="fileInput" type="file" multiple accept="audio/*" class="hidden"
                                            @change="handleFileSelect" />
                                    </div>
                                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        MP3, WAV ou M4A (máx. 15MB por arquivo)
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Lista de Arquivos -->
                        <div v-if="uploadedFiles.length > 0" class="space-y-2 max-h-[300px] overflow-y-auto">
                            <div v-for="(file, index) in uploadedFiles" :key="index"
                                class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div class="flex items-center space-x-3">
                                    <UIcon name="i-ph-file-audio-duotone" class="h-5 w-5 text-blue-500" />
                                    <span class="text-sm text-gray-700 dark:text-gray-300">{{ file.name }}</span>
                                </div>
                                <button @click="removeFile(index)" class="text-red-500 hover:text-red-700">
                                    <UIcon name="i-ph-trash" class="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <!-- Botões -->
                        <div class="flex justify-end space-x-4 mt-6 sticky bottom-0 bg-white dark:bg-gray-800 pt-4">
                            <UButton color="gray" variant="soft" @click="$router.push('/dashboard')">
                                Cancelar
                            </UButton>
                            <UButton color="black" :loading="isCloning"
                                :disabled="!isValid || isCloning || availableCredits === 0" @click="handleCloneClick">
                                {{ isCloning ? 'Clonando...' : availableCredits === 0 ? 'Sem Créditos' : 'Clonar Voz' }}
                            </UButton>
                        </div>
                    </div>
                </div>
            </div>
        </AppPageContainer>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
// Adicione esta importação no topo do script
import PopUpCloneCredits from '../App/Billing/PopUpCloneCredits.vue'

const router = useRouter()
const fileInput = ref(null)
const isCloning = ref(false)
const uploadedFiles = ref([])

const alert = ref({
    show: false,
    title: '',
    message: '',
    type: 'primary',
    icon: 'i-heroicons-information-circle'
})

const formData = ref({
    name: '',
    description: '',
})

const showAlert = (title, message, type = 'primary') => {
    const alertTypes = {
        'primary': 'blue',
        'success': 'green',
        'danger': 'red'
    }

    alert.value = {
        show: true,
        title,
        message,
        type: alertTypes[type] || 'blue',
        icon: type === 'danger' ? 'i-heroicons-exclamation-triangle' : 'i-heroicons-information-circle'
    }
}

const isValid = computed(() => {
    return formData.value.name.trim() !== '' &&
        uploadedFiles.value.length > 0 &&
        uploadedFiles.value.length <= 25
})

const triggerFileInput = () => {
    fileInput.value.click()
}

const handleFileSelect = (event) => {
    const files = Array.from(event.target.files)
    const validFiles = files.filter(file => {
        const isValidType = ['audio/mpeg', 'audio/wav', 'audio/mp4'].includes(file.type)
        const isValidSize = file.size <= 15 * 1024 * 1024 // 15MB
        return isValidType && isValidSize
    })

    if (uploadedFiles.value.length + validFiles.length > 25) {
        showAlert('Limite Excedido', 'Você pode enviar no máximo 25 arquivos', 'danger')
        return
    }

    uploadedFiles.value.push(...validFiles)
    event.target.value = ''
}

const removeFile = (index) => {
    uploadedFiles.value.splice(index, 1)
}

const showCloneCreditsModal = ref(false)
const hasAvailableCredits = ref(false)

// Adicione esta ref no início do script
const isLoadingCredits = ref(true)

// Função para verificar créditos
const checkCredits = async () => {
    const { data } = await useFetch('/api/user/voice-clone/credits');
    return data.value?.available > 0;
};

// Função que será chamada ao clicar no botão
const handleCloneClick = async () => {
    const hasCredits = await checkCredits();
    if (!hasCredits) {
        showCloneCreditsModal.value = true;
        return;
    }

    isCloning.value = true

    try {
        await cloneVoice()
    } catch (error) {
        console.error('Erro ao processar clonagem:', error)
        showAlert('Erro', 'Falha ao processar solicitação', 'danger')
        isCloning.value = false
    }
}

const cloneVoice = async () => {
    try {
        const formDataToSend = new FormData()
        formDataToSend.append('name', formData.value.name)
        formDataToSend.append('is_private', 'true')

        if (formData.value.description) {
            formDataToSend.append('description', formData.value.description)
        }

        uploadedFiles.value.forEach((file) => {
            formDataToSend.append('files', file, file.name)
        })

        const response = await $fetch('/api/voices/voice-clone/elevenlabs', {
            method: 'POST',
            body: formDataToSend
        })

        if (!response.success) {
            throw new Error(response.error || 'Falha ao clonar voz no Eleven Labs')
        }

        await $fetch('/api/voices/favorites', {
            method: 'POST',
            body: {
                voice_id: String(response.data.voice_id),
                elevenLabsId: response.data.voice_id
            }
        })

        await $fetch('/api/user/voice-clone/increment', {
            method: 'POST'
        })

        await fetchCredits()

        showAlert('Sucesso!', 'Voz clonada com sucesso', 'success')
        formData.value = { name: '', description: '' }
        uploadedFiles.value = []

    } catch (error) {
        showAlert('Erro', error.message || 'Falha ao clonar voz', 'danger')
    } finally {
        isCloning.value = false
    }
}

const availableCredits = ref(0)

// Função para buscar créditos
const fetchCredits = async () => {
    try {
        isLoadingCredits.value = true
        const usage = await $fetch('/api/user/voice-clone/credits', {
            method: 'GET'
        })
        availableCredits.value = usage.available || 0
    } catch (error) {
        console.error('Erro ao buscar créditos:', error)
    } finally {
        isLoadingCredits.value = false
    }
}

// Atualizar quando o componente for montado
onMounted(async () => {
    await fetchCredits()

    // Atualiza os créditos a cada 30 segundos
    const interval = setInterval(fetchCredits, 30000)

    // Limpa o intervalo quando o componente for desmontado
    onUnmounted(() => {
        clearInterval(interval)
    })
})

// Função correta para redirecionamento externo
const redirectToPayment = () => {
    showCloneCreditsModal.value = true
}

const config = useRuntimeConfig()

// Adiciona listener para atualização da página
if (process.client) {
    window.addEventListener('focus', fetchCredits)
    window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            fetchCredits()
        }
    })
}
</script>
