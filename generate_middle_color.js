!function() {
    var set_color_a;
    var set_color_b;
    var middle_color_selector;
    var toolbar;
    
    Plugin.register('generate_middle_color', {
        title: '生成中间色',
        icon: 'colorize',
        author: 'Tactsohg',
        version: '1.0',
        variant: 'both',
        onload() {
            Language.addTranslations('zh', {'action.set_color_a': '设定颜色A'})
            Language.addTranslations('zh_tw', {'action.set_color_a': '設定顏色A'})
            Language.addTranslations('en', {'action.set_color_a': 'Select color A'})
            Language.addTranslations('zh', {'action.set_color_b': '选择颜色B'})
            Language.addTranslations('zh_tw', {'action.set_color_b': '設定顏色B'})
            Language.addTranslations('en', {'action.set_color_b': 'Select color B'})
            Language.addTranslations('zh', {'action.middle_color_selector': '选择中间色'})
            Language.addTranslations('zh_tw', {'action.middle_color_selector': '設定中間色B'})
            Language.addTranslations('en', {'action.middle_color_selector': 'Select middle color'})

            class MiddleColorSelector extends Widget {
                constructor(id, data) {
                    if (typeof id == 'object') {
                        data = id;
                        id = data.id;
                    }
                    super(id, data);
                    var scope = this;
                    this.icon = 'fa-sliders-h'
                    this.node = Interface.createElement('div', {
                        class: 'tool widget',
                        style: 'width: 300px; background-image: linear-gradient(to right, #000000, #ffffff)'
                    })
                    this.colorA = '#000000';
                    this.colorB = '#ffffff';
                    this.addLabel();
                    if (typeof data.click === 'function') {
                        this.onClick = data.click
                    }
                    $(this.node).on('click', function(event) {
                        scope.click(event)
                    })
                }
                click(event) {
                    if (this.onClick) {
                        let x = event.offsetX / (this.node.clientWidth - 1);
                        let a = new tinycolor(this.colorA)
                        let b = new tinycolor(this.colorB)

                        let cr = a._r * (1 - x) + b._r * x;
                        let cg = a._g * (1 - x) + b._g * x;
                        let cb = a._b * (1 - x) + b._b * x;

                        this.onClick(new tinycolor('rgb ' + cr + ' ' + cg + ' ' + cb).toHexString())
                    }
                }
                setA(color) {
                    this.colorA = color;
                    $(this.node).css('background-image', 'linear-gradient(to right, ' + this.colorA + ', ' + this.colorB + ')')
                }
                setB(color) {
                    this.colorB = color;
                    $(this.node).css('background-image', 'linear-gradient(to right, ' + this.colorA + ', ' + this.colorB + ')')
                }
            }

            middle_color_selector = new MiddleColorSelector({
                id: 'middle_color_selector',
                category: 'color',
                click: async function(color) {
                    ColorPanel.change(color)
                }
            })

            set_color_a = new Action('set_color_a', {
                icon: 'colorize',
                category: 'color',
                click: async function () {
                    ColorPanel.addToHistory(ColorPanel.vue._data.main_color);
                    middle_color_selector.setA(ColorPanel.vue._data.main_color);
                }
            })

            set_color_b = new Action('set_color_b', {
                icon: 'colorize',
                category: 'color',
                click: async function () {
                    ColorPanel.addToHistory(ColorPanel.vue._data.main_color);
                    middle_color_selector.setB(ColorPanel.vue._data.main_color);
                }
            })

            toolbar = new Toolbar('middle_color', {
				children: [
					'set_color_a',
					'middle_color_selector',
					'set_color_b'
				]
			})
    
            ColorPanel.addToolbar(toolbar)
        },
        onunload() {
            middle_color_selector.delete()
            set_color_a.delete()
            set_color_b.delete()
        }
    })
}()