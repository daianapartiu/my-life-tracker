import { useState, useRef, useEffect, useCallback } from "react";

const DRIVE_FILE_NAME = "my-life-workspace-data-v3.json";
const GDRIVE_MCP = "https://drivemcp.googleapis.com/mcp/v1";

const TABS = [
  { id: "dashboard", label: "🏠 Today" },
  { id: "calendar", label: "📆 Calendar" },
  { id: "financials", label: "💰 Finance" },
  { id: "travels", label: "✈️ Travels" },
  { id: "plants", label: "🌿 Plants" },
  { id: "cooking", label: "🍳 Meals" },
  { id: "pregnancy", label: "🤰 Baby" },
  { id: "gardening", label: "🌱 Garden" },
  { id: "routine", label: "📅 Routine" },
  { id: "reading", label: "📚 Reading" },
  { id: "habits", label: "🎯 Habits" },
  { id: "sidejob", label: "💼 Side Job" },
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
  { name:"Poland + Croatia 🇵🇱🇭🇷", dates:"~12th–27th", color:"border-rose-500/40 bg-rose-500/10", badge:"bg-rose-500/20 text-rose-300",
    items:[{date:"12",event:"Leave Arizona ✈️"},{date:"13",event:"Arrive Warsaw"},{date:"14",event:"Warsaw City Day"},{date:"15",event:"Travel to Kraków"},{date:"16",event:"Auschwitz ~$100/pp"},{date:"17",event:"Fly to Croatia"},{date:"21",event:"Wedding 💒"},{date:"22",event:"Rest / Bosnia"},{date:"23",event:"Dubrovnik 🏰"},{date:"24",event:"Dubrovnik"},{date:"25",event:"Split (3h)"},{date:"26",event:"Hvar 🏝️"},{date:"27",event:"Fly home"}],
    todos:["Book Auschwitz tickets (~$100/person)","Book Croatia accommodations","Figure out Croatia schedule"]},
  { name:"San Diego 🌊", dates:"Memorial Day Weekend", color:"border-sky-500/40 bg-sky-500/10", badge:"bg-sky-500/20 text-sky-300",
    items:[{date:"Fri",event:"Travel to San Diego"},{date:"Sat",event:"Beach + explore"},{date:"Sun",event:"Free day"},{date:"Mon",event:"Memorial Day / head home"}],
    todos:["Book hotel / Airbnb","Plan activities"]},
  { name:"Puerto Peñasco 🌵", dates:"Last Weekend of May", color:"border-amber-500/40 bg-amber-500/10", badge:"bg-amber-500/20 text-amber-300",
    items:[{date:"Fri",event:"Drive Rocky Point 🚗 ~4h"},{date:"Sat",event:"Beach + seafood"},{date:"Sun",event:"Relax / drive home"}],
    todos:["Book accommodation","Check passport / tourist card"]},
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
  Monday:{meal:"Sheet pan chicken thighs + roasted veggies",note:"Makes 2 servings — leftovers Tuesday",carries:true},
  Tuesday:{meal:"Leftover chicken 🍗",note:"From Monday",isLeftover:true},
  Wednesday:{meal:"Pasta e fagioli (big batch)",note:"Cook tonight — leftovers Thursday",carries:true},
  Thursday:{meal:"Leftover pasta e fagioli 🫘",note:"From Wednesday",isLeftover:true},
  Friday:{meal:"Salmon + quinoa + cucumber salad",note:"Fresh, quick 30-min meal",carries:false},
  Saturday:{meal:"Slow cooker pulled pork tacos",note:"Set in morning",carries:true},
  Sunday:{meal:"Leftover tacos 🌮 + prep for week",note:"Sunday cook: prep ahead",carries:false},
};

const SUNLIGHT_OPT=["Full Sun (6+ hrs)","Partial Sun (3-6 hrs)","Indirect Bright","Low Light"];
const WATER_OPT=["Daily","Every 2-3 days","Weekly","Every 2 weeks","Monthly"];

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

const DEFAULT_DATA={
  plants:[{id:1,name:"English Ivy",sunlight:"Indirect Bright",watering:"Weekly",notes:"Keep from direct AZ sun. Watch spider mites.",photo:null,lastWatered:null}],
  gardenPlants:[{id:1,name:"Basil",location:"Patio",notes:"Harvest often to prevent bolting.",photo:null,water:"Every 2-3 days",lastWatered:null},{id:2,name:"Thyme",location:"Patio",notes:"Drought tolerant. Full sun.",photo:null,water:"Weekly",lastWatered:null}],
  pregnancyTodos:PREGNANCY_TODOS,
  babyBuyList:BABY_BUY_LIST,
  tripTodos:TRIPS.map(t=>t.todos.map((text,i)=>({id:i,text,done:false}))),
  routineChecked:{},workouts:[],
  sidejobNotes:"",sidejobItems:[],
  mealPlan:DEFAULT_MEAL_PLAN,
  groceryList:[], // { id, text, checked, category }
  dailyPriorities:{},
  investments:{
    brokerage:{target:2000,contributions:[]},
    "401k":{target:1500,contributions:[]},
    hsa:{target:HSA_BIWEEKLY,contributions:[]},
  },
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

// ── CHAT ──────────────────────────────────────────────────────────────────────
function ChatPanel({tabId}){
  const[msgs,setMsgs]=useState([]);const[inp,setInp]=useState("");const[load,setLoad]=useState(false);const bot=useRef(null);
  useEffect(()=>{bot.current?.scrollIntoView({behavior:"smooth"});},[msgs,load]);
  const send=async()=>{
    const t=inp.trim();if(!t||load)return;setInp("");const nm=[...msgs,{role:"user",content:t}];setMsgs(nm);setLoad(true);
    try{const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:SP[tabId],tools:[{type:"web_search_20250305",name:"web_search"}],messages:nm})});
    const d=await r.json();const rep=d.content.filter(b=>b.type==="text").map(b=>b.text).join("\n").trim();
    setMsgs(p=>[...p,{role:"assistant",content:rep||"No response. Try rephrasing."}]);}catch{setMsgs(p=>[...p,{role:"assistant",content:"Something went wrong."}]);}setLoad(false);
  };
  return(
    <div className="flex flex-col rounded-2xl border border-slate-700/60 overflow-hidden bg-slate-900/50" style={{height:"240px"}}>
      <div className="px-4 py-2 border-b border-slate-700/50 flex items-center gap-2 flex-shrink-0">
        <div className="w-2 h-2 rounded-full bg-emerald-400" style={{animation:"pulse 2s infinite"}}/>
        <span className="text-xs text-slate-400 font-medium">Ask Claude</span>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {msgs.length===0&&<p className="text-xs text-slate-600 italic mt-1">{CP[tabId]}</p>}
        {msgs.map((m,i)=>(
          <div key={i} className={`flex ${m.role==="user"?"justify-end":"justify-start"}`}>
            <div className={`px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${m.role==="user"?"bg-rose-500/20 text-rose-100 border border-rose-500/30":"bg-slate-800 text-slate-200 border border-slate-700"}`} style={{maxWidth:"85%"}}>{m.content}</div>
          </div>
        ))}
        {load&&<div className="flex justify-start"><div className="bg-slate-800 border border-slate-700 px-3 py-2.5 rounded-xl flex gap-1">{[0,1,2].map(i=><span key={i} className="w-1.5 h-1.5 bg-slate-500 rounded-full inline-block" style={{animation:`bounce 1s infinite ${i*0.15}s`}}/>)}</div></div>}
        <div ref={bot}/>
      </div>
      <div className="px-3 py-2 border-t border-slate-700/50 flex gap-2 flex-shrink-0">
        <input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()} placeholder="Type a message..." className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-400/50"/>
        <button onClick={send} disabled={load||!inp.trim()} className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 disabled:opacity-30 border border-rose-500/40 text-rose-300 rounded-xl text-sm font-bold">↑</button>
      </div>
    </div>
  );
}

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
      <ChatPanel tabId="calendar"/>
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

