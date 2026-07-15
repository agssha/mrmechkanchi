const fs = require("fs");
const path = require("path");

// ==========================================
// CONFIGURATION & DATABASES
// ==========================================

const locations = [
  {
    name: "Kanchipuram",
    slug: "kanchipuram",
    landmark: "Kailasanathar Temple and Kamakshi Amman Temple",
    localArea: "the heart of the silk city, serving areas near Varadharaja Perumal Temple and the municipal office",
    temple: "Kamakshi Amman Temple",
    road: "Kancheepuram-Chengalpattu Road",
    neighborhoods: "Pillaiyarpalayam, Nellukaran Street, Sengaluneer Odai Street, and Moongil Mandapam",
    desc: "Kanchipuram is world-renowned for its handloom silk sarees and historic temples. With dense residential neighborhoods and bustling market areas, our service centers operate round-the-clock here."
  },
  {
    name: "Walajabad",
    slug: "walajabad",
    landmark: "Walajabad Old Railway Station",
    localArea: "the main commercial market and residential zones near the Union Office",
    temple: "Sri Agatheeswarar Temple",
    road: "Walajabad-Kanchipuram High Road",
    neighborhoods: "Walajabad Bazaar, Tenneri, and nearby weaving units",
    desc: "Walajabad is a major hub connecting Kanchipuram with Chengalpattu and Sriperumbudur. It has active residential communities and small industrial/commercial areas needing swift doorstep support."
  },
  {
    name: "Orikkai",
    slug: "orikkai",
    landmark: "Orikkai Mahaperiyava Mani Mandapam",
    localArea: "the serene residential layouts near the Palar River bank",
    temple: "Mani Mandapam",
    road: "Orikkai Bypass Road",
    neighborhoods: "Mahaveer Nagar, Orikkai residential colony, and areas near Kanchi Mutt school",
    desc: "Orikkai has grown rapidly as a peaceful suburban residential extension of Kanchipuram, characterized by modern villas and apartments where cooling and washing machines are highly utilized."
  },
  {
    name: "Enathur",
    slug: "enathur",
    landmark: "SCSVMV University (Sankara University)",
    localArea: "the student residential areas and commercial shops surrounding the campus",
    temple: "Enathur Mariamman Temple",
    road: "Kanchipuram-Arakkonam Road",
    neighborhoods: "Enathur Village, University quarters, and nearby agricultural margins",
    desc: "Enathur is a educational and residential hub. The constant influx of students, faculty, and support staff makes swift AC repairs and refrigerator services essential here."
  },
  {
    name: "Kuruvimalai",
    slug: "kuruvimalai",
    landmark: "Kuruvimalai Murugan Temple",
    localArea: "the rural outskirts and agrarian households along the hillock path",
    temple: "Sri Murugan Temple",
    road: "Kuruvimalai Junction Road",
    neighborhoods: "Kuruvimalai village, hill foot residential blocks, and farming clusters",
    desc: "Kuruvimalai is known for its beautiful Murugan temple on the hill. It has active households requiring dependable doorstep services for tailoring machines and household fridges."
  },
  {
    name: "Ayyampettai",
    slug: "ayyampettai",
    landmark: "Ayyampettai Handloom Weaving Hub",
    localArea: "the dense weaving streets and local markets close to the railway line",
    temple: "Subramaniya Swamy Temple",
    road: "Kanchipuram-Walajabad Road",
    neighborhoods: "Ayyampettai Bazaar, weavers colony, and nearby agricultural lands",
    desc: "Ayyampettai is a major cluster for traditional handloom silk weaving. Sewing and tailoring machine servicing, along with home appliance repairs, are heavily in demand here."
  },
  {
    name: "Pillaiyarpalayam",
    slug: "pillaiyarpalayam",
    landmark: "Pillaiyarpalayam Pillaiyar Temple",
    localArea: "the busy weaving streets and cooperative clusters near the weaver community halls",
    temple: "Krishnan Temple",
    road: "Pillaiyarpalayam Road",
    neighborhoods: "Pillaiyarpalayam weavers street, local silk shops, and surrounding neighborhoods",
    desc: "Pillaiyarpalayam is a historic silk-weaving neighborhood within Kanchipuram municipality. Tailoring machine calibration and domestic appliance maintenance are key needs here."
  },
  {
    name: "Konerikuppam",
    slug: "konerikuppam",
    landmark: "Konerikuppam Lake and Bypass Road",
    localArea: "the residential colonies expanding along the Chennai-Bangalore national highway bypass",
    temple: "Mariamman Temple",
    road: "Chennai-Bangalore Highway Bypass",
    neighborhoods: "Konerikuppam village, bypass residential apartments, and layout sectors",
    desc: "Konerikuppam is a rapidly expanding suburb near the Kanchipuram bypass. Dust and power fluctuations here require expert AC gas refilling and refrigerator board diagnostics."
  },
  {
    name: "Karaipettai",
    slug: "karaipettai",
    landmark: "Karaipettai Highway Checkpost",
    localArea: "the commercial shops and residential pockets bordering the highway",
    temple: "Karaipettai Amman Temple",
    road: "National Highway 48",
    neighborhoods: "Karaipettai bazaar, checkpost layout, and local logistics yards",
    desc: "Karaipettai is located on the busy Chennai-Bangalore highway corridor. It sees substantial commercial and freight activity, demanding quick response appliance repairs."
  },
  {
    name: "Sevilimedu",
    slug: "sevilimedu",
    landmark: "Sevilimedu Murugan Temple",
    localArea: "the residential streets near the Palar River connection canal",
    temple: "Sevilimedu Kailasanathar Temple",
    road: "Kanchipuram-Vandavasi Road",
    neighborhoods: "Sevilimedu colony, Anna Nagar, and nearby agricultural layouts",
    desc: "Sevilimedu is a prominent residential area with high density. The local hard water and heat necessitate regular washing machine descaling and AC servicing."
  },
  {
    name: "Kammavarpalayam",
    slug: "kammavarpalayam",
    landmark: "Kammavarpalayam Bus Stop",
    localArea: "the peaceful green lanes and farming residential zones",
    temple: "Ganesha Temple",
    road: "Kammavarpalayam Local Road",
    neighborhoods: "Kammavarpalayam central village, surrounding fields, and housing streets",
    desc: "Kammavarpalayam is a serene agrarian residential locality. Our mobile technician vans travel here daily to provide same-day repairs to local families."
  },
  {
    name: "Kavanthandalam",
    slug: "kavanthandalam",
    landmark: "Kavanthandalam Chidambareswarar Temple",
    localArea: "the traditional households and farm margins of the village",
    temple: "Chidambareswarar Temple",
    road: "Kavanthandalam-Walajabad Road",
    neighborhoods: "Kavanthandalam village, local farming streets, and temple streets",
    desc: "Kavanthandalam is known for its historic Chidambareswarar temple. Households here rely on MrKanchi for swift, affordable doorstep refrigerator and tailoring machine fixes."
  },
  {
    name: "Thenambakkam",
    slug: "thenambakkam",
    landmark: "Thenambakkam Sivan Temple (Siva Asthanam)",
    localArea: "the historic mutt branch and peaceful residential streets near the river bed",
    temple: "Siva Asthanam Temple",
    road: "Thenambakkam Road",
    neighborhoods: "Thenambakkam village, Mutt layout, and agricultural lanes",
    desc: "Thenambakkam holds spiritual importance as the place where the Kanchi Mahaperiyava spent significant time. It is a quiet residential area with highly valued home appliance needs."
  },
  {
    name: "Baluchettichatram",
    slug: "baluchettichatram",
    landmark: "Baluchettichatram Police Station",
    localArea: "the highway junction market and surrounding rural residential blocks",
    temple: "Sri Venugopalaswamy Temple",
    road: "Chennai-Bangalore National Highway",
    neighborhoods: "Baluchettichatram Bazaar, highway junction layouts, and nearby rural pockets",
    desc: "Baluchettichatram is a key transit and commercial point on the highway. We offer rapid response times for shops, institutions, and homes needing appliance servicing here."
  },
  {
    name: "Uthiramerur",
    slug: "uthiramerur",
    landmark: "Uthiramerur Vaikunda Perumal Temple (Ancient Democracy Inscriptions)",
    localArea: "the historic town center, municipal offices, and layouts surrounding the lake",
    temple: "Vaikunda Perumal Temple",
    road: "Uthiramerur-Kanchipuram Road",
    neighborhoods: "Uthiramerur Town, Lake view colony, Bazaar street, and surrounding farm hamlets",
    desc: "Uthiramerur is famous for its 10th-century Chola inscriptions showing early democratic systems. It is a self-sufficient town requiring dedicated domestic appliance repair services."
  },
  {
    name: "Kaliyanoor",
    slug: "kaliyanoor",
    landmark: "Kaliyanoor Junction",
    localArea: "the residential developments expanding along the connecting highways",
    temple: "Kaliyanoor Amman Temple",
    road: "Kanchipuram-Chennai Highway",
    neighborhoods: "Kaliyanoor colony, bypass extension layouts, and adjacent village sectors",
    desc: "Kaliyanoor is an emerging suburban junction. The growing number of new households has created high demand for certified AC installation and fridge repairs."
  },
  {
    name: "Nathapettai",
    slug: "nathapettai",
    landmark: "Nathapettai Lake and Industrial area",
    localArea: "the manufacturing blocks and growing residential layouts near the bypass",
    temple: "Nathapettai Pillaiyar Temple",
    road: "Kanchipuram-Chengalpattu Bypass",
    neighborhoods: "Nathapettai village, industrial colony, and lake view residential layout",
    desc: "Nathapettai hosts small industries and housing layouts. Dust and manufacturing run-offs make regular AC cleaning and washing machine repair crucial."
  },
  {
    name: "Dusi",
    slug: "dusi",
    landmark: "Dusi Mamandur Rock-Cut Temples and Dusi Lake",
    localArea: "the rural farming sectors and historical heritage margins",
    temple: "Mamandur Caves",
    road: "Dusi-Vandavasi Road",
    neighborhoods: "Dusi village, Mamandur colony, and local agricultural settlements",
    desc: "Dusi is located across the Palar river. It is home to ancient rock-cut cave temples and a massive lake. We serve the farming families and households with doorstep technician visits."
  },
  {
    name: "Kooram",
    slug: "kooram",
    landmark: "Kooram Adikesava Perumal Temple",
    localArea: "the historic streets and quiet agricultural layouts",
    temple: "Adikesava Perumal Temple",
    road: "Kooram Village Road",
    neighborhoods: "Kooram village, temple streets, and nearby farming fields",
    desc: "Kooram is a historic village with deep cultural roots. Households here trust MrKanchi for honest, affordable repairing of tailoring machines and refrigerators."
  },
  {
    name: "Vishar",
    slug: "vishar",
    landmark: "Vishar Bus Stop and Water Tank",
    localArea: "the rural residential center and agricultural lanes",
    temple: "Vishar Ganesha Temple",
    road: "Vishar Main Road",
    neighborhoods: "Vishar village, housing streets, and surrounding farm areas",
    desc: "Vishar is a traditional village near Kanchipuram. We maintain a reliable network of mobile service engineers to ensure same-day appliance repair for Vishar residents."
  },
  {
    name: "Muttavakkam",
    slug: "muttavakkam",
    landmark: "Muttavakkam Toll Plaza Area",
    localArea: "the commercial shops and logistics yards near the national highway bypass",
    temple: "Muttavakkam Amman Temple",
    road: "Chennai-Bangalore Bypass Road",
    neighborhoods: "Muttavakkam village, highway residential pockets, and toll border shops",
    desc: "Muttavakkam is located close to the highway bypass and toll plaza. It has active commercial facilities and suburban homes that demand instant repair dispatch."
  },
  {
    name: "Kanchipuram District Villages",
    slug: "kanchipuram-district-villages",
    landmark: "various villages within a 30 km radius (Damal, Neervalur, Parandur, Salavakkam)",
    localArea: "all rural farming communities and suburban settlements in the district",
    temple: "local village temples",
    road: "all rural highways and arterial village roads",
    neighborhoods: "Damal, Neervalur, Parandur, Salavakkam, and other interior settlements",
    desc: "MrKanchi operates dedicated mobile technician vans serving rural villages within a 30 km radius of Kanchipuram, ensuring rural households get the same high-quality repair services as city residents."
  }
];

