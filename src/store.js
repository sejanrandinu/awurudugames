export const getRegistrations = async () => {
  try {
    const res = await fetch('/api/registrations');
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const addRegistration = async (registration) => {
  try {
    const res = await fetch('/api/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registration)
    });
    return await res.json();
  } catch (err) {
    console.error(err);
    return { success: false };
  }
};

export const clearRegistrations = async () => {
  try {
    await fetch('/api/registrations', { method: 'DELETE' });
  } catch (err) {
    console.error(err);
  }
};

export const getHints = async () => {
  try {
    const res = await fetch('/api/hints');
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const updateHint = async (eventId, hintText) => {
  try {
    const res = await fetch('/api/hints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, hintText })
    });
    return await res.json();
  } catch (err) {
    console.error(err);
    return { success: false };
  }
};

export const getOfficialResults = async () => {
  try {
    const res = await fetch('/api/results');
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const updateOfficialResult = async (eventId, resultText) => {
  try {
    const res = await fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, resultText })
    });
    return await res.json();
  } catch (err) {
    console.error(err);
    return { success: false };
  }
};

export const EVENT_DETAILS = [
  {
    id: 'sagawunu-mala',
    title: 'සැඟවුණු මල (Hidden Flower)',
    description: 'Find the hidden flower. Guess the correct name and win amazing prizes!',
    price: 20,
    playMode: 'text',
    guessLabel: 'මලේ නම (Flower Name)',
    hint: 'ඉඟිය (Hint): මෙය ජලයේ පිපෙන, ලාංකීය සංස්කෘතියට ඉතා සමීප වූ සුදු පැහැ මලකි.',
    icon: '🌸'
  },
  {
    id: 'sagawunu-amuththa',
    title: 'සැඟවුණු අමුත්තා (Hidden Guest)',
    description: 'Who is the hidden guest? Guess the correct name and win amazing prizes.',
    price: 20,
    playMode: 'text',
    guessLabel: 'අමුත්තාගේ නම (Guest Name)',
    hint: 'ඉඟිය (Hint): මොහු මෑතකදී අතිශය ජනප්‍රිය වූ ලාංකීය චිත්‍රපටයක ප්‍රධාන චරිතයකි.',
    icon: '🕵️'
  },
  {
    id: 'sagawunu-wasthuwa',
    title: 'සැඟවුණු වස්තුව (Hidden Treasure)',
    description: 'The treasure is hidden somewhere. Read the hint and guess the location!',
    price: 20,
    playMode: 'text',
    guessLabel: 'සැඟවුණු තැන (Location Guess)',
    hint: 'ඉඟිය (Hint): මේ වස්තුව හැංගිලා තියෙන්නේ ගමේ පරණම කඩේ කිට්ටුව...',
    icon: '🗺️'
  },
  {
    id: 'ata-ganan-kireema',
    title: 'ගස්ලබු ගෙඩියේ ඇට ගණන් කිරීම',
    description: 'Can you guess the exact number of seeds in the Papaya? Place your guess!',
    price: 20,
    playMode: 'number',
    guessLabel: 'ඇට ගණන (Number of Seeds)',
    hint: 'ඉඟිය (Hint): ඇට ගණන 300ත් 500ත් අතර පවතී.',
    icon: '🍉'
  }
];
