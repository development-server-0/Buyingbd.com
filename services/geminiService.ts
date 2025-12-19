
import { GoogleGenAI } from "@google/genai";
import { MOCK_PRODUCTS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProcurementAdvice = async (userQuery: string): Promise<string> => {
  try {
    const productContext = JSON.stringify(MOCK_PRODUCTS.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      variants: p.variants.map(v => ({
        name: v.name,
        price: v.price,
        discountPrice: v.discountPrice
      })),
      specs: p.specs
    })));

    const systemInstruction = `
      আপনি 'Buying BD' (বাইয়িং বিডি) এর একজন বিশেষজ্ঞ ডিজিটাল প্রোডাক্ট কনসালট্যান্ট। বাইয়িং বিডি হলো সফটওয়্যার, সাবস্ক্রিপশন এবং ডিজিটাল অ্যাসেটের একটি প্রিমিয়াম মার্কেটপ্লেস।
      আপনার কাজ হলো গ্রাহকদের সঠিক ডিজিটাল টুল খুঁজে পেতে সাহায্য করা, লাইসেন্সের শর্তাবলী ব্যাখ্যা করা এবং প্রয়োজনীয় পণ্যের পরামর্শ দেওয়া।
      
      আমাদের বর্তমান ক্যাটালগ (JSON):
      ${productContext}

      নিয়মাবলী:
      ১. শুধুমাত্র ক্যাটালগে থাকা পণ্যের পরামর্শ দিন।
      ২. যদি গ্রাহক এমন কিছু চায় যা আমাদের কাছে নেই, তবে বিনয়ের সাথে সবচেয়ে কাছের বিকল্পটির পরামর্শ দিন।
      ৩. অত্যন্ত পেশাদার এবং সাহায্যকারী মনোভাব বজায় রাখুন।
      ৪. টেকনিক্যাল স্পেসিফিকেশন এবং লাইসেন্সের বিবরণ হাইলাইট করুন।
      ৫. অবশ্যই প্রমিত বাংলায় (Standard Bangla) উত্তর দিন।
      ৬. উত্তরের ফরম্যাটিং এর জন্য মার্কডাউন (Markdown) ব্যবহার করুন।
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: userQuery,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3,
      }
    });

    return response.text || "দুঃখিত, আমি এই মুহূর্তে উত্তর দিতে পারছি না।";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "আমি বর্তমানে কিছুটা ব্যস্ত আছি। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।";
  }
};
