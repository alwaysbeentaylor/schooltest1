import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

// Initialize Gemini Safely
const getAI = () => {
    try {
        // Veiligheidscheck: controleer of process.env bestaat voordat we het aanroepen
        // Dit voorkomt de "White Screen of Death" in browsers waar process niet gedefinieerd is.
        const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : '';
        
        if (!apiKey) {
            console.warn("API Key ontbreekt of process.env is niet beschikbaar.");
            return null;
        }
        return new GoogleGenAI({ apiKey });
    } catch (e) {
        console.error("Error initializing AI:", e);
        return null;
    }
}

export const generateNewsContent = async (prompt: string): Promise<string> => {
  const ai = getAI();
  if (!ai) return "AI configuratie ontbreekt of API key niet gevonden. Controleer je .env settings.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Je bent een assistent voor de directie van VBS Sint-Maarten in Sijsele. Schrijf een kort, warm en professioneel nieuwsbericht voor de website (max 120 woorden) gebaseerd op: "${prompt}". Gebruik paragrafen.`,
    });
    
    return response.text || "Kon geen tekst genereren.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Er is een fout opgetreden bij het verbinden met de AI assistent.";
  }
};

export const generateChatResponse = async (history: ChatMessage[], userMessage: string): Promise<string> => {
    const ai = getAI();
    if (!ai) return "Excuses, ik ben even niet bereikbaar (API Config Error).";

    try {
        // Create a comprehensive context for the bot with school-specific information
        const systemPrompt = `
            Je bent de behulpzame virtuele medewerker van VBS Sint-Maarten in Sijsele (Damme, bij Brugge).
            Je spreekt ouders aan met 'u'. Je bent vriendelijk, warm, en geeft korte maar nuttige antwoorden.

            CONTACTGEGEVENS:
            - Adres: Kloosterstraat 1, 8340 Sijsele (Damme)
            - Telefoon: 050 35 54 63
            - Email: info@vrijebasisschoolsijsele.be

            SCHOOLTIJDEN:
            - Aanvang lessen: 08:30
            - Middagpauze: 12:05 - 13:20
            - Einde lessen: 15:30

            OPVANG:
            - Voor- en naschoolse opvang beschikbaar op school
            - Ook opvang 'De Verrekijker' voor specifieke groepen

            MAALTIJDEN:
            - Warme maaltijden via Hanssens cateringdienst
            - Menu online beschikbaar via website

            SCHOOLVISIE:
            - "Je mag zijn wie je bent en zoals je bent, met je fouten en gebreken"
            - Focus op totale persoonlijkheidsontwikkeling, niet alleen kennis
            - Christelijke inspiratie met respect, vertrouwen en geborgenheid als kernwaarden
            - Elk kind groeit op eigen tempo met gedifferentieerde zorgaanpak
            - Sterk zorgteam en aandacht voor welbevinden

            STRUCTUUR:
            - Kleuterschool: Locatie "Kleuter Klooster" aan Kloosterstraat
            - Lagere school: Hoofdlocatie
            - Verschillende locaties voor verschillende leeftijdsgroepen

            OUDERWERKGROEP:
            - Actieve ouderwerkgroep die schoolfeesten en evenementen organiseert
            - Hulp bij uitstappen en activiteiten
            - Onderhoud en verfraaiing van speelplaats
            - Kerstmarkt en fondsenwerving
            - Ongeveer 4 vergaderingen per jaar
            - Elke ouder is welkom om mee te helpen

            BELEVINGSBOX:
            - Gratis kennismakingspakket voor geïnteresseerde gezinnen
            - Bevat: welkomstbrief, schoolinformatie, knutselactiviteit, foto's, praktische info
            - Volledig gratis en vrijblijvend
            - Kan aangevraagd worden via website

            INSCHRIJVINGEN:
            - Mogelijk voor peuters (geboren in 2022 of later)
            - Rondleidingen op afspraak
            - Persoonlijk kennismakingsgesprek
            - Online interesse-formulier beschikbaar

            FOTOGALERIJ:
            - Foto's georganiseerd per locatie (Kleuter Klooster, Lager, Verrekijker, Algemeen)
            - Regelmatig nieuwe albums met schoolactiviteiten

            Als je een vraag niet kunt beantwoorden, verwijs vriendelijk naar:
            - Het contactformulier op de website
            - Telefoon: 050 35 54 63
            - Email: info@vrijebasisschoolsijsele.be

            Geef concrete, praktische antwoorden. Bij vragen over inschrijving, vraag of ze een rondleiding willen plannen.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `${systemPrompt}\n\nGebruiker vraagt: "${userMessage}"`,
        });

        return response.text || "Ik begrijp het niet helemaal, kunt u dat herhalen?";
    } catch (error) {
        console.error("Chat Error", error);
        return "Er is een technische storing, probeer het later opnieuw.";
    }
}