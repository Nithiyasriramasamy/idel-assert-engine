import { Request, Response } from "express";
import OpenAI from "openai";
import { prisma } from "../config/db";

const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.trim() === "") return null;
  return new OpenAI({ apiKey });
};

export class PricingAi {
  async calculateDynamicPrice(req: Request, res: Response) {
    try {
      const { assetId, demandMultiplier, eventNotes, timeOfDay } = req.body;

      if (!assetId) {
        return res.status(400).json({ error: "Asset ID required" });
      }

      const asset = await prisma.asset.findUnique({
        where: { id: assetId }
      });

      if (!asset) {
        return res.status(404).json({ error: "Asset not found" });
      }

      const openai = getOpenAIClient();
      const currentHour = timeOfDay !== undefined ? parseInt(timeOfDay) : new Date().getHours();
      const multiplier = demandMultiplier !== undefined ? parseFloat(demandMultiplier) : 1.0;
      const eventDescription = eventNotes || "Normal operations";

      let dynamicPrice = asset.hourlyPrice;
      let reasoning = "";

      if (openai) {
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `You are the AssetAgent AI pricing agent. Calculate an optimized dynamic hourly rate.
Return strictly JSON matching this structure:
{
  "dynamicPrice": number,
  "reasoning": "markdown string explanation of factors"
}`
              },
              {
                role: "user",
                content: `Asset: ${asset.title} (Category: ${asset.category}, Base rate: $${asset.hourlyPrice}/hr).
Parameters: Current Hour: ${currentHour}, Demand Multiplier Input: ${multiplier}x, Traffic events: ${eventDescription}.
Calculate dynamic rate and explain.`
              }
            ],
            response_format: { type: "json_object" }
          });

          const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");
          dynamicPrice = parsed.dynamicPrice || asset.hourlyPrice;
          reasoning = parsed.reasoning || "Optimized dynamic rate computed.";
        } catch (err: any) {
          console.error("OpenAI pricing query failed, fallback used:", err);
          const fallback = computeLocalPricing(asset, currentHour, multiplier, eventDescription);
          dynamicPrice = fallback.price;
          reasoning = fallback.reasoning + " (OpenAI API key error; Local fallback applied)";
        }
      } else {
        const fallback = computeLocalPricing(asset, currentHour, multiplier, eventDescription);
        dynamicPrice = fallback.price;
        reasoning = fallback.reasoning + " (Simulation Mode)";
      }

      dynamicPrice = Math.round(dynamicPrice * 100) / 100;

      await prisma.asset.update({
        where: { id: assetId },
        data: { dynamicPrice }
      });

      return res.json({
        assetId,
        basePrice: asset.hourlyPrice,
        dynamicPrice,
        reasoning
      });

    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Failed to compile dynamic pricing" });
    }
  }
}

function computeLocalPricing(asset: any, hour: number, multiplier: number, notes: string) {
  let factor = 1.0;
  const reasons: string[] = [];

  if (hour >= 8 && hour <= 10 || hour >= 16 && hour <= 18) {
    factor += 0.25;
    reasons.push("⚡ **Commuter Peak Hours**: Surge pricing applied during transit/office rush slots.");
  } else if (hour >= 21 || hour < 6) {
    factor -= 0.15;
    reasons.push("💤 **Off-Peak Night Hours**: Automated discount applied to stimulate overnight reservations.");
  }

  if (multiplier > 1.0) {
    factor += (multiplier - 1.0);
    reasons.push(`📈 **Demand Multiplier Trigger**: Optimized rate adjusted up by +${Math.round((multiplier - 1.0) * 100)}% based on sector traffic.`);
  }

  const notesLower = notes.toLowerCase();
  if (notesLower.includes("concert") || notesLower.includes("event") || notesLower.includes("game")) {
    factor += 0.35;
    reasons.push("🎵 **Local Surge Event**: Elevated pedestrian traffic detected near spatial nodes.");
  }

  const price = Math.max(asset.hourlyPrice * 0.6, asset.hourlyPrice * factor);

  return {
    price,
    reasoning: `### Autonomous Dynamic Pricing Report

Dynamic pricing ledger updated for **${asset.title}**:
- **Base hourly price**: $${asset.hourlyPrice.toFixed(2)}/hr
- **Dynamic hourly price**: **$${price.toFixed(2)}/hr** (Factor: ${factor.toFixed(2)}x)

**Pricing Adjustments Logged:**
${reasons.map(r => `- ${r}`).join("\n") || "- No surge parameters matched. Pricing is set to base rate."}

*Compiled autonomously by AssetAgent AI Pricing Node.*`
  };
}
