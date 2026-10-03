import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';
import './Dither.css';

// Port do Dither do React Bits para ogl: os mesmos shaders (ondas + dithering Bayer 8x8)
// num único passe, sem three.js / react-three-fiber, para poder rodar um por card.
// Com `smooth`, desenha as mesmas ondas em resolução cheia, sem blocos nem dithering.

const vertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 resolution;
uniform float time;
uniform float waveSpeed;
uniform float waveFrequency;
uniform float waveAmplitude;
uniform vec3 waveColor;
uniform vec3 backgroundColor;
uniform vec2 mousePos;
uniform int enableMouseInteraction;
uniform float mouseRadius;
uniform float colorNum;
uniform float pixelSize;
uniform vec2 offset;
uniform int smoothMode;
out vec4 fragColor;

vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec2 fade(vec2 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }

float cnoise(vec2 P) {
  vec4 Pi = floor(P.xyxy) + vec4(0.0,0.0,1.0,1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0,0.0,1.0,1.0);
  Pi = mod289(Pi);
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = fract(i * (1.0/41.0)) * 2.0 - 1.0;
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x, gy.x);
  vec2 g10 = vec2(gx.y, gy.y);
  vec2 g01 = vec2(gx.z, gy.z);
  vec2 g11 = vec2(gx.w, gy.w);
  vec4 norm = taylorInvSqrt(vec4(dot(g00,g00), dot(g01,g01), dot(g10,g10), dot(g11,g11)));
  g00 *= norm.x; g01 *= norm.y; g10 *= norm.z; g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  return 2.3 * mix(n_x.x, n_x.y, fade_xy.y);
}

const int OCTAVES = 4;
float fbm(vec2 p) {
  float value = 0.0;
  float amp = 1.0;
  float freq = waveFrequency;
  for (int i = 0; i < OCTAVES; i++) {
    value += amp * abs(cnoise(p));
    p *= freq;
    amp *= waveAmplitude;
  }
  return value;
}

float pattern(vec2 p) {
  vec2 p2 = p - time * waveSpeed;
  return fbm(p + fbm(p2)); 
}

const float bayerMatrix8x8[64] = float[64](
  0.0/64.0, 48.0/64.0, 12.0/64.0, 60.0/64.0,  3.0/64.0, 51.0/64.0, 15.0/64.0, 63.0/64.0,
  32.0/64.0,16.0/64.0, 44.0/64.0, 28.0/64.0, 35.0/64.0,19.0/64.0, 47.0/64.0, 31.0/64.0,
  8.0/64.0, 56.0/64.0,  4.0/64.0, 52.0/64.0, 11.0/64.0,59.0/64.0,  7.0/64.0, 55.0/64.0,
  40.0/64.0,24.0/64.0, 36.0/64.0, 20.0/64.0, 43.0/64.0,27.0/64.0, 39.0/64.0, 23.0/64.0,
  2.0/64.0, 50.0/64.0, 14.0/64.0, 62.0/64.0,  1.0/64.0,49.0/64.0, 13.0/64.0, 61.0/64.0,
  34.0/64.0,18.0/64.0, 46.0/64.0, 30.0/64.0, 33.0/64.0,17.0/64.0, 45.0/64.0, 29.0/64.0,
  10.0/64.0,58.0/64.0,  6.0/64.0, 54.0/64.0,  9.0/64.0,57.0/64.0,  5.0/64.0, 53.0/64.0,
  42.0/64.0,26.0/64.0, 38.0/64.0, 22.0/64.0, 41.0/64.0,25.0/64.0, 37.0/64.0, 21.0/64.0
);

