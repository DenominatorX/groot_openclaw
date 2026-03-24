/* ═══════════════════════════════════════════════════════
   LINEAGE DATA — with confidence scores and translation variants
   ═══════════════════════════════════════════════════════ */

export const ERAS = [
  { id: 'creation',         name: 'Creation & Antediluvians',  range: '~4000–2348 BC', color: '#1a1a2e' },
  { id: 'patriarchs',       name: 'The Patriarchs',            range: '~2166–1526 BC', color: '#16213e' },
  { id: 'exodus',           name: 'Exodus & Conquest',         range: '~1526–1375 BC', color: '#0f3460' },
  { id: 'judges',           name: 'The Judges',                range: '~1375–1050 BC', color: '#533483' },
  { id: 'united_kingdom',   name: 'United Kingdom',            range: '~1050–930 BC',  color: '#e94560' },
  { id: 'divided_kingdom',  name: 'Divided Kingdom',           range: '~930–586 BC',   color: '#b55400' },
  { id: 'exile',            name: 'The Exile',                 range: '~586–538 BC',   color: '#4a4a4a' },
  { id: 'return',           name: 'Return & Restoration',      range: '~538–400 BC',   color: '#1a5c3a' },
  { id: 'intertestamental', name: 'Intertestamental',          range: '~400 BC–6 BC',  color: '#3d3d6b' },
  { id: 'gospel',           name: 'The Gospel Era',            range: '~6 BC–33 AD',   color: '#8b0000' },
  { id: 'apostolic',        name: 'Apostolic Age',             range: '~33–100 AD',    color: '#1a3c5e' },
];

/**
 * Translation variant map.
 * For each person ID, provides the name as it appears in KJV, NIV, and Septuagint (LXX).
 * Entries are only added when names differ across translations.
 */
export const TRANSLATION_VARIANTS = {
  // Creation era
  enosh:       { kjv: 'Enos',       niv: 'Enosh',      lxx: 'Enos'       },
  kenan:       { kjv: 'Cainan',     niv: 'Kenan',      lxx: 'Cainan'     },
  mahalalel:   { kjv: 'Mahalaleel', niv: 'Mahalalel',  lxx: 'Maleleel'   },
  methuselah:  { kjv: 'Methuselah', niv: 'Methuselah', lxx: 'Mathusala'  },
  lamech_s:    { kjv: 'Lamech',     niv: 'Lamech',     lxx: 'Lamech'     },
  arphaxad:    { kjv: 'Arphaxad',   niv: 'Arphaxad',   lxx: 'Arphaxad'   },
  eber:        { kjv: 'Heber',      niv: 'Eber',       lxx: 'Heber'      },
  // Patriarchs
  hezron:      { kjv: 'Esrom',      niv: 'Hezron',     lxx: 'Esrom'      },
  ram:         { kjv: 'Aram',       niv: 'Ram',        lxx: 'Aram'       },
  amminadab:   { kjv: 'Aminadab',   niv: 'Amminadab',  lxx: 'Aminadab'   },
  // Judges
  salmon:      { kjv: 'Salmon',     niv: 'Salmon',     lxx: 'Sala'       },
  // Intertestamental
  eliakim_m:   { kjv: 'Eliakim',    niv: 'Eliakim',    lxx: 'Eliakim'    },
  zadok_m:     { kjv: 'Sadoc',      niv: 'Zadok',      lxx: 'Sadok'      },
  achim:       { kjv: 'Achim',      niv: 'Akim',       lxx: 'Achim'      },
  eleazar_m:   { kjv: 'Eleazar',    niv: 'Eleazar',    lxx: 'Eleazar'    },
  matthan:     { kjv: 'Matthan',    niv: 'Matthan',    lxx: 'Matthan'    },
  jacob_m:     { kjv: 'Jacob',      niv: 'Jacob',      lxx: 'Iakob'      },
  joseph_h:    { kjv: 'Joseph',     niv: 'Joseph',     lxx: 'Ioseph'     },
};

