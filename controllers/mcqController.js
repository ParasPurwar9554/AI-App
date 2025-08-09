require("dotenv").config();
const { ChatOllama } = require("@langchain/ollama");
const { RunnableSequence, RunnableLambda } = require("@langchain/core/runnables");
const { ChatPromptTemplate } = require("@langchain/core/prompts");

const mcqGenerator = async (req, res, next) => {
  try {
    const difficultyArr = ["easy", "medium", "hard"];
    const inputtopic = req.body.topic;
    const difficulty = req.body.difficulty;
    const numberofquestion = req.body.numberofquestion;

    // Validation
    if (!inputtopic) {
      return res.status(400).json({ error: "Topic is required!" });
    }

    if (!difficulty || !difficultyArr.includes(difficulty)) {
      const error = new Error("Difficulty is required! It should be one of: easy, medium, hard.");
      error.status = 400;
      return next(error);
    }

    if (!numberofquestion || parseInt(numberofquestion) <= 0) {
      const error = new Error("Number of questions is required and should be a positive number.");
      error.status = 400;
      return next(error);
    }

    if (numberofquestion > 10) {
      const error = new Error("Number of questions should not exceed 10.");
      error.status = 400;
      return next(error);
    }

    const llm = new ChatOllama({ model: "llama3.1:latest", temperature: 0.1 });

    // Chain 1: Explain Topic
    const explainPrompt = ChatPromptTemplate.fromMessages([
      ["system", "You are a teacher. Explain the topic in 5 lines."],
      ["user", "Topic: {topic}"],
    ]);
    const explainChain = explainPrompt.pipe(llm);

    // Chain 2: Generate MCQs
    const mcqPrompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are a helpful assistant that generates multiple-choice questions (MCQs) and formats them as a JSON array.
Your output must only contain an array of {numberofquestion} JSON MCQ objects in this format:

[
  {{
    "question": "Question text?",
    "options": {{
      "A": "Option A text",
      "B": "Option B text",
      "C": "Option C text",
      "D": "Option D text"
      }},
    "answer": "B"
      }}
]
Respond ONLY with a raw JSON array. Do NOT add any text before or after it.`,
      ],
      ["human", "Generate {difficulty}-level MCQs about: {topic}"],
    ]);
    const formatRawChain = mcqPrompt.pipe(llm);

    // Lambda: Extract Input
    const extractInput = RunnableLambda.from(input => ({
      topic: input.topic,
      numberofquestion: input.numberofquestion,
    }));

    // Lambda: Run Explanation
    const runExplain = RunnableLambda.from(async ({ topic }) => {
      const explanation = await explainChain.invoke({ topic });
      return { topic, explanation: explanation.content };
    });

    // Lambda: Run MCQ Generation
    const runFormat = RunnableLambda.from(async ({ topic }) => {
      const response = await formatRawChain.invoke({ topic, numberofquestion, difficulty });
      return { response: response.content };
    });

    // Lambda: Clean JSON Output
    const cleanJsonResponse = RunnableLambda.from(async ({ response }) => {
      try {
        const parsed = JSON.parse(response); // should be a JSON array
        if (!Array.isArray(parsed)) {
          const error = new Error("Parsed content is not an array.");
          error.status = 400;
          return next(error);

        }
        return parsed;
      } catch (err) {
        console.error("❌ Failed to parse LLM JSON:\n", response);
        const error = new Error("Invalid JSON format received from model.");
        error.status = 400;
        return next(error);
      }
    });

    // Final Execution Chain
    const finalChain = RunnableSequence.from([extractInput,runExplain,runFormat,cleanJsonResponse]);

    const genertedMCQ = await finalChain.invoke({topic: inputtopic,numberofquestion: numberofquestion});

    return res.status(200).json({
      message: "MCQ generated successfully.", inputtopic, difficulty, numberofquestion, mcq: genertedMCQ,
    });

  } catch (error) {
    console.error("🚨 Error in MCQ generator:", error);
    next(error);
  }
};

module.exports = { mcqGenerator };
