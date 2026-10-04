import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLangStore, useThemeStore } from '../store';

const WA = '+491745232945';
const WA_DISPLAY = '+49 174 523 29 45';
const EMAIL = 'kontakt@automatikgebrauchtwagen.com';
const ADDRESS = 'Franz-Julius-Haenel-Str. 3, 06618 Naumburg';
const SITE_URL = 'automatikgebrauchtwagen.com';

/* ─── Knowledge Base ─── */
const R = {
  fr: {
    bonjour: "Bonjour ! Je suis l'assistant Automatik Gebrauchtwagen \ud83d\udc4b\n\nPosez-moi vos questions sur :\n\ud83d\udd52 Horaires \u2022 \ud83d\udccd Adresse\n\ud83d\ude97 Véhicules \u2022 \ud83d\udcb0 Tarifs\n\ud83d\udd27 Garantie \u2022 \ud83d\udee1\ufe0f Assurance\n\ud83c\udfe1 Livraison \u2022 \ud83d\udcca Financement",
    horaires: "\ud83d\udd52 **Horaires d'ouverture**\n\n\ud83d\udcc5 Lun\u2013Ven : 08h00 \u2013 18h00\n\ud83d\udcc5 Samedi : 09h00 \u2013 14h00\n\u274c Dimanche : Fermé\n\nFermé les jours fériés.",
    prix: "\ud83d\udcb0 **Tarifs compétitifs**\n\nNous proposons des véhicules neufs et d'occasion à prix avantageux.\n\ud83d\udcca Devis gratuit sous 24h\n\ud83d\udcb3 Financement disponible\n\nVoir notre catalogue :\n\ud83d\udd17 " + SITE_URL + "/catalog",
    rdv: "\ud83d\udcc5 **Prendre rendez-vous**\n\nPour une visite ou un essai, contactez-nous :\n\ud83d\udcac WhatsApp : " + WA_DISPLAY + "\n\ud83d\udce7 " + EMAIL + "\n\nNous répondons sous 24h !",
    adresse: "\ud83d\udccd **Notre concessionnaire**\n\n" + ADDRESS + ", Allemagne\n\n\ud83d\ude97 Parking gratuit disponible\n\ud83d\ude97 facilement accessible",
    garantie: "\ud83d\udee1\ufe0f **Garantie incluse**\n\n\ud83d\udcac Tous nos véhicules sont vendus avec :\n\u2705 Garantie 12 mois ou 10 000 km\n\u2705 Protection moteur & boîte de vitesse\n\u2705 Service après-vente inclus\n\u2705 Extensions disponibles (24/36 mois)",
    marques: "\ud83d\ude97 **Toutes les marques disponibles**\n\n\u2022 BMW, Mercedes, Audi, Volkswagen\n\u2022 Toyota, Honda, Hyundai, Kia\n\u2022 Ford, Opel, Renault, Peugeot\n\u2022 Tesla, Volvo, Porsche...\n\n\ud83d\udee1\ufe0f Véhicules neufs & d'occasion\n\u26a1 Électriques & hybrides",
    assurance: "\ud83d\udee1\ufe0f **Assurance automobile**\n\nNous proposons :\n\u2022 Assurance tous risques\n\u2022 Assurance responsabilité civile\n\u2022 Protection juridique\n\nDemandez un devis personnalisé :\n\ud83d\udcac WhatsApp : " + WA_DISPLAY,
    financement: "\ud83d\udcca **Financement**\n\n\ud83d\udcb3 Options de paiement flexibles :\n\u2022 Crédit auto sur mesure\n\u2022 Leasing / LOA\n\u2022 Paiement en plusieurs fois\n\nSimulateur disponible sur le site.\nDemandez votre offre personnalisée !",
    livraison: "\ud83d\udfe1 **Livraison**\n\n\ud83d\ude9a Livraison partout en Europe\n\ud83d\udcc5 Délai : 3 à 7 jours ouvrés\n\ud83d\udee1\ufe0f Véhicule assuré pendant le transport\n\u2705 Documents conformes\n\ud83d\udd17 " + SITE_URL + "/catalog",
    catalogue: "\ud83d\ude97 **Consultez notre catalogue**\n\nPlus de véhicules disponibles :\n\ud83d\udd17 " + SITE_URL + "/catalog\n\nCatégories : SUV, Berline, Citadine, Coupé, Break, Monospace, Utilitaire, 4x4",
    electrique: "\u26a1 **Véhicules électriques & hybrides**\n\nNous proposons une large gamme :\n\u2022 Tesla Model 3, Model Y\n\u2022 BMW iX, i4\n\u2022 Mercedes EQA, EQC\n\u2022 Volkswagen ID.3, ID.4\n\u2022 Hyundai Ioniq 5\n\nConsultez le catalogue !",
    entretien: "\ud83d\udd27 **Entretien & réparation**\n\n\ud83d\udce1 Pack entretien disponible :\n\u2022 2 révisions complètes incluses\n\u2022 Contrôle technique\n\u2022 Changement de pneus\n\nContactez-nous pour plus d'infos.",
    contact: "\ud83d\udcac **Contactez-nous**\n\n\ud83d\udcac WhatsApp : " + WA_DISPLAY + "\n\ud83d\udce7 " + EMAIL + "\n\ud83d\udccd " + ADDRESS + "\n\nNous répondons sous 24h !",
    remerciement: "Avec plaisir ! N'hésitez pas si vous avez d'autres questions. \ud83d\ude0a",
    derriere: "Pour plus d'informations, vous pouvez :\n\ud83d\udd17 Visiter notre catalogue\n\ud83d\udcac Nous écrire sur WhatsApp\n\nToujours à votre service !",
    default: "Merci pour votre message ! Je peux vous renseigner sur :\n\n\ud83d\udd52 Horaires \u2022 \ud83d\udccd Adresse\n\ud83d\ude97 Véhicules \u2022 \ud83d\udcb0 Tarifs\n\ud83d\udee1\ufe0f Assurance \u2022 \ud83d\udcca Financement\n\ud83d\ude9a Livraison \u2022 \ud83d\udd27 Garantie",
  },
  en: {
    bonjour: "Hello! I'm the Automatik Gebrauchtwagen assistant \ud83d\udc4b\n\nAsk me about:\n\ud83d\udd52 Hours \u2022 \ud83d\udccd Address\n\ud83d\ude97 Vehicles \u2022 \ud83d\udcb0 Pricing\n\ud83d\udd27 Warranty \u2022 \ud83d\udee1\ufe0f Insurance\n\ud83c\udfe1 Delivery \u2022 \ud83d\udcca Financing",
    horaires: "\ud83d\udd52 **Opening Hours**\n\n\ud83d\udcc5 Mon\u2013Fri: 08:00 \u2013 18:00\n\ud83d\udcc5 Saturday: 09:00 \u2013 14:00\n\u274c Sunday: Closed\n\nClosed on public holidays.",
    prix: "\ud83d\udcb0 **Competitive Pricing**\n\nWe offer new and used vehicles at great prices.\n\ud83d\udcca Free quote within 24h\n\ud83d\udcb3 Financing available\n\nView our catalogue:\n\ud83d\udd17 " + SITE_URL + "/catalog",
    rdv: "\ud83d\udcc5 **Book an Appointment**\n\nFor a visit or test drive, contact us:\n\ud83d\udcac WhatsApp: " + WA_DISPLAY + "\n\ud83d\udce7 " + EMAIL + "\n\nWe respond within 24h!",
    adresse: "\ud83d\udccd **Our Dealership**\n\n" + ADDRESS + ", Germany\n\n\ud83d\ude97 Free parking available\n\ud83d\ude97 Easily accessible",
    garantie: "\ud83d\udee1\ufe0f **Warranty Included**\n\nAll our vehicles come with:\n\u2705 12-month or 10,000 km warranty\n\u2705 Engine & transmission protection\n\u2705 After-sales service included\n\u2705 Extensions available (24/36 months)",
    marques: "\ud83d\ude97 **All Brands Available**\n\n\u2022 BMW, Mercedes, Audi, Volkswagen\n\u2022 Toyota, Honda, Hyundai, Kia\n\u2022 Ford, Opel, Renault, Peugeot\n\u2022 Tesla, Volvo, Porsche...\n\n\ud83d\udee1\ufe0f New & used vehicles\n\u26a1 Electric & hybrid",
    assurance: "\ud83d\udee1\ufe0f **Car Insurance**\n\nWe offer:\n\u2022 Comprehensive coverage\n\u2022 Third-party liability\n\u2022 Legal protection\n\nGet a personalized quote:\n\ud83d\udcac WhatsApp: " + WA_DISPLAY,
    financement: "\ud83d\udcca **Financing**\n\n\ud83d\udcb3 Flexible payment options:\n\u2022 Custom car loans\n\u2022 Leasing\n\u2022 Installment plans\n\nCalculator available on site.\nRequest your personalized offer!",
    livraison: "\ud83d\udfe1 **Delivery**\n\n\ud83d\ude9a Delivery across Europe\n\ud83d\udcc5 Timeframe: 3-7 business days\n\ud83d\udee1\ufe0f Vehicle insured during transport\n\u2705 Compliant documents\n\ud83d\udd17 " + SITE_URL + "/catalog",
    catalogue: "\ud83d\ude97 **Browse Our Catalogue**\n\nMore vehicles available:\n\ud83d\udd17 " + SITE_URL + "/catalog\n\nCategories: SUV, Sedan, Hatchback, Coupé, Estate, MPV, Utility, 4x4",
    electrique: "\u26a1 **Electric & Hybrid Vehicles**\n\nLarge selection available:\n\u2022 Tesla Model 3, Model Y\n\u2022 BMW iX, i4\n\u2022 Mercedes EQA, EQC\n\u2022 Volkswagen ID.3, ID.4\n\u2022 Hyundai Ioniq 5\n\nCheck out the catalogue!",
    entretien: "\ud83d\udd27 **Maintenance & Repair**\n\n\ud83d\udce1 Maintenance pack available:\n\u2022 2 full services included\n\u2022 Technical inspection\n\u2022 Tire change\n\nContact us for more info.",
    contact: "\ud83d\udcac **Contact Us**\n\n\ud83d\udcac WhatsApp: " + WA_DISPLAY + "\n\ud83d\udce7 " + EMAIL + "\n\ud83d\udccd " + ADDRESS + "\n\nWe respond within 24h!",
    remerciement: "You're welcome! Don't hesitate if you have more questions. \ud83d\ude0a",
    derriere: "For more information, you can:\n\ud83d\udd17 Browse our catalogue\n\ud83d\udcac Contact us on WhatsApp\n\nAlways at your service!",
    default: "Thanks for your message! I can help with:\n\n\ud83d\udd52 Hours \u2022 \ud83d\udccd Address\n\ud83d\ude97 Vehicles \u2022 \ud83d\udcb0 Pricing\n\ud83d\udee1\ufe0f Insurance \u2022 \ud83d\udcca Financing\n\ud83d\ude9a Delivery \u2022 \ud83d\udd27 Warranty",
  },
  de: {
    bonjour: "Hallo! Ich bin der Automatik Gebrauchtwagen Assistent \ud83d\udc4b\n\nFragen Sie mich nach:\n\ud83d\udd52 \u00d6ffnungszeiten \u2022 \ud83d\udccd Adresse\n\ud83d\ude97 Fahrzeuge \u2022 \ud83d\udcb0 Preise\n\ud83d\udd27 Garantie \u2022 \ud83d\udee1\ufe0f Versicherung\n\ud83c\udfe1 Lieferung \u2022 \ud83d\udcca Finanzierung",
    horaires: "\ud83d\udd52 **\u00d6ffnungszeiten**\n\n\ud83d\udcc5 Mo\u2013Fr: 08:00\u201318:00\n\ud83d\udcc5 Sa: 09:00\u201314:00\n\u274c So: Geschlossen\n\nGeschlossen an Feiertagen.",
    prix: "\ud83d\udcb0 **Faire Preise**\n\nWir bieten Neuwagen und Gebrauchtwagen zu besten Preisen an.\n\ud83d\udcca Kostenloses Angebot innerhalb 24h\n\ud83d\udcb3 Finanzierung verf\u00fcgbar\n\nKatalog ansehen:\n\ud83d\udd17 " + SITE_URL + "/catalog",
    rdv: "\ud83d\udcc5 **Termin vereinbaren**\n\nF\u00fcr einen Besuch oder Probefahrt:\n\ud83d\udcac WhatsApp: " + WA_DISPLAY + "\n\ud83d\udce7 " + EMAIL + "\n\nWir antworten innerhalb 24h!",
    adresse: "\ud83d\udccd **Unsere Werkstatt**\n\n" + ADDRESS + ", Deutschland\n\n\ud83d\ude97 Kostenloser Parkplatz\n\ud83d\ude97 Gut erreichbar",
    garantie: "\ud83d\udee1\ufe0f **Garantie inklusive**\n\nAlle Fahrzeuge mit:\n\u2705 12 Monate oder 10.000 km Garantie\n\u2705 Motor- & Getriebeschutz\n\u2705 After-Sales-Service\n\u2705 Erweiterungen verf\u00fcgbar (24/36 Monate)",
    marques: "\ud83d\ude97 **Alle Marken verf\u00fcgbar**\n\n\u2022 BMW, Mercedes, Audi, Volkswagen\n\u2022 Toyota, Honda, Hyundai, Kia\n\u2022 Ford, Opel, Renault, Peugeot\n\u2022 Tesla, Volvo, Porsche...\n\n\ud83d\udee1\ufe0f Neu- & Gebrauchtwagen\n\u26a1 Elektro & Hybrid",
    assurance: "\ud83d\udee1\ufe0f **Kfz-Versicherung**\n\nWir bieten:\n\u2022 Vollkasko\n\u2022 Haftpflicht\n\u2022 Rechtsschutz\n\nIndividuelles Angebot:\n\ud83d\udcac WhatsApp: " + WA_DISPLAY,
    financement: "\ud83d\udcca **Finanzierung**\n\n\ud83d\udcb3 Flexible Zahlungsoptionen:\n\u2022 Individuelles Autodarlehen\n\u2022 Leasing\n\u2022 Ratenzahlung\n\nAngebot anfordern!",
    livraison: "\ud83d\udfe1 **Lieferung**\n\n\ud83d\ude9a Lieferung in ganz Europa\n\ud83d\udcc5 Zeitraum: 3\u20137 Werktage\n\ud83d\udee1\ufe0f Fahrzeug versichert\n\u2705 Ordnungsgem\u00e4\u00dfe Dokumente\n\ud83d\udd17 " + SITE_URL + "/catalog",
    catalogue: "\ud83d\ude97 **Katalog ansehen**\n\nWeitere Fahrzeuge:\n\ud83d\udd17 " + SITE_URL + "/catalog\n\nKategorien: SUV, Limousine, Schrägheck, Coup\u00e9, Kombi, Van, Gel\u00e4ndewagen, 4x4",
    electrique: "\u26a1 **Elektro- & Hybridfahrzeuge**\n\nGro\u00dfe Auswahl:\n\u2022 Tesla Model 3, Model Y\n\u2022 BMW iX, i4\n\u2022 Mercedes EQA, EQC\n\u2022 Volkswagen ID.3, ID.4\n\u2022 Hyundai Ioniq 5\n\nKatalog ansehen!",
    entretien: "\ud83d\udd27 **Wartung & Reparatur**\n\n\ud83d\udce1 Wartungspaket:\n\u2022 2 vollst\u00e4ndige Inspektionen\n\u2022 Hauptuntersuchung\n\u2022 Reifenwechsel\n\nKontaktieren Sie uns!",
    contact: "\ud83d\udcac **Kontakt**\n\n\ud83d\udcac WhatsApp: " + WA_DISPLAY + "\n\ud83d\udce7 " + EMAIL + "\n\ud83d\udccd " + ADDRESS + "\n\nWir antworten innerhalb 24h!",
    remerciement: "Gern geschehen! Bei weiteren Fragen stehe ich zur Verf\u00fcgung. \ud83d\ude0a",
    derriere: "F\u00fcr weitere Informationen:\n\ud83d\udd17 Katalog durchst\u00f6bern\n\ud83d\udcac WhatsApp schreiben\n\nImmer f\u00fcr Sie da!",
    default: "Danke! Ich kann Ihnen helfen mit:\n\n\ud83d\udd52 \u00d6ffnungszeiten \u2022 \ud83d\udccd Adresse\n\ud83d\ude97 Fahrzeuge \u2022 \ud83d\udcb0 Preise\n\ud83d\udee1\ufe0f Versicherung \u2022 \ud83d\udcca Finanzierung\n\ud83d\ude9a Lieferung \u2022 \ud83d\udd27 Garantie",
  },
  es: {
    bonjour: "\u00a1Hola! Soy el asistente de Automatik Gebrauchtwagen \ud83d\udc4b\n\nPreg\u00favntame sobre:\n\ud83d\udd52 Horarios \u2022 \ud83d\udccd Direcci\u00f3n\n\ud83d\ude97 Veh\u00edculos \u2022 \ud83d\udcb0 Precios\n\ud83d\udd27 Garant\u00eda \u2022 \ud83d\udee1\ufe0f Seguro\n\ud83c\udfe1 Entrega \u2022 \ud83d\udcca Financiaci\u00f3n",
    horaires: "\ud83d\udd52 **Horario de apertura**\n\n\ud83d\udcc5 Lun\u2013Vie: 08:00 \u2013 18:00\n\ud83d\udcc5 S\u00e1bado: 09:00 \u2013 14:00\n\u274c Domingo: Cerrado",
    prix: "\ud83d\udcb0 **Precios competitivos**\n\nVeh\u00edculos nuevos y de ocasi\u00f3n.\n\ud83d\udcca Presupuesto gratuito en 24h\n\ud83d\udcb3 Financiaci\u00f3n disponible\n\nCat\u00e1logo:\n\ud83d\udd17 " + SITE_URL + "/catalog",
    rdv: "\ud83d\udcc5 **Cita previa**\n\n\ud83d\udcac WhatsApp: " + WA_DISPLAY + "\n\ud83d\udce7 " + EMAIL + "\n\u00a1Respondemos en 24h!",
    adresse: "\ud83d\udccd **Nuestro concesionario**\n\n" + ADDRESS + ", Alemania\n\ud83d\ude97 Parking gratuito",
    garantie: "\ud83d\udee1\ufe0f **Garant\u00eda incluida**\n\n\u2705 12 meses o 10.000 km\n\u2705 Protecci\u00f3n motor y transmisi\u00f3n\n\u2705 Servicio postventa incluido",
    marques: "\ud83d\ude97 **Todas las marcas**\n\n\u2022 BMW, Mercedes, Audi, VW\n\u2022 Toyota, Honda, Hyundai\n\u2022 Tesla, Volvo, Porsche...\n\n\ud83d\udee1\ufe0f Nuevos y de ocasi\u00f3n \u2022 \u26a1 El\u00e9ctricos",
    assurance: "\ud83d\udee1\ufe0f **Seguro de coche**\n\n\u2022 Todo riesgo\n\u2022 Responsabilidad civil\n\nPresupuesto personalizado:\n\ud83d\udcac WhatsApp: " + WA_DISPLAY,
    financement: "\ud83d\udcca **Financiaci\u00f3n**\n\n\ud83d\udcb3 Opciones flexibles:\n\u2022 Cr\u00e9dito a medida\n\u2022 Leasing\n\u2022 Plazos flexibles",
    livraison: "\ud83d\udfe1 **Entrega**\n\n\ud83d\ude9a Entrega en toda Europa\n\ud83d\udcc5 3-7 d\u00edas laborables\n\u2705 Documentos conformes",
    catalogue: "\ud83d\ude97 **Ver cat\u00e1logo**\n\n\ud83d\udd17 " + SITE_URL + "/catalog\n\nSUV, Sed\u00e1n, Utilitario, Coup\u00e9, Monovolumen, 4x4",
    electrique: "\u26a1 **El\u00e9ctricos e h\u00edbridos**\n\n\u2022 Tesla, BMW iX, Mercedes EQ\n\u2022 VW ID.3, Hyundai Ioniq 5\n\n\u00a1Consulta el cat\u00e1logo!",
    entretien: "\ud83d\udd27 **Mantenimiento**\n\n\ud83d\udce1 Pack de 2 revisiones incluidas",
    contact: "\ud83d\udcac **Contacto**\n\n\ud83d\udcac WhatsApp: " + WA_DISPLAY + "\n\ud83d\udce7 " + EMAIL,
    remerciement: "\u00a1De nada! No dude en preguntar. \ud83d\ude0a",
    derriere: "Para m\u00e1s info:\n\ud83d\udd17 Cat\u00e1logo \u2022 \ud83d\udcac WhatsApp",
    default: "\u00a1Hola! Puedo ayudar con:\n\n\ud83d\udd52 Horarios \u2022 \ud83d\udccd Direcci\u00f3n\n\ud83d\ude97 Veh\u00edculos \u2022 \ud83d\udcb0 Precios\n\ud83d\udee1\ufe0f Seguro \u2022 \ud83d\udcca Financiaci\u00f3n",
  },
  it: {
    bonjour: "Ciao! Sono l'assistente Automatik Gebrauchtwagen \ud83d\udc4b\n\nChiedimi di:\n\ud83d\udd52 Orari \u2022 \ud83d\udccd Indirizzo\n\ud83d\ude97 Veicoli \u2022 \ud83d\udcb0 Prezzi\n\ud83d\udd27 Garanzia \u2022 \ud83d\udee1\ufe0f Assicurazione\n\ud83c\udfe1 Consegna \u2022 \ud83d\udcca Finanziamento",
    horaires: "\ud83d\udd52 **Orari di apertura**\n\n\ud83d\udcc5 Lun\u2013Ven: 08:00 \u2013 18:00\n\ud83d\udcc5 Sab: 09:00 \u2013 14:00\n\u274c Dom: Chiuso",
    prix: "\ud83d\udcb0 **Prezzi competitivi**\n\nVeicoli nuovi e usati.\n\ud83d\udcca Preventivo gratuito in 24h\n\ud83d\udcb3 Finanziamento disponibile\n\nCatalogo:\n\ud83d\udd17 " + SITE_URL + "/catalog",
    rdv: "\ud83d\udd52 **Prenota un appuntamento**\n\n\ud83d\udcac WhatsApp: " + WA_DISPLAY + "\n\ud83d\udce7 " + EMAIL + "\nRispondiamo entro 24h!",
    adresse: "\ud83d\udccd **Il nostro concessionario**\n\n" + ADDRESS + ", Germania\n\ud83d\ude97 Parcheggio gratuito",
    garantie: "\ud83d\udee1\ufe0f **Garanzia inclusa**\n\n\u2705 12 mesi o 10.000 km\n\u2705 Protezione motore e trasmissione\n\u2705 Servizio post-vendita incluso",
    marques: "\ud83d\ude97 **Tutti i marchi**\n\n\u2022 BMW, Mercedes, Audi, VW\n\u2022 Toyota, Honda, Hyundai\n\u2022 Tesla, Volvo, Porsche...\n\n\ud83d\udee1\ufe0f Nuovi e usati \u2022 \u26a1 Elettrici",
    assurance: "\ud83d\udee1\ufe0f **Assicurazione auto**\n\n\u2022 Tutti i rischi\n\u2022 Responsabilit\u00e0 civile\n\nPreventivo personalizzato:\n\ud83d\udcac WhatsApp: " + WA_DISPLAY,
    financement: "\ud83d\udcca **Finanziamento**\n\n\ud83d\udcb3 Opzioni flessibili:\n\u2022 Prestito su misura\n\u2022 Leasing\n\u2022 Rate",
    livraison: "\ud83d\udfe1 **Consegna**\n\n\ud83d\ude9a Consegna in tutta Europa\n\ud83d\udcc5 3-7 giorni lavorativi\n\u2705 Documenti conformi",
    catalogue: "\ud83d\ude97 **Consulta il catalogo**\n\n\ud83d\udd17 " + SITE_URL + "/catalog\n\nSUV, Berlina, Utilitaria, Coup\u00e9, Familiare, Monovolume, 4x4",
    electrique: "\u26a1 **Elettrici e ibridi**\n\n\u2022 Tesla, BMW iX, Mercedes EQ\n\u2022 VW ID.3, Hyundai Ioniq 5",
    entretien: "\ud83d\udd27 **Manutenzione**\n\n\ud83d\udce1 Pacchetto 2 revisioni incluse",
    contact: "\ud83d\udcac **Contatto**\n\n\ud83d\udcac WhatsApp: " + WA_DISPLAY + "\n\ud83d\udce7 " + EMAIL,
    remerciement: "Prego! Non esiti a chiedere. \ud83d\ude0a",
    derriere: "Per maggiori info:\n\ud83d\udd17 Catalogo \u2022 \ud83d\udcac WhatsApp",
    default: "Ciao! Posso aiutarti con:\n\n\ud83d\udd52 Orari \u2022 \ud83d\udccd Indirizzo\n\ud83d\ude97 Veicoli \u2022 \ud83d\udcb0 Prezzi\n\ud83d\udee1\ufe0f Assicurazione \u2022 \ud83d\udcca Finanziamento",
  },
  pt: {
    bonjour: "Ol\u00e1! Sou o assistente Automatik Gebrauchtwagen \ud83d\udc4b\n\nPergunte-me sobre:\n\ud83d\udd52 Hor\u00e1rios \u2022 \ud83d\udccd Endere\u00e7o\n\ud83d\ude97 Ve\u00edculos \u2022 \ud83d\udcb0 Pre\u00e7os\n\ud83d\udd27 Garantia \u2022 \ud83d\udee1\ufe0f Seguro\n\ud83c\udfe1 Entrega \u2022 \ud83d\udcca Financiamento",
    horaires: "\ud83d\udd52 **Hor\u00e1rio de funcionamento**\n\n\ud83d\udcc5 Seg\u2013Sex: 08:00 \u2013 18:00\n\ud83d\udcc5 S\u00e1bado: 09:00 \u2013 14:00\n\u274c Domingo: Fechado",
    prix: "\ud83d\udcb0 **Pre\u00e7os competitivos**\n\nVe\u00edculos novos e usados.\n\ud83d\udcca Or\u00e7amento gratuito em 24h\n\ud83d\udcb3 Financiamento dispon\u00edvel\n\nCat\u00e1logo:\n\ud83d\udd17 " + SITE_URL + "/catalog",
    rdv: "\ud83d\udd52 **Marcar consulta**\n\n\ud83d\udcac WhatsApp: " + WA_DISPLAY + "\n\ud83d\udce7 " + EMAIL + "\nRespondemos em 24h!",
    adresse: "\ud83d\udccd **A nossa concession\u00e1ria**\n\n" + ADDRESS + ", Alemanha\n\ud83d\ude97 Estacionamento gratuito",
    garantie: "\ud83d\udee1\ufe0f **Garantia inclu\u00edda**\n\n\u2705 12 meses ou 10.000 km\n\u2705 Prote\u00e7\u00e3o do motor e transmiss\u00e3o\n\u2705 Servi\u00e7o p\u00f3s-venda inclu\u00eddo",
    marques: "\ud83d\ude97 **Todas as marcas**\n\n\u2022 BMW, Mercedes, Audi, VW\n\u2022 Toyota, Honda, Hyundai\n\u2022 Tesla, Volvo, Porsche...\n\n\ud83d\udee1\ufe0f Novos e usados \u2022 \u26a1 El\u00e9tricos",
    assurance: "\ud83d\udee1\ufe0f **Seguro autom\u00f3vel**\n\n\u2022 Todo o risco\n\u2022 Responsabilidade civil\n\nOr\u00e7amento personalizado:\n\ud83d\udcac WhatsApp: " + WA_DISPLAY,
    financement: "\ud83d\udcca **Financiamento**\n\n\ud83d\udcb3 Op\u00e7\u00f5es flex\u00edveis:\n\u2022 Cr\u00e9dito personalizado\n\u2022 Leasing\n\u2022 Presta\u00e7\u00f5es",
    livraison: "\ud83d\udfe1 **Entrega**\n\n\ud83d\ude9a Entrega em toda a Europa\n\ud83d\udcc5 3-7 dias \u00fateis\n\u2705 Documentos conformes",
    catalogue: "\ud83d\ude97 **Ver cat\u00e1logo**\n\n\ud83d\udd17 " + SITE_URL + "/catalog\n\nSUV, Berlina, Utilit\u00e1rio, Coup\u00e9, Perua, Monovolume, 4x4",
    electrique: "\u26a1 **El\u00e9tricos e h\u00edbridos**\n\n\u2022 Tesla, BMW iX, Mercedes EQ\n\u2022 VW ID.3, Hyundai Ioniq 5",
    entretien: "\ud83d\udd27 **Manuten\u00e7\u00e3o**\n\n\ud83d\udce1 Pacote de 2 revis\u00f5es inclu\u00eddas",
    contact: "\ud83d\udcac **Contacto**\n\n\ud83d\udcac WhatsApp: " + WA_DISPLAY + "\n\ud83d\udce7 " + EMAIL,
    remerciement: "De nada! N\u00e3o hesite em perguntar. \ud83d\ude0a",
    derriere: "Para mais info:\n\ud83d\udd17 Cat\u00e1logo \u2022 \ud83d\udcac WhatsApp",
    default: "Ol\u00e1! Posso ajudar com:\n\n\ud83d\udd52 Hor\u00e1rios \u2022 \ud83d\udccd Endere\u00e7o\n\ud83d\ude97 Ve\u00edculos \u2022 \ud83d\udcb0 Pre\u00e7os\n\ud83d\udee1\ufe0f Seguro \u2022 \ud83d\udcca Financiamento",
  },
  ar: {
    bonjour: "\u0645\u0631\u062d\u0628\u0627\u064b! \u0623\u0646\u0627 \u0645\u0633\u0627\u0639\u062f Automatik Gebrauchtwagen \ud83d\udc4b\n\n\u0633\u0624\u0644\u0646\u064a \u0639\u0646:\n\ud83d\udd52 \u0627\u0644\u0633\u0627\u0639\u0627\u062a \u2022 \ud83d\udccd \u0627\u0644\u0639\u0646\u0648\u0627\u0646\n\ud83d\ude97 \u0627\u0644\u0645\u0631\u0643\u0628\u0627\u062a \u2022 \ud83d\udcb0 \u0627\u0644\u0623\u0633\u0639\u0627\u0631\n\ud83d\udd27 \u0627\u0644\u0636\u0645\u0627\u0646 \u2022 \ud83d\udee1\ufe0f \u0627\u0644\u062a\u0623\u0645\u064a\u0646\n\ud83c\udfe1 \u0627\u0644\u062a\u0648\u0635\u064a\u0644 \u2022 \ud83d\udcca \u0627\u0644\u062a\u0645\u0648\u064a\u0644",
    horaires: "\ud83d\udd52 **\u0633\u0627\u0639\u0627\u062a \u0627\u0644\u0639\u0645\u0644**\n\n\ud83d\udcc5 \u0627\u0644\u0625\u062b\u0646\u064a\u0646\u2013\u0627\u0644\u062c\u0645\u0639\u0629: 08:00\u201318:00\n\ud83d\udcc5 \u0627\u0644\u0633\u0628\u062a: 09:00\u201314:00\n\u274c \u0627\u0644\u0623\u062d\u062f: \u0645\u063a\u0644\u0642",
    prix: "\ud83d\udcb0 **\u0623\u0633\u0639\u0627\u0631 \u0639\u0627\u062f\u0644\u0629**\n\n\u0633\u064a\u0627\u0631\u0627\u062a \u062c\u062f\u064a\u062f\u0629 \u0648\u0645\u0633\u062a\u0639\u0645\u0644\u0629.\n\ud83d\udd17 " + SITE_URL + "/catalog",
    rdv: "\ud83d\udd52 **\u062d\u062c\u0632 \u0645\u0648\u0639\u062f**\n\n\ud83d\udcac WhatsApp: " + WA_DISPLAY + "\n\ud83d\udce7 " + EMAIL,
    adresse: "\ud83d\udccd **\u0645\u0643\u0627\u0646\u0646\u0627**\n\n" + ADDRESS + "\n\ud83d\ude97 \u0645\u0648\u0627\u0642\u0639 \u0645\u062c\u0627\u0646\u064a \u0645\u062a\u0627\u062d",
    garantie: "\ud83d\udee1\ufe0f **\u0636\u0645\u0627\u0646 \u0645\u0634\u0645\u0648\u0644**\n\n\u2705 12 \u0634\u0647\u0631 \u0623\u0648 10000 \u0643\u0645\n\u2705 \u062d\u0645\u0627\u064a\u0629 \u0627\u0644\u0645\u062d\u0631\u0643\n\u2705 \u062e\u062f\u0645\u0629 \u0628\u0639\u062f \u0627\u0644\u0628\u064a\u0639",
    marques: "\ud83d\ude97 **\u062c\u0645\u064a\u0639 \u0627\u0644\u0645\u0627\u0631\u0643\u0627\u062a**\n\n\u2022 BMW, Mercedes, Audi, VW\n\u2022 Toyota, Honda, Hyundai\n\u2022 Tesla, Volvo, Porsche...",
    assurance: "\ud83d\udee1\ufe0f **\u062a\u0623\u0645\u064a\u0646 \u0627\u0644\u0633\u064a\u0627\u0631\u0629**\n\n\ud83d\udcac WhatsApp: " + WA_DISPLAY,
    financement: "\ud83d\udcca **\u0627\u0644\u062a\u0645\u0648\u064a\u0644**\n\n\u062e\u064a\u0627\u0631\u0627\u062a \u0645\u0631\u0646\u0637\u0642\u0629",
    livraison: "\ud83d\udfe1 **\u0627\u0644\u062a\u0648\u0635\u064a\u0644**\n\n\ud83d\ude9a \u062a\u0648\u0635\u064a\u0644 \u0641\u064a \u062c\u0645\u064a\u0639 \u0623\u0648\u0631\u0648\u0628\u0627",
    catalogue: "\ud83d\ude97 **\u0639\u0631\u0636 \u0627\u0644\u0643\u062a\u0627\u0644\u0648\u062c**\n\n\ud83d\udd17 " + SITE_URL + "/catalog",
    electrique: "\u26a1 **\u0633\u064a\u0627\u0631\u0627\u062a \u0643\u0647\u0631\u0628\u0627\u0626\u064a\u0629**",
    entretien: "\ud83d\udd27 **\u0627\u0644\u0635\u064a\u0627\u0646\u0629**\n\n\ud83d\udce1 \u0628\u0627\u0642\u0629 \u0635\u064a\u0627\u0646\u0629",
    contact: "\ud83d\udcac **\u0627\u0644\u062a\u0648\u0627\u0635\u0644**\n\n\ud83d\udcac WhatsApp: " + WA_DISPLAY + "\n\ud83d\udce7 " + EMAIL,
    remerciement: "\u0639\u0646\u0627 \u0633\u064a\u0631! \u0644\u0627 \u062a\u062a\u062e\u0630\u0631 \u0633\u0624\u0644\u0643. \ud83d\ude0a",
    derriere: "\u0644\u0645\u0632\u064a\u062f:\n\ud83d\udd17 \u0627\u0644\u0643\u062a\u0627\u0644\u0648\u062c \u2022 \ud83d\udcac WhatsApp",
    default: "\u0645\u0631\u062d\u0628\u0627\u064b! \u064a\u0645\u0643\u0646 \u0645\u0633\u0627\u0639\u062f\u062a\u0643 \u0641\u064a:\n\n\ud83d\udd52 \u0627\u0644\u0633\u0627\u0639\u0627\u062a \u2022 \ud83d\udccd \u0627\u0644\u0639\u0646\u0648\u0627\u0646\n\ud83d\ude97 \u0627\u0644\u0645\u0631\u0643\u0628\u0627\u062a \u2022 \ud83d\udcb0 \u0627\u0644\u0623\u0633\u0639\u0627\u0631",
  },
};