/**
 * Confidence score defaults per connection type.
 * Messianic chain (explicitly in Matthew/Luke genealogies): 95–100.
 * Named in Torah with parentage stated: 80–94.
 * Named but parentage inferred: 50–79.
 * Speculative or tradition-based: 1–49.
 */
export const LINEAGE = [
  { id:'adam',       name:'Adam',            era:'creation',         messianic:true,  confidence:98, age:930,  parent:null,       spouse:['eve'],             children:['seth','cain','abel'],          refs:['Genesis 1:26-27','Genesis 5:1-5'],                              summary:'The first human created by God from the dust of the ground.',                          significance:'First man, created in the image of God.' },
  { id:'eve',        name:'Eve',             era:'creation',                          confidence:98,           parent:null,       spouse:['adam'],            children:['seth','cain','abel'],          refs:['Genesis 2:21-23','Genesis 3:20'],                               summary:'The first woman, mother of all living.' },
  { id:'cain',       name:'Cain',            era:'creation',                          confidence:95,           parent:'adam',     children:[],                                                          refs:['Genesis 4:1-16'],                                               summary:'Firstborn of Adam. Murdered his brother Abel.' },
  { id:'abel',       name:'Abel',            era:'creation',                          confidence:95,           parent:'adam',     children:[],                                                          refs:['Genesis 4:2-8','Hebrews 11:4'],                                 summary:'Second son of Adam. First martyr.' },
  { id:'seth',       name:'Seth',            era:'creation',         messianic:true,  confidence:98, age:912,  parent:'adam',                                 children:['enosh'],                      refs:['Genesis 4:25-26','Genesis 5:3-8'],                              summary:"Third son of Adam, born after Abel's death." },
  { id:'enosh',      name:'Enosh',           era:'creation',         messianic:true,  confidence:97, age:905,  parent:'seth',                                 children:['kenan'],                      refs:['Genesis 5:6-11'] },
  { id:'kenan',      name:'Kenan',           era:'creation',         messianic:true,  confidence:97, age:910,  parent:'enosh',                                children:['mahalalel'],                  refs:['Genesis 5:9-14'] },
  { id:'mahalalel',  name:'Mahalalel',       era:'creation',         messianic:true,  confidence:97, age:895,  parent:'kenan',                                children:['jared'],                      refs:['Genesis 5:12-17'] },
  { id:'jared',      name:'Jared',           era:'creation',         messianic:true,  confidence:97, age:962,  parent:'mahalalel',                            children:['enoch'],                      refs:['Genesis 5:15-20'] },
  { id:'enoch',      name:'Enoch',           era:'creation',         messianic:true,  confidence:97, age:365,  parent:'jared',                                children:['methuselah'],                 refs:['Genesis 5:18-24','Hebrews 11:5'],                               summary:'Walked with God and was taken up without dying.',                              significance:'One of only two people who never died.' },
  { id:'methuselah', name:'Methuselah',      era:'creation',         messianic:true,  confidence:97, age:969,  parent:'enoch',                                children:['lamech_s'],                   refs:['Genesis 5:21-27'],                                               summary:'Longest-lived person in the Bible at 969 years.' },
  { id:'lamech_s',   name:'Lamech',          era:'creation',         messianic:true,  confidence:97, age:777,  parent:'methuselah',                           children:['noah'],                       refs:['Genesis 5:25-31'] },
  { id:'noah',       name:'Noah',            era:'creation',         messianic:true,  confidence:99, age:950,  parent:'lamech_s',                             children:['shem','ham','japheth'],       refs:['Genesis 5:28-9:29','Hebrews 11:7'],                             summary:'Built the Ark and survived the Great Flood.',                                  significance:"Through him humanity was preserved. God's covenant of the rainbow." },
  { id:'shem',       name:'Shem',            era:'creation',         messianic:true,  confidence:98, age:600,  parent:'noah',                                 children:['arphaxad'],                   refs:['Genesis 10:21-31','Genesis 11:10-11'],                          summary:'Eldest son of Noah. Father of Semitic peoples.' },
  { id:'ham',        name:'Ham',             era:'creation',                          confidence:96,           parent:'noah',     children:[],                                                          refs:['Genesis 9:22','Genesis 10:6-20'] },
  { id:'japheth',    name:'Japheth',         era:'creation',                          confidence:96,           parent:'noah',     children:[],                                                          refs:['Genesis 10:2-5'] },
  { id:'arphaxad',   name:'Arphaxad',        era:'creation',         messianic:true,  confidence:96,           parent:'shem',                                 children:['shelah'],                     refs:['Genesis 11:12-13'] },
  { id:'shelah',     name:'Shelah',          era:'creation',         messianic:true,  confidence:96,           parent:'arphaxad',                             children:['eber'],                       refs:['Genesis 11:14-15'] },
  { id:'eber',       name:'Eber',            era:'creation',         messianic:true,  confidence:96,           parent:'shelah',                               children:['peleg'],                      refs:['Genesis 11:16-17'],                                              summary:'Ancestor of the Hebrews—the name derives from Eber.' },
  { id:'peleg',      name:'Peleg',           era:'creation',         messianic:true,  confidence:96,           parent:'eber',                                 children:['reu'],                        refs:['Genesis 10:25','Genesis 11:18-19'],                             summary:'"In his days the earth was divided."' },
  { id:'reu',        name:'Reu',             era:'creation',         messianic:true,  confidence:96,           parent:'peleg',                                children:['serug'],                      refs:['Genesis 11:20-21'] },
  { id:'serug',      name:'Serug',           era:'creation',         messianic:true,  confidence:96,           parent:'reu',                                  children:['nahor'],                      refs:['Genesis 11:22-23'] },
  { id:'nahor',      name:'Nahor',           era:'creation',         messianic:true,  confidence:96,           parent:'serug',                                children:['terah'],                      refs:['Genesis 11:24-25'] },
  { id:'terah',      name:'Terah',           era:'patriarchs',       messianic:true,  confidence:97, age:205,  parent:'nahor',                                children:['abraham'],                    refs:['Genesis 11:24-32'],                                              summary:'Father of Abraham. Led his family from Ur toward Canaan.' },
  { id:'abraham',    name:'Abraham',         era:'patriarchs',       messianic:true,  confidence:99, age:175,  parent:'terah',    spouse:['sarah','hagar'],   children:['isaac','ishmael'],            refs:['Genesis 12-25','Romans 4','Hebrews 11:8-19'],                  summary:'Father of many nations. Called by God to journey to Canaan.',                  significance:'Father of Judaism, Christianity, and Islam.' },
  { id:'sarah',      name:'Sarah',           era:'patriarchs',                        confidence:99, age:127,  parent:null,       spouse:['abraham'],         children:['isaac'],                      refs:['Genesis 11:29-23:19'],                                          summary:'Wife of Abraham. Bore Isaac in old age.' },
  { id:'hagar',      name:'Hagar',           era:'patriarchs',                        confidence:92,           parent:null,       spouse:['abraham'],         children:['ishmael'],                    refs:['Genesis 16','Genesis 21:9-21'] },
  { id:'ishmael',    name:'Ishmael',         era:'patriarchs',                        confidence:98, age:137,  parent:'abraham',                              children:[],                             refs:['Genesis 16','Genesis 25:12-18'],                                summary:'First son of Abraham through Hagar. Ancestor of the Arab peoples.' },
  { id:'isaac',      name:'Isaac',           era:'patriarchs',       messianic:true,  confidence:99, age:180,  parent:'abraham',  spouse:['rebekah'],         children:['jacob','esau'],               refs:['Genesis 21-27','Hebrews 11:20'],                                summary:'Child of promise. Nearly sacrificed on Mount Moriah.' },
  { id:'rebekah',    name:'Rebekah',         era:'patriarchs',                        confidence:98,           parent:null,       spouse:['isaac'],           children:['jacob','esau'],               refs:['Genesis 24-27'] },
  { id:'esau',       name:'Esau',            era:'patriarchs',                        confidence:98,           parent:'isaac',    children:[],                                                          refs:['Genesis 25-36'],                                               summary:'Sold his birthright. Father of the Edomites.' },
  { id:'jacob',      name:'Jacob (Israel)',  era:'patriarchs',       messianic:true,  confidence:99, age:147,  parent:'isaac',    spouse:['leah','rachel'],   children:['reuben','simeon','levi','judah','joseph','benjamin'], refs:['Genesis 25-50'],                summary:'Renamed Israel after wrestling with God. Father of the twelve tribes.',         significance:'The nation of Israel takes its name from him.' },
  { id:'leah',       name:'Leah',           era:'patriarchs',                        confidence:98,           parent:null,       spouse:['jacob'],           children:['reuben','simeon','levi','judah'], refs:['Genesis 29-35'] },
  { id:'rachel',     name:'Rachel',         era:'patriarchs',                        confidence:98,           parent:null,       spouse:['jacob'],           children:['joseph','benjamin'],          refs:['Genesis 29-35'],                                               summary:'Beloved wife of Jacob. Died in childbirth with Benjamin.' },
  { id:'judah',      name:'Judah',          era:'patriarchs',       messianic:true,  confidence:99,           parent:'jacob',                                children:['perez'],                      refs:['Genesis 38','Genesis 49:8-12','Matthew 1:2-3'],                 summary:'Fourth son of Jacob.',                                                          significance:'"The scepter shall not depart from Judah." Royal/Messianic line.' },
  { id:'joseph',     name:'Joseph',         era:'patriarchs',                        confidence:98,           parent:'jacob',    children:[],                                                          refs:['Genesis 37-50'],                                               summary:'Sold into slavery, rose to become vizier of Egypt.',                            significance:'A type of Christ—betrayed, exalted, and savior of his family.' },
  { id:'benjamin',   name:'Benjamin',       era:'patriarchs',                        confidence:98,           parent:'jacob',    children:[],                                                          refs:['Genesis 35:16-18'] },
  { id:'levi',       name:'Levi',           era:'patriarchs',                        confidence:97,           parent:'jacob',                                children:['kohath'],                     refs:['Genesis 29:34','Exodus 6:16-25'],                               summary:'His descendants became the priestly tribe.' },
  { id:'reuben',     name:'Reuben',         era:'patriarchs',                        confidence:97,           parent:'jacob',    children:[],                                                          refs:['Genesis 29:32','Genesis 49:3-4'] },
  { id:'simeon',     name:'Simeon',         era:'patriarchs',                        confidence:97,           parent:'jacob',    children:[],                                                          refs:['Genesis 29:33'] },
  { id:'perez',      name:'Perez',          era:'patriarchs',       messianic:true,  confidence:98,           parent:'judah',                                children:['hezron'],                     refs:['Genesis 38:27-30','Ruth 4:18-22','Matthew 1:3'] },
  { id:'hezron',     name:'Hezron',         era:'patriarchs',       messianic:true,  confidence:97,           parent:'perez',                                children:['ram'],                        refs:['Ruth 4:18-19','Matthew 1:3'] },
  { id:'ram',        name:'Ram',            era:'patriarchs',       messianic:true,  confidence:96,           parent:'hezron',                               children:['amminadab'],                  refs:['Ruth 4:19','Matthew 1:3-4'] },
  { id:'amminadab',  name:'Amminadab',      era:'exodus',           messianic:true,  confidence:96,           parent:'ram',                                  children:['nahshon'],                    refs:['Ruth 4:19-20','Matthew 1:4'] },
  { id:'nahshon',    name:'Nahshon',        era:'exodus',           messianic:true,  confidence:96,           parent:'amminadab',                            children:['salmon'],                     refs:['Ruth 4:20','Matthew 1:4','Numbers 1:7'],                        summary:'Leader of the tribe of Judah during the Exodus.' },
  { id:'kohath',     name:'Kohath',         era:'exodus',                            confidence:95,           parent:'levi',                                 children:['amram'],                      refs:['Exodus 6:16-18'] },
  { id:'amram',      name:'Amram',          era:'exodus',                            confidence:95,           parent:'kohath',                               children:['moses','aaron'],              refs:['Exodus 6:18-20'] },
  { id:'moses',      name:'Moses',          era:'exodus',                            confidence:99, age:120,  parent:'amram',    children:[],                                                          refs:['Exodus 2-Deuteronomy 34','Hebrews 11:24-28'],                  summary:'The great lawgiver. Led Israel out of Egypt.',                                  significance:'Prophet, lawgiver, mediator of the Old Covenant.' },
  { id:'aaron',      name:'Aaron',          era:'exodus',                            confidence:99, age:123,  parent:'amram',    children:[],                                                          refs:['Exodus 4-Numbers 20'],                                          summary:'Brother of Moses. First High Priest of Israel.' },
  { id:'salmon',     name:'Salmon',         era:'judges',           messianic:true,  confidence:93,           parent:'nahshon',  spouse:['rahab'],           children:['boaz'],                       refs:['Ruth 4:20-21','Matthew 1:4-5'] },
  { id:'rahab',      name:'Rahab',          era:'judges',                            confidence:90,           parent:null,       spouse:['salmon'],          children:['boaz'],                       refs:['Joshua 2','Hebrews 11:31','Matthew 1:5'],                       summary:'Former prostitute of Jericho. Sheltered the spies.',                           significance:'A Gentile woman in the Messianic line.' },
  { id:'boaz',       name:'Boaz',           era:'judges',           messianic:true,  confidence:97,           parent:'salmon',   spouse:['ruth'],            children:['obed'],                       refs:['Ruth 2-4','Matthew 1:5'],                                       summary:'Kinsman-redeemer who married Ruth.',                                            significance:'A type of Christ as redeemer.' },
  { id:'ruth',       name:'Ruth',           era:'judges',                            confidence:98,           parent:null,       spouse:['boaz'],            children:['obed'],                       refs:['Ruth 1-4','Matthew 1:5'],                                       summary:'Moabite woman who pledged loyalty to Naomi and God.',                          significance:'Gentile woman in the Messianic line. Embodies faithfulness.' },
  { id:'obed',       name:'Obed',           era:'judges',           messianic:true,  confidence:97,           parent:'boaz',                                 children:['jesse'],                      refs:['Ruth 4:17-22','Matthew 1:5'] },
  { id:'jesse',      name:'Jesse',          era:'united_kingdom',   messianic:true,  confidence:98,           parent:'obed',                                 children:['david'],                      refs:['Ruth 4:22','1 Samuel 16-17','Isaiah 11:1','Matthew 1:5-6'],    summary:'Father of David. Isaiah prophesied "a shoot from the stump of Jesse."' },
  { id:'david',      name:'David',          era:'united_kingdom',   messianic:true,  confidence:99, age:70,   parent:'jesse',    spouse:['bathsheba'],       children:['solomon','absalom'],          refs:['1 Samuel 16-1 Kings 2','Matthew 1:6','Acts 13:22'],            summary:'Shepherd, warrior, poet, and king of Israel.',                                  significance:'Greatest king. Jesus is called "Son of David." Author of many Psalms.' },
  { id:'bathsheba',  name:'Bathsheba',      era:'united_kingdom',                    confidence:97,           parent:null,       spouse:['david'],           children:['solomon'],                    refs:['2 Samuel 11-12','Matthew 1:6'] },
  { id:'absalom',    name:'Absalom',        era:'united_kingdom',                    confidence:97,           parent:'david',    children:[],                                                          refs:['2 Samuel 13-18'],                                               summary:'Rebelled against David, killed in battle.' },
  { id:'solomon',    name:'Solomon',        era:'united_kingdom',   messianic:true,  confidence:99,           parent:'david',                                children:['rehoboam'],                   refs:['1 Kings 1-11','Matthew 1:6-7'],                                 summary:'Wisest king. Built the First Temple.',                                          significance:'Author of Proverbs, Ecclesiastes, Song of Solomon.' },
  { id:'rehoboam',   name:'Rehoboam',       era:'divided_kingdom',  messianic:true,  confidence:98,           parent:'solomon',                              children:['abijah'],                     refs:['1 Kings 12-14','Matthew 1:7'],                                  summary:'His harshness split the kingdom.' },
  { id:'abijah',     name:'Abijah',         era:'divided_kingdom',  messianic:true,  confidence:97,           parent:'rehoboam',                             children:['asa'],                        refs:['1 Kings 15:1-8','Matthew 1:7'] },
  { id:'asa',        name:'Asa',            era:'divided_kingdom',  messianic:true,  confidence:97,           parent:'abijah',                               children:['jehoshaphat'],                refs:['1 Kings 15:9-24','Matthew 1:7-8'] },
  { id:'jehoshaphat',name:'Jehoshaphat',    era:'divided_kingdom',  messianic:true,  confidence:97,           parent:'asa',                                  children:['jehoram'],                    refs:['1 Kings 22','Matthew 1:8'] },
  { id:'jehoram',    name:'Jehoram',        era:'divided_kingdom',  messianic:true,  confidence:97,           parent:'jehoshaphat',                          children:['uzziah'],                     refs:['2 Kings 8:16-24','Matthew 1:8'] },
  { id:'uzziah',     name:'Uzziah',         era:'divided_kingdom',  messianic:true,  confidence:97,           parent:'jehoram',                              children:['jotham'],                     refs:['2 Kings 15:1-7','Matthew 1:8-9'] },
  { id:'jotham',     name:'Jotham',         era:'divided_kingdom',  messianic:true,  confidence:97,           parent:'uzziah',                               children:['ahaz'],                       refs:['2 Kings 15:32-38','Matthew 1:9'] },
  { id:'ahaz',       name:'Ahaz',           era:'divided_kingdom',  messianic:true,  confidence:97,           parent:'jotham',                               children:['hezekiah'],                   refs:['2 Kings 16','Matthew 1:9','Isaiah 7:1-16'] },
  { id:'hezekiah',   name:'Hezekiah',       era:'divided_kingdom',  messianic:true,  confidence:97,           parent:'ahaz',                                 children:['manasseh_k'],                 refs:['2 Kings 18-20','Matthew 1:9-10'],                               summary:"One of Judah's greatest kings. Restored worship." },
  { id:'manasseh_k', name:'Manasseh',       era:'divided_kingdom',  messianic:true,  confidence:97,           parent:'hezekiah',                             children:['amon'],                       refs:['2 Kings 21:1-18','Matthew 1:10'] },
  { id:'amon',       name:'Amon',           era:'divided_kingdom',  messianic:true,  confidence:97,           parent:'manasseh_k',                           children:['josiah'],                     refs:['2 Kings 21:19-26','Matthew 1:10'] },
  { id:'josiah',     name:'Josiah',         era:'divided_kingdom',  messianic:true,  confidence:97,           parent:'amon',                                 children:['jeconiah'],                   refs:['2 Kings 22-23','Matthew 1:10-11'],                              summary:'Found the lost Book of the Law. Greatest revival.' },
  { id:'jeconiah',   name:'Jeconiah',       era:'exile',            messianic:true,  confidence:96,           parent:'josiah',                               children:['shealtiel'],                  refs:['2 Kings 24:6-16','Matthew 1:11-12'] },
  { id:'shealtiel',  name:'Shealtiel',      era:'exile',            messianic:true,  confidence:94,           parent:'jeconiah',                             children:['zerubbabel'],                 refs:['Matthew 1:12','Ezra 3:2'] },
  { id:'zerubbabel', name:'Zerubbabel',     era:'return',           messianic:true,  confidence:95,           parent:'shealtiel',                            children:['abiud'],                      refs:['Ezra 3-5','Matthew 1:12-13'],                                   summary:'Led the return from Babylon. Rebuilt the Temple.' },
  { id:'abiud',      name:'Abiud',          era:'return',           messianic:true,  confidence:70,           parent:'zerubbabel',                           children:['eliakim_m'],                  refs:['Matthew 1:13'],                                                 note:'Known only from Matthew genealogy; no other textual corroboration.' },
  { id:'eliakim_m',  name:'Eliakim',        era:'intertestamental', messianic:true,  confidence:68,           parent:'abiud',                                children:['azor'],                       refs:['Matthew 1:13'],                                                 note:'Intertestamental period — no independent corroboration.' },
  { id:'azor',       name:'Azor',           era:'intertestamental', messianic:true,  confidence:65,           parent:'eliakim_m',                            children:['zadok_m'],                    refs:['Matthew 1:13-14'] },
  { id:'zadok_m',    name:'Zadok',          era:'intertestamental', messianic:true,  confidence:63,           parent:'azor',                                 children:['achim'],                      refs:['Matthew 1:14'] },
  { id:'achim',      name:'Achim',          era:'intertestamental', messianic:true,  confidence:60,           parent:'zadok_m',                              children:['eliud'],                      refs:['Matthew 1:14'] },
  { id:'eliud',      name:'Eliud',          era:'intertestamental', messianic:true,  confidence:60,           parent:'achim',                                children:['eleazar_m'],                  refs:['Matthew 1:14-15'] },
  { id:'eleazar_m',  name:'Eleazar',        era:'intertestamental', messianic:true,  confidence:60,           parent:'eliud',                                children:['matthan'],                    refs:['Matthew 1:15'] },
  { id:'matthan',    name:'Matthan',        era:'intertestamental', messianic:true,  confidence:60,           parent:'eleazar_m',                            children:['jacob_m'],                    refs:['Matthew 1:15'] },
  { id:'jacob_m',    name:'Jacob',          era:'intertestamental', messianic:true,  confidence:62,           parent:'matthan',                              children:['joseph_h'],                   refs:['Matthew 1:15-16'] },
  { id:'joseph_h',   name:'Joseph',         era:'gospel',           messianic:true,  confidence:99,           parent:'jacob_m',  spouse:['mary'],            children:['jesus'],                      refs:['Matthew 1:16-25','Luke 2'],                                     summary:'Husband of Mary. Carpenter from Nazareth.' },
  { id:'mary',       name:'Mary',           era:'gospel',                            confidence:99,           parent:null,       spouse:['joseph_h'],        children:['jesus'],                      refs:['Matthew 1-2','Luke 1-2','John 19:25-27'],                       summary:'Mother of Jesus. Chosen by God.' },
  { id:'jesus',      name:'Jesus',          era:'gospel',           messianic:true,  confidence:100,          parent:'joseph_h', children:[],                                                          refs:['Matthew-John','Acts 1','Revelation 1,19,22'],                  summary:'Born in Bethlehem. Teacher, healer, crucified and risen.',                      significance:'The culmination of the Messianic line. Son of God, Savior of the world.' },
];

export const MESSIANIC_LINE = LINEAGE.filter(p => p.messianic);
