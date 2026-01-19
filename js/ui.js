/**
 * UI Rendering Module
 * Handles all DOM updates
 */
var GameUI = (function() {
    
    // DOM element cache
    var elements = {};
    
    // Initialize element references
    function init() {
        elements = {
            // Start screen
            startScreen: document.getElementById('startScreen'),
            startTitle: document.getElementById('startTitle'),
            startSubtitle: document.getElementById('startSubtitle'),
            startRules: document.getElementById('startRules'),
            startBtn: document.getElementById('startBtn'),
            
            // Modifier screen
            modifierScreen: document.getElementById('modifierScreen'),
            nameSelectLabel: document.getElementById('nameSelectLabel'),
            nameOptions: document.getElementById('nameOptions'),
            playerNameInput: document.getElementById('playerNameInput'),
            nameRandomBtn: document.getElementById('nameRandomBtn'),
            modifierSelectTitle: document.getElementById('modifierSelectTitle'),
            modifierSelectDesc: document.getElementById('modifierSelectDesc'),
            modifierGrid: document.getElementById('modifierGrid'),
            modifierConfirmBtn: document.getElementById('modifierConfirmBtn'),
            
            // Game screen
            gameScreen: document.getElementById('gameScreen'),
            modifiersBar: document.getElementById('modifiersBar'),
            
            // Card elements
            card: document.getElementById('card'),
            cardType: document.getElementById('cardType'),
            cardAvatar: document.getElementById('cardAvatar'),
            cardTitle: document.getElementById('cardTitle'),
            cardDesc: document.getElementById('cardDesc'),
            choiceLeft: document.getElementById('choiceLeft'),
            choiceRight: document.getElementById('choiceRight'),
            
            // Stats
            trustBar: document.getElementById('trustBar'),
            kpiBar: document.getElementById('kpiBar'),
            karmaBar: document.getElementById('karmaBar'),
            sanityBar: document.getElementById('sanityBar'),
            trustValue: document.getElementById('trustValue'),
            kpiValue: document.getElementById('kpiValue'),
            karmaValue: document.getElementById('karmaValue'),
            sanityValue: document.getElementById('sanityValue'),
            trustChange: document.getElementById('trustChange'),
            kpiChange: document.getElementById('kpiChange'),
            karmaChange: document.getElementById('karmaChange'),
            sanityChange: document.getElementById('sanityChange'),
            
            // Toast
            toastContainer: document.getElementById('toastContainer'),
            
            // Bottom bar
            playerTitle: document.getElementById('playerTitle'),
            nextTitle: document.getElementById('nextTitle'),
            progressFill: document.getElementById('progressFill'),
            progressText: document.getElementById('progressText'),
            turnLabel: document.getElementById('turnLabel'),
            turnCount: document.getElementById('turnCount'),
            
            // Ending screen
            endingScreen: document.getElementById('endingScreen'),
            endingIcon: document.getElementById('endingIcon'),
            endingTitle: document.getElementById('endingTitle'),
            endingDesc: document.getElementById('endingDesc'),
            restartBtn: document.getElementById('restartBtn')
        };
        
        renderStartScreen();
    }
    
    // Get card element (for input handling)
    function getCardElement() {
        return elements.card;
    }
    
    // Render start screen content
    function renderStartScreen() {
        var text = GameData.UI_TEXT;
        
        elements.startTitle.textContent = text.startTitle;
        elements.startSubtitle.textContent = text.startSubtitle;
        elements.startBtn.textContent = text.startBtn;
        elements.startRules.innerHTML = text.rules.join('<br>');
        if (elements.restartBtn) {
            elements.restartBtn.textContent = text.restartBtn;
        }
        elements.turnLabel.textContent = text.turnLabel;
    }
    
    // Hide start screen
    function hideStartScreen() {
        elements.startScreen.classList.add('hidden');
    }
    
    // Show start screen
    function showStartScreen() {
        elements.startScreen.classList.remove('hidden');
    }
    
    // Update all stat bars
    function updateStats() {
        GameConfig.STAT_KEYS.forEach(function(stat) {
            var value = GameState.getStat(stat);
            var bar = elements[stat + 'Bar'];
            var valueDisplay = elements[stat + 'Value'];
            var warning = GameConfig.STAT_WARNINGS[stat];
            
            bar.style.width = value + '%';
            
            // Use warning color if below threshold and warned
            if (warning && value < warning.threshold && GameState.isStatWarned(stat)) {
                bar.style.background = '#ef4444'; // red warning color
                bar.classList.add('stat-warning');
            } else {
                bar.style.background = GameConfig.getStatColor(value);
                bar.classList.remove('stat-warning');
            }
            
            valueDisplay.textContent = value;
            
            // Add emoji based on value range (universal for all stats)
            var emoji = '';
            if (value > 50) {
                emoji = '😊'; // Safe
            } else if (value >= 30) {
                emoji = '😐'; // Neutral
            } else {
                emoji = '😰'; // Anxious
            }
            valueDisplay.textContent += emoji;
        });
    }
    
    // Show stat change indicator
    function showStatChange(stat, change) {
        if (change === 0) return;
        
        var indicator = elements[stat + 'Change'];
        
        indicator.className = 'stat-change visible';
        indicator.classList.add(change > 0 ? 'positive' : 'negative');
        
        if (Math.abs(change) <= 10) {
            indicator.classList.add('small');
        }
        
        setTimeout(function() {
            indicator.classList.remove('visible');
        }, GameConfig.ANIMATION.STAT_CHANGE_VISIBLE);
    }
    
    // Show toast notification
    function showToast(message, duration, type) {
        if (!duration) duration = 1500;
        if (!type) type = 'default';
        
        var toast = document.createElement('div');
        toast.className = 'toast toast-' + type;
        toast.textContent = message;
        
        elements.toastContainer.appendChild(toast);
        
        setTimeout(function() {
            toast.classList.add('fadeOut');
            setTimeout(function() {
                toast.remove();
            }, 300);
        }, duration);
    }
    
    // Show promotion celebration
    function showPromotion(newTitle) {
        // Pause game interaction
        GameState.setAnimating(true);
        
        var overlay = document.createElement('div');
        overlay.className = 'promotion-overlay';
        
        var content = document.createElement('div');
        content.className = 'promotion-content';
        
        var icon = document.createElement('div');
        icon.className = 'promotion-icon';
        icon.textContent = newTitle.icon;
        
        var title = document.createElement('h1');
        title.className = 'promotion-title';
        title.textContent = '恭喜升职！';
        
        var subtitle = document.createElement('h2');
        subtitle.className = 'promotion-subtitle';
        subtitle.textContent = newTitle.name;
        
        content.appendChild(icon);
        content.appendChild(title);
        content.appendChild(subtitle);
        overlay.appendChild(content);
        
        document.body.appendChild(overlay);
        
        setTimeout(function() {
            overlay.classList.add('fadeOut');
            setTimeout(function() {
                overlay.remove();
                // Resume game
                GameState.setAnimating(false);
            }, 1000);
        }, 2500);
    }
    
    // Show flow breaker alert (full screen warning)
    function showFlowBreakerAlert() {
        // Pause game interaction
        GameState.setAnimating(true);
        
        var alert = document.createElement('div');
        alert.className = 'flow-breaker-alert';
        
        var content = document.createElement('div');
        content.className = 'alert-content';
        
        var icon = document.createElement('div');
        icon.className = 'alert-icon';
        icon.textContent = '⚠️';
        
        var title = document.createElement('h1');
        title.className = 'alert-title';
        title.textContent = '快速滑动检测！';
        
        var subtitle = document.createElement('h2');
        subtitle.className = 'alert-subtitle';
        subtitle.textContent = '强制反思！';
        
        content.appendChild(icon);
        content.appendChild(title);
        content.appendChild(subtitle);
        alert.appendChild(content);
        
        document.body.appendChild(alert);
        
        setTimeout(function() {
            alert.classList.add('fadeOut');
            setTimeout(function() {
                alert.remove();
                // Resume game
                GameState.setAnimating(false);
            }, 1000);
        }, 3000);
    }
    
    // Show multiple stat changes
    function showStatChanges(changes) {
        var changeTexts = [];
        
        for (var stat in changes) {
            if (changes.hasOwnProperty(stat)) {
                var change = changes[stat];
                showStatChange(stat, change);
                
                if (change !== 0) {
                    var statLabel = {
                        'trust': '老板信任',
                        'kpi': '业务绩效',
                        'karma': '声望舆论',
                        'sanity': '真实良心'
                    }[stat];
                    
                    var changeText = (change > 0 ? '+' : '') + change;
                    changeTexts.push(statLabel + ' ' + changeText);
                }
            }
        }
        
        if (changeTexts.length > 0) {
            var toastMessage = changeTexts.join('  |  ');
            showToast(toastMessage, 1500, 'default');
        }
    }
    
    // Update turn counter
    function updateTurn() {
        var state = GameState.get();
        elements.turnCount.textContent = state.turn;
    }
    
    // Update player title and progression
    function updateTitle() {
        var state = GameState.get();
        var turn = state.turn;
        var currentLevelKey = GameConfig.getCurrentTitleLevel(turn);
        var currentTitle = GameData.TITLES[currentLevelKey];
        
        if (currentTitle) {
            elements.playerTitle.textContent = currentTitle.icon + ' ' + currentTitle.name;
        }
        
        updateTitleProgress(turn);
    }
    
    // Update title progression display
    function updateTitleProgress(turn) {
        var nextThreshold = GameConfig.getNextTitleThreshold(turn);
        var currentLevelKey = GameConfig.getCurrentTitleLevel(turn);
        var currentLevelIndex = parseInt(currentLevelKey.replace('level', '')) - 1;
        
        if (nextThreshold > turn) {
            // Not at max level yet
            var prevThreshold = currentLevelIndex === 0 ? 0 : GameConfig.TITLE_THRESHOLDS[currentLevelIndex - 1];
            var nextLevelKey = 'level' + (currentLevelIndex + 2);
            var nextTitle = GameData.TITLES[nextLevelKey];
            
            if (nextTitle) {
                elements.nextTitle.textContent = '目标: ' + nextTitle.name;
            }
            
            var daysUntilNext = nextThreshold - turn;
            var progressPercent = Math.round(((turn - prevThreshold) / (nextThreshold - prevThreshold)) * 100);
            
            elements.progressFill.style.width = progressPercent + '%';
            elements.progressText.textContent = '还需 ' + daysUntilNext + ' 次事件';
        } else {
            // At max level
            elements.nextTitle.textContent = '🎉 已达最高职级!';
            elements.progressFill.style.width = '100%';
            elements.progressText.textContent = '';
        }
    }
    
    // Render card content
    function renderCard(card) {
        elements.cardType.textContent = GameData.getCardTypeName(card.type);
        elements.cardAvatar.textContent = card.avatar;
        elements.cardTitle.textContent = card.title;
        elements.cardDesc.textContent = card.desc;
        elements.choiceLeft.textContent = card.leftText;
        elements.choiceRight.textContent = card.rightText;
        
        // Add type-specific class for styling
        elements.card.classList.remove('type-recruit', 'type-monitor', 'type-layoff', 'type-daily', 'type-special');
        elements.card.classList.add('type-' + card.type);
    }
    
    // Card enter animation
    function animateCardEnter() {
        elements.card.style.transition = 'none';
        elements.card.style.transform = 'scale(0.8) translateY(30px)';
        elements.card.style.opacity = '0';
        
        // Force reflow
        elements.card.offsetHeight;
        
        elements.card.style.transition = 'transform ' + GameConfig.ANIMATION.CARD_ENTER + 'ms cubic-bezier(0.4, 0, 0.2, 1), opacity ' + GameConfig.ANIMATION.CARD_ENTER + 'ms ease';
        elements.card.style.transform = '';
        elements.card.style.opacity = '1';
        
        setTimeout(function() {
            elements.card.style.transition = 'none';
        }, GameConfig.ANIMATION.CARD_ENTER);
    }
    
    // Card exit animation
    function animateCardExit(direction, callback) {
        var exitX = direction === 'left' ? '-120vw' : '120vw';
        var exitRotate = direction === 'left' ? '-25deg' : '25deg';
        
        elements.card.style.transition = 'transform ' + (GameConfig.ANIMATION.CARD_EXIT) + 'ms cubic-bezier(0.4, 0, 1, 1), opacity ' + (GameConfig.ANIMATION.CARD_EXIT) + 'ms ease';
        elements.card.style.transform = 'translateX(' + exitX + ') rotate(' + exitRotate + ')';
        elements.card.style.opacity = '0';
        
        setTimeout(function() {
            if (callback) callback();
        }, GameConfig.ANIMATION.CARD_EXIT);
    }
    
    // Update card position during drag
    function updateCardPosition(deltaX) {
        var rotation = deltaX * 0.15;
        var opacity = 1 - Math.abs(deltaX) / 500;
        elements.card.style.transform = 'translateX(' + deltaX + 'px) rotate(' + rotation + 'deg)';
        elements.card.style.opacity = Math.max(0.5, opacity);
        
        elements.card.classList.remove('swiping-left', 'swiping-right');
        
        if (deltaX < -30) {
            elements.card.classList.add('swiping-left');
        } else if (deltaX > 30) {
            elements.card.classList.add('swiping-right');
        }
    }
    
    // Reset card position
    function resetCardPosition() {
        elements.card.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
        elements.card.style.transform = '';
        elements.card.style.opacity = '1';
        elements.card.classList.remove('swiping-left', 'swiping-right');
    }
    
    // Disable card transition (for dragging)
    function disableCardTransition() {
        elements.card.style.transition = 'none';
    }
    
    // Show ending screen
    function showEnding(ending) {
        elements.endingIcon.textContent = ending.icon;
        elements.endingTitle.textContent = ending.title;
        
        var reason = GameState.getEndingReason();
        var descText = ending.desc;
        
        if (reason) {
            descText = '【' + reason.statName + reason.level + '】\n\n' + descText;
        }
        
        elements.endingDesc.textContent = descText;
        elements.endingScreen.classList.add('visible');
    }
    
    // Hide ending screen
    function hideEnding() {
        elements.endingScreen.classList.remove('visible');
    }
    
    // Full UI refresh
    function refresh() {
        updateStats();
        updateTurn();
        updateTitle();
    }
    
    // Reset UI for new game
    function reset() {
        hideEnding();
        elements.card.style.transform = '';
        elements.card.classList.remove('exiting', 'entering', 'swiping-left', 'swiping-right');
    }
    
    // Show modifier selection screen
    function showModifierSelection(modifier) {
        var text = GameData.UI_TEXT;
        // 名字区域
        elements.nameSelectLabel.textContent = text.nameSelectLabel;
        elements.nameRandomBtn.textContent = text.nameRandomBtn;
        elements.playerNameInput.value = '';
        // 推荐名区域已移除
        // 天赋区域
        elements.modifierSelectTitle.textContent = text.modifierSelectTitle;
        elements.modifierSelectDesc.textContent = text.modifierSelectDesc;
        elements.modifierConfirmBtn.textContent = text.modifierConfirmBtn || text.modifierConfirm;
        elements.startScreen.classList.add('hidden');
        elements.modifierScreen.classList.remove('hidden');
        // 渲染天赋卡片
        renderModifierGrid(modifier);
        // 更新重抽计数器
        if (elements.rerollCounter) {
            elements.rerollCounter.textContent = `剩余随机次数：${GameState.getModifierRerollCount()}`;
        }
    }
    
    // Render 3 name options
    function renderNameOptions() {
        // 推荐名区域已移除
    }
        // 更新reroll计数器
        function updateRerollCounter(count) {
            if (elements.rerollCounter) {
                elements.rerollCounter.textContent = `剩余随机次数：${count}`;
            }
        }
        // 渲染天赋卡片（单卡，带点击动画）
        function renderModifierGrid(modifier) {
            var html = '';
            html += `<div class="modifier-card modifier-card-large" id="modifierCard">
                <div class="modifier-card-title">${modifier.name}</div>
                <div class="modifier-card-desc">${modifier.desc}</div>
            </div>`;
            elements.modifierGrid.innerHTML = html;
            // 绑定点击重抽动画
            var card = document.getElementById('modifierCard');
            if (card) {
                card.onclick = function() {
                    if (GameState.getModifierRerollCount() > 0) {
                        card.classList.add('reroll-anim');
                        setTimeout(() => {
                            card.classList.remove('reroll-anim');
                            document.getElementById('modifierRerollBtn').click();
                        }, 350);
                    } else {
                        GameUI.showToast('已用完随机机会', 1200, 'default');
                    }
                };
            }
        }
    
    // Select player name
    function selectPlayerName(name) {
        GameState.setPlayerName(name);
        elements.playerNameInput.value = name;
        document.querySelectorAll('.name-option-btn').forEach(function(btn) {
            btn.classList.toggle('selected', btn.textContent === name);
        });
    }
    
    // Get player name input value
    function getPlayerName() {
        return elements.playerNameInput.value.trim();
    }
    
    // Update reroll counter display
    function updateRerollCounter(count) {
        var counter = document.getElementById('rerollCount');
        if (counter) {
            counter.textContent = count;
        }
    }
    
    // Hide modifier selection screen
    function hideModifierSelection() {
        elements.modifierScreen.classList.add('hidden');
    }
    
    // Get selected modifier id (single choice)
    function getSelectedModifiers() {
        var card = document.querySelector('.modifier-card');
        return card ? [card.getAttribute('data-id')] : [];
    }
    
    // Render modifiers in game UI
    function renderModifiers(modifierIds) {
        var bar = elements.modifiersBar;
        bar.innerHTML = '';
        
        if (modifierIds.length === 0) return;
        
        modifierIds.forEach(function(id) {
            var modifier = GameData.getModifier(id);
            if (modifier) {
                var badge = document.createElement('div');
                badge.className = 'modifier-badge';
                badge.title = modifier.desc;
                badge.innerHTML = '<span class="modifier-badge-icon">' + modifier.icon + '</span>' +
                                 '<span class="modifier-badge-name">' + modifier.name + '</span>';
                bar.appendChild(badge);
            }
        });
    }
    
    // Public API
    return {
        init: init,
        getCardElement: getCardElement,
        hideStartScreen: hideStartScreen,
        showStartScreen: showStartScreen,
        updateStats: updateStats,
        showStatChanges: showStatChanges,
        updateTurn: updateTurn,
        updateTitle: updateTitle,
        renderCard: renderCard,
        animateCardEnter: animateCardEnter,
        animateCardExit: animateCardExit,
        updateCardPosition: updateCardPosition,
        resetCardPosition: resetCardPosition,
        disableCardTransition: disableCardTransition,
        showToast: showToast,
        showPromotion: showPromotion,
        showFlowBreakerAlert: showFlowBreakerAlert,
        showEnding: showEnding,
        hideEnding: hideEnding,
        refresh: refresh,
        reset: reset,
        showModifierSelection: showModifierSelection,
        hideModifierSelection: hideModifierSelection,
        getSelectedModifiers: getSelectedModifiers,
        renderNameOptions: renderNameOptions,
        selectPlayerName: selectPlayerName,
        getPlayerName: getPlayerName,
        updateRerollCounter: updateRerollCounter,
        renderModifiers: renderModifiers
    };
    
})();