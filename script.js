const searchBtn = document.getElementById("search-btn");
const mealList = document.getElementById("meal");
const mealDetailsContent = document.querySelector(".meal-details-content");
const recipeCloseBtn = document.getElementById("recipe-close-btn");
const fav_cont = document.querySelector(".favoris_container");

//affcicher les favoris
fetchFavMeals();
// event listeners
searchBtn.addEventListener("click", getMealList);
mealList.addEventListener("click", getMealRecipe);
recipeCloseBtn.addEventListener("click", () => {
  mealDetailsContent.parentElement.classList.remove("showRecipe");
});

// get meal list that matches with the ingredients
async function getMealList() {
  let searchInputTxt = document.getElementById("search-input").value.trim();
  fetch(
    `https://www.themealdb.com/api/json/v1/1/filter.php?i=${searchInputTxt}`
  )
    .then((response) => response.json())
    .then((data) => {
      let html = "";
      if (data.meals) {
        data.meals.forEach((meal) => {
          html += `
                    <div class = "meal-item" data-id = "${meal.idMeal}">
                        <div class = "meal-img">
                            <img src = "${meal.strMealThumb}" alt = "food">
                        </div>
                        <div class = "meal-name">
                            <h3>${meal.strMeal}</h3>
                            <a href = "#" class = "recipe-btn">Get Recipe</a>
                            <button class="fav-btn">
                            &#10084;
                             </button>
                        </div>
                    </div>
                `;
        });

        mealList.classList.remove("notFound");
      } else {
        html = "Sorry, we didn't find any meal!";
        mealList.classList.add("notFound");
      }
      mealList.innerHTML = html;

      const favBtns = document.querySelectorAll(".fav-btn");

      favBtns.forEach((favBtn) => {
        favBtn.addEventListener("click", async (e) => {
          const item = await getMealitem(e);
          if (favBtn.classList.contains("favoris_active")) {
            removeMealLS(item);
            favBtn.classList.remove("favoris_active");
            fetchFavMeals();
          } else {
            addMealLS(item);
            addFav(item);
            favBtn.classList.add("favoris_active");
          }
        });
      });
      const meals = document.querySelectorAll(".meal-item");
      const mealsID = getMealLS();
      meals.forEach((item) => {
        const button = item.querySelector(".fav-btn"); // Get the button element within each meal-item

        for (var i = 0; i < mealsID.length; i++) {
          if (item.dataset.id === mealsID[i][0].idMeal) {
            button.classList.add("favoris_active"); // Add the class to the button element
          }
        }
      });
    });
}
// get recipe of the meal
function getMealRecipe(e) {
  e.preventDefault();
  if (e.target.classList.contains("recipe-btn")) {
    let mealItem = e.target.parentElement.parentElement;
    fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealItem.dataset.id}`
    )
      .then((response) => response.json())
      .then((data) => mealRecipeModal(data.meals));
  }
}

// create a modal
function mealRecipeModal(meal) {
  console.log(meal);
  meal = meal[0];
  let html = `
        <h2 class = "recipe-title">${meal.strMeal}</h2>
        <p class = "recipe-category">${meal.strCategory}</p>
        <div class = "recipe-instruct">
            <h3>Instructions:</h3>
            <p>${meal.strInstructions}</p>
        </div>
        <div class = "recipe-meal-img">
            <img src = "${meal.strMealThumb}" alt = "">
        </div>
        <div class = "recipe-link">
            <a href = "${meal.strYoutube}" target = "_blank">Watch Video</a>
        </div>
    `;
  mealDetailsContent.innerHTML = html;
  mealDetailsContent.parentElement.classList.add("showRecipe");
}

function addMealLS(meal) {
  const mealIds = getMealLS();
  for (var i = 0; i < mealIds.length; i++) {
    var innerArray = mealIds[i];

    // Parcourir les objets dans chaque tableau interne
    for (var j = 0; j < innerArray.length; j++) {
      if (innerArray[0].idMeal === meal[0].idMeal) {
        return 0; // Repas déjà présent, retourne 0 ou une autre valeur indiquant qu'il existe déjà
      }
    }
  }

  // Le repas n'est pas présent, l'ajouter au stockage local
  localStorage.setItem("mealIds", JSON.stringify([...mealIds, meal]));
}

function getMealLS() {
  const mealIds = JSON.parse(localStorage.getItem("mealIds"));

  return mealIds === null ? [] : mealIds;
}

function removeMealLS(meal) {
  const mealIds = getMealLS();

  localStorage.setItem(
    "mealIds",
    JSON.stringify(
      mealIds.filter((meal_sk) => meal_sk[0].idMeal !== meal[0].idMeal)
    )
  );
}

async function fetchFavMeals() {
  fav_cont.innerHTML = "";

  const mealIds = getMealLS();

  for (let i = 0; i < mealIds.length; i++) {
    const meal = mealIds[i];
    addFav(meal);
  }
}

function addFav(item) {
  const fav = document.createElement("div");
  fav.innerHTML = ` 
  <div class="favoris">
  <img src="${item[0].strMealThumb}" alt="" />
  <h5>${item[0].strMeal}</h5>
  </div>`;
  fav_cont.append(fav);
}

async function getMealitem(e) {
  let mealItem = e.target.parentElement.parentElement;
  const response = await fetch(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealItem.dataset.id}`
  );
  const data = await response.json();

  return data.meals;
}
