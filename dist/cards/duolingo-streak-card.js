const LitElement = customElements.get("hui-masonry-view") ? Object.getPrototypeOf(customElements.get("hui-masonry-view")) : Object.getPrototypeOf(customElements.get("hui-view"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

class DuolingoStreakCard extends LitElement {
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

      .streak-display {
        text-align: center;
      }

      .streak-number {
        font-size: 48px;
        font-weight: bold;
        color: var(--duolingo-green);
        margin-bottom: 8px;
      }

      .streak-unit {
        font-size: 16px;
        color: var(--secondary-text-color);
        display: block;
      }

      .streak-info p {
        margin: 4px 0;
        color: var(--secondary-text-color);
      }

      .streak-extended {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: var(--duolingo-green);
        font-weight: 600;
        margin-top: 12px;
      }

      .error-message {
        color: var(--error-color, #ff4444);
        text-align: center;
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

    const streakData = this.getStreakData();
    
    if (!streakData) {
      return html`
        <ha-card header="${this.config.title}">
          <div class="card-content">
            <div class="error-message">
              ${this.config.entity ? 'Entity not found or no streak data available' : 'Please configure an entity'}
            </div>
          </div>
        </ha-card>
      `;
    }

    return html`
      <ha-card header="${this.config.title}">
        <div class="card-content">
          <div class="streak-display">
            <div class="streak-number">
              <span>${streakData.length || 0}</span>
              <span class="streak-unit">days</span>
            </div>
            <div class="streak-info">
              <p>Daily Goal: ${streakData.dailyGoal || streakData.daily_goal || 20} XP</p>
              <p>XP Goal: ${streakData.xpGoal || streakData.xp_goal || 10} XP</p>
              ${streakData.streakExtendedToday || streakData.streak_extended_today ? html`
                <div class="streak-extended">
                  <ha-icon icon="mdi:check-circle"></ha-icon>
                  <span>Streak Extended Today!</span>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  getStreakData() {
    if (!this.config.entity || !this.hass.states[this.config.entity]) {
      return null;
    }

    const entity = this.hass.states[this.config.entity];
    
    if (entity.attributes.duolingo_data && entity.attributes.duolingo_data.streak) {
      return entity.attributes.duolingo_data.streak;
    }
    
    if (entity.attributes.streak) {
      return entity.attributes.streak;
    }
    
    if (entity.attributes.length !== undefined || entity.attributes.daily_goal !== undefined) {
      return entity.attributes;
    }
    
    return null;
  }

  getCardSize() {
    return 3;
  }

  static getConfigElement() {
    return document.createElement("duolingo-streak-card-editor");
  }

  static getStubConfig() {
    return {
      type: "custom:duolingo-streak-card",
      entity: "",
      title: "Duolingo Streak"
    };
  }
}

customElements.define("duolingo-streak-card", DuolingoStreakCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "duolingo-streak-card",
  name: "Duolingo Streak Card",
  description: "Displays Duolingo streak information"
});