/* ─── Contextual Quick Buttons per topic ─── */
const FOLLOW_UPS = {
  fr: {
    horaires:    ['Adresse', 'Véhicules', 'Contact'],
    prix:        ['Catalogue', 'Financement', 'Garantie'],
    rdv:         ['Horaires', 'Adresse', 'Véhicules'],
    adresse:     ['Horaires', 'Véhicules', 'Contact'],
    garantie:    ['Véhicules', 'Prix', 'Catalogue'],
    marques:     ['Catalogue', 'Prix', 'Financement'],
    assurance:   ['Garantie', 'Prix', 'Contact'],
    financement: ['Prix', 'Catalogue', 'Garantie'],
    livraison:   ['Catalogue', 'Contact', 'Garantie'],
    catalogue:   ['Prix', 'Financement', 'Garantie'],
    electrique:  ['Catalogue', 'Prix', 'Financement'],
    entretien:   ['Garantie', 'Contact', 'Prix'],
    contact:     ['Adresse', 'Horaires', 'Catalogue'],
    default:     ['Véhicules', 'Prix', 'Contact'],
  },
  en: {
    horaires:    ['Address', 'Vehicles', 'Contact'],
    prix:        ['Catalogue', 'Financing', 'Warranty'],
    rdv:         ['Hours', 'Address', 'Vehicles'],
    adresse:     ['Hours', 'Vehicles', 'Contact'],
    garantie:    ['Vehicles', 'Pricing', 'Catalogue'],
    marques:     ['Catalogue', 'Pricing', 'Financing'],
    assurance:   ['Warranty', 'Pricing', 'Contact'],
    financement: ['Pricing', 'Catalogue', 'Warranty'],
    livraison:   ['Catalogue', 'Contact', 'Warranty'],
    catalogue:   ['Pricing', 'Financing', 'Warranty'],
    electrique:  ['Catalogue', 'Pricing', 'Financing'],
    entretien:   ['Warranty', 'Contact', 'Pricing'],
    contact:     ['Address', 'Hours', 'Catalogue'],
    default:     ['Vehicles', 'Pricing', 'Contact'],
  },
  de: {
    horaires:    ['Adresse', 'Fahrzeuge', 'Kontakt'],
    prix:        ['Katalog', 'Finanzierung', 'Garantie'],
    rdv:         ['Öffnungszeiten', 'Adresse', 'Fahrzeuge'],
    adresse:     ['Öffnungszeiten', 'Fahrzeuge', 'Kontakt'],
    garantie:    ['Fahrzeuge', 'Preise', 'Katalog'],
    marques:     ['Katalog', 'Preise', 'Finanzierung'],
    assurance:   ['Garantie', 'Preise', 'Kontakt'],
    financement: ['Preise', 'Katalog', 'Garantie'],
    livraison:   ['Katalog', 'Kontakt', 'Garantie'],
    catalogue:   ['Preise', 'Finanzierung', 'Garantie'],
    electrique:  ['Katalog', 'Preise', 'Finanzierung'],
    entretien:   ['Garantie', 'Kontakt', 'Preise'],
    contact:     ['Adresse', 'Öffnungszeiten', 'Katalog'],
    default:     ['Fahrzeuge', 'Preise', 'Kontakt'],
  },
};

