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
  { en: 'Old', fr: 'Vieux' }, { en: 'Correct', fr: 'Correct' }, { en: 'Big', fr: 'Gros' },
  { en: 'High', fr: 'Haut' }, { en: 'Different', fr: 'Différent' }, { en: 'Small', fr: 'Petit' },
  { en: 'Large', fr: 'Grand' }, { en: 'Next', fr: 'Prochain' }, { en: 'Early', fr: 'Tôt' },
  { en: 'Young', fr: 'Jeune' }, { en: 'Important', fr: 'Important' }, { en: 'Few', fr: 'Peu' },
  { en: 'Public', fr: 'Public' }, { en: 'Bad', fr: 'Mauvais' }, { en: 'Same', fr: 'Même' },
  { en: 'Able', fr: 'Capable' }, { en: 'Strong', fr: 'Fort' }, { en: 'Whole', fr: 'Entier' },
  { en: 'Free', fr: 'Libre' }, { en: 'True', fr: 'Vrai' }, { en: 'Full', fr: 'Plein' },
  { en: 'Short', fr: 'Court' }, { en: 'Better', fr: 'Meilleur' }, { en: 'Best', fr: 'Le meilleur' },
  { en: 'Hot', fr: 'Chaud' }, { en: 'Cold', fr: 'Froid' }, { en: 'Fast', fr: 'Rapide' },
  { en: 'Slow', fr: 'Lent' }, { en: 'Hard', fr: 'Dur' }, { en: 'Soft', fr: 'Mou' },
  { en: 'Bright', fr: 'Brillant' }, { en: 'Dark', fr: 'Sombre' }, { en: 'Clean', fr: 'Propre' },
  { en: 'Dirty', fr: 'Sale' }, { en: 'Easy', fr: 'Facile' }, { en: 'Difficult', fr: 'Difficile' },
  { en: 'Happy', fr: 'Heureux' }, { en: 'Sad', fr: 'Triste' }, { en: 'Rich', fr: 'Riche' },
  { en: 'Poor', fr: 'Pauvre' }, { en: 'Tall', fr: 'Grand' }, { en: 'Short', fr: 'Court' }
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
  let ex;
  if (v.en === 'Be') {
    ex = { en: "I want to be happy.", fr: "Je veux être heureux." };
  } else if (v.en === 'Have') {
    ex = { en: "I have a big house.", fr: "J'ai une grande maison." };
  } else {
    const examples = [
      { en: `I want to ${v.en.toLowerCase()} now.`, fr: `Je veux ${v.fr.toLowerCase()} maintenant.` },
      { en: `It's time to ${v.en.toLowerCase()}.`, fr: `Il est temps de ${v.fr.toLowerCase()}.` },
      { en: `You must ${v.en.toLowerCase()} this.`, fr: `Tu dois ${v.fr.toLowerCase()} ceci.` },
      { en: `They love to ${v.en.toLowerCase()} together.`, fr: `Ils adorent ${v.fr.toLowerCase()} ensemble.` },
      { en: `Can you ${v.en.toLowerCase()} for me?`, fr: `Peux-tu ${v.fr.toLowerCase()} pour moi ?` }
    ];
    ex = examples[i % examples.length];
  }
  
  vocabularyData.push({
    id: `v-${i}`,
    english: `To ${v.en}`,
    french: v.fr,
    type: 'Verbe',
    exampleEn: ex.en,
    exampleFr: ex.fr
  });
});

// Remplissage avec Noms
baseNouns.forEach((n, i) => {
  const artEn = /^[aeiou]/i.test(n.en) ? 'an' : 'a';
  const artFrInd = n.g === 'f' ? 'une' : 'un';
  const artFrDef = /^[aeiouh]/i.test(n.fr) ? "l'" : (n.g === 'f' ? 'la ' : 'le ');
  const frLower = n.fr.toLowerCase();
  
  const examples = [
    { en: `I see ${artEn} ${n.en.toLowerCase()} over there.`, fr: `Je vois ${artFrInd} ${frLower} là-bas.` },
    { en: `The ${n.en.toLowerCase()} is very important.`, fr: `${artFrDef}${frLower} est très important(e).`.replace("l' e", "l'e") },
    { en: `Where is the ${n.en.toLowerCase()}?`, fr: `Où est ${artFrDef}${frLower} ?`.replace("l' ?", "l'?") },
    { en: `This is a beautiful ${n.en.toLowerCase()}.`, fr: `C'est ${artFrInd === 'un' ? 'un bel' : 'une belle'} ${frLower}.` }
  ];
  const ex = examples[i % examples.length];

  vocabularyData.push({
    id: `n-${i}`,
    english: n.en,
    french: n.fr,
    type: 'Nom',
    exampleEn: ex.en,
    exampleFr: ex.fr
  });
});

