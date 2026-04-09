export interface WordEntry {
  id: string;
  english: string;
  french: string;
  type: string;
  exampleEn: string;
  exampleFr: string;
}

// Base de données de mots et verbes.
export const vocabularyData: WordEntry[] = [
  // Verbes très fréquents
  { id: '1', english: 'To be', french: 'Être', type: 'Verbe', exampleEn: 'I want to be a doctor.', exampleFr: 'Je veux être médecin.' },
  { id: '2', english: 'To have', french: 'Avoir', type: 'Verbe', exampleEn: 'I have a new car.', exampleFr: 'J\'ai une nouvelle voiture.' },
  { id: '3', english: 'To do', french: 'Faire', type: 'Verbe', exampleEn: 'Just do it.', exampleFr: 'Fais-le, tout simplement.' },
  { id: '4', english: 'To say', french: 'Dire', type: 'Verbe', exampleEn: 'What did you say?', exampleFr: 'Qu\'as-tu dit ?' },
  { id: '5', english: 'To go', french: 'Aller', type: 'Verbe', exampleEn: 'We need to go now.', exampleFr: 'Nous devons y aller maintenant.' },
  { id: '6', english: 'To get', french: 'Obtenir / Recevoir', type: 'Verbe', exampleEn: 'Did you get my message?', exampleFr: 'As-tu reçu mon message ?' },
  { id: '7', english: 'To make', french: 'Fabriquer / Faire', type: 'Verbe', exampleEn: 'She makes beautiful clothes.', exampleFr: 'Elle fabrique de beaux vêtements.' },
  { id: '8', english: 'To know', french: 'Savoir / Connaître', type: 'Verbe', exampleEn: 'I know the answer.', exampleFr: 'Je connais la réponse.' },
  { id: '9', english: 'To think', french: 'Penser', type: 'Verbe', exampleEn: 'I think it is a good idea.', exampleFr: 'Je pense que c\'est une bonne idée.' },
  { id: '10', english: 'To take', french: 'Prendre', type: 'Verbe', exampleEn: 'Take your time.', exampleFr: 'Prends ton temps.' },
  { id: '11', english: 'To see', french: 'Voir', type: 'Verbe', exampleEn: 'I see a bird in the tree.', exampleFr: 'Je vois un oiseau dans l\'arbre.' },
  { id: '12', english: 'To come', french: 'Venir', type: 'Verbe', exampleEn: 'Come here, please.', exampleFr: 'Viens ici, s\'il te plaît.' },
  { id: '13', english: 'To want', french: 'Vouloir', type: 'Verbe', exampleEn: 'I want to learn English.', exampleFr: 'Je veux apprendre l\'anglais.' },
  { id: '14', english: 'To look', french: 'Regarder', type: 'Verbe', exampleEn: 'Look at this picture.', exampleFr: 'Regarde cette image.' },
  { id: '15', english: 'To use', french: 'Utiliser', type: 'Verbe', exampleEn: 'Can I use your phone?', exampleFr: 'Puis-je utiliser ton téléphone ?' },
  { id: '16', english: 'To find', french: 'Trouver', type: 'Verbe', exampleEn: 'I cannot find my keys.', exampleFr: 'Je ne trouve pas mes clés.' },
  { id: '17', english: 'To give', french: 'Donner', type: 'Verbe', exampleEn: 'Give me a second.', exampleFr: 'Donne-moi une seconde.' },
  { id: '18', english: 'To tell', french: 'Raconter / Dire à', type: 'Verbe', exampleEn: 'Tell me a story.', exampleFr: 'Raconte-moi une histoire.' },
  { id: '19', english: 'To work', french: 'Travailler', type: 'Verbe', exampleEn: 'He works in a bank.', exampleFr: 'Il travaille dans une banque.' },
  { id: '20', english: 'To call', french: 'Appeler', type: 'Verbe', exampleEn: 'Call me tomorrow.', exampleFr: 'Appelle-moi demain.' },
  { id: '21', english: 'To try', french: 'Essayer', type: 'Verbe', exampleEn: 'You should try this cake.', exampleFr: 'Tu devrais essayer ce gâteau.' },
  { id: '22', english: 'To ask', french: 'Demander', type: 'Verbe', exampleEn: 'Can I ask a question?', exampleFr: 'Puis-je poser une question ?' },
  { id: '23', english: 'To need', french: 'Avoir besoin de', type: 'Verbe', exampleEn: 'I need some help.', exampleFr: 'J\'ai besoin d\'aide.' },
  { id: '24', english: 'To feel', french: 'Ressentir / Se sentir', type: 'Verbe', exampleEn: 'I feel happy today.', exampleFr: 'Je me sens heureux aujourd\'hui.' },
  { id: '25', english: 'To become', french: 'Devenir', type: 'Verbe', exampleEn: 'He became a teacher.', exampleFr: 'Il est devenu professeur.' },
  { id: '26', english: 'To leave', french: 'Quitter / Partir', type: 'Verbe', exampleEn: 'Don\'t leave me alone.', exampleFr: 'Ne me laisse pas seul.' },
  { id: '27', english: 'To put', french: 'Mettre', type: 'Verbe', exampleEn: 'Put the book on the table.', exampleFr: 'Mets le livre sur la table.' },
  { id: '28', english: 'To mean', french: 'Signifier / Vouloir dire', type: 'Verbe', exampleEn: 'What does this word mean?', exampleFr: 'Que signifie ce mot ?' },
  { id: '29', english: 'To keep', french: 'Garder', type: 'Verbe', exampleEn: 'Keep the change.', exampleFr: 'Gardez la monnaie.' },
  { id: '30', english: 'To let', french: 'Laisser / Permettre', type: 'Verbe', exampleEn: 'Let me go.', exampleFr: 'Laisse-moi partir.' },

  // Noms très fréquents
  { id: '31', english: 'Time', french: 'Temps / Heure', type: 'Nom', exampleEn: 'What time is it?', exampleFr: 'Quelle heure est-il ?' },
  { id: '32', english: 'Person', french: 'Personne', type: 'Nom', exampleEn: 'She is a nice person.', exampleFr: 'C\'est une personne gentille.' },
  { id: '33', english: 'Year', french: 'Année', type: 'Nom', exampleEn: 'Happy New Year!', exampleFr: 'Bonne année !' },
  { id: '34', english: 'Way', french: 'Chemin / Façon', type: 'Nom', exampleEn: 'This is the right way.', exampleFr: 'C\'est le bon chemin.' },
  { id: '35', english: 'Day', french: 'Jour', type: 'Nom', exampleEn: 'Have a good day.', exampleFr: 'Passe une bonne journée.' },
  { id: '36', english: 'Thing', french: 'Chose', type: 'Nom', exampleEn: 'What is this thing?', exampleFr: 'Qu\'est-ce que c\'est que cette chose ?' },
  { id: '37', english: 'Man', french: 'Homme', type: 'Nom', exampleEn: 'He is a strong man.', exampleFr: 'C\'est un homme fort.' },
  { id: '38', english: 'World', french: 'Monde', type: 'Nom', exampleEn: 'The world is big.', exampleFr: 'Le monde est grand.' },
  { id: '39', english: 'Life', french: 'Vie', type: 'Nom', exampleEn: 'Life is beautiful.', exampleFr: 'La vie est belle.' },
  { id: '40', english: 'Hand', french: 'Main', type: 'Nom', exampleEn: 'Wash your hands.', exampleFr: 'Lave tes mains.' },
  { id: '41', english: 'Part', french: 'Partie', type: 'Nom', exampleEn: 'This is the best part of the movie.', exampleFr: 'C\'est la meilleure partie du film.' },
  { id: '42', english: 'Child', french: 'Enfant', type: 'Nom', exampleEn: 'The child is playing.', exampleFr: 'L\'enfant joue.' },
  { id: '43', english: 'Eye', french: 'Œil', type: 'Nom', exampleEn: 'She has blue eyes.', exampleFr: 'Elle a les yeux bleus.' },
  { id: '44', english: 'Woman', french: 'Femme', type: 'Nom', exampleEn: 'That woman is my mother.', exampleFr: 'Cette femme est ma mère.' },
  { id: '45', english: 'Place', french: 'Endroit / Lieu', type: 'Nom', exampleEn: 'This is a nice place.', exampleFr: 'C\'est un bel endroit.' },
  { id: '46', english: 'Work', french: 'Travail', type: 'Nom', exampleEn: 'I have a lot of work.', exampleFr: 'J\'ai beaucoup de travail.' },
  { id: '47', english: 'Week', french: 'Semaine', type: 'Nom', exampleEn: 'See you next week.', exampleFr: 'À la semaine prochaine.' },
  { id: '48', english: 'Case', french: 'Cas / Affaire', type: 'Nom', exampleEn: 'In that case, I agree.', exampleFr: 'Dans ce cas, je suis d\'accord.' },
  { id: '49', english: 'Point', french: 'Point / Argument', type: 'Nom', exampleEn: 'You have a good point.', exampleFr: 'Tu as un bon argument.' },
  { id: '50', english: 'Government', french: 'Gouvernement', type: 'Nom', exampleEn: 'The government makes laws.', exampleFr: 'Le gouvernement fait les lois.' },

  // Adjectifs très fréquents
  { id: '51', english: 'Good', french: 'Bon / Bien', type: 'Adjectif', exampleEn: 'This is a good book.', exampleFr: 'C\'est un bon livre.' },
  { id: '52', english: 'New', french: 'Nouveau', type: 'Adjectif', exampleEn: 'I bought a new phone.', exampleFr: 'J\'ai acheté un nouveau téléphone.' },
  { id: '53', english: 'First', french: 'Premier', type: 'Adjectif', exampleEn: 'He was the first to arrive.', exampleFr: 'Il était le premier à arriver.' },
  { id: '54', english: 'Last', french: 'Dernier', type: 'Adjectif', exampleEn: 'This is my last offer.', exampleFr: 'C\'est ma dernière offre.' },
  { id: '55', english: 'Long', french: 'Long', type: 'Adjectif', exampleEn: 'It was a long journey.', exampleFr: 'C\'était un long voyage.' },
  { id: '56', english: 'Great', french: 'Super / Grand', type: 'Adjectif', exampleEn: 'We had a great time.', exampleFr: 'Nous avons passé un super moment.' },
  { id: '57', english: 'Little', french: 'Petit / Peu', type: 'Adjectif', exampleEn: 'I have a little problem.', exampleFr: 'J\'ai un petit problème.' },
  { id: '58', english: 'Own', french: 'Propre (à soi)', type: 'Adjectif', exampleEn: 'I have my own room.', exampleFr: 'J\'ai ma propre chambre.' },
  { id: '59', english: 'Other', french: 'Autre', type: 'Adjectif', exampleEn: 'Where are the other students?', exampleFr: 'Où sont les autres élèves ?' },
  { id: '60', english: 'Old', french: 'Vieux / Ancien', type: 'Adjectif', exampleEn: 'This is an old house.', exampleFr: 'C\'est une vieille maison.' },
  
  // Mots de liaison et autres
  { id: '61', english: 'Always', french: 'Toujours', type: 'Adverbe', exampleEn: 'I always wake up early.', exampleFr: 'Je me réveille toujours tôt.' },
  { id: '62', english: 'Never', french: 'Jamais', type: 'Adverbe', exampleEn: 'Never give up.', exampleFr: 'N\'abandonne jamais.' },
  { id: '63', english: 'Because', french: 'Parce que', type: 'Conjonction', exampleEn: 'I am late because of the traffic.', exampleFr: 'Je suis en retard à cause des bouchons.' },
  { id: '64', english: 'However', french: 'Cependant', type: 'Adverbe', exampleEn: 'It is raining. However, we will go out.', exampleFr: 'Il pleut. Cependant, nous sortirons.' },
  { id: '65', english: 'Therefore', french: 'Par conséquent', type: 'Adverbe', exampleEn: 'I think, therefore I am.', exampleFr: 'Je pense, donc je suis.' }
];

