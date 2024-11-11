import { DuolingoProfileCard } from './duolingo-profile-card.js';
import { DuolingoFriendsCard } from './duolingo-friends-card.js';
import { DuolingoLeaderboardCard } from './duolingo-leaderboard-card.js';

// Ensure the custom elements are defined
if (!customElements.get('duolingo-profile-card')) {
    customElements.define('duolingo-profile-card', DuolingoProfileCard);
}

if (!customElements.get('duolingo-friends-card')) {
    customElements.define('duolingo-friends-card', DuolingoFriendsCard);
}

if (!customElements.get('duolingo-leaderboard-card')) {
    customElements.define('duolingo-leaderboard-card', DuolingoLeaderboardCard);
}