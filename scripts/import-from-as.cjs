// Import des véhicules depuis le site AS Autohandel (as-autohandel.vercel.app)
// vers ce site (automatikgebrauchtwagen).
// ---------------------------------------------------------------------------
// Les deux sites partagent le même schéma Prisma : on copie donc les fiches
// telles quelles, en référençant les URLs d'images existantes (aucun upload).
//
// Anti-doublon (dans l'ordre) :
//   1. numéro de châssis (technicalData.chassis) identique
//   2. marque + modèle + kilométrage identiques
//   3. marque + modèle + année identiques, kilométrage à ±2 % (±1000 km)
//
// Usage :
//   node scripts/import-from-as.cjs --dry            # simulation
//   node scripts/import-from-as.cjs                  # import réel
//   node scripts/import-from-as.cjs --file=/tmp/as.json
//   node scripts/import-from-as.cjs --url=https://.../api/cars?limit=500
//   node scripts/import-from-as.cjs --update          # met à jour les fiches existantes

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const UPDATE = args.includes('--update');
const FILE = (args.find(a => a.startsWith('--file=')) || '').split('=')[1] || null;
const URL = (args.find(a => a.startsWith('--url=')) || '').split('=')[1]
  || 'https://as-autohandel.vercel.app/api/cars?limit=500';

const IMG_FIELDS = ['imageUrl', ...Array.from({ length: 19 }, (_, i) => `imageUrl${i + 2}`)];
const VALID_FUEL = new Set(['Essence', 'Diesel', 'Electrique', 'Hybride']);
const VALID_TRANS = new Set(['Manuelle', 'Automatique']);
const VALID_CAT = new Set(['Berline', 'SUV', 'Citadine', 'Break', 'Coupe', 'Monospace', 'Utilitaire', 'FourX4']);

const toDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
};
const norm = (s) => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
const chassisOf = (c) => (c.technicalData && c.technicalData.chassis) || null;

// Retourne la raison d'un doublon, ou null si c'est un nouveau véhicule.
function matchReason(src, dst) {
  const cs = chassisOf(src), cd = chassisOf(dst);
  if (cs && cd && cs === cd) return 'chassis';
  if (norm(src.make) === norm(dst.make) && norm(src.model) === norm(dst.model)
    && (src.mileage || 0) === (dst.mileage || 0)) return 'km exact';
  if (norm(src.make) === norm(dst.make) && norm(src.model) === norm(dst.model)
    && src.year === dst.year) {
    const a = src.mileage || 0, b = dst.mileage || 0;
    if (Math.abs(a - b) <= Math.max(1000, 0.02 * Math.max(a, b))) return 'km ≈';
  }
  return null;
}

async function loadCars() {
  if (FILE) {
    const json = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    return Array.isArray(json) ? json : json.cars;
  }
  console.log(`🌐 Lecture de la source : ${URL}`);
  const res = await fetch(URL);
  if (!res.ok) throw new Error(`Source HTTP ${res.status}`);
  const data = await res.json();
  return data.cars || [];
}

// Construit le payload Prisma à partir d'une fiche source.
function toCarData(c) {
  const data = {
    make: c.make,
    model: c.model,
    year: c.year,
    price: c.price,
    description: c.description ?? null,
    fuelType: VALID_FUEL.has(c.fuelType) ? c.fuelType : 'Essence',
    transmission: VALID_TRANS.has(c.transmission) ? c.transmission : 'Automatique',
    mileage: c.mileage ?? 0,
    color: c.color ?? null,
    power: c.power ?? null,
    category: VALID_CAT.has(c.category) ? c.category : 'Berline',
    minSalary: c.minSalary ?? null,
    monthlyPayment: c.monthlyPayment ?? null,
    featured: !!c.featured,
    promotional: !!c.promotional,
    isActive: c.isActive !== false,
    previousOwners: c.previousOwners ?? null,
    accidentFree: !!c.accidentFree,
    serviceHistory: !!c.serviceHistory,
    firstRegistration: toDate(c.firstRegistration),
    lastInspection: toDate(c.lastInspection),
    historyNotes: c.historyNotes ?? null,
    technicalData: c.technicalData ?? undefined,
  };
  for (const f of IMG_FIELDS) data[f] = c[f] ?? null;
  return data;
}

async function main() {
  const cars = await loadCars();
  console.log(`📦 ${cars.length} véhicule(s) en source${DRY ? '  [DRY-RUN]' : ''}${UPDATE ? '  [UPDATE]' : ''}\n`);

  const existing = await prisma.car.findMany({
    select: { id: true, make: true, model: true, year: true, mileage: true, technicalData: true },
    orderBy: { id: 'asc' },
  });
  console.log(`🗄️  ${existing.length} véhicule(s) déjà en base\n`);

  let created = 0, updated = 0, skipped = 0, failed = 0;
  const problems = [];

  for (const c of cars) {
    const hit = existing.find((d) => matchReason(c, d));
    const label = `${c.make} ${c.model} (${c.year}, ${c.mileage} km)`;

    if (hit && !UPDATE) {
      skipped++;
      console.log(`= déjà présent (id ${hit.id}) : ${label}`);
      continue;
    }

    const data = toCarData(c);
    const nimg = IMG_FIELDS.filter((f) => data[f]).length;

    if (DRY) {
      if (hit) { updated++; console.log(`~ mettrait à jour (id ${hit.id}) : ${label}`); }
      else { created++; console.log(`+ créerait : ${label} — ${c.price} € — ${nimg} photo(s)`); }
      continue;
    }

    try {
      if (hit) {
        await prisma.car.update({ where: { id: hit.id }, data });
        updated++;
        console.log(`✓ mis à jour (id ${hit.id}) : ${label}`);
      } else {
        const car = await prisma.car.create({ data });
        created++;
        console.log(`✓ créé (id ${car.id}) : ${label} — ${c.price} € — ${nimg} photo(s)`);
      }
    } catch (e) {
      failed++;
      problems.push(`${label} : ${e.message}`);
      console.log(`✗ échec : ${label} — ${e.message}`);
    }
  }

  console.log('\n' + '─'.repeat(64));
  console.log(`✓ ${created} créé(s) · ${updated} mis à jour · ${skipped} ignoré(s) · ${failed} échec(s)`);
  if (problems.length) {
    console.log('\n⚠ Problèmes :');
    problems.slice(0, 40).forEach((p) => console.log(`   - ${p}`));
  }
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
