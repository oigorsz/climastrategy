# 🌦️ ClimaStrategy

### Passo 1: Backend (API)

1. **Abra o terminal cmd** e navegue até a pasta do projeto:
   ```bash
   cd climastrategy
   ```

2. Instalar as dependências do projeto:
    ```bash 
    npm install
    ```

3. Crie um arquivo chamado .env na raiz do projeto (mesma pasta do package.json) e cole o seguinte conteúdo:
    ```bash
    # URL do Banco de Dados SQLite
    DATABASE_URL="file:./dev.db"

    # API Key pública do OpenWeather
    OPENWEATHER_API_KEY="0565bd65834ef38169ab1ce2bfe1485d"
    ```

4. Configurar Banco de Dados:
    ```bash
    npx prisma migrate dev
    ```

5. Iniciar servidor:
    ```bash
    npm run dev
    ```

### Passo 2: Frontend

1. Na pasta public, clique com o botão direito no arquivo index.html.

2. Selecione a opção *Open with Live Server*.

3. O navegador abrirá automaticamente com o dashboard.


