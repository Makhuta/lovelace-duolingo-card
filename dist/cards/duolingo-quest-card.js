const LitElement = customElements.get("hui-masonry-view") ? Object.getPrototypeOf(customElements.get("hui-masonry-view")) : Object.getPrototypeOf(customElements.get("hui-view"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

class DuolingoQuestCard extends LitElement {
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
        --duolingo-blue: #1CB0F6;
        --duolingo-light-blue: #47c5ffff;
        --duolingo-gold: #FFC800;
        --duolingo-red: #FF4B4B;
      }

      .card-content {
        padding: 16px;
      }

      .progress-container {
        margin-top: 12px;
      }

      .progress-bar {
        display: flex;
        width: 100%;
        height: 12px;
        background-color: var(--divider-color);
        border-radius: 6px;
        overflow: hidden;
        margin-bottom: 8px;
      }

      .progress-fill {
        height: 100%;
        transition: width 0.3s ease;
      }

      .progress-fill.you {
        background: linear-gradient(90deg, var(--duolingo-green), var(--duolingo-light-green));
      }

      .progress-fill.friend {
        background: linear-gradient(90deg, var(--duolingo-blue), var(--duolingo-light-blue));
      }

      .quest-participants {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      }

      .participant {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
      }

      .participant-avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        object-fit: cover;
      }

      .participant-info span {
        display: block;
        font-weight: 600;
        color: var(--primary-text-color);
      }

      .participant-progress {
        color: var(--secondary-text-color);
        font-size: 14px;
      }

      .vs-divider {
        font-weight: bold;
        color: var(--duolingo-red);
        padding: 0 12px;
        font-size: 18px;
      }

      .quest-reward {
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-weight: 600;
        color: var(--duolingo-gold);
        margin-top: 16px;
        padding: 12px;
        background: var(--secondary-background-color, #f5f5f5);
        border-radius: 8px;
      }

      .quest-status {
        text-align: center;
        margin-bottom: 16px;
        padding: 8px;
        border-radius: 6px;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 12px;
        letter-spacing: 0.5px;
      }

      .quest-name {
        text-align: center;
        margin-bottom: 16px;
        padding: 8px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 14px;
        letter-spacing: 0.5px;
      }

      .quest-active {
        background: #e8f5e8;
        color: #2e7d32;
      }

      .quest-inactive {
        background: #fff3e0;
        color: #ef6c00;
      }

      .error-message {
        color: var(--error-color, #ff4444);
        text-align: center;
        padding: 20px;
        font-style: italic;
      }

      @media (max-width: 768px) {
        .quest-participants {
          flex-direction: column;
          gap: 16px;
        }
        
        .vs-divider {
          padding: 8px 0;
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

    const questData = this.getQuestData();
    
    if (!questData) {
      return html`
        <ha-card header="${this.config.title}">
          <div class="card-content">
            <div class="error-message">
              ${this.config.entity ? 'Entity not found or no quest data available' : 'Please configure an entity'}
            </div>
          </div>
        </ha-card>
      `;
    }
    const threshold = questData.threshold || 30;
    const progressYou = questData.progressMeTotal || questData.progress_me_total || 0;
    const progressFriend = questData.progressFriendTotal || questData.progress_friend_total || 0;
    const percentYou = (progressYou / threshold) * 100;
    const percentFriend = (progressFriend / threshold) * 100;
    return html`
      <ha-card header="${this.config.title}">
        <div class="card-content">
          ${this.renderQuestStatus(questData)}
          ${this.renderQuestName(questData)}
          
          <div class="quest-participants">
            <div class="participant">
              <img src="${questData.youAvatar || questData.you_avatar || 'https://simg-ssl.duolingo.com/avatar/default_2/large'}" 
                   alt="Friend" class="participant-avatar"
                   @error="${this._handleImageError}">
              <div class="participant-info">
                <span>${questData.youName || questData.you_name || 'You'}</span>
                <div class="participant-progress">
                  ${progressYou} / ${threshold}
                </div>
              </div>
            </div>
            
            <div class="vs-divider">VS</div>
            
            <div class="participant">
              <img src="${questData.userAvatar || questData.user_avatar || questData.friendAvatar || questData.friend_avatar || 'https://simg-ssl.duolingo.com/avatar/default_2/large'}" 
                   alt="Friend" class="participant-avatar"
                   @error="${this._handleImageError}">
              <div class="participant-info">
                <span>${questData.userName || questData.user_name || questData.friendName || questData.friend_name || 'Friend'}</span>
                <div class="participant-progress">
                  ${progressFriend} / ${threshold}
                </div>
              </div>
            </div>
          </div>

          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill you" style="width: ${Math.min(percentYou, 100 - percentFriend)}%"></div>
              <div class="progress-fill friend" style="left: ${Math.min(percentYou, 100 - percentFriend)}%; width: ${Math.min(percentFriend, 100 - percentYou)}%"></div>
            </div>
          </div>
          
          <div class="quest-reward">
            <ha-icon icon="mdi:star"></ha-icon>
            <span>${questData.points || 5} Points</span>
          </div>
        </div>
      </ha-card>
    `;
  }

  renderQuestStatus(questData) {
    const isActive = !questData.active || questData.state === 'Active';
    const notStarted = !questData.active || questData.state === 'Not started';
    const statusClass = isActive ? 'quest-active' : 'quest-inactive';
    const statusText = isActive ? 'Active Quest' : notStarted ? 'Not started' : 'Quest Completed';
    
    return html`
      <div class="quest-status ${statusClass}">
        ${statusText}
      </div>
    `;
  }

  renderQuestName(questData) {
    return html`
      <div class="quest-name">
        ${questData.name || questData.id || "Unknown"}
      </div>
    `;
  }

  getQuestData() {
    if (!this.config.entity || !this.hass.states[this.config.entity]) {
      return null;
    }

    const entity = this.hass.states[this.config.entity];
    
    if (entity.attributes.duolingo_data && entity.attributes.duolingo_data.friendQuest) {
      return entity.attributes.duolingo_data.friendQuest;
    }
    
    if (entity.attributes.friend_quest || entity.attributes.friendQuest) {
      return entity.attributes.friend_quest || entity.attributes.friendQuest;
    }
    
    if (entity.attributes.threshold !== undefined || entity.attributes.points !== undefined) {
      return entity.attributes;
    }
    
    return null;
  }

  getUserAvatar() {
    if (this.config.entity && this.hass.states[this.config.entity]) {
      const entity = this.hass.states[this.config.entity];
      if (entity.attributes.duolingo_data && entity.attributes.duolingo_data.user) {
        return entity.attributes.duolingo_data.user.avatar || entity.attributes.duolingo_data.user.entityPicture;
      }
    }
    return 'https://simg-ssl.duolingo.com/avatar/default_2/large';
  }

  _handleImageError(e) {
    e.target.src = 'https://simg-ssl.duolingo.com/avatar/default_2/large';
  }

  getCardSize() {
    return 3;
  }

  static getConfigElement() {
    return document.createElement("duolingo-quest-card-editor");
  }

  static getStubConfig() {
    return {
      type: "custom:duolingo-quest-card",
      entity: "",
      title: "Friend Quest"
    };
  }
}

customElements.define("duolingo-quest-card", DuolingoQuestCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "duolingo-quest-card",
  name: "Duolingo Quest Card",
  description: "Displays Duolingo friend quest information"
});