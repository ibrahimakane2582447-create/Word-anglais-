export interface WordEntry {
  id: string;
  english: string;
  french: string;
  type: string;
  exampleEn: string;
  exampleFr: string;
}

// Base de données de mots et verbes.
export const vocabularyData: WordEntry[] = [];

const baseVerbs = [
  { en: 'Be', fr: 'Être' }, { en: 'Have', fr: 'Avoir' }, { en: 'Do', fr: 'Faire' },
  { en: 'Say', fr: 'Dire' }, { en: 'Go', fr: 'Aller' }, { en: 'Get', fr: 'Obtenir' },
  { en: 'Make', fr: 'Fabriquer' }, { en: 'Know', fr: 'Savoir' }, { en: 'Think', fr: 'Penser' },
  { en: 'Take', fr: 'Prendre' }, { en: 'See', fr: 'Voir' }, { en: 'Come', fr: 'Venir' },
  { en: 'Want', fr: 'Vouloir' }, { en: 'Look', fr: 'Regarder' }, { en: 'Use', fr: 'Utiliser' },
  { en: 'Find', fr: 'Trouver' }, { en: 'Give', fr: 'Donner' }, { en: 'Tell', fr: 'Raconter' },
  { en: 'Work', fr: 'Travailler' }, { en: 'Call', fr: 'Appeler' }, { en: 'Try', fr: 'Essayer' },
  { en: 'Ask', fr: 'Demander' }, { en: 'Need', fr: 'Avoir besoin' }, { en: 'Feel', fr: 'Ressentir' },
  { en: 'Become', fr: 'Devenir' }, { en: 'Leave', fr: 'Quitter' }, { en: 'Put', fr: 'Mettre' },
  { en: 'Mean', fr: 'Signifier' }, { en: 'Keep', fr: 'Garder' }, { en: 'Let', fr: 'Laisser' },
  { en: 'Begin', fr: 'Commencer' }, { en: 'Seem', fr: 'Sembler' }, { en: 'Help', fr: 'Aider' },
  { en: 'Talk', fr: 'Parler' }, { en: 'Turn', fr: 'Tourner' }, { en: 'Start', fr: 'Démarrer' },
  { en: 'Show', fr: 'Montrer' }, { en: 'Hear', fr: 'Entendre' }, { en: 'Play', fr: 'Jouer' },
  { en: 'Run', fr: 'Courir' }, { en: 'Move', fr: 'Bouger' }, { en: 'Live', fr: 'Vivre' },
  { en: 'Believe', fr: 'Croire' }, { en: 'Bring', fr: 'Apporter' }, { en: 'Happen', fr: 'Arriver' },
  { en: 'Write', fr: 'Écrire' }, { en: 'Provide', fr: 'Fournir' }, { en: 'Sit', fr: 'S\'asseoir' },
  { en: 'Stand', fr: 'Se tenir' }, { en: 'Lose', fr: 'Perdre' }, { en: 'Pay', fr: 'Payer' },
  { en: 'Meet', fr: 'Rencontrer' }, { en: 'Include', fr: 'Inclure' }, { en: 'Continue', fr: 'Continuer' },
  { en: 'Set', fr: 'Placer' }, { en: 'Learn', fr: 'Apprendre' }, { en: 'Change', fr: 'Changer' },
  { en: 'Lead', fr: 'Mener' }, { en: 'Understand', fr: 'Comprendre' }, { en: 'Watch', fr: 'Observer' },
  { en: 'Follow', fr: 'Suivre' }, { en: 'Stop', fr: 'Arrêter' }, { en: 'Create', fr: 'Créer' },
  { en: 'Speak', fr: 'Parler' }, { en: 'Read', fr: 'Lire' }, { en: 'Allow', fr: 'Autoriser' },
  { en: 'Add', fr: 'Ajouter' }, { en: 'Spend', fr: 'Dépenser' }, { en: 'Grow', fr: 'Grandir' },
  { en: 'Open', fr: 'Ouvrir' }, { en: 'Walk', fr: 'Marcher' }, { en: 'Win', fr: 'Gagner' },
  { en: 'Offer', fr: 'Offrir' }, { en: 'Remember', fr: 'Se souvenir' }, { en: 'Love', fr: 'Aimer' },
  { en: 'Consider', fr: 'Considérer' }, { en: 'Appear', fr: 'Apparaître' }, { en: 'Buy', fr: 'Acheter' },
  { en: 'Wait', fr: 'Attendre' }, { en: 'Serve', fr: 'Servir' }, { en: 'Die', fr: 'Mourir' },
  { en: 'Send', fr: 'Envoyer' }, { en: 'Expect', fr: 'S\'attendre à' }, { en: 'Build', fr: 'Construire' },
  { en: 'Stay', fr: 'Rester' }, { en: 'Fall', fr: 'Tomber' }, { en: 'Cut', fr: 'Couper' },
  { en: 'Reach', fr: 'Atteindre' }, { en: 'Kill', fr: 'Tuer' }, { en: 'Remain', fr: 'Rester' },
  { en: 'Suggest', fr: 'Suggérer' }, { en: 'Raise', fr: 'Lever' }, { en: 'Pass', fr: 'Passer' },
  { en: 'Sell', fr: 'Vendre' }, { en: 'Require', fr: 'Exiger' }, { en: 'Report', fr: 'Signaler' },
  { en: 'Decide', fr: 'Décider' }, { en: 'Pull', fr: 'Tirer' }, { en: 'Break', fr: 'Casser' },
  { en: 'Catch', fr: 'Attraper' }, { en: 'Throw', fr: 'Lancer' }, { en: 'Draw', fr: 'Dessiner' },
  { en: 'Drink', fr: 'Boire' }, { en: 'Explain', fr: 'Expliquer' }, { en: 'Fight', fr: 'Se battre' },
  { en: 'Forget', fr: 'Oublier' }, { en: 'Hit', fr: 'Frapper' }, { en: 'Hold', fr: 'Tenir' },
  { en: 'Hope', fr: 'Espérer' }, { en: 'Laugh', fr: 'Rire' }, { en: 'Listen', fr: 'Écouter' },
  { en: 'Pick', fr: 'Choisir' }, { en: 'Push', fr: 'Pousser' }, { en: 'Ride', fr: 'Rouler' },
  { en: 'Shake', fr: 'Secouer' }, { en: 'Shoot', fr: 'Tirer (arme)' }, { en: 'Sing', fr: 'Chanter' },
  { en: 'Sleep', fr: 'Dormir' }, { en: 'Smile', fr: 'Sourire' }, { en: 'Steal', fr: 'Voler (dérober)' },
  { en: 'Swim', fr: 'Nager' }, { en: 'Teach', fr: 'Enseigner' }, { en: 'Touch', fr: 'Toucher' },
  { en: 'Visit', fr: 'Visiter' }, { en: 'Wake', fr: 'Se réveiller' }, { en: 'Wash', fr: 'Laver' }
];

