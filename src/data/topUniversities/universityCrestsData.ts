export type CrestCategory =
  | 'harvard-books'
  | 'oxford-crowns'
  | 'cambridge-cross-lions'
  | 'stanford-redwood'
  | 'mit-scholar-anvil'
  | 'princeton-bible-chevron'
  | 'columbia-three-crowns'
  | 'yale-lux-veritas'
  | 'berkeley-fiat-lux'
  | 'toronto-crown-beaver'
  | 'mcgill-martlets'
  | 'ubc-ocean-sun'
  | 'tsinghua-star-roundel'
  | 'peking-seal'
  | 'fudan-circle'
  | 'zhejiang-eagle'
  | 'hku-lion-crest'
  | 'cuhk-phoenix'
  | 'hkust-golden-bird'
  | 'snu-torch-key'
  | 'kaist-prism'
  | 'yonsei-eagle-shield'
  | 'korea-tiger'
  | 'melbourne-victory'
  | 'sydney-lion-cross'
  | 'anu-shield'
  | 'unsw-lion-sun'
  | 'eth-geometric'
  | 'epfl-modern'
  | 'tum-towers'
  | 'psl-paris'
  | 'sorbonne-crest'
  | 'tu-delft-flame'
  | 'karolinska-serpent'
  | 'ku-leuven-sedes'
  | 'tcd-harp-castle'
  | 'uva-amsterdam'
  | 'polimi-leonardo'
  | 'tokyo-ginkgo'
  | 'kyoto-camphor'
  | 'tokyo-tech-swallow'
  | 'osaka-ginkgo'
  | 'tohoku-hagi'
  | 'nus-lion-sunburst'
  | 'ntu-lion-cog'
  | 'smu-spire'
  | 'iit-chakra-lotus'
  | 'iisc-flame'
  | 'general-shield-books'
  | 'general-shield-lion'
  | 'general-shield-tree'
  | 'general-seal-roundel'
  | 'general-tech-gear';

export interface UniversityCrestMeta {
  id: string;
  domain: string;
  primaryColor: string;
  accentColor: string;
  motto: string;
  established: number;
  crestCategory: CrestCategory;
  symbolName: string;
}