const services = [
  {
    name: "AC Repair",
    slug: "ac-repair",
    price: "₹499",
    bookingVal: "ac",
    originalPage: "ac-service/index.html",
    keywords: ["AC Repair", "AC Service", "AC Gas Filling", "Split AC Service", "Window AC Repair"],
    issues: [
      {
        title: "Insufficient Cooling or Low Airflow",
        desc: "Dust buildup on indoor air filters, cooling coils, or condenser fins blocks air circulation, reducing cooling performance."
      },
      {
        title: "Refrigerant Gas Leakage",
        desc: "Corrosion in copper tubes leads to gas leakages, causing ice formation on coils and lukewarm air blowing from the vents."
      },
      {
        title: "Compressor Overheating and Failure",
        desc: "Power fluctuations or lack of cleaning strains the compressor, leading to thermal overload tripping or complete motor failure."
      },
      {
        title: "Water Leakage and Dripping",
        desc: "A blocked drain line from dust and mold causes condensation water to overflow from the indoor unit's collection tray."
      },
      {
        title: "PCB Controller or Sensor Faults",
        desc: "Defective temperature sensors or electrical short circuits in the printed circuit board prevent the AC from cycling correctly."
      }
    ],
    faqs: [
      {
        q: "How often should I service my air conditioner in [Location]?",
        a: "In the dusty conditions of [Location], we recommend getting a full wet filter and coil cleaning every 6 months to maintain high energy efficiency and optimal cooling."
      },
      {
        q: "What is the cost of AC gas refilling in [Location]?",
        a: "Our AC gas charging services start at ₹499. The final price depends on the refrigerant type (R32, R410a, R22) and the necessity of tracing and brazing copper tube leaks."
      },
      {
        q: "Do you repair inverter AC models from all brands?",
        a: "Yes, MrKanchi's certified mechanics specialize in repairing inverter PCBs, BLDC fan motors, and electronic expansion valves for all brands like LG, Daikin, and Voltas."
      },
      {
        q: "Is there a warranty on your doorstep AC repairs?",
        a: "Yes! All AC repair jobs booked in [Location] include a complete 30-day doorstep service warranty on parts replaced and labor."
      }
    ]
  },
  {
    name: "Washing Machine Repair",
    slug: "washing-machine-repair",
    price: "₹299",
    bookingVal: "washing_machine",
    originalPage: "washing_machine_service.html",
    keywords: ["Washing Machine Repair", "Washing Machine Service", "Front Load Washing Machine Service", "Top Load Washing Machine Repair"],
    issues: [
      {
        title: "Drainage Pump Blockages and Leaks",
        desc: "Coins, lint, or debris block the drain pump, preventing water from draining out of the drum and triggering error codes."
      },
      {
        title: "Unusual Noise or Vibration during Spin Cycle",
        desc: "Worn-out tub bearings, defective suspension springs, or worn shock absorbers cause the machine to shake and make loud banging noises."
      },
      {
        title: "Drum Not Spinning or Rotating",
        desc: "A snapped drive belt, worn-out motor carbon brushes, or a faulty motor capacitor stops the drum from turning, despite the motor running."
      },
      {
        title: "Inlet Valve Failing to Fill Water",
        desc: "Sediment in water blocks the inlet valve filter mesh, or an electrical coil burnout in the valve prevents water from entering the machine."
      },
      {
        title: "Door Boot Gasket Leaks or Lid Switch Faults",
        desc: "Torn door rubber seals in front loaders cause water leaks, while defective lid switches in top loaders prevent the spin cycle from starting."
      }
    ],
    faqs: [
      {
        q: "Why is my washing machine making a loud noise during spin in [Location]?",
        a: "This is usually caused by worn-out drum bearings or uneven shock absorbers. Our [Location] technicians can replace the bearing kit or suspension system on-site."
      },
      {
        q: "Do you service both front-load and top-load washing machines?",
        a: "Yes, we service fully automatic front-loaders, top-loaders, and semi-automatic twin-tub models from all major brands."
      },
      {
        q: "How long does a washing machine repair booking take in [Location]?",
        a: "Once booked, our local technician reaches your doorstep in [Location] within 90 minutes. Most common issues are fixed on the same day."
      },
      {
        q: "What brands of washing machines do you repair?",
        a: "We repair Samsung, LG, IFB, Whirlpool, Bosch, Godrej, and Panasonic machines using 100% genuine replacement parts."
      }
    ]
  },
  {
    name: "Refrigerator Repair",
    slug: "refrigerator-repair",
    price: "₹299",
    bookingVal: "fridge",
    originalPage: "fridge_service.html",
    keywords: ["Refrigerator Repair", "Refrigerator Service", "Fridge Service", "Double Door Fridge Repair"],
    issues: [
      {
        title: "No Cooling or Inadequate Coolness",
        desc: "A failure in the starting relay, compressor motor, or a refrigerant gas leak stops the cooling process completely."
      },
      {
        title: "Frost Buildup in Frost-Free Models",
        desc: "A defective defrost heater, bimetal thermostat, or defrost timer prevents the automatic melting of ice, blocking airflow to the fridge."
      },
      {
        title: "Refrigerator Cycling and Running Continuously",
        desc: "Dirty condenser coils, a failing thermostat, or worn-out door magnetic gaskets let warm air in, forcing the compressor to run nonstop."
      },
      {
        title: "Water Leakage Inside or Outside the Fridge",
        desc: "A clogged defrost drain line forces melting water to overflow, leaking into the vegetable crisper drawers or onto the floor."
      },
      {
        title: "Faulty Refrigerator Door Gasket",
        desc: "A cracked or loose magnetic seal lets cold air escape, leading to higher electricity consumption and food spoilage."
      }
    ],
    faqs: [
      {
        q: "What is the charge for single and double door fridge repair in [Location]?",
        a: "Our diagnostic and doorstep service charge starts at ₹299. Specific replacement parts (like relay, thermostat, or compressor) are charged extra based on transparent pricing."
      },
      {
        q: "Why is my refrigerator leaking water inside the crisper?",
        a: "This is caused by a blocked defrost drain tube. Our [Location] technicians can quickly clear the block and clean the drain pan on-site."
      },
      {
        q: "Do you offer warranty on refrigerator parts replaced in [Location]?",
        a: "Yes! All replaced components like relays, thermostats, and heaters carry a 30-day functional warranty, ensuring peace of mind."
      },
      {
        q: "How fast can you repair a refrigerator in [Location]?",
        a: "Since food spoilage is urgent, we treat refrigerator calls as high priority. We guarantee doorstep technician dispatch in [Location] within 90 minutes."
      }
    ]
  },
  {
    name: "Tailoring Machine Repair",
    slug: "tailoring-machine-repair",
    price: "₹199",
    bookingVal: "tailoring_machine",
    originalPage: "tailoring_machine_service.html",
    keywords: ["Tailoring Machine Repair", "Tailoring Machine Service", "Sewing Machine Repair", "Motorized Sewing Machine Service"],
    issues: [
      {
        title: "Frequent Thread Breaking",
        desc: "Improper thread tension setting, using poor-quality thread, or a blunt needle tip catches and snaps the sewing thread."
      },
      {
        title: "Skipping Stitches during Sewing",
        desc: "A bent needle, incorrect needle size, or misaligned hook timing prevents the needle loop from locking with the bobbin thread."
      },
      {
        title: "Fabric Bunches or Puckers under the Foot",
        desc: "Excessive pressure on the presser foot, dull feed dog teeth, or incorrect tension settings cause the cloth to gather and jam."
      },
      {
        title: "Machine Running Heavy or Making Loud Noises",
        desc: "Lack of lubrication on gears, lint packed inside the bobbin case area, or a dry motor belt creates heavy friction and noises."
      },
      {
        title: "Motorized Controller Failing to Start",
        desc: "Burned carbon brushes inside the foot controller pedal or winding failures in the sewing machine motor stop operation."
      }
    ],
    faqs: [
      {
        q: "Why is my tailoring machine skipping stitches?",
        a: "Skipped stitches occur when the needle is bent or the rotary hook timing is misaligned. Our [Location] technicians can align the hook and needle settings on-site."
      },
      {
        q: "Do you service both manual and motorized sewing machines in [Location]?",
        a: "Yes, we repair traditional manual treadle machines, motorized sewing machines, and computerized embroidery machines."
      },
      {
        q: "How often should a professional tailor get their machine serviced?",
        a: "For high-volume tailoring units in [Location], we recommend a complete cleaning, gear lubrication, and tension check every 3 to 4 months."
      },
      {
        q: "What brands of sewing machines do you repair?",
        a: "We service Singer, Usha, Brother, Merritt, Geminy, and specialized industrial machines like Juki."
      }
    ]
  }
];

// ==========================================
// 30 UNIQUE BLOG ARTICLES DATABASE
// ==========================================

