 function convertTo24HourFormat(time: string): string {
  const [timePart, modifier] = time.split(/(AM|PM)/i); // Split into time and AM/PM
  let [hours, minutes] = timePart.trim().split(":").map(Number);

  if (modifier.toUpperCase() === "PM" && hours !== 12) {
    hours += 12;
  } else if (modifier.toUpperCase() === "AM" && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

 function convertTo12HourFormat(time: string): string {
  let [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12;

  return `${hours}:${minutes.toString().padStart(2, "0")} ${period}`;
}