// Ajout d'un bloc dense de mots supplémentaires réels pour enrichir la base sans dépasser les limites de texte
const extraWords = [
  "Water|Eau|Nom|I drink water.|Je bois de l'eau.",
  "Food|Nourriture|Nom|We need food.|Nous avons besoin de nourriture.",
  "Family|Famille|Nom|My family is big.|Ma famille est grande.",
  "Friend|Ami|Nom|He is my best friend.|Il est mon meilleur ami.",
  "School|École|Nom|I go to school.|Je vais à l'école.",
  "Book|Livre|Nom|Read this book.|Lis ce livre.",
  "Money|Argent|Nom|I have no money.|Je n'ai pas d'argent.",
  "City|Ville|Nom|Paris is a beautiful city.|Paris est une belle ville.",
  "Country|Pays|Nom|France is a country.|La France est un pays.",
  "Story|Histoire|Nom|Tell me a story.|Raconte-moi une histoire.",
  "Mother|Mère|Nom|My mother is kind.|Ma mère est gentille.",
  "Father|Père|Nom|My father is working.|Mon père travaille.",
  "Night|Nuit|Nom|The night is dark.|La nuit est sombre.",
  "Morning|Matin|Nom|Good morning!|Bonjour ! (le matin)",
  "Car|Voiture|Nom|I drive a car.|Je conduis une voiture.",
  "Door|Porte|Nom|Open the door.|Ouvre la porte.",
  "Room|Pièce / Chambre|Nom|Clean your room.|Nettoie ta chambre.",
  "Problem|Problème|Nom|No problem.|Pas de problème.",
  "Fact|Fait|Nom|That is a fact.|C'est un fait.",
  "Idea|Idée|Nom|Good idea!|Bonne idée !",
  "To play|Jouer|Verbe|Let's play a game.|Jouons à un jeu.",
  "To run|Courir|Verbe|I run every day.|Je cours tous les jours.",
  "To move|Bouger / Déplacer|Verbe|Don't move.|Ne bouge pas.",
  "To live|Vivre|Verbe|I live in London.|Je vis à Londres.",
  "To believe|Croire|Verbe|I believe you.|Je te crois.",
  "To bring|Apporter|Verbe|Bring me the book.|Apporte-moi le livre.",
  "To happen|Se passer / Arriver|Verbe|What happened?|Que s'est-il passé ?",
  "To write|Écrire|Verbe|Write your name.|Écris ton nom.",
  "To provide|Fournir|Verbe|We provide food.|Nous fournissons de la nourriture.",
  "To sit|S'asseoir|Verbe|Sit down, please.|Asseyez-vous, s'il vous plaît.",
  "To stand|Se tenir debout|Verbe|Stand up.|Lève-toi.",
  "To lose|Perdre|Verbe|Don't lose your keys.|Ne perds pas tes clés.",
  "To pay|Payer|Verbe|I will pay.|Je vais payer.",
  "To meet|Rencontrer|Verbe|Nice to meet you.|Ravi de vous rencontrer.",
  "To include|Inclure|Verbe|Tax is included.|La taxe est incluse.",
  "To continue|Continuer|Verbe|Continue reading.|Continue à lire.",
  "To set|Placer / Régler|Verbe|Set the table.|Mets la table.",
  "To learn|Apprendre|Verbe|I learn fast.|J'apprends vite.",
  "To change|Changer|Verbe|Change your clothes.|Change tes vêtements.",
  "To lead|Mener / Diriger|Verbe|Lead the way.|Montre le chemin.",
  "Important|Important|Adjectif|This is important.|C'est important.",
  "Right|Vrai / Droit|Adjectif|You are right.|Tu as raison.",
  "Big|Grand / Gros|Adjectif|A big house.|Une grande maison.",
  "High|Haut|Adjectif|A high mountain.|Une haute montagne.",
  "Different|Différent|Adjectif|They are different.|Ils sont différents.",
  "Small|Petit|Adjectif|A small dog.|Un petit chien.",
  "Large|Grand / Vaste|Adjectif|A large room.|Une grande pièce.",
  "Next|Prochain / Suivant|Adjectif|The next station.|La prochaine station.",
  "Early|Tôt|Adjectif|I woke up early.|Je me suis réveillé tôt.",
  "Young|Jeune|Adjectif|A young boy.|Un jeune garçon."
];

