const fs = require("fs");
const path = require("path");

const FRONTEND_DIR = path.join(__dirname, "frontend");

const filesToUpdate = [
  "ac-service/index.html",
  "ac_service.html",
  "fridge-service/index.html",
  "fridge_service.html",
  "washing-machine-service/index.html",
  "washing_machine_service.html",
  "tailoring-machine-service/index.html",
  "tailoring_machine_service.html"
];

const targetSection = `                        <li><a class="font-inter text-xs uppercase tracking-wider text-slate-500 hover:text-blue-600 transition-opacity" href="/tailoring-machine-service">Tailoring Machine Service</a></li>`;

const replacementSection = `                        <li><a class="font-inter text-xs uppercase tracking-wider text-slate-500 hover:text-blue-600 transition-opacity" href="/tailoring-machine-service">Tailoring Machine Service</a></li>
                        <li><a class="font-inter text-xs uppercase tracking-wider text-slate-500 hover:text-blue-600 transition-opacity" href="/locations">Locations</a></li>
                        <li><a class="font-inter text-xs uppercase tracking-wider text-slate-500 hover:text-blue-600 transition-opacity" href="/blog">Blog</a></li>`;

filesToUpdate.forEach(fileRel => {
  const filePath = path.join(FRONTEND_DIR, fileRel);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, "utf8");
    if (content.includes(targetSection) && !content.includes('href="/locations"')) {
      content = content.replace(targetSection, replacementSection);
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`Updated footer for ${fileRel}`);
    } else {
      console.log(`Footer already updated or target not found for ${fileRel}`);
    }
  } else {
    console.warn(`File not found: ${filePath}`);
  }
});

console.log("Template footer updates complete.");
