import { useState, useRef, useEffect, useCallback } from "react";

const DRIVE_FILE_NAME = "my-life-workspace-data-v3.json";
const GDRIVE_MCP = "https://drivemcp.googleapis.com/mcp/v1";
const LOCAL_STORAGE_KEY = "daia-life-tracker-data";

const TABS = [
  { id: "dashboard", label: "🏠 Today" },
  { id: "calendar", label: "📆 Calendar" },
  { id: "financials", label: "💰 Finance" },
  { id: "travels", label: "✈️ Travels" },
  { id: "plants", label: "🌿 Plants & Garden" },
  { id: "routine", label: "🧘 Routine" },
  { id: "cooking", label: "🍳 Meals" },
  { id: "grocery", label: "🛒 Grocery" },
  { id: "pregnancy", label: "🤰 Baby" },
];

// Real events from Daia's Calendar (daianapartiu@gmail.com) — fetched May 18 2026
const REAL_CALENDAR_EVENTS = [
  // Work — recurring Mon–Fri 7am–4pm
  { date: "2026-05-18", title: "Work", time: "7:00am–4:00pm", cal: "Work", color: "violet" },
  { date: "2026-05-19", title: "Work", time: "7:00am–4:00pm", cal: "Work", color: "violet" },
  { date: "2026-05-20", title: "Work", time: "7:00am–4:00pm", cal: "Work", color: "violet" },
  { date: "2026-05-21", title: "Work", time: "7:00am–4:00pm", cal: "Work", color: "violet" },
  { date: "2026-05-22", title: "Work", time: "7:00am–4:00pm", cal: "Work", color: "violet" },
  { date: "2026-05-25", title: "Work", time: "7:00am–4:00pm", cal: "Work", color: "violet" },
  { date: "2026-05-26", title: "Work", time: "7:00am–4:00pm", cal: "Work", color: "violet" },
  { date: "2026-05-27", title: "Work", time: "7:00am–4:00pm", cal: "Work", color: "violet" },
  { date: "2026-05-28", title: "Work", time: "7:00am–4:00pm", cal: "Work", color: "violet" },
  { date: "2026-05-29", title: "Work", time: "7:00am–4:00pm", cal: "Work", color: "violet" },
  { date: "2026-06-01", title: "Work", time: "7:00am–4:00pm", cal: "Work", color: "violet" },
  { date: "2026-06-02", title: "Work", time: "7:00am–4:00pm", cal: "Work", color: "violet" },
  { date: "2026-06-03", title: "Work", time: "7:00am–4:00pm", cal: "Work", color: "violet" },
  { date: "2026-06-04", title: "Work", time: "7:00am–4:00pm", cal: "Work", color: "violet" },
  { date: "2026-06-05", title: "Work", time: "7:00am–4:00pm", cal: "Work", color: "violet" },
  { date: "2026-06-08", title: "Work", time: "7:00am–4:00pm", cal: "Work", color: "violet" },
  { date: "2026-06-09", title: "Work", time: "7:00am–4:00pm", cal: "Work", color: "violet" },
  { date: "2026-06-10", title: "Work", time: "7:00am–4:00pm", cal: "Work", color: "violet" },
  { date: "2026-06-11", title: "Work", time: "7:00am–4:00pm", cal: "Work", color: "violet" },
  { date: "2026-06-12", title: "Work", time: "7:00am–4:00pm", cal: "Work", color: "violet" },
  // San Diego trip — Airbnb at 1831 Hixson Ave
  { date: "2026-05-22", title: "🌊 San Diego Airbnb", time: "All day", cal: "Travel", color: "sky" },
  { date: "2026-05-23", title: "🌊 San Diego Airbnb", time: "All day", cal: "Travel", color: "sky" },
  { date: "2026-05-24", title: "🌊 San Diego Airbnb", time: "All day", cal: "Travel", color: "sky" },
  { date: "2026-05-25", title: "🌊 San Diego Airbnb", time: "All day", cal: "Travel", color: "sky" },
  { date: "2026-05-26", title: "🌊 San Diego Airbnb", time: "All day", cal: "Travel", color: "sky" },
  // Warsaw / Poland trip — Apartment in the Old Town, Kościelna 7
  { date: "2026-06-13", title: "🇵🇱 Warsaw Apartment", time: "All day", cal: "Travel", color: "rose" },
  { date: "2026-06-14", title: "🇵🇱 Warsaw Apartment", time: "All day", cal: "Travel", color: "rose" },
  { date: "2026-06-15", title: "🇵🇱 Warsaw Apartment", time: "All day", cal: "Travel", color: "rose" },
  { date: "2026-06-16", title: "🇵🇱 Warsaw Apartment", time: "All day", cal: "Travel", color: "rose" },
];

