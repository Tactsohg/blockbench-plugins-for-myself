!function() {
    var origin
    var btn1
    var btn2
    var canvas = document.createElement('canvas')
    
    Plugin.register('painter_love_layer', {
        title: '画师爱图层',
        icon: 'colorize',
        author: 'Tactsohg',
        version: '1.0',
        variant: 'both',
        onload() {
            var GLES = canvas.getContext('webgl', {
                premultipliedAlpha: false,
                alpha: true
            })
        
            !function() {
                let screenVBO = GLES.createBuffer()
                GLES.bindBuffer(GLES.ARRAY_BUFFER, screenVBO);
                GLES.bufferData(GLES.ARRAY_BUFFER, new Float32Array([
                    -1.0, -1.0,
                    1.0, -1.0,
                    -1.0, 1.0,
                    1.0, 1.0
                ]), GLES.STATIC_DRAW);
        
                let program = GLES.createProgram();
                let shader = GLES.createShader(GLES.VERTEX_SHADER);
        
                GLES.shaderSource(shader, `
                #version 100
                precision highp float;
                
                attribute vec2 vertex;
                
                varying vec2 uv;
                
                void main()
                {
                    uv = vertex * vec2(0.5, -0.5) + 0.5;
                    gl_Position = vec4(vertex, 0.0, 1.0);
                }
                `);
                GLES.compileShader(shader);
                GLES.attachShader(program, shader);
                GLES.deleteShader(shader);
        
                shader = GLES.createShader(GLES.FRAGMENT_SHADER);
                GLES.shaderSource(shader, `
                #version 100
                precision highp float;
                
                uniform sampler2D tex0;
                uniform sampler2D tex1;
                uniform sampler2D tex2;
                
                varying vec2 uv;

                void main()
                {
                    vec4 Ca = texture2D(tex0, uv);
                    vec4 Cb = texture2D(tex1, uv);
                    vec4 Cc = texture2D(tex2, uv);

                    vec3 c = Ca.rgb * mix(vec3(1.0), Cb.rgb, Cb.a) + Cc.rgb * Cc.a;
                    gl_FragColor = vec4(c, Ca.a);
                    if (gl_FragColor.a < 1.0) discard;
                }
                `);
                GLES.compileShader(shader);
                GLES.attachShader(program, shader);
                GLES.deleteShader(shader);
        
                GLES.linkProgram(program);
        
                GLES.useProgram(program);
        
                var location = GLES.getAttribLocation(program, 'vertex');
        
                GLES.vertexAttribPointer(location, 2, GLES.FLOAT, false, 0, 0);
                GLES.enableVertexAttribArray(location);
                GLES.clearColor(0.0, 0.0, 0.0, 0.0);
        
                GLES.activeTexture(GLES.TEXTURE0)
                GLES.bindTexture(GLES.TEXTURE_2D, GLES.createTexture())
                GLES.texParameteri(GLES.TEXTURE_2D, GLES.TEXTURE_MAG_FILTER, GLES.NEAREST)
                GLES.texParameteri(GLES.TEXTURE_2D, GLES.TEXTURE_MIN_FILTER, GLES.NEAREST)
                GLES.uniform1i(GLES.getUniformLocation(program, 'tex0'), 0)
                GLES.activeTexture(GLES.TEXTURE1)
                GLES.bindTexture(GLES.TEXTURE_2D, GLES.createTexture())
                GLES.texParameteri(GLES.TEXTURE_2D, GLES.TEXTURE_MAG_FILTER, GLES.NEAREST)
                GLES.texParameteri(GLES.TEXTURE_2D, GLES.TEXTURE_MIN_FILTER, GLES.NEAREST)
                GLES.uniform1i(GLES.getUniformLocation(program, 'tex1'), 1)
                GLES.activeTexture(GLES.TEXTURE2)
                GLES.bindTexture(GLES.TEXTURE_2D, GLES.createTexture())
                GLES.texParameteri(GLES.TEXTURE_2D, GLES.TEXTURE_MAG_FILTER, GLES.NEAREST)
                GLES.texParameteri(GLES.TEXTURE_2D, GLES.TEXTURE_MIN_FILTER, GLES.NEAREST)
                GLES.uniform1i(GLES.getUniformLocation(program, 'tex2'), 2)
            }()

            origin = Canvas.getLayeredMaterial
            Canvas.getLayeredMaterial = function(layers) {
                if (Canvas.layered_material && !layers) return Canvas.layered_material
                // https://codepen.io/Fyrestar/pen/YmpXYr
                var vertShader = `
                    attribute float highlight;
        
                    uniform bool SHADE;
        
                    varying vec2 vUv;
                    varying float light;
                    varying float lift;
        
                    float AMBIENT = 0.5;
                    float XFAC = -0.15;
                    float ZFAC = 0.05;
        
                    void main()
                    {
        
                        if (SHADE) {
        
                            vec3 N = normalize( vec3( modelMatrix * vec4(normal, 0.0) ) );
        
        
                            float yLight = (1.0+N.y) * 0.5;
                            light = yLight * (1.0-AMBIENT) + N.x*N.x * XFAC + N.z*N.z * ZFAC + AMBIENT;
        
                        } else {
        
                            light = 1.0;
        
                        }
        
                        if (highlight == 2.0) {
                            lift = 0.22;
                        } else if (highlight == 1.0) {
                            lift = 0.1;
                        } else {
                            lift = 0.0;
                        }
                        
                        vUv = uv;
                        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
                        gl_Position = projectionMatrix * mvPosition;
                    }`
                var fragShader = `
                    #ifdef GL_ES
                    precision ${isApp ? 'highp' : 'mediump'} float;
                    #endif
        
                    uniform sampler2D t0;
                    uniform sampler2D t1;
                    uniform sampler2D t2;
        
                    uniform bool SHADE;
        
                    varying vec2 vUv;
                    varying float light;
                    varying float lift;
        
                    void main(void)
                    {
                        vec4 Ca = texture2D(t0, vUv);
                        vec4 Cb = texture2D(t1, vUv); // shadow
                        vec4 Cc = texture2D(t2, vUv); // specular
        
                        vec3 c = Ca.rgb * mix(vec3(1.0), Cb.rgb, Cb.a) + Cc.rgb * Cc.a;
                        gl_FragColor= vec4(lift + c * light, Ca.a);
        
                        if (lift > 0.2) {
                            gl_FragColor.r = gl_FragColor.r * 0.6;
                            gl_FragColor.g = gl_FragColor.g * 0.7;
                        }
                        
                        if (gl_FragColor.a < 0.05) discard;
                        if (gl_FragColor.a < 1.0)
                        {
                            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
                        }
                    }`
        
                var uniforms = {
                    SHADE: {type: 'bool', value: settings.shading.value},
                    t0: {type: 't', value: null},
                    t1: {type: 't', value: null},
                    t2: {type: 't', value: null}
                }
                let i = 0
                if (layers instanceof Array == false) layers = Texture.all
                layers.forEach(texture => {
                    if (texture.visible && i < 3) {
                        uniforms[`t${i}`].value = texture.getMaterial().map
                        i++
                    }
                })
        
                var material_shh = new THREE.ShaderMaterial({
                  uniforms: uniforms,
                  vertexShader: vertShader,
                  fragmentShader: fragShader,
                  side: Canvas.getRenderSide(),
                  transparent: true
                });
                Canvas.layered_material = material_shh
                return material_shh
            }

            let toLayered = function() {
                let selected = Texture.selected
                Undo.initEdit({textures: [selected], bitmap: true})

                var lighting = new Texture({
                    mode: 'bitmap',
                    keep_size: true,
                    name: 'lighting',
                })

                var specular = new Texture({
                    mode: 'bitmap',
                    keep_size: true,
                    name: 'specular',
                })

                TextureGenerator.generateBlank(selected.height, selected.width, '#fff', blob => lighting.fromDataURL(blob).add(false))
                TextureGenerator.generateBlank(selected.height, selected.width, '#00000000', blob => specular.fromDataURL(blob).add(false))

                Texture.selected.render_mode = 'layered'
                Texture.selected.updateMaterial()
                lighting.render_mode = 'layered'
                lighting.updateMaterial()
                specular.render_mode = 'layered'
                specular.updateMaterial()

                Canvas.updateLayeredTextures()

                Undo.finishEdit('Create textures', {textures: [selected, lighting, specular], bitmap: true})
            }

            let merge = function() {
                let i = 0
                let tex = [null, null, null]
                Texture.all.forEach(texture => {
                    if (texture.render_mode == 'layered' && texture.visible && i < 3) {
                        tex[i] = texture
                        i++
                    }
                })

                if (i === 3) {
                    canvas.width = tex[0].width
                    canvas.height = tex[0].height
                    GLES.activeTexture(GLES.TEXTURE0)
                    GLES.texImage2D(GLES.TEXTURE_2D, 0, GLES.RGBA, GLES.RGBA, GLES.UNSIGNED_BYTE, tex[0].img)
                    GLES.activeTexture(GLES.TEXTURE1)
                    GLES.texImage2D(GLES.TEXTURE_2D, 0, GLES.RGBA, GLES.RGBA, GLES.UNSIGNED_BYTE, tex[1].img)
                    GLES.activeTexture(GLES.TEXTURE2)
                    GLES.texImage2D(GLES.TEXTURE_2D, 0, GLES.RGBA, GLES.RGBA, GLES.UNSIGNED_BYTE, tex[2].img)
                    GLES.viewport(0, 0, canvas.width, canvas.height)
                    GLES.clear(GLES.COLOR_BUFFER_BIT);
                    GLES.drawArrays(GLES.TRIANGLE_STRIP, 0, 4);

                    Undo.initEdit({textures: tex, bitmap: true, selected_texture: true})
                    tex[0].render_mode = 'default'
                    tex[0].updateMaterial()
                    tex[1].render_mode = 'default'
                    tex[1].updateMaterial()
                    tex[2].render_mode = 'default'
                    tex[2].updateMaterial()
                    Canvas.updateLayeredTextures();

                    tex[0].updateSource(canvas.toDataURL()).select()
                    tex[1].remove(true)
                    tex[2].remove(true)
                    Undo.finishEdit('Merge layered textures', {textures: [tex[0]], bitmap: true, selected_texture: true})
                }
            }

            btn1 = new Action('texture_layered', {
                name: '多图层混合模式',
                category: 'textures',
                condition: () => Texture.selected.render_mode === 'default',
                click: toLayered
            })

            btn2 = new Action('texture_layered_merge', {
                name: '合并多图层',
                category: 'textures',
                condition: () => Texture.selected.render_mode === 'layered',
                click: merge
            })

            Texture.prototype.menu.addAction(btn1)
            Texture.prototype.menu.addAction(btn2)
        },
        onunload() {
            Canvas.getLayeredMaterial = origin
            btn1.delete()
            btn2.delete()
            delete canvas
        }
    })
}()