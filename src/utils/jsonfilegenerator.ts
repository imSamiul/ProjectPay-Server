import fs from 'fs';

// Generate projects with fixed 10-digit client phone numbers
const projects = Array.from({ length: 200 }, (_, i) => {
  // Ensure the phone number is always 10 digits long
  const phoneNumber = (9876540000 + i).toString().slice(-10); // This ensures only the last 10 digits are used
  return {
    name: `Project ${String.fromCharCode(68 + i)}`, // Start from Project D
    budget: 3000 + i * 500,
    advance: 1000 + i * 250,
    due: 2000 + i * 250,
    client: `clientId${i + 1}`,
    clientPhone: phoneNumber, // Generates fixed 10-digit phone numbers
    clientEmail: `client${i + 1}@example.com`,
    startDate: '2024-04-01',
    endDate: '2024-12-01',
    status: i % 2 === 0, // Alternate status
    description: `Project description ${i + 1}`,
  };
});

// Save to a JSON file
fs.writeFile('projects.json', JSON.stringify(projects, null, 4), (err) => {
  if (err) throw err;
  console.log('projects.json has been saved!');
});
