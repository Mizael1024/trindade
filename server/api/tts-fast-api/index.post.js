import https from 'node:https'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { text, voice_id, language = 'pt' } = body

  if (!text || !voice_id) {
    throw createError({
      statusCode: 400,
      message: 'Parâmetros obrigatórios ausentes',
    })
  }

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      text,
      speaker_wav: voice_id,
      language
    })

    const options = {
      hostname: '8020-01jdgjk58xr1nwcd5589t30atp.cloudspaces.litng.ai',
      port: 443,
      path: '/tts_to_audio/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Origin': 'http://localhost:3000',
        'User-Agent': 'Mozilla/5.0',
      },
      rejectUnauthorized: false
    }

    console.log('Iniciando requisição TTS:', { text, speaker_wav: voice_id, language })

    const req = https.request(options, (res) => {
      console.log('Status:', res.statusCode)
      console.log('Headers:', res.headers)

      const chunks = []
      res.on('data', (chunk) => chunks.push(chunk))
      
      res.on('end', () => {
        const audioBuffer = Buffer.concat(chunks)
        console.log('Tamanho do áudio recebido:', audioBuffer.length, 'bytes')

        event.node.res.setHeader('Content-Type', 'audio/wav')
        event.node.res.setHeader('Content-Length', audioBuffer.length)
        event.node.res.setHeader('Content-Disposition', 'attachment; filename="output.wav"')
        
        resolve(audioBuffer)
      })
    })

    req.on('error', (error) => {
      console.error('Erro na requisição:', error)
      reject(createError({
        statusCode: 500,
        message: 'Falha na conexão com o servidor TTS',
        cause: error
      }))
    })

    req.setTimeout(60000, () => {
      req.destroy()
      reject(createError({
        statusCode: 504,
        message: 'Timeout na requisição'
      }))
    })

    req.write(postData)
    req.end()
  })
})