!function() {

let bool_export_human = false
let onBedrockCompile = function(data) {
    if (bool_export_human) {
        bool_export_human = false

        let model = data.model['minecraft:geometry'][0]

        for (let bone of model.bones) {
            if (!bone.parent) {
                bone.scale = [0.9375, 0.9375, 0.9375]
            }
        }
    }
}

Plugin.register('export_bedrock_human', {
    title: '导出基岩版几何体（人物模型）',
    icon: 'select_all',
    author: 'Tactsohg',
    version: '1.0',
    variant: 'both',
    description: '自动为根骨骼增加0.9375缩放，即Minecraft默认人物模型缩放比例。',
    onload() {
        Language.addTranslations('zh', {'action.export_bedrock_human': '导出基岩版几何体（人物模型）'})
        Language.addTranslations('zh_tw', {'action.export_bedrock_human': '匯出基岩版幾何體（人物模型）'})
        Language.addTranslations('en', {'action.export_bedrock_human': 'Export Bedrock Geometry (Human)'})

        let export_bedrock = BarItems['export_bedrock']

        MenuBar.addAction(new Action('export_bedrock_human', {
            icon: 'icon-format_bedrock',
            category: 'file',
            condition: () => export_bedrock.condition(),
            click: () => {
                bool_export_human = true
                export_bedrock.click()
            }
        }), 'file.export')

        Codecs['bedrock'].on('compile', onBedrockCompile)
    },
    onunload() {
        MenuBar.removeAction('file.export.export_bedrock_human')
        Codecs['bedrock'].removeListener('compile', onBedrockCompile)
    }
})
}()