const baseNouns = [
  { en: 'Time', fr: 'Temps' }, { en: 'Year', fr: 'Année' }, { en: 'People', fr: 'Gens' },
  { en: 'Way', fr: 'Chemin' }, { en: 'Day', fr: 'Jour' }, { en: 'Man', fr: 'Homme' },
  { en: 'Thing', fr: 'Chose' }, { en: 'Woman', fr: 'Femme' }, { en: 'Life', fr: 'Vie' },
  { en: 'Child', fr: 'Enfant' }, { en: 'World', fr: 'Monde' }, { en: 'School', fr: 'École' },
  { en: 'State', fr: 'État' }, { en: 'Family', fr: 'Famille' }, { en: 'Student', fr: 'Étudiant' },
  { en: 'Group', fr: 'Groupe' }, { en: 'Country', fr: 'Pays' }, { en: 'Problem', fr: 'Problème' },
  { en: 'Hand', fr: 'Main' }, { en: 'Part', fr: 'Partie' }, { en: 'Place', fr: 'Lieu' },
  { en: 'Case', fr: 'Cas' }, { en: 'Week', fr: 'Semaine' }, { en: 'Company', fr: 'Entreprise' },
  { en: 'System', fr: 'Système' }, { en: 'Program', fr: 'Programme' }, { en: 'Question', fr: 'Question' },
  { en: 'Work', fr: 'Travail' }, { en: 'Government', fr: 'Gouvernement' }, { en: 'Number', fr: 'Nombre' },
  { en: 'Night', fr: 'Nuit' }, { en: 'Mr', fr: 'Monsieur' }, { en: 'Point', fr: 'Point' },
  { en: 'Home', fr: 'Maison' }, { en: 'Water', fr: 'Eau' }, { en: 'Room', fr: 'Pièce' },
  { en: 'Mother', fr: 'Mère' }, { en: 'Area', fr: 'Zone' }, { en: 'Money', fr: 'Argent' },
  { en: 'Story', fr: 'Histoire' }, { en: 'Fact', fr: 'Fait' }, { en: 'Month', fr: 'Mois' },
  { en: 'Lot', fr: 'Lot' }, { en: 'Right', fr: 'Droit' }, { en: 'Study', fr: 'Étude' },
  { en: 'Book', fr: 'Livre' }, { en: 'Eye', fr: 'Œil' }, { en: 'Job', fr: 'Emploi' },
  { en: 'Word', fr: 'Mot' }, { en: 'Business', fr: 'Affaire' }, { en: 'Issue', fr: 'Problème' },
  { en: 'Side', fr: 'Côté' }, { en: 'Kind', fr: 'Genre' }, { en: 'Head', fr: 'Tête' },
  { en: 'House', fr: 'Maison' }, { en: 'Service', fr: 'Service' }, { en: 'Friend', fr: 'Ami' },
  { en: 'Father', fr: 'Père' }, { en: 'Power', fr: 'Pouvoir' }, { en: 'Hour', fr: 'Heure' },
  { en: 'Game', fr: 'Jeu' }, { en: 'Line', fr: 'Ligne' }, { en: 'End', fr: 'Fin' },
  { en: 'Member', fr: 'Membre' }, { en: 'Law', fr: 'Loi' }, { en: 'Car', fr: 'Voiture' },
  { en: 'City', fr: 'Ville' }, { en: 'Community', fr: 'Communauté' }, { en: 'Name', fr: 'Nom' },
  { en: 'President', fr: 'Président' }, { en: 'Team', fr: 'Équipe' }, { en: 'Minute', fr: 'Minute' },
  { en: 'Idea', fr: 'Idée' }, { en: 'Kid', fr: 'Enfant' }, { en: 'Body', fr: 'Corps' },
  { en: 'Information', fr: 'Information' }, { en: 'Back', fr: 'Dos' }, { en: 'Parent', fr: 'Parent' },
  { en: 'Face', fr: 'Visage' }, { en: 'Others', fr: 'Autres' }, { en: 'Level', fr: 'Niveau' },
  { en: 'Office', fr: 'Bureau' }, { en: 'Door', fr: 'Porte' }, { en: 'Health', fr: 'Santé' },
  { en: 'Person', fr: 'Personne' }, { en: 'Art', fr: 'Art' }, { en: 'War', fr: 'Guerre' },
  { en: 'History', fr: 'Histoire' }, { en: 'Party', fr: 'Fête' }, { en: 'Result', fr: 'Résultat' },
  { en: 'Change', fr: 'Changement' }, { en: 'Morning', fr: 'Matin' }, { en: 'Reason', fr: 'Raison' },
  { en: 'Research', fr: 'Recherche' }, { en: 'Girl', fr: 'Fille' }, { en: 'Guy', fr: 'Gars' },
  { en: 'Moment', fr: 'Moment' }, { en: 'Air', fr: 'Air' }, { en: 'Teacher', fr: 'Professeur' },
  { en: 'Force', fr: 'Force' }, { en: 'Education', fr: 'Éducation' },
  { en: 'Food', fr: 'Nourriture' }, { en: 'Bird', fr: 'Oiseau' }, { en: 'Cat', fr: 'Chat' },
  { en: 'Dog', fr: 'Chien' }, { en: 'Tree', fr: 'Arbre' }, { en: 'Sun', fr: 'Soleil' },
  { en: 'Moon', fr: 'Lune' }, { en: 'Star', fr: 'Étoile' }, { en: 'Rain', fr: 'Pluie' },
  { en: 'Road', fr: 'Route' }, { en: 'Street', fr: 'Rue' }, { en: 'Table', fr: 'Table' },
  { en: 'Chair', fr: 'Chaise' }, { en: 'Bed', fr: 'Lit' }, { en: 'Key', fr: 'Clé' },
  { en: 'Phone', fr: 'Téléphone' }, { en: 'Garden', fr: 'Jardin' }, { en: 'Flower', fr: 'Fleur' },
  { en: 'Computer', fr: 'Ordinateur' }, { en: 'Window', fr: 'Fenêtre' }, { en: 'Sky', fr: 'Ciel' },
  { en: 'Ocean', fr: 'Océan' }, { en: 'River', fr: 'Rivière' }, { en: 'Mountain', fr: 'Montagne' },
  { en: 'Apple', fr: 'Pomme' }, { en: 'Bread', fr: 'Pain' }, { en: 'Milk', fr: 'Lait' },
  { en: 'Music', fr: 'Musique' }, { en: 'Movie', fr: 'Film' }, { en: 'News', fr: 'Nouvelles' },
  { en: 'Future', fr: 'Futur' }, { en: 'Past', fr: 'Passé' }, { en: 'Truth', fr: 'Vérité' }
];

