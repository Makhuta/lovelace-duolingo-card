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

      .quests-container {
        display: flex;
        flex-direction: column;
        gap: 24px;
      }

      .quest-item {
        border: 1px solid var(--divider-color);
        border-radius: 12px;
        padding: 16px;
        background: var(--card-background-color);
      }

      .quest-item:first-child {
        border: none;
        padding: 0;
        background: transparent;
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

      .and-divider {
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

      .no-quests {
        color: var(--secondary-text-color);
        text-align: center;
        padding: 20px;
        font-style: italic;
      }

      @media (max-width: 768px) {
        .quest-participants {
          flex-direction: column;
          gap: 16px;
        }
        
        .and-divider {
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

    const questsData = this.getAllQuestsData();
    
    if (!questsData || questsData.length === 0) {
      return html`
        <ha-card header="${this.config.title}">
          <div class="card-content">
            <div class="error-message">
              ${this.getEntities().length === 0 ? 'Please configure at least one entity' : 'No quest data available from configured entities'}
            </div>
          </div>
        </ha-card>
      `;
    }

    const uniqueQuests = this.deduplicateQuests(questsData);

    if (uniqueQuests.length === 0) {
      return html`
        <ha-card header="${this.config.title}">
          <div class="card-content">
            <div class="no-quests">No unique quests found</div>
          </div>
        </ha-card>
      `;
    }

    return html`
      <ha-card header="${this.config.title}">
        <div class="card-content">
          <div class="quests-container">
            <div class="quest-item">
              ${uniqueQuests.map((questData, index) => this.renderQuestItem(questData, index))}
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  renderQuestItem(questData, index) {
    const threshold = questData.threshold || 30;
    const progress = questData.progressTotal || questData.progress_total || 0;
    const progressYou = questData.progressMeTotal || questData.progress_me_total || 0;
    const progressFriend = questData.progressFriendTotal || questData.progress_friend_total || 0;
    const percentYou = (progressYou / threshold) * 100;
    const percentFriend = (progressFriend / threshold) * 100;

    return html`
      ${this.renderQuestStatus(questData)}
      ${this.renderQuestName(questData)}
      
      <div class="quest-participants">
        <div class="participant">
          <img src="${questData.youAvatar || questData.you_avatar || 'https://simg-ssl.duolingo.com/avatar/default_2/large'}" 
                alt="Friend" class="participant-avatar"
                @error="${this._handleImageError}">
          <div class="participant-info">
            <span>${this.config.show_name ?
              (questData.youDisplayName || questData.you_display_name || questData.you_name || questData.youName || questData.you_username || questData.youUsername || 'You') :
              (questData.you_username || questData.youUsername || questData.youDisplayName || questData.you_display_name || questData.you_name || questData.youName || 'You')}
            </span>
            <div class="participant-progress">
              ${progressYou} / ${threshold - progressFriend}
            </div>
          </div>
        </div>
        
        <div class="and-divider">&</div>
        
        <div class="participant">
          <img src="${questData.userAvatar || questData.user_avatar || questData.friendAvatar || questData.friend_avatar || 'https://simg-ssl.duolingo.com/avatar/default_2/large'}" 
                alt="Friend" class="participant-avatar"
                @error="${this._handleImageError}">
          <div class="participant-info">
            <span>${this.config.show_name ?
              (questData.displayName || questData.display_name || questData.user_name || questData.userName || 'Friend') :
              (questData.user_name || questData.userName || questData.displayName || questData.display_name || 'Friend')}
            </span>
            <div class="participant-progress">
              ${progressFriend} / ${threshold - progressYou}
            </div>
          </div>
        </div>
      </div>

      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill you" style="width: ${Math.min(percentYou, 100 - percentFriend)}%"></div>
          <div class="progress-fill friend" style="left: ${Math.min(percentYou, 100 - percentFriend)}%; width: ${Math.min(percentFriend, 100 - percentYou)}%"></div>
        </div>
        <div class="participant-progress">
          ${progress} / ${threshold}
        </div>
      </div>
      
      ${this.renderPoints(questData)}
    `;
  }

  renderPoints(questData) {
    return this.config.show_points ? html`
      <div class="quest-reward">
        <ha-icon icon="mdi:star"></ha-icon>
        <span>${questData.points || 5} Points</span>
      </div>
    ` : html``
  }

  renderQuestStatus(questData) {
    const isActive = questData.active || questData.state === 'Active';
    const notStarted = !questData.active || questData.state === 'Not started';
    const statusClass = isActive ? 'quest-active' : 'quest-inactive';
    const statusText = isActive ? 'Active Quest' : notStarted ? 'Not started' : 'Quest Completed';

    return this.config.show_state ? html`
      <div class="quest-status ${statusClass}">
        ${statusText}
      </div>
    ` : html``;
  }

  renderQuestName(questData) {
    return html`
      <div class="quest-name">
        ${questData.name || questData.id || "Unknown"}
      </div>
    `;
  }

  getEntities() {
    // Support both single entity (backward compatibility) and multiple entities
    if (this.config.entity) {
      return [this.config.entity];
    }
    // Filter out empty entities for actual processing
    return (this.config.entities || []).filter(e => e && e.trim() !== '');
  }

  getAllQuestsData() {
    const entities = this.getEntities();
    const questsData = [];

    entities.forEach(entityId => {
      const questData = this.getQuestDataFromEntity(entityId);
      if (questData) {
        questsData.push({
          ...questData,
          entityId: entityId
        });
      }
    });

    return questsData;
  }

  getQuestDataFromEntity(entityId) {
    if (!entityId || !this.hass.states[entityId]) {
      return null;
    }

    const entity = this.hass.states[entityId];
    
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

  deduplicateQuests(questsData) {
    const questMap = new Map();

    for (const quest of questsData) {
      // Extract UserID and YouID from quest data
      const youId = this.extractUserId(quest, 'you');
      const userId = this.extractUserId(quest, 'user');

      if (youId === null || userId === null) {
        // If we can't extract IDs, treat as unique
        questMap.set(`${quest.entityId}_${Date.now()}_${Math.random()}`, quest);
        continue;
      }

      // Create a normalized key - always put the smaller ID first
      const normalizedKey = `${Math.min(youId, userId)}_${Math.max(youId, userId)}`;

      if (questMap.has(normalizedKey)) {
        // We have a duplicate, keep the one with lower YouID
        const existingQuest = questMap.get(normalizedKey);
        const existingYouId = this.extractUserId(existingQuest, 'you');
        
        if (youId < existingYouId) {
          questMap.set(normalizedKey, quest);
        }
      } else {
        questMap.set(normalizedKey, quest);
      }
    }

    return Array.from(questMap.values());
  }

  extractUserId(quest, userType) {
    // Cache for performance - avoid recreating arrays and strings on each call
    const idField = `${userType}Id`;
    const idFieldUnderscore = `${userType}_id`;
    const idFieldCaps = `${userType}ID`;
    
    // Check most common formats first for better performance
    if (quest[idField] !== undefined && quest[idField] !== null) {
      const id = parseInt(quest[idField], 10);
      if (!isNaN(id)) return id;
    }
    
    if (quest[idFieldUnderscore] !== undefined && quest[idFieldUnderscore] !== null) {
      const id = parseInt(quest[idFieldUnderscore], 10);
      if (!isNaN(id)) return id;
    }
    
    if (quest[idFieldCaps] !== undefined && quest[idFieldCaps] !== null) {
      const id = parseInt(quest[idFieldCaps], 10);
      if (!isNaN(id)) return id;
    }

    // Fallback to username extraction (more expensive)
    const usernameField = userType === 'you' ? 
      (quest.you_username || quest.youUsername) : 
      (quest.user_name || quest.userName || quest.username);
    
    if (usernameField && typeof usernameField === 'string') {
      // Try to extract numeric ID from username if it contains numbers
      const numericMatch = usernameField.match(/\d+/);
      if (numericMatch) {
        return parseInt(numericMatch[0], 10);
      }
    }

    return null;
  }

  _handleImageError(e) {
    e.target.src = 'https://simg-ssl.duolingo.com/avatar/default_2/large';
  }

  getCardSize() {
    const entities = this.getEntities();
    const baseSize = 3;
    const additionalSize = Math.max(0, entities.length - 1) * 2;
    return baseSize + additionalSize;
  }

  static getConfigElement() {
    return document.createElement("duolingo-quest-card-editor");
  }

  static getStubConfig() {
    return {
      type: "custom:duolingo-quest-card",
      entities: [],
      title: "Friend Quest"
    };
  }
}

customElements.define("duolingo-quest-card", DuolingoQuestCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "duolingo-quest-card",
  name: "Duolingo Quest Card",
  description: "Displays Duolingo friend quest information with support for multiple unique quests"
});
