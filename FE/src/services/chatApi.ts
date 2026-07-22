const API_URL = '/api/chat';

export interface ChatMessage {
  id: string;
  text: string;
  role: 'user' | 'ai';
  timestamp: number;
}

export const sendMessageToAI = async (message: string, history: ChatMessage[]) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, history }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending message to AI:', error);
    throw error;
  }
};
