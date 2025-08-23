const LitElement = customElements.get("hui-masonry-view") ? Object.getPrototypeOf(customElements.get("hui-masonry-view")) : Object.getPrototypeOf(customElements.get("hui-view"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

class DuolinguoChallengeCard extends LitElement {
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
        --duolingo-light-green: #89E219;
      }

      .card-content {
        padding: 16px;
      }

      .challenge-info h4 {
        color: var(--primary-text-color);
        margin-bottom: 16px;
        text-align: center;
        font-size: 18px;
      }

      .progress-container {
        margin-top: 12px;
      }

      .progress-bar {
        width: 100%;
        height: 12px;
        background-color: var(--divider-color);
        border-radius: 6px;
        overflow: hidden;
        margin-bottom: 8px;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--duolingo-green), var(--duolingo-light-green));
        transition: width 0.3s ease;
      }

      .progress-text {
        text-align: center;
        font-weight: 600;
        color: var(--primary-text-color);
        margin-bottom: 16px;
      }

      .challenge-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
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
        font-size: 20px;
        font-weight: bold;
        color: var(--duolingo-green);
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

    const challengeData = this.getChallengeData();
    
    if (!challengeData) {
      return html`
        <ha-card header="${this.config.title}">
          <div class="card-content">
            <div class="error-message">
              ${this.config.entity ? 'Entity not found or no challenge data available' : 'Please configure an entity'}
            </div>
          </div>
        </ha-card>
      `;
    }

    const progress = challengeData.progress || 0;
    const threshold = challengeData.threshold || 50;
    const progressPercent = (progress / threshold) * 100;

    return html`
      <ha-card header="${this.config.title}">
        <div class="card-content">
          <div class="challenge-info">
            <h4>${challengeData.name}</h4>
            <div class="progress-text">
              <span>${progress}</span> / <span>${threshold}</span>
            </div>
            <div class="progress-container">
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${Math.min(progressPercent, 100)}%"></div>
              </div>
            </div>
            
            <div class="challenge-stats">
              <div class="stat-item">
                <div class="stat-label">Progress</div>
                <div class="stat-value">${Math.round(progressPercent)}%</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">Remaining</div>
                <div class="stat-value">${Math.max(0, threshold - progress)}</div>
              </div>
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  getChallengeData() {
    if (!this.config.entity || !this.hass.states[this.config.entity]) {
      return null;
    }

    const entity = this.hass.states[this.config.entity];
    
    if (entity.attributes.duolingo_data && entity.attributes.duolingo_data.monthlyChallenge) {
      return entity.attributes.duolingo_data.monthlyChallenge;
    }
    
    if (entity.attributes.monthly_challenge || entity.attributes.monthlyChallenge) {
      return entity.attributes.monthly_challenge || entity.attributes.monthlyChallenge;
    }
    
    if (entity.attributes.progress !== undefined || entity.attributes.threshold !== undefined) {
      return entity.attributes;
    }
    
    return null;
  }

  getCardSize() {
    return 3;
  }

  static getConfigElement() {
    return document.createElement("duolingo-challenge-card-editor");
  }

  static getStubConfig() {
    return {
      type: "custom:duolingo-challenge-card",
      entity: "",
      title: "Monthly Challenge"
    };
  }
}

customElements.define("duolingo-challenge-card", DuolinguoChallengeCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "duolingo-challenge-card",
  name: "Duolingo Challenge Card",
  description: "Displays Duolingo monthly challenge progress"
});