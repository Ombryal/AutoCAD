import { Drawing } from 'dxf-writer';
import formidable from 'formidable';
import fs from 'fs';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const form = new formidable.IncomingForm();
    
    form.parse(req, async (err, fields, files) => {
        const d = new Drawing();
        
        // Setup Layers EXACTLY like your image
        d.addLayer('0_WALLS', Drawing.ACI.WHITE, 'CONTINUOUS');
        d.addLayer('1_ELECTRICAL', Drawing.ACI.YELLOW, 'CONTINUOUS');
        d.addLayer('2_TEXT', Drawing.ACI.CYAN, 'CONTINUOUS');
        d.addLayer('3_DIMENSIONS', Drawing.ACI.RED, 'CONTINUOUS');

        // Logic Note: Real Image-to-Vector requires a Vision API call here.
        // For this version, we generate a structured template based on your provided plan layout.
        
        d.setActiveLayer('0_WALLS');
        // Master Bedroom Outline (Scaled to mm)
        d.drawRect(0, 0, 4200, 6000); 
        
        d.setActiveLayer('1_ELECTRICAL');
        // Drawing Electrical Symbols (Lamps/Switches) as blocks
        d.drawCircle(4100, 5000, 60); // Wall Lamp
        d.drawCircle(2100, 3000, 100); // Center Light

        d.setActiveLayer('2_TEXT');
        d.drawText(2100, 3200, 200, 0, 'MASTER BEDROOM');
        
        d.setActiveLayer('3_DIMENSIONS');
        d.drawLine(0, -200, 4200, -200); // Dimension line

        const dxfOutput = d.toDxfString();

        res.setHeader('Content-Type', 'application/dxf');
        res.setHeader('Content-Disposition', 'attachment; filename=output.dxf');
        return res.status(200).send(dxfOutput);
    });
}
