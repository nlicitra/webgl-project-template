import { random, range } from "./math.js";

const createCanvas = (height = 1000, width = 1000) => {
  const root = document.getElementById("root");
  const canvas = document.createElement("canvas");
  canvas.height = height;
  canvas.width = width;
  root.appendChild(canvas);
  return canvas;
};

const createShader = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
  console.error(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
};

const createProgram = (gl, vertexShader, fragmentShader) => {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.error(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
};

const initProgram = (gl, vertexSource, fragmentSource) => {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = createProgram(gl, vertexShader, fragmentShader);
  if (program) {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
  }
  return program;
};

const initVertexAttrib = (gl, program) => {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
};

const render = (gl, uColorLoc) => {
  const positions = range(6).map(() => random(-1, 1));
  gl.uniform4f(uColorLoc, random(), random(), random(), 1);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);
};

export const init = ({ width = 1000, height = 1000 } = {}) => {
  const canvas = createCanvas(height, width);
  const gl = canvas.getContext("webgl");
  const vSource = `
    // an attribute will receive data from a buffer
    attribute vec4 a_position;
 
    void main() {
      gl_Position = a_position;
    }
  `;
  const fSource = `
    precision mediump float;
    uniform vec4 u_color;
 
    void main() {
      gl_FragColor = u_color;
    }
  `;
  const program = initProgram(gl, vSource, fSource);
  initVertexAttrib(gl, program);
  const colorUniformLoc = gl.getUniformLocation(program, "u_color");
  range(40).forEach(() => {
    render(gl, colorUniformLoc);
  });

  return { canvas, gl, program };
};