// Remplissage avec Adjectifs
baseAdjectives.forEach((a, i) => {
  const examples = [
    { en: `It looks ${a.en.toLowerCase()} today.`, fr: `Ça a l'air ${a.fr.toLowerCase()} aujourd'hui.` },
    { en: `I need something ${a.en.toLowerCase()}.`, fr: `J'ai besoin de quelque chose de ${a.fr.toLowerCase()}.` },
    { en: `The ${a.en.toLowerCase()} sky is beautiful.`, fr: `Le ciel ${a.fr.toLowerCase()} est magnifique.` },
    { en: `Everything is ${a.en.toLowerCase()}.`, fr: `Tout est ${a.fr.toLowerCase()}.` }
  ];
  const ex = examples[i % examples.length];
  vocabularyData.push({
    id: `a-${i}`,
    english: a.en,
    french: a.fr,
    type: 'Adjectif',
    exampleEn: ex.en,
    exampleFr: ex.fr
  });
});

// Remplissage avec Adverbes
baseAdverbs.forEach((adv, i) => {
  const examples = [
    { en: `He worked ${adv.en.toLowerCase()} to finish.`, fr: `Il a travaillé ${adv.fr.toLowerCase()} pour finir.` },
    { en: `Please, speak ${adv.en.toLowerCase()}.`, fr: `S'il vous plaît, parlez ${adv.fr.toLowerCase()}.` },
    { en: `It's happening ${adv.en.toLowerCase()}.`, fr: `C'est en train d'arriver ${adv.fr.toLowerCase()}.` },
    { en: `She runs ${adv.en.toLowerCase()}.`, fr: `Elle court ${adv.fr.toLowerCase()}.` }
  ];
  const ex = examples[i % examples.length];
  vocabularyData.push({
    id: `adv-${i}`,
    english: adv.en,
    french: adv.fr,
    type: 'Adverbe',
    exampleEn: ex.en,
    exampleFr: ex.fr
  });
});

// Expansion avec plus de noms concrets
const fruits = [
  { en: 'Orange', fr: 'Orange', g: 'f' }, { en: 'Banana', fr: 'Banane', g: 'f' }, { en: 'Grape', fr: 'Raisin', g: 'm' },
  { en: 'Strawberry', fr: 'Fraise', g: 'f' }, { en: 'Peach', fr: 'Pêche', g: 'f' }, { en: 'Pear', fr: 'Poire', g: 'f' },
  { en: 'Cherry', fr: 'Cerise', g: 'f' }, { en: 'Mango', fr: 'Mangue', g: 'f' }, { en: 'Pineapple', fr: 'Ananas', g: 'm' },
  { en: 'Watermelon', fr: 'Pastèque', g: 'f' }, { en: 'Lemon', fr: 'Citron', g: 'm' }, { en: 'Lime', fr: 'Citron vert', g: 'm' },
  { en: 'Coconut', fr: 'Noix de coco', g: 'f' }, { en: 'Plum', fr: 'Prune', g: 'f' }, { en: 'Kiwi', fr: 'Kiwi', g: 'm' },
  { en: 'Fig', fr: 'Figue', g: 'f' }, { en: 'Date', fr: 'Datte', g: 'f' }, { en: 'Berry', fr: 'Baie', g: 'f' },
  { en: 'Melon', fr: 'Melon', g: 'm' }, { en: 'Apricot', fr: 'Abricot', g: 'm' }
];

