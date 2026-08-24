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
  "tailoring_machine_service.html",
  "home-appliances-service/index.html",
  "home_appliances_service.html",
  "booking_service.html",
  "booking/index.html"
];

const targetSewing = `href="/tailoring-machine-service">Tailoring Machine Service</a></li>`;
const replacementSewing = `href="/tailoring-machine-service">Tailoring Machine Service</a></li>
                        <li><a class="font-inter text-xs uppercase tracking-wider text-slate-500 hover:text-blue-600 transition-opacity" href="/home-appliances-service">Home Appliances Service</a></li>`;

const targetLocations = `href="/locations"`;
const targetBlog = `href="/blog"`;

filesToUpdate.forEach(fileRel => {
  const filePath = path.join(FRONTEND_DIR, fileRel);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, "utf8");
    let changed = false;

    // 1. Add home appliances link if missing
    if (content.includes(targetSewing) && !content.includes('href="/home-appliances-service"')) {
      content = content.replace(targetSewing, replacementSewing);
      changed = true;
    }

    // 2. Add locations/blog links under tailoring-machine-service (or under home-appliances-service if it exists) if missing
    const targetAnchor = content.includes('href="/home-appliances-service"')
      ? `href="/home-appliances-service">Home Appliances Service</a></li>`
      : targetSewing;

    if (content.includes(targetAnchor) && !content.includes(targetLocations)) {
      content = content.replace(targetAnchor, `${targetAnchor}
                        <li><a class="font-inter text-xs uppercase tracking-wider text-slate-500 hover:text-blue-600 transition-opacity" href="/locations">Locations</a></li>`);
      changed = true;
    }

    const updatedAnchor = content.includes('href="/locations"')
      ? `href="/locations">Locations</a></li>`
      : targetAnchor;

    if (content.includes(updatedAnchor) && !content.includes(targetBlog)) {
      content = content.replace(updatedAnchor, `${updatedAnchor}
                        <li><a class="font-inter text-xs uppercase tracking-wider text-slate-500 hover:text-blue-600 transition-opacity" href="/blog">Blog</a></li>`);
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`Updated footer for ${fileRel}`);
    } else {
      console.log(`Footer already fully updated or target not found for ${fileRel}`);
    }
  } else {
    console.warn(`File not found: ${filePath}`);
  }
});

console.log("Template footer updates complete.");
