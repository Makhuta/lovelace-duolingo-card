const LitElement = customElements.get("hui-masonry-view")
  ? Object.getPrototypeOf(customElements.get("hui-masonry-view"))
  : Object.getPrototypeOf(customElements.get("hui-view"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

class DuolingoLeaderboardCard extends LitElement {
  static get properties() {
    return {
      hass: {},
      config: {},
    };
  }

  static get styles() {
    return css`
      :host {
        --duolingo-gold: #ffc800;
        --leaderboard-gold: #ffc800;
        --leaderboard-silver: #c0c0c0;
        --leaderboard-bronze: #cd7f32;
      }

      .card-content {
        padding: 16px;
      }

      .podium {
        display: flex;
        justify-content: center;
        align-items: flex-end;
        gap: 20px;
        margin-bottom: 20px;
      }

      .podium-place {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        text-align: center;
        padding: 8px;
        border-radius: 8px;
        flex: 1;
      }

      .podium-place .avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        object-fit: cover;
        margin-bottom: 8px;
        border: 3px solid white;
      }

      .podium-place.first {
        background: var(--leaderboard-gold);
        height: 140px;
      }

      .podium-place.second {
        background: var(--leaderboard-silver);
        height: 120px;
      }

      .podium-place.third {
        background: var(--leaderboard-bronze);
        height: 100px;
      }

      .podium-name {
        font-weight: 600;
        color: #000;
      }

      .podium-xp {
        font-size: 14px;
        color: #333;
      }

      .friends-list {
        max-height: 400px;
        overflow-y: auto;
      }

      .friends-list::-webkit-scrollbar {
        width: 6px;
      }

      .friends-list::-webkit-scrollbar-track {
        background: var(--divider-color);
      }

      .friends-list::-webkit-scrollbar-thumb {
        background: var(--duolingo-gold);
        border-radius: 3px;
      }

      .friend-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 0;
        border-bottom: 1px solid var(--divider-color);
      }

      .friend-item:last-child {
        border-bottom: none;
      }

      .friend-rank {
        font-weight: bold;
        min-width: 24px;
        font-size: 16px;
      }

      .friend-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
      }

      .friend-info {
        flex: 1;
      }

      .friend-name {
        font-weight: 600;
        color: var(--primary-text-color);
        display: block;
        margin-bottom: 2px;
      }

      .friend-xp {
        color: var(--secondary-text-color);
        font-size: 14px;
      }

      .error-message,
      .no-friends {
        text-align: center;
        padding: 20px;
        font-style: italic;
      }

      .error-message {
        color: var(--error-color, #ff4444);
      }

      .no-friends {
        color: var(--secondary-text-color);
      }
    `;
  }

  setConfig(config) {
    if (!config || !config.entity) {
      throw new Error("Invalid configuration");
    }
    this.config = config;
  }

  render() {
    if (!this.config) return html``;

    const friendsData = this.getFriendsData();

    if (!friendsData) {
      return html`
        <ha-card header="${this.config.title}">
          <div class="card-content">
            <div class="error-message">
              Entity not found or no leaderboard data available
            </div>
          </div>
        </ha-card>
      `;
    }

    const friendsArray = this.prepareFriendsArray(friendsData);

    if (friendsArray.length === 0) {
      return html`
        <ha-card header="${this.config.title}">
          <div class="card-content">
            <div class="no-friends">No users found</div>
          </div>
        </ha-card>
      `;
    }

    // Split podium & rest
    const top3 = friendsArray.slice(0, 3);
    const rest = friendsArray.slice(3);

    return html`
      <ha-card header="${this.config.title}">
        <div class="card-content">
          <div class="podium">
            ${this.renderPodiumPlace(top3[1], 2, "second")}
            ${this.renderPodiumPlace(top3[0], 1, "first")}
            ${this.renderPodiumPlace(top3[2], 3, "third")}
          </div>
          <div class="friends-list">
            ${rest.map((friend, index) =>
              this.renderFriendItem(friend, index + 4)
            )}
          </div>
        </div>
      </ha-card>
    `;
  }

  renderPodiumPlace(friend, rank, cls) {
    if (!friend) return html``;
    var avatar = friend.avatar || friend.avatar_url;
    avatar = avatar ? avatar.endsWith("large") ? avatar : avatar + "/large" : avatar
    return html`
      <div class="podium-place ${cls}">
        <img
          class="avatar"
          src="${avatar ||
          "https://simg-ssl.duolingo.com/avatar/default_2/large"}"
          alt="${friend.fullname || friend.username || friend.display_name}"
          @error="${this._handleImageError}"
        />
        <div class="podium-name">${friend.fullname || friend.username || friend.display_name}</div>
        <div class="podium-xp">${this.formatNumber(friend.xp || friend.score || 0)} XP</div>
      </div>
    `;
  }

  renderFriendItem(friend, rank) {
    var avatar = friend.avatar || friend.avatar_url;
    avatar = avatar ? avatar.endsWith("large") ? avatar : avatar + "/large" : avatar
    return html`
      <div class="friend-item">
        <div class="friend-rank">${rank}</div>
        <img
          src="${avatar ||
          "https://simg-ssl.duolingo.com/avatar/default_2/large"}"
          alt="${friend.fullname || friend.username}"
          class="friend-avatar"
          @error="${this._handleImageError}"
        />
        <div class="friend-info">
          <span class="friend-name">${friend.fullname || friend.username || friend.display_name}</span>
          <span class="friend-xp">${this.formatNumber(friend.xp || friend.score || 0)} XP</span>
        </div>
      </div>
    `;
  }

  getFriendsData() {
    if (!this.config.entity || !this.hass.states[this.config.entity]) {
      return null;
    }
    return this.hass.states[this.config.entity].attributes;
  }

  prepareFriendsArray(data) {
    const filtered = Object.keys(data)
      .filter((k) => !isNaN(k)) // only numeric keys "1", "2", ...
      .map((k) => data[k]);
    const sorted = filtered.sort((a, b) => (b.xp || b.score || 0) - (a.xp || a.score || 0));
    return (this.config && !isNaN(this.config.max_people) && this.config.max_people > 0) ? (sorted.slice(0, this.config.max_people)) : sorted
  }

  getEntityName() {
    const entity = this.hass.states[this.config.entity];
    return entity ? entity.attributes.friendly_name : "";
  }

  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  }

  _handleImageError(e) {
    e.target.src = "https://simg-ssl.duolingo.com/avatar/default_2/large";
  }

  getCardSize() {
    return 5;
  }

  static getConfigElement() {
    return document.createElement("duolingo-leaderboard-card-editor");
  }

  static getStubConfig() {
    return {
      type: "custom:duolingo-leaderboard-card",
      entity: "",
      title: "Duolingo Leaderboard"
    };
  }
}

customElements.define("duolingo-leaderboard-card", DuolingoLeaderboardCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "duolingo-leaderboard-card",
  name: "Duolingo Leaderboard Card",
  description: "Displays Duolingo leaderboards"
});