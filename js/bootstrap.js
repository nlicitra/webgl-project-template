import { random, range } from "./math.js";
import AppContext from "./context.js";

const createCanvas = () => {
  const root = document.getElementById("root");
  const canvas = document.createElement("canvas");
  root.appendChild(canvas);
  return canvas;
};

const rectCoords = (x, y, width, height) => {
  const x1 = x;
  const x2 = x + width;
  const y1 = y;
  const y2 = y + height;
  /* prettier-ignore */
  return [
    x1, y1,
    x2, y1,
    x1, y2,
    x1, y2,
    x2, y1,
    x2, y2,
  ]
};

const createImage = url => {
  const image = new Image();
  image.src = url;
  // image.width = 400;
  // image.height = 400;
  return image;
};

const createVideo = url => {
  const video = document.createElement("video");
  video.src = url;
  video.autoplay = true;
  video.loop = true;
  video.muted = true;
  // video.width = 1920;
  // video.height = 1080;
  video.play();
  // document.body.appendChild(video);
  return video;
};

const vSource = `
    // an attribute will receive data from a buffer
    attribute vec2 a_position;
    uniform vec2 u_resolution;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
 
    void main() {
      vec2 zeroToOne = a_position / u_resolution;
      vec2 zeroToTwo = zeroToOne * 2.0;
      vec2 clipSpace = zeroToTwo - 1.0;
      gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
      v_texCoord = a_texCoord;
    }
  `;
const fSource = `
    precision mediump float;
    uniform sampler2D u_texture;
    varying vec2 v_texCoord;
    uniform float u_threshold;
    uniform float u_time;
 
    void main() {
      vec4 color = texture2D(u_texture, v_texCoord);
      float threshold = u_threshold;
      float r = color.r;
      float g = color.g;
      float b = color.b;
      float a = color.a;
      float weight = 0.1;
      if (r < threshold && g < threshold && b < threshold) {
        // r = (r + (1.0 - r)) * sin(u_time * 0.005);
        // g = (g + (1.0 - g)) * sin(u_time * 0.003);
        // b = (b + (1.0 - b)) * cos(u_time * 0.002);
        // a = 1.0;
        r = (r + (1.0 - r)) * threshold;
        g = (g + (1.0 - g)) * threshold;
        b = (b + (1.0 - b)) * threshold;
        a = 1.0;
        vec4 newColor = vec4(r, g, b, a) * color * threshold * sin(u_time * 0.001);
        gl_FragColor = newColor;
      } else {
        gl_FragColor = vec4(r, g, b, a);
      }
    }
  `;

export const init = () => {
  let threshold = 0.1;
  const canvas = document.getElementById("canvas");
  const app = new AppContext(canvas);
  app.vertexShader(vSource);
  app.fragmentShader(fSource);
  app.compile();
  const video = createVideo("./images/sea.mp4");
  const rect = rectCoords(0, 0, 1920, 1080);
  /* prettier-ignore */
  const texCoords = [
    0.0, 0.0,
    1.0, 0.0,
    0.0, 1.0,
    0.0, 1.0,
    1.0, 0.0,
    1.0, 1.0,
  ]
  const startTime = new Date().getTime();
  video.oncanplaythrough = () => {
    app.render(gl => {
      app.gl.clearColor(0, 0, 0, 0);
      app.gl.clear(app.gl.COLOR_BUFFER_BIT);
      app.uniform("u_threshold").write(threshold);
      const elapsed = new Date().getTime() - startTime;
      app.uniform("u_time").write(elapsed);
      app.attribute("a_position").write(rect, { vertexAttrib: true });
      app.attribute("a_texCoord").write(texCoords, { vertexAttrib: true });
      app.texture("video").write(video);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    });
  };

  return val => {
    console.log(val);
    threshold = val;
  };
};

export const init2 = ({ width = 1000, height = 1000 } = {}) => {
  const vSource = `
    // an attribute will receive data from a buffer
    attribute vec2 a_position;
    uniform vec2 u_resolution;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
 
    void main() {
      vec2 zeroToOne = a_position / u_resolution;
      vec2 zeroToTwo = zeroToOne * 2.0;
      vec2 clipSpace = zeroToTwo - 1.0;
      gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
      v_texCoord = a_texCoord;
    }
  `;
  const fSource = `
    precision mediump float;
    uniform sampler2D u_texture;
    varying vec2 v_texCoord;
 
    void main() {
      vec4 color = texture2D(u_texture, v_texCoord);
      float threshold = 0.9;
      float r = color.r;
      float g = color.g;
      float b = color.b;
      if (r > threshold) {
        r = 1.0 - r;
      }
      if (g > threshold) {
        g = 1.0 - g;
      }
      if (b > threshold) {
        b = 1.0 - b;
      }
      gl_FragColor = vec4(r, g, b, color.a);
    }
  `;
  // const img = createImage("./images/nature.jpeg");
  const video = createVideo("./images/sea.mp4");
  video.oncanplaythrough = () => {
    // const canvas = createCanvas();
    const gl = canvas.getContext("webgl");
    resize(gl);
    const program = initProgram(gl, vSource, fSource);
    // initVertexAttrib(gl, program);
    // requestAnimationFrame(() => render(gl, img));
    initTextureAttrib(gl, program, video);
    // render(gl, img);
  };
};
