const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");
const { ChatOllama, OllamaEmbeddings } = require("@langchain/ollama");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { MemoryVectorStore } = require("langchain/vectorstores/memory");
const crypto = require("crypto");
const fs = require("fs");

// In-memory cache: fileHash → vectorStore
const vectorStores = new Map();

function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(fileBuffer).digest("hex");
}

const ragChatbotsGenerator = async (req, res) => {
  try {
    const docsContent = "public/extracted_text.pdf";
    const fileHash = getFileHash(docsContent);

    let vectorStore;
    console.log("fileHash", fileHash);
    if (vectorStores.has(fileHash)) {
      console.log("✅ Using cached vector store for file:", docsContent);
      vectorStore = vectorStores.get(fileHash);
    } else {
      console.log("Processing new file:", docsContent);

      // 1. Load PDF
      const loader = new PDFLoader(docsContent);
      const docs = await loader.load();

      // 2. Split into chunks
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 800,
        chunkOverlap: 120,
      });
      const splitDocs = await splitter.splitDocuments(docs);

      // 3. Create embeddings
      const embeddings = new OllamaEmbeddings({
        model: "mxbai-embed-large",
        baseUrl: "http://localhost:11434",
      });

      // 4. Store in vector DB
      vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);

      // 5. Save to cache
      vectorStores.set(fileHash, vectorStore);
    }

    // 6. Retrieval + Query
    const retriever = vectorStore.asRetriever({ k: 2 });
    const query = "website name";
    const retrievedDocs = await retriever.invoke(query);

    const llm = new ChatOllama({ model: "llama3.1", temperature: 0.2 });
    const context = retrievedDocs.map(d => d.pageContent).join("\n\n");

    const response = await llm.invoke([
      ["system", "You are a helpful assistant. Answer only from the given context."],
      ["human", `Context:\n${context}\n\nQuestion: ${query}`],
    ]);

    res.status(200).json({
      message: "RAG response generated successfully",
      llmResponse: response,
    });

  } catch (error) {
    console.error("❌ Error in RAG:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { ragChatbotsGenerator };