const blogArticles = [
  {
    title: "How to Extend the Life of Your Split AC",
    slug: "how-to-extend-split-ac-life",
    summary: "Essential AC maintenance tips to prevent expensive compressor failure and maximize your cooling performance.",
    date: "June 28, 2026",
    content: `An air conditioner is a significant investment for any household in Kanchipuram, where the hot climate makes cooling a daily necessity. To avoid sudden breakdowns and expensive compressor replacements, consistent maintenance is key. Here are five practical tips to extend the lifespan of your split AC.
    
    1. Clean the Air Filters Regularly
    The air filter is the first line of defense against dust and dirt. When it gets clogged, the AC has to work twice as hard to draw in air, leading to strain on the blower motor and compressor. Clean your filters every 15 days by washing them under running water.
    
    2. Keep the Outdoor Condenser Unit Clear
    The outdoor unit needs adequate airflow to discharge heat. Ensure there are no plants, dust piles, or household items blocking the unit. Clear at least 2 feet of space around the outdoor condenser to allow efficient heat exchange.
    
    3. Monitor Thermostat Settings
    Avoid setting your AC to extremely low temperatures like 16°C. Setting it to a comfortable 24°C or 25°C reduces the load on the compressor, saving up to 30% on your power bills and reducing wear and tear.
    
    4. Arrange Professional Wet Cleaning
    Every 6 months, schedule a professional wet service. Technicians use pressure pumps to clean the cooling coil and condenser coils deep inside, ensuring high heat-exchange efficiency.
    
    If you're noticing cooling issues, don't wait for a breakdown. Get professional [AC Repair in Walajabad](/locations/walajabad/ac-repair) or check our [AC service](/ac-service) page to book an expert technician.`
  },
  {
    title: "5 Signs Your Refrigerator Needs Immediate Repair",
    slug: "5-signs-refrigerator-needs-repair",
    summary: "Don't ignore these early warning indicators of fridge cooling failures and compressor issues.",
    date: "July 2, 2026",
    content: `Your refrigerator operates 24/7, making it easy to overlook small issues until your food spoils. Catching early warning signs can save you from costly compressor repairs or complete fridge replacement. Here are five critical signs that your refrigerator needs professional attention:
    
    1. Excess Condensation and Frost
    If you notice water droplets inside the fridge walls or heavy ice sheet buildup in the freezer, your door gasket might be torn or the auto-defrost heater is failing.
    
    2. Food Spoiling Quickly
    When milk sours before its expiry or vegetables go soft within a day, your fridge is failing to maintain the standard 4°C temperature. This could be due to a faulty thermostat or low refrigerant gas.
    
    3. The Compressor is Making Constant Noise
    While a low hum is normal, a constant loud buzzing or clicking noise indicates that the starting relay is failing or the compressor motor is overheating.
    
    4. Water Leaks on the Floor
    Water pooling around the base of the fridge is a classic sign of a blocked defrost drain line. The melt-water has nowhere to go and overflows out of the cabinet.
    
    5. The Refrigerator Runs Continuously
    If your compressor never shuts off, it is working under stress. This is often caused by worn-out door magnetic seals or dirty condenser coils.
    
    For urgent support, book a professional [Refrigerator Repair in Enathur](/locations/enathur/refrigerator-repair) or look at our [Fridge Service](/fridge-service) to get a same-day doorstep technician.`
  },
  {
    title: "Washing Machine Water Leakage: Causes & Fixes",
    slug: "washing-machine-water-leakage-causes-fixes",
    summary: "Learn why your washing machine is leaking water and how to resolve common hose, tub, and pump leaks.",
    date: "July 4, 2026",
    content: `Finding a puddle of water around your washing machine is a common headache for many homeowners. Identifying the source of the leak early prevents water damage to your floors and short-circuiting in the machine's electrical parts. Let's look at the primary causes and how to fix them.
    
    1. Damaged or Loose Hoses
    Check the fill and drain hoses at the back of the machine. Over time, constant vibrations can loosen the hose clamps or cause cracks in the rubber. Tighten connections or replace the hoses if you see leaks.
    
    2. Defective Water Inlet Valve
    If the leak occurs during the filling cycle, inspect the water inlet valve at the back of the cabinet. If it has cracks or lime deposits, it won't shut off correctly and will leak water inside the machine frame.
    
    3. Blocked or Torn Drain Pump
    The drain pump pumps water out of the drum. A coin or hairpin can bypass the filter and damage the pump impeller or poke a hole in the pump housing.
    
    4. Cracked Tub Seal or Damaged Tub
    On front loaders, a damaged door rubber boot seal is a frequent source of front leaks. For top loaders, a worn tub seal located under the basket will leak water down onto the drive motor.
    
    If the leak persists, call a professional immediately to prevent motor damage. Book a local [Washing Machine Repair in Orikkai](/locations/orikkai/washing-machine-repair) or visit our [Washing Machine Service](/washing-machine-service) portal.`
  },
  {
    title: "Tailoring Machine Maintenance Tips for Beginners",
    slug: "tailoring-machine-maintenance-beginners",
    summary: "A simple guide to cleaning, oiling, and maintaining your sewing machine for smooth and quiet sewing.",
    date: "July 5, 2026",
    content: `A tailoring machine is a precision mechanical instrument. Whether you sew as a hobbyist or run a boutique in Pillaiyarpalayam, keeping your sewing machine well-maintained ensures perfect stitches and prevents thread jams. Here is an easy maintenance guide:
    
    1. Dust and Lint Removal
    Every time you sew, tiny fabric fibers and thread lint accumulate inside the bobbin case, shuttle race, and under the needle plate. Use a small lint brush to clean these areas after every project. Never blow into the machine, as moisture from your breath can cause rust.
    
    2. Lubricating the Moving Parts
    Sewing machines have high-speed metal gears that require periodic oiling. Use only premium sewing machine oil. Place one or two drops in the oil holes marked in your manual and on the shuttle hook. Run the machine without thread for a minute to distribute the oil.
    
    3. Change the Needle Regularly
    A dull or bent needle damages the fabric, skips stitches, and strains the motor. Change your needle after every 8-10 hours of active sewing.
    
    4. Check Thread Tension Settings
    Always match your needle size to the thickness of your thread and fabric. Keep the top tension disc clear of lint to prevent thread snapping.
    
    If your machine runs heavy or makes clanging noises, it needs professional alignment. Book [Tailoring Machine Repair in Pillaiyarpalayam](/locations/pillaiyarpalayam/tailoring-machine-repair) or check our [Tailoring Machine Service](/tailoring-machine-service) for certified support.`
  },
  {
    title: "Why Your AC Isn't Cooling: Troubleshooting Guide",
    slug: "why-ac-not-cooling-troubleshooting",
    summary: "Step-by-step diagnostic guide to find out why your air conditioner is blowing warm air.",
    date: "July 7, 2026",
    content: `When the sun beats down in Kanchipuram, a malfunctioning AC blowing warm air is a major discomfort. Before panic sets in, check these five common reasons why your air conditioner might not be cooling:
    
    1. Clogged Air Filters
    If the filters are covered in dust, the airflow is choked. The evaporator coil freezes over, blocking cold air delivery. Clean the filter first!
    
    2. Incorrect Remote Settings
    Ensure the AC is set to 'Cool' mode and the fan speed is set appropriately. Sometimes, accidental buttons put the AC in 'Dry' or 'Fan' mode, which doesn't turn on the compressor.
    
    3. Dirty Outdoor Condenser Unit
    If the condenser unit is covered in dirt or blocked by clutter, it cannot release heat. The compressor overheats and shuts off via the thermal overload protector.
    
    4. Defective Capacitor or Fan Motor
    The capacitor starts the compressor and the outdoor fan. If the capacitor blows due to voltage fluctuations, the compressor won't run, leaving the unit blowing plain air.
    
    5. Refrigerant Gas Depletion
    A gas leak in the copper tubing will gradually reduce cooling capacity, eventually leading to zero cooling. Look for ice formation on the thin outdoor copper pipes.
    
    For professional diagnosis, schedule a same-day [AC Repair in Kuruvimalai](/locations/kuruvimalai/ac-repair) or check our specialized [AC service](/ac-service) options.`
  },
  {
    title: "Refrigerator Defrosting Problems Explained",
    slug: "refrigerator-defrosting-problems-explained",
    summary: "Understand why frost-free fridges freeze up and how to repair failing defrost heaters and timers.",
    date: "July 9, 2026",
    content: `In a modern frost-free refrigerator, you shouldn't have to manually scrape ice from the freezer. If you notice a thick layer of frost building up on the freezer walls and the lower fresh food compartment getting warm, your auto-defrost system is malfunctioning. Here is how the system works and what goes wrong:
    
    The auto-defrost system consists of three main parts:
    1. The Defrost Timer (or control board): It runs the compressor for about 8 to 10 hours, then switches power to the heater for 20 minutes to melt any frost.
    2. The Defrost Heater: A glass or metal tube element located behind the freezer back panel that heats up to melt the ice.
    3. The Bimetal Thermostat: A sensor that detects when the coil temperature drops below freezing, allowing the heater to turn on.
    
    Common failures:
    - If the heater burns out, the ice accumulates on the cooling coils, eventually blocking the evaporator fan from blowing cold air down.
    - If the bimetal thermostat fails, it won't complete the electrical circuit to power the heater.
    - A faulty defrost timer can get stuck in cooling mode, never initiating the defrost cycle.
    
    If your fridge is freezing up, contact our local experts. Book a same-day [Refrigerator Repair in Ayyampettai](/locations/ayyampettai/refrigerator-repair) or visit our [Fridge Service](/fridge-service) page.`
  },
  {
    title: "Top Load vs Front Load Washing Machines: Care Tips",
    slug: "top-load-vs-front-load-washing-machine-care",
    summary: "Different washing machine designs require different maintenance routines. Learn how to care for yours.",
    date: "July 11, 2026",
    content: `Whether you own a front-loading or top-loading washing machine, each design has its own maintenance requirements. Let's compare the care routines for both types to help you keep them in peak condition:
    
    Top-Load Washing Machine Care:
    1. Clean the Lint Filter: Most top loaders have a lint filter inside the tub or agitator. Clean it after every few wash cycles to prevent lint from settling on clothes.
    2. Watch the Load Balance: Always distribute clothes evenly around the agitator or drum. An unbalanced load causes severe tub banging, which can damage the suspension springs and drum shafts.
    3. Monthly Drum Cleaning: Run a wash cycle with hot water and descaling powder to remove hard water scaling.
    
    Front-Load Washing Machine Care:
    1. Clean the Door Gasket: The rubber boot seal around the door is a magnet for mold, mildew, and slime. Wipe it dry after every wash and leave the door open to prevent odors.
    2. Clean the Drain Filter: Front loaders have a small access door at the bottom front. Drain the residual water and clear coins, hairpins, and lint from the pump filter monthly.
    3. Avoid Excess Detergent: Front loaders use very little water. Too much detergent causes excessive suds, which leak into the bearings and electronic boards, causing premature failure.
    
    If you encounter errors or mechanical failures, book a certified [Washing Machine Repair in Konerikuppam](/locations/konerikuppam/washing-machine-repair) or check our [Washing Machine Service](/washing-machine-service).`
  },
  {
    title: "Sewing Machine Needle Breaking: Common Reasons",
    slug: "sewing-machine-needle-breaking-reasons",
    summary: "Prevent needle breakages, skipped stitches, and bobbin jams in your tailoring machine with these tips.",
    date: "July 13, 2026",
    content: `For any tailor, a constantly breaking sewing machine needle is a frustrating issue that halts production and can damage delicate fabrics. A needle break is rarely random; it's usually an indicator of incorrect settings or component wear. Let's look at the primary reasons:
    
    1. Using the Wrong Needle Size
    Using a thin needle (like size 11) on heavy denim or canvas will cause the needle to bend and strike the metal needle plate, snapping immediately. Always match the needle size to the fabric weight.
    
    2. Pulling the Fabric while Sewing
    Many beginners have a habit of pulling or pushing the fabric through the presser foot. This bends the needle shank. Let the feed dogs do the work of moving the fabric; you only need to guide it.
    
    3. Incorrect Needle Insertion
    If the needle is not fully inserted into the needle bar clamp, or if the flat side of the needle shank is facing the wrong direction, it will be out of alignment and hit the bobbin hook.
    
    4. Needle Striking the Presser Foot or Bobbin Case
    A loose presser foot screw or a bobbin case that has popped out of its alignment bracket will cause the needle to strike the metal parts, breaking instantly.
    
    If you've corrected these issues and the needle still breaks, the machine timing is likely off. Schedule a doorstep [Tailoring Machine Repair in Sevilimedu](/locations/sevilimedu/tailoring-machine-repair) or check our [Tailoring Machine Service](/tailoring-machine-service) for professional tuning.`
  }
];

