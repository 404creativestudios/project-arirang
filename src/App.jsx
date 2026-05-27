import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, MapPin, Ticket, Compass, CheckSquare, AlertTriangle,
  DollarSign, Info, Map, Sparkles, Bus, Car, CheckCircle, Search, Newspaper,
  ExternalLink, Trash2, Lightbulb, Backpack, Coffee, Menu, X,
  Calculator, ArrowRight, ThumbsUp, Heart, Zap, CreditCard, Tv, Share2, Download
} from 'lucide-react';

// ---------- Supabase config ----------
// Set these as environment variables in Netlify, prefixed with VITE_
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

// ---------- Stage configuration ----------

const STAGE_CUTOFF = new Date('2026-06-12T00:00:00+08:00');

const getCurrentStage = (now) => {
  return now < STAGE_CUTOFF ? 'presale' : 'planning';
};

// Tabs available in each mode
const MODE_TABS = {
  presale: ['dashboard', 'battle-plan', 'checklist', 'tips', 'news'],
  planning: ['dashboard', 'pricing', 'guide', 'packing', 'checklist', 'tips', 'vote', 'news']
};

const MODE_LABELS = {
  presale: 'Presale Mode',
  planning: 'Concert Planning'
};

const MODE_DESCRIPTIONS = {
  presale: 'Survive ticket sales',
  planning: 'Plan your March 2027 concert'
};

// ---------- Static reference data ----------

const SEAT_TIERS = [
  { id: 'vip', name: 'VIP Soundcheck', price: 25000, color: 'bg-rose-600', border: 'border-rose-500', benefits: ['Floor Standing Ticket', 'Pre-show soundcheck party', 'VIP laminate & lanyard', 'Early entry', 'Early merch access', 'Exclusive VIP gift'] },
  { id: 'floor', name: 'Floor Standing', price: 20000, color: 'bg-pink-500', border: 'border-pink-400', benefits: ['Floor standing section', 'Standard entry timing', 'General grounds access'] },
  { id: 'bleachers1', name: 'Bleachers 1', price: 12500, color: 'bg-violet-600', border: 'border-violet-500', benefits: ['Lower tier seating', 'Elevated 360° view', 'Fixed seating'] },
  { id: 'bleachers2', name: 'Bleachers 2', price: 7500, color: 'bg-blue-500', border: 'border-blue-400', benefits: ['Upper tier seating', 'Budget-friendly', 'Panoramic view'] }
];

const COMMUNITY_TIPS = [
  { id: 1, category: 'ticketing', title: 'Two-ticket limit per account, per show day', body: 'Each Ticketmaster.ph account can buy max 2 tickets per show date during presales and general onsale. Want 4 total? You need 2 accounts or split across both days.', source: 'Live Nation Philippines', url: 'https://livenation.ph' },
  { id: 2, category: 'ticketing', title: 'Match your Weverse and Ticketmaster names', body: 'Past Live Nation PH presales had failed checkouts because Weverse names did not match Ticketmaster billing info. Sync them before June 9.', source: 'Community advisory', url: null },
  { id: 3, category: 'venue', title: 'PSS is fully open-air', body: 'Unlike Philippine Arena next door, PSS is an outdoor stadium. Bring sunscreen, hand fan, umbrella, and electrolytes. March afternoons in Bulacan are brutal.', source: 'Venue specs', url: 'https://en.wikipedia.org/wiki/Philippine_Sports_Stadium' },
  { id: 4, category: 'venue', title: 'Soft water bottle, not hard tumbler', body: 'Past concerts at Ciudad de Victoria confiscated hard plastic and metal tumblers at the gate. Foldable silicone or empty soft bottles you refill inside are the safer bet.', source: 'Past concertgoer reports', url: null },
  { id: 5, category: 'travel', title: 'Egress traffic takes 2 to 3 hours', body: 'After Coldplay and similar shows at the complex, fans sat in cars or buses for hours waiting to exit. Book P2P shuttle, plan to wait at the food pavilion, or stay overnight in Bocaue.', source: 'Past concertgoer reports', url: null },
  { id: 6, category: 'travel', title: 'SM Tickets x Ticketmaster partnership', body: 'SM Tickets confirmed a Ticketmaster partnership for this tour. Watch for official P2P shuttle bookings from SM North EDSA and SM MOA closer to March 2027.', source: 'Philstar.com', url: 'https://www.philstar.com/entertainment/korean-wave/2026/05/22/2529769/bts-announce-philippine-concerts-venue-ticket-prices' },
  { id: 7, category: 'venue', title: '360° stage with 4 catwalks', body: 'BTS uses a 360-degree center stage extended by 4 catwalks to the stadium corners. Bleacher sections get reasonably good sight lines compared to traditional end-stage layouts.', source: 'Philstar.com', url: 'https://www.philstar.com/entertainment/korean-wave/2026/05/22/2529769/bts-announce-philippine-concerts-venue-ticket-prices' },
  { id: 8, category: 'venue', title: 'Eat before you enter', body: 'Food stalls inside get crowded and prices spike on concert day. Full meal in Bocaue or at an NLEX stop before heading in.', source: 'Community advisory', url: null },
  { id: 9, category: 'venue', title: 'ARMY Zone booth (coming soon)', body: 'Past ARIRANG stops featured a physical ARMY Zone fan club booth at the venue for membership holders with exclusive perks. Whether Bulacan will have one is not yet confirmed. Once info drops, we will update this tip with what to bring and when it is open.', source: 'Tour history', url: null }
];

const TIP_META = {
  ticketing: { label: 'Ticketing', color: 'text-rose-400', bg: 'bg-rose-950/40', border: 'border-rose-500/30' },
  venue: { label: 'Venue', color: 'text-violet-400', bg: 'bg-violet-950/40', border: 'border-violet-500/30' },
  travel: { label: 'Travel', color: 'text-blue-400', bg: 'bg-blue-950/40', border: 'border-blue-500/30' }
};

const DEFAULT_TODOS_BY_MODE = {
  presale: [
    { id: 1, text: 'Register on Weverse for ARMY Presale (closes May 27, 10 PM)', category: 'ticketing', completed: false },
    { id: 2, text: 'Create & verify LiveNation.ph account', category: 'ticketing', completed: false },
    { id: 3, text: 'Create & verify Ticketmaster.ph account', category: 'ticketing', completed: false },
    { id: 4, text: 'Match Weverse name with Ticketmaster billing info', category: 'ticketing', completed: false }
  ],
  planning: [
    { id: 5, text: 'Top up Easytrip RFID for NLEX', category: 'travel', completed: false },
    { id: 6, text: 'Book shuttle or carpool slots from Manila', category: 'travel', completed: false },
    { id: 7, text: 'Buy 20,000mAh+ power bank', category: 'packing', completed: false },
    { id: 8, text: 'Break in thick-soled sneakers', category: 'packing', completed: false }
  ]
};

// Combined default for first-time users (full list, all categories)
const DEFAULT_TODOS = [...DEFAULT_TODOS_BY_MODE.presale, ...DEFAULT_TODOS_BY_MODE.planning];

const MILESTONES = [
  { name: 'Weverse Registration Closes', date: new Date('2026-05-27T22:00:00+08:00'), desc: 'Last day to register for ARMY Presale access.' },
  { name: 'ARMY Membership Presale', date: new Date('2026-06-09T11:00:00+08:00'), desc: 'Ticketmaster.ph opens for registered ARMY members.' },
  { name: 'Live Nation Presale', date: new Date('2026-06-10T11:00:00+08:00'), desc: 'Pre-sale for Live Nation PH members.' },
  { name: 'General Onsale', date: new Date('2026-06-11T11:00:00+08:00'), desc: 'Public ticket sale opens.' },
  { name: 'ARIRANG Day 1', date: new Date('2027-03-13T17:00:00+08:00'), desc: 'First night at Philippine Sports Stadium.' },
  { name: 'ARIRANG Day 2', date: new Date('2027-03-14T17:00:00+08:00'), desc: 'Final night of the Manila leg.' }
];

// ---------- Voting feature config ----------

