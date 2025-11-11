import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import authRoute from './routes/auth.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoute);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/api/validate-startup", async (req, res) => {
  try {
    const {
      businessName,
      industry,
      description,
      targetMarket,
      problemSolving,
      uniqueValue,
      businessModel,
      funding,
      timeline,
      experience,
    } = req.body;

    const prompt = `
You are an expert startup analyst. 
Generate a complete startup evaluation report in JSON format only. 
Follow the schema exactly. Do not include any explanation outside the JSON.

Startup Details:
- Name: ${businessName}
- Industry: ${industry}
- Description: ${description}
- Target Market: ${targetMarket}
- Problem Solved: ${problemSolving}
- Unique Value: ${uniqueValue}
- Business Model: ${businessModel}
- Funding: ${funding}
- Timeline: ${timeline}
- Experience: ${experience}

Schema:
{
  "executiveOverview": {
    "summary": "string",
    "metrics": [{ "label": "string", "value": "string" }],
    "highlights": ["string"]
  },
  "financials": {
    "summary": "string",
    "revenue": [
      { "year": "Year 1", "Revenue": number },
      { "year": "Year 2", "Revenue": number },
      { "year": "Year 3", "Revenue": number }
    ],
    "kpis": [
      { "label": "CAC", "value": "string" },
      { "label": "LTV", "value": "string" },
      { "label": "Burn Rate", "value": "string" }
    ],
    "insights": ["string"]
  },
  "marketCompetition": { 
  "summary": "string",
  "stats": [
    { "name": "Competitor A", "value": number },
    { "name": "Competitor B", "value": number },
    { "name": "Competitor C", "value": number },
    { "name": "Others", "value": number }
  ],
  "drivers": ["string"],
  "competitors": [
    { "name": "string", "detail": "string" }
  ],
  "radar": [
    { "aspect": "Pricing", "You": number, "Competitors": number },
    { "aspect": "Innovation", "You": number, "Competitors": number },
    { "aspect": "Support", "You": number, "Competitors": number },
    { "aspect": "Scalability", "You": number, "Competitors": number }
  ],
  "insights": ["string"]
  },
  "productValidation": {"summary": "string",
  "metrics": [
    { "label": "string", "value": "string" }
  ],
  "trends": [
    { "month": "string", "MVP": number, "Advanced": number }
  ],
  "feedback": ["string"]
  },
  "recommendations": {
    "summary": "string",
    "actions": [{ "title": "string", "tasks": ["string"] }],
    "risks": [{ "risk": "string", "mitigation": "string" }],
    "finalNote": "string"
  }
}

Return only valid JSON.
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    let text = result.response.text();

    // Clean code fences if any
    text = text.replace(/```json|```/g, "").trim();

    // Parse JSON
    const data = JSON.parse(text);

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate report", details: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
