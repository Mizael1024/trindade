import { useDB } from '../../utils/db'
import { tables } from '../../utils/db'

export default defineEventHandler(async () => {
  const db = useDB()
  
  try {
    const voices = await db.select().from(tables.elevenlabs)
    
    return voices.map(voice => ({
      id: voice.id,
      name: voice.name,
      gender: voice.gender,
      language: voice.language || 'pt-BR', // Adicionando o campo language
      category: voice.category,
      description: voice.category === 'filmes' ? 'Filmes' : 
                  voice.category === 'animacoes' ? 'Animações' : 
                  '',
      profileUrl: voice.profileUrl || '/images/default-voice-avatar.png',
      previewUrl: voice.sampleUrl,
      elevenLabsId: voice.elevenLabsId,
      is_pro: voice.is_pro ? 1 : 0
    }))
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Erro ao carregar biblioteca de vozes'
    })
  }
})