const CAL_COLORS = {
  blue: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  rose: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  violet: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  emerald: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  amber: "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

// ── GROCERY MAP — ingredients per meal ───────────────────────────────────────
const MEAL_GROCERIES = {
  "Sheet pan chicken thighs + roasted veggies": ["chicken thighs (6-8)", "bell peppers", "zucchini", "red onion", "olive oil", "garlic", "paprika", "Italian seasoning"],
  "Leftover chicken 🍗": [],
  "Pasta e fagioli (big batch)": ["pasta (ditalini or small shells)", "cannellini beans (2 cans)", "crushed tomatoes (1 can)", "chicken broth", "pancetta or bacon", "onion", "celery", "carrots", "garlic", "parmesan rind", "fresh rosemary"],
  "Leftover pasta e fagioli 🫘": [],
  "Salmon + quinoa + cucumber salad": ["salmon fillets (2)", "quinoa", "cucumber", "cherry tomatoes", "lemon", "dill", "olive oil", "feta cheese"],
  "Slow cooker pulled pork tacos": ["pork shoulder (3-4 lbs)", "corn tortillas", "chipotle peppers in adobo", "cumin", "garlic powder", "onion", "lime", "cilantro", "avocado", "shredded cabbage", "sour cream"],
  "Leftover tacos 🌮 + prep for week": [],
};

// Pantry staples always needed
const PANTRY_STAPLES = ["salt & pepper", "olive oil", "garlic", "onions"];
const PACKING_CATEGORIES = ["attire","electronics","misc","toiletries","backpack","makeup"];

const DEFAULT_WEEKLY_GROCERY_LIST = [
  { id: 1, text: "Milk", checked: false },
  { id: 2, text: "Eggs", checked: false },
  { id: 3, text: "Bread", checked: false },
  { id: 4, text: "Bananas", checked: false },
  { id: 5, text: "Coffee", checked: false },
  { id: 6, text: "Chicken", checked: false },
  { id: 7, text: "Spinach", checked: false },
  { id: 8, text: "Yogurt", checked: false },
];

// ── FINANCIAL ────────────────────────────────────────────────────────────────
const GOAL = 4_500_000;
const YEARS = 15;
const RATE = 0.06;
const WEEKLY_RATE = RATE / 52;
const WEEKS = YEARS * 52;
const HSA_BIWEEKLY = 319;

const BUCKETS = [
  { id: "brokerage", label: "My Brokerage", color: "rose", emoji: "📈", freq: "weekly", description: "Personal taxable brokerage" },
  { id: "401k", label: "Husband's 401k", color: "violet", emoji: "🏦", freq: "bi-weekly", description: "Employer-sponsored retirement" },
  { id: "hsa", label: "Family HSA", color: "emerald", emoji: "🏥", freq: "bi-weekly", description: "Health Savings Account (maxing)", defaultTarget: HSA_BIWEEKLY },
];

const BC = {
  rose: { bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-300", bar: "bg-rose-500" },
  violet: { bg: "bg-violet-500/10", border: "border-violet-500/30", text: "text-violet-300", bar: "bg-violet-500" },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-300", bar: "bg-emerald-500" },
};

const STOCKS = [
  {symbol:"FSGGX",name:"Fidelity Global",price:21.03,chg:0.01},{symbol:"FXAIX",name:"Fidelity 500",price:260.83,chg:1.99},
  {symbol:"STZ",name:"Constellation",price:141.33,chg:0.72},{symbol:"POOL",name:"Pool Corp",price:176.33,chg:1.09},
  {symbol:"CAVA",name:"Cava Group",price:76.86,chg:0.77},{symbol:"AAPL",name:"Apple",price:301.31,chg:3.10},
  {symbol:"HIMS",name:"Hims & Hers",price:24.69,chg:0.45},{symbol:"AXON",name:"Axon",price:396.49,chg:8.30},
  {symbol:"AMTM",name:"Amentum",price:22.76,chg:-0.49},{symbol:"AMZN",name:"Amazon",price:261.91,chg:-5.31},
  {symbol:"NI",name:"NiSource",price:46.63,chg:-0.79},{symbol:"QQQ",name:"Invesco QQQ",price:710.44,chg:-9.35},
  {symbol:"GOOGL",name:"Alphabet",price:396.11,chg:-4.96},{symbol:"CVNA",name:"Carvana",price:68.76,chg:-0.77},
  {symbol:"VTI",name:"Vanguard Total",price:363.51,chg:-3.90},{symbol:"VOO",name:"Vanguard S&P",price:680.58,chg:-7.15},
  {symbol:"SPY",name:"State Street",price:740.66,chg:-7.51},{symbol:"GRAB",name:"Grab",price:3.55,chg:-0.03},
  {symbol:"FBGRX",name:"Fidelity Blue Chip",price:306.72,chg:3.55},{symbol:"MU",name:"Micron",price:731.31,chg:-44.70},
  {symbol:"BBAI",name:"BigBear.ai",price:4.16,chg:-0.23},{symbol:"RIVN",name:"Rivian",price:13.80,chg:-0.73},
  {symbol:"AMD",name:"AMD",price:430.88,chg:-18.82},{symbol:"NVDA",name:"Nvidia",price:227.51,chg:-8.23},
  {symbol:"URNM",name:"Sprott Uranium",price:60.33,chg:-2.17},{symbol:"NBIS",name:"Nebius",price:213.84,chg:-7.32},
  {symbol:"SOFI",name:"SoFi",price:15.52,chg:-0.51},{symbol:"BITO",name:"ProShares BTC",price:10.81,chg:-0.32},
  {symbol:"IBIT",name:"iShares BTC",price:44.92,chg:-1.25},
];

const TRIPS = [
  { name:"Poland + Croatia 🇵🇱🇭🇷", dates:"~12th–27th", start:"2026-06-12", end:"2026-06-27", color:"border-rose-500/40 bg-rose-500/10", badge:"bg-rose-500/20 text-rose-300",
    items:[{date:"12",event:"Leave Arizona ✈️"},{date:"13",event:"Arrive Warsaw"},{date:"14",event:"Warsaw City Day"},{date:"15",event:"Travel to Kraków"},{date:"16",event:"Auschwitz ~$100/pp"},{date:"17",event:"Fly to Croatia"},{date:"21",event:"Wedding 💒"},{date:"22",event:"Rest / Bosnia"},{date:"23",event:"Dubrovnik 🏰"},{date:"24",event:"Dubrovnik"},{date:"25",event:"Split (3h)"},{date:"26",event:"Hvar 🏝️"},{date:"27",event:"Fly home"}],
    todos:["Book Auschwitz tickets (~$100/person)","Book Croatia accommodations","Figure out Croatia schedule"],
    packing:["Passport","Travel insurance","Light jacket","Comfortable shoes","Phone charger","Camera","Medications"]},
  { name:"San Diego 🌊", dates:"Memorial Day Weekend", start:"2026-05-22", end:"2026-05-26", color:"border-sky-500/40 bg-sky-500/10", badge:"bg-sky-500/20 text-sky-300",
    items:[{date:"Fri",event:"Travel to San Diego"},{date:"Sat",event:"Beach + explore"},{date:"Sun",event:"Free day"},{date:"Mon",event:"Memorial Day / head home"}],
    todos:["Book hotel / Airbnb","Plan activities"],
    packing:["Sunscreen","Swimsuit","Hat","Sunglasses","Portable charger","Snacks","Beach towel"]},
  { name:"Puerto Peñasco 🌵", dates:"Last Weekend of May", start:"2026-05-30", end:"2026-06-01", color:"border-amber-500/40 bg-amber-500/10", badge:"bg-amber-500/20 text-amber-300",
    items:[{date:"Fri",event:"Drive Rocky Point 🚗 ~4h"},{date:"Sat",event:"Beach + seafood"},{date:"Sun",event:"Relax / drive home"}],
    todos:["Book accommodation","Check passport / tourist card"],
    packing:["Sun hat","Sandals","Swimwear","Snorkel gear","Water bottle","Travel snacks"]},
];

const PREGNANCY_TODOS = ["Schedule anatomy scan","Research pediatricians","Register for childbirth classes","Set up baby registry","Plan nursery layout","Choose hospital / birth center","Discuss maternity leave","Research cord blood banking","Schedule glucose screening (24–28 wks)","Plan baby shower (~28–32 wks)","Tour hospital","Research car seats"].map((t,i)=>({id:i+1,text:t,done:false}));

// Flat baby buy checklist with categories
const BABY_BUY_LIST = [
  {id:1,cat:"🛏️ Sleep",item:"Crib + mattress",bought:false,priority:"high"},
  {id:2,cat:"🛏️ Sleep",item:"Bassinet / bedside sleeper",bought:false,priority:"high"},
  {id:3,cat:"🛏️ Sleep",item:"Video baby monitor",bought:false,priority:"high"},
  {id:4,cat:"🛏️ Sleep",item:"Sleep sacks (newborn + 0-3mo)",bought:false,priority:"high"},
  {id:5,cat:"🛏️ Sleep",item:"White noise machine",bought:false,priority:"med"},
  {id:6,cat:"🍼 Feeding",item:"Breast pump (check insurance — may be free)",bought:false,priority:"high"},
  {id:7,cat:"🍼 Feeding",item:"Nursing bras (x3)",bought:false,priority:"high"},
  {id:8,cat:"🍼 Feeding",item:"Nursing pads",bought:false,priority:"med"},
  {id:9,cat:"🍼 Feeding",item:"Bottles (try 2–3 brands first)",bought:false,priority:"med"},
  {id:10,cat:"🍼 Feeding",item:"Bottle brush + drying rack",bought:false,priority:"med"},
  {id:11,cat:"🍼 Feeding",item:"Nursing pillow (Boppy)",bought:false,priority:"high"},
  {id:12,cat:"🍼 Feeding",item:"Burp cloths (x10+)",bought:false,priority:"high"},
  {id:13,cat:"🍼 Feeding",item:"High chair (buy later)",bought:false,priority:"low"},
  {id:14,cat:"🧷 Diapering",item:"Changing table / pad",bought:false,priority:"high"},
  {id:15,cat:"🧷 Diapering",item:"Diapers — newborn (1 pack)",bought:false,priority:"high"},
  {id:16,cat:"🧷 Diapering",item:"Diapers — size 1 (bulk)",bought:false,priority:"high"},
  {id:17,cat:"🧷 Diapering",item:"Wipes — unscented (bulk)",bought:false,priority:"high"},
  {id:18,cat:"🧷 Diapering",item:"Diaper pail",bought:false,priority:"med"},
  {id:19,cat:"🧷 Diapering",item:"Diaper bag",bought:false,priority:"high"},
  {id:20,cat:"🚗 Gear",item:"Infant car seat (install before due date!)",bought:false,priority:"high"},
  {id:21,cat:"🚗 Gear",item:"Stroller (compatible with car seat)",bought:false,priority:"high"},
  {id:22,cat:"🚗 Gear",item:"Baby carrier / wrap",bought:false,priority:"med"},
  {id:23,cat:"🚗 Gear",item:"Bouncer or swing",bought:false,priority:"med"},
  {id:24,cat:"🚗 Gear",item:"Play mat / gym",bought:false,priority:"med"},
  {id:25,cat:"🛁 Bath & Care",item:"Baby bathtub",bought:false,priority:"high"},
  {id:26,cat:"🛁 Bath & Care",item:"Baby wash + shampoo",bought:false,priority:"med"},
  {id:27,cat:"🛁 Bath & Care",item:"Nail file / clippers",bought:false,priority:"med"},
  {id:28,cat:"🛁 Bath & Care",item:"Rectal thermometer",bought:false,priority:"high"},
  {id:29,cat:"🛁 Bath & Care",item:"Frida NoseFrida",bought:false,priority:"med"},
  {id:30,cat:"🛁 Bath & Care",item:"Baby lotion (unscented)",bought:false,priority:"low"},
  {id:31,cat:"👕 Clothing",item:"Onesies — newborn (x5)",bought:false,priority:"high"},
  {id:32,cat:"👕 Clothing",item:"Onesies — 0-3mo (x8)",bought:false,priority:"high"},
  {id:33,cat:"👕 Clothing",item:"Footed sleepers — NB + 0-3mo",bought:false,priority:"high"},
  {id:34,cat:"👕 Clothing",item:"Hats (newborn x3)",bought:false,priority:"high"},
  {id:35,cat:"👕 Clothing",item:"Mittens (newborn x3)",bought:false,priority:"med"},
  {id:36,cat:"👕 Clothing",item:"Socks (x6)",bought:false,priority:"med"},
  {id:37,cat:"🏥 Health",item:"Pediatrician chosen + first appt booked",bought:false,priority:"high"},
  {id:38,cat:"🏥 Health",item:"Insurance — add baby to plan",bought:false,priority:"high"},
  {id:39,cat:"🏥 Health",item:"Hospital bag packed (by 36 wks)",bought:false,priority:"high"},
];

// Watering frequency → days between watering
const WATER_DAYS = {
  "Daily": 1,
  "Every 2-3 days": 2,
  "Weekly": 7,
  "Every 2 weeks": 14,
  "Monthly": 30,
};

// ── GARDEN PLANT CATALOG ──────────────────────────────────────────────────────
const GARDEN_CATALOG = {
  "🌿 Herbs": [
    {name:"Basil",water:"Every 2-3 days",sun:"Full Sun",notes:"Harvest often to prevent bolting. Loves heat."},
    {name:"Thyme",water:"Weekly",sun:"Full Sun",notes:"Drought tolerant once established."},
    {name:"Rosemary",water:"Weekly",sun:"Full Sun",notes:"Very drought tolerant. Loves AZ heat."},
    {name:"Mint",water:"Every 2-3 days",sun:"Partial Sun",notes:"Grows aggressively — keep in a pot."},
    {name:"Oregano",water:"Weekly",sun:"Full Sun",notes:"Heat tolerant, great for AZ."},
    {name:"Chives",water:"Every 2-3 days",sun:"Full Sun",notes:"Easy to grow, harvest regularly."},
    {name:"Parsley",water:"Every 2-3 days",sun:"Partial Sun",notes:"Prefers cooler weather, bolt-prone in heat."},
    {name:"Cilantro",water:"Every 2-3 days",sun:"Partial Sun",notes:"Plant in fall in AZ. Bolts quickly in heat."},
    {name:"Sage",water:"Weekly",sun:"Full Sun",notes:"Extremely drought tolerant."},
    {name:"Lavender",water:"Weekly",sun:"Full Sun",notes:"Thrives in AZ heat once established."},
    {name:"Lemon Balm",water:"Every 2-3 days",sun:"Partial Sun",notes:"Spreads easily, keep contained."},
    {name:"Dill",water:"Every 2-3 days",sun:"Full Sun",notes:"Plant in fall/spring in AZ."},
    {name:"Tarragon",water:"Weekly",sun:"Full Sun",notes:"French tarragon is most flavorful."},
    {name:"Stevia",water:"Every 2-3 days",sun:"Full Sun",notes:"Natural sweetener, loves AZ sun."},
  ],
  "🍅 Vegetables": [
    {name:"Cherry Tomatoes",water:"Every 2-3 days",sun:"Full Sun",notes:"Most heat tolerant tomato for AZ."},
    {name:"Peppers (Bell)",water:"Every 2-3 days",sun:"Full Sun",notes:"Thrive in AZ heat."},
    {name:"Jalapeños",water:"Every 2-3 days",sun:"Full Sun",notes:"Very heat tolerant."},
    {name:"Zucchini",water:"Every 2-3 days",sun:"Full Sun",notes:"Prolific producer. Plant in spring."},
    {name:"Armenian Cucumber",water:"Every 2-3 days",sun:"Full Sun",notes:"Most heat tolerant cucumber for AZ."},
    {name:"Okra",water:"Every 2-3 days",sun:"Full Sun",notes:"Loves extreme heat. Plant in summer."},
    {name:"Sweet Potatoes",water:"Weekly",sun:"Full Sun",notes:"Great for AZ summer."},
    {name:"Green Beans",water:"Every 2-3 days",sun:"Full Sun",notes:"Plant in spring or fall."},
    {name:"Kale",water:"Every 2-3 days",sun:"Partial Sun",notes:"Cool season only in AZ (Oct–Mar)."},
    {name:"Lettuce",water:"Every 2-3 days",sun:"Partial Sun",notes:"Cool season only. Bolts in heat."},
    {name:"Spinach",water:"Every 2-3 days",sun:"Partial Sun",notes:"Fall through spring in AZ."},
    {name:"Broccoli",water:"Every 2-3 days",sun:"Full Sun",notes:"Fall/winter planting in AZ."},
    {name:"Carrots",water:"Every 2-3 days",sun:"Full Sun",notes:"Fall through spring in AZ."},
    {name:"Radishes",water:"Every 2-3 days",sun:"Full Sun",notes:"Fast growing, cool season."},
    {name:"Eggplant",water:"Every 2-3 days",sun:"Full Sun",notes:"Loves AZ heat."},
  ],
  "🌸 Flowers": [
    {name:"Zinnia",water:"Every 2-3 days",sun:"Full Sun",notes:"Heat loving! Blooms all summer. Easy from seed."},
    {name:"Nasturtium",water:"Every 2-3 days",sun:"Full Sun",notes:"Edible flowers + leaves. Repels pests naturally."},
    {name:"Alyssum",water:"Every 2-3 days",sun:"Full Sun",notes:"Sweet fragrance, great border plant."},
    {name:"Marigold",water:"Every 2-3 days",sun:"Full Sun",notes:"Pest repellent. Plant near veggies."},
    {name:"Sunflower",water:"Weekly",sun:"Full Sun",notes:"Heat tolerant. Great pollinators."},
    {name:"Cosmos",water:"Weekly",sun:"Full Sun",notes:"Drought tolerant once established."},
    {name:"Portulaca",water:"Weekly",sun:"Full Sun",notes:"Thrives in AZ heat and drought."},
    {name:"Vinca",water:"Every 2-3 days",sun:"Full Sun",notes:"Excellent AZ summer annual."},
    {name:"Bougainvillea",water:"Weekly",sun:"Full Sun",notes:"Iconic AZ plant. Drought tolerant when mature."},
    {name:"Desert Marigold",water:"Weekly",sun:"Full Sun",notes:"Native. Extremely heat + drought tolerant."},
    {name:"Black-Eyed Susan",water:"Weekly",sun:"Full Sun",notes:"Drought tolerant perennial."},
    {name:"Gaillardia",water:"Weekly",sun:"Full Sun",notes:"Blanket flower. Heat + drought tolerant."},
    {name:"Pentas",water:"Every 2-3 days",sun:"Full Sun",notes:"Butterfly magnet. Blooms all summer."},
    {name:"Snapdragon",water:"Every 2-3 days",sun:"Full Sun",notes:"Cool season flower. Plant Oct–Feb in AZ."},
    {name:"Pansy",water:"Every 2-3 days",sun:"Partial Sun",notes:"Cool season. Plant fall through spring."},
    {name:"Petunia",water:"Every 2-3 days",sun:"Full Sun",notes:"Colorful, heat tolerant."},
    {name:"Lantana",water:"Weekly",sun:"Full Sun",notes:"Extremely heat tolerant. Butterfly favorite."},
    {name:"Verbena",water:"Every 2-3 days",sun:"Full Sun",notes:"Spreads beautifully, heat tolerant."},
  ],
  "🍋 Fruit": [
    {name:"Lemon Tree",water:"Weekly",sun:"Full Sun",notes:"Thrives in AZ. Water deeply, less often."},
    {name:"Lime Tree",water:"Weekly",sun:"Full Sun",notes:"Love AZ heat. Meyer lemon or Persian lime best."},
    {name:"Fig Tree",water:"Weekly",sun:"Full Sun",notes:"Very heat tolerant once established."},
    {name:"Pomegranate",water:"Weekly",sun:"Full Sun",notes:"Native to similar climate. Very low water needs."},
    {name:"Strawberries",water:"Every 2-3 days",sun:"Full Sun",notes:"Plant Oct–Feb in AZ for spring harvest."},
    {name:"Grape Vine",water:"Weekly",sun:"Full Sun",notes:"Heat tolerant, needs trellis."},
  ],
};

const ZONE9B={January:{plant:["Brassicas","Lettuce/spinach","Onions","Peas/carrots"],harvest:["Winter greens","Root veggies"],maintain:["Protect from frost","Plan spring garden"]},February:{plant:["Cool-season veggies","Tomatoes indoors","Peppers indoors"],harvest:["Winter greens","Carrots"],maintain:["Prune roses","Fertilize citrus"]},March:{plant:["Tomatoes outdoors","Squash, cucumber","Melons"],harvest:["Cool-season greens"],maintain:["Mulch beds","Watch for aphids"]},April:{plant:["Basil, oregano","Sweet potatoes","Okra"],harvest:["Spring greens","Peas"],maintain:["Deep water 2-3x/wk","Shade cloth prep"]},May:{plant:["Heat-tolerant only","Armenian cucumber"],harvest:["Basil 🌿","Thyme 🌿","Early tomatoes"],maintain:["Install shade cloth","Water early morning","Mulch 3-4 inches"]},June:{plant:["Okra only"],harvest:["Tomatoes","Peppers","Basil","Melons"],maintain:["Daily watering","Watch spider mites","Heavy mulch"]},July:{plant:["Fall tomatoes indoors mid-July"],harvest:["Basil, thyme","Peppers","Okra"],maintain:["Watch fungal (monsoon)","Reduce fertilizer"]},August:{plant:["Fall tomatoes outdoors","Beans, squash","Cucumbers"],harvest:["Late tomatoes","Peppers","Basil"],maintain:["Transition shade cloth","Fertilize fall crops"]},September:{plant:["Broccoli, cabbage","Lettuce, spinach","Carrots, beets","Cilantro, dill"],harvest:["Peppers","Fall squash","Last basil"],maintain:["Remove summer plants","Amend soil"]},October:{plant:["All cool-season veggies","Garlic, onions","Wildflower seeds"],harvest:["Fall greens","Root veggies","Herbs"],maintain:["Best planting month!","Reduce watering"]},November:{plant:["Peas, fava beans","Strawberries"],harvest:["Lettuce, spinach","Broccoli","Herbs"],maintain:["Frost protection ready"]},December:{plant:["Hardy greens","Garlic","Onion sets"],harvest:["Winter greens","Citrus 🍊"],maintain:["Cover sensitive plants","Plan next year"]}};

const DAYS=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const ROUTINE={Monday:["6:00 Wake + skincare","6:10 Water plants","6:20 30 min walk","7:00 Breakfast","7:15 Feed starter (2:1:1)","7:25 Read 30 min","8:00 Laundry #1 + clean kitchen","9:00 Work / WFH","5:00 Fold laundry","5:20 Drive to gym","6:00 Gym class","6:45 Drive home","7:00 Dinner w/ husband","8:00 Wind down + skincare","8:30 Read 30 min","9:30 Sleep"],Tuesday:["6:00 Wake + skincare","6:10 Water plants","6:20 30 min walk","7:00 Breakfast + pack up","7:25 Commute (35 min)","9:00 At office","5:20 Drive to gym","6:00 Gym class","6:45 Drive home","7:00 Dinner w/ husband","8:00 Wind down + skincare","8:30 Read 30 min","9:30 Sleep"],Wednesday:["6:00 Wake + skincare","6:10 Water plants","6:20 30 min walk","7:00 Breakfast","7:15 Feed starter (2:1:1)","7:25 Read 30 min","8:00 Laundry #2 + clean master bath","9:00 Work / WFH","5:00 Rest day","6:00 Cook dinner","7:00 Dinner w/ husband","8:00 Wind down + skincare","8:30 Read 30 min","9:30 Sleep"],Thursday:["6:00 Wake + skincare","6:10 Water plants","6:20 30 min walk","7:00 Breakfast","7:15 Feed starter","7:25 Read 30 min","8:00 Laundry #3 + clean guest bath","9:00 Work / WFH","5:00 Fold laundry","5:20 Drive to gym","6:00 Gym class","6:45 Drive home","7:00 Dinner w/ husband","8:00 Wind down + skincare","8:30 Read 30 min","9:30 Sleep"],Friday:["6:00 Wake + skincare","6:10 Water plants","6:20 30 min walk","7:00 Breakfast","7:15 Feed starter","7:25 Read 30 min","8:00 Laundry #4 + vacuum/mop","9:00 Work / WFH + bed/duvet load","5:00 Start colorful load","5:20 Drive to gym","6:00 Gym class","6:45 Drive home","7:00 Dinner w/ husband","8:00 Wind down + skincare","8:30 Read 30 min","9:30 Sleep"],Saturday:["6:00 Wake + skincare","6:10 Water plants","6:20 30 min walk","7:00 Breakfast","7:15 Feed starter","7:25 Read 30 min","8:00 Free time","5:20 Drive to gym","6:00 Gym class","6:30 Fold colorful load","7:00 Dinner w/ husband","8:00 Wind down + skincare","8:30 Read 30 min","9:30 Sleep"],Sunday:["6:00 Wake + skincare","6:10 Water plants","6:20 30 min walk","7:00 Breakfast","7:15 Feed starter","7:25 Read 30 min","8:00 Free time","5:00 Rest day","6:00 Cook dinner","7:00 Dinner w/ husband","8:00 Wind down + skincare","8:30 Read 30 min","9:30 Sleep"]};

const DEFAULT_MEAL_PLAN={
  Monday:{breakfast:{name:"Oatmeal with banana",ingredients:["oatmeal (1/2 cup dry)","banana (1 medium)"]},lunch:{name:"Chicken & quinoa salad",ingredients:["chicken breast (100g)","quinoa (1/2 cup cooked)","spinach (1 cup raw)","bell pepper (1 medium)","olive oil (1 tbsp)"]},dinner:{name:"Sheet pan chicken thighs + roasted veggies",ingredients:["chicken breast (100g)","broccoli (1 cup)","zucchini (1 cup)","olive oil (1 tbsp)"],carries:true}},
  Tuesday:{breakfast:{name:"Eggs on toast",ingredients:["egg (1 large)","egg (1 large)","whole wheat bread (1 slice)","butter (1 tbsp)"]},lunch:{name:"Leftover chicken & quinoa",ingredients:["chicken breast (100g)","quinoa (1/2 cup cooked)"]},dinner:{name:"Salmon + quinoa",ingredients:["salmon (100g)","quinoa (1/2 cup cooked)","spinach (1 cup raw)"]}},
  Wednesday:{breakfast:{name:"Greek yogurt parfait",ingredients:["Greek yogurt (100g)","honey (1 tbsp)","banana (1 medium)"]},lunch:{name:"Pasta e fagioli",ingredients:["pasta (1 cup cooked)","spinach (1 cup raw)","sweet potato (1 medium)"]},dinner:{name:"Pasta e fagioli (big batch)",ingredients:["pasta (1 cup cooked)","spinach (1 cup raw)","sweet potato (1 medium)","olive oil (1 tbsp)"],carries:true}},
  Thursday:{breakfast:{name:"Oatmeal",ingredients:["oatmeal (1/2 cup dry)","apple (1 medium)"]},lunch:{name:"Leftover pasta",ingredients:["pasta (1 cup cooked)","spinach (1 cup raw)"]},dinner:{name:"Leftover pasta e fagioli",ingredients:["pasta (1 cup cooked)","spinach (1 cup raw)","sweet potato (1 medium)"]}},
  Friday:{breakfast:{name:"Toast with peanut butter",ingredients:["whole wheat bread (1 slice)","peanut butter (2 tbsp)","banana (1 medium)"]},lunch:{name:"Tuna wrap",ingredients:["salmon (100g)","bell pepper (1 medium)"]},dinner:{name:"Salmon + cucumber salad",ingredients:["salmon (100g)","spinach (1 cup raw)","olive oil (1 tbsp)"]}},
  Saturday:{breakfast:{name:"Eggs & toast",ingredients:["egg (1 large)","egg (1 large)","whole wheat bread (1 slice)"]},lunch:{name:"Salad with chicken",ingredients:["chicken breast (100g)","spinach (1 cup raw)","apple (1 medium)"]},dinner:{name:"Slow cooker pulled pork tacos",ingredients:["chicken breast (100g)","bell pepper (1 medium)","spinach (1 cup raw)"],carries:true}},
  Sunday:{breakfast:{name:"Oatmeal & berries",ingredients:["oatmeal (1/2 cup dry)","apple (1 medium)"]},lunch:{name:"Leftover from Saturday",ingredients:["chicken breast (100g)"]},dinner:{name:"Prep for week",ingredients:[]}},
};

const SUNLIGHT_OPT=["Full Sun (6+ hrs)","Partial Sun (3-6 hrs)","Indirect Bright","Low Light"];
const WATER_OPT=["Daily","Every 2-3 days","Weekly","Every 2 weeks","Monthly"];

const getPlantCareSummary=(plant)=>{
  if(!plant||!plant.name.trim())return"";
  return `${plant.name} needs ${plant.sunlight.toLowerCase()} and should be watered ${plant.watering.toLowerCase()}.`;
};

const DEFAULT_HABITS=[
  {id:1,label:"💧 Drink 8 glasses water",color:"sky"},
  {id:2,label:"🚶 Morning walk",color:"emerald"},
  {id:3,label:"📖 Read 30 min",color:"amber"},
  {id:4,label:"💊 Prenatal vitamin",color:"pink"},
  {id:5,label:"🧘 5 min breathing",color:"violet"},
  {id:6,label:"💰 Checked finances",color:"rose"},
];

const HABIT_COLORS={sky:"bg-sky-500",emerald:"bg-emerald-500",amber:"bg-amber-500",pink:"bg-pink-500",violet:"bg-violet-500",rose:"bg-rose-500"};
const HABIT_BORDERS={sky:"border-sky-500/40 text-sky-300",emerald:"border-emerald-500/40 text-emerald-300",amber:"border-amber-500/40 text-amber-300",pink:"border-pink-500/40 text-pink-300",violet:"border-violet-500/40 text-violet-300",rose:"border-rose-500/40 text-rose-300"};

// ── NUTRITION DATABASE ────────────────────────────────────────────────────────
const NUTRITION_DB={
  // Proteins
  "chicken breast (100g)":{cal:165,protein:31,sugar:0,sodium:74,fiber:0},
  "salmon (100g)":{cal:206,protein:22,sugar:0,sodium:75,fiber:0},
  "egg (1 large)":{cal:72,protein:6,sugar:0.6,sodium:71,fiber:0},
  "Greek yogurt (100g)":{cal:59,protein:10,sugar:3.3,sodium:75,fiber:0},
  // Grains & Carbs
  "whole wheat bread (1 slice)":{cal:80,protein:4,sugar:1,sodium:170,fiber:3.6},
  "oatmeal (1/2 cup dry)":{cal:150,protein:5,sugar:1,sodium:2,fiber:8},
  "rice (1/2 cup cooked)":{cal:103,protein:2.2,sugar:0,sodium:2,fiber:0.4},
  "pasta (1 cup cooked)":{cal:221,protein:8.1,sugar:1.1,sodium:1,fiber:1.8},
  "quinoa (1/2 cup cooked)":{cal:111,protein:4,sugar:0.2,sodium:8,fiber:1.6},
  // Veggies
  "broccoli (1 cup)":{cal:31,protein:3.7,sugar:2.2,sodium:64,fiber:2.4},
  "spinach (1 cup raw)":{cal:7,protein:0.9,sugar:0.1,sodium:24,fiber:0.7},
  "bell pepper (1 medium)":{cal:30,protein:1,sugar:4.7,sodium:3,fiber:1.7},
  "zucchini (1 cup)":{cal:21,protein:1.5,sugar:3.5,sodium:20,fiber:1.1},
  "sweet potato (1 medium)":{cal:103,protein:2,sugar:4.7,sodium:55,fiber:3.9},
  "banana (1 medium)":{cal:105,protein:1.3,sugar:14.4,sodium:1,fiber:2.6},
  "apple (1 medium)":{cal:95,protein:0.5,sugar:25.1,sodium:2,fiber:4.4},
  // Fats & Oils
  "olive oil (1 tbsp)":{cal:119,protein:0,sugar:0,sodium:0,fiber:0},
  "butter (1 tbsp)":{cal:102,protein:0.1,sugar:0,sodium:91,fiber:0},
  // Sauces & Condiments
  "honey (1 tbsp)":{cal:64,protein:0,sugar:17,sodium:2,fiber:0},
  "peanut butter (2 tbsp)":{cal:188,protein:8,sugar:7,sodium:147,fiber:3.5},
};

const calculateNutrition=(ingredients)=>{
  const totals={cal:0,protein:0,sugar:0,sodium:0,fiber:0};
  ingredients.forEach(ing=>{
    const data=NUTRITION_DB[ing.toLowerCase()]||{cal:0,protein:0,sugar:0,sodium:0,fiber:0};
    totals.cal+=data.cal;totals.protein+=data.protein;totals.sugar+=data.sugar;totals.sodium+=data.sodium;totals.fiber+=data.fiber;
  });
  return totals;
};

const DEFAULT_DATA={
  plants:[{id:1,name:"English Ivy",sunlight:"Indirect Bright",watering:"Weekly",notes:"Keep from direct AZ sun. Watch spider mites.",photo:null,lastWatered:null}],
  gardenPlants:[{id:1,name:"Basil",location:"Patio",notes:"Harvest often to prevent bolting.",photo:null,water:"Every 2-3 days",lastWatered:null},{id:2,name:"Thyme",location:"Patio",notes:"Drought tolerant. Full sun.",photo:null,water:"Weekly",lastWatered:null}],
  pregnancyTodos:PREGNANCY_TODOS,
  babyBuyList:BABY_BUY_LIST,
  tripTodos:TRIPS.map(t=>t.todos.map((text,i)=>({id:i,text,done:false}))),
  tripDates:TRIPS.map(t=>({name:t.name,start:t.start,end:t.end})),
  tripPacking:TRIPS.map((t,ti)=>t.packing.map((item,i)=>({id:`${ti}-${i}`,text:item,checked:false,category:"misc"}))),
  standardPackingList: [],
  routineChecked:{},workouts:[],
  majorTodos:[],
  mealPlan:DEFAULT_MEAL_PLAN,
  groceryList:DEFAULT_WEEKLY_GROCERY_LIST,
  dailyPriorities:{},
  investments:{
    brokerage:{target:2000,contributions:[]},
    "401k":{target:1500,contributions:[]},
    hsa:{target:HSA_BIWEEKLY,contributions:[]},
  },
  netWorth:"",
  financialAssumptions:{returnRate:0.06,years:15,weeklyContribution:1000},
  currentBook:{title:"",author:"",startDate:"",pages:"",notes:""},
  readingLog:[],
  wishlist:[],
  habits:DEFAULT_HABITS,
  habitLog:{},
};

// ── DRIVE ─────────────────────────────────────────────────────────────────────
async function callDriveMCP(msgs){
  const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:4000,system:`Manage Google Drive JSON file "${DRIVE_FILE_NAME}". Return raw JSON when reading, "OK" when writing.`,messages:msgs,mcp_servers:[{type:"url",url:GDRIVE_MCP,name:"gdrive"}]})});
  return r.json();
}
function saveToLocal(data){try{localStorage.setItem(LOCAL_STORAGE_KEY,JSON.stringify(data));return true;}catch{return false;}}
function loadFromLocal(){try{const text=localStorage.getItem(LOCAL_STORAGE_KEY);return text?JSON.parse(text):null;}catch{return null;}}
async function loadFromDrive(){try{const d=await callDriveMCP([{role:"user",content:`Find "${DRIVE_FILE_NAME}" in Google Drive and return its full text as raw JSON. If not found say NOT_FOUND.`}]);const t=d.content.filter(b=>b.type==="text").map(b=>b.text).join("");if(t.includes("NOT_FOUND"))return null;const m=t.match(/\{[\s\S]*\}/);return m?JSON.parse(m[0]):null;}catch{return null;}}
async function saveToDrive(data){try{const j=JSON.stringify({...data,plants:data.plants.map(p=>({...p,photo:null})),gardenPlants:data.gardenPlants.map(p=>({...p,photo:null}))},null,2);await callDriveMCP([{role:"user",content:`Save to "${DRIVE_FILE_NAME}" in Google Drive, overwrite if exists:\n\n${j}`}]);return true;}catch{return false;}}

