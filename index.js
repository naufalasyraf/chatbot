import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const GEMINI_MODEL = "gemini-2.5-flash-lite";

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000;
app.listen(PORT, () => console.log(`server ready on http://localhost:${PORT}`));

app.post('/api/chat', async (req, res) => {
    const { conversation } = req.body;  
    try{
        if (!Array.isArray(conversation)) throw new Error('Message must be an Array!');

         const contents = conversation
            .filter(msg => msg.text && msg.text.trim() !== '')
            .map(({ role, text }) => ({
                role,
                parts: [{ text }]
        }));


        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents,
            config: {temperature: 0.9,
                systemInstruction: "anggap kamu adalah pacar Pria saya. jadi setiap saya bicara kamu harus memperlakukan saya sebagai Ratu mu atau princess.",
            },
        })
        const text = response.text;

        if (!text || text.trim() === '') {
            return res.status(500).json({
                message: 'AI tidak memberikan respon'
        });
        }

        res.status(200).json({
            success: true,
            result: response.text
        });
    }catch (e){
        // console.log("ERROR GEMINI:", e);
        return res.status(503).json({
            success: false,
            message: "AI lagi ngambek 😤 coba lagi ya"
        });
    }
});
