import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { 
  insertDeclarationSchema,
  updateDeclarationSchema,
  travelerInfoSchema,
  arrivalInfoSchema,
  islandDestinationSchema,
  plantDeclarationSchema,
  animalDeclarationSchema,
  finalSubmissionSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Create new declaration
  app.post("/api/declarations", async (req, res) => {
    try {
      console.log("[DEBUG] POST /api/declarations - Request body:", JSON.stringify(req.body, null, 2));
      
      const validatedData = insertDeclarationSchema.parse({
        numberOfPeople: 1,
        travelerType: "visitor",
        visitFrequency: "1st",
        duration: "overnight",
        islands: [],
        islandNights: {},
        arrivalMethod: "flight",
        plantItems: [],
        animalItems: [],
        language: "en",
        isSubmitted: false,
        ...req.body
      });

      console.log("[DEBUG] POST /api/declarations - Validated data:", JSON.stringify(validatedData, null, 2));

      const declaration = await storage.createDeclaration(validatedData);
      console.log("[DEBUG] POST /api/declarations - Created declaration:", JSON.stringify(declaration, null, 2));
      
      res.json(declaration);
    } catch (error: any) {
      console.log("[DEBUG] POST /api/declarations - Error:", error);
      console.log("[DEBUG] POST /api/declarations - Error details:", error.errors || error.message);
      res.status(400).json({ 
        message: "Validation failed", 
        errors: error.errors || error.message 
      });
    }
  });

  // Get declaration by ID
  app.get("/api/declarations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const declaration = await storage.getDeclaration(id);
      
      if (!declaration) {
        return res.status(404).json({ message: "Declaration not found" });
      }
      
      res.json(declaration);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update declaration
  app.patch("/api/declarations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log("[DEBUG] PATCH /api/declarations/:id - ID:", id);
      console.log("[DEBUG] PATCH /api/declarations/:id - Request body:", JSON.stringify(req.body, null, 2));
      
      // Handle date transformation manually
      const requestData = { ...req.body };
      if (requestData.arrivalDate && typeof requestData.arrivalDate === 'string') {
        requestData.arrivalDate = new Date(requestData.arrivalDate);
      }
      const validatedData = updateDeclarationSchema.parse(requestData);
      console.log("[DEBUG] PATCH /api/declarations/:id - Validated data:", JSON.stringify(validatedData, null, 2));
      
      const updated = await storage.updateDeclaration(id, validatedData);
      
      if (!updated) {
        console.log("[DEBUG] PATCH /api/declarations/:id - Declaration not found");
        return res.status(404).json({ message: "Declaration not found" });
      }
      
      console.log("[DEBUG] PATCH /api/declarations/:id - Updated declaration:", JSON.stringify(updated, null, 2));
      res.json(updated);
    } catch (error: any) {
      console.log("[DEBUG] PATCH /api/declarations/:id - Error:", error);
      console.log("[DEBUG] PATCH /api/declarations/:id - Error details:", error.errors || error.message);
      res.status(400).json({ 
        message: "Validation failed", 
        errors: error.errors || error.message 
      });
    }
  });

  // Submit declaration
  app.post("/api/declarations/:id/submit", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Validate final submission data
      const finalData = finalSubmissionSchema.parse(req.body);
      
      const submitted = await storage.submitDeclaration(id);
      
      if (!submitted) {
        return res.status(404).json({ message: "Declaration not found" });
      }
      
      res.json(submitted);
    } catch (error: any) {
      res.status(400).json({ 
        message: "Submission validation failed", 
        errors: error.errors || error.message 
      });
    }
  });

  // Validate step data
  app.post("/api/declarations/:id/validate-step", async (req, res) => {
    try {
      const { step, data } = req.body;
      console.log("[DEBUG] POST /api/declarations/:id/validate-step - Step:", step);
      console.log("[DEBUG] POST /api/declarations/:id/validate-step - Data:", JSON.stringify(data, null, 2));
      
      let schema;
      switch (step) {
        case 2:
          schema = travelerInfoSchema;
          break;
        case 3:
          schema = arrivalInfoSchema;
          break;
        case 4:
          schema = islandDestinationSchema;
          break;
        case 5:
          schema = plantDeclarationSchema;
          break;
        case 6:
          schema = animalDeclarationSchema;
          break;
        case 7:
          schema = finalSubmissionSchema;
          break;
        default:
          console.log("[DEBUG] POST /api/declarations/:id/validate-step - Invalid step:", step);
          return res.status(400).json({ message: "Invalid step" });
      }
      
      const validatedData = schema.parse(data);
      console.log("[DEBUG] POST /api/declarations/:id/validate-step - Validated data:", JSON.stringify(validatedData, null, 2));
      res.json({ valid: true, data: validatedData });
    } catch (error: any) {
      console.log("[DEBUG] POST /api/declarations/:id/validate-step - Validation error:", error);
      console.log("[DEBUG] POST /api/declarations/:id/validate-step - Error details:", error.errors || error.message);
      res.status(400).json({ 
        valid: false,
        message: "Validation failed", 
        errors: error.errors || error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
