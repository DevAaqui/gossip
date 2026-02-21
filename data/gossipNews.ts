// Sample gossip news — each item is ~60 words for the feed

export interface GossipItem {
  id: string;
  title: string;
  body: string;
  date: string;
  /** Optional image URL for the card media area */
  imageUri?: string;
  /** Optional video URL for the card media area */
  videoUri?: string;
}

export const GOSSIP_NEWS: GossipItem[] = [
  {
    id: '1',
    title: 'Star couple spotted in heated argument',
    body: 'A famous Hollywood couple was seen having a loud argument outside a trendy restaurant last night. Witnesses say the disagreement lasted over twenty minutes before they got into separate cars and drove off in different directions. Sources close to the pair suggest tension has been building for months over career choices and time spent apart. Neither representative has commented yet.',
    date: '2h ago',
    imageUri: 'https://picsum.photos/600/320',
  },
  {
    id: '2',
    title: "Reality star's secret project revealed",
    body: 'A popular reality TV star has been quietly developing a lifestyle brand that could launch as early as next month. Insiders say the line will include skincare and home goods, with a major retailer already in talks. The star has been meeting with designers and manufacturers for almost a year. Fans are already speculating about the first product drop.',
    date: '4h ago',
    imageUri: 'https://picsum.photos/600/320?random=2',
  },
  {
    id: '3',
    title: 'Chart-topping singer cancels tour dates',
    body: "The singer has officially canceled the remaining twelve dates of their world tour, citing vocal strain and doctor's orders to rest. Ticket holders will receive full refunds within two weeks. The artist posted an emotional video apologizing to fans and promising new music and a rescheduled tour next year. Some fans are questioning the timing given recent tabloid headlines.",
    date: '6h ago',
  },
  {
    id: '4',
    title: 'Director and lead actor clash on set',
    body: 'Reports from the set of an upcoming blockbuster suggest the director and lead actor have had several heated disagreements about the script and character direction. Crew members say filming has been delayed at least twice due to creative differences. The studio is reportedly sending a mediator to smooth things over. The film is still set for a summer release.',
    date: '8h ago',
  },
  {
    id: '5',
    title: "Socialite's divorce settlement makes headlines",
    body: 'The divorce settlement between the well-known socialite and their former spouse has been finalized, with a reported nine-figure sum changing hands. The split includes multiple properties, art collections, and custody arrangements for their two children. Neither side has spoken publicly, but friends say both are relieved to move on. Legal experts call it one of the year\'s biggest settlements.',
    date: '10h ago',
  },
  {
    id: '6',
    title: "Athlete's surprise career move",
    body: 'A top athlete has announced they are stepping away from competition to focus on coaching and a new foundation for young talent. The decision comes after a season of record-breaking performances and minor injuries. Fans and sponsors have reacted with a mix of support and disappointment. The athlete will still appear in major events in an advisory role.',
    date: '12h ago',
  },
  {
    id: '7',
    title: 'Streaming feud goes public',
    body: 'Two popular streamers have taken their long-simmering feud public, with accusations of copied content and broken promises. Both have posted lengthy videos and screenshots, and their fan bases are fiercely divided. Brands that work with both are reportedly nervous about taking sides. No one knows yet if the dispute will end in lawsuits or an uneasy truce.',
    date: '14h ago',
  },
  {
    id: '8',
    title: "Fashion icon's comeback collection",
    body: 'After years out of the spotlight, a legendary fashion designer is staging a comeback with a new collection and a documentary about their life. The first show is scheduled for fashion week, and several A-list names are already confirmed to attend. Insiders say the line blends classic silhouettes with sustainable materials. Early previews have drawn rave reviews.',
    date: '16h ago',
  },
];

/** Trim body to ~60 words for display */
export function toSixtyWords(text: string): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= 60) return text.trim();
  return words.slice(0, 60).join(' ') + '…';
}
