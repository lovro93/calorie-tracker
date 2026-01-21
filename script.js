const kcalGoal = 2400;
const proteinGoal = 250;

const foods = {
  chicken_breast:{type:"grams",name:"Pileća prsa",kcal:165,protein:31,carbs:0,fat:3.6},
  chicken_thigh:{type:"grams",name:"Pileći zabatak",kcal:180,protein:25,carbs:0,fat:8},
  salmon:{type:"grams",name:"Losos",kcal:208,protein:22,carbs:0,fat:13},
  tuna:{type:"grams",name:"Tuna",kcal:116,protein:26,carbs:0,fat:1},
  beef:{type:"grams",name:"Juneći but",kcal:170,protein:29,carbs:0,fat:5},
  pork_tenderloin:{type:"grams",name:"Svinjski lungić",kcal:143,protein:26,carbs:0,fat:3.5},
  pork_leg:{type:"grams",name:"Svinjski but",kcal:160,protein:27,carbs:0,fat:4.5},
  pasta:{type:"grams",name:"Tjestenina kuhana",kcal:131,protein:5,carbs:25,fat:1.1},
  rice:{type:"grams",name:"Riža kuhana",kcal:130,protein:2.7,carbs:28,fat:0.3},
  potato:{type:"grams",name:"Krumpir kuhani",kcal:77,protein:2,carbs:17,fat:0.1},
  oats:{type:"grams",name:"Zobene pahuljice",kcal:389,protein:16.9,carbs:66.3,fat:6.9},

  olive_oil:{type:"grams",name:"Maslinovo ulje",kcal:884,protein:0,carbs:0,fat:100},
  sunflower_oil:{type:"grams",name:"Suncokretovo ulje",kcal:884,protein:0,carbs:0,fat:100},

  broccoli:{type:"grams",name:"Brokula kuhana",kcal:35,protein:2.4,carbs:7,fat:0.4},
  carrot:{type:"grams",name:"Mrkva kuhana",kcal:41,protein:0.9,carbs:10,fat:0.2},
  peas:{type:"grams",name:"Grašak kuhani",kcal:84,protein:5.4,carbs:15,fat:0.4},
  beans:{type:"grams",name:"Grah kuhani",kcal:127,protein:8.7,carbs:22,fat:0.5},

  mayo_light:{type:"grams",name:"Thommy majoneza light",kcal:270,protein:1,carbs:6,fat:25},
  ketchup:{type:"grams",name:"Ketchup",kcal:112,protein:1.3,carbs:26,fat:0.2},
  mustard:{type:"grams",name:"Senf",kcal:66,protein:4.4,carbs:6.3,fat:4},

  tortilla_m:{type:"unit",unit:"kom",name:"Tortilla M",kcal:150,protein:4,carbs:25,fat:4},
  tortilla_l:{type:"unit",unit:"kom",name:"Tortilla L",kcal:220,protein:6,carbs:35,fat:6},

  egg:{type:"unit",unit:"kom",name:"Jaje",kcal:78,protein:6.3,carbs:0.6,fat:5.3},
  whey:{type:"unit",unit:"scoop",name:"Whey (1 scoop)",kcal:120,protein:24,carbs:3,fat:1},
  toast:{type:"unit",unit:"kriška",name:"Tost kruh",kcal:70,protein:2.5,carbs:13,fat:1},
  beer:{type:"unit",unit:"boca",name:"Heineken 0.33L",kcal:139,protein:1.5,carbs:11,fat:0}
};

const foodSelect = document.getElementById("foodSelect");
const amountInput = document.getElementById("amountInput");
const list = document.getElementById("list");

const kcalTotalEl = document.getElementById("kcalTotal");
const proteinTotalEl = document.getElementById("proteinTotal");
const carbsTotalEl = document.getElementById("carbsTotal");
const fatTotalEl = document.getElementById("fatTotal");
const kcalPercentEl = document.getElementById("kcalPercent");
const proteinPercentEl = document.getElementById("proteinPercent");
const kcalProgress = document.getElementById("kcalProgress");
const warning = document.getElementById("warning");

let entries = JSON.parse(localStorage.getItem("entries")) || [];

// populate select
Object.keys(foods).forEach(key => {
  const option = document.createElement("option");
  option.value = key;
  option.textContent = foods[key].name;
  foodSelect.appendChild(option);
});

function calculate(food, amount) {
  const factor = food.type === "grams" ? amount / 100 : amount;
  return {
    kcal: Math.round(food.kcal * factor),
    protein: +(food.protein * factor).toFixed(1),
    carbs: +(food.carbs * factor).toFixed(1),
    fat: +(food.fat * factor).toFixed(1)
  };
}

function render() {
  list.innerHTML = "";
  let totals = { kcal: 0, protein: 0, carbs: 0, fat: 0 };

  entries.forEach((e, index) => {
    totals.kcal += e.kcal;
    totals.protein += e.protein;
    totals.carbs += e.carbs;
    totals.fat += e.fat;

    const li = document.createElement("li");
    li.innerHTML = `
      <span class="entry-text">
        ${e.name} – ${e.amount} ${e.unit}
        | ${e.kcal} kcal
        | P:${e.protein} C:${e.carbs} F:${e.fat}
      </span>
      <button class="delete" type="button">❌</button>
    `;

    li.querySelector(".delete").addEventListener("click", () => {
      entries.splice(index, 1);
      render();
    });

    list.appendChild(li);
  });

  kcalTotalEl.textContent = totals.kcal;
  proteinTotalEl.textContent = totals.protein.toFixed(1);
  carbsTotalEl.textContent = totals.carbs.toFixed(1);
  fatTotalEl.textContent = totals.fat.toFixed(1);

  const rawPercent = (totals.kcal / kcalGoal) * 100;
  const capped = Math.min(rawPercent, 100);

  kcalPercentEl.textContent = rawPercent.toFixed(0) + "%";
  kcalProgress.style.width = capped + "%";

  if (rawPercent > 100) {
    kcalProgress.style.background = "#ff5252";
    warning.textContent = "SVINJO 🐷 PRETJERAO SI";
  } else {
    kcalProgress.style.background = "";
    warning.textContent = "";
  }

  proteinPercentEl.textContent =
    Math.min((totals.protein / proteinGoal) * 100, 100).toFixed(0) + "%";

  localStorage.setItem("entries", JSON.stringify(entries));
}

function addEntry() {
  const amount = Number(amountInput.value);
  if (!amount) return;

  const food = foods[foodSelect.value];
  const macros = calculate(food, amount);

  entries.push({
    name: food.name,
    amount,
    unit: food.type === "grams" ? "g" : food.unit,
    ...macros
  });

  amountInput.value = "";
  amountInput.blur(); // iPhone zoom/keyboard UX
  render();
}

// click + touch (da bude top na iPhoneu)
document.getElementById("addBtn").addEventListener("click", addEntry, { passive: true });
document.getElementById("addBtn").addEventListener("touchstart", addEntry, { passive: true });
amountInput.addEventListener("keydown", e => e.key === "Enter" && addEntry());

document.getElementById("resetBtn").addEventListener("click", () => {
  entries = [];
  localStorage.clear();
  render();
});

render();

// service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