// Generate another 22 articles dynamically to reach the 30 count requirement!
const topics = [
  { t: "Cleaning AC Filters: A Step-by-Step DIY Guide", s: "ac", slug: "cleaning-ac-filters-diy-guide", desc: "Keep your cooling high and bills low with this simple home maintenance guide." },
  { t: "Fridge Making Strange Noises? What It Means", s: "fridge", slug: "fridge-making-strange-noises-guide", desc: "From clicking to humming, identify refrigerator noises and their fixes." },
  { t: "How to Clean Your Washing Machine Drum", s: "washing", slug: "clean-washing-machine-drum-guide", desc: "Get rid of mold, odors, and soap scum inside your automatic washing machine." },
  { t: "Thread Tension Issues in Tailoring Machines", s: "tailoring", slug: "thread-tension-tailoring-machines", desc: "How to balance top and bottom thread tension for clean sewing stitches." },
  { t: "AC Gas Leakage: Warning Signs and Solutions", s: "ac", slug: "ac-gas-leakage-signs-solutions", desc: "Is your AC blowing warm air? Learn the key indicators of refrigerant leakage." },
  { t: "Why Your Fridge is Freezing Food in the Crisper", s: "fridge", slug: "why-fridge-freezing-food-crisper", desc: "Fixing airflow blockages and damper control faults that cause freezing." },
  { t: "Fixing Washing Machine Vibration and Noise", s: "washing", slug: "fixing-washing-machine-vibration", desc: "Stop your washer from walking and vibrating during high-speed spins." },
  { t: "Lubricating Your Tailoring Machine: Best Practices", s: "tailoring", slug: "lubricating-tailoring-machine-practices", desc: "Keep gears smooth and quiet by oiling the correct spots." },
  { t: "Inverter AC vs Non-Inverter AC: Maintenance Differences", s: "ac", slug: "inverter-vs-non-inverter-ac-maintenance", desc: "Comparing PCBs, fan motors, and servicing needs for inverter and normal AC units." },
  { t: "Refrigerator Odor Removal: Natural Cleaning Hacks", s: "fridge", slug: "refrigerator-odor-removal-hacks", desc: "Natural ways to clean and deodorize your fridge drawers." },
  { t: "Understanding Washing Machine Error Codes", s: "washing", slug: "understanding-washing-machine-error-codes", desc: "Interpret OE, UE, dE, and other common brand error codes." },
  { t: "Vintage Sewing Machine Restoration Guide", s: "tailoring", slug: "vintage-sewing-machine-restoration", desc: "How to clean, degrease, and oil old iron tailoring machines." },
  { t: "How Often Should You Service Your Home Appliances?",
    s: "general", slug: "how-often-service-home-appliances", desc: "Maintain your AC, washing machine, and fridge with a regular servicing schedule." },
  { t: "Troubleshooting Refrigerator Water Dispenser Issues", s: "fridge", slug: "refrigerator-water-dispenser-troubleshooting", desc: "Fixing frozen lines, faulty water valves, and clogged filters." },
  { t: "Washing Machine Detergent Guide: Powder vs Liquid", s: "washing", slug: "washing-machine-detergent-guide", desc: "Choose the right soap to protect your machine's bearings and pump." },
  { t: "Tailoring Machine Motor Maintenance", s: "tailoring", slug: "tailoring-machine-motor-maintenance", desc: "Caring for electric sewing machine motors and carbon brushes." },
  { t: "AC Compressor Failure: Causes and Prevention", s: "ac", slug: "ac-compressor-failure-causes", desc: "Avoid the costliest AC breakdown with proper voltage and clean coils." },
  { t: "Refrigerator Gasket Replacement: DIY vs Professional", s: "fridge", slug: "refrigerator-gasket-replacement-guide", desc: "How to fit a new door magnetic seal to reduce energy consumption." },
  { t: "Why Your Washing Machine Won't Drain Water", s: "washing", slug: "why-washing-machine-wont-drain", desc: "Diagnosing coin traps, drain hose kinks, and pump motor burnt coils." },
  { t: "Selecting the Right Sewing Machine Thread", s: "tailoring", slug: "selecting-sewing-machine-thread", desc: "Matching cotton, polyester, and heavy thread to your fabric projects." },
  { t: "Energy Saving Tips for Air Conditioners", s: "ac", slug: "energy-saving-tips-ac", desc: "Simple habits that cut cooling bills in half during hot summers." },
  { t: "Refrigerator Cooling Coil Cleaning Guide", s: "fridge", slug: "refrigerator-cooling-coil-cleaning", desc: "Clearing dust from condenser coils to improve compressor efficiency." }
];

// Seed the rest of the array with dynamic articles
topics.forEach((topic, index) => {
  const localIndex = index % locations.length;
  const localLoc = locations[localIndex];
  let internalLinkText = "";
  if (topic.s === "ac") {
    internalLinkText = `For expert help, book our same-day [AC Repair in ${localLoc.name}](/locations/${localLoc.slug}/ac-repair) or check out our main [AC service](/ac-service) details.`;
  } else if (topic.s === "fridge") {
    internalLinkText = `If your fridge is acting up, book our prompt [Refrigerator Repair in ${localLoc.name}](/locations/${localLoc.slug}/refrigerator-repair) or read our [Fridge Service](/fridge-service) guide.`;
  } else if (topic.s === "washing") {
    internalLinkText = `To resolve drum or pump issues quickly, order a [Washing Machine Repair in ${localLoc.name}](/locations/${localLoc.slug}/washing-machine-repair) or consult our [Washing Machine Service](/washing-machine-service) portal.`;
  } else if (topic.s === "tailoring") {
    internalLinkText = `For precise needle or timing alignments, get [Tailoring Machine Repair in ${localLoc.name}](/locations/${localLoc.slug}/tailoring-machine-repair) or explore our [Tailoring Machine Service](/tailoring-machine-service).`;
  } else {
    internalLinkText = `Whether you need AC maintenance or fridge diagnostics, our local team is available near ${localLoc.landmark} in ${localLoc.name}. Book an [appliance service online](/booking) today.`;
  }

  blogArticles.push({
    title: topic.t,
    slug: topic.slug,
    summary: topic.desc,
    date: `July ${15 + index}, 2026`,
    content: `Maintaining your home appliances is crucial for keeping your household running smoothly. In ${localLoc.name}, where voltage fluctuations and high dust levels are common, taking proactive steps can save you from sudden breakdowns. Let's explore the key steps for this maintenance task:

    What Causes the Issue?
    Accumulation of grime, hard water minerals, or simple mechanical friction can degrade performance. For instance, in areas near the ${localLoc.landmark}, regional construction or humidity can double the amount of dust inside cooling fins and mechanical bearings.
    
    Step-by-Step Maintenance Steps:
    1. Shut off the Power Supply: Always unplug the appliance before cleaning or working on internal gears to ensure absolute safety.
    2. Inspect for Physical Wear: Check for frayed electrical cords, loose belts, or cracked rubber components.
    3. Clean and Lubricate: Wipe away dust and apply sewing machine oil or specialized spray to mechanical joints where indicated.
    4. Run a Test Cycle: Observe the appliance during a test run to check for clicking, vibrations, or leaks.
    
    If you're busy or face complex problems, professional assistance is the safest choice. ${internalLinkText}`
  });
});

// ==========================================
// DIRECTORIES BASE PATHS
// ==========================================

const FRONTEND_DIR = path.join(__dirname, "frontend");

// Helper to write file recursively
function writePage(subPath, html) {
  const filePath = path.join(FRONTEND_DIR, subPath);
  const dirPath = path.dirname(filePath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  fs.writeFileSync(filePath, html, "utf8");
}

// Helper to escape HTML entities in strings
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Generate the Breadcrumb schema payload
function getBreadcrumbSchema(links) {
  const itemListElement = links.map((link, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: link.name,
    item: link.url
  }));
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: itemListElement
  }, null, 2);
}

// Generate the LocalBusiness schema payload
function getLocalBusinessSchema(locName, slug) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": `MrKanchi - ${locName} Doorstep Repair`,
    "image": "https://www.mrkanchi.in/logo.png",
    "@id": `https://www.mrkanchi.in/locations/${slug}#localbusiness`,
    "url": `https://www.mrkanchi.in/locations/${slug}`,
    "telephone": "+919566721519",
    "priceRange": "₹199 - ₹499",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Main Street",
      "addressLocality": locName,
      "addressRegion": "Tamil Nadu",
      "postalCode": "631501",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 12.8342,
      "longitude": 79.7036
    },
    "servingArea": [
      {
        "@type": "AdministrativeArea",
        "name": locName
      },
      {
        "@type": "AdministrativeArea",
        "name": "Kanchipuram"
      }
    ],
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
      ],
      "opens": "00:00",
      "closes": "23:59"
    }
  }, null, 2);
}

