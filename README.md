# climastrategy

# 🌦️ ClimaStrategy

> Uma aplicação Fullstack para decisão de atividades baseada em condições climáticas, implementada com **Padrão Strategy**, **TypeScript** e **Arquitetura em Camadas**.

![Badge Status](https://img.shields.io/badge/Status-Concluido-brightgreen)
![Badge License](https://img.shields.io/badge/License-MIT-blue)
![Badge TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![Badge Node](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![Badge Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)

---

## 📖 Sobre o Projeto

O **ClimaStrategy** é um sistema que auxilia usuários a decidirem se o clima atual (ou futuro) é apropriado para realizar atividades específicas, como "Correr", "Ir à Praia" ou "Fazer Piquenique".

O diferencial deste projeto não é apenas o consumo de API, mas a **Arquitetura de Software** utilizada. Ao invés de condicionais complexas (`if/else`), o sistema utiliza o **Padrão de Projeto Strategy (GOF)** para encapsular as regras de negócio de cada atividade em classes isoladas, garantindo escalabilidade e facilidade de manutenção.

### ✨ Funcionalidades

* **Verificação Climática:** Análise automática baseada em temperatura, chuva, vento e umidade.
* **CRUD de Cards:** Salvar, listar, atualizar e remover resultados no Dashboard.
* **Histórico (Audit Log):** Registro automático de todas as operações (Create/Update/Delete) via transações atômicas no banco.
* **Previsão Futura:** Modal interativo que projeta a viabilidade da atividade para os próximos 5 dias.
* **Frontend Reativo:** Interface construída com Vanilla JS (sem frameworks), consumindo a API REST.

---

## 🛠️ Tecnologias e Arquitetura

O projeto foi desenvolvido focando nos princípios **SOLID** e **POO**.

### Stack Tecnológica
* **Backend:** Node.js, TypeScript, Express.js.
* **Banco de Dados:** SQLite (arquivo local), Prisma ORM.
* **API Externa:** OpenWeather (Forecast e Current Weather).
* **Frontend:** HTML5, CSS3, JavaScript (ES6+).

### Padrão Strategy (O "Coração" do Projeto)
A validação de clima segue o seguinte fluxo de classes:

1.  **Interface (`IEstrategiaAtividade`):** Contrato que obriga a implementação do método `verificarApropriado`.
2.  **Estratégias Concretas (`EstrategiaCorrer`, `EstrategiaPraia`):** Classes que contêm a lógica específica de cada atividade.
3.  **Contexto (`ClimaService`):** Gerencia e executa a estratégia correta baseada na escolha do usuário, sem acoplamento.

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos
* Node.js (v18 ou superior)
* NPM

### Passo a Passo

1.  **Clone o repositório**
    ```bash
    git clone [https://github.com/SEU-USUARIO/climastrategy.git](https://github.com/SEU-USUARIO/climastrategy.git)
    cd climastrategy
    ```

2.  **Instale as dependências**
    ```bash
    npm install
    ```

3.  **Configure as Variáveis de Ambiente**
    Crie um arquivo `.env` na raiz do projeto e adicione:
    ```env
    DATABASE_URL="file:./dev.db"
    OPENWEATHER_API_KEY="SUA_CHAVE_AQUI"
    # Nota: Use a chave do OpenWeather. Se não tiver, crie uma conta gratuita.
    ```

4.  **Configure o Banco de Dados**
    Execute a migração e o seed (popula as atividades iniciais):
    ```bash
    npx prisma migrate dev
    ```

5.  **Inicie o Servidor (Backend)**
    ```bash
    npm run dev
    ```
    *O servidor rodará em `http://localhost:3000`.*

6.  **Acesse o Frontend**
    * Vá até a pasta `public/` do projeto.
    * Abra o arquivo `index.html` no seu navegador.

---

## 🔌 Documentação da API

O backend expõe os seguintes endpoints REST:

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/atividades` | Lista as atividades disponíveis (para popular o select). |
| `GET` | `/cards` | Lista todos os cards salvos no dashboard. |
| `POST` | `/cards` | Cria um novo card. Body: `{ "cidade": "...", "atividadeId": "..." }`. |
| `PUT` | `/cards/:id` | Atualiza os dados climáticos de um card existente. |
| `DELETE`| `/cards/:id` | Remove um card e gera log de histórico. |
| `GET` | `/cards/:id/forecast` | Retorna a previsão de 5 dias com a análise da estratégia. |

---

## 📂 Estrutura de Pastas
