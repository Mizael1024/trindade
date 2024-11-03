<template>
  <CreditPackagesModal v-model="showCreditPackages" />
  
  <div
    class="flex-col items-stretch relative w-full border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-white/10 lg:w-64 flex-shrink-0 hidden lg:flex"
  >
    <div class="flex h-12 px-6">
      <NuxtLink to="/dashboard" class="flex items-center gap-2 font-semibold">
        <img src="/logo.png" class="h-6 w-auto" />
        <span class="">Voicefy</span>
      </NuxtLink>
    </div>
    <div class="flex flex-col w-full flex-1 relative overflow-hidden">
      <div class="flex-grow flex flex-col min-h-0 gap-y-2 py-2">
        <div class="flex-1 px-4 flex flex-col gap-y-2 overflow-y-auto">
          <UVerticalNavigation :links="links" :ui="navigationUiClasses" />
        </div>
      </div>
      <div class="px-4 py-3 border-t border-gray-200 dark:border-white/10">
        <!-- Botão temporariamente oculto -->
      </div>
      <div class="p-2">
        <AuthState v-slot="{ loggedIn }">
          <AppUserDropdown v-if="loggedIn" />
        </AuthState>
      </div>
    </div>
  </div>

  <ClientOnly>
    <USlideover
      v-if="smallerThanLg"
      v-model="mobileSidebar"
      side="left"
      class="lg:hidden"
    >
      <div
        class="flex-col flex h-screen items-stretch relative w-full border-gray-200 dark:border-white/10"
      >
        <div class="flex h-12 px-4 items-center justify-between">
          <NuxtLink
            to="/dashboard"
            class="flex items-center gap-2 font-semibold"
          >
            <img src="/logo.png" class="h-6 w-auto" />
            <span class="">Voicefy</span>
          </NuxtLink>
          <UButton
            icon="i-ph-x"
            square
            color="gray"
            variant="soft"
            size="xs"
            @click="mobileSidebar = false"
          />
        </div>
        <div class="flex flex-col w-full flex-1 relative overflow-hidden">
          <div class="flex-grow flex flex-col min-h-0 gap-y-2 py-2">
            <div class="flex-1 px-2 flex flex-col gap-y-2 overflow-y-auto">
              <UVerticalNavigation :links="links" :ui="navigationUiClasses" />
            </div>
          </div>
          <div class="px-4 py-3 border-t border-gray-200 dark:border-white/10">
            <button 
              @click="showCreditPackages = true"
              class="w-full flex items-center justify-between p-3 rounded-lg bg-[#4691e2]/10 hover:bg-[#4691e2]/20 dark:bg-[#4691e2]/5 dark:hover:bg-[#4691e2]/10 transition-colors"
            >
              <div class="flex items-center gap-3">
                <div class="text-[#FFD700]">
                  <Icon name="i-ph-coins-duotone" class="w-5 h-5" />
                </div>
                <div>
                  <p class="text-sm font-medium text-[#4691e2]">Comprar Créditos</p>
                  <p class="text-xs text-[#4691e2]/80">Expanda seus limites</p>
                </div>
              </div>
              <Icon name="i-ph-arrow-right" class="w-4 h-4 text-[#4691e2]" />
            </button>
          </div>
          <div class="p-2">
            <AuthState v-slot="{ loggedIn }">
              <AppUserDropdown v-if="loggedIn" />
            </AuthState>
          </div>
        </div>
      </div>
    </USlideover>
  </ClientOnly>
</template>

<script setup>
import { useBreakpoints, breakpointsTailwind } from "@vueuse/core";
import { ref } from 'vue'
import CreditPackagesModal from '~/components/App/CreditPackagesModal.vue'

const breakpoints = useBreakpoints(breakpointsTailwind);
const smallerThanLg = breakpoints.smaller("lg");
const mobileSidebar = useState("mobileSidebar", () => false);

const links = [
  {
    label: "Texto para Fala",
    to: "/dashboard/texto-para-fala",
    icon: "i-ph-microphone-duotone",
    exact: true,
    click: () => (mobileSidebar.value = false),
  },
  {
    label: "Biblioteca de Vozes",
    to: "/dashboard/biblioteca-de-vozes",
    icon: "i-ph-playlist-duotone",
    exact: true,
    click: () => (mobileSidebar.value = false),
  },
  {
    label: "Clone de Voz",
    to: "/dashboard/clone-de-voz",
    icon: "i-ph-microphone-stage-duotone",
    exact: true,
    click: () => (mobileSidebar.value = false),
  },
  {
    label: "Settings",
    to: "/dashboard/settings",
    icon: "i-ph-gear-duotone",
    click: () => (mobileSidebar.value = false),
  },
];

const navigationUiClasses = {
  padding: "px-2 py-2.5",
  rounded: "rounded-lg",
  base: "gap-3",
};

const showCreditPackages = ref(false)
</script>
