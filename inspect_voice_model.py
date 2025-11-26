"""
Inspect a scikit-learn .joblib model file to detect whether a StandardScaler
was used during training.

Place this script in the same folder as `voice_model.joblib` and run:

    python inspect_voice_model.py

It will print:
 - model type
 - whether it's a Pipeline or plain estimator
 - pipeline steps (if Pipeline)
 - whether a StandardScaler is present anywhere inside the object
 - whether `predict_proba` is available

This script only inspects the object (no modifications).
"""

import joblib
import sys
import os
from collections import deque

MODEL_FILENAME = "voice_model.joblib"

try:
    from sklearn.pipeline import Pipeline
    from sklearn.compose import ColumnTransformer
    from sklearn.preprocessing import StandardScaler
except Exception:
    # Import errors here will be helpful for the user
    Pipeline = None
    ColumnTransformer = None
    StandardScaler = None


def find_scaler(obj):
    """Recursively search `obj` for any instance of StandardScaler.
    Uses a BFS/stack and tracks visited object ids to avoid infinite loops.
    Returns True if found, False otherwise.
    """
    if StandardScaler is None:
        return False

    visited = set()
    queue = deque([obj])

    while queue:
        current = queue.popleft()
        cid = id(current)
        if cid in visited:
            continue
        visited.add(cid)

        # Direct instance
        try:
            if isinstance(current, StandardScaler):
                return True
        except Exception:
            pass

        # Pipeline: check steps
        try:
            if Pipeline is not None and isinstance(current, Pipeline):
                for name, step in current.steps:
                    queue.append(step)
                continue
        except Exception:
            pass

        # ColumnTransformer: check transformers
        try:
            if ColumnTransformer is not None and isinstance(current, ColumnTransformer):
                # current.transformers may be list of (name, transformer, cols)
                for t in getattr(current, 'transformers', []):
                    # t can be tuple(name, transformer, cols)
                    if isinstance(t, (list, tuple)) and len(t) >= 2:
                        queue.append(t[1])
                    else:
                        queue.append(t)
                continue
        except Exception:
            pass

        # If it's a dict-like or list-like container, iterate elements
        try:
            if isinstance(current, dict):
                for v in current.values():
                    queue.append(v)
                continue
            if isinstance(current, (list, tuple, set)):
                for v in current:
                    queue.append(v)
                continue
        except Exception:
            pass

        # Explore some common attributes that may contain transformers
        for attr in ('named_steps', 'steps', 'transformers', 'estimators_', 'estimator', 'preprocessor'):
            try:
                val = getattr(current, attr, None)
                if val is not None:
                    queue.append(val)
            except Exception:
                continue

        # Last resort: inspect attributes (shallow)
        try:
            for name in dir(current):
                if name.startswith('_'):
                    continue
                # avoid large or callable attributes
                try:
                    val = getattr(current, name)
                except Exception:
                    continue
                if callable(val):
                    continue
                queue.append(val)
        except Exception:
            pass

    return False


def main():
    path = os.path.join(os.getcwd(), MODEL_FILENAME)
    if not os.path.exists(path):
        print(f"Model file not found: {MODEL_FILENAME} (looked in {os.getcwd()})")
        sys.exit(2)

    print(f"Loading model from: {path}")
    try:
        model = joblib.load(path)
    except Exception as e:
        print(f"Failed to load model: {e}")
        sys.exit(3)

    print(f"Model type: {type(model)}")

    is_pipeline = False
    try:
        if Pipeline is not None and isinstance(model, Pipeline):
            is_pipeline = True
    except Exception:
        is_pipeline = False

    print(f"Is Pipeline: {is_pipeline}")

    if is_pipeline:
        try:
            print("Pipeline steps:")
            for name, step in model.steps:
                print(f" - {name}: {type(step)}")
        except Exception as e:
            print(f"Could not enumerate pipeline steps: {e}")

    # Check for scaler presence
    has_scaler = find_scaler(model)
    print("Scaler: YES" if has_scaler else "Scaler: NO")

    # Check predict_proba availability
    has_proba = hasattr(model, 'predict_proba') and callable(getattr(model, 'predict_proba'))
    print(f"predict_proba available: {'YES' if has_proba else 'NO'}")


if __name__ == '__main__':
    main()
