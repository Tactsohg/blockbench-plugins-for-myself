!function() {
    var action;
    
    Plugin.register('keyframe_column_select_more', {
        title: '追加关键帧列',
        icon: 'unfold_more_double',
        author: 'Tactsohg',
        version: '1.0',
        variant: 'both',
        onload() {
            Language.addTranslations('zh', {'action.keyframe_column_select_more': '追加关键帧列'})
            Language.addTranslations('zh_tw', {'action.keyframe_column_select_more': '追加關鍵幀列'})
            Language.addTranslations('en', {'action.keyframe_column_select_more': 'Select more keyframe column'})
    
            action = new Action('keyframe_column_select_more', {
                icon: 'unfold_more_double',
                category: 'animation',
                condition: () => Animator.open,
                click() {
                    let channels = ['rotation', 'position', 'scale']
                    Timeline.animators.forEach(animator => {
                        if (animator instanceof BoneAnimator == false) return;
                        channels.forEach(channel => {
                            if (Timeline.vue.channels[channel] !== false && animator[channel] && animator[channel].length) {
                                animator[channel].forEach(kf => {
                                    if (Math.epsilon(kf.time, Timeline.time, 1e-5) && Timeline.vue.channels[kf.channel] !== false) {
                                        if (Timeline.selected.indexOf(kf) == -1) {
                                            Timeline.selected.push(kf);
                                        }
                                        kf.selected = true;
                                    }
                                })
                            }
                        })
                    })
                    updateKeyframeSelection();
                }
            })
        },
        onunload() {
            action.delete()
        }
    })
    }()