/**
 * Game Configuration
 * All numeric constants and game rules
 */
var GameConfig = (function() {
    
    // Stat boundaries
    var STAT_MIN = 0;
    var STAT_MAX = 100;
    
    // Initial stat values
    var INITIAL_STATS = {
        trust: 65,
        kpi: 65,
        karma: 65,
        sanity: 65
    };
    
    // Stat keys for iteration
    var STAT_KEYS = ['trust', 'kpi', 'karma', 'sanity'];
    
    // Stat display names
    var STAT_NAMES = {
        trust: '老板信任',
        kpi: '业务绩效',
        karma: '声望舆论',
        sanity: '真实良心'
    };
    
    // Animation durations in ms
    var ANIMATION = {
        CARD_EXIT: 200,
        CARD_ENTER: 300,
        STAT_CHANGE_VISIBLE: 1000
    };
    
    // Title progression (day thresholds) - easily configurable values
    var TITLE_THRESHOLDS = [
        1,      // level1 starts at day 1
        15,     // level2 starts at day 15
        35,     // level3 starts at day 35
        70,     // level4 starts at day 70
        150     // level5 starts at day 150
    ];
    
    var TITLE_LEVELS = [
        { day: 1, key: 'level1' },
        { day: 10, key: 'level2' },
        { day: 25, key: 'level3' },
        { day: 50, key: 'level4' },
        { day: 100, key: 'level5' }
    ];
    
    // Modifiers per run (random 1 at start)
    var MODIFIER_COUNT = 1;
    
    // Reroll attempts for modifier selection
    var MODIFIER_REROLL_COUNT = 3;
    
    // Swipe threshold in pixels
    var SWIPE_THRESHOLD = 100;
    
    // Stat warning thresholds and messages
    var STAT_WARNINGS = {
        trust: { threshold: 15, message: '⚠️ 老板信任仅剩{value}，小心被开除！后续选项多关注提升信任。' },
        kpi: { threshold: 15, message: '⚠️ 业务绩效仅剩{value}，可能要背锅了！多想想如何提升业绩。' },
        karma: { threshold: 15, message: '⚠️ 声望舆论仅剩{value}，对你怨气很大，小心被彻底架空！多和员工搞好关系！' },
        sanity: { threshold: 15, message: '⚠️ 真实良心仅剩{value}，要崩溃了！注意调整工作策略，以人为本。' }
    };
    
    // Ending trigger conditions
    var ENDING_TRIGGERS = {
        trustLow: function(stats) { return stats.trust <= STAT_MIN; },
        kpiLow: function(stats) { return stats.kpi <= STAT_MIN; },
        karmaLow: function(stats) { return stats.karma <= STAT_MIN; },
        sanityLow: function(stats) { return stats.sanity <= STAT_MIN; }
    };
    
    // Public API
    return {
        STAT_MIN: STAT_MIN,
        STAT_MAX: STAT_MAX,
        INITIAL_STATS: INITIAL_STATS,
        STAT_KEYS: STAT_KEYS,
        STAT_NAMES: STAT_NAMES,
        SWIPE_THRESHOLD: SWIPE_THRESHOLD,
        ANIMATION: ANIMATION,
        TITLE_LEVELS: TITLE_LEVELS,
        TITLE_THRESHOLDS: TITLE_THRESHOLDS,
        STAT_WARNINGS: STAT_WARNINGS,
        MODIFIER_COUNT: MODIFIER_COUNT,
        MODIFIER_REROLL_COUNT: MODIFIER_REROLL_COUNT,
        ENDING_TRIGGERS: ENDING_TRIGGERS,
        
        // Get current title level key based on turn day
        getCurrentTitleLevel: function(turn) {
            for (var i = TITLE_THRESHOLDS.length - 1; i >= 0; i--) {
                if (turn >= TITLE_THRESHOLDS[i]) {
                    return 'level' + (i + 1);
                }
            }
            return 'level1';
        },
        
        // Get next title threshold
        getNextTitleThreshold: function(turn) {
            for (var i = 0; i < TITLE_THRESHOLDS.length; i++) {
                if (turn < TITLE_THRESHOLDS[i]) {
                    return TITLE_THRESHOLDS[i];
                }
            }
            return TITLE_THRESHOLDS[TITLE_THRESHOLDS.length - 1];
        },
        
        // Helper to clamp stat values
        clampStat: function(value) {
            return Math.max(STAT_MIN, Math.min(STAT_MAX, value));
        },
        
        // Get stat color based on value
        getStatColor: function(value) {
            if (value < 20) return '#f87171';
            if (value < 40) return '#fbbf24';
            if (value > 80) return '#fb923c';
            return '#4ade80';
        }
    };
    
})();