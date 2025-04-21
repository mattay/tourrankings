const races = [
  [
    "2025",
    "2025/01/21",
    "2025/01/26",
    "2.UWT",
    "tour-down-under:2025",
    "Santos Tour Down Under",
    "tour-down-under",
    "https://www.procyclingstats.com/race/tour-down-under/2025",
  ],
  [
    "2025",
    "2025/02/17",
    "2025/02/23",
    "2.UWT",
    "uae-tour:2025",
    "UAE Tour",
    "uae-tour",
    "https://www.procyclingstats.com/race/uae-tour/2025",
  ],
  [
    "2025",
    "2025/03/09",
    "2025/03/16",
    "2.UWT",
    "paris-nice:2025",
    "Paris-Nice",
    "paris-nice",
    "https://www.procyclingstats.com/race/paris-nice/2025",
  ],
  [
    "2025",
    "2025/03/10",
    "2025/03/16",
    "2.UWT",
    "tirreno-adriatico:2025",
    "Tirreno-Adriatico",
    "tirreno-adriatico",
    "https://www.procyclingstats.com/race/tirreno-adriatico/2025",
  ],
  [
    "2025",
    "2025/03/24",
    "2025/03/30",
    "2.UWT",
    "volta-a-catalunya:2025",
    "Volta Ciclista a Catalunya",
    "volta-a-catalunya",
    "https://www.procyclingstats.com/race/volta-a-catalunya/2025",
  ],
  [
    "2025",
    "2025/04/07",
    "2025/04/12",
    "2.UWT",
    "itzulia-basque-country:2025",
    "Itzulia Basque Country",
    "itzulia-basque-country",
    "https://www.procyclingstats.com/race/itzulia-basque-country/2025",
  ],
  [
    "2025",
    "2025/04/29",
    "2025/05/04",
    "2.UWT",
    "tour-de-romandie:2025",
    "Tour de Romandie",
    "tour-de-romandie",
    "https://www.procyclingstats.com/race/tour-de-romandie/2025",
  ],
  [
    "2025",
    "2025/05/09",
    "2025/06/01",
    "2.UWT",
    "giro-d-italia:2025",
    "Giro d'Italia",
    "giro-d-italia",
    "https://www.procyclingstats.com/race/giro-d-italia/2025",
  ],
  [
    "2025",
    "2025/06/08",
    "2025/06/15",
    "2.UWT",
    "dauphine:2025",
    "Critérium du Dauphiné",
    "dauphine",
    "https://www.procyclingstats.com/race/dauphine/2025",
  ],
  [
    "2025",
    "2025/06/15",
    "2025/06/22",
    "2.UWT",
    "tour-de-suisse:2025",
    "Tour de Suisse",
    "tour-de-suisse",
    "https://www.procyclingstats.com/race/tour-de-suisse/2025",
  ],
  [
    "2025",
    "2025/07/05",
    "2025/07/27",
    "2.UWT",
    "tour-de-france:2025",
    "Tour de France",
    "tour-de-france",
    "https://www.procyclingstats.com/race/tour-de-france/2025",
  ],
  [
    "2025",
    "2025/08/04",
    "2025/08/10",
    "2.UWT",
    "tour-de-pologne:2025",
    "Tour de Pologne",
    "tour-de-pologne",
    "https://www.procyclingstats.com/race/tour-de-pologne/2025",
  ],
  [
    "2025",
    "2025/08/20",
    "2025/08/24",
    "2.UWT",
    "renewi-tour:2025",
    "Renewi Tour",
    "renewi-tour",
    "https://www.procyclingstats.com/race/renewi-tour/2025",
  ],
  [
    "2025",
    "2025/08/23",
    "2025/09/14",
    "2.UWT",
    "vuelta-a-espana:2025",
    "La Vuelta Ciclista a España",
    "vuelta-a-espana",
    "https://www.procyclingstats.com/race/vuelta-a-espana/2025",
  ],
  [
    "2025",
    "2025/10/14",
    "2025/10/19",
    "2.UWT",
    "tour-of-guangxi:2025",
    "Gree-Tour of Guangxi",
    "tour-of-guangxi",
    "https://www.procyclingstats.com/race/tour-of-guangxi/2025",
  ],
].map((race) => {
  const [
    year,
    startDate,
    endDate,
    raceClass,
    raceId,
    raceName,
    raceUrlId,
    raceUrl,
  ] = race;
  return {
    year,
    startDate,
    endDate,
    raceClass,
    raceId,
    raceName,
    raceUrlId,
    raceUrl,
  };
});

function racesInSeason(season) {
  return races.filter((race) => race.year == season);
}

/**
 * Sorts an array of objects by their startDate property.
 *
 * @param {Array<Object>} arr - The array to sort.
 * @param {'asc'|'desc'} [direction='asc'] - Sort direction: 'asc' for ascending, 'desc' for descending.
 * @returns {Array<Object>} The sorted array.
 */
function sortByStartDate(arr, direction = "asc") {
  return arr.slice().sort((a, b) => {
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);
    if (direction === "desc") {
      return dateB - dateA;
    }
    return dateA - dateB;
  });
}

export default function seasonRaces() {
  const today = new Date();
  const season = today.getFullYear();
  const grouped = racesInSeason(season).reduce(
    (grouped, race) => {
      const raceStart = new Date(race.startDate);
      const raceEnd = new Date(race.startDate);

      if (today >= raceStart && today <= raceEnd) {
        grouped.current = sortByStartDate([...grouped.current, race]);
      } else if (raceStart > today) {
        grouped.future = sortByStartDate([...grouped.future, race]);
      } else if (raceEnd < today) {
        grouped.previous = sortByStartDate([...grouped.previous, race], "desc");
      } else {
        console.log(today, raceStart, raceEnd);
      }

      return grouped;
    },
    {
      current: [],
      upcomming: [],
      previous: [],
      future: [],
    },
  );

  // Extract the next upcoming race (the soonest in the future)
  if (grouped.future.length > 0) {
    grouped.upcoming = [grouped.future[0]];
    grouped.future = grouped.future.slice(1); // Remove the upcoming race from future
  }

  return grouped;
}
