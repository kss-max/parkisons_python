"""
Inspect TensorFlow MRI model (mri_model.h5) to determine:
- Expected input shape
- Grayscale vs RGB
- Normalization requirements
- Preprocessing layers inside the model
- Exact preprocessing needed for inference

Usage:
    python inspect_mri_model.py

Optional: Place a sample MRI image as 'sample_mri.jpg' to test predictions.
"""

import os
import sys
import numpy as np
import tensorflow as tf
from tensorflow import keras

MODEL_PATH = "models/model_bestmri.h5"
SAMPLE_IMAGE_PATH = "sample_mri.jpg"  # Optional test image

print("="*70)
print("TensorFlow MRI Model Inspector")
print("="*70)

# 1. Load model
if not os.path.exists(MODEL_PATH):
    print(f"❌ Model not found at: {MODEL_PATH}")
    sys.exit(1)

print(f"\n📂 Loading model from: {MODEL_PATH}")
try:
    model = keras.models.load_model(MODEL_PATH)
    print("✅ Model loaded successfully")
except Exception as e:
    print(f"❌ Failed to load model: {e}")
    sys.exit(2)

# 2. Print model summary
print("\n" + "="*70)
print("MODEL SUMMARY")
print("="*70)
model.summary()

# 3. Extract input shape
print("\n" + "="*70)
print("INPUT SHAPE ANALYSIS")
print("="*70)

try:
    input_shape = model.input_shape
    print(f"Model input shape: {input_shape}")
    
    if isinstance(input_shape, list):
        input_shape = input_shape[0]
    
    # Parse dimensions
    if len(input_shape) == 4:
        batch, height, width, channels = input_shape
        print(f"  - Batch: {batch}")
        print(f"  - Height: {height}")
        print(f"  - Width: {width}")
        print(f"  - Channels: {channels}")
        
        if channels == 1:
            print("  ➜ Model expects GRAYSCALE (1-channel) input")
        elif channels == 3:
            print("  ➜ Model expects RGB (3-channel) input")
        else:
            print(f"  ⚠️  Unusual channel count: {channels}")
    else:
        print(f"  ⚠️  Unexpected input shape format: {input_shape}")
        
except Exception as e:
    print(f"❌ Error analyzing input shape: {e}")
    input_shape = None

# 4. Detect preprocessing layers inside model
print("\n" + "="*70)
print("PREPROCESSING LAYERS DETECTION")
print("="*70)

has_rescaling = False
has_normalization = False
preprocessing_layers = []

try:
    for layer in model.layers:
        layer_name = layer.name
        layer_type = type(layer).__name__
        
        # Check for Rescaling layer
        if 'Rescaling' in layer_type or 'rescaling' in layer_name.lower():
            has_rescaling = True
            preprocessing_layers.append(f"  - {layer_name}: {layer_type}")
            try:
                scale = layer.scale
                offset = layer.offset
                print(f"  ✅ Found Rescaling layer: {layer_name}")
                print(f"     Scale: {scale}, Offset: {offset}")
            except:
                print(f"  ✅ Found Rescaling layer: {layer_name}")
        
        # Check for Normalization layer
        if 'Normalization' in layer_type or 'normalization' in layer_name.lower():
            has_normalization = True
            preprocessing_layers.append(f"  - {layer_name}: {layer_type}")
            print(f"  ✅ Found Normalization layer: {layer_name}")
            try:
                if hasattr(layer, 'mean'):
                    print(f"     Mean shape: {np.array(layer.mean).shape}")
                if hasattr(layer, 'variance'):
                    print(f"     Variance shape: {np.array(layer.variance).shape}")
            except:
                pass
        
        # Check for other preprocessing
        if any(x in layer_type for x in ['RandomFlip', 'RandomRotation', 'RandomZoom', 'RandomCrop']):
            preprocessing_layers.append(f"  - {layer_name}: {layer_type} (augmentation)")

    if preprocessing_layers:
        print("\n  Preprocessing layers found in model:")
        for pl in preprocessing_layers:
            print(pl)
    else:
        print("  ℹ️  No explicit preprocessing layers found in model")
        print("     Preprocessing must be done BEFORE passing to model.predict()")