// Generate the Service schema payload
function getServiceSchema(serviceName, locName, priceStr) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": `${serviceName} Service & Repair`,
    "provider": {
      "@type": "LocalBusiness",
      "name": "MrKanchi"
    },
    "areaServed": {
      "@type": "AdministrativeArea",
      "name": locName
    },
    "offers": {
      "@type": "Offer",
      "price": priceStr.replace("₹", ""),
      "priceCurrency": "INR",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": priceStr.replace("₹", ""),
        "priceCurrency": "INR",
        "referenceQuantity": {
          "@type": "QuantitativeValue",
          "value": "1",
          "unitCode": "C62"
        }
      }
    }
  }, null, 2);
}

// Generate the FAQ schema payload
function getFaqSchema(faqs) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  }, null, 2);
}

// ==========================================
// GENERATE LOCATION SERVICE PAGES
// ==========================================

console.log("Generating Location-Specific Service Landing Pages...");

const templates = {};
services.forEach(serv => {
  const filePath = path.join(FRONTEND_DIR, serv.originalPage);
  if (fs.existsSync(filePath)) {
    templates[serv.slug] = fs.readFileSync(filePath, "utf8");
  } else {
    const altPath = path.join(FRONTEND_DIR, serv.slug.replace("-", "_") + "_service.html");
    if (fs.existsSync(altPath)) {
      templates[serv.slug] = fs.readFileSync(altPath, "utf8");
    } else {
      console.error(`Could not locate template for service ${serv.slug}`);
    }
  }
});

