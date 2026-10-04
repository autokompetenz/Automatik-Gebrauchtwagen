import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { carAPI } from '../services/api';
import { formatEuro } from '../utils/helpers';
import { useLangStore, useThemeStore } from '../store';
import { t } from '../utils/i18n';
import CarCard from '../components/CarCard';
import BrandLogo from '../components/BrandLogo';
import Speedometer from '../components/Speedometer';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { ALL_REVIEWS } from '../utils/reviews';
import { HOME_BRANDS } from '../utils/brands';

const SERVICES = [
  { icon:'🚗', fr:'Voitures Neuves',       en:'New Cars',           de:'Neuwagen',          es:'Coches Nuevos',       it:'Auto Nuove',         pt:'Carros Novos',       tag:'2024 Models',
    descFr:'Derniers modèles, garantie constructeur, financement personnalisé.', descEn:'Latest models, manufacturer warranty, personalized financing.', descDe:'Neueste Modelle, Herstellergarantie, Finanzierung.', descEs:'Últimos modelos, garantía de fabricante, financiación personalizada.', descIt:'Ultimi modelli, garanzia del produttore, finanziamento personalizzato.', descPt:'Últimos modelos, garantia do fabricante, financiamento personalizado.' },
  { icon:'🔧', fr:"Voitures d'Occasion",   en:'Used Cars',          de:'Gebrauchtwagen',    es:'Coches de Ocasión',   it:'Auto Usate',         pt:'Carros Usados',      tag:'Certified',
    descFr:'Véhicules vérifiés, historique complet, garantie jusqu\'à 24 mois.', descEn:'Verified vehicles, complete history, warranty up to 24 months.', descDe:'Geprüfte Fahrzeuge, vollständige Historie, Garantie bis 24 Monate.', descEs:'Vehículos verificados, historial completo, garantía hasta 24 meses.', descIt:'Veicoli verificati, storia completa, garanzia fino a 24 mesi.', descPt:'Veículos verificados, histórico completo, garantia até 24 meses.' },
  { icon:'💳', fr:'Financement Auto',       en:'Car Financing',      de:'Autofinanzierung',  es:'Financiación Auto',   it:'Finanziamento Auto', pt:'Financiamento Auto',  tag:'Fast Approval',
    descFr:'Crédit sur mesure, taux avantageux, réponse en 24h.', descEn:'Tailored credit, competitive rates, response in 24h.', descDe:'Maßgeschneiderter Kredit, wettbewerbsfähige Zinsen, Antwort in 24h.', descEs:'Crédito a medida, tasas competitivas, respuesta en 24h.', descIt:'Credito su misura, tassi competitivi, risposta in 24h.', descPt:'Crédito personalizado, taxas competitivas, resposta em 24h.' },
  { icon:'🔄', fr:'Reprise & Échange',      en:'Trade-in & Exchange', de:'Ankauf & Tausch',  es:'Canje y Cambio',      it:'Permuta',            pt:'Permuta',             tag:'Best Value',
    descFr:'Reprise de votre véhicule actuel, estimation gratuite.', descEn:'Trade-in your current vehicle, free valuation.', descDe:'Ankauf Ihres Fahrzeugs, kostenlose Bewertung.', descEs:'Canje de su vehículo actual, valoración gratuita.', descIt:'Permuta del vostro veicolo, valutazione gratuita.', descPt:'Troca do seu veículo, avaliação gratuita.' },
  { icon:'🛡️', fr:'Garantie & SAV',         en:'Warranty & Support', de:'Garantie & Service', es:'Garantía y SAV',     it:'Garanzia e Supporto', pt:'Garantia e Suporte',  tag:'Full Coverage',
    descFr:'Garantie étendue, service après-vente, assistance 24/7.', descEn:'Extended warranty, after-sales service, 24/7 assistance.', descDe:'Erweiterte Garantie, Kundendienst, 24/7 Unterstützung.', descEs:'Garantía extendida, servicio posventa, asistencia 24/7.', descIt:'Garanzia estesa, assistenza post-vendita, supporto 24/7.', descPt:'Garantia estendida, assistência pós-venda, suporte 24/7.' },
  { icon:'🚚', fr:'Livraison & Transport',  en:'Delivery & Transport', de:'Lieferung',        es:'Entrega y Transporte', it:'Consegna e Trasporto', pt:'Entrega e Transporte', tag:'Door to Door',
    descFr:'Livraison à domicile, transport sécurisé, toute l\'Allemagne.', descEn:'Home delivery, secure transport, all of Germany.', descDe:'Lieferung nach Hause, sicherer Transport, ganz Deutschland.', descEs:'Entrega a domicilio, transporte seguro, toda Alemania.', descIt:'Consegna a domicilio, trasporto sicuro, tutta la Germania.', descPt:'Entrega em casa, transporte seguro, toda a Alemanha.' },
];


// ── PURCHASE STEPS DATA ──────────────────────────────────────────────────────
const getPurchaseSteps = (l) => [
  {
    icon: '🔍',
    step: '01',
    fr: { title: 'Sélection du véhicule', desc: 'Parcourez notre catalogue en ligne ou contactez-nous. Filtrez par marque, modèle, prix et kilométrage. Chaque fiche inclut photos HD, historique complet et rapport d\'inspection.' },
    en: { title: 'Vehicle selection', desc: 'Browse our online catalog or contact us. Filter by brand, model, price and mileage. Each listing includes HD photos, full history and inspection report.' },
    de: { title: 'Fahrzeugauswahl', desc: 'Durchsuchen Sie unseren Online-Katalog oder kontaktieren Sie uns. Filtern nach Marke, Modell, Preis und Kilometerstand. Jedes Inserat enthält HD-Fotos, vollständige Historie und Prüfbericht.' },
    es: { title: 'Selección del vehículo', desc: 'Explore nuestro catálogo en línea o contáctenos. Filtre por marca, modelo, precio y kilometraje. Cada ficha incluye fotos HD, historial completo e informe de inspección.' },
    it: { title: 'Selezione del veicolo', desc: 'Sfogliate il nostro catalogo online o contattateci. Filtrate per marca, modello, prezzo e chilometraggio. Ogni scheda include foto HD, storia completa e rapporto di ispezione.' },
    pt: { title: 'Seleção do veículo', desc: 'Navegue pelo nosso catálogo online ou entre em contacto. Filtre por marca, modelo, preço e quilometragem. Cada ficha inclui fotos HD, histórico completo e relatório de inspeção.' },
  },
  {
    icon: '💬',
    step: '02',
    fr: { title: 'Contact & Devis', desc: 'Contactez-nous par WhatsApp, email ou téléphone. Nous vous envoyons un devis détaillé sous 24h avec toutes les options disponibles, frais inclus et conditions de financement.' },
    en: { title: 'Contact & Quote', desc: 'Reach us via WhatsApp, email or phone. We send you a detailed quote within 24h with all available options, included fees and financing conditions.' },
    de: { title: 'Kontakt & Angebot', desc: 'Kontaktieren Sie uns per WhatsApp, E-Mail oder Telefon. Wir senden Ihnen innerhalb 24h ein detailliertes Angebot mit allen Optionen, inklusive Gebühren und Finanzierungsbedingungen.' },
    es: { title: 'Contacto & Presupuesto', desc: 'Contáctenos por WhatsApp, email o teléfono. Le enviamos un presupuesto detallado en 24h con todas las opciones disponibles, tarifas incluidas y condiciones de financiación.' },
    it: { title: 'Contatto & Preventivo', desc: 'Contattateci via WhatsApp, email o telefono. Vi inviamo un preventivo dettagliato entro 24h con tutte le opzioni disponibili, spese incluse e condizioni di finanziamento.' },
    pt: { title: 'Contacto & Orçamento', desc: 'Entre em contacto via WhatsApp, email ou telefone. Enviamos-lhe um orçamento detalhado em 24h com todas as opções disponíveis, taxas incluídas e condições de financiamento.' },
  },
  {
    icon: '📋',
    step: '03',
    fr: { title: 'Contrat & Financement', desc: 'Signature du bon de commande sécurisé. Si besoin, montage de votre dossier de financement avec nos partenaires bancaires. Réponse de principe sous 24h, taux compétitifs garantis.' },
    en: { title: 'Contract & Financing', desc: 'Signing of the secure purchase order. If needed, we set up your financing file with our banking partners. Approval in principle within 24h, competitive rates guaranteed.' },
    de: { title: 'Vertrag & Finanzierung', desc: 'Unterzeichnung des sicheren Kaufvertrags. Bei Bedarf erstellen wir Ihre Finanzierungsakte mit unseren Bankpartnern. Grundsatzbeschluss innerhalb 24h, wettbewerbsfähige Zinsen garantiert.' },
    es: { title: 'Contrato & Financiación', desc: 'Firma del pedido seguro. Si es necesario, gestionamos su expediente de financiación con nuestros socios bancarios. Respuesta de principio en 24h, tasas competitivas garantizadas.' },
    it: { title: 'Contratto & Finanziamento', desc: 'Firma dell\'ordine d\'acquisto sicuro. Se necessario, prepariamo il vostro fascicolo di finanziamento con i nostri partner bancari. Risposta di principio entro 24h, tassi competitivi garantiti.' },
    pt: { title: 'Contrato & Financiamento', desc: 'Assinatura da ordem de compra segura. Se necessário, montamos o seu dossiê de financiamento com os nossos parceiros bancários. Resposta de princípio em 24h, taxas competitivas garantidas.' },
  },
  {
    icon: '💳',
    step: '04',
    fr: { title: 'Paiement sécurisé', desc: 'Virement bancaire sécurisé ou paiement par étapes selon accord. Reçu officiel émis immédiatement. Transparence totale : aucun frais caché, tout est clairement indiqué dans le contrat.' },
    en: { title: 'Secure payment', desc: 'Secure bank transfer or staged payment by agreement. Official receipt issued immediately. Full transparency: no hidden fees, everything clearly stated in the contract.' },
    de: { title: 'Sichere Zahlung', desc: 'Sichere Banküberweisung oder Ratenzahlung nach Vereinbarung. Offizielle Quittung sofort ausgestellt. Volle Transparenz: keine versteckten Gebühren, alles klar im Vertrag angegeben.' },
    es: { title: 'Pago seguro', desc: 'Transferencia bancaria segura o pago por etapas según acuerdo. Recibo oficial emitido inmediatamente. Transparencia total: sin cargos ocultos, todo claramente indicado en el contrato.' },
    it: { title: 'Pagamento sicuro', desc: 'Bonifico bancario sicuro o pagamento a rate secondo accordo. Ricevuta ufficiale emessa immediatamente. Trasparenza totale: nessuna commissione nascosta, tutto chiaramente indicato nel contratto.' },
    pt: { title: 'Pagamento seguro', desc: 'Transferência bancária segura ou pagamento faseado por acordo. Recibo oficial emitido imediatamente. Transparência total: sem taxas ocultas, tudo claramente indicado no contrato.' },
  },
  {
    icon: '🔧',
    step: '05',
    fr: { title: 'Préparation du véhicule', desc: 'Votre véhicule est soigneusement préparé : nettoyage professionnel intérieur/extérieur, vérification technique finale, plein de carburant, documentation complète prête à remettre.' },
    en: { title: 'Vehicle preparation', desc: 'Your vehicle is carefully prepared: professional interior/exterior cleaning, final technical check, full fuel tank, complete documentation ready to hand over.' },
    de: { title: 'Fahrzeugvorbereitung', desc: 'Ihr Fahrzeug wird sorgfältig vorbereitet: professionelle Innen-/Außenreinigung, abschließende technische Prüfung, volles Tankfüllung, vollständige Unterlagen bereit zur Übergabe.' },
    es: { title: 'Preparación del vehículo', desc: 'Su vehículo se prepara cuidadosamente: limpieza profesional interior/exterior, revisión técnica final, depósito lleno, documentación completa lista para entregar.' },
    it: { title: 'Preparazione del veicolo', desc: 'Il vostro veicolo viene preparato con cura: pulizia professionale interna/esterna, controllo tecnico finale, serbatoio pieno, documentazione completa pronta per la consegna.' },
    pt: { title: 'Preparação do veículo', desc: 'O seu veículo é cuidadosamente preparado: limpeza profissional interior/exterior, verificação técnica final, depósito cheio, documentação completa pronta para entrega.' },
  },
  {
    icon: '🚚',
    step: '06',
    fr: { title: 'Livraison à domicile', desc: 'Transport sécurisé jusqu\'à votre porte partout en Allemagne et Europe. Suivi en temps réel via numéro de commande. Livraison soignée, documents remis en main propre. Votre aventure commence !' },
    en: { title: 'Home delivery', desc: 'Secure transport to your door anywhere in Germany and Europe. Real-time tracking via order number. Careful delivery, documents handed over in person. Your adventure begins!' },
    de: { title: 'Lieferung nach Hause', desc: 'Sicherer Transport bis zu Ihrer Haustür überall in Deutschland und Europa. Echtzeit-Tracking über Bestellnummer. Sorgfältige Lieferung, Unterlagen persönlich übergeben. Ihr Abenteuer beginnt!' },
    es: { title: 'Entrega a domicilio', desc: 'Transporte seguro hasta su puerta en toda Alemania y Europa. Seguimiento en tiempo real mediante número de pedido. Entrega cuidadosa, documentos entregados en persona. ¡Su aventura comienza!' },
    it: { title: 'Consegna a domicilio', desc: 'Trasporto sicuro fino alla vostra porta ovunque in Germania e in Europa. Tracciamento in tempo reale tramite numero d\'ordine. Consegna accurata, documenti consegnati di persona. La vostra avventura inizia!' },
    pt: { title: 'Entrega ao domicílio', desc: 'Transporte seguro até à sua porta em toda a Alemanha e Europa. Rastreamento em tempo real através do número de pedido. Entrega cuidadosa, documentos entregues pessoalmente. A sua aventura começa!' },
  },
];

