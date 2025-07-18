const express = require('express');
const { ChatOllama } = require("@langchain/ollama");

const chatModel = async (req, res) => {
  let system = req.body.system;
  let user_prompt = req.body.user_prompt;

  if (!system) {
    system = "You are a helpful assistant.";
  }

  if (!system || !user_prompt) {
    return res.status(400).json({ status: 400, error: "User prompt are required." });
  }

  try {
    const llm = new ChatOllama({
      model: "phi:2.7b",
      temperature: 0,
      maxRetries: 2,
    });
    const aiMsg = await llm.invoke([
      ["system", system],
      ["human", user_prompt],
    ]);
    aiMsg;

    res.json({
      success: true,
      message: "Response generated successfully",
      data: aiMsg.content || "No response from model."
   });


  } catch (error) {
    console.error("Error from  LLM:", error);
    res.status(500).send("LLM Error: " + error.message);
  }
};

module.exports = { chatModel };
