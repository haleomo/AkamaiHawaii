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

      const declaration = await storage.createDeclaration(validatedData);
      res.json(declaration);
    } catch (error: any) {
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
      const validatedData = updateDeclarationSchema.parse(req.body);
      
      const updated = await storage.updateDeclaration(id, validatedData);
      
      if (!updated) {
        return res.status(404).json({ message: "Declaration not found" });
      }
      
      res.json(updated);
    } catch (error: any) {
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
          return res.status(400).json({ message: "Invalid step" });
      }
      
      const validatedData = schema.parse(data);
      res.json({ valid: true, data: validatedData });
    } catch (error: any) {
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