except Exception as e:
    print(f"  ⚠️  Error scanning layers: {e}")

# 5. Check model architecture for base model hints
print("\n" + "="*70)
print("ARCHITECTURE ANALYSIS")
print("="*70)

base_model_name = None
try:
    for layer in model.layers:
        layer_name = layer.name.lower()
        
        # Detect common base models
        if 'efficientnet' in layer_name:
            base_model_name = 'EfficientNet'
            print(f"  ✅ Detected base model: EfficientNet")
            print("     ➜ EfficientNet expects RGB, normalized with tf.keras.applications.efficientnet.preprocess_input")
            break
        elif 'vgg' in layer_name:
            base_model_name = 'VGG'
            print(f"  ✅ Detected base model: VGG")
            print("     ➜ VGG expects RGB, normalized with tf.keras.applications.vgg16.preprocess_input")
            break
        elif 'resnet' in layer_name:
            base_model_name = 'ResNet'
            print(f"  ✅ Detected base model: ResNet")
            print("     ➜ ResNet expects RGB, normalized with tf.keras.applications.resnet.preprocess_input")
            break
        elif 'mobilenet' in layer_name:
            base_model_name = 'MobileNet'
            print(f"  ✅ Detected base model: MobileNet")
            break
    
    if not base_model_name:
        print("  ℹ️  No standard base model detected (custom CNN)")
        
except Exception as e:
    print(f"  ⚠️  Error analyzing architecture: {e}")

# 6. Test with sample image (if available)
print("\n" + "="*70)
print("SAMPLE IMAGE TEST")
print("="*70)

if os.path.exists(SAMPLE_IMAGE_PATH):
    print(f"📷 Found sample image: {SAMPLE_IMAGE_PATH}")
    
    try:
        # Load image with PIL
        from PIL import Image
        img = Image.open(SAMPLE_IMAGE_PATH)
        print(f"  - Original image size: {img.size}")
        print(f"  - Original image mode: {img.mode}")
        
        # Test different preprocessing scenarios
        scenarios = []
        
        if input_shape and len(input_shape) == 4:
            _, h, w, c = input_shape
            
            # Scenario 1: Direct resize to RGB, normalize to [0,1]
            scenarios.append({
                'name': 'RGB, resize, normalize [0,1]',
                'process': lambda im: np.expand_dims(
                    np.array(im.convert('RGB').resize((w, h))) / 255.0,
                    axis=0
                ).astype(np.float32)
            })
            
            # Scenario 2: Grayscale, resize, normalize [0,1]
            if c == 1:
                scenarios.append({
                    'name': 'Grayscale, resize, normalize [0,1]',
                    'process': lambda im: np.expand_dims(
                        np.expand_dims(
                            np.array(im.convert('L').resize((w, h))) / 255.0,
                            axis=-1
                        ),
                        axis=0
                    ).astype(np.float32)
                })
            
            # Scenario 3: Grayscale->RGB (128x128), custom normalization
            scenarios.append({
                'name': 'Gray->RGB (128,128), custom norm (mean=40.6, std=57.22)',
                'process': lambda im: np.expand_dims(
                    ((np.array(Image.fromarray(
                        np.array(im.convert('L').resize((128, 128)))
                    ).convert('RGB')) - 40.6) / (57.22 + 1e-6)).astype(np.float32),
                    axis=0
                )
            })
            
            # Test each scenario
            print("\n  Testing prediction scenarios:")
            for i, scenario in enumerate(scenarios, 1):
                try:
                    processed = scenario['process'](img)
                    print(f"\n  [{i}] {scenario['name']}")
                    print(f"      Processed shape: {processed.shape}")
                    print(f"      Value range: [{processed.min():.3f}, {processed.max():.3f}]")
                    
                    pred = model.predict(processed, verbose=0)
                    print(f"      ✅ Prediction succeeded!")
                    print(f"      Output shape: {pred.shape}")
                    print(f"      Prediction value: {pred[0]}")
                    
                except Exception as e:
                    print(f"      ❌ Prediction failed: {e}")
        
    except Exception as e:
        print(f"  ❌ Error testing sample image: {e}")
