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
  video.loop = true;
  video.muted = true;
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
    uniform vec4 u_threshold;
    uniform float u_time;

    float calcPixelValue(float color, float threshold);
    float calcPixelValue(float color, float threshold) {
      if (color < threshold) {
        // float magnitude = (color - threshold);
        return 1.0 - color;
      }
      return color;
    }
 
    void main() {
      vec4 color = texture2D(u_texture, v_texCoord);
      // float r = calcPixelValue(color.r, u_threshold.r);
      // float g = calcPixelValue(color.g, u_threshold.g);
      // float b = calcPixelValue(color.b, u_threshold.b);
      // float a = calcPixelValue(color.a, u_threshold.a);
      // gl_FragColor = vec4(r, g, b, a);
      vec3 diff = u_threshold.rgb - color.rgb;
      if (diff.r > 0.0 || diff.g > 0.0 || diff.b > 0.0) {
        // vec3 c = color.rgb + (color.rgb * diff);
        vec3 c = vec3(1.0, 1.0, 1.0) - color.rgb;
        gl_FragColor = vec4(c.r, c.g, c.b, color.a);
      } else {
        gl_FragColor = color;
      }
    }
  `;

export const init = () => {
  let thresholds = {
    red: 0.1,
    green: 0.1,
    blue: 0.1,
    alpha: 0.1
  };
  let videoSelection = "sea";
  const canvas = document.getElementById("canvas");
  const app = new AppContext(canvas);
  app.vertexShader(vSource);
  app.fragmentShader(fSource);
  app.compile();
  const videos = {
    sea: createVideo("./video/sea.mp4"),
    winter: createVideo("./video/winter.mp4"),
    cascade: createVideo("./video/cascade.mp4"),
    river: createVideo("./video/river.mp4"),
    rose: createVideo("./video/rose.mp4"),
    waterfall: createVideo("./video/waterfall.mp4")
  };
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
  videos[videoSelection].oncanplaythrough = () => {
    app.render(gl => {
      app.gl.clearColor(0, 0, 0, 0);
      app.gl.clear(app.gl.COLOR_BUFFER_BIT);
      app
        .uniform("u_threshold")
        .write(
          thresholds.red,
          thresholds.green,
          thresholds.blue,
          thresholds.alpha
        );
      app.attribute("a_position").write(rect, { vertexAttrib: true });
      app.attribute("a_texCoord").write(texCoords, { vertexAttrib: true });
      app.texture(videoSelection).write(videos[videoSelection]);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    });
  };

  return {
    setVideoSelection: name => {
      if (!videos[videoSelection].paused) {
        videos[videoSelection].pause();
      }
      videoSelection = name;
      videos[videoSelection].play();
    },
    setThreshold: (color, val) => {
      thresholds[color] = val;
    }
  };
};