// ── FAQ DATA ────────────────────────────────────────────────────────────────
const getFAQ = (l) => [
  {
    fr: { q: 'Vos véhicules sont-ils garantis ?', a: 'Oui, absolument. Chaque véhicule vendu est couvert par notre garantie German Auto Cars d\'au moins 12 mois ou 10 000 km, incluant la protection moteur et boîte de vitesse. Des extensions jusqu\'à 36 mois sont disponibles à la commande.' },
    en: { q: 'Are your vehicles guaranteed?', a: 'Yes, absolutely. Every vehicle sold comes with our German Auto Cars warranty of at least 12 months or 10,000 km, covering engine and transmission. Extensions up to 36 months are available at the time of order.' },
    de: { q: 'Sind Ihre Fahrzeuge garantiert?', a: 'Ja, absolut. Jedes verkaufte Fahrzeug ist durch unsere German Auto Cars Garantie von mindestens 12 Monaten oder 10.000 km abgedeckt, einschließlich Motor- und Getriebeschutz. Verlängerungen bis zu 36 Monaten sind bei der Bestellung verfügbar.' },
    es: { q: '¿Sus vehículos tienen garantía?', a: 'Sí, absolutamente. Cada vehículo vendido está cubierto por nuestra garantía German Auto Cars de al menos 12 meses o 10.000 km, incluida la protección del motor y la caja de cambios. Se pueden contratar extensiones de hasta 36 meses al hacer el pedido.' },
    it: { q: 'I vostri veicoli sono garantiti?', a: 'Sì, assolutamente. Ogni veicolo venduto è coperto dalla nostra garanzia German Auto Cars di almeno 12 mesi o 10.000 km, che include la protezione del motore e del cambio. Sono disponibili estensioni fino a 36 mesi al momento dell\'ordine.' },
    pt: { q: 'Os seus veículos têm garantia?', a: 'Sim, absolutamente. Cada veículo vendido é coberto pela nossa garantia German Auto Cars de pelo menos 12 meses ou 10.000 km, incluindo proteção de motor e caixa de velocidades. Extensões até 36 meses estão disponíveis no momento da encomenda.' },
  },
  {
    fr: { q: 'Proposez-vous du financement ?', a: 'Oui. Nous travaillons avec plusieurs partenaires bancaires pour vous proposer des crédits auto sur mesure, à des taux compétitifs. Vous renseignez votre dossier, nous montons le financement et vous obtenez une réponse de principe sous 24h ouvrées.' },
    en: { q: 'Do you offer financing?', a: 'Yes. We work with several banking partners to offer tailored car loans at competitive rates. You fill in your file, we arrange the financing and you get a decision in principle within 24 business hours.' },
    de: { q: 'Bieten Sie Finanzierung an?', a: 'Ja. Wir arbeiten mit mehreren Bankpartnern zusammen, um Ihnen maßgeschneiderte Autokredite zu wettbewerbsfähigen Zinsen anzubieten. Sie reichen Ihre Unterlagen ein, wir arrangieren die Finanzierung und Sie erhalten innerhalb von 24 Wertstunden eine Grundsatzentscheidung.' },
    es: { q: '¿Ofrecen financiación?', a: 'Sí. Trabajamos con varios socios bancarios para ofrecerle créditos de coche a medida, a tasas competitivas. Usted rellena su expediente, nosotros gestionamos la financiación y recibe una respuesta de principio en 24 horas hábiles.' },
    it: { q: 'Offrite finanziamenti?', a: 'Sì. Collaboriamo con diversi partner bancari per offrirvi prestiti auto personalizzati a tassi competitivi. Compilate il vostro fascicolo, noi organizziamo il finanziamento e ricevete una risposta di principio entro 24 ore lavorative.' },
    pt: { q: 'Oferecem financiamento?', a: 'Sim. Trabalhamos com vários parceiros bancários para lhe oferecer créditos automóvel personalizados a taxas competitivas. Preenche o seu dossiê, nós tratamos do financiamento e recebe uma resposta de princípio em 24 horas úteis.' },
  },
  {
    fr: { q: 'Comment fonctionne la livraison ?', a: 'Nous livrons partout en Allemagne et dans toute l\'Europe. Le transport est sécurisé sur camion plateau. Vous recevez un numéro de suivi pour suivre votre véhicule en temps réel. La livraison se fait à domicile, véhicule propre, plein d\'essence et documents complets.' },
    en: { q: 'How does delivery work?', a: 'We deliver throughout Germany and all of Europe. Transport is secured on a flatbed truck. You receive a tracking number to follow your vehicle in real time. Delivery is to your home, vehicle clean, full tank and complete documents.' },
    de: { q: 'Wie funktioniert die Lieferung?', a: 'Wir liefern in ganz Deutschland und ganz Europa. Der Transport erfolgt gesichert auf einem Tieflader. Sie erhalten eine Tracking-Nummer, um Ihr Fahrzeug in Echtzeit zu verfolgen. Die Lieferung erfolgt nach Hause, Fahrzeug sauber, volles Tank und vollständige Unterlagen.' },
    es: { q: '¿Cómo funciona la entrega?', a: 'Entregamos en toda Alemania y en toda Europa. El transporte se realiza de forma segura en camión plataforma. Recibe un número de seguimiento para rastrear su vehículo en tiempo real. La entrega se realiza a domicilio, vehículo limpio, depósito lleno y documentación completa.' },
    it: { q: 'Come funziona la consegna?', a: 'Consegniamo in tutta la Germania e in tutta l\'Europa. Il trasporto avviene in modo sicuro su camion a pianale. Ricevete un numero di tracciamento per seguire il vostro veicolo in tempo reale. La consegna avviene a domicilio, veicolo pulito, serbatoio pieno e documenti completi.' },
    pt: { q: 'Como funciona a entrega?', a: 'Entregamos em toda a Alemanha e em toda a Europa. O transporte é feito de forma segura em camião de plataforma. Recebe um número de rastreamento para seguir o seu veículo em tempo real. A entrega é feita ao domicílio, veículo limpo, depósito cheio e documentos completos.' },
  },
  {
    fr: { q: 'Puis-je reprendre mon ancien véhicule ?', a: 'Oui, nous proposons un service de reprise. Envoyez-nous les informations de votre véhicule actuel (marque, modèle, année, kilométrage, état général) et nous vous faisons une estimation gratuite sous 24h. La valeur de reprise est déduite du prix de votre nouveau véhicule.' },
    en: { q: 'Can I trade in my old vehicle?', a: 'Yes, we offer a trade-in service. Send us your current vehicle\'s details (brand, model, year, mileage, general condition) and we\'ll give you a free estimate within 24h. The trade-in value is deducted from the price of your new vehicle.' },
    de: { q: 'Kann ich mein altes Fahrzeug in Zahlung geben?', a: 'Ja, wir bieten einen Ankaufsservice an. Schicken Sie uns die Daten Ihres aktuellen Fahrzeugs (Marke, Modell, Jahr, Kilometerstand, Allgemeinzustand) und wir geben Ihnen innerhalb 24h eine kostenlose Schätzung. Der Ankaufswert wird vom Preis Ihres neuen Fahrzeugs abgezogen.' },
    es: { q: '¿Puedo canjear mi vehículo antiguo?', a: 'Sí, ofrecemos un servicio de canje. Envíenos los datos de su vehículo actual (marca, modelo, año, kilometraje, estado general) y le haremos una estimación gratuita en 24h. El valor de canje se deduce del precio de su nuevo vehículo.' },
    it: { q: 'Posso permutare il mio vecchio veicolo?', a: 'Sì, offriamo un servizio di permuta. Inviateci i dati del vostro veicolo attuale (marca, modello, anno, chilometraggio, stato generale) e vi faremo una stima gratuita entro 24h. Il valore della permuta viene detratto dal prezzo del vostro nuovo veicolo.' },
    pt: { q: 'Posso trocar o meu antigo veículo?', a: 'Sim, oferecemos um serviço de troca. Envie-nos os dados do seu veículo atual (marca, modelo, ano, quilometragem, estado geral) e daremos uma estimativa gratuita em 24h. O valor da troca é deduzido do preço do seu novo veículo.' },
  },
  {
    fr: { q: 'Les véhicules ont-ils été accidentés ?', a: 'Tous nos véhicules font l\'objet d\'une inspection de 150 points et nous vérifions systématiquement leur historique complet. Nous vendons uniquement des véhicules sans accident grave ou avec une déclaration transparente de l\'historique. Le rapport Carfax ou équivalent est disponible sur demande.' },
    en: { q: 'Have the vehicles been in accidents?', a: 'All our vehicles undergo a 150-point inspection and we systematically verify their full history. We only sell vehicles with no serious accident or with a transparent history disclosure. The Carfax report or equivalent is available on request.' },
    de: { q: 'Waren die Fahrzeuge in Unfällen verwickelt?', a: 'Alle unsere Fahrzeuge werden einer 150-Punkte-Inspektion unterzogen und wir überprüfen systematisch ihre vollständige Geschichte. Wir verkaufen nur Fahrzeuge ohne schwerwiegenden Unfall oder mit transparenter Offenlegung der Geschichte. Der Carfax-Bericht oder ähnliches ist auf Anfrage erhältlich.' },
    es: { q: '¿Los vehículos han tenido accidentes?', a: 'Todos nuestros vehículos pasan por una inspección de 150 puntos y verificamos sistemáticamente su historial completo. Solo vendemos vehículos sin accidente grave o con una declaración transparente del historial. El informe Carfax o equivalente está disponible bajo petición.' },
    it: { q: 'I veicoli sono stati coinvolti in incidenti?', a: 'Tutti i nostri veicoli sono sottoposti a un\'ispezione di 150 punti e verifichiamo sistematicamente la loro storia completa. Vendiamo solo veicoli senza incidenti gravi o con una divulgazione trasparente della storia. Il rapporto Carfax o equivalente è disponibile su richiesta.' },
    pt: { q: 'Os veículos estiveram envolvidos em acidentes?', a: 'Todos os nossos veículos são submetidos a uma inspeção de 150 pontos e verificamos sistematicamente o seu historial completo. Vendemos apenas veículos sem acidente grave ou com uma divulgação transparente do historial. O relatório Carfax ou equivalente está disponível a pedido.' },
  },
  {
    fr: { q: 'Comment puis-je suivre ma commande ?', a: 'Dès la confirmation de votre commande, vous recevez un numéro de suivi unique. Rendez-vous dans la section "Suivre ma commande" de notre site, saisissez votre numéro et consultez l\'état de votre commande en temps réel : préparation, transport et livraison.' },
    en: { q: 'How can I track my order?', a: 'As soon as your order is confirmed, you receive a unique tracking number. Go to the "Track my order" section of our site, enter your number and check the status of your order in real time: preparation, transport and delivery.' },
    de: { q: 'Wie kann ich meine Bestellung verfolgen?', a: 'Sobald Ihre Bestellung bestätigt ist, erhalten Sie eine eindeutige Tracking-Nummer. Gehen Sie zum Abschnitt "Bestellung verfolgen" auf unserer Website, geben Sie Ihre Nummer ein und prüfen Sie den Status Ihrer Bestellung in Echtzeit: Vorbereitung, Transport und Lieferung.' },
    es: { q: '¿Cómo puedo rastrear mi pedido?', a: 'En cuanto se confirma su pedido, recibe un número de seguimiento único. Vaya a la sección "Rastrear mi pedido" de nuestro sitio, introduzca su número y consulte el estado de su pedido en tiempo real: preparación, transporte y entrega.' },
    it: { q: 'Come posso tracciare il mio ordine?', a: 'Non appena il vostro ordine viene confermato, ricevete un numero di tracciamento unico. Andate alla sezione "Traccia il mio ordine" del nostro sito, inserite il vostro numero e verificate lo stato del vostro ordine in tempo reale: preparazione, trasporto e consegna.' },
    pt: { q: 'Como posso rastrear o meu pedido?', a: 'Assim que o seu pedido é confirmado, recebe um número de rastreamento único. Vá à secção "Rastrear o meu pedido" do nosso site, introduza o seu número e consulte o estado do seu pedido em tempo real: preparação, transporte e entrega.' },
  },
];

function Stars({ n=5 }) {
  return <span style={{ display:'inline-flex', gap:2 }}>{Array.from({length:5}).map((_,i)=><span key={i} style={{ color:i<n?'#FFAA00':'var(--border-2)', fontSize:15 }}>★</span>)}</span>;
}

function CookieBanner({ lang }) {
  const [visible, setVisible] = useState(!localStorage.getItem('automatik_cookies'));
  if (!visible) return null;
  const accept  = () => { localStorage.setItem('automatik_cookies','1'); setVisible(false); };
  const decline = () => { localStorage.setItem('automatik_cookies','0'); setVisible(false); };
  const msg = { fr:'Nous utilisons des cookies pour améliorer votre expérience.', en:'We use cookies to improve your experience.', de:'Wir verwenden Cookies, um Ihre Erfahrung zu verbessern.', es:'Usamos cookies para mejorar su experiencia.', it:'Usiamo i cookie per migliorare la tua esperienza.', pt:'Usamos cookies para melhorar sua experiência.' };
  const accept_l = { fr:'Accepter', en:'Accept', de:'Akzeptieren', es:'Aceptar', it:'Accetta', pt:'Aceitar' };
  const decline_l = { fr:'Refuser', en:'Decline', de:'Ablehnen', es:'Rechazar', it:'Rifiuta', pt:'Recusar' };
  return (
    <div className="cookie-banner" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, flexWrap:'wrap' }}>
      <p style={{ fontSize:14, color:'var(--text-2)', flex:1 }}>🍪 {msg[lang] || msg.fr}</p>
      <div style={{ display:'flex', gap:10 }}>
        <button onClick={decline} style={{ padding:'9px 18px', background:'var(--bg-card2)', border:'1px solid var(--border)', borderRadius:6, color:'var(--text-3)', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif" }}>{decline_l[lang]||'Refuser'}</button>
        <button onClick={accept} className="btn-gold" style={{ fontSize:13, padding:'9px 20px' }}>{accept_l[lang]||'Accepter'}</button>
      </div>
    </div>
  );
}

