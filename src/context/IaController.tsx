
interface Message {
  role: string;
  parts: { text: string }[];
}

// Não é possível usar hooks fora de componentes React
// const { userData, authUser } = useAuth() ← Este código não funcionará aqui

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

  private formatMessage(userMessage: string, name: string, userData: string): { contents: Message[] } {
    //aqui precisa vir o userData pra repassar pra IA os dados do usuario
    const formattedMessage = `Nome Aluno: ${name}; Nome Trilha Atual: AGORA; Etapa Atual: 01; Mensagem usuário: ${userMessage}`;

    return {
      contents: [
        {
          role: "user",
          parts: [{ text: formattedMessage }],
        },
      ],
    };
  }

  async sendMessage(userMessage: string, name:string, userData: any, authUser?: any): Promise<string> {
    try {
      const payload = this.formatMessage(userMessage, name, userData);
  
      const response = await fetch(`${this.baseUrl}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }, 
        body: JSON.stringify({
          userData,
          authUser,
          ...payload,
        }), // Corrigido: não devemos envolver payload em outro objeto
      });
      
      if (!response.ok) {
        throw new Error(`Erro na resposta: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
  
      console.log("Resposta completa do servidor:", data);
  
      // Tente capturar a resposta com base no que foi recebido
      const aiResponse = data[0]?.response;
  
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
        error instanceof Error ? error.message : String(error)
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