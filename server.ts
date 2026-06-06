import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client on the server as required by gemini-api skill
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper model definition
const MODEL_NAME = "gemini-3.5-flash";

// API endpoints for AI Interview System

/**
 * Start an interview session by returning a greeting and the first custom question
 */
app.post("/api/interview/start", async (req, res) => {
  try {
    const { type, candidateRole, cvSummary } = req.body;
    
    const prompt = `You are a professional elite interviewer. The interview type is '${type || 'Technical'}'.
Candidate target role: '${candidateRole || 'Software Engineer'}'.
Candidate resume/CV profile: '${cvSummary || 'No resume uploaded yet'}'.

Initiate the interview. Greet the candidate in a highly professional, polite but firm futuristic recruiter persona. 
Ask the VERY FIRST realistic interview question. Keep it concise.
Return the output in clean JSON with exactly two fields:
- "greeting": A warm welcoming and opening message introducing yourself (give yourself a fitting name/identity).
- "firstQuestion": The first actual question to start the interview.
Do not format with raw text. Return standard JSON.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            greeting: { type: Type.STRING },
            firstQuestion: { type: Type.STRING }
          },
          required: ["greeting", "firstQuestion"]
        }
      }
    });

    const result = JSON.parse(response.text?.trim() || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Error starting interview session:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Respond to candidate answers & generate follow-up questions or final wrap-up
 */
app.post("/api/interview/respond", async (req, res) => {
  try {
    const { type, candidateRole, conversationHistory, latestAnswer, currentTurn, totalTurns } = req.body;
    
    // Formatting history to help model context
    const historyText = conversationHistory?.map((c: any) => `Q: ${c.question}\nA: ${c.answer}`).join("\n\n") || "";

    const prompt = `You are conducting an active '${type || 'Technical'}' interview for target role: '${candidateRole || 'Software Engineer'}'.
This is turn ${currentTurn} of ${totalTurns}.

Previous session flow:
${historyText}

Latest candidate answer:
"${latestAnswer}"

Tasks:
1. Provide a brief, realistic acknowledgements or technical transition comment regarding their answer (1-2 sentences).
2. Generate the next logical question. If it is high-tech, drill into their specific technology mentioned or behavioral response. If it's the final question, let them know.
Keep the follow-up concise.

Return the output in clean JSON with exactly one field:
- "nextQuestion": The response/acknowledgement followed by the next realistic question.
Do not format with raw markdown. Return standard JSON.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nextQuestion: { type: Type.STRING }
          },
          required: ["nextQuestion"]
        }
      }
    });

    const result = JSON.parse(response.text?.trim() || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Error in interview flow:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Generate final assessment, score, and communication roadmap once the interview is completed
 */
app.post("/api/interview/evaluate", async (req, res) => {
  try {
    const { type, candidateRole, conversationHistory } = req.body;

    const sessionFlow = conversationHistory?.map((c: any) => `Question: ${c.question}\nAnswer: ${c.answer}`).join("\n\n") || "";

    const prompt = `Analyze this completed interview performance for a '${candidateRole || 'Staff Developer'}' position.
Interview Type: ${type || 'Technical'}.

Complete Conversation Log:
${sessionFlow}

Examine their technical correctness, speech composition (clarity, structuring, logic), vocabulary selection, and professional presence.

Analyze:
1. Overall Performance Score (0 to 100)
2. Communication Score (0 to 100)
3. Confidence Score (0 to 100)
4. Grammar corrections and linguistic refinement suggestions
5. Professional vocabulary replacements and suggestions
6. Simulation of pronunciation or speaking flow issues based on their textual syntax
7. Specific professional strengths demonstrated
8. Recommended weaknesses to address
9. An actionable structured clinical correction and milestone roadmap

Return the evaluation in clean JSON format matching the schema properties below.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallPerformanceScore: { type: Type.INTEGER, description: "Scale 0-100 score of answers quality" },
            communicationScore: { type: Type.INTEGER, description: "Scale 0-100 score of phrasing and grammar" },
            confidenceScore: { type: Type.INTEGER, description: "Scale 0-100 of authority and declarative impact" },
            grammarCorrection: { type: Type.STRING, description: "Detailed Markdown structure highlighting exact errors corrected" },
            vocabularySuggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Vocabulary recommendations" },
            pronunciationImprovement: { type: Type.STRING, description: "Spoken tempo, timing, and enunciation tips" },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key positive traits" },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Constructive feedback" },
            improvementRoadmap: { type: Type.STRING, description: "Actionable milestones for peak performance" }
          },
          required: [
            "overallPerformanceScore",
            "communicationScore",
            "confidenceScore",
            "grammarCorrection",
            "vocabularySuggestions",
            "pronunciationImprovement",
            "strengths",
            "weaknesses",
            "improvementRoadmap"
          ]
        }
      }
    });

    const result = JSON.parse(response.text?.trim() || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Error evaluating interview:", error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint for English Communication Coach

app.post("/api/coach/analyze", async (req, res) => {
  try {
    const { text, targetContext } = req.body;

    const prompt = `You are a world-class English communication trainer and linguistic analyst.
A candidate has submitted this spoken or written English sample for analysis.
Provided context/objective: '${targetContext || 'Professional Corporate setting'}'.

Sample text for analysis:
"${text}"

Produce an instant holistic evaluation highlighting:
1. Grammar Correctness, phrasing quality, and highlighted updates
2. Vocabulary refinement recommendations with replacements
3. Pronunciation, spoken enunciation, rhythm, and tempo feedback
4. Speaking confidence, declarative clarity, and structural impact
5. Professional vocabulary alternative phrasing suggestions
6. Overall Communication score (0 to 100)
7. Overall Confidence score (0 to 100)
8. Actionable, step-by-step career improvement roadmap

Return the output strictly in the requested JSON structure.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            communicationScore: { type: Type.INTEGER },
            confidenceScore: { type: Type.INTEGER },
            grammarCorrection: { type: Type.STRING, description: "Markdown table showing Original, Corrected, and Explanation" },
            vocabularySuggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Upgraded alternative vocabulary words" },
            pronunciationAnalysis: { type: Type.STRING, description: "Feedback on vocal tempo, stress, rhythm, and clarity" },
            speakingConfidenceAnalysis: { type: Type.STRING, description: "Self-expression and authority review" },
            professionalSuggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Recommended alternate phrasings" },
            improvementRoadmap: { type: Type.STRING, description: "Markdown bullet structured developmental action items" }
          },
          required: [
            "communicationScore",
            "confidenceScore",
            "grammarCorrection",
            "vocabularySuggestions",
            "pronunciationAnalysis",
            "speakingConfidenceAnalysis",
            "professionalSuggestions",
            "improvementRoadmap"
          ]
        }
      }
    });

    const result = JSON.parse(response.text?.trim() || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Error analyzing communication profile:", error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint for Human Intelligence System & Executive Presence
app.post("/api/human-intel/analyze", async (req, res) => {
  try {
    const { role, eyeContact, facialExpressions, headMovement, sittingPosture, handGestures } = req.body;

    const prompt = `You are an elite executive presence, body language and career readiness consultant.
A candidate has submitted a requests for a Human Intelligence Analysis.
Target role of candidate: '${role || 'Software Engineer'}'.

Candidate presentation indicators:
- Eye Contact style/habits: "${eyeContact || 'Good eye contact, consistent'}"
- Facial Expressions: "${facialExpressions || 'Warm, engaging'}"
- Head Movement patterns: "${headMovement || 'Stable, occasional nods'}"
- Sitting Posture structure: "${sittingPosture || 'Upright, confident'}"
- Hand Gestures usage: "${handGestures || 'Expressive with hands'}"

Generate:
1. Presentation scores: Confidence Score (0-100), Body Language Score (0-100), and Professional Presence Score (0-100).
2. Dress Intelligence details matching the professional standards of '${role}':
   - "shirtRecommendation": Shirt/blouse styling recommendations.
   - "blazerRecommendation": Suit blazer / corporate layer matching recommendations.
   - "appearanceGuidelines": Face/hair grooming and poise rules.
   - "stylingSuggestions": Comprehensive clothing style patterns, accessory advice, and styling options.
3. Placement Readiness calculations based on '${role}' industry parameters:
   - "scoreTechnical": Estimated tech knowledge rating (0-100).
   - "scoreCommunication": Oral/Verbal communication rating (0-100).
   - "scoreConfidence": Confidence index score (0-100).
   - "scoreResume": General credential rating (0-100).
   - "scoreBodyLanguage": Body language score (0-100).
   - "overallPlacementScore": Mathematical average or weighted placement fitness index (0-100).
4. Career Growth Roadmap milestones:
   - "plan30Day": Markdown outline detailing Day 1-30 plans.
   - "plan60Day": Markdown outline detailing Day 31-60 plans.
   - "plan90Day": Markdown outline detailing Day 61-90 plans.

Make recommendations highly specific to a '${role}' pursuing a premier organization. Keep the output clean, modern and actionable.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            confidenceScore: { type: Type.INTEGER },
            bodyLanguageScore: { type: Type.INTEGER },
            professionalPresenceScore: { type: Type.INTEGER },
            shirtRecommendation: { type: Type.STRING },
            blazerRecommendation: { type: Type.STRING },
            appearanceGuidelines: { type: Type.STRING },
            stylingSuggestions: { type: Type.STRING },
            scoreTechnical: { type: Type.INTEGER },
            scoreCommunication: { type: Type.INTEGER },
            scoreConfidence: { type: Type.INTEGER },
            scoreResume: { type: Type.INTEGER },
            scoreBodyLanguage: { type: Type.INTEGER },
            overallPlacementScore: { type: Type.INTEGER },
            plan30Day: { type: Type.STRING },
            plan60Day: { type: Type.STRING },
            plan90Day: { type: Type.STRING }
          },
          required: [
            "confidenceScore",
            "bodyLanguageScore",
            "professionalPresenceScore",
            "shirtRecommendation",
            "blazerRecommendation",
            "appearanceGuidelines",
            "stylingSuggestions",
            "scoreTechnical",
            "scoreCommunication",
            "scoreConfidence",
            "scoreResume",
            "scoreBodyLanguage",
            "overallPlacementScore",
            "plan30Day",
            "plan60Day",
            "plan90Day"
          ]
        }
      }
    });

    const result = JSON.parse(response.text?.trim() || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Error generating human intelligence analysis:", error);
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend build static files in production as standard
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Qyronix Kernel] Express Server running securely on http://localhost:${PORT}`);
  });
}

bootstrap().catch(err => {
  console.error("Failed to bootstrap full stack workspace server:", err);
});
