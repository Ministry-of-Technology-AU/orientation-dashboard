const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, 'public/Clubs list tentative.csv');
const outputPath = path.join(__dirname, 'src/mock-data/clubs.ts');

const text = fs.readFileSync(csvPath, 'utf-8');

function parseCSV(text) {
  const lines = text.split(/\r?\n/);
  const result = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const row = [];
    let insideQuote = false;
    let entry = '';
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        row.push(entry);
        entry = '';
      } else {
        entry += char;
      }
    }
    row.push(entry);
    
    // Clean fields
    const cleaned = row.map(val => {
      val = val.trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      }
      return val.trim();
    });
    
    result.push(cleaned);
  }
  return result;
}

const rows = parseCSV(text);

const mappedClubs = rows.map((row, index) => {
  const srNo = parseInt(row[0]) || (index + 1);
  const name = row[1];
  const rawCategory = row[2] || '';
  const desc = row[3] || '';
  const email = row[4] || '';
  
  const type = rawCategory.toLowerCase().includes('society') ? 'society' : 'club';
  const id = `c${srNo}`;
  const tier = ((srNo - 1) % 4) + 1; // 1, 2, 3, 4 cycle
  
  // Keyword based tagging
  const tags = new Set();
  const searchStr = `${name} ${desc}`.toLowerCase();
  
  if (searchStr.includes('dance')) {
    tags.add('Arts');
    tags.add('Dance');
  }
  if (searchStr.includes('theatre') || searchStr.includes('theater') || searchStr.includes('acting') || searchStr.includes('drama') || searchStr.includes('comedy') || searchStr.includes('stand-up') || searchStr.includes('improv') || searchStr.includes('laugh')) {
    tags.add('Arts');
    tags.add('Theatre');
  }
  if (searchStr.includes('crochet') || searchStr.includes('origami') || searchStr.includes('design') || searchStr.includes('art') || searchStr.includes('paint') || searchStr.includes('craft')) {
    tags.add('Arts');
  }
  if (searchStr.includes('film') || searchStr.includes('cinema') || searchStr.includes('movie') || searchStr.includes('photography') || searchStr.includes('camera') || searchStr.includes('photo')) {
    tags.add('Arts');
    tags.add('Photography');
  }
  if (searchStr.includes('music') || searchStr.includes('jam') || searchStr.includes('sing') || searchStr.includes('vocal')) {
    tags.add('Arts');
    tags.add('Music');
  }
  if (searchStr.includes('poetry') || searchStr.includes('writing') || searchStr.includes('literary') || searchStr.includes('magazine') || searchStr.includes('satire') || searchStr.includes('read') || searchStr.includes('language') || searchStr.includes('speak')) {
    tags.add('Arts');
    tags.add('Writing');
  }
  if (searchStr.includes('mun') || searchStr.includes('united nations') || searchStr.includes('politic') || searchStr.includes('debate') || searchStr.includes('debating') || searchStr.includes('law')) {
    tags.add('Politics');
    tags.add('Law');
  }
  if (searchStr.includes('fintech') || searchStr.includes('finance') || searchStr.includes('investment') || searchStr.includes('business') || searchStr.includes('leadership') || searchStr.includes('consulting') || searchStr.includes('startup') || searchStr.includes('venture') || searchStr.includes('entrepreneur')) {
    tags.add('Entrepreneurship');
  }
  if (searchStr.includes('game') || searchStr.includes('gaming') || searchStr.includes('board game') || searchStr.includes('fintech')) {
    tags.add('Tech');
  }
  if (searchStr.includes('green') || searchStr.includes('organic') || searchStr.includes('vegetables') || searchStr.includes('farm') || searchStr.includes('sustainability') || searchStr.includes('sustainable') || searchStr.includes('development goals') || searchStr.includes('animal') || searchStr.includes('dog') || searchStr.includes('cat') || searchStr.includes('paw')) {
    tags.add('Environment');
  }
  if (searchStr.includes('sports') || searchStr.includes('athletic')) {
    tags.add('Sports');
  }
  
  // Base default tags to ensure everyone has a category
  tags.add('Social');
  
  // Format description line breaks nicely
  const cleanedDesc = desc.replace(/\\n/g, '\n\n').trim();

  return {
    tier,
    id,
    name,
    type,
    description: cleanedDesc,
    contactEmail: email || 'life@ashoka.edu.in',
    instagramUrl: name.toLowerCase().includes('abhinaya') ? 'https://instagram.com/abhinaya_ashoka' : undefined,
    interestTags: Array.from(tags),
    isActive: true
  };
});

// Construct typescript content
const fileContent = `export type ClubType = "club" | "society" | "ministry";

export interface Club {
  tier: 1 | 2 | 3 | 4;
  id: string;
  name: string;
  type: ClubType;
  description: string;
  contactEmail: string;
  instagramUrl?: string;
  interestTags: string[];
  isActive: boolean;
}

export const mockClubs: Club[] = ${JSON.stringify(mappedClubs, null, 2)};

// Mock: user is interested in Arts, Tech, Social
export const mockUserInterestTags = ["Arts", "Tech", "Social", "Music", "Politics"];

export function getRecommendedClubs(userTags: string[], swipes: Record<string, "liked" | "dismissed">): Club[] {
  return mockClubs
    .filter((c) => c.isActive && !swipes[c.id] && c.interestTags.some((t) => userTags.includes(t)))
    .sort((a, b) => {
      const scoreA = a.interestTags.filter((t) => userTags.includes(t)).length;
      const scoreB = b.interestTags.filter((t) => userTags.includes(t)).length;
      return scoreB - scoreA;
    });
}

export function getLikedClubs(swipes: Record<string, "liked" | "dismissed">): Club[] {
  return mockClubs.filter((c) => swipes[c.id] === "liked");
}

export function getExploreAllClubs(swipes: Record<string, "liked" | "dismissed">, userTags: string[]): Club[] {
  const recommended = new Set(getRecommendedClubs(userTags, swipes).map((c) => c.id));
  return mockClubs.filter((c) => c.isActive && !swipes[c.id] && !recommended.has(c.id));
}

export function getTierClubs(swipes: Record<string, "liked" | "dismissed">, tier: number): Club[] {
  return mockClubs.filter((c) => c.isActive && c.tier === tier);
}
`;

fs.writeFileSync(outputPath, fileContent, 'utf-8');
console.log(`Successfully generated ${mappedClubs.length} clubs in mock-data/clubs.ts`);
