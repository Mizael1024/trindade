<template>
  <AppPageContainer
    title="Users"
    :description="`${usersData.totalCount} users have signed up`"
  >
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-2 flex-shrink-0">
        <UInput
          v-model="search"
          icon="i-heroicons-magnifying-glass-20-solid"
          color="white"
          :trailing="false"
          class="w-full"
          placeholder="Email or name"
        />
        <USelect
          v-model="selectedFilter"
          :options="filters"
          class="flex-shrink-0"
        />
        <div
          class="flex-shrink-0 flex items-center gap-2 bg-gray-100 dark:bg-white/10 p-2 rounded-lg"
        >
          <UToggle size="md" v-model="maskEmails" />
          <span class="text-xs font-medium">Mask Emails</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <UButton @click="addUserModal = true" label="Add User" color="white" />
      </div>
    </div>
    <AdminUserTable
      :rows="users"
      :loading="status === 'pending'"
      :getActionItems="getActionItems"
      :totalRows="totalUsers"
      :page="page"
      :pageSize="pageSize"
      :maskEmails="maskEmails"
      @update:page="page = $event"
      @update:pageSize="pageSize = $event"
    />
    <div class="mt-4 flex items-center justify-between">
      <USelect
        v-model="pageSize"
        :options="[10, 20, 50, 100]"
        label="Rows per page"
      />
      <UPagination v-model="page" :total="totalUsers" :per-page="pageSize" />
    </div>
    <UModal v-model="addUserModal">
      <AdminAddUser @close="refreshAndCloseAddUserModal" />
    </UModal>
    <UModal v-model="banUserModal">
      <AdminBanUser
        v-if="selectedUser"
        :user="selectedUser"
        @close="refreshAndCloseBanUserModal"
      />
    </UModal>
    <UModal v-model="unbanUserModal">
      <AdminUnbanUser
        v-if="selectedUser"
        :user="selectedUser"
        @close="refreshAndCloseUnbanUserModal"
      />
    </UModal>
  </AppPageContainer>
</template>

<script setup>
import { toast } from "vue-sonner";
import { refDebounced } from "@vueuse/core";

const maskEmails = ref(true);
const addUserModal = ref(false);
const search = ref("");
const selectedFilter = ref("all");
const page = ref(1);
const pageSize = ref(10);
const totalUsers = ref(0);
const deletingUserId = ref(null);
const debouncedSearch = refDebounced(search, 350);

const banUserModal = ref(false);
const unbanUserModal = ref(false);
const selectedUser = ref(null);

const filters = [
  { label: "Todos os usuários", value: "all" },
  { label: "Usuários verificados", value: "verified" },
  { label: "Usuários não verificados", value: "unverified" },
  { label: "Usuários Google", value: "google" },
  { label: "Usuários GitHub", value: "github" },
];

const {
  data: usersData,
  status,
  error,
  refresh,
} = await useFetch("/api/admin/users", {
  query: computed(() => ({
    page: page.value,
    pageSize: pageSize.value,
    search: debouncedSearch.value,
    filter:
      selectedFilter.value === "Todos os usuários"
        ? "all"
        : selectedFilter.value.toLowerCase().replace(" usuários", ""),
  })),
  watch: [debouncedSearch, selectedFilter, page, pageSize],
});

const users = computed(() => usersData.value?.users || []);
watchEffect(() => {
  if (usersData.value) {
    totalUsers.value = usersData.value.totalCount;
  }
});

watchEffect(() => {
  if (error.value) {
    console.error(error.value);
    toast.error("Erro ao buscar usuários");
  }
});

const getActionItems = row => [
  [
    {
      label: "Enviar e-mail de redefinição de senha",
      icon: "i-ph-lock-key-open-duotone",
      click: () => sendPasswordResetEmail(row.id),
    },
    {
      label: "Enviar link de login mágico",
      icon: "i-ph-envelope-duotone",
      click: () => sendLoginLink(row.id),
    },
  ],
  [
    {
      label: `${row.banned ? "Desbloquear" : "Bloquear"} usuário`,
      icon: "i-ph-user-circle-minus-duotone",
      click: () => openBanUnbanModal(row),
    },
    {
      label: "Deletar usuário",
      icon: "i-ph-trash-duotone",
      loading: deletingUserId.value === row.id,
      click: () => deleteUser(row.id),
    },
  ],
];

const deleteUser = async userId => {
  console.log(`Deleting user with ID: ${userId}`);
  try {
    deletingUserId.value = userId;
    await $fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    toast.success("Usuário deletado com sucesso");
    refresh();
  } catch (error) {
    console.error(error);
    toast.error("Erro ao deletar usuário");
  } finally {
    deletingUserId.value = null;
  }
};

const openBanUnbanModal = user => {
  selectedUser.value = user;
  if (user.banned) {
    unbanUserModal.value = true;
  } else {
    banUserModal.value = true;
  }
};

const refreshAndCloseBanUserModal = () => {
  refresh();
  banUserModal.value = false;
  selectedUser.value = null;
};

const refreshAndCloseUnbanUserModal = () => {
  refresh();
  unbanUserModal.value = false;
  selectedUser.value = null;
};

watch([banUserModal, unbanUserModal], ([newBanModal, newUnbanModal]) => {
  if (!newBanModal && !newUnbanModal) {
    selectedUser.value = null;
  }
});

const sendPasswordResetEmail = async userId => {
  try {
    await $fetch(`/api/admin/users/${userId}/send-password-reset-email`);
    toast.success("E-mail de redefinição de senha enviado com sucesso");
  } catch (error) {
    console.error(error);
    toast.error("Erro ao enviar e-mail de redefinição de senha");
  }
};

const sendLoginLink = async userId => {
  try {
    await $fetch(`/api/admin/users/${userId}/send-login-link`, {
      method: "POST",
    });
    toast.success("Link de login enviado com sucesso");
  } catch (error) {
    console.error(error);
    toast.error("Erro ao enviar link de login");
  }
};

const refreshAndCloseAddUserModal = () => {
  refresh();
  addUserModal.value = false;
};
</script>
