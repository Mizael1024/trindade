export default defineEventHandler(async (event) => {
  console.log('Iniciando requisição para buscar vozes...')
  
  try {
    const response = await fetch('https://8020-01jdgjk58xr1nwcd5589t30atp.cloudspaces.litng.ai/speakers_list', {
      headers: {
        'accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('Vozes recebidas:', data)
    
    return data
    
  } catch (error) {
    console.error('Erro ao buscar vozes:', error)
    throw createError({
      statusCode: 500,
      message: `Erro ao buscar lista de vozes: ${error.message}`
    })
  }
})