const animals = [
  { en: 'Lion', fr: 'Lion', g: 'm' }, { en: 'Tiger', fr: 'Tigre', g: 'm' }, { en: 'Elephant', fr: 'Éléphant', g: 'm' },
  { en: 'Giraffe', fr: 'Girafe', g: 'f' }, { en: 'Zebra', fr: 'Zèbre', g: 'm' }, { en: 'Monkey', fr: 'Singe', g: 'm' },
  { en: 'Bear', fr: 'Ours', g: 'm' }, { en: 'Wolf', fr: 'Loup', g: 'm' }, { en: 'Fox', fr: 'Renard', g: 'm' },
  { en: 'Rabbit', fr: 'Lapin', g: 'm' }, { en: 'Deer', fr: 'Cerf', g: 'm' }, { en: 'Horse', fr: 'Cheval', g: 'm' },
  { en: 'Cow', fr: 'Vache', g: 'f' }, { en: 'Sheep', fr: 'Mouton', g: 'm' }, { en: 'Pig', fr: 'Cochon', g: 'm' },
  { en: 'Chicken', fr: 'Poulet', g: 'm' }, { en: 'Duck', fr: 'Canard', g: 'm' }, { en: 'Mouse', fr: 'Souris', g: 'f' },
  { en: 'Snake', fr: 'Serpent', g: 'm' }, { en: 'Fish', fr: 'Poisson', g: 'm' }, { en: 'Shark', fr: 'Requin', g: 'm' },
  { en: 'Whale', fr: 'Baleine', g: 'f' }, { en: 'Dolphin', fr: 'Dauphin', g: 'm' }, { en: 'Octopus', fr: 'Poulpe', g: 'm' },
  { en: 'Bee', fr: 'Abeille', g: 'f' }, { en: 'Ant', fr: 'Fourmi', g: 'f' }, { en: 'Spider', fr: 'Araignée', g: 'f' }
];

const household = [
  { en: 'Plate', fr: 'Assiette', g: 'f' }, { en: 'Spoon', fr: 'Cuillère', g: 'f' }, { en: 'Fork', fr: 'Fourchette', g: 'f' },
  { en: 'Knife', fr: 'Couteau', g: 'm' }, { en: 'Cup', fr: 'Tasse', g: 'f' }, { en: 'Glass', fr: 'Verre', g: 'm' },
  { en: 'Bottle', fr: 'Bouteille', g: 'f' }, { en: 'Bowl', fr: 'Bol', g: 'm' }, { en: 'Pan', fr: 'Poêle', g: 'f' },
  { en: 'Pot', fr: 'Casserole', g: 'f' }, { en: 'Oven', fr: 'Four', g: 'm' }, { en: 'Fridge', fr: 'Réfrigérateur', g: 'm' },
  { en: 'Lamp', fr: 'Lampe', g: 'f' }, { en: 'Mirror', fr: 'Miroir', g: 'm' }, { en: 'Soap', fr: 'Savon', g: 'm' },
  { en: 'Towel', fr: 'Serviette', g: 'f' }, { en: 'Brush', fr: 'Brosse', g: 'f' }, { en: 'Comb', fr: 'Peigne', g: 'm' },
  { en: 'Bucket', fr: 'Seau', g: 'm' }, { en: 'Clock', fr: 'Horloge', g: 'f' }
];

const listsToProcess = [
  { list: fruits, type: 'Nom' },
  { list: animals, type: 'Nom' },
  { list: household, type: 'Nom' }
];

listsToProcess.forEach(item => {
  item.list.forEach((obj, idx) => {
    const artEn = /^[aeiou]/i.test(obj.en) ? 'an' : 'a';
    const frLower = obj.fr.toLowerCase();
    const artFrDef = /^[aeiouh]/i.test(obj.fr) ? "l'" : (obj.g === 'f' ? 'la ' : 'le ');
    
    vocabularyData.push({
      id: `${item.type.toLowerCase()}-extra-${obj.en}-${idx}`,
      english: obj.en,
      french: obj.fr,
      type: item.type,
      exampleEn: `I like this ${obj.en.toLowerCase()}.`,
      exampleFr: `J'aime ${artFrDef}${frLower}.`.replace("l' ", "l'")
    });
  });
});