export const UNIVERSITY_CRESTS_MAP: Record<string, UniversityCrestMeta> = {
  // === USA Top 20 ===
  'univ-us-harvard': {
    id: 'univ-us-harvard',
    domain: 'harvard.edu',
    primaryColor: '#A51C30',
    accentColor: '#D2A554',
    motto: 'VERITAS',
    established: 1636,
    crestCategory: 'harvard-books',
    symbolName: 'Veritas 3 Open Books Shield'
  },
  'univ-us-stanford': {
    id: 'univ-us-stanford',
    domain: 'stanford.edu',
    primaryColor: '#8C1515',
    accentColor: '#B83A4B',
    motto: 'DIE LUFT DER FREIHEIT WEHT',
    established: 1891,
    crestCategory: 'stanford-redwood',
    symbolName: 'El Palo Alto Redwood Tree Seal'
  },
  'univ-us-mit': {
    id: 'univ-us-mit',
    domain: 'mit.edu',
    primaryColor: '#A31F34',
    accentColor: '#8A8B8C',
    motto: 'MENS ET MANUS',
    established: 1861,
    crestCategory: 'mit-scholar-anvil',
    symbolName: 'Scholar, Artisan & Anvil Shield'
  },
  'univ-us-wharton-upenn': {
    id: 'univ-us-wharton-upenn',
    domain: 'upenn.edu',
    primaryColor: '#011F5B',
    accentColor: '#990000',
    motto: 'LEGES SINE MORIBUS VANAE',
    established: 1740,
    crestCategory: 'general-shield-lion',
    symbolName: 'Penn Dolphin & 3 Books Shield'
  },
  'univ-us-chicago-booth': {
    id: 'univ-us-chicago-booth',
    domain: 'uchicago.edu',
    primaryColor: '#800000',
    accentColor: '#767676',
    motto: 'CRESCAT SCIENTIA VITA EXCOLATUR',
    established: 1890,
    crestCategory: 'general-shield-books',
    symbolName: 'Phoenix Rising from Flames Shield'
  },
  'univ-us-kellogg-northwestern': {
    id: 'univ-us-kellogg-northwestern',
    domain: 'northwestern.edu',
    primaryColor: '#4E2A84',
    accentColor: '#E4E0EE',
    motto: 'QUAECUMQUE SUNT VERA',
    established: 1851,
    crestCategory: 'general-shield-books',
    symbolName: 'Radiant Open Book & Greek Cross'
  },
  'univ-us-columbia': {
    id: 'univ-us-columbia',
    domain: 'columbia.edu',
    primaryColor: '#7598C8',
    accentColor: '#002B7F',
    motto: 'IN LUMINE TUO VIDEBIMUS LUMEN',
    established: 1754,
    crestCategory: 'columbia-three-crowns',
    symbolName: 'Three Royal King’s Crowns Shield'
  },
  'univ-us-princeton': {
    id: 'univ-us-princeton',
    domain: 'princeton.edu',
    primaryColor: '#E86100',
    accentColor: '#121212',
    motto: 'DEI SUB NUMINE VIGET',
    established: 1746,
    crestCategory: 'princeton-bible-chevron',
    symbolName: 'Open Bible on Chevron Shield'
  },
  'univ-us-yale': {
    id: 'univ-us-yale',
    domain: 'yale.edu',
    primaryColor: '#00356B',
    accentColor: '#286DC0',
    motto: 'LUX ET VERITAS',
    established: 1701,
    crestCategory: 'yale-lux-veritas',
    symbolName: 'Lux et Veritas Open Book Shield'
  },
  'univ-us-caltech': {
    id: 'univ-us-caltech',
    domain: 'caltech.edu',
    primaryColor: '#FF6C0C',
    accentColor: '#000000',
    motto: 'THE TRUTH SHALL MAKE YOU FREE',
    established: 1891,
    crestCategory: 'general-tech-gear',
    symbolName: 'Torch of Science & Radiance'
  },
  'univ-us-duke': {
    id: 'univ-us-duke',
    domain: 'duke.edu',
    primaryColor: '#003087',
    accentColor: '#001A49',
    motto: 'ERUDITIO ET RELIGIO',
    established: 1838,
    crestCategory: 'general-shield-books',
    symbolName: 'Duke Latin Cross & Book Shield'
  },
  'univ-us-uc-berkeley': {
    id: 'univ-us-uc-berkeley',
    domain: 'berkeley.edu',
    primaryColor: '#003262',
    accentColor: '#FDB515',
    motto: 'FIAT LUX',
    established: 1868,
    crestCategory: 'berkeley-fiat-lux',
    symbolName: 'Fiat Lux Star & Open Book Seal'
  },
  'univ-us-johns-hopkins': {
    id: 'univ-us-johns-hopkins',
    domain: 'jhu.edu',
    primaryColor: '#002D72',
    accentColor: '#68ACE5',
    motto: 'VERITAS VOS LIBERABIT',
    established: 1876,
    crestCategory: 'general-shield-books',
    symbolName: 'Hopkins Globe, Book & Shield'
  },
  'univ-us-cornell': {
    id: 'univ-us-cornell',
    domain: 'cornell.edu',
    primaryColor: '#B31B1B',
    accentColor: '#222222',
    motto: 'ANY PERSON ANY STUDY',
    established: 1865,
    crestCategory: 'general-shield-books',
    symbolName: 'Cornell Shield with Cross & Books'
  },
  'univ-us-brown': {
    id: 'univ-us-brown',
    domain: 'brown.edu',
    primaryColor: '#4E3629',
    accentColor: '#ED1C24',
    motto: 'IN DEO SPERAMUS',
    established: 1764,
    crestCategory: 'general-shield-books',
    symbolName: 'Red Cross, 4 Books & Sun Shield'
  },
  'univ-us-dartmouth': {
    id: 'univ-us-dartmouth',
    domain: 'dartmouth.edu',
    primaryColor: '#00693E',
    accentColor: '#12312b',
    motto: 'VOX CLAMANTIS IN DESERTO',
    established: 1769,
    crestCategory: 'general-shield-tree',
    symbolName: 'Pine Grove & Radiant Star Seal'
  },
  'univ-us-vanderbilt': {
    id: 'univ-us-vanderbilt',
    domain: 'vanderbilt.edu',
    primaryColor: '#866D4B',
    accentColor: '#000000',
    motto: 'CRESCERE AUDE',
    established: 1873,
    crestCategory: 'general-shield-tree',
    symbolName: 'Star & Acorn Commodore Shield'
  },
  'univ-us-rice': {
    id: 'univ-us-rice',
    domain: 'rice.edu',
    primaryColor: '#00205B',
    accentColor: '#7C878E',
    motto: 'LETTERS SCIENCE ART',
    established: 1912,
    crestCategory: 'general-shield-books',
    symbolName: 'Three Athenian Owls of Athena Shield'
  },
  'univ-us-nyu-stern': {
    id: 'univ-us-nyu-stern',
    domain: 'nyu.edu',
    primaryColor: '#57068C',
    accentColor: '#8900E1',
    motto: 'PERSTARE ET PRAESTARE',
    established: 1831,
    crestCategory: 'general-seal-roundel',
    symbolName: 'Upright Torch of Minerva Seal'
  },
  'univ-us-washu-stlouis': {
    id: 'univ-us-washu-stlouis',
    domain: 'wustl.edu',
    primaryColor: '#A51417',
    accentColor: '#007360',
    motto: 'PER VERITATEM VIS',
    established: 1853,
    crestCategory: 'general-shield-books',
    symbolName: 'Fleur-de-lis, Book & Washington Crest'
  },

  // === UK Top 5 (G5 Super-Elite) ===
  'univ-uk-oxford': {
    id: 'univ-uk-oxford',
    domain: 'ox.ac.uk',
    primaryColor: '#002147',
    accentColor: '#C49A45',
    motto: 'DOMINUS ILLUMINATIO MEA',
    established: 1096,
    crestCategory: 'oxford-crowns',
    symbolName: 'Open Book with 7 Clasps & 3 Royal Crowns'
  },
  'univ-uk-cambridge': {
    id: 'univ-uk-cambridge',
    domain: 'cam.ac.uk',
    primaryColor: '#0072CF',
    accentColor: '#A3C1AD',
    motto: 'HINC LUCEM ET POCULA SACRA',
    established: 1209,
    crestCategory: 'cambridge-cross-lions',
    symbolName: 'Ermine Cross with 4 Lions & Bible'
  },
  'univ-uk-imperial': {
    id: 'univ-uk-imperial',
    domain: 'imperial.ac.uk',
    primaryColor: '#002F6C',
    accentColor: '#0097A7',
    motto: 'SCIENTIA IMPERII DECUS ET TUTAMEN',
    established: 1907,
    crestCategory: 'general-shield-lion',
    symbolName: 'Royal Lions & Sunburst Technology Shield'
  },
  'univ-uk-ucl': {
    id: 'univ-uk-ucl',
    domain: 'ucl.ac.uk',
    primaryColor: '#500778',
    accentColor: '#8F47B3',
    motto: 'CUNCTI ADSINT MERITAEQUE EXPECTENT PRAEMIA PALMAE',
    established: 1826,
    crestCategory: 'general-seal-roundel',
    symbolName: 'Portico Rotunda & Palm of Merit'
  },
  'univ-uk-lse': {
    id: 'univ-uk-lse',
    domain: 'lse.ac.uk',
    primaryColor: '#D11947',
    accentColor: '#111111',
    motto: 'RERUM COGNOSCERE CAUSAS',
    established: 1895,
    crestCategory: 'general-shield-tree',
    symbolName: 'Industrious Beaver & Book Shield'
  },

  // === Canada Top 5 ===
  'univ-ca-utoronto': {
    id: 'univ-ca-utoronto',
    domain: 'utoronto.ca',
    primaryColor: '#002A5C',
    accentColor: '#E31837',
    motto: 'VELUT ARBOR AEVO',
    established: 1827,
    crestCategory: 'toronto-crown-beaver',
    symbolName: 'Imperial Crown, Beaver & 2 Open Books'
  },
  'univ-ca-ubc': {
    id: 'univ-ca-ubc',
    domain: 'ubc.ca',
    primaryColor: '#002145',
    accentColor: '#5E8AB4',
    motto: 'TUUM EST',
    established: 1908,
    crestCategory: 'ubc-ocean-sun',
    symbolName: 'Sun Setting Over Ocean Waves & Open Book'
  },
  'univ-ca-mcgill': {
    id: 'univ-ca-mcgill',
    domain: 'mcgill.ca',
    primaryColor: '#ED1B2F',
    accentColor: '#2B2B2B',
    motto: 'GRANDESCUNT AUCTA LABORE',
    established: 1821,
    crestCategory: 'mcgill-martlets',
    symbolName: 'Three Flying Martlets & Royal Crown'
  },
  'univ-ca-waterloo': {
    id: 'univ-ca-waterloo',
    domain: 'uwaterloo.ca',
    primaryColor: '#E4B429',
    accentColor: '#000000',
    motto: 'CONCORDIA CUM VERITATE',
    established: 1957,
    crestCategory: 'general-shield-lion',
    symbolName: 'Three Red Lions Passant Shield'
  },
  'univ-ca-ualberta': {
    id: 'univ-ca-ualberta',
    domain: 'ualberta.ca',
    primaryColor: '#007C41',
    accentColor: '#FFDB05',
    motto: 'QUAECUMQUE VERA',
    established: 1908,
    crestCategory: 'general-shield-books',
    symbolName: 'Alberta Rocky Mountains, Wheat & Book Shield'
  },

  // === China Top 15 (C9 League & Elite) ===
  'univ-cn-tsinghua': {
    id: 'univ-cn-tsinghua',
    domain: 'tsinghua.edu.cn',
    primaryColor: '#660874',
    accentColor: '#9C27B0',
    motto: '自强不息 厚德载物',
    established: 1911,
    crestCategory: 'tsinghua-star-roundel',
    symbolName: 'Five-Pointed Star Purple Circular Seal'
  },
  'univ-cn-peking': {
    id: 'univ-cn-peking',
    domain: 'pku.edu.cn',
    primaryColor: '#8A0000',
    accentColor: '#C62828',
    motto: '爱国 进步 民主 科学',
    established: 1898,
    crestCategory: 'peking-seal',
    symbolName: 'Lu Xun Calligraphic Dual Figure Seal'
  },
  'univ-cn-fudan': {
    id: 'univ-cn-fudan',
    domain: 'fudan.edu.cn',
    primaryColor: '#003399',
    accentColor: '#B71C1C',
    motto: '博学而笃志 切问而近思',
    established: 1905,
    crestCategory: 'fudan-circle',
    symbolName: 'Sun and Moon Splendor Fudan Roundel'
  },
  'univ-cn-zhejiang': {
    id: 'univ-cn-zhejiang',
    domain: 'zju.edu.cn',
    primaryColor: '#003F8A',
    accentColor: '#2196F3',
    motto: '求是创新',
    established: 1897,
    crestCategory: 'zhejiang-eagle',
    symbolName: 'Soaring Qiushi Eagle Emblem'
  },
  'univ-cn-sjtu': {
    id: 'univ-cn-sjtu',
    domain: 'sjtu.edu.cn',
    primaryColor: '#8C1D24',
    accentColor: '#1A237E',
    motto: '饮水思源 爱国荣校',
    established: 1896,
    crestCategory: 'general-tech-gear',
    symbolName: 'Gear, Anvil & Open Books Sincerity Seal'
  },
  'univ-cn-ustc': {
    id: 'univ-cn-ustc',
    domain: 'ustc.edu.cn',
    primaryColor: '#002E6C',
    accentColor: '#D32F2F',
    motto: '红专并进 理实交融',
    established: 1958,
    crestCategory: 'general-tech-gear',
    symbolName: 'Cosmic Arrow, Atom Orbit & Book Emblem'
  },
  'univ-cn-nanjing': {
    id: 'univ-cn-nanjing',
    domain: 'nju.edu.cn',
    primaryColor: '#582C83',
    accentColor: '#FFD700',
    motto: '诚朴雄伟 励学敦行',
    established: 1902,
    crestCategory: 'general-shield-lion',
    symbolName: 'Bixie Winged Chimera Lion & Nanjing Gate'
  },
  'univ-cn-renmin': {
    id: 'univ-cn-renmin',
    domain: 'ruc.edu.cn',
    primaryColor: '#9E0021',
    accentColor: '#FFFFFF',
    motto: '实事求是',
    established: 1937,
    crestCategory: 'general-seal-roundel',
    symbolName: 'Three Seals of The People Emblem'
  },
  'univ-cn-hit': {
    id: 'univ-cn-hit',
    domain: 'hit.edu.cn',
    primaryColor: '#003366',
    accentColor: '#0288D1',
    motto: '规格严格 功夫到家',
    established: 1920,
    crestCategory: 'general-tech-gear',
    symbolName: 'Engineering Iron Tower & Geometry Seal'
  },
  'univ-cn-wuhan': {
    id: 'univ-cn-wuhan',
    domain: 'whu.edu.cn',
    primaryColor: '#006633',
    accentColor: '#4CAF50',
    motto: '自强弘毅 求是拓新',
    established: 1893,
    crestCategory: 'general-seal-roundel',
    symbolName: 'Luojia Mountain Historic Gateway Seal'
  },
  'univ-cn-sysu': {
    id: 'univ-cn-sysu',
    domain: 'sysu.edu.cn',
    primaryColor: '#005826',
    accentColor: '#81C784',
    motto: '博学 审问 慎思 明辨 笃行',
    established: 1924,
    crestCategory: 'general-seal-roundel',
    symbolName: 'Sun Yat-sen Bronze Memorial Gateway'
  },
  'univ-cn-tongji': {
    id: 'univ-cn-tongji',
    domain: 'tongji.edu.cn',
    primaryColor: '#003882',
    accentColor: '#0277BD',
    motto: '同舟共济',
    established: 1907,
    crestCategory: 'general-seal-roundel',
    symbolName: 'Three Rowers Rowing in One Boat Seal'
  },
  'univ-cn-xjtup': {
    id: 'univ-cn-xjtup',
    domain: 'xjtu.edu.cn',
    primaryColor: '#003366',
    accentColor: '#1976D2',
    motto: '精勤求学 敦笃励志',
    established: 1896,
    crestCategory: 'general-tech-gear',
    symbolName: 'Piston, Compass & Engineering Gear Seal'
  },
  'univ-cn-bnu': {
    id: 'univ-cn-bnu',
    domain: 'bnu.edu.cn',
    primaryColor: '#004A80',
    accentColor: '#64B5F6',
    motto: '学为人师 行为世范',
    established: 1902,
    crestCategory: 'general-seal-roundel',
    symbolName: 'Mudan Wood Bell of Education Seal'
  },
  'univ-cn-nankai': {
    id: 'univ-cn-nankai',
    domain: 'nankai.edu.cn',
    primaryColor: '#4E0C3A',
    accentColor: '#8E24AA',
    motto: '允公允能 日新月异',
    established: 1919,
    crestCategory: 'general-seal-roundel',
    symbolName: 'Eight-Pointed Lotus Petal Star Seal'
  },

  // === Hong Kong Top 5 ===
  'univ-hk-hku': {
    id: 'univ-hk-hku',
    domain: 'hku.hk',
    primaryColor: '#006548',
    accentColor: '#C39A26',
    motto: 'SAPIENTIA ET VIRTUS',
    established: 1911,
    crestCategory: 'hku-lion-crest',
    symbolName: 'Golden Lion, Open Book & Chinese Shield'
  },
  'univ-hk-cuhk': {
    id: 'univ-hk-cuhk',
    domain: 'cuhk.edu.hk',
    primaryColor: '#5C1D54',
    accentColor: '#C49A45',
    motto: '博文约礼',
    established: 1963,
    crestCategory: 'cuhk-phoenix',
    symbolName: 'Mythical Golden Phoenix of Chinese Antiquity'
  },
  'univ-hk-hkust': {
    id: 'univ-hk-hkust',
    domain: 'hkust.edu.hk',
    primaryColor: '#003366',
    accentColor: '#C49A45',
    motto: 'HANDS AND MINDS',
    established: 1991,
    crestCategory: 'hkust-golden-bird',
    symbolName: 'Golden Red Bird Sundial Emblem'
  },
  'univ-hk-polyu': {
    id: 'univ-hk-polyu',
    domain: 'polyu.edu.hk',
    primaryColor: '#781B2B',
    accentColor: '#A8273F',
    motto: 'TO LEARN AND TO APPLY',
    established: 1937,
    crestCategory: 'general-tech-gear',
    symbolName: 'Stylized Interlocking Red Bricks & Tech'
  },
  'univ-hk-cityu': {
    id: 'univ-hk-cityu',
    domain: 'cityu.edu.hk',
    primaryColor: '#8C0028',
    accentColor: '#C9204B',
    motto: 'OFFICIUM ET CIVITAS',
    established: 1984,
    crestCategory: 'general-seal-roundel',
    symbolName: 'Dynamic Arcs of Knowledge & Innovation'
  },

  // === South Korea Top 5 ===
  'univ-kr-snu': {
    id: 'univ-kr-snu',
    domain: 'snu.ac.kr',
    primaryColor: '#0F0F70',
    accentColor: '#B08D57',
    motto: 'VERITAS LUX MEA',
    established: 1946,
    crestCategory: 'snu-torch-key',
    symbolName: 'Gwanak Key of Truth, Laurel & Torch'
  },
  'univ-kr-kaist': {
    id: 'univ-kr-kaist',
    domain: 'kaist.ac.kr',
    primaryColor: '#004191',
    accentColor: '#00A3E0',
    motto: 'SCIENCE AND TECHNOLOGY FOR HUMANITY',
    established: 1971,
    crestCategory: 'kaist-prism',
    symbolName: 'Dynamic Futuristic High-Tech Prism'
  },
  'univ-kr-yonsei': {
    id: 'univ-kr-yonsei',
    domain: 'yonsei.ac.kr',
    primaryColor: '#00205B',
    accentColor: '#004EA2',
    motto: 'THE TRUTH SHALL SET YOU FREE',
    established: 1885,
    crestCategory: 'yonsei-eagle-shield',
    symbolName: 'Soaring Azure Eagle, Shield & Book'
  },
  'univ-kr-korea-univ': {
    id: 'univ-kr-korea-univ',
    domain: 'korea.ac.kr',
    primaryColor: '#862633',
    accentColor: '#000000',
    motto: 'LIBERTAS JUSTITIA VERITAS',
    established: 1905,
    crestCategory: 'korea-tiger',
    symbolName: 'Roaring Anam Tiger of Crimson'
  },
  'univ-kr-postech': {
    id: 'univ-kr-postech',
    domain: 'postech.ac.kr',
    primaryColor: '#C8102E',
    accentColor: '#2B2B2B',
    motto: 'INTEGRITY CREATIVITY ASPIRATION',
    established: 1986,
    crestCategory: 'general-tech-gear',
    symbolName: 'Techno-Venture Hexagonal Flame'
  },

  // === Australia Top 10 (Go8) ===
  'univ-au-melbourne': {
    id: 'univ-au-melbourne',
    domain: 'unimelb.edu.au',
    primaryColor: '#092147',
    accentColor: '#FFFFFF',
    motto: 'POSTERA CRESCAM LAUDE',
    established: 1853,
    crestCategory: 'melbourne-victory',
    symbolName: 'Winged Goddess of Victory & Southern Cross'
  },
  'univ-au-anu': {
    id: 'univ-au-anu',
    domain: 'anu.edu.au',
    primaryColor: '#000000',
    accentColor: '#BE8323',
    motto: 'NATURAM PRIMUM COGNOSCERE RERUM',
    established: 1946,
    crestCategory: 'anu-shield',
    symbolName: 'Boomerang, Southern Cross & English Crest'
  },
  'univ-au-sydney': {
    id: 'univ-au-sydney',
    domain: 'sydney.edu.au',
    primaryColor: '#E64626',
    accentColor: '#010101',
    motto: 'SIDERE MENS EADEM MUTATO',
    established: 1850,
    crestCategory: 'sydney-lion-cross',
    symbolName: 'Lion of St Mark, Open Book & Southern Cross'
  },
  'univ-au-unsw': {
    id: 'univ-au-unsw',
    domain: 'unsw.edu.au',
    primaryColor: '#FFE600',
    accentColor: '#000000',
    motto: 'SCIENTIA CORDE ET MANU',
    established: 1949,
    crestCategory: 'unsw-lion-sun',
    symbolName: 'Lion Passant Guardant & Radiant Sun'
  },
  'univ-au-uq': {
    id: 'univ-au-uq',
    domain: 'uq.edu.au',
    primaryColor: '#49075E',
    accentColor: '#D1A3E2',
    motto: 'SCIENTIA AC LABORE',
    established: 1909,
    crestCategory: 'general-shield-books',
    symbolName: 'Maltese Cross, Open Book & St Lucia Sun'
  },
  'univ-au-monash': {
    id: 'univ-au-monash',
    domain: 'monash.edu',
    primaryColor: '#006DAE',
    accentColor: '#000000',
    motto: 'ANCORA IMPARO',
    established: 1958,
    crestCategory: 'general-shield-books',
    symbolName: 'Sir John Monash Sword, Open Book & Southern Cross'
  },
  'univ-au-uwa': {
    id: 'univ-au-uwa',
    domain: 'uwa.edu.au',
    primaryColor: '#273873',
    accentColor: '#E4A025',
    motto: 'SEEK WISDOM',
    established: 1911,
    crestCategory: 'general-shield-books',
    symbolName: 'Black Swan of Western Australia & Open Book'
  },
  'univ-au-adelaide': {
    id: 'univ-au-adelaide',
    domain: 'adelaide.edu.au',
    primaryColor: '#0D2240',
    accentColor: '#C41230',
    motto: 'SUB CRUCE LUMEN',
    established: 1874,
    crestCategory: 'general-shield-books',
    symbolName: 'Southern Cross under Golden Crown & Book'
  },
  'univ-au-uts': {
    id: 'univ-au-uts',
    domain: 'uts.edu.au',
    primaryColor: '#000000',
    accentColor: '#005DFE',
    motto: 'THINK. CHANGE. DO.',
    established: 1988,
    crestCategory: 'general-tech-gear',
    symbolName: 'Anchor & Mercury Winged Technology Crest'
  },
  'univ-au-macquarie': {
    id: 'univ-au-macquarie',
    domain: 'mq.edu.au',
    primaryColor: '#A6192E',
    accentColor: '#000000',
    motto: 'AND GLADLY TECHE',
    established: 1964,
    crestCategory: 'general-seal-roundel',
    symbolName: 'Lachlan Macquarie Sirius Star & Lighthouse'
  },

  // === Europe Top 20 ===
  'univ-eu-eth-zurich': {
    id: 'univ-eu-eth-zurich',
    domain: 'ethz.ch',
    primaryColor: '#215CAF',
    accentColor: '#1F2429',
    motto: 'POLES OF EXCELLENCE',
    established: 1855,
    crestCategory: 'eth-geometric',
    symbolName: 'Swiss Geometric Polyhedral Monogram'
  },
  'univ-eu-epfl': {
    id: 'univ-eu-epfl',
    domain: 'epfl.ch',
    primaryColor: '#E2001A',
    accentColor: '#000000',
    motto: 'TECHNOLOGY AND INNOVATION',
    established: 1853,
    crestCategory: 'epfl-modern',
    symbolName: 'Lake Geneva Dynamic Red EPFL Identity'
  },
  'univ-eu-tum-germany': {
    id: 'univ-eu-tum-germany',
    domain: 'tum.de',
    primaryColor: '#0065BD',
    accentColor: '#0F1B29',
    motto: 'THE ENTREPRENEURIAL UNIVERSITY',
    established: 1868,
    crestCategory: 'tum-towers',
    symbolName: 'Munich Twin Towers & Bridge Crest'
  },
  'univ-eu-psl-paris': {
    id: 'univ-eu-psl-paris',
    domain: 'psl.eu',
    primaryColor: '#14213D',
    accentColor: '#FCA311',
    motto: 'SCIENCES ET LETTRES',
    established: 2010,
    crestCategory: 'psl-paris',
    symbolName: 'ENS Paris, Dauphine & Mines Constellation'
  },
  'univ-eu-ip-paris': {
    id: 'univ-eu-ip-paris',
    domain: 'ip-paris.fr',
    primaryColor: '#001E38',
    accentColor: '#F15A24',
    motto: 'POUR LA PATRIE LES SCIENCES ET LA GLOIRE',
    established: 1794,
    crestCategory: 'general-tech-gear',
    symbolName: 'École Polytechnique X Crossed Cannons'
  },
  'univ-eu-tu-delft': {
    id: 'univ-eu-tu-delft',
    domain: 'tudelft.nl',
    primaryColor: '#00A6D6',
    accentColor: '#000000',
    motto: 'CHALLENGE THE FUTURE',
    established: 1842,
    crestCategory: 'tu-delft-flame',
    symbolName: 'Prometheus Flame of Knowledge'
  },
  'univ-eu-karolinska': {
    id: 'univ-eu-karolinska',
    domain: 'ki.se',
    primaryColor: '#870052',
    accentColor: '#D97706',
    motto: 'ATT FÖRBÄTTRA MÄNNISKORS HÄLSA',
    established: 1810,
    crestCategory: 'karolinska-serpent',
    symbolName: 'Rod of Asclepius & Nobel Assembly'
  },
  'univ-eu-ku-leuven': {
    id: 'univ-eu-ku-leuven',
    domain: 'kuleuven.be',
    primaryColor: '#1D8DB0',
    accentColor: '#0F2C3F',
    motto: 'SEDES SAPIENTIAE',
    established: 1425,
    crestCategory: 'ku-leuven-sedes',
    symbolName: 'Seat of Wisdom Ancient Seal'
  },
  'univ-eu-sorbonne': {
    id: 'univ-eu-sorbonne',
    domain: 'sorbonne-universite.fr',
    primaryColor: '#FFCC00',
    accentColor: '#111827',
    motto: 'CRÉATEURS DE FUTURS DEPUIS 1257',
    established: 1257,
    crestCategory: 'sorbonne-crest',
    symbolName: 'Historic Parisian Latin Quarter Sun Crest'
  },
  'univ-eu-heidelberg': {
    id: 'univ-eu-heidelberg',
    domain: 'uni-heidelberg.de',
    primaryColor: '#C00000',
    accentColor: '#1A1A1A',
    motto: 'SEMPER APERTUS',
    established: 1386,
    crestCategory: 'general-seal-roundel',
    symbolName: 'Holy Roman Imperial Palatinate Seal'
  },
  'univ-eu-leiden': {
    id: 'univ-eu-leiden',
    domain: 'universiteitleiden.nl',
    primaryColor: '#001158',
    accentColor: '#C29B38',
    motto: 'LIBERTATIS PRAESIDIUM',
    established: 1575,
    crestCategory: 'general-shield-lion',
    symbolName: 'William of Orange Keys & Lion of Holland'
  },
  'univ-eu-rotterdam': {
    id: 'univ-eu-rotterdam',
    domain: 'eur.nl',
    primaryColor: '#007A3D',
    accentColor: '#0F1E16',
    motto: 'MAKE IT HAPPEN',
    established: 1913,
    crestCategory: 'general-seal-roundel',
    symbolName: 'Erasmus of Rotterdam Humanist Seal'
  },
  'univ-eu-tcd-ireland': {
    id: 'univ-eu-tcd-ireland',
    domain: 'tcd.ie',
    primaryColor: '#004A97',
    accentColor: '#D4AF37',
    motto: 'PERPETUIS FUTURIS TEMPORIBUS',
    established: 1592,
    crestCategory: 'tcd-harp-castle',
    symbolName: 'Irish Celtic Harp, Lion & Dublin Castle'
  },
  'univ-eu-amsterdam': {
    id: 'univ-eu-amsterdam',
    domain: 'uva.nl',
    primaryColor: '#000000',
    accentColor: '#BC0031',
    motto: 'ATHENAEUM ILLUSTRE',
    established: 1632,
    crestCategory: 'uva-amsterdam',
    symbolName: 'Three St Andrew’s Crosses of Amsterdam'
  },
  'univ-eu-lmu-munich': {
    id: 'univ-eu-lmu-munich',
    domain: 'lmu.de',
    primaryColor: '#00885B',
    accentColor: '#1A1A1A',
    motto: 'UNIVERSITAS LUDOVICO MAXIMILIANEA',
    established: 1472,
    crestCategory: 'general-seal-roundel',
    symbolName: 'Bavarian Wittelsbach Coat of Arms'
  },
  'univ-eu-copenhagen': {
    id: 'univ-eu-copenhagen',
    domain: 'ku.dk',
    primaryColor: '#901A1E',
    accentColor: '#1C1C1C',
    motto: 'HAFNIENSIS EST. 1479',
    established: 1479,
    crestCategory: 'general-seal-roundel',
    symbolName: 'King Christian I Royal Danish Seal'
  },
  'univ-eu-lund': {
    id: 'univ-eu-lund',
    domain: 'lu.se',
    primaryColor: '#7C6953',
    accentColor: '#002B49',
    motto: 'AD UTRUMQUE PARATUS',
    established: 1666,
    crestCategory: 'general-seal-roundel',
    symbolName: 'Sword & Book Ready For Both'
  },
  'univ-eu-polimi': {
    id: 'univ-eu-polimi',
    domain: 'polimi.it',
    primaryColor: '#003366',
    accentColor: '#999999',
    motto: 'LEONARDO DA VINCI LEGACY',
    established: 1863,
    crestCategory: 'polimi-leonardo',
    symbolName: 'Leonardo da Vinci Atlantic Codex Drawing'
  },
  'univ-eu-zurich': {
    id: 'univ-eu-zurich',
    domain: 'uzh.ch',
    primaryColor: '#0028A5',
    accentColor: '#666666',
    motto: 'TURICENSIS EST. 1833',
    established: 1833,
    crestCategory: 'general-seal-roundel',
    symbolName: 'Zurich Blue & White Shield Roundel'
  },
  'univ-eu-ens-lyon': {
    id: 'univ-eu-ens-lyon',
    domain: 'ens-lyon.fr',
    primaryColor: '#C41230',
    accentColor: '#222222',
    motto: 'ÉCOLE NORMALE SUPÉRIEURE',
    established: 1880,
    crestCategory: 'general-seal-roundel',
    symbolName: 'French Republic Seal & Olive Branch'
  },

  // === India Top 5 ===
  'univ-in-iit-bombay': {
    id: 'univ-in-iit-bombay',
    domain: 'iitb.ac.in',
    primaryColor: '#1A365D',
    accentColor: '#E28743',
    motto: 'ज्ञानम् परमम् ध्येयम्',
    established: 1958,
    crestCategory: 'iit-chakra-lotus',
    symbolName: 'Lotus Petals, Sun & Engineering Cogwheel'
  },
  'univ-in-iit-delhi': {
    id: 'univ-in-iit-delhi',
    domain: 'iitd.ac.in',
    primaryColor: '#B91C1C',
    accentColor: '#1E3A8A',
    motto: 'योगः कर्मसु कौशलम्',
    established: 1961,
    crestCategory: 'iit-chakra-lotus',
    symbolName: 'Lotus Flower, Atom & Gears of Innovation'
  },
  'univ-in-iisc-bangalore': {
    id: 'univ-in-iisc-bangalore',
    domain: 'iisc.ac.in',
    primaryColor: '#7C2D12',
    accentColor: '#D97706',
    motto: 'DISCOVER AND SERVE',
    established: 1909,
    crestCategory: 'iisc-flame',
    symbolName: 'Sacred Flame of Knowledge & Tata Tower'
  },
  'univ-in-iit-kharagpur': {
    id: 'univ-in-iit-kharagpur',
    domain: 'iitkgp.ac.in',
    primaryColor: '#1E3A8A',
    accentColor: '#D97706',
    motto: 'योगः कर्मसु कौशलम्',
    established: 1951,
    crestCategory: 'iit-chakra-lotus',
    symbolName: 'First IIT Flagship Cogwheel & Flame'
  },
  'univ-in-iit-madras': {
    id: 'univ-in-iit-madras',
    domain: 'iitm.ac.in',
    primaryColor: '#0F766E',
    accentColor: '#F59E0B',
    motto: 'सिद्धिर्भवति कर्मजा',
    established: 1959,
    crestCategory: 'iit-chakra-lotus',
    symbolName: 'Two Crossed Banyan Leaves & Gearwheel'
  },

  // === Singapore Top 5 ===
  'univ-sg-nus': {
    id: 'univ-sg-nus',
    domain: 'nus.edu.sg',
    primaryColor: '#EF7C00',
    accentColor: '#003D7C',
    motto: 'TOWARDS A GLOBAL KNOWLEDGE ENTERPRISE',
    established: 1905,
    crestCategory: 'nus-lion-sunburst',
    symbolName: 'Majestic Singapore Lion & Radiant Sunburst'
  },
  'univ-sg-ntu': {
    id: 'univ-sg-ntu',
    domain: 'ntu.edu.sg',
    primaryColor: '#C8102E',
    accentColor: '#002B49',
    motto: 'COGNITIVE SCIENCE & TECH',
    established: 1991,
    crestCategory: 'ntu-lion-cog',
    symbolName: 'Nanyang Lion, Cogwheel & Atomic Orbit'
  },
  'univ-sg-smu': {
    id: 'univ-sg-smu',
    domain: 'smu.edu.sg',
    primaryColor: '#151C55',
    accentColor: '#8A704C',
    motto: 'A DIFFERENT U',
    established: 2000,
    crestCategory: 'smu-spire',
    symbolName: 'Dynamic Tangram City Spire'
  },
  'univ-sg-sutd': {
    id: 'univ-sg-sutd',
    domain: 'sutd.edu.sg',
    primaryColor: '#E2231A',
    accentColor: '#1F2937',
    motto: 'A BETTER WORLD BY DESIGN',
    established: 2009,
    crestCategory: 'general-tech-gear',
    symbolName: 'Architectural Geometric Design Grid'
  },
  'univ-sg-suss': {
    id: 'univ-sg-suss',
    domain: 'suss.edu.sg',
    primaryColor: '#003366',
    accentColor: '#D97706',
    motto: 'LEARNING FOR LIFE',
    established: 2017,
    crestCategory: 'general-seal-roundel',
    symbolName: 'Continuous Mobius Loop of Lifelong Learning'
  },

  // === Japan Top 5 ===
  'univ-jp-utokyo': {
    id: 'univ-jp-utokyo',
    domain: 'u-tokyo.ac.jp',
    primaryColor: '#003366',
    accentColor: '#E5A823',
    motto: 'DISCOVER EXCELLENCE',
    established: 1877,
    crestCategory: 'tokyo-ginkgo',
    symbolName: 'Dual Yellow and Blue Ginkgo Leaves'
  },
  'univ-jp-kyoto': {
    id: 'univ-jp-kyoto',
    domain: 'kyoto-u.ac.jp',
    primaryColor: '#001E62',
    accentColor: '#8C1D40',
    motto: 'FREEDOM OF ACADEMIC CULTURE',
    established: 1897,
    crestCategory: 'kyoto-camphor',
    symbolName: 'Historic Clock Tower & Sacred Camphor Tree'
  },
  'univ-jp-tokyo-tech': {
    id: 'univ-jp-tokyo-tech',
    domain: 'isct.ac.jp',
    primaryColor: '#004F9F',
    accentColor: '#00A0E9',
    motto: 'SCIENCE AND ENGINEERING ADVANCEMENT',
    established: 1881,
    crestCategory: 'tokyo-tech-swallow',
    symbolName: 'Swallow Flying Over Seal of Science'
  },
  'univ-jp-osaka': {
    id: 'univ-jp-osaka',
    domain: 'osaka-u.ac.jp',
    primaryColor: '#5C9BD5',
    accentColor: '#002060',
    motto: 'LIVE LOCALLY GROW GLOBALLY',
    established: 1931,
    crestCategory: 'osaka-ginkgo',
    symbolName: 'Kaitokudo Three Ginkgo Leaves'
  },
  'univ-jp-tohoku': {
    id: 'univ-jp-tohoku',
    domain: 'tohoku.ac.jp',
    primaryColor: '#4F2C84',
    accentColor: '#FFFFFF',
    motto: 'RESEARCH FIRST AND OPEN DOORS',
    established: 1907,
    crestCategory: 'tohoku-hagi',
    symbolName: 'Sendai Bush Clover (Hagi) Flower Crest'
  }
};

export const getUniversityCrestMeta = (id: string, fallbackName?: string, region?: string): UniversityCrestMeta => {
  if (UNIVERSITY_CRESTS_MAP[id]) {
    return UNIVERSITY_CRESTS_MAP[id];
  }

  // Graceful fallback
  const isTech = (fallbackName || '').toLowerCase().includes('tech') || (fallbackName || '').toLowerCase().includes('science');
  return {
    id,
    domain: 'university.edu',
    primaryColor: region === 'USA' ? '#A51C30' : region === 'UK' ? '#002147' : '#047857',
    accentColor: '#D97706',
    motto: 'EXCELLENTIA ET VERITAS',
    established: 1900,
    crestCategory: isTech ? 'general-tech-gear' : 'general-shield-books',
    symbolName: 'Collegiate Crest of Excellence'
  };
};
