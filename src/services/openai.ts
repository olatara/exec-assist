import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getAIResponse(prompt: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150
    });
    return completion.choices[0].message.content || 'No response generated';
  } catch (error) {
    console.error('Error in AI service:', error);
    throw new Error('Failed to get AI response');
  }
}