declare global {
    namespace NodeJS {
      interface ProcessEnv {
        MONGODB_URI: string
        JWT_SECRET: string
        NEXTAUTH_SECRET: string
        KHALTI_SECRET_KEY: string
        NEXT_PUBLIC_APP_URL: string
      }
    }
  }
  
  export {}
  