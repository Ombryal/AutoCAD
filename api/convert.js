import { Drawing } from 'dxf-writer';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
    api: { bodyParser: false }, // Formidable handles parsing
};

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
        if (err) return res.status(500).json({ error: "Upload error" });

        const d = new Drawing();
        
        // 1. Create Layers (as seen in your image)
        d.addLayer('Walls', Drawing.ACI.WHITE, 'CONTINUOUS');
        d.addLayer('Electrical', Drawing.ACI.YELLOW, 'CONTINUOUS');
        d.addLayer('Text', Drawing.ACI.CYAN, 'CONTINUOUS');
        d.addLayer('Dimensions', Drawing.ACI.RED, 'CONTINUOUS');

        // Logic Note: 
        // In a real AI implementation, you would send 'files.planImage' 
        // to a Vision API (like Google Vision or OpenAI) to get coordinates.
        
        // Placeholder: Drawing a box for the 'Master Bedroom' based on image
        d.setActiveLayer('Walls');
        d.drawRect(0, 0, 4200, 6000); // Scaled dimensions from your plan

        d.setActiveLayer('Text');
        d.drawText(2100, 3000, 200, 0, 'MASTER BEDROOM');

        d.setActiveLayer('Electrical');
        // Example: Drawing a 'Wall Mounted Lamp' symbol (circle)
        d.drawCircle(4100, 5000, 50); 

        const dxfString = d.toDxfString();

        res.setHeader('Content-Type', 'application/dxf');
        res.setHeader('Content-Disposition', 'attachment; filename=plan.dxf');
        return res.status(200).send(dxfString);
    });
}