// ── PURCHASE STEPS SECTION ───────────────────────────────────────────────────
function PurchaseStepsSection({ l, isMobile }) {
  const steps = getPurchaseSteps(l);
  const getLang = (s) => s[l] || s.fr;

  const sectionTitle = {
    fr: "De la sélection\nà la livraison",
    en: "From selection\nto delivery",
    de: "Von der Auswahl\nbis zur Lieferung",
    es: "De la selección\na la entrega",
    it: "Dalla selezione\nalla consegna",
    pt: "Da seleção\nà entrega",
  };
  const sectionEyebrow = {
    fr: 'Comment ça marche', en: 'How it works', de: 'So funktioniert es',
    es: 'Cómo funciona', it: 'Come funziona', pt: 'Como funciona',
  };
  const sectionSub = {
    fr: 'Un processus simple et transparent, du choix du véhicule jusqu\'à sa livraison chez vous.',
    en: 'A simple and transparent process, from choosing the vehicle to its delivery at your door.',
    de: 'Ein einfacher und transparenter Prozess, von der Fahrzeugwahl bis zur Lieferung nach Hause.',
    es: 'Un proceso sencillo y transparente, desde la elección del vehículo hasta su entrega en su puerta.',
    it: 'Un processo semplice e trasparente, dalla scelta del veicolo alla sua consegna a domicilio.',
    pt: 'Um processo simples e transparente, desde a escolha do veículo até à sua entrega na sua porta.',
  };

  return (
    <section style={{ background:'var(--bg)', borderTop:'1px solid var(--border)' }} className="section-pad">
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:56 }}>
          <div className="section-eyebrow" style={{ justifyContent:'center' }}>{sectionEyebrow[l] || sectionEyebrow.fr}</div>
          <h2 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:'clamp(28px,4vw,52px)', color:'var(--text)', letterSpacing:'-0.02em', whiteSpace:'pre-line' }}>
            {sectionTitle[l] || sectionTitle.fr}
          </h2>
          <p style={{ fontSize:16, color:'var(--text-3)', marginTop:12, maxWidth:560, margin:'12px auto 0' }}>
            {sectionSub[l] || sectionSub.fr}
          </p>
        </div>

        {/* Desktop: alternating timeline */}
        {!isMobile ? (
          <div style={{ position:'relative' }}>
            {/* Centre line */}
            <div style={{ position:'absolute', left:'50%', top:0, bottom:0, width:2, background:'linear-gradient(to bottom, rgba(19,40,83,0.08), rgba(19,40,83,0.4), rgba(19,40,83,0.08))', transform:'translateX(-50%)', pointerEvents:'none' }} />

            {steps.map((s, i) => {
              const isLeft = i % 2 === 0;
              const data = getLang(s);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity:0, x: isLeft ? -40 : 40 }}
                  whileInView={{ opacity:1, x:0 }}
                  viewport={{ once:true }}
                  transition={{ duration:0.6, delay:i * 0.1 }}
                  style={{
                    display:'grid',
                    gridTemplateColumns:'1fr 80px 1fr',
                    gap:0,
                    alignItems:'center',
                    marginBottom: i < steps.length - 1 ? 40 : 0,
                  }}
                >
                  {/* Left content */}
                  <div style={{ gridColumn:1, display:'flex', justifyContent:'flex-end', paddingRight:40 }}>
                    {isLeft ? (
                      <StepCard data={data} step={s.step} icon={s.icon} align="right" />
                    ) : (
                      <div />
                    )}
                  </div>

                  {/* Centre dot */}
                  <div style={{ gridColumn:2, display:'flex', justifyContent:'center', alignItems:'center', position:'relative', zIndex:2 }}>
                    <div style={{
                      width:56, height:56, borderRadius:'50%',
                      background:'linear-gradient(135deg, #0E1E3D, #132853)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:22, boxShadow:'0 0 0 6px var(--bg), 0 0 0 8px rgba(19,40,83,0.2)',
                    }}>
                      {s.icon}
                    </div>
                  </div>

                  {/* Right content */}
                  <div style={{ gridColumn:3, paddingLeft:40 }}>
                    {!isLeft ? (
                      <StepCard data={data} step={s.step} icon={s.icon} align="left" />
                    ) : (
                      <div />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* Mobile: vertical list */
          <div style={{ position:'relative', paddingLeft:52 }}>
            <div style={{ position:'absolute', left:20, top:8, bottom:8, width:2, background:'linear-gradient(to bottom, rgba(19,40,83,0.08), rgba(19,40,83,0.4), rgba(19,40,83,0.08))' }} />
            {steps.map((s, i) => {
              const data = getLang(s);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity:0, x:-20 }}
                  whileInView={{ opacity:1, x:0 }}
                  viewport={{ once:true }}
                  transition={{ duration:0.5, delay:i * 0.08 }}
                  style={{ position:'relative', marginBottom: i < steps.length - 1 ? 28 : 0 }}
                >
                  {/* Dot */}
                  <div style={{
                    position:'absolute', left:-42, top:16,
                    width:36, height:36, borderRadius:'50%',
                    background:'linear-gradient(135deg, #0E1E3D, #132853)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:16, boxShadow:'0 0 0 4px var(--bg), 0 0 0 6px rgba(19,40,83,0.15)',
                    zIndex:2,
                  }}>
                    {s.icon}
                  </div>
                  <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'18px 20px', boxShadow:'var(--shadow-sm)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                      <span style={{ fontSize:10, fontWeight:800, letterSpacing:'0.25em', color:'var(--red)', background:'var(--red-bg)', border:'1px solid var(--red-border)', padding:'2px 8px', borderRadius:3 }}>
                        {s.step}
                      </span>
                      <h3 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize:15, color:'var(--text)' }}>{data.title}</h3>
                    </div>
                    <p style={{ fontSize:13, color:'var(--text-3)', lineHeight:1.65 }}>{data.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function StepCard({ data, step, align }) {
  return (
    <div style={{
      background:'var(--bg-card)',
      border:'1px solid var(--border)',
      borderRadius:14,
      padding:'24px 28px',
      boxShadow:'var(--shadow-sm)',
      maxWidth:420,
      textAlign: align,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12, justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}>
        <span style={{
          fontSize:10, fontWeight:800, letterSpacing:'0.3em', textTransform:'uppercase',
          color:'var(--red)', background:'var(--red-bg)', border:'1px solid var(--red-border)',
          padding:'3px 10px', borderRadius:3,
          order: align === 'right' ? 2 : 1,
        }}>
          STEP {step}
        </span>
      </div>
      <h3 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize:18, color:'var(--text)', marginBottom:10 }}>
        {data.title}
      </h3>
      <p style={{ fontSize:14, color:'var(--text-3)', lineHeight:1.7 }}>{data.desc}</p>
    </div>
  );
}

// ── FAQ ACCORDION SECTION ────────────────────────────────────────────────────
function FAQSection({ l, isMobile }) {
  const [openIndex, setOpenIndex] = useState(null);
  const faqs = getFAQ(l);
  const getLang = (item) => item[l] || item.fr;

  const sectionTitle = {
    fr: "Pourquoi nous choisir ?\nVos questions, nos réponses",
    en: "Why choose us?\nYour questions, our answers",
    de: "Warum uns wählen?\nIhre Fragen, unsere Antworten",
    es: "¿Por qué elegirnos?\nSus preguntas, nuestras respuestas",
    it: "Perché sceglierci?\nLe vostre domande, le nostre risposte",
    pt: "Por que nos escolher?\nAs suas perguntas, as nossas respostas",
  };
  const sectionEyebrow = {
    fr: 'FAQ', en: 'FAQ', de: 'FAQ', es: 'FAQ', it: 'FAQ', pt: 'FAQ',
  };
  const sectionSub = {
    fr: 'Tout ce que vous devez savoir avant de passer commande. Une question ? Notre équipe est disponible 24/7.',
    en: 'Everything you need to know before placing an order. A question? Our team is available 24/7.',
    de: 'Alles, was Sie vor der Bestellung wissen müssen. Eine Frage? Unser Team ist 24/7 verfügbar.',
    es: 'Todo lo que necesita saber antes de realizar un pedido. ¿Una pregunta? Nuestro equipo está disponible 24/7.',
    it: 'Tutto quello che dovete sapere prima di effettuare un ordine. Una domanda? Il nostro team è disponibile 24/7.',
    pt: 'Tudo o que precisa de saber antes de fazer uma encomenda. Uma pergunta? A nossa equipa está disponível 24/7.',
  };

  return (
    <section style={{ background:'var(--bg-card2)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }} className="section-pad">
      <div style={{ maxWidth:900, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <div className="section-eyebrow" style={{ justifyContent:'center' }}>{sectionEyebrow[l]}</div>
          <h2 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize:'clamp(26px,4vw,50px)', color:'var(--text)', letterSpacing:'-0.02em', whiteSpace:'pre-line', lineHeight:1.1 }}>
            {sectionTitle[l] || sectionTitle.fr}
          </h2>
          <p style={{ fontSize:15, color:'var(--text-3)', marginTop:14, maxWidth:580, margin:'14px auto 0' }}>
            {sectionSub[l] || sectionSub.fr}
          </p>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {faqs.map((item, i) => {
            const data = getLang(item);
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity:0, y:16 }}
                whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }}
                transition={{ duration:0.4, delay:i * 0.06 }}
                style={{
                  background:'var(--bg-card)',
                  border:`1px solid ${isOpen ? 'rgba(19,40,83,0.35)' : 'var(--border)'}`,
                  borderRadius:14,
                  overflow:'hidden',
                  boxShadow: isOpen ? '0 4px 24px rgba(19,40,83,0.08)' : 'var(--shadow-sm)',
                  transition:'border-color 0.3s, box-shadow 0.3s',
                }}
              >
                {/* Question row */}
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  style={{
                    width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between',
                    gap:16, padding: isMobile ? '18px 20px' : '22px 28px',
                    background:'none', border:'none', cursor:'pointer', textAlign:'left',
                  }}
                >
                  <div style={{ display:'flex', alignItems:'center', gap:14, flex:1 }}>
                    <div style={{
                      width:32, height:32, borderRadius:8, flexShrink:0,
                      background: isOpen ? 'linear-gradient(135deg, #0E1E3D, #132853)' : 'var(--red-bg)',
                      border:`1px solid ${isOpen ? 'transparent' : 'var(--red-border)'}`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      transition:'all 0.3s',
                    }}>
                      <span style={{ fontSize:14, fontWeight:900, color: isOpen ? '#fff' : 'var(--red)', fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif" }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <span style={{
                      fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:700,
                      fontSize: isMobile ? 14 : 16,
                      color: isOpen ? 'var(--text)' : 'var(--text)',
                      lineHeight:1.4,
                    }}>
                      {data.q}
                    </span>
                  </div>
                  <div style={{
                    width:28, height:28, borderRadius:'50%', flexShrink:0,
                    background: isOpen ? 'rgba(19,40,83,0.12)' : 'var(--bg-card2)',
                    border:'1px solid var(--border)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    transition:'all 0.3s',
                  }}>
                    <span style={{
                      fontSize:16, color: isOpen ? 'var(--red)' : 'var(--text-3)',
                      transform: isOpen ? 'rotate(45deg)' : 'none',
                      display:'inline-block', transition:'transform 0.3s', lineHeight:1,
                    }}>+</span>
                  </div>
                </button>

                {/* Answer */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="answer"
                      initial={{ height:0, opacity:0 }}
                      animate={{ height:'auto', opacity:1 }}
                      exit={{ height:0, opacity:0 }}
                      transition={{ duration:0.35, ease:[0.4, 0, 0.2, 1] }}
                      style={{ overflow:'hidden' }}
                    >
                      <div style={{
                        padding: isMobile ? '0 20px 20px 66px' : '0 28px 24px 74px',
                        borderTop:'1px solid var(--border)',
                        paddingTop: 16,
                      }}>
                        <p style={{ fontSize: isMobile ? 13 : 14, color:'var(--text-2)', lineHeight:1.75 }}>
                          {data.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* CTA sous la FAQ */}
        <motion.div
          initial={{ opacity:0, y:16 }}
          whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }}
          transition={{ duration:0.5, delay:0.3 }}
          style={{ marginTop:40, textAlign:'center', padding: isMobile ? '24px 20px' : '32px 40px', background:'linear-gradient(135deg,rgba(19,40,83,0.06),rgba(19,40,83,0.02))', border:'1px solid rgba(19,40,83,0.15)', borderRadius:16 }}
        >
          <p style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:700, fontSize: isMobile ? 15 : 17, color:'var(--text)', marginBottom:8 }}>
            {l==='fr'?'Une autre question ?':l==='en'?'Another question?':l==='de'?'Noch eine Frage?':l==='es'?'¿Otra pregunta?':l==='it'?'Un\'altra domanda?':'Outra pergunta?'}
          </p>
          <p style={{ fontSize:14, color:'var(--text-3)', marginBottom:20 }}>
            {l==='fr'?'Notre équipe répond sous 24h par WhatsApp ou email.':l==='en'?'Our team replies within 24h via WhatsApp or email.':l==='de'?'Unser Team antwortet innerhalb 24h per WhatsApp oder E-Mail.':l==='es'?'Nuestro equipo responde en 24h por WhatsApp o email.':l==='it'?'Il nostro team risponde entro 24h via WhatsApp o email.':'A nossa equipa responde em 24h por WhatsApp ou email.'}
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <a href="https://wa.me/491745232945" target="_blank" rel="noopener noreferrer"
              style={{ background:'#25D366', color:'#fff', textDecoration:'none', fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontSize:13, fontWeight:700, padding:'11px 22px', borderRadius:8, display:'inline-flex', alignItems:'center', gap:8 }}>
              💬 WhatsApp
            </a>
            <a href="mailto:kontakt@automatikgebrauchtwagen.com" className="btn-ghost" style={{ fontSize:13 }}>
              ✉ Email
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── VIDEO PROMO SECTION ────────────────────────────────────────────────────
function VideoSection({ isMobile }) {
  const { lang } = useLangStore();
  const l = lang || 'fr';

  return (
    <section style={{
      position:'relative', overflow:'hidden',
      height: isMobile ? '62vh' : '88vh', minHeight: isMobile ? 420 : 520,
      display:'flex', alignItems:'center', justifyContent:'center',
      background:'#0a0a0a',
    }}>
      <video
        autoPlay muted loop playsInline preload="auto"
        src="/promo.mp4"
        style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', display:'block' }}
      />
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.6) 100%)' }} />

      <motion.div
        initial={{ opacity:0, y:30 }}
        whileInView={{ opacity:1, y:0 }}
        viewport={{ once:true }}
        transition={{ duration:0.9 }}
        style={{ position:'relative', zIndex:2, textAlign:'center', padding:'0 6%', maxWidth:900 }}
      >
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:14, marginBottom:28 }}>
          <span style={{ width: isMobile ? 30 : 48, height:1, background:'rgba(255,255,255,0.4)' }} />
          <span style={{ fontSize:10, fontWeight:600, letterSpacing:'0.35em', textTransform:'uppercase', color:'rgba(255,255,255,0.7)' }}>
            {l==='fr'?'Votre spécialiste automobile':l==='en'?'Your car specialist':l==='de'?'Ihr Kfz-Spezialist':l==='es'?'Su especialista automotriz':l==='it'?'Il vostro specialista auto':l==='pt'?'O seu especialista automóvel':'متجر السيارات'}
          </span>
          <span style={{ width: isMobile ? 30 : 48, height:1, background:'rgba(255,255,255,0.4)' }} />
        </div>

        <h2 style={{
          fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900,
          fontSize: isMobile ? 'clamp(40px,12vw,64px)' : 'clamp(56px,9vw,120px)',
          color:'#fff', letterSpacing:'-0.03em', lineHeight:0.98, marginBottom:24,
          textShadow:'0 4px 40px rgba(0,0,0,0.5)',
        }}>
          AUTOMATIK{' '}
          <span style={{ background:'linear-gradient(120deg,#FFD24D,#FF9F2E)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
            GEBRAUCHTWAGEN
          </span>
        </h2>

        <p style={{ fontSize: isMobile ? 14 : 17, color:'rgba(255,255,255,0.75)', lineHeight:1.7, maxWidth:560, margin:'0 auto 36px', fontWeight:300 }}>
          {l==='fr'?'Des véhicules d\'exception, une expertise allemande depuis 1979. Découvrez notre univers.':l==='en'?'Exceptional vehicles, German expertise since 1979. Discover our world.':l==='de'?'Außergewöhnliche Fahrzeuge, deutsche Kompetenz seit 1979. Entdecken Sie unsere Welt.':l==='es'?'Vehículos excepcionales, experiencia alemana desde 1979. Descubra nuestro mundo.':l==='it'?'Veicoli eccezionali, competenza tedesca dal 1979. Scoprite il nostro mondo.':'Veículos excecionais, experiência alemã desde 1979. Descubra o nosso mundo.'}
        </p>

        <Link to="/catalog" style={{
          background:'linear-gradient(135deg,#132853,#0E1E3D)', color:'#fff', textDecoration:'none',
          fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontSize:13, fontWeight:700, padding:'15px 32px',
          borderRadius:8, display:'inline-flex', alignItems:'center', gap:8,
          boxShadow:'0 8px 30px rgba(0,0,0,0.4)',
        }}>
          {l==='fr'?'Voir nos véhicules':l==='en'?'View our vehicles':l==='de'?'Fahrzeuge ansehen':l==='es'?'Ver nuestros vehículos':l==='it'?'Guarda i nostri veicoli':l==='pt'?'Veja os nossos veículos':'عرض السيارات'} →
        </Link>
      </motion.div>
    </section>
  );
}

export default function Home() {
  const { lang } = useLangStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const { isMobile, isTablet } = useBreakpoint();
  const [featured, setFeatured]         = useState([]);
  const [promotions, setPromotions]     = useState([]);
  const [campingCars, setCampingCars]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [trackNum, setTrackNum]         = useState('');
  const [searchQuery, setSearchQuery]   = useState('');
  const [brands, setBrands]             = useState([]);
  const [sf, setSf] = useState({ brand:'', category:'', fuelType:'', transmission:'', minYear:'', maxYear:'', minPrice:'', maxPrice:'', maxMileage:'' });
  const heroRef = useRef(null);
  const navigate = useNavigate();
  const l = lang || 'fr';

  const goSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    Object.entries(sf).forEach(([k, v]) => { if (v) params.set(k, v); });
    navigate(`/catalog?${params.toString()}`);
  };

  const setF = (k, v) => setSf(s => ({ ...s, [k]: v }));

  useEffect(() => { carAPI.getBrands().then(r => setBrands(r.data.brands || [])).catch(() => {}); }, []);
  const { scrollYProgress } = useScroll({ target:heroRef, offset:['start start','end start'] });
  const heroY = useTransform(scrollYProgress, [0,1], ['0%','25%']);
  const heroO = useTransform(scrollYProgress, [0,0.7], [1,0]);

  useEffect(() => {
    setLoading(true);
    carAPI.getAll({ featured:'true', limit:12 })
      .then(r => { setFeatured(r.data.cars||[]); setLoading(false); })
      .catch(() => { setLoading(false); });
    carAPI.getAll({ promotional:'true', limit:8 })
      .then(r => setPromotions(r.data.cars||[]))
      .catch(() => {});
    carAPI.getAll({ campingCar:'true', limit:3 })
      .then(r => setCampingCars(r.data.cars||[]))
      .catch(() => {});
  }, []);

  const handleTrack = (e) => {
    e.preventDefault();
    if (trackNum.trim()) navigate(`/track/${trackNum.trim().toUpperCase()}`);
  };

  const perfCars = [...featured, ...promotions, ...campingCars]
    .filter(c => c && Number(c.power))
    .sort((a, b) => Number(b.power) - Number(a.power))
    .slice(0, 6);

  const [perfIndex, setPerfIndex] = useState(0);
  const [perfPaused, setPerfPaused] = useState(false);

  useEffect(() => {
    if (perfCars.length <= 1 || perfPaused) return;
    const id = setInterval(() => setPerfIndex((i) => (i + 1) % perfCars.length), 2000);
    return () => clearInterval(id);
  }, [perfCars.length, perfPaused]);

  const showCar = perfCars[perfIndex] || null;
  const perf = showCar ? {
    power: Number(showCar.power),
    topSpeed: Math.min(250, Math.round(155 + Number(showCar.power) * 0.34)),
    accel: Math.max(3, Math.min(14, 13.5 - Number(showCar.power) * 0.029)).toFixed(1),
  } : null;

  const getServiceTitle = (s) => s[l] || s.fr;
  const getServiceDesc  = (s) => s[`desc${l.charAt(0).toUpperCase()+l.slice(1)}`] || s.descFr;
  const getReviewText   = (r) => r[`text${l.charAt(0).toUpperCase()+l.slice(1)}`] || r.textFr;

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>

      {/* ── HERO ── */}
      <section ref={heroRef} style={{ position:'relative', height: isMobile ? '100svh' : '100vh', minHeight:580, display:'flex', alignItems:'center', overflow:'hidden' }}>
        <motion.div style={{ position:'absolute', inset:0, y:heroY }}>
          <img src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1800&q=80&auto=format"
            alt="Hero" style={{ width:'100%', height:'110%', objectFit:'cover', display:'block' }} />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.2) 100%)' }} />
        </motion.div>

        <motion.div style={{ position:'relative', zIndex:2, padding: isMobile ? '0 6%' : '0 8%', maxWidth:720, opacity:heroO }}>
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8, delay:0.1 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, marginBottom:32 }}>
              <span style={{ width:24, height:1, background:'rgba(255,255,255,0.4)' }} />
              <span style={{ fontSize:10, fontWeight:600, letterSpacing:'0.3em', textTransform:'uppercase', color:'rgba(255,255,255,0.6)' }}>
                {t('hero_badge', l)}
              </span>
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.9, delay:0.2 }}
            style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize: isMobile ? 'clamp(36px,10vw,52px)' : 'clamp(48px,5.5vw,80px)', color:'#fff', letterSpacing:'-0.03em', lineHeight:1.0, marginBottom:24 }}>
            Automatik<br/><span style={{ color:'#132853' }}>Gebrauchtwagen</span>
          </motion.h1>

          <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8, delay:0.35 }}
            style={{ fontSize: isMobile ? 15 : 17, color:'rgba(255,255,255,0.55)', lineHeight:1.7, marginBottom:40, maxWidth:480, fontWeight:300 }}>
            {t('hero_subtitle', l)}
          </motion.p>

          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.5 }}
            style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
            <Link to="/catalog" className="btn-primary" style={{ fontSize: isMobile ? 12 : 13 }}>
              {t('hero_cta1', l)} →
            </Link>
            <Link to="/simulation" className="btn-ghost" style={{ fontSize: isMobile ? 12 : 13, borderColor:'rgba(255,255,255,0.2)', color:'rgba(255,255,255,0.75)' }}>
              {t('hero_cta2', l)}
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.2, duration:0.6 }}
          style={{ position:'absolute', bottom:32, left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:8, zIndex:2 }}>
          <span style={{ fontSize:9, fontWeight:600, letterSpacing:'0.2em', color:'rgba(255,255,255,0.4)', textTransform:'uppercase' }}>
            {l==='fr'?'Défiler':l==='en'?'Scroll':l==='de'?'Scrollen':l==='es'?'Desplazar':l==='it'?'Scorri':'Deslizar'}
          </span>
          <motion.div animate={{ y:[0,6,0] }} transition={{ repeat:Infinity, duration:1.5, ease:'easeInOut' }}
            style={{ width:1, height:20, background:'linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)' }} />
        </motion.div>
      </section>

      {/* ── MOTEUR DE RECHERCHE ── */}
      <section style={{ background:'var(--bg)', position:'relative', zIndex:10, marginTop:-48 }}>
        <div style={{ width:'100%', margin:'0 auto', padding: isMobile ? '0 4%' : 0 }}>
          <motion.div
            initial={{ opacity:0, y:20 }}
            animate={{ opacity:1, y:0 }}
            transition={{ duration:0.6, delay:0.6 }}
            style={{
              background:'var(--bg-card)',
              border:'1px solid var(--border)',
              borderRadius: isMobile ? 20 : 0,
              borderLeft: isMobile ? '1px solid var(--border)' : 'none',
              borderRight: isMobile ? '1px solid var(--border)' : 'none',
              overflow:'hidden',
              boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.3)' : '0 16px 48px rgba(19,40,83,0.12)',
            }}
          >
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', gap:12, padding: isMobile ? '18px 20px' : '22px 6%', borderBottom:'1px solid var(--border)' }}>
              <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#132853,#0E1E3D)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🔍</div>
              <div style={{ flex:1 }}>
                <h3 style={{ fontWeight:800, fontSize:17, color:'var(--text)', margin:0, letterSpacing:'-0.01em' }}>
                  {l==='fr'?'Rechercher un véhicule':l==='en'?'Find your vehicle':l==='de'?'Fahrzeug finden':l==='es'?'Buscar un vehículo':l==='it'?'Cerca un veicolo':l==='pt'?'Encontrar um veículo':'ابحث عن مركبة'}
                </h3>
                <p style={{ margin:0, fontSize:12, color:'var(--text-3)' }}>
                  {l==='fr'?'Filtrez par marque, budget, année et plus':l==='en'?'Filter by brand, budget, year and more':l==='de'?'Nach Marke, Budget, Baujahr und mehr filtern':'Filtra por marca, presupuesto, año y más'}
                </p>
              </div>
              <button
                onClick={() => { setSearchQuery(''); setSf({ brand:'', category:'', fuelType:'', transmission:'', minYear:'', maxYear:'', minPrice:'', maxPrice:'', maxMileage:'' }); }}
                style={{ background:'none', border:'none', color:'var(--red)', cursor:'pointer', fontSize:12, fontWeight:600 }}
              >
                {l==='fr'?'✕ Réinitialiser':l==='en'?'✕ Reset':l==='de'?'✕ Zurücksetzen':'✕ Restablecer'}
              </button>
            </div>

            <div style={{ padding: isMobile ? '18px 20px' : '28px 6%' }}>
              {/* Mot-clé */}
              <div style={{ position:'relative', marginBottom:16 }}>
                <span style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', fontSize:16, opacity:0.4, pointerEvents:'none' }}>🔎</span>
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && goSearch()}
                  placeholder={l==='fr' ? 'Marque, modèle, mot-clé...' : l==='en' ? 'Brand, model, keyword...' : l==='de' ? 'Marke, Modell, Stichwort...' : 'Marca, modelo, palabra-clave...'}
                  style={{
                    width:'100%', boxSizing:'border-box',
                    background: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F7',
                    border:'1px solid var(--border)', borderRadius:12,
                    padding:'14px 16px 14px 44px', fontSize:15,
                    fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif",
                    color:'var(--text)', outline:'none', transition:'border-color 0.2s',
                  }}
                />
              </div>

              {/* Champs */}
              <div style={{ display:'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap:12, marginBottom:16 }}>
                <div>
                  <label style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:5 }}>{l==='fr'?'Marque':l==='en'?'Brand':l==='de'?'Marke':'Marca'}</label>
                  <select value={sf.brand} onChange={e => setF('brand', e.target.value)} className="input-luxury" style={{ fontSize:14 }}>
                    <option value="">{l==='fr'?'Toutes':l==='en'?'All':l==='de'?'Alle':'Todas'}</option>
                    {brands.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:5 }}>{l==='fr'?'Catégorie':l==='en'?'Category':l==='de'?'Kategorie':'Categoría'}</label>
                  <select value={sf.category} onChange={e => setF('category', e.target.value)} className="input-luxury" style={{ fontSize:14 }}>
                    <option value="">{l==='fr'?'Toutes':l==='en'?'All':l==='de'?'Alle':'Todas'}</option>
                    {['Berline','SUV','Citadine','Break','Coupe','Monospace','Utilitaire','FourX4'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:5 }}>{l==='fr'?'Carburant':l==='en'?'Fuel':l==='de'?'Kraftstoff':'Combustible'}</label>
                  <select value={sf.fuelType} onChange={e => setF('fuelType', e.target.value)} className="input-luxury" style={{ fontSize:14 }}>
                    <option value="">{l==='fr'?'Tous':l==='en'?'All':l==='de'?'Alle':'Todos'}</option>
                    {['Essence','Diesel','Electrique','Hybride'].map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:5 }}>{l==='fr'?'Boîte':l==='en'?'Gearbox':l==='de'?'Getriebe':'Cambio'}</label>
                  <select value={sf.transmission} onChange={e => setF('transmission', e.target.value)} className="input-luxury" style={{ fontSize:14 }}>
                    <option value="">{l==='fr'?'Toutes':l==='en'?'All':l==='de'?'Alle':'Todas'}</option>
                    {['Manuelle','Automatique'].map(tr => <option key={tr} value={tr}>{tr}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:5 }}>{l==='fr'?'Année min':l==='en'?'Year from':l==='de'?'Ab Baujahr':'Desde año'}</label>
                  <input type="number" placeholder="2015" value={sf.minYear} onChange={e => setF('minYear', e.target.value)} className="input-luxury" style={{ fontSize:14 }} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:5 }}>{l==='fr'?'Année max':l==='en'?'Year to':l==='de'?'Bis Baujahr':'Hasta año'}</label>
                  <input type="number" placeholder="2026" value={sf.maxYear} onChange={e => setF('maxYear', e.target.value)} className="input-luxury" style={{ fontSize:14 }} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:5 }}>{l==='fr'?'Prix min (€)':l==='en'?'Min price (€)':l==='de'?'Min. Preis (€)':'Precio min (€)'}</label>
                  <input type="number" placeholder="5000" value={sf.minPrice} onChange={e => setF('minPrice', e.target.value)} className="input-luxury" style={{ fontSize:14 }} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:5 }}>{l==='fr'?'Prix max (€)':l==='en'?'Max price (€)':l==='de'?'Max. Preis (€)':'Precio max (€)'}</label>
                  <input type="number" placeholder="50000" value={sf.maxPrice} onChange={e => setF('maxPrice', e.target.value)} className="input-luxury" style={{ fontSize:14 }} />
                </div>
              </div>

              <div style={{ display:'flex', gap:12, alignItems:'flex-end', flexWrap:'wrap' }}>
                <div style={{ flex: isMobile ? '1 1 100%' : '0 1 220px' }}>
                  <label style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:5 }}>
                    {l==='fr'?'Kilométrage max':l==='en'?'Max mileage':l==='de'?'Max. Kilometerstand':'Kilometraje máx.'}
                  </label>
                  <input type="number" placeholder="150000" value={sf.maxMileage} onChange={e => setF('maxMileage', e.target.value)} className="input-luxury" style={{ fontSize:14 }} />
                </div>
                <button
                  onClick={goSearch}
                  style={{
                    flex: isMobile ? '1 1 100%' : '0 0 auto', marginLeft: isMobile ? 0 : 'auto',
                    background:'linear-gradient(135deg, #1E3A6E, #132853)',
                    border:'none', borderRadius:12,
                    padding:'14px 36px', color:'#fff', fontWeight:800, fontSize:15,
                    fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif",
                    cursor:'pointer', whiteSpace:'nowrap', letterSpacing:'0.02em',
                    boxShadow:'0 8px 24px rgba(19,40,83,0.35)',
                    transition:'transform 0.15s, box-shadow 0.15s',
                  }}
                  onMouseOver={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 12px 28px rgba(19,40,83,0.45)'; }}
                  onMouseOut={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 8px 24px rgba(19,40,83,0.35)'; }}
                >
                  {l==='fr'?'Rechercher':l==='en'?'Search':l==='de'?'Suchen':l==='es'?'Buscar':l==='it'?'Cerca':l==='pt'?'Pesquisar':'بحث'} →
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>


      {/* ── PROMO VIDEO ── */}
      <VideoSection isMobile={isMobile} />

      {/* ── COMMENT ÇA MARCHE ── */}
      <section style={{ background:'var(--bg)', borderBottom:'1px solid var(--border)' }} className="section-pad">
        <div style={{ maxWidth:1200, margin:'0 auto' }}>

          {/* Header */}
          <div style={{ textAlign:'center', marginBottom: isMobile ? 40 : 60 }}>
            <div className="section-eyebrow" style={{ justifyContent:'center' }}>
              {l==='fr'?'Comment ça marche':l==='en'?'How it works':l==='de'?'So funktioniert es':l==='es'?'Cómo funciona':l==='it'?'Come funziona':'Como funciona'}
            </div>
            <h2 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize:'clamp(28px,4vw,48px)', color:'var(--text)', letterSpacing:'-0.025em', lineHeight:1.05, marginBottom:14 }}>
              {l==='fr'?'Simple, rapide, transparent':l==='en'?'Simple, fast, transparent':l==='de'?'Einfach, schnell, transparent':l==='es'?'Simple, rápido, transparente':l==='it'?'Semplice, rapido, trasparente':'Simples, rápido, transparente'}
            </h2>
          </div>

          {/* Steps — 3 steps on desktop, vertical on mobile */}
          {isMobile ? (
            <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
              {[
                { step:'01', icon:'🔍',
                  fr:{ title:'Choisir votre véhicule', desc:'Parcourez le catalogue, filtrez par marque, budget ou carburant. Consultez chaque fiche avec photos et caractéristiques.' },
                  en:{ title:'Choose your vehicle', desc:'Browse the catalogue, filter by brand, budget or fuel. View each listing with photos and full specs.' },
                  de:{ title:'Fahrzeug wählen', desc:'Durchsuchen Sie den Katalog, filtern Sie nach Marke, Budget oder Kraftstoff. Jedes Inserat mit Fotos und Details.' },
                  es:{ title:'Elegir su vehículo', desc:'Explore el catálogo, filtre por marca, presupuesto o combustible. Consulte cada ficha con fotos y especificaciones.' },
                  it:{ title:'Scegliere il veicolo', desc:'Sfogliate il catalogo, filtrate per marca, budget o carburante. Visualizzate ogni scheda con foto e specifiche.' },
                  pt:{ title:'Escolher o veículo', desc:'Navegue pelo catálogo, filtre por marca, orçamento ou combustível. Consulte cada ficha com fotos e especificações.' },
                },
                { step:'02', icon:'🛒',
                  fr:{ title:'Commander en quelques clics', desc:'Ajoutez le véhicule au panier, choisissez votre mode de financement et confirmez votre commande en toute sécurité.' },
                  en:{ title:'Order in a few clicks', desc:'Add the vehicle to your cart, choose your payment method and confirm your order securely.' },
                  de:{ title:'In wenigen Klicks bestellen', desc:'Legen Sie das Fahrzeug in den Warenkorb, wählen Sie Ihre Zahlungsmethode und bestätigen Sie Ihre Bestellung sicher.' },
                  es:{ title:'Pedir en unos clics', desc:'Añada el vehículo al carrito, elija su modo de pago y confirme su pedido de forma segura.' },
                  it:{ title:'Ordinare in pochi click', desc:'Aggiungete il veicolo al carrello, scegliete il metodo di pagamento e confermate l\'ordine in sicurezza.' },
                  pt:{ title:'Encomendar em poucos cliques', desc:'Adicione o veículo ao carrinho, escolha o seu modo de pagamento e confirme a sua encomenda com segurança.' },
                },
                { step:'03', icon:'🚚',
                  fr:{ title:'Recevez votre véhicule', desc:'Suivez votre commande en temps réel. Livraison à domicile partout en Europe, documents remis en main propre.' },
                  en:{ title:'Receive your vehicle', desc:'Track your order in real time. Home delivery across Europe, documents handed over in person.' },
                  de:{ title:'Erhalten Sie Ihr Fahrzeug', desc:'Verfolgen Sie Ihre Bestellung in Echtzeit. Hauslieferung in ganz Europa, Unterlagen persönlich übergeben.' },
                  es:{ title:'Reciba su vehículo', desc:'Siga su pedido en tiempo real. Entrega a domicilio en toda Europa, documentos entregados en persona.' },
                  it:{ title:'Ricevere il vostro veicolo', desc:'Seguite il vostro ordine in tempo reale. Consegna a domicilio in tutta Europa, documenti consegnati di persona.' },
                  pt:{ title:'Receba o seu veículo', desc:'Siga a sua encomenda em tempo real. Entrega ao domicílio em toda a Europa, documentos entregues pessoalmente.' },
                },
              ].map((s, i, arr) => {
                const data = s[l] || s.fr;
                const isLast = i === arr.length - 1;
                return (
                  <motion.div key={i} initial={{ opacity:0, x:-16 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.4, delay:i*0.08 }}
                    style={{ display:'flex', gap:16, paddingBottom: isLast ? 0 : 32, position:'relative' }}>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
                      <div style={{ width:48, height:48, borderRadius:12, background:'var(--bg-card)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <span style={{ fontSize:22 }}>{s.icon}</span>
                      </div>
                      {!isLast && <div style={{ width:1, flex:1, background:'var(--border)', marginTop:8, minHeight:24 }} />}
                    </div>
                    <div style={{ paddingTop:8, paddingBottom: isLast ? 0 : 8 }}>
                      <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.25em', color:'var(--red)', marginBottom:6, display:'block' }}>
                        {s.step}
                      </span>
                      <h3 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:700, fontSize:17, color:'var(--text)', marginBottom:6, lineHeight:1.2 }}>{data.title}</h3>
                      <p style={{ fontSize:14, color:'var(--text-3)', lineHeight:1.65, margin:0 }}>{data.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:48, position:'relative' }}>
              {[
                { step:'01', icon:'🔍',
                  fr:{ title:'Choisir', desc:'Parcourez le catalogue, filtrez par marque, budget ou carburant.' },
                  en:{ title:'Choose', desc:'Browse the catalogue, filter by brand, budget or fuel.' },
                  de:{ title:'Wählen', desc:'Durchsuchen Sie den Katalog, filtern Sie nach Marke, Budget oder Kraftstoff.' },
                  es:{ title:'Elegir', desc:'Explore el catálogo, filtre por marca, presupuesto o combustible.' },
                  it:{ title:'Scegliere', desc:'Sfogliate il catalogo, filtrate per marca, budget o carburante.' },
                  pt:{ title:'Escolher', desc:'Navegue pelo catálogo, filtre por marca, orçamento ou combustível.' },
                },
                { step:'02', icon:'🛒',
                  fr:{ title:'Commander', desc:'Ajoutez au panier, choisissez le financement et validez en toute sécurité.' },
                  en:{ title:'Order', desc:'Add to cart, choose your payment plan and confirm securely.' },
                  de:{ title:'Bestellen', desc:'In den Warenkorb, Finanzierung wählen und sicher bestätigen.' },
                  es:{ title:'Pedir', desc:'Añada al carrito, elija la financiación y confirme de forma segura.' },
                  it:{ title:'Ordinare', desc:'Aggiungete al carrello, scegliete il finanziamento e confermate in sicurezza.' },
                  pt:{ title:'Encomendar', desc:'Adicione ao carrinho, escolha o financiamento e confirme com segurança.' },
                },
                { step:'03', icon:'🚚',
                  fr:{ title:'Recevoir', desc:'Suivez votre commande, livraison à domicile partout en Europe.' },
                  en:{ title:'Receive', desc:'Track your order, home delivery across Europe.' },
                  de:{ title:'Erhalten', desc:'Verfolgen Sie Ihre Bestellung, Hauslieferung in ganz Europa.' },
                  es:{ title:'Recibir', desc:'Siga su pedido, entrega a domicilio en toda Europa.' },
                  it:{ title:'Ricevere', desc:'Seguite il vostro ordine, consegna a domicilio in tutta Europa.' },
                  pt:{ title:'Receber', desc:'Siga a sua encomenda, entrega ao domicílio em toda a Europa.' },
                },
              ].map((s, i) => {
                const data = s[l] || s.fr;
                return (
                  <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5, delay:i*0.12 }}
                    style={{ textAlign:'center', padding:'0 20px' }}>
                    <div style={{ width:72, height:72, borderRadius:16, background:'var(--bg-card2)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
                      <span style={{ fontSize:30 }}>{s.icon}</span>
                    </div>
                    <span style={{ display:'block', fontSize:9, fontWeight:700, letterSpacing:'0.3em', color:'var(--red)', marginBottom:12 }}>
                      {s.step}
                    </span>
                    <h3 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:700, fontSize:18, color:'var(--text)', marginBottom:10 }}>{data.title}</h3>
                    <p style={{ fontSize:14, color:'var(--text-3)', lineHeight:1.65, margin:0 }}>{data.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── FEATURED VEHICLES ── */}
      <section className="section-pad">
        <div style={{ maxWidth:1400, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:44 }}>
            <div>
              <div className="section-eyebrow">{t('catalog_title', l)}</div>
              <h2 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize:'clamp(28px,4vw,48px)', color:'var(--text)', letterSpacing:'-0.025em', lineHeight:1.05 }}>
                {l==='fr'?'Nos Véhicules\nà la Une':l==='en'?'Featured\nVehicles':l==='de'?'Ausgewählte\nFahrzeuge':l==='es'?'Vehículos\nDestacados':l==='it'?'Veicoli\nin evidenza':'Veículos\nDestacados'}
              </h2>
            </div>
            <Link to="/catalog" className="btn-outline">{t('see_all', l)} →</Link>
          </div>
          
          {loading ? (
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(3,1fr)', gap: isMobile ? 14 : 22 }}>
              {Array.from({ length: isMobile ? 3 : 6 }).map((_, i) => (
                <div key={i} style={{ 
                  background:'var(--bg-card)', 
                  border:'1px solid var(--border)', 
                  borderRadius:12, 
                  padding:20,
                  minHeight:280,
                  display:'flex',
                  flexDirection:'column',
                  gap:12
                }}>
                  <div style={{ 
                    width:'100%', 
                    height:160, 
                    background:'var(--bg-card2)', 
                    borderRadius:8,
                    animation:'pulse 1.5s ease-in-out infinite'
                  }} />
                  <div style={{ height:20, background:'var(--bg-card2)', borderRadius:4, width:'70%' }} />
                  <div style={{ height:16, background:'var(--bg-card2)', borderRadius:4, width:'50%' }} />
                  <div style={{ height:24, background:'var(--bg-card2)', borderRadius:4, width:'40%', marginTop:'auto' }} />
                </div>
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(3,1fr)', gap: isMobile ? 14 : 22 }}>
              {featured.slice(0, isMobile ? 3 : 6).map((car, i) => <CarCard key={car.id} car={car} index={i} />)}
            </div>
          ) : null}
            
          {/* Mobile message to see details */}
          {isMobile && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              style={{ 
                marginTop: 24, 
                padding: '16px 20px', 
                background: 'rgba(19,40,83,0.08)', 
                border: '1px solid rgba(19,40,83,0.2)', 
                borderRadius: 12, 
                textAlign: 'center' 
              }}
            >
              <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 8 }}>
                {l==='fr'?'👆 Tapez sur une voiture pour voir les détails complets':
                 l==='en'?'👆 Tap on a car to see full details':
                 l==='de'?'👆 Tippen Sie auf ein Auto, um alle Details zu sehen':
                 l==='es'?'👆 Toca un coche para ver todos los detalles':
                 l==='it'?'👆 Tocca un\'auto per vedere tutti i dettagli':
                 '👆 Toque em um carro para ver todos os detalhes'}
              </p>
              <Link to="/catalog" style={{ 
                fontSize: 13, 
                fontWeight: 700, 
                color: '#132853', 
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}>
                {l==='fr'?'Voir tout le catalogue':l==='en'?'View full catalog':l==='de'?'Gesamten Katalog ansehen':l==='es'?'Ver catálogo completo':l==='it'?'Vedi catalogo completo':'Ver catálogo completo'} →
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* ── BRANDS ── */}
      <section className="section-pad">
        <div style={{ maxWidth:1400, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:44 }}>
            <div>
              <div className="section-eyebrow">
                {l==='fr'?'NOS MARQUES':l==='en'?'OUR BRANDS':l==='de'?'UNSERE MARKEN':l==='es'?'NUESTRAS MARCAS':l==='it'?'I NOSTRI MARCHI':'AS NOSSAS MARCAS'}
              </div>
              <h2 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize:'clamp(28px,4vw,48px)', color:'var(--text)', letterSpacing:'-0.025em', lineHeight:1.05 }}>
                {l==='fr'?'Les plus grandes\nmarques':l==='en'?'The world\'s\nbiggest brands':l==='de'?'Die größten\nMarken der Welt':l==='es'?'Las marcas\nmás grandes':l==='it'?'I marchi più\ngrandi al mondo':'As maiores\nmarcas do mundo'}
              </h2>
            </div>
            <Link to="/marques" className="btn-outline">{t('see_all', l)} →</Link>
          </div>

          <div style={{ display:'grid', gridTemplateColumns: isMobile ? 'repeat(3,1fr)' : isTablet ? 'repeat(4,1fr)' : 'repeat(6,1fr)', gap: isMobile ? 10 : 16 }}>
            {HOME_BRANDS.map((b, i) => (
              <motion.div key={i} initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.4, delay:(i%6)*0.05 }}>
                <Link to={`/catalog?brand=${encodeURIComponent(b.name)}`} style={{ textDecoration:'none' }}>
                  <div style={{
                    background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12,
                    padding: isMobile ? '18px 8px' : '26px 12px', textAlign:'center', cursor:'pointer',
                    transition:'all 0.35s cubic-bezier(0.16,1,0.3,1)', height:'100%',
                  }}
                    onMouseOver={e => { e.currentTarget.style.borderColor='rgba(19,40,83,0.2)'; e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,0.06)'; e.currentTarget.style.transform='translateY(-3px)'; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='translateY(0)'; }}>
                    <div style={{ margin:'0 auto 10px', display:'flex', alignItems:'center', justifyContent:'center', minHeight: isMobile ? 26 : 34 }}>
                      <BrandLogo brand={b} height={isMobile ? 24 : 32} />
                    </div>
                    <div style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:600, fontSize: isMobile ? 12 : 14, color:'var(--text)', lineHeight:1.2 }}>{b.name}</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5, delay:0.3 }}
            style={{ marginTop:32, padding: isMobile ? '20px' : '24px 32px', background:'var(--bg-card2)', border:'1px solid var(--border)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', gap:16, flexWrap:'wrap' }}>
            <p style={{ fontSize: isMobile ? 13 : 14, color:'var(--text-3)', margin:0 }}>
              {l==='fr'?'Votre marque n\'est pas dans la liste ?':l==='en'?'Your brand is not listed?':l==='de'?'Ihre Marke ist nicht dabei?':l==='es'?'¿Su marca no está en la lista?':l==='it'?'Il vostro marchio non è in elenco?':'A sua marca não está na lista?'}
            </p>
            <Link to="/marques" style={{ fontSize:13, fontWeight:700, color:'#132853', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:6 }}>
              {l==='fr'?'Voir toutes les marques':l==='en'?'View all brands':l==='de'?'Alle Marken ansehen':l==='es'?'Ver todas las marcas':l==='it'?'Vedi tutti i marchi':'Ver todas as marcas'} →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── PERFORMANCE (compteurs animés · carrousel) ── */}
      {perf && showCar && (
        <section
          className="section-pad"
          style={{ borderTop:'1px solid var(--border)', background:'linear-gradient(180deg, var(--bg) 0%, var(--bg-card) 100%)' }}
        >
          <div style={{ maxWidth:1400, margin:'0 auto' }}>
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:44 }}>
              <div>
                <div className="section-eyebrow">
                  {l==='fr'?'PERFORMANCE':l==='en'?'PERFORMANCE':l==='de'?'LEISTUNG':l==='es'?'RENDIMIENTO':l==='it'?'PRESTAZIONI':'DESEMPENHO'}
                </div>
                <h2 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize:'clamp(28px,4vw,48px)', color:'var(--text)', letterSpacing:'-0.025em', lineHeight:1.05 }}>
                  {l==='fr'?'La performance\nincarnée':l==='en'?'Performance\nembodied':l==='de'?'Leistung,\ndie man erlebt':l==='es'?'El rendimiento\nen su máxima expresión':l==='it'?'La prestazione\nin persona':'O desempenho\nencarnado'}
                </h2>
              </div>
              <Link to={`/cars/${showCar.id}`} className="btn-outline" style={{ whiteSpace:'nowrap' }}>
                {l==='fr'?'Découvrir cette voiture':l==='en'?'Discover this car':l==='de'?'Dieses Auto entdecken':l==='es'?'Descubrir este coche':l==='it'?'Scopri questa auto':'Descobrir este carro'} →
              </Link>
            </div>

            <motion.div
              initial={{ opacity:0, y:24 }}
              whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }}
              transition={{ duration:0.6 }}
            >
              {/* Image + contrôles carrousel (pleine largeur) */}
              <div style={{ position:'relative' }} onMouseEnter={() => setPerfPaused(true)} onMouseLeave={() => setPerfPaused(false)}>
                <Link to={`/cars/${showCar.id}`} style={{ textDecoration:'none', display:'block', position:'relative', borderRadius:20, overflow:'hidden', boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.5)' : '0 20px 60px rgba(0,0,0,0.15)' }}>
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={showCar.id}
                      src={showCar.imageUrl || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&q=80'}
                      alt={`${showCar.make} ${showCar.model}`}
                      loading="lazy"
                      initial={{ opacity:0, scale:1.06 }}
                      animate={{ opacity:1, scale:1 }}
                      exit={{ opacity:0 }}
                      transition={{ duration:0.45 }}
                      style={{ width:'100%', height: isMobile ? 320 : 620, objectFit:'cover', display:'block' }}
                    />
                  </AnimatePresence>
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.72) 100%)' }} />
                  <div style={{ position:'absolute', left:28, bottom:26, right:28, display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:16 }}>
                    <AnimatePresence mode="wait">
                      <motion.div key={showCar.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} transition={{ duration:0.35 }}>
                        <div style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize: isMobile ? 24 : 38, color:'#fff', letterSpacing:'-0.025em' }}>
                          {showCar.make} {showCar.model}
                        </div>
                        <div style={{ fontSize: isMobile ? 14 : 16, color:'rgba(255,255,255,0.8)', marginTop:4, fontWeight:600 }}>
                          {showCar.year} · {formatEuro(showCar.price)}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                    <div style={{ flexShrink:0, background:'rgba(255,255,255,0.15)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.25)', color:'#fff', borderRadius:10, padding:'10px 18px', fontSize:13, fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase' }}>
                      {l==='fr'?'Voir la fiche':l==='en'?'View detail':l==='de'?'Details':l==='es'?'Ver ficha':l==='it'?'Scheda':'Ver ficha'} →
                    </div>
                  </div>
                </Link>
              </div>

              {/* Compteurs (bande pleine largeur · key = l'animation repart à zéro) */}
              <div key={showCar.id} style={{ marginTop: isMobile ? 20 : 36, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:20, padding: isMobile ? '34px 8px 28px' : '64px 24px 52px', boxShadow:'var(--shadow-md)' }}>
                <div style={{ display:'flex', justifyContent:'space-around', alignItems:'center', flexWrap:'wrap', gap: isMobile ? 12 : 32 }}>
                  <Speedometer value={perf.power} max={Math.max(700, Math.ceil(perf.power / 50) * 50)} unit={l==='de'?'PS':'hp'} label={l==='fr'?'Puissance':l==='en'?'Power':l==='de'?'Leistung':l==='es'?'Potencia':l==='it'?'Potenza':'Potência'} size={isMobile ? 140 : 300} dark={isDark} />
                  <Speedometer value={perf.topSpeed} max={Math.max(250, Math.ceil((perf.topSpeed + 30) / 50) * 50)} unit="km/h" label={l==='fr'?'Vitesse max':l==='en'?'Top speed':l==='de'?'Höchstgeschwindigkeit':l==='es'?'Velocidad máx':l==='it'?'Velocità max':'Velocidade máx'} size={isMobile ? 140 : 300} dark={isDark} />
                  <Speedometer value={14 - Number(perf.accel)} displayValue={Number(perf.accel)} max={14} unit="s" label="0–100 km/h" size={isMobile ? 140 : 300} dark={isDark} />
                </div>
                <p style={{ textAlign:'center', fontSize:12, color:'var(--text-3)', marginTop: isMobile ? 16 : 32 }}>
                  AUTOMATIK GEBRAUCHTWAGEN
                </p>
              </div>
            </motion.div>

            {/* Indicateurs */}
            {perfCars.length > 1 && (
              <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:28 }}>
                {perfCars.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => setPerfIndex(i)}
                    aria-label={`${c.make} ${c.model}`}
                    style={{ width: i === perfIndex ? 26 : 8, height:8, borderRadius:4, border:'none', cursor:'pointer', background: i === perfIndex ? '#132853' : 'var(--border)', transition:'all 0.3s' }}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── PROMOTIONS ── */}
      {promotions.length > 0 && (
        <section style={{ borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }} className="section-pad">
          <div style={{ maxWidth:1400, margin:'0 auto' }}>
            {/* Header */}
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:44 }}>
              <div>
                <div style={{ display:'inline-flex', alignItems:'center', gap:8, marginBottom:16 }}>
                  <span style={{ width:20, height:1, background:'#FF8C00' }} />
                  <span style={{ fontSize:10, fontWeight:600, letterSpacing:'0.25em', textTransform:'uppercase', color:'#FF8C00' }}>PROMOTIONS</span>
                </div>
                <h2 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize:'clamp(28px,4vw,48px)', color:'var(--text)', letterSpacing:'-0.025em', lineHeight:1.05 }}>
                  {l==='fr'?'Offres Spéciales':l==='en'?'Special Deals':l==='de'?'Angebote':l==='es'?'Ofertas Especiales':l==='it'?'Offerte Speciali':'Ofertas Especiais'}
                </h2>
              </div>
              <Link to="/catalog" className="btn-outline" style={{ borderColor:'#FF8C00', color:'#FF8C00' }}
                onMouseOver={e => { e.currentTarget.style.background='#FF8C00'; e.currentTarget.style.color='#fff'; }}
                onMouseOut={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#FF8C00'; }}>
                {t('see_all', l)} →
              </Link>
            </div>

            {/* Cards */}
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(4,1fr)', gap: isMobile ? 14 : 22 }}>
              <AnimatePresence>
                {promotions.slice(0, isMobile ? 2 : 4).map((car, i) => <CarCard key={car.id} car={car} index={i} />)}
              </AnimatePresence>
            </div>
          </div>
        </section>
      )}

      {/* ── CAMPING CARS ── */}
      {campingCars.length > 0 && (
        <section style={{ background:'var(--bg-card2)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }} className="section-pad">
          <div style={{ maxWidth:1400, margin:'0 auto' }}>
            {/* Header */}
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:44 }}>
              <div>
                <div className="section-eyebrow">
                  {l==='fr'?'CAMPING CAR':l==='en'?'MOTORHOME':l==='de'?'WOHNMOBIL':l==='es'?'AUTOCARAVANA':l==='it'?'CAMPER':'AUTOCARAVANA'}
                </div>
                <h2 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize:'clamp(28px,4vw,48px)', color:'var(--text)', letterSpacing:'-0.025em', lineHeight:1.05 }}>
                  {l==='fr'?'Nos Camping Cars':l==='en'?'Our Motorhomes':l==='de'?'Unsere Wohnmobile':l==='es'?'Nuestras Autocaravanas':l==='it'?'I Nostri Camper':'As Nossas Autocaravanas'}
                </h2>
              </div>
              <Link to="/camping-car" className="btn-outline">
                {t('see_all', l)} →
              </Link>
            </div>

            {/* Cards */}
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(3,1fr)', gap: isMobile ? 14 : 22 }}>
              <AnimatePresence>
                {campingCars.map((car, i) => <CarCard key={car.id} car={car} index={i} />)}
              </AnimatePresence>
            </div>

            {/* Banner CTA */}
            <motion.div
              initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5, delay:0.3 }}
              style={{ marginTop:32, padding: isMobile ? '24px 20px' : '28px 40px', background:'linear-gradient(135deg,rgba(19,40,83,0.07),rgba(19,40,83,0.02))', border:'1px solid rgba(19,40,83,0.15)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, flexWrap:'wrap' }}>
              <div>
                <p style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize: isMobile ? 16 : 18, color:'var(--text)', marginBottom:4 }}>
                  🚐 {l==='fr'?"L'aventure commence ici":l==='en'?'The adventure starts here':l==='de'?'Das Abenteuer beginnt hier':l==='es'?'La aventura empieza aquí':l==='it'?"L'avventura inizia qui":'A aventura começa aqui'}
                </p>
                <p style={{ fontSize:14, color:'var(--text-3)' }}>
                  {l==='fr'?"Découvrez toute notre gamme de camping cars disponibles à la vente.":l==='en'?'Browse our full range of motorhomes available for sale.':l==='de'?'Entdecken Sie unser komplettes Sortiment an Wohnmobilen.':l==='es'?'Descubra toda nuestra gama de autocaravanas disponibles.':l==='it'?'Scopri la nostra gamma completa di camper disponibili.':'Descubra toda a nossa gama de autocaravanas disponíveis.'}
                </p>
              </div>
              <Link to="/camping-car" className="btn-primary" style={{ fontSize:13, whiteSpace:'nowrap' }}>
                {l==='fr'?'Voir le catalogue':l==='en'?'View catalogue':l==='de'?'Katalog anzeigen':l==='es'?'Ver catálogo':l==='it'?'Vedi catalogo':'Ver catálogo'} →
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── PURCHASE STEPS ── */}
      <PurchaseStepsSection l={l} isMobile={isMobile} />

      {/* ── SERVICES ── */}
      <section style={{ background:'var(--bg-card2)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }} className="section-pad">
        <div style={{ maxWidth:1300, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <div className="section-eyebrow" style={{ justifyContent:'center' }}>{t('services_label', l)}</div>
            <h2 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize:'clamp(28px,4vw,48px)', color:'var(--text)', letterSpacing:'-0.025em' }}>
              {l==='fr'?'Ce que nous faisons\npour vous':l==='en'?'What we do\nfor you':l==='de'?'Was wir für\nSie tun':l==='es'?'Lo que hacemos\npor usted':l==='it'?'Cosa facciamo\nper voi':'O que fazemos\npor você'}
            </h2>
            <p style={{ fontSize:15, color:'var(--text-3)', marginTop:14, maxWidth:480, margin:'14px auto 0', lineHeight:1.6 }}>{t('services_sub', l)}</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(3,1fr)', gap: isMobile ? 12 : 16 }}>
            {SERVICES.map((s, i) => (
              <motion.div key={i} initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.06, duration:0.5 }}
                style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'24px 26px', transition:'all 0.35s cubic-bezier(0.16,1,0.3,1)' }}
                onMouseOver={e=>{e.currentTarget.style.borderColor='rgba(19,40,83,0.12)'; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,0.06)';}}
                onMouseOut={e=>{e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none';}}>
                <div style={{ fontSize:28, marginBottom:16 }}>{s.icon}</div>
                <h3 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:700, fontSize:17, color:'var(--text)', marginBottom:8 }}>{getServiceTitle(s)}</h3>
                <p style={{ fontSize:14, color:'var(--text-3)', lineHeight:1.65 }}>{getServiceDesc(s)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ / POURQUOI NOUS CHOISIR ── */}
      <FAQSection l={l} isMobile={isMobile} />

      {/* ── WHY CHOOSE US (Stats + Q&A cards) ── */}
      <section className="section-pad">
        <div style={{ maxWidth:1300, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <div className="section-eyebrow" style={{ justifyContent:'center' }}>
              {l==='fr'?'Notre Force':l==='en'?'Our Strength':l==='de'?'Unsere Stärke':l==='es'?'Nuestra Fuerza':l==='it'?'La Nostra Forza':'Nossa Força'}
            </div>
            <h2 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize:'clamp(28px,4vw,48px)', color:'var(--text)', letterSpacing:'-0.025em' }}>
              {l==='fr'?'Ce qui nous\ndistingue':l==='en'?'What sets\nus apart':l==='de'?'Was uns\nauszeichnet':l==='es'?'Lo que nos\ndistingue':l==='it'?'Cosa ci\ndistingue':'O que nos\ndistingue'}
            </h2>
            <p style={{ fontSize:15, color:'var(--text-3)', marginTop:14, maxWidth:520, margin:'14px auto 0', lineHeight:1.6 }}>
              {l==='fr'?'Découvrez ce qui nous distingue et pourquoi des milliers de clients nous font confiance.':l==='en'?'Discover what sets us apart and why thousands of customers trust us.':l==='de'?'Entdecken Sie, was uns unterscheidet und warum uns tausende Kunden vertrauen.':l==='es'?'Descubre lo que nos distingue y por qué miles de clientes confían en nosotros.':l==='it'?'Scopri cosa ci distingue e perché migliaia di clienti si fidano di noi.':'Descubra o que nos diferencia e por que milhares de clientes confiam em nós.'}
            </p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap: isMobile ? 24 : 32 }}>
            {[
              { img:'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&q=80', alt:'Quality',
                title:{ fr:'Véhicules certifiés et inspectés', en:'Certified and inspected vehicles', de:'Zertifizierte und geprüfte Fahrzeuge', es:'Vehículos certificados e inspeccionados', it:'Veicoli certificati e ispezionati', pt:'Veículos certificados e inspecionados' },
                desc:{ fr:'Chaque véhicule passe par une inspection de 150 points. Historique complet vérifié, garantie jusqu\'à 24 mois.', en:'Every vehicle undergoes a 150-point inspection. Complete verified history, warranty up to 24 months.', de:'Jedes Fahrzeug durchläuft eine 150-Punkte-Inspektion. Vollständig verifizierte Historie, Garantie bis zu 24 Monaten.', es:'Cada vehículo pasa por una inspección de 150 puntos. Historial completo verificado, garantía hasta 24 meses.', it:'Ogni veicolo subisce un\'ispezione di 150 punti. Storia completa verificata, garanzia fino a 24 mesi.', pt:'Cada veículo passa por uma inspeção de 150 pontos. Histórico completo verificado, garantia até 24 meses.' }, dir:-20 },
              { img:'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=300&q=80', alt:'Financing',
                title:{ fr:'Financement sur mesure', en:'Tailored financing', de:'Maßgeschneiderte Finanzierung', es:'Financiación a medida', it:'Finanziamento su misura', pt:'Financiamento personalizado' },
                desc:{ fr:'Taux compétitifs, réponse en 24h, options flexibles. Nous travaillons avec les meilleurs partenaires bancaires.', en:'Competitive rates, response in 24h, flexible options. We work with the best banking partners.', de:'Wettbewerbsfähige Zinsen, Antwort in 24h, flexible Optionen. Wir arbeiten mit den besten Bankpartnern.', es:'Tasas competitivas, respuesta en 24h, opciones flexibles. Trabajamos con los mejores socios bancarios.', it:'Tassi competitivi, risposta in 24h, opzioni flessibili. Lavoriamo con i migliori partner bancari.', pt:'Taxas competitivas, resposta em 24h, opções flexíveis. Trabalhamos com os melhores parceiros bancários.' }, dir:20 },
              { img:'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=300&q=80', alt:'Delivery',
                title:{ fr:'Livraison partout en Europe', en:'Delivery across Europe', de:'Lieferung in ganz Europa', es:'Entrega en toda Europa', it:'Consegna in tutta Europa', pt:'Entrega em toda a Europa' },
                desc:{ fr:'Transport sécurisé, livraison à domicile, suivi en temps réel. Votre véhicule livré propre et avec plein.', en:'Secure transport, home delivery, real-time tracking. Your vehicle delivered clean and with full tank.', de:'Sicherer Transport, Hauslieferung, Echtzeit-Tracking. Ihr Fahrzeug sauber und vollgetankt geliefert.', es:'Transporte seguro, entrega a domicilio, seguimiento en tiempo real. Su vehículo entregado limpio y con depósito lleno.', it:'Trasporto sicuro, consegna a domicilio, tracciamento in tempo reale. Il vostro veicolo consegnato pulito e con il pieno.', pt:'Transporte seguro, entrega ao domicílio, rastreamento em tempo real. O seu veículo entregue limpo e com depósito cheio.' }, dir:-20 },
              { img:'https://images.unsplash.com/photo-1454117096348-e4abbeba002c?w=300&q=80', alt:'Support',
                title:{ fr:'Support client 24/7', en:'24/7 customer support', de:'24/7 Kundensupport', es:'Soporte al cliente 24/7', it:'Supporto clienti 24/7', pt:'Suporte ao cliente 24/7' },
                desc:{ fr:'Équipe disponible par WhatsApp, email et téléphone. Assistance pour toutes vos questions, même après la vente.', en:'Team available via WhatsApp, email and phone. Assistance for all your questions, even after sale.', de:'Team verfügbar per WhatsApp, E-Mail und Telefon. Unterstützung für alle Ihre Fragen, auch nach dem Verkauf.', es:'Equipo disponible por WhatsApp, correo y teléfono. Asistencia para todas sus preguntas, incluso después de la venta.', it:'Team disponibile via WhatsApp, email e telefono. Assistenza per tutte le vostre domande, anche dopo la vendita.', pt:'Equipe disponível por WhatsApp, email e telefone. Assistência para todas as suas perguntas, mesmo após a venda.' }, dir:20 },
              { img:'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=300&q=80', alt:'Trade-in',
                title:{ fr:'Reprise de votre véhicule', en:'Trade-in your vehicle', de:'Ankauf Ihres Fahrzeugs', es:'Canje de su vehículo', it:'Permuta del vostro veicolo', pt:'Troca do seu veículo' },
                desc:{ fr:'Estimation gratuite en ligne, reprise au meilleur prix. Simplifiez votre achat avec notre service de reprise.', en:'Free online valuation, trade-in at best price. Simplify your purchase with our trade-in service.', de:'Kostenlose Online-Bewertung, Ankauf zum besten Preis. Vereinfachen Sie Ihren Kauf mit unserem Ankaufsservice.', es:'Valoración gratuita en línea, canje al mejor precio. Simplifique su compra con nuestro servicio de canje.', it:'Valutazione gratuita online, permuta al miglior prezzo. Semplificate il vostro acquisto con il nostro servizio di permuta.', pt:'Avaliação gratuita online, troca ao melhor preço. Simplifique a sua compra com o nosso serviço de troca.' }, dir:-20 },
              { img:'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=300&q=80', alt:'Warranty',
                title:{ fr:'Garantie étendue incluse', en:'Extended warranty included', de:'Erweiterte Garantie enthalten', es:'Garantía extendida incluida', it:'Garanzia estesa inclusa', pt:'Garantia estendida incluída' },
                desc:{ fr:'Protection moteur et transmission, assistance 24/7, options d\'extension jusqu\'à 36 mois. Roulez l\'esprit tranquille.', en:'Engine and transmission protection, 24/7 assistance, extension options up to 36 months. Drive with peace of mind.', de:'Motor- und Getriebeschutz, 24/7 Assistance, Erweiterungsoptionen bis zu 36 Monaten. Fahren Sie mit ruhigem Gewissen.', es:'Protección de motor y transmisión, asistencia 24/7, opciones de extensión hasta 36 meses. Conduzca con tranquilidad.', it:'Protezione motore e trasmissione, assistenza 24/7, opzioni di estensione fino a 36 mesi. Guidate con tranquillità.', pt:'Proteção de motor e transmissão, assistência 24/7, opções de extensão até 36 meses. Conduza com tranquilidade.' }, dir:20 },
            ].map((item, i) => (
              <motion.div key={i}
                initial={{ opacity:0, x: item.dir }}
                whileInView={{ opacity:1, x:0 }}
                viewport={{ once:true }}
                transition={{ duration:0.6, delay:i * 0.1 }}
                style={{ display:'flex', gap:20, alignItems:'start', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding: isMobile ? 20 : 28, boxShadow:'var(--shadow-sm)' }}>
                <div style={{ width: isMobile ? 80 : 120, height: isMobile ? 80 : 120, borderRadius:12, overflow:'hidden', flexShrink:0 }}>
                  <img src={item.img} alt={item.alt} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                </div>
                <div style={{ flex:1 }}>
                  <h3 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize: isMobile ? 16 : 18, color:'var(--text)', marginBottom:8 }}>
                    {item.title[l] || item.title.fr}
                  </h3>
                  <p style={{ fontSize:14, color:'var(--text-3)', lineHeight:1.6 }}>
                    {item.desc[l] || item.desc.fr}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats Banner */}
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.6, delay:0.6 }}
            style={{ marginTop:48, padding: isMobile ? 28 : 36, background:'linear-gradient(135deg,rgba(19,40,83,0.08),rgba(19,40,83,0.03))', border:'2px solid rgba(19,40,83,0.2)', borderRadius:16, display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap:24, textAlign:'center' }}>
            {[
              { value:'10+', label:l==='fr'?'Années d\'expérience':l==='en'?'Years experience':l==='de'?'Jahre Erfahrung':l==='es'?'Años de experiencia':l==='it'?'Anni di esperienza':'Anos de experiência' },
              { value:'5000+', label:l==='fr'?'Clients satisfaits':l==='en'?'Happy clients':l==='de'?'Zufriedene Kunden':l==='es'?'Clientes satisfechos':l==='it'?'Clienti soddisfatti':'Clientes satisfeitos' },
              { value:'4.9★', label:l==='fr'?'Note moyenne':l==='en'?'Average rating':l==='de'?'Durchschnittsbewertung':l==='es'?'Calificación promedio':l==='it'?'Valutazione media':'Avaliação média' },
              { value:'24/7', label:l==='fr'?'Support disponible':l==='en'?'Support available':l==='de'?'Support verfügbar':l==='es'?'Soporte disponible':l==='it'?'Supporto disponibile':'Suporte disponível' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:900, fontSize: isMobile ? 32 : 40, color:'#132853', lineHeight:1 }}>{value}</div>
                <div style={{ fontSize: isMobile ? 12 : 13, color:'var(--text-3)', marginTop:6, fontWeight:600 }}>{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── WARRANTY & INSURANCE ── */}
      <section className="section-pad">
        <div style={{ maxWidth:1300, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <div className="section-eyebrow" style={{ justifyContent:'center' }}>
              {l==='fr'?'Protection':l==='en'?'Protection':l==='de'?'Schutz':l==='es'?'Protección':l==='it'?'Protezione':'Proteção'}
            </div>
            <h2 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize:'clamp(28px,4vw,48px)', color:'var(--text)', letterSpacing:'-0.025em' }}>
              {l==='fr'?'Garanties &\nAssurances':l==='en'?'Warranties &\nInsurance':l==='de'?'Garantien &\nVersicherungen':l==='es'?'Garantías &\nSeguros':l==='it'?'Garanzie &\nAssicurazioni':'Garantias &\nSeguros'}
            </h2>
            <p style={{ fontSize:15, color:'var(--text-3)', marginTop:14, maxWidth:520, margin:'14px auto 0', lineHeight:1.6 }}>
              {l==='fr'?'Une protection complète pour votre véhicule, avec des garanties étendues et des options d\'assurance sur mesure.':l==='en'?'Complete protection for your vehicle with extended warranties and tailored insurance options.':l==='de'?'Umfassender Schutz für Ihr Fahrzeug mit erweiterten Garantien und maßgeschneiderten Versicherungsoptionen.':l==='es'?'Protección completa para su vehículo con garantías extendidas y opciones de seguro a medida.':l==='it'?'Protezione completa per il vostro veicolo con garanzie estese e opzioni assicurative su misura.':'Proteção completa para seu veículo com garantias estendidas e opções de seguro sob medida.'}
            </p>
          </div>

          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(3,1fr)', gap: isMobile ? 16 : 24 }}>
            {/* Warranty Card */}
            <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5 }}
              style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding: isMobile ? 24 : 32, boxShadow:'var(--shadow-sm)', transition:'all 0.3s' }}
              onMouseOver={e=>{e.currentTarget.style.borderColor='rgba(19,40,83,0.3)'; e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='var(--shadow-md)';}}
              onMouseOut={e=>{e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='var(--shadow-sm)';}}>
              <div style={{ width:56, height:56, borderRadius:12, background:'linear-gradient(135deg,rgba(19,40,83,0.15),rgba(19,40,83,0.05))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, marginBottom:20 }}>🛡️</div>
              <h3 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize: isMobile ? 18 : 20, color:'var(--text)', marginBottom:12 }}>
                {l==='fr'?'Garantie German Auto Cars':l==='en'?'German Auto Cars Warranty':l==='de'?'German Auto Cars Garantie':l==='es'?'Garantía German Auto Cars':l==='it'?'Garanzia German Auto Cars':'Garantia German Auto Cars'}
              </h3>
              <p style={{ fontSize:14, color:'var(--text-3)', lineHeight:1.6, marginBottom:20 }}>
                {l==='fr'?'Incluse dans toutes les commandes. Valable 12 mois ou 10 000 km. Protection moteur, boîte de vitesse, hors pièces d\'usure.':l==='en'?'Included in all orders. Valid 12 months or 10,000 km. Engine and transmission protection, excluding wear parts.':l==='de'?'In allen Bestellungen enthalten. Gültig 12 Monate oder 10.000 km. Motor- und Getriebeschutz, Verschleißteile ausgeschlossen.':l==='es'?'Incluida en todos los pedidos. Válida 12 meses o 10.000 km. Protección de motor y transmisión, excluyendo piezas de desgaste.':l==='it'?'Inclusa in tutti gli ordini. Valida 12 mesi o 10.000 km. Protezione motore e trasmissione, esclusi pezzi di usura.':'Incluída em todos os pedidos. Válida 12 meses ou 10.000 km. Proteção de motor e transmissão, excluindo peças de desgaste.'}
              </p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:20 }}>
                {[l==='fr'?'✓ 12 mois':l==='en'?'✓ 12 months':l==='de'?'✓ 12 Monate':'✓ 12 meses', l==='fr'?'✓ 10 000 km':'✓ 10,000 km', l==='fr'?'✓ Moteur':l==='en'?'✓ Engine':l==='de'?'✓ Motor':'✓ Motor'].map((b,i)=>(
                  <span key={i} style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', background:'var(--bg-card2)', padding:'6px 12px', borderRadius:6 }}>{b}</span>
                ))}
              </div>
              <Link to="/warranty" style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:13, fontWeight:700, color:'#132853', textDecoration:'none' }}>
                {l==='fr'?'En savoir plus':l==='en'?'Learn more':l==='de'?'Mehr erfahren':l==='es'?'Saber más':l==='it'?'Scopri di più':'Saiba mais'} →
              </Link>
            </motion.div>

            {/* Extension Options */}
            <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5, delay:0.1 }}
              style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding: isMobile ? 24 : 32, boxShadow:'var(--shadow-sm)', transition:'all 0.3s' }}
              onMouseOver={e=>{e.currentTarget.style.borderColor='rgba(19,40,83,0.3)'; e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='var(--shadow-md)';}}
              onMouseOut={e=>{e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='var(--shadow-sm)';}}>
              <div style={{ width:56, height:56, borderRadius:12, background:'linear-gradient(135deg,rgba(19,40,83,0.15),rgba(19,40,83,0.05))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, marginBottom:20 }}>📅</div>
              <h3 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize: isMobile ? 18 : 20, color:'var(--text)', marginBottom:12 }}>
                {l==='fr'?'Options d\'extension':l==='en'?'Extension options':l==='de'?'Erweiterungsoptionen':l==='es'?'Opciones de extensión':l==='it'?'Opzioni di estensione':'Opções de extensão'}
              </h3>
              <p style={{ fontSize:14, color:'var(--text-3)', lineHeight:1.6, marginBottom:20 }}>
                {l==='fr'?'Étendez votre protection jusqu\'à 36 mois. Options disponibles : assistance 24/7, véhicule de remplacement, garantie carrosserie.':l==='en'?'Extend your protection up to 36 months. Available options: 24/7 assistance, replacement vehicle, body warranty.':l==='de'?'Erweitern Sie Ihren Schutz bis zu 36 Monaten. Verfügbare Optionen: 24/7 Assistance, Ersatzfahrzeug, Karossergarantie.':l==='es'?'Amplíe su protección hasta 36 meses. Opciones disponibles: asistencia 24/7, vehículo de reemplazo, garantía de carrocería.':l==='it'?'Estendete la tua protezione fino a 36 mesi. Opzioni disponibili: assistenza 24/7, veicolo sostitutivo, garanzia carrozzeria.':'Estenda sua proteção até 36 meses. Opções disponíveis: assistência 24/7, veículo substituto, garantia de carroceria.'}
              </p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:20 }}>
                {['✓ 24 mois','✓ 36 mois','✓ 24/7'].map((b,i)=>(
                  <span key={i} style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', background:'var(--bg-card2)', padding:'6px 12px', borderRadius:6 }}>{b}</span>
                ))}
              </div>
              <Link to="/warranty" style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:13, fontWeight:700, color:'#132853', textDecoration:'none' }}>
                {l==='fr'?'En savoir plus':l==='en'?'Learn more':l==='de'?'Mehr erfahren':l==='es'?'Saber más':l==='it'?'Scopri di più':'Saiba mais'} →
              </Link>
            </motion.div>

            {/* Insurance */}
            <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.5, delay:0.2 }}
              style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding: isMobile ? 24 : 32, boxShadow:'var(--shadow-sm)', transition:'all 0.3s' }}
              onMouseOver={e=>{e.currentTarget.style.borderColor='rgba(19,40,83,0.3)'; e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='var(--shadow-md)';}}
              onMouseOut={e=>{e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='var(--shadow-sm)';}}>
              <div style={{ width:56, height:56, borderRadius:12, background:'linear-gradient(135deg,rgba(19,40,83,0.15),rgba(19,40,83,0.05))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, marginBottom:20 }}>💳</div>
              <h3 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize: isMobile ? 18 : 20, color:'var(--text)', marginBottom:12 }}>
                {l==='fr'?'Assurance véhicule':l==='en'?'Vehicle insurance':l==='de'?'Fahrzeugversicherung':l==='es'?'Seguro de vehículo':l==='it'?'Assicurazione veicolo':'Seguro veículo'}
              </h3>
              <p style={{ fontSize:14, color:'var(--text-3)', lineHeight:1.6, marginBottom:20 }}>
                {l==='fr'?'Solutions d\'assurance complètes : responsabilité civile, tous risques, protection contre le vol et les incendies.':l==='en'?'Comprehensive insurance solutions: liability, full coverage, theft and fire protection.':l==='de'?'Umfassende Versicherungslösungen: Haftpflicht, Vollkasko, Diebstahl- und Brandschutz.':l==='es'?'Soluciones de seguro completas: responsabilidad civil, cobertura total, protección contra robo e incendios.':l==='it'?'Soluzioni assicurative complete: responsabilità civile, copertura totale, protezione contro furto e incendio.':'Soluções de seguro abrangentes: responsabilidade civil, cobertura total, proteção contra roubo e incêndio.'}
              </p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:20 }}>
                {[l==='fr'?'✓ RC':l==='en'?'✓ Liability':'✓ RC', l==='fr'?'✓ Tous risques':l==='en'?'✓ Full coverage':'✓ RC', l==='fr'?'✓ Vol':l==='en'?'✓ Theft':'✓ Vol'].map((b,i)=>(
                  <span key={i} style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', background:'var(--bg-card2)', padding:'6px 12px', borderRadius:6 }}>{b}</span>
                ))}
              </div>
              <Link to="/insurance" style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:13, fontWeight:700, color:'#132853', textDecoration:'none' }}>
                {l==='fr'?'En savoir plus':l==='en'?'Learn more':l==='de'?'Mehr erfahren':l==='es'?'Saber más':l==='it'?'Scopri di più':'Saiba mais'} →
              </Link>
            </motion.div>
          </div>

          {/* Trust badges */}
          <div style={{ marginTop:40, display:'flex', justifyContent:'center', flexWrap:'wrap', gap:12 }}>
            {[
              { text: l==='fr'?'✓ Garantie incluse':l==='en'?'✓ Warranty included':l==='de'?'✓ Garantie enthalten':l==='es'?'✓ Garantía incluida':l==='it'?'✓ Garanzia inclusa':'✓ Garantia incluída' },
              { text: l==='fr'?'✓ Protection étendue':l==='en'?'✓ Extended protection':l==='de'?'✓ Erweiterter Schutz':l==='es'?'✓ Protección extendida':l==='it'?'✓ Protezione estesa':'✓ Proteção estendida' },
              { text: l==='fr'?'✓ Assurance sur mesure':l==='en'?'✓ Tailored insurance':l==='de'?'✓ Maßgeschneiderte Versicherung':l==='es'?'✓ Seguro a medida':l==='it'?'✓ Assicurazione su misura':'✓ Seguro sob medida' },
              { text: l==='fr'?'✓ Assistance 24/7':l==='en'?'✓ 24/7 assistance':l==='de'?'✓ 24/7 Assistance':l==='es'?'✓ Asistencia 24/7':l==='it'?'✓ Assistenza 24/7':'✓ Assistência 24/7' },
            ].map((badge, i) => (
              <div key={i} style={{ padding:'10px 20px', background:'var(--bg-card2)', border:'1px solid rgba(19,40,83,0.2)', borderRadius:8, fontSize:13, fontWeight:700, color:'#132853' }}>
                {badge.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className="section-pad" style={{ background:'var(--bg-card2)', borderTop:'1px solid var(--border)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div className="section-eyebrow" style={{ justifyContent:'center' }}>{t('reviews_label', l)}</div>
            <h2 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize:'clamp(28px,4vw,48px)', color:'var(--text)', letterSpacing:'-0.025em' }}>
              {l==='fr'?'Ce que disent\nnos clients':l==='en'?'What our\ncustomers say':l==='de'?'Was unsere Kunden\nsagen':l==='es'?'Lo que dicen\nnuestros clientes':l==='it'?'Cosa dicono\ni nostri clienti':'O que dizem\nnosssos clientes'}
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(3,1fr)', gap: isMobile ? 12 : 20 }}>
            {ALL_REVIEWS.slice(0, 6).map((r, i) => (
              <motion.div key={i} initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.08, duration:0.5 }}
                style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'22px 24px', boxShadow:'var(--shadow-sm)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                  <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,#0E1E3D,#132853)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize:14, color:'#fff', flexShrink:0 }}>{r.avatar}</div>
                  <div>
                    <p style={{ fontWeight:700, fontSize:15, color:'var(--text)' }}>{r.name}</p>
                    <Stars n={r.rating} />
                  </div>
                  <span style={{ marginLeft:'auto', fontSize:11, fontWeight:600, background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)', color:'var(--green)', padding:'3px 10px', borderRadius:4 }}>✓ {t('verified', l)}</span>
                </div>
                <p style={{ fontSize:14, color:'var(--text-2)', lineHeight:1.7 }}>"{getReviewText(r)}"</p>
              </motion.div>
            ))}
          </div>
          <div style={{ textAlign:'center', marginTop:36 }}>
            <Link to="/avis" className="btn-outline" style={{ fontSize:14, padding:'13px 32px' }}>
              {l==='fr'?'Voir tous les avis →':l==='en'?'See all reviews →':l==='de'?'Alle Bewertungen →':l==='es'?'Ver todas las opiniones →':l==='it'?'Vedi tutte le recensioni →':'Ver todas as avaliações →'}
            </Link>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section style={{ borderTop:'1px solid var(--border)' }} className="section-pad">
        <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 36 : 64, alignItems:'center' }}>
          <div>
            <div className="section-eyebrow">{t('contact_label', l)}</div>
            <h2 style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight:800, fontSize:'clamp(28px,4vw,48px)', color:'var(--text)', letterSpacing:'-0.025em', marginBottom:20 }}>
              {t('contact_title', l)}
            </h2>
            <p style={{ fontSize:15, color:'var(--text-3)', lineHeight:1.7, marginBottom:32, fontWeight:300 }}>
              {l==='fr'?'Notre équipe est à votre disposition pour vous accompagner dans votre projet automobile.':l==='en'?'Our team is at your disposal to help you with your car project.':l==='de'?'Unser Team steht Ihnen für Ihr Autoprojekt zur Verfügung.':l==='es'?'Nuestro equipo está a su disposición para ayudarle con su proyecto.':l==='it'?'Il nostro team è a vostra disposizione per il vostro progetto.':'Nossa equipe está à sua disposição para ajudá-lo com seu projeto.'}
            </p>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <a href="https://wa.me/491745232945" target="_blank" rel="noopener noreferrer"
                style={{ background:'#25D366', color:'#fff', textDecoration:'none', fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontSize:13, fontWeight:600, padding:'14px 28px', borderRadius:8, display:'inline-flex', alignItems:'center', gap:8, letterSpacing:'0.02em' }}>
                💬 WhatsApp
              </a>
              <a href="mailto:kontakt@automatikgebrauchtwagen.com" className="btn-ghost" style={{ fontSize:13 }}>
                ✉ Email
              </a>
            </div>
          </div>
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding: isMobile ? 24 : 36 }}>
            <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--red)', marginBottom:20 }}>{t('contact_hours', l)}</p>
            {[
              { day:t('mon_fri',l), hours:'09:00 – 18:00' },
              { day:t('saturday',l), hours:'10:00 – 15:00' },
              { day:t('sunday',l), hours:t('closed',l) },
            ].map(({ day, hours }) => (
              <div key={day} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'13px 0', borderBottom:'1px solid var(--border)' }}>
                <span style={{ fontSize:14, color:'var(--text-2)', fontWeight:600 }}>{day}</span>
                <span style={{ fontSize:14, color:hours===t('closed',l)?'#DC2626':'var(--green)', fontWeight:700 }}>{hours}</span>
              </div>
            ))}
            <div style={{ marginTop:20, padding:'14px 18px', background:'var(--red-bg)', border:'1px solid var(--red-border)', borderRadius:8 }}>
              <p style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.6 }}>
                📍 Franz-Julius-Haenel-Str. 3, 06618 Naumburg<br/>
                📞 <a href="tel:+491745232945" style={{ color:'var(--red)', textDecoration:'none', fontWeight:600 }}>+49 174 523 29 45</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:'var(--bg-card2)', borderTop:'1px solid var(--border)', padding: isMobile ? '40px 5% 28px' : '56px 7% 32px' }}>
        <div style={{ maxWidth:1300, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'auto 1fr auto', gap: isMobile ? 28 : 48, alignItems:'start' }}>
            <div>
              <div style={{ fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontSize:15, fontWeight:800, color:'var(--text)', letterSpacing:'0.08em' }}>AUTOMATIK</div>
              <div style={{ fontSize:8, letterSpacing:'0.35em', color:'var(--red)', textTransform:'uppercase', marginTop:3, marginBottom:14, fontWeight:500 }}>Gebrauchtwagen · Naumburg</div>
              <p style={{ fontSize:13, color:'var(--text-3)', lineHeight:1.6, maxWidth:240, fontWeight:300 }}>
                {l==='fr'?'Votre partenaire automobile de confiance en Allemagne.':l==='en'?'Your trusted car partner in Germany.':l==='de'?'Ihr vertrauenswürdiger Autopartner in Deutschland.':l==='es'?'Su socio de confianza en Alemania.':l==='it'?'Il vostro partner automobilistico di fiducia in Germania.':'Seu parceiro automobilístico de confiança na Alemanha.'}
              </p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: isMobile ? 24 : 16, paddingLeft: isMobile ? 0 : 48 }}>
              <div>
                <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:14 }}>Navigation</p>
                {[{to:'/catalog',label:t('nav_vehicles',l)},{to:'/simulation',label:t('nav_financing',l)},{to:'/track',label:t('nav_track',l)}].map(({to,label})=>(
                  <Link key={to} to={to} style={{ display:'block', fontSize:13, color:'var(--text-3)', textDecoration:'none', marginBottom:10, transition:'color 0.25s', fontWeight:400 }}
                    onMouseOver={e=>e.currentTarget.style.color='var(--red)'} onMouseOut={e=>e.currentTarget.style.color='var(--text-3)'}>{label}</Link>
                ))}
              </div>
              <div>
                <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:14 }}>Contact</p>
                <p style={{ fontSize:13, color:'var(--text-3)', lineHeight:1.8, fontWeight:400 }}>
                  📞 +49 174 523 29 45<br/>
                  ✉ kontakt@automatikgebrauchtwagen.com<br/>
                  💬 <a href="https://wa.me/491745232945" style={{ color:'var(--red)', textDecoration:'none' }}>WhatsApp</a>
                </p>
              </div>
              <div>
                <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:14 }}>
                  {l==='fr'?'Informations légales':l==='en'?'Legal':l==='de'?'Rechtliches':l==='es'?'Legal':l==='it'?'Note legali':'Informações legais'}
                </p>
                {[
                  { to:'/mentions-legales', fr:'Mentions légales', en:'Legal notice', de:'Impressum', pt:'Aviso legal' },
                  { to:'/politique-de-vente', fr:'Politique de vente', en:'Sales policy', de:'Verkaufspolitik', pt:'Política de vendas' },
                  { to:'/cgv', fr:'CGV', en:'Terms of sale', de:'AGB', pt:'Termos de venda' },
                  { to:'/politique-confidentialite', fr:'Confidentialité', en:'Privacy', de:'Datenschutz', pt:'Privacidade' },
                  { to:'/cookies', fr:'Cookies', en:'Cookies', de:'Cookies', pt:'Cookies' },
                ].map(({ to, fr, en, de, pt }) => {
                  const label = l === 'fr' ? fr : l === 'en' ? en : l === 'de' ? de : l === 'pt' ? pt : l === 'es' ? fr : l === 'it' ? en : fr;
                  return (
                    <Link key={to} to={to} style={{ display:'block', fontSize:14, color:'var(--text-3)', textDecoration:'none', marginBottom:8, transition:'color 0.2s' }}
                      onMouseOver={e=>{ e.currentTarget.style.color='var(--red)'; }}
                      onMouseOut={e=>{ e.currentTarget.style.color='var(--text-3)'; }}>
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
          <div style={{ height:1, background:'var(--border)', margin:'28px 0 20px' }} />
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
            <p style={{ fontSize:12, color:'var(--text-3)' }}>© {new Date().getFullYear()} Automatik Gebrauchtwagen. {t('copyright', l)}.</p>
            <p style={{ fontSize:12, color:'var(--text-3)' }}>{t('made_in', l)}</p>
          </div>
        </div>
      </footer>

      <CookieBanner lang={l} />
    </div>
  );
}