/* ─── Keyword Detection ─── */
const KEYWORDS = [
  { keys: /\b(hello|hi\b|hey|good\s*morning|good\s*afternoon|salut|bonjour|hallo|moin|ola|ciao|مرحب|سلام|مرحبا)/i, topic: 'bonjour' },
  { keys: /\b(heure|horaire|hour|open|closing|uhrzeit|öffnung|zeiten|orario|horario|horário|horario|ساعات|وقت|ساعة)/i, topic: 'horaires' },
  { keys: /\b(prix|price|cost|tarif|quote|devis|preis|kosten|angebot|prezzo|costo|preventivo|preço|orçamento|سعر|تكلفة|أسعار)/i, topic: 'prix' },
  { keys: /\b(rendez|appointment|book|test\s*drive|visit|termin|reserv|预约|prenota|cita|marcar|موعد|حجز)/i, topic: 'rdv' },
  { keys: /\b(adresse|address|location|where|lieu|wo|indirizzo|dirección|endereço|عنوان|أين|ورشة)/i, topic: 'adresse' },
  { keys: /\b(garantie|warranty|guarantee|gewähr|garanzia|garantía|garantia|ضمان)/i, topic: 'garantie' },
  { keys: /\b(marque|brand|make|modèle|model|marke|marca|marchio|ماركة|سيارة)/i, topic: 'marques' },
  { keys: /\b(assur|insurance|versicher|assicur|seguro|seguro|تأمين)/i, topic: 'assurance' },
  { keys: /\b(financ|credit|loan|leasing|payment|kredit|darlehen|credito|crédito|prest|credit|تمويل|قرض)/i, topic: 'financement' },
  { keys: /\b(livr|deliver|shipping|transport|liefer|versand|consegna|entrega|entrega|توصيل|شحن)/i, topic: 'livraison' },
  { keys: /\b(catalog|catalogue|browse|vehicle|car|voiture|fahrzeug|auto|veículo|véhicule|catalogo|catálogo|سيارة|مركبة)/i, topic: 'catalogue' },
  { keys: /\b(elec|hybrid|électrique|electrique|tesla|ev\b|elektro|hibrid|elettrico|ibrido|كهرب|هجين)/i, topic: 'electrique' },
  { keys: /\b(entretien|maintenance|service|repair|wartung|reparatur|manuten|maintenance|صيانة|إصلاح)/i, topic: 'entretien' },
  { keys: /\b(contact|appel|call|phone|téléphone|tel|kontact|rufnummer|telefono|telefone|اتصال|هاتف)/i, topic: 'contact' },
  { keys: /\b(merci|thanks|thank|danke|grazie|gracias|obrigad|شكرا)/i, topic: 'remerciement' },
  { keys: /\b(et\s*après|and\s*after|what\s*else|noch|dann|après|after|altro|más|mais|بعد|ثم)/i, topic: 'derriere' },
];

