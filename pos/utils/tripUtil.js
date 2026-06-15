function searchBus(buses, searchQuery) {
  return buses
    .filter((bus) => bus.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export const TripUtil = { searchBus };