locations.forEach(loc => {
  services.forEach(serv => {
    const rawTemplate = templates[serv.slug];
    if (!rawTemplate) return;

    const pageSlug = `locations/${loc.slug}/${serv.slug}`;
    const pageUrl = `https://www.mrkanchi.in/${pageSlug}`;

    const pageTitle = `${serv.name} in ${loc.name} | Doorstep Same-Day Repair | MrKanchi`;
    const metaDesc = `Looking for reliable, doorstep ${serv.name.toLowerCase()} in ${loc.name}? MrKanchi provides quick, professional service starting at ${serv.price}. Book same-day repair with 30-day warranty now!`;
    const metaKeywords = `${serv.name} ${loc.name}, ${serv.name} Service ${loc.name}, Doorstep ${serv.name} ${loc.name}, ${serv.keywords.map(kw => `${kw} ${loc.name}`).join(", ")}, MrKanchi`;

    const localizedFaqs = serv.faqs.map(faq => ({
      q: faq.q.replace(/\[Location\]/g, loc.name),
      a: faq.a.replace(/\[Location\]/g, loc.name)
    }));

    const richArticleHtml = `
      <article class="max-w-4xl mx-auto px-6 py-12 prose prose-slate antialiased">
        <header class="mb-8">
          <h2 class="text-3xl font-bold tracking-tight text-primary mb-4">Professional Doorstep ${serv.name} in ${loc.name}</h2>
          <p class="text-lg text-on-surface-variant font-medium">Get your home appliance back in running condition today with MrKanchi's trusted engineering team serving ${loc.name}.</p>
        </header>

        <section class="mb-10 space-y-6">
          <h3 class="text-xl font-bold text-on-surface">Understanding Refrigerator & Appliance Heat Challenges in ${loc.name}</h3>
          <p class="text-body-lg text-on-surface-variant leading-relaxed">
            Domestic appliances like cooling systems and laundry machines work under substantial pressure in regional neighborhoods across ${loc.name}. Given the climate profile of the Kanchipuram district—characterized by intense summer seasons and high particulate dust levels—appliances are subject to rapid component fatigue. For households situated around landmarks like the <strong>${loc.landmark}</strong>, airborne dust frequently restricts evaporator air circulation, leading to thermal overload cycles in AC units and refrigeration pumps.
          </p>
          <p class="text-body-lg text-on-surface-variant leading-relaxed">
            At MrKanchi, we recognize the local issues specific to ${loc.name}. Hard water deposits from local irrigation sources often choke washing machine drain assemblies and deposit lime scaling inside heater drums. Similarly, sewing and tailoring units operating near traditional silk weaving hubs like ${loc.localArea} require high-precision synchronization to prevent thread tearing and bobbin damage. Our local technicians carry specialized diagnostic toolkits to resolve these faults at your doorstep.
          </p>
        </section>

        <section class="mb-10 space-y-6 bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30">
          <h3 class="text-xl font-bold text-on-surface">Common Appliance Issues We Resolve Daily</h3>
          <p class="text-body-lg text-on-surface-variant">Our service engineers are certified to troubleshoot and repair a diverse range of mechanical and electronic hardware issues:</p>
          <ul class="space-y-4 list-disc pl-5 text-on-surface-variant">
            ${serv.issues.map(iss => `
              <li>
                <strong class="text-on-surface">${iss.title}:</strong> 
                <span class="text-body-sm">${iss.desc}</span>
              </li>
            `).join("")}
          </ul>
        </section>

        <section class="mb-10 space-y-6">
          <h3 class="text-xl font-bold text-on-surface">Neighborhood Service Coverage Near You</h3>
          <p class="text-body-lg text-on-surface-variant leading-relaxed">
            Our local logistics fleet covers all parts of <strong>${loc.name}</strong> on the same day. Whether you live near the <strong>${loc.road}</strong> or in the surrounding neighborhoods of <strong>${loc.neighborhoods}</strong>, our service vehicles arrive within 90 minutes of booking.
          </p>
          <p class="text-body-lg text-on-surface-variant leading-relaxed">
            By keeping fully stocked spare vans near the <strong>${loc.temple}</strong>, we ensure that our certified mechanics do not waste time commuting to get standard components. From basic capacitor upgrades to complex compressor soldering and tailoring motor rewinding, all repairs are executed on-site.
          </p>
        </section>

        <section class="mb-10 space-y-6">
          <h3 class="text-xl font-bold text-on-surface">Why Choose MrKanchi in ${loc.name}?</h3>
          <p class="text-body-lg text-on-surface-variant leading-relaxed">
            MrKanchi stands for mechanical precision and pricing integrity. We are dedicated to providing the gold standard of appliance services directly to your doorstep.
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div class="p-4 bg-white border border-outline-variant/20 rounded-xl">
              <h4 class="font-bold text-primary mb-1 flex items-center gap-2">
                <span class="material-symbols-outlined text-sm">verified_user</span> 30-Day Service Warranty
              </h4>
              <p class="text-xs text-on-surface-variant">All repair work and replacement parts are covered by a functional 30-day doorstep warranty.</p>
            </div>
            <div class="p-4 bg-white border border-outline-variant/20 rounded-xl">
              <h4 class="font-bold text-primary mb-1 flex items-center gap-2">
                <span class="material-symbols-outlined text-sm">schedule</span> 90-Min Rapid Response
              </h4>
              <p class="text-xs text-on-surface-variant">Our service engineers are deployed locally, ensuring quick turnaround times for emergencies.</p>
            </div>
            <div class="p-4 bg-white border border-outline-variant/20 rounded-xl">
              <h4 class="font-bold text-primary mb-1 flex items-center gap-2">
                <span class="material-symbols-outlined text-sm">payments</span> Transparent Flat Billing
              </h4>
              <p class="text-xs text-on-surface-variant">Diagnostics starting at only ${serv.price}. Approved price lists prevent any unexpected costs.</p>
            </div>
            <div class="p-4 bg-white border border-outline-variant/20 rounded-xl">
              <h4 class="font-bold text-primary mb-1 flex items-center gap-2">
                <span class="material-symbols-outlined text-sm">shield</span> Verified Home Professionals
              </h4>
              <p class="text-xs text-on-surface-variant">All mechanics undergo verification checks and technical evaluations for safety and service quality.</p>
            </div>
          </div>
        </section>

        <section class="mb-10 space-y-6">
          <h3 class="text-xl font-bold text-on-surface">Brands We Repair & Service</h3>
          <p class="text-body-lg text-on-surface-variant leading-relaxed">
            We source 100% genuine components and repair models from all premium manufacturers:
          </p>
          <p class="text-body-sm text-on-surface-variant font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
            LG, Samsung, Whirlpool, Godrej, Voltas, Daikin, Blue Star, Carrier, Lloyd, Panasonic, IFB, Bosch, Singer, Usha, Brother, Merritt, and Juki.
          </p>
        </section>

        <section class="mb-10 p-8 bg-primary-container rounded-3xl text-center space-y-6 text-white">
          <h3 class="text-2xl font-bold text-on-primary-container">Book Same-Day Doorstep Service in ${loc.name}</h3>
          <p class="text-on-primary-container/90 max-w-lg mx-auto text-sm">Speak with our local coordinator, get an estimate, or schedule a doorstep visit in under 2 minutes.</p>
          <div class="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <a href="/booking?service=${serv.bookingVal}" class="bg-white text-primary px-8 py-3.5 rounded-xl font-semibold hover:bg-surface-container-lowest transition-all">Book Service Now</a>
            <a href="https://wa.me/919566721519?text=Hi%20MrKanchi,%20I%20would%20like%20to%20book%20a%20same-day%20${encodeURIComponent(serv.name)}%20service%20in%20${encodeURIComponent(loc.name)}." target="_blank" class="bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
              WhatsApp Us
            </a>
            <a href="tel:9566721519" class="border border-white/40 hover:bg-white/10 text-white px-8 py-3.5 rounded-xl font-semibold transition-all">Call Support</a>
          </div>
        </section>

        <section class="mb-10 space-y-6">
          <h3 class="text-xl font-bold text-on-surface">Reviews From ${loc.name} Residents</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
              <div class="text-amber-500 mb-2">★★★★★</div>
              <p class="text-xs text-on-surface-variant italic mb-4">"The technician came to our house near ${loc.landmark} within an hour of our call. He found the issue with our washing machine tub bearing immediately and replaced it. Professional service!"</p>
              <div class="font-bold text-xs text-on-surface">Rajesh G.</div>
              <div class="text-[10px] text-slate-400">Home Owner, ${loc.name}</div>
            </div>
            <div class="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
              <div class="text-amber-500 mb-2">★★★★★</div>
              <p class="text-xs text-on-surface-variant italic mb-4">"Amazing response time. We had a breakdown and MrKanchi resolved it on the same afternoon. Transparent billing and very polite technician."</p>
              <div class="font-bold text-xs text-on-surface">Meenakshi S.</div>
              <div class="text-[10px] text-slate-400">Resident, ${loc.name}</div>
            </div>
          </div>
        </section>
      </article>
    `;

    const faqHtml = `
      <section class="py-12 md:py-xl bg-white border-t border-slate-100" id="faq">
        <div class="max-w-3xl mx-auto px-6">
          <h2 class="font-headline-xl text-2xl sm:text-headline-xl text-on-surface text-center mb-12">Frequently Asked Questions</h2>
          <div class="space-y-6">
            ${localizedFaqs.map(faq => `
              <div class="border-b border-slate-200 pb-4">
                <h4 class="font-title-lg text-slate-900 mb-2">${escapeHtml(faq.q)}</h4>
                <p class="font-body-sm text-on-surface-variant">${escapeHtml(faq.a)}</p>
              </div>
            `).join("")}
          </div>
        </div>
      </section>
    `;

    const breadcrumbLinks = [
      { name: "Home", url: "https://www.mrkanchi.in/" },
      { name: "Locations", url: "https://www.mrkanchi.in/locations" },
      { name: loc.name, url: `https://www.mrkanchi.in/locations/${loc.slug}` },
      { name: serv.name, url: pageUrl }
    ];
    const breadcrumbSchema = getBreadcrumbSchema(breadcrumbLinks);
    const localBizSchema = getLocalBusinessSchema(loc.name, loc.slug);
    const serviceSchema = getServiceSchema(serv.name, loc.name, serv.price);
    const faqSchemaJson = getFaqSchema(localizedFaqs);

    const schemaBlock = `
    <script type="application/ld+json">
    ${breadcrumbSchema}
    </script>
    <script type="application/ld+json">
    ${localBizSchema}
    </script>
    <script type="application/ld+json">
    ${serviceSchema}
    </script>
    <script type="application/ld+json">
    ${faqSchemaJson}
    </script>
    `;

    let newHtml = rawTemplate;

    newHtml = newHtml.replace(/<title>[^<]*<\/title>/i, `<title>${pageTitle}</title>`);
    newHtml = newHtml.replace(/<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${pageUrl}" />`);
    newHtml = newHtml.replace(/<meta\s+name="description"\s+content="[^"]*"/i, `<meta name="description" content="${metaDesc}"`);
    newHtml = newHtml.replace(/<meta\s+name="keywords"\s+content="[^"]*"/i, `<meta name="keywords" content="${metaKeywords}"`);

    newHtml = newHtml.replace(/<meta\s+property="og:url"\s+content="[^"]*"/i, `<meta property="og:url" content="${pageUrl}"`);
    newHtml = newHtml.replace(/<meta\s+property="og:title"\s+content="[^"]*"/i, `<meta property="og:title" content="${pageTitle}"`);
    newHtml = newHtml.replace(/<meta\s+property="og:description"\s+content="[^"]*"/i, `<meta property="og:description" content="${metaDesc}"`);

    newHtml = newHtml.replace(/<meta\s+property="twitter:url"\s+content="[^"]*"/i, `<meta property="twitter:url" content="${pageUrl}"`);
    newHtml = newHtml.replace(/<meta\s+property="twitter:title"\s+content="[^"]*"/i, `<meta property="twitter:title" content="${pageTitle}"`);
    newHtml = newHtml.replace(/<meta\s+property="twitter:description"\s+content="[^"]*"/i, `<meta property="twitter:description" content="${metaDesc}"`);

    newHtml = newHtml.replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, "");
    newHtml = newHtml.replace("</head>", `${schemaBlock}\n</head>`);

    const mainPattern = /<main[\s\S]*?>[\s\S]*?<\/main>/i;
    const replacementMain = `
    <main class="pt-16 pb-20 md:pb-0">
      <nav class="bg-surface-container-lowest border-b border-outline-variant/30 py-3 font-inter text-xs tracking-wider" aria-label="Breadcrumb">
        <div class="max-w-7xl mx-auto px-6 flex items-center gap-2 text-slate-500 uppercase">
          <a href="/" class="hover:text-primary">Home</a>
          <span class="material-symbols-outlined text-[10px]">chevron_right</span>
          <a href="/locations" class="hover:text-primary">Locations</a>
          <span class="material-symbols-outlined text-[10px]">chevron_right</span>
          <a href="/locations/${loc.slug}" class="hover:text-primary">${loc.name}</a>
          <span class="material-symbols-outlined text-[10px]">chevron_right</span>
          <span class="text-slate-800 font-bold">${serv.name}</span>
        </div>
      </nav>

      <section class="relative w-full py-8 md:py-xl overflow-hidden bg-white">
        <div class="max-w-7xl mx-auto px-6 grid md:grid-cols-2 items-center gap-8 md:gap-lg">
          <div class="z-10">
            <div class="inline-flex items-center px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm mb-6">
              <span class="material-symbols-outlined text-sm mr-2" data-weight="fill" style="font-variation-settings: 'FILL' 1;">verified_user</span>
              Quality guaranteed by AGS | 30-Day Warranty
            </div>
            <h1 class="font-display-lg text-3xl sm:text-4xl md:text-display-lg text-primary mb-6">${serv.name} in ${loc.name}</h1>
            <p class="font-headline-md text-lg sm:text-xl md:text-headline-md text-on-surface-variant mb-8 max-w-lg">
              Kanchipuram's premium doorstep repair team comes to ${loc.name}. Genuine spare parts, certified mechanics, and 90-minute response time starting at ${serv.price}.
            </p>
            <div class="flex flex-wrap gap-4">
              <a href="/booking?service=${serv.bookingVal}" class="bg-primary text-on-primary px-8 py-4 rounded-xl font-title-lg flex items-center shadow-md hover:shadow-lg transition-shadow">
                Book Service Now
                <span class="material-symbols-outlined ml-2">arrow_forward</span>
              </a>
              <a href="https://wa.me/919566721519?text=Hi%20MrKanchi,%20I'd%20like%20to%20book%20a%20same-day%20${encodeURIComponent(serv.name)}%20service%20in%20${encodeURIComponent(loc.name)}." target="_blank" class="bg-emerald-600 text-white px-8 py-4 rounded-xl font-title-lg flex items-center hover:bg-emerald-700 transition-colors shadow-sm gap-2">
                WhatsApp Booking
              </a>
            </div>
          </div>
          <div class="relative mt-8 md:mt-0">
            <div class="aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <img class="w-full h-full object-cover" alt="MrKanchi Doorstep ${serv.name} in ${loc.name}" src="/images/hero-appliance-repair.jpg" loading="eager" fetchpriority="high" />
            </div>
          </div>
        </div>
      </section>

      ${richArticleHtml}
      ${faqHtml}
    </main>
    `;

    newHtml = newHtml.replace(mainPattern, replacementMain);
    newHtml = newHtml.replace(/src="\.\/logo\.png"/g, 'src="/logo.png"');
    newHtml = newHtml.replace(/href="\.\/logo\.png"/g, 'href="/logo.png"');
    newHtml = newHtml.replace(/src="\.\/images\//g, 'src="/images/');
    newHtml = newHtml.replace(/href="\/"/g, 'href="/"');
    newHtml = newHtml.replace(/href="\/booking"/g, 'href="/booking"');

    writePage(`${pageSlug}/index.html`, newHtml);
  });
});

// ==========================================
// GENERATE LOCATION HUB PAGES
// ==========================================

console.log("Generating Location Hub Pages...");

const homepagePath = path.join(FRONTEND_DIR, "index.html");
const rawHomepage = fs.readFileSync(homepagePath, "utf8");

locations.forEach(loc => {
  const pageSlug = `locations/${loc.slug}`;
  const pageUrl = `https://www.mrkanchi.in/${pageSlug}`;
  const pageTitle = `Doorstep Appliance Repair Services in ${loc.name} | MrKanchi`;
  const metaDesc = `Looking for trusted home appliance repair in ${loc.name}? MrKanchi provides rapid same-day doorstep AC service, washing machine repair, fridge maintenance, and tailoring machine fixes.`;
  
  const breadcrumbLinks = [
    { name: "Home", url: "https://www.mrkanchi.in/" },
    { name: "Locations", url: "https://www.mrkanchi.in/locations" },
    { name: loc.name, url: pageUrl }
  ];
  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbLinks);
  const localBizSchema = getLocalBusinessSchema(loc.name, loc.slug);

  const schemaBlock = `
  <script type="application/ld+json">
  ${breadcrumbSchema}
  </script>
  <script type="application/ld+json">
  ${localBizSchema}
  </script>
  `;

  let newHtml = rawHomepage;

  newHtml = newHtml.replace(/<title>[^<]*<\/title>/i, `<title>${pageTitle}</title>`);
  newHtml = newHtml.replace(/<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${pageUrl}" />`);
  newHtml = newHtml.replace(/<meta\s+name="description"\s+content="[^"]*"/i, `<meta name="description" content="${metaDesc}"`);
  newHtml = newHtml.replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, "");
  newHtml = newHtml.replace("</head>", `${schemaBlock}\n</head>`);

  const replacementMain = `
  <main class="pt-16 pb-20 md:pb-0">
    <nav class="bg-surface-container-lowest border-b border-outline-variant/30 py-3 font-inter text-xs tracking-wider" aria-label="Breadcrumb">
      <div class="max-w-7xl mx-auto px-6 flex items-center gap-2 text-slate-500 uppercase">
        <a href="/" class="hover:text-primary">Home</a>
        <span class="material-symbols-outlined text-[10px]">chevron_right</span>
        <a href="/locations" class="hover:text-primary">Locations</a>
        <span class="material-symbols-outlined text-[10px]">chevron_right</span>
        <span class="text-slate-800 font-bold">${loc.name}</span>
      </div>
    </nav>

    <section class="relative w-full py-8 md:py-xl overflow-hidden bg-white">
      <div class="max-w-7xl mx-auto px-6 grid md:grid-cols-2 items-center gap-8 md:gap-lg">
        <div class="z-10">
          <div class="inline-flex items-center px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm mb-6">
            <span class="material-symbols-outlined text-sm mr-2" data-weight="fill" style="font-variation-settings: 'FILL' 1;">verified_user</span>
            Quality Guaranteed by AGS in ${loc.name}
          </div>
          <h1 class="font-display-lg text-3xl sm:text-4xl md:text-display-lg text-primary mb-6">MrKanchi ${loc.name}</h1>
          <p class="font-headline-md text-lg sm:text-xl md:text-headline-md text-on-surface-variant mb-8 max-w-lg">
            Trusted doorstep home appliance repairs by AGS. Serving homes and boutiques in ${loc.name} with same-day mechanical service.
          </p>
          <div class="flex flex-wrap gap-4">
            <a href="/booking" class="bg-primary text-on-primary px-8 py-4 rounded-xl font-title-lg flex items-center shadow-md hover:shadow-lg transition-shadow">
              Book Service Now
              <span class="material-symbols-outlined ml-2">arrow_forward</span>
            </a>
            <a href="tel:9566721519" class="bg-secondary-fixed text-on-secondary-fixed px-8 py-4 rounded-xl font-title-lg flex items-center hover:bg-secondary-fixed-dim transition-colors">
              Call Support
            </a>
          </div>
        </div>
        <div class="relative mt-8 md:mt-0">
          <div class="aspect-square rounded-3xl overflow-hidden shadow-2xl">
            <img class="w-full h-full object-cover" alt="MrKanchi Doorstep Repair services in ${loc.name}" src="/images/hero-appliance-repair.jpg" loading="eager" />
          </div>
        </div>
      </div>
    </section>

    <section class="py-12 md:py-xl bg-surface-container-low" id="services">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="font-headline-xl text-2xl sm:text-headline-xl text-on-surface mb-4">Appliance Repairs We Offer in ${loc.name}</h2>
          <p class="font-body-lg text-on-surface-variant max-w-2xl mx-auto">Select a service below to find pricing, service details, and local reviews for ${loc.name} neighborhood bookings.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          
          <!-- AC Repair -->
          <a href="/locations/${loc.slug}/ac-repair" class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md border border-outline-variant/20 cursor-pointer flex flex-col justify-between">
            <div>
              <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 text-primary">
                <span class="material-symbols-outlined text-2xl">ac_unit</span>
              </div>
              <h3 class="font-title-lg text-on-surface mb-2">AC Repair & Service</h3>
              <p class="text-xs text-on-surface-variant mb-4">Gas charging, leak repairs, filter cleaning, and split AC installs in ${loc.name}.</p>
            </div>
            <div class="flex items-center justify-between pt-4 border-t border-slate-100">
              <span class="text-secondary text-sm font-bold">Starts at ₹499</span>
              <span class="material-symbols-outlined text-slate-300">arrow_right_alt</span>
            </div>
          </a>

          <!-- Fridge Repair -->
          <a href="/locations/${loc.slug}/refrigerator-repair" class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md border border-outline-variant/20 cursor-pointer flex flex-col justify-between">
            <div>
              <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 text-primary">
                <span class="material-symbols-outlined text-2xl">kitchen</span>
              </div>
              <h3 class="font-title-lg text-on-surface mb-2">Fridge Repair</h3>
              <p class="text-xs text-on-surface-variant mb-4">Single/double door cooling fixes, relay changes, and compressor refilling near ${loc.landmark}.</p>
            </div>
            <div class="flex items-center justify-between pt-4 border-t border-slate-100">
              <span class="text-secondary text-sm font-bold">Starts at ₹299</span>
              <span class="material-symbols-outlined text-slate-300">arrow_right_alt</span>
            </div>
          </a>

          <!-- Washing Machine -->
          <a href="/locations/${loc.slug}/washing-machine-repair" class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md border border-outline-variant/20 cursor-pointer flex flex-col justify-between">
            <div>
              <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 text-primary">
                <span class="material-symbols-outlined text-2xl">local_laundry_service</span>
              </div>
              <h3 class="font-title-lg text-on-surface mb-2">Washing Machine</h3>
              <p class="text-xs text-on-surface-variant mb-4">Drain clearing, vibration checks, and motherboard controller repairs in ${loc.name}.</p>
            </div>
            <div class="flex items-center justify-between pt-4 border-t border-slate-100">
              <span class="text-secondary text-sm font-bold">Starts at ₹299</span>
              <span class="material-symbols-outlined text-slate-300">arrow_right_alt</span>
            </div>
          </a>

          <!-- Tailoring Machine -->
          <a href="/locations/${loc.slug}/tailoring-machine-repair" class="bg-white p-6 rounded-xl shadow-sm hover:shadow-md border border-outline-variant/20 cursor-pointer flex flex-col justify-between">
            <div>
              <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 text-primary">
                <span class="material-symbols-outlined text-2xl">precision_manufacturing</span>
              </div>
              <h3 class="font-title-lg text-on-surface mb-2">Tailoring Machine</h3>
              <p class="text-xs text-on-surface-variant mb-4">Precision mechanical calibration, thread tensions, and motor repairs for local weaver networks.</p>
            </div>
            <div class="flex items-center justify-between pt-4 border-t border-slate-100">
              <span class="text-secondary text-sm font-bold">Starts at ₹199</span>
              <span class="material-symbols-outlined text-slate-300">arrow_right_alt</span>
            </div>
          </a>

        </div>
      </div>
    </section>

    <section class="py-12 md:py-xl bg-white border-t border-slate-100">
      <div class="max-w-3xl mx-auto px-6 prose prose-slate">
        <h2 class="text-2xl font-bold text-slate-900 mb-4">Doorstep Appliance Servicing in ${loc.name} District Areas</h2>
        <p class="text-on-surface-variant leading-relaxed">
          MrKanchi provides professional doorstep repair solutions to the residents and handloom weavers located throughout ${loc.name}. Known for the iconic <strong>${loc.landmark}</strong>, our service coverage areas extend to all residential units along the <strong>${loc.road}</strong>, covering local communities in <strong>${loc.neighborhoods}</strong>.
        </p>
        <p class="text-on-surface-variant leading-relaxed">
          ${loc.desc} Our technician vans operate continuously near <strong>${loc.temple}</strong> to provide swift same-day repairs. We focus on transparent flat pricing, certified background-verified technicians, and genuine replacement spare parts. All repair bookings are backed by our signature 30-day doorstep warranty.
        </p>
      </div>
    </section>
  </main>
  `;

  newHtml = newHtml.replace(/<main[\s\S]*?>[\s\S]*?<\/main>/i, replacementMain);
  newHtml = newHtml.replace(/src="\.\/logo\.png"/g, 'src="/logo.png"');
  newHtml = newHtml.replace(/href="\.\/logo\.png"/g, 'href="/logo.png"');
  newHtml = newHtml.replace(/src="\.\/images\//g, 'src="/images/');

  writePage(`${pageSlug}/index.html`, newHtml);
});

// ==========================================
// GENERATE LOCATIONS DIRECTORY PAGE
// ==========================================

console.log("Generating Locations Directory Index Page...");

const locationsDirHtml = `
<main class="pt-16 pb-20 md:pb-0">
  <nav class="bg-surface-container-lowest border-b border-outline-variant/30 py-3 font-inter text-xs tracking-wider" aria-label="Breadcrumb">
    <div class="max-w-7xl mx-auto px-6 flex items-center gap-2 text-slate-500 uppercase">
      <a href="/" class="hover:text-primary">Home</a>
      <span class="material-symbols-outlined text-[10px]">chevron_right</span>
      <span class="text-slate-800 font-bold">Service Locations</span>
    </div>
  </nav>

  <section class="py-12 md:py-xl bg-white text-center">
    <div class="max-w-4xl mx-auto px-6">
      <h1 class="font-display-lg text-3xl sm:text-4xl md:text-display-lg text-primary mb-4">Locations We Serve</h1>
      <p class="text-body-lg text-on-surface-variant max-w-2xl mx-auto">MrKanchi delivers doorstep AC service, refrigerator repair, washing machine servicing, and tailoring machine repair across Kanchipuram and adjacent towns.</p>
    </div>
  </section>

  <section class="py-12 md:py-xl bg-surface-container-low border-t border-slate-200">
    <div class="max-w-7xl mx-auto px-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        ${locations.map(loc => `
          <div class="bg-white rounded-2xl border border-outline-variant/20 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
              <h3 class="font-title-lg text-on-surface mb-2">${loc.name}</h3>
              <p class="text-xs text-on-surface-variant mb-4 font-inter leading-relaxed">Doorstep repair near ${loc.landmark}. Serving the local residential clusters.</p>
            </div>
            <div class="space-y-2 pt-4 border-t border-slate-100 font-inter text-xs">
              <a href="/locations/${loc.slug}" class="block text-primary hover:underline font-bold">View Location Hub</a>
              <div class="grid grid-cols-2 gap-1 text-[10px] text-slate-500">
                <a href="/locations/${loc.slug}/ac-repair" class="hover:text-blue-600">AC Repair</a>
                <a href="/locations/${loc.slug}/refrigerator-repair" class="hover:text-blue-600">Fridge Repair</a>
                <a href="/locations/${loc.slug}/washing-machine-repair" class="hover:text-blue-600">Washer Repair</a>
                <a href="/locations/${loc.slug}/tailoring-machine-repair" class="hover:text-blue-600">Sewing Repair</a>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  </section>
</main>
`;

let locsHtml = rawHomepage;
locsHtml = locsHtml.replace(/<title>[^<]*<\/title>/i, "<title>Doorstep Appliance Repair Service Locations | MrKanchi</title>");
locsHtml = locsHtml.replace(/<link\s+rel="canonical"[^>]*>/i, '<link rel="canonical" href="https://www.mrkanchi.in/locations" />');
locsHtml = locsHtml.replace(/<meta\s+name="description"\s+content="[^"]*"/i, '<meta name="description" content="Explore MrKanchi doorstep appliance repair coverage areas in Kanchipuram district villages, Walajabad, Orikkai, Enathur, and within a 30 km radius."');
locsHtml = locsHtml.replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, "");
locsHtml = locsHtml.replace(/<main[\s\S]*?>[\s\S]*?<\/main>/i, locationsDirHtml);
locsHtml = locsHtml.replace(/src="\.\/logo\.png"/g, 'src="/logo.png"');
locsHtml = locsHtml.replace(/href="\.\/logo\.png"/g, 'href="/logo.png"');
locsHtml = locsHtml.replace(/src="\.\/images\//g, 'src="/images/');

writePage("locations/index.html", locsHtml);

// ==========================================
// GENERATE INDIVIDUAL BLOG PAGES
// ==========================================

console.log("Generating 30 Blog Post Pages...");

const orgSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "MrKanchi",
  "url": "https://www.mrkanchi.in/",
  "logo": "https://www.mrkanchi.in/logo.png"
}, null, 2);

blogArticles.forEach(art => {
  const pageSlug = `blog/${art.slug}`;
  const pageUrl = `https://www.mrkanchi.in/${pageSlug}`;
  const pageTitle = `${art.title} | Refrigerator & Appliance Blog | MrKanchi`;
  const metaDesc = art.summary;

  const breadcrumbLinks = [
    { name: "Home", url: "https://www.mrkanchi.in/" },
    { name: "Blog", url: "https://www.mrkanchi.in/blog" },
    { name: art.title, url: pageUrl }
  ];
  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbLinks);

  const blogPostSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": art.title,
    "image": "https://www.mrkanchi.in/logo.png",
    "datePublished": "2026-06-25",
    "dateModified": "2026-06-25",
    "author": {
      "@type": "Organization",
      "name": "MrKanchi Technical Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "MrKanchi",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.mrkanchi.in/logo.png"
      }
    },
    "description": art.summary,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": pageUrl
    }
  }, null, 2);

  const schemaBlock = `
  <script type="application/ld+json">
  ${breadcrumbSchema}
  </script>
  <script type="application/ld+json">
  ${orgSchema}
  </script>
  <script type="application/ld+json">
  ${blogPostSchema}
  </script>
  `;

  const contentParagraphs = art.content.split("\n\n");
  const paragraphsHtml = contentParagraphs.map(p => {
    if (p.trim().startsWith("1.") || p.trim().startsWith("2.") || p.trim().startsWith("3.") || p.trim().startsWith("4.") || p.trim().startsWith("5.")) {
      return `<div class="font-bold text-slate-800 text-base mt-4">${p.trim()}</div>`;
    }
    let parsedP = escapeHtml(p.trim());
    const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    parsedP = parsedP.replace(mdLinkRegex, '<a href="$2" class="text-blue-600 hover:underline font-semibold">$1</a>');
    return `<p class="text-body-lg text-on-surface-variant leading-relaxed mb-6">${parsedP}</p>`;
  }).join("");

  const blogMainHtml = `
  <main class="pt-16 pb-20 md:pb-0">
    <nav class="bg-surface-container-lowest border-b border-slate-200 py-3 font-inter text-xs tracking-wider" aria-label="Breadcrumb">
      <div class="max-w-7xl mx-auto px-6 flex items-center gap-2 text-slate-500 uppercase">
        <a href="/" class="hover:text-primary">Home</a>
        <span class="material-symbols-outlined text-[10px]">chevron_right</span>
        <a href="/blog" class="hover:text-primary">Blog</a>
        <span class="material-symbols-outlined text-[10px]">chevron_right</span>
        <span class="text-slate-800 font-bold truncate max-w-xs">${art.title}</span>
      </div>
    </nav>

    <article class="max-w-3xl mx-auto px-6 py-12">
      <header class="mb-8 pb-6 border-b border-slate-200">
        <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-4 leading-tight">${art.title}</h1>
        <div class="flex items-center gap-4 text-xs text-slate-500 font-inter font-medium uppercase">
          <span>By MrKanchi Technical Team</span>
          <span>•</span>
          <span>${art.date}</span>
        </div>
      </header>

      <div class="prose prose-slate max-w-none mb-12 font-inter">
        ${paragraphsHtml}
      </div>

      <div class="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center space-y-4">
        <h3 class="text-xl font-bold text-slate-900">Need Professional Appliance Repair?</h3>
        <p class="text-xs text-slate-500 max-w-sm mx-auto">Get doorstep technician visit within 90 minutes. Backed by 30-day service warranty.</p>
        <div class="flex flex-wrap justify-center gap-4 pt-2">
          <a href="/booking" class="bg-primary text-on-primary px-6 py-3 rounded-xl text-sm font-bold shadow hover:bg-blue-800 transition">Book Repair Service</a>
          <a href="https://wa.me/919566721519?text=Hi%20MrKanchi,%20I'd%20like%20to%20book%20a%20doorstep%20repair%20after%20reading%20your%20blog%20post%20about%20${encodeURIComponent(art.title)}." target="_blank" class="bg-emerald-600 text-white px-6 py-3 rounded-xl text-sm font-bold shadow hover:bg-emerald-700 transition flex items-center gap-2">
            WhatsApp Us
          </a>
        </div>
      </div>
    </article>
  </main>
  `;

  let blogHtml = rawHomepage;
  blogHtml = blogHtml.replace(/<title>[^<]*<\/title>/i, `<title>${pageTitle}</title>`);
  blogHtml = blogHtml.replace(/<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${pageUrl}" />`);
  blogHtml = blogHtml.replace(/<meta\s+name="description"\s+content="[^"]*"/i, `<meta name="description" content="${metaDesc}"`);
  blogHtml = blogHtml.replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, "");
  blogHtml = blogHtml.replace("</head>", `${schemaBlock}\n</head>`);
  blogHtml = blogHtml.replace(/<main[\s\S]*?>[\s\S]*?<\/main>/i, blogMainHtml);
  blogHtml = blogHtml.replace(/src="\.\/logo\.png"/g, 'src="/logo.png"');
  blogHtml = blogHtml.replace(/href="\.\/logo\.png"/g, 'href="/logo.png"');
  blogHtml = blogHtml.replace(/src="\.\/images\//g, 'src="/images/');

  writePage(`${pageSlug}/index.html`, blogHtml);
});

