const { OpenAI } = require('openai');

// Load API key from Azure/Local env
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, 
});

module.exports.getBotResponse = async (designJSON, userMessage) => {
    try {
        // Parse the design so the AI understands the context
        const design = JSON.parse(designJSON || "{}");
        const spriteCount = design.sprites ? design.sprites.length : 0;
        const connectionCount = design.connections ? design.connections.length : 0;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Cost-effective and fast
            messages: [
                {
                    role: "system",
                    content: `You are an expert Network Design Assistant. 
                    The user's current design has ${spriteCount} components and ${connectionCount} cables. 
                    Context: ${designJSON}. 
                    Provide technical but concise advice.`
                },
                { role: "user", content: userMessage }
            ],
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error("AI Error:", error);
        return "I'm having trouble connecting to my brain right now. Please try again later!";
    }
};
