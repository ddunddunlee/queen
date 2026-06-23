import type { FramePreset, MotionType } from "@/types/sprite";

export const defaultKnightFrames: FramePreset[] = [
  {
    name: "idle",
    description: "standing still in a ready side-view pose, holding the spear upright"
  },
  {
    name: "walk_1",
    description: "first walking step, front leg forward, rear leg back, spear held steady"
  },
  {
    name: "walk_2",
    description: "second walking step, opposite leg forward, subtle marching movement"
  },
  {
    name: "attack_windup",
    description: "pulling the spear slightly backward, preparing to thrust"
  },
  {
    name: "attack_thrust",
    description: "lunging forward and extending the spear horizontally in a clear stabbing motion"
  },
  {
    name: "attack_recovery",
    description: "returning from the thrust back toward a ready stance"
  },
  {
    name: "hit_1",
    description: "small damage reaction, body leaning backward with a clear flinch"
  },
  {
    name: "hit_2",
    description: "stronger damage reaction, compressed stagger pose, spear reacting to the impact"
  }
];

export const motionPresetFrames: Record<MotionType, FramePreset[]> = {
  idle: [defaultKnightFrames[0]],
  walk: defaultKnightFrames.slice(1, 3),
  attack: defaultKnightFrames.slice(3, 6),
  hit: defaultKnightFrames.slice(6, 8),
  death: [
    {
      name: "death",
      description: "falling backward into a clear defeated pose while keeping the same sprite scale"
    }
  ],
  "full-8-frame": defaultKnightFrames
};
