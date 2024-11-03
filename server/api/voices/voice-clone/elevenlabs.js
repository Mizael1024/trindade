import axios from 'axios';
import FormData from 'form-data';
import { voiceCloneActions } from "~~/server/services/db/VoiceCloneActions";

// Sua API Key da ElevenLabs
const API_KEY = 'sk_94c5286809bb3d17376598001e8d6969ea8c0f2e98f19b24';

export default defineEventHandler(async (event) => {
  try {
    const { user } = await requireUserSession(event);
    const body = await readMultipartFormData(event);
    if (!body) throw new Error('Nenhum dado recebido');

    const name = body.find(item => item.name === 'name')?.data.toString();
    const description = body.find(item => item.name === 'description')?.data.toString() || '';
    const files = body.filter(item => item.name === 'files');

    const form = new FormData();
    form.append('name', name);
    form.append('description', description);
    form.append('labels', JSON.stringify({ "label1": "clonado" }));

    for (const file of files) {
      form.append('files', file.data, {
        filename: `audio_sample_${files.indexOf(file)}.mp3`,
        contentType: file.type
      });
    }

    const response = await axios.post(
      'https://api.elevenlabs.io/v1/voices/add',
      form,
      {
        headers: {
          ...form.getHeaders(),
          'xi-api-key': API_KEY
        }
      }
    );

    const savedVoice = await voiceCloneActions.createClonedVoice(user.id, {
      name: name,
      elevenLabsId: response.data.voice_id,
      status: 'ready',
      is_private: true,
      profileUrl: `https://api.elevenlabs.io/v1/voices/${response.data.voice_id}`,
      sampleUrl: `https://api.elevenlabs.io/v1/voices/${response.data.voice_id}/samples/audio`
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Erro na clonagem:', error.message);
    return {
      success: false,
      error: error.message || 'Erro ao clonar voz'
    };
  }
});
