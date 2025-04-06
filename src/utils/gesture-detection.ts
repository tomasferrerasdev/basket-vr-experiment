import { Object3D, Vector3 } from "three";

// Names of finger joints we'll use for detection
const FINGER_JOINTS = {
  INDEX_TIP: "index-finger-tip",
  INDEX_METACARPAL: "index-finger-metacarpal",
  MIDDLE_TIP: "middle-finger-tip",
  MIDDLE_METACARPAL: "middle-finger-metacarpal",
  RING_TIP: "ring-finger-tip",
  RING_METACARPAL: "ring-finger-metacarpal",
  PINKY_TIP: "pinky-finger-tip",
  PINKY_METACARPAL: "pinky-finger-metacarpal",
  WRIST: "wrist",
};

/**
 * Detects if a hand is making the "rock sign of the horns" gesture
 * (index finger and pinky extended, middle and ring fingers folded)
 */
export function detectRockHornsGesture(handModel: Object3D): boolean {
  // Get positions of relevant joints
  const wrist = handModel.getObjectByName(FINGER_JOINTS.WRIST);
  const indexTip = handModel.getObjectByName(FINGER_JOINTS.INDEX_TIP);
  const indexMeta = handModel.getObjectByName(FINGER_JOINTS.INDEX_METACARPAL);
  const middleTip = handModel.getObjectByName(FINGER_JOINTS.MIDDLE_TIP);
  const middleMeta = handModel.getObjectByName(FINGER_JOINTS.MIDDLE_METACARPAL);
  const ringTip = handModel.getObjectByName(FINGER_JOINTS.RING_TIP);
  const ringMeta = handModel.getObjectByName(FINGER_JOINTS.RING_METACARPAL);
  const pinkyTip = handModel.getObjectByName(FINGER_JOINTS.PINKY_TIP);
  const pinkyMeta = handModel.getObjectByName(FINGER_JOINTS.PINKY_METACARPAL);

  // Ensure all joints are found
  if (
    !wrist ||
    !indexTip ||
    !indexMeta ||
    !middleTip ||
    !middleMeta ||
    !ringTip ||
    !ringMeta ||
    !pinkyTip ||
    !pinkyMeta
  ) {
    return false;
  }

  // Get world positions
  const wristPos = new Vector3();
  wrist.getWorldPosition(wristPos);

  const indexTipPos = new Vector3();
  indexTip.getWorldPosition(indexTipPos);
  const indexMetaPos = new Vector3();
  indexMeta.getWorldPosition(indexMetaPos);

  const middleTipPos = new Vector3();
  middleTip.getWorldPosition(middleTipPos);
  const middleMetaPos = new Vector3();
  middleMeta.getWorldPosition(middleMetaPos);

  const ringTipPos = new Vector3();
  ringTip.getWorldPosition(ringTipPos);
  const ringMetaPos = new Vector3();
  ringMeta.getWorldPosition(ringMetaPos);

  const pinkyTipPos = new Vector3();
  pinkyTip.getWorldPosition(pinkyTipPos);
  const pinkyMetaPos = new Vector3();
  pinkyMeta.getWorldPosition(pinkyMetaPos);

  // Calculate finger extension (distance from metacarpal to tip)
  // compared to distance from wrist to metacarpal as a reference
  const indexExtension = calculateFingerExtension(
    wristPos,
    indexMetaPos,
    indexTipPos
  );
  const middleExtension = calculateFingerExtension(
    wristPos,
    middleMetaPos,
    middleTipPos
  );
  const ringExtension = calculateFingerExtension(
    wristPos,
    ringMetaPos,
    ringTipPos
  );
  const pinkyExtension = calculateFingerExtension(
    wristPos,
    pinkyMetaPos,
    pinkyTipPos
  );

  // Thresholds for determining if a finger is extended or not
  const EXTENDED_THRESHOLD = 0.7; // If extension ratio is above this, finger is extended
  const FOLDED_THRESHOLD = 0.4; // If extension ratio is below this, finger is folded

  // Check for rock sign of the horns:
  // Index and pinky should be extended, middle and ring should be folded
  return (
    indexExtension > EXTENDED_THRESHOLD &&
    pinkyExtension > EXTENDED_THRESHOLD &&
    middleExtension < FOLDED_THRESHOLD &&
    ringExtension < FOLDED_THRESHOLD
  );
}

/**
 * Calculates how extended a finger is relative to its metacarpal length
 * Returns a ratio where higher values mean more extended
 */
function calculateFingerExtension(
  wristPos: Vector3,
  metacarpalPos: Vector3,
  tipPos: Vector3
): number {
  // Get baseline length (wrist to metacarpal)
  const metacarpalLength = wristPos.distanceTo(metacarpalPos);

  // Get tip-to-metacarpal straight-line distance
  const tipToMetaDistance = metacarpalPos.distanceTo(tipPos);

  // Return ratio of tip extension to metacarpal length
  return tipToMetaDistance / metacarpalLength;
}

/**
 * Interface for tracking gesture events
 */
export interface GestureEvent {
  gesture: string;
  active: boolean;
  timestamp: number;
}

/**
 * A class that can track gestures over time and emit events when gestures
 * are detected or lost
 */
export class GestureTracker {
  private previousState: boolean = false;
  private currentGesture: string | null = null;
  private onGestureCallbacks: ((event: GestureEvent) => void)[] = [];

  /**
   * Updates the tracker with latest gesture detection result
   */
  update(handModel: Object3D) {
    const isRockHorns = detectRockHornsGesture(handModel);

    // If state changed
    if (isRockHorns !== this.previousState) {
      this.previousState = isRockHorns;

      // Emit appropriate event
      if (isRockHorns) {
        this.currentGesture = "rock-horns";
        this.emitGestureEvent("rock-horns", true);
      } else if (this.currentGesture === "rock-horns") {
        this.emitGestureEvent("rock-horns", false);
        this.currentGesture = null;
      }
    }
  }

  /**
   * Register a callback for gesture events
   */
  onGesture(callback: (event: GestureEvent) => void) {
    this.onGestureCallbacks.push(callback);
    return this; // For chaining
  }

  /**
   * Emit a gesture event to all registered callbacks
   */
  private emitGestureEvent(gesture: string, active: boolean) {
    const event: GestureEvent = {
      gesture,
      active,
      timestamp: Date.now(),
    };

    for (const callback of this.onGestureCallbacks) {
      callback(event);
    }
  }
}
