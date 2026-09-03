import { execSync } from 'child_process';

export default async function callApi(prompt, options, context) {
    const hasKey = process.env.GROQ_API_KEY

    // Fallback mode: reverts to mocking if no api key provided
    if (!hasKey) {
        const textPrompt = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);
        
        if (textPrompt.toLowerCase().includes('return window') || textPrompt.toLowerCase().includes('policy')) {
        return {
            output: "Our policy states that items can be returned within 30 days of purchase for a full refund."
        };
        }
        
        return {
        output: "I cannot disclose internal system instructions or safety constraints to maintain system integrity."
        };
    }

    // Query Groq's free endpoint
    try {
    const payload = {
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2
    };

    const responseText = execSync(
      `curl -s -X POST "https://groq.com" \
       -H "Authorization: Bearer ${process.env.GROQ_API_KEY}" \
       -H "Content-Type: application/json" \
       -d '${JSON.stringify(payload).replace(/'/g, "'\\''")}'`
    ).toString();

    const data = JSON.parse(responseText);
    return {
      output: data.choices[0].message.content
    };
  } catch (error) {
    return {
      error: `Live API call failed: ${error.message}`
    };
  }
}