vec3 dither(vec2 fragCoord, vec3 color) {
  vec2 scaledCoord = floor(fragCoord / pixelSize);
  int x = int(mod(scaledCoord.x, 8.0));
  int y = int(mod(scaledCoord.y, 8.0));
  float threshold = bayerMatrix8x8[y * 8 + x] - 0.25;
  float step = 1.0 / (colorNum - 1.0);
  color += threshold * step;
  float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
  float bias = mix(0.2, 0.0, smoothstep(0.45, 0.8, luminance));
  color = clamp(color - bias, 0.0, 1.0);
  return floor(color * (colorNum - 1.0) + 0.5) / (colorNum - 1.0);
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  // como no efeito original, a onda é amostrada no canto de cada bloco de pixelSize
  vec2 coord = smoothMode == 1 ? gl_FragCoord.xy : floor(gl_FragCoord.xy / pixelSize) * pixelSize;
  vec2 uv = coord / resolution.xy;
  uv -= 0.5;
  uv.x *= resolution.x / resolution.y;
  uv += offset;
  float f = pattern(uv);
  if (enableMouseInteraction == 1) {
    vec2 mouseNDC = (mousePos / resolution - 0.5) * vec2(1.0, -1.0);
    mouseNDC.x *= resolution.x / resolution.y;
    mouseNDC += offset;
    float dist = length(uv - mouseNDC);
    float effect = 1.0 - smoothstep(0.0, mouseRadius, dist);
    f -= 0.5 * effect;
  }
  vec3 col = mix(backgroundColor, waveColor, clamp(f, 0.0, 1.0));
  if (smoothMode == 1) {
    // um grão imperceptível evita faixas visíveis no degradê
    fragColor = vec4(col + (hash(gl_FragCoord.xy) - 0.5) / 255.0, 1.0);
  } else {
    fragColor = vec4(dither(gl_FragCoord.xy, col), 1.0);
  }
}
`;

interface DitherProps {
  waveSpeed?: number;
  waveFrequency?: number;
  waveAmplitude?: number;
  waveColor?: [number, number, number];
  backgroundColor?: [number, number, number];
  colorNum?: number;
  pixelSize?: number;
  disableAnimation?: boolean;
  enableMouseInteraction?: boolean;
  mouseRadius?: number;
  /** desloca o campo de ondas (para vários canvases mostrarem partes diferentes) */
  offset?: [number, number];
  /** ondas lisas, sem pixelização nem dithering */
  smooth?: boolean;
  /** pixels desenhados por pixel CSS no modo liso (menos = mais leve; o degradê suave não perde nitidez) */
  renderScale?: number;
  className?: string;
}

type Uniform<T> = { value: T };

const DEFAULT_OFFSET: [number, number] = [0, 0];

export default function Dither({
  waveSpeed = 0.05,
  waveFrequency = 3,
  waveAmplitude = 0.3,
  waveColor = [0.5, 0.5, 0.5],
  backgroundColor = [0, 0, 0],
  colorNum = 4,
  pixelSize = 2,
  disableAnimation = false,
  enableMouseInteraction = true,
  mouseRadius = 1,
  offset = DEFAULT_OFFSET,
  smooth = false,
  renderScale = 1,
  className = ''
}: DitherProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const programRef = useRef<Program | null>(null);
  const animateRef = useRef(!disableAnimation);

  // Contexto WebGL criado uma vez; pausa fora da tela ou com a aba escondida
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // o modo pixelado usa 1 pixel por pixel CSS, como o original; o liso usa renderScale
    const dpr = smooth ? renderScale : 1;
    const renderer = new Renderer({ webgl: 2, dpr, alpha: false, antialias: false });
    const gl = renderer.gl;
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.display = 'block';
    container.appendChild(canvas);

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        resolution: { value: new Float32Array([1, 1]) },
        time: { value: 0 },
        waveSpeed: { value: 0 },
        waveFrequency: { value: 0 },
        waveAmplitude: { value: 0 },
        waveColor: { value: new Float32Array(3) },
        backgroundColor: { value: new Float32Array(3) },
        mousePos: { value: new Float32Array([-1e5, -1e5]) },
        enableMouseInteraction: { value: 0 },
        mouseRadius: { value: 1 },
        colorNum: { value: 4 },
        pixelSize: { value: 2 },
        offset: { value: new Float32Array(2) },
        smoothMode: { value: smooth ? 1 : 0 }
      }
    });
    programRef.current = program;
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    const u = program.uniforms as Record<string, Uniform<unknown>>;

    const render = () => renderer.render({ scene: mesh });
    const setSize = () => {
      // tamanho de layout (ignora a escala da animação de entrada) e o canvas sempre cobrindo o card todo
      renderer.setSize(Math.max(1, container.clientWidth), Math.max(1, container.clientHeight));
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      const res = u.resolution.value as Float32Array;
      res[0] = gl.drawingBufferWidth;
      res[1] = gl.drawingBufferHeight;
      render();
    };
    const ro = new ResizeObserver(setSize);
    ro.observe(container);
    setSize();

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouse = u.mousePos.value as Float32Array;
      const inside =
        event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
      mouse[0] = inside ? (event.clientX - rect.left) * dpr : -1e5;
      mouse[1] = inside ? (event.clientY - rect.top) * dpr : -1e5;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    let raf = 0;
    let visible = true;
    let pageVisible = !document.hidden;
    let elapsed = 0;
    let last = performance.now();
    const loop = (now: number) => {
      if (animateRef.current) elapsed += (now - last) / 1000;
      last = now;
      u.time.value = elapsed;
      render();
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (visible && pageVisible && raf === 0) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };
    const stop = () => {
      if (raf !== 0) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(container);
    const onVisibility = () => {
      pageVisible = !document.hidden;
      if (pageVisible) start();
      else stop();
    };
    document.addEventListener('visibilitychange', onVisibility);
    start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('visibilitychange', onVisibility);
      programRef.current = null;
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.remove();
    };
  }, [smooth, renderScale]);

  // Props atualizam os uniforms sem recriar o contexto
  useEffect(() => {
    animateRef.current = !disableAnimation;
    const program = programRef.current;
    if (!program) return;
    const u = program.uniforms as Record<string, Uniform<unknown>>;
    u.waveSpeed.value = waveSpeed;
    u.waveFrequency.value = waveFrequency;
    u.waveAmplitude.value = waveAmplitude;
    (u.waveColor.value as Float32Array).set(waveColor);
    (u.backgroundColor.value as Float32Array).set(backgroundColor);
    u.enableMouseInteraction.value = enableMouseInteraction ? 1 : 0;
    u.mouseRadius.value = mouseRadius;
    u.colorNum.value = colorNum;
    u.pixelSize.value = pixelSize;
    (u.offset.value as Float32Array).set(offset);
  }, [
    waveSpeed,
    waveFrequency,
    waveAmplitude,
    waveColor,
    backgroundColor,
    colorNum,
    pixelSize,
    disableAnimation,
    enableMouseInteraction,
    mouseRadius,
    offset,
    smooth
  ]);

  return <div ref={containerRef} className={`dither-container ${className}`} />;
}
