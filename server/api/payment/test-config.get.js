export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  return {
    hasStripe: !!config.stripe,
    hasSecretKey: !!config.stripe?.secretKey,
    baseUrl: config.public.baseUrl
  }
})