// ── SYSTEM PROMPTS ────────────────────────────────────────────────────────────
const SP={
  dashboard:`You are a smart daily assistant. User: 30yo, 20wks pregnant, Arizona, married. ME 315 class Mon/Wed/Fri 9:30am. Trips: Poland/Croatia, San Diego Memorial Day, Puerto Peñasco end of May. Goal: $4.5M by 45. Today: ${new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}.`,
  calendar:`You are a scheduling assistant for Daia (daianapartiu@gmail.com). Her real calendar shows: Work recurring Mon–Fri 7am–4pm. San Diego Airbnb booked May 22–27 (1831 Hixson Ave). Warsaw apartment booked June 13–17 (Old Town, Kościelna 7) for her Poland/Croatia trip. Help her schedule events, avoid conflicts, and suggest time blocking around these commitments.`,
  financials:`Finance assistant. User 30yo, goal $4.5M by 45 at 6% return. Buckets: My Brokerage (weekly), Husband's 401k (bi-weekly), Family HSA (bi-weekly, max $8,300/yr=$319 bi-weekly). Portfolio: FSGGX,FXAIX,STZ,POOL,CAVA,AAPL,HIMS,AXON,AMTM,AMZN,NI,QQQ,GOOGL,CVNA,VTI,VOO,SPY,GRAB,FBGRX,MU,BBAI,RIVN,AMD,NVDA,URNM,NBIS,SOFI,BITO,IBIT. Use web search. Not a licensed advisor.`,
  plants:`Houseplant expert for Arizona. User has English Ivy. Help with care, watering, light, troubleshooting.`,
  cooking:`Meal planning assistant. User cooks Wed+Sun (leftovers carry over), sourdough starter Mon+Thu. Help with meal plans, recipes, grocery lists with specific ingredients.`,
  pregnancy:`Pregnancy companion. User is 20 weeks pregnant. Milestones, registry, symptoms. Always suggest consulting healthcare provider.`,
  gardening:`Arizona zone 9b gardening expert. User has basil and thyme on patio. Seasonal advice, planting, pest control.`,
  routine:`Productivity assistant. User: 6am wake, gym Mon/Tue/Thu/Fri/Sat, WFH (office Tues), cooks Wed+Sun, ME 315 Mon/Wed/Fri 9:30am.`,
  reading:`Book recommendation and reading coach. User reads 30 min daily. Help with recs, tracking, discussions.`,
  habits:`Habit coach. User's habits: morning walk, reading, prenatal vitamins, hydration. 20wks pregnant, gym 5x/week.`,
  sidejob:`Side hustle advisor. Client management, pricing, income tracking. Be direct.`,
};
const CP={dashboard:"Ask about today's priorities...",calendar:"Ask about your schedule...",financials:"Ask about investments, portfolio, goal...",plants:"Ask about your English Ivy...",cooking:"Ask for recipes, meal plans, grocery help...",pregnancy:"Ask about week 20, registry...",gardening:"Ask about zone 9b, basil/thyme...",routine:"Ask about your schedule...",reading:"Ask for book recs...",habits:"Ask about building habits...",sidejob:"Ask about clients, pricing..."};

function SaveBadge({status}){const map={saving:["text-amber-400","⟳ Saving…"],saved:["text-emerald-400","✓ Saved"],error:["text-rose-400","✗ Error"]};if(!map[status])return null;const[c,l]=map[status];return<span className={`text-xs ${c}`}>{l}</span>;}

