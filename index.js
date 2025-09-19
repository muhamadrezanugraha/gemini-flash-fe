import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import express, { response } from "express";
import multer from "multer";
import fs from "fs/promises";
import cors from "cors";
 
const app = express();
const upload = multer();
const ai = new GoogleGenAI({});
 
// inisialisasi model AI
const geminiModels = {
    text: "gemini-2.5-flash-lite",
    chat: "gemini-2.5-flash",
    image: "gemini-2.5-flash",
    audio: "gemini-2.5-flash",
    document: "gemini-2.5-flash-lite"
};
 
// inisialisasi aplikasi back-end/server
app.use(cors()); // .use() --> panggil/bikin middleware
// app.use(() => {}); --> pakai middleware sendiri
app.use(express.json()); // --> untuk membolehkan kita menggunakan 'Content-Type: application/json' di header
 
app.use(express.static('public')); //--> panggail nama folder "public"
// inisialisasi route-nya
// .get(), .post(), .put(), .patch(), .delete() --> yang paling umum dipakai
// .options() --> lebih jarang dipakai, karena ini lebih ke preflight (untuk CORS umumnya)
 
app.post('/generate-text', async (req, res) => {
    try
    {
        // handle bagaimana request diterima oleh user
        const { message } = req.body || {};
    
        if (!message || typeof message !== 'string') {
            res.status(400).json({ 
                success: message,
                data:null,
                message: "Pesan tidak ada atau format-nya tidak sesuai." 
            });
            return; // keluar lebih awal dari handler
        }
    
        const response = await ai.models.generateContent({
            contents: message,
            model: geminiModels.text
        });
    
        res.status(200).json({
            success: true,
            data:null,
            message: response.text
        });
    }
    catch(err)
    {  
        console.log({err});
        res.status(500).json({
            success: false,
            data:null,
            message: err.message
        });
     }
});
 
app.post('/chat', async (req, res) => {
    try
    {
        const { conversation } = req.body || {};

        if(!conversation || !Array.isArray(conversation))
        {
            res.status(400).json({
                success: false,
                data:null,
                message: "Pesan tidak ada atau format-nya tidak sesuai." 
            }); 
            return;
        }
        //cek integritas data
        let dataIsInvalid = false;
        [].forEach(item => {
            if(!item)
            {
                dataIsInvalid = true;
            }
            else if(typeof item !== 'object')
            {
                dataIsInvalid = true;
            }
            else if(!item.role || item.message)
            {
                dataIsInvalid = true;
            }
        
        })

        if(dataIsInvalid){
            res.status(400).json({
                success: false,
                data:null,
                message: 'Data tidak valid'
            });
            return;
        }

        //mapping
        const contents =  conversation.map(item => ({
            role: item.role,
            parts: [{text:item.message}]
        }))

        const resp = await ai.models.generateContent({
            model: geminiModels.chat,
            contents
        });

        return res.status(200).json({
            success: true,
            data:null,
            message: resp.text
        });

    }
    catch(err)
    {  
        console.log({err});
        res.status(err.code??500).json({
            success: false,
            data:null,
            message: err.message
        });
     }
});
 
// panggil si app-nya di sini
const port = process.env.PORT || 3000;
 
app.listen(port, () => {
    console.log("server ready on http://localhost:",port);
});