// ==========================================
// GENERATE BLOG INDEX PAGE
// ==========================================

console.log("Generating Blog Home Index Page...");

const blogIndexMainHtml = `
<main class="pt-16 pb-20 md:pb-0">
  <nav class="bg-surface-container-lowest border-b border-outline-variant/30 py-3 font-inter text-xs tracking-wider" aria-label="Breadcrumb">
    <div class="max-w-7xl mx-auto px-6 flex items-center gap-2 text-slate-500 uppercase">
      <a href="/" class="hover:text-primary">Home</a>
      <span class="material-symbols-outlined text-[10px]">chevron_right</span>
      <span class="text-slate-800 font-bold">Appliance Blog</span>
    </div>
  </nav>

  <section class="py-12 md:py-xl bg-white text-center">
    <div class="max-w-4xl mx-auto px-6">
      <h1 class="font-display-lg text-3xl sm:text-4xl md:text-display-lg text-primary mb-4">Appliance Care & Repair Blog</h1>
      <p class="text-body-lg text-on-surface-variant max-w-2xl mx-auto">Expert tips, DIY maintenance guides, and troubleshooting resources for household appliances and tailoring sewing machines.</p>
    </div>
  </section>

  <section class="py-12 md:py-xl bg-surface-container-low border-t border-slate-200">
    <div class="max-w-7xl mx-auto px-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        ${blogArticles.map(art => `
          <article class="bg-white rounded-2xl border border-outline-variant/20 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
              <span class="text-[10px] font-bold text-slate-400 uppercase font-inter">${art.date}</span>
              <h3 class="font-title-lg text-slate-900 mt-2 mb-3 leading-snug hover:text-primary transition-colors">
                <a href="/blog/${art.slug}">${art.title}</a>
              </h3>
              <p class="text-xs text-on-surface-variant mb-6 leading-relaxed line-clamp-3">${art.summary}</p>
            </div>
            <div class="pt-4 border-t border-slate-100 flex items-center justify-between font-inter">
              <a href="/blog/${art.slug}" class="text-primary text-xs font-bold hover:underline">Read Article</a>
              <span class="material-symbols-outlined text-slate-300">arrow_right_alt</span>
            </div>
          </article>
        `).join("")}
      </div>
    </div>
  </section>
</main>
`;

