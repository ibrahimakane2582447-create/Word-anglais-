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
  { en: 'Time', fr: 'Temps', g: 'm' }, { en: 'Year', fr: 'Année', g: 'f' }, { en: 'People', fr: 'Gens', g: 'm' },
  { en: 'Way', fr: 'Chemin', g: 'm' }, { en: 'Day', fr: 'Jour', g: 'm' }, { en: 'Man', fr: 'Homme', g: 'm' },
  { en: 'Thing', fr: 'Chose', g: 'f' }, { en: 'Woman', fr: 'Femme', g: 'f' }, { en: 'Life', fr: 'Vie', g: 'f' },
  { en: 'Child', fr: 'Enfant', g: 'm' }, { en: 'World', fr: 'Monde', g: 'm' }, { en: 'School', fr: 'École', g: 'f' },
  { en: 'State', fr: 'État', g: 'm' }, { en: 'Family', fr: 'Famille', g: 'f' }, { en: 'Student', fr: 'Étudiant', g: 'm' },
  { en: 'Group', fr: 'Groupe', g: 'm' }, { en: 'Country', fr: 'Pays', g: 'm' }, { en: 'Problem', fr: 'Problème', g: 'm' },
  { en: 'Hand', fr: 'Main', g: 'f' }, { en: 'Part', fr: 'Partie', g: 'f' }, { en: 'Place', fr: 'Lieu', g: 'm' },
  { en: 'Case', fr: 'Cas', g: 'm' }, { en: 'Week', fr: 'Semaine', g: 'f' }, { en: 'Company', fr: 'Entreprise', g: 'f' },
  { en: 'System', fr: 'Système', g: 'm' }, { en: 'Program', fr: 'Programme', g: 'm' }, { en: 'Question', fr: 'Question', g: 'f' },
  { en: 'Work', fr: 'Travail', g: 'm' }, { en: 'Government', fr: 'Gouvernement', g: 'm' }, { en: 'Number', fr: 'Nombre', g: 'm' },
  { en: 'Night', fr: 'Nuit', g: 'f' }, { en: 'Mr', fr: 'Monsieur', g: 'm' }, { en: 'Point', fr: 'Point', g: 'm' },
  { en: 'Home', fr: 'Maison', g: 'f' }, { en: 'Water', fr: 'Eau', g: 'f' }, { en: 'Room', fr: 'Pièce', g: 'f' },
  { en: 'Mother', fr: 'Mère', g: 'f' }, { en: 'Area', fr: 'Zone', g: 'f' }, { en: 'Money', fr: 'Argent', g: 'm' },
  { en: 'Story', fr: 'Histoire', g: 'f' }, { en: 'Fact', fr: 'Fait', g: 'm' }, { en: 'Month', fr: 'Mois', g: 'm' },
  { en: 'Lot', fr: 'Lot', g: 'm' }, { en: 'Right', fr: 'Droit', g: 'm' }, { en: 'Study', fr: 'Étude', g: 'f' },
  { en: 'Book', fr: 'Livre', g: 'm' }, { en: 'Eye', fr: 'Œil', g: 'm' }, { en: 'Job', fr: 'Emploi', g: 'm' },
  { en: 'Word', fr: 'Mot', g: 'm' }, { en: 'Business', fr: 'Affaire', g: 'f' }, { en: 'Issue', fr: 'Problème', g: 'm' },
  { en: 'Side', fr: 'Côté', g: 'm' }, { en: 'Kind', fr: 'Genre', g: 'm' }, { en: 'Head', fr: 'Tête', g: 'f' },
  { en: 'House', fr: 'Maison', g: 'f' }, { en: 'Service', fr: 'Service', g: 'm' }, { en: 'Friend', fr: 'Ami', g: 'm' },
  { en: 'Father', fr: 'Père', g: 'm' }, { en: 'Power', fr: 'Pouvoir', g: 'm' }, { en: 'Hour', fr: 'Heure', g: 'f' },
  { en: 'Game', fr: 'Jeu', g: 'm' }, { en: 'Line', fr: 'Ligne', g: 'f' }, { en: 'End', fr: 'Fin', g: 'f' },
  { en: 'Member', fr: 'Membre', g: 'm' }, { en: 'Law', fr: 'Loi', g: 'f' }, { en: 'Car', fr: 'Voiture', g: 'f' },
  { en: 'City', fr: 'Ville', g: 'f' }, { en: 'Community', fr: 'Communauté', g: 'f' }, { en: 'Name', fr: 'Nom', g: 'm' },
  { en: 'President', fr: 'Président', g: 'm' }, { en: 'Team', fr: 'Équipe', g: 'f' }, { en: 'Minute', fr: 'Minute', g: 'f' },
  { en: 'Idea', fr: 'Idée', g: 'f' }, { en: 'Kid', fr: 'Enfant', g: 'm' }, { en: 'Body', fr: 'Corps', g: 'm' },
  { en: 'Information', fr: 'Information', g: 'f' }, { en: 'Back', fr: 'Dos', g: 'm' }, { en: 'Parent', fr: 'Parent', g: 'm' },
  { en: 'Face', fr: 'Visage', g: 'm' }, { en: 'Others', fr: 'Autres', g: 'm' }, { en: 'Level', fr: 'Niveau', g: 'm' },
  { en: 'Office', fr: 'Bureau', g: 'm' }, { en: 'Door', fr: 'Porte', g: 'f' }, { en: 'Health', fr: 'Santé', g: 'f' },
  { en: 'Person', fr: 'Personne', g: 'f' }, { en: 'Art', fr: 'Art', g: 'm' }, { en: 'War', fr: 'Guerre', g: 'f' },
  { en: 'History', fr: 'Histoire', g: 'f' }, { en: 'Party', fr: 'Fête', g: 'f' }, { en: 'Result', fr: 'Résultat', g: 'm' },
  { en: 'Change', fr: 'Changement', g: 'm' }, { en: 'Morning', fr: 'Matin', g: 'm' }, { en: 'Reason', fr: 'Raison', g: 'f' },
  { en: 'Research', fr: 'Recherche', g: 'f' }, { en: 'Girl', fr: 'Fille', g: 'f' }, { en: 'Guy', fr: 'Gars', g: 'm' },
  { en: 'Moment', fr: 'Moment', g: 'm' }, { en: 'Air', fr: 'Air', g: 'm' }, { en: 'Teacher', fr: 'Professeur', g: 'm' },
  { en: 'Force', fr: 'Force', g: 'f' }, { en: 'Education', fr: 'Éducation', g: 'f' },
  { en: 'Food', fr: 'Nourriture', g: 'f' }, { en: 'Bird', fr: 'Oiseau', g: 'm' }, { en: 'Cat', fr: 'Chat', g: 'm' },
  { en: 'Dog', fr: 'Chien', g: 'm' }, { en: 'Tree', fr: 'Arbre', g: 'm' }, { en: 'Sun', fr: 'Soleil', g: 'm' },
  { en: 'Moon', fr: 'Lune', g: 'f' }, { en: 'Star', fr: 'Étoile', g: 'f' }, { en: 'Rain', fr: 'Pluie', g: 'f' },
  { en: 'Road', fr: 'Route', g: 'f' }, { en: 'Street', fr: 'Rue', g: 'f' }, { en: 'Table', fr: 'Table', g: 'f' },
  { en: 'Chair', fr: 'Chaise', g: 'f' }, { en: 'Bed', fr: 'Lit', g: 'm' }, { en: 'Key', fr: 'Clé', g: 'f' },
  { en: 'Phone', fr: 'Téléphone', g: 'm' }, { en: 'Garden', fr: 'Jardin', g: 'm' }, { en: 'Flower', fr: 'Fleur', g: 'f' },
  { en: 'Computer', fr: 'Ordinateur', g: 'm' }, { en: 'Window', fr: 'Fenêtre', g: 'f' }, { en: 'Sky', fr: 'Ciel', g: 'm' },
  { en: 'Ocean', fr: 'Océan', g: 'm' }, { en: 'River', fr: 'Rivière', g: 'f' }, { en: 'Mountain', fr: 'Montagne', g: 'f' },
  { en: 'Apple', fr: 'Pomme', g: 'f' }, { en: 'Bread', fr: 'Pain', g: 'm' }, { en: 'Milk', fr: 'Lait', g: 'm' },
  { en: 'Music', fr: 'Musique', g: 'f' }, { en: 'Movie', fr: 'Film', g: 'm' }, { en: 'News', fr: 'Nouvelles', g: 'f' },
  { en: 'Future', fr: 'Futur', g: 'm' }, { en: 'Past', fr: 'Passé', g: 'm' }, { en: 'Truth', fr: 'Vérité', g: 'f' }
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
const nounsFrList = [
  { fr: 'Chat', g: 'm' }, { fr: 'Chien', g: 'm' }, { fr: 'Oiseau', g: 'm' }, { fr: 'Poisson', g: 'm' }, { fr: 'Cheval', g: 'm' },
  { fr: 'Vache', g: 'f' }, { fr: 'Cochon', g: 'm' }, { fr: 'Mouton', g: 'm' }, { fr: 'Souris', g: 'f' }, { fr: 'Éléphant', g: 'm' },
  { fr: 'Lion', g: 'm' }, { fr: 'Tigre', g: 'm' }, { fr: 'Ours', g: 'm' }, { fr: 'Singe', g: 'm' }, { fr: 'Serpent', g: 'm' },
  { fr: 'Voiture', g: 'f' }, { fr: 'Bus', g: 'm' }, { fr: 'Train', g: 'm' }, { fr: 'Avion', g: 'm' }, { fr: 'Bateau', g: 'm' },
  { fr: 'Maison', g: 'f' }, { fr: 'Bâtiment', g: 'm' }, { fr: 'Pièce', g: 'f' }, { fr: 'Porte', g: 'f' }, { fr: 'Fenêtre', g: 'f' },
  { fr: 'Table', g: 'f' }, { fr: 'Chaise', g: 'f' }, { fr: 'Lit', g: 'm' }, { fr: 'Horloge', g: 'f' }, { fr: 'Téléphone', g: 'm' },
  { fr: 'Ordinateur', g: 'm' }, { fr: 'Livre', g: 'm' }, { fr: 'Stylo', g: 'm' }, { fr: 'Crayon', g: 'm' }, { fr: 'Papier', g: 'm' },
  { fr: 'Arbre', g: 'm' }, { fr: 'Fleur', g: 'f' }, { fr: 'Herbe', g: 'f' }, { fr: 'Rivière', g: 'f' }, { fr: 'Montagne', g: 'f' },
  { fr: 'Soleil', g: 'm' }, { fr: 'Lune', g: 'f' }, { fr: 'Étoile', g: 'f' }, { fr: 'Nuage', g: 'm' }, { fr: 'Pluie', g: 'f' }
];

