const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

function pmt(price, months = 60, rate = 0.06) {
  const r = rate / 12;
  return Math.round((price * r * Math.pow(1+r, months)) / (Math.pow(1+r, months) - 1));
}

async function main() {
  console.log('🌱 Seeding Automatik Gebrauchtwagen...');

  // Admin
  const adminPwd = await bcrypt.hash('password', 12);
  await prisma.user.upsert({
    where: { email: 'kontakt@automatikgebrauchtwagen.com' },
    update: {},
    create: {
      username: 'admin', email: 'kontakt@automatikgebrauchtwagen.com',
      password: adminPwd, firstName: 'Admin', lastName: 'Automatik',
      role: 'ADMIN', emailVerified: true,
    },
  });

  // Demo client
  const clientPwd = await bcrypt.hash('password', 12);
  await prisma.user.upsert({
    where: { email: 'client@automatikgebrauchtwagen.com' },
    update: {},
    create: {
      username: 'max_mustermann', email: 'client@automatikgebrauchtwagen.com',
      password: clientPwd, firstName: 'Max', lastName: 'Mustermann',
      phone: '+49 157 000 000 00', monthlySalary: 3500, role: 'CLIENT', emailVerified: true,
    },
  });

  // 10 cars
  const cars = [
    { make:'Toyota',        model:'Camry',        year:2024, price:34900, fuelType:'Hybride',    transmission:'Automatique', mileage:0,     color:'Blanc Nacré',    power:218, category:'Berline', minSalary:2800, featured:true,  imageUrl:'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80', imageUrl2:'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80', imageUrl3:'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80', description:'La Toyota Camry 2024 incarne l\'excellence japonaise. Hybride performant, confort supérieur et fiabilité légendaire.' },
    { make:'Mercedes-Benz', model:'C 200',         year:2024, price:52900, fuelType:'Essence',    transmission:'Automatique', mileage:0,     color:'Noir Obsidienne',power:204, category:'Berline', minSalary:4000, featured:true,  imageUrl:'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80', imageUrl2:'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&q=80', imageUrl3:'https://images.unsplash.com/photo-1606220838315-056192d5e927?w=800&q=80', description:'La Mercedes C200 2024 — luxe allemand par excellence. MBUX, sièges cuir, technologie de pointe.' },
    { make:'BMW',           model:'X5 xDrive50e',  year:2024, price:89900, fuelType:'Hybride',    transmission:'Automatique', mileage:0,     color:'Gris Sophisto',  power:394, category:'SUV',    minSalary:6500, featured:true,  imageUrl:'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80', imageUrl2:'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&q=80', imageUrl3:'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&q=80', description:'Le BMW X5 2024 — le SUV de référence. Plug-in hybrid, 394 ch, suspension pneumatique.' },
    { make:'Tesla',         model:'Model 3',       year:2024, price:42990, fuelType:'Electrique', transmission:'Automatique', mileage:0,     color:'Rouge Multicoat', power:358, category:'Berline', minSalary:3200, featured:true,  imageUrl:'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80', imageUrl2:'https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=800&q=80', imageUrl3:'https://images.unsplash.com/photo-1562141961-b8e55bda35ac?w=800&q=80', description:'Tesla Model 3 2024 — 600+ km d\'autonomie, Autopilot, écran 15,4". L\'avenir de la mobilité.' },
    { make:'Volkswagen',    model:'Golf GTI',      year:2024, price:38500, fuelType:'Essence',    transmission:'Manuelle',    mileage:0,     color:'Tornadorot',     power:265, category:'Citadine',minSalary:2900, featured:false, imageUrl:'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80', imageUrl2:'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80', imageUrl3:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80', description:'Le VW Golf GTI 2024 — la légende continue. 265 ch, châssis sport, technologie dernière génération.' },
    { make:'Audi',          model:'A4 40 TFSI',    year:2023, price:47900, fuelType:'Essence',    transmission:'Automatique', mileage:8500,  color:'Gris Nardo',     power:204, category:'Berline', minSalary:3600, featured:true,  imageUrl:'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80', imageUrl2:'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&q=80', imageUrl3:'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80', description:'Audi A4 2023 — Quattro, Virtual Cockpit Plus, S Line. Dynamique de conduite sportive sans compromis.' },
    { make:'Hyundai',       model:'Tucson',        year:2023, price:32900, fuelType:'Hybride',    transmission:'Automatique', mileage:12000, color:'Aqua Blue',      power:230, category:'SUV',    minSalary:2500, featured:false, imageUrl:'https://images.unsplash.com/photo-1616788494672-ec7ca25fdda9?w=800&q=80', imageUrl2:'https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=800&q=80', imageUrl3:'https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=800&q=80', description:'Hyundai Tucson 2023 — design avant-gardiste, hybride intelligent. Spacieux et high-tech.' },
    { make:'Peugeot',       model:'3008 GT',       year:2023, price:41500, fuelType:'Hybride',    transmission:'Automatique', mileage:5000,  color:'Beige Sable',    power:300, category:'SUV',    minSalary:3100, featured:false, imageUrl:'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&q=80', imageUrl2:'https://images.unsplash.com/photo-1526726538690-5cbf956ae2fd?w=800&q=80', imageUrl3:'https://images.unsplash.com/photo-1504215680853-026ed2a45def?w=800&q=80', description:'Peugeot 3008 GT 2023 — élu Voiture de l\'Année. i-Cockpit, hybride rechargeable, 300 ch.' },
    { make:'Renault',       model:'Clio',          year:2024, price:19900, fuelType:'Essence',    transmission:'Manuelle',    mileage:0,     color:'Orange Valencia', power:100, category:'Citadine',minSalary:1800, featured:false, imageUrl:'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80', imageUrl2:'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80', imageUrl3:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80', description:'Renault Clio 2024 — citadine moderne avec Google intégré. Économique et connectée.' },
    { make:'Honda',         model:'HR-V e:HEV',    year:2024, price:28900, fuelType:'Hybride',    transmission:'Automatique', mileage:0,     color:'Gris Lunaire',   power:131, category:'SUV',    minSalary:2200, featured:false, imageUrl:'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&q=80', imageUrl2:'https://images.unsplash.com/photo-1551830820-330a71b99659?w=800&q=80', imageUrl3:'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80', description:'Honda HR-V e:HEV 2024 — full hybrid sans prise, Magic Seat breveté, Honda SENSING.' },
  ];

  for (const car of cars) {
    await prisma.car.create({
      data: { ...car, monthlyPayment: pmt(car.price * 0.75), isActive: true },
    });
  }

  // Default bank details (editable in admin)
  await prisma.bankInfo.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      iban: '',
      bic: '',
      beneficiary: 'AUTOMATIK GEBRAUCHTWAGEN',
      transferType: 'SEPA',
    },
  });

  console.log('✅ Admin:  kontakt@automatikgebrauchtwagen.com / password');
  console.log('✅ Client: client@automatikgebrauchtwagen.com / password');
  console.log('✅ 10 véhicules créés');
  console.log('🎉 Seeding terminé !');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