// Expansion simplifiée pour atteindre un bon nombre sans sacrifier la qualité
const moreVerbs = [
  { en: 'Study', fr: 'Étudier' }, { en: 'Listen', fr: 'Écouter' }, { en: 'Understand', fr: 'Comprendre' },
  { en: 'Write', fr: 'Écrire' }, { en: 'Read', fr: 'Lire' }, { en: 'Speak', fr: 'Parler' },
  { en: 'Drive', fr: 'Conduire' }, { en: 'Eat', fr: 'Manger' }, { en: 'Drink', fr: 'Boire' },
  { en: 'Sleep', fr: 'Dormir' }
];

moreVerbs.forEach((v, i) => {
  vocabularyData.push({
    id: `v-extra-${i}`,
    english: `To ${v.en}`,
    french: v.fr,
    type: 'Verbe',
    exampleEn: `You must ${v.en.toLowerCase()}.`,
    exampleFr: `Tu dois ${v.fr.toLowerCase()}.`
  });
});

// --- DONNÉES DE PHRASES (SENTENCE BUILDER) ---
export interface SentenceEntry {
  id: string;
  english: string;
  french: string;
}

export interface TrueFalseEntry {
  id: string;
  statement: string;
  isTrue: boolean;
  explanation: string;
}

export const trueFalseData: TrueFalseEntry[] = [
  { id: 'tf1', statement: "The sun rises in the West.", isTrue: false, explanation: "The sun rises in the East." },
  { id: 'tf2', statement: "Dogs are mammals.", isTrue: true, explanation: "Dogs belong to the mammal group." },
  { id: 'tf3', statement: "Apple is a fruit.", isTrue: true, explanation: "Apples grow on trees and are fruits." },
  { id: 'tf4', statement: "Water boils at 0 degrees Celsius.", isTrue: false, explanation: "Water boils at 100 degrees Celsius." },
  { id: 'tf5', statement: "There are twelve months in a year.", isTrue: true, explanation: "From January to December." },
  { id: 'tf6', statement: "Elephants can fly.", isTrue: false, explanation: "Elephants are heavy land mammals." },
  { id: 'tf7', statement: "English is the official language in London.", isTrue: true, explanation: "London is the capital of England." },
  { id: 'tf8', statement: "A triangle has four sides.", isTrue: false, explanation: "A triangle has three sides." },
  { id: 'tf9', statement: "The moon shines with its own light.", isTrue: false, explanation: "The moon reflects light from the sun." },
  { id: 'tf10', statement: "Cats say 'meow'.", isTrue: true, explanation: "Meowing is the typical sound of a cat." },
  { id: 'tf11', statement: "A square has four equal sides.", isTrue: true, explanation: "That is the definition of a square." },
  { id: 'tf12', statement: "Fish can breathe underwater.", isTrue: true, explanation: "Fish use gills to breathe in water." },
  { id: 'tf13', statement: "Computers need electricity to work.", isTrue: true, explanation: "Electricity powers the circuits." },
  { id: 'tf14', statement: "Ants are bigger than elephants.", isTrue: false, explanation: "Ants are tiny insects." },
  { id: 'tf15', statement: "Winter is usually the hottest season.", isTrue: false, explanation: "Winter is the coldest season." },
  { id: 'tf16', statement: "The capital of France is Paris.", isTrue: true, explanation: "Paris is the main city of France." },
  { id: 'tf17', statement: "A year has 365 days.", isTrue: true, explanation: "Standard calendar year length." },
  { id: 'tf18', statement: "Birds have feathers.", isTrue: true, explanation: "All birds are feathered animals." },
  { id: 'tf19', statement: "Humans can survive without water for a month.", isTrue: false, explanation: "We need water every few days." },
  { id: 'tf20', statement: "The Earth is flat.", isTrue: false, explanation: "The Earth is roughly a sphere." },
];

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
  { en: "I like to {verb} when I have time.", fr: "J'aime {verbInf} quand j'ai le temps." },
  { en: "It is important to {verb} {adverb}.", fr: "Il est important de {verbInf} {advFr}." },
  { en: "I see a beautiful {noun} in the garden.", fr: "Je vois {artBeautiful} {nounFr} dans le jardin." },
  { en: "The {noun} is located near the city center.", fr: "{artDefCap} {nounFr} est {situatedAdj} près du centre-ville." },
  { en: "I really want to {verb} with you.", fr: "Je veux vraiment {verbInf} avec toi." },
  { en: "Where did you find this {noun}?", fr: "Où as-tu trouvé {thisNoun} {nounFr} ?" },
  { en: "We should {verb} more {adverb}.", fr: "Nous devrions {verbInf} plus {advFr}." },
  { en: "Do you know how to {verb}?", fr: "Sais-tu comment {verbInf} ?" },
  { en: "This {noun} is very {adjective}.", fr: "{thisNounCap} {nounFr} est très {adjFr}." },
  { en: "I have a {adjective} {noun}.", fr: "J'ai {artInd} {adjFr} {nounFr}." }
];