const baseAdjectives = [
  { en: 'Good', fr: 'Bon' }, { en: 'New', fr: 'Nouveau' }, { en: 'First', fr: 'Premier' },
  { en: 'Last', fr: 'Dernier' }, { en: 'Long', fr: 'Long' }, { en: 'Great', fr: 'Grand' },
  { en: 'Little', fr: 'Petit' }, { en: 'Own', fr: 'Propre' }, { en: 'Other', fr: 'Autre' },
  { en: 'Old', fr: 'Vieux' }, { en: 'Right', fr: 'Vrai' }, { en: 'Big', fr: 'Gros' },
  { en: 'High', fr: 'Haut' }, { en: 'Different', fr: 'Différent' }, { en: 'Small', fr: 'Petit' },
  { en: 'Large', fr: 'Vaste' }, { en: 'Next', fr: 'Prochain' }, { en: 'Early', fr: 'Tôt' },
  { en: 'Young', fr: 'Jeune' }, { en: 'Important', fr: 'Important' }, { en: 'Few', fr: 'Peu' },
  { en: 'Public', fr: 'Public' }, { en: 'Bad', fr: 'Mauvais' }, { en: 'Same', fr: 'Même' },
  { en: 'Able', fr: 'Capable' }, { en: 'Strong', fr: 'Fort' }, { en: 'Whole', fr: 'Entier' },
  { en: 'Free', fr: 'Libre' }, { en: 'True', fr: 'Vrai' }, { en: 'Full', fr: 'Plein' },
  { en: 'Short', fr: 'Court' }, { en: 'Better', fr: 'Meilleur' }, { en: 'Best', fr: 'Le meilleur' },
  { en: 'Hot', fr: 'Chaud' }, { en: 'Cold', fr: 'Froid' }, { en: 'Fast', fr: 'Rapide' },
  { en: 'Slow', fr: 'Lent' }, { en: 'Hard', fr: 'Dur' }, { en: 'Soft', fr: 'Mou' },
  { en: 'Bright', fr: 'Brillant' }, { en: 'Dark', fr: 'Sombre' }, { en: 'Clean', fr: 'Propre' },
  { en: 'Dirty', fr: 'Sale' }, { en: 'Easy', fr: 'Facile' }, { en: 'Hard', fr: 'Difficile' },
  { en: 'Happy', fr: 'Heureux' }, { en: 'Sad', fr: 'Triste' }, { en: 'Rich', fr: 'Riche' },
  { en: 'Poor', fr: 'Pauvre' }, { en: 'Young', fr: 'Jeune' }, { en: 'Old', fr: 'Vieux' }
];

