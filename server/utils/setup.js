import { initVoiceClonePlans } from './init-voice-clone-plans';

export async function setupApplication() {
  // ... outras inicializações ...
  
  await initVoiceClonePlans();
  
  // ... continuação do setup ...
}
