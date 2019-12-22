import AppContext from "../js/context.js";

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
  // video.src = url;
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

    void main() {
      vec4 color = texture2D(u_texture, v_texCoord);
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
    red: 0.0,
    green: 0.0,
    blue: 0.0,
    alpha: 0.0
  };
  let videoSelection = "sea";
  const canvas = document.getElementById("canvas");
  const app = new AppContext(canvas);
  app.vertexShader(vSource);
  app.fragmentShader(fSource);
  app.compile();
  const videoSources = {
    sea: "video/sea.mp4",
    winter: "video/winter.mp4",
    cascade: "video/cascade.mp4",
    river: "video/river.mp4",
    rose: "video/rose.mp4",
    waterfall: "video/waterfall.mp4"
  };
  const video = createVideo(videoSources.sea);
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
    if (video.readyState === 4) {
      app.texture("video").write(video);
    } else {
      app.texture("video").write(new Uint8Array([200, 200, 255, 255]));
    }
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  });

  window.setThreshold = (color, val) => {
    thresholds[color] = val;
    document.getElementById(`${color}-threshold`).innerHTML = val;
  };

  window.setVideoSelection = name => {
    video.pause();
    videoSelection = name;
    video.src = videoSources[name];
    video.load();
    video.play();
  };

  window.setVideoSelection("sea");
  window.setThreshold("red", 0.0);
  window.setThreshold("green", 0.0);
  window.setThreshold("blue", 0.0);
};

init();