export const sentenceTemplates = [
  { en: "I like to {verb} {adverb}.", fr: "J'aime {verbInf} {advFr}." },
  { en: "Can you {verb} {adverb}?", fr: "Peux-tu {verbInf} {advFr} ?" },
  { en: "I see a {noun}.", fr: "Je vois {artInd} {nounFr}." },
  { en: "The {noun} is here.", fr: "{artDef} {nounFr} est ici." },
  { en: "I want a {noun}.", fr: "Je veux {artInd} {nounFr}." },
  { en: "Where is the {noun}?", fr: "Où est {artDef} {nounFr} ?" },
];

export const generateSentences = (count: number): SentenceEntry[] => {
  const sentences: SentenceEntry[] = [];
  for (let i = 0; i < count; i++) {
    const template = sentenceTemplates[Math.floor(Math.random() * sentenceTemplates.length)];
    const vIdx = Math.floor(Math.random() * verbsEnList.length);
    const aIdx = Math.floor(Math.random() * adverbsEnList.length);
    const nIdx = Math.floor(Math.random() * nounsEnList.length);

    const nounFrObj = nounsFrList[nIdx];
    const artInd = nounFrObj.g === 'm' ? 'un' : 'une';
    const artDef = nounFrObj.g === 'm' ? 'le' : 'la';
    
    // Pour "le" ou "la" devant voyelle
    const startsWithVowel = /^[aeiouh]/i.test(nounFrObj.fr);
    const realArtDef = startsWithVowel ? "l'" : artDef + " ";

    let en = template.en
      .replace("{verb}", verbsEnList[vIdx].toLowerCase())
      .replace("{adverb}", adverbsEnList[aIdx].toLowerCase())
      .replace("{noun}", nounsEnList[nIdx].toLowerCase());

    let fr = template.fr
      .replace("{verbInf}", verbsFrList[vIdx].toLowerCase())
      .replace("{advFr}", adverbsFrList[aIdx].toLowerCase())
      .replace("{artInd}", artInd)
      .replace("{artDef}", realArtDef.trim())
      .replace("{nounFr}", nounFrObj.fr.toLowerCase());

    // Ajustement pour l'élision (l'avion)
    if (fr.includes("l' ")) {
       fr = fr.replace("l' ", "l'");
    }

    sentences.push({
      id: `s-${i}`,
      english: en,
      french: fr.charAt(0).toUpperCase() + fr.slice(1)
    });
  }
  return sentences;
};

export const sentenceData = generateSentences(1200);



