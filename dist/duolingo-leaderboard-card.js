export class DuolingoLeaderboardCard extends HTMLElement {
    constructor() {
        super();
    }

    setConfig(config) {
        if (!config.entity) {
            throw new Error("Define entity.");
        }
        this.config = { ...config };
        this.title = config.title || "";
        this.include_all = config.include_all || false;
        this.entity = config.entity;
    }

    set hass(hass) {
        if (!this.content) {
            const card = document.createElement("ha-card");
            card.header = this.title;
            this.content = document.createElement("div");
            this.content.style.display = "flex";
            this.content.style.justifyContent = "space-around";
            this.content.style.padding = "25px 25px 45px 25px";

            // Generate "bubbles" for top 3 users
            this.bubbles = {};
            const bubles_ids = [2, 1, 3]
            for(var i = 0; i < 3; i++) {
            //users.forEach((user, index) => {
                const bubble = document.createElement("div");
                bubble.style.display = "flex";
                bubble.style.flexDirection = "column";
                bubble.style.alignItems = "center";
                bubble.style.borderRadius = "50%";
                bubble.style.width = "100px";
                bubble.style.height = "100px";
                bubble.style.padding = "3px";
                bubble.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
                
                // User Picture
                const img = document.createElement("img");
                //img.src = user.picture;
                img.style.width = "100%";
                img.style.height = "100%";
                img.style.borderRadius = "50%";
                bubble.appendChild(img);
                
                // Username
                const name = document.createElement("div");
                //name.innerText = user.username;
                name.style.fontSize = "12px";
                name.style.marginTop = "5px";
                bubble.appendChild(name);

                // XP
                const xp = document.createElement("div");
                xp.style.fontSize = "12px";
                bubble.appendChild(xp);

                // Place (Position) in bottom-right corner
                const place = document.createElement("div");
                place.style.position = "absolute";
                place.style.backgroundColor = "#ffcc00";
                place.style.color = "#000";
                place.style.fontSize = "10px";
                place.style.borderRadius = "50%";
                place.style.width = "1.5em";
                place.style.height = "1.5em";
                place.style.display = "flex";
                place.style.alignItems = "center";
                place.style.justifyContent = "center";
                place.style.fontSize = "1.5em";
                place.style.transform = "translate(calc(50% + 1em), calc(50% + 2.75em))";
                bubble.appendChild(place);
                
                switch(i) {
                    case 0:
                        bubble.style.marginTop = "15px";
                        bubble.style.backgroundColor = "silver";
                        place.style.backgroundColor = "silver";
                        break;
                    case 1:
                        bubble.style.marginBottom = "25px";
                        bubble.style.backgroundColor = "gold";
                        place.style.backgroundColor = "gold";
                        break;
                    default:
                        bubble.style.marginTop = "25px";
                        bubble.style.backgroundColor = "#CD7F32";
                        place.style.backgroundColor = "#CD7F32"; // brozne
                        break;
                    }
                // Append each bubble to content div
                this.content.appendChild(bubble);
                this.bubbles[`${bubles_ids[i]}`] = {img, name, place, xp};
                this.others = [];
            }

            card.appendChild(this.content);
            this.appendChild(card);
        }
        const entityState = hass.states[this.config.entity];
        const attrs = entityState.attributes;
        
        for(var key in attrs) {
            var attr = attrs[key];
            if(typeof(attr) == "object") {
                if(this.bubbles[key] != undefined) {
                    this.bubbles[key].img.src = attr.avatar;
                    this.bubbles[key].name.innerText = attr.username;
                    this.bubbles[key].place.innerText = key;
                    this.bubbles[key].xp.innerText = `${attr.xp} XP`;
                }
            }
        }
    }

    getCardSize() {
        return 1;
    }
}

customElements.define("duolingo-leaderboard-card", DuolingoLeaderboardCard);

// Configure the preview in the Lovelace card picker
window.customCards = window.customCards || [];
if (!window.customCards.some(card => card.type === 'duolingo-leaderboard-card')) {
  window.customCards.push({
    type: 'duolingo-leaderboard-card',
    name: 'Duolingo Leaderboard Card',
    preview: true,
    description: 'Displays the Duolingo leaderboard for the specified entity.',
    previewImage: 'https://example.com/path-to-your-preview-image.png',
  });
}