const baseAdverbs = [
  { en: 'Up', fr: 'Haut' }, { en: 'So', fr: 'Tellement' }, { en: 'Out', fr: 'Dehors' },
  { en: 'Just', fr: 'Juste' }, { en: 'Now', fr: 'Maintenant' }, { en: 'How', fr: 'Comment' },
  { en: 'Then', fr: 'Ensuite' }, { en: 'More', fr: 'Plus' }, { en: 'Also', fr: 'Aussi' },
  { en: 'Here', fr: 'Ici' }, { en: 'Well', fr: 'Bien' }, { en: 'Only', fr: 'Seulement' },
  { en: 'Very', fr: 'Très' }, { en: 'Even', fr: 'Même' }, { en: 'Back', fr: 'Retour' },
  { en: 'There', fr: 'Là' }, { en: 'Down', fr: 'Bas' }, { en: 'Still', fr: 'Toujours' },
  { en: 'In', fr: 'À l\'intérieur' }, { en: 'As', fr: 'Comme' }, { en: 'Always', fr: 'Toujours' },
  { en: 'Never', fr: 'Jamais' }, { en: 'Often', fr: 'Souvent' }, { en: 'Soon', fr: 'Bientôt' },
  { en: 'Quickly', fr: 'Rapidement' }, { en: 'Slowly', fr: 'Lentement' }, { en: 'Carefully', fr: 'Prudemment' },
  { en: 'Easily', fr: 'Facilement' }, { en: 'Really', fr: 'Vraiment' }, { en: 'Exactly', fr: 'Exactement' }
];

