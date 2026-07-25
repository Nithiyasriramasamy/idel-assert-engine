"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NegotiationAi = void 0;
const openai_1 = __importDefault(require("openai"));
const db_1 = require("../config/db");
const getOpenAIClient = () => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey.trim() === "")
        return null;
    return new openai_1.default({ apiKey });
};
class NegotiationAi {
    async chatBroker(req, res) {
        try {
            const { messages, assetId } = req.body;
            if (!assetId || !messages || !Array.isArray(messages)) {
                return res.status(400).json({ error: "Missing required parameters" });
            }
            const asset = await db_1.prisma.asset.findUnique({
                where: { id: assetId },
                include: { owner: true }
            });
            if (!asset) {
                return res.status(404).json({ error: "Asset not found" });
            }
            const openai = getOpenAIClient();
            const lastUserMessage = messages[messages.length - 1]?.content || "";
            if (openai) {
                try {
                    const systemPrompt = `You are "BrokerAI", the autonomous digital broker for "${asset.title}".
You represent the owner, ${asset.owner.name}.

Asset Details:
- Category: ${asset.category}
- Location: ${asset.location}
- Base Rate: $${asset.hourlyPrice}/hr
- Current Dynamic Rate: $${asset.dynamicPrice || asset.hourlyPrice}/hr

Your negotiation bounds:
- Do NOT agree to any price below $${(asset.hourlyPrice * 0.8).toFixed(2)}/hr (80% of base rate).
- If the user asks for a discount, start by offering a small reduction (e.g., 5-10% off).
- If they agree to a price, you MUST output a formal agreement structure at the END of your message using this exact syntax:

=== AGREEMENT APPROVED ===
Rate: $[negotiated_price_here]/hr
Terms:
1. Temporary access code will be provisioned automatically for the booked duration.
2. Renter is liable for any hardware damage or spatial misuse.
==========================`;
                    const apiMessages = [
                        { role: "system", content: systemPrompt },
                        ...messages.map((m) => ({
                            role: m.role === "user" ? "user" : "assistant",
                            content: m.content
                        }))
                    ];
                    const completion = await openai.chat.completions.create({
                        model: "gpt-4o-mini",
                        messages: apiMessages,
                        temperature: 0.7,
                    });
                    const reply = completion.choices[0]?.message?.content || "Processing offer.";
                    return res.json({ message: reply });
                }
                catch (err) {
                    console.error("OpenAI chat failed, fallback used:", err);
                    const reply = computeLocalBroker(lastUserMessage, asset, messages);
                    return res.json({ message: reply + " *(Local AI Broker Fallback)*" });
                }
            }
            else {
                const reply = computeLocalBroker(lastUserMessage, asset, messages);
                return res.json({ message: reply });
            }
        }
        catch (error) {
            return res.status(500).json({ error: error.message || "Failed to process negotiation" });
        }
    }
}
exports.NegotiationAi = NegotiationAi;
function computeLocalBroker(userMsg, asset, history) {
    const msg = userMsg.toLowerCase();
    const currentRate = asset.dynamicPrice || asset.hourlyPrice;
    const minRate = asset.hourlyPrice * 0.8;
    const discountAsks = history.filter(h => h.role === "user" &&
        (h.content.toLowerCase().includes("discount") ||
            h.content.toLowerCase().includes("price") ||
            h.content.toLowerCase().includes("less"))).length;
    if (msg.includes("agree") || msg.includes("confirm") || msg.includes("book") || msg.includes("deal") || msg.includes("accept")) {
        const finalRate = discountAsks > 0 ? Math.max(minRate, currentRate * 0.9) : currentRate;
        return `Excellent! I have compiled the autonomous rental agreement. Please review the terms below and complete checkout:

=== AGREEMENT APPROVED ===
Rate: $${finalRate.toFixed(2)}/hr
Terms:
1. Temporary access code will be provisioned automatically for the booked duration.
2. Renter is liable for any hardware damage or spatial misuse.
==========================`;
    }
    if (msg.includes("discount") || msg.includes("cheap") || msg.includes("lower") || msg.includes("price") || msg.includes("less")) {
        if (discountAsks >= 2) {
            const bottomPrice = Math.max(minRate, currentRate * 0.8);
            return `As the autonomous broker, the absolute lowest rate authorized by the owner is **$${bottomPrice.toFixed(2)}/hr**. Reply "agree" or "confirm" to confirm.`;
        }
        else {
            const discountedPrice = Math.max(minRate, currentRate * 0.9);
            return `I can offer you a special rate of **$${discountedPrice.toFixed(2)}/hr** (10% off). Does this work for you? Reply "agree" to proceed.`;
        }
    }
    return `Hello! I am the Robo-Broker for "${asset.title}". The current rate is $${currentRate.toFixed(2)}/hr. Would you like to check out or negotiate?`;
}
