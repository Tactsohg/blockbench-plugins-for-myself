!function() {
var action;

Plugin.register('show_all_timeline', {
    title: '一键显示全部时间轴',
    icon: 'select_all',
    author: 'Tactsohg',
    version: '1.0',
    variant: 'both',
    onload() {
        Language.addTranslations('zh', {'action.select_all_group': '显示全部时间轴'})
        Language.addTranslations('zh_tw', {'action.select_all_group': '顯示全部時間軸'})
        Language.addTranslations('en', {'action.select_all_group': 'Select all bones'})

        action = new Action('select_all_group', {
            icon: 'select_all',
            category: 'edit',
            condition: () => Modes.animate,
            click: function () {
                Timeline.vue._data.animators.purge()
                unselectAll()
                for (var i = Group.all.length - 1; i >= 0; i--)
                    Group.all[i].select()
            }
        })

        Toolbars.outliner.add(action, 1)
    },
    onunload() {
        action.delete()
    }
})
}()