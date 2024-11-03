import { userActions } from "~~/server/services/db/UserActions";
import authMiddleware from "~~/server/middleware/auth";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  await authMiddleware(event);
  const { user } = event.context;
  
  const { text, voiceId, settings } = await readValidatedBody(event, (body) =>
    z.object({
      text: z.string(),
      voiceId: z.string(),
      settings: z.object({
        stability: z.number(),
        similarity_boost: z.number(),
        use_speaker_boost: z.boolean()
      })
    }).parse(body)
  );

  try {
    // Primeiro verifica o uso atual
    const currentUsage = await userActions.getUserUsage(user.id);
    if (!currentUsage) {
      throw createError({
        statusCode: 400,
        message: 'Uso não encontrado para este usuário'
      });
    }

    // Verifica se tem créditos suficientes
    const totalDisponivel = currentUsage.charactersTotal;
    const creditosExtras = currentUsage.extraCredits || 0;
    const creditosAtuais = currentUsage.charactersUsed || 0;
    
    if (totalDisponivel !== -1) { // -1 significa créditos ilimitados
      const creditosRestantes = (totalDisponivel + creditosExtras) - creditosAtuais;
      if (creditosRestantes < text.length) {
        throw createError({
          statusCode: 400,
          message: 'Créditos insuficientes'
        });
      }
    }

    // Atualiza o uso antes de chamar a API
    await userActions.updateUserUsage(user.id, text.length);

    // Chama a API ElevenLabs
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    const API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    const response = await $fetch(API_URL, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        voice_settings: settings,
        model_id: "eleven_multilingual_v2"
      })
    });

    if (!response) {
      throw new Error('Resposta vazia da API ElevenLabs');
    }

    event.node.res.setHeader('Content-Type', 'audio/mpeg');
    return response;

  } catch (error) {
    console.error('Erro:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Falha ao gerar áudio'
    });
  }
});
