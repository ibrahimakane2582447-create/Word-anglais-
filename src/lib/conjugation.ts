export function getConjugations(infinitive: string) {
  let base = infinitive.toLowerCase().trim();
  if (base.startsWith('to ')) base = base.substring(3).trim();

  const irregulars: Record<string, { past?: string, pp?: string, ing?: string, s?: string }> = {
    be: { past: 'was/were', pp: 'been', ing: 'being', s: 'is' },
    have: { past: 'had', pp: 'had', ing: 'having', s: 'has' },
    do: { past: 'did', pp: 'done', ing: 'doing', s: 'does' },
    say: { past: 'said', pp: 'said', ing: 'saying', s: 'says' },
    go: { past: 'went', pp: 'gone', ing: 'going', s: 'goes' },
    get: { past: 'got', pp: 'gotten', ing: 'getting', s: 'gets' },
    make: { past: 'made', pp: 'made', ing: 'making', s: 'makes' },
    know: { past: 'knew', pp: 'known', ing: 'knowing', s: 'knows' },
    think: { past: 'thought', pp: 'thought', ing: 'thinking', s: 'thinks' },
    take: { past: 'took', pp: 'taken', ing: 'taking', s: 'takes' },
    see: { past: 'saw', pp: 'seen', ing: 'seeing', s: 'sees' },
    come: { past: 'came', pp: 'come', ing: 'coming', s: 'comes' },
    find: { past: 'found', pp: 'found', ing: 'finding', s: 'finds' },
    give: { past: 'gave', pp: 'given', ing: 'giving', s: 'gives' },
    tell: { past: 'told', pp: 'told', ing: 'telling', s: 'tells' },
    feel: { past: 'felt', pp: 'felt', ing: 'feeling', s: 'feels' },
    become: { past: 'became', pp: 'become', ing: 'becoming', s: 'becomes' },
    leave: { past: 'left', pp: 'left', ing: 'leaving', s: 'leaves' },
    put: { past: 'put', pp: 'put', ing: 'putting', s: 'puts' },
    mean: { past: 'meant', pp: 'meant', ing: 'meaning', s: 'means' },
    keep: { past: 'kept', pp: 'kept', ing: 'keeping', s: 'keeps' },
    let: { past: 'let', pp: 'let', ing: 'letting', s: 'lets' },
    begin: { past: 'began', pp: 'begun', ing: 'beginning', s: 'begins' },
    hear: { past: 'heard', pp: 'heard', ing: 'hearing', s: 'hears' },
    run: { past: 'ran', pp: 'run', ing: 'running', s: 'runs' },
    bring: { past: 'brought', pp: 'brought', ing: 'bringing', s: 'brings' },
    write: { past: 'wrote', pp: 'written', ing: 'writing', s: 'writes' },
    sit: { past: 'sat', pp: 'sat', ing: 'sitting', s: 'sits' },
    stand: { past: 'stood', pp: 'stood', ing: 'standing', s: 'stands' },
    lose: { past: 'lost', pp: 'lost', ing: 'losing', s: 'loses' },
    pay: { past: 'paid', pp: 'paid', ing: 'paying', s: 'pays' },
    meet: { past: 'met', pp: 'met', ing: 'meeting', s: 'meets' },
    set: { past: 'set', pp: 'set', ing: 'setting', s: 'sets' },
    lead: { past: 'led', pp: 'led', ing: 'leading', s: 'leads' },
    understand: { past: 'understood', pp: 'understood', ing: 'understanding', s: 'understands' },
    speak: { past: 'spoke', pp: 'spoken', ing: 'speaking', s: 'speaks' },
    read: { past: 'read', pp: 'read', ing: 'reading', s: 'reads' },
    spend: { past: 'spent', pp: 'spent', ing: 'spending', s: 'spends' },
    grow: { past: 'grew', pp: 'grown', ing: 'growing', s: 'grows' },
    win: { past: 'won', pp: 'won', ing: 'winning', s: 'wins' },
    buy: { past: 'bought', pp: 'bought', ing: 'buying', s: 'buys' },
    send: { past: 'sent', pp: 'sent', ing: 'sending', s: 'sends' },
    build: { past: 'built', pp: 'built', ing: 'building', s: 'builds' },
    fall: { past: 'fell', pp: 'fallen', ing: 'falling', s: 'falls' },
    cut: { past: 'cut', pp: 'cut', ing: 'cutting', s: 'cuts' },
    catch: { past: 'caught', pp: 'caught', ing: 'catching', s: 'catches' },
    throw: { past: 'threw', pp: 'thrown', ing: 'throwing', s: 'throws' },
    draw: { past: 'drew', pp: 'drawn', ing: 'drawing', s: 'draws' },
    drink: { past: 'drank', pp: 'drunk', ing: 'drinking', s: 'drinks' },
    fight: { past: 'fought', pp: 'fought', ing: 'fighting', s: 'fights' },
    forget: { past: 'forgot', pp: 'forgotten', ing: 'forgetting', s: 'forgets' },
    hit: { past: 'hit', pp: 'hit', ing: 'hitting', s: 'hits' },
    hold: { past: 'held', pp: 'held', ing: 'holding', s: 'holds' },
    ride: { past: 'rode', pp: 'ridden', ing: 'riding', s: 'rides' },
    shake: { past: 'shook', pp: 'shaken', ing: 'shaking', s: 'shakes' },
    shoot: { past: 'shot', pp: 'shot', ing: 'shooting', s: 'shoots' },
    sing: { past: 'sang', pp: 'sung', ing: 'singing', s: 'sings' },
    sleep: { past: 'slept', pp: 'slept', ing: 'sleeping', s: 'sleeps' },
    steal: { past: 'stole', pp: 'stolen', ing: 'stealing', s: 'steals' },
    swim: { past: 'swam', pp: 'swum', ing: 'swimming', s: 'swims' },
    teach: { past: 'taught', pp: 'taught', ing: 'teaching', s: 'teaches' },
    wake: { past: 'woke', pp: 'woken', ing: 'waking', s: 'wakes' },
    fly: { past: 'flew', pp: 'flown', ing: 'flying', s: 'flies' },
    choose: { past: 'chose', pp: 'chosen', ing: 'choosing', s: 'chooses' }
  };

  const vowels = ['a', 'e', 'i', 'o', 'u'];
  const isVowel = (c: string) => vowels.includes(c);
  
  let past = base + 'ed';
  let pp = base + 'ed';
  let ing = base + 'ing';
  let s = base + 's';

  if (!irregulars[base]) {
    if (base.endsWith('e')) {
      past = base + 'd';
      pp = past;
      ing = base.substring(0, base.length - 1) + 'ing';
    } else if (base.endsWith('y') && !isVowel(base[base.length - 2])) {
      past = base.substring(0, base.length - 1) + 'ied';
      pp = past;
      s = base.substring(0, base.length - 1) + 'ies';
    } else if (
      base.length > 2 && 
      !isVowel(base[base.length - 1]) && 
      isVowel(base[base.length - 2]) && 
      !isVowel(base[base.length - 3]) &&
      !['w', 'x', 'y'].includes(base[base.length - 1])
    ) {
      past = base + base[base.length - 1] + 'ed';
      pp = past;
      ing = base + base[base.length - 1] + 'ing';
    }

    if (base.endsWith('ch') || base.endsWith('sh') || base.endsWith('s') || base.endsWith('x') || base.endsWith('z') || base.endsWith('o')) {
      s = base + 'es';
    }
  }

  const forms = irregulars[base] || { past, pp, ing, s };
  
  const finalIng = forms.ing || (base.endsWith('e') && base !== 'be' ? base.substring(0, base.length-1) + 'ing' : base + 'ing');
  const finalS = forms.s || base + 's';

  const stativeVerbs = ['know', 'believe', 'understand', 'want', 'need', 'like', 'love', 'hate', 'prefer', 'remember', 'forget', 'seem', 'appear', 'belong', 'own', 'consist', 'contain', 'suppose', 'realize', 'recognize', 'matter', 'mean', 'promise', 'satisfy', 'agree', 'deny', 'impress', 'please'];
  const isStative = stativeVerbs.includes(base);

  return {
    base,
    past: forms.past || past,
    pp: forms.pp || pp,
    ing: finalIng,
    s: finalS,
    isStative
  };
}

