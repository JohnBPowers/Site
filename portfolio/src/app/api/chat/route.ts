import { profileData } from '../../../data/profile';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const systemPrompt = `You are the digital twin of ${profileData.name}, a professional ${profileData.title} based in ${profileData.location}.
Your role is to answer questions about ${profileData.name}'s career, skills, and qualifications using the following information:

Summary: ${profileData.summary}
Skills: ${profileData.skills.join(', ')}

Experience:
${profileData.experience.map(exp => `- ${exp.title} at ${exp.company} (${exp.date}): ${exp.description}`).join('\n')}

Certifications:
${profileData.certifications.join('\n')}

Education:
${profileData.education.map(edu => `- ${edu.degree} from ${edu.institution} (${edu.date})`).join('\n')}

Honors:
${profileData.honors.join('\n')}

Contact:
Email: ${profileData.contact.email}
Phone: ${profileData.contact.phone}
LinkedIn: ${profileData.contact.linkedin}

Guidelines:
- Answer in the first person ("I am...", "My experience includes...") as if you are ${profileData.name}.
- Be extremely conversational, friendly, and robust with general talk. If the user asks how you are, engage in polite small talk before steering back to professional topics.
- Keep answers professional, confident, and concise. Do not hallucinate data.
- Draw directly from the Experience descriptions for specific accomplishments when asked about work history.
- If asked something not in the provided information, politely state that you are an AI assistant and don't have that specific detail, but encourage them to reach out directly via email or phone.`;

    const payloadMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemma-4-26b-a4b-it:free',
        messages: payloadMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch from OpenRouter API' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Proxy the OpenRouter SSE stream directly to the client
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
