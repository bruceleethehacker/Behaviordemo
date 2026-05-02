// Local behavior data store + mock ML logic
// Future-ready for TensorFlow Lite integration

export interface UserProfile {
  name: string;
  email: string;
  pin: string;
  enrolledAt?: string;
}

export interface BehaviorFeatures {
  typingSpeed: number; // WPM
  typingRhythm: number; // consistency 0-1
  scrollSpeed: number;
  scrollPattern: number; // consistency 0-1
  tapAccuracy: number; // 0-1
  tapReactionTime: number; // ms
  swipeVelocity: number;
  swipeAngleConsistency: number; // 0-1
  motionStability: number; // 0-1
  timestamp: string;
}

export interface BehaviorScores {
  typing: number;
  scrolling: number;
  tapPattern: number;
  swipe: number;
  motionStability: number;
  overallConfidence: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface AuthStatus {
  isGenuine: boolean;
  confidence: number;
  riskScore: number;
  status: 'authenticated' | 'suspicious' | 'denied';
}

export interface ModelMetrics {
  accuracy: number;
  falseAcceptRate: number;
  falseRejectRate: number;
  lastTrained: string;
  samplesCollected: number;
}

// --- Storage helpers ---
const KEYS = {
  profile: 'bas_user_profile',
  features: 'bas_behavior_features',
  baseline: 'bas_baseline',
  modelMetrics: 'bas_model_metrics',
};

export function saveProfile(p: UserProfile) {
  localStorage.setItem(KEYS.profile, JSON.stringify({ ...p, enrolledAt: new Date().toISOString() }));
}
export function getProfile(): UserProfile | null {
  const d = localStorage.getItem(KEYS.profile);
  return d ? JSON.parse(d) : null;
}

export function saveBehaviorFeatures(f: BehaviorFeatures) {
  const existing = getBehaviorFeatures();
  existing.push(f);
  localStorage.setItem(KEYS.features, JSON.stringify(existing));
}
export function getBehaviorFeatures(): BehaviorFeatures[] {
  const d = localStorage.getItem(KEYS.features);
  return d ? JSON.parse(d) : [];
}

export function saveBaseline(b: BehaviorFeatures) {
  localStorage.setItem(KEYS.baseline, JSON.stringify(b));
}
export function getBaseline(): BehaviorFeatures | null {
  const d = localStorage.getItem(KEYS.baseline);
  return d ? JSON.parse(d) : null;
}

export function getModelMetrics(): ModelMetrics {
  const d = localStorage.getItem(KEYS.modelMetrics);
  if (d) return JSON.parse(d);
  return {
    accuracy: 94.7,
    falseAcceptRate: 2.1,
    falseRejectRate: 3.4,
    lastTrained: new Date().toISOString(),
    samplesCollected: getBehaviorFeatures().length,
  };
}
export function saveModelMetrics(m: ModelMetrics) {
  localStorage.setItem(KEYS.modelMetrics, JSON.stringify(m));
}

// --- Mock ML prediction ---
// Future: Replace with TensorFlow Lite model inference
// import * as tf from '@tensorflow/tfjs';
// import { loadLayersModel } from '@tensorflow/tfjs';

export function computeScores(features: BehaviorFeatures): BehaviorScores {
  const typing = Math.min(100, (features.typingSpeed / 60) * 50 + features.typingRhythm * 50);
  const scrolling = Math.min(100, features.scrollPattern * 60 + Math.min(40, features.scrollSpeed / 5));
  const tapPattern = Math.min(100, features.tapAccuracy * 60 + Math.max(0, 40 - features.tapReactionTime / 15));
  const swipe = Math.min(100, features.swipeAngleConsistency * 55 + Math.min(45, features.swipeVelocity / 10));
  const motionStability = features.motionStability * 100;

  const overall = typing * 0.25 + scrolling * 0.2 + tapPattern * 0.2 + swipe * 0.15 + motionStability * 0.2;

  let riskLevel: BehaviorScores['riskLevel'] = 'low';
  if (overall < 40) riskLevel = 'critical';
  else if (overall < 60) riskLevel = 'high';
  else if (overall < 75) riskLevel = 'medium';

  return {
    typing: Math.round(typing),
    scrolling: Math.round(scrolling),
    tapPattern: Math.round(tapPattern),
    swipe: Math.round(swipe),
    motionStability: Math.round(motionStability),
    overallConfidence: Math.round(overall),
    riskLevel,
  };
}

export function authenticateUser(current: BehaviorFeatures, baseline: BehaviorFeatures | null): AuthStatus {
  if (!baseline) {
    return { isGenuine: false, confidence: 0, riskScore: 100, status: 'denied' };
  }

  // Compare current features against baseline
  const diffs = [
    1 - Math.abs(current.typingSpeed - baseline.typingSpeed) / Math.max(baseline.typingSpeed, 1),
    1 - Math.abs(current.typingRhythm - baseline.typingRhythm),
    1 - Math.abs(current.scrollPattern - baseline.scrollPattern),
    1 - Math.abs(current.tapAccuracy - baseline.tapAccuracy),
    1 - Math.abs(current.swipeAngleConsistency - baseline.swipeAngleConsistency),
    1 - Math.abs(current.motionStability - baseline.motionStability),
  ].map(d => Math.max(0, d));

  const confidence = Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length * 100);
  const riskScore = 100 - confidence;
  const isGenuine = confidence >= 60;

  return {
    isGenuine,
    confidence,
    riskScore,
    status: confidence >= 75 ? 'authenticated' : confidence >= 50 ? 'suspicious' : 'denied',
  };
}

// --- TensorFlow Lite integration placeholder ---
export class BehaviorMLModel {
  // Future: Load a .tflite model converted to TensorFlow.js format
  // private model: tf.LayersModel | null = null;

  async loadModel(_modelPath: string): Promise<void> {
    // this.model = await loadLayersModel(modelPath);
    console.log('[ML] Model loading placeholder - integrate TFLite here');
  }

  async predict(_features: number[]): Promise<{ confidence: number; isGenuine: boolean }> {
    // const tensor = tf.tensor2d([features]);
    // const prediction = this.model!.predict(tensor) as tf.Tensor;
    // const result = await prediction.data();
    // return { confidence: result[0], isGenuine: result[0] > 0.5 };
    return { confidence: 0.85, isGenuine: true };
  }

  async train(_data: number[][]): Promise<ModelMetrics> {
    console.log('[ML] Training placeholder - integrate TFLite here');
    return getModelMetrics();
  }
}