export function getFullConjugations(infinitive: string) {
  const { base, past, pp, ing, s, isStative } = getConjugations(infinitive);
  
  const isBe = base === 'be';
  const isHave = base === 'have';

  const presentSimple = isBe ? [
    { p: 'I', v: 'am' },
    { p: 'You', v: 'are' },
    { p: 'He/She/It', v: 'is' },
    { p: 'We', v: 'are' },
    { p: 'You (pl)', v: 'are' },
    { p: 'They', v: 'are' }
  ] : [
    { p: 'I', v: base },
    { p: 'You', v: base },
    { p: 'He/She/It', v: s },
    { p: 'We', v: base },
    { p: 'You (pl)', v: base },
    { p: 'They', v: base }
  ];

  const presentCont = isBe ? [
    { p: 'I', v: 'am being' },
    { p: 'You', v: 'are being' },
    { p: 'He/She/It', v: 'is being' },
    { p: 'We', v: 'are being' },
    { p: 'You (pl)', v: 'are being' },
    { p: 'They', v: 'are being' }
  ] : [
    { p: 'I', v: `am ${ing}` },
    { p: 'You', v: `are ${ing}` },
    { p: 'He/She/It', v: `is ${ing}` },
    { p: 'We', v: `are ${ing}` },
    { p: 'You (pl)', v: `are ${ing}` },
    { p: 'They', v: `are ${ing}` }
  ];

  const pastSimple = isBe ? [
    { p: 'I', v: 'was' },
    { p: 'You', v: 'were' },
    { p: 'He/She/It', v: 'was' },
    { p: 'We', v: 'were' },
    { p: 'You (pl)', v: 'were' },
    { p: 'They', v: 'were' }
  ] : [
    { p: 'I', v: past },
    { p: 'You', v: past },
    { p: 'He/She/It', v: past },
    { p: 'We', v: past },
    { p: 'You (pl)', v: past },
    { p: 'They', v: past }
  ];

  const pastCont = isBe ? [
    { p: 'I', v: 'was being' },
    { p: 'You', v: 'were being' },
    { p: 'He/She/It', v: 'was being' },
    { p: 'We', v: 'were being' },
    { p: 'You (pl)', v: 'were being' },
    { p: 'They', v: 'were being' }
  ] : [
    { p: 'I', v: `was ${ing}` },
    { p: 'You', v: `were ${ing}` },
    { p: 'He/She/It', v: `was ${ing}` },
    { p: 'We', v: `were ${ing}` },
    { p: 'You (pl)', v: `were ${ing}` },
    { p: 'They', v: `were ${ing}` }
  ];

  const future = [
    { p: 'I', v: `will ${base}` },
    { p: 'You', v: `will ${base}` },
    { p: 'He/She/It', v: `will ${base}` },
    { p: 'We', v: `will ${base}` },
    { p: 'You (pl)', v: `will ${base}` },
    { p: 'They', v: `will ${base}` }
  ];

  const presentPerfect = [
    { p: 'I', v: `have ${pp}` },
    { p: 'You', v: `have ${pp}` },
    { p: 'He/She/It', v: `has ${pp}` },
    { p: 'We', v: `have ${pp}` },
    { p: 'You (pl)', v: `have ${pp}` },
    { p: 'They', v: `have ${pp}` }
  ];

  const pastPerfect = [
    { p: 'I', v: `had ${pp}` },
    { p: 'You', v: `had ${pp}` },
    { p: 'He/She/It', v: `had ${pp}` },
    { p: 'We', v: `had ${pp}` },
    { p: 'You (pl)', v: `had ${pp}` },
    { p: 'They', v: `had ${pp}` }
  ];

  return {
    base, past, pp, ing, s, isStative,
    tenses: [
      { name: 'Present Simple', forms: presentSimple, skipForStative: false },
      { name: 'Present Continuous', forms: presentCont, skipForStative: true },
      { name: 'Past Simple', forms: pastSimple, skipForStative: false },
      { name: 'Past Continuous', forms: pastCont, skipForStative: true },
      { name: 'Future Simple', forms: future, skipForStative: false },
      { name: 'Present Perfect', forms: presentPerfect, skipForStative: false },
      { name: 'Past Perfect', forms: pastPerfect, skipForStative: false }
    ]
  };
}