const VOTE_OPTIONS = [
  { key: 'survival_toolkit', title: 'Offline Survival Toolkit', desc: 'A single offline-ready page that bundles your ticket info, venue map, shuttle and parking details, and emergency contacts. Loads instantly even when cell signal dies in the 50,000-person crowd.', icon: '📡' },
  { key: 'souvenir_diary', title: 'Post-Concert Souvenir Diary', desc: 'Capture your favorite moments from the show and export them as a shareable polaroid-style keepsake image. Available the morning after Day 2.', icon: '📔' },
  { key: 'weather_war_room', title: 'Weather War Room', desc: 'Real-time weather alerts for concert day. If rain is forecast, get specific guidance on what to bring, what to leave behind, and how to protect your lightstick and photocards. Built from the Goyang lessons.', icon: '🌧️' },
  { key: 'egress_status', title: 'Egress Traffic Live Status', desc: 'Real-time crowd-sourced reports on which exit routes are moving and which parking lots are still gridlocked, so you know when it is safe to leave.', icon: '🚦' }
];

const SUGGESTION_KEY = 'have_another_idea';

// ---------- localStorage ----------

const STORAGE_KEY = 'project-arirang-v1';

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const saveState = (state) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch { /* fail silently */ }
};

// ---------- Supabase helpers ----------

