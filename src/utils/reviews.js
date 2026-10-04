// ─── Shared Reviews Data ────────────────────────────────────────────────────
export const ALL_REVIEWS = [
  // ── Original 4 reviews ──
  {
    name: 'Marcus Hoffmann', avatar: 'MH', rating: 5, date: 'Janvier 2025',
    textFr: 'Excellent service ! Trouvé ma BMW idéale, financement au meilleur taux. Recommandé !',
    textEn: 'Excellent service! Found my ideal BMW, best financing rate. Recommended!',
  },
  {
    name: 'Sophie Becker', avatar: 'SB', rating: 5, date: 'Février 2025',
    textFr: 'Super concessionnaire ! Très professionnel, large choix, équipe très disponible.',
    textEn: 'Great dealership! Very professional, wide choice, very helpful team.',
  },
  {
    name: 'Thomas Reinhardt', avatar: 'TR', rating: 5, date: 'Mars 2025',
    textFr: 'Vendeur honnête et fiable ! Voiture de qualité, prix juste, livraison rapide.',
    textEn: 'Honest and reliable seller! Quality car, fair price, fast delivery.',
  },
  {
    name: 'Anna Müller', avatar: 'AM', rating: 5, date: 'Avril 2025',
    textFr: 'Équipe très compétente ! Ont trouvé la Volkswagen parfaite pour moi.',
    textEn: 'Very competent team! Found the perfect Volkswagen for me.',
  },

  // ── 26 additional reviews ──
  {
    name: 'Luca Rossi', avatar: 'LR', rating: 5, date: 'Janvier 2024',
    textFr: 'Incroyable expérience ! J\'ai acheté une Audi A4 et tout s\'est passé parfaitement. Livraison à domicile impeccable.',
    textEn: 'Incredible experience! I bought an Audi A4 and everything went perfectly. Impeccable home delivery.',
  },
  {
    name: 'Camille Dupont', avatar: 'CD', rating: 5, date: 'Janvier 2024',
    textFr: 'Équipe formidable, prix compétitifs. Ma Renault Clio est arrivée en parfait état, je suis ravie !',
    textEn: 'Fantastic team, competitive prices. My Renault Clio arrived in perfect condition, I\'m delighted!',
  },
  {
    name: 'Klaus Weber', avatar: 'KW', rating: 4, date: 'Février 2024',
    textFr: 'Bonne expérience dans l\'ensemble. Le financement a été arrangé rapidement pour ma Mercedes Classe C.',
    textEn: 'Good experience overall. The financing was arranged quickly for my Mercedes Class C.',
  },
  {
    name: 'Isabel García', avatar: 'IG', rating: 5, date: 'Février 2024',
    textFr: 'Service impeccable du début à la fin ! La Toyota Yaris correspond parfaitement à mes attentes.',
    textEn: 'Impeccable service from start to finish! The Toyota Yaris perfectly matches my expectations.',
  },
  {
    name: 'Pierre Martin', avatar: 'PM', rating: 5, date: 'Mars 2024',
    textFr: 'J\'ai été impressionné par le professionnalisme de l\'équipe. Peugeot 308 livrée en 5 jours !',
    textEn: 'I was impressed by the team\'s professionalism. Peugeot 308 delivered in 5 days!',
  },
  {
    name: 'Elena Schmidt', avatar: 'ES', rating: 5, date: 'Mars 2024',
    textFr: 'Excellent rapport qualité-prix sur mon Opel Corsa. Tout le dossier administratif géré par l\'équipe.',
    textEn: 'Excellent value for money on my Opel Corsa. All administrative paperwork handled by the team.',
  },
  {
    name: 'Marco Ferrari', avatar: 'MF', rating: 4, date: 'Avril 2024',
    textFr: 'Très satisfait de ma Ford Focus. Bonne communication tout au long du processus d\'achat.',
    textEn: 'Very satisfied with my Ford Focus. Good communication throughout the buying process.',
  },
  {
    name: 'Amélie Bernard', avatar: 'AB', rating: 5, date: 'Avril 2024',
    textFr: 'Automatik m\'a aidée à trouver le financement idéal pour ma Citroën C3. Service client 5 étoiles !',
    textEn: 'Automatik helped me find the ideal financing for my Citroën C3. 5-star customer service!',
  },
  {
    name: 'Hans-Peter Braun', avatar: 'HB', rating: 5, date: 'Mai 2024',
    textFr: 'Confiance totale dans cette équipe. J\'ai récupéré mon BMW Série 3 en parfait état, aucune mauvaise surprise.',
    textEn: 'Total trust in this team. I picked up my BMW Series 3 in perfect condition, no unpleasant surprises.',
  },
  {
    name: 'Sofia Lombardi', avatar: 'SL', rating: 5, date: 'Mai 2024',
    textFr: 'Processus simple et rapide. La Mercedes GLC commandée un lundi, livrée le vendredi. Impressionnant !',
    textEn: 'Simple and quick process. The Mercedes GLC ordered on Monday, delivered on Friday. Impressive!',
  },
  {
    name: 'Antoine Lefevre', avatar: 'AL', rating: 5, date: 'Juin 2024',
    textFr: 'Des experts qui connaissent vraiment leur métier. Ma Volkswagen Passat est parfaite, prix négocié avec soin.',
    textEn: 'Experts who truly know their trade. My Volkswagen Passat is perfect, price carefully negotiated.',
  },
  {
    name: 'Petra Zimmermann', avatar: 'PZ', rating: 4, date: 'Juin 2024',
    textFr: 'Bonne sélection de véhicules d\'occasion certifiés. Audi Q3 en excellent état, satisfaite de mon achat.',
    textEn: 'Good selection of certified used vehicles. Audi Q3 in excellent condition, satisfied with my purchase.',
  },
  {
    name: 'Carlos Fernández', avatar: 'CF', rating: 5, date: 'Juillet 2024',
    textFr: 'Je recommande vivement ! L\'équipe a su trouver exactement la Renault Mégane que je cherchais depuis des mois.',
    textEn: 'Highly recommended! The team managed to find exactly the Renault Mégane I had been looking for months.',
  },
  {
    name: 'Laura Vogel', avatar: 'LV', rating: 5, date: 'Juillet 2024',
    textFr: 'Superbe service ! Ma Peugeot 2008 est arrivée avec un plein d\'essence et toute la documentation. Parfait !',
    textEn: 'Superb service! My Peugeot 2008 arrived with a full tank of petrol and all documentation. Perfect!',
  },
  {
    name: 'Giovanni Ricci', avatar: 'GR', rating: 5, date: 'Août 2024',
    textFr: 'Excellent choix de véhicules Toyota. J\'ai opté pour une Toyota Corolla Hybrid, très bon conseil de leur part.',
    textEn: 'Excellent choice of Toyota vehicles. I opted for a Toyota Corolla Hybrid, very good advice from them.',
  },
  {
    name: 'Nathalie Rousseau', avatar: 'NR', rating: 5, date: 'Août 2024',
    textFr: 'Je suis cliente depuis 2 ans et je reviens toujours chez Automatik. Fiabilité et sérieux au rendez-vous.',
    textEn: 'I have been a customer for 2 years and I always come back to Automatik. Reliability and professionalism guaranteed.',
  },
  {
    name: 'Jürgen Fischer', avatar: 'JF', rating: 4, date: 'Septembre 2024',
    textFr: 'Bonne expérience d\'achat pour mon Opel Astra. Le financement proposé était compétitif, je recommande.',
    textEn: 'Good buying experience for my Opel Astra. The financing offered was competitive, I recommend.',
  },
  {
    name: 'Marie-Claire Dubois', avatar: 'MD', rating: 5, date: 'Septembre 2024',
    textFr: 'Accompagnement exemplaire de A à Z ! Ma Ford Kuga est arrivée vérifiée, propre et prête à rouler.',
    textEn: 'Exemplary support from A to Z! My Ford Kuga arrived checked, clean and ready to drive.',
  },
  {
    name: 'Alejandro Rodríguez', avatar: 'AR', rating: 5, date: 'Octobre 2024',
    textFr: 'Meilleure expérience d\'achat automobile de ma vie. L\'Audi A6 est superbe et le prix était imbattable.',
    textEn: 'Best car buying experience of my life. The Audi A6 is superb and the price was unbeatable.',
  },
  {
    name: 'Ingrid Hansen', avatar: 'IH', rating: 5, date: 'Octobre 2024',
    textFr: 'Très bonne communication, réponse rapide à chaque question. Citroën C5 reçue en parfait état.',
    textEn: 'Very good communication, quick response to every question. Citroën C5 received in perfect condition.',
  },
  {
    name: 'François Morel', avatar: 'FM', rating: 5, date: 'Novembre 2024',
    textFr: 'Équipe réactive et transparente. Pas de frais cachés, tout a été expliqué clairement pour ma VW Tiguan.',
    textEn: 'Responsive and transparent team. No hidden fees, everything was clearly explained for my VW Tiguan.',
  },
  {
    name: 'Valentina Conti', avatar: 'VC', rating: 5, date: 'Novembre 2024',
    textFr: 'Livraison express en 48h pour ma Mercedes Classe A. L\'équipe est incroyablement efficace, bravo !',
    textEn: 'Express delivery in 48h for my Mercedes Class A. The team is incredibly efficient, bravo!',
  },
  {
    name: 'Dieter Kohl', avatar: 'DK', rating: 4, date: 'Décembre 2024',
    textFr: 'Satisfait de mon achat BMW X1. Processus clair et sans complication. Je reviendrai pour mon prochain achat.',
    textEn: 'Satisfied with my BMW X1 purchase. Clear and uncomplicated process. I will return for my next purchase.',
  },
  {
    name: 'Chloé Laurent', avatar: 'CL', rating: 5, date: 'Décembre 2024',
    textFr: 'Excellente équipe ! Ils ont su trouver le Renault Captur exact que je voulais et au meilleur prix du marché.',
    textEn: 'Excellent team! They found the exact Renault Captur I wanted at the best market price.',
  },
  {
    name: 'Roberto Esposito', avatar: 'RE', rating: 5, date: 'Janvier 2025',
    textFr: 'Automatik a dépassé toutes mes attentes. La Toyota RAV4 est parfaite et le service était irréprochable.',
    textEn: 'Automatik exceeded all my expectations. The Toyota RAV4 is perfect and the service was flawless.',
  },
  {
    name: 'Brigitte Schulz', avatar: 'BS', rating: 5, date: 'Février 2025',
    textFr: 'Impressionnée par la qualité du service. Ma Volkswagen Golf est arrivée avec un compte-rendu d\'inspection complet.',
    textEn: 'Impressed by the quality of service. My Volkswagen Golf arrived with a complete inspection report.',
  },
];
