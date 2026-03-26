import Drawing from 'dxf-writer';
import formidable from 'formidable';
import fs from 'fs/promises';

export const config = {
    api: {
        bodyParser: false, // Disabling Vercel's default body parser to let Formidable handle it
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const form = formidable({});
    
    try {
        // Formidable v3 uses promises instead of callbacks
        const [fields, files] = await form.parse(req);
        
        const d = new Drawing();
        
        // Setup Layers matching your floor plan image
        // Colors: 1=Red, 2=Yellow, 3=Green, 4=Cyan, 5=Blue, 6=Magenta, 7=White
        d.addLayer('0_WALLS', Drawing.ACI.WHITE, 'CONTINUOUS');
        d.addLayer('1_ELECTRICAL', Drawing.ACI.YELLOW, 'CONTINUOUS');
        d.addLayer('2_TEXT', Drawing.ACI.CYAN, 'CONTINUOUS');
        d.addLayer('3_DIMENSIONS', Drawing.ACI.RED, 'CONTINUOUS');

        // Drawing a placeholder layout based on your image dimensions
        d.setActiveLayer('0_WALLS');
        d.drawRect(0, 0, 4200, 6000); // Main room outline (mm)
        d.drawRect(4200, 0, 8400, 6000); // Adjacent room

        d.setActiveLayer('1_ELECTRICAL');
        d.drawCircle(4100, 5000, 60); // Electrical symbol (Lamp)
        d.drawCircle(2100, 3000, 100); // Ceiling Point

        d.setActiveLayer('2_TEXT');
        d.drawText(1000, 3000, 200, 0, 'MASTER BEDROOM');
        
        d.setActiveLayer('3_DIMENSIONS');
        d.drawLine(0, -300, 4200, -300); // Dimension line

        const dxfOutput = d.toDxfString();

        res.setHeader('Content-Type', 'application/dxf');
        res.setHeader('Content-Disposition', 'attachment; filename=cad_plan.dxf');
        return res.status(200).send(dxfOutput);

    } catch (error) {
        console.error("Conversion Error:", error);
        return res.status(500).json({ error: "Processing failed", details: error.message });
    }
}
