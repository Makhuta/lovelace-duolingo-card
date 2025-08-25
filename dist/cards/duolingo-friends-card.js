const LitElement = customElements.get("hui-masonry-view") ? Object.getPrototypeOf(customElements.get("hui-masonry-view")) : Object.getPrototypeOf(customElements.get("hui-view"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

class DuolingoFriendsCard extends LitElement {
  static get properties() {
    return {
      hass: {},
      config: {},
    };
  }

  static get styles() {
    return css`
      :host {
        --duolingo-gold: #FFC800;
      }

      .card-content {
        padding: 16px;
      }

      .friends-list {
        max-height: 400px;
        overflow-y: auto;
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
        color: var(--duolingo-gold);
        min-width: 24px;
        font-size: 16px;
      }

      .friend-avatar {
        width: 40px;
        height: 40px;
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

      .subscription-badge {
        background: var(--duolingo-gold);
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12px;
        margin-left: 8px;
        font-weight: 600;
      }

      .error-message {
        color: var(--error-color, #ff4444);
        text-align: center;
        padding: 20px;
        font-style: italic;
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

      .no-friends {
        text-align: center;
        color: var(--secondary-text-color);
        padding: 20px;
        font-style: italic;
      }
    `;
  }

  setConfig(config) {
    if (!config) {
      throw new Error('Invalid configuration');
    }
    this.config = config;
  }

  render() {
    if (!this.config) {
      return html``;
    }

    const friendsData = this.getFriendsData();
    
    if (!friendsData) {
      return html`
        <ha-card header="${this.config.title}">
          <div class="card-content">
            <div class="error-message">
              ${this.config.entity ? 'Entity not found or no friends data available' : 'Please configure an entity'}
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
            <div class="no-friends">No friends found</div>
          </div>
        </ha-card>
      `;
    }

    return html`
      <ha-card header="${this.config.title}">
        <div class="card-content">
          <div class="friends-list">
            ${friendsArray.map((friend, index) => this.renderFriendItem(friend, index + 1))}
          </div>
        </div>
      </ha-card>
    `;
  }

  renderFriendItem(friend, rank) {
    return html`
      <div class="friend-item">
        <div class="friend-rank">${rank}</div>
        <img src="${friend.picture || friend.avatar || 'https://simg-ssl.duolingo.com/avatar/default_2/large'}" 
             alt="${friend.displayName || friend.display_name || friend.name}" 
             class="friend-avatar"
             @error="${this._handleImageError}">
        <div class="friend-info">
          <span class="friend-name">
            ${friend.displayName || friend.display_name || friend.name || 'Unknown'}
            ${(friend.hasSubscription || friend.has_subscription) ? html`<span class="subscription-badge">PLUS</span>` : ''}
          </span>
          <span class="friend-xp">${this.formatNumber(friend.totalXp || friend.total_xp || friend.xp || 0)} XP</span>
        </div>
      </div>
    `;
  }

  getFriendsData() {
    if (!this.config.entity || !this.hass.states[this.config.entity]) {
      return null;
    }

    const entity = this.hass.states[this.config.entity];
    
    return entity.attributes;
  }

  prepareFriendsArray(friendsData) {
    let friendsArray = [];
    
    if (Array.isArray(friendsData)) {
      friendsArray = friendsData;
    } else if (typeof friendsData === 'object') {
      friendsArray = Object.values(friendsData);
    }

    const sorted = friendsArray.filter(f => f.displayName || f.display_name).sort((a, b) => {
      const aXp = a.totalXp || a.total_xp || a.xp || 0;
      const bXp = b.totalXp || b.total_xp || b.xp || 0;
      return bXp - aXp;
    });
    return (this.config && !isNaN(this.config.max_people) && this.config.max_people > 0) ? (sorted.slice(0, this.config.max_people)) : sorted
  }

  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  _handleImageError(e) {
    e.target.src = 'https://simg-ssl.duolingo.com/avatar/default_2/large';
  }

  getCardSize() {
    return 5;
  }

  static getConfigElement() {
    return document.createElement("duolingo-friends-card-editor");
  }

  static getStubConfig() {
    return {
      type: "custom:duolingo-friends-card",
      entity: "",
      title: "Duolingo Friends"
    };
  }
}

customElements.define("duolingo-friends-card", DuolingoFriendsCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "duolingo-friends-card",
  name: "Duolingo Friends Card",
  description: "Displays Duolingo friends leaderboard"
});