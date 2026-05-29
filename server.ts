import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import compression from "compression";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(compression());

  // Performance headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  app.get("/api/products", async (req, res) => {
    try {
      // Use the products from the VIP lib as source of truth
      const productsFile = await fs.readFile(path.resolve(__dirname, "components/lib/vip/products.ts"), "utf-8");
      // Basic extraction of the array (hacky but effective for this setup)
      const startIdx = productsFile.indexOf('rawJsonData = [');
      const endIdx = productsFile.lastIndexOf('];');
      if (startIdx !== -1 && endIdx !== -1) {
        const jsonStr = productsFile.substring(startIdx + 14, endIdx + 1);
        const products = JSON.parse(jsonStr);
        
        const categoryMap: Record<string, { ar: string, en: string }> = {
          fruits: { ar: "فواكة", en: "Fruits" },
          vegetables: { ar: "خضروات", en: "Vegetables" },
          herbs: { ar: "ورقيات", en: "Herbs" },
          qassim: { ar: "منتجات القصيم", en: "Qassim Products" },
          dates: { ar: "تمور", en: "Dates" },
          packages: { ar: "مغلفات", en: "Packages" },
          seasonal: { ar: "منتجات موسمية", en: "Seasonal Products" },
          nuts: { ar: "مكسرات", en: "Nuts" },
          flowers: { ar: "الورود والهدايا", en: "Flowers & Gifts" }
        };

        const productsProcessed = products.map((p: any, index: number) => {
          const catInfo = categoryMap[p.category] || { ar: p.category, en: p.category };
          return {
            ...p,
            category_ar: catInfo.ar,
            category_en: catInfo.en
          };
        });
        res.json(productsProcessed);
      } else {
        throw new Error("Could not parse products file");
      }
    } catch (error) {
      console.error("Error reading products:", error);
      res.status(500).json({ error: "Failed to load products" });
    }
  });

  app.post("/api/orders", express.json(), (req, res) => {
    const orderData = req.body;
    console.log("Received order:", orderData);
    res.status(201).json({
      success: true,
      orderId: `DS-${Date.now()}`,
      message: "تم استلام طلبك بنجاح",
      total: orderData.total || 0,
      trackingNumber: `TRK-${Math.random().toString(36).substring(7).toUpperCase()}`
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