// ── CALENDAR TAB ──────────────────────────────────────────────────────────────
function CalendarTab(){
  const[weekOffset,setWeekOffset]=useState(0);
  const today=new Date();

  const getWeekDates=(off=0)=>{
    const d=new Date();const day=d.getDay();
    const mon=new Date(d);mon.setDate(d.getDate()-(day===0?6:day-1)+(off*7));
    return Array.from({length:7},(_,i)=>{const x=new Date(mon);x.setDate(mon.getDate()+i);return x;});
  };

  const weekDates=getWeekDates(weekOffset);
  const dayNames=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const routineNote={Monday:"🏋️ Gym · Laundry",Tuesday:"🏢 Office · 🏋️ Gym",Wednesday:"Rest · 🍳 Cook",Thursday:"🏋️ Gym · Laundry",Friday:"🏋️ Gym · Laundry",Saturday:"🏋️ Gym · Free",Sunday:"🍳 Cook · Rest"};

  return(
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={()=>setWeekOffset(w=>w-1)} className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-white text-sm transition-colors">← Prev</button>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-200">{weekOffset===0?"This Week":weekOffset===1?"Next Week":weekOffset===-1?"Last Week":`Week of ${weekDates[0].toLocaleDateString("en-US",{month:"short",day:"numeric"})}`}</p>
          <p className="text-xs text-slate-500">{weekDates[0].toLocaleDateString("en-US",{month:"short",day:"numeric"})} – {weekDates[6].toLocaleDateString("en-US",{month:"short",day:"numeric"})}</p>
        </div>
        <button onClick={()=>setWeekOffset(w=>w+1)} className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-white text-sm transition-colors">Next →</button>
      </div>

      <div className="space-y-2">
        {weekDates.map((date,i)=>{
          const isToday=date.toDateString()===today.toDateString();
          const dateStr=date.toISOString().split("T")[0];
          const dayName=DAYS[i];
          const dayEvents=REAL_CALENDAR_EVENTS.filter(e=>e.date===dateStr);
          return(
            <div key={i} className={`rounded-2xl border p-3 ${isToday?"border-rose-500/40 bg-rose-500/8":"border-slate-700/60 bg-slate-900/30"}`}>
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-11 text-center rounded-xl py-1.5 ${isToday?"bg-rose-500 text-white":"bg-slate-800 text-slate-400"}`}>
                  <p className="text-xs font-semibold">{dayNames[i]}</p>
                  <p className="text-lg font-bold leading-none">{date.getDate()}</p>
                </div>
                <div className="flex-1 min-w-0 space-y-1.5 pt-0.5">
                  {dayEvents.map((ev,j)=>(
                    <div key={j} className={`flex items-center gap-2 px-2 py-1 rounded-lg border text-xs ${CAL_COLORS[ev.color]||CAL_COLORS.violet}`}>
                      <span className="font-semibold">{ev.title}</span>
                      <span className="opacity-70">{ev.time}</span>
                    </div>
                  ))}
                  <p className="text-xs text-slate-600">{routineNote[dayName]}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="px-3 py-2 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center gap-2">
        <span className="text-xs text-emerald-500">✓</span>
        <span className="text-xs text-slate-500">Daia's Calendar · daianapartiu@gmail.com</span>
      </div>
    </div>
  );
}

// ── MEALS + GROCERY TAB ─────────────────────────────────────────────────
function MealsTab({mealPlan,groceryList,onMealUpdate,onGroceryUpdate}){
  const [view,setView]=useState("meals");
  const [editDay,setEditDay]=useState(null);
  const [editMealType,setEditMealType]=useState(null);
  const [draftName,setDraftName]=useState("");
  const [draftIngredients,setDraftIngredients]=useState("");
  const [draftIngredientList,setDraftIngredientList]=useState([]);
  const [draftPrepTime,setDraftPrepTime]=useState("");
  const [draftRecipeLink,setDraftRecipeLink]=useState("");
  const [draftNotes,setDraftNotes]=useState("");
  const [repeatTomorrow,setRepeatTomorrow]=useState(false);
  const [newGroceryItem,setNewGroceryItem]=useState("");
  const [importLoading,setImportLoading]=useState(false);
  const [importError,setImportError]=useState("");

  const editIndex = DAYS.indexOf(editDay);
  const nextDay = editIndex >= 0 && editIndex < DAYS.length - 1 ? DAYS[editIndex + 1] : null;

  useEffect(()=>{
    if(editDay && editMealType){
      const meal = mealPlan[editDay]?.[editMealType] || {name:"",ingredients:[],prepTime:"",recipeLink:"",notes:""};
      setDraftName(meal.name||"");
      setDraftIngredientList(meal.ingredients||[]);
      setDraftIngredients("");
      setDraftPrepTime(meal.prepTime||"");
      setDraftRecipeLink(meal.recipeLink||"");
      setDraftNotes(meal.notes||"");
      setRepeatTomorrow(false);
      setImportError("");
    }
  },[editDay,editMealType,mealPlan]);

  const saveMeal=(day,type,name,ingredients,copyNext=false)=>{
    const nextState={
      ...mealPlan,
      [day]:{
        ...mealPlan[day],
        [type]:{name,ingredients,prepTime:draftPrepTime,recipeLink:draftRecipeLink,notes:draftNotes},
      },
    };
    if(copyNext && nextDay){
      nextState[nextDay] = {
        ...mealPlan[nextDay],
        [type]:{name,ingredients,prepTime:draftPrepTime,recipeLink:draftRecipeLink,notes:draftNotes},
      };
    }
    onMealUpdate(nextState);
    setEditDay(null);
    setEditMealType(null);
  };

  const addDraftIngredient=()=>{
    if(!draftIngredients.trim()) return;
    setDraftIngredientList(prev=>[...prev,draftIngredients.trim()]);
    setDraftIngredients("");
  };

  const removeDraftIngredient=ing=>setDraftIngredientList(prev=>prev.filter(i=>i!==ing));

  const importRecipe=async()=>{
    const urlText=draftRecipeLink.trim();
    if(!urlText){setImportError("Paste a valid recipe URL first.");return;}
    let url;
    try{url=new URL(urlText);}catch{setImportError("Please use a valid URL.");return;}
    setImportLoading(true);
    setImportError("");
    try{
      const res=await fetch(url.toString());
      if(!res.ok)throw new Error("Fetch failed");
      const html=await res.text();
      const titleMatch=html.match(/<title>([^<]+)<\/title>/i);
      const name=titleMatch?.[1]?.replace(/[-|•|·].*$/," ").trim();
      const ingredientMatches=Array.from(html.matchAll(/<li[^>]*>([^<]*(?:cup|tbsp|tsp|tablespoon|teaspoon|ounce|oz|grams|g|kg|pinch|slice|clove|can|package)[^<]*)<\/li>/gi)).map(m=>m[1].trim());
      const ingredients = ingredientMatches.length ? [...new Set(ingredientMatches)].slice(0,12) : [];
      const stripped=html.replace(/<script[\s\S]*?<\/script>/gi,"").replace(/<style[\s\S]*?<\/style>/gi,"").replace(/<[^>]+>/g," ");
      const timeMatch=stripped.match(/([0-9]{1,2}\s*(?:minutes|minute|mins|hours|hour|hrs|hr))/i);
      if(name && !draftName.trim()) setDraftName(name);
      if(ingredients.length) setDraftIngredientList(ingredients);
      if(timeMatch) setDraftPrepTime(timeMatch[1]);
      if(!ingredients.length){
        const fallbackMatches=Array.from(stripped.matchAll(/([0-9]+(?:\.\d+)?\s*(?:cups?|tbsp|tablespoons?|tsp|teaspoons?|oz|ounces?|grams?|g|kg|pinch|slice|slices|can|cans|package|packages))/gi)).map(m=>m[0].trim());
        if(fallbackMatches.length) setDraftIngredientList([...new Set(fallbackMatches)].slice(0,12));
      }
      setDraftNotes(`Imported from ${url.hostname}`);
    }catch(err){
      setImportError("Unable to import from that link. You can still save the recipe manually.");
    }finally{setImportLoading(false);}
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-1">
        {[ ["meals","🍽️ Daily Meals"],["grocery","🛒 Grocery List"]].map(([t,l])=>(
          <button key={t} onClick={()=>setView(t)} className={`flex-1 py-2 text-xs rounded-xl border transition-all ${view===t?"bg-amber-500/20 border-amber-500/40 text-amber-300 font-semibold":"border-slate-700 text-slate-500 hover:text-slate-300"}`}>
            {l}
          </button>
        ))}
      </div>

      {view==="meals" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Weekly overview</p>
                <p className="text-xs text-slate-400">See breakfast, lunch, and dinner for every day at a glance.</p>
              </div>
              <span className="text-xs text-slate-500">{DAYS.length} days</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {DAYS.map(day=>{
                const dayMeals=mealPlan[day]||{};
                return (
                  <div key={day} className="rounded-2xl border border-slate-700 bg-slate-800/50 p-3">
                    <p className="text-sm font-semibold text-slate-100 mb-2">{day}</p>
                    <p className="text-xs text-slate-400"><span className="font-semibold text-slate-200">B:</span> {dayMeals.breakfast?.name||"No plan"}</p>
                    <p className="text-xs text-slate-400"><span className="font-semibold text-slate-200">L:</span> {dayMeals.lunch?.name||"No plan"}</p>
                    <p className="text-xs text-slate-400"><span className="font-semibold text-slate-200">D:</span> {dayMeals.dinner?.name||"No plan"}</p>
                  </div>
                );
              })}
            </div>
          </div>
          {DAYS.map(day=>{
            const dayMeals=mealPlan[day]||{};
            const isToday=day===new Date().toLocaleDateString("en-US",{weekday:"long"});
            return (
              <div key={day} className={`rounded-2xl border p-4 ${isToday?"bg-amber-500/10 border-amber-500/30":"bg-slate-800/30 border-slate-700"}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <p className={`text-sm font-bold ${isToday?"text-amber-300":"text-slate-200"}`}>{day}{isToday?" (today)":""}</p>
                  <p className="text-xs text-slate-500">Edit recipes and repeat them for the next day.</p>
                </div>
                {['breakfast','lunch','dinner'].map(mealType=>{
                  const meal=dayMeals[mealType]||{name:'',ingredients:[],prepTime:'',recipeLink:'',notes:''};
                  const nutrition=calculateNutrition(meal.ingredients||[]);
                  const isEditing=editDay===day && editMealType===mealType;
                  return (
                    <div key={mealType} className="mb-3 last:mb-0 border border-slate-700 rounded-xl p-3 bg-slate-900/40">
                      <div className="flex items-center justify-between mb-2 gap-3">
                        <p className="text-xs font-bold uppercase text-slate-400">{mealType}</p>
                        {!isEditing ? (
                          <button onClick={()=>{setEditDay(day); setEditMealType(mealType);}} className="text-xs text-slate-500 hover:text-slate-300">✎ Edit</button>
                        ) : (
                          <button onClick={()=>{setEditDay(null); setEditMealType(null);}} className="text-xs text-slate-500 hover:text-slate-300">✕ Close</button>
                        )}
                      </div>
                      {!isEditing ? (
                        <>
                          <p className="text-sm font-semibold text-slate-100 mb-2">{meal.name || 'No recipe selected'}</p>
                          {meal.prepTime && <p className="text-xs text-slate-500 mb-2">Time: {meal.prepTime}</p>}
                          {meal.recipeLink && <a href={meal.recipeLink} target="_blank" rel="noreferrer" className="text-xs text-amber-300 hover:text-amber-200 underline">Recipe source</a>}
                          <div className="mb-2 text-xs space-y-1">
                            {meal.ingredients?.length > 0 ? meal.ingredients.map((ing,i)=>(
                              <div key={i} className="flex items-center gap-2 text-slate-500"><span>•</span><span>{ing}</span></div>
                            )) : <p className="text-slate-500">No ingredients saved yet.</p>}
                          </div>
                          {meal.notes && <p className="text-xs text-slate-500 italic">{meal.notes}</p>}
                          <div className="border-t border-slate-700 pt-2 mt-2 grid grid-cols-5 gap-1 text-xs text-slate-400">
                            <div><p>Calories</p><p className="font-bold text-amber-300">{Math.round(nutrition.cal)}</p></div>
                            <div><p>Protein</p><p className="font-bold text-rose-300">{nutrition.protein.toFixed(1)}g</p></div>
                            <div><p>Sugar</p><p className="font-bold text-pink-300">{nutrition.sugar.toFixed(1)}g</p></div>
                            <div><p>Sodium</p><p className="font-bold text-sky-300">{Math.round(nutrition.sodium)}mg</p></div>
                            <div><p>Fiber</p><p className="font-bold text-emerald-300">{nutrition.fiber.toFixed(1)}g</p></div>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-xs uppercase tracking-widest text-slate-500">Recipe name</label>
                            <input value={draftName} onChange={e=>setDraftName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-3 py-2 text-sm text-white focus:outline-none" placeholder="Recipe name" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-slate-500">Recipe source link</label>
                            <div className="flex gap-2">
                              <input value={draftRecipeLink} onChange={e=>setDraftRecipeLink(e.target.value)} placeholder="Paste recipe URL…" className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl px-3 py-2 text-sm text-white focus:outline-none" />
                              <button onClick={importRecipe} disabled={importLoading} className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-semibold">{importLoading?"Importing…":"Import"}</button>
                            </div>
                            {importError && <p className="text-xs text-rose-400">{importError}</p>}
                          </div>
                          <div className="grid gap-2 md:grid-cols-2">
                            <div className="space-y-1">
                              <label className="text-xs uppercase tracking-widest text-slate-500">Estimated time</label>
                              <input value={draftPrepTime} onChange={e=>setDraftPrepTime(e.target.value)} placeholder="e.g. 35 minutes" className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-3 py-2 text-sm text-white focus:outline-none" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs uppercase tracking-widest text-slate-500">Add ingredient</label>
                              <div className="flex gap-2">
                                <input value={draftIngredients} onChange={e=>setDraftIngredients(e.target.value)} onKeyDown={e=>e.key=== 'Enter' && addDraftIngredient()} placeholder="Ingredient…" className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl px-3 py-2 text-sm text-white focus:outline-none" />
                                <button onClick={addDraftIngredient} className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-semibold">Add</button>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2 text-xs">
                            {draftIngredientList.length > 0 ? draftIngredientList.map((ing,i)=>(
                              <div key={i} className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700">
                                <span className="text-slate-300">{ing}</span>
                                <button onClick={()=>removeDraftIngredient(ing)} className="text-slate-500 hover:text-rose-400 text-xs">Remove</button>
                              </div>
                            )) : <p className="text-slate-500">No ingredients yet.</p>}
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs uppercase tracking-widest text-slate-500">Notes</label>
                            <textarea value={draftNotes} onChange={e=>setDraftNotes(e.target.value)} rows={3} className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-3 py-2 text-sm text-white focus:outline-none" placeholder="Add quick recipe notes…" />
                          </div>
                          {nextDay && (
                            <label className="flex items-center gap-2 text-xs text-slate-400">
                              <input type="checkbox" checked={repeatTomorrow} onChange={e=>setRepeatTomorrow(e.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-0" />
                              <span>Also copy this meal to {nextDay}</span>
                            </label>
                          )}
                          <div className="flex flex-wrap gap-2">
                            <button onClick={()=>saveMeal(day,mealType,draftName,draftIngredientList,repeatTomorrow)} className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl text-sm font-semibold">Save recipe</button>
                            <button onClick={()=>{setEditDay(null); setEditMealType(null);}} className="px-4 py-2 bg-slate-700 border border-slate-600 text-slate-300 rounded-xl text-sm">Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {view==="grocery" && (
        <div className="space-y-4">
          <button className="w-full py-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-2xl text-sm font-semibold transition-colors">
            ✨ Generate from this week's meals (coming soon)
          </button>

          <div className="flex gap-2">
            <input value={newGroceryItem} onChange={e=>setNewGroceryItem(e.target.value)} placeholder="Add item manually…" className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400/50" />
            <button onClick={()=>{ if (newGroceryItem.trim()) { onGroceryUpdate([...groceryList,{id:Date.now(),text:newGroceryItem.trim(),checked:false,source:'manual'}]); setNewGroceryItem(""); } }} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 rounded-xl text-sm font-bold">+</button>
          </div>

          {groceryList.length > 0 ? (
            <div className="space-y-2">
              {groceryList.map(item=>(
                <div key={item.id} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700 bg-slate-800/30 group">
                  <button onClick={()=>onGroceryUpdate(groceryList.map(i=>i.id===item.id?{...i,checked:!i.checked}:i))} className={`w-4 h-4 rounded ${item.checked?"bg-emerald-500 border-emerald-500":"border-2 border-slate-600 hover:border-slate-400"}`} />
                  <span className={`flex-1 text-sm ${item.checked?"text-slate-500 line-through":"text-slate-300"}`}>{item.text}</span>
                  <button onClick={()=>onGroceryUpdate(groceryList.filter(i=>i.id!==item.id))} className="opacity-0 group-hover:opacity-100 text-slate-700 hover:text-rose-400 text-lg">×</button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-700 italic px-1">Start your weekly grocery list by adding items above.</p>
          )}

          <div className="px-3 py-2 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <p className="text-xs text-slate-500">🧂 Pantry staples: {PANTRY_STAPLES.join(", ")}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function GroceryTab({groceryList,onUpdate}){
  const [newItem, setNewItem] = useState("");
  const addItem = () => {
    if (!newItem.trim()) return;
    onUpdate([...groceryList, { id: Date.now(), text: newItem.trim(), checked: false }]);
    setNewItem("");
  };

  return (
    <div className="space-y-5">
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
        <p className="text-sm font-semibold text-amber-200">Weekly grocery list</p>
        <p className="text-xs text-slate-400 mt-1">Add your standard weekly items, check them off, or remove them as you shop.</p>
      </div>
      <div className="flex gap-2">
        <input value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && addItem()} placeholder="Add grocery item…" className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none" />
        <button onClick={addItem} className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl text-sm font-semibold">Add</button>
      </div>
      {groceryList.length > 0 ? (
        <div className="space-y-2">
          {groceryList.map(item => (
            <div key={item.id} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700 bg-slate-800/30 group">
              <button onClick={() => onUpdate(groceryList.map(i => i.id === item.id ? { ...i, checked: !i.checked } : i))} className={`w-4 h-4 rounded ${item.checked ? "bg-emerald-500 border-emerald-500" : "border-2 border-slate-600 hover:border-slate-400"}`} />
              <span className={`flex-1 text-sm ${item.checked ? "text-slate-500 line-through" : "text-slate-300"}`}>{item.text}</span>
              <button onClick={() => onUpdate(groceryList.filter(i => i.id !== item.id))} className="opacity-0 group-hover:opacity-100 text-slate-700 hover:text-rose-400 text-lg">×</button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-700 italic px-1">Start your weekly grocery list by adding items above.</p>
      )}
      <div className="px-3 py-2 rounded-xl bg-slate-800/40 border border-slate-700/40">
        <p className="text-xs text-slate-500">🧂 Pantry staples: {PANTRY_STAPLES.join(", ")}</p>
      </div>
    </div>
  );
}

// ── DASHBOARD// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function DashboardTab({appData,onUpdate}){
  const today=new Date();
  const dayName=today.toLocaleDateString("en-US",{weekday:"long"});
  const dateStr=today.toLocaleDateString("en-US",{month:"long",day:"numeric"});
  const todayKey=today.toISOString().split("T")[0];
  const priorities=appData.dailyPriorities[todayKey]||["","",""];
  const meal=appData.mealPlan[dayName];
  const todayEvents=REAL_CALENDAR_EVENTS.filter(e=>e.date===todayKey);
  const[aiLoad,setAiLoad]=useState(false);
  const[sugg,setSugg]=useState(null);
  const[newMajorTask,setNewMajorTask]=useState("");

  const homeTodos=appData.majorTodos||[];
  const routineTasks=(ROUTINE[dayName]||[]).map((task,idx)=>{const [time,...rest]=task.split(" ");return({id:`routine-${idx}`,idx,text:rest.join(" "),time,dueDate:dateStr,done:appData.routineChecked?.[`${todayKey}-${idx}`]||false,key:`${todayKey}-${idx}`});});
  const routineGroups={Morning:[],Afternoon:[],Evening:[]};
  routineTasks.forEach(item=>{const hour=parseInt(item.time.split(":")[0],10);const bucket=hour<12?"Morning":hour<17?"Afternoon":"Evening";routineGroups[bucket].push(item);});
  const hasRoutine=routineTasks.length>0;
  const tabTodos=[
    ...(appData.pregnancyTodos||[]).map((t,i)=>({id:t.id,text:t.text,done:t.done,source:"Baby",kind:"pregnancy",index:i})),
    ...(appData.tripTodos||[]).flatMap((trip,ti)=>((trip||[]).map(t=>({id:t.id,text:t.text,done:t.done,source:appData.tripDates?.[ti]?.name||`Trip ${ti+1}`,kind:"trip",tripIndex:ti,itemId:t.id}))))
  ];

  const priorityLabels={high:"High",med:"Medium",low:"Low"};
  const priorityClasses={high:"bg-rose-500/20 border border-rose-500/30 text-rose-300",med:"bg-amber-500/20 border border-amber-500/30 text-amber-300",low:"bg-slate-700/20 border border-slate-600 text-slate-400"};
  const sourceClasses={home:"bg-rose-500/10 border border-rose-500/20 text-rose-200",pregnancy:"bg-emerald-500/10 border border-emerald-500/20 text-emerald-200",trip:"bg-slate-700/10 border border-slate-600 text-slate-400"};

  const savePri=p=>onUpdate("dailyPriorities",{...appData.dailyPriorities,[todayKey]:p});

  const toggleRoutine=idx=>{const key=`${todayKey}-${idx}`;onUpdate("routineChecked",{...appData.routineChecked,[key]:!appData.routineChecked?.[key]});};
  const toggleTodo=item=>{
    if(item.kind==="pregnancy")return onUpdate("pregnancyTodos",(appData.pregnancyTodos||[]).map((t,i)=>i===item.index?{...t,done:!t.done}:t));
    if(item.kind==="trip")return onUpdate("tripTodos",(appData.tripTodos||[]).map((arr,i)=>i===item.tripIndex?arr.map(t=>t.id===item.itemId?{...t,done:!t.done}:t):arr));
    if(item.kind==="home")return onUpdate("majorTodos",homeTodos.map(t=>t.id===item.id?{...t,done:!t.done}:t));
  };

  const addMajorTodo=()=>{
    const text=newMajorTask.trim();
    if(!text)return;
    onUpdate("majorTodos",[...homeTodos,{id:Date.now(),text,done:false,priority:"med"}]);
    setNewMajorTask("");
  };

  const removeMajorTodo=id=>onUpdate("majorTodos",homeTodos.filter(t=>t.id!==id));
  const updateMajorTodo=(id,next)=>onUpdate("majorTodos",homeTodos.map(t=>t.id===id?next(t):t));
  const moveMajorTodo=(index,dir)=>{
    const updated=[...homeTodos];
    const [item]=updated.splice(index,1);
    updated.splice(index+dir,0,item);
    onUpdate("majorTodos",updated);
  };

  const getSugg=async()=>{
    setAiLoad(true);
    const pt=(appData.tripTodos||[]).flat().filter(t=>!t.done).slice(0,3).map(t=>t.text).join(", ");
    const pp=(appData.pregnancyTodos||[]).filter(t=>!t.done).slice(0,2).map(t=>t.text).join(", ");
    const hasME=["Monday","Wednesday","Friday"].includes(dayName);
    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:300,
        system:"Generate exactly 3 specific actionable daily priorities. Return ONLY a JSON array of 3 strings. No markdown.",
        messages:[{role:"user",content:`Today: ${dayName} ${dateStr}. 20wks pregnant, AZ, 30yo. ${hasME?"ME 315 class 9:30am.":""} Travel pending: ${pt||"none"}. Pregnancy pending: ${pp||"none"}. May gardening: harvest basil often. Financial: log weekly investment. SD trip Memorial Day soon. 3 priorities as JSON array.`}]})});
      const d=await r.json();const txt=d.content.filter(b=>b.type==="text").map(b=>b.text).join("");
      const m=txt.match(/\[[\s\S]*?\]/);if(m)setSugg(JSON.parse(m[0]));
    }catch{}setAiLoad(false);
  };

  return(
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-rose-900/30 to-slate-900/30 border border-rose-800/30 rounded-2xl px-5 py-4">
        <p className="text-xs text-slate-500 uppercase tracking-widest">{dayName}</p>
        <p className="text-2xl font-bold text-white">{dateStr}</p>
        <div className="flex gap-2 mt-2 flex-wrap">
          <span className="text-xs bg-pink-500/20 text-pink-300 border border-pink-500/30 px-2 py-0.5 rounded-full">Week 20 🤰</span>
          {todayEvents.map((e,i)=><span key={i} className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">{e.title} {e.time}</span>)}
        </div>
      </div>

      <div className="bg-amber-900/20 border border-amber-700/30 rounded-2xl px-4 py-3">
        <p className="text-xs text-amber-400/70 uppercase tracking-widest mb-1">🍽️ Tonight's Dinner</p>
        <p className="text-sm font-semibold text-amber-100">{meal?.meal||"No meal planned"}</p>
        {meal?.note&&<p className="text-xs text-amber-300/60 mt-0.5">{meal.note}</p>}
      </div>

      {hasRoutine && (
        <div className="space-y-4 rounded-2xl border border-slate-700 bg-slate-900/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Today's routine to-dos</h3>
              <p className="text-xs text-slate-400">Grouped by when they need to be completed today.</p>
            </div>
            <span className="text-xs text-slate-500">{routineTasks.length} items</span>
          </div>
          {Object.entries(routineGroups).map(([bucket,items])=>items.length>0&&(
            <div key={bucket} className="space-y-2">
              <p className="text-xs uppercase tracking-widest text-slate-500">{bucket}</p>
              <div className="space-y-2">
                {items.map(item=> (
                  <button key={item.key} onClick={()=>toggleRoutine(item.idx)} className={`w-full text-left rounded-2xl border px-3 py-3 flex items-start gap-3 ${item.done?"border-slate-800 bg-slate-900/50 opacity-70":"border-slate-700/60 bg-slate-800/30 hover:border-slate-500"}`}>
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${item.done?"bg-emerald-500 border-emerald-500":"border-slate-500"}`}>
                      {item.done&&<svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${item.done?"line-through text-slate-500":"text-slate-200"}`}>{item.text}</p>
                      <p className="text-xs text-slate-500 mt-1">Due {item.dueDate} · {item.time}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Home major to-dos</h3>
            <p className="text-xs text-slate-400">Add major tasks, mark them done, and reorder what matters most.</p>
          </div>
          <span className="text-xs text-slate-500">{homeTodos.length} items</span>
        </div>
        <div className="flex gap-2">
          <input value={newMajorTask} onChange={e=>setNewMajorTask(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addMajorTodo()} placeholder="Add a major task…" className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none" />
          <button onClick={addMajorTodo} className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 rounded-xl text-sm font-semibold">Add</button>
        </div>
        {homeTodos.length>0 ? (
          <div className="space-y-2">
            {homeTodos.map((task,idx)=>(
              <div key={task.id} className="rounded-2xl border border-slate-700 bg-slate-900/40 p-4">
                <div className="flex items-start gap-3">
                  <button onClick={()=>toggleTodo({...task,kind:"home"})} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${task.done?"bg-emerald-500 border-emerald-500":"border-slate-500"}`}>
                    {task.done&&<svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${task.done?"line-through text-slate-500":"text-slate-200"}`}>{task.text}</p>
                    <div className="flex flex-wrap gap-2 mt-3 items-center">
                      <span className={`${priorityClasses[task.priority]} px-2 py-0.5 rounded-full text-[11px]`}>{priorityLabels[task.priority]}</span>
                      <select value={task.priority} onChange={e=>updateMajorTodo(task.id,t=>({...t,priority:e.target.value}))} className="bg-slate-800 border border-slate-700 rounded-xl px-2 py-1 text-xs text-slate-200 focus:outline-none">
                        {Object.entries(priorityLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 text-slate-400 text-xs">
                    <button onClick={()=>moveMajorTodo(idx,-1)} disabled={idx===0} className="px-2 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30">↑</button>
                    <button onClick={()=>moveMajorTodo(idx,1)} disabled={idx===homeTodos.length-1} className="px-2 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30">↓</button>
                  </div>
                  <button onClick={()=>removeMajorTodo(task.id)} className="text-rose-400 text-sm">Remove</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No home major tasks yet.</p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold">All tab to-dos</h3>
            <p className="text-xs text-slate-400">See checklist items from Baby and Travels in one place.</p>
          </div>
          <span className="text-xs text-slate-500">{tabTodos.length} items</span>
        </div>
        {tabTodos.length>0 ? (
          <div className="space-y-2">
            {tabTodos.map((item)=>{
              const badgeClass=sourceClasses[item.kind]||sourceClasses.trip;
              return(
                <button key={`${item.kind}-${item.id}-${item.source}`} onClick={()=>toggleTodo(item)} className={`w-full text-left rounded-2xl border px-3 py-3 flex items-start gap-3 ${item.done?"border-slate-800 bg-slate-900/50 opacity-70":"border-slate-700/60 bg-slate-800/30 hover:border-slate-500"}`}>
                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${item.done?"bg-emerald-500 border-emerald-500":"border-slate-500"}`}>
                    {item.done&&<svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${item.done?"line-through text-slate-500":"text-slate-200"}`}>{item.text}</p>
                    <div className="mt-2 flex flex-wrap gap-2 items-center text-[11px] font-semibold">
                      <span className={`${badgeClass} px-2 py-0.5 rounded-full`}>{item.source}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No tasks coming in from tabs yet.</p>
        )}
      </div>

      {/* Top 3 Priorities — NO habits badge */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Top 3 Priorities</h3>
          <button onClick={getSugg} disabled={aiLoad} className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 disabled:opacity-50 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-medium flex items-center gap-1.5">
            <span style={aiLoad?{animation:"spin 0.8s linear infinite",display:"inline-block"}:{}}>{aiLoad?"⟳":"✨"}</span>
            {aiLoad?"…":"AI Suggest"}
          </button>
        </div>
        {sugg&&(
          <div className="mb-3 bg-slate-800/60 border border-rose-500/20 rounded-2xl p-3 space-y-2">
            <p className="text-xs text-slate-500">Tap a suggestion to fill a slot ↓</p>
            {sugg.map((s,si)=>(
              <div key={si} className="bg-slate-700/40 rounded-xl p-2">
                <p className="text-xs text-slate-200 mb-1.5">{s}</p>
                <div className="flex gap-1">{[0,1,2].map(slot=><button key={slot} onClick={()=>{const p=[...priorities];p[slot]=s;savePri(p);setSugg(null);}} className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 rounded-lg text-xs">Slot {slot+1}</button>)}</div>
              </div>
            ))}
            <button onClick={()=>setSugg(null)} className="text-xs text-slate-600 hover:text-slate-400">Dismiss</button>
          </div>
        )}
        <div className="space-y-2.5">
          {[0,1,2].map(i=>(
            <div key={i} className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-center flex-shrink-0">{i+1}</span>
              <input value={priorities[i]||""} onChange={e=>{const p=[...priorities];p[i]=e.target.value;savePri(p);}} placeholder={`Priority ${i+1}…`}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-400/50"/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── FINANCIALS ────────────────────────────────────────────────────────────────
function FinancialsTab({investments,netWorth,assumptions,onUpdate,onUpdateField}){
  const [netWorthInput, setNetWorthInput] = useState(netWorth || "");
  const [returnRateInput, setReturnRateInput] = useState(((assumptions?.returnRate || RATE) * 100).toString());
  const [yearsInput, setYearsInput] = useState((assumptions?.years || YEARS).toString());
  const [weeklyInput, setWeeklyInput] = useState(((assumptions?.weeklyContribution || 0)).toString());

  useEffect(() => { setNetWorthInput(netWorth || ""); }, [netWorth]);
  useEffect(() => {
    setReturnRateInput(((assumptions?.returnRate || RATE) * 100).toString());
    setYearsInput((assumptions?.years || YEARS).toString());
    setWeeklyInput(((assumptions?.weeklyContribution || 0)).toString());
  }, [assumptions]);

  const totalNetWorth = parseFloat((netWorth || "").toString().replace(/,/g, "")) || 0;
  const assumedRate = parseFloat(returnRateInput) / 100;
  const years = Math.max(1, parseInt(yearsInput) || YEARS);
  const weeklyContribution = Math.max(0, parseFloat(weeklyInput) || 0);
  const contributionAnnual = Math.round(weeklyContribution * 52);
  const weeks = years * 52;
  const weeklyRate = assumedRate / 52;

  const projectedValue = (() => {
    const currentFV = totalNetWorth * Math.pow(1 + weeklyRate, weeks);
    const contributionsFV = weeklyRate > 0
      ? weeklyContribution * (Math.pow(1 + weeklyRate, weeks) - 1) / weeklyRate
      : weeklyContribution * weeks;
    return Math.round(currentFV + contributionsFV);
  })();

  const yearlyProjections = Array.from({ length: years + 1 }, (_, year) => {
    const yearWeeks = year * 52;
    const value = totalNetWorth * Math.pow(1 + weeklyRate, yearWeeks) + (weeklyRate > 0
      ? weeklyContribution * (Math.pow(1 + weeklyRate, yearWeeks) - 1) / weeklyRate
      : weeklyContribution * yearWeeks);
    return { year, value: Math.round(value) };
  });

  const pctToGoal = Math.min((projectedValue / GOAL) * 100, 100);

  const saveSettings = () => {
    onUpdateField("netWorth", netWorthInput);
    const rate = isNaN(assumedRate) ? assumptions.returnRate : assumedRate;
    const weekly = weeklyContribution;
    onUpdateField("financialAssumptions", { ...assumptions, returnRate: rate, years, weeklyContribution: weekly });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
          <p className="text-xs uppercase tracking-widest text-slate-500">Current net worth</p>
          <p className="text-3xl font-bold text-emerald-300 mt-2">${totalNetWorth.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-2">Enter what you have today. This is the starting point for the projection.</p>
        </div>
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
          <p className="text-xs uppercase tracking-widest text-slate-500">Weekly savings plan</p>
          <p className="text-3xl font-bold text-rose-300 mt-2">${weeklyContribution.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-2">${contributionAnnual.toLocaleString()} per year at current weekly savings.</p>
        </div>
      </div>

      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-slate-500">Current net worth</p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input value={netWorthInput} onChange={e => setNetWorthInput(e.target.value)} type="number" placeholder="e.g. 150000" className="w-full bg-slate-900 border border-slate-700 rounded-2xl pl-9 pr-4 py-3 text-lg text-white placeholder-slate-600 focus:outline-none" />
            </div>
          </div>
          <div className="grid gap-3">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest text-slate-500">Annual return</p>
              <div className="relative">
                <input value={returnRateInput} onChange={e => setReturnRateInput(e.target.value)} type="number" placeholder="6" className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-3 py-3 text-lg text-white placeholder-slate-600 focus:outline-none" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">%</span>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-slate-500">Horizon</p>
                <input value={yearsInput} onChange={e => setYearsInput(e.target.value)} type="number" placeholder="15" className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-3 py-3 text-lg text-white placeholder-slate-600 focus:outline-none" />
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-slate-500">Weekly contribution</p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input value={weeklyInput} onChange={e => setWeeklyInput(e.target.value)} type="number" placeholder="500" className="w-full bg-slate-900 border border-slate-700 rounded-2xl pl-9 pr-4 py-3 text-lg text-white placeholder-slate-600 focus:outline-none" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <button onClick={saveSettings} className="w-full py-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-2xl text-sm font-semibold transition-colors">Save assumptions</button>
      </div>

      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500">Projected value in {years} years</p>
            <p className="text-4xl font-bold text-white">${projectedValue.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Goal progress</p>
            <p className="text-xl font-bold text-emerald-300">{pctToGoal.toFixed(1)}%</p>
          </div>
        </div>
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-3 rounded-full bg-emerald-500 transition-all" style={{width:`${pctToGoal}%`}}/>
        </div>
        <p className="text-xs text-slate-500">This assumes ${weeklyContribution.toLocaleString()} saved each week with {(assumedRate*100).toFixed(1)}% annual growth.</p>
      </div>

      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-widest text-slate-500">Year-by-year projection</p>
          <p className="text-xs text-slate-500">{years + 1} points</p>
        </div>
        <div className="space-y-3">
          {yearlyProjections.map((item, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Year {item.year}</span>
                <span>${item.value.toLocaleString()}</span>
              </div>
              <div className="h-3 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-3 bg-emerald-500" style={{width:`${Math.min((item.value / GOAL) * 100, 100)}%`}}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── PLANTS TAB — watering schedule + garden ───────────────────────────────────────────
function PlantsTab({data,gardenData,onUpdate,onGardenUpdate}){
  const [tab,setTab] = useState("houseplants");
  const [view,setView] = useState("schedule");
  const [show,setShow] = useState(false);
  const [showGardenAdd,setShowGardenAdd] = useState(false);
  const [np,setNp] = useState({name:"",sunlight:"Indirect Bright",watering:"Weekly",notes:"",photo:null,lastWatered:null});
  const [gp,setGp] = useState({name:"",location:"Patio",water:"Weekly",notes:"",photo:null,lastWatered:null});
  const [search,setSearch] = useState("");
  const today=new Date();
  const getDaysUntil=(plant)=>{const freq=WATER_DAYS[plant.watering]||7;if(!plant.lastWatered)return 0;const last=new Date(plant.lastWatered);const next=new Date(last.getTime()+freq*86400000);return Math.ceil((next-today)/86400000);};
  const markWatered=(id)=>onUpdate(data.map(p=>p.id===id?{...p,lastWatered:today.toISOString().split("T")[0]}:p));
  const add=()=>{if(!np.name.trim())return;onUpdate([...data,{...np,id:Date.now()}]);setNp({name:"",sunlight:"Indirect Bright",watering:"Weekly",notes:"",photo:null,lastWatered:null});setShow(false);};
  const addGarden=()=>{if(!gp.name.trim())return;onGardenUpdate([...gardenData,{...gp,id:Date.now()}]);setGp({name:"",location:"Patio",water:"Weekly",notes:"",photo:null,lastWatered:null});setShowGardenAdd(false);};
  const catalogPlants=Object.entries(GARDEN_CATALOG).flatMap(([cat,plants])=>plants.map(p=>({...p,cat})));
  const filtered=catalogPlants.filter(p=>(p.name.toLowerCase().includes(search.toLowerCase())||p.cat.toLowerCase().includes(search.toLowerCase())));
  const isInGarden=(name)=>gardenData.some(p=>p.name===name);
  const addFromCatalog=(p)=>{if(isInGarden(p.name))return;onGardenUpdate([...gardenData,{id:Date.now(),name:p.name,location:"Patio",notes:p.notes,photo:null,water:p.water,lastWatered:null}]);};
  const sorted=[...data].sort((a,b)=>getDaysUntil(a)-getDaysUntil(b));
  const needsWater=sorted.filter(p=>getDaysUntil(p)<=0);
  const upcoming=sorted.filter(p=>getDaysUntil(p)>0);

  return(
    <div className="space-y-5">
      <div className="flex gap-1">
        {[['houseplants','💧 Houseplants'],['garden','🌱 Garden']].map(([t,l])=><button key={t} onClick={()=>setTab(t)} className={`flex-1 py-2 text-xs rounded-xl border transition-all ${tab===t?"bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-semibold":"border-slate-700 text-slate-500 hover:text-slate-300"}`}>{l}</button>)}
      </div>

      {tab==="houseplants"&&(
        <>
          <div className="flex gap-1">{[['schedule','💧 Schedule'],['list','🌿 All Plants']].map(([t,l])=><button key={t} onClick={()=>setView(t)} className={`flex-1 py-2 text-xs rounded-xl border transition-all ${view===t?"bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-semibold":"border-slate-700 text-slate-500 hover:text-slate-300"}`}>{l}</button>)}</div>
          {view==="schedule"&&(<div className="space-y-4">
            {data.length===0&&<p className="text-xs text-slate-700 italic px-1">Add plants to see your watering schedule.</p>}
            {needsWater.length>0&&(<div><div className="flex items-center gap-2 mb-2"><div className="w-2 h-2 rounded-full bg-rose-400" style={{animation:"pulse 2s infinite"}}/><h3 className="text-xs uppercase tracking-widest text-rose-400 font-semibold">Water Now ({needsWater.length})</h3></div><div className="space-y-2">{needsWater.map(p=>{const days=getDaysUntil(p);return(<div key={p.id} className="flex items-center gap-3 px-3 py-3 rounded-xl border border-rose-700/50 bg-rose-900/15">{p.photo?<img src={p.photo} alt={p.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0"/>:<div className="w-10 h-10 rounded-xl bg-rose-900/40 flex items-center justify-center text-lg flex-shrink-0">🌿</div>}<div className="flex-1 min-w-0"><p className="text-sm font-semibold text-slate-100">{p.name}</p><p className="text-xs text-rose-400">{days===0?"Due today":`${Math.abs(days)} day${Math.abs(days)!==1?"s":""} overdue`} · {p.watering}</p></div><button onClick={()=>markWatered(p.id)} className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-semibold flex-shrink-0">💧 Done</button></div>);})}</div></div>)}
            {upcoming.length>0&&(<div><h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-2">Coming Up</h3><div className="space-y-2">{upcoming.map(p=>{const days=getDaysUntil(p);const urgency=days<=2?"text-amber-400":days<=5?"text-sky-400":"text-slate-500";return(<div key={p.id} className="flex items-center gap-3 px-3 py-3 rounded-xl border border-slate-700 bg-slate-800/30">{p.photo?<img src={p.photo} alt={p.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0"/>:<div className="w-10 h-10 rounded-xl bg-emerald-900/40 flex items-center justify-center text-lg flex-shrink-0">🌿</div>}<div className="flex-1 min-w-0"><p className="text-sm font-semibold text-slate-100">{p.name}</p><p className={`text-xs ${urgency}`}>Water in {days} day{days!==1?"s":""} · {p.watering}</p><p className="text-xs text-slate-600">{p.sunlight}</p></div><button onClick={()=>markWatered(p.id)} className="px-2 py-1 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-400 rounded-lg text-xs flex-shrink-0">💧</button></div>);})}</div></div>)}
          </div>)}
          {view==="list"&&(<div className="space-y-3">
            <div className="flex items-center justify-between"><h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold">My Houseplants ({data.length})</h3><button onClick={()=>setShow(!show)} className="px-3 py-1.5 bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-700/40 text-emerald-400 rounded-xl text-xs font-medium">+ Add</button></div>
            {show&&(<div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 space-y-3"><input value={np.name} onChange={e=>setNp(p=>({...p,name:e.target.value}))} placeholder="Plant name…" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none"/><div className="grid grid-cols-2 gap-2"><select value={np.sunlight} onChange={e=>setNp(p=>({...p,sunlight:e.target.value}))} className="bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-xs text-slate-200 focus:outline-none">{SUNLIGHT_OPT.map(o=><option key={o}>{o}</option>)}</select><select value={np.watering} onChange={e=>setNp(p=>({...p,watering:e.target.value}))} className="bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-xs text-slate-200 focus:outline-none">{WATER_OPT.map(o=><option key={o}>{o}</option>)}</select></div><p className="text-xs text-slate-400">{getPlantCareSummary(np)}</p><textarea value={np.notes} onChange={e=>setNp(p=>({...p,notes:e.target.value}))} placeholder="Notes…" rows={2} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none resize-none"/><div className="flex gap-2"><button onClick={add} className="flex-1 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-xl text-sm font-semibold">Add</button><button onClick={()=>setShow(false)} className="px-4 py-2 bg-slate-700 border border-slate-600 text-slate-300 rounded-xl text-sm">Cancel</button></div></div>)}
            <div className="space-y-2">{data.map(p=><div key={p.id} className="border border-slate-700 rounded-xl overflow-hidden bg-slate-900/40 p-3 flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-emerald-900/40 flex items-center justify-center text-lg flex-shrink-0">{p.photo?<img src={p.photo} alt={p.name} className="w-10 h-10 rounded-xl object-cover"/>:"🌿"}</div><div className="flex-1 min-w-0"><p className="text-sm font-semibold text-slate-100">{p.name}</p><p className="text-xs text-slate-500">{p.sunlight} · {p.watering}</p></div><button onClick={()=>onUpdate(data.filter(x=>x.id!==p.id))} className="text-slate-700 hover:text-rose-400 text-lg leading-none">×</button></div>)}</div>
            {data.length===0&&<p className="text-xs text-slate-700 italic px-1">No houseplants yet</p>}
          </div>)}
        </>
      )}

      {tab==="garden"&&(
        <div className="space-y-5">
          <div className="bg-lime-500/10 border border-lime-500/30 rounded-2xl p-4">
            <div className="flex items-center gap-3"><span className="text-2xl">🌱</span><div><p className="text-sm font-semibold text-lime-200">Garden planner</p><p className="text-xs text-slate-400">Track your patio garden and add helpful plants from the catalog.</p></div></div>
          </div>
          <div className="flex items-center justify-between gap-2"><h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold">My Garden ({gardenData.length})</h3><button onClick={()=>setShowGardenAdd(!showGardenAdd)} className="px-3 py-1.5 bg-lime-900/30 hover:bg-lime-900/50 border border-lime-700/40 text-lime-400 rounded-xl text-xs font-medium">+ Add plant</button></div>
          {showGardenAdd&&(<div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 space-y-3"><input value={gp.name} onChange={e=>setGp(x=>({...x,name:e.target.value}))} placeholder="Plant name…" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none"/><div className="grid grid-cols-2 gap-2"><input value={gp.location} onChange={e=>setGp(x=>({...x,location:e.target.value}))} placeholder="Location" className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"/><select value={gp.water} onChange={e=>setGp(x=>({...x,water:e.target.value}))} className="bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-xs text-slate-200 focus:outline-none">{WATER_OPT.map(o=><option key={o}>{o}</option>)}</select></div><textarea value={gp.notes} onChange={e=>setGp(x=>({...x,notes:e.target.value}))} placeholder="Notes…" rows={2} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none resize-none"/><div className="flex gap-2"><button onClick={addGarden} className="flex-1 py-2 bg-lime-500/20 hover:bg-lime-500/30 border border-lime-500/40 text-lime-300 rounded-xl text-sm font-semibold">Add</button><button onClick={()=>setShowGardenAdd(false)} className="px-4 py-2 bg-slate-700 border border-slate-600 text-slate-300 rounded-xl text-sm">Cancel</button></div></div>)}
          <div className="space-y-2">{gardenData.map(p=><div key={p.id} className="border border-slate-700 rounded-xl overflow-hidden bg-slate-900/40 p-3 flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-lime-900/40 flex items-center justify-center text-lg flex-shrink-0">🌿</div><div className="flex-1 min-w-0"><p className="text-sm font-semibold text-slate-100">{p.name}</p><p className="text-xs text-slate-500">{p.location} · {p.water}</p></div><button onClick={()=>onGardenUpdate(gardenData.filter(x=>x.id!==p.id))} className="text-slate-700 hover:text-rose-400 text-lg leading-none">×</button></div>)}</div>
          <div className="space-y-3">
            <div className="flex items-center justify-between"><h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Catalog</h3><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search catalog…" className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"/></div>
            <div className="space-y-2">{filtered.slice(0,8).map((p,i)=>{const inG=isInGarden(p.name);return(<div key={i} className={`rounded-xl border p-3 ${inG?"border-emerald-700/40 bg-emerald-900/10 opacity-70":"border-slate-700 bg-slate-800/30 hover:border-lime-500/40"}`}><div className="flex items-center justify-between gap-2"><div><p className="text-sm font-semibold text-slate-100">{p.name}</p><p className="text-xs text-slate-500">{p.water} · {p.sun}</p></div><button onClick={()=>addFromCatalog(p)} disabled={inG} className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${inG?"bg-slate-700 text-slate-500 cursor-default":"bg-lime-500/20 hover:bg-lime-500/30 text-lime-300"}`}>{inG?"Added":"Add"}</button></div></div>);})}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── GARDENING TAB — catalog + my garden ──────────────────────────────────────
function GardeningTab({data,onUpdate}){
  const months=Object.keys(ZONE9B);
  const cm=new Date().toLocaleString("default",{month:"long"});
  const[gView,setGView]=useState("mygarden");
  const[sel,setSel]=useState(months.includes(cm)?cm:"May");
  const[openSec,setOpenSec]=useState("plant");
  const[catFilter,setCatFilter]=useState("All");
  const[search,setSearch]=useState("");
  const cal=ZONE9B[sel];
  const allCats=["All",...Object.keys(GARDEN_CATALOG)];
  const catalogPlants=Object.entries(GARDEN_CATALOG).flatMap(([cat,plants])=>plants.map(p=>({...p,cat})));
  const filtered=catalogPlants.filter(p=>(catFilter==="All"||p.cat===catFilter)&&p.name.toLowerCase().includes(search.toLowerCase()));
  const isInGarden=(name)=>data.some(p=>p.name===name);
  const addFromCatalog=(p)=>{if(isInGarden(p.name))return;onUpdate([...data,{id:Date.now(),name:p.name,location:"Patio",notes:p.notes,photo:null,water:p.water,lastWatered:null}]);setGView("mygarden");};
  const handlePhoto=(id,e)=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>onUpdate(data.map(x=>x.id===id?{...x,photo:r.result}:x));r.readAsDataURL(f);};
  return(
    <div className="space-y-5">
      <div className="flex gap-1 overflow-x-auto scrollbar-hide">{[["mygarden","🌱 My Garden"],["catalog","📋 Plant Catalog"],["calendar","📅 Zone 9b"]].map(([t,l])=><button key={t} onClick={()=>setGView(t)} className={`flex-shrink-0 flex-1 py-2 text-xs rounded-xl border transition-all ${gView===t?"bg-lime-500/20 border-lime-500/40 text-lime-300 font-semibold":"border-slate-700 text-slate-500 hover:text-slate-300"}`}>{l}</button>)}</div>

      {gView==="mygarden"&&(<div className="space-y-3">
        <div className="flex items-center justify-between"><h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold">My Garden ({data.length})</h3><button onClick={()=>setGView("catalog")} className="px-3 py-1.5 bg-lime-900/30 hover:bg-lime-900/50 border border-lime-700/40 text-lime-400 rounded-xl text-xs font-medium">+ From Catalog</button></div>
        {data.map(p=>{const pr=useRef();return(<div key={p.id} className="border border-slate-700 rounded-2xl overflow-hidden bg-slate-900/40"><div className="flex items-center gap-3 p-3"><button onClick={()=>pr.current.click()} className="flex-shrink-0">{p.photo?<img src={p.photo} alt={p.name} className="w-12 h-12 rounded-xl object-cover"/>:<div className="w-12 h-12 rounded-xl bg-lime-900/40 border border-lime-700/40 flex items-center justify-center text-xl">🌱</div>}</button><input ref={pr} type="file" accept="image/*" className="hidden" onChange={e=>handlePhoto(p.id,e)}/><div className="flex-1 min-w-0"><p className="text-sm font-semibold text-slate-100">{p.name}</p><p className="text-xs text-slate-500">{p.location} · {p.water||"Weekly"}</p>{p.notes&&<p className="text-xs text-slate-600 line-clamp-1">{p.notes}</p>}</div><button onClick={()=>onUpdate(data.filter(x=>x.id!==p.id))} className="text-slate-700 hover:text-rose-400 text-lg leading-none px-1">×</button></div><div className="px-3 pb-3"><input value={p.location} onChange={e=>onUpdate(data.map(x=>x.id===p.id?{...x,location:e.target.value}:x))} placeholder="Location…" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none"/></div></div>);})}
        {data.length===0&&<button onClick={()=>setGView("catalog")} className="w-full py-4 border border-dashed border-slate-700 text-slate-600 hover:text-slate-400 rounded-2xl text-sm transition-colors">Browse catalog to add plants →</button>}
      </div>)}

      {gView==="catalog"&&(<div className="space-y-4">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search plants, herbs, flowers…" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-lime-400/50"/>
        <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">{allCats.map(c=><button key={c} onClick={()=>setCatFilter(c)} className={`flex-shrink-0 px-3 py-1.5 text-xs rounded-xl border transition-all ${catFilter===c?"bg-lime-500/20 border-lime-500/40 text-lime-300 font-semibold":"border-slate-700 text-slate-500 hover:text-slate-300"}`}>{c}</button>)}</div>
        <p className="text-xs text-slate-600">{filtered.length} plants · Tap to add to your garden</p>
        <div className="space-y-2">{filtered.map((p,i)=>{const inG=isInGarden(p.name);return(<div key={i} className={`rounded-xl border p-3 transition-all ${inG?"border-emerald-700/40 bg-emerald-900/10 opacity-60":"border-slate-700 bg-slate-800/30 hover:border-lime-500/40"}`}><div className="flex items-start justify-between gap-2"><div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-0.5"><p className="text-sm font-semibold text-slate-100">{p.name}</p></div><div className="flex gap-3 mb-1"><span className="text-xs text-sky-400">💧 {p.water}</span><span className="text-xs text-amber-400">☀️ {p.sun}</span></div><p className="text-xs text-slate-500 leading-relaxed">{p.notes}</p></div><button onClick={()=>addFromCatalog(p)} disabled={inG} className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${inG?"bg-emerald-900/20 border border-emerald-700/30 text-emerald-500 cursor-default":"bg-lime-500/20 hover:bg-lime-500/30 border border-lime-500/40 text-lime-300"}`}>{inG?"✓":"+ Add"}</button></div></div>);})}</div>
      </div>)}

      {gView==="calendar"&&(<div className="space-y-4">
        <div className="flex items-center gap-2"><h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Zone 9b Seasonal Guide</h3><span className="text-xs bg-lime-900/40 text-lime-400 border border-lime-700/40 px-2 py-0.5 rounded-full">Arizona</span></div>
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">{months.map(m=><button key={m} onClick={()=>setSel(m)} className={`flex-shrink-0 px-2.5 py-1.5 text-xs rounded-lg ${sel===m?"bg-lime-500/20 text-lime-300 border border-lime-500/40 font-semibold":"text-slate-500 hover:text-slate-300 border border-transparent"}`}>{m.slice(0,3)}</button>)}</div>
        <div className="space-y-2">{[["plant","🌱 Plant","border-lime-700/40"],["harvest","🌾 Harvest","border-amber-700/40"],["maintain","🔧 Maintain","border-sky-700/40"]].map(([key,label,bc])=><div key={key} className={`border ${bc} rounded-xl overflow-hidden`}><button onClick={()=>setOpenSec(openSec===key?"":key)} className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5"><span className="text-sm font-semibold text-slate-200">{label}</span><span className="text-slate-500 text-xs">{openSec===key?"▲":"▼"}</span></button>{openSec===key&&<div className="px-4 pb-3 space-y-1">{cal[key].map((item,i)=><p key={i} className="text-sm text-slate-300 flex gap-2"><span className="text-slate-600">•</span>{item}</p>)}</div>}</div>)}</div>
      </div>)}
    </div>
  );
}

function TravelsTab({tripTodos,tripDates,tripPacking,standardPackingList,onTodosUpdate,onDatesUpdate,onPackingUpdate,onStandardPackingUpdate}){
  const [open,setOpen]=useState(-1);
  const [newStandardItem,setNewStandardItem]=useState("");
  const [standardCategory,setStandardCategory]=useState("misc");
  const [newTripTodo,setNewTripTodo]=useState({});
  const tog=(ti,id)=>onTodosUpdate(tripTodos.map((arr,i)=>i===ti?arr.map(t=>t.id===id?{...t,done:!t.done}:t):arr));

  const addTripTodo=(ti,txt)=>{const text=(txt||"").trim();if(!text)return; const nd=[...tripTodos]; nd[ti]=[...(nd[ti]||[]),{id:Date.now(),text,done:false}]; onTodosUpdate(nd); setNewTripTodo(prev=>({...prev,[ti]:""}));};
  const updatePackingCategory=(ti,id,category)=>{const nd=tripPacking.map((arr,i)=>i===ti?arr.map(it=>it.id===id?{...it,category}:it):arr);onPackingUpdate(nd);};

  const max = Math.max(TRIPS.length, tripDates.length);
  const merged = Array.from({length:max}).map((_,i)=>{
    const base = TRIPS[i] || {name:`Trip ${i+1}`,dates:"",start:"",end:"",color:"border-slate-700/40 bg-slate-800/20",badge:"bg-slate-700/20 text-slate-300",items:[],todos:[],packing:[]};
    const d = tripDates[i] || {};
    const p = tripPacking[i] || [];
    return {...base, name:d.name||base.name, start:d.start||base.start, end:d.end||base.end, packing:p, todos: tripTodos[i]||base.todos };
  });

  const updateDates=(i,field,value)=>{const nd=[...tripDates];nd[i]={...(nd[i]||{}),[field]:value};onDatesUpdate(nd);};
  const updatePackingText=(ti,id,text)=>{const nd=tripPacking.map((arr,i)=>i===ti?arr.map(it=>it.id===id?{...it,text}:it):arr);onPackingUpdate(nd);};
  const togglePackingChecked=(ti,id)=>{const nd=tripPacking.map((arr,i)=>i===ti?arr.map(it=>it.id===id?{...it,checked:!it.checked}:it):arr);onPackingUpdate(nd);};
  const addPackingItem=(ti,txt,category="misc")=>{if(!txt) return; const nd=[...tripPacking]; nd[ti]=[...(nd[ti]||[]),{id:`${ti}-${Date.now()}`,text:txt,checked:false,category}];onPackingUpdate(nd);};
  const removeTrip=ti=>{onDatesUpdate(tripDates.filter((_,i)=>i!==ti)); onPackingUpdate(tripPacking.filter((_,i)=>i!==ti)); onTodosUpdate(tripTodos.filter((_,i)=>i!==ti)); setOpen(-1);};
  const addTrip=()=>{onDatesUpdate([...tripDates,{name:`New Trip`,start:"",end:""}]); onPackingUpdate([...tripPacking,[]]); onTodosUpdate([...tripTodos,[]]); setOpen(Math.max(0,tripDates.length));};

  const addStandardItem=()=>{
    const text=newStandardItem.trim();
    if(!text) return;
    onStandardPackingUpdate([...standardPackingList,{id:Date.now(),text,category:standardCategory}]);
    setNewStandardItem("");
  };

  const removeStandardItem=index=>{
    onStandardPackingUpdate(standardPackingList.filter((_,i)=>i!==index));
  };

  const addStandardPackingToTrip=ti=>{
    if(!standardPackingList.length) return;
    const nd=[...tripPacking];
    nd[ti]=[...(nd[ti]||[]),...standardPackingList.map((item,i)=>({
      id:`${ti}-${Date.now()}-${i}`,
      text:typeof item === "string" ? item : item.text,
      checked:false,
      category:typeof item === "string" ? "misc" : item.category || "misc",
    }))];
    onPackingUpdate(nd);
  };

  return(
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Trips</h3>
          <p className="text-xs text-slate-500">Manage trip dates, packing, and reusable standard packing items.</p>
        </div>
        <div className="flex gap-2"><button onClick={addTrip} className="px-3 py-1.5 bg-sky-700/20 hover:bg-sky-700/30 border border-sky-600/30 text-sky-300 rounded-xl text-xs">+ Add Trip</button></div>
      </div>

      <div className="rounded-2xl border border-slate-700 p-4 bg-slate-900/50">
        <div className="flex items-center justify-between mb-3 gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Standard packing list</p>
            <p className="text-xs text-slate-400">Add reusable items once, then push them into any trip.</p>
          </div>
        </div>
        <div className="space-y-3">
          {standardPackingList.length > 0 ? (
            <div className="space-y-2">
              {standardPackingList.map((item,index)=>{
                const text = typeof item === "string" ? item : item.text;
                const category = typeof item === "string" ? "misc" : item.category || "misc";
                return (
                  <div key={`${text}-${index}`} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700 bg-slate-800/30">
                    <span className="flex-1 text-sm text-slate-200">{text}</span>
                    <span className="text-[11px] uppercase tracking-widest text-slate-400 bg-slate-900/40 px-2 py-1 rounded-full">{category}</span>
                    <button onClick={()=>removeStandardItem(index)} className="text-rose-400 text-sm">Remove</button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No standard packing items yet. Add a reusable list here.</p>
          )}
          <div className="flex gap-2 flex-wrap">
            <input value={newStandardItem} onChange={e=>setNewStandardItem(e.target.value)} placeholder="Add standard packing item…" className="flex-1 min-w-[220px] bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none" />
            <select value={standardCategory} onChange={e=>setStandardCategory(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none">
              {PACKING_CATEGORIES.map(cat=><option key={cat} value={cat}>{cat}</option>)}
            </select>
            <button onClick={addStandardItem} className="px-3 py-2 bg-lime-500/20 hover:bg-lime-500/30 border border-lime-500/40 text-lime-300 rounded-xl text-xs">Add</button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {merged.map((trip,ti)=>{
          const datesLabel = trip.start||trip.end?`${trip.start||""} → ${trip.end||""}`:trip.dates||"Dates not set";
          return(
            <div key={ti} className={`rounded-2xl border p-4 ${trip.color}`}>
              <div className="w-full flex items-center justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-100 text-sm">{trip.name}</p>
                  <p className="text-xs text-slate-400">{datesLabel}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>setOpen(open===ti?-1:ti)} className="text-slate-400 text-xs">{open===ti?"▲":"▼"}</button>
                  <button onClick={()=>removeTrip(ti)} className="text-rose-400 text-sm">×</button>
                </div>
              </div>
              {open===ti&&(
                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400">Trip name</label>
                    <input value={tripDates[ti]?.name||trip.name} onChange={e=>updateDates(ti,'name',e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200"/>
                    <div className="flex gap-2 mt-2">
                      <input type="date" value={trip.start||""} onChange={e=>updateDates(ti,'start',e.target.value)} className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200"/>
                      <input type="date" value={trip.end||""} onChange={e=>updateDates(ti,'end',e.target.value)} className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200"/>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2 gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-slate-500">Packing list</p>
                        <p className="text-xs text-slate-400">Add custom items or import from your standard list.</p>
                      </div>
                      <button onClick={()=>addStandardPackingToTrip(ti)} disabled={!standardPackingList.length} className="text-xs px-3 py-1.5 bg-slate-700/30 border border-slate-700 rounded-xl text-slate-300 disabled:opacity-40">Add standard packing items</button>
                    </div>
                    <div className="space-y-2">
                      {(tripPacking[ti]||[]).map(item=> (
                        <div key={item.id} className="flex flex-wrap items-center gap-2 px-3 py-2 rounded-xl border border-slate-700 bg-slate-800/20">
                          <input type="checkbox" checked={!!item.checked} onChange={()=>togglePackingChecked(ti,item.id)} className="h-4 w-4" />
                          <input value={item.text} onChange={e=>updatePackingText(ti,item.id,e.target.value)} className="flex-1 min-w-[160px] bg-transparent text-sm text-slate-200 focus:outline-none" />
                          <select value={item.category||"misc"} onChange={e=>updatePackingCategory(ti,item.id,e.target.value)} className="bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-2 py-1 text-xs">
                            {PACKING_CATEGORIES.map(cat=><option key={cat} value={cat}>{cat}</option>)}
                          </select>
                          <button onClick={()=>onPackingUpdate(tripPacking.map((arr,i)=>i===ti?arr.filter(it=>it.id!==item.id):arr))} className="text-rose-400">×</button>
                        </div>
                      ))}
                      <AddPackingInline onAdd={(txt,category)=>addPackingItem(ti,txt,category)} />
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">To Do</p>
                    <div className="space-y-1.5">{(tripTodos[ti]||[]).map(t=> <button key={t.id} onClick={()=>tog(ti,t.id)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border text-left ${t.done?"opacity-40 border-slate-800":"border-slate-700/60 bg-slate-800/30"}`}><span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${t.done?"bg-emerald-500 border-emerald-500":"border-slate-500"}`}>{t.done&&<svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}</span><span className={`text-xs ${t.done?"line-through text-slate-600":"text-slate-300"}`}>{t.text}</span></button>)}</div>
                    <div className="flex gap-2 mt-3">
                      <input value={newTripTodo[ti]||""} onChange={e=>setNewTripTodo(prev=>({...prev,[ti]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addTripTodo(ti,newTripTodo[ti]||"")} placeholder="Add trip task…" className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none" />
                      <button onClick={()=>addTripTodo(ti,newTripTodo[ti]||"")} className="px-3 py-2 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 rounded-xl text-xs">Add</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AddPackingInline({onAdd}){const [v,setV]=useState("");const [category,setCategory]=useState("misc");return(<div className="flex flex-wrap gap-2"><input value={v} onChange={e=>setV(e.target.value)} placeholder="Add packing item…" className="flex-1 min-w-[180px] bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200"/><select value={category} onChange={e=>setCategory(e.target.value)} className="bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-sm"><option value="attire">attire</option><option value="electronics">electronics</option><option value="misc">misc</option><option value="toiletries">toiletries</option><option value="backpack">backpack</option><option value="makeup">makeup</option></select><button onClick={()=>{if(!v.trim())return;onAdd(v.trim(),category);setV("");}} className="px-3 py-2 bg-lime-500/20 hover:bg-lime-500/30 border border-lime-500/40 text-lime-300 rounded-xl text-xs">Add</button></div>);
}

function PregnancyTab({todos,buyList,onTodosUpdate,onBuyUpdate}){
  const[pTab,setPTab]=useState("todos");
  const[catFilter,setCatFilter]=useState("All");
  const done=todos.filter(t=>t.done).length;
  const bought=buyList.filter(b=>b.bought).length;
  const allCats=["All",...[...new Set(buyList.map(b=>b.cat))]];
  const filteredBuy=catFilter==="All"?buyList:buyList.filter(b=>b.cat===catFilter);
  const priorityBadge={high:"text-rose-400",med:"text-amber-400",low:"text-slate-500"};
  return(
    <div className="space-y-5">
      <div className="bg-pink-500/10 border border-pink-500/30 rounded-2xl px-4 py-3 flex items-center gap-3">
        <span className="text-3xl">🤰</span>
        <div><p className="font-bold text-pink-200">Week 20 — Halfway! 🎉</p><p className="text-xs text-pink-300/70">Size of a banana · ~10 inches · Anatomy scan time!</p></div>
      </div>
      <div className="flex gap-1">{[["todos","✅ Milestones"],["buy","🛍️ Buy List"]].map(([t,l])=><button key={t} onClick={()=>setPTab(t)} className={`flex-1 py-2 text-xs rounded-xl border transition-all ${pTab===t?"bg-pink-500/20 border-pink-500/40 text-pink-300 font-semibold":"border-slate-700 text-slate-500 hover:text-slate-300"}`}>{l}</button>)}</div>

      {pTab==="todos"&&(
        <div>
          <div className="flex justify-between mb-2"><h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Milestone To-Dos</h3><span className="text-xs text-slate-500">{done}/{todos.length}</span></div>
          <div className="h-1.5 bg-slate-800 rounded-full mb-3"><div className="h-1.5 bg-pink-500 rounded-full" style={{width:`${todos.length?(done/todos.length)*100:0}%`}}/></div>
          <div className="space-y-1.5">{todos.map(t=><button key={t.id} onClick={()=>onTodosUpdate(todos.map(i=>i.id===t.id?{...i,done:!i.done}:i))} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left ${t.done?"border-slate-800 opacity-40":"border-slate-700 bg-slate-800/30 hover:border-pink-400/40"}`}><span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${t.done?"bg-pink-500 border-pink-500":"border-slate-500"}`}>{t.done&&<svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}</span><span className={`text-sm ${t.done?"line-through text-slate-600":"text-slate-300"}`}>{t.text}</span></button>)}</div>
        </div>
      )}

      {pTab==="buy"&&(
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500">{bought}/{buyList.length} items bought</p>
            <div className="flex gap-2 text-xs"><span className="text-rose-400">● High</span><span className="text-amber-400">● Med</span><span className="text-slate-500">● Low</span></div>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full"><div className="h-1.5 bg-emerald-500 rounded-full transition-all" style={{width:`${buyList.length?(bought/buyList.length)*100:0}%`}}/></div>
          <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">{allCats.map(c=><button key={c} onClick={()=>setCatFilter(c)} className={`flex-shrink-0 px-3 py-1.5 text-xs rounded-xl border transition-all ${catFilter===c?"bg-pink-500/20 border-pink-500/40 text-pink-300 font-semibold":"border-slate-700 text-slate-500 hover:text-slate-300"}`}>{c}</button>)}</div>
          <div className="space-y-1.5">
            {filteredBuy.map(b=>(
              <button key={b.id} onClick={()=>onBuyUpdate(buyList.map(i=>i.id===b.id?{...i,bought:!i.bought}:i))}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${b.bought?"border-slate-800 bg-slate-800/20 opacity-50":"border-slate-700 bg-slate-800/30 hover:border-pink-400/40"}`}>
                <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${b.bought?"bg-emerald-500 border-emerald-500":"border-slate-500"}`}>
                  {b.bought&&<svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                </span>
                <span className={`flex-1 text-sm ${b.bought?"line-through text-slate-600":"text-slate-300"}`}>{b.item}</span>
                <span className={`text-xs flex-shrink-0 ${priorityBadge[b.priority]||"text-slate-500"}`}>●</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RoutineTab({checked,workouts,onCheckedUpdate,onWorkoutsUpdate}){const today=new Date().toLocaleDateString("en-US",{weekday:"long"});const[sel,setSel]=useState(DAYS.includes(today)?today:"Monday");const[showF,setShowF]=useState(false);const[form,setForm]=useState({date:new Date().toISOString().split("T")[0],type:"",duration:"",notes:""});const key=(d,i)=>`${d}-${i}`;const tog=(d,i)=>onCheckedUpdate({...checked,[key(d,i)]:!checked[key(d,i)]});const tasks=ROUTINE[sel]||[];const done=tasks.filter((_,i)=>checked[key(sel,i)]).length;const addW=()=>{if(!form.type.trim())return;onWorkoutsUpdate([{...form,id:Date.now()},...workouts]);setForm({date:new Date().toISOString().split("T")[0],type:"",duration:"",notes:""});setShowF(false);};return(<div className="space-y-5"><div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">{DAYS.map(d=><button key={d} onClick={()=>setSel(d)} className={`flex-shrink-0 px-2 py-1.5 text-xs rounded-lg ${sel===d?"bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold":"text-slate-500 hover:text-slate-300 border border-transparent"}`}>{d.slice(0,3)}</button>)}</div><div className="flex justify-between items-center"><h3 className="text-sm font-semibold text-slate-200">{sel}</h3><span className="text-xs text-slate-500">{done}/{tasks.length}</span></div><div className="h-1.5 bg-slate-800 rounded-full"><div className="h-1.5 bg-rose-500 rounded-full" style={{width:tasks.length?`${(done/tasks.length)*100}%`:"0%"}}/></div><div className="space-y-1.5">{tasks.map((task,i)=>{const isDone=checked[key(sel,i)];const time=task.split(" ")[0];const desc=task.slice(time.length+1);return(<button key={i} onClick={()=>tog(sel,i)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left ${isDone?"border-slate-800 opacity-40":"border-slate-700 bg-slate-800/30 hover:border-rose-400/30"}`}><span className="text-xs font-mono text-slate-600 w-10 flex-shrink-0">{time}</span><span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${isDone?"bg-emerald-500 border-emerald-500":"border-slate-600"}`}>{isDone&&<svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}</span><span className={`text-sm flex-1 ${isDone?"line-through text-slate-600":"text-slate-300"}`}>{desc}</span></button>);})}</div><div><div className="flex items-center justify-between mb-3"><h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Workout Log</h3><button onClick={()=>setShowF(!showF)} className="px-3 py-1.5 bg-rose-900/30 hover:bg-rose-900/50 border border-rose-700/40 text-rose-400 rounded-xl text-xs font-medium">+ Log</button></div>{showF&&<div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 space-y-2.5 mb-3"><div className="flex gap-2"><input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"/><input value={form.duration} onChange={e=>setForm(f=>({...f,duration:e.target.value}))} placeholder="Duration" className="w-24 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none"/></div><input value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} placeholder="Workout type…" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none"/><input value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Notes (optional)" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none"/><div className="flex gap-2"><button onClick={addW} disabled={!form.type} className="flex-1 py-2 bg-rose-500/20 hover:bg-rose-500/30 disabled:opacity-30 border border-rose-500/40 text-rose-300 rounded-xl text-sm font-semibold">Save</button><button onClick={()=>setShowF(false)} className="px-4 py-2 bg-slate-700 border border-slate-600 text-slate-300 rounded-xl text-sm">Cancel</button></div></div>}{workouts.length===0?<p className="text-xs text-slate-700 italic px-1">No workouts logged yet 💪</p>:<div className="space-y-2">{workouts.slice(0,8).map(l=><div key={l.id} className="flex items-start gap-3 px-3 py-3 rounded-xl border border-slate-700 bg-slate-800/30 group"><div className="flex-1"><div className="flex items-center gap-2"><p className="text-sm font-semibold text-slate-200">{l.type}</p>{l.duration&&<span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{l.duration}</span>}</div><p className="text-xs text-slate-500 mt-0.5">{l.date}</p>{l.notes&&<p className="text-xs text-slate-400 mt-1">{l.notes}</p>}</div><button onClick={()=>onWorkoutsUpdate(workouts.filter(x=>x.id!==l.id))} className="opacity-0 group-hover:opacity-100 text-slate-700 hover:text-rose-400 text-lg">×</button></div>)}</div>}</div></div>);}

function ReadingTab({currentBook,readingLog,wishlist,onUpdate}){const[tab,setTab]=useState("current");const[nw,setNw]=useState("");const[lf,setLf]=useState({date:new Date().toISOString().split("T")[0],pages:"",notes:""});const addW=()=>{if(nw.trim()){onUpdate("wishlist",[...wishlist,{id:Date.now(),title:nw.trim(),added:new Date().toLocaleDateString()}]);setNw("");}};const addL=()=>{if(!lf.pages)return;onUpdate("readingLog",[{...lf,id:Date.now()},...readingLog]);setLf({date:new Date().toISOString().split("T")[0],pages:"",notes:""});};return(<div className="space-y-5"><div className="flex gap-2"><div className="flex-1 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2 text-center"><p className="text-lg font-bold text-amber-400">{readingLog.length}</p><p className="text-xs text-slate-500">Sessions</p></div><div className="flex-1 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2 text-center"><p className="text-lg font-bold text-amber-400">{readingLog.reduce((s,l)=>s+(parseInt(l.pages)||0),0)}</p><p className="text-xs text-slate-500">Pages</p></div><div className="flex-1 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2 text-center"><p className="text-lg font-bold text-amber-400">{wishlist.length}</p><p className="text-xs text-slate-500">Want to read</p></div></div><div className="flex gap-1">{[["current","📖 Current"],["log","📝 Log"],["wishlist","🔖 Wishlist"]].map(([t,l])=><button key={t} onClick={()=>setTab(t)} className={`flex-1 py-2 text-xs rounded-xl border ${tab===t?"bg-amber-500/20 border-amber-500/40 text-amber-300 font-semibold":"border-slate-700 text-slate-500 hover:text-slate-300"}`}>{l}</button>)}</div>{tab==="current"&&<div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 space-y-3"><input value={currentBook.title} onChange={e=>onUpdate("currentBook",{...currentBook,title:e.target.value})} placeholder="Book title…" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none"/><input value={currentBook.author} onChange={e=>onUpdate("currentBook",{...currentBook,author:e.target.value})} placeholder="Author…" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none"/><div className="flex gap-2"><input value={currentBook.pages} onChange={e=>onUpdate("currentBook",{...currentBook,pages:e.target.value})} placeholder="Total pages" className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none"/><input type="date" value={currentBook.startDate} onChange={e=>onUpdate("currentBook",{...currentBook,startDate:e.target.value})} className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"/></div><textarea value={currentBook.notes} onChange={e=>onUpdate("currentBook",{...currentBook,notes:e.target.value})} placeholder="Notes / thoughts…" rows={3} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none resize-none"/></div>}{tab==="log"&&<div className="space-y-3"><div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 space-y-3"><div className="flex gap-2"><input type="date" value={lf.date} onChange={e=>setLf(f=>({...f,date:e.target.value}))} className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"/><input value={lf.pages} onChange={e=>setLf(f=>({...f,pages:e.target.value}))} placeholder="Pages" type="number" className="w-24 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none"/></div><input value={lf.notes} onChange={e=>setLf(f=>({...f,notes:e.target.value}))} placeholder="Quick note…" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none"/><button onClick={addL} disabled={!lf.pages} className="w-full py-2 bg-amber-500/20 hover:bg-amber-500/30 disabled:opacity-30 border border-amber-500/40 text-amber-300 rounded-xl text-sm font-semibold">Log Session</button></div><div className="space-y-1.5">{readingLog.slice(0,10).map(l=><div key={l.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800/30"><div className="flex-1"><p className="text-sm text-slate-200">{l.pages} pages</p>{l.notes&&<p className="text-xs text-slate-500">{l.notes}</p>}</div><span className="text-xs text-slate-600">{l.date}</span></div>)}{readingLog.length===0&&<p className="text-xs text-slate-700 italic px-1">No sessions logged yet</p>}</div></div>}{tab==="wishlist"&&<div className="space-y-3"><div className="flex gap-2"><input value={nw} onChange={e=>setNw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addW()} placeholder="Add book title…" className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400/50"/><button onClick={addW} className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl text-sm font-bold">+</button></div><div className="space-y-2">{wishlist.map(b=><div key={b.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800/30 group"><span className="text-amber-400">🔖</span><div className="flex-1"><p className="text-sm text-slate-200">{b.title}</p><p className="text-xs text-slate-600">Added {b.added}</p></div><button onClick={()=>onUpdate("wishlist",wishlist.filter(x=>x.id!==b.id))} className="opacity-0 group-hover:opacity-100 text-slate-700 hover:text-rose-400 text-lg">×</button></div>)}{wishlist.length===0&&<p className="text-xs text-slate-700 italic px-1">No books yet</p>}</div></div>}</div>);}

function HabitsTab({habits,habitLog,onHabitsUpdate,onLogUpdate}){const today=new Date().toISOString().split("T")[0];const[selDate,setSelDate]=useState(today);const todayLog=habitLog[selDate]||{};const[newH,setNewH]=useState("");const[showAdd,setShowAdd]=useState(false);const COLORS=["rose","emerald","amber","sky","violet","pink"];const[ci,setCi]=useState(0);const tog=id=>onLogUpdate({...habitLog,[selDate]:{...todayLog,[id]:!todayLog[id]}});const addH=()=>{if(!newH.trim())return;onHabitsUpdate([...habits,{id:Date.now(),label:newH.trim(),color:COLORS[ci%COLORS.length]}]);setNewH("");setShowAdd(false);};const last7=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);const k=d.toISOString().split("T")[0];const l=habitLog[k]||{};const done=habits.filter(h=>l[h.id]).length;return{k,done,total:habits.length,label:d.toLocaleDateString("en-US",{weekday:"short"})};});return(<div className="space-y-5"><div className="flex gap-2 items-end">{last7.map((d,i)=>{const pct=d.total>0?(d.done/d.total)*100:0;const isT=d.k===today;return(<div key={i} className="flex-1 flex flex-col items-center gap-1"><div className="w-full bg-slate-800 rounded-lg overflow-hidden" style={{height:"40px"}}><div className="w-full rounded-lg" style={{height:`${pct}%`,background:pct===100?"#10b981":pct>50?"#f59e0b":"#475569",marginTop:`${100-pct}%`}}/></div><p className={`text-xs ${isT?"text-rose-400 font-bold":"text-slate-600"}`}>{d.label}</p></div>);})}</div><p className="text-xs text-slate-500 text-center">{habits.filter(h=>todayLog[h.id]).length}/{habits.length} done today</p><input type="date" value={selDate} onChange={e=>setSelDate(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"/><div className="space-y-2">{habits.map(h=>{const done=todayLog[h.id];const bc=HABIT_BORDERS[h.color]||"border-slate-500/40 text-slate-300";const bg=HABIT_COLORS[h.color]||"bg-slate-500";return(<button key={h.id} onClick={()=>tog(h.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-left ${done?`${bc} bg-white/5`:"border-slate-700 bg-slate-800/30"}`}><div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 ${done?`${bg} border-transparent`:"border-slate-600"}`}>{done&&<svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}</div><span className={`text-sm flex-1 ${done?"text-slate-300 line-through":"text-slate-200"}`}>{h.label}</span>{done&&<span className="text-xs text-emerald-400">✓</span>}</button>);})}</div>{showAdd?<div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 space-y-3"><input value={newH} onChange={e=>setNewH(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addH()} placeholder="New habit…" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none"/><div className="flex gap-1.5">{COLORS.map((c,i)=><button key={c} onClick={()=>setCi(i)} className={`w-6 h-6 rounded-full ${HABIT_COLORS[c]} ${ci===i?"ring-2 ring-white ring-offset-2 ring-offset-slate-800":""}`}/>)}</div><div className="flex gap-2"><button onClick={addH} className="flex-1 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 rounded-xl text-sm font-semibold">Add</button><button onClick={()=>setShowAdd(false)} className="px-4 py-2 bg-slate-700 border border-slate-600 text-slate-300 rounded-xl text-sm">Cancel</button></div></div>:<button onClick={()=>setShowAdd(true)} className="w-full py-2.5 border border-dashed border-slate-700 text-slate-600 hover:text-slate-400 hover:border-slate-500 rounded-2xl text-sm">+ Add habit</button>}</div>);}

function GenericTab({tabId,items,notes,onItemsUpdate,onNotesUpdate}){const[input,setInput]=useState("");const add=()=>{if(input.trim()){onItemsUpdate([...items,{id:Date.now(),text:input.trim(),done:false}]);setInput("");}};return(<div className="space-y-5"><div><h3 className="text-xs uppercase tracking-widest text-slate-500 mb-2 font-semibold">Checklist</h3><div className="flex gap-2 mb-2"><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="Add item…" className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-400/50"/><button onClick={add} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 rounded-xl text-sm font-bold">+</button></div>{items.length===0&&<p className="text-xs text-slate-700 italic px-1">No items yet</p>}<div className="space-y-1.5">{items.map(item=><div key={item.id} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-800 bg-slate-800/30 group"><button onClick={()=>onItemsUpdate(items.map(i=>i.id===item.id?{...i,done:!i.done}:i))} className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${item.done?"bg-emerald-500 border-emerald-500":"border-slate-600 hover:border-slate-400"}`}>{item.done&&<svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}</button><span className={`flex-1 text-sm ${item.done?"line-through text-slate-600":"text-slate-300"}`}>{item.text}</span><button onClick={()=>onItemsUpdate(items.filter(i=>i.id!==item.id))} className="opacity-0 group-hover:opacity-100 text-slate-700 hover:text-rose-400 text-lg">×</button></div>)}</div></div><div><h3 className="text-xs uppercase tracking-widest text-slate-500 mb-2 font-semibold">Notes</h3><textarea value={notes} onChange={e=>onNotesUpdate(e.target.value)} rows={4} placeholder="Jot anything down…" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-300 placeholder-slate-700 focus:outline-none focus:border-rose-400/40 resize-none leading-relaxed"/></div></div>);}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App(){
  const[activeTab,setActiveTab]=useState("dashboard");
  const[appData,setAppData]=useState(DEFAULT_DATA);
  const[saveStatus,setSaveStatus]=useState("idle");
  const[loadStatus,setLoadStatus]=useState("loading");
  const saveTimeout=useRef(null);

  useEffect(()=>{(async()=>{const local=loadFromLocal();if(local)setAppData(prev=>({...prev,...local}));const saved=await loadFromDrive();if(saved)setAppData(prev=>({...prev,...saved}));setLoadStatus("ready");})();},[]);

  const triggerSave=useCallback((newData)=>{
    const savedLocally=saveToLocal(newData);
    clearTimeout(saveTimeout.current);setSaveStatus("saving");
    saveTimeout.current=setTimeout(async()=>{const ok=await saveToDrive(newData);setSaveStatus(ok||savedLocally?"saved":"error");setTimeout(()=>setSaveStatus("idle"),3000);},1500);
  },[]);

  const update=useCallback((key,value)=>{setAppData(prev=>{const next={...prev,[key]:value};triggerSave(next);return next;});},[triggerSave]);

  if(loadStatus==="loading")return(
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-rose-400 border-t-transparent rounded-full mx-auto" style={{animation:"spin 0.8s linear infinite"}}/>
        <p className="text-slate-400 text-sm">Loading from Google Drive…</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return(
    <div className="min-h-screen bg-slate-950 text-slate-100" style={{fontFamily:"Georgia,'Times New Roman',serif"}}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .scrollbar-hide::-webkit-scrollbar{display:none}
        .scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>
      <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur border-b border-slate-800/80">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-baseline gap-2"><h1 className="text-xl font-bold">Daia's Life Tracker</h1></div>
            <SaveBadge status={saveStatus}/>
          </div>
          <div className="flex gap-0.5 overflow-x-auto scrollbar-hide">
            {TABS.map(tab=><button key={tab.id} onClick={()=>setActiveTab(tab.id)} className={`flex-shrink-0 px-3 py-2 text-xs rounded-t-lg border-b-2 transition-all ${activeTab===tab.id?"text-white border-rose-400 bg-slate-800/70 font-semibold":"text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/30"}`}>{tab.label}</button>)}
          </div>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-5">
        {activeTab==="dashboard"&&<DashboardTab appData={appData} onUpdate={update}/>}
        {activeTab==="calendar"&&<CalendarTab/>}
        {activeTab==="financials"&&<FinancialsTab investments={appData.investments} netWorth={appData.netWorth} assumptions={appData.financialAssumptions} onUpdate={v=>update("investments",v)} onUpdateField={update}/>}
        {activeTab==="travels"&&<TravelsTab tripTodos={appData.tripTodos} tripDates={appData.tripDates} tripPacking={appData.tripPacking} standardPackingList={appData.standardPackingList} onTodosUpdate={v=>update("tripTodos",v)} onDatesUpdate={v=>update("tripDates",v)} onPackingUpdate={v=>update("tripPacking",v)} onStandardPackingUpdate={v=>update("standardPackingList",v)}/>}
        {activeTab==="plants"&&<PlantsTab data={appData.plants} gardenData={appData.gardenPlants} onUpdate={v=>update("plants",v)} onGardenUpdate={v=>update("gardenPlants",v)}/>}
        {activeTab==="routine"&&<RoutineTab checked={appData.routineChecked} workouts={appData.workouts} onCheckedUpdate={v=>update("routineChecked",v)} onWorkoutsUpdate={v=>update("workouts",v)}/>} 
        {activeTab==="grocery"&&<GroceryTab groceryList={appData.groceryList} onUpdate={v=>update("groceryList",v)}/>}
        {activeTab==="pregnancy"&&<PregnancyTab todos={appData.pregnancyTodos} buyList={appData.babyBuyList||BABY_BUY_LIST} onTodosUpdate={v=>update("pregnancyTodos",v)} onBuyUpdate={v=>update("babyBuyList",v)}/>}





      </div>
    </div>
  );
}
