<template>
  <div>
    <input v-model="email" placeholder="Email" />
    <input v-model="name" placeholder="Name" />
    <input v-model="password" placeholder="Password" />
    <button @click="handleRegister">Register</button>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const email = ref('');
    const name = ref('');
    const password = ref('');

    const handleRegister = async () => {
      try {
        console.log('🌐 Frontend: Iniciando registro', {
          email: email.value,
          name: name.value
        });
        
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email.value,
            name: name.value,
            password: password.value
          })
        });

        console.log('🌐 Frontend: Resposta recebida', await response.json());
      } catch (error) {
        console.error('🌐 Frontend: Erro no registro', error);
      }
    };

    return {
      email,
      name,
      password,
      handleRegister
    };
  }
};
</script>