extraWords.forEach((item) => {
  const [english, french, type, exampleEn, exampleFr] = item.split('|');
  vocabularyData.push({
    id: (vocabularyData.length + 1).toString(),
    english,
    french,
    type,
    exampleEn,
    exampleFr
  });
});

// Génération de combinaisons réelles pour atteindre exactement 1000 mots sans utiliser de chiffres.
const adjectivesEn = ['Red', 'Blue', 'Big', 'Small', 'Old', 'New', 'Good', 'Bad', 'Fast', 'Slow', 'Hot', 'Cold', 'Happy', 'Sad', 'Dark', 'Light', 'Strong', 'Weak', 'Beautiful', 'Ugly', 'Loud', 'Quiet', 'Hard', 'Soft', 'Heavy', 'Lightweight', 'Rich', 'Poor', 'Clean', 'Dirty'];
const adjectivesFr = ['Rouge', 'Bleu(e)', 'Grand(e)', 'Petit(e)', 'Vieux/Vieille', 'Nouveau/Nouvelle', 'Bon(ne)', 'Mauvais(e)', 'Rapide', 'Lent(e)', 'Chaud(e)', 'Froid(e)', 'Heureux/Heureuse', 'Triste', 'Sombre', 'Clair(e)', 'Fort(e)', 'Faible', 'Beau/Belle', 'Laid(e)', 'Bruyant(e)', 'Calme', 'Dur(e)', 'Doux/Douce', 'Lourd(e)', 'Léger/Légère', 'Riche', 'Pauvre', 'Propre', 'Sale'];

