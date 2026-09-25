/**
 * SOUTH KOREA TARGETED PERSON-FIRST NLP & SEMANTIC EXTRACTION ENGINE
 * Strictly identifies when an Idea Paragraph talks about a specific person or topic,
 * extracting their canonical name, role, title, and target Korean news search query.
 */

export interface PersonEntity {
  name: string;
  hangul: string;
  role: string;
  title: string;
  category: 'politician' | 'business' | 'global_leader' | 'sports_celebrity' | 'media';
  aliases: string[];
  searchKeywords: string[];
}

export const KOREAN_PERSON_GRAPH: PersonEntity[] = [
  {
    name: 'Park Jie-won',
    hangul: '박지원',
    role: 'Democratic Party Senior Lawmaker & Former NIS Director',
    title: 'Senior Lawmaker & Former NIS Director',
    category: 'politician',
    aliases: [
      'park jie-won', 'park jiewon', 'park ji-won', '박지원', '박지원 의원', '박지원 전 원장'
    ],
    searchKeywords: ['박지원', '박지원 의원', '정치9단', '민주당', '윤석열 사면']
  },
  {
    name: 'Rhyu Si-min',
    hangul: '유시민',
    role: 'Prominent Author & Political Commentator',
    title: 'Writer & Former Minister',
    category: 'media',
    aliases: [
      'rhyu si-min', 'rhyu si min', 'writer rhyu si-min', 'writer rhyu',
      'you si-min', 'you si min', 'yoo si-min', 'yoo si min',
      '유시민', '유시민 작가', '유시민 이사장', 'rhyu', 'abc theory', '신발 속 돌멩이', '돌멩이 발언'
    ],
    searchKeywords: ['유시민', '유시민 작가', '알릴레오', '신발 속 돌멩이', '정치평론']
  },
  {
    name: 'Choo Mi-ae',
    hangul: '추미애',
    role: 'National Assembly Lawmaker & Former Minister of Justice',
    title: 'General Choo / Former Justice Minister',
    category: 'politician',
    aliases: [
      'choo mi-ae', 'choo mi ae', 'general choo mi-ae', 'general choo',
      'minister choo mi-ae', 'minister choo', 'choo',
      '추미애', '추미애 의원', '추미애 장관', '추장군', '주미의', '주미에'
    ],
    searchKeywords: ['추미애', '추미애 의원', '추미애 법무부장관', '국회']
  },
  {
    name: 'Kim Min-seok',
    hangul: '김민석',
    role: 'Democratic Party Supreme Council Member / Lawmaker',
    title: 'Supreme Council Member',
    category: 'politician',
    aliases: [
      'kim min-seok', 'kim min seok', 'pro-seok faction', 'pro-seok',
      'kim min-ti', 'min-ti', 'minty', 'minty tv', 'min-seok',
      '김민석', '김민석 최고위원', '친석계', '민티', '김민티', '민티계', '민티 tv'
    ],
    searchKeywords: ['김민석', '김민석 최고위원', '더불어민주당', '최고위', '민티']
  },
  {
    name: 'Kim Hyun-ji',
    hangul: '김현지',
    role: 'Key Political Aide & Strategic Secretariat Member',
    title: 'Presidential & Party Strategic Aide',
    category: 'politician',
    aliases: [
      'kim hyun-ji', 'kim hyunji', 'kim hyun ji', 'kim ji', '김현지', '김지', '성남인', '성남 라인'
    ],
    searchKeywords: ['김현지', '이재명 측근', '성남 라인', '정무라인']
  },
  {
    name: 'Hong Joon-pyo',
    hangul: '홍준표',
    role: 'Mayor of Daegu Metropolitan City',
    title: 'Daegu Mayor & Former Party Leader',
    category: 'politician',
    aliases: [
      'hong joon-pyo', 'hong joon pyo', 'hong jun-pyo', '홍준표', '홍준표 시장', '홍시장'
    ],
    searchKeywords: ['홍준표', '홍준표 대구시장', '여인천하', '정치발언']
  },
  {
    name: 'Kim Keon-hee',
    hangul: '김건희',
    role: 'First Lady of South Korea',
    title: 'First Lady',
    category: 'politician',
    aliases: [
      'kim keon-hee', 'kim keon hee', 'kim gun-hee', '김건희', '김건희 여사'
    ],
    searchKeywords: ['김건희', '김건희 여사', '대통령실']
  },
  {
    name: 'Park Geun-hye',
    hangul: '박근혜',
    role: '18th President of the Republic of Korea',
    title: '18th President of South Korea',
    category: 'politician',
    aliases: [
      'park geun-hye', 'park geun hye', 'president park geun-hye', '박근혜', '박근혜 전 대통령', '박근혜 사면'
    ],
    searchKeywords: ['박근혜', '박근혜 전 대통령', '사면']
  },
  {
    name: 'Lee Nak-yon',
    hangul: '이낙연',
    role: 'Former Prime Minister & Former Democratic Party Leader',
    title: 'Former Prime Minister',
    category: 'politician',
    aliases: [
      'lee nak-yon', 'lee nak-yeon', 'lee nakyon', '이낙연', '이낙연 전 총리', '이낙연 대표'
    ],
    searchKeywords: ['이낙연', '이낙연 총리', '사면 발언']
  },
  {
    name: 'Lee Kang-il',
    hangul: '이강일',
    role: 'Democratic Party Lawmaker',
    title: 'National Assembly Lawmaker',
    category: 'politician',
    aliases: [
      'lee kang-il', 'lee kangil', 'lee kang-i', '이강일', '이강이', '이강일 의원'
    ],
    searchKeywords: ['이강일', '이강일 의원', '추미애 비판']
  },
  {
    name: 'Jung Chung-rae',
    hangul: '정청래',
    role: 'National Assembly Legislation & Judiciary Committee Chair / Lawmaker',
    title: 'Committee Chair & Lawmaker',
    category: 'politician',
    aliases: [
      'jung chung-rae', 'jung chung rae', 'team jung chung-rae', 'jung chung-rae faction',
      'jung', 'jeong cheong-rae', '정청래', '정청래 의원', '정청래 위원장'
    ],
    searchKeywords: ['정청래', '정청래 국회의원', '법사위원장']
  },
  {
    name: 'Lee Jae-myung',
    hangul: '이재명',
    role: 'Leader of Democratic Party of Korea',
    title: 'Party Leader & Former Presidential Candidate',
    category: 'politician',
    aliases: [
      'lee jae-myung', 'lee jae myung', 'lee jaemyung', 'jae-myung',
      'president-to-be jae', 'lee jae-myung camp', 'lee jae myung camp',
      '이재명', '이재명 당대표', '이재명 대표', '더불어민주당 대표', '잼통', '유재명'
    ],
    searchKeywords: ['이재명', '이재명 대표', '이재명 당대표', '더불어민주당']
  },
  {
    name: 'Lee Geon-tae',
    hangul: '이건태',
    role: 'Democratic Party Lawmaker',
    title: 'Lawmaker & Legal Spokesperson',
    category: 'politician',
    aliases: [
      'lee geon-tae', 'lee geon tae', 'mr. lee geon-tae', '이건태', '이건태 의원'
    ],
    searchKeywords: ['이건태', '이건태 의원', '더불어민주당']
  },
  {
    name: 'Kim Yong-min',
    hangul: '김용민',
    role: 'Democratic Party Lawmaker',
    title: 'Lawmaker & Reform Advocate',
    category: 'politician',
    aliases: [
      'kim yong-min', 'kim yong min', 'rep. kim yong-min', 'rep kim yong-min',
      '김용민', '김용민 의원', '사보임'
    ],
    searchKeywords: ['김용민', '김용민 의원', '국회', '법사위']
  },
  {
    name: 'Kim Sang-wook',
    hangul: '김상욱',
    role: 'Parliamentary Committee Member & Lawmaker',
    title: 'Lawmaker',
    category: 'politician',
    aliases: [
      'kim sang-wook', 'kim sang wook', '김상욱', '김상욱 의원'
    ],
    searchKeywords: ['김상욱', '김상욱 의원', '국회 상임위']
  },
  {
    name: 'Park Chan-dae',
    hangul: '박찬대',
    role: 'Democratic Party Floor Leader',
    title: 'Floor Leader',
    category: 'politician',
    aliases: [
      'park chan-dae', 'park chan dae', 'floor leader park chan-dae',
      '박찬대', '박찬대 원내대표'
    ],
    searchKeywords: ['박찬대', '박찬대 원내대표', '더불어민주당']
  },
  {
    name: 'Yoon Suk Yeol',
    hangul: '윤석열',
    role: 'President of the Republic of Korea',
    title: '20th President of South Korea',
    category: 'politician',
    aliases: [
      'yoon suk yeol', 'yoon suk-yeol', 'yoon sukyeol', 'president yoon',
      'president yoon suk yeol', 'suk yeol', 'the current president',
      '윤석열', '윤석열 대통령', '윤 대통령', '용산 대통령실', '윤석결', '윤석', '윤어게인'
    ],
    searchKeywords: ['윤석열', '윤석열 대통령', '대통령실', '국무회의', '대통령 담화']
  },
  {
    name: 'Han Dong-hoon',
    hangul: '한동훈',
    role: 'Leader of People Power Party',
    title: 'PPP Party Leader & Former Justice Minister',
    category: 'politician',
    aliases: [
      'han dong-hoon', 'han dong hoon', 'leader han dong-hoon', 'han donghoon',
      '한동훈', '한동훈 당대표', '한동훈 대표', '국민의힘 한동훈', '한동'
    ],
    searchKeywords: ['한동훈', '한동훈 대표', '국민의힘', '한동훈 비대위원장']
  },
  {
    name: 'Lee Jae-yong',
    hangul: '이재용',
    role: 'Executive Chairman of Samsung Electronics',
    title: 'Samsung Electronics Chairman',
    category: 'business',
    aliases: [
      'lee jae-yong', 'lee jae yong', 'jay y. lee', 'chairman lee',
      'samsung chairman lee jae-yong', 'samsung lee jae-yong',
      '이재용', '이재용 회장', '삼성전자 이재용'
    ],
    searchKeywords: ['이재용', '이재용 회장', '삼성전자', '반도체 투자']
  },
  {
    name: 'Chey Tae-won',
    hangul: '최태원',
    role: 'Chairman of SK Group & KCCI Chairman',
    title: 'SK Group Chairman',
    category: 'business',
    aliases: [
      'chey tae-won', 'chey tae won', 'tae-won chey', 'sk chairman chey tae-won',
      'sk chey tae-won', '최태원', '최태원 회장', 'sk 최태원', '대한상의 회장'
    ],
    searchKeywords: ['최태원', '최태원 회장', 'sk하이닉스', '대한상공회의소']
  },
  {
    name: 'Jensen Huang',
    hangul: '젠슨 황',
    role: 'Founder & CEO of NVIDIA',
    title: 'NVIDIA CEO',
    category: 'global_leader',
    aliases: [
      'jensen huang', 'jensen', 'nvidia ceo jensen huang', 'nvidia jensen huang',
      '젠슨 황', '젠슨황', '엔비디아 젠슨 황'
    ],
    searchKeywords: ['젠슨 황', '엔비디아', 'hbm3e', '삼성전자 sk하이닉스']
  },
  {
    name: 'Donald Trump',
    hangul: '도널드 트럼프',
    role: '45th & 47th President of the United States',
    title: 'U.S. President',
    category: 'global_leader',
    aliases: [
      'donald trump', 'trump', 'president trump', '도널드 트럼프', '트럼프'
    ],
    searchKeywords: ['도널드 트럼프', '트럼프 관세', '한미통상', '트럼프 대통령']
  },
  {
    name: 'Joe Biden',
    hangul: '조 바이든',
    role: '46th President of the United States',
    title: 'U.S. President',
    category: 'global_leader',
    aliases: [
      'joe biden', 'biden', 'president biden', '조 바이든', '바이든'
    ],
    searchKeywords: ['조 바이든', '한미동맹', '바이든 대통령']
  },
  {
    name: 'Son Heung-min',
    hangul: '손흥민',
    role: 'Captain of South Korea National Football Team',
    title: 'Football Captain & Tottenham Hotspur Star',
    category: 'sports_celebrity',
    aliases: [
      'son heung-min', 'son heung min', 'sonny', 'heung-min son',
      'captain son', '손흥민', '손흥민 주장', '토트넘 손흥민'
    ],
    searchKeywords: ['손흥민', '축구 국가대표', '토트넘', '손흥민 골']
  },
  {
    name: 'Faker (Lee Sang-hyeok)',
    hangul: '페이커 (이상혁)',
    role: '5-Time League of Legends World Champion',
    title: 'Esports GOAT & T1 Captain',
    category: 'sports_celebrity',
    aliases: [
      'faker', 'lee sang-hyeok', 'lee sang hyeok', 't1 faker',
      '페이커', '이상혁', 't1 페이커', '롤드컵 우승'
    ],
    searchKeywords: ['페이커', '이상혁', 'T1', '롤드컵', 'LCK']
  }
];

