import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getAIResponse(prompt: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300
    });
    return completion.choices[0].message.content || 'No response generated';
  } catch (error: any) {
    console.error('Error in AI service:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error?.message || 'Failed to get AI response');
  }
}
