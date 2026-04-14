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

export const getRegistrationsByPhone = async (phone) => {
  try {
    const res = await fetch(`/api/registrations?phone=${encodeURIComponent(phone)}`);
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

export const removeRegistration = async (id) => {
  try {
    const res = await fetch(`/api/registrations?id=${id}`, { method: 'DELETE' });
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

export const updateHint = async (eventId, hintText, hintImage) => {
  try {
    const res = await fetch('/api/hints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, hintText, hintImage })
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

export const getEventStatuses = async () => {
  try {
    const res = await fetch('/api/event-status');
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const updateEventStatus = async (eventId, isDisabled, price) => {
  try {
    const res = await fetch('/api/event-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, isDisabled, price })
    });
    return await res.json();
  } catch (err) {
    console.error(err);
    return { success: false };
  }
};

export const getPrizes = async () => {
  try {
    const res = await fetch('/api/prizes');
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const updatePrize = async (eventId, prizeText) => {
  try {
    const res = await fetch('/api/prizes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, prizeText })
    });
    return await res.json();
  } catch (err) {
    console.error(err);
    return { success: false };
  }
};

export const getPaymentInfo = async () => {
  try {
    const res = await fetch('/api/payment-info');
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (err) {
    console.error(err);
    return {};
  }
};

export const updatePaymentInfo = async (info) => {
  try {
    const res = await fetch('/api/payment-info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(info)
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
    hint: '',
    icon: '🌸'
  },
  {
    id: 'sagawunu-amuththa',
    title: 'සැඟවුණු අමුත්තා (Hidden Guest)',
    description: 'Who is the hidden guest? Guess the correct name and win amazing prizes.',
    price: 20,
    playMode: 'text',
    guessLabel: 'අමුත්තාගේ නම (Guest Name)',
    hint: '',
    icon: '🕵️'
  },
  {
    id: 'sagawunu-wasthuwa',
    title: 'සැඟවුණු වස්තුව (Hidden Treasure)',
    description: 'Can you guess the hidden treasure? Read the hint and win amazing prizes!',
    price: 20,
    playMode: 'text',
    guessLabel: 'සැඟවුණු වස්තුව (Hidden Treasure)',
    hint: '',
    icon: '🏺'
  },
  {
    id: 'ata-ganan-kireema',
    title: 'ගස්ලබු ගෙඩියේ ඇට ගණන් කිරීම',
    description: 'Can you guess the exact number of seeds in the Papaya? Place your guess!',
    price: 20,
    playMode: 'number',
    guessLabel: 'ඇට ගණන (Number of Seeds)',
    hint: '',
    icon: '🍉'
  }
];

export const updatePaymentStatus = async (id, isPaid) => {
  try {
    const res = await fetch('/api/registrations', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isPaid })
    });
    return await res.json();
  } catch (err) {
    console.error(err);
    return { success: false };
  }
};
export const updateManualWinnerStatus = async (id, isManualWinner) => {
  try {
    const res = await fetch('/api/registrations', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isManualWinner })
    });
    return await res.json();
  } catch (err) {
    console.error(err);
    return { success: false };
  }
};
