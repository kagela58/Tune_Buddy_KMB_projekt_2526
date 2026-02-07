import { db } from './db';

export interface EventRow {
  id: number;
  title: string;
  location: string;
  date: string;
  artists: string;
  genre: string;
  ticketUrl: string | null;
  source: string | null;
  createdAt: string;
}

export function seedEvents() {
  // Try to fetch count, if fails table doesn't exist
  let existing = 0;
  try {
    const result = db.prepare('SELECT COUNT(*) as count FROM events').get() as { count: number };
    existing = result.count;
  } catch (e) {
    existing = 0;
  }

  const events = [
    // Zagreb 2026
    { title: 'Lollipop Presents Black Eyed Peas @ Bundek Lake, Zagreb', location: 'Zagreb', date: '2026-06-26', artists: 'DJ', genre: 'Pop', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    { title: 'Lollipop Pyjama Party @ Zagrebački Velesajam', location: 'Zagreb', date: '2026-03-07', artists: 'DJ', genre: 'Pop', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    { title: 'K-Pop Forever @ Arena Zagreb', location: 'Zagreb', date: '2026-03-20', artists: 'K-Pop Forever', genre: 'Pop', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'K-Pop Forever @ Arena Zagreb', location: 'Zagreb', date: '2026-03-21', artists: 'K-Pop Forever', genre: 'Pop', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'STING 3.0 @ Arena Zagreb', location: 'Zagreb', date: '2026-06-17', artists: 'Sting', genre: 'Rock, Jazz, Reggae, Classical', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Eros Ramazzotti @ Arena Zagreb', location: 'Zagreb', date: '2026-04-28', artists: 'Eros Ramazzotti', genre: 'Classical', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Andre Rieu & Johann Strauss Orchestra @ Arena Zagreb', location: 'Zagreb', date: '2026-11-20', artists: 'Andre Rieu & Johann Strauss Orchestra', genre: 'Classical', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Koncert Sjećanja Na Tomu Zdravkovića @ Arena Zagreb', location: 'Zagreb', date: '2026-03-28', artists: 'Toma Zdravković-Tribute', genre: 'Folk', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Ana Bekuta @ Arena Zagreb', location: 'Zagreb', date: '2026-02-14', artists: 'Ana Bekuta', genre: 'Folk', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Hari Mata Hari @ Arena Zagreb', location: 'Zagreb', date: '2026-03-14', artists: 'Hari Mata Hari', genre: 'Pop, Rock', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Marilyn Manson @ Arena Zagreb', location: 'Zagreb', date: '2026-07-16', artists: 'Marilyn Manson', genre: 'Rock', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Jala Brat & Buba Corelli @ Arena Zagreb', location: 'Zagreb', date: '2026-05-09', artists: 'Jala Brat & Buba Corelli', genre: 'Turbofolk', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Pink Floyd"s Dark Side Of The Moon @ Mozaik Event Centar Zagreb', location: 'Zagreb', date: '2026-02-14', artists: 'Pink Floyd', genre: 'Rock', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Pink Floyd"s the Wall @ Mozaik Event Centar Zagreb', location: 'Zagreb', date: '2026-02-14', artists: 'Pink Floyd', genre: 'Rock', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'The Music Of Hans Zimmer & Others @ Mozaik Event Centar', location: 'Zagreb', date: '2026-05-03', artists: 'Hans Zimmer', genre: 'Classical', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Jurica Pađen & Aerodrom @ Boogaloo Club', location: 'Zagreb', date: '2026-03-05', artists: 'Jurica Pađen & Aerodrom', genre: 'Pop', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Six Feet Under @ Boogaloo Club', location: 'Zagreb', date: '2026-06-09', artists: 'Six Feet Under', genre: 'Metal', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Like Magic Mike Show - Antivalentinovo @ Peron 16', location: 'Zagreb', date: '2026-02-13', artists: 'Magic Mike show', genre: 'Pop', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Zebrahead @ Boogaloo Club', location: 'Zagreb', date: '2026-02-13', artists: 'Zebrahead', genre: 'Pop, Rock', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'The Music Of The Lion King @ Mozaik Event Centar Zagreb', location: 'Zagreb', date: '2026-05-03', artists: 'The Lion King', genre: 'Classical', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Lord of the rings, the Hobbit and the Rings of power @ Mozaik Event Centar', location: 'Zagreb', date: '2026-05-03', artists: 'LOTR', genre: 'Classical', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Domenica @ Arena Zagreb', location: 'Zagreb', date: '2026-11-08', artists: 'Domenica', genre: 'Pop', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Jasna Zlokić @ Tvornica kulture Zagreb', location: 'Zagreb', date: '2026-10-10', artists: 'Jasna Zlokić', genre: 'Pop', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Giuliano & Diktatori @ Grand Casino Admiral', location: 'Zagreb', date: '2026-03-06', artists: 'Giuliano & Diktatori', genre: 'Pop', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'ToMa @ Tvornica kulture Zagreb', location: 'Zagreb', date: '2026-04-18', artists: 'ToMa', genre: 'Pop', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Miles Kane @ Boogaloo Club', location: 'Zagreb', date: '2026-02-26', artists: 'Miles Kane', genre: 'Pop', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Coby @ Boćarski dom', location: 'Zagreb', date: '2026-03-21', artists: 'Coby', genre: 'Turbofolk', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    { title: 'Natali Dizdar @ Boogaloo Club', location: 'Zagreb', date: '2026-02-14', artists: 'Natali Dizdar', genre: 'Pop', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    { title: 'Crvena Jabuka @ Boogaloo Club', location: 'Zagreb', date: '2026-03-28', artists: 'Crvena Jabuka', genre: 'Pop', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },


    // Split 2026
    { title: 'Jakov Jozinović @ Dvorana Gripe - Valentinovo', location: 'Split', date: '2026-02-14', artists: 'Jakov Jozinović', genre: 'Pop', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    { title: 'Ultra Europe Festival 2026 @ Park Mladeži', location: 'Split', date: '2026-07-10', artists: 'Martin Garrix, David Guetta, Amelie Lens, Calvin Harris', genre: 'Electronic', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    { title: 'Lollipop "We Found Love" @ Porat Club, Split', location: 'Split', date: '2026-02-13', artists: 'DJ', genre: 'Pop', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    { title: 'Marko Perković Thompson @ Dvorana Gripe', location: 'Split', date: '2026-01-16', artists: 'Marko Perković Thompson', genre: 'Pop, Rock', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    { title: 'Marko Perković Thompson @ Dvorana Gripe', location: 'Split', date: '2026-01-17', artists: 'Marko Perković Thompson', genre: 'Pop, Rock', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },   
    { title: 'Dražen Zečić - koncert za valentinovo @ Porat Club', location: 'Split', date: '2026-02-14', artists: 'Dražen Zečić', genre: 'Pop', ticketUrl: 'https://adriaticket.com', source: 'adriaticket.com' },
    { title: 'Oliver Dragojević Tribute @ Vela Luka', location: 'Korčula', date: '2026-07-31', artists: 'Klapa Cambi, Klapa Intrade', genre: 'Pop', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    { title: 'EX-YU Rock party by Treći svijet band @ Porat Club', location: 'Split', date: '2026-02-07', artists: 'Treći svijet band', genre: 'Pop, Rock', ticketUrl: 'https://adriaticket.com', source: 'adriaticket.com' },
    { title: 'Brain Holidays / Rođendan Boba Marleya @ Dom mladih', location: 'Split', date: '2026-02-07', artists: 'Brain Holidays', genre: 'Reggae', ticketUrl: 'https://adriaticket.com', source: 'adriaticket.com' },
    { title: 'DJ Jock All Night Long @ Porat Club', location: 'Split', date: '2026-02-07', artists: 'DJ Jock', genre: 'Pop, Electronic', ticketUrl: 'https://adriaticket.com', source: 'adriaticket.com' },
    { title: 'Boban Rajović @ Dvorana Gripe', location: 'Split', date: '2026-02-28', artists: 'Boban Rajović', genre: 'Turbofolk', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Lord of the rings, the Hobbit and the Rings of power @ HNK Split', location: 'Split', date: '2026-05-04', artists: 'LOTR', genre: 'Classical', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Čarobna Glazba Harryja Pottera @ HNK Split', location: 'Split', date: '2026-05-05', artists: 'Harry Potter', genre: 'Classical', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'The Music Of Hans Zimmer & Others @ HNK Split', location: 'Split', date: '2026-05-05', artists: 'Hans Zimmer', genre: 'Classical', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Dan žena u Splitu s Hari Mata Hari @ Dvorana Gripe', location: 'Split', date: '2026-03-08', artists: 'Hari Mata Hari', genre: 'Pop, Rock', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Corona X Rimski @ Limit Club', location: 'Split', date: '2026-02-07', artists: 'Corona, Rimski', genre: 'Turbofolk', ticketUrl: 'https://adriaticket.com', source: 'adriaticket.com' },
    { title: 'Desingerica @ Limit Club', location: 'Split', date: '2026-02-28', artists: 'Desingerica', genre: 'Turbofolk', ticketUrl: 'https://adriaticket.com', source: 'adriaticket.com' },
    { title: 'Sergej Ćetković @ Velika dvorana Gripe, Split', location: 'Split', date: '2026-03-14', artists: 'Sergej Ćetković', genre: 'Pop', ticketUrl: 'https://adriaticket.com', source: 'adriaticket.com' },
    { title: 'Uršula & Black Coffee @ Dvorana Lora', location: 'Split', date: '2026-02-19', artists: 'Uršula & Black Coffee', genre: 'Jazz, Soul, Funk', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    { title: 'Teo Grčić @ Dvorana Lora', location: 'Split', date: '2026-02-24', artists: 'Teo Grčić', genre: 'Pop', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    { title: 'U2 - Tribute @ BackBar Plan B', location: 'Split', date: '2026-03-06', artists: 'U2-Tribute', genre: 'Pop, Rock', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    { title: 'Dreamers Bijelo dugme - Tribute @ BackBar Plan B', location: 'Split', date: '2026-03-14', artists: 'Dreamers-Tribute', genre: 'Pop, Rock', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    { title: 'Dreamers EX-YU - Tribute @ BackBar Plan B', location: 'Split', date: '2026-02-28', artists: 'Dreamers-Tribute', genre: 'Pop, Rock', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    { title: 'Ringišpil - u spomen na Panonskog Mornara @ BackBar Plan B', location: 'Split', date: '2026-02-20', artists: 'Ringišpil', genre: 'Pop, Rock', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    { title: 'Dan žena - Ladies Night MAGIC BOYS @ Level Restaurant, Split', location: 'Split', date: '2026-03-05', artists: 'Magic Boys', genre: 'Pop, Rock', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    { title: 'Fiesta Latina Cabaret Dinner Show @ Level restaurant Split', location: 'Split', date: '2026-05-23', artists: 'Fiesta Latina', genre: 'Latino', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    { title: 'Cabaret Divas Dinner Show @ Level restaurant Split', location: 'Split', date: '2026-04-25', artists: 'Cabaret Divas', genre: 'Latino', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    { title: 'Zabranjeno pušenje kao Neuštekani! @ Dvorana Lora', location: 'Split', date: '2026-03-21', artists: 'Zabranjeno pušenje', genre: 'Pop, Rock', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },


    // Rijeka 2026
    { title: 'K-Pop Forever @ Centar Zamet', location: 'Rijeka', date: '2026-03-22', artists: 'K-Pop Forever', genre: 'Pop', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Paraf @ Pogon Kulture', location: 'Rijeka', date: '2026-04-17', artists: 'Paraf', genre: 'Indie', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Lollipop Rijeka Carnival @ Exportdrvo', location: 'Rijeka', date: '2026-02-07', artists: 'DJ', genre: 'Pop, Rock', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    { title: 'Marko Perković Thompson @ Dvorana mladosti', location: 'Rijeka', date: '2026-02-06', artists: 'Marko Perković Thompson', genre: 'Pop, Rock', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    { title: 'Marko Perković Thompson @ Dvorana mladosti', location: 'Rijeka', date: '2026-02-07', artists: 'Marko Perković Thompson', genre: 'Pop, Rock', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    { title: 'Jurica Pađen & Aerodrom @ Pogon Kulture', location: 'Rijeka', date: '2026-03-21', artists: 'Jurica Pađen & Aerodrom', genre: 'Pop, Rock', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    { title: 'Silente @ Exportdrvo', location: 'Rijeka', date: '2026-02-13', artists: 'Silente', genre: 'Pop, Rock', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    { title: 'Josipa Lisac @ Hrvatski kulturni dom na Sušaku', location: 'Rijeka', date: '2026-03-07', artists: 'Josipa Lisac', genre: 'Pop', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    { title: 'Brkovi @ Exportdrvo', location: 'Rijeka', date: '2026-03-21', artists: 'Brkovi', genre: 'Pop, Rock', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },


    // Dubrovnik 2026
    { title: 'Dubrovnik Summer Festival', location: 'Dubrovnik', date: '2026-07-10', artists: 'Dubrovnik Symphony Orchestra', genre: 'Classical', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    { title: 'Iva i Gloria Kerekesh Teatar @ Valamar Lacroma hotel Dubrovnik', location: 'Dubrovnik', date: '2026-04-07', artists: 'Iva i Gloria Kerekesh Teatar', genre: 'Classical', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    { title: 'Iva i Gloria Kerekesh Teatar @ Valamar Lacroma hotel Dubrovnik', location: 'Dubrovnik', date: '2026-04-08', artists: 'Iva i Gloria Kerekesh Teatar', genre: 'Classical', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
  

    // Zadar 2026
    { title: 'K-Pop Forever @ Športski centar Višnjik - Velika dvorana Krešimira Ćosića', location: 'Zadar', date: '2026-03-20', artists: 'K-Pop Forever', genre: 'Pop', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Sunset Sessions Pozdrav Suncu', location: 'Zadar', date: '2026-08-22', artists: 'Local DJs', genre: 'Electronic', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    { title: 'Željko Samardžić @ Velika dvorana Krešimira Ćosića', location: 'Zadar', date: '2026-02-14', artists: 'Željko Samardžić', genre: 'Pop', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Parni Valjak @ Arsenal Zadar', location: 'Zadar', date: '2026-02-14', artists: 'Parni Valjak', genre: 'Pop, Rock', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Željko Bebek @ Arsenal Zadar', location: 'Zadar', date: '2026-02-28', artists: 'Željko Bebek', genre: 'Pop, Rock', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Jelena Rozga @ Arsenal Zadar', location: 'Zadar', date: '2026-03-08', artists: 'Jelena Rozga', genre: 'Pop', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Neda Ukraden @ Berekin', location: 'Zadar', date: '2026-02-28', artists: 'Neda Ukraden', genre: 'Pop', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: '100 violina @ Velika dvorana Krešimira Ćosića', location: 'Zadar', date: '2026-04-11', artists: '100 violina', genre: 'Pop', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Indira Forza ex Colonia @ Arsenal Zadar', location: 'Zadar', date: '2026-03-21', artists: 'Indira Forza ex Colonia', genre: 'Pop', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Zdenka Kovačiček @ HNK Zadar', location: 'Zadar', date: '2026-02-14', artists: 'Zdenka Kovačiček', genre: 'Pop', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },


    // Osijek 2026
    { title: 'Parni Valjak @ Dvorana Gradski Vrt', location: 'Osijek', date: '2026-02-28', artists: 'Parni Valjak', genre: 'Pop, Rock', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Tanja Savić @ Dvorana Zrinjevac', location: 'Osijek', date: '2026-02-12', artists: 'Tanja Savić', genre: 'Turbofolk', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'The Music Of Hans Zimmer & Others @ Koncertna dvorana Franjo Krežma', location: 'Osijek', date: '2026-05-02', artists: 'Hans Zimmer', genre: 'Classical', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Marko Škugor: U Dvoje & Others @ Koncertna dvorana Franjo Krežma', location: 'Osijek', date: '2026-03-05', artists: 'Marko Škugor', genre: 'Pop', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Lord of the rings, the Hobbit and the Rings of power @ Koncertna dvorana Franjo Krežma', location: 'Osijek', date: '2026-05-02', artists: 'LOTR', genre: 'Classical', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Jurica Pađen & Aerodrom @ Dvorana Hangar', location: 'Osijek', date: '2026-04-17', artists: 'Jurica Pađen & Aerodrom', genre: 'Pop, Rock', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },


    // Pula 2026
    { title: 'STING 3.0 @ Arena Pula', location: 'Pula', date: '2026-08-01', artists: 'Sting', genre: 'Rock, Jazz, Reggae, Classical', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    { title: 'Hiljson + Grše + Rasta @ Cave Romane, Pula', location: 'Pula', date: '2026-06-24', artists: 'Hiljson, Grše, Rasta', genre: 'Turbofolk, Pop', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    { title: 'Adi Šoše & AL music band - rocks and stars  @ Cave Romane, Pula', location: 'Pula', date: '2026-06-26', artists: 'Adi Šoše', genre: 'Pop', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    { title: 'Dubioza Kolektiv - rocks and stars  @ Cave Romane, Pula', location: 'Pula', date: '2026-06-27', artists: 'Dubioza Kolektiv', genre: 'Pop', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    { title: 'Jovanotti live @ Arena Pula', location: 'Pula', date: '2026-07-03', artists: 'Jovanotti', genre: 'Rock', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    { title: 'Haris Džinović @ Arena Pula', location: 'Pula', date: '2026-08-14', artists: 'Haris Džinović', genre: 'Folk', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },


    // Šibenik 2026
    { title: 'Uršula & Black Coffee @ HNK Šibenik', location: 'Šibenik', date: '2026-02-28', artists: 'Uršula & Black Coffee', genre: 'Jazz, Soul, Funk', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    { title: 'Sea sound festival @ Martinska Šibenik', location: 'Šibenik', date: '2026-07-16', artists: 'Sea sound festival', genre: 'Pop, Funk', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    { title: 'Pankrti @ Azimut Šibenik', location: 'Šibenik', date: '2026-05-15', artists: 'Pankrti', genre: 'Rock', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    { title: 'Ship festival @ St. Michaels Fortress/Azimut/House of Art Arsen/Tunel, Šibenik', location: 'Šibenik', date: '2026-05-15', artists: 'Ship festival', genre: 'Rock', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    { title: 'Elemental @ Azimut Šibenik', location: 'Šibenik', date: '2026-02-06', artists: 'Elemental', genre: 'Hip-hop', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Let 3 @ Azimut Šibenik', location: 'Šibenik', date: '2026-02-28', artists: 'Let 3', genre: 'Rock', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Koikoi @ Azimut Šibenik', location: 'Šibenik', date: '2026-03-21', artists: 'Koikoi', genre: 'Rock', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Djeca! @ Azimut Šibenik', location: 'Šibenik', date: '2026-02-21', artists: 'Djeca!', genre: 'Indie', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Dimitrije Dimitrijević @ Azimut Šibenik', location: 'Šibenik', date: '2026-02-14', artists: 'Dimitrije Dimitrijević', genre: 'Indie', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Chet Faker @ Tvrđava Sv. Mihovila Šibenik', location: 'Šibenik', date: '2026-07-28', artists: 'Chet Faker', genre: 'Indie', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Robert Plant @ Tvrđava Sv. Mihovila Šibenik', location: 'Šibenik', date: '2026-06-20', artists: 'Robert Plant', genre: 'Rock', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Skunk Anansie @ Tvrđava Sv. Mihovila Šibenik', location: 'Šibenik', date: '2026-07-19', artists: 'Skunk Anansie', genre: 'Rock', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Robert Plant @ Tvrđava kulture Šibenik', location: 'Šibenik', date: '2026-06-21', artists: 'Robert Plant', genre: 'Rock', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },


    // Varaždin 2026
    { title: 'Tomislav Bralić & Klapa Intrade @ Arena Varaždin - Gradska sportska dvorana', location: 'Varaždin', date: '2026-03-07', artists: 'Tomislav Bralić & Klapa Intrade', genre: 'Klapa', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    { title: 'Adi Šoše @ Arena Varaždin - Gradska sportska dvorana', location: 'Varaždin', date: '2026-02-14', artists: 'Adi Šoše', genre: 'Pop', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },


    // Solin 2026
    { title: 'Solin Ljetna Pozornica', location: 'Solin', date: '2026-08-08', artists: 'Various Artists', genre: 'Pop', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    

    // Čakovec 2026
    { title: 'Mitar Mirić @ Meta bar, Čakovec', location: 'Čakovec', date: '2026-02-20', artists: 'Mitar Mirić', genre: 'Folk', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    

    // Slavonski Brod 2026
    { title: 'Adi Šoše I Željko Samardžić @ Športska dvorana Vijuš', location: 'Slavonski Brod', date: '2026-03-07', artists: 'Adi Šoše I Željko Samardžić', genre: 'Pop, Folk', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' },
    

    // Poreč 2026
    { title: 'Lanterna Summer Nights', location: 'Poreč', date: '2026-07-07', artists: 'Local DJs', genre: 'Electronic', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    

    // Makarska 2026
    { title: 'Makarska Summer Festival', location: 'Makarska', date: '2026-07-19', artists: 'Massimo Tribute, Neno Belan', genre: 'Pop', ticketUrl: 'https://entrio.hr', source: 'entrio.hr' },
    

    // Karlovac 2026
    { title: 'Adi Šoše @ Školska sportska dvorana Mladost - Rakovac', location: 'Karlovac', date: '2026-02-13', artists: 'Adi Šoše', genre: 'Pop, Folk', ticketUrl: 'https://eventim.hr', source: 'eventim.hr' }
   
  ];

  // Only seed if no events exist - this preserves wishlist data
  if (existing > 0) {
    console.log(`ℹ️ Events already exist (${existing} events), skipping seed to preserve favorites`);
    return;
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO events (title, location, date, artists, genre, ticketUrl, source)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const event of events) {
      stmt.run(event.title, event.location, event.date, event.artists, event.genre, event.ticketUrl, event.source);
    }

    console.log(`✅ Seeded ${events.length} events`);
  } catch (err: any) {
    console.error('❌ Error inserting events:', err.message);
  }
}

export function getEventsByLocation(location: string): EventRow[] {
  return db.prepare('SELECT * FROM events WHERE location LIKE ? ORDER BY date ASC').all(`%${location}%`) as EventRow[];
}

export function getEventsByGenre(genre: string): EventRow[] {
  return db.prepare('SELECT * FROM events WHERE genre LIKE ? ORDER BY date ASC').all(`%${genre}%`) as EventRow[];
}

export function getEventsBySource(source: string): EventRow[] {
  return db.prepare('SELECT * FROM events WHERE source LIKE ? ORDER BY date ASC').all(`%${source}%`) as EventRow[];
}

export function getEventsByLocationAndSource(location: string, sources: string[]): EventRow[] {
  if (sources.length === 0) {
    return getEventsByLocation(location);
  }
  
  const placeholders = sources.map(() => 'source LIKE ?').join(' OR ');
  const sourceParams = sources.map(s => `%${s}%`);
  
  return db.prepare(`
    SELECT * FROM events 
    WHERE location LIKE ? AND (${placeholders})
    ORDER BY date ASC
  `).all(`%${location}%`, ...sourceParams) as EventRow[];
}

export function getAllUpcomingEvents(): EventRow[] {
  return db.prepare('SELECT * FROM events ORDER BY date ASC').all() as EventRow[];
}

export function getEventById(id: number): EventRow | undefined {
  return db.prepare('SELECT * FROM events WHERE id = ?').get(id) as EventRow | undefined;
}