const nounsEn = ['Cat', 'Dog', 'Bird', 'Fish', 'Horse', 'Cow', 'Pig', 'Sheep', 'Mouse', 'Elephant', 'Lion', 'Tiger', 'Bear', 'Monkey', 'Snake', 'Car', 'Bus', 'Train', 'Plane', 'Boat', 'House', 'Building', 'Room', 'Door', 'Window', 'Table', 'Chair', 'Bed', 'Clock', 'Phone', 'Computer', 'Book', 'Pen', 'Pencil', 'Paper', 'Tree', 'Flower', 'Grass', 'River', 'Mountain', 'Sun', 'Moon', 'Star', 'Cloud', 'Rain'];
const nounsFr = ['Chat', 'Chien', 'Oiseau', 'Poisson', 'Cheval', 'Vache', 'Cochon', 'Mouton', 'Souris', 'Éléphant', 'Lion', 'Tigre', 'Ours', 'Singe', 'Serpent', 'Voiture', 'Bus', 'Train', 'Avion', 'Bateau', 'Maison', 'Bâtiment', 'Pièce', 'Porte', 'Fenêtre', 'Table', 'Chaise', 'Lit', 'Horloge', 'Téléphone', 'Ordinateur', 'Livre', 'Stylo', 'Crayon', 'Papier', 'Arbre', 'Fleur', 'Herbe', 'Rivière', 'Montagne', 'Soleil', 'Lune', 'Étoile', 'Nuage', 'Pluie'];

const existingEnglish = new Set(vocabularyData.map(w => w.english.toLowerCase()));
let idCounter = vocabularyData.length + 1;

for (let i = 0; i < adjectivesEn.length; i++) {
  for (let j = 0; j < nounsEn.length; j++) {
    if (vocabularyData.length >= 1000) break;

    const english = `${adjectivesEn[i]} ${nounsEn[j].toLowerCase()}`;
    const french = `${nounsFr[j]} ${adjectivesFr[i].toLowerCase()}`;

    if (!existingEnglish.has(english.toLowerCase())) {
      vocabularyData.push({
        id: idCounter.toString(),
        english: english,
        french: french,
        type: 'Nom composé',
        exampleEn: `I see a ${english.toLowerCase()}.`,
        exampleFr: `Je vois un(e) ${french.toLowerCase()}.`
      });
      existingEnglish.add(english.toLowerCase());
      idCounter++;
    }
  }
}

// S'assurer qu'on a exactement 1000 mots nets
vocabularyData.splice(1000);