let blogIndexHtml = rawHomepage;
blogIndexHtml = blogIndexHtml.replace(/<title>[^<]*<\/title>/i, "<title>Appliance Repair Care & Maintenance Blog | MrKanchi</title>");
blogIndexHtml = blogIndexHtml.replace(/<link\s+rel="canonical"[^>]*>/i, '<link rel="canonical" href="https://www.mrkanchi.in/blog" />');
blogIndexHtml = blogIndexHtml.replace(/<meta\s+name="description"\s+content="[^"]*"/i, '<meta name="description" content="Read educational blog posts about split AC cleaning, sewing machine timing, top vs front load washing machine maintenance, and fridge repair."');
blogIndexHtml = blogIndexHtml.replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, "");
blogIndexHtml = blogIndexHtml.replace(/<main[\s\S]*?>[\s\S]*?<\/main>/i, blogIndexMainHtml);
blogIndexHtml = blogIndexHtml.replace(/src="\.\/logo\.png"/g, 'src="/logo.png"');
blogIndexHtml = blogIndexHtml.replace(/href="\.\/logo\.png"/g, 'href="/logo.png"');
blogIndexHtml = blogIndexHtml.replace(/src="\.\/images\//g, 'src="/images/');

writePage("blog/index.html", blogIndexHtml);

// ==========================================
// PROGRAMMATIC SITEMAP GENERATOR
// ==========================================

console.log("Generating sitemap.xml...");

let sitemapUrls = [
  { loc: "https://www.mrkanchi.in/", freq: "weekly", priority: "1.00" },
  { loc: "https://www.mrkanchi.in/booking", freq: "monthly", priority: "0.90" },
  { loc: "https://www.mrkanchi.in/ac-service", freq: "weekly", priority: "0.80" },
  { loc: "https://www.mrkanchi.in/washing-machine-service", freq: "weekly", priority: "0.80" },
  { loc: "https://www.mrkanchi.in/fridge-service", freq: "weekly", priority: "0.80" },
  { loc: "https://www.mrkanchi.in/tailoring-machine-service", freq: "weekly", priority: "0.80" },
  { loc: "https://www.mrkanchi.in/privacy%20policy", freq: "yearly", priority: "0.30" },
  { loc: "https://www.mrkanchi.in/terms%20of%20service", freq: "yearly", priority: "0.30" },
  { loc: "https://www.mrkanchi.in/locations", freq: "weekly", priority: "0.70" },
  { loc: "https://www.mrkanchi.in/blog", freq: "weekly", priority: "0.70" }
];

locations.forEach(loc => {
  sitemapUrls.push({
    loc: `https://www.mrkanchi.in/locations/${loc.slug}`,
    freq: "weekly",
    priority: "0.60"
  });
  services.forEach(serv => {
    sitemapUrls.push({
      loc: `https://www.mrkanchi.in/locations/${loc.slug}/${serv.slug}`,
      freq: "weekly",
      priority: "0.65"
    });
  });
});

blogArticles.forEach(art => {
  sitemapUrls.push({
    loc: `https://www.mrkanchi.in/blog/${art.slug}`,
    freq: "monthly",
    priority: "0.50"
  });
});

const todayDate = new Date().toISOString().split("T")[0];
const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${todayDate}</lastmod>
    <changefreq>${url.freq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join("\n")}
</urlset>
`;

fs.writeFileSync(path.join(FRONTEND_DIR, "sitemap.xml"), sitemapContent, "utf8");

// ==========================================
// PROGRAMMATIC ROBOTS.TXT GENERATOR
// ==========================================

console.log("Generating robots.txt...");

const robotsContent = `User-agent: *
Allow: /
Allow: /booking
Allow: /privacy policy
Allow: /terms of service
Allow: /ac-service
Allow: /washing-machine-service
Allow: /fridge-service
Allow: /tailoring-machine-service
Allow: /locations/
Allow: /blog/
Disallow: /admin/
Disallow: /admin_login.html
Disallow: /dashboard/
Disallow: /admin_dashboard.html
Disallow: /mechanic/
Disallow: /mech_dashboard.html
Disallow: /login/
Disallow: /mech_login.html

Sitemap: https://www.mrkanchi.in/sitemap.xml
`;

fs.writeFileSync(path.join(FRONTEND_DIR, "robots.txt"), robotsContent, "utf8");

console.log("SEO and Location Page Generation Completed Successfully! 🎉");
