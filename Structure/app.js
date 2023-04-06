// Get the selected country from the query parameter
const urlParams = new URLSearchParams(window.location.search);
const country = urlParams.get("country");

// Generate dynamic content based on the selected country
let content;
if (country === "vietnam") {
  content =
    "<p>Vietnam is a country located in Southeast Asia. It has a rich history and culture, and is known for its delicious food and beautiful landscapes.</p>";
} else if (country === "china") {
  content =
    "<p>China is a country located in East Asia. It is the world's most populous country, and has a rich cultural heritage dating back thousands of years.</p>";
} else {
  content = "<p>Invalid country selected.</p>";
}

// Insert the dynamic content into the page
const contentElement = document.getElementById("content");
contentElement.innerHTML = content;
