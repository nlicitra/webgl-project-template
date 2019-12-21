class Attribute {
  constructor(name, { gl, program }) {
    this.name = name;
    this.gl = gl;
    this.location = gl.getAttribLocation(program, name);
    this.buffer = gl.createBuffer();
  }

  write(
    data,
    {
      target = this.gl.ARRAY_BUFFER,
      usage = this.gl.STATIC_DRAW,
      vertexAttrib = false
    }
  ) {
    this.gl.bindBuffer(target, this.buffer);
    this.gl.bufferData(target, new Float32Array(data), usage);
    if (vertexAttrib) {
      this.gl.enableVertexAttribArray(this.location);
      this.gl.vertexAttribPointer(this.location, 2, this.gl.FLOAT, false, 0, 0);
    }
  }
}
class Uniform {
  constructor(name, { gl, program }) {
    this.name = name;
    this.gl = gl;
    this.location = gl.getUniformLocation(program, name);
  }

  write(...data) {
    const index = data.length - 1;
    const funcName = ["uniform1f", "uniform2f", "uniform3f", "uniform4f"][
      index
    ];

    this.gl[funcName](this.location, ...data);
  }
}
class Texture {
  constructor(name, { gl }) {
    this.name = name;
    this.gl = gl;
    this.texture = gl.createTexture();
  }

  write(data, { target = this.gl.TEXTURE_2D } = {}) {
    this.gl.bindTexture(target, this.texture);
    this.gl.texImage2D(
      target,
      0,
      this.gl.RGBA,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      data
    );

    if (!this.paramsSet) {
      this.gl.texParameteri(
        target,
        this.gl.TEXTURE_WRAP_S,
        this.gl.CLAMP_TO_EDGE
      );
      this.gl.texParameteri(
        target,
        this.gl.TEXTURE_WRAP_T,
        this.gl.CLAMP_TO_EDGE
      );
      this.gl.texParameteri(target, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
      // this.gl.texParameteri(target, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
      this.paramsSet = true;
    }
  }
}

class AppContext {
  constructor(canvas) {
    this.attributes = {};
    this.uniforms = {};
    this.textures = {};
    this.init(canvas);
  }

  init(canvas) {
    this.gl = canvas.getContext("webgl");
  }

  attribute(name) {
    if (!this.attributes[name]) {
      this.attributes[name] = new Attribute(name, {
        gl: this.gl,
        program: this.program
      });
    }
    return this.attributes[name];
  }

  uniform(name) {
    if (!this.uniforms[name]) {
      this.uniforms[name] = new Uniform(name, {
        gl: this.gl,
        program: this.program
      });
    }
    return this.uniforms[name];
  }

  texture(name) {
    if (!this.textures[name]) {
      this.textures[name] = new Texture(name, {
        gl: this.gl
      });
    }
    return this.textures[name];
  }

  vertexShader(source, gl = this.gl) {
    this.vertexShader = this._createShader(gl.VERTEX_SHADER, source);
  }

  fragmentShader(source, gl = this.gl) {
    this.fragmentShader = this._createShader(gl.FRAGMENT_SHADER, source);
  }

  _createShader(type, source, gl = this.gl) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
  }

  compile(gl = this.gl) {
    const program = gl.createProgram();
    gl.attachShader(program, this.vertexShader);
    gl.attachShader(program, this.fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
      console.error(gl.getProgramInfoLog(program));
      throw Error("Error linking program");
    }
    gl.useProgram(program);

    this.program = program;
  }

  cleanup(gl = this.gl) {
    if (this.program) {
      gl.deleteProgram(this.program);
      this.program = undefined;
    }
  }

  resize() {
    const { canvas } = this.gl;
    const ratio = window.devicePixelRatio;
    const displayWidth = Math.floor(canvas.clientWidth * ratio);
    const displayHeight = Math.floor(canvas.clientHeight * ratio);
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      const uResolution = this.uniform("u_resolution");
      uResolution.write(canvas.width, canvas.height);
      this.gl.viewport(0, 0, canvas.width, canvas.height);
    }
  }

  render(func) {
    const startTime = new Date().getTime();
    this._render = () => {
      this.resize();
      const elapsed = new Date().getTime() - startTime;
      this.uniform("u_time").write(elapsed);
      func(this.gl);
      requestAnimationFrame(this._render.bind(this));
    };
    this.run();
  }

  run() {
    requestAnimationFrame(() => {
      this._render();
    });
  }
}

export default AppContext;