export interface ExtractedEntities {
  people: string[];
  matchedPerson?: PersonEntity;
  locations: string[];
  events: string[];
  coreKeywords: string[];
}

export function extractEntitiesFromParagraph(text: string): ExtractedEntities {
  if (!text) {
    return { people: [], locations: [], events: [], coreKeywords: [] };
  }

  const normalized = text.toLowerCase();
  let bestMatchedPerson: PersonEntity | undefined;
  let highestMatchScore = 0;

  for (const person of KOREAN_PERSON_GRAPH) {
    let score = 0;
    for (const alias of person.aliases) {
      if (normalized.includes(alias.toLowerCase())) {
        score += alias.length >= 4 ? 12 : 6;
      }
    }

    if (score > highestMatchScore) {
      highestMatchScore = score;
      bestMatchedPerson = person;
    }
  }

  const people: string[] = [];
  if (bestMatchedPerson) {
    people.push(`${bestMatchedPerson.name} (${bestMatchedPerson.hangul})`);
  }

  const locations: string[] = [];
  if (normalized.includes('seoul') || normalized.includes('서울') || normalized.includes('서울역') || normalized.includes('영등포')) locations.push('Seoul (서울·영등포)');
  if (normalized.includes('gyeonggi') || normalized.includes('경기') || normalized.includes('성남')) locations.push('Gyeonggi / Seongnam (경기·성남)');
  if (normalized.includes('honam') || normalized.includes('호남')) locations.push('Honam Region (호남)');
  if (normalized.includes('tk') || normalized.includes('daegu') || normalized.includes('대구') || normalized.includes('경북')) locations.push('TK Region (대구·경북)');
  if (normalized.includes('national assembly') || normalized.includes('assembly') || normalized.includes('국회') || normalized.includes('법사위')) locations.push('National Assembly (국회 법사위)');
  if (normalized.includes('ministry of justice') || normalized.includes('법무부')) locations.push('Ministry of Justice (법무부)');
  if (normalized.includes('blue house') || normalized.includes('청와대') || normalized.includes('대통령실')) locations.push('Blue House / Presidency (청와대·정무라인)');

  const events: string[] = [];
  if (normalized.includes('사면') || normalized.includes('pardon')) events.push('Yoon Suk Yeol Pardon Debate (윤석열 사면 논란)');
  if (normalized.includes('김현지') || normalized.includes('비선') || normalized.includes('성남인')) events.push('Kim Hyun-ji & Seongnam Line Controversy');
  if (normalized.includes('사보임') || normalized.includes('김용민')) events.push('Kim Yong-min Committee Removal Warning (사보임 경고)');
  if (normalized.includes('돌멩이') || normalized.includes('stone in shoe')) events.push('Rhyu Si-min Stone-in-the-Shoe Remarks');
  if (normalized.includes('여인천하') || normalized.includes('홍준표')) events.push('Hong Joon-pyo Yeoincheonha Remark');
  if (normalized.includes('editorial') || normalized.includes('kyunghyang') || normalized.includes('사설')) events.push('Kyunghyang Shinmun Editorial Criticism');
  if (normalized.includes('approval rating') || normalized.includes('plummeted') || normalized.includes('지지율')) events.push('Approval Rating & Turning Point Analysis');
  if (normalized.includes('플래카드') || normalized.includes('황금시대')) events.push('Party Placard & Banner Budget Dispute');

  const coreKeywords: string[] = [];
  if (bestMatchedPerson) {
    coreKeywords.push(...bestMatchedPerson.searchKeywords.slice(0, 3));
  } else {
    coreKeywords.push('대한민국 정치 뉴스', '국회 현안', '여야 공방');
  }

  return {
    people,
    matchedPerson: bestMatchedPerson,
    locations,
    events,
    coreKeywords
  };
}

export function generateSearchQuery(entities: ExtractedEntities, paragraphText: string): string {
  if (entities.matchedPerson) {
    return `${entities.matchedPerson.hangul} ${entities.matchedPerson.name} 보도사진 연합뉴스`;
  }

  if (entities.locations.length > 0 && entities.events.length > 0) {
    return `${entities.locations[0]} ${entities.events[0]} 뉴스`;
  }

  const clean = paragraphText
    .replace(/[^\w\s가-힣]/g, '')
    .split(/\s+/)
    .slice(0, 4)
    .join(' ');
  return `${clean} 한국 뉴스 보도`;
}