// ── MEALS + GROCERY TAB ───────────────────────────────────────────────────────
function MealsTab({mealPlan,groceryList,onMealUpdate,onGroceryUpdate}){
  const[view,setView]=useState("meals");
  const[editing,setEditing]=useState(null);
  const[ev,setEv]=useState({meal:"",note:"",carries:false});
  const[newItem,setNewItem]=useState("");
  const[genLoading,setGenLoading]=useState(false);
  const today=new Date().toLocaleDateString("en-US",{weekday:"long"});

  const startEdit=d=>{setEditing(d);setEv({meal:mealPlan[d]?.meal||"",note:mealPlan[d]?.note||"",carries:mealPlan[d]?.carries||false});};
  const saveEdit=()=>{if(!ev.meal.trim())return;onMealUpdate({...mealPlan,[editing]:{...ev}});setEditing(null);};

  // Generate grocery list from meal plan
  const generateGrocery=async()=>{
    setGenLoading(true);
    // First try built-in mapping
    const known=new Set();
    const items=[];
    Object.values(mealPlan).forEach(m=>{
      const ingredients=MEAL_GROCERIES[m.meal]||[];
      ingredients.forEach(ing=>{
        if(!known.has(ing)){known.add(ing);items.push({id:Date.now()+Math.random(),text:ing,checked:false,source:"auto"});}
      });
    });

    if(items.length>0){
      // Also use Claude to augment for any custom meals not in our map
      const customMeals=Object.values(mealPlan).map(m=>m.meal).filter(m=>!MEAL_GROCERIES[m]&&!m.startsWith("Leftover"));
      if(customMeals.length>0){
        try{
          const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:500,
            system:"You generate grocery lists. Return ONLY a JSON array of ingredient strings. No markdown, no other text. No duplicates. Common pantry items like salt, pepper, olive oil can be omitted.",
            messages:[{role:"user",content:`Generate a grocery list for these meals: ${customMeals.join(", ")}. Return as JSON array of strings.`}]})});
          const d=await r.json();const txt=d.content.filter(b=>b.type==="text").map(b=>b.text).join("");
          const match=txt.match(/\[[\s\S]*?\]/);
          if(match){const extra=JSON.parse(match[0]);extra.forEach(ing=>{if(!known.has(ing)){known.add(ing);items.push({id:Date.now()+Math.random(),text:ing,checked:false,source:"auto"});}});}
        }catch{}
      }
      onGroceryUpdate(items);
    } else {
      // All custom meals — use Claude
      try{
        const meals=Object.values(mealPlan).filter(m=>!m.isLeftover).map(m=>m.meal).join(", ");
        const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,
          system:"Generate a grocery list. Return ONLY a JSON array of ingredient strings. No markdown. No duplicates. Omit common pantry staples like salt, pepper, olive oil.",
          messages:[{role:"user",content:`Weekly meals: ${meals}. Generate complete grocery list as JSON array.`}]})});
        const d=await r.json();const txt=d.content.filter(b=>b.type==="text").map(b=>b.text).join("");
        const match=txt.match(/\[[\s\S]*?\]/);
        if(match){const arr=JSON.parse(match[0]);onGroceryUpdate(arr.map((ing,i)=>({id:Date.now()+i,text:ing,checked:false,source:"auto"})));}
      }catch{}
    }
    setGenLoading(false);
  };

  const toggleItem=id=>onGroceryUpdate(groceryList.map(i=>i.id===id?{...i,checked:!i.checked}:i));
  const removeItem=id=>onGroceryUpdate(groceryList.filter(i=>i.id!==id));
  const addItem=()=>{if(newItem.trim()){onGroceryUpdate([...groceryList,{id:Date.now(),text:newItem.trim(),checked:false,source:"manual"}]);setNewItem("");}};
  const clearChecked=()=>onGroceryUpdate(groceryList.filter(i=>!i.checked));
  const unchecked=groceryList.filter(i=>!i.checked);
  const checked=groceryList.filter(i=>i.checked);

  return(
    <div className="space-y-5">
      <ChatPanel tabId="cooking"/>

      {/* Sub-tabs */}
      <div className="flex gap-1">
        {[["meals","🍽️ Meal Plan"],["grocery","🛒 Grocery List"]].map(([t,l])=>(
          <button key={t} onClick={()=>setView(t)} className={`flex-1 py-2 text-xs rounded-xl border transition-all ${view===t?"bg-amber-500/20 border-amber-500/40 text-amber-300 font-semibold":"border-slate-700 text-slate-500 hover:text-slate-300"}`}>{l}</button>
        ))}
      </div>

      {view==="meals"&&(
        <div className="space-y-2">
          {DAYS.map(day=>{
            const m=mealPlan[day];const isToday=day===today;
            return editing===day?(
              <div key={day} className="border border-rose-500/30 rounded-2xl p-4 bg-slate-800/60 space-y-3">
                <p className="text-sm font-semibold text-slate-200">{day}</p>
                <input value={ev.meal} onChange={e=>setEv(v=>({...v,meal:e.target.value}))} placeholder="Meal…" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none"/>
                <input value={ev.note} onChange={e=>setEv(v=>({...v,note:e.target.value}))} placeholder="Note (e.g. 'leftovers next day')…" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none"/>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400"><input type="checkbox" checked={ev.carries} onChange={e=>setEv(v=>({...v,carries:e.target.checked}))} className="rounded"/>Carries over to next day</label>
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="flex-1 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl text-sm font-semibold">Save</button>
                  <button onClick={()=>setEditing(null)} className="px-4 py-2 bg-slate-700 border border-slate-600 text-slate-400 rounded-xl text-sm">Cancel</button>
                </div>
              </div>
            ):(
              <button key={day} onClick={()=>startEdit(day)} className={`w-full flex items-start gap-3 px-4 py-3 rounded-2xl border text-left transition-all hover:border-amber-400/40 ${isToday?"border-amber-500/40 bg-amber-500/10":"border-slate-700 bg-slate-800/30"}`}>
                <div className="flex-shrink-0 mt-0.5 w-8">
                  <p className={`text-xs font-bold uppercase ${isToday?"text-amber-400":"text-slate-500"}`}>{day.slice(0,3)}</p>
                  {isToday&&<p className="text-xs text-amber-500/70">today</p>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium leading-tight ${m?.isLeftover?"text-slate-400 italic":"text-slate-200"}`}>{m?.meal||"Tap to add…"}</p>
                  {m?.note&&<p className="text-xs text-slate-500 mt-0.5">{m.note}</p>}
                </div>
                {m?.carries&&<span className="text-xs bg-amber-900/40 text-amber-400 border border-amber-700/40 px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5">+1</span>}
              </button>
            );
          })}
        </div>
      )}

      {view==="grocery"&&(
        <div className="space-y-4">
          {/* Generate button */}
          <button onClick={generateGrocery} disabled={genLoading}
            className="w-full py-3 bg-amber-500/20 hover:bg-amber-500/30 disabled:opacity-50 border border-amber-500/40 text-amber-300 rounded-2xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
            <span style={genLoading?{animation:"spin 0.8s linear infinite",display:"inline-block"}:{}}>{genLoading?"⟳":"✨"}</span>
            {genLoading?"Generating from your meal plan…":"Auto-generate from this week's meals"}
          </button>

          {/* Add manual item */}
          <div className="flex gap-2">
            <input value={newItem} onChange={e=>setNewItem(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addItem()} placeholder="Add item manually…"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400/50"/>
            <button onClick={addItem} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 rounded-xl text-sm font-bold">+</button>
          </div>

          {/* Stats */}
          {groceryList.length>0&&(
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">{unchecked.length} items remaining · {checked.length} got</p>
              {checked.length>0&&<button onClick={clearChecked} className="text-xs text-slate-600 hover:text-rose-400 transition-colors">Clear got ✕</button>}
            </div>
          )}

          {/* Grocery items */}
          {groceryList.length===0&&<p className="text-xs text-slate-700 italic px-1">No items yet — tap "Auto-generate" to build from your meals!</p>}
          <div className="space-y-1.5">
            {unchecked.map(item=>(
              <div key={item.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800/30 group">
                <button onClick={()=>toggleItem(item.id)} className="w-5 h-5 rounded border-2 border-slate-600 hover:border-amber-400 flex items-center justify-center flex-shrink-0 transition-colors"/>
                <span className="flex-1 text-sm text-slate-200">{item.text}</span>
                <button onClick={()=>removeItem(item.id)} className="opacity-0 group-hover:opacity-100 text-slate-700 hover:text-rose-400 transition-all text-lg leading-none">×</button>
              </div>
            ))}
          </div>
          {checked.length>0&&(
            <div className="space-y-1.5 opacity-50">
              <p className="text-xs text-slate-600 uppercase tracking-widest px-1">Got it ✓</p>
              {checked.map(item=>(
                <div key={item.id} className="flex items-center gap-3 px-3 py-2 rounded-xl border border-slate-800 bg-slate-800/20 group">
                  <button onClick={()=>toggleItem(item.id)} className="w-5 h-5 rounded bg-emerald-500 border-2 border-emerald-500 flex items-center justify-center flex-shrink-0 flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  </button>
                  <span className="flex-1 text-sm text-slate-500 line-through">{item.text}</span>
                  <button onClick={()=>removeItem(item.id)} className="opacity-0 group-hover:opacity-100 text-slate-700 hover:text-rose-400 transition-all text-lg leading-none">×</button>
                </div>
              ))}
            </div>
          )}

          {/* Pantry reminder */}
          <div className="px-3 py-2 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <p className="text-xs text-slate-500">🧂 Always check pantry: {PANTRY_STAPLES.join(", ")}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
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

  const savePri=p=>onUpdate("dailyPriorities",{...appData.dailyPriorities,[todayKey]:p});

  const getSugg=async()=>{
    setAiLoad(true);
    const pt=appData.tripTodos.flat().filter(t=>!t.done).slice(0,3).map(t=>t.text).join(", ");
    const pp=appData.pregnancyTodos.filter(t=>!t.done).slice(0,2).map(t=>t.text).join(", ");
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
      {/* Date banner */}
      <div className="bg-gradient-to-r from-rose-900/30 to-slate-900/30 border border-rose-800/30 rounded-2xl px-5 py-4">
        <p className="text-xs text-slate-500 uppercase tracking-widest">{dayName}</p>
        <p className="text-2xl font-bold text-white">{dateStr}</p>
        <div className="flex gap-2 mt-2 flex-wrap">
          <span className="text-xs bg-pink-500/20 text-pink-300 border border-pink-500/30 px-2 py-0.5 rounded-full">Week 20 🤰</span>
          {todayEvents.map((e,i)=><span key={i} className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">{e.title} {e.time}</span>)}
        </div>
      </div>

      {/* Today's meal */}
      <div className="bg-amber-900/20 border border-amber-700/30 rounded-2xl px-4 py-3">
        <p className="text-xs text-amber-400/70 uppercase tracking-widest mb-1">🍽️ Tonight's Dinner</p>
        <p className="text-sm font-semibold text-amber-100">{meal?.meal||"No meal planned"}</p>
        {meal?.note&&<p className="text-xs text-amber-300/60 mt-0.5">{meal.note}</p>}
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

      <ChatPanel tabId="dashboard"/>
    </div>
  );
}

// ── FINANCIALS ────────────────────────────────────────────────────────────────
function FinancialsTab({investments,onUpdate}){
  const[search,setSearch]=useState("");
  const[active,setActive]=useState(null);
  const[amt,setAmt]=useState("");
  const[showLog,setShowLog]=useState(false);
  const[finTab,setFinTab]=useState("overview"); // overview | buckets | portfolio | news
  const[netWorth,setNetWorth]=useState("");
  const[netWorthEdit,setNetWorthEdit]=useState(false);
  const[netWorthInput,setNetWorthInput]=useState("");
  const[news,setNews]=useState([]);
  const[newsLoad,setNewsLoad]=useState(false);
  const[newsError,setNewsError]=useState(null);

  // ── goal math ──
  const totalWeeklyEquiv=Object.values(investments).reduce((s,b,i)=>s+(BUCKETS[i].freq==="bi-weekly"?b.target/2:b.target),0);
  const allC=Object.values(investments).flatMap(b=>b.contributions).sort((a,b)=>a.week?.localeCompare(b.week||"")||0);
  const wElapsed=allC.length;const futW=Math.max(0,WEEKS-wElapsed);
  const futureFV=totalWeeklyEquiv*(Math.pow(1+WEEKLY_RATE,futW)-1)/WEEKLY_RATE;
  const currentFV=allC.reduce((s,c,i)=>s+c.amount*Math.pow(1+WEEKLY_RATE,wElapsed-i+futW),0);
  const projected=Math.round(currentFV+futureFV);
  const pct=Math.min((projected/GOAL)*100,100);
  const thisWeek=new Date().toISOString().slice(0,10);

  // ── net worth calc ──
  const totalNetWorth=parseFloat((netWorth||"").toString().replace(/,/g,""))||0;
  const nwToGoal=Math.min((totalNetWorth/GOAL)*100,100);
  const saveNetWorth=()=>{setNetWorth(netWorthInput);setNetWorthEdit(false);};

  const bucket=active?investments[active]:null;
  const thisEntry=bucket?.contributions.find(c=>c.week===thisWeek);
  const logC=()=>{
    const n=parseFloat(amt);if(isNaN(n)||n<=0||!active)return;
    const bd=investments[active];
    onUpdate({...investments,[active]:{...bd,contributions:[...bd.contributions.filter(c=>c.week!==thisWeek),{week:thisWeek,amount:n,date:new Date().toLocaleDateString()}]}});
    setAmt("");setShowLog(false);
  };
  const filtered=STOCKS.filter(s=>s.symbol.toLowerCase().includes(search.toLowerCase())||s.name.toLowerCase().includes(search.toLowerCase()));

  // ── live market news ──
  const fetchNews=async()=>{
    setNewsLoad(true);setNewsError(null);setNews([]);
    try{
      const mySymbols=STOCKS.map(s=>s.symbol).join(", ");
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1200,
          system:`You are a financial news analyst. Search the web for TODAY's stock market news. Return ONLY a JSON array of news items. Each item: {"headline":"...","summary":"...","sentiment":"positive"|"negative"|"neutral","tickers":["AAPL"],"type":"your_stock"|"trending"|"market"}. No markdown. No extra text. Focus on: stocks the user owns, what retail investors are buying today, and major market moves.`,
          tools:[{type:"web_search_20250305",name:"web_search"}],
          messages:[{role:"user",content:`Today is ${new Date().toLocaleDateString()}. Search for: 1) stock market news today, 2) most bought stocks today retail investors, 3) news on any of these: NVDA AAPL AMZN GOOGL AMD MU SOFI CAVA HIMS AXON. Return as JSON array of 6-8 news items with fields: headline, summary (1 sentence), sentiment (positive/negative/neutral), tickers (array), type (your_stock if it's one I own, trending if retail buying, market for general news).`}]})});
      const d=await r.json();
      const txt=d.content.filter(b=>b.type==="text").map(b=>b.text).join("");
      const match=txt.match(/\[[\s\S]*\]/);
      if(match){setNews(JSON.parse(match[0]));}
      else{setNewsError("Couldn't parse news. Try again.");}
    }catch(e){setNewsError("Failed to load news. Check connection.");}
    setNewsLoad(false);
  };

  const sentimentStyle={
    positive:"border-emerald-700/50 bg-emerald-900/20",
    negative:"border-rose-700/50 bg-rose-900/20",
    neutral:"border-slate-700 bg-slate-800/30",
  };
  const sentimentDot={positive:"bg-emerald-400",negative:"bg-rose-400",neutral:"bg-slate-500"};
  const typeBadge={
    your_stock:"bg-violet-500/20 text-violet-300 border-violet-500/30",
    trending:"bg-amber-500/20 text-amber-300 border-amber-500/30",
    market:"bg-sky-500/20 text-sky-300 border-sky-500/30",
  };
  const typeLabel={your_stock:"Your Stock",trending:"Trending",market:"Market"};

  return(
    <div className="space-y-5">
      <ChatPanel tabId="financials"/>

      {/* Sub-nav */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide">
        {[["overview","📊 Overview"],["networth","💎 Net Worth"],["buckets","🪣 Buckets"],["portfolio","📈 Portfolio"],["news","📰 News"]].map(([t,l])=>(
          <button key={t} onClick={()=>setFinTab(t)} className={`flex-shrink-0 px-3 py-1.5 text-xs rounded-xl border transition-all ${finTab===t?"bg-rose-500/20 border-rose-500/40 text-rose-300 font-semibold":"border-slate-700 text-slate-500 hover:text-slate-300"}`}>{l}</button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {finTab==="overview"&&(
        <div className="space-y-4">
          {/* Goal card */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-0.5">Retirement Goal</p>
                <p className="text-3xl font-bold text-white">$4.5M</p>
                <p className="text-xs text-slate-500 mt-0.5">by age 45 · {YEARS} years</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 mb-0.5">Projected</p>
                <p className="text-xl font-bold text-rose-300">${(projected/1e6).toFixed(2)}M</p>
                <p className="text-xs text-slate-500">{pct.toFixed(1)}% of goal</p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1"><span>Projected path</span><span>${GOAL.toLocaleString()}</span></div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-3 rounded-full transition-all duration-700" style={{width:`${pct}%`,background:"linear-gradient(90deg,#f43f5e,#a855f7,#10b981)"}}/>
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center">6% annual return · All buckets combined</p>
          </div>

          {/* Net worth snapshot */}
          {totalNetWorth>0?(
            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest">Net Worth</p>
                <p className="text-2xl font-bold text-white">${totalNetWorth.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-0.5">{nwToGoal.toFixed(1)}% of $4.5M goal</p>
              </div>
              <button onClick={()=>{setNetWorthInput(netWorth);setFinTab("networth");}} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 rounded-xl text-xs transition-colors">Edit</button>
            </div>
          ):(
            <button onClick={()=>{setNetWorthInput("");setFinTab("networth");}} className="w-full py-3 border border-dashed border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-500 rounded-2xl text-sm transition-colors">
              💎 Add your current net worth →
            </button>
          )}

          {/* Weekly targets summary */}
          <div className="grid grid-cols-3 gap-2">
            {BUCKETS.map(b=>{
              const bd=investments[b.id]||{target:0,contributions:[]};
              const hasThisWeek=bd.contributions.some(c=>c.week===thisWeek);
              const c=BC[b.color];
              return(
                <div key={b.id} className={`rounded-xl border p-2.5 text-center ${hasThisWeek?`${c.bg} ${c.border}`:"border-slate-700 bg-slate-800/30"}`}>
                  <p className="text-base">{b.emoji}</p>
                  <p className={`text-xs font-bold ${hasThisWeek?c.text:"text-slate-400"}`}>${bd.target.toLocaleString()}</p>
                  <p className="text-xs text-slate-600">{b.freq==="bi-weekly"?"bi-wkly":"wkly"}</p>
                  {hasThisWeek&&<p className="text-xs text-emerald-400 mt-0.5">✓ logged</p>}
                </div>
              );
            })}
          </div>

          {/* Quick news teaser */}
          <button onClick={()=>{setFinTab("news");fetchNews();}} className="w-full py-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 rounded-2xl text-sm text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center gap-2">
            📰 Load today's market news & what people are buying →
          </button>
        </div>
      )}

      {/* ── NET WORTH ── */}
      {finTab==="networth"&&(
        <div className="space-y-4">
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 space-y-4">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">💎 Current Net Worth</p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg font-semibold">$</span>
              <input
                value={netWorthInput}
                onChange={e=>setNetWorthInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&saveNetWorth()}
                type="number"
                placeholder="e.g. 150000"
                className="w-full bg-slate-900 border border-slate-600 rounded-2xl pl-8 pr-4 py-4 text-2xl font-bold text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400/60"
              />
            </div>
            <button onClick={saveNetWorth} className="w-full py-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-2xl text-sm font-semibold transition-colors">
              Save Net Worth
            </button>
          </div>
          {totalNetWorth>0&&(
            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Your net worth</p>
                  <p className="text-2xl font-bold text-white">${totalNetWorth.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 mb-0.5">Goal</p>
                  <p className="text-lg font-semibold text-slate-400">$4,500,000</p>
                </div>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-3 bg-emerald-500 rounded-full transition-all" style={{width:`${Math.min(nwToGoal,100)}%`}}/>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>{nwToGoal.toFixed(1)}% of goal</span>
                <span>${(Math.max(GOAL-totalNetWorth,0)).toLocaleString()} to go</span>
              </div>
            </div>
          )}
          <p className="text-xs text-slate-600 text-center">Saved to Google Drive · Update anytime</p>
        </div>
      )}

      {/* ── BUCKETS ── */}
      {finTab==="buckets"&&(
        <div className="space-y-3">
          {BUCKETS.map(b=>{
            const bd=investments[b.id]||{target:500,contributions:[]};const c=BC[b.color];const isA=active===b.id;
            const te=bd.contributions.find(cc=>cc.week===thisWeek);
            return(
              <div key={b.id} className={`rounded-2xl border p-4 ${isA?`${c.bg} ${c.border}`:c.bg+" border-slate-700/60"}`}>
                <button onClick={()=>setActive(isA?null:b.id)} className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-2"><span className="text-xl">{b.emoji}</span><div className="text-left"><p className="text-sm font-semibold text-slate-100">{b.label}</p><p className="text-xs text-slate-500">{b.description} · {b.freq}</p></div></div>
                  <div className="text-right"><p className={`text-base font-bold ${c.text}`}>${bd.target.toLocaleString()}</p><p className="text-xs text-slate-500">per {b.freq==="bi-weekly"?"2 wks":"wk"}</p></div>
                </button>
                {isA&&(
                  <div className="mt-3 space-y-3 border-t border-slate-700/50 pt-3">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-slate-400 flex-shrink-0">Target:</label>
                      <input type="number" defaultValue={bd.target} onBlur={e=>{const n=parseFloat(e.target.value);if(!isNaN(n))onUpdate({...investments,[b.id]:{...bd,target:n}});}} className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-sm text-slate-200 focus:outline-none"/>
                      {b.id==="hsa"&&<span className="text-xs text-emerald-400 flex-shrink-0">Max $8,300/yr</span>}
                    </div>
                    {!showLog||active!==b.id?(
                      <button onClick={()=>setShowLog(true)} className={`w-full py-2 border ${c.border} rounded-xl text-xs font-semibold ${c.text} hover:bg-white/5`}>
                        {te?`✓ Logged $${te.amount.toLocaleString()} this period`:`+ Log ${b.freq} contribution`}
                      </button>
                    ):(
                      <div className="flex gap-2">
                        <input value={amt} onChange={e=>setAmt(e.target.value)} onKeyDown={e=>e.key==="Enter"&&logC()} type="number" placeholder={`Target: $${bd.target}`} className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none"/>
                        <button onClick={logC} className={`px-3 py-2 border ${c.border} ${c.text} rounded-xl text-sm font-bold hover:bg-white/5`}>Log</button>
                        <button onClick={()=>setShowLog(false)} className="px-3 py-2 bg-slate-700 text-slate-400 rounded-xl text-sm">✕</button>
                      </div>
                    )}
                    {bd.contributions.length>0&&(
                      <div className="space-y-1 max-h-28 overflow-y-auto">
                        {bd.contributions.slice(-5).reverse().map((cc,i)=>(
                          <div key={i} className="flex justify-between px-2 py-1 rounded-lg bg-slate-900/40 text-xs">
                            <span className="text-slate-500">{cc.date||cc.week}</span>
                            <span className={`font-semibold ${cc.amount>=bd.target?c.text:"text-amber-400"}`}>${cc.amount.toLocaleString()} {cc.amount>=bd.target?"✓":"↓"}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── PORTFOLIO ── */}
      {finTab==="portfolio"&&(
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2 text-center"><p className="text-base font-bold text-emerald-400">{STOCKS.filter(s=>s.chg>0).length}</p><p className="text-xs text-slate-500">Up today</p></div>
            <div className="flex-1 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2 text-center"><p className="text-base font-bold text-rose-400">{STOCKS.filter(s=>s.chg<0).length}</p><p className="text-xs text-slate-500">Down today</p></div>
            <div className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-center"><p className="text-base font-bold text-slate-300">{STOCKS.length}</p><p className="text-xs text-slate-500">Holdings</p></div>
          </div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search symbol or name…" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-400/50"/>
          <div className="space-y-1.5">
            {filtered.map(s=>(
              <div key={s.symbol} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${s.chg>=0?"border-emerald-900/60 bg-emerald-900/10":"border-rose-900/60 bg-rose-900/10"}`}>
                <div className="flex-1 min-w-0"><p className="text-sm font-bold text-slate-100">{s.symbol}</p><p className="text-xs text-slate-500 truncate">{s.name}</p></div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-slate-200">${s.price.toFixed(2)}</p>
                  <p className={`text-xs font-medium ${s.chg>=0?"text-emerald-400":"text-rose-400"}`}>{s.chg>=0?"+":""}{s.chg.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── NEWS ── */}
      {finTab==="news"&&(
        <div className="space-y-4">
          <button onClick={fetchNews} disabled={newsLoad}
            className="w-full py-3 bg-slate-800/60 hover:bg-slate-800 disabled:opacity-50 border border-slate-700 rounded-2xl text-sm font-semibold text-slate-300 transition-colors flex items-center justify-center gap-2">
            <span style={newsLoad?{animation:"spin 0.8s linear infinite",display:"inline-block"}:{}}>{newsLoad?"⟳":"📰"}</span>
            {newsLoad?"Searching markets & news…":"Refresh market news"}
          </button>

          {/* Legend */}
          <div className="flex gap-2 flex-wrap">
            {[["your_stock","Your Stocks"],["trending","Trending / Retail Buys"],["market","Market News"]].map(([t,l])=>(
              <span key={t} className={`text-xs px-2 py-0.5 rounded-full border ${typeBadge[t]}`}>{l}</span>
            ))}
          </div>

          {newsError&&<p className="text-xs text-rose-400 px-1">{newsError}</p>}

          {news.length===0&&!newsLoad&&!newsError&&(
            <p className="text-xs text-slate-600 italic px-1">Tap "Refresh" to load today's stock news, market movers, and what retail investors are buying.</p>
          )}

          <div className="space-y-3">
            {news.map((item,i)=>(
              <div key={i} className={`rounded-2xl border p-4 space-y-2 ${sentimentStyle[item.sentiment]||sentimentStyle.neutral}`}>
                <div className="flex items-start gap-2">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${sentimentDot[item.sentiment]||sentimentDot.neutral}`}/>
                  <p className="text-sm font-semibold text-slate-100 leading-snug flex-1">{item.headline}</p>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed pl-4">{item.summary}</p>
                <div className="flex items-center gap-2 pl-4 flex-wrap">
                  {item.type&&<span className={`text-xs px-2 py-0.5 rounded-full border ${typeBadge[item.type]||typeBadge.market}`}>{typeLabel[item.type]||item.type}</span>}
                  {(item.tickers||[]).map(t=>(
                    <span key={t} className="text-xs bg-slate-700/60 text-slate-300 px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {news.length>0&&(
            <p className="text-xs text-slate-600 text-center">News is AI-sourced via web search · Not financial advice</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── PLANTS TAB — watering schedule ───────────────────────────────────────────
function PlantsTab({data,onUpdate}){
  const[view,setView]=useState("schedule");
  const[show,setShow]=useState(false);
  const[np,setNp]=useState({name:"",sunlight:"Indirect Bright",watering:"Weekly",notes:"",photo:null,lastWatered:null});
  const today=new Date();
  const getDaysUntil=(plant)=>{const freq=WATER_DAYS[plant.watering]||7;if(!plant.lastWatered)return 0;const last=new Date(plant.lastWatered);const next=new Date(last.getTime()+freq*86400000);return Math.ceil((next-today)/86400000);};
  const markWatered=(id)=>onUpdate(data.map(p=>p.id===id?{...p,lastWatered:today.toISOString().split("T")[0]}:p));
  const add=()=>{if(!np.name.trim())return;onUpdate([...data,{...np,id:Date.now()}]);setNp({name:"",sunlight:"Indirect Bright",watering:"Weekly",notes:"",photo:null,lastWatered:null});setShow(false);};
  const sorted=[...data].sort((a,b)=>getDaysUntil(a)-getDaysUntil(b));
  const needsWater=sorted.filter(p=>getDaysUntil(p)<=0);
  const upcoming=sorted.filter(p=>getDaysUntil(p)>0);
  return(
    <div className="space-y-5">
      <ChatPanel tabId="plants"/>
      <div className="flex gap-1">{[["schedule","💧 Schedule"],["list","🌿 All Plants"]].map(([t,l])=><button key={t} onClick={()=>setView(t)} className={`flex-1 py-2 text-xs rounded-xl border transition-all ${view===t?"bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-semibold":"border-slate-700 text-slate-500 hover:text-slate-300"}`}>{l}</button>)}</div>
      {view==="schedule"&&(<div className="space-y-4">
        {data.length===0&&<p className="text-xs text-slate-700 italic px-1">Add plants to see your watering schedule.</p>}
        {needsWater.length>0&&(<div><div className="flex items-center gap-2 mb-2"><div className="w-2 h-2 rounded-full bg-rose-400" style={{animation:"pulse 2s infinite"}}/><h3 className="text-xs uppercase tracking-widest text-rose-400 font-semibold">Water Now ({needsWater.length})</h3></div><div className="space-y-2">{needsWater.map(p=>{const days=getDaysUntil(p);return(<div key={p.id} className="flex items-center gap-3 px-3 py-3 rounded-xl border border-rose-700/50 bg-rose-900/15">{p.photo?<img src={p.photo} alt={p.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0"/>:<div className="w-10 h-10 rounded-xl bg-rose-900/40 flex items-center justify-center text-lg flex-shrink-0">🌿</div>}<div className="flex-1 min-w-0"><p className="text-sm font-semibold text-slate-100">{p.name}</p><p className="text-xs text-rose-400">{days===0?"Due today":`${Math.abs(days)} day${Math.abs(days)!==1?"s":""} overdue`} · {p.watering}</p></div><button onClick={()=>markWatered(p.id)} className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-semibold flex-shrink-0">💧 Done</button></div>);})}</div></div>)}
        {upcoming.length>0&&(<div><h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-2">Coming Up</h3><div className="space-y-2">{upcoming.map(p=>{const days=getDaysUntil(p);const urgency=days<=2?"text-amber-400":days<=5?"text-sky-400":"text-slate-500";return(<div key={p.id} className="flex items-center gap-3 px-3 py-3 rounded-xl border border-slate-700 bg-slate-800/30">{p.photo?<img src={p.photo} alt={p.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0"/>:<div className="w-10 h-10 rounded-xl bg-emerald-900/40 flex items-center justify-center text-lg flex-shrink-0">🌿</div>}<div className="flex-1 min-w-0"><p className="text-sm font-semibold text-slate-100">{p.name}</p><p className={`text-xs ${urgency}`}>Water in {days} day{days!==1?"s":""} · {p.watering}</p><p className="text-xs text-slate-600">{p.sunlight}</p></div><button onClick={()=>markWatered(p.id)} className="px-2 py-1 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-400 rounded-lg text-xs flex-shrink-0">💧</button></div>);})}</div></div>)}
      </div>)}
      {view==="list"&&(<div className="space-y-3">
        <div className="flex items-center justify-between"><h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold">My Houseplants ({data.length})</h3><button onClick={()=>setShow(!show)} className="px-3 py-1.5 bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-700/40 text-emerald-400 rounded-xl text-xs font-medium">+ Add</button></div>
        {show&&(<div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 space-y-3"><input value={np.name} onChange={e=>setNp(p=>({...p,name:e.target.value}))} placeholder="Plant name…" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none"/><div className="grid grid-cols-2 gap-2"><select value={np.sunlight} onChange={e=>setNp(p=>({...p,sunlight:e.target.value}))} className="bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-xs text-slate-200 focus:outline-none">{SUNLIGHT_OPT.map(o=><option key={o}>{o}</option>)}</select><select value={np.watering} onChange={e=>setNp(p=>({...p,watering:e.target.value}))} className="bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-xs text-slate-200 focus:outline-none">{WATER_OPT.map(o=><option key={o}>{o}</option>)}</select></div><textarea value={np.notes} onChange={e=>setNp(p=>({...p,notes:e.target.value}))} placeholder="Notes…" rows={2} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none resize-none"/><div className="flex gap-2"><button onClick={add} className="flex-1 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-xl text-sm font-semibold">Add</button><button onClick={()=>setShow(false)} className="px-4 py-2 bg-slate-700 border border-slate-600 text-slate-300 rounded-xl text-sm">Cancel</button></div></div>)}
        <div className="space-y-2">{data.map(p=><div key={p.id} className="border border-slate-700 rounded-xl overflow-hidden bg-slate-900/40 p-3 flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-emerald-900/40 flex items-center justify-center text-lg flex-shrink-0">{p.photo?<img src={p.photo} alt={p.name} className="w-10 h-10 rounded-xl object-cover"/>:"🌿"}</div><div className="flex-1 min-w-0"><p className="text-sm font-semibold text-slate-100">{p.name}</p><p className="text-xs text-slate-500">{p.sunlight} · {p.watering}</p></div><button onClick={()=>onUpdate(data.filter(x=>x.id!==p.id))} className="text-slate-700 hover:text-rose-400 text-lg leading-none">×</button></div>)}</div>
        {data.length===0&&<p className="text-xs text-slate-700 italic px-1">No houseplants yet</p>}
      </div>)}
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
      <ChatPanel tabId="gardening"/>
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

function TravelsTab({tripTodos,onUpdate}){const[open,setOpen]=useState(0);const tog=(ti,id)=>onUpdate(tripTodos.map((arr,i)=>i===ti?arr.map(t=>t.id===id?{...t,done:!t.done}:t):arr));return(<div className="space-y-5"><ChatPanel tabId="travels"/><div className="space-y-3">{TRIPS.map((trip,ti)=><div key={ti} className={`rounded-2xl border p-4 ${trip.color}`}><button onClick={()=>setOpen(open===ti?-1:ti)} className="w-full flex items-center justify-between"><div><p className="font-semibold text-slate-100 text-sm">{trip.name}</p><p className="text-xs text-slate-400">{trip.dates}</p></div><span className="text-slate-400">{open===ti?"▲":"▼"}</span></button>{open===ti&&<div className="mt-4 space-y-4"><div className="space-y-1.5">{trip.items.map((d,i)=><div key={i} className="flex items-center gap-2.5"><span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${trip.badge} flex-shrink-0`}>{d.date}</span><p className="text-sm text-slate-200">{d.event}</p></div>)}</div><div><p className="text-xs uppercase tracking-widest text-slate-500 mb-2">To Do</p><div className="space-y-1.5">{(tripTodos[ti]||[]).map(t=><button key={t.id} onClick={()=>tog(ti,t.id)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border text-left ${t.done?"opacity-40 border-slate-800":"border-slate-700/60 bg-slate-800/30"}`}><span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${t.done?"bg-emerald-500 border-emerald-500":"border-slate-500"}`}>{t.done&&<svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}</span><span className={`text-xs ${t.done?"line-through text-slate-600":"text-slate-300"}`}>{t.text}</span></button>)}</div></div></div>}</div>)}</div></div>);}

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
      <ChatPanel tabId="pregnancy"/>
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

function RoutineTab({checked,workouts,onCheckedUpdate,onWorkoutsUpdate}){const today=new Date().toLocaleDateString("en-US",{weekday:"long"});const[sel,setSel]=useState(DAYS.includes(today)?today:"Monday");const[showF,setShowF]=useState(false);const[form,setForm]=useState({date:new Date().toISOString().split("T")[0],type:"",duration:"",notes:""});const key=(d,i)=>`${d}-${i}`;const tog=(d,i)=>onCheckedUpdate({...checked,[key(d,i)]:!checked[key(d,i)]});const tasks=ROUTINE[sel]||[];const done=tasks.filter((_,i)=>checked[key(sel,i)]).length;const addW=()=>{if(!form.type.trim())return;onWorkoutsUpdate([{...form,id:Date.now()},...workouts]);setForm({date:new Date().toISOString().split("T")[0],type:"",duration:"",notes:""});setShowF(false);};return(<div className="space-y-5"><ChatPanel tabId="routine"/><div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">{DAYS.map(d=><button key={d} onClick={()=>setSel(d)} className={`flex-shrink-0 px-2 py-1.5 text-xs rounded-lg ${sel===d?"bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold":"text-slate-500 hover:text-slate-300 border border-transparent"}`}>{d.slice(0,3)}</button>)}</div><div className="flex justify-between items-center"><h3 className="text-sm font-semibold text-slate-200">{sel}</h3><span className="text-xs text-slate-500">{done}/{tasks.length}</span></div><div className="h-1.5 bg-slate-800 rounded-full"><div className="h-1.5 bg-rose-500 rounded-full" style={{width:tasks.length?`${(done/tasks.length)*100}%`:"0%"}}/></div><div className="space-y-1.5">{tasks.map((task,i)=>{const isDone=checked[key(sel,i)];const time=task.split(" ")[0];const desc=task.slice(time.length+1);return(<button key={i} onClick={()=>tog(sel,i)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left ${isDone?"border-slate-800 opacity-40":"border-slate-700 bg-slate-800/30 hover:border-rose-400/30"}`}><span className="text-xs font-mono text-slate-600 w-10 flex-shrink-0">{time}</span><span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${isDone?"bg-emerald-500 border-emerald-500":"border-slate-600"}`}>{isDone&&<svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}</span><span className={`text-sm flex-1 ${isDone?"line-through text-slate-600":"text-slate-300"}`}>{desc}</span></button>);})}</div><div><div className="flex items-center justify-between mb-3"><h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Workout Log</h3><button onClick={()=>setShowF(!showF)} className="px-3 py-1.5 bg-rose-900/30 hover:bg-rose-900/50 border border-rose-700/40 text-rose-400 rounded-xl text-xs font-medium">+ Log</button></div>{showF&&<div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 space-y-2.5 mb-3"><div className="flex gap-2"><input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"/><input value={form.duration} onChange={e=>setForm(f=>({...f,duration:e.target.value}))} placeholder="Duration" className="w-24 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none"/></div><input value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} placeholder="Workout type…" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none"/><input value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Notes (optional)" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none"/><div className="flex gap-2"><button onClick={addW} disabled={!form.type} className="flex-1 py-2 bg-rose-500/20 hover:bg-rose-500/30 disabled:opacity-30 border border-rose-500/40 text-rose-300 rounded-xl text-sm font-semibold">Save</button><button onClick={()=>setShowF(false)} className="px-4 py-2 bg-slate-700 border border-slate-600 text-slate-300 rounded-xl text-sm">Cancel</button></div></div>}{workouts.length===0?<p className="text-xs text-slate-700 italic px-1">No workouts logged yet 💪</p>:<div className="space-y-2">{workouts.slice(0,8).map(l=><div key={l.id} className="flex items-start gap-3 px-3 py-3 rounded-xl border border-slate-700 bg-slate-800/30 group"><div className="flex-1"><div className="flex items-center gap-2"><p className="text-sm font-semibold text-slate-200">{l.type}</p>{l.duration&&<span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{l.duration}</span>}</div><p className="text-xs text-slate-500 mt-0.5">{l.date}</p>{l.notes&&<p className="text-xs text-slate-400 mt-1">{l.notes}</p>}</div><button onClick={()=>onWorkoutsUpdate(workouts.filter(x=>x.id!==l.id))} className="opacity-0 group-hover:opacity-100 text-slate-700 hover:text-rose-400 text-lg">×</button></div>)}</div>}</div></div>);}

function ReadingTab({currentBook,readingLog,wishlist,onUpdate}){const[tab,setTab]=useState("current");const[nw,setNw]=useState("");const[lf,setLf]=useState({date:new Date().toISOString().split("T")[0],pages:"",notes:""});const addW=()=>{if(nw.trim()){onUpdate("wishlist",[...wishlist,{id:Date.now(),title:nw.trim(),added:new Date().toLocaleDateString()}]);setNw("");}};const addL=()=>{if(!lf.pages)return;onUpdate("readingLog",[{...lf,id:Date.now()},...readingLog]);setLf({date:new Date().toISOString().split("T")[0],pages:"",notes:""});};return(<div className="space-y-5"><ChatPanel tabId="reading"/><div className="flex gap-2"><div className="flex-1 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2 text-center"><p className="text-lg font-bold text-amber-400">{readingLog.length}</p><p className="text-xs text-slate-500">Sessions</p></div><div className="flex-1 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2 text-center"><p className="text-lg font-bold text-amber-400">{readingLog.reduce((s,l)=>s+(parseInt(l.pages)||0),0)}</p><p className="text-xs text-slate-500">Pages</p></div><div className="flex-1 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2 text-center"><p className="text-lg font-bold text-amber-400">{wishlist.length}</p><p className="text-xs text-slate-500">Want to read</p></div></div><div className="flex gap-1">{[["current","📖 Current"],["log","📝 Log"],["wishlist","🔖 Wishlist"]].map(([t,l])=><button key={t} onClick={()=>setTab(t)} className={`flex-1 py-2 text-xs rounded-xl border ${tab===t?"bg-amber-500/20 border-amber-500/40 text-amber-300 font-semibold":"border-slate-700 text-slate-500 hover:text-slate-300"}`}>{l}</button>)}</div>{tab==="current"&&<div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 space-y-3"><input value={currentBook.title} onChange={e=>onUpdate("currentBook",{...currentBook,title:e.target.value})} placeholder="Book title…" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none"/><input value={currentBook.author} onChange={e=>onUpdate("currentBook",{...currentBook,author:e.target.value})} placeholder="Author…" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none"/><div className="flex gap-2"><input value={currentBook.pages} onChange={e=>onUpdate("currentBook",{...currentBook,pages:e.target.value})} placeholder="Total pages" className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none"/><input type="date" value={currentBook.startDate} onChange={e=>onUpdate("currentBook",{...currentBook,startDate:e.target.value})} className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"/></div><textarea value={currentBook.notes} onChange={e=>onUpdate("currentBook",{...currentBook,notes:e.target.value})} placeholder="Notes / thoughts…" rows={3} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none resize-none"/></div>}{tab==="log"&&<div className="space-y-3"><div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 space-y-3"><div className="flex gap-2"><input type="date" value={lf.date} onChange={e=>setLf(f=>({...f,date:e.target.value}))} className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"/><input value={lf.pages} onChange={e=>setLf(f=>({...f,pages:e.target.value}))} placeholder="Pages" type="number" className="w-24 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none"/></div><input value={lf.notes} onChange={e=>setLf(f=>({...f,notes:e.target.value}))} placeholder="Quick note…" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none"/><button onClick={addL} disabled={!lf.pages} className="w-full py-2 bg-amber-500/20 hover:bg-amber-500/30 disabled:opacity-30 border border-amber-500/40 text-amber-300 rounded-xl text-sm font-semibold">Log Session</button></div><div className="space-y-1.5">{readingLog.slice(0,10).map(l=><div key={l.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800/30"><div className="flex-1"><p className="text-sm text-slate-200">{l.pages} pages</p>{l.notes&&<p className="text-xs text-slate-500">{l.notes}</p>}</div><span className="text-xs text-slate-600">{l.date}</span></div>)}{readingLog.length===0&&<p className="text-xs text-slate-700 italic px-1">No sessions logged yet</p>}</div></div>}{tab==="wishlist"&&<div className="space-y-3"><div className="flex gap-2"><input value={nw} onChange={e=>setNw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addW()} placeholder="Add book title…" className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400/50"/><button onClick={addW} className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl text-sm font-bold">+</button></div><div className="space-y-2">{wishlist.map(b=><div key={b.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800/30 group"><span className="text-amber-400">🔖</span><div className="flex-1"><p className="text-sm text-slate-200">{b.title}</p><p className="text-xs text-slate-600">Added {b.added}</p></div><button onClick={()=>onUpdate("wishlist",wishlist.filter(x=>x.id!==b.id))} className="opacity-0 group-hover:opacity-100 text-slate-700 hover:text-rose-400 text-lg">×</button></div>)}{wishlist.length===0&&<p className="text-xs text-slate-700 italic px-1">No books yet</p>}</div></div>}</div>);}

function HabitsTab({habits,habitLog,onHabitsUpdate,onLogUpdate}){const today=new Date().toISOString().split("T")[0];const[selDate,setSelDate]=useState(today);const todayLog=habitLog[selDate]||{};const[newH,setNewH]=useState("");const[showAdd,setShowAdd]=useState(false);const COLORS=["rose","emerald","amber","sky","violet","pink"];const[ci,setCi]=useState(0);const tog=id=>onLogUpdate({...habitLog,[selDate]:{...todayLog,[id]:!todayLog[id]}});const addH=()=>{if(!newH.trim())return;onHabitsUpdate([...habits,{id:Date.now(),label:newH.trim(),color:COLORS[ci%COLORS.length]}]);setNewH("");setShowAdd(false);};const last7=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);const k=d.toISOString().split("T")[0];const l=habitLog[k]||{};const done=habits.filter(h=>l[h.id]).length;return{k,done,total:habits.length,label:d.toLocaleDateString("en-US",{weekday:"short"})};});return(<div className="space-y-5"><ChatPanel tabId="habits"/><div className="flex gap-2 items-end">{last7.map((d,i)=>{const pct=d.total>0?(d.done/d.total)*100:0;const isT=d.k===today;return(<div key={i} className="flex-1 flex flex-col items-center gap-1"><div className="w-full bg-slate-800 rounded-lg overflow-hidden" style={{height:"40px"}}><div className="w-full rounded-lg" style={{height:`${pct}%`,background:pct===100?"#10b981":pct>50?"#f59e0b":"#475569",marginTop:`${100-pct}%`}}/></div><p className={`text-xs ${isT?"text-rose-400 font-bold":"text-slate-600"}`}>{d.label}</p></div>);})}</div><p className="text-xs text-slate-500 text-center">{habits.filter(h=>todayLog[h.id]).length}/{habits.length} done today</p><input type="date" value={selDate} onChange={e=>setSelDate(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"/><div className="space-y-2">{habits.map(h=>{const done=todayLog[h.id];const bc=HABIT_BORDERS[h.color]||"border-slate-500/40 text-slate-300";const bg=HABIT_COLORS[h.color]||"bg-slate-500";return(<button key={h.id} onClick={()=>tog(h.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-left ${done?`${bc} bg-white/5`:"border-slate-700 bg-slate-800/30"}`}><div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 ${done?`${bg} border-transparent`:"border-slate-600"}`}>{done&&<svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}</div><span className={`text-sm flex-1 ${done?"text-slate-300 line-through":"text-slate-200"}`}>{h.label}</span>{done&&<span className="text-xs text-emerald-400">✓</span>}</button>);})}</div>{showAdd?<div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 space-y-3"><input value={newH} onChange={e=>setNewH(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addH()} placeholder="New habit…" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none"/><div className="flex gap-1.5">{COLORS.map((c,i)=><button key={c} onClick={()=>setCi(i)} className={`w-6 h-6 rounded-full ${HABIT_COLORS[c]} ${ci===i?"ring-2 ring-white ring-offset-2 ring-offset-slate-800":""}`}/>)}</div><div className="flex gap-2"><button onClick={addH} className="flex-1 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 rounded-xl text-sm font-semibold">Add</button><button onClick={()=>setShowAdd(false)} className="px-4 py-2 bg-slate-700 border border-slate-600 text-slate-300 rounded-xl text-sm">Cancel</button></div></div>:<button onClick={()=>setShowAdd(true)} className="w-full py-2.5 border border-dashed border-slate-700 text-slate-600 hover:text-slate-400 hover:border-slate-500 rounded-2xl text-sm">+ Add habit</button>}</div>);}

function GenericTab({tabId,items,notes,onItemsUpdate,onNotesUpdate}){const[input,setInput]=useState("");const add=()=>{if(input.trim()){onItemsUpdate([...items,{id:Date.now(),text:input.trim(),done:false}]);setInput("");}};return(<div className="space-y-5"><ChatPanel tabId={tabId}/><div><h3 className="text-xs uppercase tracking-widest text-slate-500 mb-2 font-semibold">Checklist</h3><div className="flex gap-2 mb-2"><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="Add item…" className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-400/50"/><button onClick={add} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-300 rounded-xl text-sm font-bold">+</button></div>{items.length===0&&<p className="text-xs text-slate-700 italic px-1">No items yet</p>}<div className="space-y-1.5">{items.map(item=><div key={item.id} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-800 bg-slate-800/30 group"><button onClick={()=>onItemsUpdate(items.map(i=>i.id===item.id?{...i,done:!i.done}:i))} className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${item.done?"bg-emerald-500 border-emerald-500":"border-slate-600 hover:border-slate-400"}`}>{item.done&&<svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}</button><span className={`flex-1 text-sm ${item.done?"line-through text-slate-600":"text-slate-300"}`}>{item.text}</span><button onClick={()=>onItemsUpdate(items.filter(i=>i.id!==item.id))} className="opacity-0 group-hover:opacity-100 text-slate-700 hover:text-rose-400 text-lg">×</button></div>)}</div></div><div><h3 className="text-xs uppercase tracking-widest text-slate-500 mb-2 font-semibold">Notes</h3><textarea value={notes} onChange={e=>onNotesUpdate(e.target.value)} rows={4} placeholder="Jot anything down…" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-300 placeholder-slate-700 focus:outline-none focus:border-rose-400/40 resize-none leading-relaxed"/></div></div>);}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App(){
  const[activeTab,setActiveTab]=useState("dashboard");
  const[appData,setAppData]=useState(DEFAULT_DATA);
  const[saveStatus,setSaveStatus]=useState("idle");
  const[loadStatus,setLoadStatus]=useState("loading");
  const saveTimeout=useRef(null);

  useEffect(()=>{(async()=>{const saved=await loadFromDrive();if(saved)setAppData(prev=>({...prev,...saved}));setLoadStatus("ready");})();},[]);

  const triggerSave=useCallback((newData)=>{
    clearTimeout(saveTimeout.current);setSaveStatus("saving");
    saveTimeout.current=setTimeout(async()=>{const ok=await saveToDrive(newData);setSaveStatus(ok?"saved":"error");setTimeout(()=>setSaveStatus("idle"),3000);},1500);
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
            <div className="flex items-baseline gap-2"><h1 className="text-xl font-bold">My Life</h1><span className="text-slate-600 text-xs tracking-widest uppercase">workspace</span></div>
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
        {activeTab==="financials"&&<FinancialsTab investments={appData.investments} onUpdate={v=>update("investments",v)}/>}
        {activeTab==="travels"&&<TravelsTab tripTodos={appData.tripTodos} onUpdate={v=>update("tripTodos",v)}/>}
        {activeTab==="plants"&&<PlantsTab data={appData.plants} onUpdate={v=>update("plants",v)}/>}
        {activeTab==="cooking"&&<MealsTab mealPlan={appData.mealPlan} groceryList={appData.groceryList} onMealUpdate={v=>update("mealPlan",v)} onGroceryUpdate={v=>update("groceryList",v)}/>}
        {activeTab==="pregnancy"&&<PregnancyTab todos={appData.pregnancyTodos} buyList={appData.babyBuyList||BABY_BUY_LIST} onTodosUpdate={v=>update("pregnancyTodos",v)} onBuyUpdate={v=>update("babyBuyList",v)}/>}
        {activeTab==="gardening"&&<GardeningTab data={appData.gardenPlants} onUpdate={v=>update("gardenPlants",v)}/>}
        {activeTab==="routine"&&<RoutineTab checked={appData.routineChecked} workouts={appData.workouts} onCheckedUpdate={v=>update("routineChecked",v)} onWorkoutsUpdate={v=>update("workouts",v)}/>}
        {activeTab==="reading"&&<ReadingTab currentBook={appData.currentBook} readingLog={appData.readingLog} wishlist={appData.wishlist} onUpdate={update}/>}
        {activeTab==="habits"&&<HabitsTab habits={appData.habits} habitLog={appData.habitLog} onHabitsUpdate={v=>update("habits",v)} onLogUpdate={v=>update("habitLog",v)}/>}
        {activeTab==="sidejob"&&<GenericTab tabId="sidejob" items={appData.sidejobItems} notes={appData.sidejobNotes} onItemsUpdate={v=>update("sidejobItems",v)} onNotesUpdate={v=>update("sidejobNotes",v)}/>}
      </div>
    </div>
  );
}
