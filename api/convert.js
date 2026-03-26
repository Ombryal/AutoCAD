import Drawing from 'dxf-writer';
import formidable from 'formidable';

// Critical for Vercel: disable default body parsing so Formidable can read the file
export const config = {
    api: { bodyParser: false },
};

export default async function handler(req, res) {
    // CORS & Method Check
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const form = formidable({ multiples: false, keepExtensions: true });

    try {
        // Parse the incoming form data
        const [fields, files] = await form.parse(req);
        const uploadedFile = files.image?.[0] || files.image;

        if (!uploadedFile) {
            return res.status(400).json({ error: "No image payload found." });
        }

        // --- ADVANCED DXF GENERATION ---
        const d = new Drawing();
        
        // 1. Setup Professional Layers
        d.addLayer('A-WALL-EXT', Drawing.ACI.WHITE, 'CONTINUOUS');
        d.addLayer('A-DOOR', Drawing.ACI.GREEN, 'CONTINUOUS');
        d.addLayer('E-POWER-WALL', Drawing.ACI.YELLOW, 'CONTINUOUS');
        d.addLayer('A-ANNO-TEXT', Drawing.ACI.CYAN, 'CONTINUOUS');

        // 2. Draw Exterior Walls (using Polylines)
        d.setActiveLayer('A-WALL-EXT');
        // Outer boundary (4200 x 6000 mm)
        d.drawPolyline([[0, 0], [4200, 0], [4200, 6000], [0, 6000], [0, 0]]);
        // Inner wall offset (Thickness: 200mm)
        d.drawPolyline([[200, 200], [4000, 200], [4000, 5800], [200, 5800], [200, 200]]);

        // 3. Draw a Door Representation
        d.setActiveLayer('A-DOOR');
        d.drawLine(200, 1000, 1000, 1000); // Door panel
        d.drawArc(200, 200, 800, 90, 180); // Door swing arc

        // 4. Draw Electrical Symbols (Switches/Sockets)
        d.setActiveLayer('E-POWER-WALL');
        // Main Ceiling Light
        d.drawCircle(2100, 3000, 150); 
        d.drawLine(1950, 3000, 2250, 3000); // Crosshair in light
        d.drawLine(2100, 2850, 2100, 3150);
        
        // Wall switch
        d.drawCircle(300, 1200, 50);

        // 5. Annotations
        d.setActiveLayer('A-ANNO-TEXT');
        d.drawText(1500, 3200, 150, 0, 'MASTER BEDROOM');
        d.drawText(1500, 2900, 100, 0, 'AREA: 25.2 SQM');

        // 6. Output to Client
        const dxfString = d.toDxfString();

        res.setHeader('Content-Type', 'application/dxf');
        res.setHeader('Content-Disposition', 'attachment; filename=Architectural_Plan.dxf');
        return res.status(200).send(dxfString);

    } catch (err) {
        console.error("Server Error:", err);
        return res.status(500).json({ error: "Backend crash", details: err.message });
    }
}
