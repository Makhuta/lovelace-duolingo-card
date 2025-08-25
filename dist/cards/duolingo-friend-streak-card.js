const LitElement = customElements.get("hui-masonry-view") ? Object.getPrototypeOf(customElements.get("hui-masonry-view")) : Object.getPrototypeOf(customElements.get("hui-view"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

class DuolingoFriendStreakCard extends LitElement {
  static get properties() {
    return {
      hass: {},
      config: {},
    };
  }

  static get styles() {
    return css`
      :host {
        --duolingo-green: #58CC02;
      }

      .card-content {
        padding: 16px;
      }

      .friend-streak-user {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .streak-avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        object-fit: cover;
      }

      .streak-details h4 {
        color: var(--primary-text-color);
        margin-bottom: 8px;
        font-size: 18px;
      }

      .streak-length {
        font-size: 24px;
        font-weight: bold;
        color: var(--duolingo-green);
        margin-bottom: 4px;
      }

      .streak-dates {
        color: var(--secondary-text-color);
        font-size: 14px;
        margin-bottom: 12px;
      }

      .streak-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-top: 16px;
      }

      .stat-item {
        text-align: center;
        padding: 12px;
        background: var(--secondary-background-color, #f5f5f5);
        border-radius: 8px;
      }

      .stat-label {
        font-size: 12px;
        color: var(--secondary-text-color);
        text-transform: uppercase;
        font-weight: 600;
        margin-bottom: 4px;
      }

      .stat-value {
        font-size: 16px;
        font-weight: bold;
        color: var(--duolingo-green);
      }

      .error-message {
        color: var(--error-color, #ff4444);
        text-align: center;
        padding: 20px;
        font-style: italic;
      }

      @media (max-width: 768px) {
        .friend-streak-user {
          flex-direction: column;
          text-align: center;
        }
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

    const streakData = this.getFriendStreakData();
    
    if (!streakData) {
      return html`
        <ha-card header="${this.config.title}">
          <div class="card-content">
            <div class="error-message">
              ${this.config.entity ? 'Entity not found or no friend streak data available' : 'Please configure an entity'}
            </div>
          </div>
        </ha-card>
      `;
    }

    return html`
      <ha-card header="${this.config.title}">
        <div class="card-content">
          <div class="friend-streak-user">
            <img src="${streakData.picture || streakData.avatar || 'https://simg-ssl.duolingo.com/avatar/default_2/large'}" 
                 alt="Friend" class="streak-avatar"
                 @error="${this._handleImageError}">
            <div class="streak-details">
              <h4>${this.config.show_name ? (streakData.name || streakData.displayName || streakData.display_name || streakData.username || 'Friend') : (streakData.username || streakData.name || streakData.displayName || streakData.display_name || 'Friend')}</h4>
              <div class="streak-length">
                ${streakData.length || 0} days
              </div>
              <div class="streak-dates">
                ${this.formatDate(streakData.startDate || streakData.start_date)} - ${this.formatDate(streakData.endDate || streakData.end_date)}
              </div>
            </div>
          </div>
          
          ${this.renderStreakStats(streakData)}
        </div>
      </ha-card>
    `;
  }

  renderStreakStats(data) {
    const stats = [];
    
    if (data.length !== undefined) {
      stats.push({
        label: 'Current Streak',
        value: `${data.length} days`
      });
    }
    
    if (data.extended !== undefined) {
      stats.push({
        label: 'Extended Today',
        value: data.extended ? 'Yes' : 'No'
      });
    }
    
    if (stats.length === 0) return '';
    
    return html`
      <div class="streak-stats">
        ${stats.map(stat => html`
          <div class="stat-item">
            <div class="stat-label">${stat.label}</div>
            <div class="stat-value">${stat.value}</div>
          </div>
        `)}
      </div>
    `;
  }

  getFriendStreakData() {
    if (!this.config.entity || !this.hass.states[this.config.entity]) {
      return null;
    }

    const entity = this.hass.states[this.config.entity];
    
    if (entity.attributes.duolingo_data && entity.attributes.duolingo_data.friendStreak) {
      return entity.attributes.duolingo_data.friendStreak;
    }
    
    if (entity.attributes.friend_streak || entity.attributes.friendStreak) {
      return entity.attributes.friend_streak || entity.attributes.friendStreak;
    }
    
    if (entity.attributes.name || entity.attributes.length !== undefined) {
      return entity.attributes;
    }
    
    return null;
  }

  formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      });
    } catch (error) {
      return dateString;
    }
  }

  _handleImageError(e) {
    e.target.src = 'https://simg-ssl.duolingo.com/avatar/default_2/large';
  }

  getCardSize() {
    return 3;
  }

  static getConfigElement() {
    return document.createElement("duolingo-friend-streak-card-editor");
  }

  static getStubConfig() {
    return {
      type: "custom:duolingo-friend-streak-card",
      entity: "",
      title: "Friend Streak"
    };
  }
}

customElements.define("duolingo-friend-streak-card", DuolingoFriendStreakCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "duolingo-friend-streak-card",
  name: "Duolingo Friend Streak Card",
  description: "Displays Duolingo friend streak information"
});