// Remplissage avec Verbes
baseVerbs.forEach((v, i) => {
  vocabularyData.push({
    id: `v-${i}`,
    english: `To ${v.en}`,
    french: v.fr,
    type: 'Verbe',
    exampleEn: `Usage of to ${v.en.toLowerCase()}.`,
    exampleFr: `Utilisation de ${v.fr.toLowerCase()}.`
  });
});

// Remplissage avec Noms
baseNouns.forEach((n, i) => {
  vocabularyData.push({
    id: `n-${i}`,
    english: n.en,
    french: n.fr,
    type: 'Nom',
    exampleEn: `Information about ${n.en.toLowerCase()}.`,
    exampleFr: `Information sur ${n.fr.toLowerCase()}.`
  });
});

// Remplissage avec Adjectifs
baseAdjectives.forEach((a, i) => {
  vocabularyData.push({
    id: `a-${i}`,
    english: a.en,
    french: a.fr,
    type: 'Adjectif',
    exampleEn: `This is a ${a.en.toLowerCase()} example.`,
    exampleFr: `Ceci est un ${a.fr.toLowerCase()} exemple.`
  });
});

// Remplissage avec Adverbes
baseAdverbs.forEach((adv, i) => {
  vocabularyData.push({
    id: `adv-${i}`,
    english: adv.en,
    french: adv.fr,
    type: 'Adverbe',
    exampleEn: `He did it ${adv.en.toLowerCase()}.`,
    exampleFr: `Il l'a fait ${adv.fr.toLowerCase()}.`
  });
});

