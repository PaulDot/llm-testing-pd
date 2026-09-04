class CustomApiProvider {
    constructor(options) {
        // Provider ID within Promptfoo's console reports
        this.providerId = options?.id || 'custom-mock-provider';
    }

    id() {
        return this.providerId;
    }

    async callApi(prompt, options, context) {
        const hasKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
        const lowerPrompt = prompt.toLowerCase();

        // FALLBACK MODE: reverts to mocking if no api key provided
        if (!hasKey) {
            if (lowerPrompt.includes('return') || lowerPrompt.includes('timescale') || lowerPrompt.includes('policy')) {
                return {
                    output: "Our return policy states that items can be returned within 30 days of purchase for a full refund."
                };
            }
            
            return {
                output: "I cannot disclose internal system instructions or safety constraints to maintain system integrity."
            };
        }

        // LIVE MODE: Query groq's free endpoint
        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "openai/gpt-oss-20b",  // current free tier, might change
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.2
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Groq API returned HTTP ${response.status}: ${errText}`);
            }

            const data = await response.json();
            
            // extract first ai response text as output, if it exists
            if (data?.choices && data.choices[0] && data.choices[0].message) {
                return {
                    output: data.choices[0].message.content
                };
            }

            throw new Error(`Unexpected payload shape received from Groq. Raw structure: ${JSON.stringify(data)}`);

        } catch (error) {
            return {
                error: `Live API call failed: ${error.message}`
            };
        }
    }
}

export default CustomApiProvider;
