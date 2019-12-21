import AppContext from "./context.js";

const glsl = x => x;

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

const createVideo = url => {
  const video = document.createElement("video");
  video.src = url;
  video.autoplay = true;
  video.loop = true;
  video.muted = true;
  video.play();
  return video;
};

const vSource = glsl`
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
const fSource = glsl`
    precision mediump float;
    uniform sampler2D u_texture;
    varying vec2 v_texCoord;
    uniform float u_rThreshold;
    uniform float u_gThreshold;
    uniform float u_bThreshold;
    uniform float u_time;

    float calcPixelValue(float color, float threshold);
    float calcPixelValue(float color, float threshold) {
      float magnitude = (threshold - color) / threshold;
      return smoothstep(0.0, 1.0, color * pow(magnitude, threshold));
    }
 
    void main() {
      vec4 color = texture2D(u_texture, v_texCoord);
      float r = color.r;
      float g = color.g;
      float b = color.b;
      float a = color.a;
      float weight = 0.4;
      if (r < u_rThreshold) {
        r = calcPixelValue(r, u_rThreshold);
      }
      if (g < u_gThreshold) {
        g = calcPixelValue(g, u_gThreshold);
      }
      if (b < u_bThreshold) {
        b = calcPixelValue(b, u_bThreshold);
      }
      gl_FragColor = vec4(r, g, b, a);
    }
  `;

export const init = () => {
  let thresholds = {
    red: 0.1,
    green: 0.1,
    blue: 0.1
  };
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
  video.oncanplaythrough = () => {
    app.render(gl => {
      app.gl.clearColor(0, 0, 0, 0);
      app.gl.clear(app.gl.COLOR_BUFFER_BIT);
      app.uniform("u_rThreshold").write(thresholds.red);
      app.uniform("u_gThreshold").write(thresholds.green);
      app.uniform("u_bThreshold").write(thresholds.blue);
      app.attribute("a_position").write(rect, { vertexAttrib: true });
      app.attribute("a_texCoord").write(texCoords, { vertexAttrib: true });
      app.texture("video").write(video);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    });
  };

  return (color, val) => {
    thresholds[color] = val;
  };
};
