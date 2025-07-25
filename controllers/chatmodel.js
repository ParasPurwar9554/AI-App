const express = require('express');
const { ChatOllama } = require("@langchain/ollama");

const chatModel = async (req, res, next) => {
  let system = req.body.system;
  let user_prompt = req.body.user_prompt;

  if (!system) {
    system = "You are a helpful assistant.";
  }

  if (!user_prompt) {
    // Pass error to error handler middleware
    return next(new Error("User prompt are required."));
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

    res.json({
      success: true,
      message: "Response generated successfully",
      data: aiMsg.content || "No response from model."
    });

  } catch (error) {
    // Pass error to error handler middleware
    next(error);
  }
};

module.exports = { chatModel };
