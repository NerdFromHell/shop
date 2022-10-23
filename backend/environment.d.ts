declare global {
    namespace NodeJS {
      interface ProcessEnv {
            PORT: number,
            HOST: string,
            USER: string,
            PASS: string
            DB: string,
            CONN_LIMIT: number,
            SECRET_TOKEN: string
        }
    }
}

export { };