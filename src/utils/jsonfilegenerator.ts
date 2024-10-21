import fs from 'fs';
// Function to generate a random number within a range
const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Function to generate the projects
const generateProjects = (count: number) => {
  return Array.from({ length: count }, (_, i) => {
    return {
      name: `Project ${String.fromCharCode(67 + i)}`, // Start from Project C
      budget: getRandomNumber(5000, 20000),
      advance: getRandomNumber(1000, 10000),
      clientName: `clientId${i + 1}`,
      clientPhone: `98765400${i % 10}`, // Ensuring 10 digits
      clientEmail: `client${i + 1}@example.com`,
      clientAddress: `${getRandomNumber(1, 999)} Street, City`,
      clientDetails: `Details for client ${i + 1}`,
      startDate: '2024-03-01',
      endDate: '2024-12-31',
      demoLink: `http://example.com/demo${i + 1}`,
      typeOfWeb: 'Blog',
      description: `Blog project description for Project ${i + 1}`,
      status: i % 2 === 0, // Alternate status
    };
  });
};

// Generate 200 projects
const projects = generateProjects(200);

// Save to a JSON file
fs.writeFile('projects.json', JSON.stringify(projects, null, 4), (err) => {
  if (err) throw err;
  console.log('projects.json has been saved!');
});
