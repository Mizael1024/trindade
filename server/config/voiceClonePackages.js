export const voiceClonePackages = {
  CLONE_5: {
    id: 'CINCO_CLONES',
    name: '5 Clones de Voz',
    credits: 5,
    priceId: process.env.CLONE_5_PRICE_ID || 'price_1QGTf2GJGCWWTgK5DpWJ8tdu',
    productId: process.env.CLONE_5_PRODUCT_ID
  },
  CLONE_1: {
    id: 'CLONE_1',
    name: 'Clone Individual', 
    credits: 1,
    priceId: process.env.CLONE_1_PRICE_ID || 'price_1QGTfCGJGCWWTgK5s5Drlwx3',
    productId: process.env.CLONE_1_PRODUCT_ID
  },
  CLONE_3: {
    id: 'CLONE_3',
    name: '3 Clones de Voz',
    credits: 3,
    priceId: process.env.CLONE_3_PRICE_ID || 'price_1QGTf5GJGCWWTgK5NDk2LrqJ',
    productId: process.env.CLONE_3_PRODUCT_ID
  }
};
