// Grid units. Everything snaps to these.
export const STUD = 0.8;    // world size of one stud (X/Z grid cell)
export const PLATE = 0.32;  // world height of one plate (Y grid step). A brick = 3 plates.
export const STUD_H = 0.18; // stud cylinder height
export const STUD_R = 0.235;// stud cylinder radius

export const BASE_R = 22;   // baseplate radius, in studs from center each way
export const span = () => (BASE_R * 2 + 2) * STUD;