export const generateSentences = (count: number): SentenceEntry[] => {
    // Phrases de haute qualité écrites à la main (Salutations, Discussions, Vie Quotidienne)
    const curated: SentenceEntry[] = [
      { id: 'ms1', english: "How are you doing today?", french: "Comment allez-vous aujourd'hui ?" },
      { id: 'ms2', english: "I would like to order a coffee.", french: "Je voudrais commander un café." },
      { id: 'ms3', english: "Where is the nearest subway station?", french: "Où se trouve la station de métro la plus proche ?" },
      { id: 'ms4', english: "The weather is beautiful this morning.", french: "Le temps est magnifique ce matin." },
      { id: 'ms5', english: "I have been learning English for three months.", french: "J'apprends l'anglais depuis trois mois." },
      { id: 'ms6', english: "Could you help me with my luggage?", french: "Pourriez-vous m'aider avec mes bagages ?" },
      { id: 'ms7', english: "I'm looking for a good restaurant near here.", french: "Je cherche un bon restaurant près d'ici." },
      { id: 'ms8', english: "What time does the train leave?", french: "À quelle heure part le train ?" },
      { id: 'ms9', english: "It was a pleasure meeting you.", french: "C'était un plaisir de vous rencontrer." },
      { id: 'ms10', english: "I don't understand what you are saying.", french: "Je ne comprends pas ce que vous dites." },
      { id: 'ms11', english: "Can you speak more slowly, please?", french: "Pouvez-vous parler plus doucement, s'il vous plaît ?" },
      { id: 'ms12', english: "What is your favorite color?", french: "Quelle est votre couleur préférée ?" },
      { id: 'ms13', english: "I need to go to the supermarket.", french: "J'ai besoin d'aller au supermarché." },
      { id: 'ms14', english: "He is my best friend.", french: "Il est mon meilleur ami." },
      { id: 'ms15', english: "We are going on vacation next week.", french: "Nous partons en vacances la semaine prochaine." },
      
      // Nouvelles salutations et discussions
      { id: 'ms16', english: "Hello, nice to meet you.", french: "Bonjour, ravi de vous rencontrer." },
      { id: 'ms17', english: "Good morning! Did you sleep well?", french: "Bonjour ! As-tu bien dormi ?" },
      { id: 'ms18', english: "Good evening, how was your day?", french: "Bonsoir, comment s'est passée ta journée ?" },
      { id: 'ms19', english: "See you later, have a good day!", french: "À plus tard, passe une bonne journée !" },
      { id: 'ms20', english: "What are you up to this weekend?", french: "Que fais-tu ce week-end ?" },
      { id: 'ms21', english: "I totally agree with you.", french: "Je suis tout à fait d'accord avec toi." },
      { id: 'ms22', english: "I'm really sorry, I didn't mean to do that.", french: "Je suis vraiment désolé, je ne voulais pas faire ça." },
      { id: 'ms23', english: "Excuse me, how much does this cost?", french: "Excusez-moi, combien ça coûte ?" },
      { id: 'ms24', english: "Can I have the bill, please?", french: "Puis-je avoir l'addition, s'il vous plaît ?" },
      { id: 'ms25', english: "Do you have any recommendations?", french: "Avez-vous des recommandations ?" },
      { id: 'ms26', english: "What do you do for a living?", french: "Que fais-tu dans la vie ?" },
      { id: 'ms27', english: "Take care and keep in touch.", french: "Prends soin de toi et restons en contact." },
      { id: 'ms28', english: "Let's grab a drink sometime.", french: "Allons boire un verre un de ces jours." },
      { id: 'ms29', english: "I'm looking forward to it.", french: "J'ai hâte d'y être." },
      { id: 'ms30', english: "That sounds like a great idea.", french: "Ça me semble être une excellente idée." },
      
      // Vie quotidienne
      { id: 'ms31', english: "I need to do the laundry today.", french: "Je dois faire la lessive aujourd'hui." },
      { id: 'ms32', english: "Could you pass me the salt?", french: "Pourrais-tu me passer le sel ?" },
      { id: 'ms33', english: "I'm running a bit late, sorry.", french: "Je suis un peu en retard, désolé." },
      { id: 'ms34', english: "Did you lock the door?", french: "As-tu verrouillé la porte ?" },
      { id: 'ms35', english: "I feel very tired after work.", french: "Je me sens très fatigué après le travail." }
    ];

  const generated: SentenceEntry[] = [];
  for (let i = 0; i < count; i++) {
    const template = sentenceTemplates[Math.floor(Math.random() * sentenceTemplates.length)];
    const vIdx = Math.floor(Math.random() * verbsEnList.length);
    const aIdx = Math.floor(Math.random() * adverbsEnList.length);
    const nIdx = Math.floor(Math.random() * nounsEnList.length);
    const adjIdx = Math.floor(Math.random() * baseAdjectives.length);

    const nounFrObj = nounsFrList[nIdx];
    const adjObj = baseAdjectives[adjIdx];
    const artInd = nounFrObj.g === 'm' ? 'un' : 'une';
    const artDef = nounFrObj.g === 'm' ? 'le' : 'la';
    const isVowelNoun = /^[aeiouh]/i.test(nounFrObj.fr);
    
    // Démonstratifs
    const thisNoun = nounFrObj.g === 'm' ? (isVowelNoun ? 'cet' : 'ce') : 'cette';
    
    // Adjectifs spéciaux (beau/belle)
    const artBeautiful = nounFrObj.g === 'm' ? (isVowelNoun ? "un bel" : "un beau") : "une belle";
    
    // Accord situé(e)
    const situatedAdj = nounFrObj.g === 'm' ? "situé" : "située";

    let en = template.en
      .replace("{verb}", verbsEnList[vIdx].toLowerCase())
      .replace("{adverb}", adverbsEnList[aIdx].toLowerCase())
      .replace("{noun}", nounsEnList[nIdx].toLowerCase())
      .replace("{adjective}", adjObj.en.toLowerCase());

    let fr = template.fr
      .replace("{verbInf}", verbsFrList[vIdx].toLowerCase())
      .replace("{advFr}", adverbsFrList[aIdx].toLowerCase())
      .replace("{artInd}", artInd)
      .replace("{artDef}", isVowelNoun ? "l'" : artDef + " ")
      .replace("{artDefCap}", isVowelNoun ? "L'" : (artDef === 'le' ? "Le " : "La "))
      .replace("{nounFr}", nounFrObj.fr.toLowerCase())
      .replace("{thisNoun}", thisNoun)
      .replace("{thisNounCap}", thisNoun.charAt(0).toUpperCase() + thisNoun.slice(1))
      .replace("{artBeautiful}", artBeautiful)
      .replace("{situatedAdj}", situatedAdj)
      .replace("{adjFr}", adjObj.fr.toLowerCase() + (nounFrObj.g === 'f' && !adjObj.fr.endsWith('e') ? 'e' : ''));

    // Nettoyage final des espaces et apostrophes
    fr = fr.replace(/ {2,}/g, ' ').replace("l' ", "l'").replace("L' ", "L'");

    generated.push({
      id: `s-${i}`,
      english: en,
      french: fr.charAt(0).toUpperCase() + fr.slice(1)
    });
  }
  return [...curated, ...generated];
};

export const sentenceData = generateSentences(1200);



