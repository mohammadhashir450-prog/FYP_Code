/**
 * Mutable bridge between the GSAP ScrollTrigger timeline (writes) and the
 * R3F render loop (reads). Kept outside React state so scrolling never re-renders.
 */
export const story = {
  explode: 0, // 0 = assembled, 1 = fully exploded
  rotY: -0.55, // group yaw (radians)
  camZ: 11, // camera distance
  x: 0, // horizontal shift of the car (desktop only)
  drift: 0, // 0..1 progress over the WHOLE page (background travel)
  carOut: 0, // 0 = car on stage, 1 = car has left (Climate section)
  ac: 0, // 0..1 air-conditioner entrance
  drop: 1, // intro: 1 = car high above the stage, 0 = landed
  burst: 0, // intro: extra explode amount right after the landing
  shake: 0, // intro: camera shake on impact
  impact: 0, // intro: shock-ring expansion
  vel: 0, // smoothed scroll velocity (px/s) — the car leans into it
};
