// Duolingo Cards Bundle - Single import file for all cards
// Add this single resource to Home Assistant to load all card types

// Import all individual card components
import "./cards/duolingo-user-card.js";
import "./cards/duolingo-streak-card.js";
import "./cards/duolingo-leaderboard-card.js";
import "./cards/duolingo-language-card.js";
import "./cards/duolingo-challenge-card.js";
import "./cards/duolingo-friends-card.js";
import "./cards/duolingo-quest-card.js";
import "./cards/duolingo-friend-streak-card.js";

// Import all card editors
import "./cards/duolingo-card-editors.js";

console.info(
  `%c  DUOLINGO-CARDS-BUNDLE \n%c  Version 1.0.0     `,
  "color: orange; font-weight: bold; background: black",
  "color: white; font-weight: bold; background: dimgray"
);