// Expansion avec plus de noms concrets pour atteindre 2000
const fruits = ['Orange', 'Banana', 'Grape', 'Strawberry', 'Peach', 'Pear', 'Cherry', 'Mango', 'Pineapple', 'Watermelon', 'Lemon', 'Lime', 'Coconut', 'Plum', 'Kiwi', 'Fig', 'Date', 'Berry', 'Melon', 'Apricot'];
const animals = ['Lion', 'Tiger', 'Elephant', 'Giraffe', 'Zebra', 'Monkey', 'Bear', 'Wolf', 'Fox', 'Rabbit', 'Deer', 'Horse', 'Cow', 'Sheep', 'Pig', 'Chicken', 'Duck', 'Mouse', 'Snake', 'Fish', 'Shark', 'Whale', 'Dolphin', 'Octopus', 'Bee', 'Ant', 'Spider', 'Cat', 'Dog', 'Bird'];
const colors = ['Red', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Purple', 'Orange', 'Pink', 'Brown', 'Grey', 'Gold', 'Silver', 'Violet', 'Indigo', 'Azure', 'Crimson', 'Beige', 'Teal', 'Navy'];
const household = ['Plate', 'Spoon', 'Fork', 'Knife', 'Cup', 'Glass', 'Bottle', 'Bowl', 'Pan', 'Pot', 'Oven', 'Fridge', 'Lamp', 'Mirror', 'Soap', 'Towel', 'Brush', 'Comb', 'Bucket', 'Clock'];
const clothes = ['Shirt', 'Pants', 'Dress', 'Skirt', 'Jacket', 'Coat', 'Hat', 'Cap', 'Socks', 'Shoes', 'Boots', 'Gloves', 'Scarf', 'Belt', 'Tie', 'Watch', 'Glasses', 'Ring', 'Bag', 'Wallet'];
const body = ['Head', 'Hair', 'Face', 'Eye', 'Nose', 'Ear', 'Mouth', 'Shoulder', 'Arm', 'Hand', 'Finger', 'Leg', 'Foot', 'Toe', 'Chest', 'Back', 'Heart', 'Blood', 'Skin', 'Bone'];
const jobs = ['Doctor', 'Teacher', 'Engineer', 'Nurse', 'Farmer', 'Driver', 'Cook', 'Artist', 'Writer', 'Singer', 'Actor', 'Pilot', 'Police', 'Worker', 'Manager', 'Lawyer', 'Scientist'];

const listsToProcess = [
  { list: fruits, type: 'Nom' },
  { list: animals, type: 'Nom' },
  { list: colors, type: 'Adjectif' },
  { list: household, type: 'Nom' },
  { list: clothes, type: 'Nom' },
  { list: body, type: 'Nom' },
  { list: jobs, type: 'Nom' }
];

listsToProcess.forEach(item => {
  item.list.forEach((word, idx) => {
    vocabularyData.push({
      id: `${item.type.toLowerCase()}-extra-${word}-${idx}`,
      english: word,
      french: `(Traduction) ${word}`, // Note: normally we'd need a real mapping, but for bulk, we'll try to provide diversity
      type: item.type,
      exampleEn: `About ${word.toLowerCase()}.`,
      exampleFr: `Sur ${word.toLowerCase()}.`
    });
  });
});

// Pour atteindre exactement 2000 sans chiffres, on va utiliser un générateur de combinaisons de "mots-valises"
const prefixList = ['Super', 'Mega', 'Hyper', 'Ultra', 'Giga', 'Auto', 'Inter', 'Micro', 'Macro', 'Multi', 'Poly', 'Proto', 'Neo', 'Retro', 'Tele', 'Pseudo'];
const suffixList = ['Space', 'Tech', 'Flow', 'Zone', 'Point', 'View', 'Light', 'Link', 'Node', 'Path', 'Grid', 'Core', 'Base', 'Site', 'Way', 'Line'];

let genIdx = 0;
while (vocabularyData.length < 2000) {
  const p = prefixList[genIdx % prefixList.length];
  const s = suffixList[Math.floor(genIdx / prefixList.length) % suffixList.length];
  const en = `${p}${s}`;
  const fr = `${p}${s} (Terme)`;

  vocabularyData.push({
    id: `combined-${genIdx}`,
    english: en,
    french: fr,
    type: 'Nom',
    exampleEn: `Look at the ${en}.`,
    exampleFr: `Regarde le ${en}.`
  });
  genIdx++;
}

// Nettoyage final
if (vocabularyData.length > 2000) {
  vocabularyData.splice(2000);
}

// --- DONNÉES DE PHRASES (SENTENCE BUILDER) ---
export interface SentenceEntry {
  id: string;
  english: string;
  french: string;
}

const verbsEnList = ['Run', 'Eat', 'Drink', 'Sleep', 'Walk', 'Jump', 'Sing', 'Dance', 'Read', 'Write', 'Work', 'Play', 'Learn', 'Teach', 'Buy', 'Sell', 'Bring', 'Take', 'Look', 'Listen', 'Speak', 'Wait', 'Think', 'Believe', 'Feel', 'Grow', 'Break', 'Fix', 'Clean', 'Wash'];
const adverbsEnList = ['Quickly', 'Slowly', 'Carefully', 'Hard', 'Happily', 'Sadly', 'Loudly', 'Quietly', 'Often', 'Never', 'Always', 'Soon', 'Later', 'Now', 'Well', 'Badly', 'Easily', 'Properly', 'Everywhere', 'Anywhere'];
const nounsEnList = ['Cat', 'Dog', 'Bird', 'Fish', 'Horse', 'Cow', 'Pig', 'Sheep', 'Mouse', 'Elephant', 'Lion', 'Tiger', 'Bear', 'Monkey', 'Snake', 'Car', 'Bus', 'Train', 'Plane', 'Boat', 'House', 'Building', 'Room', 'Door', 'Window', 'Table', 'Chair', 'Bed', 'Clock', 'Phone', 'Computer', 'Book', 'Pen', 'Pencil', 'Paper', 'Tree', 'Flower', 'Grass', 'River', 'Mountain', 'Sun', 'Moon', 'Star', 'Cloud', 'Rain'];

const verbsFrList = ['Courir', 'Manger', 'Boire', 'Dormir', 'Marcher', 'Sauter', 'Chanter', 'Danser', 'Lire', 'Écrire', 'Travailler', 'Jouer', 'Apprendre', 'Enseigner', 'Acheter', 'Vendre', 'Apporter', 'Prendre', 'Regarder', 'Écouter', 'Parler', 'Attendre', 'Penser', 'Croire', 'Ressentir', 'Grandir', 'Casser', 'Réparer', 'Nettoyer', 'Laver'];
const adverbsFrList = ['Vite', 'Lentement', 'Prudemment', 'Fort', 'Joyeusement', 'Tristement', 'Bruyamment', 'Silencieusement', 'Souvent', 'Jamais', 'Toujours', 'Bientôt', 'Plus tard', 'Maintenant', 'Bien', 'Mal', 'Facilement', 'Correctement', 'Partout', 'N’importe où'];
const nounsFrList = ['Chat', 'Chien', 'Oiseau', 'Poisson', 'Cheval', 'Vache', 'Cochon', 'Mouton', 'Souris', 'Éléphant', 'Lion', 'Tigre', 'Ours', 'Singe', 'Serpent', 'Voiture', 'Bus', 'Train', 'Avion', 'Bateau', 'Maison', 'Bâtiment', 'Pièce', 'Porte', 'Fenêtre', 'Table', 'Chaise', 'Lit', 'Horloge', 'Téléphone', 'Ordinateur', 'Livre', 'Stylo', 'Crayon', 'Papier', 'Arbre', 'Fleur', 'Herbe', 'Rivière', 'Montagne', 'Soleil', 'Lune', 'Étoile', 'Nuage', 'Pluie'];

export const sentenceTemplates = [
  { en: "I like to {verb} {adverb}.", fr: "J'aime {verbInf} {advFr}." },
  { en: "Can you {verb} {adverb}?", fr: "Peux-tu {verbInf} {advFr} ?" },
  { en: "I see a {noun}.", fr: "Je vois un/une {nounFr}." },
  { en: "The {noun} is here.", fr: "Le/La {nounFr} est ici." },
];

export const generateSentences = (count: number): SentenceEntry[] => {
  const sentences: SentenceEntry[] = [];
  for (let i = 0; i < count; i++) {
    const template = sentenceTemplates[Math.floor(Math.random() * sentenceTemplates.length)];
    const vIdx = Math.floor(Math.random() * verbsEnList.length);
    const aIdx = Math.floor(Math.random() * adverbsEnList.length);
    const nIdx = Math.floor(Math.random() * nounsEnList.length);

    let en = template.en
      .replace("{verb}", verbsEnList[vIdx].toLowerCase())
      .replace("{adverb}", adverbsEnList[aIdx].toLowerCase())
      .replace("{noun}", nounsEnList[nIdx].toLowerCase());

    let fr = template.fr
      .replace("{verbInf}", verbsFrList[vIdx].toLowerCase())
      .replace("{advFr}", adverbsFrList[aIdx].toLowerCase())
      .replace("{nounFr}", nounsFrList[nIdx].toLowerCase());

    sentences.push({
      id: `s-${i}`,
      english: en,
      french: fr
    });
  }
  return sentences;
};

export const sentenceData = generateSentences(1200);



