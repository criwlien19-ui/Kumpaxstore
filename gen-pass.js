const readline = require('readline');
const bcrypt = require('bcryptjs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n======================================');
console.log('🔒 GÉNÉRATEUR DE MOT DE PASSE SÉCURISÉ');
console.log('======================================\n');

rl.question('Entrez le mot de passe que vous souhaitez utiliser pour l\'Admin : ', async (password) => {
  if (!password || password.trim() === '') {
    console.log('Erreur : Le mot de passe ne peut pas être vide.');
    rl.close();
    return;
  }

  try {
    console.log('\nGénération de l\'empreinte sécurisée...');
    
    // Génère le hash avec un "salt" de 12 (très sécurisé)
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);
    
    console.log('\n✅ SUCCÈS ! Voici l\'empreinte de votre mot de passe.\n');
    console.log('Copiez EXACTEMENT la ligne ci-dessous dans les Environment Variables de Vercel (ou dans votre fichier .env pour tester en local) :\n');
    
    console.log('\x1b[32mADMIN_PASS_HASH=' + hash + '\x1b[0m\n');
    
    console.log('⚠️  N\'oubliez pas de supprimer ADMIN_PASS_PLAIN de Vercel !\n');
  } catch (error) {
    console.log('Une erreur s\'est produite', error);
  } finally {
    rl.close();
  }
});
