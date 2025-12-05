// Simple script to add PDFs to downloads via API
// Run this after the PDFs are uploaded to Cloudinary via admin panel

const downloads = [
  {
    title: 'Medicatie op school - Doktersvoorschrift',
    filename: '/documents/MIJN KIND MOET OP SCHOOL MEDICATIE GEBRUIKEN OP DOKTERSVOORSCHRIFT.pdf',
    originalName: 'MIJN KIND MOET OP SCHOOL MEDICATIE GEBRUIKEN OP DOKTERSVOORSCHRIFT.pdf'
  },
  {
    title: 'Aanvraagformulier zonder doktersvoorschrift',
    filename: '/documents/AANVRAAGFORMULIER ZONDER DOKTORSVOORSCHRIFT.pdf',
    originalName: 'AANVRAAGFORMULIER ZONDER DOKTORSVOORSCHRIFT.pdf'
  }
];

console.log('📋 Voeg deze downloads handmatig toe via het admin panel:');
console.log('   1. Ga naar https://schooltest1.vercel.app/#/admin');
console.log('   2. Log in');
console.log('   3. Ga naar "Downloads" tab');
console.log('   4. Klik "Document Toevoegen"');
console.log('   5. Upload de PDFs (ze staan in public/documents/)');
console.log('\nOf gebruik deze informatie:\n');

downloads.forEach((d, i) => {
  console.log(`${i + 1}. ${d.title}`);
  console.log(`   Bestand: ${d.originalName}`);
  console.log(`   Locatie: ${d.filename}\n`);
});