else:
    print(f"  ℹ️  No sample image found at: {SAMPLE_IMAGE_PATH}")
    print("     Place a sample MRI image there to test predictions")

# 7. SUMMARY AND RECOMMENDATIONS
print("\n" + "="*70)
print("PREPROCESSING SUMMARY & RECOMMENDATIONS")
print("="*70)

if input_shape and len(input_shape) == 4:
    _, h, w, c = input_shape
    
    print(f"\n✅ REQUIRED INPUT:")
    print(f"   - Shape: (batch, {h}, {w}, {c})")
    print(f"   - Channels: {'Grayscale (1)' if c == 1 else 'RGB (3)'}")
    
    print(f"\n📋 PREPROCESSING STEPS:")
    
    if has_rescaling or has_normalization:
        print("   ✅ Preprocessing is INSIDE the model")
        print("   ➜ Feed raw pixel values (0-255 or resized RGB)")
    else:
        print("   ⚠️  Preprocessing is NOT inside the model")
        print("   ➜ You MUST preprocess BEFORE model.predict()")
        
        if base_model_name == 'EfficientNet':
            print("\n   RECOMMENDED (EfficientNet):")
            print("   1. Convert image to RGB")
            print("   2. Resize to (224, 224) or model input size")
            print("   3. Apply: tf.keras.applications.efficientnet.preprocess_input()")
        elif base_model_name:
            print(f"\n   RECOMMENDED ({base_model_name}):")
            print(f"   1. Convert image to RGB")
            print(f"   2. Resize to ({h}, {w})")
            print(f"   3. Apply appropriate preprocess_input from keras.applications")
        else:
            print("\n   RECOMMENDED (Custom CNN):")
            print("   1. Check training code for exact preprocessing")
            print("   2. Common options:")
            print("      - Normalize: pixel / 255.0  (range [0,1])")
            print("      - Standardize: (pixel - mean) / std")
            print("      - Center: (pixel - 127.5) / 127.5  (range [-1,1])")

print("\n" + "="*70)
print("COMPARISON WITH FASTAPI PREPROCESSING")
print("="*70)

print("""
Current FastAPI preprocessing (from app.py):
    def preprocess_mri_cv2(bgr_img):
        gray = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2GRAY)
        resized = cv2.resize(gray, (128, 128))
        rgb = cv2.cvtColor(resized, cv2.COLOR_GRAY2RGB)
        img_f = rgb.astype(np.float32)
        img_norm = (img_f - 40.60) / (57.22 + 1e-6)
        return np.expand_dims(img_norm, axis=0)

Steps:
  1. Convert BGR → Grayscale
  2. Resize to (128, 128)
  3. Convert Grayscale → RGB (3-channel)
  4. Normalize: (pixel - 40.60) / (57.22 + 1e-6)
  5. Expand dims
""")

if input_shape and len(input_shape) == 4:
    _, h, w, c = input_shape
    
    if h == 128 and w == 128:
        print("✅ Size matches: (128, 128)")
    else:
        print(f"⚠️  Size mismatch: FastAPI uses (128,128), model expects ({h},{w})")
    
    if c == 3:
        print("✅ Channels match: RGB (3-channel)")
    elif c == 1:
        print("⚠️  Channel mismatch: FastAPI uses RGB, model expects Grayscale")
    
    print("\n🔍 Normalization check:")
    print("   FastAPI: (pixel - 40.60) / 57.22")
    print("   This is CUSTOM normalization (likely from training dataset stats)")
    
    if base_model_name:
        print(f"   ⚠️  Model uses {base_model_name} - verify this matches training!")
    else:
        print("   ✅ Appears to be custom CNN with dataset-specific normalization")

print("\n" + "="*70)
print("FINAL VERDICT")
print("="*70)

print("""
To confirm correctness:
1. Check the training script to see exact preprocessing used
2. Verify mean=40.60, std=57.22 match training dataset statistics
3. Confirm grayscale→RGB conversion was used during training
4. Test with known samples and compare predictions

If preprocessing differs from training, predictions will be incorrect!
""")

print("="*70)
