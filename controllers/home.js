const { InferenceClient } = require('@huggingface/inference');
const dotenv = require('dotenv');
dotenv.config();
const client = new InferenceClient(process.env.HF_TOKEN);
const mcq = async (req, res) => {
  const { topic } = req.body;
  if (!topic || typeof topic !== "string" || topic.trim() === "") {
    return res.status(400).json({ error: "Topic is required and must be a non-empty string." });
  }
  try {
    const topic = "Node.js";
    const prompt = `
You are a JSON-only generator.

Generate exactly 3 multiple choice questions (MCQs) on the topic "Node.js".
Each question should have:
- A 'question' field (string)
- An 'options' array with 4 choices labeled A-D
- A 'correct_answer' field with a single letter (A, B, C, or D)

⚠️ Output only valid JSON. No explanations, no <think> tags, no markdown, no code blocks.

Example format:
{
  "questions": [
    {
      "question": "Your question here?",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct_answer": "A"
    }
  ]
}
Now generate the JSON:
`;

    const generationResponse = await client.chatCompletion({
      provider: "fireworks-ai",
      model: "deepseek-ai/DeepSeek-R1", // Or any conversational model
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const mcqJsonText = generationResponse.choices[0].message.content;
    console.log("Raw MCQ JSON:", mcqJsonText);

  } catch (error) {
    console.error("Error in mcq generation:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = { mcq };
