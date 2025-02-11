import axios from "axios";

interface Message {
  role: string;
  parts: { text: string }[];
}

class ConversationAssistent {
  private baseUrl: string;
  private conversationSystem: Message[];

  constructor() {
    this.baseUrl = "https://workflow.educagame.com.br/webhook/assistente-virtual";

    this.conversationSystem = [
      {
        role: "system",
        parts: [
          {
            text: ``,
          },
        ],
      },
    ];
  }

  private formatMessage(userMessage: string): { contents: Message[] } {
    const formattedMessage = `Nome Aluno: Vittor; Nome Trilha Atual: AGORA; Etapa Atual: 01; Mensagem usuário: ${userMessage}`;

    return {
      contents: [
        {
          role: "user",
          parts: [{ text: formattedMessage }],
        },
      ],
    };
  }

  async sendMessage(userMessage: string): Promise<string> {
    try {
      const payload = this.formatMessage(userMessage);
  
      const response = await axios.post(
        `${this.baseUrl}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      console.log("Resposta completa do servidor:", response.data);
  
      // Tente capturar a resposta com base no que foi recebido
      const aiResponse = response.data[0]?.response;
  
      if (!aiResponse) {
        throw new Error("Resposta inesperada do servidor.");
      }
  
      this.conversationSystem.push(payload.contents[0]);
      this.conversationSystem.push({
        role: "model",
        parts: [{ text: aiResponse }],
      });
  
      return aiResponse;
    } catch (error: unknown) {
      console.error(
        "Erro ao enviar mensagem para a Gemini:",
        error instanceof Error ? error.message : 
        axios.isAxiosError(error) ? error.response?.data : 
        String(error)
      );
      throw error;
    }
  }
  
  

  // Método para recuperar o histórico de conversação
  getConversationSystem(): Message[] {
    return this.conversationSystem;
  }

  // Método para limpar o histórico de conversação
  clearConversationSystem(): void {
    this.conversationSystem = this.conversationSystem.slice(0, 1);
  }
}

export default new ConversationAssistent();