function detectTopic(msg) {
  for (const { keys, topic } of KEYWORDS) {
    if (keys.test(msg)) return topic;
  }
  return null;
}

/* ─── Quick Button Labels ─── */
const QB_LABELS = {
  fr: { horaires:'Horaires', rdv:'Rendez-vous', adresse:'Adresse', prix:'Tarifs', garantie:'Garantie', assurance:'Assurance', financement:'Financement', livraison:'Livraison', catalogue:'Catalogue', marques:'Marques', electrique:'Électrique', entretien:'Entretien', contact:'Contact', default:'Véhicules' },
  en: { horaires:'Hours', rdv:'Appointment', adresse:'Address', prix:'Pricing', garantie:'Warranty', assurance:'Insurance', financement:'Financing', livraison:'Delivery', catalogue:'Catalogue', marques:'Brands', electrique:'Electric', entretien:'Maintenance', contact:'Contact', default:'Vehicles' },
  de: { horaires:'Öffnungsz.', rdv:'Termin', adresse:'Adresse', prix:'Preise', garantie:'Garantie', assurance:'Versicherung', financement:'Finanzierung', livraison:'Lieferung', catalogue:'Katalog', marques:'Marken', electrique:'Elektro', entretien:'Wartung', contact:'Kontakt', default:'Fahrzeuge' },
  es: { horaires:'Horarios', rdv:'Cita', adresse:'Dirección', prix:'Precios', garantie:'Garantía', assurance:'Seguro', financement:'Financiación', livraison:'Entrega', catalogue:'Catálogo', marques:'Marcas', electrique:'Eléctrico', entretien:'Mantenim.', contact:'Contacto', default:'Vehículos' },
  it: { horaires:'Orari', rdv:'Appuntamento', adresse:'Indirizzo', prix:'Prezzi', garantie:'Garanzia', assurance:'Assicuraz.', financement:'Finanziamento', livraison:'Consegna', catalogue:'Catalogo', marques:'Marchi', electrique:'Elettrico', entretien:'Manutenz.', contact:'Contatto', default:'Veicoli' },
  pt: { horaires:'Horários', rdv:'Marcação', adresse:'Endereço', prix:'Preços', garantie:'Garantia', assurance:'Seguro', financement:'Financiam.', livraison:'Entrega', catalogue:'Catálogo', marques:'Marcas', electrique:'Elétrico', entretien:'Manutenç.', contact:'Contacto', default:'Veículos' },
  ar: { horaires:'الساعات', rdv:'موعد', adresse:'العنوان', prix:'الأسعار', garantie:'الضمان', assurance:'تأمين', financement:'تمويل', livraison:'توصيل', catalogue:'الكتالوج', marques:'الماركات', electrique:'كهربائي', entretien:'صيانة', contact:'اتصال', default:'المركبات' },
};

