/**
 * Sahi Bin - Waste Classification Engine
 * Implements Manual, Rule-Based, and Vision AI waste classification algorithms.
 */

// ============================================================================
// BASE ENGINE CLASS
// ============================================================================

export class ClassificationEngine {
  /**
   * Classify the waste.
   * @param {Blob} imageBlob - Captured image blob
   * @param {Object} inputData - Optional metadata/inputs
   * @returns {Promise<Object>} { wasteType, isSegregated, confidence, source }
   */
  async classify(imageBlob, inputData = {}) {
    throw new Error('classify method must be implemented');
  }

  /**
   * Factory method to load the desired engine.
   * @param {'manual' | 'rule_based' | 'vision_ai'} version 
   * @returns {ClassificationEngine}
   */
  static getEngine(version = 'manual') {
    switch (version) {
      case 'rule_based':
        return new RuleBasedClassifier();
      case 'vision_ai':
        return new VisionAIClassifier();
      case 'manual':
      default:
        return new ManualClassifier();
    }
  }
}

// ============================================================================
// MANUAL CLASSIFIER (V1)
// ============================================================================

export class ManualClassifier extends ClassificationEngine {
  /**
   * Simply returns the type inputted by the worker after a short delay.
   */
  async classify(imageBlob, inputData = {}) {
    // Simulate processing delay (1.5 seconds)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const { wasteType = 'wet', isSegregated = true } = inputData;
    
    return {
      wasteType,
      isSegregated,
      confidence: 1.0,
      source: 'manual'
    };
  }
}

// ============================================================================
// RULE-BASED CLASSIFIER (V2)
// ============================================================================

const ITEM_CATEGORY_MAP = {
  // Dry Waste
  'paper': 'dry',
  'cardboard': 'dry',
  'plastic bottle': 'dry',
  'plastic bag': 'dry',
  'metal can': 'dry',
  'glass bottle': 'dry',
  'newspaper': 'dry',
  'carton': 'dry',
  
  // Wet Waste
  'food scrap': 'wet',
  'banana peel': 'wet',
  'vegetable peel': 'wet',
  'tea leaves': 'wet',
  'spoiled food': 'wet',
  'egg shells': 'wet',
  'coffee grounds': 'wet',
  
  // Hazardous/Mixed Waste
  'battery': 'hazardous',
  'diaper': 'mixed',
  'medicine': 'hazardous',
  'e-waste': 'hazardous',
  'sanitary napkin': 'mixed'
};

export class RuleBasedClassifier extends ClassificationEngine {
  /**
   * Classifies waste based on selected/detected items list.
   * @param {Blob} imageBlob 
   * @param {Object} inputData - { selectedItems: Array<string> }
   */
  async classify(imageBlob, inputData = {}) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const items = inputData.selectedItems || [];
    if (items.length === 0) {
      return {
        wasteType: 'mixed',
        isSegregated: false,
        confidence: 0.5,
        source: 'rule_based'
      };
    }
    
    // Count categories of items
    const counts = { wet: 0, dry: 0, hazardous: 0, mixed: 0 };
    items.forEach(item => {
      const category = ITEM_CATEGORY_MAP[item.toLowerCase()] || 'mixed';
      counts[category]++;
    });
    
    // Determine segregation status
    // If all items are wet or all items are dry
    let wasteType = 'mixed';
    let isSegregated = false;
    
    if (counts.wet > 0 && counts.dry === 0 && counts.hazardous === 0 && counts.mixed === 0) {
      wasteType = 'wet';
      isSegregated = true;
    } else if (counts.dry > 0 && counts.wet === 0 && counts.hazardous === 0 && counts.mixed === 0) {
      wasteType = 'dry';
      isSegregated = true;
    } else if (counts.hazardous > 0 && counts.wet === 0 && counts.dry === 0 && counts.mixed === 0) {
      wasteType = 'hazardous';
      isSegregated = true;
    } else {
      // Mixed or multiple categories present
      if (counts.wet > counts.dry && counts.wet > counts.hazardous) {
        wasteType = 'wet';
      } else if (counts.dry > counts.wet && counts.dry > counts.hazardous) {
        wasteType = 'dry';
      } else {
        wasteType = 'mixed';
      }
      isSegregated = false;
    }
    
    return {
      wasteType,
      isSegregated,
      confidence: 0.85,
      source: 'rule_based'
    };
  }
}

// ============================================================================
// VISION AI CLASSIFIER (V3)
// ============================================================================

export class VisionAIClassifier extends ClassificationEngine {
  constructor(endpointUrl = 'https://api.sahibin.gov.in/v1/classify') {
    super();
    this.endpointUrl = endpointUrl;
  }

  /**
   * Hits the Vision API endpoint. Falls back to manual input if request fails.
   */
  async classify(imageBlob, inputData = {}) {
    try {
      if (!navigator.onLine) {
        throw new Error('Device is offline');
      }

      const formData = new FormData();
      formData.append('image', imageBlob);
      
      const response = await fetch(this.endpointUrl, {
        method: 'POST',
        body: formData,
        timeout: 8000
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      return {
        wasteType: result.wasteType || 'mixed',
        isSegregated: result.isSegregated ?? false,
        confidence: result.confidence || 0.75,
        source: 'vision_ai'
      };
    } catch (err) {
      console.warn('[Vision AI] Request failed, falling back to manual input:', err.message);
      // Fallback to manual classification logic
      const manual = new ManualClassifier();
      return manual.classify(imageBlob, inputData);
    }
  }
}
