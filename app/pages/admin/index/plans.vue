<template>
  <AppPageContainer
    title="Planos"
    description="Gerenciamento de planos de assinatura"
  >
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-2">
        <UInput
          v-model="search"
          icon="i-heroicons-magnifying-glass-20-solid"
          color="white"
          :trailing="false"
          class="w-full"
          placeholder="Buscar por nome"
        />
      </div>
      <div class="flex items-center gap-2">
        <UButton @click="addPlanModal = true" label="Adicionar Plano" color="white" />
      </div>
    </div>

    <div class="rounded-lg border border-gray-200 dark:border-white/10">
      <UTable :rows="filteredPlans" :columns="columns">
        <template #price-data="{ row }">
          {{ formatCurrency(row.price) }}
        </template>

        <template #created_at-data="{ row }">
          {{ formatDate(row.created_at) }}
        </template>

        <template #actions-data="{ row }">
          <UDropdown :items="getActionItems(row)">
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-ellipsis-horizontal-20-solid"
            />
          </UDropdown>
        </template>
      </UTable>
    </div>

    <!-- Modal Adicionar/Editar Plano -->
    <UModal v-model="addPlanModal">
      <div class="p-4">
        <h3 class="text-lg font-semibold mb-4">
          {{ editingPlan ? 'Editar' : 'Adicionar' }} Plano
        </h3>
        <form @submit.prevent="savePlan" class="space-y-4">
          <UFormGroup label="Nome">
            <UInput v-model="planForm.name" />
          </UFormGroup>
          <UFormGroup label="Offer ID">
            <UInput v-model="planForm.offer_id" />
          </UFormGroup>
          <UFormGroup label="Créditos">
            <UInput v-model.number="planForm.credits" type="number" />
          </UFormGroup>
          <UFormGroup label="Créditos Mensais">
            <UInput v-model.number="planForm.monthly_credits" type="number" />
          </UFormGroup>
          <UFormGroup label="Duração (dias)">
            <UInput v-model.number="planForm.duration" type="number" />
          </UFormGroup>
          <UFormGroup label="Tipo">
            <UInput v-model="planForm.type" />
          </UFormGroup>
          <UFormGroup label="Preço">
            <UInput v-model.number="planForm.price" type="number" />
          </UFormGroup>
          <UFormGroup label="Stripe Price ID">
            <UInput v-model="planForm.priceId_stripe" />
          </UFormGroup>
          <UFormGroup label="Stripe Product ID">
            <UInput v-model="planForm.productId_stripe" />
          </UFormGroup>

          <div class="flex justify-end gap-2">
            <UButton
              color="gray"
              variant="soft"
              @click="addPlanModal = false"
              label="Cancelar"
            />
            <UButton
              type="submit"
              color="primary"
              :loading="saving"
              :label="editingPlan ? 'Salvar' : 'Criar'"
            />
          </div>
        </form>
      </div>
    </UModal>
  </AppPageContainer>
</template>

<script setup>
import { ref, computed } from 'vue';
import { toast } from 'vue-sonner';
import { useDateFormat } from '@vueuse/core';

const addPlanModal = ref(false);
const search = ref('');
const saving = ref(false);
const editingPlan = ref(null);

const { data: plans, refresh } = await useFetch('/api/admin/plans');

const planForm = ref({
  name: '',
  offer_id: '',
  credits: 0,
  monthly_credits: 0,
  duration: 30,
  type: '',
  price: 0,
  priceId_stripe: '',
  productId_stripe: ''
});

const columns = [
  { key: 'name', label: 'Nome' },
  { key: 'credits', label: 'Créditos' },
  { key: 'monthly_credits', label: 'Créditos Mensais' },
  { key: 'duration', label: 'Duração' },
  { key: 'type', label: 'Tipo' },
  { key: 'price', label: 'Preço' },
  { key: 'created_at', label: 'Criado em' },
  { key: 'actions', label: '' }
];

const filteredPlans = computed(() => {
  if (!search.value) return plans.value;
  return plans.value.filter(plan => 
    plan.name.toLowerCase().includes(search.value.toLowerCase())
  );
});

const formatDate = (date) => {
  return useDateFormat(new Date(date), 'DD/MM/YYYY HH:mm');
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value / 100);
};

const getActionItems = (row) => [
  [
    {
      label: 'Editar',
      icon: 'i-heroicons-pencil-20-solid',
      click: () => editPlan(row),
    },
    {
      label: 'Excluir',
      icon: 'i-heroicons-trash-20-solid',
      click: () => deletePlan(row.id),
    },
  ],
];

const editPlan = (plan) => {
  editingPlan.value = plan;
  planForm.value = { ...plan };
  addPlanModal.value = true;
};

const savePlan = async () => {
  try {
    saving.value = true;
    const endpoint = '/api/admin/plans';
    const method = editingPlan.value ? 'PUT' : 'POST';
    
    await $fetch(endpoint, {
      method,
      body: planForm.value
    });

    toast.success(`Plano ${editingPlan.value ? 'atualizado' : 'criado'} com sucesso`);
    addPlanModal.value = false;
    editingPlan.value = null;
    refresh();
  } catch (error) {
    toast.error(`Erro ao ${editingPlan.value ? 'atualizar' : 'criar'} plano`);
  } finally {
    saving.value = false;
  }
};

const deletePlan = async (id) => {
  if (!confirm('Tem certeza que deseja excluir este plano?')) return;
  
  try {
    await $fetch(`/api/admin/plans/${id}`, {
      method: 'DELETE'
    });
    toast.success('Plano excluído com sucesso');
    refresh();
  } catch (error) {
    toast.error('Erro ao excluir plano');
  }
};
</script>