const PLACEHOLDERS = { fr:'Votre question...', en:'Your question...', de:'Ihre Frage...', es:'Su pregunta...', it:'La sua domanda...', pt:'A sua pergunta...', ar:'سؤالك...' };
const HEADER_STATUS = { fr:'En ligne \u00b7 R\u00e9pond rapidement', en:'Online \u00b7 Replies quickly', de:'Online \u00b7 Antwortet schnell', es:'En l\u00ednea \u00b7 Responde r\u00e1pido', it:'Online \u00b7 Risponde rapidamente', pt:'Online \u00b7 Responde r\u00e1pido', ar:'\u0645\u062a\u0635\u0644 \u00b7 \u064a\u0631\u062f \u0628\u0633\u0631\u0639\u0629' };

export default function Chatbot() {
  const { lang } = useLangStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const L = lang || 'fr';
  const localR = R[L] || R.fr;
  const qbLabels = QB_LABELS[L] || QB_LABELS.fr;
  const followUps = FOLLOW_UPS[L] || FOLLOW_UPS.fr;

  const [open, setOpen]       = useState(false);
  const [topic, setTopic]     = useState('bonjour');
  const [msgs, setMsgs]       = useState([{ from: 'bot', text: localR.bonjour, topic: 'bonjour' }]);
  const [input, setInput]     = useState('');
  const [typing, setTyping]   = useState(false);
  const [notif, setNotif]     = useState(true);
  const endRef   = useRef(null);
  const inputRef = useRef(null);

  const winBg      = isDark ? '#0f0f0f'                 : '#ffffff';
  const winBorder  = isDark ? 'rgba(255,255,255,0.08)'  : 'rgba(0,0,0,0.1)';
  const msgBotBg   = isDark ? '#1a1a1a'                 : '#f0f0f0';
  const msgBotText = isDark ? '#e8e8e8'                 : '#111111';
  const inputBg    = isDark ? 'rgba(255,255,255,0.05)'  : 'rgba(0,0,0,0.04)';
  const inputBorder= isDark ? 'rgba(255,255,255,0.08)'  : 'rgba(0,0,0,0.12)';
  const inputText  = isDark ? '#e8e8e8'                 : '#111111';
  const inputPh    = isDark ? 'rgba(255,255,255,0.35)'  : 'rgba(0,0,0,0.35)';
  const footerBg   = isDark ? '#141414'                 : '#f8f8f8';
  const footerBord = isDark ? 'rgba(255,255,255,0.06)'  : 'rgba(0,0,0,0.08)';
  const dotBg      = isDark ? '#555'                    : '#bbb';
  const quickBg    = isDark ? 'rgba(19,40,83,0.08)'    : 'rgba(19,40,83,0.06)';
  const quickBd    = isDark ? 'rgba(19,40,83,0.2)'     : 'rgba(19,40,83,0.25)';
  const quickText  = isDark ? 'rgba(255,255,255,0.7)'   : '#132853';
  const quickHoverBg= isDark ? 'rgba(19,40,83,0.18)'    : 'rgba(19,40,83,0.14)';

  useEffect(() => {
    const lr = R[L] || R.fr;
    setMsgs([{ from: 'bot', text: lr.bonjour, topic: 'bonjour' }]);
    setTopic('bonjour');
  }, [L]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, typing]);
  useEffect(() => { if (open) { setNotif(false); setTimeout(() => inputRef.current?.focus(), 200); } }, [open]);

  const send = useCallback((text) => {
    const msg = (text || input).trim();
    if (!msg) return;

    setMsgs(m => [...m, { from: 'user', text: msg }]);
    setInput('');
    setTyping(true);

    const detected = detectTopic(msg) || 'default';
    const reply = localR[detected] || localR.default;
    const nextTopic = detected;

    setTimeout(() => {
      setTyping(false);
      setTopic(nextTopic);
      setMsgs(m => [...m, { from: 'bot', text: reply, topic: nextTopic }]);
    }, 350 + Math.random() * 250);
  }, [input, localR]);

  const currentQuickButtons = (() => {
    const labels = followUps[topic] || followUps.default || [];
    return labels.map(label => {
      const key = Object.entries(qbLabels).find(([, v]) => v === label)?.[0];
      return { label, key };
    }).filter(b => b.key && qbLabels[b.key]);
  })();

  const initialButtons = [
    { key: 'horaires', label: qbLabels.horaires },
    { key: 'catalogue', label: qbLabels.catalogue },
    { key: 'prix', label: qbLabels.prix },
    { key: 'garantie', label: qbLabels.garantie },
    { key: 'assurance', label: qbLabels.assurance },
    { key: 'contact', label: qbLabels.contact },
  ];

  const showButtons = msgs.length <= 1 ? initialButtons : currentQuickButtons;

  return (
    <>
      <button className="chat-btn" onClick={() => setOpen(o => !o)} aria-label="Chat">
        <span style={{ fontSize: 26 }}>{open ? '\u2715' : '\ud83d\udcac'}</span>
        {!open && notif && <div className="chat-notif">1</div>}
      </button>

      <div
        className={`chat-window ${open ? 'open' : 'closed'}`}
        style={{ background: winBg, border: `1px solid ${winBorder}`, boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.6)' : '0 20px 60px rgba(0,0,0,0.15)' }}
      >
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #0E1E3D, #132853)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
            🔧
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 800, fontSize: 15, color: '#fff' }}>
              Automatik Gebrauchtwagen
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <span style={{ width: 6, height: 6, background: '#4ade80', borderRadius: '50%', display: 'inline-block' }} />
              {HEADER_STATUS[L] || HEADER_STATUS.fr}
            </div>
          </div>
          <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', fontSize: 18, cursor: 'pointer', padding: 4 }}>
            ✕
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 8, background: winBg }}>
          <AnimatePresence initial={false}>
            {msgs.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
                style={{
                  maxWidth: '88%', padding: '10px 14px', borderRadius: 10,
                  fontSize: 13.5, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                  background: m.from === 'bot' ? msgBotBg : '#132853',
                  color: m.from === 'bot' ? msgBotText : '#fff',
                  alignSelf: m.from === 'bot' ? 'flex-start' : 'flex-end',
                  borderBottomLeftRadius: m.from === 'bot' ? 3 : 10,
                  borderBottomRightRadius: m.from === 'user' ? 3 : 10,
                }}
              >
                {m.text}
              </motion.div>
            ))}
          </AnimatePresence>

          {typing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ display: 'flex', gap: 4, padding: '10px 14px', background: msgBotBg, borderRadius: 10, alignSelf: 'flex-start', borderBottomLeftRadius: 3 }}>
              {[0,1,2].map(i => (
                <span key={i} style={{ width: 6, height: 6, background: dotBg, borderRadius: '50%', display: 'block', animation: 'bounce 1.2s ease infinite', animationDelay: `${i * 0.15}s` }} />
              ))}
            </motion.div>
          )}
          <div ref={endRef} />
        </div>

        {/* Quick Buttons */}
        {showButtons.length > 0 && (
          <div style={{ padding: '0 12px 10px', display: 'flex', flexWrap: 'wrap', gap: 5, background: winBg }}>
            {showButtons.map(b => (
              <button key={b.key} onClick={() => send(b.label)}
                style={{
                  background: quickBg, border: `1px solid ${quickBd}`, color: quickText,
                  fontSize: 11.5, fontWeight: 600, padding: '5px 10px', borderRadius: 16,
                  cursor: 'pointer', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", transition: 'all 0.15s',
                }}
                onMouseOver={e => { e.currentTarget.style.background = quickHoverBg; e.currentTarget.style.color = '#132853'; }}
                onMouseOut={e => { e.currentTarget.style.background = quickBg; e.currentTarget.style.color = quickText; }}>
                {b.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ display: 'flex', gap: 6, padding: '10px 12px', borderTop: `1px solid ${footerBord}`, background: footerBg, flexShrink: 0 }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder={PLACEHOLDERS[L] || PLACEHOLDERS.fr}
            style={{
              flex: 1, background: inputBg, border: `1px solid ${inputBorder}`, color: inputText,
              borderRadius: 8, padding: '9px 12px', fontSize: 13.5, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              outline: 'none', transition: 'border-color 0.15s',
            }}
            onFocus={e => e.target.style.borderColor = '#132853'}
            onBlur={e => e.target.style.borderColor = inputBorder}
          />
          <style>{`.chat-window input::placeholder { color: ${inputPh}; } @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
          <button
            onClick={() => send()}
            disabled={!input.trim()}
            style={{
              background: input.trim() ? '#132853' : (isDark ? 'rgba(19,40,83,0.3)' : 'rgba(19,40,83,0.2)'),
              border: 'none', borderRadius: 8, cursor: input.trim() ? 'pointer' : 'not-allowed',
              width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 16, flexShrink: 0, transition: 'background 0.15s',
            }}>
            ➤
          </button>
        </div>
      </div>
    </>
  );
}