const supabaseFetch = async (path, options = {}) => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase not configured');
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...(options.headers || {})
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase ${res.status}: ${text}`);
  }
  return res.json();
};

const fetchVotes = async () => {
  return supabaseFetch('feature_votes?select=*');
};

const incrementVote = async (key) => {
  // Use a Postgres RPC function for atomic increment (defined in SQL setup)
  return supabaseFetch('rpc/increment_vote', {
    method: 'POST',
    body: JSON.stringify({ feature_key: key })
  });
};

const decrementVote = async (key) => {
  return supabaseFetch('rpc/decrement_vote', {
    method: 'POST',
    body: JSON.stringify({ feature_key: key })
  });
};

// ---------- Main App ----------

export default function App() {
  const persisted = loadState();

  // User-selected mode. Defaults based on date, but user can override.
  const [userMode, setUserMode] = useState(() => {
    return persisted?.userMode || getCurrentStage(new Date());
  });

  const [showTipModal, setShowTipModal] = useState(false);
  const [shareToast, setShareToast] = useState('');

  const [activeTab, setActiveTab] = useState(() => {
    const initialMode = persisted?.userMode || getCurrentStage(new Date());
    return initialMode === 'presale' ? 'battle-plan' : 'dashboard';
  });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todos, setTodos] = useState(persisted?.todos || DEFAULT_TODOS);
  const [selectedTierId, setSelectedTierId] = useState(persisted?.selectedTierId || 'vip');
  const [ticketQty, setTicketQty] = useState(persisted?.ticketQty || 1);
  const [presaleChecks, setPresaleChecks] = useState(persisted?.presaleChecks || {
    paymentReady: false,
    ticketmasterLoggedIn: false,
    weverseCodeReady: false
  });
  const [tripExpenses, setTripExpenses] = useState(persisted?.tripExpenses || {
    transport: 900, hotel: 0, food: 1500, merch: 2000, extras: 500
  });
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoCategory, setNewTodoCategory] = useState('ticketing');
  const [tipFilter, setTipFilter] = useState('all');
  const [tipSearch, setTipSearch] = useState('');

  // Packing generator
  const [packingInputs, setPackingInputs] = useState({ section: 'floor', day: 'day1', origin: 'manila-day-trip' });

  // Voting state
  // myVote = the key of the option this device has voted for, or null
  // mySuggested = true if this device ticked the suggestion box
  const [myVote, setMyVote] = useState(persisted?.myVote || null);
  const [mySuggested, setMySuggested] = useState(persisted?.mySuggested || false);
  const [voteCounts, setVoteCounts] = useState({}); // { key: count, have_another_idea: count }
  const [voteLoading, setVoteLoading] = useState(true);
  const [voteError, setVoteError] = useState(null);
  const [voteBusy, setVoteBusy] = useState(false);

  // News
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(null);

  const selectedTier = SEAT_TIERS.find(t => t.id === selectedTierId) || SEAT_TIERS[0];

  // Tick clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Persist state
  useEffect(() => {
    saveState({ todos, selectedTierId, ticketQty, tripExpenses, myVote, mySuggested, presaleChecks, userMode });
  }, [todos, selectedTierId, ticketQty, tripExpenses, myVote, mySuggested, presaleChecks, userMode]);

  // Fetch votes on mount and every 60s
  useEffect(() => {
    const loadVotes = async () => {
      try {
        const rows = await fetchVotes();
        const counts = {};
        rows.forEach(r => { counts[r.feature_key] = r.vote_count; });
        setVoteCounts(counts);
        setVoteError(null);
      } catch (err) {
        setVoteError('Could not load current vote counts. Your vote will still register when you tap.');
      } finally {
        setVoteLoading(false);
      }
    };
    loadVotes();
    const timer = setInterval(loadVotes, 60000);
    return () => clearInterval(timer);
  }, []);

  // News fetch
  useEffect(() => {
    const fetchNews = async () => {
      setNewsLoading(true);
      setNewsError(null);
      const feeds = [
        { url: 'https://philstarlife.com/rss', source: 'PhilSTAR Life' },
        { url: 'https://mb.com.ph/category/entertainment/feed', source: 'Manila Bulletin' }
      ];
      try {
        const results = await Promise.allSettled(
          feeds.map(f =>
            fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(f.url)}`)
              .then(r => r.json())
              .then(data => ({ source: f.source, items: data.items || [] }))
          )
        );
        const allItems = [];
        results.forEach(result => {
          if (result.status === 'fulfilled') {
            result.value.items.forEach(item => {
              const text = `${item.title || ''} ${item.description || ''}`.toLowerCase();
              if (text.includes('bts') || text.includes('arirang') || text.includes('army') || text.includes('k-pop') || text.includes('kpop') || text.includes('concert') || text.includes('live nation') || text.includes('ticketmaster')) {
                allItems.push({
                  title: item.title,
                  link: item.link,
                  pubDate: item.pubDate,
                  source: result.value.source,
                  description: (item.description || '').replace(/<[^>]*>/g, '').slice(0, 200)
                });
              }
            });
          }
        });
        allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
        setNews(allItems.slice(0, 8));
        if (allItems.length === 0) {
          setNewsError('No matching concert news in the feeds right now. Check Live Nation PH and Weverse directly.');
        }
      } catch {
        setNewsError('Could not load news. Try refreshing in a moment.');
      } finally {
        setNewsLoading(false);
      }
    };
    fetchNews();
    const newsTimer = setInterval(fetchNews, 10 * 60 * 1000);
    return () => clearInterval(newsTimer);
  }, []);

  const getCountdown = (targetDate) => {
    const total = targetDate - currentTime;
    if (total <= 0) return { expired: true, formatted: 'Completed' };
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    return { expired: false, days, hours, minutes, seconds, formatted: `${days}d ${hours}h ${minutes}m ${seconds}s` };
  };

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    setTodos([...todos, { id: Date.now(), text: newTodoText.trim(), category: newTodoCategory, completed: false }]);
    setNewTodoText('');
  };

  const toggleTodo = (id) => setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const deleteTodo = (id) => setTodos(todos.filter(t => t.id !== id));

  // Vote handler. Handles: voting fresh, switching vote, un-voting.
  const handleVote = async (key) => {
    if (voteBusy) return;
    setVoteBusy(true);
    setVoteError(null);

    try {
      // If user is switching their vote, decrement the old one first
      if (myVote && myVote !== key) {
        await decrementVote(myVote);
        setVoteCounts(prev => ({ ...prev, [myVote]: Math.max(0, (prev[myVote] || 0) - 1) }));
      }

      // If tapping the same option again, treat as un-vote
      if (myVote === key) {
        await decrementVote(key);
        setVoteCounts(prev => ({ ...prev, [key]: Math.max(0, (prev[key] || 0) - 1) }));
        setMyVote(null);
      } else {
        await incrementVote(key);
        setVoteCounts(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
        setMyVote(key);
      }
    } catch (err) {
      setVoteError('Vote could not be saved. Check your connection and try again.');
    } finally {
      setVoteBusy(false);
    }
  };

  // Suggestion checkbox handler. Independent of the main vote.
  const handleSuggestion = async () => {
    if (voteBusy) return;
    setVoteBusy(true);
    setVoteError(null);
    try {
      if (mySuggested) {
        await decrementVote(SUGGESTION_KEY);
        setVoteCounts(prev => ({ ...prev, [SUGGESTION_KEY]: Math.max(0, (prev[SUGGESTION_KEY] || 0) - 1) }));
        setMySuggested(false);
      } else {
        await incrementVote(SUGGESTION_KEY);
        setVoteCounts(prev => ({ ...prev, [SUGGESTION_KEY]: (prev[SUGGESTION_KEY] || 0) + 1 }));
        setMySuggested(true);
      }
    } catch (err) {
      setVoteError('Could not save. Check your connection and try again.');
    } finally {
      setVoteBusy(false);
    }
  };

  const ticketSubtotal = selectedTier.price * ticketQty;
  const otherExpenses = Object.values(tripExpenses).reduce((a, b) => a + b, 0) * ticketQty;
  const totalTripCost = ticketSubtotal + otherExpenses;

  // Mode-aware tip filtering: presale mode shows only ticketing tips, planning mode shows venue + travel tips
  const ALLOWED_CATEGORIES_BY_MODE = {
    presale: ['ticketing'],
    planning: ['venue', 'travel']
  };

  const filteredTips = COMMUNITY_TIPS.filter(tip => {
    const isAllowedForMode = ALLOWED_CATEGORIES_BY_MODE[userMode].includes(tip.category);
    if (!isAllowedForMode) return false;
    const matchesCategory = tipFilter === 'all' || tip.category === tipFilter;
    const matchesSearch = !tipSearch || tip.title.toLowerCase().includes(tipSearch.toLowerCase()) || tip.body.toLowerCase().includes(tipSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const nextMilestone = MILESTONES.find(m => m.date > currentTime) || MILESTONES[MILESTONES.length - 1];

  // What date-based stage we're actually in (used for context/labels, not tab filtering)
  const dateStage = getCurrentStage(currentTime);

  // Find the next ticketing-related milestone for Battle Plan
  const ticketingMilestones = MILESTONES.filter(m =>
    ['Weverse Registration Closes', 'ARMY Membership Presale', 'Live Nation Presale', 'General Onsale'].includes(m.name)
  );
  const nextTicketingMilestone = ticketingMilestones.find(m => m.date > currentTime);

  // Check if we're within 30 minutes of a presale opening
  const isWithin30MinOfPresale = nextTicketingMilestone &&
    nextTicketingMilestone.name !== 'Weverse Registration Closes' &&
    (nextTicketingMilestone.date - currentTime) <= 30 * 60 * 1000 &&
    (nextTicketingMilestone.date - currentTime) > 0;

  // Packing list generator
  const generatePackingList = () => {
    const base = [
      { item: 'Concert ticket (printed + screenshot)', critical: true },
      { item: 'Valid government ID matching ticket name', critical: true },
      { item: 'Power bank (20,000mAh+)', critical: true },
      { item: 'Phone charging cable', critical: true },
      { item: 'Cash (₱1,000-2,000) for food and emergencies', critical: false },
      { item: 'Sunscreen SPF 50+', critical: false },
      { item: 'Hand fan (battery or manual)', critical: false },
      { item: 'Wet wipes & tissue', critical: false },
      { item: 'Small towel for sweat', critical: false }
    ];
    if (packingInputs.section === 'floor' || packingInputs.section === 'vip') {
      base.push(
        { item: 'Comfortable, broken-in sneakers (you will stand for hours)', critical: true },
        { item: 'No bag or very small clear bag (faster security)', critical: false },
        { item: 'Hair tie if you have long hair', critical: false }
      );
    } else {
      base.push(
        { item: 'Light jacket (bleachers get breezy at night)', critical: false },
        { item: 'Small cushion or jacket to sit on', critical: false }
      );
    }
    if (packingInputs.origin === 'manila-day-trip') {
      base.push(
        { item: 'Loaded Easytrip RFID', critical: true },
        { item: 'Carpool/shuttle confirmation screenshot', critical: true },
        { item: 'Snacks for NLEX traffic', critical: false }
      );
    } else if (packingInputs.origin === 'overnight-bulacan') {
      base.push(
        { item: 'Hotel booking confirmation', critical: true },
        { item: 'Overnight clothes & toiletries', critical: true },
        { item: 'Outfit for next day', critical: false }
      );
    } else if (packingInputs.origin === 'province') {
      base.push(
        { item: 'Bus or flight tickets', critical: true },
        { item: 'Hotel booking confirmation', critical: true },
        { item: 'Multi-day outfits & toiletries', critical: true },
        { item: 'Earphones for travel', critical: false }
      );
    }
    if (packingInputs.day === 'both') {
      base.push(
        { item: 'Second day outfit', critical: false },
        { item: 'Backup lightstick batteries', critical: false }
      );
    }
    base.push(
      { item: 'Soft/collapsible water bottle (hard tumblers banned)', critical: true },
      { item: 'Lightstick (ARMY Bomb)', critical: false }
    );
    return base;
  };

  const generateTimingPlan = () => {
    const isVIP = packingInputs.section === 'vip';

    const plans = {
      'manila-day-trip': isVIP ? [
        { time: '8:00 AM', task: 'Leave Manila. VIP entry is 5 hours before showtime so you need to be early.' },
        { time: '10:30 AM', task: 'Arrive Bulacan. Eat at SM Marilao before heading to the venue.' },
        { time: '12:00 PM', task: 'Head to the venue. VIP queue forms early.' },
        { time: '2:00 PM', task: 'VIP Soundcheck entry begins (5 hours before show).' },
        { time: '3:30 PM', task: 'Soundcheck party / pre-show experience.' },
        { time: '5:00 PM', task: 'Main gates open for everyone.' },
        { time: '7:00 PM', task: 'Show starts.' },
        { time: '10:30 PM', task: 'Show ends. Wait at food pavilion 30-60 min before driving back.' },
        { time: '12:00 AM', task: 'Begin egress. Expect 2-3 hours back to Manila.' }
      ] : [
        { time: '10:00 AM', task: 'Leave Manila. NLEX gets gridlocked after 1 PM.' },
        { time: '12:30 PM', task: 'Arrive Bulacan. Eat full meal in Bocaue or at SM Marilao.' },
        { time: '2:00 PM', task: 'Head to venue. Park near Manila-bound exits if driving.' },
        { time: '3:00 PM', task: 'Join the queue. Apply sunscreen, drink water.' },
        { time: '5:00 PM', task: 'Gates open (estimated). Have ticket and ID ready.' },
        { time: '7:00 PM', task: 'Show starts. Phone in front pocket.' },
        { time: '10:30 PM', task: 'Show ends. WAIT at food pavilion 30-60 min before driving back.' },
        { time: '12:00 AM', task: 'Begin egress. Expect 2-3 hours back to Manila.' }
      ],
      'overnight-bulacan': isVIP ? [
        { time: '10:00 AM', task: 'Check into hotel in Bocaue or Santa Maria.' },
        { time: '12:00 PM', task: 'Lunch and rest. Hydrate.' },
        { time: '1:30 PM', task: 'Head to venue. VIP queue forms early.' },
        { time: '2:00 PM', task: 'VIP Soundcheck entry begins (5 hours before show).' },
        { time: '3:30 PM', task: 'Soundcheck party / pre-show experience.' },
        { time: '5:00 PM', task: 'Main gates open for everyone.' },
        { time: '7:00 PM', task: 'Show starts.' },
        { time: '10:30 PM', task: 'Show ends. Walk back or grab trike to hotel.' },
        { time: '11:30 PM', task: 'Crash. Skip the egress nightmare entirely.' }
      ] : [
        { time: '12:00 PM', task: 'Check into hotel in Bocaue or Santa Maria.' },
        { time: '2:00 PM', task: 'Lunch and rest. Hydrate.' },
        { time: '4:00 PM', task: 'Head to venue (10-15 min if hotel is close).' },
        { time: '5:00 PM', task: 'Gates open. Have everything ready.' },
        { time: '7:00 PM', task: 'Show starts.' },
        { time: '10:30 PM', task: 'Show ends. Walk back or grab trike to hotel.' },
        { time: '11:30 PM', task: 'Crash. Skip the egress nightmare entirely.' }
      ],
      'province': isVIP ? [
        { time: 'Day before', task: 'Travel to Manila. Check into hotel near NLEX entry.' },
        { time: 'Concert day 8 AM', task: 'Leave for Bulacan via NLEX. VIP needs to arrive early.' },
        { time: '10:30 AM', task: 'Arrive, eat at Bocaue or SM Marilao.' },
        { time: '12:00 PM', task: 'Head to venue.' },
        { time: '2:00 PM', task: 'VIP Soundcheck entry begins.' },
        { time: '5:00 PM', task: 'Main gates open.' },
        { time: '7:00 PM', task: 'Show starts.' },
        { time: '10:30 PM', task: 'Show ends. Return to Manila hotel.' },
        { time: 'Next day', task: 'Travel back to province.' }
      ] : [
        { time: 'Day before', task: 'Travel to Manila. Check into hotel near NLEX entry.' },
        { time: 'Concert day 10 AM', task: 'Leave for Bulacan via NLEX.' },
        { time: '12:30 PM', task: 'Arrive, eat at Bocaue or SM Marilao.' },
        { time: '2:00 PM', task: 'Head to venue.' },
        { time: '5:00 PM', task: 'Gates open.' },
        { time: '7:00 PM', task: 'Show starts.' },
        { time: '10:30 PM', task: 'Show ends. Wait out traffic, return to Manila hotel.' },
        { time: 'Next day', task: 'Travel back to province.' }
      ]
    };
    return plans[packingInputs.origin] || plans['manila-day-trip'];
  };

  const ALL_TABS = [
    { id: 'dashboard', icon: Compass, label: 'Dashboard' },
    { id: 'battle-plan', icon: Zap, label: 'Battle Plan' },
    { id: 'pricing', icon: Calculator, label: 'Trip Cost' },
    { id: 'guide', icon: MapPin, label: 'Travel Guide' },
    { id: 'packing', icon: Backpack, label: 'My Plan' },
    { id: 'checklist', icon: CheckSquare, label: 'Checklist' },
    { id: 'tips', icon: Lightbulb, label: 'Tips' },
    { id: 'vote', icon: ThumbsUp, label: 'What Should I Build Next?' },
    { id: 'news', icon: Newspaper, label: 'News', live: true }
  ];

  const TABS = ALL_TABS.filter(t => MODE_TABS[userMode].includes(t.id));

  // Share handler. Uses Web Share API on mobile/supporting browsers,
  // falls back to copying URL to clipboard.
  const handleShare = async () => {
    const shareData = {
      title: 'Project Arirang',
      text: 'A free tracker for ARMYs going to BTS in Bulacan 2027. Logistics, trip cost, prep, and more.',
      url: window.location.origin
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or share failed silently
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareData.url);
        setShareToast('Link copied to clipboard!');
        setTimeout(() => setShareToast(''), 2500);
      } catch {
        setShareToast('Could not copy. URL: ' + shareData.url);
        setTimeout(() => setShareToast(''), 5000);
      }
    }
  };

  // Switch mode and reset to a sensible default tab for that mode
  const switchMode = (newMode) => {
    setUserMode(newMode);
    setActiveTab(newMode === 'presale' ? 'battle-plan' : 'dashboard');
    setMobileNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased">
      {/* Top ticker */}
      <div className="bg-gradient-to-r from-purple-900 via-rose-900 to-indigo-950 text-white px-3 py-2 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-md border-b border-purple-500/20">
        <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap min-w-0">
          <span className="bg-rose-600 animate-pulse text-[10px] uppercase px-1.5 py-0.5 rounded-full font-bold shrink-0">
            {userMode === 'presale' ? 'PRESALE' : 'NEXT'}
          </span>
          <p className="truncate">
            {userMode === 'presale' && nextTicketingMilestone
              ? `${nextTicketingMilestone.name} · ${nextTicketingMilestone.date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}`
              : `${nextMilestone.name} · ${nextMilestone.date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}`
            }
          </p>
        </div>
        <div className="hidden md:flex items-center gap-4 text-xs text-slate-200 shrink-0">
          <span>{currentTime.toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}</span>
        </div>
      </div>

      {/* Header */}
      <header className="relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-purple-950/60 to-slate-950 border-b border-slate-800 px-4 sm:px-6 py-5 sm:py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5 text-rose-500 font-bold uppercase tracking-widest text-[10px] sm:text-sm">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-spin-slow" />
              <span>BTS World Tour in Bulacan, Philippines</span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-purple-200 to-rose-400 bg-clip-text text-transparent">
              Project Arirang
            </h1>
            <p className="text-slate-400 mt-1.5 sm:mt-2 max-w-xl text-xs sm:text-sm md:text-base">
              {userMode === 'presale'
                ? 'Survive the ticket presale, then plan your trip to the 360° show at Philippine Sports Stadium, March 13-14, 2027.'
                : 'Logistics, costs, and prep tracker for the final show of the 85-concert ARIRANG World Tour, March 13-14, 2027.'}
            </p>
          </div>

          <div className="bg-slate-900/95 border border-purple-500/30 p-3 sm:p-4 rounded-xl flex items-center gap-3 sm:gap-4 shadow-xl">
            <div className="p-2 sm:p-3 bg-purple-950/80 rounded-lg text-purple-400">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-slate-400 uppercase font-medium truncate">{nextMilestone.name}</p>
              <p className="text-base sm:text-xl font-mono font-bold text-rose-400">{getCountdown(nextMilestone.date).formatted}</p>
              <p className="text-[10px] sm:text-xs text-slate-500 italic mt-0.5">{nextMilestone.date.toLocaleString('en-PH', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Manila' })}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Mode Toggle - Big and prominent */}
      <div className="bg-slate-950 border-b border-slate-800 px-3 sm:px-4 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-widest font-bold mb-2 text-center sm:text-left">
            What do you need today?
          </p>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {['presale', 'planning'].map((mode) => {
              const isActive = userMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => switchMode(mode)}
                  className={`p-3 sm:p-4 rounded-xl border-2 transition-all text-left ${
                    isActive
                      ? mode === 'presale'
                        ? 'bg-gradient-to-br from-amber-900/60 to-rose-900/40 border-amber-400 shadow-lg shadow-amber-500/10'
                        : 'bg-gradient-to-br from-purple-900/60 to-indigo-900/40 border-purple-400 shadow-lg shadow-purple-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {mode === 'presale' ? (
                      <Zap className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-amber-300' : 'text-slate-500'}`} />
                    ) : (
                      <Calendar className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-purple-300' : 'text-slate-500'}`} />
                    )}
                    <h3 className={`text-sm sm:text-base font-black ${isActive ? 'text-white' : 'text-slate-400'}`}>
                      {MODE_LABELS[mode]}
                    </h3>
                    {isActive && (
                      <span className="ml-auto text-[9px] sm:text-[10px] bg-white/10 text-white px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Active
                      </span>
                    )}
                  </div>
                  <p className={`text-[10px] sm:text-xs ${isActive ? 'text-slate-200' : 'text-slate-500'}`}>
                    {MODE_DESCRIPTIONS[mode]}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile tab bar */}
      <div className="lg:hidden bg-slate-900/95 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center justify-between px-3 py-2.5">
          <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="flex items-center gap-2 text-sm font-bold text-slate-200">
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            <span className="truncate max-w-[200px]">{TABS.find(t => t.id === activeTab)?.label}</span>
          </button>
          <span className="text-[10px] text-slate-500 font-mono">{todos.filter(t => !t.completed).length} pending</span>
        </div>
        {mobileNavOpen && (
          <div className="border-t border-slate-800 p-2 grid grid-cols-1 gap-1.5">
            {TABS.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setMobileNavOpen(false); }}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all text-left ${activeTab === item.id ? 'bg-gradient-to-r from-purple-900 to-rose-900 text-white' : 'bg-slate-800 text-slate-300'}`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
                {item.live && <span className="ml-auto w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">

        {/* Desktop sidebar */}
        <aside className="hidden lg:block lg:col-span-1 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg sticky top-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest px-3 mb-3">Sections</p>
            <nav className="space-y-1.5">
              {TABS.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${activeTab === item.id ? 'bg-gradient-to-r from-purple-900 to-rose-900 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {item.id === 'checklist' && (
                    <span className="ml-auto bg-slate-950 text-rose-400 text-xs px-2 py-0.5 rounded-full font-bold shrink-0">{todos.filter(t => !t.completed).length}</span>
                  )}
                  {item.live && (
                    <span className="ml-auto bg-green-500/10 text-green-400 text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> LIVE
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <section className="lg:col-span-3 space-y-4 sm:space-y-6">

          {/* BATTLE PLAN */}
          {activeTab === 'battle-plan' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Active 30-min war room mode */}
              {isWithin30MinOfPresale && (
                <div className="bg-gradient-to-r from-rose-900 via-red-900 to-rose-950 border-2 border-rose-400 p-4 sm:p-5 rounded-2xl shadow-2xl space-y-4 animate-pulse">
                  <div className="flex items-center gap-2">
                    <Zap className="w-6 h-6 text-yellow-300" />
                    <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">War Room Active</h3>
                  </div>
                  <p className="text-sm text-white leading-relaxed font-semibold">
                    {nextTicketingMilestone.name} opens in {Math.ceil((nextTicketingMilestone.date - currentTime) / 60000)} minutes. Get ready NOW.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <a
                      href="https://ticketmaster.ph"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white text-rose-900 text-sm font-black px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-amber-100 transition-colors"
                    >
                      <Ticket className="w-4 h-4" />
                      Open Ticketmaster.ph
                    </a>
                    <a
                      href="https://weverse.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-purple-100 text-purple-900 text-sm font-black px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-purple-200 transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                      Open Weverse
                    </a>
                  </div>
                </div>
              )}

              {/* Main Battle Plan card */}
              <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    Presale Battle Plan
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Survive the ticket presale frenzy. Use this checklist before, during, and after each ticketing milestone.</p>
                </div>

                {/* Live countdown to next milestone */}
                {nextTicketingMilestone && (
                  <div className="bg-gradient-to-br from-amber-950/40 to-slate-950 border border-amber-500/30 p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <p className="text-[10px] sm:text-xs font-bold text-amber-300 uppercase tracking-wider">Next Up</p>
                      <span className="text-[10px] text-slate-500">{nextTicketingMilestone.date.toLocaleString('en-PH', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Manila' })} PHT</span>
                    </div>
                    <h4 className="text-base sm:text-lg font-extrabold text-white">{nextTicketingMilestone.name}</h4>
                    <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">{nextTicketingMilestone.desc}</p>
                    <p className="font-mono font-black text-lg sm:text-xl text-rose-400 pt-1">
                      {getCountdown(nextTicketingMilestone.date).formatted}
                    </p>
                  </div>
                )}

                {/* Pre-checkout checklist */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Before The Queue Opens</p>
                    <span className="text-[10px] text-slate-500">{Object.values(presaleChecks).filter(Boolean).length}/3 ready</span>
                  </div>

                  {[
                    { key: 'paymentReady', icon: CreditCard, label: 'Payment card details ready', hint: 'Card number, CVV, expiry, and billing address matching your Ticketmaster account' },
                    { key: 'ticketmasterLoggedIn', icon: Ticket, label: 'Logged into Ticketmaster.ph (open 2 tabs)', hint: 'Two browser tabs in case one freezes. Same account on both.' },
                    { key: 'weverseCodeReady', icon: Heart, label: 'Weverse code visible (ARMY presale only)', hint: 'Have your ARMY Membership code copied or in a visible tab' }
                  ].map(({ key, icon: Icon, label, hint }) => (
                    <div
                      key={key}
                      onClick={() => setPresaleChecks({ ...presaleChecks, [key]: !presaleChecks[key] })}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${presaleChecks[key] ? 'bg-emerald-950/30 border-emerald-500/40' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`w-5 h-5 rounded border flex items-center justify-center text-[10px] shrink-0 mt-0.5 ${presaleChecks[key] ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' : 'border-slate-700 bg-slate-950'}`}>
                          {presaleChecks[key] && '✓'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 shrink-0 ${presaleChecks[key] ? 'text-emerald-400' : 'text-slate-500'}`} />
                            <p className={`text-xs sm:text-sm font-semibold ${presaleChecks[key] ? 'text-slate-300' : 'text-slate-200'}`}>{label}</p>
                          </div>
                          <p className="text-[10px] sm:text-[11px] text-slate-500 mt-1 ml-6 leading-relaxed">{hint}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick links */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                  <a
                    href="https://ticketmaster.ph"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 p-3 rounded-xl flex items-center gap-2 transition-all"
                  >
                    <Ticket className="w-4 h-4 text-purple-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-200">Ticketmaster.ph</p>
                      <p className="text-[10px] text-slate-500 truncate">Buy tickets here</p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  </a>
                  <a
                    href="https://weverse.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 p-3 rounded-xl flex items-center gap-2 transition-all"
                  >
                    <Heart className="w-4 h-4 text-rose-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-200">Weverse</p>
                      <p className="text-[10px] text-slate-500 truncate">ARMY code lives here</p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  </a>
                </div>
              </div>

              {/* What if you fail */}
              <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-400" />
                  If You Don't Get Tickets
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">It's brutal but not the end of the world. Real options:</p>

                <div className="space-y-2">
                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-200 mb-1">Wait for general onsale</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">If ARMY presale didn't work out, June 10 (Live Nation) and June 11 (General) are still options. Be ready for those too.</p>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-200 mb-1 flex items-center gap-2">
                      <Tv className="w-4 h-4 text-blue-400" />
                      Watch in cinema or on Netflix
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">BTS has been streaming select tour shows in cinemas globally and on Netflix. The Bulacan show, as the tour finale, will almost certainly be one of them. Watch for announcements.</p>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-200 mb-1">Don't aggressively refresh</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">In Ticketmaster queues, refreshing kicks you to the back of the line. Wait patiently even if it feels stuck.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4 sm:space-y-6">
              {new Date('2026-05-27T22:00:00+08:00') > currentTime && (
                <div className="bg-gradient-to-r from-red-950/80 via-rose-950/50 to-slate-900 border border-rose-500/30 p-4 rounded-2xl flex flex-col sm:flex-row gap-3 sm:gap-4 items-start shadow-xl">
                  <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-500 shrink-0">
                    <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-rose-300 text-sm sm:text-base">Weverse Registration is open</h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Register before <strong className="text-rose-400">May 27, 10:00 PM PHT</strong> to qualify for the June 9 ARMY Presale. Match Weverse and Ticketmaster.ph account names.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a href="https://btsworldtourofficial.com/" target="_blank" rel="noopener noreferrer" className="bg-rose-600 hover:bg-rose-700 text-white text-xs px-3.5 py-2 rounded-lg font-bold inline-flex items-center gap-1.5 transition-colors">
                        Open Tour Site <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button onClick={() => setActiveTab('checklist')} className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3.5 py-2 rounded-lg font-semibold transition-colors">
                        My Tasks
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                Milestones
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {MILESTONES.map((m, idx) => {
                  const timerObj = getCountdown(m.date);
                  const isNext = !timerObj.expired && m.name === nextMilestone.name;
                  return (
                    <div key={idx} className={`p-3 sm:p-4 rounded-2xl border transition-all relative overflow-hidden shadow-md ${timerObj.expired ? 'bg-slate-900/60 border-slate-800 opacity-65' : isNext ? 'bg-gradient-to-b from-purple-950/40 to-slate-900 border-purple-500/40 ring-1 ring-purple-500/20' : 'bg-slate-900/90 border-slate-800'}`}>
                      {isNext && (
                        <div className="absolute top-2 right-2 bg-rose-600 text-[9px] text-white font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full">Up Next</div>
                      )}
                      <div className="flex items-start gap-2.5 sm:gap-3">
                        <div className={`p-1.5 sm:p-2 rounded-lg mt-0.5 ${timerObj.expired ? 'bg-slate-800 text-slate-500' : isNext ? 'bg-rose-950 text-rose-400' : 'bg-purple-950 text-purple-400'}`}>
                          <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="flex-1 space-y-1 min-w-0">
                          <h4 className="font-extrabold text-xs sm:text-sm text-slate-200">{m.name}</h4>
                          <p className="text-[10px] sm:text-[11px] text-slate-400 leading-snug">{m.desc}</p>
                          <div className="pt-1.5">
                            {timerObj.expired ? (
                              <span className="text-xs text-slate-500 font-semibold italic">Completed</span>
                            ) : (
                              <span className="font-mono font-bold text-rose-400 text-xs sm:text-sm bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 inline-block">{timerObj.formatted}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                {userMode === 'presale' ? (
                  <>
                    <button onClick={() => setActiveTab('battle-plan')} className="bg-gradient-to-br from-amber-950/40 to-slate-900 hover:from-amber-900/40 border border-amber-500/40 p-3 sm:p-4 rounded-xl text-left transition-all">
                      <Zap className="w-4 h-4 text-amber-400 mb-2" />
                      <p className="text-base sm:text-lg font-black text-white">Battle Plan</p>
                      <p className="text-[10px] sm:text-xs text-slate-400">Survive the presale</p>
                    </button>
                    <button onClick={() => setActiveTab('checklist')} className="bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 p-3 sm:p-4 rounded-xl text-left transition-all">
                      <CheckSquare className="w-4 h-4 text-blue-400 mb-2" />
                      <p className="text-base sm:text-lg font-black text-white">{Math.round((todos.filter(t => t.completed).length / Math.max(1, todos.length)) * 100)}%</p>
                      <p className="text-[10px] sm:text-xs text-slate-400">Tasks done</p>
                    </button>
                    <button onClick={() => setActiveTab('tips')} className="bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 p-3 sm:p-4 rounded-xl text-left transition-all">
                      <Lightbulb className="w-4 h-4 text-amber-400 mb-2" />
                      <p className="text-base sm:text-lg font-black text-white">Tips</p>
                      <p className="text-[10px] sm:text-xs text-slate-400">Read before buying</p>
                    </button>
                    <button onClick={() => setActiveTab('news')} className="bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 p-3 sm:p-4 rounded-xl text-left transition-all">
                      <Newspaper className="w-4 h-4 text-rose-400 mb-2" />
                      <p className="text-base sm:text-lg font-black text-white">News</p>
                      <p className="text-[10px] sm:text-xs text-slate-400">Latest updates</p>
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setActiveTab('pricing')} className="bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 p-3 sm:p-4 rounded-xl text-left transition-all">
                      <DollarSign className="w-4 h-4 text-emerald-400 mb-2" />
                      <p className="text-base sm:text-lg font-black text-white">₱{totalTripCost.toLocaleString()}</p>
                      <p className="text-[10px] sm:text-xs text-slate-400">Total trip cost</p>
                    </button>
                    <button onClick={() => setActiveTab('checklist')} className="bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 p-3 sm:p-4 rounded-xl text-left transition-all">
                      <CheckSquare className="w-4 h-4 text-blue-400 mb-2" />
                      <p className="text-base sm:text-lg font-black text-white">{Math.round((todos.filter(t => t.completed).length / Math.max(1, todos.length)) * 100)}%</p>
                      <p className="text-[10px] sm:text-xs text-slate-400">Tasks done</p>
                    </button>
                    <button onClick={() => setActiveTab('vote')} className="bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 p-3 sm:p-4 rounded-xl text-left transition-all">
                      <ThumbsUp className="w-4 h-4 text-purple-400 mb-2" />
                      <p className="text-base sm:text-lg font-black text-white">Vote</p>
                      <p className="text-[10px] sm:text-xs text-slate-400">Shape phase 2</p>
                    </button>
                    <button onClick={() => setActiveTab('packing')} className="bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 p-3 sm:p-4 rounded-xl text-left transition-all">
                      <Backpack className="w-4 h-4 text-amber-400 mb-2" />
                      <p className="text-base sm:text-lg font-black text-white">Plan</p>
                      <p className="text-[10px] sm:text-xs text-slate-400">My day-of</p>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* TRIP COST */}
          {activeTab === 'pricing' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-emerald-400" />
                    Trip Cost Calculator
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">The real cost of going to ARIRANG isn't just the ticket. Adjust the line items below to see your true commitment.</p>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Select Tier</p>
                  <div className="grid grid-cols-2 gap-2">
                    {SEAT_TIERS.map((tier) => (
                      <button
                        key={tier.id}
                        onClick={() => setSelectedTierId(tier.id)}
                        className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all ${selectedTierId === tier.id ? `${tier.border} bg-purple-950/30 ring-1 ring-purple-500/20` : 'border-slate-800 hover:border-slate-700 bg-slate-900/60'}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${tier.color}`} />
                          <h4 className="font-extrabold text-[11px] sm:text-xs text-slate-200">{tier.name}</h4>
                        </div>
                        <p className="text-xs sm:text-sm font-bold text-white mt-1">₱{tier.price.toLocaleString()}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">How many tickets?</p>
                  <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 p-2 rounded-xl">
                    <button onClick={() => setTicketQty(Math.max(1, ticketQty - 1))} className="bg-slate-800 hover:bg-slate-700 w-9 h-9 rounded-lg flex items-center justify-center font-bold text-base">−</button>
                    <span className="flex-1 text-center font-mono font-bold text-sm">{ticketQty} ticket(s)</span>
                    <button onClick={() => setTicketQty(Math.min(6, ticketQty + 1))} className="bg-slate-800 hover:bg-slate-700 w-9 h-9 rounded-lg flex items-center justify-center font-bold text-base">+</button>
                  </div>
                  <p className="text-[10px] text-slate-500 italic">Presale max 2 per account. General onsale max 6.</p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Per-person Expenses</p>
                    <span className="text-[10px] text-slate-500">Adjust to your reality</span>
                  </div>

                  {[
                    { key: 'transport', label: 'Transport (round trip)', max: 5000, hint: 'Carpool ~₱900, Grab ~₱2,500+' },
                    { key: 'hotel', label: 'Hotel (per person share)', max: 8000, hint: 'Set 0 if day trip from Manila' },
                    { key: 'food', label: 'Food', max: 3000, hint: 'Pre-concert meal + venue snacks' },
                    { key: 'merch', label: 'Merch budget', max: 10000, hint: 'Lightstick, shirt, photocards' },
                    { key: 'extras', label: 'Extras (banner, outfit, etc.)', max: 5000, hint: 'Set to your honest number' }
                  ].map(({ key, label, max, hint }) => (
                    <div key={key} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-slate-300">{label}</label>
                        <span className="font-mono text-xs text-emerald-400 font-bold">₱{tripExpenses[key].toLocaleString()}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={max}
                        step="100"
                        value={tripExpenses[key]}
                        onChange={(e) => setTripExpenses({ ...tripExpenses, [key]: Number(e.target.value) })}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                      <p className="text-[10px] text-slate-500 italic">{hint}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-br from-emerald-950/40 to-slate-950 border border-emerald-500/30 p-4 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Your Total Trip Cost</h4>
                  <div className="space-y-1 text-xs text-slate-300">
                    <div className="flex justify-between"><span>Tickets ({ticketQty}x ₱{selectedTier.price.toLocaleString()}):</span><span className="font-mono">₱{ticketSubtotal.toLocaleString()}</span></div>
                    <div className="flex justify-between text-slate-400 italic"><span>+ Ticketmaster fees (varies, check at checkout)</span><span className="font-mono">TBD</span></div>
                    <div className="flex justify-between text-slate-400"><span>Other expenses ({ticketQty}x ₱{Object.values(tripExpenses).reduce((a,b)=>a+b,0).toLocaleString()}):</span><span className="font-mono">₱{otherExpenses.toLocaleString()}</span></div>
                    <div className="border-t border-slate-800 pt-2 mt-2 flex justify-between font-bold text-base sm:text-lg text-white">
                      <span>Total:</span>
                      <span className="font-mono text-emerald-400">₱{totalTripCost.toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-slate-500 italic pt-2 leading-relaxed">
                      That's ₱{Math.round(totalTripCost / Math.max(1, ticketQty)).toLocaleString()} per person. Know what you're committing to before June 9.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TRAVEL GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Map className="w-5 h-5 text-purple-400" />
                    Explore the Venue in 3D
                  </h3>
                  <span className="text-[9px] sm:text-[10px] text-slate-500 bg-slate-950 px-2 py-1 rounded-full font-mono">Drag to rotate &middot; Pinch to zoom</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">Scout the Philippine Sports Stadium layout before you arrive.</p>
                <div className="relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden aspect-video">
                  <iframe
                    title="Philippine Sports Stadium"
                    frameBorder="0"
                    allowFullScreen
                    mozallowfullscreen="true"
                    webkitallowfullscreen="true"
                    allow="autoplay; fullscreen; xr-spatial-tracking"
                    src="https://sketchfab.com/models/bed4fea5af0d486490cad8abec04a91c/embed"
                    className="w-full h-full"
                  />
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 leading-relaxed">
                  3D: <a href="https://sketchfab.com/3d-models/philippine-sports-stadium-bed4fea5af0d486490cad8abec04a91c" target="_blank" rel="noopener noreferrer" className="font-bold text-purple-400 hover:underline">Philippine Sports Stadium</a> by <a href="https://sketchfab.com/matu_palestina" target="_blank" rel="noopener noreferrer" className="font-bold text-purple-400 hover:underline">matu_palestina</a> on <a href="https://sketchfab.com" target="_blank" rel="noopener noreferrer" className="font-bold text-purple-400 hover:underline">Sketchfab</a>
                </p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg space-y-4">
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-rose-500" />
                  Getting to Bulacan
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">PSS is in Ciudad de Victoria, Bocaue/Santa Maria, ~30km north of Manila. Egress traffic can take 2-3 hours, so plan your exit as carefully as your entry.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 pt-2">
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                    <h4 className="font-extrabold text-sm text-purple-400 flex items-center gap-1.5">
                      <Bus className="w-4 h-4" />
                      Shuttles (Recommended)
                    </h4>
                    <div className="space-y-2 text-xs text-slate-300">
                      <div><strong className="text-white">SM Tickets P2P:</strong><p className="text-slate-400 text-[11px] mt-0.5">SM x Ticketmaster confirmed. Watch for buses from SM North EDSA and SM MOA closer to March 2027.</p></div>
                      <div><strong className="text-white">Concert carpools:</strong><p className="text-slate-400 text-[11px] mt-0.5">J&L Carpool and similar run ₱700-900 RT with guaranteed return.</p></div>
                      <div><strong className="text-white">Public commute:</strong><p className="text-slate-400 text-[11px] mt-0.5">P2P SM North EDSA to Bocaue + trike. Trike rates spike on concert days.</p></div>
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                    <h4 className="font-extrabold text-sm text-purple-400 flex items-center gap-1.5">
                      <Car className="w-4 h-4" />
                      Private Vehicle
                    </h4>
                    <div className="space-y-2 text-xs text-slate-300">
                      <div><strong className="text-white">RFID & NLEX:</strong><p className="text-slate-400 text-[11px] mt-0.5">Top up Easytrip in advance. Cashless lanes only.</p></div>
                      <div><strong className="text-white">Parking:</strong><p className="text-slate-400 text-[11px] mt-0.5">Aim for lots near the Manila-bound exits to avoid worst gridlock.</p></div>
                      <div><strong className="text-white">Arrival time:</strong><p className="text-slate-400 text-[11px] mt-0.5">Target 12-1 PM. NLEX crawls from 3 PM onwards on concert days.</p></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weather strategy */}
              <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  If It Rains
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">The Goyang opening night of this tour was performed in heavy rain. PSS is open-air. March in Bulacan can be unpredictable. Here is what to do if the weather turns.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-2">
                    <h4 className="font-extrabold text-sm text-amber-400">Pack ahead</h4>
                    <ul className="text-[11px] text-slate-300 space-y-1.5 list-disc list-inside">
                      <li>Disposable poncho (umbrellas are usually banned at large venues)</li>
                      <li>Waterproof phone pouch (with lanyard so it doesn't drop)</li>
                      <li>Ziploc bags for photocards, tickets, ID</li>
                      <li>Microfiber towel for drying off between songs</li>
                      <li>Spare socks in your bag (wet socks for 4 hours is hell)</li>
                    </ul>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-2">
                    <h4 className="font-extrabold text-sm text-amber-400">If it pours mid-show</h4>
                    <ul className="text-[11px] text-slate-300 space-y-1.5 list-disc list-inside">
                      <li>The show goes on. BTS performed at Goyang in pouring rain. Stay if you can.</li>
                      <li>Protect your lightstick. ARMY Bombs are not waterproof. Bag it if not in use.</li>
                      <li>Check footing. Floor sections get muddy fast. Bleachers stay drier.</li>
                      <li>If lightning starts, organizers may pause the show. Listen for announcements.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MY PLAN */}
          {activeTab === 'packing' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Backpack className="w-5 h-5 text-amber-400" />
                    My Day-Of Plan
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Answer 3 quick questions for a personalized packing list and timing plan.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <label className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Section</label>
                    <select value={packingInputs.section} onChange={(e) => setPackingInputs({...packingInputs, section: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2.5 text-xs focus:ring-1 focus:ring-purple-500 outline-none">
                      <option value="vip">VIP Soundcheck</option>
                      <option value="floor">Floor Standing</option>
                      <option value="bleachers1">Bleachers 1</option>
                      <option value="bleachers2">Bleachers 2</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Which Day?</label>
                    <select value={packingInputs.day} onChange={(e) => setPackingInputs({...packingInputs, day: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2.5 text-xs focus:ring-1 focus:ring-purple-500 outline-none">
                      <option value="day1">Day 1 only (March 13)</option>
                      <option value="day2">Day 2 only (March 14)</option>
                      <option value="both">Both nights</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Travel Plan</label>
                    <select value={packingInputs.origin} onChange={(e) => setPackingInputs({...packingInputs, origin: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-3 py-2.5 text-xs focus:ring-1 focus:ring-purple-500 outline-none">
                      <option value="manila-day-trip">Manila day trip</option>
                      <option value="overnight-bulacan">Overnight in Bulacan</option>
                      <option value="province">From the province</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  Your Day Schedule
                </h3>
                <div className="space-y-2">
                  {generateTimingPlan().map((step, idx) => (
                    <div key={idx} className="flex gap-3 bg-slate-950 border border-slate-800 p-3 rounded-xl">
                      <div className="bg-purple-950/60 text-purple-300 text-[10px] font-mono font-bold px-2 py-1 rounded shrink-0 self-start min-w-[80px] text-center">{step.time}</div>
                      <p className="text-xs text-slate-300 leading-relaxed">{step.task}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Backpack className="w-5 h-5 text-amber-400" />
                  Your Packing List
                </h3>
                <div className="space-y-1.5">
                  {generatePackingList().map((item, idx) => (
                    <div key={idx} className={`flex items-center gap-3 p-2.5 rounded-lg ${item.critical ? 'bg-rose-950/30 border border-rose-500/20' : 'bg-slate-950 border border-slate-800'}`}>
                      {item.critical ? <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" /> : <CheckCircle className="w-4 h-4 text-slate-500 shrink-0" />}
                      <span className="text-xs text-slate-200">{item.item}</span>
                      {item.critical && <span className="ml-auto text-[9px] font-bold text-rose-400 uppercase tracking-wider">Critical</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-rose-500" />
                    Prep Checklist
                  </h3>
                  <span className="text-[10px] sm:text-xs text-slate-400">Saved on this device</span>
                </div>

                <form onSubmit={handleAddTodo} className="flex flex-col gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <input type="text" placeholder="Add a task..." value={newTodoText} onChange={(e) => setNewTodoText(e.target.value)} className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none" />
                  <div className="flex gap-2">
                    <select value={newTodoCategory} onChange={(e) => setNewTodoCategory(e.target.value)} className="flex-1 bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 outline-none">
                      <option value="ticketing">Ticketing</option>
                      <option value="travel">Travel</option>
                      <option value="packing">Packing</option>
                    </select>
                    <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors">Add</button>
                  </div>
                </form>

                {(userMode === 'presale' ? ['ticketing'] : ['travel', 'packing']).map((cat) => {
                  const catTodos = todos.filter(t => t.category === cat);
                  if (catTodos.length === 0) return null;
                  return (
                    <div key={cat} className="space-y-2 pt-2">
                      <h4 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest border-l-2 border-rose-500 pl-2">
                        {cat === 'ticketing' ? 'Ticketing' : cat === 'travel' ? 'Travel' : 'Packing'}
                      </h4>
                      <div className="space-y-1.5">
                        {catTodos.map((todo) => (
                          <div key={todo.id} className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all ${todo.completed ? 'bg-slate-950/40 border-slate-900 text-slate-500' : 'bg-slate-900/60 border-slate-800 text-slate-200'}`}>
                            <div className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0" onClick={() => toggleTodo(todo.id)}>
                              <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] shrink-0 ${todo.completed ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' : 'border-slate-700 bg-slate-950'}`}>
                                {todo.completed && '✓'}
                              </span>
                              <span className={`text-xs font-medium ${todo.completed ? 'line-through' : ''}`}>{todo.text}</span>
                            </div>
                            <button onClick={() => deleteTodo(todo.id)} className="text-slate-500 hover:text-rose-400 p-1.5" aria-label="Delete">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TIPS */}
          {activeTab === 'tips' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg space-y-4">
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-400" />
                  Community Tips
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">Hand-picked advice from official sources and past concertgoers.</p>

                <div className="flex flex-col gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input type="text" placeholder="Search tips..." value={tipSearch} onChange={(e) => setTipSearch(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 outline-none focus:ring-1 focus:ring-purple-500" />
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {['all', ...ALLOWED_CATEGORIES_BY_MODE[userMode]].map(cat => (
                      <button key={cat} onClick={() => setTipFilter(cat)} className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${tipFilter === cat ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        {cat === 'all' ? 'All' : TIP_META[cat].label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5">
                  {filteredTips.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs">No tips match that filter.</div>
                  ) : filteredTips.map(tip => {
                    const meta = TIP_META[tip.category];
                    return (
                      <div key={tip.id} className={`p-3 sm:p-4 rounded-xl border ${meta.bg} ${meta.border}`}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-100">{tip.title}</h4>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${meta.color} bg-slate-950/60 shrink-0`}>{meta.label}</span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed mb-2">{tip.body}</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800/60">
                          <span>Source: {tip.source}</span>
                          {tip.url && (
                            <a href={tip.url} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline flex items-center gap-1">
                              View <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* VOTE TAB */}
          {activeTab === 'vote' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <ThumbsUp className="w-5 h-5 text-purple-400" />
                    What Should I Build Next?
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    I'm planning one extra feature for the actual concert weekend (March 12-15, 2027). Vote for what would be most useful to you. The winner gets built. Voting closes January 2027.
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 italic mt-2">One vote per device. Change your mind anytime by tapping a different option or tapping your current vote again to remove it.</p>
                </div>

                {voteError && (
                  <div className="bg-amber-950/40 border border-amber-500/30 p-3 rounded-xl text-xs text-amber-200">
                    {voteError}
                  </div>
                )}

                {!SUPABASE_URL && (
                  <div className="bg-rose-950/40 border border-rose-500/30 p-3 rounded-xl text-xs text-rose-200">
                    Voting backend not configured yet. See SETUP.md for Supabase setup.
                  </div>
                )}

                <div className="space-y-3">
                  {VOTE_OPTIONS.map((opt) => {
                    const count = voteCounts[opt.key] || 0;
                    const isMyVote = myVote === opt.key;
                    return (
                      <div
                        key={opt.key}
                        className={`p-4 rounded-xl border transition-all ${isMyVote ? 'bg-gradient-to-br from-purple-950/50 to-slate-950 border-purple-500/50 ring-1 ring-purple-500/20' : 'bg-slate-950 border-slate-800'}`}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="text-3xl shrink-0">{opt.icon}</div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm sm:text-base text-slate-100 mb-1">{opt.title}</h4>
                            <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">{opt.desc}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800/60">
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Heart className={`w-3.5 h-3.5 ${count > 0 ? 'text-rose-400' : 'text-slate-600'}`} />
                            <span className="font-mono">
                              {voteLoading ? '...' : `${count.toLocaleString()} ${count === 1 ? 'person wants' : 'people want'} this`}
                            </span>
                          </div>
                          <button
                            onClick={() => handleVote(opt.key)}
                            disabled={voteBusy || !SUPABASE_URL}
                            className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors shrink-0 ${isMyVote ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'} ${(voteBusy || !SUPABASE_URL) ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {isMyVote ? '✓ Voted' : 'Vote'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Suggestion checkbox */}
                <div className={`p-4 rounded-xl border transition-all ${mySuggested ? 'bg-amber-950/30 border-amber-500/40' : 'bg-slate-950 border-slate-800'}`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mySuggested}
                      onChange={handleSuggestion}
                      disabled={voteBusy || !SUPABASE_URL}
                      className="mt-1 w-4 h-4 accent-amber-500 shrink-0 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-slate-200">I have another idea for a concert day feature</p>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 leading-relaxed">
                        If enough people tick this, I'll open suggestions in a later phase.
                        {voteCounts[SUGGESTION_KEY] !== undefined && !voteLoading && (
                          <span className="text-amber-400 font-mono ml-1">({voteCounts[SUGGESTION_KEY]} so far)</span>
                        )}
                      </p>
                    </div>
                  </label>
                </div>

                <p className="text-[10px] text-slate-600 italic text-center pt-2">
                  No accounts, no tracking, no data collected beyond the vote itself.
                </p>
              </div>
            </div>
          )}

          {/* NEWS */}
          {activeTab === 'news' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Newspaper className="w-5 h-5 text-rose-500" />
                    Latest News
                  </h3>
                  <span className="flex items-center gap-1.5 bg-green-500/10 text-green-400 text-[10px] sm:text-xs px-2 py-1 rounded-full font-bold">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Refreshes every 10 min
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">From PhilSTAR Life and Manila Bulletin, filtered for BTS, ARIRANG, and concert coverage.</p>

                {newsLoading && <div className="text-center py-6 text-slate-500 text-xs">Loading...</div>}
                {newsError && !newsLoading && (
                  <div className="bg-amber-950/40 border border-amber-500/30 p-3 rounded-xl text-xs text-amber-200">{newsError}</div>
                )}
                {!newsLoading && news.length > 0 && (
                  <div className="space-y-2.5">
                    {news.map((item, idx) => (
                      <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer" className="block bg-slate-950 border border-slate-800 hover:border-purple-500/50 p-3 sm:p-4 rounded-xl transition-all group">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-100 group-hover:text-purple-300 transition-colors">{item.title}</h4>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-purple-400 shrink-0 mt-0.5" />
                        </div>
                        {item.description && <p className="text-[11px] text-slate-400 leading-relaxed mb-2 line-clamp-2">{item.description}...</p>}
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <span className="bg-slate-900 px-2 py-0.5 rounded-full font-semibold">{item.source}</span>
                          <span>{new Date(item.pubDate).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </section>
      </main>

      <footer className="mt-auto bg-slate-950 border-t border-slate-900 py-5 px-4 sm:px-6 space-y-3">
        <div className="max-w-7xl mx-auto bg-gradient-to-br from-amber-950/30 via-slate-900 to-rose-950/30 border border-amber-500/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          <div className="bg-amber-500/10 p-3 rounded-xl shrink-0">
            <Coffee className="w-6 h-6 text-amber-400" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm font-bold text-amber-200">Made this for Filo ARMYs &middot; No ads, no signups</p>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">If it helped you survive the presale or plan your trip, a small GCash tip means a lot. Pay it forward.</p>
          </div>
          <button onClick={() => setShowTipModal(true)} className="bg-amber-600 hover:bg-amber-700 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-lg transition-colors shrink-0 flex items-center gap-1.5">
            Tip via GCash <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-[10px] sm:text-xs text-slate-500 pt-2">
          <p>Project Arirang &middot; Fan-made tracker</p>
          <p className="italic">Not affiliated with BIGHIT, HYBE, BTS, or Live Nation.</p>
        </div>
      </footer>

      {/* Floating Share Button */}
      <button
        onClick={handleShare}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 bg-gradient-to-br from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white rounded-full p-3.5 sm:p-4 shadow-2xl shadow-purple-500/30 transition-all hover:scale-105 active:scale-95 group"
        aria-label="Share this app"
      >
        <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="hidden sm:inline-block absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-900 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-700">
          Share with ARMY friends
        </span>
      </button>

      {/* Share Toast */}
      {shareToast && (
        <div className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-40 bg-emerald-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-2xl animate-pulse">
          ✓ {shareToast}
        </div>
      )}

      {/* Tip Modal */}
      {showTipModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={() => setShowTipModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full max-h-[95vh] overflow-y-auto shadow-2xl my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
              <div className="flex items-center gap-2">
                <Coffee className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Send a Tip</h3>
              </div>
              <button
                onClick={() => setShowTipModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-5 space-y-4">
              {/* Combined thank you message */}
              <div className="space-y-2">
                <p className="text-sm text-slate-200 leading-relaxed">
                  Made this as a fan-for-fans gift for Filo ARMYs going to the ARIRANG finale.
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  No ads. No signups. No data selling. If this app helped you survive the presale or plan your trip, a small tip helps me keep it free and add more features.
                </p>
              </div>

              {/* QR Code */}
              <div className="bg-white rounded-xl overflow-hidden">
                <img
                  src="/gcash-qr.jpg"
                  alt="Project Arirang Tip Jar GCash QR Code"
                  className="w-full h-auto block"
                />
              </div>

              {/* Instructions */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                <p className="text-[11px] sm:text-xs font-bold text-slate-300 uppercase tracking-wider">How to tip</p>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex gap-2">
                    <span className="text-amber-400 font-bold shrink-0">📱</span>
                    <span><strong>On phone:</strong> long-press the QR above, save to photos, then scan from GCash app</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-amber-400 font-bold shrink-0">💻</span>
                    <span><strong>On desktop:</strong> open GCash on your phone and scan this QR directly from your screen</span>
                  </div>
                </div>
              </div>

              {/* Share inside modal */}
              <div className="pt-2 border-t border-slate-800">
                <p className="text-[11px] text-slate-400 mb-2 text-center">Can't tip? Sharing with ARMY friends helps too 💜</p>
                <button
                  onClick={() => {
                    handleShare();
                    setShowTipModal(false);
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-bold text-sm px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share Project Arirang
                </button>
              </div>

              {/* Footer note */}
              <p className="text-[10px] text-slate-500 italic text-center pt-2">
                Salamat for whatever you can give. Even just sharing this is a tip 💜
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}